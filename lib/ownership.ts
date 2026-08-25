export function assertOwnership(resourceOwnerId: string, authenticatedUserId: string): void {
  if (resourceOwnerId !== authenticatedUserId) throw new Error('NOT_FOUND');
}
