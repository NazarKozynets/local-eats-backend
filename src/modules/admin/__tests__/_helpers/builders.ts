import type { AdminDashboardReadModel } from '../../application/ports/admin-dashboard-reader.port';
import type { AdminUserReadModel } from '../../application/ports/admin-user-reader.port';
import type { AdminRestaurantReadModel } from '../../application/ports/admin-restaurant-reader.port';
import type { AdminCourierReadModel } from '../../application/ports/admin-courier-reader.port';
import type { AdminOrderReadModel } from '../../application/ports/admin-order-reader.port';
import type { AdminPaymentReadModel } from '../../application/ports/admin-payment-reader.port';
import type { AdminDeliveryProblemReadModel } from '../../application/ports/admin-delivery-problem-reader.port';
import type { AdminReviewReadModel } from '../../application/ports/admin-review-reader.port';

export const TEST_PROBLEM_ID = '550e8400-e29b-41d4-a716-446655440020';
export const TEST_USER_ID = '550e8400-e29b-41d4-a716-446655440021';
export const TEST_ORDER_ID = '550e8400-e29b-41d4-a716-446655440022';
export const TEST_RESTAURANT_ID = '550e8400-e29b-41d4-a716-446655440023';
export const TEST_COURIER_ID = '550e8400-e29b-41d4-a716-446655440024';
export const TEST_REVIEW_ID = '550e8400-e29b-41d4-a716-446655440025';
export const TEST_PAYMENT_ID = '550e8400-e29b-41d4-a716-446655440026';

const FIXED_DATE = new Date('2026-01-01T00:00:00Z');

export function buildAdminDashboard(overrides: Partial<AdminDashboardReadModel> = {}): AdminDashboardReadModel {
    return {
        totalUsers: 100,
        totalRestaurants: 20,
        totalCouriers: 15,
        totalOrders: 500,
        totalRevenue: 12500,
        openDeliveryProblems: 3,
        pendingRestaurantVerifications: 2,
        pendingCourierVerifications: 4,
        ...overrides,
    };
}

export function buildAdminUser(overrides: Partial<AdminUserReadModel> = {}): AdminUserReadModel {
    return {
        id: TEST_USER_ID,
        email: 'user@example.com',
        phone: null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        createdAt: FIXED_DATE,
        blockedUntil: null,
        blockReason: null,
        ...overrides,
    };
}

export function buildAdminRestaurant(overrides: Partial<AdminRestaurantReadModel> = {}): AdminRestaurantReadModel {
    return {
        id: TEST_RESTAURANT_ID,
        name: 'Test Restaurant',
        city: 'Kyiv',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        ratingAvg: 4.5,
        ratingCount: 10,
        createdAt: FIXED_DATE,
        ...overrides,
    };
}

export function buildAdminCourier(overrides: Partial<AdminCourierReadModel> = {}): AdminCourierReadModel {
    return {
        id: TEST_COURIER_ID,
        userId: TEST_USER_ID,
        displayName: 'Test Courier',
        verificationStatus: 'VERIFIED',
        profileStatus: 'ACTIVE',
        availabilityStatus: 'ONLINE',
        ratingAvg: 4.8,
        ratingCount: 20,
        completedDeliveriesCount: 50,
        createdAt: FIXED_DATE,
        ...overrides,
    };
}

export function buildAdminOrder(overrides: Partial<AdminOrderReadModel> = {}): AdminOrderReadModel {
    return {
        id: TEST_ORDER_ID,
        publicCode: 'ABC123',
        status: 'DELIVERED',
        paymentMethod: 'CARD_ONLINE',
        paymentStatus: 'PAID',
        totalPrice: 250,
        currency: 'UAH',
        customerId: TEST_USER_ID,
        restaurantId: TEST_RESTAURANT_ID,
        courierId: TEST_COURIER_ID,
        createdAt: FIXED_DATE,
        ...overrides,
    };
}

export function buildAdminPayment(overrides: Partial<AdminPaymentReadModel> = {}): AdminPaymentReadModel {
    return {
        id: TEST_PAYMENT_ID,
        orderId: TEST_ORDER_ID,
        provider: 'STRIPE',
        status: 'PAID',
        amount: 250,
        currency: 'UAH',
        paidAt: FIXED_DATE,
        refundedAt: null,
        createdAt: FIXED_DATE,
        ...overrides,
    };
}

export function buildAdminDeliveryProblem(
    overrides: Partial<AdminDeliveryProblemReadModel> = {},
): AdminDeliveryProblemReadModel {
    return {
        id: TEST_PROBLEM_ID,
        orderId: TEST_ORDER_ID,
        reportedByUserId: TEST_USER_ID,
        type: 'DAMAGED_ORDER',
        status: 'OPEN',
        description: 'Order was damaged during delivery',
        resolvedAt: null,
        createdAt: FIXED_DATE,
        ...overrides,
    };
}

export function buildAdminReview(overrides: Partial<AdminReviewReadModel> = {}): AdminReviewReadModel {
    return {
        id: TEST_REVIEW_ID,
        orderId: TEST_ORDER_ID,
        reviewerUserId: TEST_USER_ID,
        target: 'RESTAURANT',
        restaurantId: TEST_RESTAURANT_ID,
        courierId: null,
        rating: 4,
        comment: 'Great food!',
        createdAt: FIXED_DATE,
        ...overrides,
    };
}
