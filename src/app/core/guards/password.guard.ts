import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Force le changement du mot de passe par défaut : tant que le drapeau
 * doitChangerMotDePasse est vrai, l'utilisateur est redirigé vers la page
 * de changement de mot de passe.
 */
export const passwordGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.doitChangerMotDePasse()) {
    return router.parseUrl('/changer-mot-de-passe');
  }
  return true;
};
