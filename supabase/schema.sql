-- =====================================================================
-- VENKY'S TRANSPORT MANAGEMENT SYSTEM (VTMS) - POSTGRESQL SUPABASE DDL
-- =====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Enumeration Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'transport_manager');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_status AS ENUM ('active', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE trip_type AS ENUM ('one_way', 'round_trip');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE schedule_status AS ENUM ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'skipped');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE skip_reason_type AS ENUM ('vehicle_breakdown', 'driver_unavailable', 'capacity_unavailable', 'maintenance', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES / USERS
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'transport_manager',
    employee_code TEXT,
    contact_number TEXT,
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TRANSPORTER MASTER (Dynamic A, B, C, D, E...)
CREATE TABLE IF NOT EXISTS transporters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transporter_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    rotation_order INTEGER NOT NULL UNIQUE,
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. VEHICLE MASTER (Vehicle Number is primary operational identifier)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_number TEXT NOT NULL UNIQUE,
    transporter_id UUID NOT NULL REFERENCES transporters(id) ON DELETE RESTRICT,
    driver_name TEXT NOT NULL,
    driver_phone TEXT,
    capacity_tonnes NUMERIC(6,2),
    is_available BOOLEAN NOT NULL DEFAULT true,
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ITEM MASTER (Chicks, Feed, Medicines...)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    unit_of_measure TEXT NOT NULL DEFAULT 'Units',
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. FARM MASTER (Dynamic poultry farms)
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    district_area TEXT NOT NULL,
    latitude NUMERIC(10,6),
    longitude NUMERIC(10,6),
    contact_person TEXT,
    phone TEXT,
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ROUTE MASTER
CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_code TEXT NOT NULL UNIQUE,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    destination_farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    approx_one_way_km NUMERIC(8,2) NOT NULL CHECK (approx_one_way_km > 0),
    status entity_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ROTATION STATE (Persistent pointer)
CREATE TABLE IF NOT EXISTS rotation_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    last_assigned_transporter_id UUID REFERENCES transporters(id),
    current_rotation_order INTEGER NOT NULL DEFAULT 1,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. SCHEDULES
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_number TEXT NOT NULL UNIQUE,
    schedule_date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    from_location TEXT NOT NULL,
    destination_farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE RESTRICT,
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
    trip_type trip_type NOT NULL DEFAULT 'round_trip',
    approx_km NUMERIC(8,2) NOT NULL,
    
    -- Transporter Assignment details
    original_transporter_id UUID NOT NULL REFERENCES transporters(id) ON DELETE RESTRICT,
    final_transporter_id UUID NOT NULL REFERENCES transporters(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_name_snapshot TEXT NOT NULL,
    
    status schedule_status NOT NULL DEFAULT 'scheduled',
    was_skipped BOOLEAN NOT NULL DEFAULT false,
    skip_reason TEXT,
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. TRANSPORTER SKIP RECORDS (Audit trail of breakdown/unavailability)
CREATE TABLE IF NOT EXISTS transporter_skip_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
    skipped_transporter_id UUID NOT NULL REFERENCES transporters(id),
    vehicle_id UUID REFERENCES vehicles(id),
    reason_type skip_reason_type NOT NULL DEFAULT 'vehicle_breakdown',
    reason_notes TEXT NOT NULL,
    replacement_transporter_id UUID NOT NULL REFERENCES transporters(id),
    recorded_by UUID REFERENCES profiles(id),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. TRIPS & KILOMETERS
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_number TEXT NOT NULL UNIQUE,
    schedule_id UUID NOT NULL UNIQUE REFERENCES schedules(id) ON DELETE RESTRICT,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    
    start_km NUMERIC(10,2) CHECK (start_km >= 0),
    end_km NUMERIC(10,2) CHECK (end_km >= start_km),
    actual_km NUMERIC(10,2) GENERATED ALWAYS AS (end_km - start_km) STORED,
    
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    start_km_entered_by UUID REFERENCES profiles(id),
    end_km_entered_by UUID REFERENCES profiles(id),
    
    status schedule_status NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL,
    performed_by UUID REFERENCES profiles(id),
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance operational filtering
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(schedule_date);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status);
CREATE INDEX IF NOT EXISTS idx_schedules_final_transporter ON schedules(final_transporter_id);
CREATE INDEX IF NOT EXISTS idx_trips_schedule ON trips(schedule_id);
CREATE INDEX IF NOT EXISTS idx_transporters_rotation ON transporters(rotation_order) WHERE status = 'active';

-- Enable Row-Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transporter_skip_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Base RLS Policies: Authenticated users can read all active master data & schedules
CREATE POLICY "Allow read access to authenticated users" ON transporters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON farms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access to authenticated users" ON transporter_skip_records FOR SELECT TO authenticated USING (true);
