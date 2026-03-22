import { catchAsync } from "../../shared/utils/catch-async";
import { UserServices } from "./admin.service";

const getAllUsers = catchAsync(async (req, res) => {
    const result = await UserServices.getAllUsersFromDB();

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

export const UserControllers = {
    getAllUsers,
};