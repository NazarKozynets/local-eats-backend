/**
 * E2E: Security boundary tests
 *
 * Verifies that authorization boundaries between roles are enforced.
 *
 * Run: npm run test:e2e -- --testPathPattern security
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loginAs, bearerHeader } from './helpers/auth.helper';
import { findRestaurantByName, disconnectTestPrisma } from './helpers/seed.helper';

describe('Security boundaries (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;
    let customerToken: string;
    let courierToken: string;
    let restaurantId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        httpServer = app.getHttpServer();

        customerToken = await loginAs(httpServer, 'customer');
        courierToken = await loginAs(httpServer, 'courier');

        const restaurant = await findRestaurantByName('Seed Bistro');
        if (!restaurant) throw new Error('Run npm run prisma:seed first.');
        restaurantId = restaurant.id;
    });

    afterAll(async () => {
        await disconnectTestPrisma();
        await app.close();
    });

    describe('Unauthenticated access', () => {
        it('POST /orders requires auth', async () => {
            await request(httpServer).post('/orders').expect(401);
        });

        it('GET /orders/my requires auth', async () => {
            await request(httpServer).get('/orders/my').expect(401);
        });

        it('GET /admin/dashboard requires auth', async () => {
            await request(httpServer).get('/admin/dashboard').expect(401);
        });

        it('GET /couriers/me/profile requires auth', async () => {
            await request(httpServer).get('/couriers/me/profile').expect(401);
        });
    });

    describe('Role-based access', () => {
        it('customer cannot access admin dashboard', async () => {
            await request(httpServer)
                .get('/admin/dashboard')
                .set(bearerHeader(customerToken))
                .expect(403);
        });

        it('courier cannot access admin dashboard', async () => {
            await request(httpServer)
                .get('/admin/dashboard')
                .set(bearerHeader(courierToken))
                .expect(403);
        });

        it('customer cannot accept orders (restaurant action)', async () => {
            await request(httpServer)
                .patch('/restaurant-orders/550e8400-e29b-41d4-a716-446655440000/accept')
                .set(bearerHeader(customerToken))
                // Either 403 (access denied) or 404 (order not found for this user)
                .expect((res) => {
                    expect([403, 404]).toContain(res.status);
                });
        });

        it('customer cannot update catalog (manager action)', async () => {
            await request(httpServer)
                .post(`/restaurants/${restaurantId}/catalog/categories`)
                .set(bearerHeader(customerToken))
                .send({ name: 'Hack Category' })
                .expect(403);
        });
    });

    describe('Invalid UUIDs', () => {
        it('returns 400 for malformed UUID in path', async () => {
            await request(httpServer)
                .get('/orders/not-a-uuid')
                .set(bearerHeader(customerToken))
                .expect(400);
        });
    });
});
