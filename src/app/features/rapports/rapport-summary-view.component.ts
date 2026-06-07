import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RapportSummary } from '../../core/models/rapport-summary.model';

/**
 * Vue de synthèse (présentation pure) des indicateurs d'une période :
 * KPIs, répartitions, mini-graphe journalier et classement des agents.
 * Réutilisée par la page Rapports (aperçu) et le tableau de bord admin.
 */
@Component({
  selector: 'app-rapport-summary-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading) {
      <div class="rs-loading"><div class="csu-spinner"></div></div>
    } @else if (!summary) {
      <div class="rs-empty"><i class="bi bi-bar-chart"></i><span>Sélectionnez une période pour afficher la synthèse.</span></div>
    } @else {
      <!-- KPIs -->
      <div class="rs-kpis">
        <div class="rs-kpi blue"><div class="rs-ic"><i class="bi bi-person-vcard"></i></div><div><b>{{ summary.totalPatients }}</b><span>Patients</span></div></div>
        <div class="rs-kpi green"><div class="rs-ic"><i class="bi bi-person-check"></i></div><div><b>{{ summary.totalEnrolements }}</b><span>Enrôlements</span></div></div>
        <div class="rs-kpi purple"><div class="rs-ic"><i class="bi bi-calendar2-event"></i></div><div><b>{{ summary.totalActivites }}</b><span>Activités</span></div></div>
        <div class="rs-kpi orange"><div class="rs-ic"><i class="bi bi-clipboard-check"></i></div><div><b>{{ summary.totalConstats }}</b><span>Constats</span></div></div>
      </div>

      @if (!compact) {
        <!-- Mini-graphe journalier -->
        @if (summary.serie.length > 0) {
          <div class="rs-block">
            <div class="rs-block-head"><span><i class="bi bi-graph-up"></i> Évolution journalière</span>
              <span class="rs-legend"><i class="lg blue"></i>Patients <i class="lg green"></i>Enrôlements</span>
            </div>
            <div class="rs-chart">
              @for (d of summary.serie; track d.date) {
                <div class="rs-col" [title]="d.date + ' — ' + d.patients + ' patients, ' + d.enrolements + ' enrôlements'">
                  <div class="rs-bars">
                    <span class="b blue" [style.height.%]="barH(d.patients)"></span>
                    <span class="b green" [style.height.%]="barH(d.enrolements)"></span>
                  </div>
                  <span class="rs-x">{{ shortDay(d.date) }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Répartitions -->
        <div class="rs-grid">
          @if (entries(summary.enrolementsParStatut).length > 0) {
            <div class="rs-block">
              <div class="rs-block-head"><span><i class="bi bi-diagram-3"></i> Enrôlements par statut</span></div>
              @for (e of entries(summary.enrolementsParStatut); track e[0]) {
                <div class="rs-row">
                  <span class="rs-row-lbl">{{ e[0] }}</span>
                  <span class="rs-row-bar"><i [style.width.%]="pct(e[1], summary.totalEnrolements)"></i></span>
                  <span class="rs-row-val">{{ e[1] }}</span>
                </div>
              }
            </div>
          }
          @if (entries(summary.constatsParPriorite).length > 0) {
            <div class="rs-block">
              <div class="rs-block-head"><span><i class="bi bi-flag"></i> Constats par priorité</span></div>
              @for (e of entries(summary.constatsParPriorite); track e[0]) {
                <div class="rs-row">
                  <span class="rs-row-lbl">{{ e[0] }}</span>
                  <span class="rs-row-bar"><i class="orange" [style.width.%]="pct(e[1], summary.totalConstats)"></i></span>
                  <span class="rs-row-val">{{ e[1] }}</span>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Top agents -->
      @if (summary.parAgent.length > 0) {
        <div class="rs-block">
          <div class="rs-block-head"><span><i class="bi bi-trophy"></i> {{ compact ? 'Top agents' : 'Activité par agent' }}</span></div>
          <div class="rs-agents">
            @for (a of topAgents(); track a.agentId; let i = $index) {
              <div class="rs-agent">
                <span class="rs-rank" [class.gold]="i === 0">{{ i + 1 }}</span>
                <span class="rs-agent-nom">{{ a.agentNom }}</span>
                @if (!compact) {
                  <span class="rs-chip blue">{{ a.patients }} P</span>
                  <span class="rs-chip green">{{ a.enrolements }} E</span>
                  <span class="rs-chip purple">{{ a.activites }} A</span>
                  <span class="rs-chip orange">{{ a.constats }} C</span>
                }
                <span class="rs-agent-total">{{ a.total }}</span>
              </div>
            }
          </div>
        </div>
      }
    }
  `,
  styles: [`
    .rs-loading, .rs-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 2rem; color: var(--csu-text-muted); }
    .rs-empty i { font-size: 2rem; opacity: 0.35; }
    .rs-empty span { font-size: 0.85rem; }

    .rs-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.7rem; margin-bottom: 1rem; }
    .rs-kpi { display: flex; align-items: center; gap: 10px; background: var(--csu-bg, #f8fafc); border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; padding: 0.7rem 0.85rem; }
    .rs-ic { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; font-size: 1.05rem; color: #fff; flex-shrink: 0; }
    .rs-kpi.blue .rs-ic { background: linear-gradient(135deg,#1565C0,#42A5F5); }
    .rs-kpi.green .rs-ic { background: linear-gradient(135deg,#00875A,#00C67B); }
    .rs-kpi.purple .rs-ic { background: linear-gradient(135deg,#7B1FA2,#AB47BC); }
    .rs-kpi.orange .rs-ic { background: linear-gradient(135deg,#F57C00,#FFB74D); }
    .rs-kpi b { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.3rem; line-height: 1; display: block; }
    .rs-kpi span { font-size: 0.74rem; color: var(--csu-text-muted); font-weight: 600; }

    .rs-block { background: #fff; border: 1px solid rgba(0,0,0,0.05); border-radius: 12px; padding: 0.9rem 1rem; margin-bottom: 0.9rem; }
    .rs-block-head { display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 0.86rem; margin-bottom: 0.7rem; }
    .rs-block-head i.bi { color: var(--csu-primary); }
    .rs-legend { font-size: 0.7rem; color: var(--csu-text-muted); font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
    .rs-legend .lg { width: 9px; height: 9px; border-radius: 2px; display: inline-block; margin-left: 8px; }
    .lg.blue, .b.blue { background: #1565C0; }
    .lg.green, .b.green { background: #00875A; }

    .rs-chart { display: flex; align-items: flex-end; gap: 4px; height: 110px; overflow-x: auto; padding-top: 4px; }
    .rs-col { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 22px; flex: 1; }
    .rs-bars { display: flex; align-items: flex-end; gap: 2px; height: 88px; }
    .rs-bars .b { width: 7px; border-radius: 3px 3px 0 0; min-height: 2px; transition: height 0.3s ease; }
    .rs-x { font-size: 0.6rem; color: var(--csu-text-muted); white-space: nowrap; }

    .rs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.9rem; }
    .rs-row { display: flex; align-items: center; gap: 9px; margin-bottom: 6px; }
    .rs-row-lbl { font-size: 0.78rem; font-weight: 600; width: 92px; flex-shrink: 0; text-transform: capitalize; }
    .rs-row-bar { flex: 1; height: 7px; border-radius: 5px; background: rgba(0,0,0,0.06); overflow: hidden; }
    .rs-row-bar i { display: block; height: 100%; border-radius: 5px; background: #00875A; }
    .rs-row-bar i.orange { background: #F57C00; }
    .rs-row-val { font-weight: 800; font-family: 'Outfit', sans-serif; font-size: 0.9rem; width: 26px; text-align: right; }

    .rs-agents { display: flex; flex-direction: column; gap: 0.4rem; }
    .rs-agent { display: flex; align-items: center; gap: 9px; padding: 5px 6px; border-radius: 9px; }
    .rs-agent:hover { background: var(--csu-bg, #f6f8fa); }
    .rs-rank { width: 22px; height: 22px; border-radius: 50%; background: rgba(0,0,0,0.06); color: var(--csu-text-muted); font-size: 0.72rem; font-weight: 800; display: grid; place-items: center; flex-shrink: 0; }
    .rs-rank.gold { background: rgba(245,124,0,0.16); color: #E65100; }
    .rs-agent-nom { flex: 1; font-size: 0.84rem; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rs-chip { font-size: 0.66rem; font-weight: 700; padding: 2px 6px; border-radius: 8px; }
    .rs-chip.blue { background: rgba(21,101,192,0.1); color: #1565C0; }
    .rs-chip.green { background: rgba(0,135,90,0.1); color: #00875A; }
    .rs-chip.purple { background: rgba(123,31,162,0.1); color: #7B1FA2; }
    .rs-chip.orange { background: rgba(245,124,0,0.1); color: #E65100; }
    .rs-agent-total { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.95rem; width: 30px; text-align: right; }

    @media (max-width: 640px) {
      .rs-kpis { grid-template-columns: repeat(2, 1fr); }
      .rs-grid { grid-template-columns: 1fr; }
      .rs-agent .rs-chip { display: none; }
    }
  `]
})
export class RapportSummaryViewComponent {
  @Input() summary?: RapportSummary | null;
  @Input() loading = false;
  @Input() compact = false;

  entries(obj: Record<string, number> | undefined): Array<[string, number]> {
    if (!obj) return [];
    return Object.entries(obj).sort((a, b) => b[1] - a[1]);
  }

  pct(value: number, total: number): number {
    if (!total) return 0;
    return Math.min(100, Math.round((value / total) * 100));
  }

  private serieMax(): number {
    if (!this.summary?.serie?.length) return 1;
    return Math.max(1, ...this.summary.serie.map(d => Math.max(d.patients, d.enrolements)));
  }

  barH(value: number): number {
    return Math.round((value / this.serieMax()) * 100);
  }

  shortDay(date: string): string {
    // 'yyyy-MM-dd' -> 'dd/MM'
    const parts = date.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : date;
  }

  topAgents() {
    const list = this.summary?.parAgent || [];
    return this.compact ? list.slice(0, 5) : list;
  }
}
