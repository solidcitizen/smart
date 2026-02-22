/**
 * Standalone health check script
 * Run with: npm run health
 */

import { dockerAgent } from "./agents/docker.js";
import { smartthingsAgent } from "./agents/smartthings.js";
import { storageAgent } from "./agents/storage.js";
import { certsAgent } from "./agents/certs.js";
import { networkAgent } from "./agents/network.js";

async function runFullHealthCheck(): Promise<void> {
  console.log("=================================");
  console.log("HomeIT Full Health Check");
  console.log(`Date: ${new Date().toISOString()}`);
  console.log("=================================\n");

  // Run all health checks in parallel
  const [docker, storage, certs, smartthings, network] = await Promise.all([
    dockerAgent.healthCheck().catch((e) => ({
      status: "critical" as const,
      message: `Error: ${e}`,
      containers: [],
      issues: [`Error: ${e}`],
    })),
    storageAgent.healthCheck().catch((e) => ({
      status: "critical" as const,
      message: `Error: ${e}`,
      volumes: [],
      issues: [`Error: ${e}`],
    })),
    certsAgent.healthCheck().catch((e) => ({
      status: "critical" as const,
      message: `Error: ${e}`,
      certs: [],
      issues: [`Error: ${e}`],
    })),
    smartthingsAgent.healthCheck().catch((e) => ({
      status: "critical" as const,
      message: `Error: ${e}`,
      locks: [],
      issues: [`Error: ${e}`],
    })),
    networkAgent.healthCheck().catch((e) => ({
      status: "critical" as const,
      message: `Error: ${e}`,
      services: [],
      issues: [`Error: ${e}`],
    })),
  ]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "ok":
        return "[OK]";
      case "warn":
        return "[WARN]";
      case "critical":
        return "[CRITICAL]";
      default:
        return "[?]";
    }
  };

  // Docker
  console.log("=== Docker Containers ===");
  console.log(`Status: ${statusIcon(docker.status)} ${docker.message}`);
  if (docker.containers.length > 0) {
    for (const c of docker.containers) {
      const icon = c.running ? "[UP]" : "[DOWN]";
      console.log(`  ${icon} ${c.name}: ${c.status}`);
    }
  }
  console.log();

  // Storage
  console.log("=== Storage Volumes ===");
  console.log(`Status: ${statusIcon(storage.status)} ${storage.message}`);
  if (storage.volumes.length > 0) {
    for (const v of storage.volumes) {
      const warn = v.percentUsed >= 85 ? " [!]" : "";
      console.log(`  ${v.path}: ${v.percentUsed}% used (${v.available} free)${warn}`);
    }
  }
  console.log();

  // Certificates
  console.log("=== Certificates ===");
  console.log(`Status: ${statusIcon(certs.status)} ${certs.message}`);
  if (certs.certs.length > 0) {
    for (const c of certs.certs) {
      const warn = c.daysUntilExpiry <= 30 ? " [!]" : "";
      console.log(`  ${c.domain}: expires in ${c.daysUntilExpiry} days${warn}`);
    }
  }
  console.log();

  // SmartThings
  console.log("=== SmartThings Locks ===");
  console.log(`Status: ${statusIcon(smartthings.status)} ${smartthings.message}`);
  if (smartthings.locks.length > 0) {
    for (const l of smartthings.locks) {
      const battWarn = l.battery !== null && l.battery <= 35 ? " [!]" : "";
      const provWarn = l.provisioningState !== "PROVISIONED" ? " [NONFUNCTIONAL]" : "";
      console.log(
        `  ${l.label}: ${l.lockState}, battery ${l.battery ?? "?"}%${battWarn}${provWarn}`
      );
    }
  }
  console.log();

  // Network
  console.log("=== Network Services ===");
  console.log(`Status: ${statusIcon(network.status)} ${network.message}`);
  if (network.services.length > 0) {
    for (const s of network.services) {
      const icon = s.status === "up" ? "[UP]" : s.status === "down" ? "[DOWN]" : "[?]";
      const time = s.responseTime ? ` (${s.responseTime}ms)` : "";
      console.log(`  ${icon} ${s.name}${time}`);
    }
  }
  console.log();

  // Summary
  console.log("=== Summary ===");
  const allStatuses = [docker, storage, certs, smartthings, network];
  const criticalCount = allStatuses.filter((s) => s.status === "critical").length;
  const warnCount = allStatuses.filter((s) => s.status === "warn").length;

  if (criticalCount > 0) {
    console.log(`CRITICAL: ${criticalCount} system(s) need immediate attention`);
  } else if (warnCount > 0) {
    console.log(`WARNING: ${warnCount} system(s) have warnings`);
  } else {
    console.log("All systems healthy!");
  }

  // Collect all issues
  const allIssues = [
    ...docker.issues.map((i) => `Docker: ${i}`),
    ...storage.issues.map((i) => `Storage: ${i}`),
    ...certs.issues.map((i) => `Certs: ${i}`),
    ...smartthings.issues.map((i) => `SmartThings: ${i}`),
    ...network.issues.map((i) => `Network: ${i}`),
  ];

  if (allIssues.length > 0) {
    console.log("\nIssues:");
    for (const issue of allIssues) {
      console.log(`  - ${issue}`);
    }
  }
}

runFullHealthCheck()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Health check failed:", e);
    process.exit(1);
  });
