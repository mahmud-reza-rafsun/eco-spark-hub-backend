// services/user.service.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getAllUsersFromDB = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
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

export const UserServices = {
    getAllUsersFromDB,
};