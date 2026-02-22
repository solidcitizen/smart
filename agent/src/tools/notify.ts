import { httpRequest } from "./http.js";

const HA_URL = process.env.HA_URL || "http://10.1.11.98:8123";
const HA_TOKEN = process.env.HA_TOKEN || "";

export interface NotifyOptions {
  title?: string;
  priority?: "low" | "normal" | "high";
  tag?: string; // For notification grouping/replacement
}

/**
 * Send a notification via Home Assistant to mobile devices
 */
export async function notify(
  message: string,
  options: NotifyOptions = {}
): Promise<{ success: boolean; error?: string }> {
  const { title = "HomeIT Agent", priority = "normal", tag } = options;

  if (!HA_TOKEN) {
    return { success: false, error: "HA_TOKEN not configured" };
  }

  // Build notification data
  const data: Record<string, unknown> = {
    push: {
      sound: priority === "high" ? "alarm" : "default",
    },
  };

  if (tag) {
    data.tag = tag;
    data.push = { ...data.push as object, "thread-id": tag };
  }

  try {
    // Notify all mobile devices registered with HA
    // This uses the notify.notify service which broadcasts to all
    const response = await httpRequest(
      `${HA_URL}/api/services/notify/notify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HA_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          title,
          data,
        }),
      }
    );

    if (response.status >= 200 && response.status < 300) {
      return { success: true };
    } else {
      return {
        success: false,
        error: `HA returned ${response.status}: ${response.body}`,
      };
    }
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Tool definition for Claude
 */
export const notifyTool = {
  name: "notify",
  description:
    "Send a push notification to mobile devices via Home Assistant. Use for alerts about infrastructure issues.",
  input_schema: {
    type: "object" as const,
    properties: {
      message: {
        type: "string",
        description: "The notification message",
      },
      title: {
        type: "string",
        description: "Notification title. Default: 'HomeIT Agent'",
      },
      priority: {
        type: "string",
        enum: ["low", "normal", "high"],
        description: "Notification priority. High uses alarm sound.",
      },
      tag: {
        type: "string",
        description:
          "Tag for grouping/replacing notifications. Same tag replaces previous.",
      },
    },
    required: ["message"],
  },
};
