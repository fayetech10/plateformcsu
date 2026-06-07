import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { PharmacieService } from '../../../core/services/pharmacie.service';
import { STATUT_CONVENTION_META, STATUT_CONVENTION_OPTIONS, StatutConvention } from '../../../core/models/pharmacie.model';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

interface CommuneData { [dept: string]: string[]; }
interface RegionData { [region: string]: { departments: string[]; communes: CommuneData; }; }

@Component({
  selector: 'app-pharmacie-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-capsule text-csu-primary"></i>
            {{ isEditMode ? 'Modifier la Pharmacie' : 'Ajouter une Pharmacie Conventionnée' }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isEditMode ? 'Mise à jour des informations et de la convention' : 'Enregistrez une pharmacie partenaire, sa convention et sa localisation pour la cartographie' }}
          </p>
        </div>
        <div>
          <a routerLink="/admin/pharmacies" class="csu-btn csu-btn-light">
            <i class="bi bi-arrow-left"></i> Retour
          </a>
        </div>
      </div>

      <div class="row">
        <div class="col-12 col-xl-8">
          <div class="csu-card">
            <form [formGroup]="form" (ngSubmit)="onSubmit()">

              <!-- Section 1 : Identification -->
              <h4 class="mb-4 text-csu-primary">
                <i class="bi bi-capsule-pill me-2"></i> Informations de la Pharmacie
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="nom">Nom de la Pharmacie <span class="text-danger">*</span></label>
                    <input id="nom" type="text" class="csu-form-control"
                           [class.is-invalid]="isFieldInvalid('nom')"
                           formControlName="nom" placeholder="Ex: Pharmacie de la Paix" />
                    @if (isFieldInvalid('nom')) {
                      <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Le nom est requis</div>
                    }
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="responsable">Pharmacien responsable</label>
                    <input id="responsable" type="text" class="csu-form-control"
                           formControlName="responsable" placeholder="Ex: Dr. Awa Diop" />
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="telephone">N° Téléphone</label>
                    <input id="telephone" type="tel" class="csu-form-control"
                           formControlName="telephone" placeholder="Ex: 338000000" />
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="email">Email</label>
                    <input id="email" type="email" class="csu-form-control"
                           [class.is-invalid]="isFieldInvalid('email')"
                           formControlName="email" placeholder="contact@pharmacie.sn" />
                    @if (isFieldInvalid('email')) {
                      <div class="csu-invalid-feedback"><i class="bi bi-info-circle"></i> Email invalide</div>
                    }
                  </div>
                </div>
              </div>

              <!-- Section 2 : Convention -->
              <h4 class="mb-4 text-csu-secondary">
                <i class="bi bi-file-earmark-text-fill me-2"></i> Convention
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="statutConvention">État de la convention <span class="text-danger">*</span></label>
                    <select id="statutConvention" class="csu-form-control csu-form-select"
                            formControlName="statutConvention">
                      @for (s of statutOptions; track s) {
                        <option [value]="s">{{ statutLabel(s) }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="numeroConvention">N° de convention</label>
                    <input id="numeroConvention" type="text" class="csu-form-control"
                           formControlName="numeroConvention" placeholder="Ex: CONV-2026-014" />
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="dateSignature">Date de signature</label>
                    <input id="dateSignature" type="date" class="csu-form-control"
                           formControlName="dateSignature" />
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="dateExpiration">Date d'expiration</label>
                    <input id="dateExpiration" type="date" class="csu-form-control"
                           formControlName="dateExpiration" />
                  </div>
                </div>

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="notes">Notes / Observations</label>
                    <textarea id="notes" rows="2" class="csu-form-control"
                              formControlName="notes" placeholder="Remarques sur la convention..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Section 3 : Localisation -->
              <h4 class="mb-4 text-csu-secondary">
                <i class="bi bi-geo-alt-fill me-2"></i> Localisation & Adresse
              </h4>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="region">Région</label>
                    <select id="region" class="csu-form-control csu-form-select"
                            formControlName="region" (change)="onRegionChange()">
                      <option value="">Sélectionnez la région</option>
                      @for (reg of regions; track reg) {
                        <option [value]="reg">{{ reg }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="departement">Département</label>
                    <select id="departement" class="csu-form-control csu-form-select"
                            formControlName="departement" (change)="onDepartmentChange()">
                      <option value="">Sélectionnez le département</option>
                      @for (dept of departments; track dept) {
                        <option [value]="dept">{{ dept }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-12 col-md-4">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="commune">Commune</label>
                    <select id="commune" class="csu-form-control csu-form-select"
                            formControlName="commune">
                      <option value="">Sélectionnez la commune</option>
                      @for (com of communes; track com) {
                        <option [value]="com">{{ com }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div class="col-12">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="adresse">Adresse Physique</label>
                    <textarea id="adresse" rows="2" class="csu-form-control"
                              formControlName="adresse" placeholder="Quartier, Avenue, Rue, N° de porte..."></textarea>
                  </div>
                </div>
              </div>

              <!-- Section 4 : Géolocalisation -->
              <h4 class="mb-2 text-csu-secondary">
                <i class="bi bi-pin-map-fill me-2"></i> Coordonnées de cartographie
              </h4>
              <p class="small text-muted mb-3">
                Cliquez sur la carte ou utilisez votre position pour placer la pharmacie. Ces coordonnées servent à l'afficher sur la carte.
              </p>

              <div class="row g-3 mb-4">
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="latitude">Latitude</label>
                    <input id="latitude" type="number" step="any" class="csu-form-control"
                           formControlName="latitude" placeholder="Ex: 14.6928" />
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <div class="csu-form-group">
                    <label class="csu-form-label" for="longitude">Longitude</label>
                    <input id="longitude" type="number" step="any" class="csu-form-control"
                           formControlName="longitude" placeholder="Ex: -17.4467" />
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
                  @if (form.get('latitude')?.value && form.get('longitude')?.value) {
                    <a class="ms-2 small text-decoration-none"
                       [href]="'https://www.google.com/maps?q=' + form.get('latitude')?.value + ',' + form.get('longitude')?.value"
                       target="_blank" rel="noopener">
                      <i class="bi bi-geo-alt"></i> Voir sur Google Maps
                    </a>
                  }
                </div>

                <div class="col-12">
                  <p class="small text-muted mb-1"><i class="bi bi-hand-index"></i> Cliquez sur la carte pour placer la pharmacie.</p>
                  <div #mapContainer class="pharmacie-map"></div>
                </div>
              </div>

              <!-- Submit -->
              <div class="d-flex justify-content-end gap-3 border-top pt-4">
                <button type="button" routerLink="/admin/pharmacies" class="csu-btn csu-btn-light">Annuler</button>
                <button type="submit" class="csu-btn csu-btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-2" role="status"></span> Enregistrement...
                  } @else {
                    <i class="bi bi-check-lg me-1"></i> {{ isEditMode ? 'Enregistrer les modifications' : 'Ajouter la pharmacie' }}
                  }
                </button>
              </div>

            </form>
          </div>
        </div>

        <div class="col-12 col-xl-4 d-none d-xl-block">
          <div class="csu-card bg-csu-primary-light border-0">
            <h4 class="text-csu-primary mb-3">Pharmacies conventionnées</h4>
            <p class="small text-secondary">
              Enregistrez ici les pharmacies avec lesquelles une convention a été signée, et renseignez leurs coordonnées GPS.
            </p>
            <p class="small text-secondary">
              Elles seront cartographiées et colorées selon l'état de leur convention (signée, arrêtée, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pharmacie-map { height: 320px; width: 100%; border-radius: 12px; border: 1px solid var(--csu-border-light, rgba(0,0,0,0.1)); overflow: hidden; z-index: 0; }
  `]
})
export class PharmacieFormComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private pharmacieService = inject(PharmacieService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLElement>;
  private L: any;
  private map: any;
  private marker: any;
  private readonly defaultCenter: [number, number] = [14.6928, -17.4467]; // Dakar

  isEditMode = false;
  pharmacieId?: number;
  submitting = false;
  geoLoading = false;

  statutOptions = STATUT_CONVENTION_OPTIONS;

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

  form = this.fb.group({
    nom: ['', [Validators.required]],
    responsable: [''],
    telephone: [''],
    email: ['', [Validators.email]],
    numeroConvention: [''],
    statutConvention: ['EN_ATTENTE' as StatutConvention, [Validators.required]],
    dateSignature: [null as string | null],
    dateExpiration: [null as string | null],
    notes: [''],
    region: [''],
    departement: [{ value: '', disabled: true }],
    commune: [{ value: '', disabled: true }],
    adresse: [''],
    latitude: [null as number | null],
    longitude: [null as number | null]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.pharmacieId = +idParam;
      this.loadData(this.pharmacieId);
    }
  }

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || !this.mapContainer) return;

    const leaflet = await import('leaflet');
    this.L = (leaflet as any).default || leaflet;

    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    const lat = this.form.get('latitude')?.value;
    const lng = this.form.get('longitude')?.value;
    const center: [number, number] = (lat != null && lng != null) ? [lat, lng] : this.defaultCenter;

    this.map = this.L.map(this.mapContainer.nativeElement).setView(center, (lat != null && lng != null) ? 16 : 12);
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    if (lat != null && lng != null) {
      this.placerMarqueur(lat, lng, false);
    }

    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.form.patchValue({ latitude: +lat.toFixed(6), longitude: +lng.toFixed(6) });
      this.placerMarqueur(lat, lng, false);
    });

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); this.map = undefined; }
  }

  private placerMarqueur(lat: number, lng: number, recentrer = true): void {
    if (!this.map || !this.L) return;
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = this.L.marker([lat, lng], { draggable: true }).addTo(this.map);
      this.marker.on('dragend', () => {
        const pos = this.marker.getLatLng();
        this.form.patchValue({ latitude: +pos.lat.toFixed(6), longitude: +pos.lng.toFixed(6) });
      });
    }
    if (recentrer) this.map.setView([lat, lng], Math.max(this.map.getZoom(), 16));
  }

  statutLabel(s: StatutConvention): string {
    return STATUT_CONVENTION_META[s].label;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadData(id: number): void {
    this.pharmacieService.getPharmacieById(id).subscribe({
      next: (p) => this.fillForm(p),
      error: (err) => {
        console.error('Erreur lors du chargement de la pharmacie:', err);
        Swal.fire('Erreur', 'Impossible de charger la pharmacie.', 'error');
        this.router.navigate(['/admin/pharmacies']);
      }
    });
  }

  private fillForm(p: any): void {
    if (p.region) {
      this.departments = this.locationData[p.region]?.departments || [];
      this.form.get('departement')?.enable();
    }
    if (p.region && p.departement) {
      this.communes = this.locationData[p.region]?.communes[p.departement] || [];
      this.form.get('commune')?.enable();
    }

    this.form.patchValue({
      nom: p.nom,
      responsable: p.responsable,
      telephone: p.telephone,
      email: p.email,
      numeroConvention: p.numeroConvention,
      statutConvention: p.statutConvention || 'EN_ATTENTE',
      dateSignature: p.dateSignature,
      dateExpiration: p.dateExpiration,
      notes: p.notes,
      region: p.region,
      departement: p.departement,
      commune: p.commune,
      adresse: p.adresse,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null
    });

    if (p.latitude != null && p.longitude != null && this.map) {
      this.placerMarqueur(p.latitude, p.longitude, true);
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
        this.form.patchValue({ latitude: lat, longitude: lng });
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
    const region = this.form.get('region')?.value;
    const deptControl = this.form.get('departement');
    const comControl = this.form.get('commune');

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
    const region = this.form.get('region')?.value;
    const department = this.form.get('departement')?.value;
    const comControl = this.form.get('commune');

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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const data = this.form.getRawValue() as any;

    const obs = this.isEditMode
      ? this.pharmacieService.updatePharmacie(this.pharmacieId!, data)
      : this.pharmacieService.createPharmacie(data);

    obs.subscribe({
      next: () => {
        this.submitting = false;
        Swal.fire({
          title: this.isEditMode ? 'Mise à jour !' : 'Ajoutée !',
          text: this.isEditMode ? 'La pharmacie a été mise à jour.' : 'La pharmacie a été ajoutée avec succès.',
          icon: 'success',
          confirmButtonColor: '#00875A'
        }).then(() => this.router.navigate(['/admin/pharmacies']));
      },
      error: () => {
        this.submitting = false;
        Swal.fire('Erreur', "L'enregistrement a échoué. Vérifiez votre connexion.", 'error');
      }
    });
  }
}
