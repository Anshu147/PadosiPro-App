import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const categories = [
    {
        name: "Business",
        tasks: [
            {
                name: "Business Registration",
                description: "Get help with registering your business.",
            },
            {
                name: "GST Registration",
                description: "Assistance with GST registration and related requirements.",
            },
            {
                name: "Business License",
                description: "Find assistance for required business licenses.",
            },
            {
                name: "Business Consultation",
                description: "Connect with professionals for business guidance.",
            },
            {
                name: "Accounting & Bookkeeping",
                description: "Get help managing business accounts and bookkeeping.",
            },
        ],
    },
    {
        name: "Home Services",
        tasks: [
            {
                name: "Electrician",
                description: "Find an electrician for electrical work and repairs.",
            },
            {
                name: "Plumber",
                description: "Get plumbing installation and repair services.",
            },
            {
                name: "AC Repair",
                description: "Book assistance for air conditioner repair and servicing.",
            },
            {
                name: "Home Cleaning",
                description: "Get professional home cleaning assistance.",
            },
            {
                name: "Painting",
                description: "Find professionals for residential painting work.",
            },
        ],
    },
    {
        name: "Personal Services",
        tasks: [
            {
                name: "Beauty & Salon",
                description: "Find beauty and salon services near you.",
            },
            {
                name: "Fitness Trainer",
                description: "Connect with a fitness professional.",
            },
            {
                name: "Photography",
                description: "Find photographers for personal or business events.",
            },
            {
                name: "Event Planning",
                description: "Get help planning and organizing events.",
            },
            {
                name: "Tutoring",
                description: "Find tutors for academic and learning support.",
            },
        ],
    },
    {
        name: "Professional Services",
        tasks: [
            {
                name: "Legal Consultation",
                description: "Connect with professionals for legal guidance.",
            },
            {
                name: "Tax Consultant",
                description: "Get assistance with tax-related requirements.",
            },
            {
                name: "Digital Marketing",
                description: "Find help with online marketing and promotion.",
            },
            {
                name: "Website Development",
                description: "Get professional website development assistance.",
            },
            {
                name: "Graphic Design",
                description: "Find designers for branding and creative work.",
            },
        ],
    },
    {
        name: "Transport & Repair",
        tasks: [
            {
                name: "Car Repair",
                description: "Find assistance for car maintenance and repairs.",
            },
            {
                name: "Bike Repair",
                description: "Get motorcycle and scooter repair services.",
            },
            {
                name: "Vehicle Cleaning",
                description: "Find vehicle washing and detailing services.",
            },
            {
                name: "Packers & Movers",
                description: "Get help with moving and relocation.",
            },
            {
                name: "Driver Services",
                description: "Find professional driver services.",
            },
        ],
    },
];

async function main() {
    console.log("Seeding task catalogue...");

    for (const categoryData of categories) {
        const category = await prisma.category.upsert({
            where: {
                name: categoryData.name,
            },
            update: {},
            create: {
                name: categoryData.name,
            },
        });

        for (const taskData of categoryData.tasks) {
            const existingTask = await prisma.task.findFirst({
                where: {
                    name: taskData.name,
                    categoryId: category.id,
                },
            });

            if (existingTask) {
                await prisma.task.update({
                    where: {
                        id: existingTask.id,
                    },
                    data: {
                        description: taskData.description,
                    },
                });
            } else {
                await prisma.task.create({
                    data: {
                        name: taskData.name,
                        description: taskData.description,
                        categoryId: category.id,
                    },
                });
            }
        }
    }

    console.log("Task catalogue seeded successfully.");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });