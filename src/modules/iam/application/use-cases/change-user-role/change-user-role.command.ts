import type {UserRole} from "../../../domain/enums/user-role.enum";

export type ChangeUserRoleCommandProps = {
    userId: string;
    role: UserRole;
};

export class ChangeUserRoleCommand {
    public readonly userId: string;
    public readonly role: UserRole;

    private constructor(props: ChangeUserRoleCommandProps) {
        this.userId = props.userId;
        this.role = props.role;
    }

    static create(props: ChangeUserRoleCommandProps): ChangeUserRoleCommand {
        return new ChangeUserRoleCommand({
            userId: props.userId.trim(),
            role: props.role,
        });
    }
}
