import {RequestEmailVerificationUseCase} from "./request-email-verification.use-case";
import {RequestEmailVerificationCommand} from "./request-email-verification.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {
    buildPhone,
    buildUser,
    TEST_USER_ID,
} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("RequestEmailVerificationUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: RequestEmailVerificationUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new RequestEmailVerificationUseCase(userRepository);
    });

    it("returns success when the user has an email", async () => {
        userRepository.findById.mockResolvedValue(buildUser());

        await expect(
            useCase.execute(
                RequestEmailVerificationCommand.create({userId: TEST_USER_ID}),
            ),
        ).resolves.toEqual({success: true});
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(
                RequestEmailVerificationCommand.create({userId: TEST_USER_ID}),
            ),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("throws UserNotFoundError(field: email) when user has no email", async () => {
        userRepository.findById.mockResolvedValue(
            buildUser({email: null, phone: buildPhone()}),
        );

        await expect(
            useCase.execute(
                RequestEmailVerificationCommand.create({userId: TEST_USER_ID}),
            ),
        ).rejects.toMatchObject({
            code: "USER_NOT_FOUND",
            details: {field: "email"},
        });
    });
});
