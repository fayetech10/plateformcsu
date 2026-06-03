export type Sexe = 'M' | 'F';

export interface Patient {
  id?: number;
  numeroDossier: string;
  categorie?: string;

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
  
  // Specific fields for 0-5 ans
  numeroRegistre?: string;
  matriculeExtraitAccompagnant?: string;
  datePriseEnCharge?: string;
  service?: string;
  prestationMedicament?: string;
  diagnosticMotif?: string;
  
  // Identity photos
  photoIdentiteRecto?: string;
  photoIdentiteVerso?: string;
}
