import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class DeliveryAccessDeniedError extends DomainError {
    readonly code = 'DELIVERY_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;
    constructor() { super('Access to this delivery is denied'); }
}
