import { request } from '../request'
import { getBlackTipsKey } from '../const'

(async () => {
  const blackTips = await request(getBlackTipsKey, 0)
  if (!Array.isArray(blackTips)) return

  const encoder = new TextEncoder

  const allowedQueries = [
    'query SELECT_QNA_LIST',
    'query SELECT_DISCUSS_LIST',
    'query SELECT_ENTRYSTORY',
  ]

  const originalFetch = fetch
  self.fetch = async (url: string | Request | URL, init?: RequestInit) => {
    let resSent: Response | null = null

    try {
      const body = init?.body
      if (typeof body != 'string') return originalFetch(url, init)

      const { query } = JSON.parse(body)
      if (!allowedQueries.some(q => query.trim().startsWith(q))) return originalFetch(url, init)

      const res = resSent = await originalFetch(url, init)

      return new Response(new ReadableStream({
        async start(controller) {
          const data = await res.json()

          try {
            data.data.discussList.list = data.data.discussList.list.filter(({ id }: any) => !blackTips.includes(id))
          } catch {}

          controller.enqueue(encoder.encode(JSON.stringify(data)))
          controller.close()
        },
      }), res)
    } catch {
      return resSent || originalFetch(url, init)
    }
  }
})()
