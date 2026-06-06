import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PermissionService } from '../../core/services/permission.service';
import { AuthService } from '../../core/services/auth.service';
import { DemandePermission, StatutPermission } from '../../core/models/permission.model';
import { CardListItemComponent } from '../../shared/ui';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-permission',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardListItemComponent],
  template: `
    <div class="container-fluid animate-fade-in">
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-calendar2-week text-csu-primary"></i>
            {{ isAdmin ? 'Demandes de permission' : 'Mes demandes de permission' }}
          </h1>
          <p class="csu-page-subtitle">
            {{ isAdmin
              ? 'Consultez et traitez les demandes soumises par les agents'
              : "Soumettez une demande d'absence, de congé ou de retard à valider par l'administration" }}
          </p>
        </div>
      </div>

      <!-- ═══════════════ Vue ADMIN : uniquement la liste ═══════════════ -->
      @if (isAdmin) {
        <div class="csu-card">
          <div class="csu-card-header">
            <h3 class="csu-card-title">
              <i class="bi bi-list-check text-csu-primary"></i>
              Liste des demandes
              @if (nbEnAttente > 0) { <span class="pending-badge">{{ nbEnAttente }} en attente</span> }
            </h3>
            <div class="filtre-group">
              <button class="filtre-btn" [class.active]="filtreStatut === 'EN_ATTENTE'" (click)="changerFiltre('EN_ATTENTE')">En attente</button>
              <button class="filtre-btn" [class.active]="filtreStatut === 'APPROUVEE'" (click)="changerFiltre('APPROUVEE')">Approuvées</button>
              <button class="filtre-btn" [class.active]="filtreStatut === 'REFUSEE'" (click)="changerFiltre('REFUSEE')">Refusées</button>
              <button class="filtre-btn" [class.active]="filtreStatut === ''" (click)="changerFiltre('')">Toutes</button>
            </div>
          </div>

          @if (loading) {
            <div class="csu-loading"><div class="csu-spinner"></div></div>
          } @else if (demandes.length > 0) {
            <div class="table-responsive d-none d-lg-block">
              <table class="csu-table">
                <thead>
                  <tr><th>Agent</th><th>Type</th><th>Période</th><th>Motif</th><th>Demandé le</th><th class="text-center">Statut</th><th class="text-center">Actions</th></tr>
                </thead>
                <tbody>
                  @for (d of demandes; track d.id) {
                    <tr>
                      <td class="fw-semibold">{{ d.agentNom }}</td>
                      <td><span class="type-tag">{{ typeLabel(d.type) }}</span></td>
                      <td class="text-muted small">{{ d.dateDebut | date:'dd/MM/yy' }} → {{ d.dateFin | date:'dd/MM/yy' }}</td>
                      <td class="text-muted small text-truncate" style="max-width: 260px;" [title]="d.motif">{{ d.motif || '—' }}</td>
                      <td class="text-muted small">{{ d.dateDemande }}</td>
                      <td class="text-center">
                        <span class="statut-pill" [ngClass]="'st-' + d.statut.toLowerCase()">{{ statutLabel(d.statut) }}</span>
                      </td>
                      <td class="text-center">
                        @if (d.statut === 'EN_ATTENTE') {
                          <button class="act-btn ok" (click)="approuver(d)" title="Approuver"><i class="bi bi-check-lg"></i></button>
                          <button class="act-btn no" (click)="refuser(d)" title="Refuser"><i class="bi bi-x-lg"></i></button>
                        } @else {
                          <span class="text-muted small">{{ d.traiteeParNom || 'Traitée' }}</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Cartes résumé (mobile/tablette) -->
            <div class="csu-list d-lg-none mb-0">
              @for (d of demandes; track d.id) {
                <csu-list-card>
                  <div class="csu-list-card-head">
                    <div class="csu-list-card-lead"><i class="bi bi-person"></i></div>
                    <div class="csu-list-card-body">
                      <div class="csu-list-card-title">{{ d.agentNom }}</div>
                      <div class="csu-list-card-sub">{{ d.dateDebut | date:'dd/MM/yy' }} → {{ d.dateFin | date:'dd/MM/yy' }}</div>
                    </div>
                    <span class="statut-pill" [ngClass]="'st-' + d.statut.toLowerCase()">{{ statutLabel(d.statut) }}</span>
                  </div>

                  <div class="csu-list-card-meta">
                    <span class="type-tag">{{ typeLabel(d.type) }}</span>
                    <div class="meta"><span class="meta-label">Demandé le</span><span class="meta-value">{{ d.dateDemande }}</span></div>
                  </div>
                  @if (d.motif) {
                    <p class="text-truncate-2" style="font-size:0.82rem;color:var(--csu-text-secondary);margin:0.6rem 0 0;">{{ d.motif }}</p>
                  }

                  @if (d.statut === 'EN_ATTENTE') {
                    <div class="csu-list-card-actions">
                      <button class="csu-btn csu-btn-light text-success" (click)="approuver(d)">
                        <i class="bi bi-check-lg"></i> Approuver
                      </button>
                      <button class="csu-btn csu-btn-light text-csu-danger" (click)="refuser(d)">
                        <i class="bi bi-x-lg"></i> Refuser
                      </button>
                    </div>
                  } @else {
                    <div class="csu-list-card-actions">
                      <span class="text-muted small" style="padding:0.5rem 0;">Traitée par {{ d.traiteeParNom || '—' }}</span>
                    </div>
                  }
                </csu-list-card>
              }
            </div>
          } @else {
            <div class="csu-empty-state">
              <i class="bi bi-calendar2-check"></i>
              <h3>Aucune demande</h3>
              <p>Aucune demande {{ filtreStatut === 'EN_ATTENTE' ? 'en attente' : '' }} pour le moment.</p>
            </div>
          }
        </div>
      } @else {
        <!-- ═══════════════ Vue AGENT : formulaire + ses demandes ═══════════════ -->
        <div class="row g-4">
          <!-- Formulaire -->
          <div class="col-12 col-lg-5">
            <div class="csu-card">
              <div class="csu-card-header">
                <h3 class="csu-card-title"><i class="bi bi-plus-circle text-csu-primary"></i> Nouvelle demande</h3>
              </div>
              <form [formGroup]="form" (ngSubmit)="soumettre()">
                <div class="mb-3">
                  <label class="form-label">Type de permission</label>
                  <select class="form-select" formControlName="type">
                    <option value="CONGE">Congé</option>
                    <option value="ABSENCE">Absence</option>
                    <option value="RETARD">Retard</option>
                    <option value="SORTIE">Sortie</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label">Du</label>
                    <input type="date" class="form-control" formControlName="dateDebut">
                  </div>
                  <div class="col-6">
                    <label class="form-label">Au</label>
                    <input type="date" class="form-control" formControlName="dateFin">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Motif</label>
                  <textarea class="form-control" rows="3" formControlName="motif" placeholder="Expliquez la raison de votre demande..."></textarea>
                </div>
                <button type="submit" class="csu-btn csu-btn-primary w-100" [disabled]="form.invalid || busy">
                  <i class="bi bi-send"></i> Soumettre la demande
                </button>
              </form>
            </div>
          </div>

          <!-- Liste -->
          <div class="col-12 col-lg-7">
            <div class="csu-card h-100">
              <div class="csu-card-header">
                <h3 class="csu-card-title"><i class="bi bi-list-check text-csu-secondary"></i> Historique de mes demandes</h3>
              </div>
              @if (loading) {
                <div class="csu-loading"><div class="csu-spinner"></div></div>
              } @else if (demandes.length > 0) {
                <div class="d-flex flex-column gap-2">
                  @for (d of demandes; track d.id) {
                    <div class="demande-item">
                      <div class="d-flex justify-content-between align-items-start gap-2">
                        <div>
                          <span class="type-tag">{{ typeLabel(d.type) }}</span>
                          <span class="dates">{{ d.dateDebut | date:'dd/MM/yyyy' }} → {{ d.dateFin | date:'dd/MM/yyyy' }}</span>
                        </div>
                        <span class="statut-pill" [ngClass]="'st-' + d.statut.toLowerCase()">{{ statutLabel(d.statut) }}</span>
                      </div>
                      @if (d.motif) { <p class="motif">{{ d.motif }}</p> }
                      @if (d.commentaireAdmin) {
                        <p class="commentaire"><i class="bi bi-chat-left-quote"></i> {{ d.commentaireAdmin }}</p>
                      }
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">Demandé le {{ d.dateDemande }}</small>
                        @if (d.statut === 'EN_ATTENTE') {
                          <button class="btn-cancel" (click)="annuler(d)">Annuler</button>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="csu-empty-state"><i class="bi bi-calendar2-x"></i><h3>Aucune demande</h3><p>Vous n'avez soumis aucune demande pour le moment.</p></div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .demande-item { border: 1px solid var(--csu-border-light); border-radius: 12px; padding: 12px 14px; }
    .type-tag { font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(21,101,192,0.1); color: #1565C0; margin-right: 8px; }
    .dates { font-size: 0.85rem; color: var(--csu-text-muted); }
    .motif { margin: 8px 0 6px; font-size: 0.88rem; }
    .commentaire { margin: 4px 0 6px; font-size: 0.83rem; color: #555; background: var(--csu-bg); padding: 6px 10px; border-radius: 8px; }
    .statut-pill { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
    .statut-pill.st-en_attente { background: rgba(245,124,0,0.12); color: #E65100; }
    .statut-pill.st-approuvee { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .statut-pill.st-refusee { background: rgba(229,57,53,0.1); color: #C62828; }
    .btn-cancel { background: transparent; border: 1px solid rgba(229,57,53,0.3); color: #C62828; font-size: 0.78rem; font-weight: 600; padding: 3px 10px; border-radius: 8px; cursor: pointer; }
    .btn-cancel:hover { background: rgba(229,57,53,0.08); }

    /* Admin */
    .pending-badge { background: #F57C00; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 2px 9px; border-radius: 20px; margin-left: 8px; }
    .filtre-group { display: flex; gap: 4px; flex-wrap: wrap; }
    .filtre-btn { background: transparent; border: 1px solid var(--csu-border-light); color: var(--csu-text-muted); font-size: 0.76rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; cursor: pointer; transition: all 0.15s ease; }
    .filtre-btn:hover { border-color: var(--csu-primary); color: var(--csu-primary); }
    .filtre-btn.active { background: var(--csu-primary); border-color: var(--csu-primary); color: #fff; }
    .act-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; margin: 0 2px; font-size: 0.9rem; }
    .act-btn.ok { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .act-btn.ok:hover { background: #2E7D32; color: #fff; }
    .act-btn.no { background: rgba(229,57,53,0.1); color: #C62828; }
    .act-btn.no:hover { background: #C62828; color: #fff; }
  `]
})
export class PermissionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);

  form: FormGroup = this.fb.group({
    type: ['CONGE', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required],
    motif: ['']
  });

  demandes: DemandePermission[] = [];
  loading = true;
  busy = false;

  // Admin
  filtreStatut: '' | StatutPermission = 'EN_ATTENTE';
  nbEnAttente = 0;

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    if (this.isAdmin) {
      this.permissionService.toutes(this.filtreStatut || undefined).subscribe({
        next: (d) => { this.demandes = d; this.loading = false; },
        error: () => { this.demandes = []; this.loading = false; }
      });
      this.permissionService.countAttente().subscribe({
        next: (r) => (this.nbEnAttente = r.enAttente),
        error: () => {}
      });
    } else {
      this.permissionService.mesDemandes().subscribe({
        next: (d) => { this.demandes = d; this.loading = false; },
        error: () => { this.demandes = []; this.loading = false; }
      });
    }
  }

  /* ── Agent ── */
  soumettre(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    if (v.dateFin < v.dateDebut) {
      Swal.fire({ icon: 'warning', title: 'Dates invalides', text: 'La date de fin ne peut pas précéder la date de début.' });
      return;
    }
    this.busy = true;
    this.permissionService.creer(v).subscribe({
      next: () => {
        this.busy = false;
        Swal.fire({ icon: 'success', title: 'Demande envoyée', text: "Votre demande a été transmise à l'administration.", timer: 2200, showConfirmButton: false });
        this.form.reset({ type: 'CONGE', dateDebut: '', dateFin: '', motif: '' });
        this.load();
      },
      error: (err) => {
        this.busy = false;
        Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || "Impossible d'envoyer la demande." });
      }
    });
  }

  annuler(d: DemandePermission): void {
    Swal.fire({
      icon: 'question', title: 'Annuler cette demande ?', showCancelButton: true,
      confirmButtonText: 'Oui, annuler', cancelButtonText: 'Non', confirmButtonColor: '#C62828'
    }).then(r => {
      if (r.isConfirmed) {
        this.permissionService.annuler(d.id).subscribe({
          next: () => { Swal.fire({ icon: 'success', title: 'Annulée', timer: 1500, showConfirmButton: false }); this.load(); },
          error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Action impossible.' })
        });
      }
    });
  }

  /* ── Admin ── */
  changerFiltre(statut: '' | StatutPermission): void {
    this.filtreStatut = statut;
    this.load();
  }

  approuver(d: DemandePermission): void { this.traiter(d, true); }
  refuser(d: DemandePermission): void { this.traiter(d, false); }

  private traiter(d: DemandePermission, approuver: boolean): void {
    Swal.fire({
      title: approuver ? 'Approuver la demande ?' : 'Refuser la demande ?',
      input: 'textarea',
      inputLabel: 'Commentaire (optionnel)',
      inputPlaceholder: "Message à l'agent...",
      showCancelButton: true,
      confirmButtonText: approuver ? 'Approuver' : 'Refuser',
      cancelButtonText: 'Annuler',
      confirmButtonColor: approuver ? '#2E7D32' : '#C62828',
      icon: approuver ? 'question' : 'warning'
    }).then(r => {
      if (!r.isConfirmed) return;
      const obs = approuver
        ? this.permissionService.approuver(d.id, r.value)
        : this.permissionService.refuser(d.id, r.value);
      obs.subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: approuver ? 'Demande approuvée' : 'Demande refusée', timer: 1600, showConfirmButton: false });
          this.load();
          window.dispatchEvent(new CustomEvent('csu:permissions-updated'));
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Action impossible.' })
      });
    });
  }

  /* ── Libellés ── */
  typeLabel(t: string): string {
    const map: { [k: string]: string } = { CONGE: 'Congé', ABSENCE: 'Absence', RETARD: 'Retard', SORTIE: 'Sortie', AUTRE: 'Autre' };
    return map[t] || t;
  }

  statutLabel(s: string): string {
    const map: { [k: string]: string } = { EN_ATTENTE: 'En attente', APPROUVEE: 'Approuvée', REFUSEE: 'Refusée' };
    return map[s] || s;
  }
}
