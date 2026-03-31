import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { MemberService } from "./member.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const getMyPendingIdeas = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.user;
    const result = await MemberService.getMyPendingIdeas(email);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Your pending ideas retrieved successfully",
        data: result,
    });
});

const getMyPurchaseIdea = catchAsync(async (req: Request, res: Response) => {
    const userEmail = req.user?.email;

    const result = await MemberService.getMyPurchaseIdea(userEmail);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Your purchase ideas retrieved successfully",
        data: result,
    });
});

const getMemberStat = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await MemberService.getMemberStat(user.id);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "Member statistics fetched successfully",
        data: result,
    });
});

const deleteMyPendingIdea = catchAsync(
    async (req: Request, res: Response) => {
        const { id: ideaId } = req.params;
        const userId = req.user?.id;
        const result = await MemberService.deleteMyPendingIdea(ideaId as string, userId);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: 'Pending idea deleted successfully!',
            data: result,
        });
    }
);

export const MemberController = {
    getMyPendingIdeas,
    getMyPurchaseIdea,
    getMemberStat,
    deleteMyPendingIdea
}