/**
 * E2E: Order creation and restaurant workflow
 *
 * Flow tested:
 *   1. Customer creates order
 *   2. Customer gets order list / details
 *   3. Restaurant manager accepts order
 *   4. Restaurant manager starts preparation
 *   5. Restaurant manager marks ready for pickup
 *   6. Customer cancels a freshly created order
 *
 * NOTE: Courier assignment → PICKED_UP → DELIVERING → DELIVERED flow is NOT tested
 * here because the Deliveries module is not yet implemented (src/modules/deliveries/ is empty
 * and Order entity has no assignCourier/pickUp/markDelivering/markDelivered methods).
 *
 * Run: npm run test:e2e -- --testPathPattern order-restaurant
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

describe('Order + Restaurant workflow (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;

    let customerToken: string;
    let managerToken: string;

    let restaurantId: string;
    let availableMenuItemId: string;
    let customerAddressId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        httpServer = app.getHttpServer();

        // Resolve seed data
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

        customerToken = await loginAs(httpServer, 'customer');
        managerToken = await loginAs(httpServer, 'manager');
    });

    afterAll(async () => {
        await disconnectTestPrisma();
        await app.close();
    });

    let createdOrderId: string;

    describe('Order creation', () => {
        it('customer can create an order with available item', async () => {
            const res = await request(httpServer)
                .post('/orders')
                .set(bearerHeader(customerToken))
                .send({
                    restaurantId,
                    customerAddressId,
                    paymentMethod: 'CASH_ON_DELIVERY',
                    items: [{ menuItemId: availableMenuItemId, quantity: 2 }],
                })
                .expect(201);

            createdOrderId = res.body.id;
            expect(createdOrderId).toBeDefined();
        });

        it('customer can list their orders', async () => {
            const res = await request(httpServer)
                .get('/orders/my')
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.length).toBeGreaterThan(0);
            const order = res.body.find((o: any) => o.id === createdOrderId);
            expect(order).toBeDefined();
            expect(order.status).toBe('CREATED');
        });

        it('order items have name and price snapshots', async () => {
            const res = await request(httpServer)
                .get(`/orders/${createdOrderId}`)
                .set(bearerHeader(customerToken))
                .expect(200);

            const item = res.body.items?.[0];
            expect(item?.nameSnapshot).toBe('Borsch');
            expect(typeof item?.priceSnapshot).toBe('number');
            expect(item?.quantity).toBe(2);
        });

        it('rejects order with UNAVAILABLE item', async () => {
            const unavailableItem = await findMenuItemByName(restaurantId, 'Holubtsi');
            if (!unavailableItem) return;

            await request(httpServer)
                .post('/orders')
                .set(bearerHeader(customerToken))
                .send({
                    restaurantId,
                    customerAddressId,
                    paymentMethod: 'CASH_ON_DELIVERY',
                    items: [{ menuItemId: unavailableItem.id, quantity: 1 }],
                })
                .expect(409);
        });

        it('unauthenticated request fails', async () => {
            await request(httpServer)
                .post('/orders')
                .send({})
                .expect(401);
        });
    });

    describe('Restaurant workflow', () => {
        it('manager can see orders for their restaurant', async () => {
            const res = await request(httpServer)
                .get(`/restaurants/${restaurantId}/orders`)
                .set(bearerHeader(managerToken))
                .expect(200);

            expect(Array.isArray(res.body)).toBe(true);
        });

        it('manager accepts the order', async () => {
            await request(httpServer)
                .patch(`/restaurant-orders/${createdOrderId}/accept`)
                .set(bearerHeader(managerToken))
                .expect(204);
        });

        it('order status is ACCEPTED_BY_RESTAURANT', async () => {
            const res = await request(httpServer)
                .get(`/orders/${createdOrderId}`)
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.status).toBe('ACCEPTED_BY_RESTAURANT');
        });

        it('manager starts preparation', async () => {
            await request(httpServer)
                .patch(`/restaurant-orders/${createdOrderId}/start-preparation`)
                .set(bearerHeader(managerToken))
                .expect(204);
        });

        it('order status is PREPARING', async () => {
            const res = await request(httpServer)
                .get(`/orders/${createdOrderId}`)
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.status).toBe('PREPARING');
        });

        it('manager marks order ready for pickup', async () => {
            await request(httpServer)
                .patch(`/restaurant-orders/${createdOrderId}/ready-for-pickup`)
                .set(bearerHeader(managerToken))
                .expect(204);
        });

        it('order status is READY_FOR_PICKUP', async () => {
            const res = await request(httpServer)
                .get(`/orders/${createdOrderId}`)
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.status).toBe('READY_FOR_PICKUP');
        });
    });

    describe('Order cancellation', () => {
        it('customer can cancel a CREATED order', async () => {
            // Create a fresh order to cancel
            await request(httpServer)
                .post('/orders')
                .set(bearerHeader(customerToken))
                .send({
                    restaurantId,
                    customerAddressId,
                    paymentMethod: 'CASH_ON_DELIVERY',
                    items: [{ menuItemId: availableMenuItemId, quantity: 1 }],
                })
                .expect(201);

            const ordersRes = await request(httpServer)
                .get('/orders/my')
                .set(bearerHeader(customerToken))
                .expect(200);

            const cancelableOrder = ordersRes.body.find((o: any) => o.status === 'CREATED');
            expect(cancelableOrder).toBeDefined();

            await request(httpServer)
                .patch(`/orders/${cancelableOrder.id}/cancel`)
                .set(bearerHeader(customerToken))
                .send({ reason: 'Changed my mind' })
                .expect(204);

            const res = await request(httpServer)
                .get(`/orders/${cancelableOrder.id}`)
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.status).toBe('CANCELLED');
        });
    });

    describe('Delivery flow — NOT IMPLEMENTED', () => {
        it.todo('courier: assign to order → status ASSIGNED_TO_COURIER');
        it.todo('courier: pick up order → status PICKED_UP');
        it.todo('courier: start delivery → status DELIVERING');
        it.todo('courier: mark delivered → status DELIVERED');
    });
});
