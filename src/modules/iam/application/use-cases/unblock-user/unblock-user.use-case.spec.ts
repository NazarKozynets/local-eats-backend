import {UnblockUserUseCase} from "./unblock-user.use-case";
import {UnblockUserCommand} from "./unblock-user.command";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {buildUser, TEST_USER_ID} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("UnblockUserUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: UnblockUserUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new UnblockUserUseCase(userRepository);
    });

    it("restores a blocked user to ACTIVE", async () => {
        const user = buildUser({status: UserStatus.BLOCKED, blockReason: "fraud"});
        userRepository.findById.mockResolvedValue(user);

        await useCase.execute(UnblockUserCommand.create({userId: TEST_USER_ID}));

        expect(user.status).toBe(UserStatus.ACTIVE);
        expect(user.blockReason).toBeNull();
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user does not exist", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(UnblockUserCommand.create({userId: TEST_USER_ID})),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });
});
