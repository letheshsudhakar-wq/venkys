import type { 
  Transporter, 
  Vehicle, 
  Item, 
  Farm, 
  Route, 
  Schedule, 
  Trip, 
  TransporterSkipRecord, 
  UserProfile, 
  RotationState,
  ScheduleViewModel,
  ReportFilterCriteria,
  SkipReasonType,
  TripType
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_TRANSPORTERS, 
  INITIAL_VEHICLES, 
  INITIAL_ITEMS, 
  INITIAL_FARMS, 
  INITIAL_ROUTES, 
  INITIAL_ROTATION_STATE, 
  INITIAL_SCHEDULES, 
  INITIAL_SKIP_RECORDS, 
  INITIAL_TRIPS 
} from './mockData';

const STORAGE_KEY = 'venkys_tms_db_v1';

interface DBState {
  users: UserProfile[];
  transporters: Transporter[];
  vehicles: Vehicle[];
  items: Item[];
  farms: Farm[];
  routes: Route[];
  rotationState: RotationState;
  schedules: Schedule[];
  skipRecords: TransporterSkipRecord[];
  trips: Trip[];
  currentUser: UserProfile;
}

class StoreService {
  private state: DBState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): DBState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load storage from localStorage:', e);
    }

    // Default Seed state
    const defaultState: DBState = {
      users: INITIAL_USERS,
      transporters: INITIAL_TRANSPORTERS,
      vehicles: INITIAL_VEHICLES,
      items: INITIAL_ITEMS,
      farms: INITIAL_FARMS,
      routes: INITIAL_ROUTES,
      rotationState: INITIAL_ROTATION_STATE,
      schedules: INITIAL_SCHEDULES,
      skipRecords: INITIAL_SKIP_RECORDS,
      trips: INITIAL_TRIPS,
      currentUser: INITIAL_USERS[1], // Default to Transport Manager for realistic operations
    };
    this.saveState(defaultState);
    return defaultState;
  }

  private saveState(state: DBState = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      this.notify();
    } catch (e) {
      console.error('Failed to persist to localStorage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public resetAllData() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      users: INITIAL_USERS,
      transporters: INITIAL_TRANSPORTERS,
      vehicles: INITIAL_VEHICLES,
      items: INITIAL_ITEMS,
      farms: INITIAL_FARMS,
      routes: INITIAL_ROUTES,
      rotationState: INITIAL_ROTATION_STATE,
      schedules: INITIAL_SCHEDULES,
      skipRecords: INITIAL_SKIP_RECORDS,
      trips: INITIAL_TRIPS,
      currentUser: INITIAL_USERS[1],
    };
    this.saveState();
  }

  // --- USER / ROLE MANAGEMENT ---
  public getCurrentUser(): UserProfile {
    return this.state.currentUser;
  }

  public setCurrentUserRole(role: 'admin' | 'transport_manager') {
    const user = this.state.users.find(u => u.role === role) || this.state.users[0];
    this.state.currentUser = user;
    this.saveState();
  }

  public getUsers(): UserProfile[] {
    return [...this.state.users];
  }

  // --- MASTER DATA: TRANSPORTERS ---
  public getTransporters(): Transporter[] {
    return [...this.state.transporters].sort((a, b) => a.rotation_order - b.rotation_order);
  }

  public getActiveTransporters(): Transporter[] {
    return this.getTransporters().filter(t => t.status === 'active');
  }

  public getTransporterById(id: string): Transporter | undefined {
    return this.state.transporters.find(t => t.id === id);
  }

  public createTransporter(data: Omit<Transporter, 'id' | 'created_at' | 'updated_at' | 'rotation_order'> & { rotation_order?: number }): Transporter {
    const activeCount = this.state.transporters.length;
    const newTransporter: Transporter = {
      ...data,
      id: `trans-${Date.now()}`,
      rotation_order: data.rotation_order ?? (activeCount + 1),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.transporters.push(newTransporter);
    this.saveState();
    return newTransporter;
  }

  public updateTransporter(id: string, updates: Partial<Transporter>): Transporter {
    const idx = this.state.transporters.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Transporter not found');
    this.state.transporters[idx] = {
      ...this.state.transporters[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveState();
    return this.state.transporters[idx];
  }

  public toggleTransporterStatus(id: string): Transporter {
    const t = this.getTransporterById(id);
    if (!t) throw new Error('Transporter not found');
    const newStatus = t.status === 'active' ? 'inactive' : 'active';
    return this.updateTransporter(id, { status: newStatus });
  }

  // --- MASTER DATA: VEHICLES ---
  public getVehicles(): Vehicle[] {
    return [...this.state.vehicles];
  }

  public getVehiclesByTransporter(transporterId: string, onlyAvailable = false): Vehicle[] {
    return this.state.vehicles.filter(v => {
      const matchesTrans = v.transporter_id === transporterId;
      const matchesActive = v.status === 'active';
      return onlyAvailable ? matchesTrans && matchesActive && v.is_available : matchesTrans && matchesActive;
    });
  }

  public getVehicleById(id: string): Vehicle | undefined {
    return this.state.vehicles.find(v => v.id === id);
  }

  public createVehicle(data: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>): Vehicle {
    const newVehicle: Vehicle = {
      ...data,
      id: `veh-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.vehicles.push(newVehicle);
    this.saveState();
    return newVehicle;
  }

  public updateVehicle(id: string, updates: Partial<Vehicle>): Vehicle {
    const idx = this.state.vehicles.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Vehicle not found');
    this.state.vehicles[idx] = {
      ...this.state.vehicles[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveState();
    return this.state.vehicles[idx];
  }

  public toggleVehicleAvailability(id: string): Vehicle {
    const v = this.getVehicleById(id);
    if (!v) throw new Error('Vehicle not found');
    return this.updateVehicle(id, { is_available: !v.is_available });
  }

  public toggleVehicleStatus(id: string): Vehicle {
    const v = this.getVehicleById(id);
    if (!v) throw new Error('Vehicle not found');
    return this.updateVehicle(id, { status: v.status === 'active' ? 'inactive' : 'active' });
  }

  // --- MASTER DATA: ITEMS ---
  public getItems(): Item[] {
    return [...this.state.items];
  }

  public getItemById(id: string): Item | undefined {
    return this.state.items.find(i => i.id === id);
  }

  public createItem(data: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Item {
    const newItem: Item = {
      ...data,
      id: `item-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.items.push(newItem);
    this.saveState();
    return newItem;
  }

  public updateItem(id: string, updates: Partial<Item>): Item {
    const idx = this.state.items.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    this.state.items[idx] = {
      ...this.state.items[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveState();
    return this.state.items[idx];
  }

  public toggleItemStatus(id: string): Item {
    const item = this.getItemById(id);
    if (!item) throw new Error('Item not found');
    return this.updateItem(id, { status: item.status === 'active' ? 'inactive' : 'active' });
  }

  // --- MASTER DATA: FARMS ---
  public getFarms(): Farm[] {
    return [...this.state.farms];
  }

  public getFarmById(id: string): Farm | undefined {
    return this.state.farms.find(f => f.id === id);
  }

  public createFarm(data: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Farm {
    const newFarm: Farm = {
      ...data,
      id: `farm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.farms.push(newFarm);
    this.saveState();
    return newFarm;
  }

  public updateFarm(id: string, updates: Partial<Farm>): Farm {
    const idx = this.state.farms.findIndex(f => f.id === id);
    if (idx === -1) throw new Error('Farm not found');
    this.state.farms[idx] = {
      ...this.state.farms[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveState();
    return this.state.farms[idx];
  }

  public toggleFarmStatus(id: string): Farm {
    const farm = this.getFarmById(id);
    if (!farm) throw new Error('Farm not found');
    return this.updateFarm(id, { status: farm.status === 'active' ? 'inactive' : 'active' });
  }

  // --- MASTER DATA: ROUTES ---
  public getRoutes(): Route[] {
    return [...this.state.routes];
  }

  public getRouteById(id: string): Route | undefined {
    return this.state.routes.find(r => r.id === id);
  }

  public createRoute(data: Omit<Route, 'id' | 'created_at' | 'updated_at'>): Route {
    const newRoute: Route = {
      ...data,
      id: `route-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.state.routes.push(newRoute);
    this.saveState();
    return newRoute;
  }

  public updateRoute(id: string, updates: Partial<Route>): Route {
    const idx = this.state.routes.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Route not found');
    this.state.routes[idx] = {
      ...this.state.routes[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveState();
    return this.state.routes[idx];
  }

  public toggleRouteStatus(id: string): Route {
    const route = this.getRouteById(id);
    if (!route) throw new Error('Route not found');
    return this.updateRoute(id, { status: route.status === 'active' ? 'inactive' : 'active' });
  }

  // --- ROTATION LOGIC ENGINE ---
  public getRotationState(): RotationState {
    return { ...this.state.rotationState };
  }

  /**
   * Determine the next eligible transporter in strict schedule-based rotation order
   */
  public getNextEligibleTransporter(): Transporter | null {
    const activeTransporters = this.getActiveTransporters();
    if (activeTransporters.length === 0) return null;

    const lastId = this.state.rotationState.last_assigned_transporter_id;
    if (!lastId) {
      return activeTransporters[0];
    }

    const lastIndex = activeTransporters.findIndex(t => t.id === lastId);
    if (lastIndex === -1) {
      // If previous transporter was deactivated or removed, start from first active
      return activeTransporters[0];
    }

    const nextIndex = (lastIndex + 1) % activeTransporters.length;
    return activeTransporters[nextIndex];
  }

  /**
   * Get rotation sequence with operational status indicators for today's dashboard
   */
  public getRotationOverview(): Array<{
    transporter: Transporter;
    position: number;
    isNext: boolean;
    isLastAssigned: boolean;
    availableVehiclesCount: number;
  }> {
    const active = this.getActiveTransporters();
    const nextEligible = this.getNextEligibleTransporter();
    const lastId = this.state.rotationState.last_assigned_transporter_id;

    return active.map((t, idx) => {
      const vehicles = this.getVehiclesByTransporter(t.id, true);
      return {
        transporter: t,
        position: idx + 1,
        isNext: nextEligible?.id === t.id,
        isLastAssigned: lastId === t.id,
        availableVehiclesCount: vehicles.length,
      };
    });
  }

  /**
   * Advance the rotation state to a given transporter
   */
  public advanceRotation(transporterId: string) {
    const active = this.getActiveTransporters();
    const t = active.find(item => item.id === transporterId);
    if (t) {
      this.state.rotationState = {
        id: 1,
        last_assigned_transporter_id: t.id,
        current_rotation_order: t.rotation_order,
        last_updated_at: new Date().toISOString()
      };
      this.saveState();
    }
  }

  // --- SCHEDULES & TRIP WORKFLOWS ---
  public getSchedules(): Schedule[] {
    return [...this.state.schedules].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getScheduleById(id: string): Schedule | undefined {
    return this.state.schedules.find(s => s.id === id);
  }

  public getTrips(): Trip[] {
    return [...this.state.trips].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTripByScheduleId(scheduleId: string): Trip | undefined {
    return this.state.trips.find(t => t.schedule_id === scheduleId);
  }

  public getSkipRecords(): TransporterSkipRecord[] {
    return [...this.state.skipRecords].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
  }

  /**
   * CREATE SCHEDULE
   * Allocates the next eligible transporter (or manager selection), links vehicle,
   * calculates approx KM based on Trip Type, and advances rotation pointer.
   */
  public createSchedule(payload: {
    schedule_date: string;
    item_id: string;
    from_location: string;
    destination_farm_id: string;
    route_id: string;
    trip_type: TripType;
    transporter_id: string;
    vehicle_id: string;
    notes?: string;
  }): { schedule: Schedule; trip: Trip } {
    const route = this.getRouteById(payload.route_id);
    if (!route) throw new Error('Invalid route selected');

    const vehicle = this.getVehicleById(payload.vehicle_id);
    if (!vehicle) throw new Error('Invalid vehicle selected');

    const transporter = this.getTransporterById(payload.transporter_id);
    if (!transporter) throw new Error('Invalid transporter selected');

    // Calculate approx KM (Round-trip doubles one-way KM)
    const approx_km = payload.trip_type === 'round_trip' 
      ? route.approx_one_way_km * 2 
      : route.approx_one_way_km;

    const count = this.state.schedules.length + 1;
    const schedule_number = `SCH-2026-${String(count).padStart(4, '0')}`;
    const schedule_id = `sch-${Date.now()}`;

    const newSchedule: Schedule = {
      id: schedule_id,
      schedule_number,
      schedule_date: payload.schedule_date,
      item_id: payload.item_id,
      from_location: payload.from_location,
      destination_farm_id: payload.destination_farm_id,
      route_id: payload.route_id,
      trip_type: payload.trip_type,
      approx_km,
      original_transporter_id: payload.transporter_id,
      final_transporter_id: payload.transporter_id,
      vehicle_id: payload.vehicle_id,
      driver_name_snapshot: vehicle.driver_name,
      status: 'scheduled',
      was_skipped: false,
      created_by: this.state.currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Auto-create linked Trip entry
    const trip_number = `TRIP-2026-${String(count).padStart(4, '0')}`;
    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      trip_number,
      schedule_id: schedule_id,
      vehicle_id: payload.vehicle_id,
      status: 'scheduled',
      notes: payload.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.state.schedules.unshift(newSchedule);
    this.state.trips.unshift(newTrip);

    // Advance rotation state pointer
    this.advanceRotation(payload.transporter_id);
    this.saveState();

    return { schedule: newSchedule, trip: newTrip };
  }

  /**
   * RECORD TRANSPORTER UNAVAILABILITY / BREAKDOWN AND REASSIGN SCHEDULE
   * Preserves historical original transporter, records audit log,
   * updates schedule with replacement transporter, and updates rotation state.
   */
  public recordSkipAndReassign(params: {
    schedule_id: string;
    skipped_transporter_id: string;
    skipped_vehicle_id?: string;
    reason_type: SkipReasonType;
    reason_notes: string;
    replacement_transporter_id: string;
    replacement_vehicle_id: string;
  }): { schedule: Schedule; skipRecord: TransporterSkipRecord } {
    const scheduleIndex = this.state.schedules.findIndex(s => s.id === params.schedule_id);
    if (scheduleIndex === -1) throw new Error('Schedule not found');

    const schedule = this.state.schedules[scheduleIndex];
    if (schedule.status === 'completed' || schedule.status === 'cancelled') {
      throw new Error(`Cannot skip transporter for a ${schedule.status} schedule`);
    }

    const replacementTransporter = this.getTransporterById(params.replacement_transporter_id);
    if (!replacementTransporter) throw new Error('Replacement transporter not found');

    const replacementVehicle = this.getVehicleById(params.replacement_vehicle_id);
    if (!replacementVehicle) throw new Error('Replacement vehicle not found');

    // Create Skip Record Audit
    const skipRecord: TransporterSkipRecord = {
      id: `skip-${Date.now()}`,
      schedule_id: schedule.id,
      skipped_transporter_id: params.skipped_transporter_id,
      vehicle_id: params.skipped_vehicle_id,
      reason_type: params.reason_type,
      reason_notes: params.reason_notes,
      replacement_transporter_id: params.replacement_transporter_id,
      recorded_by: this.state.currentUser.id,
      recorded_at: new Date().toISOString(),
    };

    // If reason was breakdown and a vehicle was specified, mark that vehicle as unavailable
    if (params.reason_type === 'vehicle_breakdown' && params.skipped_vehicle_id) {
      this.updateVehicle(params.skipped_vehicle_id, { is_available: false });
    }

    // Update Schedule
    const updatedSchedule: Schedule = {
      ...schedule,
      final_transporter_id: params.replacement_transporter_id,
      vehicle_id: params.replacement_vehicle_id,
      driver_name_snapshot: replacementVehicle.driver_name,
      was_skipped: true,
      skip_reason: `${params.reason_type.replace('_', ' ').toUpperCase()}: ${params.reason_notes}`,
      updated_at: new Date().toISOString(),
    };

    this.state.schedules[scheduleIndex] = updatedSchedule;
    this.state.skipRecords.unshift(skipRecord);

    // Update linked trip vehicle
    const tripIndex = this.state.trips.findIndex(t => t.schedule_id === schedule.id);
    if (tripIndex !== -1) {
      this.state.trips[tripIndex].vehicle_id = params.replacement_vehicle_id;
      this.state.trips[tripIndex].updated_at = new Date().toISOString();
    }

    // Advance rotation pointer to the final assigned transporter
    this.advanceRotation(params.replacement_transporter_id);
    this.saveState();

    return { schedule: updatedSchedule, skipRecord };
  }

  /**
   * ENTER START KILOMETERS (Start Trip)
   */
  public enterStartKm(scheduleId: string, startKm: number, notes?: string): Trip {
    if (startKm < 0) throw new Error('Starting KM cannot be negative');

    const tripIndex = this.state.trips.findIndex(t => t.schedule_id === scheduleId);
    if (tripIndex === -1) throw new Error('Trip not found for schedule');

    const scheduleIndex = this.state.schedules.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) throw new Error('Schedule not found');

    const trip = this.state.trips[tripIndex];
    const now = new Date().toISOString();

    const updatedTrip: Trip = {
      ...trip,
      start_km: startKm,
      start_time: now,
      start_km_entered_by: this.state.currentUser.id,
      status: 'in_progress',
      notes: notes ? (trip.notes ? `${trip.notes} | ${notes}` : notes) : trip.notes,
      updated_at: now,
    };

    this.state.trips[tripIndex] = updatedTrip;
    this.state.schedules[scheduleIndex].status = 'in_progress';
    this.state.schedules[scheduleIndex].updated_at = now;

    this.saveState();
    return updatedTrip;
  }

  /**
   * ENTER END KILOMETERS & COMPLETE TRIP (Calculates Actual KM Automatically)
   */
  public enterEndKm(scheduleId: string, endKm: number, notes?: string): Trip {
    const tripIndex = this.state.trips.findIndex(t => t.schedule_id === scheduleId);
    if (tripIndex === -1) throw new Error('Trip not found for schedule');

    const trip = this.state.trips[tripIndex];
    if (trip.start_km === undefined || trip.start_km === null) {
      throw new Error('Cannot enter Ending KM before Starting KM is recorded');
    }

    if (endKm < trip.start_km) {
      throw new Error(`Ending KM (${endKm}) cannot be less than Starting KM (${trip.start_km})`);
    }

    const scheduleIndex = this.state.schedules.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) throw new Error('Schedule not found');

    const now = new Date().toISOString();
    const actualKm = Number((endKm - trip.start_km).toFixed(2));

    const updatedTrip: Trip = {
      ...trip,
      end_km: endKm,
      actual_km: actualKm,
      end_time: now,
      end_km_entered_by: this.state.currentUser.id,
      status: 'completed',
      notes: notes ? (trip.notes ? `${trip.notes} | ${notes}` : notes) : trip.notes,
      updated_at: now,
    };

    this.state.trips[tripIndex] = updatedTrip;
    this.state.schedules[scheduleIndex].status = 'completed';
    this.state.schedules[scheduleIndex].updated_at = now;

    this.saveState();
    return updatedTrip;
  }

  /**
   * CANCEL SCHEDULE
   */
  public cancelSchedule(scheduleId: string, reason: string): Schedule {
    const sIdx = this.state.schedules.findIndex(s => s.id === scheduleId);
    if (sIdx === -1) throw new Error('Schedule not found');

    const now = new Date().toISOString();
    this.state.schedules[sIdx].status = 'cancelled';
    this.state.schedules[sIdx].updated_at = now;

    const tIdx = this.state.trips.findIndex(t => t.schedule_id === scheduleId);
    if (tIdx !== -1) {
      this.state.trips[tIdx].status = 'cancelled';
      this.state.trips[tIdx].notes = reason;
      this.state.trips[tIdx].updated_at = now;
    }

    this.saveState();
    return this.state.schedules[sIdx];
  }

  // --- ENRICHED DATA & REPORTING HELPERS ---
  public getEnrichedSchedules(criteria?: ReportFilterCriteria): ScheduleViewModel[] {
    const enriched = this.state.schedules.map(schedule => {
      const item = this.getItemById(schedule.item_id);
      const farm = this.getFarmById(schedule.destination_farm_id);
      const route = this.getRouteById(schedule.route_id);
      const original_transporter = this.getTransporterById(schedule.original_transporter_id);
      const final_transporter = this.getTransporterById(schedule.final_transporter_id);
      const vehicle = this.getVehicleById(schedule.vehicle_id);
      const trip = this.getTripByScheduleId(schedule.id);
      const skip_record = this.state.skipRecords.find(sr => sr.schedule_id === schedule.id);

      return {
        ...schedule,
        item,
        farm,
        route,
        original_transporter,
        final_transporter,
        vehicle,
        trip,
        skip_record
      };
    });

    if (!criteria) return enriched;

    return enriched.filter(item => {
      if (criteria.startDate && item.schedule_date < criteria.startDate) return false;
      if (criteria.endDate && item.schedule_date > criteria.endDate) return false;
      if (criteria.transporterId && item.final_transporter_id !== criteria.transporterId) return false;
      if (criteria.vehicleId && item.vehicle_id !== criteria.vehicleId) return false;
      if (criteria.itemId && item.item_id !== criteria.itemId) return false;
      if (criteria.farmId && item.destination_farm_id !== criteria.farmId) return false;
      if (criteria.routeId && item.route_id !== criteria.routeId) return false;
      if (criteria.status && criteria.status !== 'all' && item.status !== criteria.status) return false;
      if (criteria.tripType && criteria.tripType !== 'all' && item.trip_type !== criteria.tripType) return false;
      
      if (criteria.searchQuery) {
        const q = criteria.searchQuery.toLowerCase();
        const matchesNumber = item.schedule_number.toLowerCase().includes(q);
        const matchesVeh = item.vehicle?.vehicle_number.toLowerCase().includes(q);
        const matchesDriver = item.driver_name_snapshot.toLowerCase().includes(q);
        const matchesTrans = item.final_transporter?.name.toLowerCase().includes(q);
        const matchesFarm = item.farm?.name.toLowerCase().includes(q);
        if (!matchesNumber && !matchesVeh && !matchesDriver && !matchesTrans && !matchesFarm) {
          return false;
        }
      }

      return true;
    });
  }

  public getOperationalMetrics() {
    const schedules = this.state.schedules;
    const trips = this.state.trips;
    const skipRecords = this.state.skipRecords;

    const totalSchedules = schedules.length;
    const completedTrips = schedules.filter(s => s.status === 'completed').length;
    const inProgressTrips = schedules.filter(s => s.status === 'in_progress').length;
    const scheduledPending = schedules.filter(s => s.status === 'scheduled').length;
    const totalSkips = skipRecords.length;

    let totalApproxKm = 0;
    let totalActualKm = 0;

    schedules.forEach(s => {
      totalApproxKm += s.approx_km || 0;
      const trip = trips.find(t => t.schedule_id === s.id);
      if (trip && trip.actual_km !== undefined) {
        totalActualKm += trip.actual_km;
      }
    });

    const kmVariance = totalActualKm > 0 ? Number((totalActualKm - totalApproxKm).toFixed(2)) : 0;

    return {
      totalSchedules,
      completedTrips,
      inProgressTrips,
      scheduledPending,
      totalSkips,
      totalApproxKm,
      totalActualKm,
      kmVariance,
      activeTransportersCount: this.getActiveTransporters().length,
      availableVehiclesCount: this.state.vehicles.filter(v => v.status === 'active' && v.is_available).length,
      unavailableVehiclesCount: this.state.vehicles.filter(v => v.status === 'active' && !v.is_available).length,
    };
  }
}

export const store = new StoreService();
