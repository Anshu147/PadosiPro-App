import { z } from 'zod'


export const profileSchema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 character long").max(100, "Name must no be exceed 100 characters"),
    mobile: z.string().trim().regex(/^\+91[6-9]\d{9}$/, "Mobile number must be a valid Indian number with +91"),
    address: z.string().trim().min(5, "Address must be at least 5 character long").max(500, "Address must not be exceed 500 charaters"),
    businessName: z.string().trim().max(150, "Business must not be exceed 150 character").optional()
})

export type ProfileInput = z.infer<typeof profileSchema>