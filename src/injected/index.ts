import { getBlackTipsKey, addBlackTipKey, hasBlackTipKey, removeBlackTipKey } from '../const'
import { registerHandler } from '../request'

async function getBlackTips() {
  return Object.keys(await chrome.storage.local.get())
}

registerHandler({
  [getBlackTipsKey]() {
    return getBlackTips()
  },

  async [hasBlackTipKey](unknownId: unknown) {
    const id = unknownId + ''
    return id in await chrome.storage.local.get(id)
  },

  async [addBlackTipKey](id: unknown) {
    await chrome.storage.local.set({ [id + '']: 0 })
    return getBlackTips()
  },

  async [removeBlackTipKey](id: unknown) {
    await chrome.storage.local.remove(id + '')
    return getBlackTips()
  },
})
