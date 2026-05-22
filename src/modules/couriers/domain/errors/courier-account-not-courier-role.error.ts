import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierAccountNotCourierRoleError extends DomainError {
    readonly code = 'COURIER_ACCOUNT_NOT_COURIER_ROLE';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Account must have COURIER role to create a courier profile');
    }
}
