import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class DeliveryProblemNotFoundError extends DomainError {
    readonly code = 'DELIVERY_PROBLEM_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Delivery problem not found');
    }
}
