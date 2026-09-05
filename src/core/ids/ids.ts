/**
 * OpaqueId is a utility type that prevents assigning strings
 * to strongly-typed identifiers by accident.
 *
 * It uses an intersection with a unique branding object.
 */
export type OpaqueId<T extends string> = string & { readonly __brand: T };

export type UserId = OpaqueId<'UserId'>;
export type TenantId = OpaqueId<'TenantId'>;
export type WorkspaceId = OpaqueId<'WorkspaceId'>;
export type EventId = OpaqueId<'EventId'>;
export type EventMemberId = OpaqueId<'EventMemberId'>;

/**
 * Creates an OpaqueId from a raw string.
 * Use cautiously at system boundaries where strings are known to be valid IDs.
 */
export function createId<T extends string>(value: string): T {
  return value as T;
}
