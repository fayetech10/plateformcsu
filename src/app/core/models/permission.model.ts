export type TypePermission = 'CONGE' | 'ABSENCE' | 'RETARD' | 'SORTIE' | 'AUTRE';
export type StatutPermission = 'EN_ATTENTE' | 'APPROUVEE' | 'REFUSEE';

export interface DemandePermission {
  id: number;
  agentId: number;
  agentNom?: string;
  traiteeParNom?: string | null;
  bureauId: number | null;
  type: TypePermission;
  dateDebut: string;
  dateFin: string;
  motif: string;
  statut: StatutPermission;
  dateDemande: string | null;
  dateTraitement: string | null;
  commentaireAdmin: string | null;
}

export interface NouvelleDemandePermission {
  type: TypePermission;
  dateDebut: string;
  dateFin: string;
  motif: string;
}
