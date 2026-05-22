import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidCourierLocationError extends DomainError {
    readonly code = 'INVALID_COURIER_LOCATION';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(reason: string) {
        super(`Invalid courier location: ${reason}`);
    }
}
