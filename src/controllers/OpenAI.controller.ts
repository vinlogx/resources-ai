import OpenAI from "openai";
import { Request, Response } from "express";
// import axios from "axios";

export default class OpenAIController {
    constructor() {

    }

    async getDiagnosticSummary(req: Request, res: Response) {
        try {
            const userMessage: string = JSON.stringify(req.body.message);

            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || "",
            });

            // Create and run assistant in one step
            const run: any = await client.beta.threads.createAndRun({
                assistant_id: process.env.OPENAI_ASSISTANT_ID ?? "",
                thread: {
                    messages: [{ role: "user", content: userMessage }],
                },
            });

            // Poll until run completes
            let runStatus;
            do {
                // await new Promise((resolve) => setTimeout(resolve, 100)); // 1s delay
                runStatus = await client.beta.threads.runs.retrieve(run.id, { thread_id: run.thread_id, });
            } while (
                runStatus.status !== "completed" &&
                runStatus.status !== "failed" &&
                runStatus.status !== "cancelled"
            );

            if (runStatus.status !== "completed") {
                return res.status(500).json({ error: `Run ended with status: ${runStatus.status}` });
            }

            // Get latest messages
            const messages: any = await client.beta.threads.messages.list(run.thread_id);
            const reply: string = messages.data[0].content[0].text.value;

            console.log("Assistant reply:", reply);
            res.json({ reply });

        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", "error": err.message });
        }

    }
}