import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { categoryService } from "./category.service";
import { sendResponse } from "../../shared/utils/send-response";
import status from "http-status";

const createCategory = catchAsync(
    async (req: Request, res: Response) => {
        const payload = req.body;
        const user = req.user;
        const result = await categoryService.createCategory(payload, user);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Category create successfull!!!",
            data: result
        })
    }
);

const getAllCategory = catchAsync(
    async (req: Request, res: Response) => {
        const result = await categoryService.getAllCategory();
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Retrive category successfull!!!",
            data: result
        })
    }
);

const getCategoryById = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await categoryService.getCategoryById(id as string);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Category retrieved successfully!!!",
            data: result
        })
    }
);

const updateCategory = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;
        const payload = req.body;
        const result = await categoryService.updateCategory(id as string, payload);
        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Category updated successfully!!!",
            data: result
        })
    }
);


export const categoryController = {
    createCategory,
    getAllCategory,
    getCategoryById,
    updateCategory
}