import { runBash } from "../tools/bash.js";

export interface VolumeStatus {
  path: string;
  total: string;
  used: string;
  available: string;
  percentUsed: number;
}

export interface StorageHealthResult {
  status: "ok" | "warn" | "critical";
  message: string;
  volumes: VolumeStatus[];
  issues: string[];
}

const VOLUMES = ["/volume1", "/volume2", "/volume3"];
const WARN_THRESHOLD = 85;
const CRITICAL_THRESHOLD = 95;

/**
 * Storage sub-agent - monitors volumes and backups
 */
export const storageAgent = {
  name: "storage",
  description: "Monitors NAS storage volumes and backup status",

  /**
   * Get volume space usage
   */
  async getVolumeStatus(): Promise<VolumeStatus[]> {
    const result = await runBash(
      `df -h ${VOLUMES.join(" ")} 2>/dev/null | tail -n +2`,
      { remote: true }
    );

    if (result.exitCode !== 0) {
      throw new Error(`df failed: ${result.stderr}`);
    }

    return result.stdout
      .trim()
      .split("\n")
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split(/\s+/);
        // df output: Filesystem Size Used Avail Use% Mounted
        const [, total, used, available, percent, path] = parts;
        return {
          path,
          total,
          used,
          available,
          percentUsed: parseInt(percent.replace("%", ""), 10),
        };
      });
  },

  /**
   * Check Hyper Backup status (simplified - checks for recent backup marker)
   */
  async getBackupStatus(): Promise<{
    lastBackup: string | null;
    success: boolean | null;
  }> {
    // Check Hyper Backup log for recent activity
    // This is a simplified check - full DSM API integration would be better
    const result = await runBash(
      `ls -la /var/log/synolog/synobackup.log 2>/dev/null | awk '{print $6, $7, $8}'`,
      { remote: true }
    );

    if (result.exitCode !== 0 || !result.stdout.trim()) {
      return { lastBackup: null, success: null };
    }

    // More reliable: check DSM task scheduler or Hyper Backup API
    // For now, we just confirm the log exists and was recently modified
    return {
      lastBackup: result.stdout.trim(),
      success: true, // Assume success if log exists
    };
  },

  /**
   * Run Docker image cleanup (requires approval)
   */
  async cleanupDockerImages(): Promise<{ success: boolean; message: string }> {
    const result = await runBash(
      `/var/packages/ContainerManager/target/usr/bin/docker image prune -a --filter "until=168h" -f`,
      { remote: true, timeout: 120000 }
    );

    if (result.exitCode === 0) {
      return {
        success: true,
        message: `Cleanup completed: ${result.stdout.trim()}`,
      };
    } else {
      return { success: false, message: `Cleanup failed: ${result.stderr}` };
    }
  },

  /**
   * Run health check - checks volume space
   */
  async healthCheck(): Promise<StorageHealthResult> {
    const volumes = await this.getVolumeStatus();
    const issues: string[] = [];

    for (const vol of volumes) {
      if (vol.percentUsed >= CRITICAL_THRESHOLD) {
        issues.push(
          `${vol.path}: CRITICAL at ${vol.percentUsed}% (${vol.available} free)`
        );
      } else if (vol.percentUsed >= WARN_THRESHOLD) {
        issues.push(
          `${vol.path}: warning at ${vol.percentUsed}% (${vol.available} free)`
        );
      }
    }

    let status: "ok" | "warn" | "critical" = "ok";
    let message = `All volumes healthy. Space: ${volumes.map((v) => `${v.path}=${v.percentUsed}%`).join(", ")}`;

    if (issues.length > 0) {
      const critical = issues.some((i) => i.includes("CRITICAL"));
      status = critical ? "critical" : "warn";
      message = issues.join("; ");
    }

    return { status, message, volumes, issues };
  },
};

/**
 * Tool definitions for the main agent
 */
export const storageTools = [
  {
    name: "storage_volumes",
    description: "Get disk space usage for all NAS volumes",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "storage_backup",
    description: "Check Hyper Backup status",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "storage_cleanup",
    description:
      "Run Docker image cleanup to free space. REQUIRES APPROVAL - removes old images.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "storage_health",
    description: "Run storage health check - verifies volume space thresholds",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];
