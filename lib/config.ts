export function isAuthEnabled() {
  return process.env.APP_USING_AUTH === 'true';
}
