import { prisma } from "../config/prisma.js"


export const getCurrentUser = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            profile: true
        }
    })
    if (!user) {
        throw new Error("User not found")
    }

    return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        profileCompleted: Boolean(user.profile)
    }
}
