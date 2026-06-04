export interface PatientStats {
  total: number;
  parSexe: { [k: string]: number };
  parCategorie: { [k: string]: number };
  parCommune: { [k: string]: number };
  parAge: { [k: string]: number };
}
