import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { InvalidRestaurantWorkingHoursError } from '../errors/invalid-restaurant-working-hours.error';

type RestaurantWorkingHourProps = {
    id: UUID;
    restaurantId: UUID;
    dayOfWeek: number;
    opensAt: string | null;
    closesAt: string | null;
    isClosed: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type CreateRestaurantWorkingHourProps = {
    id: UUID;
    restaurantId: UUID;
    dayOfWeek: number;
    opensAt?: string | null;
    closesAt?: string | null;
    isClosed: boolean;
};

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

function toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

export class RestaurantWorkingHour {
    private constructor(private readonly props: RestaurantWorkingHourProps) {}

    static create(p: CreateRestaurantWorkingHourProps): RestaurantWorkingHour {
        RestaurantWorkingHour.validate(p.dayOfWeek, p.opensAt ?? null, p.closesAt ?? null, p.isClosed);

        const now = new Date();

        return new RestaurantWorkingHour({
            id: p.id,
            restaurantId: p.restaurantId,
            dayOfWeek: p.dayOfWeek,
            opensAt: p.opensAt ?? null,
            closesAt: p.closesAt ?? null,
            isClosed: p.isClosed,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: RestaurantWorkingHourProps): RestaurantWorkingHour {
        return new RestaurantWorkingHour(props);
    }

    private static validate(
        dayOfWeek: number,
        opensAt: string | null,
        closesAt: string | null,
        isClosed: boolean,
    ): void {
        if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
            throw new InvalidRestaurantWorkingHoursError('dayOfWeek must be an integer between 1 and 7');
        }

        if (isClosed) {
            return;
        }

        if (!opensAt || !closesAt) {
            throw new InvalidRestaurantWorkingHoursError('opensAt and closesAt are required when isClosed is false');
        }

        if (!TIME_REGEX.test(opensAt)) {
            throw new InvalidRestaurantWorkingHoursError(`opensAt must be in HH:mm format, got: ${opensAt}`);
        }

        if (!TIME_REGEX.test(closesAt)) {
            throw new InvalidRestaurantWorkingHoursError(`closesAt must be in HH:mm format, got: ${closesAt}`);
        }

        if (toMinutes(opensAt) >= toMinutes(closesAt)) {
            throw new InvalidRestaurantWorkingHoursError('opensAt must be earlier than closesAt');
        }
    }

    get id(): UUID { return this.props.id; }
    get restaurantId(): UUID { return this.props.restaurantId; }
    get dayOfWeek(): number { return this.props.dayOfWeek; }
    get opensAt(): string | null { return this.props.opensAt; }
    get closesAt(): string | null { return this.props.closesAt; }
    get isClosed(): boolean { return this.props.isClosed; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
