import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierNotAssignedToOrderError extends DomainError {
    readonly code = 'COURIER_NOT_ASSIGNED_TO_ORDER';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('No courier was assigned to this order');
    }
}
