export interface GetAdminOrdersCommand {
    page?: number;
    limit?: number;
    status?: string;
    restaurantId?: string;
    courierId?: string;
    customerId?: string;
}
