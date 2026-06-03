import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="csu-login-wrapper">
      <!-- Decorative Elements -->
      <div class="csu-login-decoration csu-decoration-1"></div>
      <div class="csu-login-decoration csu-decoration-2"></div>
      <div class="csu-login-decoration csu-decoration-3"></div>

      <div class="csu-login-container">
        <div class="csu-login-card animate-fade-in-up">
          <!-- Header Section -->
          <div class="csu-login-header">
            <div class="csu-login-logo">
              <div class="csu-login-logo-icon">
                <i class="bi bi-shield-check"></i>
              </div>
              <h1 class="csu-login-title">Plateforme CSU</h1>
              <p class="csu-login-subtitle">Couverture Sanitaire Universelle</p>
            </div>
          </div>

          <!-- Error Message -->
          @if (errorMsg) {
            <div class="csu-login-error animate-fade-in">
              <div class="error-icon">
                <i class="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div class="error-content">
                <span>{{ errorMsg }}</span>
              </div>
            </div>
          }

          <!-- Login Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="csu-login-form">
            <!-- Username Field -->
            <div class="csu-form-group">
              <label class="csu-form-label" for="username">
                <i class="bi bi-person-circle"></i>
                <span>Identifiant</span>
              </label>
              <div class="csu-input-wrapper">
                <input
                  id="username"
                  type="text"
                  class="csu-form-control"
                  [class.is-invalid]="isFieldInvalid('username')"
                  formControlName="username"
                  placeholder="Email ou nom d'utilisateur"
                  autocomplete="username"
                />
                <div class="input-focus-indicator"></div>
              </div>
              @if (isFieldInvalid('username')) {
                <div class="csu-invalid-feedback">
                  <i class="bi bi-info-circle"></i>
                  <span>L'identifiant est requis</span>
                </div>
              }
            </div>

            <!-- Password Field -->
            <div class="csu-form-group">
              <label class="csu-form-label" for="password">
                <i class="bi bi-lock-circle"></i>
                <span>Mot de passe</span>
              </label>
              <div class="csu-input-wrapper">
                <input
                  id="password"
                  [type]="showPassword ? 'text' : 'password'"
                  class="csu-form-control"
                  [class.is-invalid]="isFieldInvalid('password')"
                  formControlName="password"
                  placeholder="Votre mot de passe"
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  class="password-toggle-btn"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
                >
                  <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                </button>
                <div class="input-focus-indicator"></div>
              </div>
              @if (isFieldInvalid('password')) {
                <div class="csu-invalid-feedback">
                  <i class="bi bi-info-circle"></i>
                  <span>Le mot de passe est requis</span>
                </div>
              }
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="csu-login-options">
              <div class="form-check">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="rememberMe" 
                  formControlName="rememberMe"
                >
                <label class="form-check-label" for="rememberMe">
                  Se souvenir de moi
                </label>
              </div>
              <a 
                (click)="onForgotPassword()" 
                class="forgot-password-link"
                role="button"
                tabindex="0"
                (keydown.enter)="onForgotPassword()"
              >
                Mot de passe oublié ?
              </a>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              class="csu-btn csu-btn-primary csu-login-btn"
              [disabled]="loading"
              [attr.aria-busy]="loading"
            >
              @if (loading) {
                <span class="btn-spinner"></span>
                <span>Connexion en cours...</span>
              } @else {
                <i class="bi bi-box-arrow-in-right"></i>
                <span>Se connecter</span>
              }
            </button>
          </form>

          <!-- Footer Info -->
          <div class="csu-login-footer">
            <p class="footer-text">
              Plateforme sécurisée. Vos données sont protégées.
            </p>
          </div>
        </div>

        <!-- Support Link -->
        <div class="csu-login-support">
          <p>Besoin d'aide ? <a href="#" class="support-link">Contacter le support</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }
    
    .csu-login-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      z-index: 10;
    }

    .btn-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .csu-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-focus-indicator {
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--csu-primary), #00C67B);
      transition: width 0.3s ease;
    }

    .csu-form-control:focus ~ .input-focus-indicator {
      width: 100%;
    }

    .password-toggle-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: var(--csu-text-muted);
      cursor: pointer;
      font-size: 1.1rem;
      padding: 0.5rem;
      transition: all 0.2s ease;
      border-radius: 4px;
    }

    .password-toggle-btn:hover {
      color: var(--csu-primary);
      background: rgba(0, 135, 90, 0.05);
    }

    .password-toggle-btn:focus {
      outline: 2px solid var(--csu-primary);
      outline-offset: 2px;
    }

    .csu-login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1.5rem 0;
      gap: 1rem;
    }

    .form-check-label {
      font-size: 0.9rem;
      color: var(--csu-text-secondary);
      cursor: pointer;
      user-select: none;
      transition: color 0.2s ease;
    }

    .form-check-input:checked ~ .form-check-label,
    .form-check-input:focus ~ .form-check-label {
      color: var(--csu-primary);
    }

    .forgot-password-link {
      font-size: 0.9rem;
      color: var(--csu-primary);
      text-decoration: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .forgot-password-link::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--csu-primary);
      transition: width 0.3s ease;
    }

    .forgot-password-link:hover::after,
    .forgot-password-link:focus::after {
      width: 100%;
    }

    .forgot-password-link:focus {
      outline: 2px solid var(--csu-primary);
      outline-offset: 4px;
      border-radius: 2px;
    }

    .csu-login-form {
      margin: 1rem 0;
    }

    .csu-login-header {
      margin-bottom: 2rem;
    }

    .csu-login-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(0, 135, 90, 0.1);
    }

    .footer-text {
      font-size: 0.8rem;
      color: var(--csu-text-muted);
      margin: 0;
    }

    .csu-login-support {
      margin-top: 2rem;
      text-align: center;
    }

    .csu-login-support p {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      margin: 0;
    }

    .support-link {
      color: rgba(255, 255, 255, 1);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s ease;
      border-bottom: 1px solid rgba(255, 255, 255, 0.5);
    }

    .support-link:hover {
      color: #FFF;
      border-bottom-color: rgba(255, 255, 255, 1);
    }

    .csu-login-logo i {
      transition: transform 0.3s ease;
    }

    .csu-login-card:hover .csu-login-logo i {
      transform: scale(1.05);
    }

    .error-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      min-width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(229, 57, 53, 0.15);
    }

    .error-content {
      flex: 1;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  loading = false;
  showPassword = false;
  errorMsg = '';

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    const { username, password } = this.loginForm.value;

    this.authService.login({ username: username!, password: password! }).subscribe({
      next: (user) => {
        this.loading = false;
        // Redirect to target URL or default to dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Bienvenue, ${user.prenom} ${user.nom}`,
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = "Identifiants incorrects ou compte inactif. Veuillez réessayer.";
      }
    });
  }

  onForgotPassword(): void {
    Swal.fire({
      title: 'Mot de passe oublié ?',
      text: 'Entrez votre adresse email pour recevoir un lien de réinitialisation :',
      input: 'email',
      inputPlaceholder: 'votre.email@domaine.com',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#00875A',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value) {
          return 'Veuillez saisir votre adresse email !';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Chargement...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.authService.resetPassword({ email: result.value }).subscribe({
          next: () => {
            Swal.fire({
              title: 'Email envoyé !',
              text: 'Si cet email est enregistré, un lien de réinitialisation vous a été envoyé.',
              icon: 'success',
              confirmButtonColor: '#00875A'
            });
          },
          error: () => {
            // Note: Keep message generic for security, but complete flow
            Swal.fire({
              title: 'Email envoyé !',
              text: 'Si cet email est enregistré, un lien de réinitialisation vous a été envoyé.',
              icon: 'success',
              confirmButtonColor: '#00875A'
            });
          }
        });
      }
    });
  }
}
