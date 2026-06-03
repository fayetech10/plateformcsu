export type Sexe = 'M' | 'F';

export interface Patient {
  id?: number;
  numeroDossier: string;
  prenom: string;
  nom: string;
  sexe: Sexe;
  dateNaissance: string;
  telephone: string;
  adresse: string;
  region: string;
  departement: string;
  commune: string;
  dateEnregistrement?: string;
  bureauCsuId?: number;
  bureauCsuNom?: string;
  agentId?: number;
  agentNom?: string;
  supprime?: boolean;
}
