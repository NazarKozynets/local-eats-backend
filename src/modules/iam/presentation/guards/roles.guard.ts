import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import type {Request} from "express";
import {ROLES_KEY} from "../decorators/roles.decorator";
import type {AuthUser} from "../types/auth-user.type";
import type {UserRole} from "../../domain/enums/user-role.enum";

type AuthenticatedRequest = Request & {
    user?: AuthUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles?.length) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const userRole = request.user?.role;

        if (!userRole || !requiredRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('Insufficient permissions');
        }

        return true;
    }
}
