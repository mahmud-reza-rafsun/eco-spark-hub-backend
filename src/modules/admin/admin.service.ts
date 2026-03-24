import { Role, UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const getAllUsersFromDB = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            status: true,
            createdAt: true,
            _count: {
                select: { ideas: true }
            }
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const totalCount = await prisma.user.count();

    return {
        users,
        totalCount,
    };
};

const getTotalRevenueWithPurchasesFromDB = async () => {
    const purchases = await prisma.purchase.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true
                },
            },
            idea: {
                select: {
                    title: true,
                    price: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    const revenueAggregation = await prisma.purchase.aggregate({
        _sum: {
            amount: true,
        },
    });

    return {
        totalRevenue: revenueAggregation._sum.amount || 0,
        purchases,
    };
};

const toggleUserBlockStatus = async (targetId: string, adminId: string) => {
    if (targetId === adminId) {
        throw new Error("You cannot perform this action on your own account!");
    }

    const existingUser = await prisma.user.findUnique({
        where: { id: targetId },
    });

    if (!existingUser) {
        throw new Error("User not found!");
    }
    if (existingUser.role === Role.ADMIN) {
        throw new Error("Admin users' status cannot be modified!");
    }
    const newStatus = existingUser.status === UserStatus.ACTIVE
        ? UserStatus.BLOCKED
        : UserStatus.ACTIVE;

    const result = await prisma.user.update({
        where: { id: targetId },
        data: { status: newStatus },
    });

    return result;
};

const deleteUser = async (targetId: string, adminId: string) => {
    if (targetId === adminId) {
        throw new Error("You cannot delete your own account!");
    }

    const existingUser = await prisma.user.findUnique({
        where: { id: targetId },
    });

    if (!existingUser) {
        throw new Error("User not found!");
    }

    if (existingUser.role === Role.ADMIN) {
        throw new Error("Admin users cannot be deleted!");
    }

    const result = await prisma.user.update({
        where: { id: targetId },
        data: {
            status: UserStatus.DELETED,
            isDeleted: true
        },
    });

    return result;
};

export const AdminServices = {
    getAllUsersFromDB,
    getTotalRevenueWithPurchasesFromDB,
    toggleUserBlockStatus,
    deleteUser,
};