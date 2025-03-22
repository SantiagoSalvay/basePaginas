USE modavista_db;

INSERT INTO users (
  id, 
  name, 
  email, 
  password, 
  role, 
  email_verified,
  created_at
) VALUES (
  UUID(), 
  'Administrador', 
  'admin@admin', 
  '$2a$10$3i9SL5/ognyHCz.mw2beP.oFQxJ0tF32Qwj3usrwBaqYD/G/JLhnm', 
  'admin', 
  1, 
  NOW()
);

-- La contraseña hasheada es 'admin' 