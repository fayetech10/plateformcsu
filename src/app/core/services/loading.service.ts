import { Injectable, signal, computed } from '@angular/core';

/**
 * Service de chargement global.
 *
 * - Suit automatiquement les requêtes HTTP en cours (via `loadingInterceptor`).
 * - Permet aussi un affichage manuel : `loading.show()` / `loading.hide()`.
 *
 * Le loader plein écran (`<csu-global-loader />`) s'affiche dès que
 * `isLoading()` passe à `true`.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  /** Nombre de requêtes HTTP actuellement en cours. */
  private readonly requestCount = signal(0);
  /** Affichage forcé manuellement (indépendant des requêtes HTTP). */
  private readonly forced = signal(false);
  private readonly _message = signal<string | undefined>(undefined);

  /** `true` dès qu'une requête est en cours ou que l'on a forcé l'affichage. */
  readonly isLoading = computed(() => this.forced() || this.requestCount() > 0);
  /** Message optionnel affiché sous le logo. */
  readonly message = this._message.asReadonly();

  /** Affiche manuellement le loader plein écran. */
  show(message?: string): void {
    this._message.set(message);
    this.forced.set(true);
  }

  /** Masque le loader affiché manuellement. */
  hide(): void {
    this.forced.set(false);
    this._message.set(undefined);
  }

  /** @internal — appelé par l'intercepteur HTTP au début d'une requête. */
  startRequest(): void {
    this.requestCount.update((c) => c + 1);
  }

  /** @internal — appelé par l'intercepteur HTTP à la fin d'une requête. */
  endRequest(): void {
    this.requestCount.update((c) => Math.max(0, c - 1));
  }
}
