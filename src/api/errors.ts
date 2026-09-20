/**
 * Erreur HTTP normalisée. Conservée comme sous-classe de Error
 * pour que les `catch (e: any) { e.message }` existants restent valides.
 */
export class ApiError extends Error {
    readonly status: number;
    readonly code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}
