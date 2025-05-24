import { v4 as uuidv4 } from "uuid";

export const generateUID = (): string => {
  return uuidv4();
};
