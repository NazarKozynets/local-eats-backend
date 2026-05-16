import {VerifyPhoneUseCase} from "./verify-phone.use-case";
import {VerifyPhoneCommand} from "./verify-phone.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {
    buildPhone,
    buildUser,
    TEST_USER_ID,
} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("VerifyPhoneUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: VerifyPhoneUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new VerifyPhoneUseCase(userRepository);
    });

    it("marks the phone as verified and persists the user", async () => {
        const user = buildUser({phone: buildPhone()});
        userRepository.findById.mockResolvedValue(user);

        await useCase.execute(VerifyPhoneCommand.create({userId: TEST_USER_ID}));

        expect(user.phoneVerifiedAt).not.toBeNull();
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(VerifyPhoneCommand.create({userId: TEST_USER_ID})),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("propagates domain invariant when user has no phone", async () => {
        userRepository.findById.mockResolvedValue(buildUser({phone: null}));

        await expect(
            useCase.execute(VerifyPhoneCommand.create({userId: TEST_USER_ID})),
        ).rejects.toThrow("User does not have phone number");
    });
});
