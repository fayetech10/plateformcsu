import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ActiviteService } from '../../../core/services/activite.service';
import { Activite } from '../../../core/models/activite.model';

interface DayCell {
  date: Date;
  key: string;
  inMonth: boolean;
  isToday: boolean;
  activites: Activite[];
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title"><i class="bi bi-calendar3 text-csu-primary"></i> Agenda des activités</h1>
          <p class="csu-page-subtitle">Visualisez les activités planifiées et réalisées par jour</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/activites" class="csu-btn csu-btn-light"><i class="bi bi-list-ul"></i> Liste</a>
          <a routerLink="/activites/nouveau" class="csu-btn csu-btn-primary"><i class="bi bi-plus-lg"></i> Nouvelle activité</a>
        </div>
      </div>

      <div class="csu-card">
        <!-- Navigation mois -->
        <div class="cal-toolbar">
          <div class="cal-nav">
            <button class="nav-btn" (click)="prevMonth()"><i class="bi bi-chevron-left"></i></button>
            <h3 class="cal-title">{{ current | date:'MMMM y' }}</h3>
            <button class="nav-btn" (click)="nextMonth()"><i class="bi bi-chevron-right"></i></button>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="legend"><span class="dot st-plan"></span> Planifiée</div>
            <div class="legend"><span class="dot st-done"></span> Réalisée</div>
            <div class="legend"><span class="dot st-cancel"></span> Annulée</div>
            <button class="csu-btn csu-btn-light btn-sm" (click)="goToday()">Aujourd'hui</button>
          </div>
        </div>

