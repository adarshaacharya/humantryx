export const maxDuration = 30;
import { LangchainService } from "@/server/api/services/langchain.service";
import { getSession } from "@/server/auth";
import { type Message as VercelChatMessage } from "ai";

export async function POST(req: Request) {
  try {
    // check user is authenticated
    const session = await getSession();

    if (!session?.session?.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = (await req.json()) as {
      messages: VercelChatMessage[];
    };

    if (!messages || messages.length === 0) {
      return new Response("No messages provided", { status: 400 });
    }

    const currentMessageContent = messages[messages.length - 1]?.content;

    if (!currentMessageContent) {
      return new Response("No message content found", { status: 400 });
    }

    const history = messages.slice(0, messages.length - 1);

    return LangchainService.chatDocs({
      question: currentMessageContent,
      chatHistory: history,
    });
  } catch (error) {
    console.error("Error in chat router:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
