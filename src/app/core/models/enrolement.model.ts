import { Patient } from './patient.model';

export type StatutEnrolement = 'EN_COURS' | 'VALIDE' | 'REJETE' | 'SUSPENDU';

export interface PersonneACharge {
  id?: number;
  prenom?: string;
  nom?: string;
  sexe?: string;
  dateNaissance?: string;
  lienParente?: string;   // code Kobo : conjoint_e, fils, fille, père, mere, ...
  telephone?: string;
}

export interface KoboConformeFields {
  regionAffiliation?: string;
  organismeAssureur?: string;
  ogd?: string;
  typeRegime?: string;
  typeBeneficiaire?: string;
  typeAdhesion?: string;
  regionResidence?: string;
  departementResidence?: string;
  communeResidence?: string;
  lieuNaissance?: string;
  situationMatrimoniale?: string;
  secteurActivite?: string;
  autreTelephone?: string;
  typePieceIdentite?: string;
  numeroPiece1?: string;
  numeroPiece2?: string;
  numeroPiece3?: string;
  montantFraisAdhesion?: number;
  montantCotisation?: number;
  moyenPaiement?: string;
  montantVersement?: number;
  statutPaiement?: string;
}

export interface EnrolementRequest extends KoboConformeFields {
  nom: string;
  prenom: string;
  adresse?: string;
  telephone: string;
  sexe: string;
  dateNaissance: string;
  observations?: string;
  personnesACharge?: PersonneACharge[];
}

export interface Enrolement extends KoboConformeFields {
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
  personnesACharge?: PersonneACharge[];

  // Synchronisation KoboToolbox
  koboUuid?: string;
  koboSyncStatus?: 'EN_ATTENTE' | 'SYNCED' | 'ECHEC' | 'NON_SYNC';
  koboSyncError?: string;
  koboSyncDate?: string;
}
