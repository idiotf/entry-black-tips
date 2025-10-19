import { getBlackTips } from '../const'

addEventListener('message', async ({ data: type }) => {
  if (type == getBlackTips) {
    const { blackTips } = await chrome.storage.local.get<{ blackTips: string[] }>('blackTips')
    postMessage({
      [getBlackTips]: blackTips,
    })
  }
})
