import {
  FetchGemDataParams,
  FetchGemTradeDataParams,
  FetchTradeDetailsDataParams,
  GemTradeData,
  TradeDetailsData,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ ocrText, language }),
    };

    const response = await fetch(`${API_BASE_URL}/gem`, config);
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

    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
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
    };

    const response = await fetch(`${API_BASE_URL}/gem/trade`, config);
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

    const config = {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({ url }),
    };

    const response = await fetch(`${API_BASE_URL}/trade/details`, config);
    return await response.json();
  } catch (error) {
    return null;
  }
};
