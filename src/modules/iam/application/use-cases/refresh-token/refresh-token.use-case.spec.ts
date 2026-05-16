import {RefreshTokenUseCase} from "./refresh-token.use-case";
import {RefreshTokenCommand} from "./refresh-token.command";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";
import {InvalidCredentialsError} from "../../../../../shared/domain/errors/invalid-credentials.error";
import {buildUser, TEST_USER_ID} from "../../../__tests__/_helpers/builders";
import {
    createMockSessionRepository,
    createMockTokenGenerator,
    createMockTokenHasher,
    createMockUserRepository,
} from "../../../__tests__/_helpers/mocks";

describe("RefreshTokenUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let sessionRepository: ReturnType<typeof createMockSessionRepository>;
    let tokenGenerator: ReturnType<typeof createMockTokenGenerator>;
    let tokenHasher: ReturnType<typeof createMockTokenHasher>;
    let useCase: RefreshTokenUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        sessionRepository = createMockSessionRepository();
        tokenGenerator = createMockTokenGenerator();
        tokenHasher = createMockTokenHasher();
        useCase = new RefreshTokenUseCase(
            sessionRepository,
            userRepository,
            tokenGenerator,
            tokenHasher,
        );
    });

    const command = () =>
        RefreshTokenCommand.create({refreshToken: "current-refresh-token"});

    it("rotates the refresh token and returns new tokens", async () => {
        const user = buildUser();
        sessionRepository.findActiveByRefreshTokenHash.mockResolvedValue({
            id: "session-id",
            userId: user.id.value,
            refreshTokenHash: "current-hash",
            expiresAt: new Date(Date.now() + 60_000),
            revokedAt: null,
        });
        userRepository.findById.mockResolvedValue(user);
        tokenHasher.hash
            .mockReturnValueOnce("current-hash")
            .mockReturnValueOnce("new-hash");
        tokenGenerator.generateAccessToken.mockResolvedValue("new-access");
        tokenGenerator.generateRefreshToken.mockResolvedValue("new-refresh");

        const result = await useCase.execute(command());

        expect(
            sessionRepository.findActiveByRefreshTokenHash,
        ).toHaveBeenCalledWith("current-hash", expect.any(Date));
        expect(sessionRepository.rotateRefreshTokenHash).toHaveBeenCalledWith(
            "current-hash",
            "new-hash",
            expect.any(Date),
            expect.any(Date),
        );
        expect(result.accessToken).toBe("new-access");
        expect(result.refreshToken).toBe("new-refresh");
    });

    it("throws InvalidCredentialsError when session is not active", async () => {
        sessionRepository.findActiveByRefreshTokenHash.mockResolvedValue(null);
        tokenHasher.hash.mockReturnValue("hash");

        await expect(useCase.execute(command())).rejects.toMatchObject({
            code: "INVALID_CREDENTIALS",
            details: {credential: "refresh_token"},
        });

        expect(sessionRepository.rotateRefreshTokenHash).not.toHaveBeenCalled();
    });

    it("throws AccessDeniedError when user no longer exists", async () => {
        sessionRepository.findActiveByRefreshTokenHash.mockResolvedValue({
            id: "session-id",
            userId: TEST_USER_ID,
            refreshTokenHash: "hash",
            expiresAt: new Date(Date.now() + 60_000),
            revokedAt: null,
        });
        userRepository.findById.mockResolvedValue(null);
        tokenHasher.hash.mockReturnValue("hash");

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            AccessDeniedError,
        );
    });

    it("throws AccessDeniedError when user cannot login (deleted)", async () => {
        const deletedUser = buildUser({status: UserStatus.DELETED});
        sessionRepository.findActiveByRefreshTokenHash.mockResolvedValue({
            id: "session-id",
            userId: deletedUser.id.value,
            refreshTokenHash: "hash",
            expiresAt: new Date(Date.now() + 60_000),
            revokedAt: null,
        });
        userRepository.findById.mockResolvedValue(deletedUser);
        tokenHasher.hash.mockReturnValue("hash");

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            AccessDeniedError,
        );
    });
});
