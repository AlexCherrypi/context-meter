import type { EngineInterface, Register } from 'claude-code'

type Context = { tokens?: number; window: number; percent?: number }

// As CTM writes them: 950, 1.2k, 84k, 1.00M.
function fmtTokens(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (abs >= 10_000) return `${Math.round(n / 1000)}k`
  if (abs >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

// "ctx ▰▰▱▱▱▱▱▱ 20% · 201k / 1.00M"; before the first response of a window: "ctx – / 1.00M".
export function statusText(c: Context): string {
  if (c.tokens === undefined) return `ctx – / ${fmtTokens(c.window)}`
  const pct = Math.min(100, c.percent ?? Math.round((c.tokens / c.window) * 100))
  const filled = Math.round((pct / 100) * 8)
  return `ctx ${'▰'.repeat(filled)}${'▱'.repeat(8 - filled)} ${pct}% · ${fmtTokens(c.tokens)} / ${fmtTokens(c.window)}`
}

let lastStatus: string | undefined

function show($: EngineInterface, c: Context): void {
  const text = statusText(c)
  if (text === lastStatus) return
  lastStatus = text
  $.ui.status(text)
}

export const register: Register = on => {
  lastStatus = undefined

  on('session.start', async ($, e, next) => {
    try {
      show($, (await $.session.usage()).context)
    } catch {
      // no figures yet: the first measurement brings them
    }
    return next(e)
  })

  on('session.measure', ($, e, next) => {
    if (e.changed.includes('context')) show($, e.context)
    return next(e)
  })
}
