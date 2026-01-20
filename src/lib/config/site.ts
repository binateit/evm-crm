/**
 * Site configuration
 * Contains metadata and navigation configuration
 */

export const siteConfig = {
  name: "EVM Distributor Portal",
  description: "Distributor portal for managing orders, viewing promotions, and tracking inventory",
  url: "https://crm.evm-portal.com",
  links: {
    github: "https://github.com/binateit/evm-crm",
  },
} as const;

export type SiteConfig = typeof siteConfig;
