import { runBash } from "../tools/bash.js";

export interface CertStatus {
  domain: string;
  issuer: string;
  notBefore: Date;
  notAfter: Date;
  daysUntilExpiry: number;
  valid: boolean;
}

export interface CertsHealthResult {
  status: "ok" | "warn" | "critical";
  message: string;
  certs: CertStatus[];
  issues: string[];
}

const DOMAINS_TO_CHECK = ["ha.conant.com"];
const WARN_DAYS = 30;
const CRITICAL_DAYS = 14;

/**
 * Certs sub-agent - monitors SSL certificates
 */
export const certsAgent = {
  name: "certs",
  description: "Monitors SSL certificate expiry",

  /**
   * Check certificate for a domain
   */
  async checkCert(domain: string, port: number = 443): Promise<CertStatus | null> {
    const result = await runBash(
      `echo | openssl s_client -connect ${domain}:${port} -servername ${domain} 2>/dev/null | openssl x509 -noout -dates -issuer 2>/dev/null`,
      { remote: false, timeout: 15000 }
    );

    if (result.exitCode !== 0 || !result.stdout.trim()) {
      return null;
    }

    const output = result.stdout;

    // Parse dates and issuer
    const notBeforeMatch = output.match(/notBefore=(.+)/);
    const notAfterMatch = output.match(/notAfter=(.+)/);
    const issuerMatch = output.match(/issuer=(.+)/);

    if (!notBeforeMatch || !notAfterMatch) {
      return null;
    }

    const notBefore = new Date(notBeforeMatch[1]);
    const notAfter = new Date(notAfterMatch[1]);
    const issuer = issuerMatch ? issuerMatch[1].trim() : "unknown";

    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysUntilExpiry = Math.floor(
      (notAfter.getTime() - now.getTime()) / msPerDay
    );

    return {
      domain,
      issuer,
      notBefore,
      notAfter,
      daysUntilExpiry,
      valid: now >= notBefore && now <= notAfter,
    };
  },

  /**
   * Check local certificate files on NAS
   */
  async checkLocalCert(): Promise<{
    exists: boolean;
    path: string;
    daysUntilExpiry?: number;
  }> {
    const certPath = "/volume3/docker/acme.sh/*.conant.com_ecc";

    const result = await runBash(
      `openssl x509 -in ${certPath}/fullchain.cer -noout -enddate 2>/dev/null`,
      { remote: true }
    );

    if (result.exitCode !== 0) {
      return { exists: false, path: certPath };
    }

    const match = result.stdout.match(/notAfter=(.+)/);
    if (!match) {
      return { exists: true, path: certPath };
    }

    const notAfter = new Date(match[1]);
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysUntilExpiry = Math.floor(
      (notAfter.getTime() - now.getTime()) / msPerDay
    );

    return { exists: true, path: certPath, daysUntilExpiry };
  },

  /**
   * Run health check - checks certificate expiry
   */
  async healthCheck(): Promise<CertsHealthResult> {
    const certs: CertStatus[] = [];
    const issues: string[] = [];

    // Check each domain
    for (const domain of DOMAINS_TO_CHECK) {
      const cert = await this.checkCert(domain);
      if (!cert) {
        issues.push(`${domain}: could not check certificate`);
        continue;
      }

      certs.push(cert);

      if (!cert.valid) {
        issues.push(`${domain}: certificate is invalid or expired`);
      } else if (cert.daysUntilExpiry <= CRITICAL_DAYS) {
        issues.push(
          `${domain}: certificate expires in ${cert.daysUntilExpiry} days (CRITICAL)`
        );
      } else if (cert.daysUntilExpiry <= WARN_DAYS) {
        issues.push(
          `${domain}: certificate expires in ${cert.daysUntilExpiry} days`
        );
      }
    }

    let status: "ok" | "warn" | "critical" = "ok";
    let message = `All certificates valid. Expiry: ${certs.map((c) => `${c.domain}=${c.daysUntilExpiry}d`).join(", ")}`;

    if (issues.length > 0) {
      const critical = issues.some(
        (i) => i.includes("CRITICAL") || i.includes("expired") || i.includes("invalid")
      );
      status = critical ? "critical" : "warn";
      message = issues.join("; ");
    }

    return { status, message, certs, issues };
  },
};

/**
 * Tool definitions for the main agent
 */
export const certsTools = [
  {
    name: "certs_check",
    description: "Check SSL certificate expiry for monitored domains",
    input_schema: {
      type: "object" as const,
      properties: {
        domain: {
          type: "string",
          description: "Optional: specific domain to check. Default: all monitored domains",
        },
      },
      required: [],
    },
  },
  {
    name: "certs_local",
    description: "Check local acme.sh certificate files on NAS",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "certs_health",
    description: "Run certificate health check - verifies all certs not expiring soon",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];
