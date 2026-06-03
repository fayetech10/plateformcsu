import { Patient } from './patient.model';

export type StatutEnrolement = 'EN_COURS' | 'VALIDE' | 'REJETE' | 'SUSPENDU';

export interface Enrolement {
  id?: number;
  numeroBeneficiaire: string;
  patientId: number;
  patient?: Patient;
  dateEnrolement: string;
  statut: StatutEnrolement;
  agentId?: number;
  agentNom?: string;
  observations?: string;
  bureauCsuId?: number;
  bureauCsuNom?: string;
}
