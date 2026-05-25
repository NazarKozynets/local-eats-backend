import { Module } from '@nestjs/common';
import { IamModule } from '../iam/iam.module';
import { REVIEW_REPOSITORY } from './application/ports/review.repository.port';
import { ORDER_REVIEW_READER } from './application/ports/order-review-reader.port';
import { RESTAURANT_RATING_WRITER } from './application/ports/restaurant-rating-writer.port';
import { COURIER_RATING_WRITER } from './application/ports/courier-rating-writer.port';
import { DOMAIN_EVENT_PUBLISHER } from '../../shared/domain/events/domain-event-publisher.port';
import { PrismaReviewRepository } from './infrastructure/persistence/prisma-review.repository';
import { PrismaOrderReviewReader } from './infrastructure/readers/prisma-order-review-reader';
import { PrismaRestaurantRatingWriter } from './infrastructure/writers/prisma-restaurant-rating-writer';
import { PrismaCourierRatingWriter } from './infrastructure/writers/prisma-courier-rating-writer';
import { NoopDomainEventPublisher } from '../../shared/infrastructure/events/noop-domain-event-publisher';
import { CreateRestaurantReviewUseCase } from './application/use-cases/create-restaurant-review/create-restaurant-review.use-case';
import { CreateCourierReviewUseCase } from './application/use-cases/create-courier-review/create-courier-review.use-case';
import { GetRestaurantReviewsUseCase } from './application/use-cases/get-restaurant-reviews/get-restaurant-reviews.use-case';
import { GetCourierReviewsUseCase } from './application/use-cases/get-courier-reviews/get-courier-reviews.use-case';
import { GetMyReviewsUseCase } from './application/use-cases/get-my-reviews/get-my-reviews.use-case';
import { UpdateReviewUseCase } from './application/use-cases/update-review/update-review.use-case';
import { DeleteReviewUseCase } from './application/use-cases/delete-review/delete-review.use-case';
import { AdminDeleteReviewUseCase } from './application/use-cases/admin-delete-review/admin-delete-review.use-case';
import { ReviewsController } from './presentation/http/reviews.controller';
import { RestaurantReviewsController } from './presentation/http/restaurant-reviews.controller';
import { CourierReviewsController } from './presentation/http/courier-reviews.controller';
import { AdminReviewsController } from './presentation/http/admin-reviews.controller';

@Module({
    imports: [IamModule],
    controllers: [ReviewsController, RestaurantReviewsController, CourierReviewsController, AdminReviewsController],
    providers: [
        { provide: REVIEW_REPOSITORY, useClass: PrismaReviewRepository },
        { provide: ORDER_REVIEW_READER, useClass: PrismaOrderReviewReader },
        { provide: RESTAURANT_RATING_WRITER, useClass: PrismaRestaurantRatingWriter },
        { provide: COURIER_RATING_WRITER, useClass: PrismaCourierRatingWriter },
        { provide: DOMAIN_EVENT_PUBLISHER, useClass: NoopDomainEventPublisher },
        CreateRestaurantReviewUseCase,
        CreateCourierReviewUseCase,
        GetRestaurantReviewsUseCase,
        GetCourierReviewsUseCase,
        GetMyReviewsUseCase,
        UpdateReviewUseCase,
        DeleteReviewUseCase,
        AdminDeleteReviewUseCase,
    ],
})
export class ReviewsModule {}
