import {LoginWithAppleUseCase} from "./login-with-apple.use-case";
import {LoginWithAppleCommand} from "./login-with-apple.command";
import {Account} from "../../../domain/entities/account.entity";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";
import {buildUser, TEST_EMAIL} from "../../../__tests__/_helpers/builders";
import {
    createMockSessionRepository,
    createMockTokenGenerator,
    createMockTokenHasher,
    createMockUserRepository,
} from "../../../__tests__/_helpers/mocks";

describe("LoginWithAppleUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let sessionRepository: ReturnType<typeof createMockSessionRepository>;
    let tokenGenerator: ReturnType<typeof createMockTokenGenerator>;
    let tokenHasher: ReturnType<typeof createMockTokenHasher>;
    let useCase: LoginWithAppleUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        sessionRepository = createMockSessionRepository();
        tokenGenerator = createMockTokenGenerator();
        tokenHasher = createMockTokenHasher();
        useCase = new LoginWithAppleUseCase(
            userRepository,
            sessionRepository,
            tokenGenerator,
            tokenHasher,
        );

        tokenGenerator.generateAccessToken.mockResolvedValue("access");
        tokenGenerator.generateRefreshToken.mockResolvedValue("refresh");
        tokenHasher.hash.mockReturnValue("hash");
    });

    const command = () =>
        LoginWithAppleCommand.create({
            email: TEST_EMAIL,
            userAgent: "jest",
            ipAddress: "127.0.0.1",
            deviceName: "device",
        });

    it("creates a new verified user when email is unknown", async () => {
        userRepository.findByEmail.mockResolvedValue(null);

        await useCase.execute(command());

        expect(userRepository.save).toHaveBeenCalledTimes(1);
        const [savedUser] = userRepository.save.mock.calls[0] as [Account];
        expect(savedUser.emailVerifiedAt).not.toBeNull();
    });

    it("does not recreate an existing user", async () => {
        userRepository.findByEmail.mockResolvedValue(buildUser());

        await useCase.execute(command());

        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("throws AccessDeniedError for blocked users without a deadline", async () => {
        userRepository.findByEmail.mockResolvedValue(
            buildUser({status: UserStatus.BLOCKED}),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            AccessDeniedError,
        );
    });
});
