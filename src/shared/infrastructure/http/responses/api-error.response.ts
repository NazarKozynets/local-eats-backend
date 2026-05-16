export interface ApiErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    meta: {
        statusCode: number;
        timestamp: string;
        path: string;
        method: string;
        requestId?: string;
    };
}
