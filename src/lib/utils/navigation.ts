export function isActiveRoute(
  pathname: string,
  href: string,
  exact: boolean = false,
): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
