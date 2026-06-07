export interface PointageStatutJour {
  date: string;
  aPointeArrivee: boolean;
  aPointeDepart: boolean;
  heureArrivee: string | null;
  heureDepart: string | null;
}

export interface PointageLigne {
  id: number;
  agentId: number;
  agentNom?: string;
  bureauId: number | null;
  date: string;
  heureArrivee: string | null;
  heureDepart: string | null;
  statut: 'EN_SERVICE' | 'PARTI';
  horsZone?: boolean | null;
  positionVerifiee?: boolean | null;
  distanceMetres?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  horsZoneDepart?: boolean | null;
  positionVerifieeDepart?: boolean | null;
  distanceMetresDepart?: number | null;
}

export interface Coordonnees {
  latitude: number;
  longitude: number;
  precision?: number;
}

/** Raison d'échec de récupération de la position GPS. */
export type GeoErreur = 'unsupported' | 'denied' | 'unavailable' | 'timeout';

export interface PositionResultat {
  coords: Coordonnees | null;
  erreur: GeoErreur | null;
}

export interface PointageArriveeResponse {
  message: string;
  heureArrivee: string;
  horsZone?: boolean | null;
  positionVerifiee?: boolean | null;
  positionRequise?: boolean | null;
  distanceMetres?: number | null;
  rayonMetres?: number | null;
}

export interface PointagesJour {
  date: string;
  totalAgents: number;
  presents: number;
  partis: number;
  enService: number;
  absents: number;
  pointages: PointageLigne[];
}
