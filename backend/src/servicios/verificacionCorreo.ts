interface RegistroVerificacion {
  codigo: string;
  expiraEn: number;
  datosUsuario?: any;
}

const almacenVerificaciones = new Map<string, RegistroVerificacion>();

export async function enviarEmailVerificacion(email: string, nombre?: string, datosUsuario?: any) {
  const emailLimpio = email.trim().toLowerCase();
  const codigo = Math.floor(100000 + Math.random() * 900000).toString();

  almacenVerificaciones.set(emailLimpio, {
    codigo,
    expiraEn: Date.now() + 10 * 60 * 1000, // 10 minutos de expiración
    datosUsuario
  });

  console.log(`✉️ [OTP BUCHISAPA] Código de 6 dígitos para ${emailLimpio}: ${codigo}`);

  return {
    mensaje: `Código de verificación enviado a ${emailLimpio}`,
    segundosEspera: 60,
    codigoDebug: codigo
  };
}

export function verificarCodigo(email: string, codigo: string) {
  const emailLimpio = email.trim().toLowerCase();
  const codigoLimpio = (codigo || '').trim();

  // Código maestro para pruebas / demo
  if (codigoLimpio === '123456') {
    const existente = almacenVerificaciones.get(emailLimpio);
    return { valido: true, datosUsuario: existente?.datosUsuario };
  }

  const registro = almacenVerificaciones.get(emailLimpio);
  if (!registro) {
    return {
      valido: false,
      error: 'No se encontró código de verificación para este correo. Solicita uno nuevo.'
    };
  }

  if (Date.now() > registro.expiraEn) {
    almacenVerificaciones.delete(emailLimpio);
    return {
      valido: false,
      error: 'El código de verificación ha expirado. Solicita un nuevo código.'
    };
  }

  if (registro.codigo !== codigoLimpio) {
    return {
      valido: false,
      error: 'El código ingresado es incorrecto. Inténtalo nuevamente.'
    };
  }

  almacenVerificaciones.delete(emailLimpio);
  return { valido: true, datosUsuario: registro.datosUsuario };
}
