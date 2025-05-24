import { Request, Response } from "express";

export const testHandler = (req: Request, res: Response) => {
  res.json({ message: "Hello, world!" });
};
