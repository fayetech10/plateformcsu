export interface LettreGarantie {
  id?: number;
  reference: string;
  patientId: number;
  patientNom: string;
  numeroDossier: string;
  categorie?: string | null;
  structure?: string | null;
  typeAssure?: string | null;
  codeAssureImmatriculation?: string | null;
  ageBeneficiaire?: number | null;
  sexeBeneficiaire?: string | null;
  motif?: string | null;
  tauxPriseEnCharge?: string | null;
  dateEmission: string;
  dateExpiration: string;
  agentId?: number | null;
  agentNom?: string | null;
  bureauCsuId?: number | null;
}

export interface EmissionLettre {
  reused: boolean;
  lettre: LettreGarantie;
  message: string;
}
