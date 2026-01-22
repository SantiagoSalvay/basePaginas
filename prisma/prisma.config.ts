import { defineConfig } from 'prisma'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:wL5*sjum/7r!Pca@db.koqjdrfhegaenecgnowx.supabase.co:5432/postgres",
    directUrl: process.env.DIRECT_URL || "postgresql://postgres:wL5*sjum/7r!Pca@db.koqjdrfhegaenecgnowx.supabase.co:5432/postgres"
  }
})