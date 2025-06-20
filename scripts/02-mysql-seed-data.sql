-- MySQL Seed Data for Dickwella Construction System

-- Insert equipment categories
INSERT INTO equipment_categories (id, name, description, icon) VALUES
('cat-1', 'Heavy Machinery', 'Large construction equipment', 'truck'),
('cat-2', 'Construction Materials', 'Building materials and supplies', 'package'),
('cat-3', 'Concrete Equipment', 'Concrete mixing and pumping equipment', 'mixer'),
('cat-4', 'Power Tools', 'Electric and pneumatic tools', 'zap'),
('cat-5', 'Lifting Equipment', 'Cranes and lifting devices', 'move-up'),
('cat-6', 'Safety Equipment', 'Personal protective equipment', 'shield');

-- Insert admin users (password is 'admin123' hashed)
INSERT INTO admin_users (id, username, email, password_hash, full_name, role) VALUES
('admin-1', 'admin', 'admin@dickwella.lk', '$2b$10$rOzJqQZQZQZQZQZQZQZQZu', 'System Administrator', 'admin'),
('admin-2', 'manager', 'manager@dickwella.lk', '$2b$10$rOzJqQZQZQZQZQZQZQZQZu', 'Site Manager', 'manager');

-- Insert equipment items
INSERT INTO equipment_items (
    id, category_id, name, item_type, brand, equipment_condition,
    total_quantity, available_quantity, reserved_quantity, maintenance_quantity,
    model, model_number, serial_number, year_manufactured, wattage, fuel_type,
    hourly_rate, daily_rate, weekly_rate, monthly_rate, security_deposit,
    status, qr_code, barcode, location
) VALUES
('eq-1', 'cat-1', 'Excavator CAT 320D', 'machine', 'Caterpillar', 'excellent',
 3, 1, 1, 1, 'CAT 320D', 'CAT320D2023', 'CAT320D001', 2023, 150000, 'diesel',
 5000.00, 35000.00, 210000.00, 800000.00, 100000.00,
 'available', 'EXC001', 'BAR001', 'Yard A'),

('eq-2', 'cat-2', 'Steel Rebar 12mm', 'material', 'Ceylon Steel', 'excellent',
 1000, 750, 200, 0, NULL, NULL, NULL, NULL, NULL, NULL,
 NULL, 150.00, 900.00, 3600.00, 0.00,
 'available', 'STL001', 'BAR005', 'Material Store'),

('eq-3', 'cat-3', 'Concrete Mixer Honda', 'machine', 'Honda', 'good',
 5, 3, 2, 0, 'CM500', 'CM500-2023', 'HON500001', 2023, 5000, 'petrol',
 1200.00, 8000.00, 48000.00, 180000.00, 20000.00,
 'available', 'MIX001', 'BAR003', 'Yard B'),

('eq-4', 'cat-1', 'Bulldozer Komatsu D65', 'machine', 'Komatsu', 'excellent',
 2, 2, 0, 0, 'D65PX-18', 'D65PX001', 'KOM65001', 2022, 180000, 'diesel',
 6000.00, 42000.00, 252000.00, 960000.00, 120000.00,
 'available', 'BUL001', 'BAR002', 'Yard A'),

('eq-5', 'cat-4', 'Angle Grinder Bosch', 'machine', 'Bosch', 'excellent',
 15, 12, 3, 0, 'GWS 2000', 'GWS2000-230', 'BOS2000001', 2023, 2000, 'electric',
 300.00, 1500.00, 9000.00, 30000.00, 5000.00,
 'available', 'GRN001', 'BAR004', 'Tool Room'),

('eq-6', 'cat-5', 'Mobile Crane 25T', 'machine', 'Tadano', 'good',
 1, 0, 1, 0, 'GR-250XL', 'GR250XL001', 'TAD250001', 2021, 200000, 'diesel',
 8000.00, 55000.00, 330000.00, 1200000.00, 200000.00,
 'rented', 'CRN001', 'BAR008', 'Yard A');

-- Insert customers
INSERT INTO customers (
    id, customer_type, name, company_name, contact_person,
    primary_phone, secondary_phone, email, id_number, business_reg_number,
    address_line1, address_line2, city, district, postal_code,
    credit_limit, outstanding_balance, total_rentals, total_spent, status
) VALUES
('cust-1', 'individual', 'John Silva', NULL, NULL,
 '+94771234567', NULL, 'john.silva@email.com', '123456789V', NULL,
 'No. 123, Main Street', 'Matara South', 'Matara', 'Matara', '81000',
 500000.00, 63400.00, 8, 450000.00, 'active'),

('cust-2', 'company', 'ABC Construction Ltd', 'ABC Construction Ltd', 'Sunil Perera',
 '+94777654321', '+94112345678', 'info@abcconstruction.lk', 'PV00123456', 'PV00123456',
 'No. 456, Industrial Zone', 'Galle Road', 'Galle', 'Galle', '80000',
 2000000.00, 275000.00, 25, 1850000.00, 'active'),

