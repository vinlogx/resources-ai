import { Router } from "express";
import OpenAIController from "../controllers/OpenAI.controller";

const AIRouter = Router();

AIRouter.post('/summary', new OpenAIController().getDiagnosticSummary);
AIRouter.post('/parts', new OpenAIController().getPartDetails);
AIRouter.post('/maintenance', new OpenAIController().getMaintenance);
AIRouter.post('/guidance', new OpenAIController().getGuidance);
AIRouter.post('/inspection', new OpenAIController().getInspection);
AIRouter.post('/drivecycle', new OpenAIController().getDriveCycle);
AIRouter.post('/partlookup', new OpenAIController().getPartLookUp);
AIRouter.post('/advisor', new OpenAIController().getAdvisorReport);
AIRouter.post('/dtcDefinition', new OpenAIController().getDTCDefinition);


export default AIRouter