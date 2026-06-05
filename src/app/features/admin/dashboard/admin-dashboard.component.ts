import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import Swal from 'sweetalert2';
import { AdminDashboardService } from '../../../core/services/admin-dashboard.service';
import { AdminDashboardStats } from '../../../core/models/admin-dashboard.model';
import { PointageService } from '../../../core/services/pointage.service';
import { PointagesJour, PointageLigne } from '../../../core/models/pointage.model';
import { PermissionService } from '../../../core/services/permission.service';
import { DemandePermission } from '../../../core/models/permission.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <i class="bi bi-shield-lock text-csu-primary"></i>
            Tableau de Bord — Administration
          </h1>
          <p class="csu-page-subtitle">Supervision des utilisateurs, bureaux et de l'activité de la plateforme</p>
        </div>
        <div class="d-flex gap-2">
          <button (click)="reload()" class="csu-btn csu-btn-light" [disabled]="loading">
            <i class="bi bi-arrow-clockwise" [class.spin]="loading"></i>
            Actualiser
          </button>
          <a routerLink="/admin/utilisateurs/nouveau" class="csu-btn csu-btn-primary">
            <i class="bi bi-person-plus"></i>
            Nouvel utilisateur
          </a>
        </div>
      </div>

      @if (loading) {
        <div class="csu-loading"><div class="csu-spinner"></div></div>
      } @else if (error) {
        <div class="csu-empty-state">
          <i class="bi bi-exclamation-triangle text-warning"></i>
          <h3>Impossible de charger les statistiques</h3>
          <p>Vérifiez votre connexion puis réessayez.</p>
          <button class="csu-btn csu-btn-primary mt-3" (click)="reload()">Réessayer</button>
        </div>
      } @else if (stats) {
        <!-- KPI Grid -->
        <div class="kpi-grid-container">
          <div class="kpi-grid">
            <!-- Utilisateurs -->
            <div class="kpi-card animate-fade-in stagger-1" routerLink="/admin/utilisateurs">
              <div class="kpi-icon-wrap users"><i class="bi bi-people-fill"></i></div>
              <div class="kpi-content">
                <span class="kpi-value">{{ stats.totalUtilisateurs }}</span>
                <span class="kpi-label">Utilisateurs</span>
              </div>
              <div class="kpi-trend up">
                <i class="bi bi-circle-fill"></i>
                <span>{{ stats.utilisateursActifs }} actifs</span>
              </div>
            </div>

            <!-- Bureaux -->
            <div class="kpi-card animate-fade-in stagger-2" routerLink="/admin/bureaux">
              <div class="kpi-icon-wrap bureaux"><i class="bi bi-building"></i></div>
              <div class="kpi-content">
                <span class="kpi-value">{{ stats.totalBureaux }}</span>
                <span class="kpi-label">Bureaux CSU</span>
              </div>
              <div class="kpi-trend up">
                <i class="bi bi-check-circle"></i>
                <span>{{ stats.bureauxActifs }} actifs</span>
              </div>
            </div>

            <!-- Catégories -->
            <div class="kpi-card animate-fade-in stagger-3" routerLink="/admin/categories">
              <div class="kpi-icon-wrap categories"><i class="bi bi-tags-fill"></i></div>
              <div class="kpi-content">
                <span class="kpi-value">{{ stats.totalCategories }}</span>
                <span class="kpi-label">Catégories</span>
              </div>
              <div class="kpi-trend neutral">
                <i class="bi bi-gear"></i>
                <span>Configuration</span>
              </div>
            </div>

            <!-- Patients (total système) -->
            <div class="kpi-card animate-fade-in stagger-4" routerLink="/patients">
              <div class="kpi-icon-wrap patients"><i class="bi bi-person-vcard"></i></div>
              <div class="kpi-content">
                <span class="kpi-value">{{ stats.totalPatients }}</span>
                <span class="kpi-label">Patients (système)</span>
              </div>
              <div class="kpi-trend up">
                <i class="bi bi-person-check"></i>
                <span>{{ stats.totalEnrolements }} enrôlés</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bandeau totaux système -->
        <div class="system-strip mb-4">
          <div class="system-item">
            <i class="bi bi-person-vcard"></i>
            <span class="num">{{ stats.totalPatients }}</span>
            <span class="lbl">Patients</span>
          </div>
          <div class="system-item">
            <i class="bi bi-person-check"></i>
            <span class="num">{{ stats.totalEnrolements }}</span>
            <span class="lbl">Enrôlements</span>
          </div>
          <div class="system-item">
            <i class="bi bi-calendar2-event"></i>
            <span class="num">{{ stats.totalActivites }}</span>
            <span class="lbl">Activités</span>
          </div>
          <div class="system-item">
            <i class="bi bi-clipboard-check"></i>
            <span class="num">{{ stats.totalConstats }}</span>
            <span class="lbl">Constats</span>
          </div>
        </div>

        <div class="row g-4 mb-4">
          <!-- Répartition par rôle -->
          <div class="col-12 col-lg-5">
            <div class="csu-card h-100">
              <div class="csu-card-header">
                <h3 class="csu-card-title">
                  <i class="bi bi-pie-chart text-csu-primary"></i>
                  Répartition par rôle
                </h3>
              </div>
              <div class="d-flex align-items-center gap-3 flex-wrap">
                <div style="position: relative; height: 200px; width: 200px; flex-shrink: 0;">
                  <canvas #rolesChartCanvas></canvas>
                </div>
                <div class="flex-grow-1">
                  @for (r of roleEntries; track r.key) {
                    <div class="role-legend">
                      <span class="dot" [style.background]="r.color"></span>
                      <span class="role-name">{{ roleLabel(r.key) }}</span>
                      <span class="role-count">{{ r.value }}</span>
                    </div>
                  }
                  <div class="role-legend total">
                    <span class="role-name">Total</span>
                    <span class="role-count">{{ stats.totalUtilisateurs }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Derniers utilisateurs -->
          <div class="col-12 col-lg-7">
            <div class="csu-card h-100">
              <div class="csu-card-header">
                <h3 class="csu-card-title">
                  <i class="bi bi-person-badge text-csu-secondary"></i>
                  Derniers utilisateurs
                </h3>
                <a routerLink="/admin/utilisateurs" class="small text-csu-primary fw-semibold text-decoration-none">Tout voir</a>
              </div>
              @if (stats.derniersUtilisateurs.length > 0) {
                <div class="d-flex flex-column gap-2">
                  @for (u of stats.derniersUtilisateurs; track u.id) {
                    <div class="user-row" [routerLink]="['/admin/utilisateurs', u.id, 'modifier']">
                      <div class="avatar">{{ initials(u.prenom, u.nom) }}</div>
                      <div class="flex-grow-1 min-w-0">
                        <div class="fw-semibold text-truncate">{{ u.prenom }} {{ u.nom }}</div>
                        <div class="text-muted small text-truncate">
                          <i class="bi bi-building"></i> {{ u.bureauNom }}
                        </div>
                      </div>
                      <span class="role-badge" [ngClass]="'role-' + (u.role || '').toLowerCase()">{{ roleLabel(u.role) }}</span>
                      <span class="status-pill" [class.off]="!u.actif">
                        {{ u.actif ? 'Actif' : 'Inactif' }}
                      </span>
                    </div>
                  }
                </div>
              } @else {
                <div class="csu-empty-state"><i class="bi bi-people"></i><h3>Aucun utilisateur</h3></div>
              }
            </div>
          </div>
        </div>


        <!-- Présence du jour (pointage) -->
        <div class="csu-card mb-4">
          <div class="csu-card-header">
            <h3 class="csu-card-title">
              <i class="bi bi-clock-history text-csu-primary"></i>
              Présence
            </h3>
            <div class="d-flex align-items-center gap-2">
              <input type="date" class="form-control form-control-sm date-input" [(ngModel)]="selectedDate" (change)="loadPresence()" [max]="maxDate">
              <button class="csu-btn csu-btn-light btn-sm" (click)="toggleHistorique()">
                <i class="bi" [ngClass]="showHistorique ? 'bi-chevron-up' : 'bi-clock-history'"></i>
                {{ showHistorique ? 'Masquer' : 'Historique' }}
              </button>
            </div>
          </div>

          @if (presence) {
            <div class="presence-summary mb-3">
              <div class="pres-item">
                <span class="num">{{ presence.presents }}<span class="den">/{{ presence.totalAgents }}</span></span>
                <span class="lbl">Présents</span>
              </div>
              <div class="pres-item ok">
                <span class="num">{{ presence.enService }}</span>
                <span class="lbl">En service</span>
              </div>
              <div class="pres-item info">
                <span class="num">{{ presence.partis }}</span>
                <span class="lbl">Partis</span>
              </div>
              <div class="pres-item off">
                <span class="num">{{ presence.absents }}</span>
                <span class="lbl">Absents</span>
              </div>
              @if (nbHorsZone > 0) {
                <div class="pres-item alert">
                  <span class="num">{{ nbHorsZone }}</span>
                  <span class="lbl">Hors zone</span>
                </div>
              }
            </div>

            @if (presence.pointages.length > 0) {
              <div class="table-responsive">
                <table class="csu-table">
                  <thead>
                    <tr><th>Agent</th><th class="text-center">Arrivée</th><th class="text-center">Départ</th><th class="text-center">Statut</th><th class="text-center">Localisation</th></tr>
                  </thead>
                  <tbody>
                    @for (p of presence.pointages; track p.id) {
                      <tr [class.row-hors-zone]="p.horsZone === true">
                        <td class="fw-semibold">{{ p.agentNom }}</td>
                        <td class="text-center"><i class="bi bi-box-arrow-in-right text-success"></i> {{ p.heureArrivee || '—' }}</td>
                        <td class="text-center">
                          @if (p.heureDepart) { <i class="bi bi-box-arrow-right text-warning"></i> {{ p.heureDepart }} }
                          @else { <span class="text-muted">—</span> }
                        </td>
                        <td class="text-center">
                          <span class="status-pill" [class.off]="p.statut === 'PARTI'">
                            {{ p.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}
                          </span>
                        </td>
                        <td class="text-center">
                          @if (p.horsZone === true) {
                            <span class="geo-badge ko" [title]="'Distance au bureau : ' + p.distanceMetres + ' m'">
                              <i class="bi bi-geo-alt-fill"></i> Hors zone ({{ p.distanceMetres }} m)
                            </span>
                          } @else if (p.positionVerifiee === false) {
                            <span class="geo-badge unknown"><i class="bi bi-question-circle"></i> Non vérifiée</span>
                          } @else if (p.horsZone === false) {
                            <span class="geo-badge ok" [title]="'Distance au bureau : ' + p.distanceMetres + ' m'">
                              <i class="bi bi-check-circle"></i> Sur site
                            </span>
                          } @else {
                            <span class="text-muted">—</span>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="csu-empty-state"><i class="bi bi-person-x"></i><h3>Aucun pointage aujourd'hui</h3><p>Aucun agent ne s'est encore pointé.</p></div>
            }
          } @else {
            <div class="text-muted small"><i class="bi bi-hourglass-split"></i> Chargement de la présence…</div>
          }

          <!-- Historique des pointages (14 derniers jours) -->
          @if (showHistorique) {
            <div class="hist-wrap mt-3">
              <h4 class="hist-title"><i class="bi bi-calendar3"></i> Historique des pointages (14 derniers jours)</h4>
              @if (historique.length > 0) {
                <div class="table-responsive">
                  <table class="csu-table">
                    <thead><tr><th>Date</th><th>Agent</th><th class="text-center">Arrivée</th><th class="text-center">Départ</th><th class="text-center">Statut</th></tr></thead>
                    <tbody>
                      @for (h of historique; track h.id) {
                        <tr>
                          <td class="fw-semibold">{{ h.date | date:'dd/MM/yyyy' }}</td>
                          <td>{{ h.agentNom }}</td>
                          <td class="text-center">{{ h.heureArrivee || '—' }}</td>
                          <td class="text-center">{{ h.heureDepart || '—' }}</td>
                          <td class="text-center">
                            <span class="status-pill" [class.off]="h.statut === 'PARTI'">{{ h.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}</span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="text-muted small">Aucun pointage sur la période.</div>
              }
            </div>
          }
        </div>

        <!-- Demandes de permission -->
        <div class="csu-card mb-4" id="permissions-section" [class.flash]="flashPermissions">
          <div class="csu-card-header">
            <h3 class="csu-card-title">
              <i class="bi bi-calendar2-week text-csu-primary"></i>
              Demandes de permission
              @if (nbEnAttente > 0) { <span class="pending-badge">{{ nbEnAttente }} en attente</span> }
            </h3>
            <div class="filtre-group">
              <button class="filtre-btn" [class.active]="filtreStatut === 'EN_ATTENTE'" (click)="changerFiltre('EN_ATTENTE')">En attente</button>
              <button class="filtre-btn" [class.active]="filtreStatut === 'APPROUVEE'" (click)="changerFiltre('APPROUVEE')">Approuvées</button>
              <button class="filtre-btn" [class.active]="filtreStatut === 'REFUSEE'" (click)="changerFiltre('REFUSEE')">Refusées</button>
              <button class="filtre-btn" [class.active]="filtreStatut === ''" (click)="changerFiltre('')">Toutes</button>
            </div>
          </div>

          @if (demandes.length > 0) {
            <div class="table-responsive">
              <table class="csu-table">
                <thead>
                  <tr><th>Agent</th><th>Type</th><th>Période</th><th>Motif</th><th class="text-center">Statut</th><th class="text-center">Actions</th></tr>
                </thead>
                <tbody>
                  @for (d of demandes; track d.id) {
                    <tr>
                      <td class="fw-semibold">{{ d.agentNom }}</td>
                      <td><span class="type-tag">{{ typePermLabel(d.type) }}</span></td>
                      <td class="text-muted small">{{ d.dateDebut | date:'dd/MM/yy' }} → {{ d.dateFin | date:'dd/MM/yy' }}</td>
                      <td class="text-muted small text-truncate" style="max-width: 220px;" [title]="d.motif">{{ d.motif || '—' }}</td>
                      <td class="text-center">
                        <span class="statut-pill" [ngClass]="'st-' + d.statut.toLowerCase()">{{ statutPermLabel(d.statut) }}</span>
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
          } @else {
            <div class="csu-empty-state"><i class="bi bi-calendar2-check"></i><h3>Aucune demande</h3><p>Aucune demande {{ filtreStatut === 'EN_ATTENTE' ? 'en attente' : '' }} pour le moment.</p></div>
          }
        </div>

        <!-- Bureaux & agents -->
        <div class="csu-card">
          <div class="csu-card-header">
            <h3 class="csu-card-title">
              <i class="bi bi-bar-chart-line text-csu-primary"></i>
              Bureaux & activité ({{ stats.bureauxStats.length }})
            </h3>
            <a routerLink="/admin/bureaux" class="small text-csu-primary fw-semibold text-decoration-none">Gérer les bureaux</a>
          </div>
          <p class="text-muted small mb-3"><i class="bi bi-info-circle"></i> Cliquez sur un bureau pour voir le détail complet (agents, patients, activités, enrôlements, constats).</p>
          @if (stats.bureauxStats.length > 0) {
            <div class="table-responsive">
              <table class="csu-table">
                <thead>
                  <tr>
                    <th>Bureau</th>
                    <th>Région</th>
                    <th>Agents</th>
                    <th class="text-center">Patients</th>
                    <th class="text-center">Enrôlements</th>
                    <th class="text-center">Activités</th>
                    <th class="text-center">Constats</th>
                    <th class="text-center">Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (b of stats.bureauxStats; track b.id) {
                    <tr class="clickable-row" [routerLink]="['/admin/bureaux', b.id, 'details']">
                      <td class="fw-semibold">
                        {{ b.nom }}
                        <div class="text-muted small fw-normal">{{ b.type || 'Bureau CSU' }}</div>
                      </td>
                      <td class="text-muted">{{ b.region || '—' }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-1">
                          <span class="badge-count">{{ b.agents }}</span>
                          @if (b.agentsNoms.length > 0) {
                            <span class="agent-names text-truncate" [title]="b.agentsNoms.join(', ')">{{ b.agentsNoms.join(', ') }}</span>
                          } @else {
                            <span class="text-muted small">Aucun agent</span>
                          }
                        </div>
                      </td>
                      <td class="text-center">
                        <div class="load-cell">
                          <span>{{ b.patients }}</span>
                          <div class="load-bar"><div class="load-fill" [style.width.%]="barWidth(b.patients)"></div></div>
                        </div>
                      </td>
                      <td class="text-center">{{ b.enrolements }}</td>
                      <td class="text-center">{{ b.activites }}</td>
                      <td class="text-center">{{ b.constats }}</td>
                      <td class="text-center">
                        <span class="status-pill" [class.off]="!b.actif">{{ b.actif ? 'Actif' : 'Inactif' }}</span>
                      </td>
                      <td class="text-center"><i class="bi bi-chevron-right text-muted"></i></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="csu-empty-state"><i class="bi bi-building"></i><h3>Aucun bureau configuré</h3></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .kpi-grid-container { width: 100%; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 1rem; }
    .kpi-grid { display: flex; flex-wrap: nowrap; gap: 1rem; min-width: min-content; }
    .kpi-card {
      flex: 1; min-width: 200px; background: #fff; border-radius: 16px; padding: 1rem;
      display: flex; flex-direction: column; gap: 0.75rem;
      border: 1px solid rgba(0,0,0,0.04); box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1); cursor: pointer; position: relative; overflow: hidden;
    }
    .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
    .kpi-icon-wrap {
      width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center;
      justify-content: center; font-size: 1.25rem; transition: transform 0.3s ease;
    }
    .kpi-card:hover .kpi-icon-wrap { transform: scale(1.1); }
    .kpi-icon-wrap.users { background: rgba(21,101,192,0.08); color: #1565C0; }
    .kpi-icon-wrap.bureaux { background: rgba(0,135,90,0.08); color: #00875A; }
    .kpi-icon-wrap.categories { background: rgba(123,31,162,0.08); color: #7B1FA2; }
    .kpi-icon-wrap.patients { background: rgba(245,124,0,0.08); color: #F57C00; }
    .kpi-content { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .kpi-value { font-family: 'Outfit', sans-serif; font-size: clamp(1.2rem,2vw,1.5rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; color: var(--csu-text); }
    .kpi-label { font-size: 0.8rem; color: var(--csu-text-muted); font-weight: 600; }
    .kpi-trend { display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 600; padding: 4px 8px; border-radius: 8px; width: fit-content; }
    .kpi-trend.up { color: #2E7D32; background: rgba(67,160,71,0.08); }
    .kpi-trend.neutral { color: #5B6B7B; background: rgba(91,107,123,0.08); }
    .kpi-trend i { font-size: 0.6rem; }

    /* System strip */
    .system-strip { display: flex; flex-wrap: wrap; gap: 1rem; }
    .system-item {
      flex: 1; min-width: 130px; background: #fff; border: 1px solid rgba(0,0,0,0.04);
      border-radius: 12px; padding: 0.85rem 1rem; display: flex; align-items: center; gap: 0.6rem;
    }
    .system-item i { font-size: 1.1rem; color: var(--csu-primary); }
    .system-item .num { font-weight: 800; font-size: 1.1rem; font-family: 'Outfit', sans-serif; }
    .system-item .lbl { font-size: 0.8rem; color: var(--csu-text-muted); }

    /* Role legend */
    .role-legend { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--csu-border-light); }
    .role-legend:last-child { border-bottom: none; }
    .role-legend .dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
    .role-legend .role-name { flex-grow: 1; font-size: 0.85rem; font-weight: 600; }
    .role-legend .role-count { font-weight: 800; font-family: 'Outfit', sans-serif; }
    .role-legend.total { margin-top: 4px; border-top: 2px solid var(--csu-border-light); }

    /* User rows */
    .user-row { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 10px; cursor: pointer; transition: background 0.2s ease; }
    .user-row:hover { background: var(--csu-border-light); }
    .avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--csu-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
    .role-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
    .role-badge.role-admin { background: rgba(229,57,53,0.1); color: #C62828; }
    .role-badge.role-superviseur { background: rgba(245,124,0,0.1); color: #E65100; }
    .role-badge.role-agent { background: rgba(21,101,192,0.1); color: #1565C0; }
    .status-pill { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(67,160,71,0.12); color: #2E7D32; white-space: nowrap; }
    .status-pill.off { background: rgba(0,0,0,0.06); color: #6B7280; }

    /* Load bar */
    .load-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .load-bar { width: 70px; height: 5px; border-radius: 4px; background: rgba(0,0,0,0.06); overflow: hidden; }
    .load-fill { height: 100%; background: var(--csu-primary); border-radius: 4px; }

    .date-input { width: auto; }
    .btn-sm { padding: 0.3rem 0.6rem; font-size: 0.8rem; }
    .hist-wrap { border-top: 1px dashed var(--csu-border-light); padding-top: 1rem; }
    .hist-title { font-size: 0.9rem; font-weight: 700; color: var(--csu-text-muted); margin-bottom: 0.75rem; }

    .flash { animation: flash-card 1.6s ease; }
    @keyframes flash-card {
      0%, 100% { box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
      20%, 60% { box-shadow: 0 0 0 3px rgba(245,124,0,0.45); }
    }
    .pending-badge { background: #F57C00; color: #fff; font-size: 0.68rem; font-weight: 700; padding: 2px 9px; border-radius: 20px; margin-left: 8px; }
    .filtre-group { display: flex; gap: 4px; flex-wrap: wrap; }
    .filtre-btn { background: transparent; border: 1px solid var(--csu-border-light); color: var(--csu-text-muted); font-size: 0.76rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; cursor: pointer; transition: all 0.15s ease; }
    .filtre-btn:hover { border-color: var(--csu-primary); color: var(--csu-primary); }
    .filtre-btn.active { background: var(--csu-primary); border-color: var(--csu-primary); color: #fff; }
    .type-tag { font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(21,101,192,0.1); color: #1565C0; }
    .statut-pill { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
    .statut-pill.st-en_attente { background: rgba(245,124,0,0.12); color: #E65100; }
    .statut-pill.st-approuvee { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .statut-pill.st-refusee { background: rgba(229,57,53,0.1); color: #C62828; }
    .act-btn { width: 30px; height: 30px; border-radius: 8px; border: none; cursor: pointer; margin: 0 2px; font-size: 0.9rem; }
    .act-btn.ok { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .act-btn.ok:hover { background: #2E7D32; color: #fff; }
    .act-btn.no { background: rgba(229,57,53,0.1); color: #C62828; }
    .act-btn.no:hover { background: #C62828; color: #fff; }

    .presence-summary { display: flex; flex-wrap: wrap; gap: 1rem; }
    .pres-item { flex: 1; min-width: 110px; background: var(--csu-bg); border: 1px solid var(--csu-border-light); border-radius: 12px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 2px; }
    .pres-item .num { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.5rem; line-height: 1; }
    .pres-item .num .den { font-size: 0.9rem; color: var(--csu-text-muted); font-weight: 600; }
    .pres-item .lbl { font-size: 0.78rem; color: var(--csu-text-muted); font-weight: 600; }
    .pres-item.ok { background: rgba(2,136,209,0.06); border-color: rgba(2,136,209,0.2); }
    .pres-item.ok .num { color: #0277BD; }
    .pres-item.info { background: rgba(245,124,0,0.06); border-color: rgba(245,124,0,0.2); }
    .pres-item.info .num { color: #E65100; }
    .pres-item.off { background: rgba(0,0,0,0.03); }
    .pres-item.off .num { color: #6B7280; }
    .pres-item.alert { background: rgba(229,57,53,0.07); border-color: rgba(229,57,53,0.3); }
    .pres-item.alert .num { color: #C62828; }

    .geo-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
    .geo-badge.ok { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .geo-badge.ko { background: rgba(229,57,53,0.12); color: #C62828; }
    .geo-badge.unknown { background: rgba(0,0,0,0.06); color: #6B7280; }
    .row-hors-zone { background: rgba(229,57,53,0.04); }

    .clickable-row { cursor: pointer; transition: background 0.15s ease; }
    .clickable-row:hover { background: var(--csu-border-light); }
    .badge-count { background: var(--csu-primary); color: #fff; font-size: 0.7rem; font-weight: 700; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; }
    .agent-names { font-size: 0.78rem; color: var(--csu-text-muted); max-width: 220px; display: inline-block; }

    .spin { display: inline-block; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 992px) { .csu-page-subtitle { display: none; } }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private adminDashboardService = inject(AdminDashboardService);
  private pointageService = inject(PointageService);
  private permissionService = inject(PermissionService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  flashPermissions = false;
  private focusHandler = () => this.focusPermissions();

  @ViewChild('rolesChartCanvas') rolesChartCanvas?: ElementRef<HTMLCanvasElement>;

  stats?: AdminDashboardStats;
  presence?: PointagesJour;
  selectedDate = new Date().toISOString().substring(0, 10);
  maxDate = new Date().toISOString().substring(0, 10);

  historique: PointageLigne[] = [];
  showHistorique = false;

  demandes: DemandePermission[] = [];
  filtreStatut: '' | 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE' = 'EN_ATTENTE';
  nbEnAttente = 0;

  loading = true;
  error = false;
  chart: any;

  roleEntries: Array<{ key: string; value: number; color: string }> = [];
  private roleColors: { [k: string]: string } = {
    ADMIN: '#E53935',
    SUPERVISEUR: '#FB8C00',
    AGENT: '#1E88E5'
  };

  ngOnInit(): void {
    Chart.register(...registerables);
    this.loadStats();
    this.loadPresence();
    this.loadDemandes();

    // Focus déclenché depuis la cloche de notification (dashboard déjà affiché)
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('csu:focus-permissions', this.focusHandler);
    }
    // Focus au premier chargement via ?focus=permissions
    if (this.route.snapshot.queryParamMap.get('focus') === 'permissions') {
      this.focusPermissions();
    }
  }

  ngAfterViewInit(): void {
    if (this.stats) this.renderRolesChart();
  }

  ngOnDestroy(): void {
    if (this.chart) this.chart.destroy();
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('csu:focus-permissions', this.focusHandler);
    }
  }

  /** Affiche les demandes en attente et défile jusqu'au tableau. */
  focusPermissions(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.filtreStatut = 'EN_ATTENTE';
    this.loadDemandes();
    setTimeout(() => {
      const el = document.getElementById('permissions-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.flashPermissions = false;
        setTimeout(() => (this.flashPermissions = true), 50);
        setTimeout(() => (this.flashPermissions = false), 1800);
      }
    }, 300);
  }

  reload(): void {
    this.loadStats();
    this.loadPresence();
    this.loadDemandes();
  }

  loadPresence(): void {
    this.pointageService.getPointagesJour(this.selectedDate).subscribe({
      next: (p) => (this.presence = p),
      error: (err) => console.error('Erreur chargement présence:', err)
    });
  }

  toggleHistorique(): void {
    this.showHistorique = !this.showHistorique;
    if (this.showHistorique && this.historique.length === 0) {
      this.pointageService.getHistorique().subscribe({
        next: (h) => (this.historique = h),
        error: (err) => console.error('Erreur historique pointages:', err)
      });
    }
  }

  /* ── Demandes de permission ── */
  loadDemandes(): void {
    this.permissionService.toutes(this.filtreStatut || undefined).subscribe({
      next: (d) => (this.demandes = d),
      error: (err) => console.error('Erreur chargement demandes:', err)
    });
    this.permissionService.countAttente().subscribe({
      next: (r) => (this.nbEnAttente = r.enAttente),
      error: () => {}
    });
  }

  changerFiltre(statut: '' | 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE'): void {
    this.filtreStatut = statut;
    this.loadDemandes();
  }

  approuver(d: DemandePermission): void {
    this.traiterDemande(d, true);
  }

  refuser(d: DemandePermission): void {
    this.traiterDemande(d, false);
  }

  private traiterDemande(d: DemandePermission, approuver: boolean): void {
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
          this.loadDemandes();
          if (isPlatformBrowser(this.platformId)) {
            window.dispatchEvent(new CustomEvent('csu:permissions-updated'));
          }
        },
        error: (err) => Swal.fire({ icon: 'error', title: 'Erreur', text: err?.error?.message || 'Action impossible.' })
      });
    });
  }

  typePermLabel(t: string): string {
    const map: { [k: string]: string } = { CONGE: 'Congé', ABSENCE: 'Absence', RETARD: 'Retard', SORTIE: 'Sortie', AUTRE: 'Autre' };
    return map[t] || t;
  }

  statutPermLabel(s: string): string {
    const map: { [k: string]: string } = { EN_ATTENTE: 'En attente', APPROUVEE: 'Approuvée', REFUSEE: 'Refusée' };
    return map[s] || s;
  }

  private loadStats(): void {
    this.loading = true;
    this.error = false;
    this.adminDashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.roleEntries = Object.keys(data.repartitionRoles || {}).map(key => ({
          key,
          value: data.repartitionRoles[key],
          color: this.roleColors[key] || '#9CA3AF'
        }));
        this.loading = false;
        // Le canvas est rendu après le @if : laisser Angular peindre puis dessiner
        setTimeout(() => this.renderRolesChart(), 0);
      },
      error: (err) => {
        console.error('Erreur chargement dashboard admin:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  roleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'Administrateur';
      case 'SUPERVISEUR': return 'Superviseur';
      case 'AGENT': return 'Agent';
      default: return role || '—';
    }
  }

  initials(prenom: string, nom: string): string {
    return ((prenom?.[0] || '') + (nom?.[0] || '')).toUpperCase() || '?';
  }

  barWidth(value: number): number {
    const max = Math.max(1, ...(this.stats?.bureauxStats || []).map(b => b.patients));
    return Math.round((value / max) * 100);
  }

  get nbHorsZone(): number {
    return (this.presence?.pointages || []).filter(p => p.horsZone === true).length;
  }

  private renderRolesChart(): void {
    if (!isPlatformBrowser(this.platformId) || !this.rolesChartCanvas || !this.stats) return;
    const ctx = this.rolesChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.roleEntries.map(r => this.roleLabel(r.key)),
        datasets: [{
          data: this.roleEntries.map(r => r.value),
          backgroundColor: this.roleEntries.map(r => r.color),
          borderWidth: 2,
          borderColor: '#fff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(26,26,46,0.9)',
            padding: 12,
            cornerRadius: 10
          }
        }
      }
    });
  }
}
