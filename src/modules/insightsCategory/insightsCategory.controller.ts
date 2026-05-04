import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";
import { insightCategory } from "./insightsCategory.service";


const createInsightCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body
    const user = req.user
    const result = await insightCategory.createInsightCategory(user, payload);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "create category successfully",
        data: result,
    });
});

const getInsightCategory = catchAsync(async (req: Request, res: Response) => {
    const result = await insightCategory.getInsightCategory();

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: "category retrieved successfully",
        data: result,
    });
});

export const insightCategoryController = {
    createInsightCategory,
    getInsightCategory
}