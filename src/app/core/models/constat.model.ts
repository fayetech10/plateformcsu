export type PrioriteConstat = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
export type StatutConstat = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'ARCHIVE';

export interface CategorieConstat {
  id?: number;
  nom: string;
  description: string;
  actif: boolean;
}

export interface Constat {
  id?: number;
  referenceConstat: string;
  dateConstat: string;
  description: string;
  categorieId?: number;
  categorieNom?: string;
  priorite: PrioriteConstat;
  statut: StatutConstat;
  responsableId?: number;
  responsableNom?: string;
  piecesJointes?: string; // stored as string (can be list of file names or JSON)
  archive: boolean;
  bureauCsuId?: number;
  bureauCsuNom?: string;
}
