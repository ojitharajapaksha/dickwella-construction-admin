-- Insert default admin user (password: admin123 - should be hashed in production)
INSERT INTO admin_users (username, email, password_hash, full_name, role) VALUES 
('admin', 'admin@dickwellaconstruction.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqO', 'System Administrator', 'admin'),
('manager', 'manager@dickwellaconstruction.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqO', 'Site Manager', 'manager'),
('operator', 'operator@dickwellaconstruction.com', '$2b$10$rOzJqQZJqQZJqQZJqQZJqO', 'Equipment Operator', 'operator');

-- Insert equipment categories
INSERT INTO equipment_categories (name, description, icon) VALUES 
('Heavy Machinery', 'Excavators, bulldozers, cranes, loaders', 'truck'),
('Power Tools', 'Drills, saws, grinders, compressors', 'zap'),
('Construction Materials', 'Steel bars, cement, sand, blocks', 'package'),
('Safety Equipment', 'Helmets, harnesses, barriers, signs', 'shield'),
('Concrete Equipment', 'Mixers, pumps, vibrators, screeds', 'settings'),
('Lifting Equipment', 'Cranes, hoists, forklifts, winches', 'move'),
('Scaffolding', 'Frames, planks, brackets, wheels', 'layers'),
('Electrical Equipment', 'Generators, cables, lighting', 'zap');

-- Get category IDs for reference
DO $$
DECLARE
    heavy_machinery_id UUID;
    power_tools_id UUID;
    materials_id UUID;
    safety_id UUID;
    concrete_id UUID;
    lifting_id UUID;
BEGIN
    SELECT id INTO heavy_machinery_id FROM equipment_categories WHERE name = 'Heavy Machinery';
    SELECT id INTO power_tools_id FROM equipment_categories WHERE name = 'Power Tools';
    SELECT id INTO materials_id FROM equipment_categories WHERE name = 'Construction Materials';
    SELECT id INTO safety_id FROM equipment_categories WHERE name = 'Safety Equipment';
    SELECT id INTO concrete_id FROM equipment_categories WHERE name = 'Concrete Equipment';
    SELECT id INTO lifting_id FROM equipment_categories WHERE name = 'Lifting Equipment';

    -- Insert sample equipment items
    INSERT INTO equipment_items (
        category_id, name, item_type, brand, total_quantity, available_quantity,
        model, model_number, serial_number, year_manufactured, wattage, fuel_type,
        hourly_rate, daily_rate, weekly_rate, monthly_rate, security_deposit,
        qr_code, barcode, location, condition
    ) VALUES 
    (heavy_machinery_id, 'Excavator CAT 320D', 'machine', 'Caterpillar', 2, 2,
     'CAT 320D', 'CAT320D2023', 'CAT320D001', 2023, 150000, 'diesel',
     5000.00, 35000.00, 210000.00, 800000.00, 100000.00,
     'EXC001', 'BAR001', 'Yard A', 'excellent'),
    
    (heavy_machinery_id, 'Bulldozer Komatsu D65', 'machine', 'Komatsu', 1, 1,
     'D65PX-18', 'D65PX001', 'KOM65001', 2022, 180000, 'diesel',
     6000.00, 42000.00, 252000.00, 960000.00, 120000.00,
     'BUL001', 'BAR002', 'Yard A', 'excellent'),
    
    (concrete_id, 'Concrete Mixer Honda', 'machine', 'Honda', 3, 3,
     'CM500', 'CM500-2023', 'HON500001', 2023, 5000, 'petrol',
     1200.00, 8000.00, 48000.00, 180000.00, 20000.00,
     'MIX001', 'BAR003', 'Yard B', 'good'),
    
    (power_tools_id, 'Angle Grinder Bosch', 'machine', 'Bosch', 10, 8,
     'GWS 2000', 'GWS2000-230', 'BOS2000001', 2023, 2000, 'electric',
     300.00, 1500.00, 9000.00, 30000.00, 5000.00,
     'GRN001', 'BAR004', 'Tool Room', 'excellent'),
    
    (materials_id, 'Steel Rebar 12mm', 'material', 'Ceylon Steel', 1000, 850,
     NULL, NULL, NULL, NULL, NULL, NULL,
     NULL, 150.00, 900.00, 3600.00, 0.00,
     'STL001', 'BAR005', 'Material Store', 'excellent'),
    
    (materials_id, 'Cement Portland', 'material', 'Holcim', 500, 450,
     NULL, NULL, NULL, NULL, NULL, NULL,
     NULL, 1200.00, 7200.00, 28800.00, 0.00,
     'CEM001', 'BAR006', 'Material Store', 'excellent'),
    
    (safety_id, 'Safety Helmet', 'material', 'MSA', 50, 45,
     NULL, NULL, NULL, NULL, NULL, NULL,
     50.00, 200.00, 1200.00, 4800.00, 500.00,
     'HEL001', 'BAR007', 'Safety Store', 'excellent'),
    
    (lifting_id, 'Mobile Crane 25T', 'machine', 'Tadano', 1, 1,
     'GR-250XL', 'GR250XL001', 'TAD250001', 2021, 200000, 'diesel',
     8000.00, 55000.00, 330000.00, 1200000.00, 200000.00,
     'CRN001', 'BAR008', 'Yard A', 'good');

    -- Set dimensions for materials
    UPDATE equipment_items SET 
        length = 6.0, unit = 'meters'
    WHERE name = 'Steel Rebar 12mm';
    
    UPDATE equipment_items SET 
        weight = 50.0, unit = 'kg'
    WHERE name = 'Cement Portland';

