import {LoginWithPasswordUseCase} from "./login-with-password.use-case";
import {LoginWithPasswordCommand} from "./login-with-password.command";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";
import {InvalidCredentialsError} from "../../../../../shared/domain/errors/invalid-credentials.error";
import {
    buildPhone,
    buildUser,
    TEST_EMAIL,
    TEST_PHONE,
} from "../../../__tests__/_helpers/builders";
import {
    createMockPasswordHasher,
    createMockSessionRepository,
    createMockTokenGenerator,
    createMockTokenHasher,
    createMockUserRepository,
} from "../../../__tests__/_helpers/mocks";

describe("LoginWithPasswordUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let sessionRepository: ReturnType<typeof createMockSessionRepository>;
    let tokenGenerator: ReturnType<typeof createMockTokenGenerator>;
    let passwordHasher: ReturnType<typeof createMockPasswordHasher>;
    let tokenHasher: ReturnType<typeof createMockTokenHasher>;
    let useCase: LoginWithPasswordUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        sessionRepository = createMockSessionRepository();
        tokenGenerator = createMockTokenGenerator();
        passwordHasher = createMockPasswordHasher();
        tokenHasher = createMockTokenHasher();
        useCase = new LoginWithPasswordUseCase(
            userRepository,
            tokenGenerator,
            passwordHasher,
            tokenHasher,
            sessionRepository,
        );
    });

    const validCommand = (identifier: string = TEST_EMAIL) =>
        LoginWithPasswordCommand.create({
            identifier,
            password: "plain-password",
            userAgent: "jest",
            ipAddress: "127.0.0.1",
            deviceName: "test-device",
        });

    it("authenticates user by email, persists a session and returns tokens", async () => {
        const user = buildUser();
        userRepository.findByEmail.mockResolvedValue(user);
        passwordHasher.compare.mockResolvedValue(true);
        tokenGenerator.generateAccessToken.mockResolvedValue("access-token");
        tokenGenerator.generateRefreshToken.mockResolvedValue("refresh-token");
        tokenHasher.hash.mockReturnValue("refresh-token-hash");

        const result = await useCase.execute(validCommand());

        expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(passwordHasher.compare).toHaveBeenCalledWith(
            "plain-password",
            user.passwordHash!.value,
        );
        expect(tokenHasher.hash).toHaveBeenCalledWith("refresh-token");
        expect(sessionRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: user.id.value,
                refreshTokenHash: "refresh-token-hash",
                userAgent: "jest",
                ipAddress: "127.0.0.1",
                deviceName: "test-device",
                expiresAt: expect.any(Date),
            }),
        );
        expect(result).toEqual({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: {
                id: user.id.value,
                email: user.email?.value ?? null,
                phone: null,
                role: user.role,
                status: user.status,
            },
        });
    });

    it("authenticates user by phone identifier", async () => {
        const user = buildUser({email: null, phone: buildPhone()});
        userRepository.findByPhoneNumber.mockResolvedValue(user);
        passwordHasher.compare.mockResolvedValue(true);
        tokenGenerator.generateAccessToken.mockResolvedValue("access");
        tokenGenerator.generateRefreshToken.mockResolvedValue("refresh");
        tokenHasher.hash.mockReturnValue("hash");

        await useCase.execute(validCommand(TEST_PHONE));

        expect(userRepository.findByPhoneNumber).toHaveBeenCalledTimes(1);
        expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("throws InvalidCredentialsError when user does not exist", async () => {
        userRepository.findByEmail.mockResolvedValue(null);

        await expect(useCase.execute(validCommand())).rejects.toBeInstanceOf(
            InvalidCredentialsError,
        );
        expect(passwordHasher.compare).not.toHaveBeenCalled();
    });

    it("throws AccessDeniedError(password_login_disabled) when user has no password hash", async () => {
        userRepository.findByEmail.mockResolvedValue(
            buildUser({passwordHash: null}),
        );

        await expect(useCase.execute(validCommand())).rejects.toMatchObject({
            code: "ACCESS_DENIED",
            details: {reason: "password_login_disabled"},
        });
    });

    it("throws AccessDeniedError(user_blocked) when user is blocked", async () => {
        userRepository.findByEmail.mockResolvedValue(
            buildUser({status: UserStatus.BLOCKED}),
        );

        await expect(useCase.execute(validCommand())).rejects.toMatchObject({
            code: "ACCESS_DENIED",
            details: {reason: "user_blocked"},
        });
    });

    it("throws AccessDeniedError(user_deleted) when user is deleted", async () => {
        userRepository.findByEmail.mockResolvedValue(
            buildUser({status: UserStatus.DELETED}),
        );

        await expect(useCase.execute(validCommand())).rejects.toMatchObject({
            code: "ACCESS_DENIED",
            details: {reason: "user_deleted"},
        });
    });

    it("throws InvalidCredentialsError when password is wrong", async () => {
        userRepository.findByEmail.mockResolvedValue(buildUser());
        passwordHasher.compare.mockResolvedValue(false);

        await expect(useCase.execute(validCommand())).rejects.toBeInstanceOf(
            InvalidCredentialsError,
        );
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it("creates a session with expiresAt in the future", async () => {
        userRepository.findByEmail.mockResolvedValue(buildUser());
        passwordHasher.compare.mockResolvedValue(true);
        tokenGenerator.generateAccessToken.mockResolvedValue("a");
        tokenGenerator.generateRefreshToken.mockResolvedValue("r");
        tokenHasher.hash.mockReturnValue("h");

        await useCase.execute(validCommand());

        const [props] = sessionRepository.create.mock.calls[0];
        expect(props.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });
});
