import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <!-- Animated gradient background -->
      <div class="animated-bg"></div>
      
      <!-- Floating orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <div class="login-wrapper">
        <div class="login-card">
          <!-- Branding -->
          <div class="brand">
            <div class="logo">
              <img src="assets/logo.png" alt="CSU" class="logo-img" />
            </div>
            <h1 class="title">Plateforme CSU</h1>
            <p class="subtitle">Couverture Sanitaire Universelle</p>
          </div>

          <!-- Error alert -->
          @if (errorMsg) {
            <div class="alert alert-error">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ errorMsg }}</span>
              <button class="alert-close" (click)="errorMsg = ''">&times;</button>
            </div>
          }

          <!-- Login form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="input-group">
              <div class="input-icon">
                <i class="bi bi-person"></i>
              </div>
              <div class="input-field">
                <input
                  type="text"
                  formControlName="username"
                  placeholder=" "
                  autocomplete="username"
                  [class.filled]="loginForm.get('username')?.value"
                />
                <label>Identifiant</label>
              </div>
              @if (isFieldInvalid('username')) {
                <div class="input-error">L'identifiant est requis</div>
              }
            </div>

            <div class="input-group">
              <div class="input-icon">
                <i class="bi bi-lock"></i>
              </div>
              <div class="input-field">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder=" "
                  autocomplete="current-password"
                  [class.filled]="loginForm.get('password')?.value"
                />
                <label>Mot de passe</label>
                <button type="button" class="password-toggle" (click)="togglePasswordVisibility()">
                  <i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i>
                </button>
              </div>
              @if (isFieldInvalid('password')) {
                <div class="input-error">Le mot de passe est requis</div>
              }
            </div>

            <div class="form-footer">
              <label class="checkbox">
                <input type="checkbox" formControlName="rememberMe" />
                <span class="checkmark"></span>
                Se souvenir de moi
              </label>
              <a (click)="onForgotPassword()" class="forgot-link">Mot de passe oublié ?</a>
            </div>

            <button type="submit" class="btn-login" [disabled]="loading">
              @if (loading) {
                <div class="spinner"></div>
                <span>Connexion...</span>
              } @else {
                <span>Se connecter</span>
                <i class="bi bi-arrow-right"></i>
              }
            </button>
          </form>

          <div class="secure-footer">
            <i class="bi bi-shield-lock-fill"></i>
            <span>Connexion sécurisée</span>
          </div>
        </div>

        <div class="support-footer">
          <span>Besoin d'aide ?</span>
          <a href="#">Contacter le support</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ----- GLOBAL RESET & FONTS ----- */
    :host {
      display: block;
      height: 100vh;
      font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
    }

    /* ----- CONTAINER ----- */
    .login-container {
      position: relative;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: #0a0c12;
    }

    /* Animated gradient background */
    .animated-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 20% 30%, rgba(0, 135, 90, 0.15), transparent 50%),
                  radial-gradient(circle at 80% 70%, rgba(0, 198, 123, 0.1), transparent 50%);
      animation: bgShift 12s ease infinite;
    }

    @keyframes bgShift {
      0% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.02); }
      100% { opacity: 0.6; transform: scale(1); }
    }

    /* Floating orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.4;
      animation: float 20s infinite alternate;
    }
    .orb-1 {
      width: 300px;
      height: 300px;
      background: #00875a;
      top: -100px;
      right: -50px;
      animation-duration: 18s;
    }
    .orb-2 {
      width: 250px;
      height: 250px;
      background: #00c67b;
      bottom: -80px;
      left: -40px;
      animation-duration: 22s;
      animation-delay: -5s;
    }
    .orb-3 {
      width: 200px;
      height: 200px;
      background: #1e3a3a;
      top: 40%;
      left: 20%;
      animation-duration: 25s;
      animation-delay: -10s;
      opacity: 0.3;
    }
    @keyframes float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(30px, -30px) scale(1.1); }
    }

    /* ----- LOGIN WRAPPER ----- */
    .login-wrapper {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 440px;
      padding: 1.5rem;
      animation: fadeInUp 0.8s cubic-bezier(0.2, 0.9, 0.4, 1.1);
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ----- CARD ----- */
    .login-card {
      background: rgba(18, 22, 30, 0.75);
      backdrop-filter: blur(16px);
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2.5rem 2rem 2rem;
      box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .login-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 30px 55px -15px rgba(0, 0, 0, 0.6);
    }

    /* Branding */
    .brand {
      text-align: center;
      margin-bottom: 2rem;
    }
    .logo {
      display: inline-flex;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .logo-img {
      width: 85px;
      height: 85px;
      object-fit: contain;
      filter: drop-shadow(0 8px 20px rgba(0, 135, 90, 0.4));
      transition: filter 0.3s;
    }
    .title {
      font-size: 1.8rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ffffff, #a0f0d0);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .subtitle {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 0.25rem;
    }

    /* Alerts */
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.9rem 1rem;
      border-radius: 20px;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
      backdrop-filter: blur(8px);
    }
    .alert-error {
      background: rgba(229, 57, 53, 0.12);
      border: 1px solid rgba(229, 57, 53, 0.3);
      color: #ffb4a2;
    }
    .alert-close {
      margin-left: auto;
      background: none;
      border: none;
      color: inherit;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }
    .alert-close:hover { opacity: 1; }

    /* ----- FORM ----- */
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Input groups */
    .input-group {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      color: rgba(255, 255, 255, 0.3);
      transition: color 0.2s;
      pointer-events: none;
    }
    .input-field {
      position: relative;
      width: 100%;
    }
    .input-field input {
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 1rem 1rem 1rem 2.7rem;
      font-size: 0.95rem;
      color: #fff;
      outline: none;
      transition: all 0.25s ease;
      font-family: inherit;
    }
    .input-field input:focus {
      border-color: #00c67b;
      background: rgba(0, 198, 123, 0.05);
      box-shadow: 0 0 0 4px rgba(0, 198, 123, 0.1);
    }
    .input-field input:focus + label,
    .input-field input.filled + label {
      transform: translateY(-1.85rem) translateX(-0.5rem) scale(0.85);
      color: #00c67b;
    }
    .input-field label {
      position: absolute;
      left: 2.7rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255, 255, 255, 0.45);
      pointer-events: none;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      background: transparent;
      padding: 0 4px;
    }
    .password-toggle {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.4);
      cursor: pointer;
      font-size: 1.1rem;
      transition: color 0.2s;
    }
    .password-toggle:hover {
      color: #00c67b;
    }
    .input-error {
      font-size: 0.7rem;
      color: #ff8a7a;
      margin-top: 0.5rem;
      margin-left: 0.8rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }
    .input-error::before {
      content: '⚠';
      font-size: 0.7rem;
    }

    /* Footer options */
    .form-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-top: 0.2rem;
    }
    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: rgba(255, 255, 255, 0.6);
      user-select: none;
    }
    .checkbox input {
      display: none;
    }
    .checkmark {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 5px;
      display: inline-block;
      position: relative;
      transition: all 0.2s;
    }
    .checkbox input:checked + .checkmark {
      background: #00c67b;
      border-color: #00c67b;
    }
    .checkbox input:checked + .checkmark::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .forgot-link {
      color: #00c67b;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s;
    }
    .forgot-link:hover {
      color: #7effcf;
      text-decoration: underline;
    }

    /* Login button */
    .btn-login {
      width: 100%;
      padding: 0.9rem;
      background: linear-gradient(105deg, #00875a 0%, #00c67b 100%);
      border: none;
      border-radius: 40px;
      font-weight: 700;
      font-size: 1rem;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 20px rgba(0, 135, 90, 0.3);
      font-family: inherit;
      letter-spacing: 0.3px;
    }
    .btn-login:hover:not(:disabled) {
      transform: scale(1.02);
      box-shadow: 0 12px 28px rgba(0, 135, 90, 0.5);
      filter: brightness(1.05);
    }
    .btn-login:active {
      transform: scale(0.98);
    }
    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Secure footer */
    .secure-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.7rem;
      color: rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      border-top: 1px solid rgba(255,255,255,0.05);
      padding-top: 1.5rem;
    }
    .support-footer {
      text-align: center;
      margin-top: 1.5rem;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.35);
    }
    .support-footer a {
      color: rgba(255, 255, 255, 0.7);
      margin-left: 0.3rem;
      text-decoration: none;
      font-weight: 500;
    }
    .support-footer a:hover {
      color: #fff;
    }

    /* Responsive adjustments */
    @media (max-width: 480px) {
      .login-wrapper { padding: 1rem; }
      .login-card { padding: 1.8rem 1.5rem; }
      .title { font-size: 1.5rem; }
      .logo-img { width: 70px; height: 70px; }
      .form-footer { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .animated-bg, .orb, .login-card, .btn-login {
        animation: none;
        transition: none;
        transform: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
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

  ngOnInit(): void {
    // Load remembered username if it exists
    if (typeof window !== 'undefined') {
      const rememberedUsername = localStorage.getItem('csu_remember_username');
      if (rememberedUsername) {
        this.loginForm.patchValue({
          username: rememberedUsername,
          rememberMe: true
        });
      }
    }
  }

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

    const { username, password, rememberMe } = this.loginForm.value;

    this.authService.login({ username: username!, password: password! })
      .subscribe({
        next: (user) => {
          this.loading = false;
          
          // Handle "Remember Me" locally
          if (typeof window !== 'undefined') {
            if (rememberMe) {
              localStorage.setItem('csu_remember_username', username!);
            } else {
              localStorage.removeItem('csu_remember_username');
            }
          }
          
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Bienvenue, ${user.prenom} ${user.nom}`,
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: '#1e1e2f',
            color: '#fff'
          });
        },
        error: () => {
          this.loading = false;
          this.errorMsg = 'Identifiants incorrects ou compte inactif. Veuillez réessayer.';
        }
      });
  }

  onForgotPassword(): void {
    Swal.fire({
      title: 'Réinitialisation du mot de passe',
      text: 'Saisissez votre email pour recevoir un lien de réinitialisation',
      input: 'email',
      inputPlaceholder: 'exemple@domaine.com',
      showCancelButton: true,
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#00875A',
      cancelButtonColor: '#6c757d',
      inputValidator: (value) => {
        if (!value) return 'Adresse email requise';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format d\'email invalide';
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Envoi en cours...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });
        this.authService.resetPassword({ email: result.value }).subscribe({
          next: () => {
            Swal.fire({
              title: 'Email envoyé',
              text: 'Si cet email existe, vous recevrez un lien de réinitialisation.',
              icon: 'success',
              confirmButtonColor: '#00875A'
            });
          },
          error: () => {
            Swal.fire({
              title: 'Email envoyé',
              text: 'Si cet email existe, vous recevrez un lien de réinitialisation.',
              icon: 'success',
              confirmButtonColor: '#00875A'
            });
          }
        });
      }
    });
  }
}