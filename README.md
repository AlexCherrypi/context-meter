# context-meter

Claude Code plugin that shows, small in the status line under the prompt, how much
of the context window the chat uses. 100 % is the full window; token counts are
abbreviated as CTM writes them (950, 1.2k, 84k, 1.00M):

```
ctx ▰▰▱▱▱▱▱▱ 20% · 201k / 1.00M
```

It follows the session's own measurements, so it moves with every response. Before
the first response of a window (a new session, after `/clear`) it shows only the
window size: `ctx – / 1.00M`.

## Install

From the personal marketplace `alexcherrypi`:

```
/plugin marketplace add AlexCherrypi/alexcherrypi-plugins
/plugin install context-meter@alexcherrypi
```

## Develop

```
claude plugin validate .
claude plugin test .
```
