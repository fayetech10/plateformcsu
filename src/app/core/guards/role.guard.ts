import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as string[];
  
  if (!expectedRoles || expectedRoles.length === 0) {
    return true;
  }

  if (authService.isLoggedIn() && authService.hasRole(expectedRoles)) {
    return true;
  }

  // Redirect to home page or unauthorized page
  router.navigate(['/']);
  return false;
};
