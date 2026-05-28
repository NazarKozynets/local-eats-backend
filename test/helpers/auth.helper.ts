import request from 'supertest';

export const TEST_CREDENTIALS = {
    admin: { identifier: 'admin@localeats.test', password: 'Password123!' },
    customer: { identifier: 'customer@localeats.test', password: 'Password123!' },
    manager: { identifier: 'manager@localeats.test', password: 'Password123!' },
    courier: { identifier: 'courier@localeats.test', password: 'Password123!' },
} as const;

export async function loginAs(
    httpServer: any,
    role: keyof typeof TEST_CREDENTIALS,
): Promise<string> {
    const creds = TEST_CREDENTIALS[role];
    const res = await request(httpServer)
        .post('/auth/login')
        .send(creds)
        .expect(200);

    const token: string = res.body?.accessToken;
    if (!token) {
        throw new Error(`Login failed for ${role}: ${JSON.stringify(res.body)}`);
    }
    return token;
}

export function bearerHeader(token: string): Record<string, string> {
    return { Authorization: `Bearer ${token}` };
}
