# LinkedIn Messaging (via MCP)

> **Universal guide** — works with any MCP-compatible client (Hermes Agent,
> Claude Desktop, Cursor, VS Code, Continue.dev, Copilot, custom scripts).
> The `linkedin-scraper-mcp` server speaks the standard MCP protocol, so you
> can use it from any client that supports MCP tools.

## Overview

Send, read, and manage **LinkedIn messages** through the
[linkedin-scraper-mcp](https://github.com/WillHannon/linkedin-scraper-mcp)
MCP server. It uses browser-based session auth (no username/password in
config) and exposes standard MCP tools for searching people, sending
messages, managing conversations, and sending connection requests.

**How it works:**

1. You run `linkedin-scraper-mcp` as an MCP server (via `uvx` or `pip`)
2. Your MCP client connects to it and discovers its tools
3. You authenticate once via browser login (saved as browser cookies)
4. Tools are available as standard MCP tool calls


## Prerequisites

- **Python 3.10+** with `uv` installed (`pip install uv`) or just `pip`
- **MCP-compatible client** — Hermes Agent, Claude Desktop, Cursor, VS Code
  (with the Cline or Continue extension), or any MCP host
- **LinkedIn account** — you'll log in via browser once (credentials never
  stored in config files)


## Installation & Configuration

### Step 1: Install the server

```bash
# Recommended — self-contained, no install
uvx linkedin-scraper-mcp@latest

# Alternative via pip
pip install linkedin-scraper-mcp
```

Verify it works:
```bash
uvx linkedin-scraper-mcp@latest --help
```

### Step 2: Add MCP config for your client

The MCP config format varies by client. Choose yours below.

#### Hermes Agent

Find your config path first:
```bash
hermes config path
```

Add to that file:
```yaml
mcp_servers:
  linkedin:
    command: cmd       # On Linux/Mac: replace 'cmd /c' with just the command
    args:
      - /c
      - uvx
      - linkedin-scraper-mcp@latest
    env:
      UV_HTTP_TIMEOUT: "300"
    timeout: 300
    connect_timeout: 120
```

> **⚠️ Windows path warning**: `~/.hermes/config.yaml` is NOT where Hermes
> reads config on Windows. Use `hermes config path` to find the real location
> (typically `C:\Users\<user>\AppData\Local\hermes\config.yaml`).

After adding, restart Hermes or reload config. Verify with `hermes tools` —
you should see `mcp_linkedin_*` entries.

#### Claude Desktop

Edit `claude_desktop_config.json` (open via Claude → Settings → Developer):

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "uvx",
      "args": ["linkedin-scraper-mcp@latest"],
      "env": {
        "UV_HTTP_TIMEOUT": "300"
      }
    }
  }
}
```

On Windows, you may need the `cmd /c` wrapper:
```json
{
  "mcpServers": {
    "linkedin": {
      "command": "cmd",
      "args": ["/c", "uvx", "linkedin-scraper-mcp@latest"],
      "env": {
        "UV_HTTP_TIMEOUT": "300"
      }
    }
  }
}
```

#### Cursor / VS Code (Cline / Continue)

In `.cursor/mcp.json` or VS Code's MCP config:
```json
{
  "mcpServers": {
    "linkedin": {
      "command": "uvx",
      "args": ["linkedin-scraper-mcp@latest"]
    }
  }
}
```

#### Generic MCP Client (stdio transport)

```bash
uvx linkedin-scraper-mcp@latest
```

The server speaks stdio-based MCP. Connect your client's MCP transport to
this process and it will advertise the LinkedIn tools automatically.


### Step 3: One-time login (same for every client)

**You do NOT put your LinkedIn username or password anywhere in the config.**
The server uses **session-based auth** — browser cookies, not credentials.

Run this **once** in your terminal:

```bash
uvx linkedin-scraper-mcp@latest --login
```

This opens a Chromium browser window. **Log into LinkedIn manually** in that
window (email + password, 2FA if enabled, any captcha challenges). Once
you're logged in, close the browser. The session is saved to
`~/.linkedin-mcp/profile/`.

After that, every tool call reuses that saved session automatically — no
re-login needed, regardless of which MCP client you use.

> **When to re-authenticate**: If you get an `AuthenticationError`, the session
> has expired. Re-run `uvx linkedin-scraper-mcp@latest --login`.
> LinkedIn sessions typically last days to weeks.

> **Login tips**:
> - LinkedIn may send a **mobile app confirmation notification** — approve it
> - LinkedIn may show a **captcha** — solve it manually in the browser window
> - The `--login` command has a **5-minute timeout** for 2FA / captcha


## Available MCP Tools

These are the **standard MCP tool names** exported by `linkedin-scraper-mcp`.
Your client may prefix them (e.g., Hermes uses `mcp_linkedin_*`). Call them
using whatever naming convention your MCP client uses.

| MCP Tool | Parameters | What It Does |
|----------|-----------|-------------|
| `linkedin_search_people` | `keywords`, `location?` | Find profiles by name, company, or keyword |
| `linkedin_get_person_profile` | `linkedin_username`, `sections?` | Full profile details + `profile_urn` for reliable messaging |
| `linkedin_get_inbox` | `limit=20` | List recent conversations (limit 1-50) |
| `linkedin_get_conversation` | `linkedin_username?`, `thread_id?`, `index?` | Read a specific thread |
| `linkedin_search_conversations` | `keywords`, `limit=10` | Full-text search across conversations |
| `linkedin_send_message` | `linkedin_username`, `message`, `confirm_send=False`, `profile_urn?` | Send a message (dry-run by default) |
| `linkedin_connect_with_person` | `linkedin_username`, `message?`, `profile_urn?` | Send a connection request + optional note |
| `linkedin_close_session` | — | Clean up browser session (call when done) |

### Naming in different clients

| Client | How tools appear |
|--------|-----------------|
| **Hermes Agent** | `mcp_linkedin_search_people`, `mcp_linkedin_send_message`, etc. |
| **Claude Desktop** | `linkedin_search_people`, `linkedin_send_message`, etc. |
| **Cursor / Cline** | `linkedin_search_people`, `linkedin_send_message`, etc. |
| **Generic MCP** | As registered by the server (no prefix) |

In code examples below, we use the **Hermes-style** naming (`mcp_linkedin_*`)
and the **generic** naming interchangeably. Adapt to your client.


## Sending Messages — Step by Step

### 1. Find the recipient

```python
# Hermes Agent
mcp_linkedin_search_people(keywords="Jane Doe", location="San Francisco")

