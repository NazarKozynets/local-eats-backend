import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidMenuItemCookTimeError extends DomainError {
    readonly code = 'INVALID_MENU_ITEM_COOK_TIME';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor() {
        super('Menu item estimated cook time must be a positive number');
    }
}
