import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';

type CustomerAddressProps = {
    id: UUID;
    customerId: UUID;
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

type CreateCustomerAddressProps = {
    id: UUID;
    customerId: UUID;
    label?: string | null;
    city: string;
    street: string;
    building: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    comment?: string | null;
    isDefault: boolean;
};

type UpdateCustomerAddressProps = {
    label?: string | null;
    city?: string;
    street?: string;
    building?: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    comment?: string | null;
};

type RestoreCustomerAddressProps = CustomerAddressProps;

export class CustomerAddress {
    private constructor(private readonly props: CustomerAddressProps) {}

    static create(p: CreateCustomerAddressProps): CustomerAddress {
        const now = new Date();

        return new CustomerAddress({
            id: p.id,
            customerId: p.customerId,
            label: p.label ?? null,
            city: p.city,
            street: p.street,
            building: p.building,
            apartment: p.apartment ?? null,
            entrance: p.entrance ?? null,
            floor: p.floor ?? null,
            comment: p.comment ?? null,
            isDefault: p.isDefault,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: RestoreCustomerAddressProps): CustomerAddress {
        return new CustomerAddress(props);
    }

    update(patch: UpdateCustomerAddressProps): void {
        if (patch.label !== undefined) this.props.label = patch.label;
        if (patch.city !== undefined) this.props.city = patch.city;
        if (patch.street !== undefined) this.props.street = patch.street;
        if (patch.building !== undefined) this.props.building = patch.building;
        if (patch.apartment !== undefined) this.props.apartment = patch.apartment;
        if (patch.entrance !== undefined) this.props.entrance = patch.entrance;
        if (patch.floor !== undefined) this.props.floor = patch.floor;
        if (patch.comment !== undefined) this.props.comment = patch.comment;
        this.touch();
    }

    markAsDefault(): void {
        this.props.isDefault = true;
        this.touch();
    }

    unmarkAsDefault(): void {
        this.props.isDefault = false;
        this.touch();
    }

    isOwnedBy(customerId: UUID): boolean {
        return this.props.customerId.value === customerId.value;
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    get id(): UUID {
        return this.props.id;
    }

    get customerId(): UUID {
        return this.props.customerId;
    }

    get label(): string | null {
        return this.props.label;
    }

    get city(): string {
        return this.props.city;
    }

    get street(): string {
        return this.props.street;
    }

    get building(): string {
        return this.props.building;
    }

    get apartment(): string | null {
        return this.props.apartment;
    }

    get entrance(): string | null {
        return this.props.entrance;
    }

    get floor(): string | null {
        return this.props.floor;
    }

    get comment(): string | null {
        return this.props.comment;
    }

    get isDefault(): boolean {
        return this.props.isDefault;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
