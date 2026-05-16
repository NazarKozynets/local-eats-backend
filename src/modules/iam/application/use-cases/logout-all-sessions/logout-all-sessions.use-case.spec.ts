import {LogoutAllSessionsUseCase} from "./logout-all-sessions.use-case";
import {LogoutAllSessionsCommand} from "./logout-all-sessions.command";
import {createMockSessionRepository} from "../../../__tests__/_helpers/mocks";
import {TEST_USER_ID} from "../../../__tests__/_helpers/builders";

describe("LogoutAllSessionsUseCase", () => {
    let sessionRepository: ReturnType<typeof createMockSessionRepository>;
    let useCase: LogoutAllSessionsUseCase;

    beforeEach(() => {
        sessionRepository = createMockSessionRepository();
        useCase = new LogoutAllSessionsUseCase(sessionRepository);
    });

    it("revokes all sessions for the user", async () => {
        const result = await useCase.execute(
            LogoutAllSessionsCommand.create({userId: TEST_USER_ID}),
        );

        expect(sessionRepository.revokeAllByUserId).toHaveBeenCalledWith(
            TEST_USER_ID,
            expect.any(Date),
        );
        expect(result).toEqual({success: true});
    });
});
