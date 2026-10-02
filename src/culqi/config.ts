import fs from 'fs';
import path from 'path';
import type { CulqiSettings } from './types';

const PAYMENT_SETTINGS_FILE = path.join(process.cwd(), 'data', 'payment_settings.json');

const DEFAULT_TEST_PUBLIC_KEY = 'pk_test_04c5e31a0e10b14b';
const DEFAULT_TEST_SECRET_KEY = 'sk_test_6506300b9576bbad';

export function getPaymentSettings(): CulqiSettings {
  try {
    if (fs.existsSync(PAYMENT_SETTINGS_FILE)) {
      const raw = fs.readFileSync(PAYMENT_SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        culqiPublicKey: parsed.culqiPublicKey || process.env.CULQI_PUBLIC_KEY || DEFAULT_TEST_PUBLIC_KEY,
        culqiSecretKey: parsed.culqiSecretKey || process.env.CULQI_SECRET_KEY || DEFAULT_TEST_SECRET_KEY,
        liveMode: Boolean(parsed.liveMode),
        updatedAt: parsed.updatedAt || new Date().toISOString()
      };
    }
  } catch (e) {
    console.warn('⚠️ Error al leer payment_settings.json, usando valores por defecto:', e);
  }

  const envPublic = process.env.CULQI_PUBLIC_KEY || DEFAULT_TEST_PUBLIC_KEY;
  const envSecret = process.env.CULQI_SECRET_KEY || DEFAULT_TEST_SECRET_KEY;

  return {
    culqiPublicKey: envPublic,
    culqiSecretKey: envSecret,
    liveMode: envPublic.startsWith('pk_live_'),
    updatedAt: new Date().toISOString()
  };
}

export function savePaymentSettings(settings: Partial<CulqiSettings>): CulqiSettings {
  const current = getPaymentSettings();

  const newSettings: CulqiSettings = {
    culqiPublicKey: (settings.culqiPublicKey !== undefined && settings.culqiPublicKey !== null) 
      ? String(settings.culqiPublicKey).trim() 
      : current.culqiPublicKey,
    culqiSecretKey: (settings.culqiSecretKey && settings.culqiSecretKey.trim() && !settings.culqiSecretKey.startsWith('sk_...')) 
      ? String(settings.culqiSecretKey).trim() 
      : current.culqiSecretKey,
    liveMode: settings.liveMode !== undefined 
      ? Boolean(settings.liveMode) 
      : (settings.culqiPublicKey ? String(settings.culqiPublicKey).startsWith('pk_live_') : current.liveMode),
    updatedAt: new Date().toISOString()
  };

  try {
    const dir = path.dirname(PAYMENT_SETTINGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PAYMENT_SETTINGS_FILE, JSON.stringify(newSettings, null, 2), 'utf-8');
    console.log('✅ [CULQI CONFIG] Configuración persistida con éxito en data/payment_settings.json');
  } catch (e) {
    console.error('❌ Error al guardar payment_settings.json:', e);
  }

  return newSettings;
}

export function getActivePublicKey(): string {
  const settings = getPaymentSettings();
  return settings.culqiPublicKey || DEFAULT_TEST_PUBLIC_KEY;
}

export function getActiveSecretKey(): string {
  const settings = getPaymentSettings();
  return settings.culqiSecretKey || DEFAULT_TEST_SECRET_KEY;
}
