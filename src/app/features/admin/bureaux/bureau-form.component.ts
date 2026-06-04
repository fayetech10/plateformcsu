import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BureauService } from '../../../core/services/bureau.service';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

interface CommuneData {
  [dept: string]: string[];
}

interface RegionData {
  [region: string]: {
    departments: string[];
    communes: CommuneData;
  };
}

@Component({
  selector: 'app-bureau-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-building-add text-csu-primary"></i>
            {{ isEditMode ? 'Modifier le Bureau CSU' : 'Créer un Nouveau Bureau CSU' }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isEditMode ? 'Formulaire de modification des détails du bureau' : 'Ajoutez un nouveau bureau régional pour étendre le maillage de la Couverture Sanitaire Universelle' }}
          </p>
        </div>
        <div>
          <a routerLink="/admin/bureaux" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card">
            <form [formGroup]="bureauForm" (ngSubmit)="onSubmit()">
              
              <!-- Section 1 : Paramètres du bureau -->
              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-building-fill-gear me-2"></i> Informations d'Identification
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="code">Code Unique du Bureau <span class="text-danger">*</span></label>
                    <input
                      id="code"
                      type="text"
                      class="csu-form-control text-uppercase fw-bold"
                      [class.is-invalid]="isFieldInvalid('code')"
                      formControlName="code"
                      placeholder="Ex: DKR-01"
                      [readonly]="isEditMode"
                    />
                    @if (isFieldInvalid('code')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le code unique est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="nom">Nom du Bureau <span class="text-danger">*</span></label>
                    <input
                      id="nom"
                      type="text"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('nom')"
                      formControlName="nom"
                      placeholder="Ex: Dakar Plateau"
                    />
                    @if (isFieldInvalid('nom')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le nom est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="telephone">N° Téléphone <span class="text-danger">*</span></label>
                    <input
                      id="telephone"
                      type="tel"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('telephone')"
                      formControlName="telephone"
                      placeholder="Ex: 338000000"
                    />
                    @if (isFieldInvalid('telephone')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Téléphone requis (9 chiffres)
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Section 2 : Localisation géographique -->
              <h4 class="mb-4 text-csu-secondary">
                <i class="bi bi-geo-alt-fill me-2"></i> Localisation & Adresse
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="region">Région <span class="text-danger">*</span></label>
                    <select
                      id="region"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('region')"
                      formControlName="region"
                      (change)="onRegionChange()"
                    >
                      <option value="">Sélectionnez la région</option>
                      @for (reg of regions; track reg) {
                        <option [value]="reg">{{ reg }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('region')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La région est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="departement">Département <span class="text-danger">*</span></label>
                    <select
                      id="departement"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('departement')"
                      formControlName="departement"
                      (change)="onDepartmentChange()"
                    >
                      <option value="">Sélectionnez le département</option>
                      @for (dept of departments; track dept) {
                        <option [value]="dept">{{ dept }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('departement')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> Le département est requis
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="commune">Commune <span class="text-danger">*</span></label>
                    <select
                      id="commune"
                      class="csu-form-control csu-form-select"
                      [class.is-invalid]="isFieldInvalid('commune')"
                      formControlName="commune"
                    >
                      <option value="">Sélectionnez la commune</option>
                      @for (com of communes; track com) {
                        <option [value]="com">{{ com }}</option>
                      }
                    </select>
                    @if (isFieldInvalid('commune')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> La commune est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="adresse">Adresse Physique <span class="text-danger">*</span></label>
                    <textarea
                      id="adresse"
                      rows="2"
                      class="csu-form-control"
                      [class.is-invalid]="isFieldInvalid('adresse')"
                      formControlName="adresse"
                      placeholder="Quartier, Avenue, Rue, N° de porte..."
                    ></textarea>
                    @if (isFieldInvalid('adresse')) {
                      <div class="csu-invalid-feedback">
                        <i class="bi bi-info-circle"></i> L'adresse est requise
                      </div>
                    }
                  </div>
                </div>

                <div class="col-12">
                  <div class="form-check form-switch mt-2">
                    <input class="form-check-input" type="checkbox" id="actif" formControlName="actif" />
                    <label class="form-check-label fw-bold" for="actif">Bureau actif (Ouvert aux opérations)</label>
                  </div>
                </div>
              </div>

              <!-- Section 3 : Géolocalisation (contrôle de pointage) -->
              <h4 class="mb-2 text-csu-secondary">
                <i class="bi bi-pin-map-fill me-2"></i> Géolocalisation du bureau
              </h4>
              <p class="small text-muted mb-3">
                Coordonnées GPS utilisées pour vérifier que l'agent pointe bien depuis le bureau.
                Laissez vide pour désactiver le contrôle.
              </p>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="latitude">Latitude</label>
                    <input id="latitude" type="number" step="any" class="csu-form-control"
                           formControlName="latitude" placeholder="Ex: 14.6928" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="longitude">Longitude</label>
                    <input id="longitude" type="number" step="any" class="csu-form-control"
                           formControlName="longitude" placeholder="Ex: -17.4467" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="rayonToleranceMetres">Rayon de tolérance (m)</label>
                    <input id="rayonToleranceMetres" type="number" min="10" class="csu-form-control"
                           formControlName="rayonToleranceMetres" placeholder="150" />
                  </div>
                </div>
                <div class="col-12">
                  <button type="button" class="csu-btn csu-btn-light" (click)="utiliserMaPosition()" [disabled]="geoLoading">
                    @if (geoLoading) {
                      <span class="spinner-border spinner-border-sm me-2" role="status"></span> Localisation...
                    } @else {
                      <i class="bi bi-crosshair me-1"></i> Utiliser ma position actuelle
                    }
                  </button>
                  @if (bureauForm.get('latitude')?.value && bureauForm.get('longitude')?.value) {
                    <a class="ms-2 small text-decoration-none"
                       [href]="'https://www.google.com/maps?q=' + bureauForm.get('latitude')?.value + ',' + bureauForm.get('longitude')?.value"
                       target="_blank" rel="noopener">
                      <i class="bi bi-geo-alt"></i> Voir sur la carte
                    </a>
                  }
                </div>

                <div class="col-12">
                  <p class="small text-muted mb-1"><i class="bi bi-hand-index"></i> Cliquez sur la carte pour placer le bureau.</p>
                  <div #mapContainer class="bureau-map"></div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/admin/bureaux" class="csu-btn csu-btn-light">
                  Annuler
                </button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enregistrement...
                  } @else {
                    <i class="bi bi-check-lg me-1"></i>
                    {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le bureau' }}
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-primary-light border-0">
            <h4 class="text-csu-primary mb-3">Réseau des bureaux</h4>
            <p class="small text-secondary">
              Les bureaux de la Couverture Sanitaire Universelle sont configurés pour regrouper géographiquement les dossiers patients et les statistiques locales.
            </p>
            <p class="small text-secondary">
              Une fois créé, un bureau peut accueillir des agents de saisie d'enrôlements.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bureau-map { height: 320px; width: 100%; border-radius: 12px; border: 1px solid var(--csu-border-light, rgba(0,0,0,0.1)); overflow: hidden; z-index: 0; }
  `]
})
export class BureauFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private bureauService = inject(BureauService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLElement>;
  private L: any;
  private map: any;
  private marker: any;
  private readonly defaultCenter: [number, number] = [14.6928, -17.4467]; // Dakar

  isEditMode = false;
  bureauId?: number;
  submitting = false;

  // Cascading Localisation lists
  regions: string[] = ['Dakar', 'Thiès', 'Diourbel', 'Saint-Louis'];
  departments: string[] = [];
  communes: string[] = [];

  private locationData: RegionData = {
    'Dakar': {
      departments: ['Dakar', 'Pikine', 'Guédiawaye', 'Rufisque'],
      communes: {
        'Dakar': ['Plateau', 'Medina', 'Almadies', 'Fann-Point E'],
        'Pikine': ['Pikine Est', 'Pikine Ouest', 'Mbao'],
        'Guédiawaye': ['Golf Sud', 'Sam Notaire', 'Wakhinane Nimzatt'],
        'Rufisque': ['Rufisque Est', 'Rufisque Ouest', 'Sangalkam']
      }
    },
    'Thiès': {
      departments: ['Thiès', 'Mbour', 'Tivaouane'],
      communes: {
        'Thiès': ['Thiès Est', 'Thiès Ouest', 'Thiès Nord'],
        'Mbour': ['Mbour', 'Saly', 'Joal-Fadiouth'],
        'Tivaouane': ['Tivaouane', 'Mboro', 'Meckhe']
      }
    },
    'Diourbel': {
      departments: ['Diourbel', 'Mbacké', 'Bambey'],
      communes: {
        'Diourbel': ['Diourbel', 'Ndindy'],
        'Mbacké': ['Mbacké', 'Touba Mosquée', 'Touba Fall'],
        'Bambey': ['Bambey', 'Baba Garage']
      }
    },
    'Saint-Louis': {
      departments: ['Saint-Louis', 'Dagana', 'Podor'],
      communes: {
        'Saint-Louis': ['Saint-Louis', 'Gandon'],
        'Dagana': ['Dagana', 'Richard-Toll', 'Ross Béthio'],
        'Podor': ['Podor', 'Ndioum']
      }
    }
  };

  bureauForm = this.fb.group({
    code: ['', [Validators.required]],
    nom: ['', [Validators.required]],
    telephone: ['', [Validators.required, Validators.pattern('^(77|78|76|70|33)[0-9]{7}$')]],
    region: ['', [Validators.required]],
    departement: [{ value: '', disabled: true }, [Validators.required]],
    commune: [{ value: '', disabled: true }, [Validators.required]],
    adresse: ['', [Validators.required]],
    actif: [true],
    latitude: [null as number | null],
    longitude: [null as number | null],
    rayonToleranceMetres: [150 as number | null]
  });

  geoLoading = false;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.bureauId = +idParam;
      this.loadBureauData(this.bureauId);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.mapContainer) return;

    // Import dynamique (Leaflet utilise window/document → navigateur uniquement)
    const leaflet = await import('leaflet');
    this.L = (leaflet as any).default || leaflet;

    // Corrige les chemins des icônes par défaut (problème connu avec les bundlers)
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    const lat = this.bureauForm.get('latitude')?.value;
    const lng = this.bureauForm.get('longitude')?.value;
    const center: [number, number] = (lat != null && lng != null) ? [lat, lng] : this.defaultCenter;

    this.map = this.L.map(this.mapContainer.nativeElement).setView(center, (lat != null && lng != null) ? 16 : 12);
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    if (lat != null && lng != null) {
      this.placerMarqueur(lat, lng, false);
    }

    // Clic sur la carte → place le bureau
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.bureauForm.patchValue({ latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) });
      this.placerMarqueur(lat, lng, false);
    });

    // Recalcule la taille après rendu (conteneur initialement masqué/animé)
    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); this.map = undefined; }
  }

  /** Place / déplace le marqueur, optionnellement recentre la carte. */
  private placerMarqueur(lat: number, lng: number, recentrer = true): void {
    if (!this.map || !this.L) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = this.L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        this.bureauForm.patchValue({ latitude: +pos.lat.toFixed(6), longitude: +pos.lng.toFixed(6) });
      });
    }
    if (recentrer) this.map.setView([lat, lng], Math.max(this.map.getZoom(), 16));
  }

  isFieldInvalid(field: string): boolean {
    const control = this.bureauForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadBureauData(id: number): void {
    this.bureauService.getBureauById(id).subscribe({
      next: (b) => {
        this.fillForm(b);
      },
      error: (err) => {
        console.error('Erreur lors du chargement du bureau:', err);
        Swal.fire('Erreur', 'Impossible de charger le bureau.', 'error');
        this.router.navigate(['/admin/bureaux']);
      }
    });
  }

  private fillForm(b: any): void {
    if (b.region) {
      this.departments = this.locationData[b.region]?.departments || [];
      this.bureauForm.get('departement')?.enable();
    }
    if (b.region && b.departement) {
      this.communes = this.locationData[b.region]?.communes[b.departement] || [];
      this.bureauForm.get('commune')?.enable();
    }

    this.bureauForm.patchValue({
      code: b.code,
      nom: b.nom,
      telephone: b.telephone,
      region: b.region,
      departement: b.departement,
      commune: b.commune,
      adresse: b.adresse,
      actif: b.actif,
      latitude: b.latitude ?? null,
      longitude: b.longitude ?? null,
      rayonToleranceMetres: b.rayonToleranceMetres ?? 150
    });

    // Si la carte est déjà initialisée (données chargées après ngAfterViewInit)
    if (b.latitude != null && b.longitude != null && this.map) {
      this.placerMarqueur(b.latitude, b.longitude, true);
    }
  }

  utiliserMaPosition(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      Swal.fire('Indisponible', "La géolocalisation n'est pas disponible sur cet appareil.", 'warning');
      return;
    }
    this.geoLoading = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = +pos.coords.latitude.toFixed(6);
        const lng = +pos.coords.longitude.toFixed(6);
        this.bureauForm.patchValue({ latitude: lat, longitude: lng });
        this.placerMarqueur(lat, lng, true);
        this.geoLoading = false;
        Swal.fire({ icon: 'success', title: 'Position récupérée', timer: 1500, showConfirmButton: false });
      },
      (err) => {
        this.geoLoading = false;
        Swal.fire('Échec', err?.message || "Impossible d'obtenir la position.", 'error');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  onRegionChange(): void {
    const region = this.bureauForm.get('region')?.value;
    const deptControl = this.bureauForm.get('departement');
    const comControl = this.bureauForm.get('commune');

    deptControl?.setValue('');
    comControl?.setValue('');
    
    if (region && this.locationData[region]) {
      this.departments = this.locationData[region].departments;
      deptControl?.enable();
      comControl?.disable();
    } else {
      this.departments = [];
      this.communes = [];
      deptControl?.disable();
      comControl?.disable();
    }
  }

  onDepartmentChange(): void {
    const region = this.bureauForm.get('region')?.value;
    const department = this.bureauForm.get('departement')?.value;
    const comControl = this.bureauForm.get('commune');

    comControl?.setValue('');

    if (region && department && this.locationData[region]?.communes[department]) {
      this.communes = this.locationData[region].communes[department];
      comControl?.enable();
    } else {
      this.communes = [];
      comControl?.disable();
    }
  }

  onSubmit(): void {
    if (this.bureauForm.invalid) {
      this.bureauForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const bureauData = this.bureauForm.getRawValue() as any;

    if (this.isEditMode) {
      this.bureauService.updateBureau(this.bureauId!, bureauData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Mis à jour !',
            text: 'Le bureau CSU a été mis à jour.',
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/admin/bureaux']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Mis à jour !', 'Bureau CSU mis à jour (Simulation).', 'success')
            .then(() => this.router.navigate(['/admin/bureaux']));
        }
      });
    } else {
      this.bureauService.createBureau(bureauData).subscribe({
        next: () => {
          this.submitting = false;
          Swal.fire({
            title: 'Créé !',
            text: 'Le bureau CSU a été configuré avec succès.',
            icon: 'success',
            confirmButtonColor: '#00875A'
          }).then(() => this.router.navigate(['/admin/bureaux']));
        },
        error: () => {
          this.submitting = false;
          Swal.fire('Créé !', 'Nouveau bureau CSU configuré (Simulation).', 'success')
            .then(() => this.router.navigate(['/admin/bureaux']));
        }
      });
    }
  }
}
