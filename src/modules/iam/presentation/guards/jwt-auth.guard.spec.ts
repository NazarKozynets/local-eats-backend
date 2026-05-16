import {ExecutionContext, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {JwtAuthGuard} from "./jwt-auth.guard";

type MockRequest = {
    headers: Record<string, string | undefined>;
    user?: unknown;
};

const buildContext = (request: MockRequest): ExecutionContext =>
    ({
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => ({}),
            getNext: () => ({}),
        }),
    }) as unknown as ExecutionContext;

describe("JwtAuthGuard", () => {
    let jwtService: jest.Mocked<Pick<JwtService, "verifyAsync">>;
    let guard: JwtAuthGuard;

    beforeEach(() => {
        jwtService = {verifyAsync: jest.fn()};
        guard = new JwtAuthGuard(jwtService as unknown as JwtService);
    });

    it("rejects requests without an Authorization header", async () => {
        const context = buildContext({headers: {}});

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
        expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    });

    it("rejects non-Bearer schemes", async () => {
        const context = buildContext({headers: {authorization: "Basic abc"}});

        await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
            UnauthorizedException,
        );
    });

    it("rejects when JWT payload is missing userId or role", async () => {
        jwtService.verifyAsync.mockResolvedValue({sub: undefined, role: undefined});
        const context = buildContext({
            headers: {authorization: "Bearer token"},
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
            "Invalid access token",
        );
    });

    it("populates request.user from a valid token (sub fallback)", async () => {
        jwtService.verifyAsync.mockResolvedValue({sub: "user-1", role: "CUSTOMER"});
        const request: MockRequest = {headers: {authorization: "Bearer token"}};
        const context = buildContext(request);

        await expect(guard.canActivate(context)).resolves.toBe(true);
        expect(request.user).toEqual({userId: "user-1", role: "CUSTOMER"});
    });

    it("prefers userId over sub when both are present", async () => {
        jwtService.verifyAsync.mockResolvedValue({
            sub: "fallback",
            userId: "user-explicit",
            role: "ADMIN",
        });
        const request: MockRequest = {headers: {authorization: "Bearer token"}};
        const context = buildContext(request);

        await guard.canActivate(context);
        expect(request.user).toEqual({userId: "user-explicit", role: "ADMIN"});
    });
});
