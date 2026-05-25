export interface GetAdminUsersCommand {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
}
