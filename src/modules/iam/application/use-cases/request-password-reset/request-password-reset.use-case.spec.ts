import {RequestPasswordResetUseCase} from "./request-password-reset.use-case";
import {RequestPasswordResetCommand} from "./request-password-reset.command";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";
import {
    buildUser,
    TEST_EMAIL,
    TEST_PHONE,
} from "../../../__tests__/_helpers/builders";

describe("RequestPasswordResetUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: RequestPasswordResetUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new RequestPasswordResetUseCase(userRepository);
    });

    it("looks up the user by email", async () => {
        userRepository.findByEmail.mockResolvedValue(buildUser());

        const result = await useCase.execute(
            RequestPasswordResetCommand.create({identifier: TEST_EMAIL}),
        );

        expect(userRepository.findByEmail).toHaveBeenCalledTimes(1);
        expect(userRepository.findByPhoneNumber).not.toHaveBeenCalled();
        expect(result).toEqual({success: true});
    });

    it("looks up the user by phone number", async () => {
        userRepository.findByPhoneNumber.mockResolvedValue(null);

        const result = await useCase.execute(
            RequestPasswordResetCommand.create({identifier: TEST_PHONE}),
        );

        expect(userRepository.findByPhoneNumber).toHaveBeenCalledTimes(1);
        expect(userRepository.findByEmail).not.toHaveBeenCalled();
        expect(result).toEqual({success: true});
    });

    it("returns success even when no user exists (no enumeration)", async () => {
        userRepository.findByEmail.mockResolvedValue(null);

        await expect(
            useCase.execute(
                RequestPasswordResetCommand.create({identifier: TEST_EMAIL}),
            ),
        ).resolves.toEqual({success: true});
    });
});
