import * as readline from "readline";
import Anthropic from "@anthropic-ai/sdk";
import { createAgent } from "./index.js";

const agent = createAgent();

interface Message {
  role: "user" | "assistant";
  content: string | Anthropic.ContentBlock[];
}

const conversationHistory: Message[] = [];

async function chat(userMessage: string): Promise<string> {
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  let response = await agent.client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: agent.systemPrompt,
    tools: agent.tools as Anthropic.Tool[],
    messages: conversationHistory,
  });

  // Process tool calls in a loop
  while (response.stop_reason === "tool_use") {
    const assistantContent = response.content;
    conversationHistory.push({
      role: "assistant",
      content: assistantContent,
    });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of assistantContent) {
      if (block.type === "tool_use") {
        const toolName = block.name;
        const toolInput = block.input as Record<string, unknown>;

        // Check if approval is needed
        if (agent.requiresApproval(toolName, toolInput)) {
          console.log(`\n[APPROVAL REQUIRED] ${toolName}`);
          console.log(`Input: ${JSON.stringify(toolInput, null, 2)}`);

          const approved = await askApproval();
          if (!approved) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: "Action was denied by user. Ask user for guidance.",
            });
            continue;
          }
        }

        // Execute the tool
        console.log(`\n[Executing] ${toolName}...`);
        const result = await agent.executeTool(toolName, toolInput);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    // Add tool results to conversation
    conversationHistory.push({
      role: "user",
      content: toolResults,
    });

    // Continue the conversation
    response = await agent.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: agent.systemPrompt,
      tools: agent.tools as Anthropic.Tool[],
      messages: conversationHistory,
    });
  }

  // Extract final text response
  const finalContent = response.content;
  conversationHistory.push({
    role: "assistant",
    content: finalContent,
  });

  const textBlocks = finalContent.filter(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  return textBlocks.map((block) => block.text).join("\n");
}

async function askApproval(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Approve this action? (y/n): ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
    });
  });
}

async function main() {
  console.log("=================================");
  console.log("HomeIT Agent - Home ITSM Monitor");
  console.log("=================================");
  console.log("Type your questions or commands.");
  console.log('Type "exit" or "quit" to leave.');
  console.log('Type "health" for full health check.');
  console.log("");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const prompt = () => {
    rl.question("You: ", async (input) => {
      const trimmed = input.trim();

      if (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit") {
        console.log("Goodbye!");
        rl.close();
        process.exit(0);
      }

      if (!trimmed) {
        prompt();
        return;
      }

      // Shortcut for full health check
      let message = trimmed;
      if (trimmed.toLowerCase() === "health") {
        message =
          "Run a full health check: Docker containers, storage volumes, certificates, lock batteries, and network services. Summarize any issues.";
      }

      try {
        const response = await chat(message);
        console.log(`\nHomeIT: ${response}\n`);
      } catch (error) {
        console.error(`\nError: ${error}\n`);
      }

      prompt();
    });
  };

  prompt();
}

main().catch(console.error);
