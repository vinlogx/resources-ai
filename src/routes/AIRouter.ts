import { Router } from "express";
import OpenAIController from "../controllers/OpenAI.controller";

const AIRouter = Router();

AIRouter.post('/summary', new OpenAIController().getDiagnosticSummary);


export default AIRouter