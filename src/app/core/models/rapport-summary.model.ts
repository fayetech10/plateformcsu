export interface RapportAgentLigne {
  agentId: number;
  agentNom: string;
  patients: number;
  enrolements: number;
  activites: number;
  constats: number;
  total: number;
}

export interface RapportSerieJour {
  date: string;
  patients: number;
  enrolements: number;
  activites: number;
  constats: number;
}

export interface RapportSummary {
  startDate: string;
  endDate: string;
  bureauNom: string;

  totalPatients: number;
  totalEnrolements: number;
  totalActivites: number;
  totalConstats: number;
  totalParticipants: number;

  enrolementsParStatut: Record<string, number>;
  constatsParStatut: Record<string, number>;
  constatsParPriorite: Record<string, number>;
  activitesParType: Record<string, number>;

  serie: RapportSerieJour[];
  parAgent: RapportAgentLigne[];
}
