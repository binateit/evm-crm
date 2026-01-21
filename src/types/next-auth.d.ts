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
      distributorCode: string;
      distributorName: string;
      termsAcceptedAt?: string | null;
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
    distributorCode: string;
    distributorName: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
    termsAcceptedAt?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    fullName: string;
    username: string;
    distributorId: string;
    distributorCode: string;
    distributorName: string;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiry: string;
    termsAcceptedAt?: string | null;
  }
}
