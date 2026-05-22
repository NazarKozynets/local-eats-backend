import { HttpStatus } from '@nestjs/common';
import { DomainError } from '../../../../shared/domain/errors/domain.error';

export class MenuCategoryAlreadyExistsError extends DomainError {
    readonly code = 'MENU_CATEGORY_ALREADY_EXISTS';
    readonly httpStatus = HttpStatus.CONFLICT;

    constructor() {
        super('A menu category with this name already exists in the restaurant');
    }
}
