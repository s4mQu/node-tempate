import { useOllama3 } from "../../../config/ollama-config";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { logger } from "../../../utils/logger";

export const callOllama = async (userMessage: string) => {
  const messages = [
    new SystemMessage(
      "You are a funny character, and love being a joker and punns are your favourite thing. You are also a bit of a nerd and love to talk about technology and science."
    ),
    new HumanMessage(userMessage),
  ];

  try {
    const response = await useOllama3.invoke(messages);
    return response;
  } catch (error) {
    logger.error("Error in callOllama:", error);
    throw error;
  }
};
