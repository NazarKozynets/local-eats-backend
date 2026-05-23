import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class NotificationNotFoundError extends DomainError {
    readonly code = 'NOTIFICATION_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Notification not found');
    }
}
