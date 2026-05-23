import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidNotificationTypeError extends DomainError {
    readonly code = 'INVALID_NOTIFICATION_TYPE';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(type: string) {
        super(`Invalid notification type: ${type}`);
    }
}
