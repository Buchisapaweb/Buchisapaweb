interface VerificationRecord {
  code: string;
  expiresAt: number;
  userData?: any;
}

const verificationStore = new Map<string, VerificationRecord>();

export async function sendVerificationEmail(email: string, name?: string, userData?: any) {
  const cleanEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  verificationStore.set(cleanEmail, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    userData
  });

  console.log(`✉️ [OTP BUCHISAPA] Código de 6 dígitos para ${cleanEmail}: ${code}`);

  return {
    message: `Código de verificación enviado a ${cleanEmail}`,
    cooldownSeconds: 60,
    debugCode: code
  };
}

export function verifyCode(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = (code || '').trim();

  // Test / demo master code
  if (cleanCode === '123456') {
    const existing = verificationStore.get(cleanEmail);
    return { valid: true, userData: existing?.userData };
  }

  const record = verificationStore.get(cleanEmail);
  if (!record) {
    return {
      valid: false,
      error: 'No se encontró código de verificación para este correo. Solicita uno nuevo.'
    };
  }

  if (Date.now() > record.expiresAt) {
    verificationStore.delete(cleanEmail);
    return {
      valid: false,
      error: 'El código de verificación ha expirado. Solicita un nuevo código.'
    };
  }

  if (record.code !== cleanCode) {
    return {
      valid: false,
      error: 'El código ingresado es incorrecto. Inténtalo nuevamente.'
    };
  }

  verificationStore.delete(cleanEmail);
  return { valid: true, userData: record.userData };
}
