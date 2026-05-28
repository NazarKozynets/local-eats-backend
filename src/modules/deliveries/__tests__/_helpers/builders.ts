import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { OrderStatus } from '../../../orders/domain/enums/order-status.enum';
import { DeliveryProblemType } from '../../domain/enums/delivery-problem-type.enum';
import { DeliveryProblemStatus } from '../../domain/enums/delivery-problem-status.enum';
import { DeliveryProblemReport } from '../../domain/entities/delivery-problem-report.entity';
import type { OrderDeliveryView } from '../../../orders/application/ports/order-delivery-reader.port';
import type { CourierAccessView } from '../../../couriers/application/ports/courier-access-reader.port';
import { CourierVerificationStatus } from '../../../couriers/domain/enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../../../couriers/domain/enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../../../couriers/domain/enums/courier-availability-status.enum';
import { CourierVehicleType } from '../../../couriers/domain/enums/courier-vehicle-type.enum';

export const TEST_ORDER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
export const TEST_COURIER_PROFILE_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
export const TEST_COURIER_USER_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
export const TEST_CUSTOMER_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
export const TEST_CUSTOMER_USER_ID = 'eeeeeeee-eeee-4eee-9eee-eeeeeeeeeeee';
export const TEST_RESTAURANT_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
export const TEST_MANAGER_USER_ID = '11111111-1111-4111-8111-111111111111';
export const TEST_ADMIN_USER_ID = '22222222-2222-4222-9222-222222222222';
export const TEST_PROBLEM_REPORT_ID = '33333333-3333-4333-8333-333333333333';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

export function buildOrderDeliveryView(overrides: Partial<OrderDeliveryView> = {}): OrderDeliveryView {
    return {
        orderId: TEST_ORDER_ID,
        publicCode: 'ORD-001',
        customerId: TEST_CUSTOMER_ID,
        customerUserId: TEST_CUSTOMER_USER_ID,
        restaurantId: TEST_RESTAURANT_ID,
        courierId: TEST_COURIER_PROFILE_ID,
        status: OrderStatus.ASSIGNED_TO_COURIER,
        deliveryAddressText: '123 Main St',
        pickedUpAt: null,
        deliveredAt: null,
        createdAt: FIXED_DATE,
        updatedAt: FIXED_DATE,
        ...overrides,
    };
}

export function buildCourierAccessView(overrides: Partial<CourierAccessView> = {}): CourierAccessView {
    return {
        courierProfileId: TEST_COURIER_PROFILE_ID,
        userId: TEST_COURIER_USER_ID,
        profileStatus: CourierProfileStatus.ACTIVE,
        verificationStatus: CourierVerificationStatus.VERIFIED,
        availabilityStatus: CourierAvailabilityStatus.ONLINE,
        vehicleType: CourierVehicleType.BICYCLE,
        deliveryRadiusKm: 10,
        ratingAvg: 4.5,
        ratingCount: 10,
        ...overrides,
    };
}

export function buildDeliveryProblemReport(
    overrides: Partial<{
        id: UUID;
        orderId: UUID;
        reportedByUserId: UUID;
        type: typeof DeliveryProblemType[keyof typeof DeliveryProblemType];
        status: typeof DeliveryProblemStatus[keyof typeof DeliveryProblemStatus];
        description: string;
        resolvedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }> = {},
): DeliveryProblemReport {
    return DeliveryProblemReport.restore({
        id: overrides.id ?? UUID.create(TEST_PROBLEM_REPORT_ID),
        orderId: overrides.orderId ?? UUID.create(TEST_ORDER_ID),
        reportedByUserId: overrides.reportedByUserId ?? UUID.create(TEST_CUSTOMER_USER_ID),
        type: overrides.type ?? DeliveryProblemType.OTHER,
        status: overrides.status ?? DeliveryProblemStatus.OPEN,
        description: overrides.description ?? 'Test problem description',
        resolvedAt: overrides.resolvedAt !== undefined ? overrides.resolvedAt : null,
        createdAt: overrides.createdAt ?? FIXED_DATE,
        updatedAt: overrides.updatedAt ?? FIXED_DATE,
    });
}
