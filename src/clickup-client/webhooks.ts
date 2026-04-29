import { ClickUpClient } from './index.js';

export type WebhookEvent =
  | '*'
  | 'taskCreated'
  | 'taskUpdated'
  | 'taskDeleted'
  | 'taskMoved'
  | 'taskCommentPosted'
  | 'taskCommentUpdated'
  | 'taskAssigneeUpdated'
  | 'taskTagUpdated'
  | 'taskStatusUpdated'
  | 'taskTimeEstimateUpdated'
  | 'taskTimeTrackedUpdated'
  | 'taskDueDateUpdated'
  | 'taskPriorityUpdated'
  | 'listCreated'
  | 'listUpdated'
  | 'listDeleted'
  | 'folderCreated'
  | 'folderUpdated'
  | 'folderDeleted'
  | 'spaceCreated'
  | 'spaceUpdated'
  | 'spaceDeleted'
  | 'goalCreated'
  | 'goalUpdated'
  | 'goalDeleted'
  | 'keyResultCreated'
  | 'keyResultUpdated'
  | 'keyResultDeleted';

export interface Webhook {
  id: string;
  userid: number;
  team_id: number;
  endpoint: string;
  client_id?: string;
  events: WebhookEvent[];
  task_id?: string | null;
  list_id?: string | null;
  folder_id?: string | null;
  space_id?: string | null;
  health?: { status: string; fail_count: number };
  secret?: string;
}

export interface CreateWebhookParams {
  endpoint: string;
  events: WebhookEvent[] | '*';
  space_id?: string;
  folder_id?: string;
  list_id?: string;
  task_id?: string;
  health_check_url?: string;
}

export interface UpdateWebhookParams {
  endpoint?: string;
  events?: WebhookEvent[] | '*';
  status?: 'active' | 'inactive';
}

export class WebhooksClient {
  private client: ClickUpClient;

  constructor(client: ClickUpClient) {
    this.client = client;
  }

  /**
   * List all webhooks registered on a workspace. Use this to inspect existing
   * subscriptions before creating new ones, or to find webhook IDs for
   * update/delete operations.
   * @param workspaceId The workspace (team) ID
   */
  async getWebhooks(workspaceId: string): Promise<{ webhooks: Webhook[] }> {
    return this.client.get(`/team/${workspaceId}/webhook`);
  }

  /**
   * Register a new webhook. Scope is determined by which optional id is passed:
   * if none, the webhook is workspace-wide; if space_id/folder_id/list_id/task_id
   * is set, scope narrows accordingly. The HTTP response body returns the secret
   * used to sign payloads (X-Signature header) — store it securely.
   * @param workspaceId The workspace (team) ID
   * @param params Webhook config
   */
  async createWebhook(
    workspaceId: string,
    params: CreateWebhookParams
  ): Promise<{ id: string; webhook: Webhook }> {
    return this.client.post(`/team/${workspaceId}/webhook`, params);
  }

  /**
   * Update an existing webhook (endpoint URL, event filter, or active status).
   * Pass status='inactive' to pause without deleting.
   * @param webhookId The ID of the webhook
   * @param params Fields to update
   */
  async updateWebhook(
    webhookId: string,
    params: UpdateWebhookParams
  ): Promise<{ id: string; webhook: Webhook }> {
    return this.client.put(`/webhook/${webhookId}`, params);
  }

  /**
   * Delete a webhook subscription permanently. ClickUp stops POSTing events
   * to its endpoint immediately.
   * @param webhookId The ID of the webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    await this.client.delete(`/webhook/${webhookId}`);
  }
}

export const createWebhooksClient = (client: ClickUpClient): WebhooksClient => {
  return new WebhooksClient(client);
};
