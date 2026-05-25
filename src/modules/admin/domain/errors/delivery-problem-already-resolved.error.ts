import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class DeliveryProblemAlreadyResolvedError extends DomainError {
    readonly code = 'DELIVERY_PROBLEM_ALREADY_RESOLVED';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('Delivery problem is already resolved');
    }
}
