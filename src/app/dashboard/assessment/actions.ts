"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function saveAssessment(data: {
  patientId: string;
  type: string;
  segment: string;
  answers: any;
  scoreData: any;
  userId?: string;
}) {
  try {
    const assessment = await prisma.assessment.create({
      data: {
        patient_id: data.patientId,
        assessment_type: data.type,
        segment: data.segment,
        questionnaire_answers: data.answers,
        clinical_data: data.scoreData,
        created_by_id: data.userId
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/patient/${data.patientId}`);
    return { success: true, id: assessment.id };
  } catch (error) {
    console.error("Error saving assessment:", error);
    return { success: false, error: "Falha ao salvar avaliação" };
  }
}

export async function getAssessment(id: string) {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        created_by: {
          select: {
            name: true,
            crefito: true
          }
        }
      }
    });

    return { success: true, data: assessment };
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return { success: false, error: "Falha ao buscar avaliação" };
  }
}

export async function updateAssessment(id: string, data: {
  answers: any;
  scoreData: any;
  logEntries: string[];
}) {
  try {
    const current = await prisma.assessment.findUnique({
      where: { id },
      select: { change_logs: true }
    });

    const logs = Array.isArray(current?.change_logs) ? [...current.change_logs] : [];
    
    data.logEntries.forEach(entry => {
        logs.push({
            timestamp: new Date().toISOString(),
            entry: entry
        });
    });

    await prisma.assessment.update({
      where: { id },
      data: {
        questionnaire_answers: data.answers,
        clinical_data: data.scoreData,
        change_logs: logs
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating assessment:", error);
    return { success: false, error: "Falha ao atualizar avaliação" };
  }
}
