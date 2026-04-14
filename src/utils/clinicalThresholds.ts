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

    // -- MMII Thresholds --
    // Force Deficits (Yellow if > 10% or > 15% - let's go with 15% as per standard clinical suspicion)
    if (testId.includes('deficit') || testId.includes('def')) {
        return value > 15;
    }

    // IQ Ratio (Normal ~60-75%, Yellow if < 60%)
    if (testId.includes('rel_iq')) {
        return value < 60;
    }

    // YBT Asymmetry (Significant if > 4cm or > 10% - using 10% as default)
    if (testId.includes('ybt_diff')) {
        return value > 10;
    }

    return false;
}

/**
 * Normative MVIC data for Lower Limbs (kgf)
 * Sources: Meldrum ALS normative values (Knee) & USP/WhatsApp Table (Hip)
 */
const MM_DATA = {
    hip_abd: {
        male: { young: { active: 23.1, sedentary: 23.2 }, old: { active: 21.4, sedentary: 20.5 } },
        female: { young: { active: 22.7, sedentary: 19.2 }, old: { active: 20.0, sedentary: 18.5 } }
    },
    hip_ext: {
        male: { young: { active: 33.0, sedentary: 31.4 }, old: { active: 33.0, sedentary: 30.2 } },
        female: { young: { active: 31.5, sedentary: 26.5 }, old: { active: 27.1, sedentary: 24.3 } }
    },
    knee_ext: {
        female: { 20: 49.6, 25: 47.4, 30: 46.0, 35: 44.9, 40: 43.9, 45: 43.0, 50: 41.9, 55: 40.8, 60: 39.4, 65: 37.9, 70: 36.2 },
        male_multiplier: 1.25 // Estimate for Missing Male MVIC table (Can be adjusted)
    },
    knee_flex: {
        female: { 20: 25.7, 25: 24.5, 30: 23.8, 35: 23.2, 40: 22.7, 45: 22.2, 50: 21.7, 55: 21.1, 60: 20.5, 65: 19.7, 70: 18.8 },
        male_multiplier: 1.22 // Estimate for Missing Male MVIC table (Can be adjusted)
    }
};

export function getMuscleStrengthReference(muscleId: string, gender: Gender, age: number, activityLevel: ActivityLevel = 'Inativo'): number {
    const isMale = gender === 'Masculino';
    const isActive = activityLevel === 'Ativo';
    const gKey = isMale ? 'male' : 'female';
    const aKey = isActive ? 'active' : 'sedentary';
    const ageKey = age <= 40 ? 'young' : 'old';

    if (muscleId.includes('abd_q')) {
        return MM_DATA.hip_abd[gKey][ageKey][aKey];
    }
    if (muscleId.includes('ext_q')) {
        return MM_DATA.hip_ext[gKey][ageKey][aKey];
    }
    
    // Knee logic (lookup nearest age)
    if (muscleId.includes('ext_j') || muscleId.includes('flex_j')) {
        const type = muscleId.includes('ext_j') ? 'knee_ext' : 'knee_flex';
        const ageList = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70];
        const closestAge = ageList.reduce((prev, curr) => Math.abs(curr - age) < Math.abs(prev - age) ? curr : prev);
        
        let val = MM_DATA[type].female[closestAge as keyof typeof MM_DATA.knee_ext.female];
        if (isMale) val *= (type === 'knee_ext' ? MM_DATA.knee_ext.male_multiplier : MM_DATA.knee_flex.male_multiplier);
        
        return parseFloat(val.toFixed(1));
    }

    return 20; // Default fallback
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
