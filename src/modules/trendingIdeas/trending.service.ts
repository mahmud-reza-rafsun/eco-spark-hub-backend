import { IdeaStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";


const getTrendingIdeas = async (limit: number) => {
    const trendingIdeas = await prisma.idea.findMany({
        where: {
            status: IdeaStatus.APPROVED
        },
        include: {
            _count: {
                select: {
                    votes: {
                        where: { type: 'UPVOTE' }
                    }
                }
            },
            author: {
                select: {
                    name: true,
                    image: true
                }
            }
        },
        orderBy: {
            votes: {
                _count: 'desc',
            },
        },
        take: limit,
    });
    return trendingIdeas.map(idea => ({
        ...idea,
        upvoteCount: idea._count.votes,
    }));
};

export const TrendingService = {
    getTrendingIdeas,
};