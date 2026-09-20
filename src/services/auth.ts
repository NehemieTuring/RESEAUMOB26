/**
 * @deprecated Utiliser `authApi` depuis `src/api` ou `src/services`.
 * Ancienne couche qui frappait /auth/login (sans /v1).
 */
export { authApi as default, authApi as authService } from '../api/authService';
