export type Option = {
  value: number;
  label: string;
};

export type Question = {
  text: string;
  isInstruction?: boolean;
  options?: Option[];
};

export type SectionField = {
  id: string;
  label: string;
  type: 'textarea' | 'range' | 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'table' | 'bodyschema' | 'image-upload' | 'button';

  min?: number;
  max?: number;
  step?: number;
  image?: string;
  options?: string[]; // for simple select
};

export type TableRow = {
  id: string;
  label: string;
  fields: (string | { id: string, type: 'checkbox' | 'text' | 'number' | 'select' | 'image-upload', options?: string[] })[];
};

export type Section = {
  id: string;
  title: string;
  type?: 'default' | 'table';
  fields?: SectionField[];
  columns?: (string | { label: string, action?: { type: 'fill', value: any }, type?: 'checkbox' | 'text' | 'number' | 'select' | 'image-upload' | 'textarea' })[];
  rows?: TableRow[];
};

export type Questionnaire = {
  id: string;
  segment: string;
  title: string;
  description: string;
  icon?: string;
  type?: 'clinical' | 'questionnaire';
  questions?: Question[];
  sections?: Section[];
  calculateScore?: (answers: Record<string, any>) => any;
};

const scores0to5 = ["0", "1", "2", "3", "4", "5"];
const reflexOptions = ["Normal", "Hiperreflexia", "Hiporeflexia"];

