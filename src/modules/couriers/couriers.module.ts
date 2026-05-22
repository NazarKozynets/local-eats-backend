import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { COURIER_PROFILE_REPOSITORY } from './application/ports/courier-profile.repository.port';
import { COURIER_ACCESS_READER } from './application/ports/courier-access-reader.port';
import { DOMAIN_EVENT_PUBLISHER } from '../../shared/domain/events/domain-event-publisher.port';
import { PrismaCourierProfileRepository } from './infrastructure/persistence/prisma-courier-profile.repository';
import { PrismaCourierAccessReader } from './infrastructure/readers/prisma-courier-access-reader';
import { NoopDomainEventPublisher } from '../../shared/infrastructure/events/noop-domain-event-publisher';
import { CreateCourierProfileUseCase } from './application/use-cases/create-courier-profile/create-courier-profile.use-case';
import { GetMyCourierProfileUseCase } from './application/use-cases/get-my-courier-profile/get-my-courier-profile.use-case';
import { UpdateCourierProfileUseCase } from './application/use-cases/update-courier-profile/update-courier-profile.use-case';
import { SubmitCourierForVerificationUseCase } from './application/use-cases/submit-courier-for-verification/submit-courier-for-verification.use-case';
import { ApproveCourierUseCase } from './application/use-cases/approve-courier/approve-courier.use-case';
import { RejectCourierUseCase } from './application/use-cases/reject-courier/reject-courier.use-case';
import { PauseCourierUseCase } from './application/use-cases/pause-courier/pause-courier.use-case';
import { ActivateCourierUseCase } from './application/use-cases/activate-courier/activate-courier.use-case';
import { BlockCourierUseCase } from './application/use-cases/block-courier/block-courier.use-case';
import { SetCourierAvailabilityUseCase } from './application/use-cases/set-courier-availability/set-courier-availability.use-case';
import { UpdateCourierLocationUseCase } from './application/use-cases/update-courier-location/update-courier-location.use-case';
import { GetAvailableCouriersUseCase } from './application/use-cases/get-available-couriers/get-available-couriers.use-case';
import { CouriersController } from './presentation/http/couriers.controller';
import { AdminCouriersController } from './presentation/http/admin-couriers.controller';

@Module({
    imports: [IamModule],
    controllers: [CouriersController, AdminCouriersController],
    providers: [
        {
            provide: COURIER_PROFILE_REPOSITORY,
            useClass: PrismaCourierProfileRepository,
        },
        {
            provide: COURIER_ACCESS_READER,
            useClass: PrismaCourierAccessReader,
        },
        {
            provide: DOMAIN_EVENT_PUBLISHER,
            useClass: NoopDomainEventPublisher,
        },
        CreateCourierProfileUseCase,
        GetMyCourierProfileUseCase,
        UpdateCourierProfileUseCase,
        SubmitCourierForVerificationUseCase,
        ApproveCourierUseCase,
        RejectCourierUseCase,
        PauseCourierUseCase,
        ActivateCourierUseCase,
        BlockCourierUseCase,
        SetCourierAvailabilityUseCase,
        UpdateCourierLocationUseCase,
        GetAvailableCouriersUseCase,
    ],
    exports: [COURIER_ACCESS_READER],
})
export class CouriersModule {}
