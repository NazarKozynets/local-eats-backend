import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class DeliveryProblemReportNotFoundError extends DomainError {
    readonly code = 'DELIVERY_PROBLEM_REPORT_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;
    constructor() { super('Delivery problem report not found'); }
}
