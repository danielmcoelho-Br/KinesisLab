/**
 * Utility to calculate clinical endurance thresholds based on gender, age, and activity level.
 * Reference values provided by Clinician/User.
 */

export type Gender = 'Masculino' | 'Feminino' | string;
export type ActivityLevel = 'Ativo' | 'Inativo' | 'Sedentário' | string;

export interface ThresholdParams {
    testId: string;
    gender: Gender;
    age: number;
    activityLevel?: ActivityLevel;
}

export function getEnduranceThreshold({ testId, gender, age, activityLevel = 'Inativo' }: ThresholdParams): number {
    const isMale = gender === 'Masculino';
    const isActive = activityLevel === 'Ativo';
    const isYoung = age <= 40;

    // Cervical Flexor Endurance Test
    if (testId === 'resist_flexora') {
        return isMale ? 56 : 23;
    }

    // Deep Neck Extensor Endurance Test (NEET)
    if (testId === 'resist_extensora') {
        return isMale ? 157 : 173;
    }

    // Lumbar Extensor Endurance (Sorensen)
    if (testId === 'sorensen' || testId === 'res_sorensen') {
        if (isMale) {
            if (isYoung) return isActive ? 194 : 167;
            return isActive ? 100 : 69;
        } else {
            if (isYoung) return isActive ? 182 : 161;
            return isActive ? 93 : 82;
        }
    }

    // Lumbar Flexor Endurance (60º Isometry)
    if (testId === 'flexao_60' || testId === 'res_flexao_60') {
        if (isMale) {
            if (isYoung) return isActive ? 284 : 219;
            return isActive ? 133 : 106;
        } else {
            if (isYoung) return isActive ? 254 : 213;
            return isActive ? 110 : 105;
        }
    }

    return 0; // Default fallback
}

export function getPatientProfileString(gender: Gender, age: number, activityLevel: ActivityLevel = 'Inativo'): string {
    const isMale = gender === 'Masculino';
    const isActive = activityLevel === 'Ativo';
    const isYoung = age <= 40;

    const gStr = isMale ? 'Homem' : 'Mulher';
    const aStr = isActive ? (isMale ? 'Ativo' : 'Ativa') : (isMale ? 'Inativo' : 'Inativa');
    const ageStr = isYoung ? '≤ 40 anos' : '> 40 anos';

    return `${gStr} ${aStr} ${ageStr}`;
}
