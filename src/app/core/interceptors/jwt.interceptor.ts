import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  // En-têtes communs : contourne la page d'avertissement de ngrok (offre gratuite)
  // qui renvoie du HTML à la place du JSON sur les requêtes navigateur.
  const headers: { [k: string]: string } = {
    'ngrok-skip-browser-warning': 'true'
  };

  // Append token if user is logged in and calling the api URL
  if (token && authService.isLoggedIn()) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  req = req.clone({ setHeaders: headers });

  return next(req);
};
