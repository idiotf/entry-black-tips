import { entryOrigin } from './const'

let reqId = 0

export function request(handleType: string, data?: unknown, transfer?: Transferable[]) {
  const currentReqId = reqId++
  postMessage({ [currentReqId]: { [handleType]: data } }, entryOrigin, transfer)

  return new Promise(resolve => {
    function handleMessage({ data, origin }: MessageEvent<unknown>) {
      if (origin != entryOrigin || typeof data != 'object' || !data) return

      const res = data[~currentReqId as never]
      if (typeof res != 'object' || !res || !Object.hasOwn(res, handleType)) return

      const handleRes = res[handleType as never]
      resolve(handleRes)
      removeEventListener('message', handleMessage)
    }

    addEventListener('message', handleMessage)
  })
}

interface HandlerType {
  (data: unknown, transfer: (item: Transferable) => void): unknown
}

export function registerHandler(handlers: Record<string, HandlerType>) {
  addEventListener('message', ({ data, origin }: MessageEvent<unknown>) => {
    if (origin != entryOrigin || typeof data != 'object' || !data) return

    const transfers: Transferable[] = []
    for (const reqId in data) {
      if (reqId[0] == '-' || !Object.hasOwn(data, reqId)) continue

      const reqs: unknown = data[reqId as never]
      if (typeof reqs != 'object' || !reqs) continue

      transfers.length = 0
      const transfer = (data: Transferable) => transfers.push(data)

      for (const handleType in reqs) {
        if (!Object.hasOwn(reqs, handleType)) continue

        Promise.resolve(handlers[handleType]?.(reqs[handleType as never], transfer))
          .then(v => postMessage({ [~reqId]: { [handleType]: v } }, entryOrigin, transfers))
      }
    }
  })
}
