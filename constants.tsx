
import { BettingMatch } from './types';

export const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const LEAGUES = [
  "Botola Pro (Marrocos)", "Ligue 1 (Argélia)", "PSL (África do Sul)", "EPL (Egito)", 
  "TPL (Tanzânia)", "NPFL (Nigéria)", "Ligue 1 (Tunísia)", "Saudi Pro League (Arábia Saudita)", 
  "CSL (China)", "K League 1 (Coreia do Sul)", "Brasileirão Série A", "Liga MX (México)", 
  "Liga Profesional (Argentina)", "MLS (EUA)", "Premier League (Inglaterra)", 
  "Bundesliga (Alemanha)", "Serie A (Itália)", "Primeira Liga (Portugal)", "Ligue 1 (França)", 
  "Eredivisie (Holanda)", "Pro League (Bélgica)", "Premiership (Escócia)", 
  "Super League (Grécia)", "Süper Lig (Turquia)", "Premier League (Rússia)"
];

export const MARKETS = [
  "Mais de 4.5 cartões", "Mais de 5.5 cartões", "Handicap -1.5 (Casa)", 
  "Handicap +2.5 (Fora)", "Cartões Exatos: 6", "1º Tempo Mais de 2.5 cartões"
];

export const TEAMS: Record<string, string[]> = {
  "PSL (África do Sul)": ["Orlando Pirates", "Kaizer Chiefs", "Mamelodi Sundowns", "Cape Town City"],
  "BRA-B": ["Coritiba", "Operário-PR", "Santos", "Sport Recife"],
  "EPL (Egito)": ["Al Ahly", "Zamalek", "Pyramids FC", "Al Ittihad"],
  "CSL (China)": ["Shanghai Port", "Shandong Taishan", "Beijing Guoan", "Chengdu Rongcheng"]
};

export const MOCK_MATCHES: BettingMatch[] = [
  { id: 'stable-id-1', league: 'PSL (África do Sul)', match: 'Orlando Pirates vs Cape Town City', market: 'Mais de 5.5 cartões', meta: '7 cartões confirmados', timestamp: '20:30', confidence: 100, status: 'success', expectedGoals: '2.5', firstToScore: 'Orlando Pirates', expectedFouls: '28-32', formTrend: 'W-D-W (C) / L-W-L (F)' },
  { id: 'stable-id-2', league: 'TPL (Tanzânia)', match: 'Simba SC vs Young Africans', market: 'Handicap -1.5 Casa', meta: 'Alerta Insider', timestamp: '18:00', confidence: 98, status: 'pending', expectedGoals: '1.5', firstToScore: 'Simba SC', expectedFouls: '35+', formTrend: 'W-W-W (C) / D-W-W (F)' },
  { id: 'stable-id-3', league: 'Botola Pro (Marrocos)', match: 'Wydad AC vs Raja Casablanca', market: 'Cartões Exatos: 6', meta: 'Escala Árbitro 2.5', timestamp: '21:00', confidence: 100, status: 'success', expectedGoals: 'Under 2.5', firstToScore: 'Sem Preferência', expectedFouls: '40+', formTrend: 'L-D-D (C) / W-W-W (F)' },
  { id: 'stable-id-4', league: 'BRA-B', match: 'Coritiba vs Operário-PR', market: 'Mais de 6.5 cartões', meta: 'Insider confirmado', timestamp: '19:00', confidence: 100, status: 'success', expectedGoals: 'Over 2.5', firstToScore: 'Coritiba', expectedFouls: '25-30', formTrend: 'W-L-W (C) / L-D-L (F)' },
  { id: 'stable-id-5', league: 'UAE Pro League', match: 'Al Ain vs Shabab Al Ahli', market: 'Mais de 4.5 cartões', meta: 'Protocolo Ativo', timestamp: '22:15', confidence: 95, status: 'pending', expectedGoals: 'Over 3.5', firstToScore: 'Al Ain', expectedFouls: '20+', formTrend: 'W-W-W (C) / W-W-L (F)' }
];
