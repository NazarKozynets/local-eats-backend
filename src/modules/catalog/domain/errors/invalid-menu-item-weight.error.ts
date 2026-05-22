import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidMenuItemWeightError extends DomainError {
    readonly code = 'INVALID_MENU_ITEM_WEIGHT';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor() {
        super('Menu item weight must be a positive number');
    }
}
