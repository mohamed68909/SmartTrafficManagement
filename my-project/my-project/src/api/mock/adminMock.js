// ═══ ADMIN MOCK DATA ═══
// Extracted from Admin.jsx inline data — components never import this file directly.

export const MOCK_ADMIN_DASHBOARD = {
  stats: [
    { icon: '👥', label: 'Total Users', val: '52,340', color: 'var(--blue)', delta: '↑ 34% this month' },
    { icon: '🚗', label: 'Service Providers', val: '1,284', color: 'var(--neon)', delta: '↑ 22% active' },
    { icon: '🏪', label: 'Sellers', val: '342', color: 'var(--purple)', delta: '28 pending' },
    { icon: '📡', label: 'Sensors', val: '32', color: 'var(--amber)', delta: '30 active · 1 warning' },
  ],
  trafficMap: [
    { top: '25%', left: '30%', color: 'var(--neon)', label: 'Tagamoa', density: 72 },
    { top: '40%', left: '55%', color: 'var(--red)', label: 'Dokki', density: 95 },
    { top: '60%', left: '40%', color: 'var(--amber)', label: 'Maadi', density: 89 },
    { top: '30%', left: '65%', color: 'var(--neon)', label: 'Heliopolis', density: 58 },
    { top: '55%', left: '25%', color: 'var(--neon)', label: '6th of October', density: 44 },
    { top: '70%', left: '60%', color: 'var(--neon)', label: 'Nasr City', density: 65 },
  ],
  systemStatus: [
    { name: 'API Gateway', status: 'Online', uptime: '99.97%', color: 'var(--neon)' },
    { name: 'Database', status: 'Online', uptime: '99.99%', color: 'var(--neon)' },
    { name: 'SignalR Hub', status: 'Online', uptime: '99.94%', color: 'var(--neon)' },
    { name: 'Payment Gateway', status: 'Online', uptime: '99.91%', color: 'var(--neon)' },
    { name: 'IoT Network', status: 'Warning', uptime: '98.2%', color: 'var(--amber)' },
  ],
  recentActivity: [
    { icon: '✅', text: 'Approved service provider: Quick Transport', time: '12m ago', color: 'var(--neon-dim)' },
    { icon: '⚠️', text: 'Sensor alert: Dokki — Density 95%', time: '28m ago', color: 'var(--amber-dim)' },
    { icon: '👤', text: 'New user: Mohamed Hassan (Driver)', time: '45m ago', color: 'var(--blue-dim)' },
    { icon: '🚗', text: 'Emergency request #4417 — Assigned', time: '1h ago', color: 'var(--red-dim)' },
    { icon: '💰', text: 'Earnings transfer: 145,000 EGP — 12 providers', time: '2h ago', color: 'var(--neon-dim)' },
  ],
};

export const MOCK_ADMIN_ANALYTICS = {
  stats: [
    { label: 'Total Revenue', val: '1.4M EGP', color: 'var(--neon)', delta: '↑ 12% this month' },
    { label: 'Orders this month', val: '3,284', color: 'var(--blue)', delta: '↑ 8% from last month' },
    { label: 'Avg Rating', val: '4.7 ★', color: 'var(--yellow)', delta: 'from 1,284 reviews' },
    { label: 'Completion Rate', val: '96.4%', color: 'var(--neon)', delta: '↑ 2.1% improvement' },
  ],
  monthlyChart: [
    { m: 'Jan', v: 18400 }, { m: 'Feb', v: 21200 }, { m: 'Mar', v: 24800 },
    { m: 'Apr', v: 28400 }, { m: 'May', v: 32100 }, { m: 'Jun', v: 29800 },
    { m: 'Jul', v: 26500 }, { m: 'Aug', v: 24100 }, { m: 'Sep', v: 27900 },
    { m: 'Oct', v: 31400 }, { m: 'Nov', v: 34200 }, { m: 'Dec', v: 38500 },
  ],
  userActivity: [55, 72, 60, 88, 75, 95, 82],
};

