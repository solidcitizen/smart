export interface HttpResponse {
  status: number;
  statusText: string;
  body: string;
  headers: Record<string, string>;
}

/**
 * Make an HTTP request
 */
export async function httpRequest(
  url: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  } = {}
): Promise<HttpResponse> {
  const { method = "GET", headers = {}, body, timeout = 10000 } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });

    const responseBody = await response.text();
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      headers: responseHeaders,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Tool definition for Claude
 */
export const httpTool = {
  name: "http_request",
  description:
    "Make an HTTP request to an API. Useful for querying Home Assistant, DSM, or other services.",
  input_schema: {
    type: "object" as const,
    properties: {
      url: {
        type: "string",
        description: "The URL to request",
      },
      method: {
        type: "string",
        enum: ["GET", "POST", "PUT", "DELETE"],
        description: "HTTP method. Default: GET",
      },
      headers: {
        type: "object",
        description: "HTTP headers as key-value pairs",
      },
      body: {
        type: "string",
        description: "Request body (for POST/PUT)",
      },
    },
    required: ["url"],
  },
};
