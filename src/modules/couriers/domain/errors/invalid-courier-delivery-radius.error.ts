import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidCourierDeliveryRadiusError extends DomainError {
    readonly code = 'INVALID_COURIER_DELIVERY_RADIUS';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(reason: string) {
        super(`Invalid courier delivery radius: ${reason}`);
    }
}
