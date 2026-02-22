import { startScheduler } from "./scheduler.js";

console.log("=================================");
console.log("HomeIT Agent - Daemon Mode");
console.log("=================================");
console.log(`Started at: ${new Date().toISOString()}`);
console.log("");

// Start the scheduler
startScheduler();

// Keep the process running
console.log("Daemon running. Press Ctrl+C to stop.");

// Handle shutdown gracefully
process.on("SIGTERM", () => {
  console.log("Received SIGTERM, shutting down...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("Received SIGINT, shutting down...");
  process.exit(0);
});
