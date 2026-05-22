import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class MenuCategoryAccessDeniedError extends DomainError {
    readonly code = 'MENU_CATEGORY_ACCESS_DENIED';
    readonly httpStatus = HttpStatus.FORBIDDEN;

    constructor() {
        super('You do not have access to this menu category');
    }
}
