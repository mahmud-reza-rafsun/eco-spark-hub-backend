import { Request, Response } from "express";
import { catchAsync } from "../../shared/utils/catch-async";
import { sendResponse } from "../../shared/utils/send-response";
import { AdminServices } from "./admin.service";
import status from "http-status";

const getAllUsers = catchAsync(async (req, res) => {
    const result = await AdminServices.getAllUsersFromDB();

    res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Users retrieved successfully',
        meta: {
            totalCount: result.totalCount,
        },
        data: result.users,
    });
});

const transactionActivity = catchAsync(async (req, res) => {
    const result = await AdminServices.transactionActivity();

    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Revenue and purchase history retrieved successfully",
        data: result,
    });
});

const toggleUserBlockStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user?.id as string;
    const result = await AdminServices.toggleUserBlockStatus(id as string, adminId);

    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User blocked successfully",
        data: result,
    });
});

const deleteUser = catchAsync(async (req, res) => {
    const { id } = req.params;
    const adminId = req.user?.id as string;
    const result = await AdminServices.deleteUser(id as string, adminId);

    res.status(200).json({
        success: true,
        statusCode: 200,
        message: "User deleted successfully",
        data: result,
    });
});

const getAdminStat = catchAsync(
    async (req: Request, res: Response) => {
        const admin = req.user;
        const result = await AdminServices.getAdminStat(admin.id);
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Admin stat retrieved successfully",
            data: result,
        });
    }
);

const deleteIdea = catchAsync(
    async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await AdminServices.deleteIdea(id as string);

        sendResponse(res, {
            status: status.OK,
            success: true,
            message: "Idea deleted successfully",
            data: result,
        });
    }
)

export const AdminControllers = {
    transactionActivity,
    getAllUsers,
    toggleUserBlockStatus,
    deleteUser,
    getAdminStat,
    deleteIdea
};