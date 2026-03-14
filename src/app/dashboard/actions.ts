"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPatients(query: string = "") {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        created_by: {
          select: { name: true }
        },
        assessments: {
          where: {
            assessment_type: 'oswestry'
          },
          select: {
            id: true
          }
        }
      },

      orderBy: {
        created_at: 'desc'
      },
      take: 50
    });
    
    // Transform to include a flag
    const formatted = patients.map((p: any) => ({
      ...p,
      hasOswestry: p.assessments.length > 0
    }));


    return { success: true, data: formatted };
  } catch (error) {
    console.error("Error fetching patients:", error);
    return { success: false, error: "Falha ao buscar pacientes" };
  }
}

export async function createPatient(data: {
  name: string;
  birth_date?: Date;
  age?: number;
  gender?: string;
  created_by_id?: string;
}) {
  try {
    const patient = await prisma.patient.create({
      data: {
        name: data.name,
        birth_date: data.birth_date,
        age: data.age,
        gender: data.gender,
        created_by_id: data.created_by_id,
        change_logs: [
          {
            timestamp: new Date().toISOString(),
            entry: `Paciente cadastrado`
          }
        ]
      }
    });

    revalidatePath("/dashboard");
    return { success: true, data: patient };
  } catch (error) {
    console.error("Error creating patient:", error);
    return { success: false, error: "Falha ao criar paciente" };
  }
}

export async function updatePatient(id: string, data: any, userId?: string, userName?: string) {
  try {
    const current = await prisma.patient.findUnique({ where: { id } });
    if (!current) throw new Error("Paciente não encontrado");

    const logs = Array.isArray(current.change_logs) ? [...current.change_logs as any[]] : [];
    const timestamp = new Date().toLocaleString('pt-BR');
    
    if (data.name !== current.name) logs.push({ timestamp: new Date().toISOString(), entry: `${timestamp} - ${userName || 'Usuário'} alterou nome de '${current.name}' para '${data.name}'` });

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        birth_date: data.birth_date ? new Date(data.birth_date) : undefined,
        age: data.age,
        gender: data.gender,
        change_logs: logs
      }
    });
    revalidatePath("/dashboard");
    return { success: true, data: patient };
  } catch (error) {
    console.error("Error updating patient:", error);
    return { success: false, error: "Falha ao atualizar paciente" };
  }
}


export async function deletePatient(id: string) {
  try {
    await prisma.patient.delete({
      where: { id }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error deleting patient:", error);
    return { success: false, error: "Falha ao excluir paciente" };
  }
}

export async function getPatientAssessments(patientId: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    
    const assessments = await prisma.assessment.findMany({
      where: { patient_id: patientId },
      include: {
        created_by: {
          select: { name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    
    return { 
      success: true, 
      data: { patient, assessments } 
    };
  } catch (error) {
    console.error("Error fetching patient assessments:", error);
    return { success: false, error: "Falha ao buscar histórico" };
  }
}

export async function getPatient(id: string) {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id }
    });
    return { success: true, data: patient };
  } catch (error) {
    console.error("Error fetching patient:", error);
    return { success: false, error: "Falha ao buscar paciente" };
  }
}

