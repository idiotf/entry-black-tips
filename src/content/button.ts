import { request } from '../request'
import { addBlackTipKey, removeBlackTipKey, hasBlackTipKey } from '../const'

declare global {
  var next: {
    router: {
      query: {
        id: string
      }
    }
  }
}

const lists = new WeakSet<Element>()

new MutationObserver(async () => {
  const ul = document.querySelector('.e1wvddxk0 ul')
  if (!ul || lists.has(ul)) return
  lists.add(ul)

  const li = ul.appendChild(document.createElement('li'))
  const anchor = li.appendChild(document.createElement('a'))

  const isBlackTip = await request(hasBlackTipKey, next.router.query.id)
  anchor.textContent = isBlackTip ? '이 노팁 보이기' : '이 노팁 숨기기'

  anchor.addEventListener('click', async () => {
    if (isBlackTip) await request(removeBlackTipKey, next.router.query.id)
    else await request(addBlackTipKey, next.router.query.id)
    location.assign('list')
  })
}).observe(document, { subtree: true, childList: true })
