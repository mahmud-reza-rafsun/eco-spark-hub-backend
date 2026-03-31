/* eslint-disable @typescript-eslint/no-explicit-any */
import { IdeaStatus, VoteType } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const getMyPendingIdeas = async (userEmail: string) => {
    const result = await prisma.idea.findMany({
        where: {
            author: {
                email: userEmail
            },
            status: {
                in: [IdeaStatus.PENDING, IdeaStatus.REJECTED]
            }
        },
        select: {
            id: true,
            title: true,
            images: true,
            price: true,
            status: true,
            adminFeedback: true,
            solution: true,
            problem: true,
            description: true,
            author: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });
    return result;
};

const getMyPurchaseIdea = async (userEmail: string) => {
    const purchases = await prisma.purchase.findMany({
        where: {
            user: {
                email: userEmail
            }
        },
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
        where: {
            user: {
                email: userEmail
            }
        },
        _sum: {
            amount: true,
        },
    });

    return {
        totalSpent: revenueAggregation._sum.amount || 0,
        purchases,
    };
};

const getMemberStat = async (memberId: string) => {
    const [
        activeIdeas,
        pendingIdeas,
        rejectedIdeas,
        purchasedIdeas,
        totalComments,
        totalUpvotes,
        totalDownvotes
    ] = await Promise.all([
        // Active (Approved) Ideas
        prisma.idea.count({
            where: {
                authorId: memberId,
                status: IdeaStatus.APPROVED
            }
        }),
        // Pending Ideas
        prisma.idea.count({
            where: {
                authorId: memberId,
                status: IdeaStatus.PENDING
            }
        }),
        // Rejected Ideas
        prisma.idea.count({
            where: {
                authorId: memberId,
                status: IdeaStatus.REJECTED
            }
        }),
        prisma.purchase.count({
            where: {
                userId: memberId
            }
        }),
        prisma.comment.count({
            where: {
                userId: memberId
            }
        }),
        prisma.vote.count({
            where: {
                userId: memberId,
                type: VoteType.UPVOTE
            }
        }),
        prisma.vote.count({
            where: {
                userId: memberId,
                type: VoteType.DOWNVOTE
            }
        }),
    ]);

    const memberChartData = [
        { name: "Active Idea", total: activeIdeas },
        { name: "Pending Idea", total: pendingIdeas },
        { name: "Rejected Idea", total: rejectedIdeas },
        { name: "Purchases Idea", total: purchasedIdeas },
        { name: "Comments", total: totalComments },
        { name: "Upvotes", total: totalUpvotes },
        { name: "Downvotes", total: totalDownvotes }
    ];

    return {
        summary: {
            activeIdeas,
            pendingIdeas,
            rejectedIdeas,
            purchasedIdeas,
            totalComments,
            totalUpvotes,
            totalDownvotes,
            totalActivity: totalComments + totalUpvotes + totalDownvotes,
            totalPosts: activeIdeas + pendingIdeas + rejectedIdeas
        },
        memberChartData
    };
};

export const deleteMyPendingIdea = async (ideaId: string, userId: string) => {
    const idea = await prisma.idea.findUnique({
        where: {
            id: ideaId,
        },
    });

    if (!idea) {
        throw new Error('Idea not found!');
    }

    if (idea.authorId !== userId) {
        throw new Error('You are not authorized to delete this idea!');
    }

    if (idea.status !== IdeaStatus.PENDING) {
        throw new Error('You can only delete ideas that are still pending!');
    }
    const deletedIdea = await prisma.idea.delete({
        where: {
            id: ideaId,
        },
    });

    return deletedIdea;
};

export const MemberService = {
    getMyPendingIdeas,
    getMyPurchaseIdea,
    getMemberStat,
    deleteMyPendingIdea
};