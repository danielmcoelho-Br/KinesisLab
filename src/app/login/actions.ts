"use server";

import { prisma } from "@/lib/prisma";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor, preencha todos os campos." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Email ou senha inválidos." };
    }

    let isValid = false;
    if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$")) {
      const bcrypt = require("bcryptjs");
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = user.password === password;
    }

    if (!isValid) {
      return { error: "Email ou senha inválidos." };
    }

    return { success: true, user: { id: user.id, name: user.name, email: user.email, birth_date: user.birth_date, role: user.role, crefito: user.crefito, avatar_url: user.avatar_url } };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Ocorreu um erro ao tentar entrar. Tente novamente." };
  }
}
