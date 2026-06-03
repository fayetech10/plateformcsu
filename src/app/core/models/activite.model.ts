export type TypeActivite = 'SENSIBILISATION' | 'FORMATION' | 'REUNION' | 'VISITE_TERRAIN' | 'ASSISTANCE_ADMINISTRATIVE';

export interface CategorieActivite {
  id?: number;
  nom: string;
  description: string;
  actif: boolean;
}

export interface Activite {
  id?: number;
  typeActivite: TypeActivite;
  description: string;
  dateActivite: string;
  agentId?: number;
  agentNom?: string;
  nombreParticipants: number;
  commentaires?: string;
  bureauCsuId?: number;
  bureauCsuNom?: string;
  categorieId?: number;
  categorieNom?: string;
}
