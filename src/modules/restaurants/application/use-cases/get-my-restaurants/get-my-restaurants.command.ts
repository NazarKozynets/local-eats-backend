export class GetMyRestaurantsCommand {
    readonly currentUserId: string;

    private constructor(userId: string) {
        this.currentUserId = userId;
    }

    static create(props: { currentUserId: string }): GetMyRestaurantsCommand {
        return new GetMyRestaurantsCommand(props.currentUserId.trim());
    }
}
