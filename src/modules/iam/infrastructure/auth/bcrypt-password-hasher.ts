import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import type { PasswordHasher } from '../../application/services/password-hasher.port';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds = 10;

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(password: string, passwordHash: string): Promise<boolean> {
        return bcrypt.compare(password, passwordHash);
    }
}