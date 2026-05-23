import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidNotificationTitleError extends DomainError {
    readonly code = 'INVALID_NOTIFICATION_TITLE';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor() {
        super('Notification title must not be empty');
    }
}