export const MOCK_ADMIN_APPROVALS = [
  { id: 'APR-101', name: 'Quick Transport', type: 'Service Provider', service: 'Tow Truck', docs: 4, date: '10 Mar', img: '🚛' },
  { id: 'APR-102', name: 'Safety Store', type: 'Seller', service: 'Spare Parts', docs: 3, date: '11 Mar', img: '🏪' },
  { id: 'APR-103', name: 'Fuel Express', type: 'Service Provider', service: 'Fuel Delivery', docs: 5, date: '12 Mar', img: '⛽' },
  { id: 'APR-104', name: 'Ahmed Mechanic', type: 'Service Provider', service: 'Mechanic', docs: 3, date: '13 Mar', img: '🔧' },
];

export const MOCK_ADMIN_APPROVALS_STATS = [
  { icon: '⏳', label: 'Pending', val: 8, color: 'var(--amber)' },
  { icon: '✅', label: 'Approved', val: 45, color: 'var(--neon)' },
  { icon: '❌', label: 'Rejected', val: 3, color: 'var(--red)' },
];

export const MOCK_ADMIN_SENSORS = [
  { id: 'SNS-001', name: 'Tagamoa 5th', status: 'Active', density: 72, speed: 45, temp: 28, alerts: 0 },
  { id: 'SNS-002', name: 'Maadi', status: 'Active', density: 89, speed: 22, temp: 31, alerts: 2 },
  { id: 'SNS-003', name: 'Nasr City', status: 'Active', density: 65, speed: 55, temp: 27, alerts: 0 },
  { id: 'SNS-004', name: 'Dokki', status: 'Warning', density: 95, speed: 12, temp: 33, alerts: 4 },
  { id: 'SNS-005', name: 'Heliopolis', status: 'Active', density: 58, speed: 48, temp: 26, alerts: 1 },
  { id: 'SNS-006', name: '6th of October', status: 'Active', density: 44, speed: 68, temp: 29, alerts: 0 },
  { id: 'SNS-007', name: 'Shoubra', status: 'Offline', density: 0, speed: 0, temp: 0, alerts: 0 },
  { id: 'SNS-008', name: 'Helwan', status: 'Active', density: 37, speed: 72, temp: 30, alerts: 0 },
];

export const MOCK_ADMIN_TRAFFIC = {
  legend: { smooth: 4, medium: 2, heavy: 1 },
  markers: [
    { top: '28%', left: '20%', color: 'var(--neon)', label: 'Tagamoa', size: 16 },
    { top: '58%', left: '45%', color: 'var(--red)', label: 'Dokki', size: 20 },
    { top: '35%', left: '70%', color: 'var(--amber)', label: 'Maadi', size: 18 },
    { top: '25%', left: '50%', color: 'var(--neon)', label: 'Heliopolis', size: 14 },
    { top: '65%', left: '25%', color: 'var(--neon)', label: '6th of October', size: 14 },
    { top: '70%', left: '65%', color: 'var(--amber)', label: 'Nasr City', size: 16 },
    { top: '45%', left: '35%', color: 'var(--text3)', label: 'Shoubra · Offline', size: 10 },
  ],
};

