import { UUID } from '../../../../shared/domain/value-objects/uuid.vo';
import { MenuCategoryName } from '../value-objects/menu-category-name.vo';

type MenuCategoryProps = {
    id: UUID;
    restaurantId: UUID;
    name: MenuCategoryName;
    position: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type CreateMenuCategoryProps = {
    id: UUID;
    restaurantId: UUID;
    name: MenuCategoryName;
    position?: number;
};

type RestoreMenuCategoryProps = MenuCategoryProps;

export class MenuCategory {
    private constructor(private readonly props: MenuCategoryProps) {}

    static create(p: CreateMenuCategoryProps): MenuCategory {
        const now = new Date();

        return new MenuCategory({
            id: p.id,
            restaurantId: p.restaurantId,
            name: p.name,
            position: p.position ?? 0,
            isActive: true,
            createdAt: now,
            updatedAt: now,
        });
    }

    static restore(props: RestoreMenuCategoryProps): MenuCategory {
        return new MenuCategory(props);
    }

    rename(name: MenuCategoryName): void {
        this.props.name = name;
        this.touch();
    }

    changePosition(position: number): void {
        this.props.position = position;
        this.touch();
    }

    activate(): void {
        this.props.isActive = true;
        this.touch();
    }

    deactivate(): void {
        this.props.isActive = false;
        this.touch();
    }

    private touch(): void {
        this.props.updatedAt = new Date();
    }

    get id(): UUID { return this.props.id; }
    get restaurantId(): UUID { return this.props.restaurantId; }
    get name(): MenuCategoryName { return this.props.name; }
    get position(): number { return this.props.position; }
    get isActive(): boolean { return this.props.isActive; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }
}
