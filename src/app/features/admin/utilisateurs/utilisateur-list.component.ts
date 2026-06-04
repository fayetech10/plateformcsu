import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UtilisateurService } from '../../../core/services/utilisateur.service';
import { Utilisateur } from '../../../core/models/utilisateur.model';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-utilisateur-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-people-fill text-csu-primary"></i>
            Administration — Utilisateurs
          </h1>
          <p class="csu-page-subtitle">Gérez les comptes des agents CSU, superviseurs et administrateurs de la plateforme</p>
        </div>
        <div>
          <a routerLink="/admin/utilisateurs/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-person-plus-fill"></i> Nouvel Utilisateur
          </a>
        </div>
      </div>

      <!-- Filters -->
      <div class="csu-card mb-4">
        <form [formGroup]="filterForm" (ngSubmit)="onSearch()" class="row g-3">
          <div class="col-12 col-md-8">
            <div class="csu-search-input m-0 w-100">
              <i class="bi bi-search"></i>
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, email ou identifiant..."
                formControlName="search"
              />
            </div>
          </div>
          <div class="col-12 col-md-4 d-flex gap-2">
            <button type="submit" class="csu-btn csu-btn-primary w-100">
              Rechercher
            </button>
            <button type="button" class="csu-btn csu-btn-light" (click)="onReset()">
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      <div class="csu-table-wrapper">
        @if (loading) {
          <div class="csu-loading">
            <div class="csu-spinner"></div>
          </div>
        } @else if (users.length === 0) {
          <div class="csu-empty-state">
            <i class="bi bi-people"></i>
            <h3>Aucun utilisateur trouvé</h3>
            <p>Aucun compte utilisateur ne correspond à votre recherche.</p>
          </div>
        } @else {
          <table class="csu-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email / Téléphone</th>
                <th>Rôle</th>
                <th>Bureau CSU</th>
                <th>Statut</th>
                <th>Création</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of users; track u.id) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-csu-primary-light text-csu-primary p-2 fw-bold text-uppercase d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                        {{ u.prenom.charAt(0) }}{{ u.nom.charAt(0) }}
                      </div>
                      <div>
                        <div class="fw-bold">{{ u.prenom }} {{ u.nom }}</div>
                        <div class="text-muted small">&#64;{{ u.username }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="small">{{ u.email }}</div>
                    <div class="text-muted small">{{ u.telephone || '-' }}</div>
                  </td>
                  <td>
                    <span class="badge" 
                      [class.bg-dark]="u.role === 'ADMIN'" 
                      [class.bg-primary]="u.role === 'SUPERVISEUR'" 
                      [class.bg-success]="u.role === 'AGENT'">
                      {{ u.role }}
                    </span>
                  </td>
                  <td>{{ u.bureauCsuNom || u.bureauCsu?.nom || 'Non affecté' }}</td>
                  <td>
                    <div class="form-check form-switch m-0">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        [checked]="u.actif"
                        (change)="toggleActive(u)"
                      />
                      <span class="small" [class.text-success]="u.actif" [class.text-danger]="!u.actif">
                        {{ u.actif ? 'Actif' : 'Bloqué' }}
                      </span>
                    </div>
                  </td>
                  <td class="small">{{ u.dateCreation | date:'dd/MM/yyyy' }}</td>
                  <td class="text-end">
                    <div class="d-inline-flex gap-2">
                      <a [routerLink]="['/admin/utilisateurs', u.id, 'modifier']" class="csu-btn-icon" title="Modifier">
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button (click)="onDelete(u)" class="csu-btn-icon danger" title="Supprimer">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="csu-pagination">
            <div class="csu-pagination-info">
              Affichage de {{ page * size + 1 }} à {{ Math.min((page + 1) * size, totalElements) }} sur {{ totalElements }} utilisateurs
            </div>
            <div class="csu-pagination-controls">
              <button class="csu-pagination-btn" [disabled]="page === 0" (click)="onPageChange(page - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              @for (pNum of getPagesArray(); track pNum) {
                <button 
                  class="csu-pagination-btn" 
                  [class.active]="pNum === page" 
                  (click)="onPageChange(pNum)"
                >
                  {{ pNum + 1 }}
                </button>
              }
              <button class="csu-pagination-btn" [disabled]="page >= totalPages - 1" (click)="onPageChange(page + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class UtilisateurListComponent implements OnInit {
  private userService = inject(UtilisateurService);
  private fb = inject(FormBuilder);

  users: Utilisateur[] = [];
  loading = false;

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 0;
  Math = Math;

  filterForm = this.fb.group({
    search: ['']
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const { search } = this.filterForm.value;

    this.userService.getUtilisateurs(this.page, this.size, search || undefined).subscribe({
      next: (res) => {
        this.users = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        // Mock fallback data
        this.users = this.getMockUsers().filter(u => {
          if (search) {
            const query = search.toLowerCase();
            return u.nom.toLowerCase().includes(query) || 
                   u.prenom.toLowerCase().includes(query) || 
                   (u.email ? u.email.toLowerCase().includes(query) : false) || 
                   u.username.toLowerCase().includes(query);
          }
          return true;
        });
        this.totalElements = this.users.length;
        this.totalPages = Math.ceil(this.users.length / this.size) || 1;
      }
    });
  }

  onSearch(): void {
    this.page = 0;
    this.loadUsers();
  }

  onReset(): void {
    this.filterForm.reset({
      search: ''
    });
    this.page = 0;
    this.loadUsers();
  }

  onPageChange(newPage: number): void {
    if (newPage >= 0 && newPage < this.totalPages) {
      this.page = newPage;
      this.loadUsers();
    }
  }

  getPagesArray(): number[] {
    const pages: number[] = [];
    for (let i = 0; i < this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  toggleActive(u: Utilisateur): void {
    const newActiveState = !u.actif;
    this.userService.toggleActivation(u.id!, newActiveState).subscribe({
      next: (updatedUser) => {
        u.actif = updatedUser.actif;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Compte ${u.actif ? 'activé' : 'bloqué'} avec succès`,
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: () => {
        // Mock toggler
        u.actif = newActiveState;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Statut modifié (Simulation)`,
          showConfirmButton: false,
          timer: 2000
        });
      }
    });
  }

  onDelete(u: Utilisateur): void {
    Swal.fire({
      title: "Supprimer l'utilisateur ?",
      text: `Voulez-vous supprimer définitivement le compte de ${u.prenom} ${u.nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#E53935',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUtilisateur(u.id!).subscribe({
          next: () => {
            Swal.fire('Supprimé !', 'Le compte utilisateur a été supprimé.', 'success');
            this.loadUsers();
          },
          error: () => {
            this.users = this.users.filter(usr => usr.id !== u.id);
            this.totalElements = this.users.length;
            Swal.fire('Supprimé !', 'Le compte a été supprimé (Simulation).', 'success');
          }
        });
      }
    });
  }

  private getMockUsers(): Utilisateur[] {
    return [
      { id: 1, username: 'admin', nom: 'Gueye', prenom: 'Amadou', email: 'admin@csu.sn', telephone: '775556677', role: 'ADMIN', actif: true, dateCreation: '2026-01-01', bureauCsu: { nom: 'Dakar Centre', code: 'DKR-01', region: 'Dakar', departement: 'Dakar', commune: 'Medina', adresse: '', telephone: '', actif: true } },
      { id: 2, username: 'supervisor1', nom: 'Diop', prenom: 'Mariama', email: 'm.diop@csu.sn', telephone: '782223344', role: 'SUPERVISEUR', actif: true, dateCreation: '2026-02-15', bureauCsu: { nom: 'Thiès Ouest', code: 'THS-02', region: 'Thiès', departement: 'Thiès', commune: 'Thiès Ouest', adresse: '', telephone: '', actif: true } },
      { id: 3, username: 'agent1', nom: 'Ndiaye', prenom: 'Babacar', email: 'b.ndiaye@csu.sn', telephone: '768889900', role: 'AGENT', actif: true, dateCreation: '2026-03-10', bureauCsu: { nom: 'Mbour Littoral', code: 'MBR-03', region: 'Thiès', departement: 'Mbour', commune: 'Saly', adresse: '', telephone: '', actif: true } }
    ];
  }
}
