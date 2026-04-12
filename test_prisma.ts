import { prisma } from "./src/lib/prisma";

async function test() {
    try {
        const users = await prisma.user.findMany({ take: 1 });
        console.log("Found user:", users[0]?.id);
        
        if (users[0]) {
            const id = users[0].id;
            // Test findUnique with this ID
            const found = await prisma.user.findUnique({ where: { id } });
            console.log("Found via findUnique:", found?.name);
            
            // Test update
            const updated = await prisma.user.update({
                where: { id },
                data: { name: found.name + " (Test)" }
            });
            console.log("Update success:", updated.name);
            
            // Restore name
            await prisma.user.update({
                where: { id },
                data: { name: found.name }
            });
        }
    } catch (error) {
        console.error("TEST ERROR:", error);
    }
}

test();
