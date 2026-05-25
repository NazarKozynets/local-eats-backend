import { GetAdminDashboardUseCase } from './get-admin-dashboard.use-case';
import {
    createMockAdminDashboardReader,
} from '../../../__tests__/_helpers/mocks';
import { buildAdminDashboard } from '../../../__tests__/_helpers/builders';

describe('GetAdminDashboardUseCase', () => {
    let dashboardReader: ReturnType<typeof createMockAdminDashboardReader>;
    let useCase: GetAdminDashboardUseCase;

    beforeEach(() => {
        dashboardReader = createMockAdminDashboardReader();
        useCase = new GetAdminDashboardUseCase(dashboardReader);
    });

    it('returns dashboard stats from reader', async () => {
        const dashboard = buildAdminDashboard();
        dashboardReader.getDashboard.mockResolvedValue(dashboard);

        const result = await useCase.execute();

        expect(result).toEqual(dashboard);
        expect(dashboardReader.getDashboard).toHaveBeenCalledTimes(1);
    });
});
