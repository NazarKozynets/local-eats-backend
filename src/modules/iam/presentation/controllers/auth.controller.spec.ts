import type {Request} from "express";
import {AuthController} from "./auth.controller";
import {RegisterUseCase} from "../../application/use-cases/register/register.use-case";
import {LoginWithPasswordUseCase} from "../../application/use-cases/login-with-password/login-with-password.use-case";
import {LoginWithGoogleUseCase} from "../../application/use-cases/login-with-google/login-with-google.use-case";
import {LoginWithAppleUseCase} from "../../application/use-cases/login-with-apple/login-with-apple.use-case";
import {RefreshTokenUseCase} from "../../application/use-cases/refresh-token/refresh-token.use-case";
import {LogoutUseCase} from "../../application/use-cases/logout/logout.use-case";
import {RequestPasswordResetUseCase} from "../../application/use-cases/request-password-reset/request-password-reset.use-case";
import {ResetPasswordUseCase} from "../../application/use-cases/reset-password/reset-password.use-case";

const createUseCaseMock = <T extends {execute: (...args: unknown[]) => unknown}>() =>
    ({execute: jest.fn()}) as unknown as jest.Mocked<T>;

const buildRequest = (overrides: Partial<Request> = {}): Request =>
    ({
        headers: {"user-agent": "jest"},
        ip: "127.0.0.1",
        ...overrides,
    }) as unknown as Request;

describe("AuthController", () => {
    let registerUseCase: jest.Mocked<RegisterUseCase>;
    let loginWithPasswordUseCase: jest.Mocked<LoginWithPasswordUseCase>;
    let loginWithGoogleUseCase: jest.Mocked<LoginWithGoogleUseCase>;
    let loginWithAppleUseCase: jest.Mocked<LoginWithAppleUseCase>;
    let refreshTokenUseCase: jest.Mocked<RefreshTokenUseCase>;
    let logoutUseCase: jest.Mocked<LogoutUseCase>;
    let requestPasswordResetUseCase: jest.Mocked<RequestPasswordResetUseCase>;
    let resetPasswordUseCase: jest.Mocked<ResetPasswordUseCase>;
    let controller: AuthController;

    beforeEach(() => {
        registerUseCase = createUseCaseMock<RegisterUseCase>();
        loginWithPasswordUseCase = createUseCaseMock<LoginWithPasswordUseCase>();
        loginWithGoogleUseCase = createUseCaseMock<LoginWithGoogleUseCase>();
        loginWithAppleUseCase = createUseCaseMock<LoginWithAppleUseCase>();
        refreshTokenUseCase = createUseCaseMock<RefreshTokenUseCase>();
        logoutUseCase = createUseCaseMock<LogoutUseCase>();
        requestPasswordResetUseCase = createUseCaseMock<RequestPasswordResetUseCase>();
        resetPasswordUseCase = createUseCaseMock<ResetPasswordUseCase>();

        controller = new AuthController(
            registerUseCase,
            loginWithPasswordUseCase,
            loginWithGoogleUseCase,
            loginWithAppleUseCase,
            refreshTokenUseCase,
            logoutUseCase,
            requestPasswordResetUseCase,
            resetPasswordUseCase,
        );
    });

    it("delegates register to RegisterUseCase with the normalized command", async () => {
        await controller.register({
            email: "User@Example.com",
            phone: null,
            password: "secret",
        } as never);

        expect(registerUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "user@example.com",
                password: "secret",
            }),
        );
    });

    it("delegates loginWithPassword and forwards request context", async () => {
        await controller.loginWithPassword(
            {
                identifier: "User@Example.com",
                password: "secret",
                deviceName: "phone",
            } as never,
            buildRequest(),
        );

        expect(loginWithPasswordUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                identifier: "user@example.com",
                password: "secret",
                userAgent: "jest",
                ipAddress: "127.0.0.1",
                deviceName: "phone",
            }),
        );
    });

    it("delegates loginWithGoogle", async () => {
        await controller.loginWithGoogle(
            {email: "user@example.com", deviceName: null} as never,
            buildRequest(),
        );

        expect(loginWithGoogleUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("delegates loginWithApple", async () => {
        await controller.loginWithApple(
            {email: "user@example.com", deviceName: null} as never,
            buildRequest(),
        );

        expect(loginWithAppleUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("delegates refreshToken", async () => {
        await controller.refreshToken({refreshToken: "abc"} as never);

        expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({refreshToken: "abc"}),
        );
    });

    it("delegates logout", async () => {
        await controller.logout({refreshToken: "abc"} as never);

        expect(logoutUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("delegates requestPasswordReset", async () => {
        await controller.requestPasswordReset({
            identifier: "user@example.com",
        } as never);

        expect(requestPasswordResetUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it("delegates resetPassword", async () => {
        await controller.resetPassword({
            userId: "550e8400-e29b-41d4-a716-446655440000",
            newPassword: "secret",
        } as never);

        expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: "550e8400-e29b-41d4-a716-446655440000",
                newPassword: "secret",
            }),
        );
    });
});
