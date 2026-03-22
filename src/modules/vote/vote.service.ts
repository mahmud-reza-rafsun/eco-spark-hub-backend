import status from "http-status";
import { VoteType } from "@prisma/client"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../shared/errors/app-error";
import { IRequestUser } from "../auth/auth.interface"

const toggleVote = async (user: IRequestUser, ideaId: string, type: VoteType) => {
    const isIdeaExist = await prisma.idea.findUnique({
        where: { id: ideaId }
    });
    if (!isIdeaExist) {
        throw new AppError(status.NOT_FOUND, "Idea Not Found!!!");
    }
    const existingVote = await prisma.vote.findUnique({
        where: {
            userId_ideaId: {
                userId: user.id,
                ideaId: ideaId
            }
        }
    });
    if (existingVote && existingVote.type === type) {
        await prisma.vote.delete({
            where: {
                userId_ideaId: {
                    userId: user.id,
                    ideaId: ideaId
                }
            }
        });
        return { message: "Vote removed successfully" };
    }
    const result = await prisma.vote.upsert({
        where: {
            userId_ideaId: {
                userId: user.id,
                ideaId: ideaId
            }
        },
        update: {
            type: type
        },
        create: {
            userId: user.id,
            ideaId: ideaId,
            type: type
        }
    });
    return result;
}

export const VoteService = {
    toggleVote
}