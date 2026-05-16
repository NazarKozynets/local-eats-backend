import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import type {Request} from "express";
import type {AuthUser} from "../types/auth-user.type";

type JwtPayload = {
    sub?: string;
    userId?: string;
    role?: string;
};

type AuthenticatedRequest = Request & {
    user?: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const token = this.extractBearerToken(request);

        if (!token) {
            throw new UnauthorizedException('Missing access token');
        }

        const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
        const userId = payload.userId ?? payload.sub;

        if (!userId || !payload.role) {
            throw new UnauthorizedException('Invalid access token');
        }

        request.user = {
            userId,
            role: payload.role,
        };

        return true;
    }

    private extractBearerToken(request: Request): string | null {
        const authorization = request.headers.authorization;

        if (!authorization) {
            return null;
        }

        const [type, token] = authorization.split(' ');

        return type === 'Bearer' && token ? token : null;
    }
}
