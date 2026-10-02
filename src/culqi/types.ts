/**
 * Definiciones de Tipos para la Integración Oficial de Culqi
 * BuchiSapa Restaurante - Módulo de Pagos Culqi
 */

export interface CulqiSettings {
  culqiPublicKey: string;
  culqiSecretKey: string;
  liveMode: boolean;
  updatedAt: string;
}

export interface CulqiTokenRequest {
  card_number: string;
  cvv: string;
  expiration_month: string;
  expiration_year: string;
  email: string;
}

export interface CulqiAntifraudDetails {
  address?: string;
  address_city?: string;
  country_code?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface CulqiChargeRequest {
  token: string;
  email: string;
  amount: number;
  orderPayload: any;
}

export interface CulqiChargeResponse {
  id: string;
  outcome?: {
    type: string;
    merchant_message?: string;
    user_message?: string;
  };
  amount: number;
  currency_code: string;
  source?: {
    card_number?: string;
    brand?: string;
  };
}

export interface CulqiErrorResponse {
  object: 'error';
  type: string;
  charge_id?: string;
  code?: string;
  decline_code?: string;
  merchant_message?: string;
  user_message?: string;
  param?: string;
}
