import OpenAI from "openai";
import { Request, Response } from "express";
// import axios from "axios";

export default class OpenAIV1Controller {

    getDiagnosticSummary = async (req: Request, res: Response) => {
        try {
            const userMessage: string = JSON.stringify(req.body.message);
            const promptId: string = 'pmpt_69dcf5417db48197a21a21d7360f4e13082420e9d635bc5c';
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });

        } catch (err: any) {
            console.error(err);
            res.status(500).json({ status: false, message: "Failed to call Custom GPT", errorMessage: err.message });
        }

    }

    getPartDetails = async (req: Request, res: Response) => {
        try {
            const userMessage: string = JSON.stringify(req.body.message);

            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || "",
            });

            // Create and run assistant in one step
            const run: any = await client.beta.threads.createAndRun({
                assistant_id: process.env.OPENAI_PART_ASSISTANT_ID ?? "",
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

    getMaintenance = async (req: Request, res: Response) => {
        try {
            const userMessage: string = JSON.stringify(req.body.message);
            const promptId: string = 'pmpt_69dcfa1da10c81939b1da179296bde490f4fb05ff74356e9';
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });

        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", "error": err.message });
        }

    }

    getGuidance = async (req: Request, res: Response) => {
        try {
            const userMessage: string = JSON.stringify(req.body.message);
            const promptId: string = 'pmpt_69dcf83160d88193ad6b7993d7777f1704f8cd1958a13e40';
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", "error": err.message });
        }

    }

    getInspection = async (req: Request, res: Response) => {
        try {
            const userMessage: string = JSON.stringify(req.body.message);
            const promptId: string = 'pmpt_69dcf9ddd21881968428b49a481f34d303927fdeeadc9d7c';
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });

        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", "error": err.message });
        }

    }

    getDriveCycle = async (req: Request, res: Response) => {
        try {
            const userMessage: string = JSON.stringify(req.body.message);
            const promptId: string = 'pmpt_69fb7fed94688196b91b74aab5f29bfc03f4b7716a3f087f';
            const data = await this.makeRequest(userMessage, promptId);

            res.json({ status: true, data });
        } catch (err: any) {
            console.error(err);
            res.status(500).json({ message: "Failed to call Custom GPT", "error": err.message });
        }
    }

    async getPartLookUp(req: Request, res: Response) {
        try {
            const userMessage: string = JSON.stringify(req.body.message);

            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || "",
            });

            // Create and run assistant in one step
            const run: any = await client.beta.threads.createAndRun({
                assistant_id: "asst_CchZHhx3D84vxaamdmk0liIK",
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

    async getAdvisorReport(req: Request, res: Response) {
        try {
            const userMessage: string = JSON.stringify(req.body.message);

            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || "",
            });

            // Create and run assistant in one step
            const run: any = await client.beta.threads.createAndRun({
                assistant_id: "asst_LD7DMJQdd3n4I6YxsbEzOoir",
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

    async getDTCDefinition(req: Request, res: Response) {
        try {
            const userMessage: string = JSON.stringify(req.body.message);

            const client = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY || "",
            });

            // Create and run assistant in one step
            const run: any = await client.beta.threads.createAndRun({
                assistant_id: "asst_LD7DMJQdd3n4I6YxsbEzOoir",
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

    makeRequest = async (content: string, promptId: string, version?: string) => {

        const client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || "",
        });

        // Create and run assistant in one step
        const response: any = await client.responses.create({
            prompt: {
                id: promptId,
                ...(version && { version: version })
            },
            input: [{
                role: 'user',
                content: content
            }]
        });
        try {
            return JSON.parse(response.output_text);
        } catch (err) {
            console.log("error", err);
            return response.output_text;
        }

    }
}