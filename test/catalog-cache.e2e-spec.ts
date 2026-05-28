/**
 * E2E: Public catalog + Redis cache
 *
 * Prerequisites: seed data must exist, Redis must be running.
 *
 * Run: npm run test:e2e -- --testPathPattern catalog
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loginAs, bearerHeader } from './helpers/auth.helper';
import { findRestaurantByName, findMenuItemByName, disconnectTestPrisma } from './helpers/seed.helper';

describe('Catalog + Cache (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;
    let restaurantId: string;
    let managerToken: string;
    let borschItemId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        httpServer = app.getHttpServer();

        const restaurant = await findRestaurantByName('Seed Bistro');
        if (!restaurant) throw new Error('Seed Bistro not found. Run npm run prisma:seed first.');
        restaurantId = restaurant.id;

        const borsch = await findMenuItemByName(restaurantId, 'Borsch');
        if (!borsch) throw new Error('Seed menu item Borsch not found.');
        borschItemId = borsch.id;

        managerToken = await loginAs(httpServer, 'manager');
    });

    afterAll(async () => {
        await disconnectTestPrisma();
        await app.close();
    });

    describe('GET /public/restaurants/:id/catalog', () => {
        it('returns public catalog for active restaurant', async () => {
            const res = await request(httpServer)
                .get(`/public/restaurants/${restaurantId}/catalog`)
                .expect(200);

            expect(res.body.categories).toBeDefined();
            const items: any[] = res.body.categories.flatMap((c: any) => c.items ?? []);
            expect(items.length).toBeGreaterThan(0);
        });

        it('does not return HIDDEN items in public catalog', async () => {
            const res = await request(httpServer)
                .get(`/public/restaurants/${restaurantId}/catalog`)
                .expect(200);

            const items: any[] = res.body.categories.flatMap((c: any) => c.items ?? []);
            const hiddenItem = items.find((i: any) => i.name === 'Secret Special');
            expect(hiddenItem).toBeUndefined();
        });

        it('returns 404 for non-existent restaurant', async () => {
            await request(httpServer)
                .get('/public/restaurants/550e8400-e29b-41d4-a716-446655440000/catalog')
                .expect(404);
        });

        it('second request returns same data (cache hit)', async () => {
            const first = await request(httpServer)
                .get(`/public/restaurants/${restaurantId}/catalog`)
                .expect(200);

            const second = await request(httpServer)
                .get(`/public/restaurants/${restaurantId}/catalog`)
                .expect(200);

            expect(second.body).toEqual(first.body);
        });
    });

    describe('Manager catalog endpoints', () => {
        it('manager can see all items including UNAVAILABLE and HIDDEN', async () => {
            const res = await request(httpServer)
                .get(`/restaurants/${restaurantId}/catalog`)
                .set(bearerHeader(managerToken))
                .expect(200);

            const items: any[] = res.body.categories.flatMap((c: any) => c.items ?? []);
            const statuses = items.map((i: any) => i.status);
            expect(statuses).toContain('UNAVAILABLE');
            expect(statuses).toContain('HIDDEN');
        });

        it('anonymous user cannot access manager catalog', async () => {
            await request(httpServer)
                .get(`/restaurants/${restaurantId}/catalog`)
                .expect(401);
        });
    });

    describe('Cache invalidation after write', () => {
        it('public catalog reflects updated item price after manager update', async () => {
            const beforeRes = await request(httpServer)
                .get(`/public/restaurants/${restaurantId}/catalog`)
                .expect(200);

            const itemsBefore: any[] = beforeRes.body.categories.flatMap((c: any) => c.items ?? []);
            const borschBefore = itemsBefore.find((i: any) => i.name === 'Borsch');
            expect(borschBefore).toBeDefined();
            const originalPrice: number = borschBefore.price;

            const newPrice = originalPrice === 9.99 ? 10.99 : 9.99;

            await request(httpServer)
                .patch(`/catalog/items/${borschItemId}`)
                .set(bearerHeader(managerToken))
                .send({ price: newPrice })
                .expect(204);

            const afterRes = await request(httpServer)
                .get(`/public/restaurants/${restaurantId}/catalog`)
                .expect(200);

            const itemsAfter: any[] = afterRes.body.categories.flatMap((c: any) => c.items ?? []);
            const borschAfter = itemsAfter.find((i: any) => i.name === 'Borsch');
            expect(borschAfter).toBeDefined();
            expect(borschAfter.price).toBe(newPrice);

            // Restore original price so subsequent test runs are consistent
            await request(httpServer)
                .patch(`/catalog/items/${borschItemId}`)
                .set(bearerHeader(managerToken))
                .send({ price: originalPrice })
                .expect(204);
        });
    });
});
