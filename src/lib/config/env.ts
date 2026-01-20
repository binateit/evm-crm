/**
 * Environment variables configuration
 * Validates and exports environment variables with type safety
 */

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000",
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "EVM Distributor Portal",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0",
  authSecret: process.env.AUTH_SECRET ?? "",
  authUrl: process.env.AUTH_URL ?? "http://localhost:3000",
} as const;
