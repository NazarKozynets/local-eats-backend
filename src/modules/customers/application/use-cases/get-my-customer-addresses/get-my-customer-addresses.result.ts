export type CustomerAddressResult = {
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
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export type GetMyCustomerAddressesResult = CustomerAddressResult[];
