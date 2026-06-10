---
name: linkedin-messaging
description: >
  Use when the user needs to send, read, or manage LinkedIn messages,
  search for people on LinkedIn, view profiles, or send connection
  requests — including phrases like "send a LinkedIn message", "find
  someone on LinkedIn", "connect with [name] on LinkedIn", "check my
  LinkedIn inbox", "search LinkedIn for [person/company]", or any
  LinkedIn-based outreach or networking task. Covers the full workflow:
  search people, view profiles, send messages (with dry-run), manage
  conversations, and send connection requests. Does NOT cover LinkedIn
  scraping, data mining, or bulk automation beyond normal messaging
  limits.
---

# LinkedIn Messaging

Send, read, and manage **LinkedIn messages** through the MCP-based
`linkedin-scraper-mcp` server. This skill covers the complete workflow:
finding people, checking profiles, sending messages (with a mandatory
dry-run step), managing conversations, and sending connection requests.

## Prerequisites

- **Python 3.12+** with `uv` installed
- **LinkedIn account** — one-time browser login, credentials never stored in config
- **MCP-compatible client** — any MCP host (Claude Desktop, Cursor, VS Code, etc.)

## 🚫 Guardrails & Restrictions

The following tools provided by `linkedin-scraper-mcp` are **BLOCKED** — never invoke them:

| Blocked Tool | Why |
|-------------|-----|
| `linkedin_search_jobs` | Job search is out of scope for messaging/networking |
| `linkedin_get_job_details` | Job details are out of scope for messaging/networking |
| `linkedin_get_sidebar_profiles` | Sidebar recommendations are noise, not direct search |
| `linkedin_get_feed` | Home feed scraping is out of scope for messaging/networking |

## MCP Server Setup

### Step 1: Install the server

```bash
uvx linkedin-scraper-mcp@latest
```

Alternative via pip:

```bash
pip install linkedin-scraper-mcp
```

### Step 2: Register the MCP server

Register `linkedin-scraper-mcp` as an MCP server in your client. The server runs via:

```
uvx linkedin-scraper-mcp@latest
```

Set the environment variable `UV_HTTP_TIMEOUT=300` to prevent timeout on first install.
Refer to your MCP client's documentation for the exact config format and location.

### Step 3: One-time login

Run this **once** in your terminal:

```bash
uvx linkedin-scraper-mcp@latest --login
```

This opens a Chromium browser window. **Log into LinkedIn manually** in
that window (email + password, 2FA if enabled, any captcha challenges).
Once logged in, close the browser. The session is saved to
`~/.linkedin-mcp/profile/` and reused automatically thereafter.

> **Re-auth**: If you get an `AuthenticationError`, the session has
> expired. Re-run `uvx linkedin-scraper-mcp@latest --login`.

## Tool Reference

