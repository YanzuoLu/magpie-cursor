# magpie-cursor

Cursor subscriptions in [magpie](https://github.com/yetone/magpie) through
[dsh-cursor](https://github.com/YanzuoLu/dsh-cursor), the in-process Cursor
provider of DeepSeek Harness. Provider id: `cursor`.

Requests run on dsh-cursor's wire protocol, Run runtime and OAuth, bundled as
they are, with a Chat Completions front and durable conversation state on
disk. What magpie shows is
[@magpie-community/opencode-cursor-auth](https://github.com/magpie-community/plugins)'s
own, bundled at 0.2.44, so both plugins serve the same models under the same
ids: its model list (`claude-opus-5-5@1m`, efforts as variants, Fast through
`service_tier`), how a model id picks Cursor's variant and Max Mode, its plan
usage rings and its calls outside magpie.

- A Cursor Run stays alive across tool handoffs. The request that carries the
  tools' results resumes the original execution ids; a Run waits up to 30
  minutes for them.
- Each conversation keeps Cursor's checkpoint and a stable blob-cache key, so a
  new turn resumes server-side state instead of uploading the history again,
  across magpie restarts too. Histories of 4 MiB or more use Cursor's native
  RunSSE/BidiAppend upload.
- Cursor receives a names-only MCP directory of the caller's tools; their full
  schemas go through Cursor's MCP-state request.
- Usage is reported on every step from Cursor's own counters for each model
  call (or, without them, the context its checkpoint says the step occupied).
  At the end
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
- **Cursor API key**: exchanged for a token at `/auth/exchange_user_api_key`,
  and again when the token runs out.

## Data

Conversation checkpoints, blob packs, the model catalog and `cursor.log`
(Run milestones and turn usage) are in `$XDG_DATA_HOME/magpie-cursor`
(`~/.local/share/magpie-cursor`), or `$MAGPIE_CURSOR_DATA`. Checkpoints older
than a day, beyond the newest 64, are dropped.

MIT. Upstream notices are in dsh-cursor's UPSTREAM.md and the community plugin's package.
