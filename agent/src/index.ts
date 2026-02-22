import Anthropic from "@anthropic-ai/sdk";
import { dockerAgent, dockerTools } from "./agents/docker.js";
import { smartthingsAgent, smartthingsTools } from "./agents/smartthings.js";
import { storageAgent, storageTools } from "./agents/storage.js";
import { certsAgent, certsTools } from "./agents/certs.js";
import { networkAgent, networkTools } from "./agents/network.js";
import { runBash, bashTool, isReadOnlyCommand } from "./tools/bash.js";
import { httpRequest, httpTool } from "./tools/http.js";
import { notify, notifyTool } from "./tools/notify.js";
import { SERVICES_CONTEXT } from "./context/services.js";
import { RUNBOOK_CONTEXT } from "./context/runbook.js";

// Types
export interface ToolResult {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

export interface PendingApproval {
  toolName: string;
  toolInput: Record<string, unknown>;
  toolUseId: string;
  description: string;
}

// All tools available to the agent
const ALL_TOOLS = [
  bashTool,
  httpTool,
  notifyTool,
  ...dockerTools,
  ...smartthingsTools,
  ...storageTools,
  ...certsTools,
  ...networkTools,
];

// Tools that require approval before execution
const APPROVAL_REQUIRED_TOOLS = new Set([
  "docker_restart",
  "storage_cleanup",
]);

// System prompt with embedded context
const SYSTEM_PROMPT = `You are HomeIT, an autonomous home ITSM agent running on a Synology NAS. You monitor and manage home infrastructure including Docker containers, Z-Wave devices (locks, heaters), storage, certificates, and network services.

## Your Capabilities
- Monitor: Check health of containers, volumes, certs, locks, services
- Diagnose: Read logs, query status, investigate issues
- Act: Restart services, run cleanup, execute runbook procedures (with approval)

## Semi-Autonomous Behavior
- Auto-execute read-only operations (status checks, log reads)
- For state-changing actions, explain what you want to do and ask for approval
- Never execute destructive operations without explicit confirmation
- When alerting issues, include relevant context and suggested actions

## Infrastructure Knowledge
${SERVICES_CONTEXT}

## Operational Procedures
${RUNBOOK_CONTEXT}

## Guidelines
1. Start with health checks to understand current state
2. When investigating issues, correlate across sub-agents (e.g., disk space + Docker)
3. Reference runbook procedures when proposing remediation
4. Be concise but include relevant details
5. For approvals, explain the action and its impact clearly
`;

/**
 * Execute a tool call
 */
async function executeTool(
  name: string,
  input: Record<string, unknown>
): Promise<string> {
  try {
    switch (name) {
      // Core tools
      case "bash": {
        const result = await runBash(
          input.command as string,
          { remote: input.remote as boolean }
        );
        return JSON.stringify(result);
      }
      case "http_request": {
        const result = await httpRequest(input.url as string, {
          method: input.method as "GET" | "POST" | "PUT" | "DELETE",
          headers: input.headers as Record<string, string>,
          body: input.body as string,
        });
        return JSON.stringify(result);
      }
      case "notify": {
        const result = await notify(input.message as string, {
          title: input.title as string,
          priority: input.priority as "low" | "normal" | "high",
          tag: input.tag as string,
        });
        return JSON.stringify(result);
      }

      // Docker agent
      case "docker_status": {
        const result = await dockerAgent.getStatus();
        return JSON.stringify(result);
      }
      case "docker_logs": {
        const result = await dockerAgent.getLogs(
          input.container as string,
          input.lines as number
        );
        return result;
      }
      case "docker_restart": {
        const result = await dockerAgent.restart(input.container as string);
        return JSON.stringify(result);
      }
      case "docker_health": {
        const result = await dockerAgent.healthCheck();
        return JSON.stringify(result);
      }

      // SmartThings agent
      case "smartthings_locks": {
        const result = await smartthingsAgent.getAllLocks();
        return JSON.stringify(result);
      }
      case "smartthings_device": {
        const [info, status] = await Promise.all([
          smartthingsAgent.getDeviceInfo(input.deviceId as string),
          smartthingsAgent.getDeviceStatus(input.deviceId as string),
        ]);
        return JSON.stringify({ info, status });
      }
      case "smartthings_health": {
        const result = await smartthingsAgent.healthCheck();
        return JSON.stringify(result);
      }

      // Storage agent
      case "storage_volumes": {
        const result = await storageAgent.getVolumeStatus();
        return JSON.stringify(result);
      }
      case "storage_backup": {
        const result = await storageAgent.getBackupStatus();
        return JSON.stringify(result);
      }
      case "storage_cleanup": {
        const result = await storageAgent.cleanupDockerImages();
        return JSON.stringify(result);
      }
      case "storage_health": {
        const result = await storageAgent.healthCheck();
        return JSON.stringify(result);
      }

      // Certs agent
      case "certs_check": {
        if (input.domain) {
          const result = await certsAgent.checkCert(input.domain as string);
          return JSON.stringify(result);
        }
        const health = await certsAgent.healthCheck();
        return JSON.stringify(health.certs);
      }
      case "certs_local": {
        const result = await certsAgent.checkLocalCert();
        return JSON.stringify(result);
      }
      case "certs_health": {
        const result = await certsAgent.healthCheck();
        return JSON.stringify(result);
      }

      // Network agent
      case "network_ping": {
        const result = await networkAgent.ping(input.host as string);
        return JSON.stringify(result);
      }
      case "network_service": {
        const result = await networkAgent.checkService("service", input.url as string);
        return JSON.stringify(result);
      }
      case "network_health": {
        const result = await networkAgent.healthCheck();
        return JSON.stringify(result);
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (error) {
    return JSON.stringify({ error: String(error) });
  }
}

/**
 * Check if a tool requires approval
 */
function requiresApproval(name: string, input: Record<string, unknown>): boolean {
  if (APPROVAL_REQUIRED_TOOLS.has(name)) {
    return true;
  }

  // Check bash commands
  if (name === "bash") {
    const command = input.command as string;
    return !isReadOnlyCommand(command);
  }

  return false;
}

/**
 * Create the HomeIT agent
 */
export function createAgent() {
  const client = new Anthropic();

  return {
    client,
    tools: ALL_TOOLS,
    systemPrompt: SYSTEM_PROMPT,
    executeTool,
    requiresApproval,
  };
}

export { dockerAgent, smartthingsAgent, storageAgent, certsAgent, networkAgent };
