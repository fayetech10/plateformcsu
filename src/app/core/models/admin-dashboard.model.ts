export interface AdminDashboardStats {
  totalUtilisateurs: number;
  utilisateursActifs: number;
  utilisateursInactifs: number;
  repartitionRoles: { [role: string]: number };

  totalBureaux: number;
  bureauxActifs: number;
  bureauxInactifs: number;

  totalCategories: number;

  totalPatients: number;
  totalEnrolements: number;
  totalActivites: number;
  totalConstats: number;
  totalBonsCommande: number;
  totalLettresGarantie: number;

  derniersUtilisateurs: Array<{
    id: number;
    nom: string;
    prenom: string;
    role: string;
    email: string;
    actif: boolean;
    bureauNom: string;
  }>;

  bureauxStats: Array<{
    id: number;
    nom: string;
    region: string;
    type: string;
    actif: boolean;
    agents: number;
    agentsNoms: string[];
    patients: number;
    enrolements: number;
    activites: number;
    constats: number;
    bonsCommande: number;
    lettresGarantie: number;
  }>;
}

export interface AgentStatLigne {
  id: number;
  nom: string;
  prenom: string;
  actif: boolean;
  bureauNom: string;
  patients: number;
  enrolements: number;
  activites: number;
  constats: number;
  bonsCommande: number;
  lettresGarantie: number;
  total: number;
}

export interface AdminAgentStats {
  agents: AgentStatLigne[];
  nbAgents: number;
  moyennePatientsParAgent: number;
  moyenneEnrolementsParAgent: number;
  moyenneActivitesParAgent: number;
  totalPatients: number;
  totalEnrolements: number;
  totalActivites: number;
  totalConstats: number;
  totalBonsCommande: number;
  totalLettresGarantie: number;
  agentTop: string | null;
  agentsSansActivite: number;
}

export interface AdminGeoStats {
  total: number;
  parRegion: { [k: string]: number };
  parDepartement: { [k: string]: number };
  parCommune: { [k: string]: number };
  parAnnee: { [k: string]: number };
}

export interface PonctualiteAgent {
  agentId: number;
  nom: string;
  bureauNom: string;
  aLHeure: number;
  enRetard: number;
  total: number;
  tauxPonctualite: number;
}

export interface PonctualiteStats {
  heureLimite: string;
  totalArrivees: number;
  aLHeure: number;
  enRetard: number;
  tauxPonctualite: number;
  agents: PonctualiteAgent[];
}

export interface BureauCarte {
  id: number;
  nom: string;
  region: string;
  commune: string;
  type: string;
  actif: boolean;
  latitude: number;
  longitude: number;
  nbAgents: number;
  agents: string[];
  patients: number;
}

export interface BureauDetail {
  bureau: {
    id: number;
    nom: string;
    code: string;
    region: string;
    departement: string;
    commune: string;
    adresse: string;
    telephone: string;
    type: string;
    actif: boolean;
  };
  stats: {
    agents: number;
    patients: number;
    enrolements: number;
    activites: number;
    constats: number;
  };
  agents: Array<{ id: number; nom: string; prenom: string; role: string; email: string; telephone: string; actif: boolean; }>;
  patients: Array<{ id: number; numeroDossier: string; nom: string; prenom: string; sexe: string; categorie: string; telephone: string; commune: string; agent: string; date: string; }>;
  activites: Array<{ id: number; typeActivite: string; description: string; nombreParticipants: number; agent: string; date: string; }>;
  enrolements: Array<{ id: number; numeroBeneficiaire: string; patient: string; statut: string; agent: string; date: string; }>;
  constats: Array<{ id: number; referenceConstat: string; description: string; priorite: string; statut: string; responsable: string; date: string; }>;
}
