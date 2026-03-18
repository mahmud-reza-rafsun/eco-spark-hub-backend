import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { VoteService } from "./vote.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { IVoteRequest } from "./vote.interface";

const toggleVote = catchAsync(
    async (req: Request, res: Response) => {
        const user = req.user;
        const { ideaId, type } = req.body as IVoteRequest
        const result = await VoteService.toggleVote(user, ideaId as string, type);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Vote handled successfully",
            data: result,
        });
    }
)

export const VoteController = {
    toggleVote
}