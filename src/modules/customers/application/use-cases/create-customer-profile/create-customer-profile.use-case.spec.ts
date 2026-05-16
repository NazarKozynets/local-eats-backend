import { CreateCustomerProfileUseCase } from './create-customer-profile.use-case';
import { CreateCustomerProfileCommand } from './create-customer-profile.command';
import { CustomerProfileAlreadyExistsError } from '../../../domain/errors/customer-profile-already-exists.error';
import { CustomerAccountNotFoundError } from '../../../domain/errors/customer-account-not-found.error';
import { CustomerAccountNotActiveError } from '../../../domain/errors/customer-account-not-active.error';
import { CustomerAccountNotCustomerRoleError } from '../../../domain/errors/customer-account-not-customer-role.error';
import { CustomerProfileCreatedEvent } from '../../../domain/events/customer-profile-created.event';
import {
    buildAccountSnapshot,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCustomerProfileRepository,
    createMockEventPublisher,
    createMockAccountAccessReader,
} from '../../../__tests__/_helpers/mocks';

describe('CreateCustomerProfileUseCase', () => {
    let profileRepository: ReturnType<typeof createMockCustomerProfileRepository>;
    let accountAccessReader: ReturnType<typeof createMockAccountAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateCustomerProfileUseCase;

    beforeEach(() => {
        profileRepository = createMockCustomerProfileRepository();
        accountAccessReader = createMockAccountAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateCustomerProfileUseCase(
            profileRepository,
            accountAccessReader,
            eventPublisher,
        );
        eventPublisher.publishAll.mockResolvedValue(undefined);
        profileRepository.save.mockResolvedValue(undefined);
    });

    const command = () => CreateCustomerProfileCommand.create({ userId: TEST_USER_ID });

    it('throws CustomerAccountNotFoundError when account does not exist', async () => {
        accountAccessReader.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerAccountNotFoundError);
    });

    it('throws CustomerAccountNotActiveError when account is not active', async () => {
        accountAccessReader.findById.mockResolvedValue(
            buildAccountSnapshot({ status: 'BLOCKED' }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerAccountNotActiveError);
    });

    it('throws CustomerAccountNotCustomerRoleError when account role is not CUSTOMER', async () => {
        accountAccessReader.findById.mockResolvedValue(
            buildAccountSnapshot({ role: 'ADMIN' }),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerAccountNotCustomerRoleError);
    });

    it('throws CustomerProfileAlreadyExistsError when profile already exists', async () => {
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot());
        profileRepository.existsByUserId.mockResolvedValue(true);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CustomerProfileAlreadyExistsError);
    });

    it('saves the profile and publishes CustomerProfileCreatedEvent on success', async () => {
        accountAccessReader.findById.mockResolvedValue(buildAccountSnapshot());
        profileRepository.existsByUserId.mockResolvedValue(false);

        await useCase.execute(command());

        expect(profileRepository.save).toHaveBeenCalledTimes(1);
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CustomerProfileCreatedEvent)]),
        );
    });
});
