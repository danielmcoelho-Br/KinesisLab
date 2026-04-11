"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfile(id: string, data: any) {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return { success: false, error: "Usuário não encontrado" };

        let updatedPassword = user.password;
        if (data.newPassword) {
            updatedPassword = await bcrypt.hash(data.newPassword, 10);
        }

        const logs = Array.isArray(user.change_logs) ? [...user.change_logs as any[]] : [];
        logs.push({
            timestamp: new Date().toISOString(),
            entry: `Usuário atualizou seu próprio perfil${data.newPassword ? ' e senha' : ''}`
        });

        const updated = await prisma.user.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                crefito: data.crefito,
                birth_date: data.birth_date ? new Date(data.birth_date) : null,
                password: updatedPassword,
                signature: data.signature,
                change_logs: logs
            }
        });

        revalidatePath("/dashboard/profile");
        
        return { 
            success: true, 
            data: { 
                id: updated.id, 
                name: updated.name, 
                email: updated.email,
                birth_date: updated.birth_date,
                role: updated.role, 
                crefito: updated.crefito, 
                avatar_url: updated.avatar_url,
                signature: updated.signature
            } 
        };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Falha ao atualizar perfil" };
    }
}
