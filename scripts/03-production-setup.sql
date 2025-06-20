-- Production Database Setup for Dickwella Construction System
-- Run this script to create the actual database tables

-- Create Equipment table
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('material', 'machine')),
    category VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    condition VARCHAR(50) CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')),
    total_quantity INTEGER NOT NULL DEFAULT 0,
    available_quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0,
    maintenance_quantity INTEGER NOT NULL DEFAULT 0,
    
    -- Material specific fields
    length DECIMAL(10,2),
    height DECIMAL(10,2),
    width DECIMAL(10,2),
    weight DECIMAL(10,2),
    unit VARCHAR(20),
    
    -- Machine specific fields
    model VARCHAR(100),
    model_number VARCHAR(100),
    serial_number VARCHAR(100),
    year_manufactured INTEGER,
    wattage INTEGER,
    fuel_type VARCHAR(50),
    
    -- Pricing
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2) NOT NULL,
    weekly_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    security_deposit DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    status VARCHAR(50) CHECK (status IN ('available', 'rented', 'maintenance', 'retired')) DEFAULT 'available',
    qr_code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(50),
    location VARCHAR(255),
    notes TEXT,
    
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    customer_type VARCHAR(20) CHECK (customer_type IN ('individual', 'company')) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    contact_person VARCHAR(255),
    primary_phone VARCHAR(20) NOT NULL,
    secondary_phone VARCHAR(20),
    email VARCHAR(255),
    id_number VARCHAR(50) NOT NULL,
    business_reg_number VARCHAR(50),
    
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    
    credit_limit DECIMAL(12,2) DEFAULT 0,
    outstanding_balance DECIMAL(12,2) DEFAULT 0,
    total_rentals INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'blacklisted')) DEFAULT 'active',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Rentals table
CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,
    rental_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    admin_id VARCHAR(50) NOT NULL,
    
    rental_date TIMESTAMP NOT NULL,
    start_date DATE NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date DATE,
    
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 8.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    security_deposit DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    outstanding_amount DECIMAL(12,2) DEFAULT 0,
    
    status VARCHAR(20) CHECK (status IN ('draft', 'active', 'returned', 'overdue', 'cancelled')) DEFAULT 'draft',
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')) DEFAULT 'pending',
    
    delivery_required BOOLEAN DEFAULT FALSE,
    delivery_address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    pickup_required BOOLEAN DEFAULT FALSE,
    pickup_fee DECIMAL(10,2) DEFAULT 0,
    
    notes TEXT,
    terms_conditions TEXT,
    qr_code VARCHAR(50) UNIQUE NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Rental Items table
CREATE TABLE rental_items (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id) ON DELETE CASCADE,
    equipment_id INTEGER REFERENCES equipment(id),
    equipment_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    rate_type VARCHAR(20) CHECK (rate_type IN ('hourly', 'daily', 'weekly', 'monthly')) NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    condition_out VARCHAR(255),
    condition_in VARCHAR(255),
    damage_notes TEXT,
    damage_charges DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    rental_id INTEGER REFERENCES rentals(id),
    customer_id INTEGER REFERENCES customers(id),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'cheque')) NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    reference_number VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_qr_code ON equipment(qr_code);
CREATE INDEX idx_customers_phone ON customers(primary_phone);
CREATE INDEX idx_customers_id_number ON customers(id_number);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_customer_id ON rentals(customer_id);
CREATE INDEX idx_rentals_qr_code ON rentals(qr_code);
CREATE INDEX idx_rental_items_rental_id ON rental_items(rental_id);
CREATE INDEX idx_payments_rental_id ON payments(rental_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON rentals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
