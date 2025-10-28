import { request } from '../request'
import { getBlackTipsKey } from '../const'

(async () => {
  const blackTips = await request(getBlackTipsKey)
  if (!Array.isArray(blackTips)) return

  const encoder = new TextEncoder

  const filterQueries = [
    'query SELECT_QNA_LIST',
    'query SELECT_DISCUSS_LIST',
    'query SELECT_ENTRYSTORY',
    'query SELECT_COMMENTS',
  ]

  const originalFetch = fetch
  self.fetch = async (url: string | Request | URL, init?: RequestInit) => {
    let resSent: Response | null = null

    try {
      const body = init?.body
      if (typeof body != 'string') return originalFetch(url, init)

      const { query } = JSON.parse(body)
      if (!filterQueries.some(q => query.trim().startsWith(q))) return originalFetch(url, init)

      const res = resSent = await originalFetch(url, init)

      return new Response(new ReadableStream({
        async start(controller) {
          const data = await res.json()

          try {
            const listData = data.data
            filterList(listData.discussList)
            filterList(listData.commentList)
          } catch {}

          controller.enqueue(encoder.encode(JSON.stringify(data)))
          controller.close()
        },
      }), res)
    } catch {
      return resSent || originalFetch(url, init)
    }
  }

  interface DiscussList {
    list: Discuss[]
    total: number
  }

  interface Discuss {
    id: string
  }

  // 함수 선언문으로 작성 시 호이스팅으로 인해
  // blackTips의 타입 검증이 불가능하므로 할당 방식을 사용함
  const filterList = (list: DiscussList) => {
    try {
      const filtered = list.list.filter(({ id }) => !blackTips.includes(id))
      list.total += filtered.length - list.list.length
      list.list = filtered
    } catch {}
  }
})()
