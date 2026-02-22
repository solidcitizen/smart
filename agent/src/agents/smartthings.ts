import { runBash } from "../tools/bash.js";

export interface DeviceInfo {
  id: string;
  label: string;
  type: string;
  security?: string;
  provisioningState?: string;
}

export interface LockStatus {
  id: string;
  label: string;
  battery: number | null;
  lockState: "locked" | "unlocked" | "unknown";
  security: string;
  provisioningState: string;
  healthy: boolean;
}

export interface SmartThingsHealthResult {
  status: "ok" | "warn" | "critical";
  message: string;
  locks: LockStatus[];
  issues: string[];
}

// Known lock device IDs from services.md
const LOCKS = {
  frontDoor: "a9a852ec-f357-4de0-a12b-240df0ade739",
  utilityDoor: "915d7c8b-b66f-414e-ae48-1fcfc9d53db5",
  garageDoor: "b608437a-d821-41f9-b8f1-24b858477b2d",
};

/**
 * SmartThings sub-agent - monitors Z-Wave devices
 */
export const smartthingsAgent = {
  name: "smartthings",
  description: "Monitors SmartThings Z-Wave devices (locks, heaters)",

  /**
   * Get device info including Z-Wave security and provisioning state
   */
  async getDeviceInfo(deviceId: string): Promise<DeviceInfo | null> {
    const result = await runBash(
      `smartthings devices ${deviceId} -j 2>/dev/null`,
      { remote: false } // SmartThings CLI runs locally
    );

    if (result.exitCode !== 0) {
      return null;
    }

    try {
      const device = JSON.parse(result.stdout);
      return {
        id: device.deviceId,
        label: device.label,
        type: device.deviceTypeName || device.name,
        security: device.zwave?.networkSecurityLevel,
        provisioningState: device.zwave?.provisioningState,
      };
    } catch {
      return null;
    }
  },

  /**
   * Get device status (battery, lock state, etc.)
   */
  async getDeviceStatus(deviceId: string): Promise<Record<string, unknown> | null> {
    const result = await runBash(
      `smartthings devices:status ${deviceId} -j 2>/dev/null`,
      { remote: false }
    );

    if (result.exitCode !== 0) {
      return null;
    }

    try {
      return JSON.parse(result.stdout);
    } catch {
      return null;
    }
  },

  /**
   * Get lock status including battery and provisioning state
   */
  async getLockStatus(deviceId: string, label: string): Promise<LockStatus> {
    const [info, status] = await Promise.all([
      this.getDeviceInfo(deviceId),
      this.getDeviceStatus(deviceId),
    ]);

    const battery =
      (status?.components as Record<string, unknown>)?.main?.battery?.battery?.value ?? null;
    const lockState =
      (status?.components as Record<string, unknown>)?.main?.lock?.lock?.value ?? "unknown";

    return {
      id: deviceId,
      label,
      battery: typeof battery === "number" ? battery : null,
      lockState: lockState as "locked" | "unlocked" | "unknown",
      security: info?.security || "unknown",
      provisioningState: info?.provisioningState || "unknown",
      healthy: info?.provisioningState === "PROVISIONED",
    };
  },

  /**
   * Get all lock statuses
   */
  async getAllLocks(): Promise<LockStatus[]> {
    const results = await Promise.all([
      this.getLockStatus(LOCKS.frontDoor, "Front Door"),
      this.getLockStatus(LOCKS.utilityDoor, "Utility Door"),
      this.getLockStatus(LOCKS.garageDoor, "Garage Door"),
    ]);
    return results;
  },

  /**
   * Run health check - checks batteries and provisioning state
   */
  async healthCheck(): Promise<SmartThingsHealthResult> {
    const locks = await this.getAllLocks();
    const issues: string[] = [];

    for (const lock of locks) {
      // Check battery
      if (lock.battery === null) {
        issues.push(`${lock.label}: battery level unknown`);
      } else if (lock.battery <= 20) {
        issues.push(`${lock.label}: battery critical (${lock.battery}%)`);
      } else if (lock.battery <= 35) {
        issues.push(`${lock.label}: battery low (${lock.battery}%)`);
      }

      // Check provisioning state
      if (lock.provisioningState !== "PROVISIONED") {
        issues.push(
          `${lock.label}: provisioning state ${lock.provisioningState} (needs re-pair)`
        );
      }

      // Note S0 legacy (higher battery drain)
      if (lock.security === "ZWAVE_S0_LEGACY") {
        // This is informational, not an issue
        // Front Door is known to use S0
      }
    }

    let status: "ok" | "warn" | "critical" = "ok";
    let message = "All locks healthy";

    if (issues.length > 0) {
      const critical = issues.some(
        (i) => i.includes("critical") || i.includes("NONFUNCTIONAL")
      );
      status = critical ? "critical" : "warn";
      message = issues.join("; ");
    }

    return { status, message, locks, issues };
  },
};

/**
 * Tool definitions for the main agent
 */
export const smartthingsTools = [
  {
    name: "smartthings_locks",
    description: "Get status of all Z-Wave locks (battery, lock state, provisioning)",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "smartthings_device",
    description: "Get detailed info about a specific SmartThings device",
    input_schema: {
      type: "object" as const,
      properties: {
        deviceId: {
          type: "string",
          description: "SmartThings device ID (UUID)",
        },
      },
      required: ["deviceId"],
    },
  },
  {
    name: "smartthings_health",
    description: "Run SmartThings health check - verifies lock batteries and provisioning",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];
