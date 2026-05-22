import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { CourierVerificationStatus } from '../enums/courier-verification-status.enum';
import { CourierProfileStatus } from '../enums/courier-profile-status.enum';
import { CourierAvailabilityStatus } from '../enums/courier-availability-status.enum';
import { CourierVehicleType } from '../enums/courier-vehicle-type.enum';
import { InvalidCourierProfileStatusTransitionError } from '../errors/invalid-courier-profile-status-transition.error';
import { InvalidCourierVerificationTransitionError } from '../errors/invalid-courier-verification-transition.error';
import { InvalidCourierAvailabilityTransitionError } from '../errors/invalid-courier-availability-transition.error';
import { InvalidCourierDisplayNameError } from '../errors/invalid-courier-display-name.error';
import { InvalidCourierDeliveryRadiusError } from '../errors/invalid-courier-delivery-radius.error';
import { InvalidCourierLocationError } from '../errors/invalid-courier-location.error';

export type CourierLocation = { latitude: number; longitude: number };

type CourierProfileProps = {
    id: UUID;
    userId: UUID;
    displayName: string | null;
    avatarUrl: string | null;
    verificationStatus: CourierVerificationStatus;
    verificationRejectedReason: string | null;
    verifiedAt: Date | null;
    profileStatus: CourierProfileStatus;
    availabilityStatus: CourierAvailabilityStatus;
    vehicleType: CourierVehicleType | null;
    currentLocation: CourierLocation | null;
    deliveryRadiusKm: number;
    completedDeliveriesCount: number;
    ratingAvg: number;
    ratingCount: number;
    createdAt: Date;
    updatedAt: Date;
};

type CreateCourierProfileProps = {
    id: UUID;
    userId: UUID;
    displayName?: string | null;
    avatarUrl?: string | null;
    vehicleType?: CourierVehicleType | null;
    deliveryRadiusKm?: number;
};

type UpdateCourierProfilePatch = {
    displayName?: string | null;
    avatarUrl?: string | null;
    vehicleType?: CourierVehicleType | null;
    deliveryRadiusKm?: number;
};

const DISPLAY_NAME_MAX_LENGTH = 100;
const DELIVERY_RADIUS_MIN = 1;
const DELIVERY_RADIUS_MAX = 200;

export class CourierProfile {
    private constructor(private readonly props: CourierProfileProps) {}

