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
  type: 'textarea' | 'range' | 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'table' | 'bodyschema';

  min?: number;
  max?: number;
  step?: number;
  image?: string;
  options?: string[]; // for simple select
};

export type Section = {
  id: string;
  title: string;
  fields: SectionField[];
};

export type Questionnaire = {
  id: string;
  segment: string;
  title: string;
  description: string;
  icon?: string;
  questions?: Question[];
  sections?: Section[];
  calculateScore?: (answers: Record<string, any>) => any;
};

const scores0to5 = ["0", "1", "2", "3", "4", "5"];

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
      { text: '8. Vida Social', options: [
        { value: 0, label: 'Minha vida social é normal e não me causa dor extra.' },
        { value: 1, label: 'Minha vida social é normal, mas aumenta o grau de dor.' },
        { value: 2, label: 'A dor não tem efeito sobre a minha vida social, mas restringe os meus interesses mais ativos.' },
        { value: 3, label: 'A dor tem restringido a minha vida social e não saio com tanta frequência.' },
        { value: 4, label: 'A dor restringiu a minha vida social a minha casa.' },
        { value: 5, label: 'Não tenho nenhuma vida social por causa da dor.' }
      ]},
      { text: '9. Viagens', options: [
        { value: 0, label: 'Posso viajar para qualquer lugar sem dor.' },
        { value: 1, label: 'Posso viajar para qualquer lugar, mas causa dor extra.' },
        { value: 2, label: 'A dor é ruim, mas consigo fazer viagens de mais de duas horas.' },
        { value: 3, label: 'A dor restringe viagens para menos de uma hora.' },
        { value: 4, label: 'A dor restringe viagens curtas e necessárias para menos de meia hora.' },
        { value: 5, label: 'A dor me impede de viajar, exceto para ir ao médico e hospitais.' }
      ]}
    ],
    calculateScore: (answers) => {
      const vals = Object.values(answers).map(v => Number(v));
      if (vals.length === 0) return { percentage: 0, interpretation: 'Pendente', unit: '%' };
      const total = vals.reduce((a, b) => a + b, 0);
      const percentage = Math.round((total / (vals.length * 5)) * 100);
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
      ]}
    ],
    calculateScore: (answers) => {
      const vals = Object.values(answers).map(v => Number(v));
      if (vals.length === 0) return { percentage: 0, interpretation: 'Pendente', unit: '%' };
      const total = vals.reduce((a, b) => a + b, 0);
      const percentage = Math.round((total / (vals.length * 5)) * 100);
      let interpretation = 'Sem Deficiência';
      if (percentage > 8) interpretation = 'Deficiência Leve';
      if (percentage > 28) interpretation = 'Deficiência Moderada';
      if (percentage > 48) interpretation = 'Deficiência Severa';
      if (percentage > 68) interpretation = 'Deficiência Completa';
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
          { id: 'intensidade', label: 'Intensidade da Dor (0-10)', type: 'range', min: 0, max: 10, step: 1 },
          { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: '/img/esquema_corpo_inteiro.png' },
          { id: 'historia', label: 'História Pregressa', type: 'textarea' },
          { id: 'piora', label: 'Fatores de Piora', type: 'textarea' },
          { id: 'alivio', label: 'Fatores de Alívio', type: 'textarea' }
        ]

      },
      {
        id: 'neuro',
        title: 'Avaliação Neurológica (Força Muscular)',
        fields: [
          { id: 'c5_esq', label: 'Flexor de Cotovelo C5 (Esq)', type: 'select', options: scores0to5 },
          { id: 'c5_dir', label: 'Flexor de Cotovelo C5 (Dir)', type: 'select', options: scores0to5 },
          { id: 'c6_esq', label: 'Extensor de Punho C6 (Esq)', type: 'select', options: scores0to5 },
          { id: 'c6_dir', label: 'Extensor de Punho C6 (Dir)', type: 'select', options: scores0to5 },
          { id: 'c7_esq', label: 'Extensor de Cotovelo C7 (Esq)', type: 'select', options: scores0to5 },
          { id: 'c7_dir', label: 'Extensor de Cotovelo C7 (Dir)', type: 'select', options: scores0to5 }
        ]
      },
      {
        id: 'movimento',
        title: 'Avaliação do Movimento (Graus)',
        fields: [
          { id: 'flexao', label: 'Flexão', type: 'number' },
          { id: 'extensao', label: 'Extensão', type: 'number' },
          { id: 'rot_esq', label: 'Rotação Esquerda', type: 'number' },
          { id: 'rot_dir', label: 'Rotação Direita', type: 'number' },
          { id: 'incl_esq', label: 'Inclinação Esquerda', type: 'number' },
          { id: 'incl_dir', label: 'Inclinação Direita', type: 'number' }
        ]
      },
      {
        id: 'testes',
        title: 'Testes de Resistência e Especiais',
        fields: [
          { id: 'resist_flex', label: 'Resistência Flexora (seg)', type: 'number' },
          { id: 'resist_ext', label: 'Resistência Extensora (seg)', type: 'number' },
          { id: 'obs_especiais', label: 'Observações de Testes Especiais', type: 'textarea' }
        ]
      }
    ],
    calculateScore: (answers) => {
      return { percentage: 100, interpretation: 'Avaliação Funcional Concluída', unit: '%' };
    }
  }
};
