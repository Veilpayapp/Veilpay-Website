// Maps old same-page scroll-spy anchor hashes to the new application routes.
// Used when the user lands on /docs#hash

export const legacyHashRedirects: Record<string, string> = {
  // Add known legacy hashes here mapping to canonical routes
  '#stellar-private-payments': '/docs/privacy/stellar-spp',
  '#privacy-overview': '/docs/privacy/overview',
  '#what-is-veilpay': '/docs/start-here/what-is-veilpay',
  '#system-architecture': '/docs/architecture/system-architecture',
  // and others if known...
};

export function getLegacyRedirect(hash: string): string | undefined {
  return legacyHashRedirects[hash];
}
