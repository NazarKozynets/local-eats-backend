/**
 * E2E: Notification events
 *
 * Flow tested:
 *   1. Customer creates an order → ORDER_CREATED event fires → notification is persisted
 *   2. Customer fetches notifications → ORDER_CREATED notification is present
 *   3. Unread count is positive
 *   4. Customer marks all as read → unread count drops to 0
 *
 * Prerequisites: seed data must exist (npm run prisma:seed).
 * Run: npm run test:e2e -- --testPathPattern notification
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loginAs, bearerHeader } from './helpers/auth.helper';
import {
    findRestaurantByName,
    findMenuItemByName,
    findCustomerProfileByEmail,
    findCustomerAddress,
    disconnectTestPrisma,
} from './helpers/seed.helper';

describe('Notification events (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;

    let customerToken: string;
    let restaurantId: string;
    let menuItemId: string;
    let customerAddressId: string;

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

        const menuItem = await findMenuItemByName(restaurantId, 'Borsch');
        if (!menuItem) throw new Error('Seed menu item Borsch not found.');
        menuItemId = menuItem.id;

        const customerProfile = await findCustomerProfileByEmail('customer@localeats.test');
        if (!customerProfile) throw new Error('Customer profile not found.');
        const address = await findCustomerAddress(customerProfile.id);
        if (!address) throw new Error('Customer address not found.');
        customerAddressId = address.id;

        customerToken = await loginAs(httpServer, 'customer');
    });

    afterAll(async () => {
        await disconnectTestPrisma();
        await app.close();
    });

    describe('ORDER_CREATED notification flow', () => {
        it('customer creates an order and an ORDER_CREATED notification is stored', async () => {
            await request(httpServer)
                .post('/orders')
                .set(bearerHeader(customerToken))
                .send({
                    restaurantId,
                    customerAddressId,
                    paymentMethod: 'CASH_ON_DELIVERY',
                    items: [{ menuItemId, quantity: 1 }],
                })
                .expect(201);

            const res = await request(httpServer)
                .get('/notifications')
                .set(bearerHeader(customerToken))
                .expect(200);

            const notifications: any[] = res.body;
            const orderCreated = notifications.find((n: any) => n.type === 'ORDER_CREATED');
            expect(orderCreated).toBeDefined();
            expect(orderCreated.readAt).toBeNull();
        });

        it('unread notifications count is greater than 0 after order creation', async () => {
            const res = await request(httpServer)
                .get('/notifications/unread-count')
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.count).toBeGreaterThan(0);
        });

        it('mark all as read drops unread count to 0', async () => {
            await request(httpServer)
                .patch('/notifications/read-all')
                .set(bearerHeader(customerToken))
                .expect(200);

            const res = await request(httpServer)
                .get('/notifications/unread-count')
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.count).toBe(0);
        });
    });
});