    static create(p: CreateCourierProfileProps): CourierProfile {
        if (p.displayName !== undefined && p.displayName !== null) {
            CourierProfile.validateDisplayName(p.displayName);
        }
        if (p.deliveryRadiusKm !== undefined) {
            CourierProfile.validateDeliveryRadius(p.deliveryRadiusKm);
        }

        const now = new Date();
        return new CourierProfile({
            id: p.id,
            userId: p.userId,
            displayName: p.displayName ?? null,
            avatarUrl: p.avatarUrl ?? null,
            verificationStatus: CourierVerificationStatus.UNVERIFIED,
            verificationRejectedReason: null,
            verifiedAt: null,
            profileStatus: CourierProfileStatus.INCOMPLETE,
            availabilityStatus: CourierAvailabilityStatus.OFFLINE,
            vehicleType: p.vehicleType ?? null,
            currentLocation: null,
            deliveryRadiusKm: p.deliveryRadiusKm ?? 5,
            completedDeliveriesCount: 0,
            ratingAvg: 0,
            ratingCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: CourierProfileProps): CourierProfile {
        return new CourierProfile(props);
    }

    updateProfile(patch: UpdateCourierProfilePatch): void {
        if (this.isBlocked()) {
            throw new InvalidCourierProfileStatusTransitionError(
                this.props.profileStatus,
                'UPDATE',
            );
        }

        if (patch.displayName !== undefined) {
            if (patch.displayName !== null) {
                CourierProfile.validateDisplayName(patch.displayName);
            }
            this.props.displayName = patch.displayName;
        }

        if (patch.avatarUrl !== undefined) {
            this.props.avatarUrl = patch.avatarUrl;
        }

        if (patch.vehicleType !== undefined) {
            this.props.vehicleType = patch.vehicleType;
        }

        if (patch.deliveryRadiusKm !== undefined) {
            CourierProfile.validateDeliveryRadius(patch.deliveryRadiusKm);
            this.props.deliveryRadiusKm = patch.deliveryRadiusKm;
        }

        this.touch();
    }

    submitForVerification(): void {
        if (
            this.props.verificationStatus !== CourierVerificationStatus.UNVERIFIED &&
            this.props.verificationStatus !== CourierVerificationStatus.REJECTED
        ) {
            throw new InvalidCourierVerificationTransitionError(
                this.props.verificationStatus,
                CourierVerificationStatus.PENDING,
            );
        }

        this.props.verificationStatus = CourierVerificationStatus.PENDING;
        this.touch();
    }

    approve(verifiedAt: Date): void {
        if (this.props.verificationStatus !== CourierVerificationStatus.PENDING) {
            throw new InvalidCourierVerificationTransitionError(
                this.props.verificationStatus,
                CourierVerificationStatus.VERIFIED,
            );
        }

        this.props.verificationStatus = CourierVerificationStatus.VERIFIED;
        this.props.verifiedAt = verifiedAt;
        this.props.verificationRejectedReason = null;
        this.props.profileStatus = CourierProfileStatus.ACTIVE;
        this.touch();
    }

    reject(reason: string): void {
        if (this.props.verificationStatus !== CourierVerificationStatus.PENDING) {
            throw new InvalidCourierVerificationTransitionError(
                this.props.verificationStatus,
                CourierVerificationStatus.REJECTED,
            );
        }

        this.props.verificationStatus = CourierVerificationStatus.REJECTED;
        this.props.verificationRejectedReason = reason;
        this.props.profileStatus = CourierProfileStatus.REJECTED;
        this.props.availabilityStatus = CourierAvailabilityStatus.OFFLINE;
        this.touch();
    }

    pause(): void {
        if (this.props.profileStatus !== CourierProfileStatus.ACTIVE) {
            throw new InvalidCourierProfileStatusTransitionError(
                this.props.profileStatus,
                CourierProfileStatus.PAUSED,
            );
        }

        this.props.profileStatus = CourierProfileStatus.PAUSED;
        this.props.availabilityStatus = CourierAvailabilityStatus.OFFLINE;
        this.touch();
    }

    activate(): void {
        if (this.props.profileStatus !== CourierProfileStatus.PAUSED) {
            throw new InvalidCourierProfileStatusTransitionError(
                this.props.profileStatus,
                CourierProfileStatus.ACTIVE,
            );
        }

        if (this.props.verificationStatus !== CourierVerificationStatus.VERIFIED) {
            throw new InvalidCourierProfileStatusTransitionError(
                this.props.profileStatus,
                CourierProfileStatus.ACTIVE,
            );
        }

        this.props.profileStatus = CourierProfileStatus.ACTIVE;
        this.touch();
    }

    block(): void {
        this.props.profileStatus = CourierProfileStatus.BLOCKED;
        this.props.availabilityStatus = CourierAvailabilityStatus.OFFLINE;
        this.touch();
    }

    setAvailability(status: CourierAvailabilityStatus): void {
        if (
            status === CourierAvailabilityStatus.ONLINE ||
            status === CourierAvailabilityStatus.BUSY
        ) {
            if (this.props.verificationStatus !== CourierVerificationStatus.VERIFIED) {
                throw new InvalidCourierAvailabilityTransitionError(
                    'courier must be verified to go online',
                );
            }

            if (this.props.profileStatus !== CourierProfileStatus.ACTIVE) {
                throw new InvalidCourierAvailabilityTransitionError(
                    'courier profile must be active to go online',
                );
            }
        }

        this.props.availabilityStatus = status;
        this.touch();
    }

    updateLocation(latitude: number, longitude: number): void {
        if (latitude < -90 || latitude > 90) {
            throw new InvalidCourierLocationError(
                `latitude must be between -90 and 90, got ${latitude}`,
            );
        }

        if (longitude < -180 || longitude > 180) {
            throw new InvalidCourierLocationError(
                `longitude must be between -180 and 180, got ${longitude}`,
            );
        }

        this.props.currentLocation = { latitude, longitude };
        this.touch();
    }

    isBlocked(): boolean {
        return this.props.profileStatus === CourierProfileStatus.BLOCKED;
    }

    isVerified(): boolean {
        return this.props.verificationStatus === CourierVerificationStatus.VERIFIED;
    }

    isActive(): boolean {
        return this.props.profileStatus === CourierProfileStatus.ACTIVE;
    }

    isReadyForDelivery(): boolean {
        return (
            this.props.verificationStatus === CourierVerificationStatus.VERIFIED &&
            this.props.profileStatus === CourierProfileStatus.ACTIVE &&
            this.props.availabilityStatus === CourierAvailabilityStatus.ONLINE
        );
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    private static validateDisplayName(name: string): void {
        const trimmed = name.trim();
        if (!trimmed) {
            throw new InvalidCourierDisplayNameError('display name must not be empty');
        }
        if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
            throw new InvalidCourierDisplayNameError(
                `display name must not exceed ${DISPLAY_NAME_MAX_LENGTH} characters`,
            );
        }
    }

    private static validateDeliveryRadius(radius: number): void {
        if (!Number.isInteger(radius) || radius < DELIVERY_RADIUS_MIN || radius > DELIVERY_RADIUS_MAX) {
            throw new InvalidCourierDeliveryRadiusError(
                `delivery radius must be an integer between ${DELIVERY_RADIUS_MIN} and ${DELIVERY_RADIUS_MAX} km`,
            );
        }
    }

    get id(): UUID { return this.props.id; }
    get userId(): UUID { return this.props.userId; }
    get displayName(): string | null { return this.props.displayName; }
    get avatarUrl(): string | null { return this.props.avatarUrl; }
    get verificationStatus(): CourierVerificationStatus { return this.props.verificationStatus; }
    get verificationRejectedReason(): string | null { return this.props.verificationRejectedReason; }
    get verifiedAt(): Date | null { return this.props.verifiedAt; }
    get profileStatus(): CourierProfileStatus { return this.props.profileStatus; }
    get availabilityStatus(): CourierAvailabilityStatus { return this.props.availabilityStatus; }
    get vehicleType(): CourierVehicleType | null { return this.props.vehicleType; }
    get currentLocation(): CourierLocation | null { return this.props.currentLocation; }
    get deliveryRadiusKm(): number { return this.props.deliveryRadiusKm; }
    get completedDeliveriesCount(): number { return this.props.completedDeliveriesCount; }
    get ratingAvg(): number { return this.props.ratingAvg; }
    get ratingCount(): number { return this.props.ratingCount; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
