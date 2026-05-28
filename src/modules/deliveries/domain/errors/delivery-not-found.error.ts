import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class DeliveryNotFoundError extends DomainError {
    readonly code = 'DELIVERY_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;
    constructor() { super('Delivery not found'); }
}
