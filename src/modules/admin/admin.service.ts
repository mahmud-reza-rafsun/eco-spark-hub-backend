import { IdeaStatus, Role, UserStatus } from "@prisma/client";
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

const transactionActivity = async () => {
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

const getAdminStat = async (adminId: string) => {
    const [
        totalAdmin,
        totalMember,
        totalIdea,
        totalCategory,
        revenueData,
        totalComments,
        totalUpvotes,
        totalDownvotes
    ] = await Promise.all([
        // Admin count
        prisma.user.count({
            where: {
                role: Role.ADMIN
            }
        }),
        // Member count
        prisma.user.count({
            where: {
                role: Role.MEMBER
            }
        }),
        prisma.idea.count(),
        prisma.category.count(),
        prisma.idea.aggregate({
            _sum: {
                price: true,
            },
        }),
        prisma.comment.count(),
        prisma.vote.count({
            where: {
                userId: adminId,
                type: 'UPVOTE'
            }
        }),
        prisma.vote.count({
            where: {
                userId: adminId,
                type: 'DOWNVOTE'
            }
        }),
    ]);

    const totalRevenue = revenueData._sum.price || 0;

    const chartData = [
        { name: "Admins", total: totalAdmin },
        { name: "Members", total: totalMember },
        { name: "Ideas", total: totalIdea },
        { name: "Categories", total: totalCategory },
        { name: "Revenue", total: totalRevenue },
        { name: "Comments", total: totalComments },
        { name: "Upvotes", total: totalUpvotes },
        { name: "Downvotes", total: totalDownvotes }
    ];

    return {
        summary: {
            totalAdmin,
            totalMember,
            totalUser: totalAdmin + totalMember,
            totalIdea,
            totalCategory,
            totalRevenue,
            totalComments,
            totalUpvotes,
            totalDownvotes
        },
        chartData
    };
};

export const deleteIdea = async (ideaId: string) => {
    const idea = await prisma.idea.findUnique({
        where: {
            id: ideaId,
        },
    });

    if (!idea) {
        throw new Error('Idea not found!');
    }

    if (idea.status === IdeaStatus.APPROVED) {
        throw new Error('You can only delete ideas already APPROVED');
    }
    const deletedIdea = await prisma.idea.delete({
        where: {
            id: ideaId,
        },
    });

    return deletedIdea;
};

export const AdminServices = {
    getAllUsersFromDB,
    transactionActivity,
    toggleUserBlockStatus,
    deleteUser,
    getAdminStat,
    deleteIdea
};