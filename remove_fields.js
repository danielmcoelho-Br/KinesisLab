const fs = require('fs');
const path = 'src/data/questionnaires.ts';
let content = fs.readFileSync(path, 'utf8');

// Use regex to remove the lines, being very specific to the afSensibilidade section
// We match the block containing 'afSensibilidade' and within its 'fields' array,
// we remove 'historia' and 'observacoes'.
const regex = /(afSensibilidade: \{[\s\S]*?fields: \[[\s\S]*?)(\s*\{ id: 'historia'[\s\S]*?\},)(\s*\{ id: 'observacoes'[\s\S]*?\},)/;
content = content.replace(regex, '$1');

fs.writeFileSync(path, content, 'utf8');
console.log('Fields removed successfully');