export const MOCK_ADMIN_ABOUT = {
  cards: [
    { icon: '🖥️', title: 'Platform Version', val: 'v3.4.1', sub: 'Last update: 9 Apr 2026', valColor: 'var(--text)' },
    { icon: '🛡️', title: 'Server Status', val: 'Active', sub: 'Uptime: 99.98%', valColor: 'var(--neon)' },
    { icon: '📡', title: 'App Integration', val: 'Active', sub: 'Linked with driver app', valColor: 'var(--cyan)' },
    { icon: '👥', title: 'Total Users', val: '4,821', sub: 'Registered users', valColor: 'var(--text)' },
    { icon: '🏪', title: 'Active Sellers', val: '38', sub: 'Verified store', valColor: 'var(--yellow)' },
    { icon: '🔧', title: 'Service Providers', val: '124', sub: 'Verified provider', valColor: 'var(--blue)' },
  ],
  eventLog: [
    { icon: '🚨', iconBg: 'var(--red-dim)', title: 'Urgent Request — Mohamed Hassan', sub: 'Broken axle — Ring Road', time: 'Now' },
    { icon: '✅', iconBg: 'var(--neon-dim)', title: 'Provider Accepted', sub: 'QuickRescue LLC — Heliopolis', time: '3m' },
    { icon: '⏳', iconBg: 'var(--yellow-dim)', title: 'New Seller Registration', sub: 'TireWorld Express — Giza', time: '11m' },
    { icon: '💬', iconBg: 'var(--blue-dim)', title: 'New Support Ticket #1048', sub: 'Payment issue — Sarah Ahmed', time: '18m' },
    { icon: '✅', iconBg: 'var(--neon-dim)', title: 'Order Completed #4428', sub: 'Car rescue successful — October Bridge', time: '1h' },
    { icon: '⚠️', iconBg: 'var(--red-dim)', title: 'System Alert: Sensor #07 Slow Response', sub: 'Switched to mobile app data', time: '2h' },
  ],
  techInfo: [
    { label: 'Environment', val: 'Production v3.4.1', color: 'var(--neon)' },
    { label: 'Database', val: 'PostgreSQL 16.2', color: 'var(--blue)' },
    { label: 'Service Handler', val: 'Node.js 20 LTS', color: 'var(--cyan)' },
    { label: 'Tech Support', val: 'support@smarttraffic.io', color: 'var(--yellow)' },
  ],
};

export const MOCK_ADMIN_URGENT = [
  { id: '#4431', name: 'Mohamed Hassan', phone: '+20 100 123 4567', initials: 'MH', type: 'Broken axle', location: 'Ring Road — Nasser', wait: '14 min', waitColor: 'var(--red)', status: 'Pending', statusColor: 'var(--amber)', action: 'assign' },
  { id: '#4430', name: 'Lina Ahmed', phone: '+20 111 987 6543', initials: 'LA', type: 'Fuel leak', location: 'Autostrad — Tagamoa', wait: '8 min', waitColor: 'var(--yellow)', status: 'On The Way', statusColor: 'var(--neon)', action: 'track' },
  { id: '#4428', name: 'Youssef Salem', phone: '+20 122 555 0099', initials: 'YS', type: 'Accident — Tow', location: 'October Bridge', wait: '2 min', waitColor: 'var(--neon)', status: 'Completed', statusColor: 'var(--neon)', action: 'view' },
];

export const MOCK_ADMIN_USERS = {
  user: [
    { id: 'USR-001', initials: 'MH', name: 'Mohamed Hassan', email: 'm.hassan@mail.eg', phone: '0100 123 4567', status: 'Active', date: 'Jan 2024', orders: 12 },
    { id: 'USR-002', initials: 'LA', name: 'Lina Ahmed', email: 'lina@mail.eg', phone: '0111 987 6543', status: 'Active', date: 'Feb 2024', orders: 5 },
    { id: 'USR-003', initials: 'YS', name: 'Youssef Salem', email: 'youssef@mail.eg', phone: '0122 555 0099', status: 'Pending', date: 'Mar 2024', orders: 3 },
    { id: 'USR-004', initials: 'SA', name: 'Sarah Ahmed', email: 'sara@mail.eg', phone: '0100 333 2211', status: 'Active', date: 'Apr 2024', orders: 8 },
    { id: 'USR-005', initials: 'KA', name: 'Khaled Ali', email: 'khaled@mail.eg', phone: '0112 777 4455', status: 'Blocked', date: 'Mar 2026', orders: 0 },
  ],
  seller: [
    { id: 'SLR-001', initials: 'TW', name: 'Tire World', email: 'info@tireworld.eg', phone: '0100 200 3000', status: 'Active', date: 'Jan 2024', orders: 320 },
    { id: 'SLR-002', initials: 'SS', name: 'Safety Store', email: 'safety@store.eg', phone: '0111 400 5000', status: 'Pending', date: 'Mar 2024', orders: 0 },
    { id: 'SLR-003', initials: 'PP', name: 'Parts Plus', email: 'parts@plus.eg', phone: '0122 600 7000', status: 'Active', date: 'Feb 2024', orders: 184 },
  ],
  provider: [
    { id: 'PRV-001', initials: 'QR', name: 'Quick Rescue', email: 'quick@rescue.eg', phone: '0100 111 2222', status: 'Active', date: 'Jan 2024', rating: '4.9' },
    { id: 'PRV-002', initials: 'AF', name: 'AutoFix Pro', email: 'auto@fix.eg', phone: '0111 333 4444', status: 'Active', date: 'Feb 2024', rating: '4.3' },
    { id: 'PRV-003', initials: 'MR', name: 'MegaRecovery', email: 'mega@recovery.eg', phone: '0122 555 6666', status: 'Pending', date: 'Mar 2024', rating: '3.1' },
    { id: 'PRV-004', initials: 'FE', name: 'Fuel Express', email: 'fuel@express.eg', phone: '0100 777 8888', status: 'Pending', date: 'Mar 2026', rating: '—' },
  ],
};

