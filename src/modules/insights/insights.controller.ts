import { Request, Response } from 'express';
import { catchAsync } from '../../shared/utils/catch-async';
import { InsightService } from './insights.service';
import { sendResponse } from '../../shared/utils/send-response';
import status from 'http-status';

const createInsight = catchAsync(async (req: Request, res: Response) => {
    const user = req.user
    const result = await InsightService.createInsight(req.body, user.id);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: 'Create insight successfully',
        data: result,
    });
});

const getAllInsights = catchAsync(async (req: Request, res: Response) => {
    const result = await InsightService.getAllInsights(req.query);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: 'Insights retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getSingleInsight = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await InsightService.getSingleInsight(id as string);

    sendResponse(res, {
        status: status.OK,
        success: true,
        message: 'Retrive single insights successfully',
        data: result,
    });
});

export const InsightController = {
    createInsight,
    getAllInsights,
    getSingleInsight,
};