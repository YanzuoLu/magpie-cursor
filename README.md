# magpie-cursor

Cursor subscriptions in [magpie](https://github.com/yetone/magpie) through
[dsh-cursor](https://github.com/YanzuoLu/dsh-cursor), the in-process Cursor
provider of DeepSeek Harness. Provider id: `cursor`.

dsh-cursor's wire protocol, Run runtime, model catalog and OAuth are bundled
as they are. This package adds a Chat Completions front, magpie's sign-in and
model hooks, and durable conversation state on disk.

- A Cursor Run stays alive across tool handoffs. The request that carries the
  tools' results resumes the original execution ids; a Run waits up to 30
  minutes for them.
- Each conversation keeps Cursor's checkpoint and a stable blob-cache key, so a
  new turn resumes server-side state instead of uploading the history again,
  across magpie restarts too. Histories of 4 MiB or more use Cursor's native
  RunSSE/BidiAppend upload.
- Cursor receives a names-only MCP directory of the caller's tools; their full
  schemas go through Cursor's MCP-state request.
- Usage is reported on every step: the context Cursor's checkpoint says it
  occupied, or a model call's own counters when Cursor sends them. At the end
  of a turn, whatever of Cursor's own count for the whole Run the steps have
  not reported goes as `magpie_deferred`, so a turn adds up to what Cursor
  counted.
- A conversation is named by Codex's `prompt_cache_key`, else magpie's
  session, with its first user message.

## Install

```sh
pnpm install --config.auto-install-peers=false && pnpm run build
magpie plugin add /path/to/magpie-cursor
magpie plugin use magpie-cursor cursor
```

`magpie plugin use @magpie-community/opencode-cursor-auth cursor` switches
back. Both read the same sign-in.

## Sign-in

- **Cursor (browser)**: dsh-cursor's Deep Control PKCE sign-in. Tokens are
  renewed with the refresh token and saved back to magpie.
- **cursor-agent's sign-in**: the token `cursor-agent login` keeps (macOS
  keychain, else `~/.cursor/auth.json`), read each time and never written. When
  it has less than 5 minutes left, `cursor-agent status` renews it.

## Data

Conversation checkpoints, blob packs, the model catalog and `cursor.log`
(Run milestones and turn usage) are in `$XDG_DATA_HOME/magpie-cursor`
(`~/.local/share/magpie-cursor`), or `$MAGPIE_CURSOR_DATA`. Checkpoints older
than a day, beyond the newest 64, are dropped.

## Not included

magpie's plan-usage rings and outside-call history (`usage`, `calls`), API-key
sign-in and Fast-mode switching through `service_tier`. Fast lanes are
listed as models of their own.

MIT. Upstream notices are in dsh-cursor's UPSTREAM.md.
