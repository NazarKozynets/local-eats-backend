import {AdminIamController} from "./admin-iam.controller";
import {BlockUserUseCase} from "../../application/use-cases/block-user/block-user.use-case";
import {UnblockUserUseCase} from "../../application/use-cases/unblock-user/unblock-user.use-case";
import {ChangeUserRoleUseCase} from "../../application/use-cases/change-user-role/change-user-role.use-case";
import {DeleteUserUseCase} from "../../application/use-cases/delete-user/delete-user.use-case";
import {UserRole} from "../../domain/enums/user-role.enum";
import {TEST_USER_ID} from "../../__tests__/_helpers/builders";

const createUseCaseMock = <T extends {execute: (...args: unknown[]) => unknown}>() =>
    ({execute: jest.fn()}) as unknown as jest.Mocked<T>;

describe("AdminIamController", () => {
    let blockUserUseCase: jest.Mocked<BlockUserUseCase>;
    let unblockUserUseCase: jest.Mocked<UnblockUserUseCase>;
    let changeUserRoleUseCase: jest.Mocked<ChangeUserRoleUseCase>;
    let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;
    let controller: AdminIamController;

    beforeEach(() => {
        blockUserUseCase = createUseCaseMock<BlockUserUseCase>();
        unblockUserUseCase = createUseCaseMock<UnblockUserUseCase>();
        changeUserRoleUseCase = createUseCaseMock<ChangeUserRoleUseCase>();
        deleteUserUseCase = createUseCaseMock<DeleteUserUseCase>();

        controller = new AdminIamController(
            blockUserUseCase,
            unblockUserUseCase,
            changeUserRoleUseCase,
            deleteUserUseCase,
        );
    });

    it("blockUser() builds the command from path param and body", async () => {
        await controller.blockUser(TEST_USER_ID, {
            reason: "fraud",
            blockedUntil: "2026-01-01T00:00:00.000Z",
        } as never);

        expect(blockUserUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: TEST_USER_ID,
                reason: "fraud",
                blockedUntil: expect.any(Date),
            }),
        );
    });

    it("blockUser() passes blockedUntil = null when DTO field is missing", async () => {
        await controller.blockUser(TEST_USER_ID, {reason: "fraud"} as never);

        const [command] = blockUserUseCase.execute.mock.calls[0] as [
            {blockedUntil: Date | null},
        ];
        expect(command.blockedUntil).toBeNull();
    });

    it("unblockUser() targets the path param user", async () => {
        await controller.unblockUser(TEST_USER_ID);
        expect(unblockUserUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({userId: TEST_USER_ID}),
        );
    });

    it("changeUserRole() forwards path param and DTO role", async () => {
        await controller.changeUserRole(TEST_USER_ID, {
            role: UserRole.PROVIDER,
        } as never);

        expect(changeUserRoleUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({userId: TEST_USER_ID, role: UserRole.PROVIDER}),
        );
    });

    it("deleteUser() targets the path param user", async () => {
        await controller.deleteUser(TEST_USER_ID);
        expect(deleteUserUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({userId: TEST_USER_ID}),
        );
    });
});
