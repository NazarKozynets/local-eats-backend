import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class OrderItemNotAvailableError extends DomainError {
    readonly code = 'ORDER_ITEM_NOT_AVAILABLE';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor(menuItemId: string) {
        super(`Menu item ${menuItemId} is not available for ordering`, { menuItemId });
    }
}
