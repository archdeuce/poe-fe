export interface FetchGemDataParams {
  ocrText: string;
  language: string;
}

export interface FetchGemTradeDataParams {
  name: string;
  language: string;
  levelMin?: number;
  levelMax?: number;
  quality?: number;
  corrupted?: boolean;
}

export interface FetchTradeDetailsDataParams {
  url: string;
}

export interface GemTradeData {
  success: boolean;
  name?: string;
  message?: string;
  url?: string;
  detailsUrl?: string;
}

export interface TradeDetailsData {
  success: boolean;
  result: GemDetailsData[];
}
