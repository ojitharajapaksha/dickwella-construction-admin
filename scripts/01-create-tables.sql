-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'operator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment categories table
CREATE TABLE IF NOT EXISTS equipment_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create equipment items table
CREATE TABLE IF NOT EXISTS equipment_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES equipment_categories(id),
    name VARCHAR(200) NOT NULL,
    item_type VARCHAR(20) CHECK (item_type IN ('material', 'machine')) NOT NULL,
    brand VARCHAR(100),
    condition VARCHAR(20) DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')),
    
    -- Inventory
    total_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    maintenance_quantity INTEGER DEFAULT 0,
    
    -- For materials
    length DECIMAL(10,2),
    height DECIMAL(10,2),
    width DECIMAL(10,2),
    weight DECIMAL(10,2),
    unit VARCHAR(20),
    
    -- For machines
    model VARCHAR(100),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    year_manufactured INTEGER,
    wattage INTEGER,
    fuel_type VARCHAR(20),
    
    -- Pricing
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    
    -- Status and tracking
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'retired')),
    qr_code TEXT UNIQUE,
    barcode TEXT UNIQUE,
    location VARCHAR(100),
    notes TEXT,
    
    -- Maintenance
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER DEFAULT 90,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_type VARCHAR(20) DEFAULT 'individual' CHECK (customer_type IN ('individual', 'company')),
    name VARCHAR(200) NOT NULL,
    company_name VARCHAR(200),
    contact_person VARCHAR(200),
    primary_phone VARCHAR(20) NOT NULL,
    secondary_phone VARCHAR(20),
    email VARCHAR(100),
    id_number VARCHAR(50) UNIQUE NOT NULL,
    business_reg_number VARCHAR(50),
    
    -- Address
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    postal_code VARCHAR(10),
    
    -- Financial
    credit_limit DECIMAL(12,2) DEFAULT 0,
    outstanding_balance DECIMAL(12,2) DEFAULT 0,
    total_rentals INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rental_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL,
    admin_id UUID REFERENCES admin_users(id) NOT NULL,
    
    -- Dates
    rental_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    
    -- Financial
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    security_deposit DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    outstanding_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'returned', 'overdue', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
    
    -- Additional info
    delivery_required BOOLEAN DEFAULT false,
    delivery_address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    pickup_required BOOLEAN DEFAULT false,
    pickup_fee DECIMAL(10,2) DEFAULT 0,
    
    notes TEXT,
    terms_conditions TEXT,
    qr_code TEXT UNIQUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rental items table
CREATE TABLE IF NOT EXISTS rental_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
    equipment_id UUID REFERENCES equipment_items(id),
    
    quantity INTEGER NOT NULL,
    rate_type VARCHAR(10) CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'monthly')) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    
    subtotal DECIMAL(10,2) NOT NULL,
    
    -- Condition tracking
    condition_out VARCHAR(20) DEFAULT 'good',
    condition_in VARCHAR(20),
    damage_notes TEXT,
    damage_charges DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rental_id UUID REFERENCES rentals(id),
    customer_id UUID REFERENCES customers(id),
    admin_id UUID REFERENCES admin_users(id),
    
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque')) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    reference_number VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    rental_id UUID REFERENCES rentals(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    equipment_id UUID REFERENCES equipment_items(id),
    admin_id UUID REFERENCES admin_users(id),
    
    maintenance_type VARCHAR(20) CHECK (maintenance_type IN ('routine', 'repair', 'inspection', 'upgrade')) NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    maintenance_date DATE DEFAULT CURRENT_DATE,
    next_maintenance_date DATE,
    
    performed_by VARCHAR(200),
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_items_category ON equipment_items(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_items_status ON equipment_items(status);
CREATE INDEX IF NOT EXISTS idx_equipment_items_qr_code ON equipment_items(qr_code);
CREATE INDEX IF NOT EXISTS idx_rentals_customer ON rentals(customer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_date ON rentals(rental_date);
CREATE INDEX IF NOT EXISTS idx_rental_items_rental ON rental_items(rental_id);
CREATE INDEX IF NOT EXISTS idx_customers_id_number ON customers(id_number);
CREATE INDEX IF NOT EXISTS idx_payments_rental ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_invoices_rental ON invoices(rental_id);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_items_updated_at BEFORE UPDATE ON equipment_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
