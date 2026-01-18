import dotenv from "dotenv"

dotenv.config()

import Fastify from "fastify"
import cors from "@fastify/cors"

const fastify = Fastify({
  logger: true,
})

fastify.register(cors, { origin: ["http://127.0.0.1:5500"], credentials: true })

fastify.get("/", function (request, reply) {
  reply.send("My mailing api")
})

fastify.register(
  function (fastify) {
    fastify.get("/mose-fits", async (request, reply) => {
      const url = "https://api.resend.com/emails"
      const apiKey = process.env.MOSE_RESEND_API_KEY

      const emailData = {
        from: "mose-fits@resend.dev",
        to: "michaelolsen184@gmail.com",
        subject: "New Order from mose fits",
        html: "<strong>New crocs order!</strong>",
      }

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(emailData),
        })

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`)
        }

        const result = await response.json()
        console.log("Success:", result)
        reply.send({ message: "Mail sent successfully" })
      } catch (error) {
        console.error("Error sending email:", error.message)
      }
    })
  },
  { prefix: "/api" },
)

fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error("Uncaught exception", err)
    // Todo Restart server with pm2 when unknown error is thrown
    process.exit(1)
  }
  // Server is now listening on ${address}
})
