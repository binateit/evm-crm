import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      fullName: string;
      username: string;
      distributorId: string;
      distributorName: string;
      termsAcceptedAt?: string | null;
      isPrimaryContact: boolean;
    };
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
  }

  interface User {
    id: string;
    email: string;
    fullName: string;
    username: string;
    distributorId: string;
    distributorName: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
    termsAcceptedAt?: string | null;
    isPrimaryContact: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    fullName: string;
    username: string;
    distributorId: string;
    distributorName: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
    termsAcceptedAt?: string | null;
    isPrimaryContact: boolean;
  }
}
