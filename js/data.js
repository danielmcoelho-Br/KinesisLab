const referencePreensaoPalmar = {
    Masculino: [
        { minAge: 10, maxAge: 11, minNormal: 12.6, maxNormal: 22.4 },
        { minAge: 12, maxAge: 13, minNormal: 19.4, maxNormal: 31.2 },
        { minAge: 14, maxAge: 15, minNormal: 28.5, maxNormal: 44.3 },
        { minAge: 16, maxAge: 17, minNormal: 32.6, maxNormal: 52.4 },
        { minAge: 18, maxAge: 19, minNormal: 35.7, maxNormal: 55.5 },
        { minAge: 20, maxAge: 24, minNormal: 36.8, maxNormal: 56.6 },
        { minAge: 25, maxAge: 29, minNormal: 37.7, maxNormal: 57.5 },
        { minAge: 30, maxAge: 34, minNormal: 36.0, maxNormal: 55.8 },
        { minAge: 35, maxAge: 39, minNormal: 35.8, maxNormal: 55.6 },
        { minAge: 40, maxAge: 44, minNormal: 35.5, maxNormal: 55.3 },
        { minAge: 45, maxAge: 49, minNormal: 34.7, maxNormal: 54.5 },
        { minAge: 50, maxAge: 54, minNormal: 32.9, maxNormal: 50.7 },
        { minAge: 55, maxAge: 59, minNormal: 30.7, maxNormal: 48.5 },
        { minAge: 60, maxAge: 64, minNormal: 30.2, maxNormal: 48.0 },
        { minAge: 65, maxAge: 69, minNormal: 28.2, maxNormal: 44.0 },
        { minAge: 70, maxAge: 99, minNormal: 21.3, maxNormal: 35.1 },
    ],
    Feminino: [
        { minAge: 10, maxAge: 11, minNormal: 11.8, maxNormal: 21.6 },
        { minAge: 12, maxAge: 13, minNormal: 14.6, maxNormal: 24.4 },
        { minAge: 14, maxAge: 15, minNormal: 15.5, maxNormal: 27.3 },
        { minAge: 16, maxAge: 17, minNormal: 17.2, maxNormal: 29.0 },
        { minAge: 18, maxAge: 19, minNormal: 19.2, maxNormal: 31.0 },
        { minAge: 20, maxAge: 24, minNormal: 21.5, maxNormal: 35.3 },
        { minAge: 25, maxAge: 29, minNormal: 25.6, maxNormal: 41.4 },
        { minAge: 30, maxAge: 34, minNormal: 21.5, maxNormal: 35.3 },
        { minAge: 35, maxAge: 39, minNormal: 20.3, maxNormal: 34.1 },
        { minAge: 40, maxAge: 44, minNormal: 18.9, maxNormal: 32.7 },
        { minAge: 45, maxAge: 49, minNormal: 18.6, maxNormal: 32.4 },
        { minAge: 50, maxAge: 54, minNormal: 18.1, maxNormal: 31.9 },
        { minAge: 55, maxAge: 59, minNormal: 17.7, maxNormal: 31.5 },
        { minAge: 60, maxAge: 64, minNormal: 17.2, maxNormal: 31.0 },
        { minAge: 65, maxAge: 69, minNormal: 15.4, maxNormal: 27.2 },
        { minAge: 70, maxAge: 99, minNormal: 14.7, maxNormal: 24.5 },
    ]
};

const referencePincaLateral = {
    Masculino: [
        { minAge: 20, maxAge: 24, domMin: 9.5, domMax: 15.4, ndomMin: 8.6, ndomMax: 14.1 },
        { minAge: 25, maxAge: 29, domMin: 8.6, domMax: 18.6, ndomMin: 8.6, ndomMax: 17.7 },
        { minAge: 30, maxAge: 34, domMin: 9.1, domMax: 16.3, ndomMin: 7.7, ndomMax: 16.3 },
        { minAge: 35, maxAge: 39, domMin: 9.5, domMax: 14.5, ndomMin: 8.2, ndomMax: 14.5 },
        { minAge: 40, maxAge: 44, domMin: 9.5, domMax: 14.1, ndomMin: 8.6, ndomMax: 14.1 },
        { minAge: 45, maxAge: 49, domMin: 8.6, domMax: 15.9, ndomMin: 8.2, ndomMax: 19.1 },
        { minAge: 50, maxAge: 54, domMin: 9.1, domMax: 15.4, ndomMin: 9.1, ndomMax: 16.8 },
        { minAge: 55, maxAge: 59, domMin: 8.2, domMax: 15.4, ndomMin: 5.9, ndomMax: 14.1 },
        { minAge: 60, maxAge: 64, domMin: 6.4, domMax: 16.8, ndomMin: 7.3, ndomMax: 15.0 },
        { minAge: 65, maxAge: 69, domMin: 7.7, domMax: 14.5, ndomMin: 7.7, ndomMax: 12.7 },
        { minAge: 70, maxAge: 75, domMin: 7.3, domMax: 11.3, ndomMin: 5.9, ndomMax: 12.7 },
        { minAge: 75, maxAge: 99, domMin: 4.1, domMax: 14.1, ndomMin: 5.9, ndomMax: 10.9 },
    ],
    Feminino: [
        { minAge: 20, maxAge: 24, domMin: 6.4, domMax: 10.4, ndomMin: 5.9, ndomMax: 10.4 },
        { minAge: 25, maxAge: 29, domMin: 6.4, domMax: 10.0, ndomMin: 5.9, ndomMax: 10.0 },
        { minAge: 30, maxAge: 34, domMin: 5.9, domMax: 11.3, ndomMin: 5.4, ndomMax: 11.8 },
        { minAge: 35, maxAge: 39, domMin: 5.4, domMax: 9.5, ndomMin: 5.4, ndomMax: 10.0 },
        { minAge: 40, maxAge: 44, domMin: 4.5, domMax: 10.9, ndomMin: 3.6, ndomMax: 10.0 },
        { minAge: 45, maxAge: 49, domMin: 5.9, domMax: 10.9, ndomMin: 5.4, ndomMax: 10.9 },
        { minAge: 50, maxAge: 54, domMin: 5.4, domMax: 10.0, ndomMin: 5.4, ndomMax: 10.0 },
        { minAge: 55, maxAge: 59, domMin: 5.0, domMax: 9.5, ndomMin: 5.4, ndomMax: 8.6 },
        { minAge: 60, maxAge: 64, domMin: 4.5, domMax: 9.1, ndomMin: 4.5, ndomMax: 8.6 },
        { minAge: 65, maxAge: 69, domMin: 4.5, domMax: 9.5, ndomMin: 4.5, ndomMax: 9.1 },
        { minAge: 70, maxAge: 75, domMin: 3.6, domMax: 10.0, ndomMin: 4.1, ndomMax: 10.0 },
        { minAge: 75, maxAge: 99, domMin: 3.6, domMax: 7.7, ndomMin: 3.2, ndomMax: 7.3 },
    ],
};

const referencePincaTripode = {
    Masculino: [
        { minAge: 20, maxAge: 24, domMin: 8.2, domMax: 20.4, ndomMin: 6.8, ndomMax: 19.1 },
        { minAge: 25, maxAge: 29, domMin: 8.6, domMax: 15.9, ndomMin: 8.6, ndomMax: 16.3 },
        { minAge: 30, maxAge: 34, domMin: 7.3, domMax: 15.4, ndomMin: 6.8, ndomMax: 16.8 },
        { minAge: 35, maxAge: 39, domMin: 8.6, domMax: 16.3, ndomMin: 6.4, ndomMax: 18.1 },
        { minAge: 40, maxAge: 44, domMin: 7.7, domMax: 16.8, ndomMin: 6.8, ndomMax: 16.8 },
        { minAge: 45, maxAge: 49, domMin: 8.6, domMax: 15.0, ndomMin: 3.6, ndomMax: 15.0 },
        { minAge: 50, maxAge: 54, domMin: 6.8, domMax: 16.3, ndomMin: 7.3, ndomMax: 16.3 },
        { minAge: 55, maxAge: 59, domMin: 7.3, domMax: 15.4, ndomMin: 5.4, ndomMax: 11.3 },
        { minAge: 60, maxAge: 64, domMin: 7.3, domMax: 12.7, ndomMin: 6.8, ndomMax: 12.2 },
        { minAge: 65, maxAge: 69, domMin: 6.8, domMax: 11.3, ndomMin: 6.4, ndomMax: 13.6 },
        { minAge: 70, maxAge: 75, domMin: 6.4, domMax: 12.2, ndomMin: 5.9, ndomMax: 12.2 },
        { minAge: 75, maxAge: 99, domMin: 4.1, domMax: 11.8, ndomMin: 4.5, ndomMax: 11.8 },
    ],
    Feminino: [
        { minAge: 20, maxAge: 24, domMin: 6.4, domMax: 10.4, ndomMin: 5.0, ndomMax: 10.9 },
        { minAge: 25, maxAge: 29, domMin: 5.9, domMax: 13.2, ndomMin: 5.9, ndomMax: 11.8 },
        { minAge: 30, maxAge: 34, domMin: 5.4, domMax: 15.4, ndomMin: 5.4, ndomMax: 14.5 },
        { minAge: 35, maxAge: 39, domMin: 5.9, domMax: 13.2, ndomMin: 5.4, ndomMax: 10.9 },
        { minAge: 40, maxAge: 44, domMin: 4.5, domMax: 10.4, ndomMin: 6.4, ndomMax: 11.3 },
        { minAge: 45, maxAge: 49, domMin: 5.4, domMax: 12.2, ndomMin: 5.4, ndomMax: 10.9 },
        { minAge: 50, maxAge: 54, domMin: 5.4, domMax: 10.4, ndomMin: 5.4, ndomMax: 10.0 },
        { minAge: 55, maxAge: 59, domMin: 5.0, domMax: 11.8, ndomMin: 5.0, ndomMax: 9.5 },
        { minAge: 60, maxAge: 64, domMin: 4.5, domMax: 9.1, ndomMin: 4.5, ndomMax: 9.1 },
        { minAge: 65, maxAge: 69, domMin: 3.6, domMax: 9.1, ndomMin: 3.6, ndomMax: 10.0 },
        { minAge: 70, maxAge: 75, domMin: 4.1, domMax: 8.6, ndomMin: 4.5, ndomMax: 7.7 },
        { minAge: 75, maxAge: 99, domMin: 3.6, domMax: 7.7, ndomMin: 2.7, ndomMax: 7.3 },
    ],
};

const referencePincaPolpa = {
    Masculino: [
        { minAge: 20, maxAge: 24, domMin: 5.0, domMax: 10.4, ndomMin: 5.4, ndomMax: 15.0 },
        { minAge: 25, maxAge: 29, domMin: 4.5, domMax: 15.4, ndomMin: 5.4, ndomMax: 16.3 },
        { minAge: 30, maxAge: 34, domMin: 5.4, domMax: 11.3, ndomMin: 4.5, ndomMax: 12.2 },
        { minAge: 35, maxAge: 39, domMin: 5.4, domMax: 12.2, ndomMin: 4.5, ndomMax: 10.9 },
        { minAge: 40, maxAge: 44, domMin: 5.0, domMax: 11.3, ndomMin: 5.4, ndomMax: 11.3 },
        { minAge: 45, maxAge: 49, domMin: 5.4, domMax: 13.6, ndomMin: 5.4, ndomMax: 12.7 },
        { minAge: 50, maxAge: 54, domMin: 5.0, domMax: 10.9, ndomMin: 5.4, ndomMax: 11.8 },
        { minAge: 55, maxAge: 59, domMin: 5.0, domMax: 10.9, ndomMin: 4.5, ndomMax: 11.8 },
        { minAge: 60, maxAge: 64, domMin: 4.1, domMax: 10.0, ndomMin: 4.1, ndomMax: 10.4 },
        { minAge: 65, maxAge: 69, domMin: 5.0, domMax: 12.2, ndomMin: 4.5, ndomMax: 9.5 },
        { minAge: 70, maxAge: 75, domMin: 5.0, domMax: 9.5, ndomMin: 4.5, ndomMax: 9.5 },
        { minAge: 75, maxAge: 99, domMin: 3.2, domMax: 9.5, ndomMin: 3.6, ndomMax: 11.3 },
    ],
    Feminino: [
        { minAge: 20, maxAge: 24, domMin: 3.6, domMax: 7.3, ndomMin: 3.6, ndomMax: 6.4 },
        { minAge: 25, maxAge: 29, domMin: 3.6, domMax: 7.3, ndomMin: 4.1, ndomMax: 8.2 },
        { minAge: 30, maxAge: 34, domMin: 3.6, domMax: 9.1, ndomMin: 3.2, ndomMax: 7.7 },
        { minAge: 35, maxAge: 39, domMin: 3.6, domMax: 8.6, ndomMin: 3.6, ndomMax: 7.3 },
        { minAge: 40, maxAge: 44, domMin: 2.3, domMax: 6.8, ndomMin: 2.7, ndomMax: 7.7 },
        { minAge: 45, maxAge: 49, domMin: 4.1, domMax: 8.6, ndomMin: 3.2, ndomMax: 8.2 },
        { minAge: 50, maxAge: 54, domMin: 4.1, domMax: 8.2, ndomMin: 3.2, ndomMax: 7.3 },
        { minAge: 55, maxAge: 59, domMin: 4.1, domMax: 7.3, ndomMin: 3.6, ndomMax: 5.9 },
        { minAge: 60, maxAge: 64, domMin: 3.2, domMax: 7.7, ndomMin: 2.7, ndomMax: 6.8 },
        { minAge: 65, maxAge: 69, domMin: 3.2, domMax: 6.8, ndomMin: 3.2, ndomMax: 7.7 },
        { minAge: 70, maxAge: 75, domMin: 3.2, domMax: 6.8, ndomMin: 2.7, ndomMax: 7.7 },
        { minAge: 75, maxAge: 99, domMin: 1.8, domMax: 7.3, ndomMin: 1.8, ndomMax: 5.9 },
    ],
};