('cust-3', 'company', 'Metro Builders', 'Metro Builders (Pvt) Ltd', 'Kamal Fernando',
 '+94712345678', '+94115678901', 'contact@metrobuilders.lk', 'PV00789012', 'PV00789012',
 'No. 789, Commercial Street', 'Colombo 03', 'Colombo', 'Colombo', '00300',
 5000000.00, 0.00, 15, 2100000.00, 'active'),

('cust-4', 'individual', 'Nimal Rajapaksa', NULL, NULL,
 '+94701234567', NULL, 'nimal.r@email.com', '987654321V', NULL,
 'No. 321, Temple Road', 'Tangalle', 'Tangalle', 'Hambantota', '82200',
 300000.00, 0.00, 3, 125000.00, 'active'),

('cust-5', 'company', 'Lanka Constructions', 'Lanka Constructions (Pvt) Ltd', 'Priya Wickramasinghe',
 '+94765432109', '+94117654321', 'admin@lankaconstructions.lk', 'PV00456789', 'PV00456789',
 'No. 654, New Town', 'Kandy Road', 'Kandy', 'Kandy', '20000',
 1500000.00, 180000.00, 12, 980000.00, 'active');

-- Insert rentals
INSERT INTO rentals (
    id, rental_number, customer_id, customer_name, customer_phone, admin_id,
    rental_date, start_date, expected_return_date, actual_return_date,
    subtotal, tax_rate, tax_amount, discount_amount, security_deposit,
    total_amount, paid_amount, outstanding_amount,
    status, payment_status, delivery_required, delivery_fee,
    pickup_required, pickup_fee, qr_code
) VALUES
('rent-1', 'R001', 'cust-1', 'John Silva', '+94771234567', 'admin-1',
 '2024-01-22 10:00:00', '2024-01-22', '2024-01-25', NULL,
 105000.00, 8.00, 8400.00, 0.00, 100000.00,
 113400.00, 50000.00, 63400.00,
 'active', 'partial', FALSE, 0.00, FALSE, 0.00, 'RNT001'),

('rent-2', 'R002', 'cust-2', 'ABC Construction Ltd', '+94777654321', 'admin-1',
 '2024-01-18 10:00:00', '2024-01-18', '2024-01-23', NULL,
 80000.00, 8.00, 6400.00, 5000.00, 40000.00,
 81400.00, 81400.00, 0.00,
 'overdue', 'paid', TRUE, 5000.00, TRUE, 5000.00, 'RNT002'),

('rent-3', 'R003', 'cust-3', 'Metro Builders', '+94712345678', 'admin-1',
 '2024-01-20 10:00:00', '2024-01-20', '2024-01-22', '2024-01-22',
 30000.00, 8.00, 2400.00, 0.00, 0.00,
 32400.00, 32400.00, 0.00,
 'returned', 'paid', FALSE, 0.00, FALSE, 0.00, 'RNT003'),

('rent-4', 'R004', 'cust-5', 'Lanka Constructions', '+94765432109', 'admin-1',
 '2024-01-15 10:00:00', '2024-01-15', '2024-01-30', NULL,
 660000.00, 8.00, 52800.00, 20000.00, 200000.00,
 692800.00, 400000.00, 292800.00,
 'active', 'partial', TRUE, 15000.00, TRUE, 15000.00, 'RNT004');

-- Insert rental items
INSERT INTO rental_items (
    id, rental_id, equipment_id, equipment_name,
    quantity, rate_type, rate, duration, subtotal
) VALUES
('ri-1', 'rent-1', 'eq-1', 'Excavator CAT 320D', 1, 'daily', 35000.00, 3, 105000.00),
('ri-2', 'rent-2', 'eq-3', 'Concrete Mixer Honda', 2, 'daily', 8000.00, 5, 80000.00),
('ri-3', 'rent-3', 'eq-2', 'Steel Rebar 12mm', 100, 'daily', 150.00, 2, 30000.00),
('ri-4', 'rent-4', 'eq-6', 'Mobile Crane 25T', 1, 'weekly', 330000.00, 2, 660000.00);

-- Insert sample payments
INSERT INTO payments (
    id, rental_id, customer_id, admin_id, payment_number,
    amount, payment_method, reference_number
) VALUES
('pay-1', 'rent-1', 'cust-1', 'admin-1', 'PAY001', 50000.00, 'cash', NULL),
('pay-2', 'rent-2', 'cust-2', 'admin-1', 'PAY002', 81400.00, 'bank_transfer', 'TXN123456'),
('pay-3', 'rent-3', 'cust-3', 'admin-1', 'PAY003', 32400.00, 'card', 'CARD789'),
('pay-4', 'rent-4', 'cust-5', 'admin-1', 'PAY004', 400000.00, 'bank_transfer', 'TXN654321');
