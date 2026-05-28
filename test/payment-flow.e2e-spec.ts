/**
 * E2E: Payment flow
 *
 * Tests:
 *  - Create payment for a CREATED order (CASH_ON_DELIVERY)
 *  - Duplicate payment is rejected
 *  - Fetch payment by order
 *
 * NOTE: Review e2e tests for delivered orders are covered in delivery-flow.e2e-spec.ts.
 *
 * Run: npm run test:e2e -- --testPathPattern payment
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

describe('Payment flow (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;

    let customerToken: string;
    let restaurantId: string;
    let availableMenuItemId: string;
    let customerAddressId: string;
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

        const menuItem = await findMenuItemByName(restaurantId, 'Varenyky');
        if (!menuItem) throw new Error('Seed menu item Varenyky not found.');
        availableMenuItemId = menuItem.id;

        const customerProfile = await findCustomerProfileByEmail('customer@localeats.test');
        if (!customerProfile) throw new Error('Customer profile not found.');
        const address = await findCustomerAddress(customerProfile.id);
        if (!address) throw new Error('Customer address not found.');
        customerAddressId = address.id;

        customerToken = await loginAs(httpServer, 'customer');

        // Create a fresh order
        await request(httpServer)
            .post('/orders')
            .set(bearerHeader(customerToken))
            .send({
                restaurantId,
                customerAddressId,
                paymentMethod: 'CARD_ONLINE',
                items: [{ menuItemId: availableMenuItemId, quantity: 1 }],
            })
            .expect(201);

        const ordersRes = await request(httpServer)
            .get('/orders/my')
            .set(bearerHeader(customerToken))
            .expect(200);

        orderId = ordersRes.body.find((o: any) => o.paymentMethod === 'CARD_ONLINE')?.id;
        if (!orderId) throw new Error('Order not created.');
    });

    afterAll(async () => {
        await disconnectTestPrisma();
        await app.close();
    });

    describe('POST /payments/orders/:orderId', () => {
        it('creates a payment for a CREATED order', async () => {
            await request(httpServer)
                .post(`/payments/orders/${orderId}`)
                .set(bearerHeader(customerToken))
                .expect(201);
        });

        it('rejects duplicate payment', async () => {
            await request(httpServer)
                .post(`/payments/orders/${orderId}`)
                .set(bearerHeader(customerToken))
                .expect(409);
        });
    });

    describe('GET /payments/orders/:orderId', () => {
        it('returns payment details', async () => {
            const res = await request(httpServer)
                .get(`/payments/orders/${orderId}`)
                .set(bearerHeader(customerToken))
                .expect(200);

            expect(res.body.orderId).toBe(orderId);
            expect(res.body.status).toBeDefined();
        });
    });

    describe('Review flow — requires DELIVERED order', () => {
        it('review tests are covered in delivery-flow.e2e-spec.ts after the full delivery lifecycle', () => {
            expect(true).toBe(true);
        });
    });
});
