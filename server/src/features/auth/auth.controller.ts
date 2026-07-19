import type { Request, Response } from "express"
export async function registerUser(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;
        res.send("Register");
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
}