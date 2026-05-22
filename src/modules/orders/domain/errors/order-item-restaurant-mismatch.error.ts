import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderItemRestaurantMismatchError extends DomainError {
    readonly code = 'ORDER_ITEM_RESTAURANT_MISMATCH';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(menuItemId: string) {
        super(`Menu item ${menuItemId} does not belong to the requested restaurant`, { menuItemId });
    }
}
