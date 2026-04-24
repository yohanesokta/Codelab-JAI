export function isAuthEnabled() {
  return process.env.NEXT_PUBLIC_APP_USING_AUTH === 'true';
}
