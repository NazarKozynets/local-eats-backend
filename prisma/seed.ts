/**
 * Idempotent seed script for LocalEats local development.
 *
 * Seeded credentials:
 *   admin@localeats.test   / Password123!   (ADMIN)
 *   customer@localeats.test / Password123!  (CUSTOMER)
 *   manager@localeats.test  / Password123!  (RESTAURANT_MANAGER)
 *   courier@localeats.test  / Password123!  (COURIER)
 *
 * Run with: npm run prisma:seed
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const ADMIN_EMAIL = 'admin@localeats.test';
const CUSTOMER_EMAIL = 'customer@localeats.test';
const MANAGER_EMAIL = 'manager@localeats.test';
const COURIER_EMAIL = 'courier@localeats.test';
const SEED_PASSWORD = 'Password123!';

async function main() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    const prisma = new (PrismaClient as any)({ adapter }) as PrismaClient;

    try {
        const passwordHash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

        // ── Users ────────────────────────────────────────────────────────────

        const adminUser = await prisma.user.upsert({
            where: { email: ADMIN_EMAIL },
            update: {},
            create: {
                email: ADMIN_EMAIL,
                passwordHash,
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        });

        const customerUser = await prisma.user.upsert({
            where: { email: CUSTOMER_EMAIL },
            update: {},
            create: {
                email: CUSTOMER_EMAIL,
                passwordHash,
                role: 'CUSTOMER',
                status: 'ACTIVE',
            },
        });

        const managerUser = await prisma.user.upsert({
            where: { email: MANAGER_EMAIL },
            update: {},
            create: {
                email: MANAGER_EMAIL,
                passwordHash,
                role: 'RESTAURANT_MANAGER',
                status: 'ACTIVE',
            },
        });

        const courierUser = await prisma.user.upsert({
            where: { email: COURIER_EMAIL },
            update: {},
            create: {
                email: COURIER_EMAIL,
                passwordHash,
                role: 'COURIER',
                status: 'ACTIVE',
            },
        });

        // ── Customer Profile + Address ────────────────────────────────────────

        const customerProfile = await prisma.customerProfile.upsert({
            where: { userId: customerUser.id },
            update: {},
            create: {
                userId: customerUser.id,
                displayName: 'Seed Customer',
            },
        });

        const existingAddress = await prisma.customerAddress.findFirst({
            where: { customerId: customerProfile.id },
        });

        if (!existingAddress) {
            await prisma.customerAddress.create({
                data: {
                    customerId: customerProfile.id,
                    label: 'Home',
                    city: 'Kyiv',
                    street: 'Khreshchatyk',
                    building: '1',
                    apartment: '10',
                    isDefault: true,
                },
            });
        }

        // ── Restaurant + Staff + Working Hours ───────────────────────────────

        const existingRestaurant = await prisma.restaurant.findFirst({
            where: { name: 'Seed Bistro' },
        });

        const restaurant = existingRestaurant ?? await prisma.restaurant.create({
            data: {
                name: 'Seed Bistro',
                description: 'A seeded demo restaurant for testing.',
                city: 'Kyiv',
                addressText: 'Khreshchatyk 10, Kyiv',
                phone: '+380441234567',
                email: 'bistro@localeats.test',
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date(),
                status: 'ACTIVE',
                minOrderAmount: 50,
                deliveryFee: 30,
            },
        });

        await prisma.restaurantStaff.upsert({
            where: {
                uq_restaurant_staff_restaurant_user: {
                    restaurantId: restaurant.id,
                    userId: managerUser.id,
                },
            },
            update: {},
            create: {
                restaurantId: restaurant.id,
                userId: managerUser.id,
                role: 'OWNER',
            },
        });

        // Working hours Mon–Sun (1–7)
        for (let day = 1; day <= 7; day++) {
            await prisma.restaurantWorkingHour.upsert({
                where: {
                    uq_restaurant_working_hours_day: {
                        restaurantId: restaurant.id,
                        dayOfWeek: day,
                    },
                },
                update: {},
                create: {
                    restaurantId: restaurant.id,
                    dayOfWeek: day,
                    opensAt: '09:00',
                    closesAt: '22:00',
                    isClosed: false,
                },
            });
        }

        // ── Menu Categories ───────────────────────────────────────────────────

        const existingCategory = await prisma.menuCategory.findFirst({
            where: { restaurantId: restaurant.id, name: 'Main Dishes' },
        });

        const category = existingCategory ?? await prisma.menuCategory.create({
            data: {
                restaurantId: restaurant.id,
                name: 'Main Dishes',
                position: 1,
                isActive: true,
            },
        });

        const existingDrinkCategory = await prisma.menuCategory.findFirst({
            where: { restaurantId: restaurant.id, name: 'Drinks' },
        });

        existingDrinkCategory ?? await prisma.menuCategory.create({
            data: {
                restaurantId: restaurant.id,
                name: 'Drinks',
                position: 2,
                isActive: true,
            },
        });

        // ── Menu Items ────────────────────────────────────────────────────────

        const itemsToSeed = [
            {
                name: 'Borsch',
                description: 'Traditional Ukrainian borscht',
                price: 85,
                status: 'AVAILABLE' as const,
                weightGrams: 400,
                estimatedCookTime: 15,
                isPopular: true,
            },
            {
                name: 'Varenyky',
                description: 'Dumplings with potato filling',
                price: 120,
                status: 'AVAILABLE' as const,
                weightGrams: 300,
                estimatedCookTime: 20,
                isPopular: false,
            },
            {
                name: 'Holubtsi',
                description: 'Stuffed cabbage rolls',
                price: 140,
                status: 'UNAVAILABLE' as const,
                weightGrams: 350,
                estimatedCookTime: 25,
                isPopular: false,
            },
            {
                name: 'Secret Special',
                description: 'Today only — not shown publicly',
                price: 200,
                status: 'HIDDEN' as const,
                weightGrams: 500,
                estimatedCookTime: 30,
                isPopular: false,
            },
        ];

        for (const item of itemsToSeed) {
            const existing = await prisma.menuItem.findFirst({
                where: { restaurantId: restaurant.id, name: item.name },
            });

            existing ?? await prisma.menuItem.create({
                data: {
                    restaurantId: restaurant.id,
                    categoryId: category.id,
                    ...item,
                },
            });
        }

        // ── Courier Profile ───────────────────────────────────────────────────

        await prisma.courierProfile.upsert({
            where: { userId: courierUser.id },
            update: {},
            create: {
                userId: courierUser.id,
                displayName: 'Seed Courier',
                verificationStatus: 'VERIFIED',
                verifiedAt: new Date(),
                profileStatus: 'ACTIVE',
                availabilityStatus: 'ONLINE',
                vehicleType: 'BICYCLE',
                deliveryRadiusKm: 10,
            },
        });

        console.log('\nSeed completed successfully.');
        console.log('\nSeeded credentials (password: Password123! for all):');
        console.log(`  Admin:    ${ADMIN_EMAIL}`);
        console.log(`  Customer: ${CUSTOMER_EMAIL}`);
        console.log(`  Manager:  ${MANAGER_EMAIL}`);
        console.log(`  Courier:  ${COURIER_EMAIL}`);
        console.log(`\n  Restaurant: Seed Bistro (id: ${restaurant.id})`);
    } finally {
        await (prisma as any).$disconnect();
    }
}

main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
