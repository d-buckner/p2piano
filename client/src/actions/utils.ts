import { store } from '../app/store';
import { selectUser, selectWorkspace } from '../selectors/workspaceSelectors';


export function getResolvedUserId(userId?: string): string | undefined {
  return userId || selectWorkspace(store).userId;
}

export function getUserColor(userId: string): string | undefined {
  return selectUser(userId)(store)?.color;
}
