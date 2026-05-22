import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierAccountNotFoundError extends DomainError {
    readonly code = 'COURIER_ACCOUNT_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Account not found');
    }
}
