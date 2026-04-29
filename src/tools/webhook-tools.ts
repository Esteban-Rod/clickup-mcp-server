import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createClickUpClient } from '../clickup-client/index.js';
import {
  createWebhooksClient,
  WebhookEvent,
  CreateWebhookParams,
  UpdateWebhookParams,
} from '../clickup-client/webhooks.js';

const clickUpClient = createClickUpClient();
const webhooksClient = createWebhooksClient(clickUpClient);

const EVENT_VALUES = [
  '*',
  'taskCreated',
  'taskUpdated',
  'taskDeleted',
  'taskMoved',
  'taskCommentPosted',
  'taskCommentUpdated',
  'taskAssigneeUpdated',
  'taskTagUpdated',
  'taskStatusUpdated',
  'taskTimeEstimateUpdated',
  'taskTimeTrackedUpdated',
  'taskDueDateUpdated',
  'taskPriorityUpdated',
  'listCreated',
  'listUpdated',
  'listDeleted',
  'folderCreated',
  'folderUpdated',
  'folderDeleted',
  'spaceCreated',
  'spaceUpdated',
  'spaceDeleted',
  'goalCreated',
  'goalUpdated',
  'goalDeleted',
  'keyResultCreated',
  'keyResultUpdated',
  'keyResultDeleted',
] as const;

export function setupWebhookTools(server: McpServer): void {
  server.tool(
    'get_webhooks',
    'List all webhooks registered on a ClickUp workspace. Returns each webhook with its endpoint URL, subscribed events, scope (workspace/space/folder/list/task), and health status. Use this to inspect existing subscriptions before creating new ones.',
    { workspace_id: z.string().describe('The workspace (team) ID') },
    async ({ workspace_id }) => {
      try {
        const result = await webhooksClient.getWebhooks(workspace_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: any) {
        console.error('Error getting webhooks:', error);
        return {
          content: [{ type: 'text', text: `Error getting webhooks: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'create_webhook',
    'Register a new webhook. ClickUp will POST event payloads to the endpoint URL. Scope is workspace-wide unless space_id/folder_id/list_id/task_id is provided (then it narrows to that container). The response includes a secret used to sign payloads via X-Signature header — store it securely. Useful event for tag-driven dispatch: "taskTagUpdated" fires on tag add/remove.',
    {
      workspace_id: z.string().describe('The workspace (team) ID'),
      endpoint: z.string().url().describe('The HTTPS URL ClickUp will POST events to'),
      events: z
        .array(z.enum(EVENT_VALUES))
        .min(1)
        .describe('List of event types to subscribe to. Pass ["*"] for all events.'),
      space_id: z.string().optional().describe('Narrow scope to a specific space'),
      folder_id: z.string().optional().describe('Narrow scope to a specific folder'),
      list_id: z.string().optional().describe('Narrow scope to a specific list'),
      task_id: z.string().optional().describe('Narrow scope to a specific task'),
      health_check_url: z.string().url().optional().describe('Optional health check URL ClickUp pings periodically'),
    },
    async (args) => {
      try {
        const { workspace_id, events, ...rest } = args;
        const params: CreateWebhookParams = {
          endpoint: rest.endpoint,
          events: events.length === 1 && events[0] === '*' ? '*' : (events as WebhookEvent[]),
        };
        if (rest.space_id) params.space_id = rest.space_id;
        if (rest.folder_id) params.folder_id = rest.folder_id;
        if (rest.list_id) params.list_id = rest.list_id;
        if (rest.task_id) params.task_id = rest.task_id;
        if (rest.health_check_url) params.health_check_url = rest.health_check_url;
        const result = await webhooksClient.createWebhook(workspace_id, params);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: any) {
        console.error('Error creating webhook:', error);
        return {
          content: [{ type: 'text', text: `Error creating webhook: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'update_webhook',
    'Update an existing webhook — change its endpoint URL or swap its event filter. Note: ClickUp does not support manual pause/resume on webhooks (the health.status field is read-only and auto-managed by ClickUp after repeated delivery failures). To pause a subscription, delete the webhook and recreate it when needed.',
    {
      webhook_id: z.string().describe('The ID of the webhook'),
      endpoint: z.string().url().optional().describe('New endpoint URL'),
      events: z
        .array(z.enum(EVENT_VALUES))
        .min(1)
        .optional()
        .describe('New list of event types. Pass ["*"] for all events.'),
    },
    async ({ webhook_id, endpoint, events }) => {
      try {
        const params: UpdateWebhookParams = {};
        if (endpoint) params.endpoint = endpoint;
        if (events) params.events = events.length === 1 && events[0] === '*' ? '*' : (events as WebhookEvent[]);
        const result = await webhooksClient.updateWebhook(webhook_id, params);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: any) {
        console.error('Error updating webhook:', error);
        return {
          content: [{ type: 'text', text: `Error updating webhook: ${error.message}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'delete_webhook',
    'Delete a webhook subscription permanently. ClickUp stops POSTing events to the endpoint immediately. The secret is irrecoverable after deletion.',
    { webhook_id: z.string().describe('The ID of the webhook to delete') },
    async ({ webhook_id }) => {
      try {
        await webhooksClient.deleteWebhook(webhook_id);
        return {
          content: [{ type: 'text', text: `Webhook ${webhook_id} deleted` }],
        };
      } catch (error: any) {
        console.error('Error deleting webhook:', error);
        return {
          content: [{ type: 'text', text: `Error deleting webhook: ${error.message}` }],
          isError: true,
        };
      }
    }
  );
}
