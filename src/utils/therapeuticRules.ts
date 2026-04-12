export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'Fortalecimento' | 'Mobilidade' | 'Manual' | 'Educação';
  type?: 'musculo' | 'vertebra' | 'outro';
}

export interface SuggestionGroup {
  category: string;
  items: Suggestion[];
}

export function getTherapeuticSuggestions(questionnaireId: string, answers: Record<string, any>): SuggestionGroup[] {
  const suggestions: Suggestion[] = [];
  const hasValue = (val: any) => val !== undefined && val !== null && val !== "" && val !== false;

  // -- LOGIC FOR LUMBAR (afLombar) --
  if (questionnaireId === 'afLombar') {
    // 1. ADM (ROM)
    if (parseFloat(answers['flexao_graus']) < 40) {
      suggestions.push({ id: 'adm_l_flex', title: 'Restrição de Flexão Lombar', description: 'Trabalhar mobilidade de flexão e alongamento de cadeia posterior.', category: 'Mobilidade' });
    }
    if (parseFloat(answers['extensao_graus']) < 20) {
      suggestions.push({ id: 'adm_l_ext', title: 'Restrição de Extensão Lombar', description: 'Trabalhar mobilidade de extensão (exercícios tipo McKenzie se indicado).', category: 'Mobilidade' });
    }
    if (parseFloat(answers['incl_esq_graus']) < 15 || parseFloat(answers['incl_dir_graus']) < 15) {
      suggestions.push({ id: 'adm_l_incl', title: 'Restrição de Inclinação Lombar', description: 'Melhorar mobilidade lateral e flexibilidade de quadrado lombar.', category: 'Mobilidade' });
    }

    // 2. Endurance
    if (answers['sorensen_res'] === 'Reduzido') {
      suggestions.push({ id: 'lombar_extensores', title: 'Fortalecimento de Cadeia Posterior', description: 'Focar em resistência de extensores de tronco.', category: 'Fortalecimento' });
    }
    if (answers['flexao_60_res'] === 'Reduzido') {
      suggestions.push({ id: 'lombar_flexores', title: 'Fortalecimento de Cadeia Anterior', description: 'Focar em estabilização de core anterior.', category: 'Fortalecimento' });
    }

    // 3. Neural Tension
    if (hasValue(answers['tensao_lasegue_esq']) || hasValue(answers['tensao_lasegue_dir'])) {
      suggestions.push({ id: 'neuro_isquiatico', title: 'Mobilização Neural (Isquiático/Lasegue)', description: 'Técnicas de deslizamento para nervo isquiático.', category: 'Mobilidade' });
    }
    if (hasValue(answers['tensao_slump_esq']) || hasValue(answers['tensao_slump_dir'])) {
      suggestions.push({ id: 'neuro_slump', title: 'Mobilização Neural (Eixo Neural)', description: 'Tratamento de mecânico-sensibilidade do sistema nervoso.', category: 'Mobilidade' });
    }
    if (hasValue(answers['tensao_femoral_esq']) || hasValue(answers['tensao_femoral_dir'])) {
      suggestions.push({ id: 'neuro_femoral', title: 'Mobilização Neural (Femoral)', description: 'Técnicas de deslizamento para nervo femoral.', category: 'Mobilidade' });
    }

    // 4. Trigger Points (Miofascial)
    const mioFields: Record<string, string> = {
      'mio_quadrado_lombar': 'Quadrado Lombar',
      'mio_gluteo_maximo': 'Glúteo Máximo',
      'mio_gluteo_medio': 'Glúteo Médio',
      'mio_gluteo_minimo': 'Glúteo Mínimo',
      'mio_piriforme': 'Piriforme',
      'mio_tfl': 'Tensor da Fáscia Lata',
      'mio_iliopsoas': 'Iliopsoas'
    };

    Object.keys(mioFields).forEach(key => {
      if (hasValue(answers[`${key}_esq`]) || hasValue(answers[`${key}_dir`])) {
        const side = (hasValue(answers[`${key}_esq`]) && hasValue(answers[`${key}_dir`])) ? '(Bilateral)' : hasValue(answers[`${key}_esq`]) ? '(Esq)' : '(Dir)';
        suggestions.push({
          id: `tp_${key}`,
          title: mioFields[key],
          description: side,
          category: 'Manual',
          type: 'musculo'
        });
      }
    });

    // 5. Irritability (Vertebral Levels)
    const levels = ['t7', 't8', 't9', 't10', 't11', 't12', 'l1', 'l2', 'l3', 'l4', 'l5', 'sacro'];
    levels.forEach(lvl => {
      if (hasValue(answers[`palp_${lvl}_dor`])) {
        suggestions.push({
          id: `irr_l_${lvl}`,
          title: lvl.toUpperCase(),
          description: 'Sensibilidade detectada',
          category: 'Manual',
          type: 'vertebra'
        });
      }
    });
  }

  // -- LOGIC FOR CERVICAL (afCervical) --
  if (questionnaireId === 'afCervical') {
    // 1. ADM
    if (parseFloat(answers['flexao_graus']) < 50) {
      suggestions.push({ id: 'adm_c_flex', title: 'Restrição de Flexão Cervical', description: 'Trabalhar mobilidade de flexão crânio-cervical.', category: 'Mobilidade' });
    }
    if (parseFloat(answers['extensao_graus']) < 50) {
      suggestions.push({ id: 'adm_c_ext', title: 'Restrição de Extensão Cervical', description: 'Trabalhar mobilidade segmentar de extensão.', category: 'Mobilidade' });
    }
    if (parseFloat(answers['rot_esq_graus']) < 70 || parseFloat(answers['rot_dir_graus']) < 70) {
      suggestions.push({ id: 'adm_c_rot', title: 'Restrição de Rotação Cervical', description: 'Melhorar mobilidade rotacional (C1-C2 focus).', category: 'Mobilidade' });
    }

    // 2. Endurance
    if (answers['resist_flexora_res'] === 'Reduzido') {
      suggestions.push({ id: 'cervical_flexores', title: 'Resistência de Flexores Profundos', description: 'Exercícios de flexão crânio-cervical.', category: 'Fortalecimento' });
    }
    if (answers['resist_extensora_res'] === 'Reduzido') {
      suggestions.push({ id: 'cervical_extensores', title: 'Estabilidade Extensora', description: 'Treino de extensores profundos.', category: 'Fortalecimento' });
    }

    // 3. Neural Tension (ULNT)
    if (hasValue(answers['tensao_mediano_esq']) || hasValue(answers['tensao_mediano_dir'])) {
      suggestions.push({ id: 'neuro_mediano', title: 'Mobilização Neural (Mediano)', description: 'Deslizamento neural para membro superior (ULNT1).', category: 'Mobilidade' });
    }
    if (hasValue(answers['tensao_ulnar_esq']) || hasValue(answers['tensao_ulnar_dir'])) {
      suggestions.push({ id: 'neuro_ulnar', title: 'Mobilização Neural (Ulnar)', description: 'Deslizamento neural para membro superior (ULNT3).', category: 'Mobilidade' });
    }
    if (hasValue(answers['tensao_radial_esq']) || hasValue(answers['tensao_radial_dir'])) {
      suggestions.push({ id: 'neuro_radial', title: 'Mobilização Neural (Radial)', description: 'Deslizamento neural para membro superior (ULNT2).', category: 'Mobilidade' });
    }

    // 4. Trigger Points (Miofascial)
    const mioFieldsC: Record<string, string> = {
      'mio_suboccipitais': 'Suboccipitais',
      'mio_esplenios': 'Esplênios',
      'mio_escalenos': 'Escalenos',
      'mio_ecom': 'ECOM',
      'mio_trapezio': 'Trapézio Superior',
      'mio_lev_escapula': 'Elevador da Escápula',
      'mio_romboides': 'Romboides',
      'mio_peitorais': 'Peitorais'
    };

    Object.keys(mioFieldsC).forEach(key => {
      if (hasValue(answers[`${key}_esq`]) || hasValue(answers[`${key}_dir`])) {
        const side = (hasValue(answers[`${key}_esq`]) && hasValue(answers[`${key}_dir`])) ? '(Bilateral)' : hasValue(answers[`${key}_esq`]) ? '(Esq)' : '(Dir)';
        suggestions.push({
          id: `tp_c_${key}`,
          title: mioFieldsC[key],
          description: side,
          category: 'Manual',
          type: 'musculo'
        });
      }
    });

    // 5. Irritability (Vertebral Levels)
    const cLevels = ['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 't1', 't2', 't3', 't4', 't5', 't6', 't7'];
    cLevels.forEach(lvl => {
      if (hasValue(answers[`palp_${lvl}_dor`])) {
        suggestions.push({
          id: `irr_c_${lvl}`,
          title: lvl.toUpperCase(),
          description: 'Sensibilidade detectada',
          category: 'Manual',
          type: 'vertebra'
        });
      }
    });
  }

  // -- LOGIC FOR GERIATRICS (afGeriatria) --
  // 2. Gait
  const vel = parseFloat(String(answers['vel_marcha'] || '1').replace(',', '.'));
  if (vel > 0 && vel < 0.8) {
    suggestions.push({ 
      id: 'ger_gait', 
      title: 'Treino de Marcha e Velocidade', 
      description: 'Trabalhar cadência e comprimento do passo para aumentar velocidade funcional.', 
      category: 'Mobilidade' 
    });
  }

  // Group by category
  const groups: Record<string, Suggestion[]> = {};
  suggestions.forEach(s => {
    if (!groups[s.category]) groups[s.category] = [];
    groups[s.category].push(s);
  });

  return Object.keys(groups).map(category => ({ category, items: groups[category] }));
}

export function generateTherapeuticText(questionnaireId: string, answers: Record<string, any>): string {
  const groups = getTherapeuticSuggestions(questionnaireId, answers);
  if (groups.length === 0) return "Sugerimos focar na manutenção da funcionalidade geral e educação do paciente.";

  let text = "SUGESTÕES TERAPÊUTICAS:\n\n";

  groups.forEach(group => {
    text += `${group.category.toUpperCase()}\n`;
    
    // Group muscles and vertebrae for better presentation
    const muscles = group.items.filter(i => i.type === 'musculo');
    const vertebrae = group.items.filter(i => i.type === 'vertebra');
    const others = group.items.filter(i => !i.type || i.type === 'outro');

    if (muscles.length > 0) {
      const muscleList = muscles.map(m => `${m.title} ${m.description}`).join(', ');
      text += `• Liberação manual da musculatura: ${muscleList}\n`;
    }

    if (vertebrae.length > 0) {
      const levelList = vertebrae.map(v => v.title).join(', ');
      text += `• Mobilização manual dos níveis: ${levelList}\n`;
    }

    others.forEach(item => {
      text += `• ${item.title}: ${item.description}\n`;
    });
    
    text += "\n";
  });

  return text.trim();
}

/**
 * Generates a Kinetic-Functional Diagnosis based on abnormalities found in the assessment.
 */
export function generateDiagnosticText(questionnaireId: string, answers: Record<string, any>): string {
  const findings: string[] = [];
  const hasValue = (val: any) => val !== undefined && val !== null && val !== "" && val !== false;

  // 1. Pain (EVA)
  if (answers['intensidade_dor'] && parseInt(answers['intensidade_dor']) > 0) {
    findings.push(`Presença de quadro álgico local/referido (EVA ${answers['intensidade_dor']}/10)`);
  }

  // 2. ROM (ADM)
  const romFindings: string[] = [];
  if (questionnaireId === 'afLombar') {
    if (parseFloat(answers['flexao_graus']) < 40) romFindings.push('Flexão');
    if (parseFloat(answers['extensao_graus']) < 20) romFindings.push('Extensão');
    if (parseFloat(answers['incl_esq_graus']) < 15 || parseFloat(answers['incl_dir_graus']) < 15) romFindings.push('Inclinação');
  } else if (questionnaireId === 'afCervical') {
    if (parseFloat(answers['flexao_graus']) < 50) romFindings.push('Flexão');
    if (parseFloat(answers['extensao_graus']) < 50) romFindings.push('Extensão');
    if (parseFloat(answers['rot_esq_graus']) < 70 || parseFloat(answers['rot_dir_graus']) < 70) romFindings.push('Rotação');
  }
  if (romFindings.length > 0) {
    findings.push(`Limitação da amplitude de movimento (ADM) de: ${romFindings.join(', ')}`);
  }

  // 2.1 Myelopathy Screen (New)
  const specialTestsFields = [
    'hoffmann_esq', 'hoffmann_dir', 'babinski_esq', 'babinski_dir', 'clonus_esq', 'clonus_dir',
    'hoffmann_esq_l', 'hoffmann_dir_l', 'babinski_esq_l', 'babinski_dir_l', 'clonus_esq_l', 'clonus_dir_l'
  ];
  const hasPositiveSpecialTest = specialTestsFields.some(field => answers[field] === true);
  if (hasPositiveSpecialTest) {
    findings.push("Sugerido investigação de mielopatia cervical.");
  }

  // 2.2 Cauda Equina Screen (New)
  const caudaEquinaFields = ['cauda_esfincter_pos', 'cauda_mmii_pos', 'cauda_perineo_pos'];
  const hasCaudaEquinaSign = caudaEquinaFields.some(field => answers[field] === true);
  if (hasCaudaEquinaSign) {
    findings.push("Sinais sugestivos de Síndrome da Cauda Equina. Encaminhamento de EMERGÊNCIA.");
  }

  // 3. Endurance
  const enduranceFindings: string[] = [];
  if (answers['sorensen_res'] === 'Reduzido' || answers['resist_extensora_res'] === 'Reduzido') enduranceFindings.push('Extensores');
  if (answers['flexao_60_res'] === 'Reduzido' || answers['resist_flexora_res'] === 'Reduzido') enduranceFindings.push('Flexores');
  if (enduranceFindings.length > 0) {
    findings.push(`Redução da resistência muscular de: ${enduranceFindings.join(', ')}`);
  }

  // 4. Neural Tension
  const neuroFindings: string[] = [];
  if (hasValue(answers['tensao_mediano_esq']) || hasValue(answers['tensao_mediano_dir'])) neuroFindings.push('N. Mediano');
  if (hasValue(answers['tensao_ulnar_esq']) || hasValue(answers['tensao_ulnar_dir'])) neuroFindings.push('N. Ulnar');
  if (hasValue(answers['tensao_radial_esq']) || hasValue(answers['tensao_radial_dir'])) neuroFindings.push('N. Radial');
  if (hasValue(answers['tensao_lasegue_esq']) || hasValue(answers['tensao_lasegue_dir'])) neuroFindings.push('N. Isquiático (Lasegue)');
  if (hasValue(answers['tensao_slump_esq']) || hasValue(answers['tensao_slump_dir'])) neuroFindings.push('Eixo Neural (Slump)');
  if (hasValue(answers['tensao_femoral_esq']) || hasValue(answers['tensao_femoral_dir'])) neuroFindings.push('N. Femoral');
  
  if (neuroFindings.length > 0) {
    findings.push(`Alteração da neurodinâmica / Irritabilidade neural: ${neuroFindings.join(', ')}`);
  }

  // 5. Myofascial / Trigger Points
  const muscles: string[] = [];
  const mioList = questionnaireId === 'afLombar' 
    ? ['mio_quadrado_lombar', 'mio_gluteo_maximo', 'mio_gluteo_medio', 'mio_gluteo_minimo', 'mio_piriforme', 'mio_tfl', 'mio_iliopsoas']
    : ['mio_suboccipitais', 'mio_esplenios', 'mio_escalenos', 'mio_ecom', 'mio_trapezio', 'mio_lev_escapula', 'mio_romboides', 'mio_peitorais'];
  
  const muscleNames: Record<string, string> = {
    'mio_quadrado_lombar': 'Quadrado Lombar', 'mio_gluteo_maximo': 'Glúteo Máximo', 'mio_gluteo_medio': 'Glúteo Médio',
    'mio_gluteo_minimo': 'Glúteo Mínimo', 'mio_piriforme': 'Piriforme', 'mio_tfl': 'Tensor da Fáscia Lata',
    'mio_iliopsoas': 'Iliopsoas', 'mio_suboccipitais': 'Suboccipitais', 'mio_esplenios': 'Esplênios',
    'mio_escalenos': 'Escalenos', 'mio_ecom': 'ECOM', 'mio_trapezio': 'Trapézio Superior',
    'mio_lev_escapula': 'Elevador da Escápula', 'mio_romboides': 'Romboides', 'mio_peitorais': 'Peitorais'
  };

  mioList.forEach(key => {
    if (hasValue(answers[`${key}_esq`]) || hasValue(answers[`${key}_dir`])) {
      muscles.push(muscleNames[key]);
    }
  });
  if (muscles.length > 0) {
    findings.push(`Presença de pontos gatilhos miofasciais em: ${muscles.join(', ')}`);
  }

  // 6. Irritability / Vertebrae
  const vertebrae: string[] = [];
  const vList = questionnaireId === 'afLombar'
    ? ['t7', 't8', 't9', 't10', 't11', 't12', 'l1', 'l2', 'l3', 'l4', 'l5', 'sacro']
    : ['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 't1', 't2', 't3', 't4', 't5', 't6', 't7'];
  
  vList.forEach(lvl => {
    if (hasValue(answers[`palp_${lvl}_dor`])) {
      vertebrae.push(lvl.toUpperCase());
    }
  });
  if (vertebrae.length > 0) {
    findings.push(`Disfunção segmentar / Irritabilidade vertebral nos níveis: ${vertebrae.join(', ')}`);
  }

  // 7. Muscle Strength (New)
  const strengthDeficits: string[] = [];
  Object.entries(answers).forEach(([key, val]) => {
    if (key.startsWith('forca_') && hasValue(val) && parseInt(val) < 5) {
      const label = key.replace('forca_', '').replace('_esq', ' (Esq)').replace('_dir', ' (Dir)').toUpperCase();
      strengthDeficits.push(`${label}: Grau ${val}/5`);
    }
  });
  if (strengthDeficits.length > 0) {
    findings.push(`Déficit de força muscular (Miótomos): ${strengthDeficits.join(', ')}`);
  }

  // 8. Reflexes / Hyperreflexia (New)
  const hyperReflexes: string[] = [];
  Object.entries(answers).forEach(([key, val]) => {
    if (key.startsWith('ref_') && val === 'Hiperreflexia') {
      const label = key.replace('ref_', '').replace('_esq', ' (Esq)').replace('_dir', ' (Dir)').toUpperCase();
      hyperReflexes.push(label);
    }
  });
  if (hyperReflexes.length > 0) {
    findings.push(`Presença de HIPERREFLEXIA (${hyperReflexes.join(', ')}). Sugere-se realizar Testes Especiais para sinais de liberação piramidal.`);
  }

  if (findings.length === 0) return "DIAGNÓSTICO CINÉTICO FUNCIONAL:\n\n• Quadro de estabilidade e funcionalidade dentro dos padrões de normalidade.";

  return "DIAGNÓSTICO CINÉTICO FUNCIONAL:\n\n• " + findings.join('\n• ');
}
