import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { MenuItemName } from '../value-objects/menu-item-name.vo';
import { MenuItemPrice } from '../value-objects/menu-item-price.vo';
import { MenuItemStatus } from '../enums/menu-item-status.enum';
import { InvalidMenuItemWeightError } from '../errors/invalid-menu-item-weight.error';
import { InvalidMenuItemCookTimeError } from '../errors/invalid-menu-item-cook-time.error';

type MenuItemProps = {
    id: UUID;
    restaurantId: UUID;
    categoryId: UUID | null;
    name: MenuItemName;
    description: string | null;
    imageUrl: string | null;
    price: MenuItemPrice;
    status: MenuItemStatus;
    weightGrams: number | null;
    estimatedCookTime: number | null;
    isPopular: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type CreateMenuItemProps = {
    id: UUID;
    restaurantId: UUID;
    categoryId?: UUID | null;
    name: MenuItemName;
    description?: string | null;
    imageUrl?: string | null;
    price: MenuItemPrice;
    weightGrams?: number | null;
    estimatedCookTime?: number | null;
    isPopular?: boolean;
};

type RestoreMenuItemProps = MenuItemProps;

type UpdateMenuItemPatch = {
    categoryId?: UUID | null;
    name?: MenuItemName;
    description?: string | null;
    imageUrl?: string | null;
    price?: MenuItemPrice;
    weightGrams?: number | null;
    estimatedCookTime?: number | null;
    isPopular?: boolean;
};

export class MenuItem {
    private constructor(private readonly props: MenuItemProps) {}

    static create(p: CreateMenuItemProps): MenuItem {
        const now = new Date();

        if (p.weightGrams !== undefined && p.weightGrams !== null && p.weightGrams <= 0) {
            throw new InvalidMenuItemWeightError();
        }

        if (p.estimatedCookTime !== undefined && p.estimatedCookTime !== null && p.estimatedCookTime <= 0) {
            throw new InvalidMenuItemCookTimeError();
        }

        return new MenuItem({
            id: p.id,
            restaurantId: p.restaurantId,
            categoryId: p.categoryId ?? null,
            name: p.name,
            description: p.description ?? null,
            imageUrl: p.imageUrl ?? null,
            price: p.price,
            status: MenuItemStatus.AVAILABLE,
            weightGrams: p.weightGrams ?? null,
            estimatedCookTime: p.estimatedCookTime ?? null,
            isPopular: p.isPopular ?? false,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: RestoreMenuItemProps): MenuItem {
        return new MenuItem(props);
    }

    updateDetails(patch: UpdateMenuItemPatch): void {
        if (patch.categoryId !== undefined) this.props.categoryId = patch.categoryId;
        if (patch.name !== undefined) this.props.name = patch.name;
        if (patch.description !== undefined) this.props.description = patch.description;
        if (patch.imageUrl !== undefined) this.props.imageUrl = patch.imageUrl;
        if (patch.price !== undefined) this.props.price = patch.price;

        if (patch.weightGrams !== undefined) {
            if (patch.weightGrams !== null && patch.weightGrams <= 0) {
                throw new InvalidMenuItemWeightError();
            }
            this.props.weightGrams = patch.weightGrams;
        }

        if (patch.estimatedCookTime !== undefined) {
            if (patch.estimatedCookTime !== null && patch.estimatedCookTime <= 0) {
                throw new InvalidMenuItemCookTimeError();
            }
            this.props.estimatedCookTime = patch.estimatedCookTime;
        }

        if (patch.isPopular !== undefined) this.props.isPopular = patch.isPopular;
        this.touch();
    }

    markAvailable(): void {
        this.props.status = MenuItemStatus.AVAILABLE;
        this.touch();
    }

    markUnavailable(): void {
        this.props.status = MenuItemStatus.UNAVAILABLE;
        this.touch();
    }

    hide(): void {
        this.props.status = MenuItemStatus.HIDDEN;
        this.touch();
    }

    markPopular(): void {
        this.props.isPopular = true;
        this.touch();
    }

    unmarkPopular(): void {
        this.props.isPopular = false;
        this.touch();
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    get id(): UUID { return this.props.id; }
    get restaurantId(): UUID { return this.props.restaurantId; }
    get categoryId(): UUID | null { return this.props.categoryId; }
    get name(): MenuItemName { return this.props.name; }
    get description(): string | null { return this.props.description; }
    get imageUrl(): string | null { return this.props.imageUrl; }
    get price(): MenuItemPrice { return this.props.price; }
    get status(): MenuItemStatus { return this.props.status; }
    get weightGrams(): number | null { return this.props.weightGrams; }
    get estimatedCookTime(): number | null { return this.props.estimatedCookTime; }
    get isPopular(): boolean { return this.props.isPopular; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
