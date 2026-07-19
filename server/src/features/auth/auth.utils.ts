import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import bcrypt from "bcrypt"
export function generateAccessToken(userId: string) {
    return jwt.sign(
        { userId },
        env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
}

export function verifyAccessToken(token: string) {
    return jwt.verify(token, env.JWT_SECRET);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
    const isMatch = await bcrypt.compare(password, storedHash);
    return isMatch;
}

