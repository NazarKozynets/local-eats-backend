import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

let prisma: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
    if (!prisma) {
        const url = process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL_TEST or DATABASE_URL must be set for e2e tests');
        const adapter = new PrismaPg({ connectionString: url });
        prisma = new (PrismaClient as any)({ adapter }) as PrismaClient;
    }
    return prisma;
}

export async function disconnectTestPrisma(): Promise<void> {
    if (prisma) {
        await (prisma as any).$disconnect();
        prisma = null;
    }
}

export async function findRestaurantByName(name: string) {
    return getTestPrisma().restaurant.findFirst({ where: { name } });
}

export async function findMenuItemByName(restaurantId: string, name: string) {
    return getTestPrisma().menuItem.findFirst({
        where: { restaurantId, name },
    });
}

export async function findCustomerProfileByEmail(email: string) {
    const user = await getTestPrisma().user.findUnique({ where: { email } });
    if (!user) return null;
    return getTestPrisma().customerProfile.findUnique({ where: { userId: user.id } });
}

export async function findCustomerAddress(customerId: string) {
    return getTestPrisma().customerAddress.findFirst({ where: { customerId } });
}

export async function findCourierProfileByEmail(email: string) {
    const user = await getTestPrisma().user.findUnique({ where: { email } });
    if (!user) return null;
    return getTestPrisma().courierProfile.findUnique({ where: { userId: user.id } });
}
