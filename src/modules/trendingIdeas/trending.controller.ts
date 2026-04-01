// controllers/idea.controller.ts
import { Request, Response } from 'express';
import { catchAsync } from '../../shared/utils/catch-async';
import { TrendingService } from './trending.service';

const getTrendingIdeas = catchAsync(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 6;

    const result = await TrendingService.getTrendingIdeas(limit);

    res.status(200).json({
        success: true,
        message: "Trending ideas retrieved successfully",
        data: result,
    });
});

export const TrendingController = {
    getTrendingIdeas,
};