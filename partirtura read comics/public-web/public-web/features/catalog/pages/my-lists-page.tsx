import { ListsPage } from './lists-page'

/**
 * `/my-lists` — the personal lists of the authenticated user.
 *
 * The same exploration page of `/lists`, with the personal lists as the only
 * criterion of the query: the cards, the filters, the pagination and the
 * states are the ones of the system lists.
 */
export function MyListsPage() {
  return <ListsPage myLists />
}
