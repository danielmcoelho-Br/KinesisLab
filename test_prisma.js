const { PrismaClient } = require('@prisma/client');

async function test() {
    console.log("Starting test...");
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({ take: 1 });
        console.log("Found user ID:", users[0]?.id);
        
        if (users[0]) {
            const id = users[0].id;
            const updated = await prisma.user.update({
                where: { id },
                data: { name: users[0].name }
            });
            console.log("Self-update success!");
        } else {
            console.log("No users found in DB.");
        }
    } catch (error) {
        console.error("PRISMA ERROR:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();
