import dotenv from "dotenv"

dotenv.config()

import Fastify from "fastify"
import cors from "@fastify/cors"

const fastify = Fastify({
    logger: true,
})

fastify.register(cors, {
    origin: ["https://borealit.orionhaven.com/", "http://localhost:5500", "http://127.0.0.1:5500"],
})

fastify.get("/", function (request, reply) {
    reply.send("Clovon health API")
})

fastify.register(
    function (fastify) {
        fastify.post("/analyze-diet", async (request, reply) => {
            const systemPrompt =
                "You are a professional nutritionist. The user will input their meal. Briefly analyze if this food triggers Volatile Sulfur Compounds (VSCs), bad gut breath, stomach acid reflux, or morning mouth odor. Provide highly specific advice on how it affects breath, and recommend Clovon to digest and neutralize VSCs. Keep response to exactly 2-3 clean, informative sentences."

            const meal = request.body?.meal
            if (!meal) {
                return reply.status(400).send({ error: "Meal is required" })
            }

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`
            const payload = {
                contents: [{ parts: [{ text: `Meal: ${meal}` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            }

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch from Gemini API: ${response.status}`)
                }

                const result = await response.json()
                const replyText = result.candidates?.[0]?.content?.parts?.[0]?.text

                return reply.send({ replyText })
            } catch (error) {
                console.error("Error analyzing diet:", error)
                return reply.status(500).send({ error: "Failed to analyze diet" })
            }
        })

        fastify.post("/spreadsheet", async (request, reply) => {
            try {
            } catch (error) {
                console.error("Error adding to spreadsheet:", error)
            }
        })
    },
    { prefix: "/api" },
)

fastify.listen({ port: 3000, host: "0.0.0.0" }, function (err, address) {
    if (err) {
        fastify.log.error("Uncaught exception", err)
        // Todo Restart server with pm2 when unknown error is thrown
        process.exit(1)
    }
    // Server is now listening on ${address}
})
