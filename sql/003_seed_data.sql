-- PiwiSuite Vet - Seed Data
-- Initial admin user and company for testing
-- Password: admin123 (SHA-256 hash)

-- Pre-computed SHA-256 of "admin123" = 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
-- Note: In production, use the /api/seed endpoint to hash passwords properly

INSERT OR IGNORE INTO companies (id, raz_social, nombre_fantasia, rut, direccion, comuna, region, telefono, correo_contacto, plan, estado)
VALUES ('company-demo-001', 'Veterinaria Demo SpA', 'VetDemo', '76.543.210-K', 'Av. Providencia 1234', 'Providencia', 'rm', '+56912345678', 'contacto@vetdemo.cl', 'profesional', 'active');

INSERT OR IGNORE INTO company_settings (id, company_id, correo_remitente)
VALUES ('settings-demo-001', 'company-demo-001', 'noreply@vetdemo.cl');

INSERT OR IGNORE INTO users (id, company_id, nombre_completo, rut, correo, telefono, cargo, rol, estado, requiere_cambio_password, password_hash)
VALUES ('user-admin-001', 'company-demo-001', 'Administrador Demo', '12.345.678-5', 'admin@vetdemo.cl', '+56987654321', 'Administrador', 'admin', 'active', 1, '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');

INSERT OR IGNORE INTO veterinarians (id, company_id, user_id, nombre_completo, rut, nro_registro_profesional, especialidad, correo, telefono, estado)
VALUES ('vet-demo-001', 'company-demo-001', 'user-admin-001', 'Dr. Administrador Demo', '12.345.678-5', 'MV-12345', 'Medicina General', 'admin@vetdemo.cl', '+56987654321', 'active');