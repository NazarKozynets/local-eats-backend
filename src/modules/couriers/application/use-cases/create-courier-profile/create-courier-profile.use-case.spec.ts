import { CreateCourierProfileUseCase } from './create-courier-profile.use-case';
import { CourierProfileAlreadyExistsError } from '../../../domain/errors/courier-profile-already-exists.error';
import { CourierAccountNotFoundError } from '../../../domain/errors/courier-account-not-found.error';
import { CourierAccountNotActiveError } from '../../../domain/errors/courier-account-not-active.error';
import { CourierAccountNotCourierRoleError } from '../../../domain/errors/courier-account-not-courier-role.error';
import { CourierProfileCreatedEvent } from '../../../domain/events/courier-profile-created.event';
import {
    buildAccountSnapshot,
    TEST_USER_ID,
} from '../../../__tests__/_helpers/builders';
import {
    createMockCourierProfileRepository,
    createMockAccountAccessReader,
    createMockEventPublisher,
} from '../../../__tests__/_helpers/mocks';
import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';

describe('CreateCourierProfileUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let accountReader: ReturnType<typeof createMockAccountAccessReader>;
    let eventPublisher: ReturnType<typeof createMockEventPublisher>;
    let useCase: CreateCourierProfileUseCase;

    const command = () => ({ currentUserId: TEST_USER_ID });

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        accountReader = createMockAccountAccessReader();
        eventPublisher = createMockEventPublisher();
        useCase = new CreateCourierProfileUseCase(repository, accountReader, eventPublisher);

        repository.save.mockResolvedValue(undefined);
        repository.existsByUserId.mockResolvedValue(false);
        eventPublisher.publishAll.mockResolvedValue(undefined);
        accountReader.findById.mockResolvedValue(buildAccountSnapshot());
    });

    it('creates profile for active COURIER account', async () => {
        await expect(useCase.execute(command())).resolves.not.toThrow();
        expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('throws CourierAccountNotFoundError when account does not exist', async () => {
        accountReader.findById.mockResolvedValue(null);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierAccountNotFoundError);
    });

    it('throws CourierAccountNotActiveError when account is not ACTIVE', async () => {
        accountReader.findById.mockResolvedValue(buildAccountSnapshot({ status: 'BLOCKED' }));
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierAccountNotActiveError);
    });

    it('throws CourierAccountNotCourierRoleError when account role is not COURIER', async () => {
        accountReader.findById.mockResolvedValue(buildAccountSnapshot({ role: 'CUSTOMER' }));
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierAccountNotCourierRoleError);
    });

    it('throws CourierProfileAlreadyExistsError when profile already exists', async () => {
        repository.existsByUserId.mockResolvedValue(true);
        await expect(useCase.execute(command())).rejects.toBeInstanceOf(CourierProfileAlreadyExistsError);
    });

    it('publishes CourierProfileCreatedEvent on success', async () => {
        await useCase.execute(command());
        expect(eventPublisher.publishAll).toHaveBeenCalledWith(
            expect.arrayContaining([expect.any(CourierProfileCreatedEvent)]),
        );
    });

    it('saves profile with UNVERIFIED / INCOMPLETE / OFFLINE defaults', async () => {
        await useCase.execute(command());
        const saved = repository.save.mock.calls[0][0];
        expect(saved.verificationStatus).toBe('UNVERIFIED');
        expect(saved.profileStatus).toBe('INCOMPLETE');
        expect(saved.availabilityStatus).toBe('OFFLINE');
    });

    it('passes userId from the account reader lookup, not from raw string', async () => {
        await useCase.execute(command());
        expect(accountReader.findById).toHaveBeenCalledWith(
            expect.objectContaining({ value: TEST_USER_ID }),
        );
    });

    it('verifies UUID.create is called with currentUserId', async () => {
        await useCase.execute({ currentUserId: TEST_USER_ID });
        const usedId = accountReader.findById.mock.calls[0][0] as UUID;
        expect(usedId.value).toBe(TEST_USER_ID);
    });
});
