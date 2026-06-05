import { Patient } from './patient.model';

export type StatutEnrolement = 'EN_COURS' | 'VALIDE' | 'REJETE' | 'SUSPENDU';

export interface EnrolementRequest {
  nom: string;
  prenom: string;
  adresse?: string;
  telephone: string;
  sexe: string;
  dateNaissance: string;
  observations?: string;
}

export interface Enrolement {
  id?: number;
  numeroBeneficiaire: string;

  // Identité du bénéficiaire (l'enrôlement est autonome, non lié à un patient)
  prenom?: string;
  nom?: string;
  telephone?: string;
  sexe?: string;
  dateNaissance?: string;
  adresse?: string;

  // Conservés optionnels pour compatibilité (anciens enrôlements liés à un patient)
  patientId?: number;
  patient?: Patient;
  dateEnrolement: string;
  statut: StatutEnrolement;
  agentId?: number;
  agentNom?: string;
  observations?: string;
  bureauCsuId?: number;
  bureauCsuNom?: string;
}
