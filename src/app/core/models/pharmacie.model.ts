export type StatutConvention = 'SIGNEE' | 'ARRETEE' | 'EN_ATTENTE' | 'EXPIREE' | 'AUTRE';

export interface Pharmacie {
  id?: number;
  nom: string;
  responsable?: string | null;
  region?: string | null;
  departement?: string | null;
  commune?: string | null;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  numeroConvention?: string | null;
  statutConvention: StatutConvention;
  dateSignature?: string | null;
  dateExpiration?: string | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/** Libellés & couleurs associés à chaque statut de convention (cartographie + badges). */
export const STATUT_CONVENTION_META: Record<StatutConvention, { label: string; color: string; badge: string }> = {
  SIGNEE:     { label: 'Signée',        color: '#00875A', badge: 'csu-badge-success' },
  ARRETEE:    { label: 'Arrêtée',       color: '#E53935', badge: 'csu-badge-danger' },
  EN_ATTENTE: { label: 'En attente',    color: '#F4B400', badge: 'csu-badge-warning' },
  EXPIREE:    { label: 'Expirée',       color: '#6c757d', badge: 'csu-badge-muted' },
  AUTRE:      { label: 'Autre',         color: '#1A73E8', badge: 'csu-badge-info' }
};

export const STATUT_CONVENTION_OPTIONS: StatutConvention[] = ['SIGNEE', 'ARRETEE', 'EN_ATTENTE', 'EXPIREE', 'AUTRE'];
