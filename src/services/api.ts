import {
  FetchGemDataParams,
  FetchGemTradeDataParams,
  FetchTradeDetailsDataParams,
  GemTradeData,
  TradeDetailsData,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Common fetch headers helper
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Core Public APIs
export const fetchOnlineData = async (): Promise<{ online: number } | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/online`);
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchGemData = async (
  params: FetchGemDataParams,
): Promise<GemTradeData | null> => {
  try {
    const { ocrText, language } = params;
    const response = await fetch(`${API_BASE_URL}/gem`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ ocrText, language }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchGemTradeData = async (
  params: FetchGemTradeDataParams,
): Promise<GemTradeData | null> => {
  try {
    const {
      name,
      language,
      levelMin = 1,
      levelMax = 21,
      quality = 0,
      corrupted = false,
    } = params;

    const response = await fetch(`${API_BASE_URL}/gem/trade`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        name,
        language,
        levelMin,
        levelMax,
        quality,
        corrupted,
      }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchTradeDetailsData = async (
  params: FetchTradeDetailsDataParams,
): Promise<TradeDetailsData | null> => {
  try {
    const { url } = params;
    const response = await fetch(`${API_BASE_URL}/trade/details`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ url }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchHeistData = async (
  params: FetchGemDataParams,
): Promise<GemTradeData | null> => {
  try {
    const { ocrText, language } = params;
    const response = await fetch(`${API_BASE_URL}/heist`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ ocrText, language }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchHeistTradeData = async (
  params: FetchGemTradeDataParams,
): Promise<GemTradeData | null> => {
  try {
    const {
      name,
      language,
      levelMin = 1,
      levelMax = 21,
      quality = 0,
      corrupted = false,
    } = params;

    const response = await fetch(`${API_BASE_URL}/heist/trade`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        name,
        language,
        levelMin,
        levelMax,
        quality,
        corrupted,
      }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchMemoryData = async (
  params: FetchGemDataParams,
): Promise<GemTradeData | null> => {
  try {
    const { ocrText, language } = params;
    const response = await fetch(`${API_BASE_URL}/memory`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ ocrText, language }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const fetchMemoryTradeData = async (
  params: FetchGemTradeDataParams,
): Promise<GemTradeData | null> => {
  try {
    const {
      name,
      language,
      levelMin = 1,
      levelMax = 21,
      quality = 0,
      corrupted = false,
    } = params;

    const response = await fetch(`${API_BASE_URL}/memory/trade`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        name,
        language,
        levelMin,
        levelMax,
        quality,
        corrupted,
      }),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

// --- Authentication & User APIs ---
export const authApi = {
  login: async (loginVal: string, passwordVal: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginVal, password: passwordVal }),
    });
    return response;
  },

  register: async (loginVal: string, passwordVal: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginVal, password: passwordVal }),
    });
    return response;
  },
};

// --- Settings & Roles APIs (Admin/Auth Only) ---
export const settingsApi = {
  fetchSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: getHeaders(),
    });
    return response;
  },

  updateSettings: async (blockRegistrations: boolean) => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ blockRegistrations }),
    });
    return response;
  },
};

export const rolesApi = {
  fetchRoles: async () => {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      headers: getHeaders(),
    });
    return response;
  },
};

// --- User Management APIs (Admin Only) ---
export const usersApi = {
  fetchUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    });
    return response;
  },

  updateUser: async (id: number, payload: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return response;
  },

  deleteUser: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response;
  },
};

// --- Items CRUD APIs (Admin/Auth Only) ---
export const itemsApi = {
  fetchItems: async (type: string) => {
    const response = await fetch(`${API_BASE_URL}/items/${type}`, {
      headers: getHeaders(),
    });
    return response;
  },

  createItem: async (type: string, payload: any) => {
    const response = await fetch(`${API_BASE_URL}/items/${type}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return response;
  },

  updateItem: async (type: string, id: number, payload: any) => {
    const response = await fetch(`${API_BASE_URL}/items/${type}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return response;
  },

  deleteItem: async (type: string, id: number) => {
    const response = await fetch(`${API_BASE_URL}/items/${type}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response;
  },
};
