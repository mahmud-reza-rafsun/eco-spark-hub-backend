/* eslint-disable @typescript-eslint/no-explicit-any */
import { IdeaStatus } from "@prisma/client";
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
        pendingIdeas,
        purchasedIdeas,
        totalComments,
        totalUpvotes,
        totalDownvotes
    ] = await Promise.all([
        prisma.idea.count({
            where: {
                authorId: memberId,
                status: 'PENDING'
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
                type: 'UPVOTE'
            }
        }),
        prisma.vote.count({
            where: {
                userId: memberId,
                type: 'DOWNVOTE'
            }
        }),
    ]);
    const memberChartData = [
        { name: "Pending Ideas", total: pendingIdeas },
        { name: "Purchases", total: purchasedIdeas },
        { name: "Comments", total: totalComments },
        { name: "Upvotes", total: totalUpvotes },
        { name: "Downvotes", total: totalDownvotes }
    ];

    return {
        summary: {
            pendingIdeas,
            purchasedIdeas,
            totalComments,
            totalUpvotes,
            totalDownvotes,
            totalActivity: totalComments + totalUpvotes + totalDownvotes
        },
        memberChartData
    };
};

export const MemberService = {
    getMyPendingIdeas,
    getMyPurchaseIdea,
    getMemberStat
};