The server exports these MCP tools (tool names may be prefixed depending on
your MCP client — check your MCP client's tool listing for the actual names):

| MCP Tool | Parameters | What It Does |
|----------|------------|-------------|
| `linkedin_search_people` | `keywords`, `location?`, `network?` | Find profiles by name, company, or keyword |
| `linkedin_get_person_profile` | `linkedin_username`, `sections?` | Full profile details + `profile_urn` for reliable messaging |
| `linkedin_get_company_profile` | `company_name`, `sections?` | Company LinkedIn page details |
| `linkedin_get_company_employees` | `company_name`, `keywords?` | Employee list with demographics (location, education, function) |
| `linkedin_get_company_posts` | `company_name` | Recent posts from a company feed |
| `linkedin_get_inbox` | `limit=20` | List recent conversations (limit 1-50) |
| `linkedin_get_conversation` | `linkedin_username?`, `thread_id?`, `index?` | Read a specific thread |
| `linkedin_search_conversations` | `keywords`, `limit=10` | Full-text search across conversations |
| `linkedin_send_message` | `linkedin_username`, `message`, `confirm_send`, `profile_urn?` | Send a message (dry-run by default) |
| `linkedin_connect_with_person` | `linkedin_username`, `message?`, `profile_urn?` | Send a connection request + optional note |
| `linkedin_close_session` | — | Clean up browser session |

## Workflows

### Sending a Message

This is a **mandatory two-step process** — always dry-run before sending.

#### 1. Find the recipient

```
linkedin_search_people(keywords="Jane Doe Engineering Manager", location="San Francisco")
```

Pick the right person and note their `linkedin_username` (the `/in/<username>/` slug).

#### 2. (Recommended) Get the profile_urn

Fetches the `profile_urn` which makes sending more reliable:

```
profile = linkedin_get_person_profile(linkedin_username="janedoe", sections="contact_info")
```

Extract `profile_urn` from the `references` in the response.

#### 3. Dry run (confirm_send=False — default)

This **always runs first** and verifies recipient resolution without sending:

```
result = linkedin_send_message(
    linkedin_username="janedoe",
    message="Hi Jane, I saw your post about X and would love to connect!",
    confirm_send=False,
    profile_urn="ACoAAB..."
)
```

Interpret the `status` field:

| Status | Meaning | Next Step |
|--------|---------|-----------|
| `"confirmation_required"` | ✅ Recipient resolved, composer ready | Safe to send for real |
| `"recipient_resolution_failed"` | ❌ Could not find recipient | Try using `profile_urn` |
| `"message_unavailable"` | ❌ Too distant (3rd+ degree / no InMail) | Send connection request first |
| `"composer_unavailable"` | ❌ Composer loaded but no text box | Retry or re-authenticate |
| `"compose_interact_failed"` | ❌ LinkedIn UI glitch | Retry once; then re-authenticate |

#### 4. Send for real

Only when dry-run returns `"confirmation_required"`:

```
result = linkedin_send_message(
    linkedin_username="janedoe",
    message="Hi Jane, I saw your post about X and would love to connect!",
    confirm_send=True,
    profile_urn="ACoAAB..."
)
```

Expected: `result["status"] == "sent"`, `result["sent"] == True`.

> ⚠️ `confirm_send=True` is a **destructive action**. Some MCP clients prompt for
> user confirmation before firing; others fire immediately — be deliberate.

#### 5. Verify delivery

```
linkedin_get_inbox(limit=5)
# or
linkedin_search_conversations(keywords="Hi Jane")
```

#### 6. Clean up

```
linkedin_close_session()
```

Always call this after completing LinkedIn actions to free the browser
session and avoid lingering Chromium processes.

### Connection-Request Workflow

If `linkedin_send_message` returns `"message_unavailable"`, the recipient is
too distant for direct messaging. Send a connection request instead:

```
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

> **Connection notes ≤ 300 chars** — LinkedIn enforces this server-side.

### Reading Inbox & Conversations

```
# List recent conversations
linkedin_get_inbox(limit=10)

# Read a specific thread by username
linkedin_get_conversation(linkedin_username="janedoe", index=0)

# Or by thread_id (more reliable)
linkedin_get_conversation(thread_id="3554398d-c0b6-4f17-9412-1b1e43528dbb")

# Search conversations by keyword
linkedin_search_conversations(keywords="project proposal", limit=10)
```

### Searching People & Companies

```
# Find people
linkedin_search_people(keywords="Software Engineer at Google", location="Bangalore")

# Find people in your network only
linkedin_search_people(keywords="Recruiter", network=["F"])

# Company profile
linkedin_get_company_profile(company_name="microsoft")

# Company employees with demographics
linkedin_get_company_employees(company_name="microsoft", keywords="engineer")

# Company posts
linkedin_get_company_posts(company_name="microsoft")
```

## Best Practices & Rate-Limiting

- **Always dry-run first** — `confirm_send=False` is the default; read the
  status before sending for real
- **One message at a time** — server serializes all tool calls; parallel sends
  queue anyway
- **Space sends out** — LinkedIn's automated-activity detection triggers at
  roughly 3-5 messages per minute. Wait 15+ minutes between bulk sends
- **Personalize every message** — generic templates get flagged as spam.
  Mention a specific post, shared connection, or mutual interest
- **Connection notes ≤ 300 chars** — enforced server-side
- **Close sessions** — always call `linkedin_close_session()` when done
- **Protect your session** — `~/.linkedin-mcp/profile/` contains browser
  cookies; anyone with access can act as you

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
| Server won't start (Linux) | Missing Chromium deps | `sudo apt install -y chromium-browser` |
| Server won't start (macOS) | Xcode tools missing | `xcode-select --install` |
| No tools visible | MCP client not connected or config wrong | Verify MCP config syntax, check client logs |

## Quick-Start (Cheat Sheet)

```
# === Full message-sending workflow ===

# 1. Find person
linkedin_search_people(keywords="Jane Doe Engineering Manager")

# 2. Get profile_urn
profile = linkedin_get_person_profile(linkedin_username="janedoe")
profile_urn = profile["references"][0]["profile_urn"]

# 3. Dry run (confirm_send=False is default — always do this first)
linkedin_send_message(
    linkedin_username="janedoe",
    message="Hello!",
    confirm_send=False,
    profile_urn=profile_urn
)

# 4. If "confirmation_required" → send for real
linkedin_send_message(
    linkedin_username="janedoe",
    message="Hello!",
    confirm_send=True,
    profile_urn=profile_urn
)

# 5. Done — always close the session
linkedin_close_session()
```
