# ClickUp MCP Server (extended fork)

> **Fork of [`nsxdavid/clickup-mcp-server`](https://github.com/nsxdavid/clickup-mcp-server)** with 18 additional tools and several bug fixes. Tracks upstream `main`; new features pushed here while we wait for upstream review (PRs [#5](https://github.com/nsxdavid/clickup-mcp-server/pull/5), [#6](https://github.com/nsxdavid/clickup-mcp-server/pull/6), [#7](https://github.com/nsxdavid/clickup-mcp-server/pull/7)).

A Model Context Protocol (MCP) server that provides a standardized interface for AI assistants to interact with the ClickUp API. This server enables AI systems to access and manipulate ClickUp data such as workspaces, spaces, folders, lists, tasks, docs, comments, and checklists.

## Install via npx (recommended)

```jsonc
// ~/.claude.json or your MCP config
"clickup": {
  "command": "npx",
  "args": ["-y", "github:Esteban-Rod/clickup-mcp-server#v1.13.0-fork"],
  "env": { "CLICKUP_API_TOKEN": "pk_..." }
}
```

The `prepare` script compiles TypeScript automatically after `npm install`, so `npx` works out of the box. Pin a tag (e.g. `v1.13.0-fork`) for reproducibility, or omit `#tag` to track `main`.

## What this fork adds (vs upstream v1.12.0)

- **`update_list.content`** — set list description (e.g. project mode marker on the first line).
- **`create_task` / `update_task`** — `custom_item_id` (mark as milestone, diamond on Gantt), `markdown_description` (rich-formatted), `archived`.
- **`delete_task`**, **`add_task_dependency`**, **`remove_task_dependency`**.
- **`update_space` / `create_space` / `delete_space`** — toggle ClickApps (priorities, milestones, time tracking, tags, checklists, custom fields, dependencies, portfolios, sprints, points), `multiple_assignees`, `private`.
- **Custom fields CRUD** — `get_custom_fields`, `create_custom_field`, `set_custom_field_value`, `remove_custom_field_value`.
- **`move_task_to_list`** — uses ClickUp v3 `home_list` endpoint.
- **`get_list_templates`** — list workspace list templates.
- **`get_folders`** — list folders in a space.
- **Tag management** — `update_task.tags` (replacement semantics, internally diff'd through add/remove because ClickUp's `PUT /task` ignores `tags`), `add_task_tag` (auto-creates on space), `remove_task_tag`, `get_space_tags`.
- **Webhook CRUD** — `get_webhooks`, `create_webhook`, `update_webhook`, `delete_webhook`.
- **`search_docs` rewritten** on top of v3 docs listing + client-side filter (the v2 `search` endpoint returns 404; v3 has no dedicated search endpoint).
- **`create_list_from_template_in_folder` / `..._in_space`** — URL path fix (was 404) + refetch to drop spurious `deleted: true` from the API response.

## Original upstream README

The remainder of this document is the original upstream README, kept as-is.

## Available Tools

- `get_workspaces`: Get the list of workspaces
- `get_spaces`: Get spaces within a workspace
- `get_tasks`: Get tasks from a list
- `create_task`: Create a new task
- `update_task`: Update an existing task
- `get_docs_from_workspace`: Get all docs from a workspace
- `create_folder`: Create a new folder in a space
- `get_lists`: Get lists in a folder or space
- `create_list`: Create a new list

## Installation

```bash
git clone https://github.com/nsxdavid/clickup-mcp-server.git
cd clickup-mcp-server
npm install
```

## Get ClickUp API Token

1. Log in to ClickUp account
2. Go to Settings > Apps
3. Click "Generate API Token"
4. Copy the token

## Configuration

Add to the MCP settings file:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "node",
      "args": ["/path/to/clickup-mcp-server/build/index.js"],
      "env": {
        "CLICKUP_API_TOKEN": "YOUR_API_TOKEN_HERE"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

* Make sure to correct the path
* Make sure to supply your API token

## Alternate Installation (npx)

For users who prefer not to clone the repository, the package can be run directly using npx:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": [
        "-y",
        "clickup-mcp-server"
      ],
      "env": {
        "CLICKUP_API_TOKEN": "YOUR_API_TOKEN_HERE"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

* Replace `YOUR_API_TOKEN_HERE` with your API token
* No installation or cloning is required with this method

## Configuration File Locations

- Cline VSCode Extension: `~/.vscode/extensions/saoudrizwan.claude-dev/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
- Claude Desktop Apps:
  - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
  - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

## Development

### Building

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## License

MIT