export const questionnairesData: Record<string, Questionnaire> = {
  oswestry: {
    id: 'oswestry',
    segment: 'lombar',
    title: 'Índice de Incapacidade de Oswestry (ODI)',
    description: 'Questionário para avaliar a incapacidade em pacientes com dor lombar.',
    questions: [
      { text: '1. Intensidade da Dor', options: [
        { value: 0, label: 'Eu posso tolerar a dor que sinto sem ter que usar analgésicos.' },
        { value: 1, label: 'A dor é ruim, mas eu consigo lidar com ela sem tomar analgésicos.' },
        { value: 2, label: 'Os analgésicos me dão alívio completo da dor.' },
        { value: 3, label: 'Os analgésicos me dão alívio moderado da dor.' },
        { value: 4, label: 'Os analgésicos me dão muito pouco alívio da dor.' },
        { value: 5, label: 'Os analgésicos não têm efeito sobre a dor e eu não os uso.' }
      ]},
      { text: '2. Cuidados Pessoais', options: [
        { value: 0, label: 'Posso cuidar de mim mesmo normalmente sem que isso cause dor extra.' },
        { value: 1, label: 'Posso cuidar de mim mesmo normalmente, mas isso causa dor extra.' },
        { value: 2, label: 'Cuidar de mim mesmo causa dor e sou lento e cuidadoso.' },
        { value: 3, label: 'Preciso de alguma ajuda, mas consigo fazer a maioria das minhas coisas.' },
        { value: 4, label: 'Preciso de ajuda todos os dias para a maioria dos aspectos do meu cuidado pessoal.' },
        { value: 5, label: 'Não me visto, lavo-me com dificuldade e fico na cama.' }
      ]},
      { text: '3. Levantar Peso', options: [
        { value: 0, label: 'Posso levantar objetos pesados sem dor extra.' },
        { value: 1, label: 'Posso levantar objetos pesados, mas causa dor extra.' },
        { value: 2, label: 'A dor me impede de levantar objetos pesados do chão, mas consigo se estiverem em um local conveniente.' },
        { value: 3, label: 'A dor me impede de levantar objetos pesados, mas consigo levantar objetos leves a médios.' },
        { value: 4, label: 'Só consigo levantar objetos muito leves.' },
        { value: 5, label: 'Não consigo levantar ou carregar nada.' }
      ]},
      { text: '4. Caminhar', options: [
        { value: 0, label: 'A dor não me impede de caminhar qualquer distância.' },
        { value: 1, label: 'A dor me impede de caminhar mais de 1,5 km.' },
        { value: 2, label: 'A dor me impede de caminhar mais de 750 metros.' },
        { value: 3, label: 'A dor me impede de caminhar mais de 100 metros.' },
        { value: 4, label: 'Só posso caminhar com o uso de bengala ou muletas.' },
        { value: 5, label: 'Fico na cama ou na cadeira a maior parte do tempo.' }
      ]},
      { text: '5. Sentar', options: [
        { value: 0, label: 'Posso sentar em qualquer cadeira pelo tempo que eu quiser.' },
        { value: 1, label: 'Apenas posso sentar na minha cadeira favorita pelo tempo que eu quiser.' },
        { value: 2, label: 'A dor me impede de sentar por mais de 1 hora.' },
        { value: 3, label: 'A dor me impede de sentar por mais de meia hora.' },
        { value: 4, label: 'A dor me impede de sentar por mais de 10 minutos.' },
        { value: 5, label: 'A dor me impede de sentar.' }
      ]},
      { text: '6. Ficar em Pé', options: [
        { value: 0, label: 'Posso ficar em pé o tempo que quiser sem dor extra.' },
        { value: 1, label: 'Posso ficar em pé o tempo que quiser, mas isso me causa dor extra.' },
        { value: 2, label: 'A dor me impede de ficar em pé por mais de 1 hora.' },
        { value: 3, label: 'A dor me impede de ficar em pé por mais de meia hora.' },
        { value: 4, label: 'A dor me impede de ficar em pé por mais de 10 minutos.' },
        { value: 5, label: 'A dor me impede totalmente de ficar em pé.' }
      ]},
      { text: '7. Dormir', options: [
        { value: 0, label: 'Meu sono não é nunca perturbado pela dor.' },
        { value: 1, label: 'Meu sono é ocasionalmente perturbado pela dor.' },
        { value: 2, label: 'Por causa da dor meu sono é menos de 6 horas.' },
        { value: 3, label: 'Por causa da dor meu sono é menos de 4 horas.' },
        { value: 4, label: 'Por causa da dor meu sono é menos de 2 horas.' },
        { value: 5, label: 'A dor me impede totalmente de dormir.' }
      ]},
      { text: '8. Vida Sexual (se aplicável)', options: [
        { value: 0, label: 'Minha vida sexual é normal e não me causa dor extra.' },
        { value: 1, label: 'Minha vida sexual é normal, mas me causa alguma dor extra.' },
        { value: 2, label: 'Minha vida sexual é quase normal, mas é muito dolorosa.' },
        { value: 3, label: 'Minha vida sexual é severamente restringida pela dor.' },
        { value: 4, label: 'Minha vida sexual é quase inexistente por causa da dor.' },
        { value: 5, label: 'A dor me impede de ter qualquer vida sexual.' }
      ]},
      { text: '9. Vida Social', options: [
        { value: 0, label: 'Minha vida social é normal e não me causa dor extra.' },
        { value: 1, label: 'Minha vida social é normal, mas aumenta o grau de dor.' },
        { value: 2, label: 'A dor não tem efeito sobre a minha vida social, mas restringe os meus interesses mais ativos.' },
        { value: 3, label: 'A dor tem restringido a minha vida social e não saio com tanta frequência.' },
        { value: 4, label: 'A dor restringiu a minha vida social a minha casa.' },
        { value: 5, label: 'Não tenho nenhuma vida social por causa da dor.' }
      ]},
      { text: '10. Viagens', options: [
        { value: 0, label: 'Posso viajar para qualquer lugar sem dor.' },
        { value: 1, label: 'Posso viajar para qualquer lugar, mas causa dor extra.' },
        { value: 2, label: 'A dor é ruim, mas consigo fazer viagens de mais de duas horas.' },
        { value: 3, label: 'A dor restringe viagens para menos de uma hora.' },
        { value: 4, label: 'A dor restringe viagens curtas e necessárias para menos de meia hora.' },
        { value: 5, label: 'A dor me impede de viajar, exceto para ir ao médico e hospitais.' }
      ]}
    ],
    calculateScore: (answers) => {
      const entries = Object.entries(answers).filter(([k, v]) => !isNaN(Number(k)) && v !== undefined && v !== "");
      if (entries.length === 0) return { percentage: 0, interpretation: 'Pendente', unit: '%' };
      const total = entries.reduce((acc, [_, val]) => acc + Number(val), 0);
      const percentage = Math.round((total / (entries.length * 5)) * 100);
      let interpretation = 'Incapacidade Mínima';
      if (percentage > 20) interpretation = 'Incapacidade Moderada';
      if (percentage > 40) interpretation = 'Incapacidade Severa';
      if (percentage > 60) interpretation = 'Incapacidade Devastadora';
      if (percentage > 80) interpretation = 'Restrito ao Leito';
      return { percentage, interpretation, unit: '%' };
    }
  },
  ndi: {
    id: 'ndi',
    segment: 'cervical',
    title: 'Neck Disability Index (NDI)',
    description: 'Avalia o impacto da dor cervical nas atividades diárias.',
    questions: [
      { text: '1. Intensidade da Dor', options: [
        { value: 0, label: 'No momento eu não tenho dor.' },
        { value: 1, label: 'No momento a dor é bem leve.' },
        { value: 2, label: 'No momento a dor é moderada.' },
        { value: 3, label: 'No momento a dor é bastante forte.' },
        { value: 4, label: 'No momento a dor é muito forte.' },
        { value: 5, label: 'No momento a dor é a pior possível.' }
      ]},
      { text: '2. Cuidados Pessoais', options: [
        { value: 0, label: 'Posso cuidar de mim mesmo sem que isto aumente minha dor.' },
        { value: 1, label: 'Posso cuidar de mim mesmo, mas isto aumenta minha dor.' },
        { value: 2, label: 'Cuidar de mim mesmo é doloroso e por isto sou lento e cuidadoso.' },
        { value: 3, label: 'Preciso de alguma ajuda, mas consigo fazer a maioria das coisas.' },
        { value: 4, label: 'Preciso de ajuda todos os dias para a maior parte dos meus cuidados pessoais.' },
        { value: 5, label: 'Não consigo me vestir, lavo-me com dificuldade e permaneço na cama.' }
      ]},
      { text: '3. Levantar Peso', options: [
        { value: 0, label: 'Posso levantar objetos pesados sem que isto aumente minha dor.' },
        { value: 1, label: 'Posso levantar objetos pesados, mas isto aumenta minha dor.' },
        { value: 2, label: 'A dor me impede de levantar objetos pesados do chão, mas consigo se estiverem bem posicionados.' },
        { value: 3, label: 'A dor me impede de levantar objetos pesados, mas consigo levantar objetos leves se bem posicionados.' },
        { value: 4, label: 'Só consigo levantar objetos muito leves.' },
        { value: 5, label: 'Não consigo levantar nem carregar nenhum objeto.' }
      ]},
      { text: '4. Leitura', options: [
        { value: 0, label: 'Posso ler o quanto eu quiser sem sentir dor no pescoço.' },
        { value: 1, label: 'Posso ler o quanto eu quiser com uma leve dor no pescoço.' },
        { value: 2, label: 'Posso ler o quanto eu quiser com dor moderada no pescoço.' },
        { value: 3, label: 'Não posso ler tanto quanto eu gostaria por causa de dor moderada no pescoço.' },
        { value: 4, label: 'Eu quase não consigo ler por causa da dor muito forte no pescoço.' },
        { value: 5, label: 'Não consigo ler de modo algum.' }
      ]},
      { text: '5. Dores de Cabeça', options: [
        { value: 0, label: 'Não tenho nenhuma dor de cabeça.' },
        { value: 1, label: 'Tenho leves dores de cabeça não muito frequentes.' },
        { value: 2, label: 'Tenho dores de cabeça moderadas não muito frequentes.' },
        { value: 3, label: 'Tenho dores de cabeça moderadas frequentemente.' },
        { value: 4, label: 'Tenho dores de cabeça muito fortes frequentemente.' },
        { value: 5, label: 'Tenho dores de cabeça o tempo todo.' }
      ]},
      { text: '6. Concentração', options: [
        { value: 0, label: 'Posso me concentrar totalmente quando eu quiser sem nenhuma dificuldade.' },
        { value: 1, label: 'Posso me concentrar totalmente quando eu quiser com uma leve dificuldade.' },
        { value: 2, label: 'Tenho um grau razoável de dificuldade em me concentrar quando eu quero.' },
        { value: 3, label: 'Tenho muita dificuldade em me concentrar quando eu quero.' },
        { value: 4, label: 'Tenho extrema dificuldade em me concentrar quando eu quero.' },
        { value: 5, label: 'Não consigo me concentrar de modo algum.' }
      ]},
      { text: '7. Trabalho', options: [
        { value: 0, label: 'Posso fazer tanto trabalho quanto eu quiser.' },
        { value: 1, label: 'Posso fazer apenas o meu trabalho habitual, mas não mais.' },
        { value: 2, label: 'Posso fazer a maior parte do meu trabalho habitual, mas não mais.' },
        { value: 3, label: 'Não posso fazer o meu trabalho habitual.' },
        { value: 4, label: 'Quase não posso fazer nenhum trabalho.' },
        { value: 5, label: 'Não posso fazer nenhum trabalho de modo algum.' }
      ]},
      { text: '8. Dirigir', options: [
        { value: 0, label: 'Posso dirigir o meu carro sem nenhuma dor no pescoço.' },
        { value: 1, label: 'Posso dirigir o meu carro o quanto eu quiser com uma leve dor no pescoço.' },
        { value: 2, label: 'Posso dirigir o meu carro o quanto eu quiser com dor moderada no pescoço.' },
        { value: 3, label: 'Não posso dirigir o meu carro o quanto eu quiser por causa de dor moderada no pescoço.' },
        { value: 4, label: 'Eu mal posso dirigir por causa da dor muito forte no pescoço.' },
        { value: 5, label: 'Não consigo dirigir meu carro de modo algum.' }
      ]},
      { text: '9. Sono', options: [
        { value: 0, label: 'Não tenho nenhum problema para dormir.' },
        { value: 1, label: 'Meu sono é levemente perturbado (menos de 1 hora sem sono).' },
        { value: 2, label: 'Meu sono é moderadamente perturbado (1-2 horas sem sono).' },
        { value: 3, label: 'Meu sono é bastante perturbado (2-3 horas sem sono).' },
        { value: 4, label: 'Meu sono é muito perturbado (3-5 horas sem sono).' },
        { value: 5, label: 'Meu sono é totalmente perturbado (5-7 horas sem sono).' }
      ]},
      { text: '10. Lazer', options: [
        { value: 0, label: 'Sou capaz de participar em todas as minhas atividades de lazer sem nenhuma dor no pescoço.' },
        { value: 1, label: 'Sou capaz de participar em todas as minhas atividades de lazer com alguma dor no pescoço.' },
        { value: 2, label: 'Sou capaz de participar na maioria, mas não em todas as minhas habituais atividades de lazer por causa de dor no pescoço.' },
        { value: 3, label: 'Sou capaz de participar em apenas algumas das minhas habituais atividades de lazer por causa de dor no pescoço.' },
        { value: 4, label: 'Dificilmente posso participar em quaisquer atividades de lazer por causa da dor no pescoço.' },
        { value: 5, label: 'Não consigo participar em nenhuma atividade de lazer de modo algum.' }
      ]}
    ],
    calculateScore: (answers) => {
      const entries = Object.entries(answers).filter(([k, v]) => !isNaN(Number(k)) && v !== undefined && v !== "");
      if (entries.length === 0) return { percentage: 0, interpretation: 'Pendente', unit: '%' };
      const total = entries.reduce((acc, [_, val]) => acc + Number(val), 0);
      const percentage = Math.round((total / (entries.length * 5)) * 100);
      let interpretation = 'Sem Deficiência';
      if (percentage > 8) interpretation = 'Deficiência Leve';
      if (percentage > 20) interpretation = 'Deficiência Moderada';
      if (percentage > 40) interpretation = 'Deficiência Severa';
      if (percentage > 60) interpretation = 'Deficiência Completa';
      return { percentage, interpretation, unit: '%' };
    }
  },
  afCervical: {
    id: 'afCervical',
    segment: 'cervical',
    title: 'Avaliação Funcional Cervical',
    description: 'Avaliação completa da coluna cervical, incluindo movimento e testes neurológicos.',
    sections: [
        {
            id: 'anamnese',
            title: 'Características da Disfunção',
            fields: [
                { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 },
                { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: '/img/esquema_corpo_inteiro.png' },
                { id: 'historia', label: 'História Pregressa', type: 'textarea' },
                { id: 'piora', label: 'Atividade de Piora', type: 'textarea' },
                { id: 'alivio', label: 'Atividade de Alívio', type: 'textarea' },
                { id: 'doencas', label: 'Doenças Associadas/Cirurgias Realizadas', type: 'textarea' }
            ]
        },
        {
            id: 'neuro_forca',
            title: 'Avaliação Neurológica (Força Muscular)',
            type: 'table',
            columns: [
                'Miótono / Músculo', 
                { label: 'Esquerdo (0-5)', action: { type: 'fill', value: '5' } }, 
                { label: 'Direito (0-5)', action: { type: 'fill', value: '5' } }
            ],
            rows: [
                { id: 'c5', label: 'Flexor de Cotovelo (C5)', fields: ['c5_esq', 'c5_dir'] },
                { id: 'c6', label: 'Extensor de Punho (C6)', fields: ['c6_esq', 'c6_dir'] },
                { id: 'c7', label: 'Extensor de Cotovelo (C7)', fields: ['c7_esq', 'c7_dir'] },
                { id: 'c8', label: 'Flexores de Dedos (C8)', fields: ['c8_esq', 'c8_dir'] },
                { id: 't1', label: 'Abdutor do 5º Dedo (T1)', fields: ['t1_esq', 't1_dir'] }
            ],
            fields: [{ id: 'neuro_forca_obs', label: 'Observações de Força Muscular', type: 'textarea' }]
        },
        {
            id: 'neuro_reflexos',
            title: 'Avaliação Neurológica (Reflexos)',
            type: 'table',
            columns: ['Reflexo', 'Esquerdo', 'Direito'],
            rows: [
                { id: 'bicipital', label: 'Bicipital (C5 e C6)', fields: [
                    { id: 'bicipital_esq', type: 'select', options: reflexOptions }, 
                    { id: 'bicipital_dir', type: 'select', options: reflexOptions }
                ] },
                { id: 'tricipital', label: 'Tricipital (C7 e T1)', fields: [
                    { id: 'tricipital_esq', type: 'select', options: reflexOptions }, 
                    { id: 'tricipital_dir', type: 'select', options: reflexOptions }
                ] },
                { id: 'estiloradial', label: 'Estiloradial (C6)', fields: [
                    { id: 'estiloradial_esq', type: 'select', options: reflexOptions }, 
                    { id: 'estiloradial_dir', type: 'select', options: reflexOptions }
                ] }
            ],
            fields: [{ id: 'neuro_reflexos_obs', label: 'Observações de Reflexos', type: 'textarea' }]
        },
        {
            id: 'postural',
            title: 'Avaliação Postural',
            fields: [
                { id: 'postura_obs', label: 'Vista Posterior / Anterior / Laterais (Observações)', type: 'textarea' },
                { id: 'postura_img', label: 'Registros Fotográficos', type: 'image-upload' }
            ]
        },
        {
            id: 'movimento_cervical',
            title: 'Avaliação do Movimento (Graus)',
            type: 'table',
            columns: ['Movimento', 'Graus', 'Padrão / Observações', { label: 'Imagem', type: 'image-upload' }],
            rows: [
                { id: 'flexao', label: 'Flexão', fields: ['flexao_graus', 'flexao_obs', { id: 'flexao_img', type: 'image-upload' }] },
                { id: 'extensao', label: 'Extensão', fields: ['extensao_graus', 'extensao_obs', { id: 'extensao_img', type: 'image-upload' }] },
                { id: 'rot_esq', label: 'Rotação Esquerda', fields: ['rot_esq_graus', 'rot_esq_obs', { id: 'rot_esq_img', type: 'image-upload' }] },
                { id: 'rot_dir', label: 'Rotação Direita', fields: ['rot_dir_graus', 'rot_dir_obs', { id: 'rot_dir_img', type: 'image-upload' }] },
                { id: 'incl_esq', label: 'Inclinação Esquerda', fields: ['incl_esq_graus', 'incl_esq_obs', { id: 'incl_esq_img', type: 'image-upload' }] },
                { id: 'incl_dir', label: 'Inclinação Direita', fields: ['incl_dir_graus', 'incl_dir_obs', { id: 'incl_dir_img', type: 'image-upload' }] }
            ]
        },
        {
            id: 'testes_neurais',
            title: 'Teste de Tensão Neural',
            type: 'table',
            columns: ['Nervo', 'Esquerdo', 'Direito'],
            rows: [
                { id: 'mediano', label: 'Mediano', fields: [{ id: 'neural_mediano_esq', type: 'checkbox' }, { id: 'neural_mediano_dir', type: 'checkbox' }] },
                { id: 'ulnar', label: 'Ulnar', fields: [{ id: 'neural_ulnar_esq', type: 'checkbox' }, { id: 'neural_ulnar_dir', type: 'checkbox' }] },
                { id: 'radial', label: 'Radial', fields: [{ id: 'neural_radial_esq', type: 'checkbox' }, { id: 'neural_radial_dir', type: 'checkbox' }] }
            ],
            fields: [{ id: 'testes_neurais_obs', label: 'Observações de Tensão Neural', type: 'textarea' }]
        },
        {
            id: 'palpacao_articular_c',
            title: 'Palpação e Irritabilidade Articular (C2-C7)',
            type: 'table',
            columns: ['Nível', 'Dor/Disfunção', 'Intensidade (0-10)'],
            rows: [
                { id: 'c2', label: 'C2', fields: [{ id: 'palp_c2_dor', type: 'checkbox' }, { id: 'palp_c2_int', type: 'number' }] },
                { id: 'c3', label: 'C3', fields: [{ id: 'palp_c3_dor', type: 'checkbox' }, { id: 'palp_c3_int', type: 'number' }] },
                { id: 'c4', label: 'C4', fields: [{ id: 'palp_c4_dor', type: 'checkbox' }, { id: 'palp_c4_int', type: 'number' }] },
                { id: 'c5p', label: 'C5', fields: [{ id: 'palp_c5_dor', type: 'checkbox' }, { id: 'palp_c5_int', type: 'number' }] },
                { id: 'c6p', label: 'C6', fields: [{ id: 'palp_c6_dor', type: 'checkbox' }, { id: 'palp_c6_int', type: 'number' }] },
                { id: 'c7p', label: 'C7', fields: [{ id: 'palp_c7_dor', type: 'checkbox' }, { id: 'palp_c7_int', type: 'number' }] }
            ],
            fields: [{ id: 'palp_art_c_obs', label: 'Observações Palpação C2-C7', type: 'textarea' }]
        },
        {
            id: 'palpacao_articular_t',
            title: 'Palpação e Irritabilidade Articular (T1-T7)',
            type: 'table',
            columns: ['Nível', 'Dor/Disfunção', 'Intensidade (0-10)'],
            rows: [
                { id: 't1p', label: 'T1', fields: [{ id: 'palp_t1_dor', type: 'checkbox' }, { id: 'palp_t1_int', type: 'number' }] },
                { id: 't2', label: 'T2', fields: [{ id: 'palp_t2_dor', type: 'checkbox' }, { id: 'palp_t2_int', type: 'number' }] },
                { id: 't3', label: 'T3', fields: [{ id: 'palp_t3_dor', type: 'checkbox' }, { id: 'palp_t3_int', type: 'number' }] },
                { id: 't4', label: 'T4', fields: [{ id: 'palp_t4_dor', type: 'checkbox' }, { id: 'palp_t4_int', type: 'number' }] },
                { id: 't5', label: 'T5', fields: [{ id: 'palp_t5_dor', type: 'checkbox' }, { id: 'palp_t5_int', type: 'number' }] },
                { id: 't6', label: 'T6', fields: [{ id: 'palp_t6_dor', type: 'checkbox' }, { id: 'palp_t6_int', type: 'number' }] },
                { id: 't7p', label: 'T7', fields: [{ id: 'palp_t7_dor', type: 'checkbox' }, { id: 'palp_t7_int', type: 'number' }] }
            ],
            fields: [{ id: 'palp_art_t_obs', label: 'Observações Palpação T1-T7', type: 'textarea' }]
        },
        {
            id: 'palpacao_miofascial',
            title: 'Palpação Miofascial',
            type: 'table',
            columns: ['Músculo', 'Lado Esquerdo', 'Lado Direito'],
            rows: [
                { id: 'suboccipitais', label: 'Suboccipitais', fields: [{ id: 'mio_suboccipitais_esq', type: 'checkbox' }, { id: 'mio_suboccipitais_dir', type: 'checkbox' }] },
                { id: 'esplenios', label: 'Esplênios', fields: [{ id: 'mio_esplenios_esq', type: 'checkbox' }, { id: 'mio_esplenios_dir', type: 'checkbox' }] },
                { id: 'escalenos', label: 'Escalenos', fields: [{ id: 'mio_escalenos_esq', type: 'checkbox' }, { id: 'mio_escalenos_dir', type: 'checkbox' }] },
                { id: 'ecom', label: 'Esternocleidomastóide', fields: [{ id: 'mio_ecom_esq', type: 'checkbox' }, { id: 'mio_ecom_dir', type: 'checkbox' }] },
                { id: 'trapezio_sup', label: 'Trapézio Superior', fields: [{ id: 'mio_trapezio_esq', type: 'checkbox' }, { id: 'mio_trapezio_dir', type: 'checkbox' }] },
                { id: 'lev_escapula', label: 'Elevador da Escápula', fields: [{ id: 'mio_lev_escapula_esq', type: 'checkbox' }, { id: 'mio_lev_escapula_dir', type: 'checkbox' }] },
                { id: 'romboides', label: 'Romboides', fields: [{ id: 'mio_romboides_esq', type: 'checkbox' }, { id: 'mio_romboides_dir', type: 'checkbox' }] },
                { id: 'grande_dorsal', label: 'Grande Dorsal', fields: [{ id: 'mio_grande_dorsal_esq', type: 'checkbox' }, { id: 'mio_grande_dorsal_dir', type: 'checkbox' }] },
                { id: 'peitorais', label: 'Peitorais', fields: [{ id: 'mio_peitorais_esq', type: 'checkbox' }, { id: 'mio_peitorais_dir', type: 'checkbox' }] }
            ],
            fields: [{ id: 'palp_mio_obs', label: 'Observações Palpação Miofascial', type: 'textarea' }]
        },
        {
            id: 'testes_especiais_resistidos',
            title: 'Testes Resistidos e Especiais',
            fields: [
                { id: 'resist_flexora', label: 'Resistência Musculatura Flexora (segundos)', type: 'number' },
                { id: 'resist_extensora', label: 'Resistência Musculatura Extensora (segundos)', type: 'number' },
                { id: 'testes_especiais', label: 'Testes Especiais / Observações', type: 'textarea' }
            ]
        },
        {
            id: 'diagnostico_conclusoes',
            title: 'Diagnóstico e Conclusões',
            fields: [
                { id: 'diagnostico', label: 'Diagnóstico Funcional', type: 'textarea' },
                { id: 'conclusao', label: 'Conclusões e Sugestões Terapêuticas', type: 'textarea' }
            ]
        },
        {
            id: 'ndi_integracao',
            title: 'NDI (Neck Disability Index)',
            fields: [
                { id: 'ndi_score_previo', label: 'Score Questionário Prévio', type: 'text' },
                { id: 'ndi_data_previo', label: 'Data da Avaliação Prévia', type: 'date' },
                { id: 'ndi_obs_previo', label: 'Observações Básicas', type: 'textarea' },
                { id: 'ndi_novo', label: 'Preencher novo Questionário NDI', type: 'button' },
                { id: 'ndi_score', label: 'Resultado/Score NDI Atual', type: 'text' }
            ]
        }
    ],
    calculateScore: (answers) => {
      // For clinical assessments, we just return a "Finished" state for now
      return { score: 0, max: 0, percentage: 100, interpretation: 'Avaliação Concluída', unit: '%' };
    }
  },
  afLombar: {
    id: 'afLombar',
    segment: 'lombar',
    title: 'Avaliação Funcional Lombar',
    description: 'Avaliação completa da coluna lombar, incluindo movimento, palpação e testes neurológicos.',
    sections: [
        {
            id: 'anamnese',
            title: 'Características da Disfunção',
            fields: [
                { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 },
                { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: '/img/esquema_corpo_inteiro.png' },
                { id: 'historia', label: 'História Pregressa', type: 'textarea' },
                { id: 'piora', label: 'Atividade de Piora', type: 'textarea' },
                { id: 'alivio', label: 'Atividade de Alívio', type: 'textarea' },
                { id: 'doencas', label: 'Doenças Associadas/Cirurgias Realizadas', type: 'textarea' }
            ]
        },
        {
            id: 'neuro_forca',
            title: 'Avaliação Neurológica (Força Muscular)',
            type: 'table',
            columns: [
                'Miótono / Músculo', 
                { label: 'Esquerdo (0-5)', action: { type: 'fill', value: '5' } }, 
                { label: 'Direito (0-5)', action: { type: 'fill', value: '5' } }
            ],
            rows: [
                { id: 'l2', label: 'Flexor de Quadril (L2)', fields: ['l2_esq', 'l2_dir'] },
                { id: 'l3', label: 'Extensor de Joelho (L3)', fields: ['l3_esq', 'l3_dir'] },
                { id: 'l4', label: 'Dorsiflexor (L4)', fields: ['l4_esq', 'l4_dir'] },
                { id: 'l5', label: 'Extensor de Hálux (L5)', fields: ['l5_esq', 'l5_dir'] },
                { id: 's1', label: 'Flexor Plantar (S1)', fields: ['s1_esq', 's1_dir'] }
            ],
            fields: [{ id: 'neuro_forca_obs', label: 'Observações de Força Muscular', type: 'textarea' }]
        },
        {
            id: 'neuro_add',
            title: 'Avaliação Neurológica Adicional',
            fields: [
                { id: 'observacoes_neuro', label: 'Avaliação Adicional (Reflexos, Sensibilidade, etc.)', type: 'textarea' }
            ]
        },
        {
            id: 'postural',
            title: 'Avaliação Postural',
            fields: [
                { id: 'postura_obs', label: 'Vista Posterior / Anterior / Laterais (Observações)', type: 'textarea' },
                { id: 'postura_img', label: 'Registros Fotográficos', type: 'image-upload' }
            ]
        },
        {
            id: 'movimento_lombar',
            title: 'Avaliação do Movimento (Graus)',
            type: 'table',
            columns: ['Movimento', 'Graus', 'Padrão / Observações', { label: 'Imagem', type: 'image-upload' }],
            rows: [
                { id: 'flexao', label: 'Flexão', fields: ['flexao_graus', 'flexao_obs', { id: 'flexao_img', type: 'image-upload' }] },
                { id: 'extensao', label: 'Extensão', fields: ['extensao_graus', 'extensao_obs', { id: 'extensao_img', type: 'image-upload' }] },
                { id: 'incl_esq', label: 'Inclinação Esquerda', fields: ['incl_esq_graus', 'incl_esq_obs', { id: 'incl_esq_img', type: 'image-upload' }] },
                { id: 'incl_dir', label: 'Inclinação Direita', fields: ['incl_dir_graus', 'incl_dir_obs', { id: 'incl_dir_img', type: 'image-upload' }] },
                { id: 'rot_esq', label: 'Rotação Esquerda', fields: ['rot_esq_graus', 'rot_esq_obs', { id: 'rot_esq_img', type: 'image-upload' }] },
                { id: 'rot_dir', label: 'Rotação Direita', fields: ['rot_dir_graus', 'rot_dir_obs', { id: 'rot_dir_img', type: 'image-upload' }] }
            ]
        },
        {
            id: 'mobilidade_quadril',
            title: 'Mobilidade de Quadril (Graus)',
            type: 'table',
            columns: ['Movimento', 'Graus', 'Padrão / Observações', { label: 'Imagem', type: 'image-upload' }],
            rows: [
                { id: 'flex_quad_esq', label: 'Flexão Quadril Esq.', fields: ['flex_quad_esq_graus', 'flex_quad_esq_obs', { id: 'flex_quad_esq_img', type: 'image-upload' }] },
                { id: 'flex_quad_dir', label: 'Flexão Quadril Dir.', fields: ['flex_quad_dir_graus', 'flex_quad_dir_obs', { id: 'flex_quad_dir_img', type: 'image-upload' }] },
                { id: 'rot_med_quad_esq', label: 'Rot. Medial Quad. Esq.', fields: ['rot_med_quad_esq_graus', 'rot_med_quad_esq_obs', { id: 'rot_med_quad_esq_img', type: 'image-upload' }] },
                { id: 'rot_lat_quad_esq', label: 'Rot. Lateral Quad. Esq.', fields: ['rot_lat_quad_esq_graus', 'rot_lat_quad_esq_obs', { id: 'rot_lat_quad_esq_img', type: 'image-upload' }] },
                { id: 'rot_med_quad_dir', label: 'Rot. Medial Quad. Dir.', fields: ['rot_med_quad_dir_graus', 'rot_med_quad_dir_obs', { id: 'rot_med_quad_dir_img', type: 'image-upload' }] },
                { id: 'rot_lat_quad_dir', label: 'Rot. Lateral Quad. Dir.', fields: ['rot_lat_quad_dir_graus', 'rot_lat_quad_dir_obs', { id: 'rot_lat_quad_dir_img', type: 'image-upload' }] }
            ]
        },
        {
            id: 'palpacao_articular_l',
            title: 'Palpação e Irritabilidade - Articular',
            type: 'table',
            columns: ['Nível', 'Dor/Disfunção', 'Intensidade (0-10)'],
            rows: [
                { id: 't7p', label: 'T7', fields: [{ id: 'palp_t7_dor', type: 'checkbox' }, { id: 'palp_t7_int', type: 'number' }] },
                { id: 't8p', label: 'T8', fields: [{ id: 'palp_t8_dor', type: 'checkbox' }, { id: 'palp_t8_int', type: 'number' }] },
                { id: 't9p', label: 'T9', fields: [{ id: 'palp_t9_dor', type: 'checkbox' }, { id: 'palp_t9_int', type: 'number' }] },
                { id: 't10p', label: 'T10', fields: [{ id: 'palp_t10_dor', type: 'checkbox' }, { id: 'palp_t10_int', type: 'number' }] },
                { id: 't11p', label: 'T11', fields: [{ id: 'palp_t11_dor', type: 'checkbox' }, { id: 'palp_t11_int', type: 'number' }] },
                { id: 't12p', label: 'T12', fields: [{ id: 'palp_t12_dor', type: 'checkbox' }, { id: 'palp_t12_int', type: 'number' }] },
                { id: 'l1p', label: 'L1', fields: [{ id: 'palp_l1_dor', type: 'checkbox' }, { id: 'palp_l1_int', type: 'number' }] },
                { id: 'l2p', label: 'L2', fields: [{ id: 'palp_l2_dor', type: 'checkbox' }, { id: 'palp_l2_int', type: 'number' }] },
                { id: 'l3p', label: 'L3', fields: [{ id: 'palp_l3_dor', type: 'checkbox' }, { id: 'palp_l3_int', type: 'number' }] },
                { id: 'l4p', label: 'L4', fields: [{ id: 'palp_l4_dor', type: 'checkbox' }, { id: 'palp_l4_int', type: 'number' }] },
                { id: 'l5p', label: 'L5', fields: [{ id: 'palp_l5_dor', type: 'checkbox' }, { id: 'palp_l5_int', type: 'number' }] },
                { id: 'sacrop', label: 'Sacro', fields: [{ id: 'palp_sacro_dor', type: 'checkbox' }, { id: 'palp_sacro_int', type: 'number' }] }
            ],
            fields: [{ id: 'palp_art_l_obs', label: 'Observações Palpação Articular', type: 'textarea' }]
        },
        {
            id: 'testes_neurais',
            title: 'Teste Neural',
            type: 'table',
            columns: ['Teste', 'Esquerdo', 'Direito'],
            rows: [
                { id: 'lasegue', label: 'Lasegue', fields: [{ id: 'neural_lasegue_esq', type: 'checkbox' }, { id: 'neural_lasegue_dir', type: 'checkbox' }] },
                { id: 'femoral', label: 'Femoral', fields: [{ id: 'neural_femoral_esq', type: 'checkbox' }, { id: 'neural_femoral_dir', type: 'checkbox' }] },
                { id: 'slump', label: 'SLUMP', fields: [{ id: 'neural_slump_esq', type: 'checkbox' }, { id: 'neural_slump_dir', type: 'checkbox' }] }
            ],
            fields: [{ id: 'testes_neurais_obs', label: 'Observações de Tensão Neural', type: 'textarea' }]
        },
        {
            id: 'palpacao_miofascial',
            title: 'Palpação Miofascial',
            type: 'table',
            columns: ['Músculo', 'Esquerdo', 'Direito'],
            rows: [
                { id: 'quadrado_lombar', label: 'Quadrado Lombar', fields: [{ id: 'mio_quadrado_lombar_esq', type: 'checkbox' }, { id: 'mio_quadrado_lombar_dir', type: 'checkbox' }] },
                { id: 'gluteo_maximo', label: 'Glúteo Máximo', fields: [{ id: 'mio_gluteo_maximo_esq', type: 'checkbox' }, { id: 'mio_gluteo_maximo_dir', type: 'checkbox' }] },
                { id: 'gluteo_medio', label: 'Glúteo Médio', fields: [{ id: 'mio_gluteo_medio_esq', type: 'checkbox' }, { id: 'mio_gluteo_medio_dir', type: 'checkbox' }] },
                { id: 'gluteo_minimo', label: 'Glúteo Mínimo', fields: [{ id: 'mio_gluteo_minimo_esq', type: 'checkbox' }, { id: 'mio_gluteo_minimo_dir', type: 'checkbox' }] },
                { id: 'piriforme', label: 'Piriforme', fields: [{ id: 'mio_piriforme_esq', type: 'checkbox' }, { id: 'mio_piriforme_dir', type: 'checkbox' }] },
                { id: 'tfl', label: 'Tensor da Fáscia Lata', fields: [{ id: 'mio_tfl_esq', type: 'checkbox' }, { id: 'mio_tfl_dir', type: 'checkbox' }] },
                { id: 'iliopsoas', label: 'Iliopsoas', fields: [{ id: 'mio_iliopsoas_esq', type: 'checkbox' }, { id: 'mio_iliopsoas_dir', type: 'checkbox' }] },
                { id: 'outro', label: 'Outro', fields: [{ id: 'mio_outro_esq', type: 'checkbox' }, { id: 'mio_outro_dir', type: 'checkbox' }] }
            ],
            fields: [{ id: 'palp_mio_obs', label: 'Observações Palpação Miofascial', type: 'textarea' }]
        },
        {
            id: 'testes_resistencia',
            title: 'Testes de Resistência Muscular',
            fields: [
                { id: 'flexao_60', label: 'Flexão a 60º - Isometria Anterior (segundos)', type: 'number' },
                { id: 'sorensen', label: 'Teste de Sorensen - Isometria Posterior (segundos)', type: 'number' },
                { id: 'testes_obs', label: 'Observações Adicionais', type: 'textarea' }
            ]
        },
        {
            id: 'diagnostico_conclusoes',
            title: 'Diagnóstico e Conclusões',
            fields: [
                { id: 'diagnostico', label: 'Diagnóstico Cinético Funcional', type: 'textarea' },
                { id: 'conclusao', label: 'Conclusões e Sugestões Terapêuticas', type: 'textarea' }
            ]
        },
        {
            id: 'oswestry_integracao',
            title: 'ODI (Índice de Incapacidade de Oswestry)',
            fields: [
                { id: 'oswestry_score_previo', label: 'Score Questionário Prévio', type: 'text' },
                { id: 'oswestry_data_previo', label: 'Data da Avaliação Prévia', type: 'date' },
                { id: 'oswestry_obs_previo', label: 'Observações Básicas', type: 'textarea' },
                { id: 'oswestry_novo', label: 'Preencher novo Questionário ODI', type: 'button' },
                { id: 'oswestry_score', label: 'Resultado/Score ODI Atual', type: 'text' }
            ]
        }
    ],
    calculateScore: (answers) => ({ score: 0, max: 0, percentage: 100, interpretation: 'Avaliação Concluída', unit: '%' })
  },
  quickdash: {
    id: 'quickdash',
    segment: 'ombro',
    title: 'Quick DASH',
    description: 'Questionário para avaliar sintomas e capacidade física focado no ombro, braço e mão.',
    questions: [
        { text: 'Instrução: Por favor, gradue a sua capacidade para realizar as atividades abaixo, na ÚLTIMA SEMANA, assinalando a opção correspondente.', isInstruction: true },
        { text: '1. Abrir um vidro novo com tampa de rosca ou muito apertada.', options: [{ value: 1, label: 'Nenhuma Dificuldade' }, { value: 2, label: 'Pouca Dificuldade' }, { value: 3, label: 'Média Dificuldade' }, { value: 4, label: 'Muita Dificuldade' }, { value: 5, label: 'Incapaz de Fazer' }] },
        { text: '2. Fazer trabalhos domésticos pesados (ex.: lavar o chão, lavar paredes, etc.).', options: [{ value: 1, label: 'Nenhuma Dificuldade' }, { value: 2, label: 'Pouca Dificuldade' }, { value: 3, label: 'Média Dificuldade' }, { value: 4, label: 'Muita Dificuldade' }, { value: 5, label: 'Incapaz de Fazer' }] },
        { text: '3. Carregar uma sacola de compras pesada ou mala.', options: [{ value: 1, label: 'Nenhuma Dificuldade' }, { value: 2, label: 'Pouca Dificuldade' }, { value: 3, label: 'Média Dificuldade' }, { value: 4, label: 'Muita Dificuldade' }, { value: 5, label: 'Incapaz de Fazer' }] },
        { text: '4. Lavar as costas.', options: [{ value: 1, label: 'Nenhuma Dificuldade' }, { value: 2, label: 'Pouca Dificuldade' }, { value: 3, label: 'Média Dificuldade' }, { value: 4, label: 'Muita Dificuldade' }, { value: 5, label: 'Incapaz de Fazer' }] },
        { text: '5. Usar uma faca para cortar os alimentos.', options: [{ value: 1, label: 'Nenhuma Dificuldade' }, { value: 2, label: 'Pouca Dificuldade' }, { value: 3, label: 'Média Dificuldade' }, { value: 4, label: 'Muita Dificuldade' }, { value: 5, label: 'Incapaz de Fazer' }] },
        { text: '6. Atividades recreacionais de lazer em que você aplica alguma força com o seu braço, ombro ou mão.', options: [{ value: 1, label: 'Nenhuma Dificuldade' }, { value: 2, label: 'Pouca Dificuldade' }, { value: 3, label: 'Média Dificuldade' }, { value: 4, label: 'Muita Dificuldade' }, { value: 5, label: 'Incapaz de Fazer' }] },
        { text: '7. O problema no braço, ombro ou mão impediu-o de realizar suas atividades sociais e normais na ÚLTIMA SEMANA?', options: [{ value: 1, label: 'De Forma Nenhuma' }, { value: 2, label: 'Dificultou um Pouco' }, { value: 3, label: 'Dificultou Moderadamente' }, { value: 4, label: 'Dificultou Bastante' }, { value: 5, label: 'Impediu Totalmente' }] },
        { text: '8. O problema no braço, ombro ou mão limitou as suas atividades normais de trabalho ou cotidiano?', options: [{ value: 1, label: 'Não Limitou nada' }, { value: 2, label: 'Limitou um Pouco' }, { value: 3, label: 'Limitou Moderadamente' }, { value: 4, label: 'Limitou Bastante' }, { value: 5, label: 'Impediu Totalmente' }] },
        { text: 'Instrução: Por favor, gradue a intensidade dos sintomas que você sentiu na ÚLTIMA SEMANA.', isInstruction: true },
        { text: '9. Dor no braço, ombro ou mão.', options: [{ value: 1, label: 'Nenhuma Dor' }, { value: 2, label: 'Dor Leve' }, { value: 3, label: 'Dor Moderada' }, { value: 4, label: 'Dor Severa' }, { value: 5, label: 'Dor Extrema' }] },
        { text: '10. Sensação de formigamento ou dormência no seu braço, ombro ou mão.', options: [{ value: 1, label: 'Nenhum sintoma' }, { value: 2, label: 'De Leve intensidade' }, { value: 3, label: 'De Média intensidade' }, { value: 4, label: 'De Muita intensidade' }, { value: 5, label: 'Extremo' }] },
        { text: '11. dificuldade para dormir por causa de dor no seu braço, ombro ou mão?', options: [{ value: 1, label: 'Nenhuma Dificuldade' }, { value: 2, label: 'Pouca Dificuldade' }, { value: 3, label: 'Moderada' }, { value: 4, label: 'Muita Dificuldade' }, { value: 5, label: 'Extrema' }] }
    ],
    calculateScore: (answers) => {
        const values = Object.values(answers).filter(v => typeof v === 'number');
        if (values.length < 10) return { score: 0, percentage: 0, interpretation: 'Mínimo de 10 respostas obrigatórias', unit: '%' };
        const sum = values.reduce((a, b) => a + b, 0);
        const finalScore = ((sum / values.length) - 1) * 25;
        const scoreRounded = Math.round(finalScore * 10) / 10;
        return {
            score: scoreRounded,
            max: 100,
            percentage: scoreRounded,
            interpretation: scoreRounded <= 20 ? 'Excelente' : scoreRounded <= 40 ? 'Bom' : scoreRounded <= 60 ? 'Regular' : 'Ruim',
            unit: '%'
        };
    }
  },
  afOmbro: {
    id: 'afOmbro',
    segment: 'ombro',
    title: 'Avaliação Funcional de Ombro',
    description: 'Protocolo completo de avaliação do complexo do ombro, escapulotorácica e força muscular.',
    sections: [
        {
            id: 'anamnese',
            title: 'Características da Disfunção',
            fields: [
                { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 },
                { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: '/img/esquema_corpo_inteiro.png' },
                { id: 'historia', label: 'História Pregressa / Mecanismo de Lesão', type: 'textarea' },
                { id: 'piora', label: 'Atividade de Piora', type: 'textarea' },
                { id: 'alivio', label: 'Atividade de Alívio', type: 'textarea' },
                { id: 'exames_complementares', label: 'Exames Complementares', type: 'textarea' },
                { id: 'obs_cervical', label: 'Observações Coluna Cervical', type: 'textarea' },
                { id: 'obs_toracica', label: 'Observações Coluna Torácica', type: 'textarea' }
            ]
        },
        {
            id: 'postural',
            title: 'Avaliação Postural e Inspeção',
            fields: [
                { id: 'inspecao_obs', label: 'Observações (Simetria, Atrofia, Escápula Alada)', type: 'textarea' },
                { id: 'postura_img', label: 'Registros Fotográficos', type: 'image-upload' }
            ]
        },
        {
            id: 'adm_ombro',
            title: 'Amplitude de Movimento (Graus)',
            type: 'table',
            columns: ['Movimento', 'Ativa', 'Passiva', { label: 'Imagem', type: 'image-upload' }],
            rows: [
                { id: 'flexao', label: 'Flexão', fields: ['flexao_ativa', 'flexao_passiva', { id: 'flex_img', type: 'image-upload' }] },
                { id: 'extensao', label: 'Extensão', fields: ['extensao_ativa', 'extensao_passiva', { id: 'ext_img', type: 'image-upload' }] },
                { id: 'abd_frontal', label: 'Abdução Frontal', fields: ['abd_f_ativa', 'abd_f_passiva', { id: 'abd_f_img', type: 'image-upload' }] },
                { id: 'rot_med', label: 'Rotação Medial', fields: ['rm_ativa', 'rm_passiva', { id: 'rm_img', type: 'image-upload' }] },
                { id: 'rot_lat', label: 'Rotação Lateral', fields: ['rl_ativa', 'rl_passiva', { id: 'rl_img', type: 'image-upload' }] }
            ]
        },
        {
            id: 'testes_especiais',
            title: 'Testes Especiais',
            type: 'table',
            columns: ['Teste', 'Esquerdo', 'Direito'],
            rows: [
                { id: 'neer', label: 'Neer (Impacto)', fields: [{ id: 'neer_esq', type: 'checkbox' }, { id: 'neer_dir', type: 'checkbox' }] },
                { id: 'hawkins', label: 'Hawkins-Kennedy (Impacto)', fields: [{ id: 'hawkins_esq', type: 'checkbox' }, { id: 'hawkins_dir', type: 'checkbox' }] },
                { id: 'job', label: 'Jobe (Supraespinhal)', fields: [{ id: 'job_esq', type: 'checkbox' }, { id: 'job_dir', type: 'checkbox' }] },
                { id: 'patte', label: 'Patte (Infraespinhal)', fields: [{ id: 'patte_esq', type: 'checkbox' }, { id: 'patte_dir', type: 'checkbox' }] },
                { id: 'gerber', label: 'Gerber (Subescapular)', fields: [{ id: 'gerber_esq', type: 'checkbox' }, { id: 'gerber_dir', type: 'checkbox' }] },
                { id: 'speed', label: 'Speed (Bíceps)', fields: [{ id: 'speed_esq', type: 'checkbox' }, { id: 'speed_dir', type: 'checkbox' }] },
                { id: 'apreensao', label: 'Apreensão (Instabilidade)', fields: [{ id: 'apreensao_esq', type: 'checkbox' }, { id: 'apreensao_dir', type: 'checkbox' }] },
                { id: 'ckcuest', label: 'CKCUEST (Nº de toques)', fields: [{ id: 'ckcuest_valor', type: 'number' }, { id: 'ckcuest_obs', type: 'text' }] },
                { id: 'fadiga_serratil', label: 'Fadiga Serrátil Anterior (segundos)', fields: [{ id: 'fadiga_serratil_esq', type: 'number' }, { id: 'fadiga_serratil_dir', type: 'number' }] }
            ]
        },
        {
            id: 'palpacao_miofascial',
            title: 'Palpação Miofascial (Pontos Gatilhos)',
            type: 'table',
            columns: ['Músculo', 'Esquerdo', 'Direito'],
            rows: [
                { id: 'trapezio_sup', label: 'Trapézio Superior', fields: [{ id: 'trapezio_sup_esq', type: 'checkbox' }, { id: 'trapezio_sup_dir', type: 'checkbox' }] },
                { id: 'deltoide_ant', label: 'Deltoide Anterior', fields: [{ id: 'deltoide_ant_esq', type: 'checkbox' }, { id: 'deltoide_ant_dir', type: 'checkbox' }] },
                { id: 'deltoide_med', label: 'Deltoide Médio', fields: [{ id: 'deltoide_med_esq', type: 'checkbox' }, { id: 'deltoide_med_dir', type: 'checkbox' }] },
                { id: 'deltoide_pos', label: 'Deltoide Posterior', fields: [{ id: 'deltoide_pos_esq', type: 'checkbox' }, { id: 'deltoide_pos_dir', type: 'checkbox' }] },
                { id: 'peitoral_maior', label: 'Peitoral Maior', fields: [{ id: 'peitoral_maior_esq', type: 'checkbox' }, { id: 'peitoral_maior_dir', type: 'checkbox' }] },
                { id: 'peitoral_menor', label: 'Peitoral Menor', fields: [{ id: 'peitoral_menor_esq', type: 'checkbox' }, { id: 'peitoral_menor_dir', type: 'checkbox' }] },
                { id: 'subclavio', label: 'Subclávio', fields: [{ id: 'subclavio_esq', type: 'checkbox' }, { id: 'subclavio_dir', type: 'checkbox' }] },
                { id: 'grande_dorsal', label: 'Grande Dorsal', fields: [{ id: 'grande_dorsal_esq', type: 'checkbox' }, { id: 'grande_dorsal_dir', type: 'checkbox' }] },
                { id: 'redondo_menor', label: 'Redondo Menor', fields: [{ id: 'redondo_menor_esq', type: 'checkbox' }, { id: 'redondo_menor_dir', type: 'checkbox' }] },
                { id: 'supra_espinhoso', label: 'Supra Espinhoso', fields: [{ id: 'supra_espinhoso_esq', type: 'checkbox' }, { id: 'supra_espinhoso_dir', type: 'checkbox' }] },
                { id: 'infraespinhoso', label: 'Infraespinhoso', fields: [{ id: 'infraespinhoso_esq', type: 'checkbox' }, { id: 'infraespinhoso_dir', type: 'checkbox' }] },
                { id: 'romboide', label: 'Romboide', fields: [{ id: 'romboide_esq', type: 'checkbox' }, { id: 'romboide_dir', type: 'checkbox' }] },
                { id: 'extensores_toracicos', label: 'Extensores Torácicos', fields: [{ id: 'extensores_toracicos_esq', type: 'checkbox' }, { id: 'extensores_toracicos_dir', type: 'checkbox' }] },
                { id: 'biceps', label: 'Bíceps', fields: [{ id: 'biceps_esq', type: 'checkbox' }, { id: 'biceps_dir', type: 'checkbox' }] },
                { id: 'triceps', label: 'Tríceps', fields: [{ id: 'triceps_esq', type: 'checkbox' }, { id: 'triceps_dir', type: 'checkbox' }] }
            ]
        },
        {
            id: 'dinamometria',
            title: 'Força Muscular do Ombro (kgF) - Torque',
            type: 'table',
            columns: ['Movimento', 'Esquerdo', 'Direito', '% Déficit'],
            rows: [
                { id: 'abd_forca', label: 'Abdução', fields: ['forca_abd_esq', 'forca_abd_dir', 'forca_abd_deficit'] },
                { id: 'rl_forca', label: 'Rotadores Laterais (RL)', fields: ['forca_rl_esq', 'forca_rl_dir', 'forca_rl_deficit'] },
                { id: 'rm_forca', label: 'Rotadores Mediais (RM)', fields: ['forca_rm_esq', 'forca_rm_dir', 'forca_rm_deficit'] },
                { id: 'ratio_forca', label: 'Relação RL/RM', fields: ['rl_rm_ratio_esq', 'rl_rm_ratio_dir', ''] }
            ]
        },
        {
            id: 'diagnostico_conclusoes',
            title: 'Diagnóstico e Conclusões',
            fields: [
                { id: 'diagnostico', label: 'Diagnóstico Sinésio-Funcional', type: 'textarea' },
                { id: 'conclusao', label: 'Metas e Conduta Terapêutica', type: 'textarea' }
            ]
        },
        {
            id: 'quickdash_integracao',
            title: 'QuickDASH (Disabilities of the Arm, Shoulder and Hand)',
            fields: [
                { id: 'quickdash_score_previo', label: 'Score Questionário Prévio', type: 'text' },
                { id: 'quickdash_data_previo', label: 'Data da Avaliação Prévia', type: 'date' },
                { id: 'quickdash_obs_previo', label: 'Observações Básicas', type: 'textarea' },
                { id: 'quickdash_novo', label: 'Preencher novo QuickDASH', type: 'button' },
                { id: 'quickdash_score', label: 'Resultado QuickDASH Atual', type: 'text' }
            ]
        }
    ]
  },
  afGeriatria: {
    id: 'afGeriatria',
    type: 'clinical',
    segment: 'geriatria',
    title: 'Avaliação Funcional Geriátrica',
    description: 'Avaliação clínica e testes funcionais (mobilidade, força e equilíbrio) específicos para idosos.',
    sections: [
        {
            id: 'anamnese',
            title: 'Anamnese e Exames',
            fields: [
                { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                { id: 'historia', label: 'História Atual e Pregressa', type: 'textarea' },
                { id: 'exames', label: 'Exames Complementares', type: 'textarea' }
            ]
        },
        {
            id: 'adm',
            title: 'Exame Físico - Amplitude de Movimento (ADM)',
            type: 'table',
            columns: ['Movimento', 'Esquerdo', 'Direito'],
            rows: [
                { id: 'adm_quadril', label: 'ADM de Quadril', fields: ['esquerdo', 'direito'] },
                { id: 'extensao_joelho', label: 'Extensão do Joelho', fields: ['esquerdo', 'direito'] },
                { id: 'flexao_joelho', label: 'Flexão do Joelho', fields: ['esquerdo', 'direito'] },
                { id: 'dorsiflexao', label: 'Dorsiflexão', fields: ['esquerdo', 'direito'] },
                { id: 'flexao_plantar', label: 'Flexão Plantar', fields: ['esquerdo', 'direito'] }
            ]
        },
        {
            id: 'testes_equilibrio',
            title: 'Testes de Equilíbrio (Tempo de permanência)',
            fields: [
                { id: 'pes_juntos', label: 'Pés Juntos (segundos - obj: 30s)', type: 'number' },
                { id: 'semi_tandem', label: 'Semi-tandem (segundos - obj: 30s)', type: 'number' },
                { id: 'tandem', label: 'Tandem (segundos - obj: >17.56s)', type: 'number' }
            ]
        },
        {
            id: 'apoio_unipodal',
            title: 'Ficar em Pé em Uma Perna Só (Apoio Unipodal - obj: >10.43s)',
            type: 'table',
            columns: ['Lado', '1ª Tentativa (seg)', '2ª Tentativa (seg)'],
            rows: [
                { id: 'unipodal_dir', label: 'Direita', fields: ['tentativa1', 'tentativa2'] },
                { id: 'unipodal_esq', label: 'Esquerda', fields: ['tentativa1', 'tentativa2'] }
            ]
        },
        {
            id: 'oito_toques',
            title: 'Oito Toques Consecutivos (obj: <10s)',
            fields: [
                { id: 'toques_tempo', label: 'Tempo (segundos)', type: 'number' },
                { id: 'toques_qualidade', label: 'Qualidade do Movimento (1 a 5)', type: 'number' }
            ]
        },
        {
            id: 'levantar_braco',
            title: 'Em pé: Levantar o Braço (Ajuste antecipatório)',
            fields: [
                { id: 'levantar_braco_res', label: 'Realizou os ajustes necessários sem desequilibrar?', type: 'textarea' }
            ]
        },
        {
            id: 'testes_mobilidade',
            title: 'Testes de Mobilidade e Força',
            fields: [
                { id: 'tug', label: 'Timed Up and Go (TUG - seg, obj: <12.47s)', type: 'number' },
                { id: 'vel_marcha', label: 'Velocidade da Marcha (m/s, obj: >0.8m/s)', type: 'number' },
                { id: 'sentar_levantar', label: 'Teste de Sentar/Levantar 5x (segundos)', type: 'number' },
                { id: 'preensao', label: 'Força de Preensão Palmar (kg - obj: >16kg Fem / >27kg Masc)', type: 'number' }
            ]
        },
        {
            id: 'resultados_diagnostico',
            title: 'Resultados, Diagnóstico e Risco de Quedas',
            fields: [
                { id: 'diagnostico_funcional', label: 'Resultados e Diagnóstico Funcional', type: 'textarea' },
                { id: 'risco_quedas', label: 'Classificação do Risco de Quedas', type: 'textarea' }
            ]
        },
        {
            id: 'sugestoes',
            title: 'Sugestões Terapêuticas',
            fields: [
                { id: 'sugestoes_obs', label: 'Sugestões e Considerações Terapêuticas', type: 'textarea' }
            ]
        },
        {
            id: 'questionarios_geriatria_integracao',
            title: 'Questionários Complementares',
            fields: [
                { id: 'man_score_previo', label: 'Score MAN Anterior', type: 'text' },
                { id: 'man_novo', label: 'Preencher novo MAN', type: 'button' },
                { id: 'man_score', label: 'Resultado MAN Atual', type: 'text' },

                { id: 'ves13_score_previo', label: 'Score VES-13 Anterior', type: 'text' },
                { id: 'ves13_novo', label: 'Preencher novo VES-13', type: 'button' },
                { id: 'ves13_score', label: 'Resultado VES-13 Atual', type: 'text' },

                { id: 'lbpq_score_previo', label: 'Score LBPQ Anterior', type: 'text' },
                { id: 'lbpq_novo', label: 'Preencher novo LBPQ', type: 'button' },
                { id: 'lbpq_score', label: 'Resultado LBPQ Atual', type: 'text' },

                { id: 'brief_score_previo', label: 'Score BPI-SF Anterior', type: 'text' },
                { id: 'brief_novo', label: 'Preencher novo BPI-SF', type: 'button' },
                { id: 'brief_score', label: 'Resultado BPI-SF Atual', type: 'text' }
            ]
        }
    ],
    calculateScore: () => ({ score: 0, max: 0, percentage: 100, interpretation: 'Avaliação Concluída', unit: '%' })
  },
  man: {
    id: 'man',
    segment: 'geriatria',
    title: 'MAN - Mini Avaliação Nutricional',
    description: 'Ferramenta validada para identificar idosos desnutridos ou em risco de desnutrição.',
    questions: [
        { text: 'TRIAGEM (Parte 1 — máximo 14 pontos)', isInstruction: true },
        {
            text: 'A. Nos últimos 3 meses, houve diminuição da ingesta alimentar devido a perda de apetite, problemas digestivos ou dificuldade para mastigar ou deglutir?',
            options: [
                { value: 0, label: 'Diminuição grave da ingesta' },
                { value: 1, label: 'Diminuição moderada da ingesta' },
                { value: 2, label: 'Sem diminuição da ingesta' }
            ]
        },
        {
            text: 'B. Perda de peso nos últimos 3 meses.',
            options: [
                { value: 0, label: 'Superior a 3 kg' },
                { value: 1, label: 'Não sabe informar' },
                { value: 2, label: 'Entre 1 e 3 kg' },
                { value: 3, label: 'Sem perda de peso' }
            ]
        },
        {
            text: 'C. Mobilidade.',
            options: [
                { value: 0, label: 'Restrito ao leito ou à cadeira de rodas' },
                { value: 1, label: 'Deambula, mas não é capaz de sair de casa' },
                { value: 2, label: 'Normal' }
            ]
        },
        {
            text: 'D. Passou por algum estresse psicológico ou doença aguda nos últimos 3 meses?',
            options: [
                { value: 0, label: 'Sim' },
                { value: 2, label: 'Não' }
            ]
        },
        {
            text: 'E. Problemas neuropsicológicos.',
            options: [
                { value: 0, label: 'Demência ou depressão grave' },
                { value: 1, label: 'Demência ligeira' },
                { value: 2, label: 'Sem problemas psicológicos' }
            ]
        },
        {
            text: 'F1. Índice de Massa Corporal (IMC) = [peso (kg)] / [estatura (m)]²',
            options: [
                { value: 0, label: 'IMC < 19' },
                { value: 1, label: '19 ≤ IMC < 21' },
                { value: 2, label: '21 ≤ IMC < 23' },
                { value: 3, label: 'IMC ≥ 23' }
            ]
        },
        { text: 'AVALIAÇÃO (Parte 2 — máximo 16 pontos)', isInstruction: true },
        {
            text: 'G. O paciente vive em sua própria casa (independente)?',
            options: [
                { value: 0, label: 'Não' },
                { value: 1, label: 'Sim' }
            ]
        },
        {
            text: 'H. Utiliza mais de 3 medicamentos diferentes por dia?',
            options: [
                { value: 0, label: 'Sim' },
                { value: 1, label: 'Não' }
            ]
        },
        {
            text: 'I. Lesões de pele ou escaras?',
            options: [
                { value: 0, label: 'Sim' },
                { value: 1, label: 'Não' }
            ]
        },
        {
            text: 'J. Quantas refeições faz por dia?',
            options: [
                { value: 0, label: '1 refeição' },
                { value: 1, label: '2 refeições' },
                { value: 2, label: '3 refeições' }
            ]
        },
        {
            text: 'K. Consumo de proteínas (quantas das 3 opções são "Sim"?): Pelo menos 1 porção diária de leite/derivados? | 2 ou mais porções semanais de leguminosas/ovos? | Carne, peixe ou aves todos os dias?',
            options: [
                { value: 0, label: '0 ou 1 resposta "Sim"' },
                { value: 1, label: '2 respostas "Sim"' },
                { value: 2, label: '3 respostas "Sim"' }
            ]
        },
        {
            text: 'L. Consome 2 ou mais porções diárias de frutas ou hortaliças?',
            options: [
                { value: 0, label: 'Não' },
                { value: 1, label: 'Sim' }
            ]
        },
        {
            text: 'M. Quantos copos de líquidos (água, suco, café, chá, leite) consome por dia?',
            options: [
                { value: 0, label: 'Menos de 3 copos' },
                { value: 1, label: '3 a 5 copos' },
                { value: 2, label: 'Mais de 5 copos' }
            ]
        },
        {
            text: 'N. Modo de se alimentar.',
            options: [
                { value: 0, label: 'Não é capaz de se alimentar sozinho' },
                { value: 1, label: 'Alimenta-se sozinho, porém com dificuldade' },
                { value: 2, label: 'Alimenta-se sozinho, sem dificuldade' }
            ]
        },
        {
            text: 'O. O paciente acredita ter algum problema nutricional?',
            options: [
                { value: 0, label: 'Acredita estar desnutrido' },
                { value: 1, label: 'Não sabe dizer' },
                { value: 2, label: 'Acredita não ter problema nutricional' }
            ]
        },
        {
            text: 'P. Em comparação com outras pessoas da mesma idade, como o paciente considera a sua própria saúde?',
            options: [
                { value: 0, label: 'Pior' },
                { value: 1, label: 'Não sabe' },
                { value: 2, label: 'Igual' },
                { value: 3, label: 'Melhor' }
            ]
        },
        {
            text: 'Q. Perímetro braquial (PB) em cm.',
            options: [
                { value: 0, label: 'PB < 21 cm' },
                { value: 1, label: '21 cm ≤ PB ≤ 22 cm' },
                { value: 2, label: 'PB > 22 cm' }
            ]
        },
        {
            text: 'R. Perímetro da perna (PP) em cm.',
            options: [
                { value: 0, label: 'PP < 31 cm' },
                { value: 1, label: 'PP ≥ 31 cm' }
            ]
        }
    ],
    calculateScore: (answers) => {
        const values = Object.values(answers);
        if (values.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };
        const totalScore = values.reduce((a, b) => a + b, 0);
        let interpretation = '';
        if (totalScore >= 24) interpretation = 'Estado Nutricional Normal';
        else if (totalScore >= 17) interpretation = 'Risco de Desnutrição';
        else interpretation = 'Desnutrido';
        return { score: totalScore, max: 30, percentage: Math.round((totalScore/30)*100), interpretation, unit: 'pontos' };
    }
  },
  ves13: {
    id: 'ves13',
    segment: 'geriatria',
    title: 'VES-13 — Vulnerable Elders Survey',
    description: 'Rastreamento rápido para identificar idosos em risco de declínio funcional ou morte.',
    questions: [
        { text: 'Instrução: As questões a seguir são sobre a saúde e atividades físicas do paciente. Por favor, responda conforme a condição atual.', isInstruction: true },
        {
            text: '1. Qual é a idade do paciente?',
            options: [
                { value: 0, label: '65 a 74 anos' },
                { value: 1, label: '75 a 84 anos' },
                { value: 3, label: '85 anos ou mais' }
            ]
        },
        {
            text: '2. Em geral, comparando com outras pessoas da sua idade, você diria que sua saúde é:',
            options: [
                { value: 0, label: 'Excelente' },
                { value: 0, label: 'Muito boa' },
                { value: 0, label: 'Boa' },
                { value: 1, label: 'Regular' },
                { value: 1, label: 'Ruim' }
            ]
        },
        { text: 'LIMITAÇÃO FÍSICA — Em média, quanta dificuldade você tem para: (1 ponto para cada "Muita dificuldade" ou "Incapaz", máximo 2 pontos nesta seção)', isInstruction: true },
        {
            text: '3a. Curvar-se, agachar ou ajoelhar-se?',
            options: [
                { value: 0, label: 'Nenhuma dificuldade' }, { value: 0, label: 'Um pouco de dificuldade' }, { value: 0, label: 'Alguma dificuldade' },
                { value: 1, label: 'Muita dificuldade' }, { value: 1, label: 'Incapaz de fazer' }
            ]
        },
        {
            text: '3b. Levantar ou carregar objetos com peso aproximado de 5 kg?',
            options: [
                { value: 0, label: 'Nenhuma dificuldade' }, { value: 0, label: 'Um pouco de dificuldade' }, { value: 0, label: 'Alguma dificuldade' },
                { value: 1, label: 'Muita dificuldade' }, { value: 1, label: 'Incapaz de fazer' }
            ]
        },
        {
            text: '3c. Elevar ou estender os braços acima do nível do ombro?',
            options: [
                { value: 0, label: 'Nenhuma dificuldade' }, { value: 0, label: 'Um pouco de dificuldade' }, { value: 0, label: 'Alguma dificuldade' },
                { value: 1, label: 'Muita dificuldade' }, { value: 1, label: 'Incapaz de fazer' }
            ]
        },
        {
            text: '3d. Escrever ou manusear e segurar pequenos objetos?',
            options: [
                { value: 0, label: 'Nenhuma dificuldade' }, { value: 0, label: 'Um pouco de dificuldade' }, { value: 0, label: 'Alguma dificuldade' },
                { value: 1, label: 'Muita dificuldade' }, { value: 1, label: 'Incapaz de fazer' }
            ]
        },
        {
            text: '3e. Andar 400 metros (aproximadamente quatro quarteirões)?',
            options: [
                { value: 0, label: 'Nenhuma dificuldade' }, { value: 0, label: 'Um pouco de dificuldade' }, { value: 0, label: 'Alguma dificuldade' },
                { value: 1, label: 'Muita dificuldade' }, { value: 1, label: 'Incapaz de fazer' }
            ]
        },
        {
            text: '3f. Fazer serviço doméstico pesado, como esfregar o chão ou limpar janelas?',
            options: [
                { value: 0, label: 'Nenhuma dificuldade' }, { value: 0, label: 'Um pouco de dificuldade' }, { value: 0, label: 'Alguma dificuldade' },
                { value: 1, label: 'Muita dificuldade' }, { value: 1, label: 'Incapaz de fazer' }
            ]
        },
        { text: 'INCAPACIDADES — Por causa da sua saúde ou condição física, você tem dificuldade para: (4 pontos se 1 ou mais respostas "Sim", máximo 4 pontos nesta seção)', isInstruction: true },
        {
            text: '4a. Fazer compras de itens pessoais (produtos de higiene pessoal ou medicamentos)?',
            options: [ { value: 0, label: 'Não' }, { value: 4, label: 'Sim' } ]
        },
        {
            text: '4b. Lidar com dinheiro (controlar despesas, gastos ou pagar contas)?',
            options: [ { value: 0, label: 'Não' }, { value: 4, label: 'Sim' } ]
        },
        {
            text: '4c. Atravessar o quarto andando ou caminhar pela sala?',
            options: [ { value: 0, label: 'Não' }, { value: 4, label: 'Sim' } ]
        },
        {
            text: '4d. Realizar tarefas domésticas leves (lavar louça, arrumar a casa ou limpeza leve)?',
            options: [ { value: 0, label: 'Não' }, { value: 4, label: 'Sim' } ]
        },
        {
            text: '4e. Tomar banho sozinho(a) de chuveiro ou banheira?',
            options: [ { value: 0, label: 'Não' }, { value: 4, label: 'Sim' } ]
        }
    ],
    calculateScore: (answers) => {
        let score = 0;
        if (answers[1] !== undefined) score += answers[1]; // Q1 age
        if (answers[2] !== undefined) score += answers[2]; // Q2 health
        
        // Q3a-3f (physical limitations) - indicies 4 to 9 in the current questionnaire template
        let physLimitScore = 0;
        [4,5,6,7,8,9].forEach(idx => { if (answers[idx]) physLimitScore += answers[idx]; });
        score += Math.min(physLimitScore, 2);

        // Q4a-4e (disabilities) - indicies 11 to 15
        let hasDisability = false;
        [11,12,13,14,15].forEach(idx => { if (answers[idx] === 4) hasDisability = true; });
        if (hasDisability) score += 4;

        let interpretation = score >= 3 ? 'Idoso Vulnerável' : 'Idoso Robusto';
        return { score, max: 10, percentage: score*10, interpretation, unit: 'pontos' };
    }
  },
  lbpq: {
    id: 'lbpq',
    segment: 'geriatria',
    title: 'LBPQ — Roland-Morris (Incapacidade por Dor Lombar)',
    description: 'Questionário de 24 itens para avaliar incapacidade funcional por dor lombar.',
    questions: [
        { text: 'Instrução: Assinale apenas as frases que descrevem você HOJE.', isInstruction: true },
        { text: '1. Fico em casa a maior parte do tempo por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '2. Mudo de posição frequentemente tentando deixar minhas costas confortáveis.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '3. Ando mais devagar que o habitual por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '4. Por causa das minhas costas, não estou fazendo alguns trabalhos que geralmente faço em casa.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '5. Por causa das minhas costas, uso o corrimão para subir escadas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '6. Por causa das minhas costas, deito para descansar mais frequentemente.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '7. Por causa das minhas costas, tenho que me apoiar em alguma coisa para me levantar de uma poltrona.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '8. Por causa das minhas costas, peço que outras pessoas façam as coisas por mim.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '9. Me visto mais lentamente que o habitual por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '10. Só fico em pé por curtos períodos de tempo por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '11. Por causa das minhas costas, evito dobrar-me ou ajoelhar-me.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '12. Acho difícil levantar-me de uma cadeira por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '13. As minhas costas estão quase sempre doendo.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '14. Tenho dificuldade em virar-me na cama por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '15. Não tenho muito apetite por causa das dores nas minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '16. Tenho problemas para colocar minhas meias por causa das dores nas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '17. Caminho apenas curtas distâncias por causa das dores nas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '18. Não durmo tão bem por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '19. Por causa das dores nas costas, visto-me com ajuda de outras pessoas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '20. Fico sentado a maior parte do dia por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '21. Evito trabalhos pesados em casa por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '22. Por causa das dores nas costas, fico mais irritado com as pessoas do que o habitual.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '23. Por causa das minhas costas, subo escadas mais vagarosamente do que o habitual.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
        { text: '24. Fico na cama deitado ou sentado a maior parte do tempo por causa das dores nas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] }
    ],
    calculateScore: (answers) => {
        const total = Object.values(answers).reduce((a, b) => a + b, 0);
        let interpretation = total <= 4 ? 'Mínima' : total <= 8 ? 'Leve' : total <= 14 ? 'Moderada' : 'Severa';
        return { score: total, max: 24, percentage: Math.round((total/24)*100), interpretation: `Incapacidade: ${interpretation}`, unit: 'pontos' };
    }
  },
  brief: {
    id: 'brief',
    segment: 'geriatria',
    title: 'Brief Pain Inventory (BPI-SF)',
    description: 'Inventário Breve de Dor: avalia a intensidade da dor e seu impacto nas atividades diárias.',
    questions: [
        { text: 'INTENSIDADE DA DOR (0-10)', isInstruction: true },
        { text: '1. A pior dor que você sentiu nas últimas 24 horas.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '2. A dor mais fraca que você sentiu nas últimas 24 horas.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '3. A média da sua dor.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '4. A dor agora (neste momento).', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: 'INTERFERÊNCIA DA DOR (0-10)', isInstruction: true },
        { text: '5. Atividade geral.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '6. Humor / Disposição.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '7. Capacidade de caminhar.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '8. Trabalho normal.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '9. Relações sociais.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '10. Sono.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) },
        { text: '11. Aproveitamento da vida.', options: scores0to5.concat(["6", "7", "8", "9", "10"]).map(v => ({ value: parseInt(v), label: v })) }
    ],
    calculateScore: (answers) => {
        const severityIndices = [1, 2, 3, 4];
        const interferenceIndices = [6, 7, 8, 9, 10, 11, 12];
        const sevValues = severityIndices.filter(i => answers[i] !== undefined).map(i => answers[i]);
        const intValues = interferenceIndices.filter(i => answers[i] !== undefined).map(i => answers[i]);
        const sevAvg = sevValues.length ? (sevValues.reduce((a,b) => a+b, 0) / sevValues.length) : 0;
        const intAvg = intValues.length ? (intValues.reduce((a,b) => a+b, 0) / intValues.length) : 0;
        return { score: sevAvg, max: 10, percentage: sevAvg*10, interpretation: `Severidade: ${sevAvg.toFixed(1)}/10 | Interferência: ${intAvg.toFixed(1)}/10`, unit: 'média' };
    }
  }
};