        @if (loading) {
          <div class="csu-loading"><div class="csu-spinner"></div></div>
        } @else {
          <!-- En-têtes jours -->
          <div class="cal-grid head">
            @for (d of weekDays; track d) { <div class="cal-head">{{ d }}</div> }
          </div>
          <!-- Cellules -->
          <div class="cal-grid">
            @for (cell of cells; track cell.key) {
              <div class="cal-cell" [class.out]="!cell.inMonth" [class.today]="cell.isToday"
                   [class.selected]="cell.key === selectedKey" (click)="selectDay(cell)">
                <div class="cell-num">{{ cell.date.getDate() }}</div>
                <div class="cell-acts">
                  @for (a of cell.activites.slice(0, 3); track a.id) {
                    <div class="chip"
                      [class.st-plan]="(a.statut || 'REALISEE') === 'PLANIFIEE'"
                      [class.st-done]="(a.statut || 'REALISEE') === 'REALISEE'"
                      [class.st-cancel]="a.statut === 'ANNULEE'"
                      [title]="getTypeLabel(a.typeActivite) + ' — ' + a.description">
                      {{ getTypeLabel(a.typeActivite) }}
                    </div>
                  }
                  @if (cell.activites.length > 3) {
                    <div class="more">+{{ cell.activites.length - 3 }} autre(s)</div>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Détail du jour sélectionné -->
      @if (selectedCell) {
        <div class="csu-card mt-4">
          <div class="csu-card-header">
            <h3 class="csu-card-title"><i class="bi bi-calendar-day text-csu-secondary"></i> {{ selectedCell.date | date:'EEEE d MMMM y' }}</h3>
            <span class="text-muted small">{{ selectedCell.activites.length }} activité(s)</span>
          </div>
          @if (selectedCell.activites.length > 0) {
            <div class="d-flex flex-column gap-2">
              @for (a of selectedCell.activites; track a.id) {
                <div class="day-act" [routerLink]="['/activites', a.id, 'modifier']">
                  <span class="statut-dot"
                    [class.st-plan]="(a.statut || 'REALISEE') === 'PLANIFIEE'"
                    [class.st-done]="(a.statut || 'REALISEE') === 'REALISEE'"
                    [class.st-cancel]="a.statut === 'ANNULEE'"></span>
                  <div class="flex-grow-1 min-w-0">
                    <div class="fw-semibold">{{ getTypeLabel(a.typeActivite) }}</div>
                    <div class="text-muted small text-truncate">{{ a.description }}</div>
                  </div>
                  <span class="text-muted small"><i class="bi bi-people"></i> {{ a.nombreParticipants }}</span>
                </div>
              }
            </div>
          } @else {
            <div class="text-muted small py-2">Aucune activité ce jour. <a routerLink="/activites/nouveau">Planifier une activité</a></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .cal-toolbar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
    .cal-nav { display: flex; align-items: center; gap: 0.75rem; }
    .cal-title { margin: 0; text-transform: capitalize; font-weight: 800; min-width: 180px; text-align: center; }
    .nav-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--csu-border-light); background: #fff; cursor: pointer; }
    .nav-btn:hover { background: var(--csu-border-light); }
    .legend { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; color: var(--csu-text-muted); }
    .legend .dot, .statut-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .dot.st-plan, .statut-dot.st-plan { background: #F57C00; }
    .dot.st-done, .statut-dot.st-done { background: #2E7D32; }
    .dot.st-cancel, .statut-dot.st-cancel { background: #C62828; }

    .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
    .cal-grid.head { margin-bottom: 6px; gap: 6px; }
    .cal-head { text-align: center; font-size: 0.75rem; font-weight: 700; color: var(--csu-text-muted); text-transform: uppercase; padding: 4px; }
    .cal-cell { min-height: 96px; border: 1px solid var(--csu-border-light); border-radius: 10px; padding: 6px; cursor: pointer; transition: all 0.15s ease; background: #fff; overflow: hidden; }
    .cal-cell:hover { border-color: var(--csu-primary); box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .cal-cell.out { background: #fafafa; opacity: 0.55; }
    .cal-cell.today { border-color: var(--csu-primary); box-shadow: inset 0 0 0 1px var(--csu-primary); }
    .cal-cell.selected { background: rgba(0,135,90,0.06); border-color: var(--csu-primary); }
    .cell-num { font-weight: 700; font-size: 0.85rem; margin-bottom: 4px; }
    .cell-acts { display: flex; flex-direction: column; gap: 3px; }
    .chip { font-size: 0.66rem; font-weight: 700; padding: 2px 6px; border-radius: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .chip.st-plan { background: rgba(245,124,0,0.14); color: #E65100; }
    .chip.st-done { background: rgba(67,160,71,0.14); color: #2E7D32; }
    .chip.st-cancel { background: rgba(229,57,53,0.12); color: #C62828; text-decoration: line-through; }
    .more { font-size: 0.66rem; color: var(--csu-text-muted); font-weight: 600; }

    .day-act { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.15s; }
    .day-act:hover { background: var(--csu-border-light); }

    @media (max-width: 640px) {
      .cal-cell { min-height: 64px; }
      .chip { font-size: 0.6rem; }
    }
  `]
})
export class AgendaComponent implements OnInit {
  private activiteService = inject(ActiviteService);

  current = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  cells: DayCell[] = [];
  loading = false;

  selectedKey?: string;
  selectedCell?: DayCell;

  ngOnInit(): void {
    this.load();
  }

  prevMonth(): void {
    this.current = new Date(this.current.getFullYear(), this.current.getMonth() - 1, 1);
    this.load();
  }

  nextMonth(): void {
    this.current = new Date(this.current.getFullYear(), this.current.getMonth() + 1, 1);
    this.load();
  }

  goToday(): void {
    const now = new Date();
    this.current = new Date(now.getFullYear(), now.getMonth(), 1);
    this.load(this.key(now));
  }

  private key(d: Date): string {
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  private buildCells(): DayCell[] {
    const year = this.current.getFullYear();
    const month = this.current.getMonth();
    const first = new Date(year, month, 1);
    // Lundi = 0
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);
    const todayKey = this.key(new Date());

    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      cells.push({
        date: d,
        key: this.key(d),
        inMonth: d.getMonth() === month,
        isToday: this.key(d) === todayKey,
        activites: []
      });
    }
    return cells;
  }

  load(selectKey?: string): void {
    this.loading = true;
    this.cells = this.buildCells();
    const debut = this.cells[0].key;
    const fin = this.cells[this.cells.length - 1].key;

    this.activiteService.getCalendrier(debut, fin).subscribe({
      next: (activites) => {
        const map = new Map<string, Activite[]>();
        for (const a of activites) {
          const k = (a.dateActivite || '').substring(0, 10);
          if (!map.has(k)) map.set(k, []);
          map.get(k)!.push(a);
        }
        this.cells.forEach(c => (c.activites = map.get(c.key) || []));
        this.loading = false;

        // Sélection par défaut : aujourd'hui s'il est dans le mois, sinon rien
        const target = selectKey || this.cells.find(c => c.isToday && c.inMonth)?.key;
        if (target) {
          const cell = this.cells.find(c => c.key === target);
          if (cell) { this.selectedKey = cell.key; this.selectedCell = cell; }
        }
      },
      error: () => { this.loading = false; }
    });
  }

  selectDay(cell: DayCell): void {
    this.selectedKey = cell.key;
    this.selectedCell = cell;
  }

  getTypeLabel(type: string): string {
    const map: { [k: string]: string } = {
      SENSIBILISATION: 'Sensibilisation', FORMATION: 'Formation', REUNION: 'Réunion',
      VISITE_TERRAIN: 'Visite terrain', ASSISTANCE_ADMINISTRATIVE: 'Assistance admin.'
    };
    return map[type] || type;
  }
}
