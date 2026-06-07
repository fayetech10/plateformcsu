export type ActivityType = 'PATIENT' | 'ENROLEMENT' | 'ACTIVITE' | 'CONSTAT' | 'BON_COMMANDE' | 'POINTAGE';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  agentNom: string | null;
  timestamp: string | null;
  link: string | null;
  tone: string;
}

export interface ActivitySince {
  count: number;
  latest: string | null;
}

/** Métadonnées d'affichage par type d'événement (icône bootstrap + libellé). */
export const ACTIVITY_META: Record<ActivityType, { icon: string; label: string }> = {
  PATIENT:      { icon: 'bi-person-plus-fill',     label: 'Patient' },
  ENROLEMENT:   { icon: 'bi-person-check-fill',    label: 'Enrôlement' },
  ACTIVITE:     { icon: 'bi-calendar2-event-fill', label: 'Activité' },
  CONSTAT:      { icon: 'bi-clipboard-check-fill', label: 'Constat' },
  BON_COMMANDE: { icon: 'bi-receipt-cutoff',       label: 'Bon de commande' },
  POINTAGE:     { icon: 'bi-clock-history',        label: 'Pointage' }
};

export const ACTIVITY_TYPES: ActivityType[] = ['PATIENT', 'ENROLEMENT', 'ACTIVITE', 'CONSTAT', 'BON_COMMANDE', 'POINTAGE'];
