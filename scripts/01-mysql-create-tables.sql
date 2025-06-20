-- MySQL Database Schema for Dickwella Construction System
-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create database (run this separately if needed)
-- CREATE DATABASE dickwella_construction;
-- USE dickwella_construction;

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'operator') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create equipment categories table
CREATE TABLE IF NOT EXISTS equipment_categories (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create equipment items table
CREATE TABLE IF NOT EXISTS equipment_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    category_id VARCHAR(36),
    name VARCHAR(200) NOT NULL,
    item_type ENUM('material', 'machine') NOT NULL,
    brand VARCHAR(100),
    equipment_condition ENUM('excellent', 'good', 'fair', 'needs_repair') DEFAULT 'excellent',
    
    -- Inventory
    total_quantity INT DEFAULT 0,
    available_quantity INT DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    maintenance_quantity INT DEFAULT 0,
    
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
    year_manufactured INT,
    wattage INT,
    fuel_type VARCHAR(20),
    
    -- Pricing
    hourly_rate DECIMAL(10,2),
    daily_rate DECIMAL(10,2),
    weekly_rate DECIMAL(10,2),
    monthly_rate DECIMAL(10,2),
    security_deposit DECIMAL(10,2) DEFAULT 0,
    
    -- Status and tracking
    status ENUM('available', 'rented', 'maintenance', 'retired') DEFAULT 'available',
    qr_code VARCHAR(255) UNIQUE,
    barcode VARCHAR(255) UNIQUE,
    location VARCHAR(100),
    notes TEXT,
    
    -- Maintenance
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INT DEFAULT 90,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (category_id) REFERENCES equipment_categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_qr_code (qr_code)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    customer_type ENUM('individual', 'company') DEFAULT 'individual',
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
    total_rentals INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    
    -- Status
    status ENUM('active', 'inactive', 'blacklisted') DEFAULT 'active',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_id_number (id_number),
    INDEX idx_status (status),
    INDEX idx_name (name)
);

-- Create rentals table
CREATE TABLE IF NOT EXISTS rentals (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rental_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(36) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    admin_id VARCHAR(36) NOT NULL,
    
    -- Dates
    rental_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
    status ENUM('draft', 'active', 'returned', 'overdue', 'cancelled') DEFAULT 'active',
    payment_status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
    
    -- Additional info
    delivery_required BOOLEAN DEFAULT FALSE,
    delivery_address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    pickup_required BOOLEAN DEFAULT FALSE,
    pickup_fee DECIMAL(10,2) DEFAULT 0,
    
    notes TEXT,
    terms_conditions TEXT,
    qr_code VARCHAR(255) UNIQUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT,
    INDEX idx_customer (customer_id),
    INDEX idx_status (status),
    INDEX idx_rental_date (rental_date),
    INDEX idx_rental_number (rental_number)
);

-- Create rental items table
CREATE TABLE IF NOT EXISTS rental_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rental_id VARCHAR(36) NOT NULL,
    equipment_id VARCHAR(36) NOT NULL,
    equipment_name VARCHAR(200) NOT NULL,
    
    quantity INT NOT NULL,
    rate_type ENUM('hourly', 'daily', 'weekly', 'monthly') NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    duration INT NOT NULL,
    
    subtotal DECIMAL(10,2) NOT NULL,
    
    -- Condition tracking
    condition_out VARCHAR(20) DEFAULT 'good',
    condition_in VARCHAR(20),
    damage_notes TEXT,
    damage_charges DECIMAL(10,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment_items(id) ON DELETE RESTRICT,
    INDEX idx_rental (rental_id),
    INDEX idx_equipment (equipment_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rental_id VARCHAR(36),
    customer_id VARCHAR(36),
    admin_id VARCHAR(36),
    
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'cheque') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    reference_number VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT,
    INDEX idx_rental (rental_id),
    INDEX idx_customer (customer_id),
    INDEX idx_payment_date (payment_date)
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    rental_id VARCHAR(36),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE DEFAULT (CURRENT_DATE),
    due_date DATE,
    
    subtotal DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rental_id) REFERENCES rentals(id) ON DELETE SET NULL,
    INDEX idx_rental (rental_id),
    INDEX idx_invoice_date (invoice_date)
);

-- Create maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    equipment_id VARCHAR(36),
    admin_id VARCHAR(36),
    
    maintenance_type ENUM('routine', 'repair', 'inspection', 'upgrade') NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    maintenance_date DATE DEFAULT (CURRENT_DATE),
    next_maintenance_date DATE,
    
    performed_by VARCHAR(200),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (equipment_id) REFERENCES equipment_items(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_equipment (equipment_id),
    INDEX idx_maintenance_date (maintenance_date)
);
