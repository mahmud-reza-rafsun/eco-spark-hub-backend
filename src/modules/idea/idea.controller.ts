import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { IdeaService } from "./idea.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const createIdea = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const { id } = req.user;
        const result = await IdeaService.createIdea(payload, id);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Create Idea Successfully!!",
            data: result,
        })
    }
);


export const IdeaController = {
    createIdea
}