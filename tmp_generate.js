const fs = require('fs');

const womac = {
    id: 'womac',
    segment: 'mmii',
    title: 'Questionário WOMAC',
    description: 'Avalia dor, rigidez e função física em pacientes com osteoartrite do joelho/quadril.',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    questions: [
        { text: 'DOR (Quanta dor você sente ao:)', isInstruction: true },
        { text: '1. Andar em terreno plano?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '2. Subir ou descer escadas?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '3. À noite, quando deitado(a) na cama?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '4. Sentado(a) ou deitado(a)?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '5. Ficar em pé?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: 'RIGIDEZ ARTICULAR (Quanta rigidez você sente ao:)', isInstruction: true },
        { text: '6. Mover-se pela primeira vez de manhã (ao acordar)?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '7. Mover-se no decorrer do dia após ficar sentado, deitado ou em repouso?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: 'FUNÇÃO FÍSICA (Qual o grau de dificuldade para:)', isInstruction: true },
        { text: '8. Descer escadas?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '9. Subir escadas?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '10. Levantar-se da posição sentada?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '11. Ficar em pé?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '12. Curvar-se para pegar um objeto no chão?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '13. Andar num local plano?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '14. Entrar / sair do carro, de um ônibus?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '15. Ir às compras?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '16. Colocar suas meias / meias-calças?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '17. Levantar-se da cama?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '18. Tirar as suas meias / meias-calças?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '19. Deitar na cama?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '20. Entrar / sair do banho?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '21. Sentar-se?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '22. Sentar e levantar do vaso sanitário?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '23. Realizar tarefas domésticas pesadas?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] },
        { text: '24. Realizar tarefas domésticas leves?', options: [{ value: 0, label: 'Nenhuma' }, { value: 1, label: 'Pouca' }, { value: 2, label: 'Moderada' }, { value: 3, label: 'Muita' }, { value: 4, label: 'Extrema' }] }
    ]
};

const womacCalc = `        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);
            const sum = answeredQuestions.reduce((a, b) => a + b, 0);
            
            let dor = 0, rigidez = 0, funcao = 0;
            let dorCnt = 0, rigidezCnt = 0, funcaoCnt = 0;
            
            Object.keys(answers).forEach((key, index) => {
                const k = parseInt(key);
                if (k >= 0 && k <= 4) { dor += answers[key]; dorCnt++; }
                else if (k >= 5 && k <= 6) { rigidez += answers[key]; rigidezCnt++; }
                else if (k >= 7 && k <= 23) { funcao += answers[key]; funcaoCnt++; }
            });

            // WOMAC Score Interpretation Setup
            const totalMax = 96;
            const percentage = Math.round((sum / totalMax) * 100);

            return {
                score: sum,
                max: totalMax,
                percentage: percentage,
                unit: 'pontos (quanto maior, pior)',
                interpretation: percentage <= 20 ? 'Excelente (Pouco ou nenhum impacto)' : percentage <= 40 ? 'Bom (Impacto leve)' : percentage <= 70 ? 'Regular (Impacto moderado/severo)' : 'Ruim (Impacto severo/extremo)',
                details: {
                    'Dor (0-20)': dor,
                    'Rigidez (0-8)': rigidez,
                    'Função Física (0-68)': funcao
                }
            };
        }`;

