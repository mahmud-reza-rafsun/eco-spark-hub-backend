import status from "http-status";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../shared/errors/app-error";
import { ICreateIdeaPayload } from "./idea.interface";

const createIdea = async (payload: ICreateIdeaPayload, id: string) => {
    const { title, problem, solution, description, price, images, categoryId } = payload;

    const isUserExist = await prisma.user.findUnique({
        where: {
            id: id,
            isDeleted: false
        }
    });

    if (!isUserExist) {
        throw new AppError(status.UNAUTHORIZED, "User not found!!!")
    }

    const result = await prisma.idea.create({
        data: {
            title,
            problem,
            solution,
            description,
            price,
            images: Array.isArray(images) ? images : [images],
            authorId: isUserExist.id,
            categoryId: categoryId
        },
        include: {
            author: true
        }
    });
    return result;
}

export const IdeaService = {
    createIdea,
}




// const createIdea = async (payload: ICreateIdeaPayload, id: string) => {
//     const {
//         title,
//         problemStatement,
//         proposedSolution,
//         description,
//         price,
//         images,
//         categoryId // পেলোড থেকে এটি নিতে হবে
//     } = payload;

//     // ইউজার চেক
//     const isUserExist = await prisma.user.findUnique({
//         where: { id, isDeleted: false }
//     });
//     if (!isUserExist) throw new AppError(status.UNAUTHORIZED, "User not found!!!");

//     // ক্যাটাগরি চেক (নিশ্চিত হওয়া যে অ্যাডমিন এই ক্যাটাগরি ক্রিয়েট করেছে)
//     const isCategoryExist = await prisma.category.findUnique({
//         where: { id: categoryId }
//     });
//     if (!isCategoryExist) throw new AppError(status.NOT_FOUND, "Category not found!!!");

//     const result = await prisma.idea.create({
//         data: {
//             title,
//             problem: problemStatement,
//             solution: proposedSolution,
//             description,
//             price,
//             images: Array.isArray(images) ? images : [images],
//             authorId: isUserExist.id,
//             categoryId: isCategoryExist.id // এখানে ক্যাটাগরি আইডি বসবে
//         }
//     });

//     return result;
// }