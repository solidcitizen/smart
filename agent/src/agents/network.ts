import { runBash } from "../tools/bash.js";
import { httpRequest } from "../tools/http.js";

export interface ServiceCheck {
  name: string;
  url: string;
  status: "up" | "down" | "degraded";
  responseTime?: number;
  error?: string;
}

export interface NetworkHealthResult {
  status: "ok" | "warn" | "critical";
  message: string;
  services: ServiceCheck[];
  issues: string[];
}

// Services to check
const SERVICES = [
  { name: "Home Assistant", url: "http://10.1.11.98:8123" },
  { name: "Portainer", url: "http://10.1.11.98:9000" },
  { name: "Homebridge", url: "http://10.1.11.98:8581" },
  { name: "DSM", url: "https://10.1.11.98:5001" },
  { name: "HA External", url: "https://ha.conant.com" },
];

const HOSTS_TO_PING = [
  { name: "NAS", host: "10.1.11.98" },
  { name: "SmartThings Hub", host: "10.1.11.174" },
  { name: "Gateway", host: "10.1.11.1" },
];

/**
 * Network sub-agent - monitors connectivity
 */
export const networkAgent = {
  name: "network",
  description: "Monitors network connectivity and service availability",

  /**
   * Ping a host
   */
  async ping(host: string): Promise<{ reachable: boolean; latency?: number }> {
    const result = await runBash(`ping -c 1 -W 2 ${host} 2>/dev/null`, {
      remote: false,
      timeout: 5000,
    });

    if (result.exitCode !== 0) {
      return { reachable: false };
    }

    // Parse latency from ping output
    const match = result.stdout.match(/time=(\d+\.?\d*)/);
    const latency = match ? parseFloat(match[1]) : undefined;

    return { reachable: true, latency };
  },

  /**
   * Check if an HTTP service is up
   */
  async checkService(
    name: string,
    url: string
  ): Promise<ServiceCheck> {
    const start = Date.now();

    try {
      const response = await httpRequest(url, {
        method: "GET",
        timeout: 10000,
      });

      const responseTime = Date.now() - start;

      if (response.status >= 200 && response.status < 400) {
        return { name, url, status: "up", responseTime };
      } else if (response.status >= 400 && response.status < 500) {
        // Client errors might be auth issues but service is up
        return { name, url, status: "up", responseTime };
      } else {
        return {
          name,
          url,
          status: "degraded",
          responseTime,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      return {
        name,
        url,
        status: "down",
        error: String(error),
      };
    }
  },

  /**
   * Check all services
   */
  async checkAllServices(): Promise<ServiceCheck[]> {
    const checks = await Promise.all(
      SERVICES.map((svc) => this.checkService(svc.name, svc.url))
    );
    return checks;
  },

  /**
   * Ping all hosts
   */
  async pingAllHosts(): Promise<
    Array<{ name: string; host: string; reachable: boolean; latency?: number }>
  > {
    const results = await Promise.all(
      HOSTS_TO_PING.map(async ({ name, host }) => {
        const result = await this.ping(host);
        return { name, host, ...result };
      })
    );
    return results;
  },

  /**
   * Run health check - verifies all services reachable
   */
  async healthCheck(): Promise<NetworkHealthResult> {
    const [services, hosts] = await Promise.all([
      this.checkAllServices(),
      this.pingAllHosts(),
    ]);

    const issues: string[] = [];

    // Check services
    for (const svc of services) {
      if (svc.status === "down") {
        issues.push(`${svc.name} is DOWN: ${svc.error}`);
      } else if (svc.status === "degraded") {
        issues.push(`${svc.name} is degraded: ${svc.error}`);
      }
    }

    // Check hosts
    for (const host of hosts) {
      if (!host.reachable) {
        issues.push(`${host.name} (${host.host}) is unreachable`);
      }
    }

    let status: "ok" | "warn" | "critical" = "ok";
    let message = "All services reachable";

    if (issues.length > 0) {
      const critical = issues.some((i) => i.includes("DOWN") || i.includes("unreachable"));
      status = critical ? "critical" : "warn";
      message = issues.join("; ");
    }

    return { status, message, services, issues };
  },
};

/**
 * Tool definitions for the main agent
 */
export const networkTools = [
  {
    name: "network_ping",
    description: "Ping a host to check reachability",
    input_schema: {
      type: "object" as const,
      properties: {
        host: {
          type: "string",
          description: "Host to ping (IP or hostname)",
        },
      },
      required: ["host"],
    },
  },
  {
    name: "network_service",
    description: "Check if an HTTP service is responding",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "URL to check",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "network_health",
    description: "Run network health check - verifies all services and hosts reachable",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];
