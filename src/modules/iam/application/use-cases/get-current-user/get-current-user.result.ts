import type {UserRole} from "../../../domain/enums/user-role.enum";
import type {UserStatus} from "../../../domain/enums/user-status.enum";

export type GetCurrentUserResult = {
    id: string;
    email: string | null;
    phone: string | null;
    role: UserRole;
    status: UserStatus;
    emailVerifiedAt: Date | null;
    phoneVerifiedAt: Date | null;
    blockedUntil: Date | null;
    blockReason: string | null;
    createdAt: Date;
    updatedAt: Date;
};
