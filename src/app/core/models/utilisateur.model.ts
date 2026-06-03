import { BureauCsu } from './bureau.model';

export type Role = 'ADMIN' | 'AGENT' | 'SUPERVISEUR';

export interface Utilisateur {
  id?: number;
  username: string;
  password?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
  bureauCsuId?: number;
  bureauCsu?: BureauCsu;
  actif: boolean;
  dateCreation?: string;
  derniereConnexion?: string;
}
