import {PasswordHash} from "./password-hash.vo";

const VALID_BCRYPT =
    "$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ";

const VALID_ARGON2 =
    "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQ$aGFzaHZhbHVl";

describe("PasswordHash", () => {
    it("accepts a valid bcrypt hash", () => {
        const hash = PasswordHash.create(VALID_BCRYPT);
        expect(hash.value).toBe(VALID_BCRYPT);
    });

    it("accepts a valid argon2id hash", () => {
        const hash = PasswordHash.create(VALID_ARGON2);
        expect(hash.value).toBe(VALID_ARGON2);
    });

    it("trims surrounding whitespace before validation", () => {
        const hash = PasswordHash.create(`  ${VALID_BCRYPT}  `);
        expect(hash.value).toBe(VALID_BCRYPT);
    });

    it("rejects empty values", () => {
        expect(() => PasswordHash.create("")).toThrow("Password hash is required");
        expect(() => PasswordHash.create("   ")).toThrow(
            "Password hash is required",
        );
    });

    it("rejects too short values", () => {
        expect(() => PasswordHash.create("short")).toThrow(
            "Password hash is too short",
        );
    });

    it("rejects unsupported hash formats", () => {
        expect(() =>
            PasswordHash.create(
                "plaintextlooking-but-long-enough-string-1234567890",
            ),
        ).toThrow("Unsupported password hash format");
    });
});
