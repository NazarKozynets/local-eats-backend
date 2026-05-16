import {GetCurrentUserUseCase} from "./get-current-user.use-case";
import {GetCurrentUserCommand} from "./get-current-user.command";
import {UserNotFoundError} from "../../../../../shared/domain/errors/user-not-found.error";
import {buildUser, TEST_USER_ID} from "../../../__tests__/_helpers/builders";
import {createMockUserRepository} from "../../../__tests__/_helpers/mocks";

describe("GetCurrentUserUseCase", () => {
    let userRepository: ReturnType<typeof createMockUserRepository>;
    let useCase: GetCurrentUserUseCase;

    beforeEach(() => {
        userRepository = createMockUserRepository();
        useCase = new GetCurrentUserUseCase(userRepository);
    });

    it("maps the user entity to the result DTO", async () => {
        const user = buildUser();
        userRepository.findById.mockResolvedValue(user);

        const result = await useCase.execute(
            GetCurrentUserCommand.create({userId: TEST_USER_ID}),
        );

        expect(result).toEqual({
            id: user.id.value,
            email: user.email?.value,
            phone: null,
            role: user.role,
            status: user.status,
            emailVerifiedAt: null,
            phoneVerifiedAt: null,
            blockedUntil: null,
            blockReason: null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        });
    });

    it("throws UserNotFoundError when user is missing", async () => {
        userRepository.findById.mockResolvedValue(null);

        await expect(
            useCase.execute(GetCurrentUserCommand.create({userId: TEST_USER_ID})),
        ).rejects.toBeInstanceOf(UserNotFoundError);
    });
});
