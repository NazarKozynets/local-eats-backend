// Abstract class for value objects
export abstract class ValueObject<TProps> {
    protected readonly props: TProps;

    protected constructor(props: TProps) {
        this.props = Object.freeze(props);
    }

    public equals(vo?: ValueObject<TProps>): boolean {
        if (!vo) {
            return false;
        }

        return JSON.stringify(this.props) === JSON.stringify(vo.props);
    }
}