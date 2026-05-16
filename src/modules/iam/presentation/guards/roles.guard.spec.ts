import {ExecutionContext, ForbiddenException} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {RolesGuard} from "./roles.guard";
import {UserRole} from "../../domain/enums/user-role.enum";

type MockRequest = {user?: {role: string}};

const buildContext = (request: MockRequest): ExecutionContext =>
    ({
        getHandler: () => () => undefined,
        getClass: () => class {},
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => ({}),
            getNext: () => ({}),
        }),
    }) as unknown as ExecutionContext;

describe("RolesGuard", () => {
    let reflector: jest.Mocked<Pick<Reflector, "getAllAndOverride">>;
    let guard: RolesGuard;

    beforeEach(() => {
        reflector = {getAllAndOverride: jest.fn()};
        guard = new RolesGuard(reflector as unknown as Reflector);
    });

    it("allows the request when no roles are required", () => {
        reflector.getAllAndOverride.mockReturnValue(undefined);

        expect(guard.canActivate(buildContext({}))).toBe(true);
    });

    it("allows the request when the user role matches", () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

        expect(
            guard.canActivate(buildContext({user: {role: UserRole.ADMIN}})),
        ).toBe(true);
    });

    it("rejects when the user role does not match", () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

        expect(() =>
            guard.canActivate(buildContext({user: {role: UserRole.CUSTOMER}})),
        ).toThrow(ForbiddenException);
    });

    it("rejects when there is no authenticated user", () => {
        reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);

        expect(() => guard.canActivate(buildContext({}))).toThrow(
            ForbiddenException,
        );
    });
});
