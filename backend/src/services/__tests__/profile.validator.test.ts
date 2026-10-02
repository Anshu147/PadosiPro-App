import { describe, expect, it } from "vitest";
import { profileSchema } from "../../validators/profile.validator.js";

describe("Profile validation", () => {
    it("should accept a valid profile", () => {
        const result = profileSchema.safeParse({
            name: "Anshu Vishwakarma",
            mobile: "+919876543210",
            address: "Mumbai, Maharashtra",
            businessName: "Anshu Technologies",
        });

        expect(result.success).toBe(true);
    });

    it("should reject an invalid Indian mobile number", () => {
        const result = profileSchema.safeParse({
            name: "Anshu Vishwakarma",
            mobile: "9876543210",
            address: "Mumbai, Maharashtra",
            businessName: "",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a short name", () => {
        const result = profileSchema.safeParse({
            name: "A",
            mobile: "+919876543210",
            address: "Mumbai, Maharashtra",
        });

        expect(result.success).toBe(false);
    });

    it("should reject a short address", () => {
        const result = profileSchema.safeParse({
            name: "Anshu",
            mobile: "+919876543210",
            address: "Mum",
        });

        expect(result.success).toBe(false);
    });

    it("should allow an empty business name", () => {
        const result = profileSchema.safeParse({
            name: "Anshu Vishwakarma",
            mobile: "+919876543210",
            address: "Mumbai, Maharashtra",
            businessName: "",
        });

        expect(result.success).toBe(true);
    });
});