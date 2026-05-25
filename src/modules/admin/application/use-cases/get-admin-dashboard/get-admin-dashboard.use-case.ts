import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_DASHBOARD_READER,
    type AdminDashboardReadModel,
    type AdminDashboardReader,
} from '../../ports/admin-dashboard-reader.port';

@Injectable()
export class GetAdminDashboardUseCase {
    constructor(
        @Inject(ADMIN_DASHBOARD_READER)
        private readonly dashboardReader: AdminDashboardReader,
    ) {}

    execute(): Promise<AdminDashboardReadModel> {
        return this.dashboardReader.getDashboard();
    }
}
