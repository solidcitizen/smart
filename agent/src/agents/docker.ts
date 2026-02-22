import { runBash } from "../tools/bash.js";

export interface ContainerStatus {
  name: string;
  image: string;
  status: string;
  running: boolean;
  uptime: string;
  restarts: number;
}

export interface DockerHealthResult {
  status: "ok" | "warn" | "critical";
  message: string;
  containers: ContainerStatus[];
  issues: string[];
}

const DOCKER_PATH = "/var/packages/ContainerManager/target/usr/bin/docker";
const EXPECTED_CONTAINERS = [
  "home_assistant",
  "portainer",
  "watchtower",
  "oznu-homebridge",
];

/**
 * Docker sub-agent - manages container lifecycle and health
 */
export const dockerAgent = {
  name: "docker",
  description: "Monitors Docker containers on Synology NAS",

  /**
   * Get status of all containers
   */
  async getStatus(): Promise<ContainerStatus[]> {
    const result = await runBash(
      `${DOCKER_PATH} ps -a --format '{{.Names}}|{{.Image}}|{{.Status}}|{{.State}}'`,
      { remote: true }
    );

    if (result.exitCode !== 0) {
      throw new Error(`Docker ps failed: ${result.stderr}`);
    }

    return result.stdout
      .trim()
      .split("\n")
      .filter((line) => line.length > 0)
      .map((line) => {
        const [name, image, status, state] = line.split("|");
        const running = state === "running";
        const restartMatch = status.match(/Restarting \((\d+)\)/);
        const restarts = restartMatch ? parseInt(restartMatch[1], 10) : 0;
        return {
          name,
          image,
          status,
          running,
          uptime: status,
          restarts,
        };
      });
  },

  /**
   * Get logs from a container
   */
  async getLogs(
    containerName: string,
    lines: number = 50
  ): Promise<string> {
    const result = await runBash(
      `${DOCKER_PATH} logs --tail ${lines} ${containerName} 2>&1`,
      { remote: true }
    );
    return result.stdout || result.stderr;
  },

  /**
   * Restart a container (requires approval)
   */
  async restart(containerName: string): Promise<{ success: boolean; message: string }> {
    const result = await runBash(
      `${DOCKER_PATH} restart ${containerName}`,
      { remote: true, timeout: 60000 }
    );

    if (result.exitCode === 0) {
      return { success: true, message: `Container ${containerName} restarted successfully` };
    } else {
      return { success: false, message: `Failed to restart: ${result.stderr}` };
    }
  },

  /**
   * Run health check - returns overall Docker health status
   */
  async healthCheck(): Promise<DockerHealthResult> {
    const containers = await this.getStatus();
    const issues: string[] = [];

    // Check for expected containers
    for (const expected of EXPECTED_CONTAINERS) {
      const container = containers.find((c) => c.name === expected);
      if (!container) {
        issues.push(`Expected container '${expected}' not found`);
      } else if (!container.running) {
        issues.push(`Container '${expected}' is not running: ${container.status}`);
      } else if (container.restarts > 0) {
        issues.push(`Container '${expected}' has restart loop (${container.restarts} restarts)`);
      }
    }

    // Check for other stopped containers
    const stoppedOthers = containers.filter(
      (c) => !c.running && !EXPECTED_CONTAINERS.includes(c.name)
    );
    if (stoppedOthers.length > 0) {
      issues.push(
        `${stoppedOthers.length} other containers stopped: ${stoppedOthers.map((c) => c.name).join(", ")}`
      );
    }

    let status: "ok" | "warn" | "critical" = "ok";
    let message = "All containers healthy";

    if (issues.length > 0) {
      const critical = issues.some(
        (i) => i.includes("not running") || i.includes("restart loop")
      );
      status = critical ? "critical" : "warn";
      message = issues.join("; ");
    }

    return { status, message, containers, issues };
  },
};

/**
 * Tool definitions for the main agent
 */
export const dockerTools = [
  {
    name: "docker_status",
    description: "Get status of all Docker containers on the NAS",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "docker_logs",
    description: "Get recent logs from a Docker container",
    input_schema: {
      type: "object" as const,
      properties: {
        container: {
          type: "string",
          description: "Container name (e.g., home_assistant, portainer)",
        },
        lines: {
          type: "number",
          description: "Number of log lines to retrieve. Default: 50",
        },
      },
      required: ["container"],
    },
  },
  {
    name: "docker_restart",
    description:
      "Restart a Docker container. REQUIRES APPROVAL - this will briefly interrupt the service.",
    input_schema: {
      type: "object" as const,
      properties: {
        container: {
          type: "string",
          description: "Container name to restart",
        },
      },
      required: ["container"],
    },
  },
  {
    name: "docker_health",
    description: "Run Docker health check - verifies all expected containers are running",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];
