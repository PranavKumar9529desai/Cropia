
import { PrismaClient } from "@repo/db";

const prisma = new PrismaClient();

async function main() {
    const allScansCount = await prisma.scan.count();
    console.log("Total scans in DB:", allScansCount);

    if (allScansCount > 0) {
        const jurisdictions = await prisma.scan.groupBy({
            by: ["state", "district", "taluka"],
            _count: true,
        });
        console.log("Scans by jurisdiction:", JSON.stringify(jurisdictions, null, 2));

        const samples = await prisma.scan.findMany({ take: 3 });
        console.log("Sample scan data:", JSON.stringify(samples, null, 2));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
