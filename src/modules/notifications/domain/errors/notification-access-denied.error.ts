import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class NotificationAccessDeniedError extends DomainError {
    readonly code = 'NOTIFICATION_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You do not have access to this notification');
    }
}
