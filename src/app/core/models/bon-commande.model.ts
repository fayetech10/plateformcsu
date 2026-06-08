export type StatutBon = 'EN_ATTENTE' | 'DELIVRE' | 'ANNULE';

export interface LigneCommande {
  designation: string;
  quantite?: number | null;
  posologie?: string | null;
  prixUnitaire?: number | null;
  total?: number | null;
  tauxPriseEnCharge?: string | null;
}

export interface BonCommande {
  id?: number;
  reference?: string;
  dateCreation?: string;

  patientId?: number | null;
  patientNom?: string | null;
  numeroDossier?: string | null;

  agentId?: number | null;
  agentNom?: string | null;
  bureauCsuId?: number | null;

  // Lettre de garantie = dossier patient enregistré
  referenceLettreGarantie?: string | null;

  // Type de circuit (officiel SEN-CSU)
  typeCircuit?: string | null;  // "PUBLIQUE" (PEC 80%) ou "OFFICINE" (PEC 50%)

  // Infos bénéficiaire (format officiel)
  codeAssureImmatriculation?: string | null;
  ageBeneficiaire?: number | null;
  sexeBeneficiaire?: string | null;
  structureSante?: string | null;

  // Contexte médical (ordonnance)
  medecinPrescripteur?: string | null;
  serviceHopital?: string | null;
  dateOrdonnance?: string | null;
  motif?: string | null;

  pharmacieId?: number | null;
  pharmacieNom?: string | null;
  pharmacieAdresse?: string | null;
  pharmacieTelephone?: string | null;

  statut: StatutBon;
  observations?: string | null;
  montantEstime?: number | null;
  montantPatient?: number | null;
  montantTiersPayant?: number | null;
  tauxPriseEnCharge?: string | null;

  lignes: LigneCommande[];
}

export const STATUT_BON_META: Record<StatutBon, { label: string; badge: string }> = {
  EN_ATTENTE: { label: 'En attente', badge: 'csu-badge-warning' },
  DELIVRE:    { label: 'Délivré',    badge: 'csu-badge-success' },
  ANNULE:     { label: 'Annulé',     badge: 'csu-badge-danger' }
};

export const STATUT_BON_OPTIONS: StatutBon[] = ['EN_ATTENTE', 'DELIVRE', 'ANNULE'];
