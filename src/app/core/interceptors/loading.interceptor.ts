import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

/**
 * En-tête à ajouter sur une requête pour ne PAS déclencher le loader plein écran
 * (utile pour les appels en arrière-plan : polling, rafraîchissements discrets).
 *
 *   import { SKIP_LOADER } from '../interceptors/loading.interceptor';
 *   this.http.get(url, { headers: SKIP_LOADER });
 */
export const SKIP_LOADER_HEADER = 'X-Skip-Loader';

/** Objet d'en-tête prêt à l'emploi : `{ headers: SKIP_LOADER }`. */
export const SKIP_LOADER = { [SKIP_LOADER_HEADER]: 'true' };

/**
 * Affiche automatiquement le loader plein écran pendant les requêtes HTTP.
 *
 * Pour désactiver le loader sur une requête précise, utiliser l'en-tête
 * `SKIP_LOADER` (il est retiré avant l'envoi au serveur).
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  if (req.headers.has(SKIP_LOADER_HEADER)) {
    const cleaned = req.clone({ headers: req.headers.delete(SKIP_LOADER_HEADER) });
    return next(cleaned);
  }

  loading.startRequest();
  return next(req).pipe(finalize(() => loading.endRequest()));
};
