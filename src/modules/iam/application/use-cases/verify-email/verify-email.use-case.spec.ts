import {VerifyEmailUseCase} from "./verify-email.use-case";
import {VerifyEmailCommand} from "./verify-email.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {
    buildPhone,
    buildUser,
    TEST_USER_ID,
} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("VerifyEmailUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: VerifyEmailUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new VerifyEmailUseCase(userRepository);
    });

    it("marks the email as verified and persists the user", async () => {
        const user = buildUser();
        userRepository.findById.mockResolvedValue(user);

        await useCase.execute(VerifyEmailCommand.create({userId: TEST_USER_ID}));

        expect(user.emailVerifiedAt).not.toBeNull();
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(VerifyEmailCommand.create({userId: TEST_USER_ID})),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("propagates domain invariant when user has no email", async () => {
        userRepository.findById.mockResolvedValue(
            buildUser({email: null, phone: buildPhone()}),
        );

        await expect(
            useCase.execute(VerifyEmailCommand.create({userId: TEST_USER_ID})),
        ).rejects.toThrow("User does not have email");
    });
});
