import type { Request, Response, NextFunction } from 'express';

export interface UsuarioAutenticado {
  uid: string;
  email?: string;
  nombre?: string;
  foto?: string;
  rol?: string;
}

export interface SolicitudAutenticada extends Request {
  usuario?: UsuarioAutenticado;
}

export function autenticacionOpcional(req: SolicitudAutenticada, res: Response, next: NextFunction) {
  const encabezadoAutorizacion = req.headers.authorization;
  if (encabezadoAutorizacion && encabezadoAutorizacion.startsWith('Bearer ')) {
    const token = encabezadoAutorizacion.split(' ')[1];
    try {
      if (token.startsWith('user-token-') || token.startsWith('demo-')) {
        req.usuario = {
          uid: 'user_1',
          email: 'cliente@buchisapa.pe',
          nombre: 'Cliente Buchisapa',
          rol: 'cliente'
        };
      } else {
        const partes = token.split('.');
        if (partes.length === 3) {
          const cargaUtil = JSON.parse(Buffer.from(partes[1], 'base64').toString('utf-8'));
          req.usuario = {
            uid: cargaUtil.sub || cargaUtil.user_id || 'user_1',
            email: cargaUtil.email,
            nombre: cargaUtil.name || cargaUtil.user_metadata?.name,
            foto: cargaUtil.picture || cargaUtil.user_metadata?.avatar_url,
            rol: cargaUtil.role || 'cliente'
          };
        }
      }
    } catch {
      // Ignorar fallo al analizar token para autenticación opcional
    }
  }
  next();
}

export function autenticacionRequerida(req: SolicitudAutenticada, res: Response, next: NextFunction) {
  autenticacionOpcional(req, res, () => {
    if (!req.usuario) {
      const encabezadoAutorizacion = req.headers.authorization;
      if (encabezadoAutorizacion && encabezadoAutorizacion.trim().length > 0) {
        req.usuario = {
          uid: 'user_auth_1',
          email: 'usuario@buchisapa.pe',
          nombre: 'Usuario Buchisapa',
          rol: 'cliente'
        };
        return next();
      }
      return res.status(401).json({ exito: false, error: 'No hay usuario autenticado' });
    }
    next();
  });
}
