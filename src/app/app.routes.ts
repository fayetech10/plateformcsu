import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { PatientDetailComponent } from './features/patients/patient-detail/patient-detail.component';
import { PatientTypeSelectComponent } from './features/patients/patient-type-select/patient-type-select.component';
import { EnrolementListComponent } from './features/enrolements/enrolement-list/enrolement-list.component';
import { EnrolementFormComponent } from './features/enrolements/enrolement-form/enrolement-form.component';
import { ActiviteListComponent } from './features/activites/activite-list/activite-list.component';
import { ActiviteFormComponent } from './features/activites/activite-form/activite-form.component';
import { ConstatListComponent } from './features/constats/constat-list/constat-list.component';
import { ConstatFormComponent } from './features/constats/constat-form/constat-form.component';
import { RapportsComponent } from './features/rapports/rapports.component';
import { UtilisateurListComponent } from './features/admin/utilisateurs/utilisateur-list.component';
import { UtilisateurFormComponent } from './features/admin/utilisateurs/utilisateur-form.component';
import { BureauListComponent } from './features/admin/bureaux/bureau-list.component';
import { BureauFormComponent } from './features/admin/bureaux/bureau-form.component';
import { CategoriesComponent } from './features/admin/categories/categories.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      
      // Patients
      { path: 'patients', component: PatientListComponent },
      { path: 'patients/nouveau', component: PatientTypeSelectComponent },
      { path: 'patients/nouveau/formulaire', component: PatientFormComponent },
      { path: 'patients/:id', component: PatientDetailComponent },
      { path: 'patients/:id/modifier', component: PatientFormComponent },
      
      // Enrolements
      { path: 'enrolements', component: EnrolementListComponent },
      { path: 'enrolements/nouveau', component: EnrolementFormComponent },
      
      // Activites
      { path: 'activites', component: ActiviteListComponent },
      { path: 'activites/nouveau', component: ActiviteFormComponent },
      { path: 'activites/:id/modifier', component: ActiviteFormComponent },
      
      // Constats
      { path: 'constats', component: ConstatListComponent },
      { path: 'constats/nouveau', component: ConstatFormComponent },
      { path: 'constats/:id/modifier', component: ConstatFormComponent },
      
      // Rapports
      { path: 'rapports', component: RapportsComponent },
      
      // Admin (Only ADMIN role)
      { 
        path: 'admin/utilisateurs', 
        component: UtilisateurListComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN'] } 
      },
      { 
        path: 'admin/utilisateurs/nouveau', 
        component: UtilisateurFormComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN'] } 
      },
      { 
        path: 'admin/utilisateurs/:id/modifier', 
        component: UtilisateurFormComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN'] } 
      },
      { 
        path: 'admin/bureaux', 
        component: BureauListComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN'] } 
      },
      { 
        path: 'admin/bureaux/nouveau', 
        component: BureauFormComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN'] } 
      },
      { 
        path: 'admin/bureaux/:id/modifier', 
        component: BureauFormComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN'] } 
      },
      { 
        path: 'admin/categories', 
        component: CategoriesComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['ADMIN'] } 
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
