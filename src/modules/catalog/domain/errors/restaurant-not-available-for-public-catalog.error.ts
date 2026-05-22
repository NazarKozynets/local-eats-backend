import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantNotAvailableForPublicCatalogError extends DomainError {
    readonly code = 'RESTAURANT_NOT_AVAILABLE_FOR_PUBLIC_CATALOG';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Restaurant is not available');
    }
}