const ikdc = {
    id: 'ikdc',
    segment: 'mmii',
    title: 'Questionário IKDC (Subjetivo do Joelho)',
    description: 'Ferramenta para medir sintomas, função e atividades esportivas relacionadas ao joelho.',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    questions: [
        { text: '1. Qual é o nível de atividade mais alto que você consegue realizar sem dor significativa no joelho?', options: [{ value: 4, label: 'Atividades muito intensas (saltar ou virar subitamente em esportes de contato)' }, { value: 3, label: 'Atividades intensas (trabalho físico pesado, esqui, tênis)' }, { value: 2, label: 'Atividades moderadas (trabalho físico moderado, corrida)' }, { value: 1, label: 'Atividades leves (caminhar, tarefas diárias leves)' }, { value: 0, label: 'Incapaz de realizar qualquer uma das atividades acima' }] },
        { text: '2. Durante as últimas 4 semanas, com que frequência você teve dor? (10 é nunca, 0 é constante)', options: [{ value: 10, label: '10 (Nunca)' }, { value: 9, label: '9' }, { value: 8, label: '8' }, { value: 7, label: '7' }, { value: 6, label: '6' }, { value: 5, label: '5' }, { value: 4, label: '4' }, { value: 3, label: '3' }, { value: 2, label: '2' }, { value: 1, label: '1' }, { value: 0, label: '0 (Constantemente)' }] },
        { text: '3. Se você teve dor nas últimas 4 semanas, descreva qual foi a dor de PIOR intensidade que você teve (10 é sem dor, 0 é pior dor imaginável):', options: [{ value: 10, label: '10 (Sem dor)' }, { value: 9, label: '9' }, { value: 8, label: '8' }, { value: 7, label: '7' }, { value: 6, label: '6' }, { value: 5, label: '5' }, { value: 4, label: '4' }, { value: 3, label: '3' }, { value: 2, label: '2' }, { value: 1, label: '1' }, { value: 0, label: '0 (Pior dor imaginável)' }] },
        { text: '4. Quão frequente seu joelho apresentou rigidez (limitou movimento) nas últimas 4 semanas?', options: [{ value: 4, label: 'Nunca' }, { value: 3, label: 'Raramente' }, { value: 2, label: 'Algumas vezes' }, { value: 1, label: 'Frequentemente' }, { value: 0, label: 'Constantemente' }] },
        { text: '5. Quão frequente seu joelho apresentou inchaço nas últimas 4 semanas?', options: [{ value: 4, label: 'Nunca' }, { value: 3, label: 'Raramente' }, { value: 2, label: 'Algumas vezes' }, { value: 1, label: 'Frequentemente' }, { value: 0, label: 'Constantemente' }] },
        { text: '6. Qual é o nível mais alto de atividade que você consegue realizar sem inchaço significativo no seu joelho?', options: [{ value: 4, label: 'Atividades muito intensas' }, { value: 3, label: 'Atividades intensas' }, { value: 2, label: 'Atividades moderadas' }, { value: 1, label: 'Atividades leves' }, { value: 0, label: 'Incapaz de realizar até as mais leves' }] },
        { text: '7. Durante as últimas 4 semanas, o seu joelho travou ou bloqueou?', options: [{ value: 1, label: 'Não' }, { value: 0, label: 'Sim' }] },
        { text: '8. Qual o nível mais alto que você consegue sem que o joelho trave?', options: [{ value: 4, label: 'Atividades muito intensas' }, { value: 3, label: 'Atividades intensas' }, { value: 2, label: 'Atividades moderadas' }, { value: 1, label: 'Atividades leves' }, { value: 0, label: 'Incapaz de realizar até as mais leves' }] },
        { text: '9. Qual a frequência que o seu joelho cede (falso apoio)?', options: [{ value: 4, label: 'Nunca' }, { value: 3, label: 'Raramente' }, { value: 2, label: 'Algumas vezes' }, { value: 1, label: 'Frequentemente' }, { value: 0, label: 'Constantemente' }] },
        { text: '10. Qual o nível mais alto de atividade que consegue realizar sem falso apoio?', options: [{ value: 4, label: 'Atividades muito intensas' }, { value: 3, label: 'Atividades intensas' }, { value: 2, label: 'Atividades moderadas' }, { value: 1, label: 'Atividades leves' }, { value: 0, label: 'Incapaz de realizar até as mais leves' }] },
        { text: 'COMO AS SEGUINTES ATIVIDADES AFETAM O SEU JOELHO:', isInstruction: true },
        { text: '11. Subir ladeiras íngremes ou escadas', options: [{ value: 4, label: 'Nenhuma Dificuldade' }, { value: 3, label: 'Dificuldade Leve' }, { value: 2, label: 'Dificuldade Moderada' }, { value: 1, label: 'Dificuldade Extrema' }, { value: 0, label: 'Incapaz de fazer' }] },
        { text: '12. Descer ladeiras íngremes ou escadas', options: [{ value: 4, label: 'Nenhuma Dificuldade' }, { value: 3, label: 'Dificuldade Leve' }, { value: 2, label: 'Dificuldade Moderada' }, { value: 1, label: 'Dificuldade Extrema' }, { value: 0, label: 'Incapaz de fazer' }] },
        { text: '13. Ajoelhar-se (ficar de joelhos)', options: [{ value: 4, label: 'Nenhuma Dificuldade' }, { value: 3, label: 'Dificuldade Leve' }, { value: 2, label: 'Dificuldade Moderada' }, { value: 1, label: 'Dificuldade Extrema' }, { value: 0, label: 'Incapaz de fazer' }] },
        { text: '14. Agachar-se', options: [{ value: 4, label: 'Nenhuma Dificuldade' }, { value: 3, label: 'Dificuldade Leve' }, { value: 2, label: 'Dificuldade Moderada' }, { value: 1, label: 'Dificuldade Extrema' }, { value: 0, label: 'Incapaz de fazer' }] },
        { text: '15. Sentar-se com os joelhos dobrados por tempo prolongado', options: [{ value: 4, label: 'Nenhuma Dificuldade' }, { value: 3, label: 'Dificuldade Leve' }, { value: 2, label: 'Dificuldade Moderada' }, { value: 1, label: 'Dificuldade Extrema' }, { value: 0, label: 'Incapaz de fazer' }] },
        { text: '16. Levantar da cadeira', options: [{ value: 4, label: 'Nenhuma Dificuldade' }, { value: 3, label: 'Dificuldade Leve' }, { value: 2, label: 'Dificuldade Moderada' }, { value: 1, label: 'Dificuldade Extrema' }, { value: 0, label: 'Incapaz de fazer' }] },
        { text: '17. Caminhar para a frente de modo continuado', options: [{ value: 4, label: 'Nenhuma Dificuldade' }, { value: 3, label: 'Dificuldade Leve' }, { value: 2, label: 'Dificuldade Moderada' }, { value: 1, label: 'Dificuldade Extrema' }, { value: 0, label: 'Incapaz de fazer' }] },
        { text: '18. Como você classifica a função do seu joelho HOJE? (10 é normal/sem limitações, 0 é incapaz de fazer qq atividade)', options: [{ value: 10, label: '10 (Normal)' }, { value: 9, label: '9' }, { value: 8, label: '8' }, { value: 7, label: '7' }, { value: 6, label: '6' }, { value: 5, label: '5' }, { value: 4, label: '4' }, { value: 3, label: '3' }, { value: 2, label: '2' }, { value: 1, label: '1' }, { value: 0, label: '0 (Incapaz)' }] }
    ]
};

const ikdcCalc = `        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);
            const sum = answeredQuestions.reduce((a, b) => a + b, 0);

            // Maximum score for IKDC is usually 87. 
            const totalMax = 87;
            const percentage = Math.round((sum / totalMax) * 100);

            return {
                score: sum,
                max: totalMax,
                percentage: percentage,
                unit: 'pontos',
                interpretation: percentage >= 90 ? 'Excelente (Função normal ou quase normal)' : percentage >= 70 ? 'Bom (Limitação leve)' : percentage >= 50 ? 'Regular (Limitação moderada)' : 'Ruim (Incapacidade grave)'
            };
        }`;

fs.writeFileSync('womac.json', JSON.stringify(womac, null, 4).slice(0, -1) + ',' + womacCalc + '\n    },');
fs.writeFileSync('ikdc.json', JSON.stringify(ikdc, null, 4).slice(0, -1) + ',' + ikdcCalc + '\n    },');

console.log('files created.');
