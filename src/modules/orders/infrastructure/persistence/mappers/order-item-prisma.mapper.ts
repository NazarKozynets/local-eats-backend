import { UUID } from '../../../../../shared/domain/value-objects/uuid.vo';
import { OrderItem } from '../../../domain/entities/order-item.entity';

export class OrderItemPrismaMapper {
    static toDomain(raw: any): OrderItem {
        return OrderItem.restore({
            id: UUID.create(raw.id),
            orderId: UUID.create(raw.orderId),
            menuItemId: raw.menuItemId ? UUID.create(raw.menuItemId) : null,
            nameSnapshot: raw.nameSnapshot,
            priceSnapshot: Number(raw.priceSnapshot),
            quantity: raw.quantity,
            comment: raw.comment ?? null,
            totalPriceSnapshot: Number(raw.totalPriceSnapshot),
            createdAt: raw.createdAt,
        });
    }

    static toPersistence(item: OrderItem) {
        return {
            id: item.id.value,
            orderId: item.orderId.value,
            menuItemId: item.menuItemId?.value ?? null,
            nameSnapshot: item.nameSnapshot,
            priceSnapshot: item.priceSnapshot,
            quantity: item.quantity,
            comment: item.comment,
            totalPriceSnapshot: item.totalPriceSnapshot,
            createdAt: item.createdAt,
        };
    }
}
