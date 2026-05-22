export const ORDER_PUBLIC_CODE_GENERATOR = Symbol('ORDER_PUBLIC_CODE_GENERATOR');

export interface OrderPublicCodeGenerator {
    generate(): string;
}
