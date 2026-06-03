import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActiviteService } from '../../../core/services/activite.service';
import { ConstatService } from '../../../core/services/constat.service';
import { CategorieActivite } from '../../../core/models/activite.model';
import { CategorieConstat } from '../../../core/models/constat.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-tags-fill text-csu-primary"></i>
            Administration — Catégories de Données
          </h1>
          <p class="csu-page-subtitle">Gérez les nomenclatures de classement pour les rapports d'activités et les signalements d'incidents</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Column 1: Activites Categories -->
        <div class="col-12 col-lg-6 animate-fade-in stagger-1">
          <div class="csu-card h-100">
            <div class="csu-card-header">
              <h3 class="csu-card-title">
                <i class="bi bi-calendar2-check-fill text-csu-primary"></i>
                Catégories d'Activités
              </h3>
              <button class="csu-btn csu-btn-primary csu-btn-sm" (click)="addActiviteCategory()">
                <i class="bi bi-plus-lg"></i> Ajouter
              </button>
            </div>

            @if (loadingActivites) {
              <div class="csu-loading">
                <div class="csu-spinner"></div>
              </div>
            } @else if (activiteCategories.length === 0) {
              <div class="csu-empty-state py-4">
                <i class="bi bi-tag"></i>
                <h3>Aucune catégorie d'activité</h3>
              </div>
            } @else {
              <table class="csu-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of activiteCategories; track c.id) {
                    <tr>
                      <td class="fw-bold">{{ c.nom }}</td>
                      <td class="small">{{ c.description || '-' }}</td>
                      <td>
                        <span class="badge" [class.bg-success]="c.actif" [class.bg-danger]="!c.actif">
                          {{ c.actif ? 'Actif' : 'Inactif' }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="csu-btn-icon btn-sm" (click)="editActiviteCategory(c)" title="Modifier">
                          <i class="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>

        <!-- Column 2: Constats Categories -->
        <div class="col-12 col-lg-6 animate-fade-in stagger-2">
          <div class="csu-card h-100">
            <div class="csu-card-header">
              <h3 class="csu-card-title">
                <i class="bi bi-exclamation-octagon-fill text-danger"></i>
                Catégories de Constats / Incidents
              </h3>
              <button class="csu-btn csu-btn-danger csu-btn-sm" (click)="addConstatCategory()">
                <i class="bi bi-plus-lg"></i> Ajouter
              </button>
            </div>

            @if (loadingConstats) {
              <div class="csu-loading">
                <div class="csu-spinner"></div>
              </div>
            } @else if (constatCategories.length === 0) {
              <div class="csu-empty-state py-4">
                <i class="bi bi-tag"></i>
                <h3>Aucune catégorie d'incident</h3>
              </div>
            } @else {
              <table class="csu-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (c of constatCategories; track c.id) {
                    <tr>
                      <td class="fw-bold">{{ c.nom }}</td>
                      <td class="small">{{ c.description || '-' }}</td>
                      <td>
                        <span class="badge" [class.bg-success]="c.actif" [class.bg-danger]="!c.actif">
                          {{ c.actif ? 'Actif' : 'Inactif' }}
                        </span>
                      </td>
                      <td class="text-end">
                        <button class="csu-btn-icon btn-sm" (click)="editConstatCategory(c)" title="Modifier">
                          <i class="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  private activiteService = inject(ActiviteService);
  private constatService = inject(ConstatService);

  activiteCategories: CategorieActivite[] = [];
  constatCategories: CategorieConstat[] = [];
  
  loadingActivites = false;
  loadingConstats = false;

  ngOnInit(): void {
    this.loadActiviteCategories();
    this.loadConstatCategories();
  }

  loadActiviteCategories(): void {
    this.loadingActivites = true;
    this.activiteService.getCategories(false).subscribe({
      next: (data) => {
        this.activiteCategories = data;
        this.loadingActivites = false;
      },
      error: () => {
        this.loadingActivites = false;
        // Mock fallback
        this.activiteCategories = [
          { id: 1, nom: 'Caravanes Marchés', description: 'Sensibilisation itinérante sur les marchés hebdomadaires', actif: true },
          { id: 2, nom: 'Ateliers Techniques', description: 'Atelier de travail avec les prestataires de santé', actif: true },
          { id: 3, nom: 'Instances Décisionnelles', description: 'Réunion du comité régional ou national', actif: true }
        ];
      }
    });
  }

  loadConstatCategories(): void {
    this.loadingConstats = true;
    this.constatService.getCategories(false).subscribe({
      next: (data) => {
        this.constatCategories = data;
        this.loadingConstats = false;
      },
      error: () => {
        this.loadingConstats = false;
        // Mock fallback
        this.constatCategories = [
          { id: 1, nom: 'Matériel', description: 'Imprimantes, ordinateurs, terminaux biométriques', actif: true },
          { id: 2, nom: 'Logiciel', description: 'Erreurs système, lenteurs base de données, bugs', actif: true },
          { id: 3, nom: 'Infrastructure', description: 'Connexion internet, électricité, locaux', actif: true }
        ];
      }
    });
  }

  addActiviteCategory(): void {
    this.showCategoryDialog("Ajouter une catégorie d'activité", (nom, desc, actif) => {
      this.activiteService.createCategorie({ nom, description: desc, actif }).subscribe({
        next: () => {
          Swal.fire('Créée !', 'La catégorie a été ajoutée.', 'success');
          this.loadActiviteCategories();
        },
        error: () => {
          // Simulation
          const newId = this.activiteCategories.length + 1;
          this.activiteCategories.push({ id: newId, nom, description: desc, actif });
          Swal.fire('Créée !', 'La catégorie a été ajoutée (Simulation).', 'success');
        }
      });
    });
  }

  editActiviteCategory(cat: CategorieActivite): void {
    this.showCategoryDialog("Modifier la catégorie d'activité", (nom, desc, actif) => {
      this.activiteService.updateCategorie(cat.id!, { id: cat.id, nom, description: desc, actif }).subscribe({
        next: () => {
          Swal.fire('Modifiée !', 'La catégorie a été mise à jour.', 'success');
          this.loadActiviteCategories();
        },
        error: () => {
          cat.nom = nom;
          cat.description = desc;
          cat.actif = actif;
          Swal.fire('Modifiée !', 'La catégorie a été mise à jour (Simulation).', 'success');
        }
      });
    }, cat);
  }

  addConstatCategory(): void {
    this.showCategoryDialog("Ajouter une catégorie d'incident", (nom, desc, actif) => {
      this.constatService.createCategorie({ nom, description: desc, actif }).subscribe({
        next: () => {
          Swal.fire('Créée !', 'La catégorie a été ajoutée.', 'success');
          this.loadConstatCategories();
        },
        error: () => {
          const newId = this.constatCategories.length + 1;
          this.constatCategories.push({ id: newId, nom, description: desc, actif });
          Swal.fire('Créée !', 'La catégorie a été ajoutée (Simulation).', 'success');
        }
      });
    });
  }

  editConstatCategory(cat: CategorieConstat): void {
    this.showCategoryDialog("Modifier la catégorie d'incident", (nom, desc, actif) => {
      this.constatService.updateCategorie(cat.id!, { id: cat.id, nom, description: desc, actif }).subscribe({
        next: () => {
          Swal.fire('Modifiée !', 'La catégorie a été mise à jour.', 'success');
          this.loadConstatCategories();
        },
        error: () => {
          cat.nom = nom;
          cat.description = desc;
          cat.actif = actif;
          Swal.fire('Modifiée !', 'La catégorie a été mise à jour (Simulation).', 'success');
        }
      });
    }, cat);
  }

  private showCategoryDialog(title: string, callback: (nom: string, desc: string, actif: boolean) => void, cat?: any): void {
    Swal.fire({
      title,
      html: `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label small fw-bold">Nom de la catégorie</label>
            <input id="cat-nom" class="form-control" placeholder="Nom..." value="${cat ? cat.nom : ''}">
          </div>
          <div class="mb-3">
            <label class="form-label small fw-bold">Description</label>
            <textarea id="cat-desc" class="form-control" rows="2" placeholder="Description...">${cat ? cat.description : ''}</textarea>
          </div>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" id="cat-actif" ${!cat || cat.actif ? 'checked' : ''}>
            <label class="form-check-label small fw-bold" for="cat-actif">Catégorie active</label>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#00875A',
      preConfirm: () => {
        const nom = (document.getElementById('cat-nom') as HTMLInputElement).value;
        const desc = (document.getElementById('cat-desc') as HTMLTextAreaElement).value;
        const actif = (document.getElementById('cat-actif') as HTMLInputElement).checked;
        if (!nom) {
          Swal.showValidationMessage("Le nom de la catégorie est obligatoire !");
        }
        return { nom, desc, actif };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        callback(result.value.nom, result.value.desc, result.value.actif);
      }
    });
  }
}
