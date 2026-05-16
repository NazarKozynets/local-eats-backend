import {ChangePasswordUseCase} from "./change-password.use-case";
import {ChangePasswordCommand} from "./change-password.command";
import {AccessDeniedError} from "../../../../../shared/domain/errors/access-denied.error";
import {InvalidCredentialsError} from "../../../../../shared/domain/errors/invalid-credentials.error";
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

describe("ChangePasswordUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let passwordHasher: ReturnType<typeof createMockPasswordHasher>;
    let useCase: ChangePasswordUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        passwordHasher = createMockPasswordHasher();
        useCase = new ChangePasswordUseCase(userRepository, passwordHasher);
    });

    const command = () =>
        ChangePasswordCommand.create({
            userId: TEST_USER_ID,
            currentPassword: "current",
            newPassword: "next-password",
        });

    it("updates the password when the current one matches", async () => {
        const user = buildUser();
        userRepository.findById.mockResolvedValue(user);
        passwordHasher.compare.mockResolvedValue(true);
        passwordHasher.hash.mockResolvedValue(TEST_BCRYPT_HASH);

        await useCase.execute(command());

        expect(passwordHasher.compare).toHaveBeenCalledWith(
            "current",
            user.passwordHash!.value,
        );
        expect(passwordHasher.hash).toHaveBeenCalledWith("next-password");
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            UserNotFoundError,
        );
    });

    it("throws AccessDeniedError(password_login_disabled) when user has no password hash", async () => {
        userRepository.findById.mockResolvedValue(buildUser({passwordHash: null}));

        await expect(useCase.execute(command())).rejects.toMatchObject({
            code: "ACCESS_DENIED",
            details: {reason: "password_login_disabled"},
        });
    });

    it("throws InvalidCredentialsError when current password does not match", async () => {
        userRepository.findById.mockResolvedValue(buildUser());
        passwordHasher.compare.mockResolvedValue(false);

        await expect(useCase.execute(command())).rejects.toBeInstanceOf(
            InvalidCredentialsError,
        );
        expect(passwordHasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });
});
