import {UUID} from "../../../../shared/domain/value-objects/uuid.vo";

export type AccountSnapshot = {
    id: string;
    status: "ACTIVE" | "BLOCKED" | "DELETED";
    role: "CUSTOMER" | "PROVIDER" | "ADMIN";
};

export const ACCOUNT_ACCESS_READER = Symbol("ACCOUNT_ACCESS_READER");

export interface AccountAccessReader {
    findById(id: UUID): Promise<AccountSnapshot | null>;
}