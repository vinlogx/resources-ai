import OpenAI from "openai";
import { Request, Response } from "express";

export default class OpenAIV1Controller {

    private client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
    });

    getDiagnosticSummary = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const promptId = process.env.DIAGNOSTIC_PROMPT_ID || "";
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ status: false, message: "Failed to call Custom GPT", errorMessage: err.message });
        }
    };

    getPartDetails = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const assistantId = process.env.OPENAI_PART_ASSISTANT_ID ?? "";

            const reply = await this.makeAssistantRequest(userMessage, assistantId);
            res.json({ reply });
        } catch (err: any) {
            console.error(err);
            if (err.message?.startsWith("Run ended with status")) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
            }
        }
    };

    getMaintenance = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const promptId = process.env.MAINTAINANCE_PROMPT_ID || "";
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
        }
    };

    getGuidance = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const promptId = process.env.GUIDANCE_PROMPT_ID || "";
            let data = await this.makeRequest(userMessage, promptId);

            if (data?.reply) {
                data = typeof data.reply === 'string' ? JSON.parse(data.reply) : data.reply;
            }
            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
        }
    };

    getInspection = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const promptId = process.env.INSPECTIONS_PROMPT_ID || "";
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
        }
    };

    getDriveCycle = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const promptId = process.env.DRIVE_CYCLE_PROMPT_ID || "";
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
        }
    };

    getPartLookUp = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const promptId = process.env.PART_LOOKUP_PROMPT_ID || "";
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
        }
    };

    getAdvisorReport = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const assistantId = process.env.ADVISOR_ASSISTANT_ID || "";

            const reply = await this.makeAssistantRequest(userMessage, assistantId);
            res.json({ reply });
        } catch (err: any) {
            console.error(err);
            if (err.message?.startsWith("Run ended with status")) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
            }
        }
    };

    getDTCDefinition = async (req: Request, res: Response): Promise<void> => {
        try {
            const userMessage = JSON.stringify(req.body.message);
            const promptId = process.env.DTC_PROMPT_ID || "";
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", error: err.message });
        }
    };

    // Helper method for OpenAI platform prompt execution
    private makeRequest = async (content: string, promptId: string, version?: string): Promise<any> => {
        const response: any = await this.client.responses.create({
            prompt: {
                id: promptId,
                ...(version && { version })
            },
            input: [{ role: 'user', content }]
        });

        try {
            return JSON.parse(response.output_text);
        } catch {
            return response.output_text;
        }
    };

    // Extracted shared logic for thread run pooling
    private makeAssistantRequest = async (userMessage: string, assistantId: string): Promise<string> => {
        const run: any = await this.client.beta.threads.createAndRun({
            assistant_id: assistantId,
            thread: {
                messages: [{ role: "user", content: userMessage }],
            },
        });

        let runStatus;
        const terminalStatuses = ["completed", "failed", "cancelled"];

        do {
            // Re-introduced safe polling delay to prevent throttling / thread blocks
            await new Promise((resolve) => setTimeout(resolve, 1000));
            runStatus = await this.client.beta.threads.runs.retrieve(run.id, { thread_id: run.thread_id });
        } while (!terminalStatuses.includes(runStatus.status));

        if (runStatus.status !== "completed") {
            throw new Error(`Run ended with status: ${runStatus.status}`);
        }

        const messages: any = await this.client.beta.threads.messages.list(run.thread_id);
        const reply: string = messages.data[0].content[0].text.value;

        console.log("Assistant reply:", reply);
        return reply;
    };
}
