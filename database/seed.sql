INSERT INTO users (id, name, email, password_hash, role)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Inventra Admin', 'admin@inventra.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z7h4Avzk1l3pNGdisz8Iu', 'ADMIN'),
    ('22222222-2222-2222-2222-222222222222', 'Inventra Staff', 'staff@inventra.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z7h4Avzk1l3pNGdisz8Iu', 'STAFF'),
    ('33333333-3333-3333-3333-333333333333', 'Inventra Viewer', 'viewer@inventra.com', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z7h4Avzk1l3pNGdisz8Iu', 'VIEWER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (id, name, description)
VALUES
    ('44444444-4444-4444-4444-444444444444', 'Electronics', 'Consumer and office electronics'),
    ('55555555-5555-5555-5555-555555555555', 'Stationery', 'Office consumables and accessories')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (id, name, description, hsn_code, unit_price, gst_percentage, quantity_available, reorder_level, category_id)
VALUES
    ('66666666-6666-6666-6666-666666666666', 'Thermal Printer', 'Compact point-of-sale printer', '84433210', 8999.00, 18.00, 12, 5, '44444444-4444-4444-4444-444444444444'),
    ('77777777-7777-7777-7777-777777777777', 'A4 Paper Pack', '500-sheet copier paper pack', '48025690', 320.00, 12.00, 40, 15, '55555555-5555-5555-5555-555555555555')
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, name, phone, email, address, gst_number, credit_limit)
VALUES
    ('88888888-8888-8888-8888-888888888888', 'Acme Retail', '9876543210', 'ops@acme.example', 'Pune, Maharashtra', '27ABCDE1234F1Z5', 100000.00),
    ('99999999-9999-9999-9999-999999999999', 'North Star Traders', '9123456780', 'billing@northstar.example', 'Mumbai, Maharashtra', '27PQRSX6789L1Z2', 150000.00)
ON CONFLICT (phone) DO NOTHING;