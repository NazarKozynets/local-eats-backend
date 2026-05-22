import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidMenuItemNameError extends DomainError {
    readonly code = 'INVALID_MENU_ITEM_NAME';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}
