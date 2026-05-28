/**
 * E2E: IAM Authentication flow
 *
 * Prerequisites: `npm run prisma:seed` must have run against DATABASE_URL_TEST
 * (or DATABASE_URL if DATABASE_URL_TEST is not set).
 *
 * Run: npm run test:e2e -- --testPathPattern auth
 */

import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loginAs, TEST_CREDENTIALS } from './helpers/auth.helper';

describe('Authentication (e2e)', () => {
    let app: INestApplication;
    let httpServer: any;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
        httpServer = app.getHttpServer();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /auth/login', () => {
        it('returns 200 with tokens for seeded admin', async () => {
            const res = await request(httpServer)
                .post('/auth/login')
                .send(TEST_CREDENTIALS.admin)
                .expect(200);

            expect(res.body.accessToken).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
            expect(res.body.user.role).toBe('ADMIN');
        });

        it('returns 200 with tokens for seeded customer', async () => {
            const token = await loginAs(httpServer, 'customer');
            expect(token).toBeDefined();
        });

        it('returns 200 with tokens for seeded manager', async () => {
            const token = await loginAs(httpServer, 'manager');
            expect(token).toBeDefined();
        });

        it('returns 200 with tokens for seeded courier', async () => {
            const token = await loginAs(httpServer, 'courier');
            expect(token).toBeDefined();
        });

        it('returns 401 for wrong password', async () => {
            await request(httpServer)
                .post('/auth/login')
                .send({ identifier: 'admin@localeats.test', password: 'wrongpassword' })
                .expect(401);
        });

        it('returns 401 for unknown user', async () => {
            await request(httpServer)
                .post('/auth/login')
                .send({ identifier: 'nobody@localeats.test', password: 'Password123!' })
                .expect(401);
        });
    });

    describe('POST /auth/register', () => {
        it('rejects registration with duplicate email', async () => {
            await request(httpServer)
                .post('/auth/register')
                .send({ email: 'customer@localeats.test', password: 'Password123!' })
                .expect(409);
        });
    });
});
