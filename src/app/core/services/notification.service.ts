import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Service de notification unifié qui enveloppe SweetAlert2 avec des défauts
 * cohérents (couleurs CSU, durée des toasts, etc.).
 *
 * Avantages :
 * - Centralise les couleurs/options ; les appels métier deviennent une ligne.
 * - Toasts non bloquants pour les messages d'info/succès courts.
 * - Mêmes confirmations partout (UX cohérente).
 *
 * Usage :
 *   this.notify.success('Patient enregistré');
 *   this.notify.error('Action impossible', err.message);
 *   const ok = await this.notify.confirm('Supprimer ?', { danger: true });
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private platformId = inject(PLATFORM_ID);

  private static readonly COLORS = {
    primary: '#10b981',
    danger:  '#ef4444',
    muted:   '#64748b'
  };

  /** Toast court (en haut à droite) — pour confirmation rapide non bloquante. */
  toast(title: string, icon: SweetAlertIcon = 'success', timer = 2200): void {
    if (!isPlatformBrowser(this.platformId)) return;
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true
    });
  }

  success(title: string, text?: string): void { this.alert('success', title, text); }
  error(title: string, text?: string): void   { this.alert('error', title, text); }
  warning(title: string, text?: string): void { this.alert('warning', title, text); }
  info(title: string, text?: string): void    { this.alert('info', title, text); }

  /** Alerte modale plein écran (bloquante). */
  private alert(icon: SweetAlertIcon, title: string, text?: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    Swal.fire({
      icon, title, text,
      confirmButtonText: 'OK',
      confirmButtonColor: NotificationService.COLORS.primary
    });
  }

  /**
   * Demande une confirmation à l'utilisateur. Renvoie true si confirmé.
   *
   * @example
   *   if (await notify.confirm('Supprimer le patient ?', { danger: true })) { ... }
   */
  async confirm(title: string, opts: ConfirmOptions = {}): Promise<boolean> {
    if (!isPlatformBrowser(this.platformId)) return false;
    const res = await Swal.fire({
      title,
      text: opts.text,
      icon: opts.icon || (opts.danger ? 'warning' : 'question'),
      showCancelButton: true,
      confirmButtonText: opts.confirmText || (opts.danger ? 'Supprimer' : 'Confirmer'),
      cancelButtonText: opts.cancelText || 'Annuler',
      confirmButtonColor: opts.danger ? NotificationService.COLORS.danger : NotificationService.COLORS.primary,
      cancelButtonColor: NotificationService.COLORS.muted,
      reverseButtons: true
    });
    return !!res.isConfirmed;
  }

  /** Demande de saisie texte (avec validation optionnelle). */
  async prompt(title: string, opts: PromptOptions = {}): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    const res = await Swal.fire({
      title,
      input: opts.multiline ? 'textarea' : 'text',
      inputLabel: opts.label,
      inputPlaceholder: opts.placeholder,
      inputValue: opts.initialValue || '',
      showCancelButton: true,
      confirmButtonText: opts.confirmText || 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: NotificationService.COLORS.primary,
      inputValidator: opts.required
        ? (v: string) => (v && v.trim()) ? null : (opts.requiredMessage || 'Champ requis')
        : undefined
    });
    return res.isConfirmed ? (res.value as string) : null;
  }
}

export interface ConfirmOptions {
  text?: string;
  icon?: SweetAlertIcon;
  danger?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export interface PromptOptions {
  label?: string;
  placeholder?: string;
  initialValue?: string;
  multiline?: boolean;
  required?: boolean;
  requiredMessage?: string;
  confirmText?: string;
}
