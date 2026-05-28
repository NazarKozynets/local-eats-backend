import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierNotReadyForDeliveryError extends DomainError {
    readonly code = 'COURIER_NOT_READY_FOR_DELIVERY';
    readonly httpStatus = HttpStatus.CONFLICT;
    constructor() { super('Courier is not verified, active and online'); }
}
