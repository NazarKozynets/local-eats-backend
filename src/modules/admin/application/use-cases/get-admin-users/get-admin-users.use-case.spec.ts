import { GetAdminUsersUseCase } from './get-admin-users.use-case';
import { createMockAdminUserReader } from '../../../__tests__/_helpers/mocks';
import { buildAdminUser } from '../../../__tests__/_helpers/builders';

describe('GetAdminUsersUseCase', () => {
    let userReader: ReturnType<typeof createMockAdminUserReader>;
    let useCase: GetAdminUsersUseCase;

    beforeEach(() => {
        userReader = createMockAdminUserReader();
        useCase = new GetAdminUsersUseCase(userReader);
    });

    it('returns users from reader with filters', async () => {
        const users = [buildAdminUser()];
        userReader.findMany.mockResolvedValue(users);
        const command = { page: 1, limit: 20, role: 'CUSTOMER' };

        const result = await useCase.execute(command);

        expect(result).toEqual(users);
        expect(userReader.findMany).toHaveBeenCalledWith(command);
    });

    it('returns empty list when no users match', async () => {
        userReader.findMany.mockResolvedValue([]);

        const result = await useCase.execute({});

        expect(result).toEqual([]);
    });
});
