import { questionnairesData } from './src/data/questionnaires';
import fs from 'fs';

const dump = JSON.stringify(questionnairesData.afCervical.sections.find(s => s.id === 'exame_neurologico'), null, 2);
fs.writeFileSync('dump.json', dump);
console.log('Dumped');
