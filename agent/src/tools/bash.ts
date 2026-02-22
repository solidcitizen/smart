import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export interface BashResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Execute a bash command locally or via SSH on the NAS
 *
 * When IN_CONTAINER=true, remote commands run locally instead
 * (the container runs on Synology with docker socket mounted)
 */
export async function runBash(
  command: string,
  options: {
    remote?: boolean;
    timeout?: number;
  } = {}
): Promise<BashResult> {
  const { remote = false, timeout = 30000 } = options;
  const inContainer = process.env.IN_CONTAINER === "true";

  let fullCommand = command;

  // When running in container on Synology, remote commands run locally
  // because we already have access to docker socket and local tools
  if (remote && !inContainer) {
    // Execute on Synology NAS via SSH
    const sshCommand = `ssh -p 2222 mike@10.1.11.98 -o BatchMode=yes -o ConnectTimeout=10 '${command.replace(/'/g, "'\\''")}'`;
    fullCommand = sshCommand;
  } else if (inContainer) {
    // Running in container - strip Synology-specific paths
    fullCommand = command.replace(
      /\/var\/packages\/ContainerManager\/target\/usr\/bin\//g,
      ""
    );
  }

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: execError.stdout || "",
      stderr: execError.stderr || String(error),
      exitCode: execError.code || 1,
    };
  }
}

/**
 * Tool definition for Claude
 */
export const bashTool = {
  name: "bash",
  description:
    "Execute a bash command. Use remote=true to run on the Synology NAS via SSH. Read-only commands execute automatically; state-changing commands require approval.",
  input_schema: {
    type: "object" as const,
    properties: {
      command: {
        type: "string",
        description: "The bash command to execute",
      },
      remote: {
        type: "boolean",
        description: "If true, execute on Synology NAS via SSH. Default: false (local)",
      },
    },
    required: ["command"],
  },
};

/**
 * Commands that are considered read-only and safe to auto-execute
 */
const READ_ONLY_PATTERNS = [
  /^(ls|cat|head|tail|grep|find|df|du|ps|top|uptime|date|whoami|pwd|echo|which|type|file|stat)/,
  /^docker\s+(ps|logs|images|inspect|stats)/,
  /^smartthings\s+(devices|devices:status|devices:health|devices:history)/,
  /^openssl\s+s_client/,
  /^curl\s+.*--head/,
  /^ping\s+-c/,
];

/**
 * Check if a command is read-only (safe to auto-execute)
 */
export function isReadOnlyCommand(command: string): boolean {
  const trimmed = command.trim();
  return READ_ONLY_PATTERNS.some((pattern) => pattern.test(trimmed));
}
