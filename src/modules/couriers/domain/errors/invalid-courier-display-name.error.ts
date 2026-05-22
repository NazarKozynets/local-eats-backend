import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidCourierDisplayNameError extends DomainError {
    readonly code = 'INVALID_COURIER_DISPLAY_NAME';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(reason: string) {
        super(`Invalid courier display name: ${reason}`);
    }
}
