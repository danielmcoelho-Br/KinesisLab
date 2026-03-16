/**
 * Utility for calculating assessment scores based on various medical scales.
 */

export type CalculationType = 
    | 'sum' 
    | 'percentage' 
    | 'quickdash' 
    | 'oswestry' 
    | 'ndi' 
    | 'man' 
    | 'ves13' 
    | 'lbpq' 
    | 'brief' 
    | 'lysholm';

export interface CalculationResult {
    score: number | string;
    max: number | string;
    percentage: number;
    interpretation: string;
    unit: string;
    details?: Record<string, any>;
}

export function calculateAssessmentScore(type: CalculationType, answers: Record<string, any>): CalculationResult {
    const values = Object.values(answers).filter(v => typeof v === 'number');
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);

    switch (type) {
        case 'oswestry':
        case 'ndi': {
            if (n === 0) return emptyResult();
            // User requested to consider skipped questions in the calculation.
            // Proportional scoring: (Sum / (AnsweredQuestions * 5)) * 100
            const maxPossible = n * 5;
            const percentage = Math.round((sum / maxPossible) * 100);
            
            let interpretation = '';
            if (type === 'oswestry') {
                if (percentage <= 20) interpretation = 'Incapacidade Mínima';
                else if (percentage <= 40) interpretation = 'Incapacidade Moderada';
                else if (percentage <= 60) interpretation = 'Incapacidade Intensa (Severa)';
                else if (percentage <= 80) interpretation = 'Incapacidade Devastadora';
                else interpretation = 'Paciente Restrito ao Leito';
            } else {
                // Official NDI cutoffs: 0-4 (0-8%) None, 5-14 (10-28%) Mild, 15-24 (30-48%) Moderate, 25-34 (50-68%) Severe, 35+ (70-100%) Complete
                if (percentage <= 8) interpretation = 'Sem Deficiência';
                else if (percentage <= 28) interpretation = 'Deficiência Leve';
                else if (percentage <= 48) interpretation = 'Deficiência Moderada';
                else if (percentage <= 68) interpretation = 'Deficiência Severa';
                else interpretation = 'Deficiência Completa';
            }

            return { score: sum, max: maxPossible, percentage, interpretation, unit: '%' };
        }

        case 'quickdash': {
            // QuickDASH requires at least 10 answered questions
            if (n < 10) return { score: 0, max: 100, percentage: 0, interpretation: 'Mínimo de 10 respostas obrigatórias', unit: '%' };
            
            const score = ((sum / n) - 1) * 25;
            const rounded = Math.round(score * 10) / 10;
            
            return {
                score: rounded,
                max: 100,
                percentage: rounded,
                interpretation: rounded <= 20 ? 'Excelente' : rounded <= 40 ? 'Bom' : rounded <= 60 ? 'Regular' : 'Ruim / Incapacidade Severa',
                unit: '%'
            };
        }

        case 'lbpq': {
            // Roland-Morris (0-24)
            if (n === 0) return emptyResult();
            const percentage = Math.round((sum / 24) * 100);
            let interpretation = '';
            if (sum <= 4) interpretation = 'Incapacidade Mínima';
            else if (sum <= 8) interpretation = 'Incapacidade Leve';
            else if (sum <= 14) interpretation = 'Incapacidade Moderada';
            else if (sum <= 20) interpretation = 'Incapacidade Severa';
            else interpretation = 'Incapacidade Muito Severa';

            return { score: sum, max: 24, percentage, interpretation, unit: ' pontos' };
        }

        case 'lysholm': {
            // Lysholm (0-100)
            if (n === 0) return emptyResult();
            const interpretation = sum >= 95 ? 'Excelente' : sum >= 84 ? 'Bom' : sum >= 65 ? 'Regular' : 'Ruim';
            return { score: sum, max: 100, percentage: sum, interpretation, unit: ' pontos' };
        }

        case 'man': {
            // Mini Avaliação Nutricional (max 30)
            if (n === 0) return emptyResult();
            const percentage = Math.round((sum / 30) * 100);
            let interpretation = '';
            if (sum >= 24) interpretation = 'Estado Nutricional Normal';
            else if (sum >= 17) interpretation = 'Risco de Desnutrição';
            else interpretation = 'Desnutrido';

            return { score: sum, max: 30, percentage, interpretation, unit: ' pontos' };
        }

        case 'ves13': {
            // Vulnerable Elders Survey
            // This one has complex logic based on indices, but we'll approximate 
            // the sum approach if stored correctly in options.
            // In the data.js, it caps physLimit at 2 and disability at 4.
            // We'll trust the sum if the options were mapped with these values.
            if (n === 0) return emptyResult();
            const max = 10;
            const percentage = Math.round((sum / max) * 100);
            let interpretation = '';
            if (sum <= 2) interpretation = 'Idoso Robusto (não vulnerável)';
            else if (sum <= 6) interpretation = 'Risco de Fragilização';
            else interpretation = 'Idoso Vulnerável (alto risco)';

            return { score: sum, max, percentage, interpretation, unit: ' pontos' };
        }

        case 'brief': {
            // BPI-SF
            // Severity: avg of indices 1-4 | Interference: avg of indices 6-12
            // We assume indices match or we use keys.
            const keys = Object.keys(answers).map(Number).sort((a,b) => a-b);
            const severityVals = keys.filter(k => k >= 1 && k <= 4).map(k => answers[k]).filter(v => typeof v === 'number');
            const interferenceVals = keys.filter(k => k >= 6 && k <= 12).map(k => answers[k]).filter(v => typeof v === 'number');
            
            const severityScore = severityVals.length > 0 ? (severityVals.reduce((a,b) => a+b, 0) / severityVals.length) : 0;
            const interferenceScore = interferenceVals.length > 0 ? (interferenceVals.reduce((a,b) => a+b, 0) / interferenceVals.length) : 0;
            
            const s = Math.round(severityScore * 10) / 10;
            const i = Math.round(interferenceScore * 10) / 10;
            
            const getLevel = (v: number) => v <= 3 ? 'Leve' : v <= 6 ? 'Moderada' : 'Severa';
            
            return {
                score: s,
                max: 10,
                percentage: s * 10,
                interpretation: `Severidade: ${s}/10 (${getLevel(s)}) | Interferência: ${i}/10 (${getLevel(i)})`,
                unit: ' (Média Sev.)',
                details: { severity: s, interference: i }
            };
        }

        case 'sum': 
        default: {
            if (n === 0) return emptyResult();
            return {
                score: sum,
                max: '-',
                percentage: 0,
                interpretation: 'Cálculo concluído',
                unit: ''
            };
        }
    }
}

function emptyResult(): CalculationResult {
    return { score: 0, max: 0, percentage: 0, interpretation: 'Nenhuma resposta', unit: '' };
}
