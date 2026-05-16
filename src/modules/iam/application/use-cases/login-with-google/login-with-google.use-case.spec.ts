import {LoginWithGoogleUseCase} from "./login-with-google.use-case";
import {LoginWithGoogleCommand} from "./login-with-google.command";
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

describe("LoginWithGoogleUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let sessionRepository: ReturnType<typeof createMockSessionRepository>;
    let tokenGenerator: ReturnType<typeof createMockTokenGenerator>;
    let tokenHasher: ReturnType<typeof createMockTokenHasher>;
    let useCase: LoginWithGoogleUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        sessionRepository = createMockSessionRepository();
        tokenGenerator = createMockTokenGenerator();
        tokenHasher = createMockTokenHasher();
        useCase = new LoginWithGoogleUseCase(
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
        LoginWithGoogleCommand.create({
            email: TEST_EMAIL,
            userAgent: "jest",
            ipAddress: "127.0.0.1",
            deviceName: "device",
        });

    it("creates a new verified user and issues tokens when email is unknown", async () => {
        userRepository.findByEmail.mockResolvedValue(null);

        const result = await useCase.execute(command());

        expect(userRepository.save).toHaveBeenCalledTimes(1);
        const [savedUser] = userRepository.save.mock.calls[0] as [Account];
        expect(savedUser.email?.value).toBe(TEST_EMAIL);
        expect(savedUser.emailVerifiedAt).not.toBeNull();
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
        expect(result.accessToken).toBe("access");
        expect(result.refreshToken).toBe("refresh");
    });

    it("logs in an existing user without recreating it", async () => {
        const user = buildUser();
        userRepository.findByEmail.mockResolvedValue(user);

        await useCase.execute(command());

        expect(userRepository.save).not.toHaveBeenCalled();
        expect(sessionRepository.create).toHaveBeenCalledTimes(1);
    });

    it("throws AccessDeniedError when user cannot login", async () => {
        userRepository.findByEmail.mockResolvedValue(
            buildUser({status: UserStatus.DELETED}),
        );

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            AccessDeniedError,
        );
        expect(sessionRepository.create).not.toHaveBeenCalled();
    });
});
