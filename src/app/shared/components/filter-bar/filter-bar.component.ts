import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  /** Clé renvoyée dans l'objet de valeurs (ex: 'statut', 'region') */
  key: string;
  /** Libellé optionnel affiché devant les puces */
  label?: string;
  options: FilterOption[];
}

export type FilterValues = Record<string, string>;

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="filter-bar animate-fade-in">
      <!-- Ligne de recherche -->
      <div class="filter-search">
        <i class="bi bi-search"></i>
        <input
          type="text"
          [formControl]="searchCtrl"
          [placeholder]="searchPlaceholder"
        />
        @if (searchCtrl.value) {
          <button type="button" class="filter-clear-input" (click)="clearSearch()" title="Effacer">
            <i class="bi bi-x-lg"></i>
          </button>
        }
      </div>

      <!-- Groupes en listes déroulantes -->
      @for (group of filterGroups; track group.key) {
        <div class="filter-group">
          @if (group.label) {
            <span class="filter-group-label">{{ group.label }}</span>
          }
          <div class="filter-select-wrap">
            <select
              class="filter-select"
              [class.active]="!!values[group.key]"
              [value]="values[group.key] || ''"
              (change)="select(group.key, $any($event.target).value)"
            >
              <option value="">Tous</option>
              @for (opt of group.options; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
            <i class="bi bi-chevron-down"></i>
          </div>
        </div>
      }

      <!-- Réinitialiser (visible seulement si un filtre est actif) -->
      @if (hasActiveFilters()) {
        <button type="button" class="filter-reset" (click)="reset()">
          <i class="bi bi-arrow-counterclockwise"></i>
          Réinitialiser
        </button>
      }
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.85rem 1.25rem;
      padding: 0.85rem 1rem;
      margin-bottom: 1.5rem;
      background: var(--csu-card-bg);
      border: 1px solid rgba(226, 232, 240, 0.7);
      border-radius: var(--csu-radius-lg);
      box-shadow: var(--csu-shadow-xs);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    /* ── Recherche ── */
    .filter-search {
      position: relative;
      flex: 1 1 260px;
      min-width: 220px;
      display: flex;
      align-items: center;
    }
    .filter-search > i {
      position: absolute;
      left: 0.9rem;
      color: var(--csu-text-muted);
      font-size: 0.9rem;
      pointer-events: none;
    }
    .filter-search input {
      width: 100%;
      padding: 0.6rem 2.2rem 0.6rem 2.4rem;
      border: 1.5px solid var(--csu-border);
      border-radius: 99px;
      font-size: 0.875rem;
      color: var(--csu-text);
      background: #fff;
      font-family: inherit;
      transition: var(--csu-transition-fast);
    }
    .filter-search input::placeholder { color: rgba(100, 116, 139, 0.6); }
    .filter-search input:focus {
      outline: none;
      border-color: var(--csu-primary);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    .filter-clear-input {
      position: absolute;
      right: 0.6rem;
      width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
      border: none; background: var(--csu-bg);
      color: var(--csu-text-muted);
      border-radius: 50%;
      cursor: pointer;
      font-size: 0.65rem;
      transition: var(--csu-transition-fast);
    }
    .filter-clear-input:hover { background: var(--csu-danger); color: #fff; }

    /* ── Groupes ── */
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }
    .filter-group-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--csu-text-muted);
    }
    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
    }

    /* ── Liste déroulante ── */
    .filter-select-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
    }
    .filter-select-wrap > i {
      position: absolute;
      right: 0.7rem;
      pointer-events: none;
      font-size: 0.7rem;
      color: var(--csu-text-muted);
    }
    .filter-select {
      appearance: none;
      -webkit-appearance: none;
      padding: 0.5rem 2rem 0.5rem 0.9rem;
      border: 1.5px solid var(--csu-border);
      background: #fff;
      color: var(--csu-text-secondary);
      border-radius: 99px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
      min-width: 150px;
      transition: var(--csu-transition-fast);
    }
    .filter-select:focus {
      outline: none;
      border-color: var(--csu-primary);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    .filter-select.active {
      border-color: var(--csu-primary);
      color: var(--csu-primary-dark);
      background: var(--csu-primary-lighter);
    }

    /* ── Puces ── */
    .filter-chip {
      padding: 0.35rem 0.85rem;
      border: 1px solid var(--csu-border);
      background: #fff;
      color: var(--csu-text-secondary);
      border-radius: 99px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--csu-transition-fast);
      white-space: nowrap;
      line-height: 1.4;
    }
    .filter-chip:hover {
      border-color: rgba(16, 185, 129, 0.4);
      color: var(--csu-primary-dark);
      background: var(--csu-primary-lighter);
    }
    .filter-chip.active {
      background: linear-gradient(135deg, var(--csu-primary), var(--csu-primary-dark));
      border-color: transparent;
      color: #fff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    /* ── Réinitialiser ── */
    .filter-reset {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-left: auto;
      padding: 0.4rem 0.5rem;
      border: none;
      background: transparent;
      color: var(--csu-text-muted);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--csu-transition-fast);
      white-space: nowrap;
    }
    .filter-reset:hover { color: var(--csu-danger); }

    @media (max-width: 768px) {
      .filter-bar { gap: 0.75rem; }
      .filter-search { flex-basis: 100%; }
      .filter-reset { margin-left: 0; }
    }
  `]
})
export class FilterBarComponent implements OnInit, OnDestroy {
  /** Placeholder du champ de recherche */
  @Input() searchPlaceholder = 'Rechercher...';
  /** Groupes de puces de filtre */
  @Input() filterGroups: FilterGroup[] = [];
  /** Délai du debounce de la recherche (ms) */
  @Input() debounce = 350;

  /** Émis à chaque changement : { search, ...valeurs des groupes } */
  @Output() filterChange = new EventEmitter<FilterValues & { search: string }>();

  searchCtrl = new FormControl('', { nonNullable: true });
  values: FilterValues = {};

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchCtrl.valueChanges
      .pipe(
        debounceTime(this.debounce),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.emit());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  select(key: string, value: string): void {
    if (this.values[key] === value) return;
    this.values[key] = value;
    this.emit();
  }

  clearSearch(): void {
    this.searchCtrl.setValue('');
  }

  hasActiveFilters(): boolean {
    if (this.searchCtrl.value.trim()) return true;
    return Object.values(this.values).some((v) => !!v);
  }

  reset(): void {
    this.values = {};
    this.searchCtrl.setValue('', { emitEvent: false });
    this.emit();
  }

  private emit(): void {
    this.filterChange.emit({ search: this.searchCtrl.value.trim(), ...this.values });
  }
}
