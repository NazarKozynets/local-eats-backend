import {ResetPasswordUseCase} from "./reset-password.use-case";
import {ResetPasswordCommand} from "./reset-password.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {
    buildUser,
    TEST_BCRYPT_HASH,
    TEST_USER_ID,
} from "../../../__tests__/_helpers/builders";
import {
    createMockPasswordHasher,
    createMockUserRepository,
} from "../../../__tests__/_helpers/mocks";

describe("ResetPasswordUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let passwordHasher: ReturnType<typeof createMockPasswordHasher>;
    let useCase: ResetPasswordUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        passwordHasher = createMockPasswordHasher();
        useCase = new ResetPasswordUseCase(userRepository, passwordHasher);
    });

    const command = () =>
        ResetPasswordCommand.create({
            userId: TEST_USER_ID,
            newPassword: "next-password",
        });

    it("hashes the new password and persists the user", async () => {
        const user = buildUser();
        userRepository.findById.mockResolvedValue(user);
        passwordHasher.hash.mockResolvedValue(TEST_BCRYPT_HASH);

        await useCase.execute(command());

        expect(passwordHasher.hash).toHaveBeenCalledWith("next-password");
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            UserNotFoundError,
        );
        expect(passwordHasher.hash).not.toHaveBeenCalled();
    });
});
