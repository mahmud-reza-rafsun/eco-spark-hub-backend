import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { IdeaService } from "./idea.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { AppError } from "../../shared/errors/app-error";

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
const getAllIdea = catchAsync(
    async (req: Request, res: Response) => {
        const params = req.query;
        const result = await IdeaService.getAllIdea(params);

        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Retrieved all ideas successfully!!",
            meta: result.meta,
            data: result.data,
        });
    }
);

const getIdeaById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        console.log(id);
        const result = await IdeaService.getIdeaById(id as string);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Retrive ideas by id successfully",
            data: result
        })
    }
)

const updateIdea = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user
        const { id } = req.params;
        const payload = req.body;
        const result = await IdeaService.updateIdea(user, id as string, payload);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Updae ideas by id successfully",
            data: result
        })
    }
)

const approveAndRejectIdea = catchAsync(
    async (req: Request, res: Response) => {
        const { status: newStatus, feedback } = req.body;
        const user = req.user;
        const { id } = req.params;

        // Validation: Ensure feedback exists if status is REJECTED
        if (newStatus === 'REJECTED' && !feedback) {
            throw new AppError(status.BAD_REQUEST, "Feedback is required when rejecting an idea.");
        }

        const result = await IdeaService.approveOrRejectIdea(user, id as string, {
            status: newStatus as string,
            feedback: feedback as string
        });

        sendResponse(res, {
            status: status.OK,
            success: true,
            message: `Idea ${newStatus.toLowerCase()} successfully`,
            data: result
        });
    }
);

const getMyIdeas = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const { id } = req.params
    const result = await IdeaService.getMyIdea(id as string, user.id);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Your ideas retrieved successfully",
        data: result,
    });
});

const deleteIdea = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    const result = await IdeaService.deleteIdea(id as string, user.id);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Idea deleted successfully",
        data: result,
    });
});

export const IdeaController = {
    createIdea,
    getAllIdea,
    getIdeaById,
    updateIdea,
    approveAndRejectIdea,
    getMyIdeas,
    deleteIdea
}