const referenceForcaQuadril = {
    Masculino: {
        Ativo: [
            { minAge: 18, maxAge: 40, abd_d: 23.8, abd_e: 22.4, ext_d: 33.3, ext_e: 32.8, flx_d: 50.2, flx_e: 48.8, rotl_d: 20.0, rotl_e: 20.0, sd_abd_d: 6.9, sd_abd_e: 6.1, sd_ext_d: 13.2, sd_ext_e: 13.4, sd_flx_d: 16.9, sd_flx_e: 16.4, sd_rotl_d: 3.8, sd_rotl_e: 4.6 },
            { minAge: 41, maxAge: 99, abd_d: 21.7, abd_e: 21.1, ext_d: 33.4, ext_e: 32.7, flx_d: 44.3, flx_e: 44.2, rotl_d: 18.2, rotl_e: 18.2, sd_abd_d: 4.0, sd_abd_e: 4.0, sd_ext_d: 5.0, sd_ext_e: 5.0, sd_flx_d: 7.7, sd_flx_e: 8.0, sd_rotl_d: 5.1, sd_rotl_e: 4.3 }
        ],
        Sedentario: [
            { minAge: 18, maxAge: 40, abd_d: 23.9, abd_e: 22.5, ext_d: 30.7, ext_e: 32.1, flx_d: 45.2, flx_e: 43.8, rotl_d: 19.2, rotl_e: 19.3, sd_abd_d: 5.9, sd_abd_e: 4.6, sd_ext_d: 6.9, sd_ext_e: 7.7, sd_flx_d: 9.7, sd_flx_e: 9.1, sd_rotl_d: 4.6, sd_rotl_e: 4.2 },
            { minAge: 41, maxAge: 99, abd_d: 20.4, abd_e: 20.6, ext_d: 29.9, ext_e: 30.6, flx_d: 41.3, flx_e: 40.7, rotl_d: 16.3, rotl_e: 16.6, sd_abd_d: 4.7, sd_abd_e: 4.6, sd_ext_d: 5.7, sd_ext_e: 6.3, sd_flx_d: 7.4, sd_flx_e: 6.8, sd_rotl_d: 3.3, sd_rotl_e: 3.5 }
        ]
    },
    Feminino: {
        Ativo: [
            { minAge: 18, maxAge: 40, abd_d: 23.4, abd_e: 22.1, ext_d: 31.9, ext_e: 31.1, flx_d: 45.4, flx_e: 44.2, rotl_d: 18.7, rotl_e: 18.1, sd_abd_d: 5.4, sd_abd_e: 6.2, sd_ext_d: 10.0, sd_ext_e: 9.0, sd_flx_d: 22.6, sd_flx_e: 21.1, sd_rotl_d: 6.5, sd_rotl_e: 7.5 },
            { minAge: 41, maxAge: 99, abd_d: 20.2, abd_e: 19.9, ext_d: 27.1, ext_e: 27.1, flx_d: 32.1, flx_e: 32.2, rotl_d: 14.5, rotl_e: 14.3, sd_abd_d: 3.9, sd_abd_e: 4.2, sd_ext_d: 6.3, sd_ext_e: 6.2, sd_flx_d: 6.0, sd_flx_e: 6.3, sd_rotl_d: 2.6, sd_rotl_e: 3.2 }
        ],
        Sedentario: [
            { minAge: 18, maxAge: 40, abd_d: 20.4, abd_e: 18.1, ext_d: 26.9, ext_e: 26.2, flx_d: 34.8, flx_e: 33.2, rotl_d: 15.8, rotl_e: 15.7, sd_abd_d: 6.7, sd_abd_e: 7.4, sd_ext_d: 11.1, sd_ext_e: 11.6, sd_flx_d: 9.2, sd_flx_e: 11.5, sd_rotl_d: 4.2, sd_rotl_e: 4.6 },
            { minAge: 41, maxAge: 99, abd_d: 19.0, abd_e: 18.1, ext_d: 24.3, ext_e: 24.3, flx_d: 30.9, flx_e: 30.0, rotl_d: 13.9, rotl_e: 13.4, sd_abd_d: 4.9, sd_abd_e: 4.3, sd_ext_d: 6.1, sd_ext_e: 6.9, sd_flx_d: 7.9, sd_flx_e: 7.1, sd_rotl_d: 3.4, sd_rotl_e: 3.3 }
        ]
    }
};

