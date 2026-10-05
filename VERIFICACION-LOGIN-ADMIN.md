# Verificación de acceso al Panel Admin

## Administrador autorizado
- Correo: `buchisapaweb@gmail.com`
- Autenticación de contraseña: Supabase Auth

La contraseña no se almacena en el proyecto. El login envía correo y contraseña a Supabase Auth y solo después de una autenticación correcta se permite continuar.

Además, el acceso administrativo se limita al correo `buchisapaweb@gmail.com`. El rol o metadata de otro usuario no es suficiente para abrir `/admin`.

Flujo:
1. Usuario ingresa correo y contraseña.
2. Supabase Auth valida las credenciales.
3. Se verifica que el correo autenticado sea `buchisapaweb@gmail.com`.
4. El servidor crea la sesión administrativa HttpOnly.
5. `/admin` requiere una sesión administrativa válida.
6. Cerrar sesión revoca la cookie administrativa.
