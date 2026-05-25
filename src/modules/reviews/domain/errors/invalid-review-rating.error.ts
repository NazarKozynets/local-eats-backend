import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidReviewRatingError extends DomainError {
    readonly code = 'INVALID_REVIEW_RATING';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(value: number) {
        super(`Review rating must be an integer between 1 and 5, got ${value}`);
    }
}
