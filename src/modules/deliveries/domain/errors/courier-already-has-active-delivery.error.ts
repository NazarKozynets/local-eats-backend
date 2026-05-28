import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierAlreadyHasActiveDeliveryError extends DomainError {
    readonly code = 'COURIER_ALREADY_HAS_ACTIVE_DELIVERY';
    readonly httpStatus = HttpStatus.CONFLICT;
    constructor() { super('Courier already has an active delivery'); }
}
