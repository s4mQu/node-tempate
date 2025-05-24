import { Router } from "express";
import { testHandler } from "../handlers/test-handler";

export const testRoute = Router();

testRoute.get("/", testHandler);
