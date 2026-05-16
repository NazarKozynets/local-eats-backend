import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { CustomerDisplayName } from '../value-objects/customer-display-name.vo';

type CustomerProfileProps = {
    id: UUID;
    userId: UUID;
    displayName: CustomerDisplayName | null;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
};

type CreateCustomerProfileProps = {
    id: UUID;
    userId: UUID;
    displayName?: CustomerDisplayName | null;
    avatarUrl?: string | null;
};

type RestoreCustomerProfileProps = CustomerProfileProps;

export class CustomerProfile {
    private constructor(private readonly props: CustomerProfileProps) {}

    static create(p: CreateCustomerProfileProps): CustomerProfile {
        const now = new Date();

        return new CustomerProfile({
            id: p.id,
            userId: p.userId,
            displayName: p.displayName ?? null,
            avatarUrl: p.avatarUrl ?? null,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: RestoreCustomerProfileProps): CustomerProfile {
        return new CustomerProfile(props);
    }

    update(displayName: CustomerDisplayName | null | undefined, avatarUrl: string | null | undefined): void {
        if (displayName !== undefined) {
            this.props.displayName = displayName;
        }

        if (avatarUrl !== undefined) {
            this.props.avatarUrl = avatarUrl;
        }

        this.touch();
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    get id(): UUID {
        return this.props.id;
    }

    get userId(): UUID {
        return this.props.userId;
    }

    get displayName(): CustomerDisplayName | null {
        return this.props.displayName;
    }

    get avatarUrl(): string | null {
        return this.props.avatarUrl;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }
}
