import cron from "node-cron";
import { dockerAgent } from "./agents/docker.js";
import { smartthingsAgent } from "./agents/smartthings.js";
import { storageAgent } from "./agents/storage.js";
import { certsAgent } from "./agents/certs.js";
import { networkAgent } from "./agents/network.js";
import { notify } from "./tools/notify.js";

interface AlertState {
  lastAlerted: Date;
  issue: string;
}

// Track alerts to avoid duplicates
const alertHistory: Map<string, AlertState> = new Map();
const ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if we should send an alert (respects cooldown)
 */
function shouldAlert(key: string, issue: string): boolean {
  const existing = alertHistory.get(key);
  if (!existing) return true;

  const now = new Date();
  const timeSinceLastAlert = now.getTime() - existing.lastAlerted.getTime();

  // Re-alert if issue changed or cooldown expired
  if (existing.issue !== issue || timeSinceLastAlert >= ALERT_COOLDOWN_MS) {
    return true;
  }

  return false;
}

/**
 * Record that we sent an alert
 */
function recordAlert(key: string, issue: string): void {
  alertHistory.set(key, { lastAlerted: new Date(), issue });
}

/**
 * Clear alert state when issue resolves
 */
function clearAlert(key: string): void {
  alertHistory.delete(key);
}

/**
 * Run health checks and send alerts if needed
 */
async function runHealthChecks(scope: "quick" | "full" = "quick"): Promise<void> {
  console.log(`[${new Date().toISOString()}] Running ${scope} health check...`);

  const issues: string[] = [];

  try {
    // Always check Docker and network (quick checks)
    const [dockerHealth, networkHealth] = await Promise.all([
      dockerAgent.healthCheck(),
      networkAgent.healthCheck(),
    ]);

    if (dockerHealth.status !== "ok") {
      issues.push(`Docker: ${dockerHealth.message}`);
      if (shouldAlert("docker", dockerHealth.message)) {
        await notify(dockerHealth.message, {
          title: "Docker Alert",
          priority: dockerHealth.status === "critical" ? "high" : "normal",
          tag: "docker-health",
        });
        recordAlert("docker", dockerHealth.message);
      }
    } else {
      clearAlert("docker");
    }

    if (networkHealth.status !== "ok") {
      issues.push(`Network: ${networkHealth.message}`);
      if (shouldAlert("network", networkHealth.message)) {
        await notify(networkHealth.message, {
          title: "Network Alert",
          priority: networkHealth.status === "critical" ? "high" : "normal",
          tag: "network-health",
        });
        recordAlert("network", networkHealth.message);
      }
    } else {
      clearAlert("network");
    }

    // Full checks include storage, certs, and SmartThings
    if (scope === "full") {
      const [storageHealth, certsHealth, smartthingsHealth] = await Promise.all([
        storageAgent.healthCheck(),
        certsAgent.healthCheck(),
        smartthingsAgent.healthCheck(),
      ]);

      if (storageHealth.status !== "ok") {
        issues.push(`Storage: ${storageHealth.message}`);
        if (shouldAlert("storage", storageHealth.message)) {
          await notify(storageHealth.message, {
            title: "Storage Alert",
            priority: storageHealth.status === "critical" ? "high" : "normal",
            tag: "storage-health",
          });
          recordAlert("storage", storageHealth.message);
        }
      } else {
        clearAlert("storage");
      }

      if (certsHealth.status !== "ok") {
        issues.push(`Certificates: ${certsHealth.message}`);
        if (shouldAlert("certs", certsHealth.message)) {
          await notify(certsHealth.message, {
            title: "Certificate Alert",
            priority: certsHealth.status === "critical" ? "high" : "normal",
            tag: "certs-health",
          });
          recordAlert("certs", certsHealth.message);
        }
      } else {
        clearAlert("certs");
      }

      if (smartthingsHealth.status !== "ok") {
        issues.push(`SmartThings: ${smartthingsHealth.message}`);
        if (shouldAlert("smartthings", smartthingsHealth.message)) {
          await notify(smartthingsHealth.message, {
            title: "SmartThings Alert",
            priority: smartthingsHealth.status === "critical" ? "high" : "normal",
            tag: "smartthings-health",
          });
          recordAlert("smartthings", smartthingsHealth.message);
        }
      } else {
        clearAlert("smartthings");
      }
    }

    if (issues.length === 0) {
      console.log(`[${new Date().toISOString()}] All checks passed`);
    } else {
      console.log(`[${new Date().toISOString()}] Issues found: ${issues.join("; ")}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Health check error:`, error);
    // Don't alert on transient errors
  }
}

/**
 * Start the scheduler
 */
export function startScheduler(): void {
  console.log("Starting HomeIT scheduler...");

  // Hourly: Quick checks (Docker, network)
  cron.schedule("0 * * * *", () => {
    runHealthChecks("quick");
  });

  // Every 6 hours: Full checks
  cron.schedule("0 */6 * * *", () => {
    runHealthChecks("full");
  });

  // Daily at 8 AM: Summary report (optional)
  cron.schedule("0 8 * * *", async () => {
    console.log(`[${new Date().toISOString()}] Daily summary...`);
    // Could send a daily summary notification here
  });

  // Run an initial check on startup
  setTimeout(() => {
    runHealthChecks("full");
  }, 5000);

  console.log("Scheduler started:");
  console.log("  - Hourly: Docker + network checks");
  console.log("  - Every 6h: Full health checks");
  console.log("  - Daily 8 AM: Summary");
}

// Export for manual runs
export { runHealthChecks };
