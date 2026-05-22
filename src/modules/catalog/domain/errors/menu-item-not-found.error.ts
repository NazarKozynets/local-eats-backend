import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class MenuItemNotFoundError extends DomainError {
    readonly code = 'MENU_ITEM_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Menu item not found');
    }
}
