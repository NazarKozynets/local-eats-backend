import {DeleteUserUseCase} from "./delete-user.use-case";
import {DeleteUserCommand} from "./delete-user.command";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {buildUser, TEST_USER_ID} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("DeleteUserUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: DeleteUserUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new DeleteUserUseCase(userRepository);
    });

    it("marks a user as deleted", async () => {
        const user = buildUser();
        userRepository.findById.mockResolvedValue(user);

        await useCase.execute(DeleteUserCommand.create({userId: TEST_USER_ID}));

        expect(user.status).toBe(UserStatus.DELETED);
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(DeleteUserCommand.create({userId: TEST_USER_ID})),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });
});
