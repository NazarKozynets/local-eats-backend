import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { RestaurantName } from '../value-objects/restaurant-name.vo';
import { RestaurantStatus } from '../enums/restaurant-status.enum';
import { RestaurantVerificationStatus } from '../enums/restaurant-verification-status.enum';
import { InvalidRestaurantStatusTransitionError } from '../errors/invalid-restaurant-status-transition.error';

type RestaurantProps = {
    id: UUID;
    name: RestaurantName;
    description: string | null;
    logoUrl: string | null;
    coverUrl: string | null;
    verificationStatus: RestaurantVerificationStatus;
    verificationRejectedReason: string | null;
    verifiedAt: Date | null;
    status: RestaurantStatus;
    city: string;
    addressText: string;
    phone: string | null;
    email: string | null;
    minOrderAmount: number;
    deliveryFee: number;
    ratingAvg: number;
    ratingCount: number;
    createdAt: Date;
    updatedAt: Date;
};

type CreateRestaurantProps = {
    id: UUID;
    name: RestaurantName;
    description?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    city: string;
    addressText: string;
    phone?: string | null;
    email?: string | null;
    minOrderAmount?: number;
    deliveryFee?: number;
};

type RestoreRestaurantProps = RestaurantProps;

type UpdateRestaurantPatch = {
    name?: RestaurantName;
    description?: string | null;
    logoUrl?: string | null;
    coverUrl?: string | null;
    city?: string;
    addressText?: string;
    phone?: string | null;
    email?: string | null;
    minOrderAmount?: number;
    deliveryFee?: number;
};

export class Restaurant {
    private constructor(private readonly props: RestaurantProps) {}

    static create(p: CreateRestaurantProps): Restaurant {
        const now = new Date();

        return new Restaurant({
            id: p.id,
            name: p.name,
            description: p.description ?? null,
            logoUrl: p.logoUrl ?? null,
            coverUrl: p.coverUrl ?? null,
            verificationStatus: RestaurantVerificationStatus.UNVERIFIED,
            verificationRejectedReason: null,
            verifiedAt: null,
            status: RestaurantStatus.DRAFT,
            city: p.city,
            addressText: p.addressText,
            phone: p.phone ?? null,
            email: p.email ?? null,
            minOrderAmount: p.minOrderAmount ?? 0,
            deliveryFee: p.deliveryFee ?? 0,
            ratingAvg: 0,
            ratingCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: RestoreRestaurantProps): Restaurant {
        return new Restaurant(props);
    }

    updateProfile(patch: UpdateRestaurantPatch): void {
        if (patch.name !== undefined) this.props.name = patch.name;
        if (patch.description !== undefined) this.props.description = patch.description;
        if (patch.logoUrl !== undefined) this.props.logoUrl = patch.logoUrl;
        if (patch.coverUrl !== undefined) this.props.coverUrl = patch.coverUrl;
        if (patch.city !== undefined) this.props.city = patch.city;
        if (patch.addressText !== undefined) this.props.addressText = patch.addressText;
        if (patch.phone !== undefined) this.props.phone = patch.phone;
        if (patch.email !== undefined) this.props.email = patch.email;
        if (patch.minOrderAmount !== undefined) this.props.minOrderAmount = patch.minOrderAmount;
        if (patch.deliveryFee !== undefined) this.props.deliveryFee = patch.deliveryFee;
        this.touch();
    }

    submitForVerification(): void {
        if (
            this.props.status !== RestaurantStatus.DRAFT &&
            this.props.status !== RestaurantStatus.REJECTED
        ) {
            throw new InvalidRestaurantStatusTransitionError(
                this.props.status,
                RestaurantStatus.PENDING_VERIFICATION,
            );
        }

        this.props.status = RestaurantStatus.PENDING_VERIFICATION;
        this.props.verificationStatus = RestaurantVerificationStatus.PENDING;
        this.touch();
    }

    approve(verifiedAt: Date): void {
        if (this.props.status !== RestaurantStatus.PENDING_VERIFICATION) {
            throw new InvalidRestaurantStatusTransitionError(
                this.props.status,
                RestaurantStatus.ACTIVE,
            );
        }

        this.props.status = RestaurantStatus.ACTIVE;
        this.props.verificationStatus = RestaurantVerificationStatus.VERIFIED;
        this.props.verifiedAt = verifiedAt;
        this.props.verificationRejectedReason = null;
        this.touch();
    }

    reject(reason: string): void {
        if (this.props.status !== RestaurantStatus.PENDING_VERIFICATION) {
            throw new InvalidRestaurantStatusTransitionError(
                this.props.status,
                RestaurantStatus.REJECTED,
            );
        }

        this.props.status = RestaurantStatus.REJECTED;
        this.props.verificationStatus = RestaurantVerificationStatus.REJECTED;
        this.props.verificationRejectedReason = reason;
        this.touch();
    }

    pause(): void {
        if (this.props.status !== RestaurantStatus.ACTIVE) {
            throw new InvalidRestaurantStatusTransitionError(
                this.props.status,
                RestaurantStatus.PAUSED,
            );
        }

        this.props.status = RestaurantStatus.PAUSED;
        this.touch();
    }

    activate(): void {
        if (this.props.status !== RestaurantStatus.PAUSED) {
            throw new InvalidRestaurantStatusTransitionError(
                this.props.status,
                RestaurantStatus.ACTIVE,
            );
        }

        if (this.props.verificationStatus !== RestaurantVerificationStatus.VERIFIED) {
            throw new InvalidRestaurantStatusTransitionError(
                this.props.status,
                RestaurantStatus.ACTIVE,
            );
        }

        this.props.status = RestaurantStatus.ACTIVE;
        this.touch();
    }

    block(): void {
        this.props.status = RestaurantStatus.BLOCKED;
        this.touch();
    }

    isBlocked(): boolean {
        return this.props.status === RestaurantStatus.BLOCKED;
    }

    isActive(): boolean {
        return this.props.status === RestaurantStatus.ACTIVE;
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    get id(): UUID { return this.props.id; }
    get name(): RestaurantName { return this.props.name; }
    get description(): string | null { return this.props.description; }
    get logoUrl(): string | null { return this.props.logoUrl; }
    get coverUrl(): string | null { return this.props.coverUrl; }
    get verificationStatus(): RestaurantVerificationStatus { return this.props.verificationStatus; }
    get verificationRejectedReason(): string | null { return this.props.verificationRejectedReason; }
    get verifiedAt(): Date | null { return this.props.verifiedAt; }
    get status(): RestaurantStatus { return this.props.status; }
    get city(): string { return this.props.city; }
    get addressText(): string { return this.props.addressText; }
    get phone(): string | null { return this.props.phone; }
    get email(): string | null { return this.props.email; }
    get minOrderAmount(): number { return this.props.minOrderAmount; }
    get deliveryFee(): number { return this.props.deliveryFee; }
    get ratingAvg(): number { return this.props.ratingAvg; }
    get ratingCount(): number { return this.props.ratingCount; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
