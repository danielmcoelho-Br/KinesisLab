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

    // Shoulder Fatigue (Serratus Anterior)
    if (testId === 'fadiga_serratil') {
        return 109.5;
    }

    // Geriatric Thresholds
    if (testId === 'pes_juntos' || testId === 'semi_tandem') return 30;
    if (testId === 'tandem') return 17.56;
    if (testId === 'unipodal_dir' || testId === 'unipodal_esq' || testId === 'unipodal') return 10;
    if (testId === 'tug') return 12.47;
    if (testId === 'vel_marcha') return 0.8;
    if (testId === 'preensao') return isMale ? 27 : 16;
    if (testId === 'sentar_levantar') return 12; // Generic geriatric cutoff for 5x Sit-to-Stand

    return 0; // Default fallback
}

/**
 * Specifically for geriatrics, determines if a value is "clinicaly suspicious" (Yellow)
 */
export function isValueBelowStandard(testId: string, value: number, gender?: Gender): boolean {
    if (isNaN(value) || value === 0) return false;

    if (testId === 'pes_juntos' || testId === 'semi_tandem') return value < 30;
    if (testId === 'tandem') return value < 17.56;
    if (testId.includes('unipodal')) return value < 10;
    if (testId === 'tug') return value > 12.47; // For TUG, higher is worse
    if (testId === 'vel_marcha') return value < 0.8;
    if (testId === 'preensao') {
        const threshold = (gender || "").toLowerCase() === 'masculino' ? 27 : 16;
        return value < threshold;
    }
    if (testId === 'sentar_levantar') return value > 12; // Higher is worse

    return false;
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
