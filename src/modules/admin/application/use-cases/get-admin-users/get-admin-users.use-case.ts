import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_USER_READER,
    type AdminUserReadModel,
    type AdminUserReader,
} from '../../ports/admin-user-reader.port';
import type { GetAdminUsersCommand } from './get-admin-users.command';

@Injectable()
export class GetAdminUsersUseCase {
    constructor(
        @Inject(ADMIN_USER_READER)
        private readonly userReader: AdminUserReader,
    ) {}

    execute(command: GetAdminUsersCommand): Promise<AdminUserReadModel[]> {
        return this.userReader.findMany(command);
    }
}
