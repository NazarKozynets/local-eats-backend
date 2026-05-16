import {BlockUserUseCase} from "./block-user.use-case";
import {BlockUserCommand} from "./block-user.command";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {buildUser, TEST_USER_ID} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("BlockUserUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: BlockUserUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new BlockUserUseCase(userRepository);
    });

    it("blocks a non-admin user with the provided reason", async () => {
        const user = buildUser();
        userRepository.findById.mockResolvedValue(user);

        await useCase.execute(
            BlockUserCommand.create({
                userId: TEST_USER_ID,
                reason: "fraud",
            }),
        );

        expect(user.status).toBe(UserStatus.BLOCKED);
        expect(user.blockReason).toBe("fraud");
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user does not exist", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(
                BlockUserCommand.create({userId: TEST_USER_ID, reason: "x"}),
            ),
        ).rejects.toBeInstanceOf(UserNotFoundError);

        expect(userRepository.save).not.toHaveBeenCalled();
    });
});
