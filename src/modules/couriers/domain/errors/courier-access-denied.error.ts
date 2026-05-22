import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class CourierAccessDeniedError extends DomainError {
    readonly code = 'COURIER_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Access to this courier profile is denied');
    }
}
