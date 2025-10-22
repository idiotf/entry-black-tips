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

function getDiscussId(menuList: Element) {
  const discussItem = menuList.parentNode?.parentNode?.parentNode?.parentNode?.parentNode
  if (!discussItem) return next.router.query.id

  const reactFiberKey = Object.keys(discussItem).find(v => v.startsWith('__reactF'))
  if (!reactFiberKey) return next.router.query.id

  const reactFiber = { ...discussItem }[reactFiberKey]
  if (!(
    reactFiber instanceof Object && 'child' in reactFiber &&
    reactFiber.child instanceof Object && 'sibling' in reactFiber.child &&
    reactFiber.child.sibling instanceof Object && 'child' in reactFiber.child.sibling &&
    reactFiber.child.sibling.child instanceof Object && 'pendingProps' in reactFiber.child.sibling.child &&
    reactFiber.child.sibling.child.pendingProps instanceof Object && 'target' in reactFiber.child.sibling.child.pendingProps
  )) return next.router.query.id

  return reactFiber.child.sibling.child.pendingProps.target
}

const lists = new WeakSet<Element>()

new MutationObserver(() => document.querySelectorAll('.e1wvddxk0 ul').forEach(async ul => {
  if (lists.has(ul)) return
  lists.add(ul)

  const li = ul.appendChild(document.createElement('li'))
  const anchor = li.appendChild(document.createElement('a'))

  const id = getDiscussId(ul)
  const isBlackTip = await request(hasBlackTipKey, id)
  anchor.textContent = isBlackTip ? '이 글 보이기' : '이 글 숨기기'

  anchor.addEventListener('click', async () => {
    if (isBlackTip) await request(removeBlackTipKey, id)
    else await request(addBlackTipKey, id)
    location.assign('.')
  })
})).observe(document, { subtree: true, childList: true })
