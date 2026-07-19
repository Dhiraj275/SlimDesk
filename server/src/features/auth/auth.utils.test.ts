import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
    generateAccessToken,
    verifyAccessToken,
    hashPassword,
    comparePassword,
} from "./auth.utils";

describe("Auth Utilities", () => {
    describe("JWT Tokens", () => {
        test("should generate and verify a valid access token", () => {
            const userId = "test-user-id-123";
            const token = generateAccessToken(userId);

            assert.ok(token, "Token should be a truthy string");
            assert.equal(typeof token, "string", "Token should be a string");

            const decoded = verifyAccessToken(token) as { userId: string };
            assert.equal(decoded.userId, userId, "Decoded token should contain the correct userId");
        });

        test("should throw an error for an invalid/altered token", () => {
            const token = generateAccessToken("user-123");
            const invalidToken = token + "altered";

            assert.throws(() => {
                verifyAccessToken(invalidToken);
            }, /invalid signature|jwt malformed/i);
        });

        test("should throw an error for empty or malformed token", () => {
            assert.throws(() => {
                verifyAccessToken("");
            }, /jwt must be provided/i);

            assert.throws(() => {
                verifyAccessToken("not.a.valid.jwt");
            }, /jwt malformed/i);
        });
    });

    describe("Password Hashing", () => {
        const password = "mySecurePassword123";

        test("should hash password successfully", async () => {
            const hash = await hashPassword(password);
            assert.ok(hash, "Hash should be generated");
            assert.notEqual(hash, password, "Hashed password should not be equal to original password");
            assert.ok(hash.startsWith("$2b$"), "Should be a bcrypt hash (starts with $2b$)");
        });

        test("should compare correct password and return true", async () => {
            const hash = await hashPassword(password);
            const isMatch = await comparePassword(password, hash);
            assert.equal(isMatch, true, "Correct password should match the hash");
        });

        test("should compare incorrect password and return false", async () => {
            const hash = await hashPassword(password);
            const isMatch = await comparePassword("wrongPassword", hash);
            assert.equal(isMatch, false, "Incorrect password should not match the hash");
        });

        test("should produce different hashes for the same password due to salting", async () => {
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);
            assert.notEqual(hash1, hash2, "Two hashes of the same password should be different");
        });
    });
});
