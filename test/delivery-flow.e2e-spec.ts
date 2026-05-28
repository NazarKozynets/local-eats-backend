/**
 * E2E: Full delivery lifecycle
 *
 * Flow tested:
 *   1. Customer creates order
 *   2. Manager accepts → starts preparation → marks ready for pickup
 *   3. Manager assigns seed courier → ASSIGNED_TO_COURIER
 *   4. Courier accepts delivery (no status change, publishes event)
 *   5. Courier picks up → PICKED_UP
 *   6. Courier starts delivery → DELIVERING
 *   7. Courier updates location
 *   8. Courier marks delivered → DELIVERED
 *   9. Customer creates restaurant review
 *  10. Customer creates courier review
 *  11. Duplicate reviews rejected
 *
 * Requires: npm run prisma:seed (courier seed is VERIFIED + ACTIVE + ONLINE)
 *
 * Run: npm run test:e2e -- --testPathPattern delivery
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
    findCourierProfileByEmail,
    disconnectTestPrisma,
} from './helpers/seed.helper';

describe('Delivery flow (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;

    let customerToken: string;
    let managerToken: string;
    let courierToken: string;

    let restaurantId: string;
    let availableMenuItemId: string;
    let customerAddressId: string;
    let courierProfileId: string;
    let orderId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        httpServer = app.getHttpServer();

        const restaurant = await findRestaurantByName('Seed Bistro');
        if (!restaurant) throw new Error('Run npm run prisma:seed first.');
        restaurantId = restaurant.id;

        const menuItem = await findMenuItemByName(restaurantId, 'Borsch');
        if (!menuItem) throw new Error('Seed menu item Borsch not found.');
        availableMenuItemId = menuItem.id;

        const customerProfile = await findCustomerProfileByEmail('customer@localeats.test');
        if (!customerProfile) throw new Error('Customer profile not found.');
        const address = await findCustomerAddress(customerProfile.id);
        if (!address) throw new Error('Customer address not found.');
        customerAddressId = address.id;

        const courierProfile = await findCourierProfileByEmail('courier@localeats.test');
        if (!courierProfile) throw new Error('Courier profile not found.');
        courierProfileId = courierProfile.id;

        expect(restaurantId).toBeDefined();
        expect(availableMenuItemId).toBeDefined();
        expect(customerAddressId).toBeDefined();
        expect(courierProfileId).toBeDefined();

        customerToken = await loginAs(httpServer, 'customer');
        managerToken = await loginAs(httpServer, 'manager');
        courierToken = await loginAs(httpServer, 'courier');
    });

    afterAll(async () => {
        await disconnectTestPrisma();
        await app.close();
    });

    describe('Order creation and restaurant workflow', () => {
        it('customer creates order', async () => {
            const res = await request(httpServer)
                .post('/orders')
                .set(bearerHeader(customerToken))
                .send({
                    restaurantId,
                    customerAddressId,
                    paymentMethod: 'CASH_ON_DELIVERY',
                    items: [{ menuItemId: availableMenuItemId, quantity: 1 }],
                })
                .expect(201);

            orderId = res.body.id;
            expect(orderId).toBeDefined();
        });

        it('manager accepts the order', async () => {
            await request(httpServer)
                .patch(`/restaurant-orders/${orderId}/accept`)
                .set(bearerHeader(managerToken))
                .expect(204);
        });

        it('manager starts preparation', async () => {
            await request(httpServer)
                .patch(`/restaurant-orders/${orderId}/start-preparation`)
                .set(bearerHeader(managerToken))
                .expect(204);
        });

        it('manager marks ready for pickup', async () => {
            await request(httpServer)
                .patch(`/restaurant-orders/${orderId}/ready-for-pickup`)
                .set(bearerHeader(managerToken))
                .expect(204);
        });
    });

    describe('Courier assignment', () => {
        it('manager assigns seed courier to the order', async () => {
            const res = await request(httpServer)
                .patch(`/deliveries/orders/${orderId}/assign-courier`)
                .set(bearerHeader(managerToken))
                .send({ courierProfileId })
                .expect(200);

            expect(res.body.courierId).toBe(courierProfileId);
            expect(res.body.status).toBe('ASSIGNED_TO_COURIER');
        });

        it('re-assigning courier fails with 409', async () => {
            await request(httpServer)
                .patch(`/deliveries/orders/${orderId}/assign-courier`)
                .set(bearerHeader(managerToken))
                .send({ courierProfileId })
                .expect(409);
        });
    });

    describe('Courier delivery lifecycle', () => {
        it('courier accepts delivery', async () => {
            const res = await request(httpServer)
                .patch(`/courier/deliveries/${orderId}/accept`)
                .set(bearerHeader(courierToken))
                .expect(200);

            expect(res.body.status).toBe('ASSIGNED_TO_COURIER');
        });

        it('courier can get active delivery', async () => {
            const res = await request(httpServer)
                .get('/courier/deliveries/active')
                .set(bearerHeader(courierToken))
                .expect(200);

            expect(res.body.orderId).toBe(orderId);
        });

        it('courier picks up the order', async () => {
            const res = await request(httpServer)
                .patch(`/courier/deliveries/${orderId}/pick-up`)
                .set(bearerHeader(courierToken))
                .expect(200);

            expect(res.body.status).toBe('PICKED_UP');
        });

        it('courier starts delivery', async () => {
            const res = await request(httpServer)
                .patch(`/courier/deliveries/${orderId}/start`)
                .set(bearerHeader(courierToken))
                .expect(200);

            expect(res.body.status).toBe('DELIVERING');
        });

        it('courier updates location', async () => {
            await request(httpServer)
                .patch(`/courier/deliveries/${orderId}/location`)
                .set(bearerHeader(courierToken))
                .send({ latitude: 50.45, longitude: 30.52 })
                .expect(204);
        });

        it('courier marks order as delivered', async () => {
            const res = await request(httpServer)
                .patch(`/courier/deliveries/${orderId}/delivered`)
                .set(bearerHeader(courierToken))
                .expect(200);

            expect(res.body.status).toBe('DELIVERED');
            expect(res.body.deliveredAt).toBeDefined();
        });

        it('courier has no more active delivery', async () => {
            const res = await request(httpServer)
                .get('/courier/deliveries/active')
                .set(bearerHeader(courierToken))
                .expect(200);

            // NestJS 11 sends empty body for null returns; supertest parses that as {}
            const isEmpty = res.body === null || Object.keys(res.body as object).length === 0;
            expect(isEmpty).toBe(true);
        });
    });

    describe('Notifications after delivery', () => {
        it('customer has an ORDER_STATUS_CHANGED (delivered) notification', async () => {
            const res = await request(httpServer)
                .get('/notifications')
                .set(bearerHeader(customerToken))
                .expect(200);

            const notifications: any[] = res.body;
            const delivered = notifications.find(
                (n: any) => n.type === 'ORDER_STATUS_CHANGED' && n.data?.orderId === orderId,
            );
            expect(delivered).toBeDefined();
        });
    });

    describe('Reviews after delivered order', () => {
        it('customer creates restaurant review', async () => {
            await request(httpServer)
                .post('/reviews/restaurant')
                .set(bearerHeader(customerToken))
                .send({ orderId, rating: 5, comment: 'Great food!' })
                .expect(201);
        });

        it('customer creates courier review', async () => {
            await request(httpServer)
                .post('/reviews/courier')
                .set(bearerHeader(customerToken))
                .send({ orderId, rating: 4, comment: 'Fast delivery.' })
                .expect(201);
        });

        it('duplicate restaurant review fails', async () => {
            await request(httpServer)
                .post('/reviews/restaurant')
                .set(bearerHeader(customerToken))
                .send({ orderId, rating: 3 })
                .expect(409);
        });

        it('duplicate courier review fails', async () => {
            await request(httpServer)
                .post('/reviews/courier')
                .set(bearerHeader(customerToken))
                .send({ orderId, rating: 3 })
                .expect(409);
        });
    });
});
