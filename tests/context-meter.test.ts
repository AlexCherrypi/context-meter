import { describe, expect, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const status: { current: string | undefined } = { current: undefined }

function world(on: On, context: { tokens?: number; window: number; percent?: number }) {
  status.current = undefined
  on('ui.status', (_$, e) => {
    status.current = e.text
    return { value: undefined } as never
  })
  on('session.usage', () => ({ value: { startedAt: 0, context, rateLimits: [] } }) as never)
  on('session.start', () => ({ cwd: '/' }) as never)
  on('session.measure', (_$, e) => ({ changed: e.changed }) as never)
}

describe('context-meter', () => {
  test('shows the fill at session start, abbreviated as CTM does', async ($, on) => {
    world(on, { tokens: 201_000, window: 1_000_000, percent: 20 })
    await $.session.start({ cwd: '/' } as never)
    expect(status.current).toBe('ctx ▰▰▱▱▱▱▱▱ 20% · 201k / 1.00M')
  })

  test('follows a measurement', async ($, on) => {
    world(on, { tokens: 201_000, window: 1_000_000, percent: 20 })
    await $.session.start({ cwd: '/' } as never)
    await $.session.measure({
      context: { tokens: 1_234, window: 200_000 },
      rateLimits: [],
      changed: ['context'],
    } as never)
    expect(status.current).toBe('ctx ▱▱▱▱▱▱▱▱ 1% · 1.2k / 200k')
  })

  test('before the first response it shows only the window', async ($, on) => {
    world(on, { window: 1_000_000 })
    await $.session.start({ cwd: '/' } as never)
    expect(status.current).toBe('ctx – / 1.00M')
  })
})
