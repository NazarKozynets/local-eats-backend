import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class InvalidMenuCategoryNameError extends DomainError {
    readonly code = 'INVALID_MENU_CATEGORY_NAME';
    readonly httpStatus = HttpStatus.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}
