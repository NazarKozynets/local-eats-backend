import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class MenuCategoryHasItemsError extends DomainError {
    readonly code = 'MENU_CATEGORY_HAS_ITEMS';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('Cannot delete a menu category that has items');
    }
}
