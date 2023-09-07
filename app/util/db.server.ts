import {PrismaClient} from "@prisma/client"

let db: PrismaClient = process.env.NODE_ENV === "production"
  ? new PrismaClient()
  : new PrismaClient({log: ["query", "info", "warn", "error"]})

export default db
