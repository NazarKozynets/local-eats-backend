import type { AdminDashboardReader } from '../../application/ports/admin-dashboard-reader.port';
import type { AdminUserReader } from '../../application/ports/admin-user-reader.port';
import type { AdminRestaurantReader } from '../../application/ports/admin-restaurant-reader.port';
import type { AdminCourierReader } from '../../application/ports/admin-courier-reader.port';
import type { AdminOrderReader } from '../../application/ports/admin-order-reader.port';
import type { AdminPaymentReader } from '../../application/ports/admin-payment-reader.port';
import type { AdminDeliveryProblemReader } from '../../application/ports/admin-delivery-problem-reader.port';
import type { AdminDeliveryProblemActionsPort } from '../../application/ports/admin-delivery-problem-actions.port';
import type { AdminReviewReader } from '../../application/ports/admin-review-reader.port';

export function createMockAdminDashboardReader(): jest.Mocked<AdminDashboardReader> {
    return { getDashboard: jest.fn() };
}

export function createMockAdminUserReader(): jest.Mocked<AdminUserReader> {
    return { findMany: jest.fn() };
}

export function createMockAdminRestaurantReader(): jest.Mocked<AdminRestaurantReader> {
    return { findMany: jest.fn() };
}

export function createMockAdminCourierReader(): jest.Mocked<AdminCourierReader> {
    return { findMany: jest.fn() };
}

export function createMockAdminOrderReader(): jest.Mocked<AdminOrderReader> {
    return { findMany: jest.fn() };
}

export function createMockAdminPaymentReader(): jest.Mocked<AdminPaymentReader> {
    return { findMany: jest.fn() };
}

export function createMockAdminDeliveryProblemReader(): jest.Mocked<AdminDeliveryProblemReader> {
    return { findById: jest.fn(), findMany: jest.fn() };
}

export function createMockAdminDeliveryProblemActions(): jest.Mocked<AdminDeliveryProblemActionsPort> {
    return { resolve: jest.fn() };
}

export function createMockAdminReviewReader(): jest.Mocked<AdminReviewReader> {
    return { findMany: jest.fn() };
}
