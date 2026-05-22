import { GetAvailableCouriersUseCase } from './get-available-couriers.use-case';
import { CourierVerificationStatus } from '../../../domain/enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../../../domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../../domain/enums/courier-availability-status.enum';
import { CourierVehicleType } from '../../../domain/enums/courier-vehicle-type.enum';
import { buildCourierProfile } from '../../../__tests__/_helpers/builders';
import { createMockCourierProfileRepository } from '../../../__tests__/_helpers/mocks';

describe('GetAvailableCouriersUseCase', () => {
    let repository: ReturnType<typeof createMockCourierProfileRepository>;
    let useCase: GetAvailableCouriersUseCase;

    beforeEach(() => {
        repository = createMockCourierProfileRepository();
        useCase = new GetAvailableCouriersUseCase(repository);
    });

    it('returns mapped result list from repository', async () => {
        const profile = buildCourierProfile({
            verificationStatus: CourierVerificationStatus.VERIFIED,
            profileStatus: CourierProfileStatus.ACTIVE,
            availabilityStatus: CourierAvailabilityStatus.ONLINE,
            vehicleType: CourierVehicleType.BICYCLE,
            deliveryRadiusKm: 10,
            ratingAvg: 4.5,
            ratingCount: 20,
        });
        repository.findAvailable.mockResolvedValue([profile]);

        const result = await useCase.execute();

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: profile.id.value,
            userId: profile.userId.value,
            vehicleType: CourierVehicleType.BICYCLE,
            deliveryRadiusKm: 10,
            ratingAvg: 4.5,
            ratingCount: 20,
        });
    });

    it('returns empty array when no couriers are available', async () => {
        repository.findAvailable.mockResolvedValue([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
    });

    it('returns multiple couriers when repository returns multiple', async () => {
        const profiles = [
            buildCourierProfile({ verificationStatus: CourierVerificationStatus.VERIFIED }),
            buildCourierProfile({ verificationStatus: CourierVerificationStatus.VERIFIED }),
        ];
        repository.findAvailable.mockResolvedValue(profiles);

        const result = await useCase.execute();

        expect(result).toHaveLength(2);
    });
});
