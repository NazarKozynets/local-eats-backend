import { Injectable } from '@nestjs/common';
import type { OrderPublicCodeGenerator } from '../../application/ports/order-public-code-generator.port';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

@Injectable()
export class DefaultOrderPublicCodeGenerator implements OrderPublicCodeGenerator {
    generate(): string {
        let code = 'LC-';
        for (let i = 0; i < 8; i++) {
            code += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        return code;
    }
}
