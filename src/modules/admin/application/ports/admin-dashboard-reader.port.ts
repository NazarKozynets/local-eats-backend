export interface AdminDashboardReadModel {
    totalUsers: number;
    totalRestaurants: number;
    totalCouriers: number;
    totalOrders: number;
    totalRevenue: number;
    openDeliveryProblems: number;
    pendingRestaurantVerifications: number;
    pendingCourierVerifications: number;
}

export const ADMIN_DASHBOARD_READER = Symbol('ADMIN_DASHBOARD_READER');

export interface AdminDashboardReader {
    getDashboard(): Promise<AdminDashboardReadModel>;
}
