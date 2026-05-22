import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierAccountNotActiveError extends DomainError {
    readonly code = 'COURIER_ACCOUNT_NOT_ACTIVE';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Account must be active to create a courier profile');
    }
}
