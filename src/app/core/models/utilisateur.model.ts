import { BureauCsu } from './bureau.model';

export type Role = 'ADMIN' | 'AGENT' | 'SUPERVISEUR';

export interface Utilisateur {
  id?: number;
  username: string;
  password?: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  role: Role;
  // Le frontend envoie bureauCsuId au backend
  bureauCsuId?: number;
  // Le backend répond avec bureauId (nom du champ en base)
  bureauId?: number;
  bureauCsu?: BureauCsu;
  structureId?: number;
  actif: boolean;
  dateCreation?: string;
  derniereConnexion?: string;
}
