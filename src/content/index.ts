import { getBlackTips } from '../const'

const onMessage = ({ data }: MessageEvent) => {
  if (!(typeof data == 'object' && getBlackTips in data)) return
  removeEventListener('message', onMessage)

  const blackTips: string[] = data[getBlackTips] || [
    '68f49fc9482fd1f628ebef86',
    '68f49f18bbad7a7b026388df',
    '68f49e9d122d06d85f6b0e92',
    '68f49f68c12dafeb22156574',
    '68f49e9d122d06d85f6b0e92',
    '68f49cd0323164d148369b15',
    '68f49d1c671707520b16bb40',
    '68f49d8d174120489cca933f',
    '68f49c6d1b222e353a94be92',
  ]
  console.log(blackTips)

  self.fetch = Object.assign((fetch => async (url: string | Request | URL, init?: RequestInit) => {
    try {
      //@ts-ignore 예외처리 귀찮음
      const { query } = JSON.parse(init.body)
      if (query.trim().startsWith('query SELECT_DISCUSS_LIST')) {
        const res = await fetch(url, init)
        return Object.assign(res, (json => ({
          async json() {
            const data = await json()
            try {
              data.data.discussList.list = data.data.discussList.list.filter(({ id }: any) => !blackTips.includes(id))
            } finally {
              return data
            }
          },
        }))(res.json.bind(res)))
      }
      throw 1
    } catch {
      return fetch(url, init)
    }
  })(fetch), fetch)
}

postMessage(getBlackTips)
addEventListener('message', onMessage)
