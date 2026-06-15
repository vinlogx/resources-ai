import { Router } from "express";
import OpenAIV1Controller from "../controllers/OpenAIV1.controller";

const AIRouter = Router();

AIRouter.post('/summary', new OpenAIV1Controller().getDiagnosticSummary);
AIRouter.post('/parts', new OpenAIV1Controller().getPartDetails);
AIRouter.post('/maintenance', new OpenAIV1Controller().getMaintenance);
AIRouter.post('/guidance', new OpenAIV1Controller().getGuidance);
AIRouter.post('/inspection', new OpenAIV1Controller().getInspection);
AIRouter.post('/drivecycle', new OpenAIV1Controller().getDriveCycle);
AIRouter.post('/partlookup', new OpenAIV1Controller().getPartLookUp);
AIRouter.post('/advisor', new OpenAIV1Controller().getAdvisorReport);
AIRouter.post('/dtcDefinition', new OpenAIV1Controller().getDTCDefinition);


export default AIRouter