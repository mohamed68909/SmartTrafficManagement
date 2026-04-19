// ═══ AUTH MOCK DATA ═══
// Hardcoded test accounts for mock login

export const MOCK_ACCOUNTS = [
  { email: 'provider@test.com', password: '123456', role: 'provider', name: 'Service Provider' },
  { email: 'seller@test.com',   password: '123456', role: 'seller',   name: 'Tire World' },
  { email: 'admin@test.com',    password: '123456', role: 'admin',    name: 'System Admin' },
  { email: 'cs@test.com',       password: '123456', role: 'cs',       name: 'Sarah Kamal' },
];

export const MOCK_ME = {
  provider: { id: 'PRV-001', name: 'Service Provider',   email: 'provider@test.com', role: 'provider', avatar: 'QR' },
  seller:   { id: 'SLR-001', name: 'Tire World',  email: 'seller@test.com',   role: 'seller',   avatar: 'TW' },
  admin:    { id: 'ADM-001', name: 'System Admin',    email: 'admin@test.com',    role: 'admin',    avatar: 'SA' },
  cs:       { id: 'AGT-001', name: 'Sarah Kamal',      email: 'cs@test.com',       role: 'cs',       avatar: 'SK' },
};
