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
import { AuthService } from '../../../core/services/auth.service';
import { CardListItemComponent } from '../../../shared/ui';
import { LiveActivityFeedComponent } from './live-activity-feed.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CardListItemComponent, LiveActivityFeedComponent],
  template: `
    <div class="dash animate-fade-in">

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

        <!-- ════════ HERO ════════ -->
        <section class="hero">
          <div class="hero-glow"></div>
          <div class="hero-main">
            <div class="hero-greet">
              <span class="hero-chip"><span class="dot-live"></span> Espace administrateur</span>
              <h1>{{ greeting }}, {{ adminPrenom }}</h1>
              <p class="hero-date">{{ now | date:'EEEE d MMMM y' }}</p>
              <p class="hero-summary">{{ resumeIntelligent }}</p>
            </div>

            <div class="hero-actions">
              <a routerLink="/admin/utilisateurs/nouveau" class="hero-btn primary"><i class="bi bi-person-plus"></i> Nouvel utilisateur</a>
              <a routerLink="/statistiques" class="hero-btn ghost"><i class="bi bi-graph-up-arrow"></i> Statistiques</a>
            </div>
          </div>

          <div class="hero-ring">
            <div class="ring" [style.background]="presenceRing">
              <div class="ring-hole">
                <span class="ring-val">{{ tauxPresence }}%</span>
                <span class="ring-lbl">Présence</span>
              </div>
            </div>
            <div class="ring-meta">
              <div><b>{{ presence?.presents || 0 }}</b><span>présents</span></div>
              <div><b>{{ presence?.absents || 0 }}</b><span>absents</span></div>
            </div>
          </div>
        </section>

        <!-- ════════ INSIGHTS INTELLIGENTS ════════ -->
        <section class="insights">
          <article class="insight" [class.muted]="nbEnAttente === 0" (click)="focusPermissions()">
            <div class="ic warn"><i class="bi bi-hourglass-split"></i></div>
            <div class="ix">
              <span class="iv">{{ nbEnAttente }}</span>
              <span class="il">Demandes en attente</span>
            </div>
            <span class="ihint">{{ nbEnAttente > 0 ? 'À traiter' : 'À jour' }} <i class="bi bi-arrow-right"></i></span>
          </article>

          <article class="insight" [class.muted]="nbHorsZone === 0" routerLink="/pointage">
            <div class="ic" [class.danger]="nbHorsZone > 0" [class.ok]="nbHorsZone === 0"><i class="bi bi-geo-alt-fill"></i></div>
            <div class="ix">
              <span class="iv">{{ nbHorsZone }}</span>
              <span class="il">Pointages hors zone</span>
            </div>
            <span class="ihint">{{ nbHorsZone > 0 ? 'Anomalies' : 'Conforme' }} <i class="bi bi-arrow-right"></i></span>
          </article>

          <article class="insight">
            <div class="ic info"><i class="bi bi-people-fill"></i></div>
            <div class="ix">
              <span class="iv">{{ presence?.enService || 0 }}</span>
              <span class="il">Agents en service</span>
            </div>
            <span class="ihint">sur {{ presence?.totalAgents || 0 }}</span>
          </article>

          <article class="insight" routerLink="/admin/bureaux">
            <div class="ic success"><i class="bi bi-building-check"></i></div>
            <div class="ix">
              <span class="iv">{{ stats.bureauxActifs }}<small>/{{ stats.totalBureaux }}</small></span>
              <span class="il">Bureaux actifs</span>
            </div>
            <span class="ihint">Réseau <i class="bi bi-arrow-right"></i></span>
          </article>
        </section>

        <!-- ════════ KPI BENTO ════════ -->
        <section class="bento">
          <div class="kpi accent-blue" routerLink="/admin/utilisateurs">
            <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-people-fill"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
            <div class="kpi-val">{{ stats.totalUtilisateurs }}</div>
            <div class="kpi-lbl">Utilisateurs</div>
            <div class="kpi-bar"><span [style.width.%]="pct(stats.utilisateursActifs, stats.totalUtilisateurs)"></span></div>
            <div class="kpi-foot">{{ stats.utilisateursActifs }} actifs · {{ stats.utilisateursInactifs }} inactifs</div>
          </div>

          <div class="kpi accent-green" routerLink="/patients">
            <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-person-vcard"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
            <div class="kpi-val">{{ stats.totalPatients }}</div>
            <div class="kpi-lbl">Patients</div>
            <div class="kpi-bar"><span [style.width.%]="pct(stats.totalEnrolements, stats.totalPatients)"></span></div>
            <div class="kpi-foot">{{ stats.totalEnrolements }} enrôlés</div>
          </div>

          <div class="kpi accent-purple" routerLink="/admin/categories">
            <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-tags-fill"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
            <div class="kpi-val">{{ stats.totalCategories }}</div>
            <div class="kpi-lbl">Catégories</div>
            <div class="kpi-foot subtle">Configuration des régimes</div>
          </div>

          <div class="kpi accent-orange" routerLink="/activites">
            <div class="kpi-top"><div class="kpi-ic"><i class="bi bi-calendar2-event"></i></div><i class="bi bi-arrow-up-right kpi-go"></i></div>
            <div class="kpi-val">{{ stats.totalActivites }}</div>
            <div class="kpi-lbl">Activités</div>
            <div class="kpi-foot subtle">{{ stats.totalConstats }} constats enregistrés</div>
          </div>
        </section>

        <!-- ════════ ACTIVITÉ EN DIRECT (SSE) ════════ -->
        <div class="panel">
          <app-live-activity-feed />
        </div>

        <!-- ════════ RÉPARTITION + DERNIERS UTILISATEURS ════════ -->
        <div class="grid-2">
          <div class="panel">
            <div class="panel-head">
              <h3><i class="bi bi-pie-chart-fill"></i> Répartition par rôle</h3>
            </div>
            <div class="roles-wrap">
              <div class="roles-chart"><canvas #rolesChartCanvas></canvas>
                <div class="roles-center"><b>{{ stats.totalUtilisateurs }}</b><span>comptes</span></div>
              </div>
              <div class="roles-legend">
                @for (r of roleEntries; track r.key) {
                  <div class="rl">
                    <span class="rl-dot" [style.background]="r.color"></span>
                    <span class="rl-name">{{ roleLabel(r.key) }}</span>
                    <span class="rl-bar"><i [style.width.%]="pct(r.value, stats.totalUtilisateurs)" [style.background]="r.color"></i></span>
                    <span class="rl-val">{{ r.value }}</span>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <h3><i class="bi bi-person-badge"></i> Derniers utilisateurs</h3>
              <a routerLink="/admin/utilisateurs" class="link">Tout voir</a>
            </div>
            @if (stats.derniersUtilisateurs.length > 0) {
              <div class="users">
                @for (u of stats.derniersUtilisateurs; track u.id) {
                  <div class="urow" [routerLink]="['/admin/utilisateurs', u.id, 'modifier']">
                    <div class="avatar" [ngClass]="'av-' + (u.role || '').toLowerCase()">{{ initials(u.prenom, u.nom) }}</div>
                    <div class="flex-grow-1 min-w-0">
                      <div class="fw-semibold text-truncate">{{ u.prenom }} {{ u.nom }}</div>
                      <div class="text-muted small text-truncate"><i class="bi bi-building"></i> {{ u.bureauNom }}</div>
                    </div>
                    <span class="role-badge" [ngClass]="'role-' + (u.role || '').toLowerCase()">{{ roleLabel(u.role) }}</span>
                    <span class="status-pill" [class.off]="!u.actif">{{ u.actif ? 'Actif' : 'Inactif' }}</span>
                  </div>
                }
              </div>
            } @else {
              <div class="csu-empty-state"><i class="bi bi-people"></i><h3>Aucun utilisateur</h3></div>
            }
          </div>
        </div>

        <!-- ════════ PRÉSENCE DU JOUR ════════ -->
        <div class="panel">
          <div class="panel-head">
            <h3><i class="bi bi-clock-history"></i> Présence</h3>
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
              <div class="pres-item"><span class="num">{{ presence.presents }}<span class="den">/{{ presence.totalAgents }}</span></span><span class="lbl">Présents</span></div>
              <div class="pres-item ok"><span class="num">{{ presence.enService }}</span><span class="lbl">En service</span></div>
              <div class="pres-item info"><span class="num">{{ presence.partis }}</span><span class="lbl">Partis</span></div>
              <div class="pres-item off"><span class="num">{{ presence.absents }}</span><span class="lbl">Absents</span></div>
              @if (nbHorsZone > 0) {
                <div class="pres-item alert"><span class="num">{{ nbHorsZone }}</span><span class="lbl">Hors zone</span></div>
              }
            </div>

            @if (presence.pointages.length > 0) {
              <div class="table-responsive">
                <table class="csu-table">
                  <thead><tr><th>Agent</th><th class="text-center">Arrivée</th><th class="text-center">Départ</th><th class="text-center">Statut</th><th class="text-center">Localisation</th></tr></thead>
                  <tbody>
                    @for (p of presence.pointages; track p.id) {
                      <tr [class.row-hors-zone]="p.horsZone === true">
                        <td class="fw-semibold">{{ p.agentNom }}</td>
                        <td class="text-center"><i class="bi bi-box-arrow-in-right text-success"></i> {{ p.heureArrivee || '—' }}</td>
                        <td class="text-center">
                          @if (p.heureDepart) { <i class="bi bi-box-arrow-right text-warning"></i> {{ p.heureDepart }} }
                          @else { <span class="text-muted">—</span> }
                        </td>
                        <td class="text-center"><span class="status-pill" [class.off]="p.statut === 'PARTI'">{{ p.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}</span></td>
                        <td class="text-center">
                          @if (p.horsZone === true) {
                            <span class="geo-badge ko" [title]="'Distance au bureau : ' + p.distanceMetres + ' m'"><i class="bi bi-geo-alt-fill"></i> Hors zone ({{ p.distanceMetres }} m)</span>
                          } @else if (p.positionVerifiee === false) {
                            <span class="geo-badge unknown"><i class="bi bi-question-circle"></i> Non vérifiée</span>
                          } @else if (p.horsZone === false) {
                            <span class="geo-badge ok" [title]="'Distance au bureau : ' + p.distanceMetres + ' m'"><i class="bi bi-check-circle"></i> Sur site</span>
                          } @else { <span class="text-muted">—</span> }
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
                          <td class="text-center"><span class="status-pill" [class.off]="h.statut === 'PARTI'">{{ h.statut === 'EN_SERVICE' ? 'En service' : 'Parti' }}</span></td>
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

        <!-- ════════ DEMANDES DE PERMISSION ════════ -->
        <div class="panel" id="permissions-section" [class.flash]="flashPermissions">
          <div class="panel-head">
            <h3>
              <i class="bi bi-calendar2-week"></i> Demandes de permission
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
            <div class="table-responsive d-none d-lg-block">
              <table class="csu-table">
                <thead><tr><th>Agent</th><th>Type</th><th>Période</th><th>Motif</th><th class="text-center">Statut</th><th class="text-center">Actions</th></tr></thead>
                <tbody>
                  @for (d of demandes; track d.id) {
                    <tr>
                      <td class="fw-semibold">{{ d.agentNom }}</td>
                      <td><span class="type-tag">{{ typePermLabel(d.type) }}</span></td>
                      <td class="text-muted small">{{ d.dateDebut | date:'dd/MM/yy' }} → {{ d.dateFin | date:'dd/MM/yy' }}</td>
                      <td class="text-muted small text-truncate" style="max-width: 220px;" [title]="d.motif">{{ d.motif || '—' }}</td>
                      <td class="text-center"><span class="statut-pill" [ngClass]="'st-' + d.statut.toLowerCase()">{{ statutPermLabel(d.statut) }}</span></td>
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

            <div class="csu-list d-lg-none mb-0">
              @for (d of demandes; track d.id) {
                <csu-list-card>
                  <div class="csu-list-card-head">
                    <div class="csu-list-card-lead"><i class="bi bi-person"></i></div>
                    <div class="csu-list-card-body">
                      <div class="csu-list-card-title">{{ d.agentNom }}</div>
                      <div class="csu-list-card-sub">{{ d.dateDebut | date:'dd/MM/yy' }} → {{ d.dateFin | date:'dd/MM/yy' }}</div>
                    </div>
                    <span class="statut-pill" [ngClass]="'st-' + d.statut.toLowerCase()">{{ statutPermLabel(d.statut) }}</span>
                  </div>
                  <div class="csu-list-card-meta"><span class="type-tag">{{ typePermLabel(d.type) }}</span></div>
                  @if (d.motif) {
                    <p class="text-truncate-2" style="font-size:0.82rem;color:var(--csu-text-secondary);margin:0.6rem 0 0;">{{ d.motif }}</p>
                  }
                  @if (d.statut === 'EN_ATTENTE') {
                    <div class="csu-list-card-actions">
                      <button class="csu-btn csu-btn-light text-success" (click)="approuver(d)"><i class="bi bi-check-lg"></i> Approuver</button>
                      <button class="csu-btn csu-btn-light text-csu-danger" (click)="refuser(d)"><i class="bi bi-x-lg"></i> Refuser</button>
                    </div>
                  } @else {
                    <div class="csu-list-card-actions"><span class="text-muted small" style="padding:0.5rem 0;">Traitée par {{ d.traiteeParNom || '—' }}</span></div>
                  }
                </csu-list-card>
              }
            </div>
          } @else {
            <div class="csu-empty-state"><i class="bi bi-calendar2-check"></i><h3>Aucune demande</h3><p>Aucune demande {{ filtreStatut === 'EN_ATTENTE' ? 'en attente' : '' }} pour le moment.</p></div>
          }
        </div>

        <!-- ════════ BUREAUX & ACTIVITÉ ════════ -->
        <div class="panel">
          <div class="panel-head">
            <h3><i class="bi bi-bar-chart-line"></i> Bureaux & activité ({{ stats.bureauxStats.length }})</h3>
            <a routerLink="/admin/bureaux" class="link">Gérer les bureaux</a>
          </div>
          <p class="text-muted small mb-3"><i class="bi bi-info-circle"></i> Cliquez sur un bureau pour voir le détail complet.</p>
          @if (stats.bureauxStats.length > 0) {
            <div class="table-responsive d-none d-lg-block">
              <table class="csu-table">
                <thead>
                  <tr><th>Bureau</th><th>Région</th><th>Agents</th><th class="text-center">Patients</th><th class="text-center">Enrôlements</th><th class="text-center">Activités</th><th class="text-center">Constats</th><th class="text-center">Statut</th><th></th></tr>
                </thead>
                <tbody>
                  @for (b of stats.bureauxStats; track b.id) {
                    <tr class="clickable-row" [routerLink]="['/admin/bureaux', b.id, 'details']">
                      <td class="fw-semibold">{{ b.nom }}<div class="text-muted small fw-normal">{{ b.type || 'Bureau CSU' }}</div></td>
                      <td class="text-muted">{{ b.region || '—' }}</td>
                      <td>
                        <div class="d-flex align-items-center gap-1">
                          <span class="badge-count">{{ b.agents }}</span>
                          @if (b.agentsNoms.length > 0) {
                            <span class="agent-names text-truncate" [title]="b.agentsNoms.join(', ')">{{ b.agentsNoms.join(', ') }}</span>
                          } @else { <span class="text-muted small">Aucun agent</span> }
                        </div>
                      </td>
                      <td class="text-center">
                        <div class="load-cell"><span>{{ b.patients }}</span><div class="load-bar"><div class="load-fill" [style.width.%]="barWidth(b.patients)"></div></div></div>
                      </td>
                      <td class="text-center">{{ b.enrolements }}</td>
                      <td class="text-center">{{ b.activites }}</td>
                      <td class="text-center">{{ b.constats }}</td>
                      <td class="text-center"><span class="status-pill" [class.off]="!b.actif">{{ b.actif ? 'Actif' : 'Inactif' }}</span></td>
                      <td class="text-center"><i class="bi bi-chevron-right text-muted"></i></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="csu-list d-lg-none mb-0">
              @for (b of stats.bureauxStats; track b.id) {
                <csu-list-card>
                  <div class="csu-list-card-head">
                    <div class="csu-list-card-lead"><i class="bi bi-building"></i></div>
                    <div class="csu-list-card-body">
                      <div class="csu-list-card-title">{{ b.nom }}</div>
                      <div class="csu-list-card-sub">{{ b.type || 'Bureau CSU' }} · {{ b.region || '—' }}</div>
                    </div>
                    <span class="status-pill" [class.off]="!b.actif">{{ b.actif ? 'Actif' : 'Inactif' }}</span>
                  </div>
                  <div class="csu-list-card-meta">
                    <div class="meta"><span class="meta-label">Agents</span><span class="meta-value">{{ b.agents }}</span></div>
                    <div class="meta"><span class="meta-label">Patients</span><span class="meta-value">{{ b.patients }}</span></div>
                    <div class="meta"><span class="meta-label">Enrôl.</span><span class="meta-value">{{ b.enrolements }}</span></div>
                    <div class="meta"><span class="meta-label">Activités</span><span class="meta-value">{{ b.activites }}</span></div>
                    <div class="meta"><span class="meta-label">Constats</span><span class="meta-value">{{ b.constats }}</span></div>
                  </div>
                  <div class="csu-list-card-actions">
                    <a [routerLink]="['/admin/bureaux', b.id, 'details']" class="csu-btn csu-btn-light"><i class="bi bi-eye"></i> Voir le détail</a>
                  </div>
                </csu-list-card>
              }
            </div>
          } @else {
            <div class="csu-empty-state"><i class="bi bi-building"></i><h3>Aucun bureau configuré</h3></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .dash { display: flex; flex-direction: column; gap: 1.25rem; padding-bottom: 1rem; }

    /* ════════ HERO ════════ */
    .hero {
      position: relative; overflow: hidden; border-radius: 24px; padding: 1.75rem 2rem;
      background: linear-gradient(135deg, #016b48 0%, #00875A 42%, #00b074 78%, #12a7b8 130%);
      color: #fff; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap;
      box-shadow: 0 18px 40px -18px rgba(0,135,90,0.55);
    }
    .hero-glow { position: absolute; inset: 0; background:
      radial-gradient(620px 320px at 88% -30%, rgba(255,255,255,0.22), transparent 60%),
      radial-gradient(420px 260px at 8% 130%, rgba(255,255,255,0.12), transparent 60%);
      pointer-events: none; }
    .hero-main { position: relative; z-index: 1; flex: 1 1 320px; }
    .hero-chip { display: inline-flex; align-items: center; gap: 7px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase; background: rgba(255,255,255,0.16); padding: 5px 12px; border-radius: 30px; backdrop-filter: blur(6px); }
    .dot-live { width: 7px; height: 7px; border-radius: 50%; background: #B9F6CA; box-shadow: 0 0 0 0 rgba(185,246,202,0.8); animation: pulse 1.8s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(185,246,202,0.7); } 70% { box-shadow: 0 0 0 8px rgba(185,246,202,0); } 100% { box-shadow: 0 0 0 0 rgba(185,246,202,0); } }
    .hero h1 { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: clamp(1.5rem, 3vw, 2.1rem); margin: 0.7rem 0 0.2rem; letter-spacing: -0.02em; }
    .hero-date { text-transform: capitalize; opacity: 0.9; font-weight: 600; margin: 0; font-size: 0.9rem; }
    .hero-summary { margin: 0.7rem 0 0; font-size: 0.95rem; opacity: 0.95; max-width: 540px; line-height: 1.45; }
    .hero-actions { position: relative; z-index: 1; display: flex; gap: 0.6rem; flex-wrap: wrap; margin-top: 1rem; }
    .hero-btn { display: inline-flex; align-items: center; gap: 7px; font-weight: 700; font-size: 0.85rem; padding: 9px 16px; border-radius: 12px;
      text-decoration: none; transition: transform 0.2s ease, background 0.2s ease; }
    .hero-btn.primary { background: #fff; color: #00875A; }
    .hero-btn.primary:hover { transform: translateY(-2px); }
    .hero-btn.ghost { background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.3); }
    .hero-btn.ghost:hover { background: rgba(255,255,255,0.25); }

    .hero-ring { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.6rem; }
    .ring { width: 132px; height: 132px; border-radius: 50%; display: grid; place-items: center; transition: background 0.6s ease; }
    .ring-hole { width: 102px; height: 102px; border-radius: 50%; background: rgba(0,80,55,0.35); backdrop-filter: blur(4px);
      display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.18); }
    .ring-val { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.7rem; line-height: 1; }
    .ring-lbl { font-size: 0.72rem; opacity: 0.85; font-weight: 600; margin-top: 2px; }
    .ring-meta { display: flex; gap: 1.1rem; }
    .ring-meta div { display: flex; flex-direction: column; align-items: center; }
    .ring-meta b { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.05rem; }
    .ring-meta span { font-size: 0.7rem; opacity: 0.85; }

    /* ════════ INSIGHTS ════════ */
    .insights { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .insight { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 16px; padding: 1rem 1.1rem;
      display: flex; align-items: center; gap: 0.85rem; cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease; position: relative; }
    .insight:hover { transform: translateY(-3px); box-shadow: 0 12px 26px -14px rgba(0,0,0,0.22); }
    .insight.muted { opacity: 0.75; }
    .insight .ic { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; font-size: 1.25rem; flex-shrink: 0; }
    .ic.warn { background: rgba(245,124,0,0.12); color: #E65100; }
    .ic.danger { background: rgba(229,57,53,0.12); color: #C62828; }
    .ic.info { background: rgba(2,136,209,0.12); color: #0277BD; }
    .ic.success, .ic.ok { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .insight .ix { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .insight .iv { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.6rem; line-height: 1; }
    .insight .iv small { font-size: 0.9rem; color: var(--csu-text-muted); font-weight: 700; }
    .insight .il { font-size: 0.78rem; color: var(--csu-text-muted); font-weight: 600; margin-top: 3px; }
    .insight .ihint { position: absolute; top: 0.85rem; right: 1rem; font-size: 0.7rem; font-weight: 700; color: var(--csu-text-muted); display: inline-flex; align-items: center; gap: 4px; }

    /* ════════ BENTO KPI ════════ */
    .bento { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
    .kpi { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 18px; padding: 1.2rem; cursor: pointer;
      position: relative; overflow: hidden; transition: transform 0.25s ease, box-shadow 0.25s ease; }
    .kpi::before { content: ''; position: absolute; top: -40%; right: -25%; width: 150px; height: 150px; border-radius: 50%; opacity: 0.1; }
    .kpi:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -16px rgba(0,0,0,0.25); }
    .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.9rem; }
    .kpi-ic { width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center; font-size: 1.3rem; color: #fff; }
    .kpi-go { color: var(--csu-text-muted); opacity: 0; transform: translate(-4px,4px); transition: all 0.25s ease; }
    .kpi:hover .kpi-go { opacity: 1; transform: translate(0,0); }
    .kpi-val { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 2rem; line-height: 1; letter-spacing: -0.02em; }
    .kpi-lbl { font-size: 0.85rem; color: var(--csu-text-muted); font-weight: 600; margin-top: 4px; }
    .kpi-bar { height: 5px; border-radius: 4px; background: rgba(0,0,0,0.06); overflow: hidden; margin-top: 0.8rem; }
    .kpi-bar span { display: block; height: 100%; border-radius: 4px; }
    .kpi-foot { font-size: 0.76rem; font-weight: 600; color: var(--csu-text-muted); margin-top: 0.55rem; }
    .kpi-foot.subtle { margin-top: 0.8rem; }
    .accent-blue   .kpi-ic { background: linear-gradient(135deg,#1565C0,#42A5F5); } .accent-blue::before { background:#1565C0; } .accent-blue .kpi-bar span { background:#1565C0; }
    .accent-green  .kpi-ic { background: linear-gradient(135deg,#00875A,#00C67B); } .accent-green::before { background:#00875A; } .accent-green .kpi-bar span { background:#00875A; }
    .accent-purple .kpi-ic { background: linear-gradient(135deg,#7B1FA2,#AB47BC); } .accent-purple::before { background:#7B1FA2; }
    .accent-orange .kpi-ic { background: linear-gradient(135deg,#F57C00,#FFB74D); } .accent-orange::before { background:#F57C00; }

    /* ════════ PANELS ════════ */
    .panel { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 18px; padding: 1.3rem 1.4rem; }
    .panel-head { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
    .panel-head h3 { display: flex; align-items: center; gap: 9px; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 1.05rem; margin: 0; }
    .panel-head h3 i { color: var(--csu-primary); }
    .panel-head .link { font-size: 0.82rem; font-weight: 700; color: var(--csu-primary); text-decoration: none; }
    .grid-2 { display: grid; grid-template-columns: 5fr 7fr; gap: 1.25rem; }

    /* Roles */
    .roles-wrap { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
    .roles-chart { position: relative; width: 168px; height: 168px; flex-shrink: 0; }
    .roles-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; }
    .roles-center b { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.5rem; line-height: 1; }
    .roles-center span { font-size: 0.72rem; color: var(--csu-text-muted); font-weight: 600; }
    .roles-legend { flex: 1; min-width: 180px; display: flex; flex-direction: column; gap: 0.7rem; }
    .rl { display: flex; align-items: center; gap: 9px; }
    .rl-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
    .rl-name { font-size: 0.84rem; font-weight: 600; width: 96px; flex-shrink: 0; }
    .rl-bar { flex: 1; height: 7px; border-radius: 5px; background: rgba(0,0,0,0.06); overflow: hidden; }
    .rl-bar i { display: block; height: 100%; border-radius: 5px; }
    .rl-val { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.95rem; width: 30px; text-align: right; }

    /* Users */
    .users { display: flex; flex-direction: column; gap: 0.35rem; }
    .urow { display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 12px; cursor: pointer; transition: background 0.2s ease; }
    .urow:hover { background: var(--csu-bg, #f6f8fa); }
    .avatar { width: 40px; height: 40px; border-radius: 12px; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0; }
    .av-admin { background: linear-gradient(135deg,#E53935,#EF5350); }
    .av-superviseur { background: linear-gradient(135deg,#FB8C00,#FFA726); }
    .av-agent { background: linear-gradient(135deg,#1E88E5,#42A5F5); }
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
    @keyframes flash-card { 0%,100% { box-shadow: 0 1px 3px rgba(0,0,0,0.04); } 20%,60% { box-shadow: 0 0 0 3px rgba(245,124,0,0.45); } }
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
    .pres-item { flex: 1; min-width: 110px; background: var(--csu-bg, #f6f8fa); border: 1px solid var(--csu-border-light); border-radius: 12px; padding: 0.85rem 1rem; display: flex; flex-direction: column; gap: 2px; }
    .pres-item .num { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.5rem; line-height: 1; }
    .pres-item .num .den { font-size: 0.9rem; color: var(--csu-text-muted); font-weight: 600; }
    .pres-item .lbl { font-size: 0.78rem; color: var(--csu-text-muted); font-weight: 600; }
    .pres-item.ok { background: rgba(2,136,209,0.06); border-color: rgba(2,136,209,0.2); } .pres-item.ok .num { color: #0277BD; }
    .pres-item.info { background: rgba(245,124,0,0.06); border-color: rgba(245,124,0,0.2); } .pres-item.info .num { color: #E65100; }
    .pres-item.off { background: rgba(0,0,0,0.03); } .pres-item.off .num { color: #6B7280; }
    .pres-item.alert { background: rgba(229,57,53,0.07); border-color: rgba(229,57,53,0.3); } .pres-item.alert .num { color: #C62828; }

    .geo-badge { font-size: 0.7rem; font-weight: 700; padding: 3px 9px; border-radius: 20px; white-space: nowrap; }
    .geo-badge.ok { background: rgba(67,160,71,0.12); color: #2E7D32; }
    .geo-badge.ko { background: rgba(229,57,53,0.12); color: #C62828; }
    .geo-badge.unknown { background: rgba(0,0,0,0.06); color: #6B7280; }
    .row-hors-zone { background: rgba(229,57,53,0.04); }

    .clickable-row { cursor: pointer; transition: background 0.15s ease; }
    .clickable-row:hover { background: var(--csu-bg, #f6f8fa); }
    .badge-count { background: var(--csu-primary); color: #fff; font-size: 0.7rem; font-weight: 700; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; }
    .agent-names { font-size: 0.78rem; color: var(--csu-text-muted); max-width: 220px; display: inline-block; }

    /* ════════ RESPONSIVE ════════ */
    @media (max-width: 1100px) {
      .insights { grid-template-columns: repeat(2, 1fr); }
      .bento { grid-template-columns: repeat(2, 1fr); }
      .grid-2 { grid-template-columns: 1fr; }
    }
    @media (max-width: 576px) {
      .hero { padding: 1.3rem 1.2rem; border-radius: 20px; }
      .insights { grid-template-columns: 1fr; }
      .bento { grid-template-columns: repeat(2, 1fr); gap: 0.7rem; }
      .kpi { padding: 1rem; border-radius: 14px; }
      .kpi-val { font-size: 1.6rem; }
      .panel { padding: 1.1rem; border-radius: 14px; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private adminDashboardService = inject(AdminDashboardService);
  private pointageService = inject(PointageService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  flashPermissions = false;
  private focusHandler = () => this.focusPermissions();

  @ViewChild('rolesChartCanvas') rolesChartCanvas?: ElementRef<HTMLCanvasElement>;

  now = new Date();
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

  /* ────────── Getters « intelligents » ────────── */
  get adminPrenom(): string {
    return this.authService.currentUserValue?.prenom || 'Administrateur';
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }

  get tauxPresence(): number {
    const total = this.presence?.totalAgents || 0;
    if (!total) return 0;
    return Math.round(((this.presence?.presents || 0) / total) * 100);
  }

  /** Dégradé conique de l'anneau de présence (vert proportionnel au taux). */
  get presenceRing(): string {
    const deg = Math.round((this.tauxPresence / 100) * 360);
    return `conic-gradient(#B9F6CA ${deg}deg, rgba(255,255,255,0.22) ${deg}deg)`;
  }

  /** Phrase de synthèse générée à partir des données du jour. */
  get resumeIntelligent(): string {
    const parts: string[] = [];
    if (this.presence) {
      parts.push(`${this.presence.presents}/${this.presence.totalAgents} agents présents (${this.tauxPresence}%)`);
    }
    if (this.nbEnAttente > 0) {
      parts.push(`${this.nbEnAttente} demande${this.nbEnAttente > 1 ? 's' : ''} de permission à traiter`);
    }
    if (this.nbHorsZone > 0) {
      parts.push(`${this.nbHorsZone} pointage${this.nbHorsZone > 1 ? 's' : ''} hors zone à vérifier`);
    }
    if (parts.length === 0) {
      return "Tout est à jour. Bonne journée de supervision !";
    }
    return 'Aujourd’hui : ' + parts.join(' · ') + '.';
  }

  pct(value: number, total: number): number {
    if (!total) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  }

  ngOnInit(): void {
    Chart.register(...registerables);
    this.loadStats();
    this.loadPresence();
    this.loadDemandes();

    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('csu:focus-permissions', this.focusHandler);
    }
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
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: 'rgba(26,26,46,0.9)', padding: 12, cornerRadius: 10 }
        }
      }
    });
  }
}
