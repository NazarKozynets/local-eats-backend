import {AccountController} from "./account.controller";
import {GetCurrentUserUseCase} from "../../application/use-cases/get-current-user/get-current-user.use-case";
import {ChangePasswordUseCase} from "../../application/use-cases/change-password/change-password.use-case";
import {LogoutAllSessionsUseCase} from "../../application/use-cases/logout-all-sessions/logout-all-sessions.use-case";
import {RequestEmailVerificationUseCase} from "../../application/use-cases/request-email-verification/request-email-verification.use-case";
import {VerifyEmailUseCase} from "../../application/use-cases/verify-email/verify-email.use-case";
import {RequestPhoneVerificationUseCase} from "../../application/use-cases/request-phone-verification/request-phone-verification.use-case";
import {VerifyPhoneUseCase} from "../../application/use-cases/verify-phone/verify-phone.use-case";
import {TEST_USER_ID} from "../../__tests__/_helpers/builders";

const createUseCaseMock = <T extends {execute: (...args: unknown[]) => unknown}>() =>
    ({execute: jest.fn()}) as unknown as jest.Mocked<T>;

const authUser = {userId: TEST_USER_ID, role: "CUSTOMER"};

describe("AccountController", () => {
    let getCurrentUserUseCase: jest.Mocked<GetCurrentUserUseCase>;
    let changePasswordUseCase: jest.Mocked<ChangePasswordUseCase>;
    let logoutAllSessionsUseCase: jest.Mocked<LogoutAllSessionsUseCase>;
    let requestEmailVerificationUseCase: jest.Mocked<RequestEmailVerificationUseCase>;
    let verifyEmailUseCase: jest.Mocked<VerifyEmailUseCase>;
    let requestPhoneVerificationUseCase: jest.Mocked<RequestPhoneVerificationUseCase>;
    let verifyPhoneUseCase: jest.Mocked<VerifyPhoneUseCase>;
    let controller: AccountController;

    beforeEach(() => {
        getCurrentUserUseCase = createUseCaseMock<GetCurrentUserUseCase>();
        changePasswordUseCase = createUseCaseMock<ChangePasswordUseCase>();
        logoutAllSessionsUseCase = createUseCaseMock<LogoutAllSessionsUseCase>();
        requestEmailVerificationUseCase =
            createUseCaseMock<RequestEmailVerificationUseCase>();
        verifyEmailUseCase = createUseCaseMock<VerifyEmailUseCase>();
        requestPhoneVerificationUseCase =
            createUseCaseMock<RequestPhoneVerificationUseCase>();
        verifyPhoneUseCase = createUseCaseMock<VerifyPhoneUseCase>();

        controller = new AccountController(
            getCurrentUserUseCase,
            changePasswordUseCase,
            logoutAllSessionsUseCase,
            requestEmailVerificationUseCase,
            verifyEmailUseCase,
            requestPhoneVerificationUseCase,
            verifyPhoneUseCase,
        );
    });

    it("me() returns the current user via GetCurrentUserUseCase", async () => {
        await controller.me(authUser);
        expect(getCurrentUserUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({userId: TEST_USER_ID}),
        );
    });

    it("changePassword() forwards old/new passwords from the DTO", async () => {
        await controller.changePassword(authUser, {
            oldPassword: "old",
            newPassword: "new",
        } as never);

        expect(changePasswordUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: TEST_USER_ID,
                currentPassword: "old",
                newPassword: "new",
            }),
        );
    });

    it("logoutAllSessions() targets the authenticated user", async () => {
        await controller.logoutAllSessions(authUser);
        expect(logoutAllSessionsUseCase.execute).toHaveBeenCalledWith(
            expect.objectContaining({userId: TEST_USER_ID}),
        );
    });

    it("requestEmailVerification(), verifyEmail(), requestPhoneVerification(), verifyPhone() all delegate", async () => {
        await controller.requestEmailVerification(authUser, {} as never);
        await controller.verifyEmail(authUser, {} as never);
        await controller.requestPhoneVerification(authUser, {} as never);
        await controller.verifyPhone(authUser, {} as never);

        expect(requestEmailVerificationUseCase.execute).toHaveBeenCalledTimes(1);
        expect(verifyEmailUseCase.execute).toHaveBeenCalledTimes(1);
        expect(requestPhoneVerificationUseCase.execute).toHaveBeenCalledTimes(1);
        expect(verifyPhoneUseCase.execute).toHaveBeenCalledTimes(1);
    });
});
