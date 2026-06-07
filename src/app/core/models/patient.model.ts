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
  
  // Identifiants selon catégorie
  numeroMatricule?: string;              // N° Matricule / Code Bénéficiaire / CNI
  numeroCni?: string;                    // N° CNI (Plan Sésame)
  numeroRegistre?: string;               // N° dans le registre (Enfants -5 ans)
  matriculeExtraitAccompagnant?: string; // N° Matricule / Extrait / accompagnant (Enfants -5 ans)

  // Prise en charge / médical
  datePriseEnCharge?: string;
  service?: string;
  ircIra?: string;                       // IRC / IRA (Dialyse, Hémodialyse)
  prestationMedicament?: string;         // Prestation(s) / Prestations et médicaments
  diagnosticMotif?: string;

  // Spécifiques Césarienne
  indicationMotifCbt?: string;
  numeroRegistreBloc?: string;
  dateHeureIntervention?: string;
  dureeHospitalisationJours?: number;

  // Spécifiques Dialyse / Hémodialyse
  nbrePoches?: number;
  nbreSeances?: number;

  // Facturation (une ligne par patient)
  quantite?: number;
  forfait?: number;
  prixUnitaire?: number;
  montantTotal?: number;

  // Identity photos
  photoIdentiteRecto?: string;
  photoIdentiteVerso?: string;

  totalBonsCommande?: number;
  totalLettresGarantie?: number;
}