# Generic MCP client
linkedin_search_people(keywords="Jane Doe", location="San Francisco")
```

Pick the right person and note their `linkedin_username` (the `/in/<username>/`
slug). If you already know the username (e.g. `janedoe`), skip to step 2.

### 2. (Recommended) Get the profile_urn

The `profile_urn` makes sending more reliable — it constructs the compose URL
directly instead of hunting for a Message button:

```python
profile = linkedin_get_person_profile(linkedin_username="janedoe", sections="contact_info")
```

Extract the `profile_urn` from the `references` in the response (e.g.
`"ACoAAB..."`). Store it for the send call.

### 3. Dry run (confirm_send=False — this is the default)

You **don't need to opt into** dry-run mode — `confirm_send=False` is the
default. The call verifies recipient resolution without sending:

```python
result = linkedin_send_message(
    linkedin_username="janedoe",
    message="Hi Jane, I saw your post about X and would love to connect!",
    confirm_send=False,
    profile_urn="ACoAAB..."
)
```

Check `result.status`:

| Status | Meaning |
|--------|---------|
| `"confirmation_required"` | ✅ Recipient resolved, composer opened. Safe to send. |
| `"recipient_resolution_failed"` | ❌ Couldn't find the recipient. Try `profile_urn`. |
| `"message_unavailable"` | ❌ Too distant (3rd+ degree / no InMail). Connect first. |
| `"composer_unavailable"` | ❌ Composer loaded but no text box. Retry or re-login. |
| `"compose_interact_failed"` | ❌ LinkedIn UI glitch. Retry once. |

### 4. Send for real

Once the dry run returns `"confirmation_required"`:

```python
result = linkedin_send_message(
    linkedin_username="janedoe",
    message="Hi Jane, I saw your post about X and would love to connect!",
    confirm_send=True,
    profile_urn="ACoAAB..."
)
print(result["status"])  # Should be "sent"
print(result["sent"])     # Should be True
```

> **Note**: `confirm_send=True` is a destructive action. In Hermes, the agent
> will prompt the user for confirmation before firing it. In other clients,
> the tool fires immediately — be deliberate.

### 5. Verify delivery

```python
# Check the most recent conversation
linkedin_get_inbox(limit=5)

# Or search for your sent message
linkedin_search_conversations(keywords="Hi Jane")
```

### 6. Clean up

```python
linkedin_close_session()
```

Always call this after you're done with LinkedIn actions to free the browser
session. If you forget, the next call creates a fresh session anyway, but
lingering Chromium processes consume memory.


## Connection-Request Workflow

If `linkedin_send_message` returns `"message_unavailable"`, the recipient is
too distant for direct messaging. Send a connection request instead:

```python
# 1. Send the connection request (with optional note)
linkedin_connect_with_person(
    linkedin_username="janedoe",
    message="Hi Jane, I really enjoyed your talk on AI ethics! Would love to connect.",
    profile_urn="ACoAAB..."
)

# 2. After they accept, send a follow-up message
linkedin_send_message(
    linkedin_username="janedoe",
    message="Thanks for connecting! I'd love to chat more about your work.",
    confirm_send=True,
    profile_urn="ACoAAB..."
)

# 3. Clean up
linkedin_close_session()
```

**Note**: Connection request notes are limited to **300 characters** and are
subject to LinkedIn's spam filtering. Keep notes personal and specific.


## Reading Inbox & Conversations

### List inbox
```python
linkedin_get_inbox(limit=10)
```

Returns raw text of recent conversations.

### Read a specific thread
```python
# By username (pick from inbox results)
linkedin_get_conversation(linkedin_username="janedoe", index=0)

