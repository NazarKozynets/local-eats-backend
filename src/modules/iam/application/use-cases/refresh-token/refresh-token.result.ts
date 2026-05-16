import type {UserRole} from "../../../domain/enums/user-role.enum";
import type {UserStatus} from "../../../domain/enums/user-status.enum";

export type RefreshTokenResult = {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string | null;
        phone: string | null;
        role: UserRole;
        status: UserStatus;
    };
};
