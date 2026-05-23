import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidNotificationBodyError extends DomainError {
    readonly code = 'INVALID_NOTIFICATION_BODY';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor() {
        super('Notification body must not be empty');
    }
}