END $$;

-- Insert sample customers
INSERT INTO customers (
    customer_type, name, company_name, contact_person, primary_phone, secondary_phone, 
    email, id_number, business_reg_number, address_line1, address_line2, 
    city, district, postal_code, credit_limit, status
) VALUES 
('individual', 'John Silva', NULL, NULL, '+94771234567', NULL,
 'john.silva@email.com', '123456789V', NULL, 
 'No. 123, Main Street', 'Matara South', 'Matara', 'Matara', '81000', 500000.00, 'active'),

('company', 'ABC Construction Ltd', 'ABC Construction Ltd', 'Sunil Perera', '+94777654321', '+94112345678',
 'info@abcconstruction.lk', 'PV00123456', 'PV00123456', 
 'No. 456, Industrial Zone', 'Galle Road', 'Galle', 'Galle', '80000', 2000000.00, 'active'),

('company', 'Metro Builders', 'Metro Builders (Pvt) Ltd', 'Kamal Fernando', '+94712345678', '+94115678901',
 'contact@metrobuilders.lk', 'PV00789012', 'PV00789012', 
 'No. 789, Commercial Street', 'Colombo 03', 'Colombo', 'Colombo', '00300', 5000000.00, 'active'),

('individual', 'Nimal Rajapaksa', NULL, NULL, '+94701234567', NULL,
 'nimal.r@email.com', '987654321V', NULL, 
 'No. 321, Temple Road', 'Tangalle', 'Tangalle', 'Hambantota', '82200', 300000.00, 'active'),

('company', 'Lanka Constructions', 'Lanka Constructions (Pvt) Ltd', 'Priya Wickramasinghe', '+94765432109', '+94117654321',
 'admin@lankaconstructions.lk', 'PV00456789', 'PV00456789', 
 'No. 654, New Town', 'Kandy Road', 'Kandy', 'Kandy', '20000', 1500000.00, 'active');

-- Insert sample rental (for demonstration)
DO $$
DECLARE
    customer_id UUID;
    admin_id UUID;
    equipment_id UUID;
    rental_id UUID;
BEGIN
    SELECT id INTO customer_id FROM customers WHERE name = 'John Silva';
    SELECT id INTO admin_id FROM admin_users WHERE username = 'admin';
    SELECT id INTO equipment_id FROM equipment_items WHERE name = 'Excavator CAT 320D';
    
    INSERT INTO rentals (
        rental_number, customer_id, admin_id, start_date, expected_return_date,
        subtotal, tax_rate, tax_amount, total_amount, security_deposit,
        status, payment_status, qr_code
    ) VALUES (
        'R001', customer_id, admin_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days',
        105000.00, 8.00, 8400.00, 113400.00, 100000.00,
        'active', 'partial', 'RNT001'
    ) RETURNING id INTO rental_id;
    
    INSERT INTO rental_items (
        rental_id, equipment_id, quantity, rate_type, rate, duration, subtotal
    ) VALUES (
        rental_id, equipment_id, 1, 'daily', 35000.00, 3, 105000.00
    );
    
    -- Update equipment availability
    UPDATE equipment_items SET available_quantity = available_quantity - 1 WHERE id = equipment_id;
END $$;
