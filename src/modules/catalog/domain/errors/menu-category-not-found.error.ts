import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class MenuCategoryNotFoundError extends DomainError {
    readonly code = 'MENU_CATEGORY_NOT_FOUND';
    readonly httpStatus = HttpStatus.NOT_FOUND;

    constructor() {
        super('Menu category not found');
    }
}
