import {RequestPhoneVerificationUseCase} from "./request-phone-verification.use-case";
import {RequestPhoneVerificationCommand} from "./request-phone-verification.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {
    buildPhone,
    buildUser,
    TEST_USER_ID,
} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("RequestPhoneVerificationUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: RequestPhoneVerificationUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new RequestPhoneVerificationUseCase(userRepository);
    });

    it("returns success when the user has a phone", async () => {
        userRepository.findById.mockResolvedValue(buildUser({phone: buildPhone()}));

        await expect(
            useCase.execute(
                RequestPhoneVerificationCommand.create({userId: TEST_USER_ID}),
            ),
        ).resolves.toEqual({success: true});
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(
                RequestPhoneVerificationCommand.create({userId: TEST_USER_ID}),
            ),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("throws UserNotFoundError(field: phone) when user has no phone", async () => {
        userRepository.findById.mockResolvedValue(buildUser({phone: null}));

        await expect(
            useCase.execute(
                RequestPhoneVerificationCommand.create({userId: TEST_USER_ID}),
            ),
        ).rejects.toMatchObject({
            code: "USER_NOT_FOUND",
            details: {field: "phone"},
        });
    });
});
