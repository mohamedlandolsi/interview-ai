interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
  companyId: string;
}

interface WebhookDelivery {
  url: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  responseTime: number;
}

/**
 * Sends a webhook event to all active webhooks for a company
 */
export async function sendWebhookEvent(
  companyId: string,
  event: string,
  data: any,
  webhooks: Array<{ id: string; url: string; events: string[]; isActive: boolean }>
): Promise<WebhookDelivery[]> {
  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
    companyId
  };

  const activeWebhooks = webhooks.filter(webhook => 
    webhook.isActive && webhook.events.includes(event)
  );

  const deliveries = await Promise.allSettled(
    activeWebhooks.map(webhook => sendSingleWebhook(webhook.url, payload))
  );

  return deliveries.map((result, index) => {
    const webhook = activeWebhooks[index];
    
    if (result.status === 'fulfilled') {
      return {
        url: webhook.url,
        ...result.value
      };
    } else {
      return {
        url: webhook.url,
        success: false,
        error: result.reason?.message || 'Unknown error',
        responseTime: 0
      };
    }
  });
}

/**
 * Sends a webhook to a single URL
 */
async function sendSingleWebhook(url: string, payload: WebhookPayload): Promise<Omit<WebhookDelivery, 'url'>> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InterviewAI-Webhook/1.0'
      },
      body: JSON.stringify(payload),
      // 10 second timeout
      signal: AbortSignal.timeout(10000)
    });

    const responseTime = Date.now() - startTime;

    return {
      success: response.ok,
      statusCode: response.status,
      responseTime
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    };
  }
}

/**
 * Test a webhook URL by sending a test event
 */
export async function testWebhook(url: string, companyId: string): Promise<WebhookDelivery> {
  const testPayload: WebhookPayload = {
    event: 'webhook.test',
    data: {
      message: 'This is a test webhook from InterviewAI'
    },
    timestamp: new Date().toISOString(),
    companyId
  };

  const result = await sendSingleWebhook(url, testPayload);
  
  return {
    url,
    ...result
  };
}

/**
 * Available webhook events
 */
export const WEBHOOK_EVENTS = [
  'interview.started',
  'interview.completed',
  'interview.cancelled',
  'candidate.invited',
  'template.created',
  'template.updated'
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];