# OR by thread_id (more reliable)
linkedin_get_conversation(thread_id="3554398d-c0b6-4f17-9412-1b1e43528dbb")
```

### Search conversations
```python
linkedin_search_conversations(keywords="project proposal", limit=10)
```


## Response Status Reference

The `send_message` and `connect_with_person` tools return a dict with:

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | One of the statuses below |
| `message` | string | Human-readable explanation |
| `recipient_selected` | bool | Whether LinkedIn matched the recipient |
| `sent` | bool | True only if the message was actually dispatched |
| `url` | string | The page URL at the time of action |
| `note_sent` | bool | (connect_with_person only) |

**All possible values of `status`**:

| Status | When It Happens | Action |
|--------|----------------|--------|
| `sent` | Message dispatched successfully | ✅ Done |
| `confirmation_required` | Dry-run: recipient found, message ready | Set `confirm_send=True` |
| `message_unavailable` | Recipient too distant / no message button | Use `connect_with_person` or find someone in-network |
| `recipient_resolution_failed` | Username wrong or ambiguous | Double-check username, provide `profile_urn` |
| `composer_unavailable` | Composer page loaded but no text field | Retry; if persists, re-authenticate |
| `compose_interact_failed` | React hydration glitch / UI changed | Retry once; if persists, re-authenticate |
| `send_failed` | LinkedIn rejected the send | Rate-limited or content policy. Wait ≥ 15 min, rephrase |


## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `AuthenticationError` | LinkedIn session expired | Re-run `uvx linkedin-scraper-mcp@latest --login` |
| Tool times out (≥300s) | Cold-start Chromium / slow network | Increase timeout in MCP config (try 450s) |
| `message_unavailable` | 3rd+ degree connection / no InMail | Connect first with `connect_with_person` |
| `recipient_resolution_failed` | Wrong username / ambiguous match | Fetch `profile_urn` via `get_person_profile` |
| `compose_interact_failed` | LinkedIn UI changed | Retry once; then re-authenticate |
| `send_failed` repeatedly | Rate-limited (too many sends too fast) | Wait ≥ 15 minutes, rephrase message, space sends |
| Server won't start (Windows) | `uvx` not installed or path issue | Ensure `uv` is in PATH, use `cmd /c` wrapper |
| Server won't start (Linux) | Missing Chromium deps | `sudo apt install -y chromium-browser` (or your distro's equivalent) |
| Server won't start (macOS) | Xcode tools missing | `xcode-select --install` |
| No tools visible | MCP client not connected or config wrong | Verify MCP config syntax, check client logs |


## Best Practices & Rate-Limiting

- **Always dry-run first** — `confirm_send=False` is the default, so you're
  already doing this. Read the status before sending.
- **One message at a time** — the server serializes all tool calls. Don't spam
  parallel sends; they'll queue anyway.
- **Space sends out** — LinkedIn's automated-activity detection triggers at
  roughly 3-5 messages/minute. Wait 15+ minutes between bulk sends.
- **Close sessions** — always call `linkedin_close_session()` when done.
- **Personalize every message** — generic templates get flagged as spam. Mention
  a specific post, shared connection, or mutual interest.
- **Connection notes ≤ 300 chars** — LinkedIn enforces this server-side. Count
  characters before sending.


## Quick-Start (Cheat Sheet)

```python
# === Works with any MCP client (adapt tool names as needed) ===

# 1. Find person
linkedin_search_people(keywords="Jane Doe Engineering Manager")

# 2. Get profile_urn
profile = linkedin_get_person_profile(linkedin_username="janedoe")
profile_urn = profile["references"][0]["profile_urn"]

# 3. Dry run
linkedin_send_message(linkedin_username="janedoe", message="Hello!", confirm_send=False, profile_urn=profile_urn)

# 4. If "confirmation_required" → send for real
linkedin_send_message(linkedin_username="janedoe", message="Hello!", confirm_send=True, profile_urn=profile_urn)

# 5. Done
linkedin_close_session()
```


## Hermes Agent — Additional Notes

When using this skill with **Hermes Agent** specifically:

- Tools are prefixed `mcp_linkedin_*` (e.g., `mcp_linkedin_search_people`)
- `send_message` and `connect_with_person` are annotated `destructiveHint` —
  Hermes prompts for user confirmation before executing
- Use `hermes config path` to find your config file location
- Verify connectivity: `hermes mcp test linkedin`
- After adding the MCP server, restart Hermes or run `/reload-mcp`
- The skill bakes in a dry-run-first approach: `confirm_send=False` is the
  default in all code examples


## Safety Notes

- `send_message` and `connect_with_person` change state on LinkedIn. In Hermes,
  these are annotated `destructiveHint` — the agent will confirm before sending.
- In other MCP clients, the tool fires immediately when called. Be deliberate.
- Rate-limit violations can get your LinkedIn account temporarily restricted.
  When in doubt, wait longer between messages.
- LinkedIn sessions are stored locally as browser cookies. Protect your
  `~/.linkedin-mcp/profile/` directory — anyone with access can act as you.
