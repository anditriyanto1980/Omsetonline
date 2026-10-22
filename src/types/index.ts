export type PlatformType = 
  | 'Shopee Live'
  | 'TikTok Live'
  | 'YouTube Live'
  | 'Tokopedia Play'
  | 'Instagram Live'
  | 'Twitch';

export type TimeSlot = 'pagi' | 'siang' | 'sore' | 'malam' | string;

export interface ShiftSetting {
  id: string;
  name: string; // e.g. "Shift Pagi", "Shift Siang", "Shift Sore", "Shift Malam", "Shift Dini Hari"
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "12:00"
  tagColor?: string; // styling badge
  isActive: boolean;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  category: string;
  avatarColor: string;
  weeklyTargetIncome: number; // e.g. Rp 5.000.000
  weeklyTargetHours: number;  // e.g. 15 hours
  agencyCutPercent: number;  // e.g. 10%
  phone?: string;
  joinedDate: string;
}

export interface LiveSession {
  id: string;
  creatorId: string;
  creatorName: string;
  date: string; // YYYY-MM-DD
  timeSlot: TimeSlot;
  shiftId?: string;
  shiftLabel?: string; // e.g. "Shift Pagi (08:00 - 12:00)"
  durationHours: number; // e.g. 3.5
  platform: PlatformType;
  salesIncome?: number; // Angka penghasilan jualan live (sesuai dashboard Shopee)
  grossIncome: number; // Total omset jualan
  agencyCutPercent: number; // snapshot at creation
  netIncome: number; // gross - agencyCut
  peakViewers: number;
  notes?: string;
  createdAt: string;
  // Optional legacy fields for backward compatibility
  giftIncome?: number;
  affiliateCommission?: number;
  endorsementIncome?: number;
}

export interface WeeklyProgress {
  creatorId: string;
  creatorName: string;
  targetIncome: number;
  currentIncome: number;
  targetHours: number;
  currentHours: number;
  sessionCount: number;
  percentageIncome: number;
  percentageHours: number;
  isAchieved: boolean;
  isExceeded: boolean;
  remainingIncome: number;
  streakDays: number;
  statusLabel: string;
}

export interface MonthlyCreatorSummary {
  creatorId: string;
  creatorName: string;
  avatarColor: string;
  handle: string;
  totalGross: number;
  totalNet: number;
  totalHours: number;
  totalSessions: number;
  avgPerSession: number;
  avgPerHour: number;
  topPlatform: string;
  weeklyTargetRate: number;
}
