import {LogoutUseCase} from "./logout.use-case";
import {LogoutCommand} from "./logout.command";
import {
    createMockSessionRepository,
    createMockTokenHasher,
} from "../../../__tests__/_helpers/mocks";

describe("LogoutUseCase", () => {
    let sessionRepository: ReturnType<typeof createMockSessionRepository>;
    let tokenHasher: ReturnType<typeof createMockTokenHasher>;
    let useCase: LogoutUseCase;

    beforeEach(() => {
        sessionRepository = createMockSessionRepository();
        tokenHasher = createMockTokenHasher();
        useCase = new LogoutUseCase(sessionRepository, tokenHasher);
    });

    it("revokes the session matching the hashed refresh token", async () => {
        tokenHasher.hash.mockReturnValue("hashed");

        const result = await useCase.execute(
            LogoutCommand.create({refreshToken: "refresh"}),
        );

        expect(tokenHasher.hash).toHaveBeenCalledWith("refresh");
        expect(sessionRepository.revokeByRefreshTokenHash).toHaveBeenCalledWith(
            "hashed",
            expect.any(Date),
        );
        expect(result).toEqual({success: true});
    });

    it("is idempotent: succeeds even if no session matches", async () => {
        tokenHasher.hash.mockReturnValue("hashed");
        sessionRepository.revokeByRefreshTokenHash.mockResolvedValue();

        await expect(
            useCase.execute(LogoutCommand.create({refreshToken: "refresh"})),
        ).resolves.toEqual({success: true});
    });
});
