export type UserRole = 'admin' | 'transport_manager';

export type EntityStatus = 'active' | 'inactive';

export type TripType = 'one_way' | 'round_trip';

export type ScheduleStatus = 
  | 'draft' 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'skipped';

export type SkipReasonType = 
  | 'vehicle_breakdown' 
  | 'driver_unavailable' 
  | 'capacity_unavailable' 
  | 'maintenance' 
  | 'other';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  employee_code?: string;
  contact_number?: string;
  status: EntityStatus;
  created_at: string;
}

export interface Transporter {
  id: string;
  transporter_code: string; // e.g. "A", "B", "C", "D"
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  rotation_order: number; // 1, 2, 3, 4...
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  vehicle_number: string; // Primary Operational Identifier e.g. "TN 38 XY 4567"
  transporter_id: string;
  driver_name: string;
  driver_phone?: string;
  capacity_tonnes?: number;
  is_available: boolean;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  item_code: string;
  name: string; // "Chicks", "Feed", etc.
  description?: string;
  unit_of_measure: string;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  farm_code: string;
  name: string;
  location: string;
  district_area: string;
  latitude?: number;
  longitude?: number;
  contact_person?: string;
  phone?: string;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: string;
  route_code: string;
  from_location: string;
  to_location: string;
  destination_farm_id?: string;
  approx_one_way_km: number;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
}

export interface RotationState {
  id: number;
  last_assigned_transporter_id?: string;
  current_rotation_order: number;
  last_updated_at: string;
}

export interface Schedule {
  id: string;
  schedule_number: string; // e.g. "SCH-2026-0001"
  schedule_date: string;
  item_id: string;
  from_location: string;
  destination_farm_id: string;
  route_id: string;
  trip_type: TripType;
  approx_km: number;
  
  original_transporter_id: string;
  final_transporter_id: string;
  vehicle_id: string;
  driver_name_snapshot: string;
  
  status: ScheduleStatus;
  was_skipped: boolean;
  skip_reason?: string;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface TransporterSkipRecord {
  id: string;
  schedule_id: string;
  skipped_transporter_id: string;
  vehicle_id?: string;
  reason_type: SkipReasonType;
  reason_notes: string;
  replacement_transporter_id: string;
  recorded_by?: string;
  recorded_at: string;
}

export interface Trip {
  id: string;
  trip_number: string; // e.g. "TRIP-2026-0001"
  schedule_id: string;
  vehicle_id: string;
  
  start_km?: number;
  end_km?: number;
  actual_km?: number;
  
  start_time?: string;
  end_time?: string;
  start_km_entered_by?: string;
  end_km_entered_by?: string;
  
  status: ScheduleStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Expanded View Models for Reporting & Table display
export interface ScheduleViewModel extends Schedule {
  item?: Item;
  farm?: Farm;
  route?: Route;
  original_transporter?: Transporter;
  final_transporter?: Transporter;
  vehicle?: Vehicle;
  trip?: Trip;
  skip_record?: TransporterSkipRecord;
}

export interface ReportFilterCriteria {
  startDate?: string;
  endDate?: string;
  transporterId?: string;
  vehicleId?: string;
  itemId?: string;
  farmId?: string;
  routeId?: string;
  status?: string;
  tripType?: string;
  searchQuery?: string;
}
