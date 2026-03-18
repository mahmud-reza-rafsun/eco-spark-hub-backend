import status from "http-status"
import { prisma } from "../../lib/prisma"
import { AppError } from "../../shared/errors/app-error"
import { IRequestUser } from "../auth/auth.interface"
import { ICreateCommentPayload } from "./comment.interface"

const createComment = async (payload: ICreateCommentPayload, user: IRequestUser) => {
    const isUserLoggedIn = await prisma.user.findUnique({
        where: {
            id: user.id
        }
    })
    if (!isUserLoggedIn) {
        throw new AppError(status.UNAUTHORIZED, "Please Login in and try again")
    }
}

export const CommentService = {
    createComment
}