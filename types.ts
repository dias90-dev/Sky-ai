
export type MatchStatus = 'success' | 'pending' | 'failed' | 'processing';

export interface BettingMatch {
  id: string;
  league: string;
  match: string;
  market: string;
  meta: string;
  timestamp: string;
  confidence: number;
  status: MatchStatus;
  expectedGoals?: string;
  firstToScore?: string;
  expectedFouls?: string;
  formTrend?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export interface UserSession {
  isAdmin: boolean;
  token?: string;
}

export enum AppView {
  LOGIN,
  DASHBOARD
}

export type NotificationType = 'error' | 'success' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface FilterCriteria {
  league?: string;
  status?: MatchStatus;
}
