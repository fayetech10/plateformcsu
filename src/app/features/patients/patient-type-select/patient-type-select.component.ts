import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-type-select',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid animate-fade-in">
      <!-- Header -->
      <div class="csu-page-header">
        <div>
          <h1 class="csu-page-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--csu-primary)">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Nouveau Patient
          </h1>
          <p class="csu-page-subtitle">Choisissez le type de prise en charge</p>
        </div>
        <div>
          <a routerLink="/patients" class="csu-btn csu-btn-light">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Retour
          </a>
        </div>
      </div>

      <!-- Type Selection Grid -->
      <div class="type-grid">
        <!-- Césarienne -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'cesarienne'}">
          <div class="type-card-icon cesarienne">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a5 5 0 0 1 5 5c0 2.76-2.24 5-5 5s-5-2.24-5-5a5 5 0 0 1 5-5z"/>
              <path d="M20 21v-2a4 4 0 0 0-4-4h-1"/>
              <path d="M4 21v-2a4 4 0 0 1 4-4h1"/>
              <line x1="9" y1="17" x2="15" y2="17"/>
              <line x1="12" y1="14" x2="12" y2="20"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Césarienne</h3>
            <p class="type-card-desc">Prise en charge des cas de césarienne</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- 0 à 5 ans -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: '0-5ans'}">
          <div class="type-card-icon enfant">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="6" r="4"/>
              <path d="M12 10c-4 0-6 3-6 6v1h12v-1c0-3-2-6-6-6z"/>
              <path d="M9 21h6"/>
              <path d="M12 17v4"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">0 à 5 ans</h3>
            <p class="type-card-desc">Enfants de la naissance à 5 ans</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- Classique -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'classique'}">
          <div class="type-card-icon classique">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Classique</h3>
            <p class="type-card-desc">Enregistrement standard de patient</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- Dialyse péritonéale -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'dialyse-peritoneale'}">
          <div class="type-card-icon dialyse">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Dialyse péritonéale</h3>
            <p class="type-card-desc">Suivi de la dialyse péritonéale</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- Hémodialyse -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'hemodialyse'}">
          <div class="type-card-icon hemodialyse">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12h4l2 5 4-12 2 7h6"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Hémodialyse</h3>
            <p class="type-card-desc">Suivi des séances d'hémodialyse</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- Bourse de Sécurité Familiale -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'bsf'}">
          <div class="type-card-icon bsf">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 7h18v13H3z"/>
              <path d="M8 7V5a4 4 0 0 1 8 0v2"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Bourse de Sécurité Familiale</h3>
            <p class="type-card-desc">Bénéficiaires BSF</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- Carte Égalité des Chances -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'cec'}">
          <div class="type-card-icon cec">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <circle cx="8" cy="10" r="2"/>
              <path d="M14 9h5M14 13h5M5 16h8"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Carte Égalité des Chances</h3>
            <p class="type-card-desc">Bénéficiaires CEC</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- Plan Sésame -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'plan-sesame'}">
          <div class="type-card-icon sesame">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
              <path d="M12 15h4"/>
              <path d="M6 15h2"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Plan Sésame</h3>
            <p class="type-card-desc">Personnes âgées — Plan Sésame</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>

        <!-- Plan Ndongo Dara / Élève -->
        <a class="type-card" [routerLink]="['/patients/nouveau/formulaire']" [queryParams]="{type: 'ndongo-dara'}">
          <div class="type-card-icon ndongo">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 10L12 5 2 10l10 5 10-5z"/>
              <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/>
            </svg>
          </div>
          <div class="type-card-content">
            <h3 class="type-card-title">Plan Ndongo Dara / Élève</h3>
            <p class="type-card-desc">Élèves et bénéficiaires Ndongo Dara</p>
          </div>
          <div class="type-card-arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .type-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      max-width: 800px;
    }

    .type-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 2px solid transparent;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      position: relative;
      overflow: hidden;
    }

    .type-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent 70%, rgba(0, 0, 0, 0.015));
      pointer-events: none;
    }

    .type-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
      border-color: var(--csu-primary);
      color: inherit;
    }

    .type-card:active {
      transform: translateY(-2px) scale(0.99);
    }

    .type-card-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s ease;
    }

    .type-card:hover .type-card-icon {
      transform: scale(1.1);
    }

    .type-card-icon.cesarienne {
      background: rgba(233, 30, 99, 0.08);
      color: #C2185B;
    }
    .type-card-icon.enfant {
      background: rgba(3, 155, 229, 0.08);
      color: #0288D1;
    }
    .type-card-icon.classique {
      background: rgba(0, 135, 90, 0.08);
      color: #00875A;
    }
    .type-card-icon.sesame {
      background: rgba(123, 31, 162, 0.08);
      color: #7B1FA2;
    }
    .type-card-icon.dialyse {
      background: rgba(0, 151, 167, 0.08);
      color: #00838F;
    }
    .type-card-icon.hemodialyse {
      background: rgba(216, 67, 21, 0.08);
      color: #D84315;
    }
    .type-card-icon.bsf {
      background: rgba(46, 125, 50, 0.08);
      color: #2E7D32;
    }
    .type-card-icon.cec {
      background: rgba(40, 53, 147, 0.08);
      color: #283593;
    }
    .type-card-icon.ndongo {
      background: rgba(245, 124, 0, 0.08);
      color: #EF6C00;
    }

    .type-card-content {
      flex: 1;
      min-width: 0;
    }

    .type-card-title {
      font-size: 1rem;
      font-weight: 700;
      margin: 0 0 2px 0;
      color: var(--csu-text);
    }

    .type-card-desc {
      font-size: 0.8rem;
      color: var(--csu-text-muted);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .type-card-arrow {
      color: var(--csu-text-muted);
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .type-card:hover .type-card-arrow {
      color: var(--csu-primary);
      transform: translateX(4px);
    }

    /* Responsive */
    @media (max-width: 576px) {
      .type-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .type-card {
        padding: 1.25rem;
        border-radius: 14px;
      }

      .type-card-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
      }

      .type-card-icon svg {
        width: 26px;
        height: 26px;
      }

      .type-card-title {
        font-size: 0.95rem;
      }
    }
  `]
})
export class PatientTypeSelectComponent {}
