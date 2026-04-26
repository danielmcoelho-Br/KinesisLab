const fs = require('fs');
const path = 'C:\\Users\\daniel\\.gemini\\antigravity\\scratch\\KinesisLab\\src\\data\\questionnaires.ts';
let content = fs.readFileSync(path, 'utf8');

const restoredSections = `                { id: 'watson', label: 'Teste de Watson (Instabilidade Escafoide)', fields: [{ id: 'test_watson_esq', type: 'checkbox' }, { id: 'test_watson_dir', type: 'checkbox' }] }
            ],
            fields: [
                { id: 'obs_testes_esp', label: 'OBSERVAÇÕES', type: 'textarea' }
            ]
        },
        {
            id: 'forca_preensao',
            description: 'Referência (Obj): Preensão: M >27kg / F >16kg | Polpa: M >8kg / F >5kg | Lateral: M >10kg / F >7kg | Trípode: M >9kg / F >6kg',
            title: 'Força de Preensão e Pinça (kgF)',
            type: 'table',
            columns: ['Teste', 'Esquerdo', 'Direito', 'DÉFICIT %'],
            rows: [
                { id: 'preensao_palmar', label: 'Preensão Palmar (Dinamômetro)', fields: [{ id: 'preensao_esq', max: 100 }, { id: 'preensao_dir', max: 100 }, 'preensao_def'] },
                { id: 'pinca_polpa', label: 'Pinça Polpa a Polpa', fields: [{ id: 'polpa_esq', max: 20 }, { id: 'polpa_dir', max: 20 }, 'polpa_def'] },
                { id: 'pinca_lateral', label: 'Pinça Lateral (Chave)', fields: [{ id: 'lateral_esq', max: 25 }, { id: 'lateral_dir', max: 25 }, 'lateral_def'] },
                { id: 'pinca_tripode', label: 'Pinça Trípode (3 dedos)', fields: [{ id: 'tripode_esq', max: 25 }, { id: 'tripode_dir', max: 25 }, 'tripode_def'] }
            ],
            fields: [
                { id: 'obs_forca_preensao', label: 'OBSERVAÇÕES', type: 'textarea' }
            ]
        },`;

// The regex should match the corrupted part exactly
const fallbackRegex = /\{\s*id:\s*'watson'[\s\S]+?test_watson_dir'[\s\S]+?\}\s*\]\s*\}\s*\{\s*id:\s*'pinca_tripode'[\s\S]+?textarea'[\s\S]+?\}\s+\]\s+\},/;

if (fallbackRegex.test(content)) {
     content = content.replace(fallbackRegex, restoredSections);
     fs.writeFileSync(path, content);
     console.log('Successfully restored using fallback regex');
} else {
    // Try even more flexible
    const superFlexible = /id:\s*'watson'[\s\S]+?test_watson_dir'[\s\S]+?pinca_tripode[\s\S]+?obs_forca_preensao[\s\S]+?textarea'[\s\S]+?\}\s+\]\s+\},/;
    if (superFlexible.test(content)) {
        content = content.replace(superFlexible, restoredSections);
        fs.writeFileSync(path, content);
        console.log('Successfully restored using super flexible regex');
    } else {
        console.log('Target not found - manual check required');
    }
}
