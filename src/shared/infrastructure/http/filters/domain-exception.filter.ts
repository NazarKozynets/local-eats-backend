import {ArgumentsHost, Catch, ExceptionFilter} from "@nestjs/common";
import type {Request, Response} from "express";
import {DomainError} from "../../../domain/errors/domain.error";
import {DomainExceptionMapper} from "../mappers/domain-exception.mapper";
import type {ApiErrorResponse} from "../responses/api-error.response";

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter<DomainError> {
    constructor(private readonly mapper: DomainExceptionMapper) {}

    catch(exception: DomainError, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const request = context.getRequest<Request>();
        const response = context.getResponse<Response>();
        const mappedException = this.mapper.map(exception);

        response
            .status(mappedException.statusCode)
            .json({
                success: false,
                error: {
                    code: mappedException.code,
                    message: mappedException.message,
                    details: mappedException.details,
                },
                meta: {
                    statusCode: mappedException.statusCode,
                    timestamp: new Date().toISOString(),
                    path: request.originalUrl,
                    method: request.method,
                    requestId: this.getRequestId(request),
                },
            } satisfies ApiErrorResponse);
    }

    private getRequestId(request: Request): string | undefined {
        const requestId = request.headers["x-request-id"];

        return Array.isArray(requestId) ? requestId[0] : requestId;
    }
}
