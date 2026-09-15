import { APPS_SCRIPT_URL, DEMO_MODE } from './config';

// ============================================================================
// DEMO MODE — seed data & localStorage-backed persistence.
// This lets the site run fully (browse, book, admin CRUD) with zero backend
// setup. Swap in your Apps Script URL in src/config.js to go live with a
// real Google Sheet.
// ============================================================================

const SEED_VEHICLES = [
  {
    id: 'v1',
    name: 'Kombi Sunrise',
    type: 'Campervan',
    seats: 4,
    transmission: 'Manual',
    pricePerDay: 89,
    description:
      'A classic pop-top campervan kitted out for the coast road: kitchenette, fold-out bed, and enough room to actually stretch out at the end of a long driving day.',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      'https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=1200&q=80',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80',
    ],
    available: true,
  },
  {
    id: 'v2',
    name: 'Ranger 4x4',
    type: 'SUV',
    seats: 5,
    transmission: 'Automatic',
    pricePerDay: 64,
    description:
      'Built for gravel roads and steep switchbacks. High clearance, all-wheel drive, and a roof rack for boards, bikes, or bags.',
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80',
    ],
    available: true,
  },
  {
    id: 'v3',
    name: 'Dune Runner',
    type: 'Jeep',
    seats: 4,
    transmission: 'Manual',
    pricePerDay: 72,
    description:
      'Open-top and low-geared for slow, scenic tracks. Removable doors and a soft top for when the weather cooperates.',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80',
      'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&q=80',
    ],
    available: true,
  },
  {
    id: 'v4',
    name: 'Coastliner',
    type: 'Minivan',
    seats: 7,
    transmission: 'Automatic',
    pricePerDay: 95,
    description:
      'The easy choice for a group: seven seats, generous boot space, and a smooth ride for long stretches of highway.',
    images: [
      'https://images.unsplash.com/photo-1543465077-db45d34b88a5?w=1200&q=80',
    ],
    available: true,
  },
];

function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeed() {
  if (!localStorage.getItem('wayfarer_vehicles')) {
    saveLocal('wayfarer_vehicles', SEED_VEHICLES);
  }
  if (!localStorage.getItem('wayfarer_bookings')) {
    saveLocal('wayfarer_bookings', []);
  }
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const demoApi = {
  async listVehicles() {
    ensureSeed();
    return loadLocal('wayfarer_vehicles', []);
  },
  async listBookings() {
    ensureSeed();
    return loadLocal('wayfarer_bookings', []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
  async createBooking(booking) {
    ensureSeed();
    const bookings = loadLocal('wayfarer_bookings', []);
    const record = {
      id: uid(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...booking,
    };
    bookings.push(record);
    saveLocal('wayfarer_bookings', bookings);
    return record;
  },
  async updateBookingStatus(id, status) {
    const bookings = loadLocal('wayfarer_bookings', []);
    const next = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    saveLocal('wayfarer_bookings', next);
    return next.find((b) => b.id === id);
  },
  async addVehicle(vehicle) {
    const vehicles = loadLocal('wayfarer_vehicles', []);
    const record = { id: uid(), available: true, ...vehicle };
    vehicles.push(record);
    saveLocal('wayfarer_vehicles', vehicles);
    return record;
  },
  async updateVehicle(vehicle) {
    const vehicles = loadLocal('wayfarer_vehicles', []);
    const next = vehicles.map((v) => (v.id === vehicle.id ? { ...v, ...vehicle } : v));
    saveLocal('wayfarer_vehicles', next);
    return next.find((v) => v.id === vehicle.id);
  },
  async deleteVehicle(id) {
    const vehicles = loadLocal('wayfarer_vehicles', []);
    saveLocal('wayfarer_vehicles', vehicles.filter((v) => v.id !== id));
    return true;
  },
  async login(token) {
    // Demo mode accepts a single hardcoded password so you can try the
    // admin panel without any setup. Change this before sharing the demo,
    // and replace it entirely once wired to Apps Script (see README).
    return token === 'admin123';
  },
};

// ============================================================================
// LIVE MODE — talks to a Google Apps Script Web App backed by a Google Sheet.
// ============================================================================

async function gsGet(params) {
  const url = new URL(APPS_SCRIPT_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { method: 'GET' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Request failed');
  return data.result;
}

async function gsPost(body) {
  // text/plain avoids a CORS preflight against the Apps Script endpoint.
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Request failed');
  return data.result;
}

function getToken() {
  return sessionStorage.getItem('wayfarer_admin_token') || '';
}

const liveApi = {
  async listVehicles() {
    return gsGet({ action: 'listVehicles' });
  },
  async listBookings() {
    return gsGet({ action: 'listBookings', token: getToken() });
  },
  async createBooking(booking) {
    return gsPost({ action: 'createBooking', payload: booking });
  },
  async updateBookingStatus(id, status) {
    return gsPost({ action: 'updateBookingStatus', token: getToken(), payload: { id, status } });
  },
  async addVehicle(vehicle) {
    return gsPost({ action: 'addVehicle', token: getToken(), payload: vehicle });
  },
  async updateVehicle(vehicle) {
    return gsPost({ action: 'updateVehicle', token: getToken(), payload: vehicle });
  },
  async deleteVehicle(id) {
    return gsPost({ action: 'deleteVehicle', token: getToken(), payload: { id } });
  },
  async login(token) {
    try {
      const result = await gsPost({ action: 'login', payload: { token } });
      return !!result;
    } catch {
      return false;
    }
  },
};

export const api = DEMO_MODE ? demoApi : liveApi;

export function setAdminToken(token) {
  sessionStorage.setItem('wayfarer_admin_token', token);
}
export function clearAdminToken() {
  sessionStorage.removeItem('wayfarer_admin_token');
}
export function getAdminToken() {
  return sessionStorage.getItem('wayfarer_admin_token') || '';
}
