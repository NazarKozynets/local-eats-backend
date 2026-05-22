export type CustomerProfileReadModel = {
    id: string;
    userId: string;
};

export type CustomerAddressReadModel = {
    id: string;
    customerId: string;
    label: string | null;
    city: string;
    street: string;
    building: string;
    apartment: string | null;
    entrance: string | null;
    floor: string | null;
    comment: string | null;
};

export const CUSTOMER_ORDER_READER = Symbol('CUSTOMER_ORDER_READER');

export interface CustomerOrderReader {
    getProfileByUserId(userId: string): Promise<CustomerProfileReadModel | null>;
    getAddress(customerId: string, addressId: string): Promise<CustomerAddressReadModel | null>;
}
