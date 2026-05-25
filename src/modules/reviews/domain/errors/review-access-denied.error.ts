import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class ReviewAccessDeniedError extends DomainError {
    readonly code = 'REVIEW_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('Access to this review is denied');
    }
}
