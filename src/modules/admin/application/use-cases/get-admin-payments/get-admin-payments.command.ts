export interface GetAdminPaymentsCommand {
    page?: number;
    limit?: number;
    status?: string;
    provider?: string;
}
