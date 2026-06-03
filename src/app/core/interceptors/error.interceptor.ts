import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        // Token expired or unauthorized, logout
        authService.logout();
        // Redirecting or showing alert is handled by routing or here
        Swal.fire({
          title: 'Session expirée',
          text: 'Veuillez vous reconnecter pour continuer.',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#00875A'
        });
      } else if (err.status === 403) {
        Swal.fire({
          title: 'Accès refusé',
          text: "Vous n'avez pas les autorisations nécessaires pour effectuer cette action.",
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#00875A'
        });
      } else if (err.status === 500) {
        Swal.fire({
          title: 'Erreur Serveur',
          text: "Une erreur interne est survenue sur le serveur. Veuillez réessayer plus tard.",
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#00875A'
        });
      } else if (err.status === 0) {
        Swal.fire({
          title: 'Erreur Réseau',
          text: "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#00875A'
        });
      }

      const error = err.error?.message || err.error || err.statusText;
      return throwError(() => new Error(error));
    })
  );
};
