# Security Policy

## Reporting a vulnerability

Please do not open a public issue for security problems.

- Preferred: open a [private security advisory](https://github.com/popnow-ai/popnow-mcp/security/advisories/new) on GitHub.
- Or email **support@popnow.ai** with "Security" in the subject.

Include the affected component (the hosted server at `https://api.popnow.ai/mcp`, the OAuth flow, or the
`@popnow/mcp` package), steps to reproduce and the impact you observed. We will acknowledge your report and keep
you updated while we fix it.

## Leaked API keys

If you exposed a `sk-popnow-` key, revoke it right away in the [API console](https://popnow.ai/api/console/keys)
and create a new one. To cut off an OAuth-connected app, use **Account settings → Devices → Connected AI apps**
on [popnow.ai](https://popnow.ai/me/settings/sessions).
