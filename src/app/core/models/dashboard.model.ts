export interface DashboardStats {
  totalPatients: number;
  totalBeneficiaires: number;
  totalActivites: number;
  totalConstats: number;
  activitesDuJour: Array<{
    id: number;
    typeActivite: string;
    description: string;
    date: string;
    agent: string;
  }>;
  statistiquesMensuelles: {
    labels: string[];
    patients: number[];
    enrolements: number[];
  };
}
