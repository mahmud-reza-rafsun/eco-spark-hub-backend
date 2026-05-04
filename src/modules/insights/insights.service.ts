/* eslint-disable @typescript-eslint/no-explicit-any */
import { createInsightArtical } from "../../interface/insights.interface";
import { prisma } from "../../lib/prisma";


const createInsight = async (payload: createInsightArtical, userId: string) => {
    const result = await prisma.insight.create({
        data: {
            title: payload.title,
            image: payload.image,
            category: payload.category,
            description: payload.description,
            authorId: userId,
        },
        include: {
            author: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });
    return result;
};

const getAllInsights = async (query: Record<string, any>) => {
    const { searchTerm, page = 1, limit = 10 } = query;

    const searchConditions = searchTerm ? {
        OR: [
            { title: { contains: searchTerm as string, mode: 'insensitive' } },
            { category: { contains: searchTerm as string, mode: 'insensitive' } },
        ]
    } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const result = await prisma.insight.findMany({
        where: searchConditions as any,
        skip,
        take,
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            author: {
                select: {
                    name: true,
                },
            },
        },
    });

    const total = await prisma.insight.count({ where: searchConditions as any });
    const totalPages = Math.ceil(total / take);

    return {
        meta: {
            page: Number(page),
            limit: take,
            total,
            totalPages,
        },
        data: result,
    };
};

const getSingleInsight = async (id: string) => {
    const result = await prisma.insight.findUnique({
        where: {
            id,
        },
        include: {
            author: {
                select: {
                    name: true,
                },
            },
        },
    });
    return result;
}

export const InsightService = {
    createInsight,
    getAllInsights,
    getSingleInsight
};