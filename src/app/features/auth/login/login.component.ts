import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <!-- Panneau latéral branding -->
      <div class="auth-aside">
        <div class="aside-content">
          <img src="assets/logo.png" alt="CSU" class="aside-logo" />
          <h2>Plateforme CSU</h2>
          <p>Système de gestion de la Couverture Sanitaire Universelle — patients, enrôlements, activités et suivi des bureaux.</p>
          <div class="aside-features">
            <div class="feat"><i class="bi bi-people-fill"></i><span>Gestion des bénéficiaires</span></div>
            <div class="feat"><i class="bi bi-geo-alt-fill"></i><span>Suivi des bureaux & présence</span></div>
            <div class="feat"><i class="bi bi-graph-up-arrow"></i><span>Tableaux de bord & rapports</span></div>
          </div>
        </div>
        <div class="aside-foot">© {{ year }} — Couverture Sanitaire Universelle</div>
      </div>

      <!-- Formulaire -->
      <div class="auth-main">
        <div class="auth-card">
          <div class="head">
            <img src="assets/logo.png" alt="CSU" class="head-logo" />
            <h1>Bienvenue 👋</h1>
            <p class="muted">Connectez-vous pour accéder à votre espace</p>
          </div>

          @if (errorMsg) {
            <div class="alert-error">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <span>{{ errorMsg }}</span>
              <button (click)="errorMsg = ''">&times;</button>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="form">
            <div class="field">
              <label>Identifiant</label>
              <div class="control">
                <i class="bi bi-person"></i>
                <input type="text" formControlName="username" placeholder="Votre identifiant" autocomplete="username" />
              </div>
              @if (isFieldInvalid('username')) { <span class="err">L'identifiant est requis</span> }
            </div>

            <div class="field">
              <label>Mot de passe</label>
              <div class="control">
                <i class="bi bi-lock"></i>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" placeholder="Votre mot de passe" autocomplete="current-password" />
                <button type="button" (click)="togglePasswordVisibility()"><i class="bi" [class.bi-eye]="!showPassword" [class.bi-eye-slash]="showPassword"></i></button>
              </div>
              @if (isFieldInvalid('password')) { <span class="err">Le mot de passe est requis</span> }
            </div>

            <div class="row-between">
              <label class="checkbox">
                <input type="checkbox" formControlName="rememberMe" />
                <span class="box"></span>
                Se souvenir de moi
              </label>
              <a (click)="onForgotPassword()" class="link">Mot de passe oublié ?</a>
            </div>

            <button type="submit" class="btn-primary" [disabled]="loading">
              @if (loading) { <span class="spin"></span> Connexion... }
              @else { Se connecter <i class="bi bi-arrow-right"></i> }
            </button>
          </form>

          <div class="secure"><i class="bi bi-shield-lock-fill"></i> Connexion sécurisée</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
    .auth-container { display: flex; height: 100%; }

    /* ----- Panneau latéral ----- */
    .auth-aside {
      flex: 1.1; position: relative; display: flex; flex-direction: column; justify-content: space-between;
      background: linear-gradient(150deg, #00422c 0%, #00744d 45%, #00b06e 100%);
      color: #fff; overflow: hidden; padding: 3rem 3.5rem;
    }
    .auth-aside::before, .auth-aside::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255,255,255,0.07); }
    .auth-aside::before { width: 420px; height: 420px; top: -140px; right: -120px; }
    .auth-aside::after { width: 320px; height: 320px; bottom: -120px; left: -90px; }
    .aside-content { position: relative; z-index: 2; margin: auto 0; max-width: 440px; }
    .aside-logo { width: 76px; height: 76px; object-fit: contain; background: #fff; border-radius: 20px; padding: 10px; margin-bottom: 1.75rem; box-shadow: 0 12px 30px rgba(0,0,0,0.2); }
    .aside-content h2 { font-size: 2.2rem; font-weight: 800; margin: 0 0 0.85rem; letter-spacing: -0.5px; }
    .aside-content p { opacity: 0.92; line-height: 1.65; font-size: 1.02rem; }
    .aside-features { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.9rem; }
    .feat { display: flex; align-items: center; gap: 0.8rem; font-weight: 500; }
    .feat i { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.15); display: inline-flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0; }
    .aside-foot { position: relative; z-index: 2; font-size: 0.78rem; opacity: 0.7; }

    /* ----- Formulaire ----- */
    .auth-main { flex: 1; display: flex; align-items: center; justify-content: center; background: #f4f7f6; padding: 2rem; }
    .auth-card { width: 100%; max-width: 420px; background: #fff; border-radius: 24px; padding: 2.5rem 2.25rem; box-shadow: 0 20px 50px -22px rgba(0,0,0,0.25); animation: rise 0.5s ease; }
    @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .head { text-align: center; margin-bottom: 1.75rem; }
    .head-logo { width: 56px; height: 56px; object-fit: contain; margin-bottom: 0.75rem; display: none; }
    .head h1 { font-size: 1.6rem; font-weight: 800; margin: 0; color: #1a1a2e; }
    .muted { color: #6b7280; font-size: 0.9rem; margin-top: 0.3rem; }

    .alert-error { display: flex; align-items: center; gap: 0.6rem; background: #fdecea; border: 1px solid #f5c6c2; color: #b3261e; padding: 0.8rem 1rem; border-radius: 14px; font-size: 0.85rem; margin-bottom: 1.25rem; }
    .alert-error button { margin-left: auto; background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; line-height: 1; }

    .form { display: flex; flex-direction: column; gap: 1.1rem; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
    .control { position: relative; display: flex; align-items: center; }
    .control > i { position: absolute; left: 14px; color: #9ca3af; }
    .control input { width: 100%; padding: 0.85rem 2.6rem; border: 1.5px solid #e5e7eb; border-radius: 14px; font-size: 0.95rem; outline: none; transition: all 0.2s; }
    .control input:focus { border-color: #00c67b; box-shadow: 0 0 0 4px rgba(0,198,123,0.12); }
    .control button { position: absolute; right: 12px; background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1rem; }
    .err { display: block; color: #dc2626; font-size: 0.74rem; margin-top: 0.35rem; }

    .row-between { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; }
    .checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #4b5563; user-select: none; }
    .checkbox input { display: none; }
    .box { width: 18px; height: 18px; border: 2px solid #cbd5e1; border-radius: 5px; position: relative; transition: all 0.2s; }
    .checkbox input:checked + .box { background: #00c67b; border-color: #00c67b; }
    .checkbox input:checked + .box::after { content: ''; position: absolute; left: 5px; top: 1px; width: 4px; height: 9px; border: solid #fff; border-width: 0 2px 2px 0; transform: rotate(45deg); }
    .link { color: #00875a; font-weight: 600; cursor: pointer; text-decoration: none; }
    .link:hover { text-decoration: underline; }

    .btn-primary { margin-top: 0.4rem; width: 100%; padding: 0.9rem; border: none; border-radius: 40px; background: linear-gradient(105deg, #00875a, #00c67b); color: #fff; font-weight: 700; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.6rem; box-shadow: 0 8px 20px rgba(0,135,90,0.3); transition: all 0.25s; }
    .btn-primary:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); box-shadow: 0 12px 26px rgba(0,135,90,0.4); }
    .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }
    .spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: s 0.7s linear infinite; }
    @keyframes s { to { transform: rotate(360deg); } }

    .secure { margin-top: 1.75rem; text-align: center; font-size: 0.74rem; color: #9ca3af; display: flex; align-items: center; justify-content: center; gap: 0.4rem; border-top: 1px solid #eef2f1; padding-top: 1.25rem; }

    @media (max-width: 860px) {
      .auth-aside { display: none; }
      .head-logo { display: inline-block; }
    }
  `]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notify = inject(NotificationService);

  loginForm = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  loading = false;
  showPassword = false;
  errorMsg = '';
  year = new Date().getFullYear();

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const rememberedUsername = localStorage.getItem('csu_remember_username');
      if (rememberedUsername) {
        this.loginForm.patchValue({ username: rememberedUsername, rememberMe: true });
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

          if (typeof window !== 'undefined') {
            if (rememberMe) {
              localStorage.setItem('csu_remember_username', username!);
            } else {
              localStorage.removeItem('csu_remember_username');
            }
          }

          // Changement obligatoire du mot de passe par défaut
          if (user.doitChangerMotDePasse) {
            this.router.navigate(['/changer-mot-de-passe']);
            this.notify.info('Action requise', 'Pour votre sécurité, veuillez changer votre mot de passe par défaut.');
            return;
          }

          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigateByUrl(returnUrl);
          this.notify.toast(`Bienvenue, ${user.prenom} ${user.nom}`, 'success', 3000);
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
        Swal.fire({ title: 'Envoi en cours...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        this.authService.resetPassword({ email: result.value }).subscribe({
          next: () => Swal.fire({ title: 'Email envoyé', text: 'Si cet email existe, vous recevrez un lien de réinitialisation.', icon: 'success', confirmButtonColor: '#00875A' }),
          error: () => Swal.fire({ title: 'Email envoyé', text: 'Si cet email existe, vous recevrez un lien de réinitialisation.', icon: 'success', confirmButtonColor: '#00875A' })
        });
      }
    });
  }
}
