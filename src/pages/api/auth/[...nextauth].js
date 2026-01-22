import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyCredentials, verifyUserToken } from "../../../utils/userDbStore";
import { initSupabaseDatabase } from "../../../utils/supabaseDb";

// Inicializar la base de datos de Supabase al cargar la aplicación
initSupabaseDatabase().catch(console.error);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        verificationToken: { label: "Token", type: "text" }
      },
      async authorize(credentials) {
        // Login con token de verificación
        if (credentials?.verificationToken) {
          try {
            const result = await verifyUserToken(credentials.verificationToken);
            if (result.success && result.user) {
              return result.user;
            }
            return null;
          } catch (error) {
            console.error("Error verificando token:", error);
            return null;
          }
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Usar el userDbStore para verificar las credenciales con Supabase
          const user = await verifyCredentials(credentials.email, credentials.password);
          return user;
        } catch (error) {
          console.error("Error en la autorización:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
    newUser: "/auth/new-user",
  },
  callbacks: {
    async jwt({ token, account, user, trigger, session }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.id = user.id;
      }
      // Actualizar token cuando se actualiza la sesión desde el cliente
      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        token.email = session.email || token.email;
        token.phone = session.phone || token.phone;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.role = token.role;
      session.user.phone = token.phone;
      session.user.id = token.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
