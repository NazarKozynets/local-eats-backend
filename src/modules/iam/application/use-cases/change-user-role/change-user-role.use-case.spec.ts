import {ChangeUserRoleUseCase} from "./change-user-role.use-case";
import {ChangeUserRoleCommand} from "./change-user-role.command";
import {UserRole} from "../../../domain/enums/user-role.enum";
import {UserStatus} from "../../../domain/enums/user-status.enum";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {buildUser, TEST_USER_ID} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("ChangeUserRoleUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: ChangeUserRoleUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new ChangeUserRoleUseCase(userRepository);
    });

    it("changes the user role and persists the change", async () => {
        const user = buildUser({role: UserRole.CUSTOMER});
        userRepository.findById.mockResolvedValue(user);

        await useCase.execute(
            ChangeUserRoleCommand.create({
                userId: TEST_USER_ID,
                role: UserRole.PROVIDER,
            }),
        );

        expect(user.role).toBe(UserRole.PROVIDER);
        expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(
                ChangeUserRoleCommand.create({
                    userId: TEST_USER_ID,
                    role: UserRole.PROVIDER,
                }),
            ),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });

    it("propagates domain invariant violations from the entity", async () => {
        const user = buildUser({status: UserStatus.DELETED});
        userRepository.findById.mockResolvedValue(user);

        await expect(
            useCase.execute(
                ChangeUserRoleCommand.create({
                    userId: TEST_USER_ID,
                    role: UserRole.ADMIN,
                }),
            ),
        ).rejects.toThrow("Deleted user cannot change role");
    });
});
