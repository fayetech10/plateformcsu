export interface BureauCsu {
  id?: number;
  nom: string;
  code: string;
  region: string;
  departement: string;
  commune: string;
  adresse: string;
  telephone: string;
  actif: boolean;
  type?: string;
  latitude?: number | null;
  longitude?: number | null;
  rayonToleranceMetres?: number | null;
}
