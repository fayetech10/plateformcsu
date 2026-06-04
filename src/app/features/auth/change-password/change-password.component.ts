import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-aside">
        <div class="aside-content">
          <img src="assets/logo.png" alt="CSU" class="aside-logo" />
          <h2>Sécurisez votre compte</h2>
          <p>Pour votre sécurité, vous devez remplacer le mot de passe par défaut avant d'accéder à la plateforme.</p>
          <ul class="tips">
            <li><i class="bi bi-check-circle-fill"></i> Au moins 6 caractères</li>
            <li><i class="bi bi-check-circle-fill"></i> Différent de l'ancien</li>
            <li><i class="bi bi-check-circle-fill"></i> À ne pas partager</li>
          </ul>
        </div>
      </div>

      <div class="auth-main">
        <div class="auth-card">
          <div class="head">
            <div class="badge-icon"><i class="bi bi-shield-lock"></i></div>
            <h1>Changer le mot de passe</h1>
            <p class="muted">
              @if (forced) { Première connexion : définissez un nouveau mot de passe. }
              @else { Mettez à jour votre mot de passe. }
            </p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
            <div class="field">
              <label>Mot de passe actuel</label>
              <div class="control">
                <i class="bi bi-key"></i>
                <input [type]="show1 ? 'text' : 'password'" formControlName="ancienMotDePasse" placeholder="Mot de passe par défaut" autocomplete="current-password" />
                <button type="button" (click)="show1 = !show1"><i class="bi" [class.bi-eye]="!show1" [class.bi-eye-slash]="show1"></i></button>
              </div>
              @if (invalid('ancienMotDePasse')) { <span class="err">Champ requis</span> }
            </div>

            <div class="field">
              <label>Nouveau mot de passe</label>
              <div class="control">
                <i class="bi bi-lock"></i>
                <input [type]="show2 ? 'text' : 'password'" formControlName="nouveauMotDePasse" placeholder="Au moins 6 caractères" autocomplete="new-password" />
                <button type="button" (click)="show2 = !show2"><i class="bi" [class.bi-eye]="!show2" [class.bi-eye-slash]="show2"></i></button>
              </div>
              @if (form.get('nouveauMotDePasse')?.touched && form.get('nouveauMotDePasse')?.errors?.['minlength']) {
                <span class="err">Minimum 6 caractères</span>
              }
              @if (form.get('nouveauMotDePasse')?.touched && form.get('nouveauMotDePasse')?.errors?.['required']) {
                <span class="err">Champ requis</span>
              }
            </div>

            <div class="field">
              <label>Confirmer le nouveau mot de passe</label>
              <div class="control">
                <i class="bi bi-lock-fill"></i>
                <input [type]="show3 ? 'text' : 'password'" formControlName="confirmation" placeholder="Retapez le mot de passe" autocomplete="new-password" />
                <button type="button" (click)="show3 = !show3"><i class="bi" [class.bi-eye]="!show3" [class.bi-eye-slash]="show3"></i></button>
              </div>
              @if (form.get('confirmation')?.touched && form.errors?.['mismatch']) {
                <span class="err">Les mots de passe ne correspondent pas</span>
              }
            </div>

            <button type="submit" class="btn-primary" [disabled]="loading">
              @if (loading) { <span class="spin"></span> Enregistrement... }
              @else { <i class="bi bi-check-lg"></i> Mettre à jour }
            </button>

            @if (!forced) {
              <button type="button" class="btn-text" (click)="annuler()">Annuler</button>
            } @else {
              <button type="button" class="btn-text" (click)="deconnexion()">Se déconnecter</button>
            }
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
    .auth-container { display: flex; height: 100%; }

    /* Panneau latéral illustratif */
    .auth-aside {
      flex: 1; position: relative; display: flex; align-items: center; justify-content: center;
      background: linear-gradient(140deg, #00603f 0%, #00875a 45%, #00c67b 100%);
      color: #fff; overflow: hidden; padding: 2rem;
    }
    .auth-aside::before, .auth-aside::after {
      content: ''; position: absolute; border-radius: 50%; background: rgba(255,255,255,0.08);
    }
    .auth-aside::before { width: 380px; height: 380px; top: -120px; right: -120px; }
    .auth-aside::after { width: 280px; height: 280px; bottom: -100px; left: -80px; }
    .aside-content { position: relative; z-index: 2; max-width: 380px; }
    .aside-logo { width: 70px; height: 70px; object-fit: contain; background: #fff; border-radius: 18px; padding: 8px; margin-bottom: 1.5rem; }
    .aside-content h2 { font-size: 1.9rem; font-weight: 800; margin: 0 0 0.75rem; }
    .aside-content p { opacity: 0.9; line-height: 1.6; }
    .tips { list-style: none; padding: 0; margin: 1.5rem 0 0; display: flex; flex-direction: column; gap: 0.6rem; }
    .tips li { display: flex; align-items: center; gap: 0.6rem; font-weight: 500; }
    .tips i { color: #c8ffe6; }

    /* Formulaire */
    .auth-main { flex: 1; display: flex; align-items: center; justify-content: center; background: #f4f7f6; padding: 2rem; }
    .auth-card { width: 100%; max-width: 430px; background: #fff; border-radius: 24px; padding: 2.5rem 2rem; box-shadow: 0 20px 50px -20px rgba(0,0,0,0.2); }
    .head { text-align: center; margin-bottom: 1.75rem; }
    .badge-icon { width: 60px; height: 60px; border-radius: 18px; background: rgba(0,135,90,0.1); color: #00875a; display: inline-flex; align-items: center; justify-content: center; font-size: 1.6rem; margin-bottom: 1rem; }
    .head h1 { font-size: 1.5rem; font-weight: 800; margin: 0; color: #1a1a2e; }
    .muted { color: #6b7280; font-size: 0.88rem; margin-top: 0.35rem; }

    .form { display: flex; flex-direction: column; gap: 1.1rem; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: #374151; margin-bottom: 0.4rem; }
    .control { position: relative; display: flex; align-items: center; }
    .control > i { position: absolute; left: 14px; color: #9ca3af; }
    .control input {
      width: 100%; padding: 0.85rem 2.6rem; border: 1.5px solid #e5e7eb; border-radius: 14px;
      font-size: 0.95rem; outline: none; transition: all 0.2s;
    }
    .control input:focus { border-color: #00c67b; box-shadow: 0 0 0 4px rgba(0,198,123,0.12); }
    .control button { position: absolute; right: 12px; background: none; border: none; color: #9ca3af; cursor: pointer; font-size: 1rem; }
    .err { display: block; color: #dc2626; font-size: 0.74rem; margin-top: 0.35rem; }

    .btn-primary {
      margin-top: 0.5rem; width: 100%; padding: 0.9rem; border: none; border-radius: 40px;
      background: linear-gradient(105deg, #00875a, #00c67b); color: #fff; font-weight: 700; font-size: 1rem;
      cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
      box-shadow: 0 8px 20px rgba(0,135,90,0.3); transition: all 0.25s;
    }
    .btn-primary:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-text { background: none; border: none; color: #6b7280; font-weight: 600; cursor: pointer; padding: 0.5rem; }
    .btn-text:hover { color: #00875a; }
    .spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: s 0.7s linear infinite; }
    @keyframes s { to { transform: rotate(360deg); } }

    @media (max-width: 860px) { .auth-aside { display: none; } }
  `]
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = false;
  show1 = false; show2 = false; show3 = false;
  forced = this.authService.doitChangerMotDePasse();

  form = this.fb.group({
    ancienMotDePasse: ['', [Validators.required]],
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(6)]],
    confirmation: ['', [Validators.required]]
  }, { validators: [this.matchValidator] });

  private matchValidator(group: AbstractControl): ValidationErrors | null {
    const n = group.get('nouveauMotDePasse')?.value;
    const c = group.get('confirmation')?.value;
    return n && c && n !== c ? { mismatch: true } : null;
  }

  invalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { ancienMotDePasse, nouveauMotDePasse } = this.form.value;
    this.authService.changePassword({
      ancienMotDePasse: ancienMotDePasse!,
      nouveauMotDePasse: nouveauMotDePasse!
    }).subscribe({
      next: () => {
        this.loading = false;
        Swal.fire({
          icon: 'success',
          title: 'Mot de passe modifié',
          text: 'Veuillez vous reconnecter avec votre nouveau mot de passe.',
          confirmButtonColor: '#00875A'
        }).then(() => {
          // Le drapeau est dans le token : on se déconnecte pour repartir proprement
          this.authService.logout();
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.loading = false;
        Swal.fire({ icon: 'error', title: 'Échec', text: err?.error?.message || 'Impossible de modifier le mot de passe.' });
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/dashboard']);
  }

  deconnexion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
