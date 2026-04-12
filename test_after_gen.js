const { PrismaClient } = require('@prisma/client');

async function test() {
    console.log("Starting test after regeneration...");
    const prisma = new PrismaClient();
    try {
        const users = await prisma.user.findMany({ 
            where: { id: "daniel-m-coelho-id" }
        });
        
        if (users.length > 0) {
            const user = users[0];
            console.log("Found user:", user.name);
            
            // Testing the update with 'signature' argument
            console.log("Attempting update with signature field...");
            const updated = await prisma.user.update({
                where: { id: user.id },
                data: { 
                    signature: "test_signature_data"
                }
            });
            console.log("SUCCESS! Signature field is recognized and updated.");
        } else {
            console.log("User 'daniel-m-coelho-id' not found.");
        }
    } catch (error) {
        console.error("PRISMA ERROR:", error.message);
        if (error.stack) console.error(error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

test();
