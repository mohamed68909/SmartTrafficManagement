// ═══ AUTH MOCK DATA ═══
// Hardcoded test accounts for mock login

export const MOCK_ACCOUNTS = [
  { email: 'provider@test.com', password: '123456', role: 'provider', name: 'مزود الخدمة' },
  { email: 'seller@test.com',   password: '123456', role: 'seller',   name: 'عالم الإطارات' },
  { email: 'admin@test.com',    password: '123456', role: 'admin',    name: 'مدير النظام' },
  { email: 'cs@test.com',       password: '123456', role: 'cs',       name: 'سارة كمال' },
];

export const MOCK_ME = {
  provider: { id: 'PRV-001', name: 'مزود الخدمة',   email: 'provider@test.com', role: 'provider', avatar: 'QR' },
  seller:   { id: 'SLR-001', name: 'عالم الإطارات',  email: 'seller@test.com',   role: 'seller',   avatar: 'عإ' },
  admin:    { id: 'ADM-001', name: 'مدير النظام',    email: 'admin@test.com',    role: 'admin',    avatar: 'مد' },
  cs:       { id: 'AGT-001', name: 'سارة كمال',      email: 'cs@test.com',       role: 'cs',       avatar: 'سك' },
};
