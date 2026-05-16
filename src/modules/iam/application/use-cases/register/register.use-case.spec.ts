import {RegisterUseCase} from "./register.use-case";
import {RegisterCommand} from "./register.command";
import {Account} from "../../../domain/entities/account.entity";
import {UserRole} from "../../../domain/enums/user-role.enum";
import {UserAlreadyExistsError} from "../../../../../shared/domain/errors/user-already-exists.error";
import {
    buildPhone,
    buildUser,
    TEST_BCRYPT_HASH,
    TEST_EMAIL,
    TEST_PHONE,
} from "../../../__tests__/_helpers/builders";
import {
    createMockPasswordHasher,
    createMockUserRepository,
} from "../../../__tests__/_helpers/mocks";

describe("RegisterUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let passwordHasher: ReturnType<typeof createMockPasswordHasher>;
    let useCase: RegisterUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        passwordHasher = createMockPasswordHasher();
        useCase = new RegisterUseCase(userRepository, passwordHasher);
    });

    it("registers a customer using email", async () => {
        // Arrange
        userRepository.findByEmail.mockResolvedValue(null);
        passwordHasher.hash.mockResolvedValue(TEST_BCRYPT_HASH);

        // Act
        await useCase.execute(
            RegisterCommand.create({
                email: TEST_EMAIL,
                password: "plain-password",
            }),
        );

        // Assert
        expect(passwordHasher.hash).toHaveBeenCalledWith("plain-password");
        expect(userRepository.save).toHaveBeenCalledTimes(1);

        const [savedUser] = userRepository.save.mock.calls[0] as [Account];
        expect(savedUser.email?.value).toBe(TEST_EMAIL);
        expect(savedUser.phone).toBeNull();
        expect(savedUser.passwordHash?.value).toBe(TEST_BCRYPT_HASH);
        expect(savedUser.role).toBe(UserRole.CUSTOMER);
    });

    it("registers a customer using phone only", async () => {
        userRepository.findByPhoneNumber.mockResolvedValue(null);
        passwordHasher.hash.mockResolvedValue(TEST_BCRYPT_HASH);

        await useCase.execute(
            RegisterCommand.create({
                phone: TEST_PHONE,
                password: "plain-password",
            }),
        );

        expect(userRepository.findByEmail).not.toHaveBeenCalled();
        expect(userRepository.findByPhoneNumber).toHaveBeenCalledTimes(1);

        const [savedUser] = userRepository.save.mock.calls[0] as [Account];
        expect(savedUser.email).toBeNull();
        expect(savedUser.phone?.value).toBe(TEST_PHONE);
    });

    it("throws UserAlreadyExistsError when email is taken", async () => {
        userRepository.findByEmail.mockResolvedValue(buildUser());

        await expect(
            useCase.execute(
                RegisterCommand.create({
                    email: TEST_EMAIL,
                    password: "plain-password",
                }),
            ),
        ).rejects.toMatchObject({
            code: "USER_ALREADY_EXISTS",
            details: {field: "email"},
        });

        expect(passwordHasher.hash).not.toHaveBeenCalled();
        expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("throws UserAlreadyExistsError when phone is taken", async () => {
        userRepository.findByPhoneNumber.mockResolvedValue(
            buildUser({email: null, phone: buildPhone()}),
        );

        await expect(
            useCase.execute(
                RegisterCommand.create({
                    phone: TEST_PHONE,
                    password: "plain-password",
                }),
            ),
        ).rejects.toBeInstanceOf(UserAlreadyExistsError);
    });

    it("checks phone uniqueness only after email passes", async () => {
        userRepository.findByEmail.mockResolvedValue(null);
        userRepository.findByPhoneNumber.mockResolvedValue(null);
        passwordHasher.hash.mockResolvedValue(TEST_BCRYPT_HASH);

        await useCase.execute(
            RegisterCommand.create({
                email: TEST_EMAIL,
                phone: TEST_PHONE,
                password: "plain-password",
            }),
        );

        expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(userRepository.findByPhoneNumber).toHaveBeenCalledTimes(1);
        expect(userRepository.save).toHaveBeenCalledTimes(1);
    });
});