const questionnairesData = {
    af_cervical: {
        id: 'af_cervical',
        type: 'clinical',
        segment: 'cervical',
        title: 'Avaliação Funcional Cervical',
        description: 'Avaliação da coluna cervical incluindo movimento, palpação e testes neurológicos.',
        icon: '<img src="icon_cervical.png" alt="Cervical" style="width:100%; height:100%; object-fit:contain;">',
        sections: [
            {
                id: 'anamnese',
                title: 'Características da Disfunção',
                fields: [
                    { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                    { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 },
                    { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                    { id: 'historia', label: 'História Pregressa', type: 'textarea' },
                    { id: 'piora', label: 'Atividade de Piora', type: 'textarea' },
                    { id: 'alivio', label: 'Atividade de Alívio', type: 'textarea' },
                    { id: 'doencas', label: 'Doenças Associadas', type: 'textarea' }
                ]
            },
            {
                id: 'neuro_forca',
                title: 'Avaliação Neurológica (Força Muscular)',
                type: 'table',
                columns: ['Miótono / Músculo', 'Esquerdo (0-5)', 'Direito (0-5)'],
                rows: [
                    { id: 'c5', label: 'Flexor de Cotovelo (C5)', fields: ['esquerdo', 'direito'] },
                    { id: 'c6', label: 'Extensor de Punho (C6)', fields: ['esquerdo', 'direito'] },
                    { id: 'c7', label: 'Extensor de Cotovelo (C7)', fields: ['esquerdo', 'direito'] },
                    { id: 'c8', label: 'Flexores de Dedos (C8)', fields: ['esquerdo', 'direito'] },
                    { id: 't1', label: 'Abdutor do 5º Dedo (T1)', fields: ['esquerdo', 'direito'] }
                ]
            },
            {
                id: 'neuro_reflexos',
                title: 'Avaliação Neurológica (Reflexos)',
                type: 'table',
                columns: ['Reflexo', 'Normal', 'Hiperreflexia', 'Hiporeflexia'],
                rows: [
                    { id: 'bicipital', label: 'Bicipital (C5 e C6)', fields: [{ id: 'normal', type: 'checkbox' }, { id: 'hiper', type: 'checkbox' }, { id: 'hipo', type: 'checkbox' }] },
                    { id: 'tricipital', label: 'Tricipital (C7 e T1)', fields: [{ id: 'normal', type: 'checkbox' }, { id: 'hiper', type: 'checkbox' }, { id: 'hipo', type: 'checkbox' }] },
                    { id: 'estiloradial', label: 'Estiloradial (C6)', fields: [{ id: 'normal', type: 'checkbox' }, { id: 'hiper', type: 'checkbox' }, { id: 'hipo', type: 'checkbox' }] }
                ]
            },
            {
                id: 'neuro_add',
                title: 'Avaliação Neurológica Adicional',
                fields: [
                    { id: 'observacoes_neuro', label: 'Avaliação Adicional', type: 'textarea' }
                ]
            },
            {
                id: 'postural',
                title: 'Avaliação Postural',
                fields: [
                    { id: 'postura_obs', label: 'Vista Posterior / Anterior / Laterais (Observações)', type: 'textarea' }
                ]
            },
            {
                id: 'movimento_cervical',
                title: 'Avaliação do Movimento (Graus)',
                type: 'table',
                columns: ['Movimento', { label: 'Graus', width: '25%' }, { label: 'Padrão / Observações', width: '55%' }],
                rows: [
                    { id: 'flexao', label: 'Flexão', fields: ['graus', 'observacoes'] },
                    { id: 'extensao', label: 'Extensão', fields: ['graus', 'observacoes'] },
                    { id: 'rot_esq', label: 'Rotação Esquerda', fields: ['graus', 'observacoes'] },
                    { id: 'rot_dir', label: 'Rotação Direita', fields: ['graus', 'observacoes'] },
                    { id: 'incl_esq', label: 'Inclinação Esquerda', fields: ['graus', 'observacoes'] },
                    { id: 'incl_dir', label: 'Inclinação Direita', fields: ['graus', 'observacoes'] }
                ]
            },
            {
                id: 'palpacao_articular_1',
                title: 'Palpação e Irritabilidade - Articular (C1-C7)',
                type: 'table',
                columns: ['Nível', 'Dor', 'Intensidade (0-10)'],
                rows: [
                    { id: 'c1', label: 'C1', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'c2', label: 'C2', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'c3', label: 'C3', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'c4', label: 'C4', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'c5', label: 'C5', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'c6', label: 'C6', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'c7', label: 'C7', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] }
                ]
            },
            {
                id: 'palpacao_articular_2',
                title: 'Palpação e Irritabilidade - Articular (T1-T7)',
                type: 'table',
                columns: ['Nível', 'Dor', 'Intensidade (0-10)'],
                rows: [
                    { id: 't1', label: 'T1', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't2', label: 'T2', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't3', label: 'T3', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't4', label: 'T4', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't5', label: 'T5', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't6', label: 'T6', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't7', label: 'T7', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] }
                ]
            },
            {
                id: 'testes_neurais',
                title: 'Teste de Tensão Neural',
                type: 'table',
                columns: ['Nervo', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'mediano', label: 'Mediano', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'ulnar', label: 'Ulnar', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'radial', label: 'Radial', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'palpacao_miofascial',
                title: 'Palpação Miofascial',
                type: 'table',
                columns: ['Músculo', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'suboccipitais', label: 'Suboccipitais', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'esplenios', label: 'Esplênios', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'escalenos', label: 'Escalenos', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'esternocleido', label: 'Esternocleido', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'trapezio_sup', label: 'Trapézio Superior', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'elevador_escapula', label: 'Elevador da Escápula', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'romboides', label: 'Romboides', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'grande_dorsal', label: 'Grande Dorsal', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'peitorais', label: 'Peitorais', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'resistencia_especiais',
                title: 'Testes Resistidos e Especiais',
                fields: [
                    { id: 'resistencia', label: 'Testes de Resistência Muscular (Geral)', type: 'textarea' },
                    { id: 'resist_flex', label: 'Resistência de Musculatura Flexora (segundos)', type: 'number' },
                    { id: 'resist_ext', label: 'Resistência de Musculatura Extensora (segundos)', type: 'number' },
                    { id: 'testes_especiais', label: 'Testes Especiais', type: 'textarea' }
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
                    { id: 'ndi_busca', label: 'Buscar resposta NDI na base de dados (Ex: ID do paciente)', type: 'text' },
                    { id: 'ndi_novo', label: 'Preencher novo Questionário NDI', type: 'button', props: "value='Abrir NDI' onclick='window.abrirModalNDI && window.abrirModalNDI()'" },
                    { id: 'ndi_score', label: 'Resultado/Score NDI Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            }
        ],
        calculateScore: (data) => {
            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação Funcional Cervical Finalizada',
                details: {}
            };
        }
    },
    af_lombar: {
        id: 'af_lombar',
        type: 'clinical',
        segment: 'lombar',
        title: 'Avaliação Funcional Lombar',
        description: 'Avaliação da coluna lombar incluindo movimento, palpação e testes neurológicos.',
        icon: '<img src="icon_lombar.png" alt="Lombar" style="width:100%; height:100%; object-fit:contain;">',
        sections: [
            {
                id: 'anamnese',
                title: '2. Características da Disfunção',
                fields: [
                    { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                    { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 },
                    { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                    { id: 'historia', label: 'História Pregressa', type: 'textarea' },
                    { id: 'piora', label: 'Atividade de Piora', type: 'textarea' },
                    { id: 'alivio', label: 'Atividade de Alívio', type: 'textarea' },
                    { id: 'doencas', label: 'Doenças Associadas', type: 'textarea' }
                ]
            },
            {
                id: 'neuro_forca',
                title: '3. Avaliação Neurológica (Força Muscular)',
                type: 'table',
                columns: ['Miótono / Músculo', 'Esquerdo (0-5)', 'Direito (0-5)'],
                rows: [
                    { id: 'l2', label: 'Flexor de Quadril (L2)', fields: ['esquerdo', 'direito'] },
                    { id: 'l3', label: 'Extensor de Joelho (L3)', fields: ['esquerdo', 'direito'] },
                    { id: 'l4', label: 'Dorsiflexor (L4)', fields: ['esquerdo', 'direito'] },
                    { id: 'l5', label: 'Extensor de Hálux (L5)', fields: ['esquerdo', 'direito'] },
                    { id: 's1', label: 'Flexor Plantar (S1)', fields: ['esquerdo', 'direito'] }
                ]
            },
            {
                id: 'neuro_add',
                title: 'Avaliação Neurológica Adicional',
                fields: [
                    { id: 'observacoes_neuro', label: 'Avaliação Adicional (Reflexos, Sensibilidade, etc.)', type: 'textarea' }
                ]
            },
            {
                id: 'movimento_lombar',
                title: '4. Avaliação do Movimento (Graus)',
                type: 'table',
                columns: ['Movimento', { label: 'Graus', width: '25%' }, { label: 'Padrão / Observações', width: '55%' }],
                rows: [
                    { id: 'flexao', label: 'Flexão Lombar', fields: ['graus', 'observacoes'] },
                    { id: 'extensao', label: 'Extensão Lombar', fields: ['graus', 'observacoes'] },
                    { id: 'incl_esq', label: 'Inclinação Esquerda', fields: ['graus', 'observacoes'] },
                    { id: 'incl_dir', label: 'Inclinação Direita', fields: ['graus', 'observacoes'] },
                    { id: 'flex_quad_esq', label: 'Flexão Quadril Esq.', fields: ['graus', 'observacoes'] },
                    { id: 'flex_quad_dir', label: 'Flexão Quadril Dir.', fields: ['graus', 'observacoes'] },
                    { id: 'rot_med_quad_esq', label: 'Rot. Medial Quad. Esq. (90°)', fields: ['graus', 'observacoes'] },
                    { id: 'rot_lat_quad_esq', label: 'Rot. Lateral Quad. Esq. (90°)', fields: ['graus', 'observacoes'] },
                    { id: 'rot_med_quad_dir', label: 'Rot. Medial Quad. Dir. (90°)', fields: ['graus', 'observacoes'] },
                    { id: 'rot_lat_quad_dir', label: 'Rot. Lateral Quad. Dir. (90°)', fields: ['graus', 'observacoes'] }
                ]
            },
            {
                id: 'palpacao_articular',
                title: '5.1 Palpação e Irritabilidade - Articular',
                type: 'table',
                columns: ['Nível', 'Dor', 'Intensidade (0-10)'],
                rows: [
                    { id: 't7', label: 'T7', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't8', label: 'T8', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't9', label: 'T9', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't10', label: 'T10', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't11', label: 'T11', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 't12', label: 'T12', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'l1', label: 'L1', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'l2', label: 'L2', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'l3', label: 'L3', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'l4', label: 'L4', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'l5', label: 'L5', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] },
                    { id: 'sacro', label: 'Sacro', fields: [{ id: 'dor', type: 'checkbox' }, 'intensidade'] }
                ]
            },
            {
                id: 'testes_neurais',
                title: '5.2 Teste Neural',
                type: 'table',
                columns: ['Teste', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'lasegue', label: 'Lasegue', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'femoral', label: 'Femoral', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'slump', label: 'SLUMP', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'palpacao_miofascial',
                title: '5.3 Palpação Miofascial',
                type: 'table',
                columns: ['Músculo', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'quadrado_lombar', label: 'Quadrado Lombar', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'gluteo_maximo', label: 'Glúteo Máximo', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'gluteo_medio', label: 'Glúteo Médio', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'gluteo_minimo', label: 'Glúteo Mínimo', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'piriforme', label: 'Piriforme', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'tfl', label: 'Tensor da Fáscia Lata', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'iliopsoas', label: 'Iliopsoas', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'outro', label: 'Outro', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'resistencia',
                title: '6. Testes de Resistência Muscular',
                fields: [
                    { id: 'flexao_60', label: 'Flexão a 60º - Isometria Anterior (resultado)', type: 'textarea' },
                    { id: 'sorensen', label: 'Teste de Sorensen - Isometria Posterior (resultado)', type: 'textarea' }
                ]
            },
            {
                id: 'diagnostico_conclusoes',
                title: '7 e 8. Diagnóstico e Conclusões',
                fields: [
                    { id: 'diagnostico', label: '7. Diagnóstico Cinético Funcional', type: 'textarea' },
                    { id: 'conclusao', label: '8. Conclusões e Sugestões Terapêuticas', type: 'textarea' }
                ]
            },
            {
                id: 'oswestry_integracao',
                title: 'ODI (Índice de Incapacidade de Oswestry)',
                fields: [
                    { id: 'oswestry_busca', label: 'Buscar resposta ODI na base de dados (Ex: ID do paciente)', type: 'text' },
                    { id: 'oswestry_novo', label: 'Preencher novo Questionário ODI', type: 'button', props: "value='Abrir ODI' onclick='window.abrirModalOswestry && window.abrirModalOswestry()'" },
                    { id: 'oswestry_score', label: 'Resultado/Score ODI Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            }
        ],
        calculateScore: (data) => {
            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação Funcional Lombar Finalizada',
                details: {}
            };
        }
    },
    oswestry: {
        id: 'oswestry',
        segment: 'lombar',
        title: 'Índice de Incapacidade de Oswestry (ODI)',
        description: 'Questionário para avaliar a incapacidade em pacientes com dor lombar.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        questions: [
            {
                text: '1. Intensidade da Dor',
                options: [
                    { value: 0, label: 'Eu posso tolerar a dor que sinto sem ter que usar analgésicos.' },
                    { value: 1, label: 'A dor é ruim, mas eu consigo lidar com ela sem tomar analgésicos.' },
                    { value: 2, label: 'Os analgésicos me dão alívio completo da dor.' },
                    { value: 3, label: 'Os analgésicos me dão alívio moderado da dor.' },
                    { value: 4, label: 'Os analgésicos me dão muito pouco alívio da dor.' },
                    { value: 5, label: 'Os analgésicos não têm efeito sobre a dor e eu não os uso.' }
                ]
            },
            {
                text: '2. Cuidados Pessoais (lavar-se, vestir-se, etc.)',
                options: [
                    { value: 0, label: 'Posso cuidar de mim mesmo normalmente sem que isso cause dor extra.' },
                    { value: 1, label: 'Posso cuidar de mim mesmo normalmente, mas isso causa dor extra.' },
                    { value: 2, label: 'Cuidar de mim mesmo causa dor e sou lento e cuidadoso.' },
                    { value: 3, label: 'Preciso de alguma ajuda, mas consigo fazer a maioria das minhas coisas.' },
                    { value: 4, label: 'Preciso de ajuda todos os dias para a maioria dos aspectos do meu cuidado pessoal.' },
                    { value: 5, label: 'Não me visto, lavo-me com dificuldade e fico na cama.' }
                ]
            },
            {
                text: '3. Levantar Peso',
                options: [
                    { value: 0, label: 'Posso levantar objetos pesados sem dor extra.' },
                    { value: 1, label: 'Posso levantar objetos pesados, mas causa dor extra.' },
                    { value: 2, label: 'A dor me impede de levantar objetos pesados do chão, mas consigo se estiverem em um local conveniente (ex: mesa).' },
                    { value: 3, label: 'A dor me impede de levantar objetos pesados, mas consigo levantar objetos leves a médios se estiverem bem posicionados.' },
                    { value: 4, label: 'Só consigo levantar objetos muito leves.' },
                    { value: 5, label: 'Não consigo levantar ou carregar nada.' }
                ]
            },
            {
                text: '4. Caminhar',
                options: [
                    { value: 0, label: 'A dor não me impede de caminhar qualquer distância.' },
                    { value: 1, label: 'A dor me impede de caminhar mais de 1,5 km.' },
                    { value: 2, label: 'A dor me impede de caminhar mais de 750 metros.' },
                    { value: 3, label: 'A dor me impede de caminhar mais de 100 metros.' },
                    { value: 4, label: 'Só posso caminhar com o uso de bengala ou muletas.' },
                    { value: 5, label: 'Fico na cama ou na cadeira a maior parte do tempo.' }
                ]
            },
            {
                text: '5. Sentar',
                options: [
                    { value: 0, label: 'Posso sentar em qualquer cadeira pelo tempo que eu quiser.' },
                    { value: 1, label: 'Apenas posso sentar na minha cadeira favorita pelo tempo que eu quiser.' },
                    { value: 2, label: 'A dor me impede de sentar por mais de 1 hora.' },
                    { value: 3, label: 'A dor me impede de sentar por mais de meia hora.' },
                    { value: 4, label: 'A dor me impede de sentar por mais de 10 minutos.' },
                    { value: 5, label: 'A dor me impede de sentar.' }
                ]
            },
            {
                text: '6. Ficar em Pé',
                options: [
                    { value: 0, label: 'Posso ficar em pé o tempo que quiser sem dor extra.' },
                    { value: 1, label: 'Posso ficar em pé o tempo que quiser, mas isso me causa dor extra.' },
                    { value: 2, label: 'A dor me impede de ficar em pé por mais de 1 hora.' },
                    { value: 3, label: 'A dor me impede de ficar em pé por mais de meia hora.' },
                    { value: 4, label: 'A dor me impede de ficar em pé por mais de 10 minutos.' },
                    { value: 5, label: 'A dor me impede totalmente de ficar em pé.' }
                ]
            },
            {
                text: '7. Dormir',
                options: [
                    { value: 0, label: 'Meu sono não é nunca perturbado pela dor.' },
                    { value: 1, label: 'Meu sono é ocasionalmente perturbado pela dor.' },
                    { value: 2, label: 'Por causa da dor meu sono é menos de 6 horas.' },
                    { value: 3, label: 'Por causa da dor meu sono é menos de 4 horas.' },
                    { value: 4, label: 'Por causa da dor meu sono é menos de 2 horas.' },
                    { value: 5, label: 'A dor me impede totalmente de dormir.' }
                ]
            },
            {
                text: '8. Vida Sexual (se aplicável)',
                options: [
                    { value: 0, label: 'Minha vida sexual é normal e não causa dor extra.' },
                    { value: 1, label: 'Minha vida sexual é normal, mas causa dor extra.' },
                    { value: 2, label: 'Minha vida sexual é quase normal, mas é muito dolorosa.' },
                    { value: 3, label: 'Minha vida sexual é severamente restrita pela dor.' },
                    { value: 4, label: 'Minha vida sexual é quase ausente por causa da dor.' },
                    { value: 5, label: 'A dor me impede de ter qualquer vida sexual.' }
                ]
            },
            {
                text: '9. Vida Social',
                options: [
                    { value: 0, label: 'Minha vida social é normal e não me causa dor extra.' },
                    { value: 1, label: 'Minha vida social é normal, mas aumenta o grau de dor.' },
                    { value: 2, label: 'A dor não tem efeito sobre a minha vida social, mas restringe os meus interesses mais ativos, ex: desporto.' },
                    { value: 3, label: 'A dor tem restringido a minha vida social e não saio com tanta frequência.' },
                    { value: 4, label: 'A dor restringiu a minha vida social a minha casa.' },
                    { value: 5, label: 'Não tenho nenhuma vida social por causa da dor.' }
                ]
            },
            {
                text: '10. Viagens / Deslocamento',
                options: [
                    { value: 0, label: 'Posso viajar para qualquer lugar sem dor.' },
                    { value: 1, label: 'Posso viajar para qualquer lugar, mas causa dor extra.' },
                    { value: 2, label: 'A dor é ruim, mas consigo fazer viagens de mais de duas horas.' },
                    { value: 3, label: 'A dor restringe viagens para menos de uma hora.' },
                    { value: 4, label: 'A dor restringe viagens curtas e necessárias para menos de meia hora.' },
                    { value: 5, label: 'A dor me impede de viajar, exceto para ir ao médico e hospitais.' }
                ]
            }
        ],
        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);
            if (answeredQuestions.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };

            const totalScore = answeredQuestions.reduce((a, b) => a + b, 0);
            const maxPossible = answeredQuestions.length * 5;
            const percentage = Math.round((totalScore / maxPossible) * 100);

            let interpretation = '';
            if (percentage <= 20) interpretation = 'Incapacidade Mínima';
            else if (percentage <= 40) interpretation = 'Incapacidade Moderada';
            else if (percentage <= 60) interpretation = 'Incapacidade Intensa (Severa)';
            else if (percentage <= 80) interpretation = 'Incapacidade Devastadora';
            else interpretation = 'Paciente Restrito ao Leito';

            return { score: totalScore, max: maxPossible, percentage, interpretation, unit: '%' };
        }
    },
    ndi: {
        id: 'ndi',
        segment: 'cervical',
        title: 'Neck Disability Index (NDI)',
        description: 'Questionário para avaliar como a dor no pescoço tem afetado o seu dia a dia.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="12"/><path d="M9 10v2a3 3 0 0 0 6 0v-2"/><path d="M8 22v-6a4 4 0 0 1 8 0v6"/></svg>',
        questions: [
            {
                text: '1. Intensidade da Dor',
                options: [
                    { value: 0, label: 'No momento eu não tenho dor.' },
                    { value: 1, label: 'No momento a dor é bem leve.' },
                    { value: 2, label: 'No momento a dor é moderada.' },
                    { value: 3, label: 'No momento a dor é bastante forte.' },
                    { value: 4, label: 'No momento a dor é muito forte.' },
                    { value: 5, label: 'No momento a dor é a pior possível.' }
                ]
            },
            {
                text: '2. Cuidados Pessoais (lavar-se, vestir-se, etc.)',
                options: [
                    { value: 0, label: 'Posso cuidar de mim mesmo sem que isto aumente minha dor.' },
                    { value: 1, label: 'Posso cuidar de mim mesmo, mas isto aumenta minha dor.' },
                    { value: 2, label: 'Cuidar de mim mesmo é doloroso e por isto sou lento e cuidadoso.' },
                    { value: 3, label: 'Preciso de alguma ajuda, mas consigo fazer a maioria das coisas.' },
                    { value: 4, label: 'Preciso de ajuda todos os dias para a maior parte dos meus cuidados pessoais.' },
                    { value: 5, label: 'Não consigo me vestir, lavo-me com dificuldade e permaneço na cama.' }
                ]
            },
            {
                text: '3. Levantar Peso',
                options: [
                    { value: 0, label: 'Posso levantar objetos pesados sem que isto aumente minha dor.' },
                    { value: 1, label: 'Posso levantar objetos pesados, mas isto aumenta minha dor.' },
                    { value: 2, label: 'A dor me impede de levantar objetos pesados do chão, mas consigo se estiverem bem posicionados.' },
                    { value: 3, label: 'A dor me impede de levantar objetos pesados, mas consigo levantar objetos leves se bem posicionados.' },
                    { value: 4, label: 'Só consigo levantar objetos muito leves.' },
                    { value: 5, label: 'Não consigo levantar nem carregar nenhum objeto.' }
                ]
            },
            {
                text: '4. Leitura',
                options: [
                    { value: 0, label: 'Posso ler o quanto eu quiser sem sentir dor no pescoço.' },
                    { value: 1, label: 'Posso ler o quanto eu quiser com uma leve dor no pescoço.' },
                    { value: 2, label: 'Posso ler o quanto eu quiser com dor moderada no pescoço.' },
                    { value: 3, label: 'Não posso ler tanto quanto eu gostaria por causa de dor moderada no pescoço.' },
                    { value: 4, label: 'Eu quase não consigo ler por causa da dor muito forte no pescoço.' },
                    { value: 5, label: 'Não consigo ler de modo algum.' }
                ]
            },
            {
                text: '5. Dores de Cabeça',
                options: [
                    { value: 0, label: 'Não tenho nenhuma dor de cabeça.' },
                    { value: 1, label: 'Tenho leves dores de cabeça não muito frequentes.' },
                    { value: 2, label: 'Tenho dores de cabeça moderadas não muito frequentes.' },
                    { value: 3, label: 'Tenho dores de cabeça moderadas frequentemente.' },
                    { value: 4, label: 'Tenho dores de cabeça muito fortes frequentemente.' },
                    { value: 5, label: 'Tenho dores de cabeça o tempo todo.' }
                ]
            },
            {
                text: '6. Concentração',
                options: [
                    { value: 0, label: 'Consigo me concentrar totalmente quando eu quero, sem nenhuma dificuldade.' },
                    { value: 1, label: 'Consigo me concentrar totalmente quando eu quero, com uma pequena dificuldade.' },
                    { value: 2, label: 'Eu tenho bastante dificuldade em me concentrar nas coisas que eu quero.' },
                    { value: 3, label: 'Eu tenho muita dificuldade para me concentrar nas coisas que eu quero.' },
                    { value: 4, label: 'Eu tenho imensa dificuldade para me concentrar nas coisas que eu quero.' },
                    { value: 5, label: 'Não consigo me concentrar de forma nenhuma.' }
                ]
            },
            {
                text: '7. Trabalho',
                options: [
                    { value: 0, label: 'Posso realizar as tarefas que meu trabalho exige.' },
                    { value: 1, label: 'Posso realizar as tarefas que meu trabalho exige, mas com uma leve dor extra.' },
                    { value: 2, label: 'Posso realizar a maioria das tarefas que meu trabalho exige, mas com dor moderada extra.' },
                    { value: 3, label: 'Não posso realizar as tarefas que meu trabalho exige por causa de severa dor extra.' },
                    { value: 4, label: 'Eu quase não consigo realizar nenhuma tarefa no trabalho.' },
                    { value: 5, label: 'Não consigo realizar o meu trabalho regular seja ele qual for.' }
                ]
            },
            {
                text: '8. Dirigir',
                options: [
                    { value: 0, label: 'Posso dirigir o quanto eu quiser sem problemas.' },
                    { value: 1, label: 'Posso dirigir meu carro o quanto quiser com pouca dor ou rigidez no pescoço.' },
                    { value: 2, label: 'Posso dirigir o quanto quiser com dor ou rigidez moderada.' },
                    { value: 3, label: 'Não posso dirigir tanto quanto gostaria por causa de dor/rigidez severa no pescoço.' },
                    { value: 4, label: 'Eu quase não posso dirigir por causa de dor severa no pescoço.' },
                    { value: 5, label: 'Não posso dirigir absolutamente nada.' }
                ]
            },
            {
                text: '9. Sono',
                options: [
                    { value: 0, label: 'Não tenho nenhum problema para dormir.' },
                    { value: 1, label: 'Meu sono é levemente perturbado.' },
                    { value: 2, label: 'Meu sono é moderadamente perturbado.' },
                    { value: 3, label: 'Meu sono é muito perturbado.' },
                    { value: 4, label: 'Meu sono não é nada reparador.' },
                    { value: 5, label: 'Não consigo dormir.' }
                ]
            },
            {
                text: '10. Recreação / Lazer',
                options: [
                    { value: 0, label: 'Sou capaz de envolver-me com todas as minhas atividades de lazer sem dor no pescoço.' },
                    { value: 1, label: 'Sou capaz de envolver-me com todas as atividades de lazer, com alguma dor no pescoço.' },
                    { value: 2, label: 'Posso envolver-me com a maioria, mas não com todas as atividades de lazer devido à dor.' },
                    { value: 3, label: 'Sou capaz de envolver-me em algumas das minhas atividades de lazer habituais.' },
                    { value: 4, label: 'Mal consigo realizar qualquer atividade de lazer por causa de dor no pescoço.' },
                    { value: 5, label: 'Estou impedido de envolver-me em qualquer atividade devido à dor no pescoço.' }
                ]
            }
        ],
        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);
            if (answeredQuestions.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };

            const totalScore = answeredQuestions.reduce((a, b) => a + b, 0);
            const maxPossible = answeredQuestions.length * 5;
            const percentage = Math.round((totalScore / maxPossible) * 100);

            let interpretation = '';
            if (percentage <= 8) interpretation = 'Sem Deficiência (0-8%)';
            else if (percentage <= 28) interpretation = 'Deficiência Leve (10-28%)';
            else if (percentage <= 48) interpretation = 'Deficiência Moderada (30-48%)';
            else if (percentage <= 68) interpretation = 'Deficiência Severa (50-68%)';
            else interpretation = 'Deficiência Completa (70-100%)';

            return { score: totalScore, max: maxPossible, percentage, interpretation, unit: '%' };
        }
    },
    quickdash: {
        id: 'quickdash',
        segment: 'ombro',
        title: 'Quick DASH',
        description: 'Questionário para avaliar sintomas e capacidade física focado no ombro, braço e mão.',
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
        questions: [
            {
                text: 'Instrução: Por favor, gradue a sua capacidade para realizar as atividades abaixo, na ÚLTIMA SEMANA, assinalando a opção correspondente.',
                isInstruction: true
            },
            {
                text: '1. Abrir um vidro novo com tampa de rosca ou muito apertada.',
                options: [
                    { value: 1, label: 'Nenhuma Dificuldade' },
                    { value: 2, label: 'Pouca Dificuldade' },
                    { value: 3, label: 'Média Dificuldade' },
                    { value: 4, label: 'Muita Dificuldade' },
                    { value: 5, label: 'Incapaz de Fazer' }
                ]
            },
            {
                text: '2. Fazer trabalhos domésticos pesados (ex.: lavar o chão, lavar paredes, etc.).',
                options: [
                    { value: 1, label: 'Nenhuma Dificuldade' },
                    { value: 2, label: 'Pouca Dificuldade' },
                    { value: 3, label: 'Média Dificuldade' },
                    { value: 4, label: 'Muita Dificuldade' },
                    { value: 5, label: 'Incapaz de Fazer' }
                ]
            },
            {
                text: '3. Carregar uma sacola de compras pesada ou mala.',
                options: [
                    { value: 1, label: 'Nenhuma Dificuldade' },
                    { value: 2, label: 'Pouca Dificuldade' },
                    { value: 3, label: 'Média Dificuldade' },
                    { value: 4, label: 'Muita Dificuldade' },
                    { value: 5, label: 'Incapaz de Fazer' }
                ]
            },
            {
                text: '4. Lavar as costas.',
                options: [
                    { value: 1, label: 'Nenhuma Dificuldade' },
                    { value: 2, label: 'Pouca Dificuldade' },
                    { value: 3, label: 'Média Dificuldade' },
                    { value: 4, label: 'Muita Dificuldade' },
                    { value: 5, label: 'Incapaz de Fazer' }
                ]
            },
            {
                text: '5. Usar uma faca para cortar os alimentos.',
                options: [
                    { value: 1, label: 'Nenhuma Dificuldade' },
                    { value: 2, label: 'Pouca Dificuldade' },
                    { value: 3, label: 'Média Dificuldade' },
                    { value: 4, label: 'Muita Dificuldade' },
                    { value: 5, label: 'Incapaz de Fazer' }
                ]
            },
            {
                text: '6. Atividades recreacionais de lazer em que você aplica alguma força com o seu braço, ombro ou mão (ex.: jogar tênis, pescar, jardinagem etc.).',
                options: [
                    { value: 1, label: 'Nenhuma Dificuldade' },
                    { value: 2, label: 'Pouca Dificuldade' },
                    { value: 3, label: 'Média Dificuldade' },
                    { value: 4, label: 'Muita Dificuldade' },
                    { value: 5, label: 'Incapaz de Fazer' }
                ]
            },
            {
                text: '7. O problema que você tem no seu braço, ombro ou mão impediu-o de realizar suas atividades sociais e normais na ÚLTIMA SEMANA com sua família, com os amigos, os colegas da equipe?',
                options: [
                    { value: 1, label: 'De Forma Nenhuma' },
                    { value: 2, label: 'Dificultou um Pouco' },
                    { value: 3, label: 'Dificultou Moderadamente' },
                    { value: 4, label: 'Dificultou Bastante' },
                    { value: 5, label: 'Impediu Totalmente' }
                ]
            },
            {
                text: '8. O problema que você tem no seu braço, ombro ou mão limitou as suas atividades normais de trabalho do dia a dia ou qualquer outra atividade cotidiana?',
                options: [
                    { value: 1, label: 'Não Limitou nada' },
                    { value: 2, label: 'Limitou um Pouco' },
                    { value: 3, label: 'Limitou Moderadamente' },
                    { value: 4, label: 'Limitou Bastante' },
                    { value: 5, label: 'Impediu Totalmente' }
                ]
            },
            {
                text: 'Instrução: Por favor, gradue a intensidade dos sintomas que você sentiu com o seu braço, ombro ou mão na ÚLTIMA SEMANA.',
                isInstruction: true
            },
            {
                text: '9. Dor no braço, ombro ou mão.',
                options: [
                    { value: 1, label: 'Nenhuma Dor' },
                    { value: 2, label: 'Dor Leve' },
                    { value: 3, label: 'Dor Moderada' },
                    { value: 4, label: 'Dor Severa' },
                    { value: 5, label: 'Dor Extrema' }
                ]
            },
            {
                text: '10. Sensação de formigamento ou dormência (anestesia) (agulhadas) no seu braço, ombro ou mão.',
                options: [
                    { value: 1, label: 'Nenhum sintoma' },
                    { value: 2, label: 'De Leve intensidade' },
                    { value: 3, label: 'De Média intensidade' },
                    { value: 4, label: 'De Muita intensidade' },
                    { value: 5, label: 'Extremo' }
                ]
            },
            {
                text: '11. Durante a ÚLTIMA SEMANA, quanta dificuldade o(a) senhor(a) teve para dormir por causa de dor no seu braço, ombro ou mão?',
                options: [
                    { value: 1, label: 'Nenhuma Dificuldade' },
                    { value: 2, label: 'Pouca Dificuldade' },
                    { value: 3, label: 'Sensação Moderada de Dificuldade' },
                    { value: 4, label: 'Muita Dificuldade' },
                    { value: 5, label: 'Extrema Dificuldade que me fez passar acordado' }
                ]
            }
        ],
        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);

            // O QuickDASH requer que pelo menos 10 das 11 questões sejam respondidas
            if (answeredQuestions.length < 10) {
                return {
                    score: 0,
                    percentage: 0,
                    interpretation: 'Mínimo de 10 respostas obrigatórias'
                };
            }

            const sum = answeredQuestions.reduce((a, b) => a + b, 0);
            const n = answeredQuestions.length;

            // Fórmula QuickDASH: ((soma_das_respostas / n) - 1) * 25
            const finalScore = ((sum / n) - 1) * 25;
            const scoreRounded = Math.round(finalScore * 10) / 10; // Round to 1 decimal place

            return {
                score: scoreRounded,
                max: 100,
                percentage: scoreRounded,
                interpretation: scoreRounded <= 20 ? 'Excelente' : scoreRounded <= 40 ? 'Bom' : scoreRounded <= 60 ? 'Regular' : 'Ruim / Incapacidade Severa',
                unit: 'pontos'
            };
        }
    },
    // ===== GERIATRIA =====
    af_geriatria: {
        id: 'af_geriatria',
        type: 'clinical',
        segment: 'geriatria',
        title: 'Avaliação Funcional Geriátrica',
        description: 'Avaliação clínica e testes funcionais (mobilidade, força e equilíbrio) específicos para idosos.',
        icon: '<img src="icon_geriatria.png" alt="Geriatria" style="width:100%; height:100%; object-fit:contain;">',
        sections: [
            {
                id: 'anamnese',
                title: '1. Anamnese e Exames',
                fields: [
                    { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                    { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                    { id: 'historia', label: 'História Atual e Pregressa', type: 'textarea' },
                    { id: 'exames', label: 'Exames Complementares', type: 'textarea' }
                ]
            },
            {
                id: 'adm',
                title: '2. Exame Físico - Amplitude de Movimento (ADM)',
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
                id: 'questionarios',
                title: '3. Resultados de Questionários',
                fields: [
                    { id: 'res_10cs', label: '10CS (Rastreio Cognitivo - pts)', type: 'number' },
                    { id: 'res_man', label: 'MAN (Nutricional - pts)', type: 'number' },
                    { id: 'res_ves13', label: 'VES-13 (Vulnerabilidade - pts)', type: 'number' },
                    { id: 'res_brief', label: 'BRIEF (Dor - pts)', type: 'number' }
                ]
            },
            {
                id: 'testes_equilibrio',
                title: '4.1 Testes de Equilíbrio (Tempo de permanência)',
                fields: [
                    { id: 'pes_juntos', label: 'Pés Juntos (segundos - obj: 30s)', type: 'number' },
                    { id: 'semi_tandem', label: 'Semi-tandem (segundos - obj: 30s)', type: 'number' },
                    { id: 'tandem', label: 'Tandem (segundos - obj: >17.56s)', type: 'number' }
                ]
            },
            {
                id: 'apoio_unipodal',
                title: '4.2 Ficar em Pé em Uma Perna Só (Apoio Unipodal - obj: >10.43s)',
                type: 'table',
                columns: ['Lado', '1ª Tentativa (seg)', '2ª Tentativa (seg)'],
                rows: [
                    { id: 'unipodal_dir', label: 'Direita', fields: ['tentativa1', 'tentativa2'] },
                    { id: 'unipodal_esq', label: 'Esquerda', fields: ['tentativa1', 'tentativa2'] }
                ]
            },
            {
                id: 'oito_toques',
                title: '4.3 Oito Toques Consecutivos (obj: <10s)',
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
                title: '4.4 a 4.7 Testes de Mobilidade e Força',
                fields: [
                    { id: 'tug', label: '4.4 Timed Up and Go (TUG - seg, obj: <12.47s)', type: 'number' },
                    { id: 'vel_marcha', label: '4.5 Velocidade da Marcha (m/s, obj: >0.8m/s)', type: 'number' },
                    { id: 'sentar_levantar', label: '4.6 Teste de Sentar/Levantar 5x (segundos)', type: 'number' },
                    { id: 'preensao', label: '4.7 Força de Preensão Palmar (kg - obj: >16kg Fem / >27kg Masc)', type: 'number' }
                ]
            },
            {
                id: 'resultados_diagnostico',
                title: '5 e 6. Resultados, Diagnóstico e Risco de Quedas',
                fields: [
                    { id: 'diagnostico_funcional', label: '5. Resultados e Diagnóstico Funcional', type: 'textarea' },
                    { id: 'risco_quedas', label: '6. Classificação do Risco de Quedas', type: 'textarea' }
                ]
            },
            {
                id: 'sugestoes',
                title: '7. Sugestões Terapêuticas',
                fields: [
                    { id: 'sugestoes_obs', label: '7. Sugestões e Considerações Terapêuticas', type: 'textarea' }
                ]
            },
            {
                id: 'questionarios_geriatria_integracao',
                title: 'Questionários Complementares',
                fields: [
                    { id: 'man_novo', label: 'Preencher Questionário MAN (Nutricional)', type: 'button', props: "value='Abrir MAN' onclick='window.abrirModalMan && window.abrirModalMan()'" },
                    { id: 'man_score', label: 'Resultado MAN Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' },

                    { id: 'ves13_novo', label: 'Preencher Questionário VES-13', type: 'button', props: "value='Abrir VES-13' onclick='window.abrirModalVes13 && window.abrirModalVes13()'" },
                    { id: 'ves13_score', label: 'Resultado VES-13 Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' },

                    { id: 'lbpq_novo', label: 'Preencher Questionário LBPQ (Dor Lombar)', type: 'button', props: "value='Abrir LBPQ' onclick='window.abrirModalLbpq && window.abrirModalLbpq()'" },
                    { id: 'lbpq_score', label: 'Resultado LBPQ Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' },

                    { id: 'brief_novo', label: 'Preencher Questionário BPI-SF (Dor)', type: 'button', props: "value='Abrir BPI-SF' onclick='window.abrirModalBrief && window.abrirModalBrief()'" },
                    { id: 'brief_score', label: 'Resultado BPI-SF Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            }
        ],
        calculateScore: (data) => {
            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação Funcional Geriátrica Finalizada',
                details: {}
            };
        }
    },
    man: {
        id: 'man',
        segment: 'geriatria',
        title: 'MAN - Mini Avaliação Nutricional',
        description: 'Ferramenta validada para identificar idosos desnutridos ou em risco de desnutrição.',
        icon: '<img src="icon_geriatria.png" alt="Geriatria" style="width:100%; height:100%; object-fit:contain;">',
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
                    { value: 0, label: 'Demência ou depressão graves' },
                    { value: 1, label: 'Demência leve' },
                    { value: 2, label: 'Sem problemas psicológicos' }
                ]
            },
            {
                text: 'F. Índice de Massa Corporal (IMC = peso [kg] / estatura [m²]).',
                options: [
                    { value: 0, label: 'IMC < 19' },
                    { value: 1, label: '19 ≤ IMC < 21' },
                    { value: 2, label: '21 ≤ IMC < 23' },
                    { value: 3, label: 'IMC ≥ 23' }
                ]
            },
            { text: 'AVALIAÇÃO GLOBAL (Parte 2 — máximo 16 pontos — preencher se triagem ≤ 11)', isInstruction: true },
            {
                text: 'G. O paciente vive na sua própria casa (não em instituição geriátrica ou hospital)?',
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
            const answeredQuestions = Object.values(answers);
            if (answeredQuestions.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };

            const totalScore = answeredQuestions.reduce((a, b) => a + b, 0);
            const maxPossible = 30;
            const percentage = Math.round((totalScore / maxPossible) * 100);

            let interpretation = '';
            if (totalScore >= 24) interpretation = 'Estado Nutricional Normal';
            else if (totalScore >= 17) interpretation = 'Risco de Desnutrição';
            else interpretation = 'Desnutrido';

            return { score: totalScore, max: maxPossible, percentage, interpretation, unit: 'pontos' };
        }
    },
    ves13: {
        id: 'ves13',
        segment: 'geriatria',
        title: 'VES-13 — Vulnerable Elders Survey',
        description: 'Rastreamento rápido para identificar idosos em risco de declínio funcional ou morte.',
        icon: '<img src="icon_geriatria.png" alt="Geriatria" style="width:100%; height:100%; object-fit:contain;">',
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
                    { value: 0, label: 'Nenhuma dificuldade' },
                    { value: 0, label: 'Um pouco de dificuldade' },
                    { value: 0, label: 'Alguma dificuldade' },
                    { value: 1, label: 'Muita dificuldade' },
                    { value: 1, label: 'Incapaz de fazer' }
                ]
            },
            {
                text: '3b. Levantar ou carregar objetos com peso aproximado de 5 kg?',
                options: [
                    { value: 0, label: 'Nenhuma dificuldade' },
                    { value: 0, label: 'Um pouco de dificuldade' },
                    { value: 0, label: 'Alguma dificuldade' },
                    { value: 1, label: 'Muita dificuldade' },
                    { value: 1, label: 'Incapaz de fazer' }
                ]
            },
            {
                text: '3c. Elevar ou estender os braços acima do nível do ombro?',
                options: [
                    { value: 0, label: 'Nenhuma dificuldade' },
                    { value: 0, label: 'Um pouco de dificuldade' },
                    { value: 0, label: 'Alguma dificuldade' },
                    { value: 1, label: 'Muita dificuldade' },
                    { value: 1, label: 'Incapaz de fazer' }
                ]
            },
            {
                text: '3d. Escrever ou manusear e segurar pequenos objetos?',
                options: [
                    { value: 0, label: 'Nenhuma dificuldade' },
                    { value: 0, label: 'Um pouco de dificuldade' },
                    { value: 0, label: 'Alguma dificuldade' },
                    { value: 1, label: 'Muita dificuldade' },
                    { value: 1, label: 'Incapaz de fazer' }
                ]
            },
            {
                text: '3e. Andar 400 metros (aproximadamente quatro quarteirões)?',
                options: [
                    { value: 0, label: 'Nenhuma dificuldade' },
                    { value: 0, label: 'Um pouco de dificuldade' },
                    { value: 0, label: 'Alguma dificuldade' },
                    { value: 1, label: 'Muita dificuldade' },
                    { value: 1, label: 'Incapaz de fazer' }
                ]
            },
            {
                text: '3f. Fazer serviço doméstico pesado, como esfregar o chão ou limpar janelas?',
                options: [
                    { value: 0, label: 'Nenhuma dificuldade' },
                    { value: 0, label: 'Um pouco de dificuldade' },
                    { value: 0, label: 'Alguma dificuldade' },
                    { value: 1, label: 'Muita dificuldade' },
                    { value: 1, label: 'Incapaz de fazer' }
                ]
            },
            { text: 'INCAPACIDADES — Por causa da sua saúde ou condição física, você tem dificuldade para: (4 pontos se 1 ou mais respostas "Sim", máximo 4 pontos nesta seção)', isInstruction: true },
            {
                text: '4a. Fazer compras de itens pessoais (produtos de higiene pessoal ou medicamentos)?',
                options: [
                    { value: 0, label: 'Não' },
                    { value: 4, label: 'Sim' }
                ]
            },
            {
                text: '4b. Lidar com dinheiro (controlar despesas, gastos ou pagar contas)?',
                options: [
                    { value: 0, label: 'Não' },
                    { value: 4, label: 'Sim' }
                ]
            },
            {
                text: '4c. Atravessar o quarto andando ou caminhar pela sala?',
                options: [
                    { value: 0, label: 'Não' },
                    { value: 4, label: 'Sim' }
                ]
            },
            {
                text: '4d. Realizar tarefas domésticas leves (lavar louça, arrumar a casa ou limpeza leve)?',
                options: [
                    { value: 0, label: 'Não' },
                    { value: 4, label: 'Sim' }
                ]
            },
            {
                text: '4e. Tomar banho sozinho(a) de chuveiro ou banheira?',
                options: [
                    { value: 0, label: 'Não' },
                    { value: 4, label: 'Sim' }
                ]
            }
        ],
        calculateScore: (answers) => {
            const keys = Object.keys(answers).map(Number).sort((a, b) => a - b);
            if (keys.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };

            let score = 0;

            // Q1 = age (index 0), Q2 = health (index 1)
            if (answers[0] !== undefined) score += answers[0];
            if (answers[1] !== undefined) score += answers[1];

            // Q3a-3f = physical limitation (indices 3-8), max 2 points
            let physLimit = 0;
            for (let i = 3; i <= 8; i++) {
                if (answers[i] !== undefined) physLimit += answers[i];
            }
            score += Math.min(physLimit, 2);

            // Q4a-4e = disabilities (indices 10-14), max 4 points (4 if any "Sim")
            let anyDisability = false;
            for (let i = 10; i <= 14; i++) {
                if (answers[i] === 4) { anyDisability = true; break; }
            }
            if (anyDisability) score += 4;

            const maxPossible = 10;
            const percentage = Math.round((score / maxPossible) * 100);

            let interpretation = '';
            if (score <= 2) interpretation = 'Idoso Robusto (não vulnerável)';
            else if (score <= 6) interpretation = 'Risco de Fragilização (avaliar com outros instrumentos)';
            else interpretation = 'Idoso Vulnerável (alto risco de declínio funcional)';

            return { score, max: maxPossible, percentage, interpretation, unit: 'pontos' };
        }
    },
    lbpq: {
        id: 'lbpq',
        segment: 'geriatria',
        title: 'LBPQ — Roland-Morris (Incapacidade por Dor Lombar)',
        description: 'Questionário de 24 itens para avaliar incapacidade funcional por dor lombar.',
        icon: '<img src="icon_geriatria.png" alt="Geriatria" style="width:100%; height:100%; object-fit:contain;">',
        questions: [
            { text: 'Instrução: Abaixo estão algumas frases que as pessoas usam para se descrever quando têm dores nas costas. Quando você ler essas frases, algumas parecerão descrever você HOJE. Assinale apenas as frases que descrevem você HOJE.', isInstruction: true },
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
            { text: '16. Tenho problemas para colocar minhas meias (ou meia-calça) por causa das dores nas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '17. Caminho apenas curtas distâncias por causa das dores nas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '18. Não durmo tão bem por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '19. Por causa das dores nas costas, visto-me com ajuda de outras pessoas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '20. Fico sentado a maior parte do dia por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '21. Evito trabalhos pesados em casa por causa das minhas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '22. Por causa das dores nas costas, fico mais irritado e mal-humorado com as pessoas do que o habitual.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '23. Por causa das minhas costas, subo escadas mais vagarosamente do que o habitual.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] },
            { text: '24. Fico na cama deitado ou sentado a maior parte do tempo por causa das dores nas costas.', options: [{ value: 0, label: 'Não' }, { value: 1, label: 'Sim' }] }
        ],
        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);
            if (answeredQuestions.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };

            const totalScore = answeredQuestions.reduce((a, b) => a + b, 0);
            const maxPossible = 24;
            const percentage = Math.round((totalScore / maxPossible) * 100);

            let interpretation = '';
            if (totalScore <= 4) interpretation = 'Incapacidade Mínima';
            else if (totalScore <= 8) interpretation = 'Incapacidade Leve';
            else if (totalScore <= 14) interpretation = 'Incapacidade Moderada';
            else if (totalScore <= 20) interpretation = 'Incapacidade Severa';
            else interpretation = 'Incapacidade Muito Severa';

            return { score: totalScore, max: maxPossible, percentage, interpretation, unit: 'pontos (0-24, quanto maior pior)' };
        }
    },
    brief: {
        id: 'brief',
        segment: 'geriatria',
        title: 'Brief Pain Inventory (BPI-SF)',
        description: 'Inventário Breve de Dor: avalia a intensidade da dor e seu impacto nas atividades diárias.',
        icon: '<img src="icon_geriatria.png" alt="Geriatria" style="width:100%; height:100%; object-fit:contain;">',
        questions: [
            { text: 'INTENSIDADE DA DOR — Nas últimas 24 horas, por favor avalie sua dor circulando o número que melhor descreve: (0 = Sem dor | 10 = A pior dor imaginável)', isInstruction: true },
            {
                text: '1. A pior dor que você sentiu nas últimas 24 horas.',
                options: [
                    { value: 0, label: '0 — Sem dor' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Pior dor imaginável' }
                ]
            },
            {
                text: '2. A dor mais fraca que você sentiu nas últimas 24 horas.',
                options: [
                    { value: 0, label: '0 — Sem dor' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Pior dor imaginável' }
                ]
            },
            {
                text: '3. A média da sua dor.',
                options: [
                    { value: 0, label: '0 — Sem dor' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Pior dor imaginável' }
                ]
            },
            {
                text: '4. A dor agora (neste momento).',
                options: [
                    { value: 0, label: '0 — Sem dor' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Pior dor imaginável' }
                ]
            },
            { text: 'INTERFERÊNCIA DA DOR — Nas últimas 24 horas, quanto a dor interferiu em: (0 = Não interfere | 10 = Interfere completamente)', isInstruction: true },
            {
                text: '5. Atividade geral.',
                options: [
                    { value: 0, label: '0 — Não interfere' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Interfere completamente' }
                ]
            },
            {
                text: '6. Humor / Disposição.',
                options: [
                    { value: 0, label: '0 — Não interfere' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Interfere completamente' }
                ]
            },
            {
                text: '7. Capacidade de caminhar.',
                options: [
                    { value: 0, label: '0 — Não interfere' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Interfere completamente' }
                ]
            },
            {
                text: '8. Trabalho normal (incluindo tarefas domésticas).',
                options: [
                    { value: 0, label: '0 — Não interfere' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Interfere completamente' }
                ]
            },
            {
                text: '9. Relações com outras pessoas.',
                options: [
                    { value: 0, label: '0 — Não interfere' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Interfere completamente' }
                ]
            },
            {
                text: '10. Sono.',
                options: [
                    { value: 0, label: '0 — Não interfere' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Interfere completamente' }
                ]
            },
            {
                text: '11. Aproveitamento da vida.',
                options: [
                    { value: 0, label: '0 — Não interfere' }, { value: 1, label: '1' }, { value: 2, label: '2' },
                    { value: 3, label: '3' }, { value: 4, label: '4' }, { value: 5, label: '5' },
                    { value: 6, label: '6' }, { value: 7, label: '7' }, { value: 8, label: '8' },
                    { value: 9, label: '9' }, { value: 10, label: '10 — Interfere completamente' }
                ]
            }
        ],
        calculateScore: (answers) => {
            const keys = Object.keys(answers).map(Number).sort((a, b) => a - b);
            if (keys.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };

            // Severity: questions at indices 1,2,3,4 (after instruction at 0)
            const severityIndices = [1, 2, 3, 4];
            const severityValues = severityIndices.filter(i => answers[i] !== undefined).map(i => answers[i]);
            const severityScore = severityValues.length > 0 ? (severityValues.reduce((a, b) => a + b, 0) / severityValues.length) : 0;

            // Interference: questions at indices 6,7,8,9,10,11,12 (after instruction at 5)
            const interferenceIndices = [6, 7, 8, 9, 10, 11, 12];
            const interferenceValues = interferenceIndices.filter(i => answers[i] !== undefined).map(i => answers[i]);
            const interferenceScore = interferenceValues.length > 0 ? (interferenceValues.reduce((a, b) => a + b, 0) / interferenceValues.length) : 0;

            const severityRounded = Math.round(severityScore * 10) / 10;
            const interferenceRounded = Math.round(interferenceScore * 10) / 10;

            const getLevel = (val) => val <= 3 ? 'Leve' : val <= 6 ? 'Moderada' : 'Severa';

            return {
                score: severityRounded,
                max: 10,
                percentage: Math.round(severityScore * 10),
                interpretation: `Severidade: ${severityRounded}/10 (${getLevel(severityRounded)}) | Interferência: ${interferenceRounded}/10 (${getLevel(interferenceRounded)})`,
                unit: 'pontos (média)',
                details: {
                    'Severidade da Dor (média 0-10)': severityRounded,
                    'Interferência da Dor (média 0-10)': interferenceRounded
                }
            };
        }
    },
    lysholm: {
        id: 'lysholm',
        segment: 'mmii',
        title: 'Escala de Lysholm',
        description: 'Questionário para avaliar a função do joelho e sintomas mecânicos.',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        questions: [
            {
                text: '1. Claudicação (Mancar)',
                options: [
                    { value: 5, label: 'Nenhuma' },
                    { value: 3, label: 'Leve ou periódica' },
                    { value: 0, label: 'Grave e constante' }
                ]
            },
            {
                text: '2. Apoio',
                options: [
                    { value: 5, label: 'Normal' },
                    { value: 2, label: 'Bengala ou muleta' },
                    { value: 0, label: 'Impossível colocar peso' }
                ]
            },
            {
                text: '3. Travamento',
                options: [
                    { value: 15, label: 'Nenhum travamento ou sensação de que algo prende' },
                    { value: 10, label: 'Sensação de que prende, mas sem travamento real' },
                    { value: 6, label: 'Travamento ocasional' },
                    { value: 2, label: 'Travamento frequente' },
                    { value: 0, label: 'Travado no momento' }
                ]
            },
            {
                text: '4. Instabilidade (Falseio)',
                options: [
                    { value: 25, label: 'Nunca falseia' },
                    { value: 20, label: 'Raramente durante atividades esportivas' },
                    { value: 15, label: 'Frequentemente durante atividades esportivas' },
                    { value: 10, label: 'Ocasionalmente durante atividades diárias' },
                    { value: 5, label: 'Frequentemente durante atividades diárias' },
                    { value: 0, label: 'A cada passo' }
                ]
            },
            {
                text: '5. Dor',
                options: [
                    { value: 25, label: 'Nenhuma' },
                    { value: 20, label: 'Inconstante e leve durante esforço pesado' },
                    { value: 15, label: 'Significativa durante esforço pesado' },
                    { value: 10, label: 'Significativa após caminhada > 2km' },
                    { value: 5, label: 'Significativa após caminhada < 2km' },
                    { value: 0, label: 'Constante' }
                ]
            },
            {
                text: '6. Inchaço',
                options: [
                    { value: 10, label: 'Nenhum' },
                    { value: 6, label: 'Durante esforço pesado' },
                    { value: 2, label: 'Após esforço normal' },
                    { value: 0, label: 'Constante' }
                ]
            },
            {
                text: '7. Subir Escadas',
                options: [
                    { value: 10, label: 'Sem problemas' },
                    { value: 6, label: 'Levemente prejudicado' },
                    { value: 2, label: 'Um degrau de cada vez' },
                    { value: 0, label: 'Impossível' }
                ]
            },
            {
                text: '8. Agachar',
                options: [
                    { value: 5, label: 'Sem problemas' },
                    { value: 4, label: 'Levemente prejudicado' },
                    { value: 2, label: 'Não além de 90 graus' },
                    { value: 0, label: 'Impossível' }
                ]
            }
        ],
        calculateScore: (answers) => {
            let score = 0;
            Object.values(answers).forEach(val => score += val);

            let interpretation = '';
            if (score >= 95) interpretation = 'Excelente';
            else if (score >= 84) interpretation = 'Bom';
            else if (score >= 65) interpretation = 'Regular';
            else interpretation = 'Ruim';

            return {
                score,
                max: 100,
                unit: 'pontos',
                percentage: score,
                interpretation
            };
        }
    },
    womac: {
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
        ],
        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);
            const sum = answeredQuestions.reduce((a, b) => a + b, 0);

            let dor = 0, rigidez = 0, funcao = 0;
            let dorCnt = 0, rigidezCnt = 0, funcaoCnt = 0;

            Object.keys(answers).forEach((key) => {
                const k = parseInt(key) - 1; // 1-indexed to 0-indexed for logic below if needed, but wait: the keys are indexes of the 'questions' array! No, wait, they are indexes.
                // In data.js, the answers object stores { questionIndex: selectedValue }
                // Let's iterate by finding the text and inferring category, or just rely on the questionIndex!
                // questions[0] is instruction.
                // questions[1] to [5] are pain (indices 1,2,3,4,5).
                // questions[6] is instruction.
                // questions[7] to [8] are stiffness (indices 7,8).
                // questions[9] is instruction.
                // questions[10] to [26] are function (indices 10 to 26).
                const index = parseInt(key);
                if (index >= 1 && index <= 5) { dor += answers[key]; dorCnt++; }
                else if (index >= 7 && index <= 8) { rigidez += answers[key]; rigidezCnt++; }
                else if (index >= 10 && index <= 26) { funcao += answers[key]; funcaoCnt++; }
            });

            const totalMax = 96;
            const percentage = Math.round((sum / totalMax) * 100);

            return {
                score: sum,
                max: totalMax,
                percentage: percentage,
                unit: 'pontos (quanto maior, pior)',
                interpretation: percentage <= 20 ? 'Excelente (Pouco impacto)' : percentage <= 40 ? 'Bom (Impacto leve)' : percentage <= 70 ? 'Regular' : 'Ruim (Impacto severo)',
                details: {
                    'Dor (0-20)': dor,
                    'Rigidez (0-8)': rigidez,
                    'Função Física (0-68)': funcao
                }
            };
        }
    },
    ikdc: {
        id: 'ikdc',
        segment: 'mmii',
        title: 'Questionário IKDC (Subjetivo do Joelho)',
        description: 'Ferramenta para medir sintomas, função e atividades esportivas relacionadas ao joelho.',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
        questions: [
            { text: '1. Qual é o nível de atividade mais alto que você consegue realizar sem dor significativa no joelho?', options: [{ value: 4, label: 'Atividades muito intensas (saltar, virar subitamente)' }, { value: 3, label: 'Atividades intensas (trabalho físico pesado)' }, { value: 2, label: 'Atividades moderadas (trabalho físico moderado)' }, { value: 1, label: 'Atividades leves (caminhar, tarefas diárias leves)' }, { value: 0, label: 'Incapaz de realizar qualquer uma das atividades acima' }] },
            { text: '2. Durante as últimas 4 semanas, com que frequência você teve dor? (10 é Nunca, 0 é Constante)', options: [{ value: 10, label: '10 (Nunca)' }, { value: 9, label: '9' }, { value: 8, label: '8' }, { value: 7, label: '7' }, { value: 6, label: '6' }, { value: 5, label: '5' }, { value: 4, label: '4' }, { value: 3, label: '3' }, { value: 2, label: '2' }, { value: 1, label: '1' }, { value: 0, label: '0 (Constantemente)' }] },
            { text: '3. Se você teve dor nas últimas 4 semanas, descreva qual foi a dor de PIOR intensidade que você teve (10 é Sem Dor, 0 é Pior Dor Imaginável):', options: [{ value: 10, label: '10 (Sem dor)' }, { value: 9, label: '9' }, { value: 8, label: '8' }, { value: 7, label: '7' }, { value: 6, label: '6' }, { value: 5, label: '5' }, { value: 4, label: '4' }, { value: 3, label: '3' }, { value: 2, label: '2' }, { value: 1, label: '1' }, { value: 0, label: '0 (Pior dor)' }] },
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
            { text: '18. Como você classifica a função do seu joelho HOJE? (10 é Normal / Sem limitações, 0 é Incapaz)', options: [{ value: 10, label: '10 (Normal)' }, { value: 9, label: '9' }, { value: 8, label: '8' }, { value: 7, label: '7' }, { value: 6, label: '6' }, { value: 5, label: '5' }, { value: 4, label: '4' }, { value: 3, label: '3' }, { value: 2, label: '2' }, { value: 1, label: '1' }, { value: 0, label: '0 (Incapaz)' }] }
        ],
        calculateScore: (answers) => {
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
                interpretation: percentage >= 90 ? 'Excelente (Função normal)' : percentage >= 70 ? 'Bom (Limitação leve)' : percentage >= 50 ? 'Regular' : 'Ruim (Incapacidade grave)'
            };
        }
    },
    af_mmii: {
        id: 'af_mmii',
        type: 'clinical',
        segment: 'mmii',
        title: 'Avaliação Funcional MMII',
        description: 'Avaliação completa incluindo ADM, Perimetria, Força e Y-Balance.',
        icon: '<img src="icon_mmii.png" alt="MMII" style="width:100%; height:100%; object-fit:contain;">',
        sections: [
            {
                id: 'anamnese',
                title: 'Anamnese',
                fields: [
                    { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                    { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 },
                    { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                    { id: 'historia', label: 'História Atual e Pregressa', type: 'textarea' },
                    { id: 'exames', label: 'Exames Complementares', type: 'textarea' }
                ]
            },
            {
                id: 'adm',
                title: 'Amplitude de Movimento (ADM)',
                type: 'table',
                columns: ['Movimento', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'adm_quadril', label: 'ADM de Quadril', fields: ['esquerdo', 'direito'] },
                    { id: 'ext_joelho', label: 'Extensão do Joelho', fields: ['esquerdo', 'direito'] },
                    { id: 'flex_joelho', label: 'Flexão do Joelho', fields: ['esquerdo', 'direito'] }
                ]
            },
            {
                id: 'testes_especiais',
                title: 'Testes Especiais',
                fields: [
                    { id: 'peri_joelho_e', label: 'Perimetria Joelho Esq. (cm)', type: 'number' },
                    { id: 'peri_joelho_d', label: 'Perimetria Joelho Dir. (cm)', type: 'number' },
                    { id: 'peri_coxa_e', label: 'Perimetria Coxa Esq. (cm)', type: 'number' },
                    { id: 'peri_coxa_d', label: 'Perimetria Coxa Dir. (cm)', type: 'number' }
                ]
            },
            {
                id: 'forca',
                title: 'Força Muscular (kgF) - Torque',
                type: 'table',
                columns: ['Músculo', 'Esquerdo', 'Direito', '% Déficit'],
                rows: [
                    { id: 'abd_quadril', label: 'Abdução de Quadril', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'ext_quadril', label: 'Extensão de Quadril', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'flex_quadril', label: 'Flexão de Quadril', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'rot_int_quadril', label: 'Rotação Interna de Quadril', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'ext_joelho', label: 'Extensão de Joelho', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'flex_joelho', label: 'Flexão de Joelho', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'relacao_iq', label: 'Relação I/Q (Joelho)', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] }
                ]
            },
            {
                id: 'endurance',
                title: 'Endurance Muscular (segundos)',
                fields: [
                    { id: 'sorensen', label: 'Teste de Sorensen (Posterior)', type: 'number' },
                    { id: 'anterior_60', label: 'Flexão 60º (Anterior)', type: 'number' }
                ]
            },
            {
                id: 'y_balance',
                title: 'Y-Balance Test (YBT)',
                fields: [
                    { id: 'ybt_e', label: 'Y Apoio Esq. (%)', type: 'number' },
                    { id: 'ybt_d', label: 'Y Apoio Dir. (%)', type: 'number' }
                ]
            },
            {
                id: 'lysholm_integracao',
                title: 'Escala de Lysholm',
                fields: [
                    { id: 'lysholm_busca', label: 'Buscar resposta Lysholm na base de dados', type: 'text' },
                    { id: 'lysholm_novo', label: 'Preencher novo Questionário Lysholm', type: 'button', props: "value='Abrir Lysholm' onclick='window.abrirModalLysholm && window.abrirModalLysholm()'" },
                    { id: 'lysholm_score', label: 'Resultado Lysholm Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            },
            {
                id: 'womac_integracao',
                title: 'Questionário WOMAC',
                fields: [
                    { id: 'womac_busca', label: 'Buscar resposta WOMAC na base de dados', type: 'text' },
                    { id: 'womac_novo', label: 'Preencher novo Questionário WOMAC', type: 'button', props: "value='Abrir WOMAC' onclick='window.abrirModalWomac && window.abrirModalWomac()'" },
                    { id: 'womac_score', label: 'Resultado WOMAC Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            },
            {
                id: 'ikdc_integracao',
                title: 'Questionário IKDC',
                fields: [
                    { id: 'ikdc_busca', label: 'Buscar resposta IKDC na base de dados', type: 'text' },
                    { id: 'ikdc_novo', label: 'Preencher novo Questionário IKDC', type: 'button', props: "value='Abrir IKDC' onclick='window.abrirModalIkdc && window.abrirModalIkdc()'" },
                    { id: 'ikdc_score', label: 'Resultado IKDC Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            }
        ],
        calculateScore: (data) => {
            const results = {
                sections: {}
            };

            // Cálculo Déficits de Força
            ['abd_quadril', 'ext_joelho', 'flex_joelho'].forEach(muscle => {
                if (data[muscle] && data[muscle].esquerdo && data[muscle].direito) {
                    const e = parseFloat(data[muscle].esquerdo);
                    const d = parseFloat(data[muscle].direito);
                    const deficit = Math.abs(((e - d) / Math.max(e, d)) * 100).toFixed(1);
                    results[muscle] = { deficit: deficit + '%' };
                }
            });

            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação Funcional Finalizada',
                details: results
            };
        }
    },

    aofas: {
        id: 'aofas',
        segment: 'tornozelo',
        title: 'Escala AOFAS (Tornozelo e Retropé)',
        description: 'Avalia a dor, função e alinhamento do tornozelo e retropé. Pontuação máxima de 100 pontos.',
        icon: '<img src="icon_tornozelo.png" alt="Tornozelo" style="width:100%; height:100%; object-fit:contain;">',
        questions: [
            { text: 'DOR (40 pontos no máximo)', isInstruction: true },
            {
                text: '1. Dor (% de limitação)',
                options: [
                    { value: 40, label: 'Nenhuma' },
                    { value: 30, label: 'Leve, ocasional' },
                    { value: 20, label: 'Moderada, diária' },
                    { value: 0, label: 'Grave, quase sempre presente' }
                ]
            },
            { text: 'FUNÇÃO (50 pontos no máximo)', isInstruction: true },
            {
                text: '2. Limitação de atividades e necessidade de suporte',
                options: [
                    { value: 10, label: 'Nenhuma limitação, sem suporte' },
                    { value: 7, label: 'Nenhuma limitação para atividades diárias, limitação para atividades recreacionais, sem suporte' },
                    { value: 4, label: 'Limitação para atividades de vida diária e recreacionais, uso de bengala' },
                    { value: 0, label: 'Limitação severa, uso de andador, muletas ou cadeira de rodas' }
                ]
            },
            {
                text: '3. Distância máxima de caminhada',
                options: [
                    { value: 5, label: 'Mais de 6 quarteirões (> 600 metros)' },
                    { value: 4, label: 'De 4 a 6 quarteirões (400 - 600 metros)' },
                    { value: 2, label: 'De 1 a 3 quarteirões (100 - 300 metros)' },
                    { value: 0, label: 'Menos de 1 quarteirão (< 100 metros)' }
                ]
            },
            {
                text: '4. Superfícies de caminhada',
                options: [
                    { value: 5, label: 'Nenhuma dificuldade em qualquer superfície' },
                    { value: 3, label: 'Alguma dificuldade em terrenos irregulares, degraus, ladeiras, escadas' },
                    { value: 0, label: 'Dificuldade severa em terrenos irregulares, degraus, ladeiras, escadas' }
                ]
            },
            {
                text: '5. Anormalidade da marcha',
                options: [
                    { value: 8, label: 'Nenhuma, normal' },
                    { value: 4, label: 'Óbvia (manca)' },
                    { value: 0, label: 'Acentuada' }
                ]
            },
            {
                text: '6. Mobilidade Sagital (flexão + extensão)',
                options: [
                    { value: 8, label: 'Normal ou leve restrição (30° ou mais)' },
                    { value: 4, label: 'Restrição moderada (15° - 29°)' },
                    { value: 0, label: 'Restrição severa (menos de 15°)' }
                ]
            },
            {
                text: '7. Mobilidade do Retropé (inversão + eversão)',
                options: [
                    { value: 6, label: 'Normal ou leve restrição (75% a 100% do normal)' },
                    { value: 3, label: 'Restrição moderada (25% a 74% do normal)' },
                    { value: 0, label: 'Restrição severa (menos de 25% do normal)' }
                ]
            },
            {
                text: '8. Estabilidade do tornozelo-retropé (anteroposterior, varo/valgo)',
                options: [
                    { value: 8, label: 'Estável' },
                    { value: 0, label: 'Definitivamente instável' }
                ]
            },
            { text: 'ALINHAMENTO (10 pontos no máximo)', isInstruction: true },
            {
                text: '9. Alinhamento do tornozelo-retropé',
                options: [
                    { value: 10, label: 'Bom, pé plantígrado, bem alinhado' },
                    { value: 5, label: 'Razoável, sintomático' },
                    { value: 0, label: 'Ruim, não plantígrado, deformidade grave' }
                ]
            }
        ],
        calculateScore: (answers) => {
            const answeredQuestions = Object.values(answers);
            if (answeredQuestions.length === 0) return { score: 0, percentage: 0, interpretation: 'Nenhuma resposta' };

            const totalScore = answeredQuestions.reduce((a, b) => a + b, 0);
            const maxPossible = 100;
            const percentage = Math.round((totalScore / maxPossible) * 100);

            let interpretation = '';
            if (totalScore >= 90) interpretation = 'Excelente';
            else if (totalScore >= 80) interpretation = 'Bom';
            else if (totalScore >= 70) interpretation = 'Razoável (Regular)';
            else interpretation = 'Ruim';

            // Calculate sub-scores based on question index
            // Pain: Q1 (index 1)
            // Function: Q2-Q8 (indexes 3, 4, 5, 6, 7, 8, 9)
            // Alignment: Q9 (index 11)
            let dor = 0, funcao = 0, alinhamento = 0;
            if (answers[1] !== undefined) dor += answers[1];
            [3, 4, 5, 6, 7, 8, 9].forEach(idx => { if (answers[idx] !== undefined) funcao += answers[idx]; });
            if (answers[11] !== undefined) alinhamento += answers[11];

            return {
                score: totalScore,
                max: maxPossible,
                percentage,
                interpretation,
                unit: 'pontos',
                details: {
                    'Dor (0-40)': dor,
                    'Função (0-50)': funcao,
                    'Alinhamento (0-10)': alinhamento
                }
            };
        }
    },
    af_tornozelo: {
        id: 'af_tornozelo',
        type: 'clinical',
        segment: 'tornozelo',
        title: 'Avaliação Funcional de Tornozelo e Pé',
        description: 'Avaliação física incluindo ADM, testes especiais (Heel Raise, Step-Down, YBT) e força muscular.',
        icon: '<img src="icon_tornozelo.png" alt="Tornozelo" style="width:100%; height:100%; object-fit:contain;">',
        sections: [
            {
                id: 'anamnese',
                title: '1. Anamnese',
                fields: [
                    { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                    { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                    { id: 'historia', label: 'História Atual e Pregressa (ex: frequência de entorses)', type: 'textarea' }
                ]
            },
            {
                id: 'adm',
                title: '2. Amplitude de Movimento (ADM)',
                type: 'table',
                columns: ['Movimento', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'weight_bearing_lunge', label: 'Weight Bearing Lunge Test (cm)', fields: ['esquerdo', 'direito'] },
                    { id: 'flexao_plantar', label: 'Flexão Plantar', fields: ['esquerdo', 'direito'] }
                ]
            },
            {
                id: 'testes_especiais',
                title: '3. Testes Especiais',
                type: 'table',
                columns: ['Teste', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'perimetria_perna', label: 'Perimetria da perna (10 cm abaixo da TAT) - cm', fields: ['esquerdo', 'direito'] },
                    { id: 'single_leg_heel_raise', label: 'Single Leg Heel Raise Test (Repetições)', fields: ['esquerdo', 'direito'] }
                ]
            },
            {
                id: 'questionarios',
                title: '4. Resultados de Questionários',
                fields: [
                    { id: 'res_aofas', label: 'AOFAS (pts - 100 indica sem sintomas e 0 sintomas extremos)', type: 'number' }
                ]
            },
            {
                id: 'forca',
                title: '5. Força Muscular / Torque Muscular (kgF)',
                type: 'table',
                columns: ['Movimento', 'Esquerdo', 'Direito', '% Déficit'],
                rows: [
                    { id: 'forca_dorsiflexores', label: 'Dorsiflexores', fields: ['esquerdo', 'direito', 'deficit'] },
                    { id: 'forca_inversores', label: 'Inversores', fields: ['esquerdo', 'direito', 'deficit'] },
                    { id: 'forca_eversores', label: 'Eversores', fields: ['esquerdo', 'direito', 'deficit'] }
                ]
            },
            {
                id: 'step_down',
                title: '6. Step-Down Test',
                fields: [
                    { id: 'step_down_valgo_esq', label: 'Joelho Esquerdo - Valgo Dinâmico (°)', type: 'number' },
                    { id: 'step_down_pelv_esq', label: 'Joelho Esquerdo - Queda Pélvica (°)', type: 'number' },
                    { id: 'step_down_valgo_dir', label: 'Joelho Direito - Valgo Dinâmico (°)', type: 'number' },
                    { id: 'step_down_pelv_dir', label: 'Joelho Direito - Queda Pélvica (°)', type: 'number' }
                ]
            },
            {
                id: 'y_balance',
                title: '7. Y-Balance Test (YBT)',
                fields: [
                    { id: 'ybt_esq', label: 'Y apoio do membro inferior esquerdo (pts)', type: 'number' },
                    { id: 'ybt_dir', label: 'Y apoio do membro inferior direito (pts)', type: 'number' }
                ]
            },
            {
                id: 'resultados_diagnostico',
                title: '8. Resultados e Diagnóstico Funcional',
                fields: [
                    { id: 'diagnostico_funcional', label: 'Resultados e Diagnóstico Funcional', type: 'textarea' },
                    { id: 'sugestoes_obs', label: 'Sugestões e Considerações Terapêuticas', type: 'textarea' }
                ]
            },
            {
                id: 'aofas_integracao',
                title: 'Escala AOFAS',
                fields: [
                    { id: 'aofas_busca', label: 'Buscar resposta AOFAS na base de dados', type: 'text' },
                    { id: 'aofas_novo', label: 'Preencher novo Questionário AOFAS', type: 'button', props: "value='Abrir AOFAS' onclick='window.abrirModalAofas && window.abrirModalAofas()'" },
                    { id: 'aofas_score', label: 'Resultado AOFAS Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            }
        ],
        calculateScore: (data) => {
            const results = {};

            // Calculo Déficits de Força
            ['forca_dorsiflexores', 'forca_inversores', 'forca_eversores'].forEach(muscle => {
                if (data[muscle] && data[muscle].esquerdo && data[muscle].direito) {
                    const e = parseFloat(data[muscle].esquerdo);
                    const d = parseFloat(data[muscle].direito);
                    const deficit = Math.abs(((e - d) / Math.max(e, d)) * 100).toFixed(1);
                    results[muscle] = { deficit: deficit + '%' };
                }
            });

            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação Funcional Tornozelo/Pé Finalizada',
                details: results
            };
        }
    },
    af_cotovelo: {
        id: 'af_cotovelo',
        type: 'clinical',
        segment: 'cotovelo',
        title: 'Avaliação Funcional Cotovelo/Mão',
        description: 'Avaliação do cotovelo e mão incluindo ADM, força, palpação e testes especiais.',
        icon: '<img src="icon_cotovelo.png" alt="Cotovelo" style="width:100%; height:100%; object-fit:contain;">',
        sections: [
            {
                id: 'anamnese',
                title: '2. Características da Disfunção',
                fields: [
                    { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                    { id: 'lado_dominante', label: 'Lado Dominante', type: 'text' },
                    { id: 'lado_afetado', label: 'Lado Afetado (Direito/Esquerdo/Bilateral)', type: 'text' },
                    { id: 'intensidade_dor', label: 'Intensidade da Dor (EVA)', type: 'range', min: 0, max: 10, step: 1 },
                    { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                    { id: 'historia', label: 'História da Moléstia Atual / Mecanismo de Lesão', type: 'textarea' },
                    { id: 'piora', label: 'Atividade de Piora', type: 'textarea' },
                    { id: 'alivio', label: 'Atividade de Alívio', type: 'textarea' },
                    { id: 'doencas', label: 'Doenças Associadas e Medicamentos', type: 'textarea' },
                    { id: 'exames', label: 'Exames Complementares (RNM, RX, ENMG, etc.)', type: 'textarea' }
                ]
            },
            {
                id: 'inspecao_palpacao',
                title: '3. Inspeção e Palpação',
                fields: [
                    { id: 'inspecao', label: 'Inspeção (Deformidades, Edema, Cicatrizes, Trofismo)', type: 'textarea' },
                    { id: 'perimetria_punho_e', label: 'Perimetria Punho Esq. (cm)', type: 'number' },
                    { id: 'perimetria_punho_d', label: 'Perimetria Punho Dir. (cm)', type: 'number' },
                    { id: 'perimetria_cotovelo_e', label: 'Perimetria Cotovelo Esq. (cm)', type: 'number' },
                    { id: 'perimetria_cotovelo_d', label: 'Perimetria Cotovelo Dir. (cm)', type: 'number' }
                ]
            },
            {
                id: 'palpacao_articular',
                title: '3.1 Palpação Articular (Dor + / -)',
                type: 'table',
                columns: ['Estrutura', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'epicondilo_lateral', label: 'Epicôndilo Lateral', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'epicondilo_medial', label: 'Epicôndilo Medial', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'cabeca_radio', label: 'Cabeça do Rádio', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'olecrano', label: 'Olécrano', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'face_anterior_cotovelo', label: 'Face Anterior do Cotovelo', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'tuberoculo_bicipital', label: 'Tubérculo Bicipital', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'estilioide_radial', label: 'Estiloide Radial', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'estilioide_ulnar', label: 'Estiloide Ulnar', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'scaphoide', label: 'Escafoide', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'tunelcarpiano', label: 'Túnel do Carpo (face palmar)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'palpacao_miofascial',
                title: '3.2 Palpação Miofascial (+ / -)',
                type: 'table',
                columns: ['Músculo', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'biceps', label: 'Bíceps Braquial', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'triceps', label: 'Tríceps Braquial', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'extensores_punho', label: 'Extensores do Punho', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'flexores_punho', label: 'Flexores do Punho', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'pronadores', label: 'Pronadores', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'supinadores', label: 'Supinadores', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'tenar', label: 'Musculatura Tênar', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'hipotenar', label: 'Musculatura Hipotênar', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'neuro_forca',
                title: '4. Avaliação Neurológica (Força Muscular 0-5)',
                type: 'table',
                columns: ['Miótono / Músculo', 'Esquerdo (0-5)', 'Direito (0-5)'],
                rows: [
                    { id: 'c5_biceps', label: 'Flexor de Cotovelo (C5)', fields: ['esquerdo', 'direito'] },
                    { id: 'c6_ext_punho', label: 'Extensor de Punho (C6)', fields: ['esquerdo', 'direito'] },
                    { id: 'c7_triceps', label: 'Extensor de Cotovelo (C7)', fields: ['esquerdo', 'direito'] },
                    { id: 'c8_flex_dedos', label: 'Flexores de Dedos (C8)', fields: ['esquerdo', 'direito'] },
                    { id: 't1_abd_5dedo', label: 'Abdutor do 5º Dedo (T1)', fields: ['esquerdo', 'direito'] }
                ]
            },
            {
                id: 'neuro_reflexos',
                title: '4.1 Avaliação Neurológica (Reflexos)',
                type: 'table',
                columns: ['Reflexo', 'Normal', 'Hiperreflexia', 'Hiporeflexia'],
                rows: [
                    { id: 'bicipital', label: 'Bicipital (C5 e C6)', fields: [{ id: 'normal', type: 'checkbox' }, { id: 'hiper', type: 'checkbox' }, { id: 'hipo', type: 'checkbox' }] },
                    { id: 'tricipital', label: 'Tricipital (C7 e T1)', fields: [{ id: 'normal', type: 'checkbox' }, { id: 'hiper', type: 'checkbox' }, { id: 'hipo', type: 'checkbox' }] },
                    { id: 'estiloradial', label: 'Estiloradial (C6)', fields: [{ id: 'normal', type: 'checkbox' }, { id: 'hiper', type: 'checkbox' }, { id: 'hipo', type: 'checkbox' }] }
                ]
            },
            {
                id: 'neuro_sensitivo',
                title: '4.2 Avaliação Sensitiva (Dermatomas)',
                type: 'table',
                columns: ['Nervo / Região', 'Normal (E)', 'Alterado (E)', 'Normal (D)', 'Alterado (D)'],
                rows: [
                    { id: 'mediano', label: 'Mediano (1º-4º dedos face palmar)', fields: [{ id: 'normal_e', type: 'checkbox' }, { id: 'alt_e', type: 'checkbox' }, { id: 'normal_d', type: 'checkbox' }, { id: 'alt_d', type: 'checkbox' }] },
                    { id: 'ulnar', label: 'Ulnar (5º dedo e borda medial)', fields: [{ id: 'normal_e', type: 'checkbox' }, { id: 'alt_e', type: 'checkbox' }, { id: 'normal_d', type: 'checkbox' }, { id: 'alt_d', type: 'checkbox' }] },
                    { id: 'radial', label: 'Radial (D. radial e face dorsal)', fields: [{ id: 'normal_e', type: 'checkbox' }, { id: 'alt_e', type: 'checkbox' }, { id: 'normal_d', type: 'checkbox' }, { id: 'alt_d', type: 'checkbox' }] }
                ]
            },
            {
                id: 'sensibilidade_monofilamento',
                title: '4.3 Sensibilidade (Teste de Monofilamento)',
                fields: [
                    {
                        id: 'mapa_sensibilidade',
                        type: 'paintmap',
                        image: 'img/mapa_sensibilidade.png',
                        colors: [
                            { hex: '#00FF00', label: 'Verde (Normal)' },
                            { hex: '#0000FF', label: 'Azul (Diminuída)' },
                            { hex: '#8A2BE2', label: 'Violeta (Protetora diminuída)' },
                            { hex: '#8B0000', label: 'Vermelho escuro (Perda protetora)' },
                            { hex: '#FFA500', label: 'Laranja (Perda protetora pé)' },
                            { hex: '#FF00FF', label: 'Magenta / Rosa (Apenas pressão profunda)' },
                            { hex: '#000000', label: 'Preta (Nenhuma resposta)' }
                        ]
                    }
                ]
            },
            {
                id: 'neuro_add',
                title: 'Avaliação Neurológica Adicional',
                fields: [
                    { id: 'observacoes_neuro', label: 'Observações (Sinal de Tinel, parestesias, etc.)', type: 'textarea' }
                ]
            },
            {
                id: 'adm_cotovelo',
                title: '5. Amplitude de Movimento - Cotovelo (Graus)',
                type: 'table',
                columns: ['Movimento', { label: 'Esquerdo (°)', width: '22%' }, { label: 'Direito (°)', width: '22%' }, { label: 'Observações', width: '35%' }],
                rows: [
                    { id: 'flexao_cot', label: 'Flexão', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'extensao_cot', label: 'Extensão', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'pronacao', label: 'Pronação', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'supinacao', label: 'Supinação', fields: ['esquerdo', 'direito', 'observacoes'] }
                ]
            },
            {
                id: 'adm_punho',
                title: '5.1 Amplitude de Movimento - Punho (Graus)',
                type: 'table',
                columns: ['Movimento', { label: 'Esquerdo (°)', width: '22%' }, { label: 'Direito (°)', width: '22%' }, { label: 'Observações', width: '35%' }],
                rows: [
                    { id: 'flexao_pun', label: 'Flexão', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'extensao_pun', label: 'Extensão', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'desv_radial', label: 'Desvio Radial', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'desv_ulnar', label: 'Desvio Ulnar', fields: ['esquerdo', 'direito', 'observacoes'] }
                ]
            },
            {
                id: 'adm_mao',
                title: '5.2 Amplitude de Movimento - Mão e Dedos (Graus)',
                type: 'table',
                columns: ['Articulação / Movimento', { label: 'Esquerdo (°)', width: '22%' }, { label: 'Direito (°)', width: '22%' }, { label: 'Observações', width: '35%' }],
                rows: [
                    { id: 'flex_mcf', label: 'Flexão MCF (dedos)', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'ext_mcf', label: 'Extensão MCF (dedos)', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'flex_ifp', label: 'Flexão IFP', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'flex_ifd', label: 'Flexão IFD', fields: ['esquerdo', 'direito', 'observacoes'] },
                    { id: 'oposicao_polegar', label: 'Oposição do Polegar', fields: ['esquerdo', 'direito', 'observacoes'] }
                ]
            },
            {
                id: 'testes_especiais',
                title: '6. Testes Especiais',
                type: 'table',
                columns: ['Teste', 'Esquerdo (+ / -)', 'Direito (+ / -)'],
                rows: [
                    { id: 'cozen', label: 'Teste de Cozen (Epicondilite Lateral)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'mill', label: 'Teste de Mill (Epicondilite Lateral)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'epicondilite_medial', label: 'Teste Epicondilite Medial (Golfer\'s Elbow)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'valgo_stress', label: 'Teste de Valgo (Ligamento Colateral Medial)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'varo_stress', label: 'Teste de Varo (Ligamento Colateral Lateral)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'phalen', label: 'Teste de Phalen (Túnel do Carpo)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'phalen_inv', label: 'Teste de Phalen Invertido', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'tinel_carpo', label: 'Sinal de Tinel (Túnel do Carpo)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'tinel_cotovelo', label: 'Sinal de Tinel (Cotovelo - N. Ulnar)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'finkelstein', label: 'Teste de Finkelstein (De Quervain)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'allen', label: 'Teste de Allen (Vascularização)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'watson', label: 'Teste de Watson (Instabilidade Escafoide)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'testes_neurais',
                title: '6.1 Teste Neural',
                type: 'table',
                columns: ['Nervo', 'Esquerdo (+ / -)', 'Direito (+ / -)'],
                rows: [
                    { id: 'mediano', label: 'Mediano (ULNT1)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'ulnar', label: 'Ulnar (ULNT4)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'radial', label: 'Radial (ULNT2b)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'forca_preensao',
                title: '7. Força de Preensão e Pinça (kgF)',
                type: 'table',
                columns: ['Teste', { label: 'Esquerdo', width: '22%' }, { label: 'Direito', width: '22%' }, { label: '% Déficit', width: '22%' }],
                rows: [
                    { id: 'preensao_palmar', label: 'Preensão Palmar (Dinamômetro)', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'pinca_polpa', label: 'Pinça Polpa a Polpa', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'pinca_lateral', label: 'Pinça Lateral (Chave)', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'pinca_tripode', label: 'Pinça Trípode (3 dedos)', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] }
                ]
            },
            {
                id: 'diagnostico_conclusoes',
                title: '8 e 9. Diagnóstico e Conclusões',
                fields: [
                    { id: 'diagnostico', label: '8. Diagnóstico Cinético Funcional', type: 'textarea' },
                    { id: 'conclusao', label: '9. Conclusões e Sugestões Terapêuticas', type: 'textarea' }
                ]
            }
        ],
        calculateScore: (data) => {
            const results = {};

            // Cálculo Déficits de Preensão/Pinça
            ['preensao_palmar', 'pinca_polpa', 'pinca_lateral', 'pinca_tripode'].forEach(test => {
                if (data.forca_preensao && data.forca_preensao[test] && data.forca_preensao[test].esquerdo && data.forca_preensao[test].direito) {
                    const e = parseFloat(data.forca_preensao[test].esquerdo);
                    const d = parseFloat(data.forca_preensao[test].direito);
                    if (!isNaN(e) && !isNaN(d) && (e > 0 || d > 0)) {
                        const deficit = Math.abs(((e - d) / Math.max(e, d)) * 100).toFixed(1);
                        results[test] = { deficit: deficit + '%' };
                    }
                }
            });

            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação Funcional de Cotovelo/Mão Finalizada',
                details: results
            };
        }
    },
    af_mmss: {
        id: 'af_mmss',
        type: 'clinical',
        segment: 'ombro',
        title: 'Avaliação Funcional MMSS',
        description: 'Avaliação completa de ombro incluindo CKCUEST, Fadiga e Força Muscular.',
        icon: '<img src="icon_ombro.png" alt="Ombro" style="width:100%; height:100%; object-fit:contain;">',
        sections: [
            {
                id: 'anamnese',
                title: 'Anamnese',
                fields: [
                    { id: 'queixa', label: 'Queixa Principal', type: 'textarea' },
                    { id: 'intensidade_dor', label: 'Intensidade da Dor', type: 'range', min: 0, max: 10, step: 1 },
                    { id: 'area_dor', label: 'Área da Dor (Pinte as áreas afetadas)', type: 'bodyschema', image: 'img/esquema_corpo_inteiro.png' },
                    { id: 'historia', label: 'História Atual e Pregressa', type: 'textarea' },
                    { id: 'exames', label: 'Exames Complementares (RNM, etc.)', type: 'textarea' },
                    { id: 'obs_cervical', label: 'Observações de Coluna Cervical', type: 'textarea' },
                    { id: 'obs_toracica', label: 'Observações de Coluna Torácica', type: 'textarea' }
                ]
            },
            {
                id: 'testes_especiais',
                title: 'Testes Especiais',
                fields: [
                    { id: 'ckcuest', label: 'CKCUEST (Nº de toques)', type: 'number' },
                    { id: 'fadiga_serratil', label: 'Fadiga Serrátil Anterior (segundos)', type: 'number' }
                ]
            },
            {
                id: 'testes_neurais',
                title: 'Teste de Tensão Neural',
                type: 'table',
                columns: ['Nervo', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'ulnt1', label: 'Mediano (ULNT1)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'ulnt2a', label: 'Mediano (ULNT2a)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'ulnt2b', label: 'Radial (ULNT2b)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'ulnt3', label: 'Ulnar (ULNT3)', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'pontos_gatilhos',
                title: 'Pontos Gatilhos / Palpação Miofascial',
                type: 'table',
                columns: ['Músculo', 'Esquerdo', 'Direito'],
                rows: [
                    { id: 'trapezio_sup', label: 'Trapézio Superior', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'deltoide_ant', label: 'Deltoide Anterior', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'deltoide_med', label: 'Deltoide Médio', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'deltoide_post', label: 'Deltoide Posterior', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'peitoral_maior', label: 'Peitoral Maior', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'peitoral_menor', label: 'Peitoral Menor', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'subclavio', label: 'Subclávio', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'grande_dorsal', label: 'Grande Dorsal', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'redondo_menor', label: 'Redondo Menor', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'supra_espinhoso', label: 'Supra Espinhoso', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'infraespinhoso', label: 'Infraespinhoso', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'romboide', label: 'Romboide', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'extensores_tor', label: 'Extensores Torácicos', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'biceps', label: 'Bíceps', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] },
                    { id: 'triceps', label: 'Tríceps', fields: [{ id: 'esquerdo', type: 'checkbox' }, { id: 'direito', type: 'checkbox' }] }
                ]
            },
            {
                id: 'forca_ombro',
                title: 'Força Muscular do Ombro (kgF) - Torque',
                type: 'table',
                columns: ['Movimento', 'Esquerdo', 'Direito', '% Déficit'],
                rows: [
                    { id: 'abd_ombro', label: 'Abdução', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'rl_ombro', label: 'Rotadores Laterais (RL)', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'rm_ombro', label: 'Rotadores Mediais (RM)', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] },
                    { id: 'relacao_rlrm', label: 'Relação RL/RM (%)', fields: ['esquerdo', 'direito', 'deficit'], readonly: ['deficit'] }
                ]
            },
            {
                id: 'cinematica',
                title: 'Cinemática do Ritmo Escápulo-Umeral',
                fields: [
                    { id: 'obs_cinematica', label: 'Observações e Restrições', type: 'textarea' }
                ]
            },
            {
                id: 'proposta',
                title: 'Proposta Terapêutica',
                fields: [
                    { id: 'obs_proposta', label: 'Plano de Tratamento e Metas', type: 'textarea' }
                ]
            },
            {
                id: 'quickdash_integracao',
                title: 'Quick DASH',
                fields: [
                    { id: 'quickdash_busca', label: 'Buscar resposta Quick DASH na base de dados (Ex: ID do paciente)', type: 'text' },
                    { id: 'quickdash_novo', label: 'Preencher novo Questionário Quick DASH', type: 'button', props: "value='Abrir Quick DASH' onclick='window.abrirModalQuickdash && window.abrirModalQuickdash()'" },
                    { id: 'quickdash_score', label: 'Resultado/Score Quick DASH Atual', type: 'text', props: 'readonly placeholder="O score aparecerá automaticamente aqui"' }
                ]
            }
        ],
        calculateScore: (data) => {
            const results = {};

            // Cálculo Déficits de Força
            ['abd_ombro', 'rl_ombro', 'rm_ombro'].forEach(muscle => {
                if (data[muscle] && data[muscle].esquerdo && data[muscle].direito) {
                    const e = parseFloat(data[muscle].esquerdo);
                    const d = parseFloat(data[muscle].direito);
                    const deficit = Math.abs(((e - d) / Math.max(e, d)) * 100).toFixed(1);
                    results[muscle] = { deficit: deficit + '%' };
                }
            });

            // Cálculo Relação RL/RM (Normal: 72-76%)
            ['esquerdo', 'direito'].forEach(side => {
                if (data.rl_ombro?.[side] && data.rm_ombro?.[side]) {
                    const rl = parseFloat(data.rl_ombro[side]);
                    const rm = parseFloat(data.rm_ombro[side]);
                    const ratio = ((rl / rm) * 100).toFixed(1);
                    results.relacao_rlrm = results.relacao_rlrm || {};
                    results.relacao_rlrm[side] = ratio + '%';
                }
            });

            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação de Ombro Finalizada',
                details: results
            };
        }
    },
    af_sensibilidade: {
        id: 'af_sensibilidade',
        title: 'Teste de Sensibilidade',
        segment: 'diversas',
        description: 'Mapeamento dermatômico e avaliação de sensibilidade.',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
        type: 'clinical',
        sections: [
            {
                id: 'dadosClinicos',
                title: 'Informações Clínicas',
                fields: [
                    { id: 'diagnostico', label: 'Diagnóstico Clínico', type: 'textarea' },
                    { id: 'historia', label: 'História da Doença', type: 'textarea' },
                    { id: 'observacoes', label: 'Observações', type: 'textarea' }
                ]
            },
            {
                id: 'testeSensibilidade',
                title: 'Teste de Sensibilidade (Monofilamento)',
                fields: [
                    {
                        id: 'mapa_sensibilidade',
                        type: 'paintmap',
                        image: 'img/mapa_sensibilidade.png',
                        colors: [
                            { hex: '#00FF00', label: 'Verde (Normal)' },
                            { hex: '#0000FF', label: 'Azul (Diminuída)' },
                            { hex: '#8A2BE2', label: 'Violeta (Protetora diminuída)' },
                            { hex: '#8B0000', label: 'Vermelho escuro (Perda protetora)' },
                            { hex: '#FFA500', label: 'Laranja (Perda protetora pé)' },
                            { hex: '#FF00FF', label: 'Magenta / Rosa (Apenas pressão profunda)' },
                            { hex: '#000000', label: 'Preta (Nenhuma resposta)' }
                        ]
                    }
                ]
            }
        ],
        calculateScore: (data) => {
            return {
                score: 'Concluído',
                max: '-',
                unit: '',
                interpretation: 'Avaliação de sensibilidade registrada no mapa.',
                clinicalData: data
            };
        }
    }
};

// Expose questionnairesData globally so app.js can access it
window.questionnairesData = questionnairesData;
