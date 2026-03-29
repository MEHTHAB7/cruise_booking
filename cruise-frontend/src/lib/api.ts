let csrfToken: string | null = null;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// =========================
// CSRF TOKEN
// =========================
let csrfTokenPromise: Promise<void> | null = null;

async function fetchCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/csrf-token`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch CSRF token');
        const data = await res.json();
        csrfToken = data.csrfToken;
      } finally {
        csrfTokenPromise = null;
      }
    })();
  }
  return csrfTokenPromise;
}

// =========================
// CUSTOM ERROR
// =========================
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// =========================
// CORE FETCH
// =========================
export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  if (!csrfToken) {
    await fetchCsrfToken();
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-csrf-token': csrfToken || '',
      ...(options.headers || {}),
    },
  });

  // Retry CSRF
  if (res.status === 403) {
    await fetchCsrfToken();

    const retry = await fetch(`${BASE_URL}${url}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken || '',
        ...(options.headers || {}),
      },
    });

    if (!retry.ok) {
      const text = await retry.text();
      throw new ApiError(text || 'Forbidden', 403);
    }
    return retry.json();
  }

  if (!res.ok) {
    let errorMsg = 'Request failed';
    const status = res.status;
    
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(', ');
      } else if (typeof errorMsg === 'object' && errorMsg !== null) {
        errorMsg = (errorMsg as any).message || JSON.stringify(errorMsg);
      }
    } catch {
      const text = await res.text();
      errorMsg = text || errorMsg;
    }
    throw new ApiError(String(errorMsg), status);
  }

  return res.json();
}

// =========================
// AUTH API
// =========================
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: any) =>
    apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch('/auth/logout', {
      method: 'POST',
    }),

  me: () => apiFetch('/auth/me'),
};

// =========================
// PORTS API
// =========================
export const portsApi = {
  getAll: () => apiFetch('/ports'),
  create: (data: any) => apiFetch('/ports', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// SHIPS API
// =========================
export const shipsApi = {
  getAll: () => apiFetch('/ships'),
  create: (data: any) => apiFetch('/ships', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// CRUISES API
// =========================
export const cruisesApi = {
  search: (params?: any) =>
    apiFetch('/cruises/search', {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),
  getOne: (id: string) => apiFetch(`/cruises/${id}`),
  create: (data: any) => apiFetch('/cruises', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// PACKAGES API
// =========================
export const packagesApi = {
  getByCruise: (cruiseId: string) => apiFetch(`/packages/cruise/${cruiseId}`),
  create: (data: any) => apiFetch('/packages', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// ROOMS API
// =========================
export const roomsApi = {
  getByShip: (shipId: string) => apiFetch(`/rooms/ship/${shipId}`),
  create: (data: any) => apiFetch('/rooms', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// RESTAURANTS API
// =========================
export const restaurantsApi = {
  getSlots: (cruiseId: string) =>    apiFetch(`/restaurants/slots/cruise/${cruiseId}`),
  create: (data: any) => apiFetch('/restaurants', { method: 'POST', body: JSON.stringify(data) }),
  createSlot: (data: any) => apiFetch('/restaurants/slots', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// SHOWS API
// =========================
export const showsApi = {
  getByCruise: (cruiseId: string) => apiFetch(`/shows/cruise/${cruiseId}`),
  create: (data: any) => apiFetch('/shows', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// CASINO API
// =========================
export const casinoApi = {
  getByCruise: (cruiseId: string) =>    apiFetch(`/casino-events/cruise/${cruiseId}`),
  create: (data: any) => apiFetch('/casino-events', { method: 'POST', body: JSON.stringify(data) }),
};

// =========================
// BOOKINGS API
// =========================
export const bookingsApi = {
  create: (data: any) =>
    apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addActivity: (bookingId: string, data: any) =>
    apiFetch(`/bookings/${bookingId}/activities`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyBookings: () => apiFetch('/bookings/my-bookings'),
};

// =========================
// ✅ ADMIN API (THIS WAS MISSING)
// =========================
export const adminApi = {
  getDashboard: () =>
    apiFetch('/secure-admin-9f3x/dashboard'),

  getAllBookings: (page = 1, limit = 10) =>
    apiFetch(`/secure-admin-9f3x/bookings?page=${page}&limit=${limit}`),
};

// =========================
// ✅ AI API (FIXED)
// =========================
export const aiApi = {
  chat: (message: string, cruiseId?: string) =>
    apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, cruiseId }),
    }),
};