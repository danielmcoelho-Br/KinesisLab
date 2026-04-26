const fs = require('fs');
const path = 'C:\\Users\\daniel\\.gemini\\antigravity\\scratch\\KinesisLab\\src\\data\\questionnaires.ts';
let content = fs.readFileSync(path, 'utf8');

// Regex that matches the section regardless of spacing
const regex = /id:\s*'diagnostico_conclusoes'[\s\S]+?fields:\s*\[([\s\S]+?)\]\s*\}/;

const match = content.match(regex);
if (match) {
    console.log('Found match!');
    // We only want to replace the SECOND occurrence (afMao), 
    // but let's see how many matches we have.
    const allMatches = content.match(new RegExp(regex, 'g'));
    console.log(`Total sections found: ${allMatches.length}`);
    
    // Actually, afMao is at the end of the file.
    // Let's find the one after 'afMao:'
    const afMaoIndex = content.indexOf('afMao:');
    const contentFromAfMao = content.substring(afMaoIndex);
    const afMaoMatch = contentFromAfMao.match(regex);
    
    if (afMaoMatch) {
        console.log('Found diagnostico_conclusoes inside afMao');
        const oldSection = afMaoMatch[0];
        const newSection = `id: 'diagnostico_conclusoes',
            title: 'Diagnóstico e Conclusões',
            fields: [
                { id: 'diag_button', label: 'Gerar Diagnóstico', type: 'button' },
                { id: 'diagnostico', label: 'Diagnóstico Cinético Funcional', type: 'textarea' },
                { id: 'surg_button', label: 'Gerar Sugestões', type: 'button' },
                { id: 'conclusao', label: 'Conclusões e Sugestões Terapêuticas', type: 'textarea' }
            ]
        }`;
        
        const updatedContentFromAfMao = contentFromAfMao.replace(oldSection, newSection);
        const finalContent = content.substring(0, afMaoIndex) + updatedContentFromAfMao;
        
        fs.writeFileSync(path, finalContent);
        console.log('Successfully updated afMao section in questionnaires.ts');
    } else {
        console.log('Could not find section inside afMao');
    }
} else {
    console.log('No matches found for the regex');
}
