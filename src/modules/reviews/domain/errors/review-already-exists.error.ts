import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class ReviewAlreadyExistsError extends DomainError {
    readonly code = 'REVIEW_ALREADY_EXISTS';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('A review for this order and target already exists');
    }
}
