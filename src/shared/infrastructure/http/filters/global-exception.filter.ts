import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from "@nestjs/common";
import type {Request, Response} from "express";
import type {ApiErrorResponse} from "../responses/api-error.response";

type HttpExceptionBody = {
    code?: string;
    error?: string;
    message?: string | string[];
    details?: unknown;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();
        const statusCode = this.getStatusCode(exception);
        const error = this.getErrorPayload(exception, statusCode);

        if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `${request.method} ${request.originalUrl} failed with ${statusCode}`,
                exception instanceof Error ? exception.stack : String(exception),
            );
        }

        response
            .status(statusCode)
            .json({
                success: false,
                error,
                meta: {
                    statusCode,
                    timestamp: new Date().toISOString(),
                    path: request.originalUrl,
                    method: request.method,
                    requestId: this.getRequestId(request),
                },
            } satisfies ApiErrorResponse);
    }

    private getStatusCode(exception: unknown): number {
        if (exception instanceof HttpException) {
            return exception.getStatus();
        }

        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private getErrorPayload(
        exception: unknown,
        statusCode: number,
    ): ApiErrorResponse["error"] {
        if (exception instanceof HttpException) {
            const response = exception.getResponse();
            const body = this.normalizeHttpExceptionBody(response);

            return {
                code: body.code ?? this.toErrorCode(body.error ?? exception.name),
                message: this.toMessage(body.message ?? body.error ?? exception.message),
                details: body.details ?? this.toDetails(body.message),
            };
        }

        return {
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
            details: undefined,
        };
    }

    private normalizeHttpExceptionBody(response: string | object): HttpExceptionBody {
        if (typeof response === "string") {
            return {message: response};
        }

        return response as HttpExceptionBody;
    }

    private toMessage(message: string | string[]): string {
        return Array.isArray(message) ? "Validation failed" : message;
    }

    private toDetails(message: string | string[] | undefined): unknown {
        return Array.isArray(message) ? {errors: message} : undefined;
    }

    private toErrorCode(value: string): string {
        return value
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .replace(/[^a-zA-Z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .toUpperCase();
    }

    private getRequestId(request: Request): string | undefined {
        const requestId = request.headers["x-request-id"];

        return Array.isArray(requestId) ? requestId[0] : requestId;
    }
}
