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
      <div class="csu-login-card animate-fade-in-up">
        <div class="csu-login-logo">
          <div class="csu-login-logo-icon">
            <i class="bi bi-shield-plus"></i>
          </div>
          <h1 class="csu-login-title">Plateforme CSU</h1>
          <p class="csu-login-subtitle">Couverture Sanitaire Universelle</p>
        </div>

        @if (errorMsg) {
          <div class="csu-login-error animate-fade-in">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span>{{ errorMsg }}</span>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="csu-form-group">
            <label class="csu-form-label" for="username">Identifiant (Email / Nom d'utilisateur)</label>
            <div class="position-relative">
              <input
                id="username"
                type="text"
                class="csu-form-control"
                [class.is-invalid]="isFieldInvalid('username')"
                formControlName="username"
                placeholder="Entrez votre identifiant"
                autocomplete="username"
              />
            </div>
            @if (isFieldInvalid('username')) {
              <div class="csu-invalid-feedback">
                <i class="bi bi-info-circle"></i> L'identifiant est requis
              </div>
            }
          </div>

          <div class="csu-form-group">
            <label class="csu-form-label" for="password">Mot de passe</label>
            <div class="position-relative">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                class="csu-form-control"
                [class.is-invalid]="isFieldInvalid('password')"
                formControlName="password"
                placeholder="Entrez votre mot de passe"
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="btn position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent text-muted"
                (click)="togglePasswordVisibility()"
                style="z-index: 10;"
              >
                <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
              </button>
            </div>
            @if (isFieldInvalid('password')) {
              <div class="csu-invalid-feedback">
                <i class="bi bi-info-circle"></i> Le mot de passe est requis
              </div>
            }
          </div>

          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="rememberMe" formControlName="rememberMe">
              <label class="form-check-label text-muted small" for="rememberMe">
                Se souvenir de moi
              </label>
            </div>
            <a (click)="onForgotPassword()" class="small cursor-pointer text-csu-primary fw-semibold">
              Mot de passe oublié ?
            </a>
          </div>

          <button 
            type="submit" 
            class="csu-btn csu-btn-primary csu-login-btn"
            [disabled]="loading"
          >
            @if (loading) {
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
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
