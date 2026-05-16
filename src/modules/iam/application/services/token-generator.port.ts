export const TOKEN_GENERATOR = Symbol('TOKEN_GENERATOR');

export type TokenPayload = {
    userId: string;
    role: string;
};

export interface TokenGenerator {
    generateAccessToken(payload: TokenPayload): Promise<string>;

    generateRefreshToken(payload: TokenPayload): Promise<string>;
}