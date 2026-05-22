import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class RestaurantCatalogAccessDeniedError extends DomainError {
    readonly code = 'RESTAURANT_CATALOG_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You do not have access to manage this restaurant catalog');
    }
}