export const MOCK_ADMIN_TICKETS = [
  { id: '#1048', subject: 'Payment Issue', user: 'Sarah Ahmed', initials: 'SA', agent: 'Sarah Kamal', status: 'Open', date: '10 Apr' },
  { id: '#1047', subject: 'Provider location not showing', user: 'Mohamed Hassan', initials: 'MH', agent: 'Omar Fouad', status: 'In Progress', date: '9 Apr' },
  { id: '#1046', subject: 'Account blocked by mistake', user: 'Youssef Salem', initials: 'YS', agent: 'Sarah Kamal', status: 'Done', date: '8 Apr' },
];

export const MOCK_ADMIN_TICKETS_STATS = [
  { label: 'Open', val: 1, color: 'var(--red)' },
  { label: 'In Progress', val: 1, color: 'var(--yellow)' },
  { label: 'Done', val: 1, color: 'var(--neon)' },
];

export const MOCK_ADMIN_CS_AGENTS = [
  { id: 'AGT-001', initials: 'SK', name: 'Sarah Kamal', email: 'sara@smarttraffic.io', code: 'EMP-2401', open: 3, done: 12, status: 'Active', avatarGrad: 'linear-gradient(135deg,var(--neon),#2eff80)', avatarColor: '#000' },
  { id: 'AGT-002', initials: 'OF', name: 'Omar Fouad', email: 'omar@smarttraffic.io', code: 'EMP-2402', open: 2, done: 9, status: 'Active', avatarGrad: 'linear-gradient(135deg,var(--blue),#0066ff)', avatarColor: '#fff' },
  { id: 'AGT-003', initials: 'RH', name: 'Rana Hossam', email: 'rana@smarttraffic.io', code: 'EMP-2403', open: 0, done: 0, status: 'Inactive', avatarGrad: 'var(--bg3)', avatarColor: 'var(--text3)' },
];

export const MOCK_ADMIN_RATINGS = {
  stats: [
    { label: 'Avg Rating', val: '4.7', color: 'var(--neon)', delta: '★★★★★' },
    { label: 'Total Ratings', val: '1,284', color: 'var(--blue)', delta: '↑ 18 this week' },
    { label: '5 Star Reviews', val: '78%', color: 'var(--yellow)', delta: 'of total reviews' },
    { label: '1-2 Star Reviews', val: '4.2%', color: 'var(--red)', delta: 'Needs review' },
  ],
  starDistribution: [
    { stars: '5★', pct: 78, color: 'var(--yellow)' },
    { stars: '4★', pct: 14, color: 'rgba(255,204,0,.6)' },
    { stars: '3★', pct: 4, color: 'rgba(255,204,0,.4)' },
    { stars: '2★', pct: 2, color: 'rgba(255,61,87,.5)' },
    { stars: '1★', pct: 2, color: 'var(--red)' },
  ],
  topProviders: [
    { initials: 'QR', name: 'QuickRescue LLC', sub: '1,204 orders done', rating: '4.9', color: 'var(--cyan)' },
    { initials: 'AF', name: 'AutoFix Pro', sub: '876 orders done', rating: '4.3', color: 'var(--pink)' },
    { initials: 'MR', name: 'MegaRecovery', sub: '102 orders done', rating: '3.1', color: 'var(--text3)' },
  ],
  list: [
    { id: 'RTG-001', userInitials: 'MH', userName: 'Mohamed Hassan', provider: 'QuickRescue', stars: 5, comment: 'Very fast response!', order: '#4416', date: '15 Mar' },
    { id: 'RTG-002', userInitials: 'SA', userName: 'Sarah Ahmed', provider: 'FuelRush', stars: 4, comment: 'Good service, some delay.', order: '#4420', date: '15 Mar' },
    { id: 'RTG-003', userInitials: 'YS', userName: 'Youssef Salem', provider: 'AutoFix Pro', stars: 2, comment: 'Issue not resolved.', order: '#4409', date: '13 Mar' },
  ],
};

