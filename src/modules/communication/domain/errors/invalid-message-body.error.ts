import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidMessageBodyError extends DomainError {
    readonly code = 'INVALID_MESSAGE_BODY';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(message = 'Message body is invalid') {
        super(message);
    }
}
