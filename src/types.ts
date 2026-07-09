export type AgentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Agent {
  id: string;
  created_at: string;
  telegram_id: number;
  telegram_username?: string;
  full_name: string;
  phone?: string;
  status: AgentStatus;
  
  // Custom pricing overrides
  price_per_driver?: number; // legacy flat rate
  price_latest_model?: number;
  price_older_model?: number;
  
  // Payment info
  payment_method?: string;
  payment_details?: string;
  
  // Document state
  document_update_used?: boolean;
  
  // Targets
  daily_target?: number;
  weekly_target?: number;
  monthly_target?: number;
}

export type DriverStatus = 'PENDING' | 'VERIFIED' | 'DECLINED';
export type VehicleCategory = 'LATEST_OR_EV' | 'OLDER';

export interface Driver {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  license_plate: string;
  vehicle_category: VehicleCategory;
  car_model: string;
  location?: string;
  document_url?: string;
  status: DriverStatus;
  admin_note?: string;
  payout_amount?: number;
  registered_by: string;
  agent?: Agent; // Nested join
}

export interface DashboardStats {
  total: number;
  thisDay: number;
  thisWeek: number;
  thisMonth: number;
  verified: number;
  pending: number;
  declined: number;
  earnings: number;
  priceLatest: number;
  priceOlder: number;
  hasEarnings: boolean;
  dailyTarget: number;
  weeklyTarget: number;
  monthlyTarget: number;
}

export interface LeaderboardEntry {
  id: string;
  full_name: string;
  verifiedCount: number;
  earnings: number;
}
