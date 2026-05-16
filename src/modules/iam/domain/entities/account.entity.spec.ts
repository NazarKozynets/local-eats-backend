import {Account} from "./account.entity";
import {UserRole} from "../enums/user-role.enum";
import {UserStatus} from "../enums/user-status.enum";
import {
    buildEmail,
    buildPasswordHash,
    buildPhone,
    buildUser,
    buildUserId,
} from "../../__tests__/_helpers/builders";

describe("User entity", () => {
    describe("register", () => {
        it("requires at least email or phone", () => {
            expect(() =>
                Account.register({
                    id: buildUserId(),
                    role: UserRole.CUSTOMER,
                }),
            ).toThrow("User must have email or phone");
        });

        it("creates an ACTIVE customer with default verification fields null", () => {
            const user = Account.register({
                id: buildUserId(),
                email: buildEmail(),
                passwordHash: buildPasswordHash(),
                role: UserRole.CUSTOMER,
            });

            expect(user.status).toBe(UserStatus.ACTIVE);
            expect(user.role).toBe(UserRole.CUSTOMER);
            expect(user.emailVerifiedAt).toBeNull();
            expect(user.phoneVerifiedAt).toBeNull();
            expect(user.blockReason).toBeNull();
        });
    });

    describe("verification", () => {
        it("marks the email as verified", () => {
            const user = buildUser();
            user.markEmailAsVerified();
            expect(user.emailVerifiedAt).toBeInstanceOf(Date);
        });

        it("rejects email verification when user has no email", () => {
            const user = buildUser({email: null, phone: buildPhone()});
            expect(() => user.markEmailAsVerified()).toThrow(
                "User does not have email",
            );
        });

        it("marks the phone as verified", () => {
            const user = buildUser({phone: buildPhone()});
            user.markPhoneAsVerified();
            expect(user.phoneVerifiedAt).toBeInstanceOf(Date);
        });

        it("rejects phone verification when user has no phone", () => {
            const user = buildUser({phone: null});
            expect(() => user.markPhoneAsVerified()).toThrow(
                "User does not have phone number",
            );
        });
    });

    describe("password and role changes", () => {
        it("blocks password change on deleted users", () => {
            const user = buildUser({status: UserStatus.DELETED});
            expect(() => user.changePasswordHash(buildPasswordHash())).toThrow(
                "Deleted user cannot change password",
            );
        });

        it("blocks role change on deleted users", () => {
            const user = buildUser({status: UserStatus.DELETED});
            expect(() => user.changeRole(UserRole.ADMIN)).toThrow(
                "Deleted user cannot change role",
            );
        });
    });

    describe("block/unblock", () => {
        it("blocks an active user with a reason", () => {
            const user = buildUser();
            user.block("fraud");
            expect(user.status).toBe(UserStatus.BLOCKED);
            expect(user.blockReason).toBe("fraud");
            expect(user.blockedUntil).toBeNull();
        });

        it("refuses to block admins", () => {
            const admin = buildUser({role: UserRole.ADMIN});
            expect(() => admin.block("any")).toThrow(
                "Admin user cannot be blocked by this operation",
            );
        });

        it("refuses to block deleted users", () => {
            const user = buildUser({status: UserStatus.DELETED});
            expect(() => user.block("any")).toThrow(
                "Deleted user cannot be blocked",
            );
        });

        it("unblock restores user back to ACTIVE", () => {
            const user = buildUser({status: UserStatus.BLOCKED, blockReason: "fraud"});
            user.unblock();
            expect(user.status).toBe(UserStatus.ACTIVE);
            expect(user.blockReason).toBeNull();
            expect(user.blockedUntil).toBeNull();
        });
    });

    describe("delete", () => {
        it("marks user as deleted", () => {
            const user = buildUser();
            user.delete();
            expect(user.status).toBe(UserStatus.DELETED);
        });

        it("is idempotent for already deleted users", () => {
            const user = buildUser({status: UserStatus.DELETED});
            expect(() => user.delete()).not.toThrow();
            expect(user.status).toBe(UserStatus.DELETED);
        });
    });

    describe("makeProvider", () => {
        it("upgrades a customer to a provider", () => {
            const user = buildUser();
            user.makeProvider();
            expect(user.role).toBe(UserRole.PROVIDER);
        });

        it("rejects admin -> provider", () => {
            const admin = buildUser({role: UserRole.ADMIN});
            expect(() => admin.makeProvider()).toThrow("Admin cannot become provider");
        });

        it("rejects deleted -> provider", () => {
            const user = buildUser({status: UserStatus.DELETED});
            expect(() => user.makeProvider()).toThrow(
                "Deleted user cannot become provider",
            );
        });
    });

    describe("canLogin", () => {
        it("returns true for an active user", () => {
            expect(buildUser().canLogin()).toBe(true);
        });

        it("returns false for a deleted user", () => {
            expect(
                buildUser({status: UserStatus.DELETED}).canLogin(),
            ).toBe(false);
        });

        it("returns false for a permanently blocked user", () => {
            expect(
                buildUser({status: UserStatus.BLOCKED}).canLogin(),
            ).toBe(false);
        });

        it("returns true for a blocked user whose deadline has passed", () => {
            const user = buildUser({
                status: UserStatus.BLOCKED,
                blockedUntil: new Date(Date.now() - 1_000),
            });
            expect(user.canLogin()).toBe(true);
        });

        it("returns false for a blocked user whose deadline is in the future", () => {
            const user = buildUser({
                status: UserStatus.BLOCKED,
                blockedUntil: new Date(Date.now() + 60_000),
            });
            expect(user.canLogin()).toBe(false);
        });
    });
});
