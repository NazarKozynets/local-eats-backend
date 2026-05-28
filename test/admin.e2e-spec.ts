/**
 * E2E: Admin endpoints
 *
 * Run: npm run test:e2e -- --testPathPattern admin
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loginAs, bearerHeader } from './helpers/auth.helper';
import { disconnectTestPrisma } from './helpers/seed.helper';

describe('Admin endpoints (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;
    let adminToken: string;
    let customerToken: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        httpServer = app.getHttpServer();

        adminToken = await loginAs(httpServer, 'admin');
        customerToken = await loginAs(httpServer, 'customer');
    });

    afterAll(async () => {
        await disconnectTestPrisma();
        await app.close();
    });

    describe('GET /admin/dashboard', () => {
        it('admin can access dashboard', async () => {
            const res = await request(httpServer)
                .get('/admin/dashboard')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(res.body).toBeDefined();
        });

        it('customer cannot access admin dashboard', async () => {
            await request(httpServer)
                .get('/admin/dashboard')
                .set(bearerHeader(customerToken))
                .expect(403);
        });

        it('unauthenticated request fails', async () => {
            await request(httpServer)
                .get('/admin/dashboard')
                .expect(401);
        });
    });

    describe('GET /admin/users', () => {
        it('admin can list users', async () => {
            const res = await request(httpServer)
                .get('/admin/users')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
        });
    });

    describe('GET /admin/restaurants', () => {
        it('admin can list restaurants', async () => {
            const res = await request(httpServer)
                .get('/admin/restaurants')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
        });
    });

    describe('GET /admin/couriers', () => {
        it('admin can list couriers', async () => {
            const res = await request(httpServer)
                .get('/admin/couriers')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
        });
    });

    describe('GET /admin/orders', () => {
        it('admin can list orders', async () => {
            const res = await request(httpServer)
                .get('/admin/orders')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
        });
    });

    describe('GET /admin/payments', () => {
        it('admin can list payments', async () => {
            const res = await request(httpServer)
                .get('/admin/payments')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
        });
    });

    describe('GET /admin/reviews', () => {
        it('admin can list reviews', async () => {
            const res = await request(httpServer)
                .get('/admin/reviews')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
        });
    });

    describe('GET /admin/delivery-problems', () => {
        it('admin can list delivery problems', async () => {
            const res = await request(httpServer)
                .get('/admin/delivery-problems')
                .set(bearerHeader(adminToken))
                .expect(200);

            expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
        });
    });
});
