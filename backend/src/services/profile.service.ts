import { prisma } from "../config/prisma.js"
import { ProfileInput } from "../validators/profile.validator.js"

export const getProfile = async (userId: string) => {

    return prisma.profile.findUnique({
        where: {
            userId,
        }
    })
}

export const upsertProfile = async (userId: string, input: ProfileInput) => {
    return prisma.profile.upsert({
        where: {
            userId
        },
        create: {
            userId,
            name: input.name,
            address: input.address,
            businessName: input.businessName || null,
            mobile: input.mobile
        },
        update: {
            name: input.name,
            address: input.address,
            mobile: input.mobile,
            businessName: input.businessName
        }
    })
}