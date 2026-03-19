import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { CommentService } from "./comments.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const createComment = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body
        const user = req.user
        const { id } = req.params
        const result = await CommentService.createComment(payload, user, id as string);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Create comment successful!!",
            data: result
        })
    }
)

export const CommentController = {
    createComment
}