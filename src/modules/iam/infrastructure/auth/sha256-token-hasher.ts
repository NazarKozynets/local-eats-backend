import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import type { TokenHasher } from '../../application/services/token-hasher.port';

@Injectable()
export class Sha256TokenHasher implements TokenHasher {
    hash(token: string): string {
        return createHash('sha256')
            .update(token)
            .digest('hex');
    }
}