export const MOCK_ADMIN_OPERATIONS = {
  stats: [
    { label: 'Ongoing Orders', val: '14', color: 'var(--neon)', delta: '↑ 3 since last hour' },
    { label: 'Shipments OTW', val: '7', color: 'var(--blue)', delta: '4 arriving today' },
    { label: 'Processing', val: '5', color: 'var(--yellow)', delta: 'Orders need confirm' },
    { label: 'Return Requests', val: '3', color: 'var(--red)', delta: 'Pending financial review' },
  ],
  rescue: [
    { id: '#4431', user: 'Mohamed Hassan', initials: 'MH', type: 'Broken axle', provider: 'QuickRescue', location: 'Ring Rd — Nasser', status: 'Pending', time: '14 min' },
    { id: '#4430', user: 'Lina Ahmed', initials: 'LA', type: 'Fuel leak', provider: 'FuelRush', location: 'Autostrad Tagamoa', status: 'On The Way', time: '8 min' },
    { id: '#4428', user: 'Youssef Salem', initials: 'YS', type: 'Accident — Tow', provider: 'AutoFix Pro', location: 'October Bridge', status: 'Completed', time: '2 min' },
  ],
  fuel: [
    { id: '#F-201', user: 'Amira Khaled', initials: 'AK', liters: '30L', provider: 'FuelRush', location: 'Nasr City', status: 'On The Way', time: '5 min' },
    { id: '#F-202', user: 'Tarek Mahmoud', initials: 'TM', liters: '20L', provider: 'PetroLine', location: 'Dokki', status: 'Pending', time: '18 min' },
  ],
  products: [
    { id: '#P-301', seller: 'Tire World', item: 'Tire 205/55R16', qty: 2, buyer: 'Khaled Ali', status: 'On The Way', eta: 'Today 3 PM' },
    { id: '#P-302', seller: 'Parts Plus', item: 'Motor Oil 5W30', qty: 4, buyer: 'Mohamed Hassan', status: 'Ready', eta: 'Tomorrow 10 AM' },
  ],
  returns: [
    { id: '#R-401', user: 'Sarah Ahmed', initials: 'SA', item: 'Defective tire', amount: '450 EGP', status: 'Under Review', date: '10 Apr' },
    { id: '#R-402', user: 'Youssef Salem', initials: 'YS', item: 'Wrong oil', amount: '180 EGP', status: 'Refunded', date: '9 Apr' },
  ],
};

export const MOCK_ADMIN_NOTIFICATIONS = [
  { icon: '🚨', iconBg: 'var(--red-dim)', title: 'Urgent Request — Mohamed Hassan', sub: 'Broken axle — Ring Road', time: 'Now' },
  { icon: '✅', iconBg: 'var(--neon-dim)', title: 'Provider Accepted', sub: 'QuickRescue LLC — Heliopolis', time: '3 mins ago' },
  { icon: '⏳', iconBg: 'var(--yellow-dim)', title: 'New Seller Registration', sub: 'TireWorld Express — Giza', time: '11 mins ago' },
  { icon: '💬', iconBg: 'var(--blue-dim)', title: 'New Support Ticket #1048', sub: 'Payment issue — Sarah Ahmed', time: '18 mins ago' },
  { icon: '✅', iconBg: 'var(--neon-dim)', title: 'Order Completed #4428', sub: 'Car rescue — October Bridge', time: '1 hour ago' },
];
