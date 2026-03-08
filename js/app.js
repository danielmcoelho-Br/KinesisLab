// State Management
const state = {
    currentView: 'view-home',
    selectedSegment: null,
    currentQuestionnaire: null,
    patientInfo: null,
    patientId: null,
    isQuickAssessment: false,
    answers: {},
    currentQuestionIndex: 0
};

// DOM Elements
const views = {
    'view-login': document.getElementById('view-login'),
    'view-admin': document.getElementById('view-admin'),
    'view-home': document.getElementById('view-home'),
    'view-patient-dashboard': document.getElementById('view-patient-dashboard'),
    'view-segments': document.getElementById('view-segments'),
    'view-dashboard': document.getElementById('view-dashboard'),
    'view-patient-info': document.getElementById('view-patient-info'),
    'view-questionnaire': document.getElementById('view-questionnaire'),
    'view-results': document.getElementById('view-results')
};

const btnHome = document.getElementById('btn-home');
const questionnaireList = document.getElementById('questionnaire-list');
const patientForm = document.getElementById('patient-form');

// Initialize the application
async function initApp() {
    // Check Authentication state before proceeding
    state.session = await window.db.getSession();

    if (!state.session) {
        // Not logged in -> Show login view and hide menu
        document.getElementById('main-header').style.display = 'none';
        navigateTo('view-login');
    } else {
        // Logged in
        document.getElementById('main-header').style.display = 'block';
        const profile = await window.db.getUserProfile(state.session.user.id);
        if (profile) {
            state.userProfile = profile;
            document.getElementById('user-greeting').innerText = `Olá, ${profile.name || 'Usuário'}`;
            if (profile.role === 'admin') {
                document.getElementById('btn-admin-panel').classList.remove('hidden');
            } else {
                document.getElementById('btn-admin-panel').classList.add('hidden');
            }
        }
        navigateTo('view-home');
        loadRecentPatients();
    }

    // Set today's date automatically in the form
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('patient-date').value = today;

    // Check for URL parameters to prepopulate patient data
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('name')) {
        document.getElementById('patient-name').value = urlParams.get('name') || '';
        document.getElementById('patient-age').value = urlParams.get('age') || '';
        document.getElementById('patient-gender').value = urlParams.get('gender') || '';
        if (urlParams.get('date')) {
            document.getElementById('patient-date').value = urlParams.get('date');
        }

        // Auto select segment if requested
        const targetQString = urlParams.get('questionnaire');
        if (targetQString) {
            const found = Object.values(questionnairesData).find(q => q.id === targetQString);
            if (found) {
                state.selectedSegment = found.segment;
                state.currentQuestionnaire = found; // CRITICAL FIX: State must be populated
                // Auto submit patient form and start questionnaire
                setTimeout(() => {
                    patientForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

                    // Clean up URL to prevent reload loops
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 500);
            }
        }
    }

    // Listen for NDI result synchronization from other tabs 
    window.addEventListener('storage', (e) => {
        if (e.key === 'ndi_sync_result' && e.newValue) {
            const scoreField = document.querySelector('input[data-field="ndi_score"]');
            if (scoreField) {
                scoreField.style.transition = 'background-color 0.5s';
                scoreField.style.backgroundColor = '#e6ffe6';
                scoreField.value = e.newValue + ' (Sync✓)';
                scoreField.dispatchEvent(new Event('change'));
                setTimeout(() => { scoreField.style.backgroundColor = ''; }, 2000);
            }
            localStorage.removeItem('ndi_sync_result');
        }

        if (e.key === 'oswestry_sync_result' && e.newValue) {
            const scoreField = document.querySelector('input[data-field="oswestry_score"]');
            if (scoreField) {
                scoreField.style.transition = 'background-color 0.5s';
                scoreField.style.backgroundColor = '#e6ffe6';
                scoreField.value = e.newValue + ' (Sync✓)';
                scoreField.dispatchEvent(new Event('change'));
                setTimeout(() => { scoreField.style.backgroundColor = ''; }, 2000);
            }
            localStorage.removeItem('oswestry_sync_result');
        }

        const syncKeys = [
            'quickdash', 'lysholm', 'womac', 'ikdc', 'aofas', 'man', 'ves13', 'lbpq', 'brief'
        ];

        syncKeys.forEach(key => {
            if (e.key === `${key}_sync_result` && e.newValue) {
                const scoreField = document.querySelector(`input[data-field="${key}_score"]`);
                if (scoreField) {
                    scoreField.style.transition = 'background-color 0.5s';
                    scoreField.style.backgroundColor = '#e6ffe6';
                    scoreField.value = e.newValue + ' (Sync✓)';
                    scoreField.dispatchEvent(new Event('change'));
                    setTimeout(() => { scoreField.style.backgroundColor = ''; }, 2000);
                }
                localStorage.removeItem(`${key}_sync_result`);
            }
        });
    });

    // Event Listeners
    btnHome.addEventListener('click', () => {
        state.selectedSegment = null;
        state.patientId = null;
        state.patientInfo = null;
        state.isQuickAssessment = false;
        navigateTo('view-home');
        loadRecentPatients(); // Function to be implemented
    });

    patientForm.addEventListener('submit', handlePatientFormSubmit);

    // New Home Screen Interactions
    const btnNewPatient = document.getElementById('btn-new-patient');
    if (btnNewPatient) {
        btnNewPatient.addEventListener('click', () => {
            state.patientInfo = null;
            state.patientId = null;
            state.isQuickAssessment = false;
            document.getElementById('patient-form').reset();

            // Set today's date automatically in the form
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('patient-date').value = today;

            navigateTo('view-patient-info');
        });
    }

    const btnQuickAssesment = document.getElementById('btn-quick-assessment');
    if (btnQuickAssesment) {
        btnQuickAssesment.addEventListener('click', () => {
            // For Quick Assessments, skip registration entirely.
            state.patientInfo = {
                name: "Avaliação Rápida (Não Salva)",
                age: 30, // Default placeholders useful for conditional equations
                gender: "Masculino",
                dominance: "Destro",
                date: new Date().toISOString().split('T')[0]
            };
            state.patientId = null;
            state.isQuickAssessment = true;
            navigateTo('view-segments');
        });
    }

    const searchInput = document.getElementById('patient-search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                loadRecentPatients(e.target.value);
            }, 300);
        });
    }

    // Auth Event Listeners
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-login');
            const errorDiv = document.getElementById('login-error');
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            btn.innerHTML = 'Carregando...';
            btn.disabled = true;
            errorDiv.style.display = 'none';

            try {
                await window.db.login(email, password);
                // Restart app logic to fetch profile and load view-home
                initApp();
            } catch (err) {
                console.error(err);
                errorDiv.innerText = 'Email ou senha incorretos.';
                errorDiv.style.display = 'block';
            } finally {
                btn.innerHTML = 'Entrar na Plataforma';
                btn.disabled = false;
            }
        });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            await window.db.logout();
            state.session = null;
            state.userProfile = null;
            document.getElementById('main-header').style.display = 'none';
            navigateTo('view-login');
        });
    }

    const btnAdminPanel = document.getElementById('btn-admin-panel');
    if (btnAdminPanel) {
        btnAdminPanel.addEventListener('click', () => {
            navigateTo('view-admin');
            loadAdminUsers();
        });
    }

    const adminCreateUserForm = document.getElementById('admin-create-user-form');
    if (adminCreateUserForm) {
        adminCreateUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('btn-submit-new-user');
            const errorDiv = document.getElementById('admin-error');
            const successDiv = document.getElementById('admin-success');

            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            const name = document.getElementById('new-user-name').value;
            const email = document.getElementById('new-user-email').value;
            const password = document.getElementById('new-user-password').value;
            const role = document.getElementById('new-user-role').value;

            btn.disabled = true;
            btn.innerHTML = 'Processando...';

            try {
                await window.db.createUser(email, password, name, role);
                successDiv.innerText = `Usuário ${name} criado com sucesso! As credenciais já podem ser enviadas ao profissional.`;
                successDiv.style.display = 'block';
                adminCreateUserForm.reset();
                loadAdminUsers(); // Refresh the table
            } catch (err) {
                console.error(err);
                errorDiv.innerText = 'Falha ao criar usuário. Tente novamente.';
                errorDiv.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.5rem"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> Criar Usuário';
            }
        });
    }

}

// --- Admin Logic ---
async function loadAdminUsers() {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Carregando usuários...</td></tr>';

    try {
        const users = await window.db.getAllUsers();
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">Nenhum usuário encontrado.</td></tr>';
            return;
        }

        let html = '';
        users.forEach(u => {
            const roleClass = u.role === 'admin' ? 'role-admin' : 'role-user';
            const roleLabel = u.role === 'admin' ? 'Admin' : 'Usuário';
            html += `
                <tr>
                    <td style="font-weight: 500; color: var(--text-main);">${u.name}</td>
                    <td><span class="role-badge ${roleClass}">${roleLabel}</span></td>
                    <td style="font-family: monospace; color: var(--text-muted); font-size: 0.85rem;">${u.id}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--primary-red);">Erro ao carregar lista de usuários.</td></tr>';
    }
}

// --- DB Logic & Patient Home View Render ---
async function loadRecentPatients(query = '') {
    const listContainer = document.getElementById('patient-list');
    if (!listContainer) return;

    try {
        listContainer.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 2rem;">Buscando...</div>';

        // Use db from db.js
        const patients = await window.db.getPatients(query);

        if (patients.length === 0) {
            listContainer.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 2rem;">Nenhum paciente encontrado. Tente outro nome ou cadastre um Novo Paciente.</div>';
            return;
        }

        let html = '';
        patients.forEach(p => {
            // Format date nicely
            const dateObj = new Date(p.created_at);
            const formattedDate = dateObj.toLocaleDateString('pt-BR');
            html += `
                <div class="patient-list-item" onclick="openPatientDashboard('${p.id}')">
                    <div class="patient-list-info">
                        <h4>${p.name}</h4>
                        <p>${p.age} anos | ${p.gender} | Criado em ${formattedDate}</p>
                    </div>
                    <div>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </div>
                </div>
            `;
        });
        listContainer.innerHTML = html;

        // Temporarily save loaded patients in a local dictionary so we don't have to fetch the name again on click
        window._loadedPatientsMap = patients.reduce((acc, curr) => {
            acc[curr.id] = curr;
            return acc;
        }, {});

    } catch (e) {
        listContainer.innerHTML = '<div style="text-align: center; color: var(--primary-red); padding: 2rem;">Ocorreu um erro ao conectar com o servidor. Verifique sua conexão.</div>';
    }
}

window.openPatientDashboard = async function (patientId) {
    state.patientId = patientId;

    // Find patient from our temporary cache to display the header info quickly
    const patientData = window._loadedPatientsMap ? window._loadedPatientsMap[patientId] : null;

    if (patientData) {
        state.patientInfo = {
            name: patientData.name,
            age: patientData.age,
            gender: patientData.gender,
            dominance: patientData.dominance,
            activityLevel: patientData.activity_level,
            date: new Date().toISOString().split('T')[0] // Set today's date for any NEW assessments
        };

        const dateObj = new Date(patientData.created_at);
        document.getElementById('pd-patient-name').textContent = patientData.name;
        document.getElementById('pd-patient-details').textContent = `${patientData.age} anos | ${patientData.gender} | ${patientData.dominance || 'N/A'}`;
    }

    navigateTo('view-patient-dashboard');

    const listContainer = document.getElementById('pd-assessment-list');
    listContainer.innerHTML = '<div style="text-align: center; color: #94a3b8; padding: 1rem;">Carregando histórico...</div>';

    try {
        const assessments = await window.db.getPatientAssessments(patientId);

        // Check if the current user is admin to show delete buttons
        const isAdmin = state.userProfile && state.userProfile.role === 'admin';

        if (assessments.length === 0) {
            listContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); padding: 1rem;">Nenhuma avaliação cadastrada para este paciente.</p>';
        } else {
            let html = '';
            // Temporarily save assessments to global map to reconstruct them on click
            window._loadedAssessmentsMap = {};

            assessments.forEach(a => {
                window._loadedAssessmentsMap[a.id] = a;
                const d = new Date(a.created_at);
                const strDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d);

                // Get human readable title of the evaluation
                let title = a.assessment_type;
                if (window.questionnairesData && window.questionnairesData[a.assessment_type]) {
                    title = window.questionnairesData[a.assessment_type].title;
                }

                const deleteBtn = isAdmin ? `
                    <button onclick="event.stopPropagation(); adminDeleteAssessment('${a.id}')" 
                        style="margin-top:0.5rem; background: none; border: 1px solid var(--primary-red); color: var(--primary-red); 
                               border-radius: 6px; padding: 2px 10px; font-size: 0.75rem; cursor: pointer;">
                        🗑 Excluir Avaliação
                    </button>` : '';

                html += `
                    <div class="assessment-card" onclick="viewHistoricalAssessment('${a.id}')">
                        <div class="assessment-card-header">
                            <span class="assessment-card-title">${title}</span>
                            <span class="assessment-card-date">${strDate}</span>
                        </div>
                        <span class="assessment-card-segment">${a.segment}</span>
                        ${deleteBtn}
                    </div>
                `;
            });
            listContainer.innerHTML = html;
        }

        // Admin: show delete patient button in header
        const pdHeader = document.getElementById('pd-patient-name');
        if (isAdmin && pdHeader) {
            const existingDelBtn = document.getElementById('admin-delete-patient-btn');
            if (!existingDelBtn) {
                const delPatientBtn = document.createElement('button');
                delPatientBtn.id = 'admin-delete-patient-btn';
                delPatientBtn.textContent = '🗑 Excluir Paciente';
                delPatientBtn.style.cssText = 'margin-left: 1rem; background: none; border: 1px solid var(--primary-red); color: var(--primary-red); border-radius: 6px; padding: 4px 12px; font-size: 0.8rem; cursor: pointer;';
                delPatientBtn.onclick = () => adminDeletePatient(patientId);
                pdHeader.parentNode.appendChild(delPatientBtn);
            }
        }

    } catch (e) {
        console.error(e);
        listContainer.innerHTML = '<div style="text-align: center; color: var(--primary-red); padding: 1rem;">Erro ao carregar histórico.</div>';
    }

    // Wire the "New Assessment" button inside the dashboard
    const btnNewAssesmentDash = document.getElementById('btn-new-assessment-for-patient');
    if (btnNewAssesmentDash) {
        // Remove old listeners to avoid multiple fires
        const newBtn = btnNewAssesmentDash.cloneNode(true);
        btnNewAssesmentDash.parentNode.replaceChild(newBtn, btnNewAssesmentDash);

        newBtn.addEventListener('click', () => {
            state.isQuickAssessment = false;
            navigateTo('view-segments');
        });
    }
};

// Admin delete functions
window.adminDeleteAssessment = async function (assessmentId) {
    if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação é irreversível.')) return;
    try {
        await window.db.deleteAssessment(assessmentId);
        // Remove from local map
        if (window._loadedAssessmentsMap) delete window._loadedAssessmentsMap[assessmentId];
        // Refresh the dashboard
        openPatientDashboard(state.patientId);
    } catch (err) {
        alert('Erro ao excluir avaliação: ' + err.message);
    }
};

window.adminDeletePatient = async function (patientId) {
    if (!confirm('Tem certeza que deseja excluir este paciente e TODAS as suas avaliações? Esta ação é irreversível.')) return;
    try {
        await window.db.deletePatient(patientId);
        state.patientId = null;
        state.patientInfo = null;
        navigateTo('view-home');
        loadRecentPatients();
        alert('Paciente excluído com sucesso.');
    } catch (err) {
        alert('Erro ao excluir paciente: ' + err.message);
    }
};

window.viewHistoricalAssessment = function (assessmentId) {
    const a = window._loadedAssessmentsMap ? window._loadedAssessmentsMap[assessmentId] : null;
    if (!a) return alert("Erro ao recuperar avaliação da memória local.");

    // Find the original questionnaire template
    let qTemplate = null;
    if (window.questionnairesData && window.questionnairesData[a.assessment_type]) {
        qTemplate = window.questionnairesData[a.assessment_type];
    }

    if (!qTemplate) return alert("Erro crítico: Template do questionário não encontrado no código fonte atual.");

    // Overwrite the current evaluation session state with the historical data
    state.currentQuestionnaire = qTemplate;
    state.selectedSegment = a.segment;
    state.clinicalData = a.clinical_data || {};
    state.answers = a.questionnaire_answers || {};

    // Fake the 'patientInfo' date to be the historical date so it prints correctly on the PDF
    const safePatientInfo = { ...state.patientInfo };
    safePatientInfo.date = a.created_at;
    state.patientInfo = safePatientInfo;

    // Force a re-calculation since we don't store the final HTML output, just the raw answers
    // By artificially calling `finishQuestionnaire` we push the raw data back through the engine
    // However, finishQuestionnaire pushes to DB. We must circumvent that.

    recompileHistoricalResults(qTemplate);
};

// Isolated function to compile results without triggering DB saves
function recompileHistoricalResults(q) {
    try {
        const actualAnswers = {};
        const qaPairs = [];
        let answerCount = 0;
        const collectedBodySchemas = [];

        // Ensure patientInfo exists (needed by renderResults)
        if (!state.patientInfo) {
            state.patientInfo = { name: 'Paciente', age: '-', gender: '-', date: new Date().toISOString() };
        }

        // Reparse Answer arrays
        if (q.questions) {
            q.questions.forEach((question, index) => {
                if (!question.isInstruction && state.answers[index] !== undefined) {
                    const value = state.answers[index];
                    actualAnswers[answerCount] = value;
                    answerCount++;

                    const selectedOption = question.options ? question.options.find(opt => opt.value === value) : null;
                    let displayVal = selectedOption ? selectedOption.label : String(value);
                    if (typeof value === 'boolean') displayVal = value ? 'Positivo' : 'Negativo';

                    qaPairs.push({ question: question.text, answer: displayVal });
                }
            });
        }

        // Reparse Clinical Form Logic
        if (q.type === 'clinical' && q.sections) {
            q.sections.forEach(section => {
                const sectionData = state.clinicalData[section.id];
                if (!sectionData) return;

                if (section.fields) {
                    section.fields.forEach(field => {
                        const val = sectionData[field.id];
                        if (field.type === 'bodyschema' || field.type === 'paintmap') {
                            collectedBodySchemas.push({
                                title: field.label,
                                image: field.image,
                                dataUrl: sectionData[field.id],
                                history: sectionData[field.id + '_history'] || []
                            });
                        } else if (val !== undefined && val !== null && val !== '' && field.type !== 'bodyschema' && field.type !== 'paintmap' && field.id !== 'intensidade_dor') {
                            qaPairs.push({ section: section.title, question: field.label, answer: val });
                        }
                    });
                }

                if (section.rows) {
                    if (section.id.includes('miofascial')) {
                        const leftMuscles = [];
                        const rightMuscles = [];
                        section.rows.forEach(row => {
                            const rowData = sectionData[row.id];
                            if (rowData) {
                                if (rowData.esquerdo) leftMuscles.push(row.label);
                                if (rowData.direito) rightMuscles.push(row.label);
                            }
                        });
                        if (leftMuscles.length > 0 || rightMuscles.length > 0) {
                            let answerHtml = `<div style="display: flex; justify-content: space-between; gap: 2rem;">`;
                            answerHtml += `<div style="flex: 1;"><strong>Esquerdo:</strong><br>${leftMuscles.length > 0 ? leftMuscles.join('<br>') : '-'}</div>`;
                            answerHtml += `<div style="flex: 1;"><strong>Direito:</strong><br>${rightMuscles.length > 0 ? rightMuscles.join('<br>') : '-'}</div>`;
                            answerHtml += `</div>`;
                            qaPairs.push({ section: section.title, question: 'Músculos Positivos', answer: answerHtml, isHtml: true });
                        }
                    } else if (section.id.includes('neuro_forca')) {
                        const rowsContent = [];
                        section.rows.forEach(row => {
                            const rowData = sectionData[row.id];
                            if (rowData && (rowData.esquerdo || rowData.direito)) {
                                rowsContent.push(`
                                    <div style="display: flex; border-bottom: 1px dashed #f0f0f0; padding: 6px 0;">
                                        <div style="flex: 2; font-weight: 500;">${row.label}</div>
                                        <div style="flex: 1; text-align: center;">${rowData.esquerdo || '-'}</div>
                                        <div style="flex: 1; text-align: center;">${rowData.direito || '-'}</div>
                                    </div>
                                `);
                            }
                        });
                        if (rowsContent.length > 0) {
                            let answerHtml = `
                                <div style="display: flex; background: #fafafa; padding: 6px 0; font-weight: bold; border-bottom: 1px solid #ccc; font-size: 0.9em; text-transform: uppercase;">
                                    <div style="flex: 2; padding-left: 4px;">Raiz / Músculo</div>
                                    <div style="flex: 1; text-align: center;">Esquerdo</div>
                                    <div style="flex: 1; text-align: center;">Direito</div>
                                </div>
                                <div style="font-size: 0.95rem; color: #444;">${rowsContent.join('')}</div>
                            `;
                            qaPairs.push({ section: section.title, question: 'Tabela de Força Muscular', answer: answerHtml, isHtml: true });
                        }
                    } else if (section.id.includes('testes_neurais') || section.id.includes('teste_neural')) {
                        const rowsContent = [];
                        section.rows.forEach(row => {
                            const rowData = sectionData[row.id];
                            if (rowData) {
                                let valEsq = rowData.esquerdo === true ? 'Positivo' : (rowData.esquerdo === false ? 'Negativo' : '-');
                                let valDir = rowData.direito === true ? 'Positivo' : (rowData.direito === false ? 'Negativo' : '-');
                                if (valEsq === '-' && valDir !== '-') valEsq = 'Negativo';
                                if (valDir === '-' && valEsq !== '-') valDir = 'Negativo';
                                if (valEsq !== '-' || valDir !== '-') {
                                    rowsContent.push(`
                                        <div style="display: flex; border-bottom: 1px dashed #f0f0f0; padding: 6px 0;">
                                            <div style="flex: 2; font-weight: 500;">${row.label}</div>
                                            <div style="flex: 1; text-align: center; color: ${valEsq === 'Positivo' ? 'var(--primary-red)' : '#666'}">${valEsq}</div>
                                            <div style="flex: 1; text-align: center; color: ${valDir === 'Positivo' ? 'var(--primary-red)' : '#666'}">${valDir}</div>
                                        </div>
                                    `);
                                }
                            }
                        });
                        if (rowsContent.length > 0) {
                            let answerHtml = `
                                <div style="display: flex; background: #fafafa; padding: 6px 0; font-weight: bold; border-bottom: 1px solid #ccc; font-size: 0.9em; text-transform: uppercase;">
                                    <div style="flex: 2; padding-left: 4px;">Nervo / Teste</div>
                                    <div style="flex: 1; text-align: center;">Esquerdo</div>
                                    <div style="flex: 1; text-align: center;">Direito</div>
                                </div>
                                <div style="font-size: 0.95rem; color: #444;">${rowsContent.join('')}</div>
                            `;
                            qaPairs.push({ section: section.title, question: 'Resultados dos Testes de Tensão', answer: answerHtml, isHtml: true });
                        }
                    } else {
                        section.rows.forEach(row => {
                            const rowData = sectionData[row.id];
                            if (rowData) {
                                const parts = [];
                                if (row.fields) {
                                    row.fields.forEach(f => {
                                        const fId = typeof f === 'object' ? f.id : f;
                                        let val = rowData[fId];
                                        if (section.id.includes('neurais') || section.id.includes('neural')) {
                                            if (typeof f === 'object' && f.type === 'checkbox') {
                                                if (val === undefined) val = false;
                                                parts.push(`${fId.charAt(0).toUpperCase() + fId.slice(1)}: ${val ? 'Positivo' : 'Negativo'}`);
                                                return;
                                            }
                                        }
                                        if (val !== undefined && val !== null && val !== '' && val !== false) {
                                            if (fId === 'dor') parts.push('Dor');
                                            else if (fId === 'intensidade') parts.push(`Intensidade: ${val}`);
                                            else if (['normal', 'hiper', 'hiperreflexia', 'hipo', 'hiporeflexia'].includes(fId.toLowerCase())) {
                                                let reflexName = fId.charAt(0).toUpperCase() + fId.slice(1);
                                                if (fId.toLowerCase() === 'hiper') reflexName = 'Hiperreflexia';
                                                if (fId.toLowerCase() === 'hipo') reflexName = 'Hiporreflexia';
                                                parts.push(reflexName);
                                            } else if (section.id.includes('movimento')) {
                                                if (fId === 'graus') parts.push(`${val} graus`);
                                                else if (fId === 'observacoes') parts.push(val);
                                            } else {
                                                let labelText = typeof f === 'object' && f.label ? f.label : fId.charAt(0).toUpperCase() + fId.slice(1);
                                                let displayVal = val;
                                                if (typeof val === 'boolean' && val === true) displayVal = 'Sim';
                                                parts.push(`${labelText}: ${displayVal}`);
                                            }
                                        }
                                    });
                                }
                                if (parts.length > 0) {
                                    let joinStr = ', ';
                                    if (!section.id.includes('neuro') && !section.id.includes('reflexo') && !section.id.includes('movimento') && !section.id.includes('palpacao') && !section.id.includes('neural') && !section.id.includes('miofascial')) {
                                        joinStr = ' | ';
                                    }
                                    qaPairs.push({ section: section.title, question: row.label, answer: parts.join(joinStr) });
                                }
                            }
                        });
                    }
                }
            });
        }

        let result = {};
        if (q.calculateScore) {
            result = q.calculateScore(q.type === 'clinical' ? state.clinicalData : actualAnswers);
        } else {
            result = { score: 0, percentage: 0, interpretation: 'Avaliação Clínica concluída.', max: 0, unit: '' };
        }

        result.qaPairs = qaPairs;
        if (collectedBodySchemas.length > 0) result.bodySchemas = collectedBodySchemas;

        renderResults(result);

        // Add a visual indicator that this is a historical file
        const viewHeader = document.querySelector('#view-results .view-header h2');
        if (viewHeader) {
            viewHeader.innerHTML += ' <span style="font-size: 0.8rem; background: var(--primary-red-light); color: var(--primary-red); padding: 4px 8px; border-radius: 4px; vertical-align: middle;">ARQUIVO HISTÓRICO</span>';
        }

        navigateTo('view-results');
    } catch (err) {
        console.error('[recompileHistoricalResults] crash:', err);
        alert('Erro ao abrir o histórico: ' + err.message + '\n\nVerifique o console F12 para mais detalhes.');
    }
}


// Functionality for "Novo NDI" integration
window.abrirModalNDI = function () {
    if (!state.patientInfo || !state.patientInfo.name) {
        alert("Por favor, preencha os dados do paciente primeiro.");
        return;
    }

    // Construct URL parameters to pass patient data to the new tab
    const params = new URLSearchParams({
        name: state.patientInfo.name,
        age: state.patientInfo.age,
        gender: state.patientInfo.gender,
        date: state.patientInfo.date,
        segment: 'cervical',
        questionnaire: 'ndi'
    });

    // Open in a new tab
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) {
        newWindow.focus();
    } else {
        alert("Por favor, permita pop-ups para abrir o questionário NDI.");
    }
};

window.abrirModalOswestry = function () {
    if (!state.patientInfo || !state.patientInfo.name) {
        alert("Por favor, preencha os dados do paciente primeiro.");
        return;
    }

    // Construct URL parameters to pass patient data to the new tab
    const params = new URLSearchParams({
        name: state.patientInfo.name,
        age: state.patientInfo.age,
        gender: state.patientInfo.gender,
        date: state.patientInfo.date,
        segment: 'lombar',
        questionnaire: 'oswestry'
    });

    // Open in a new tab
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) {
        newWindow.focus();
    } else {
        alert("Por favor, permita pop-ups para abrir o questionário Oswestry.");
    }
};

window.abrirModalQuickdash = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'ombro', questionnaire: 'quickdash'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalLysholm = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'mmii', questionnaire: 'lysholm'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalWomac = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'mmii', questionnaire: 'womac'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalIkdc = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'mmii', questionnaire: 'ikdc'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalAofas = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'tornozelo', questionnaire: 'aofas'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalMan = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'geriatria', questionnaire: 'man'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalVes13 = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'geriatria', questionnaire: 'ves13'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalLbpq = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'geriatria', questionnaire: 'lbpq'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

window.abrirModalBrief = function () {
    if (!state.patientInfo || !state.patientInfo.name) { alert("Por favor, preencha os dados do paciente primeiro."); return; }
    const params = new URLSearchParams({
        name: state.patientInfo.name, age: state.patientInfo.age, gender: state.patientInfo.gender, date: state.patientInfo.date, segment: 'geriatria', questionnaire: 'brief'
    });
    const newWindow = window.open(`index.html?${params.toString()}`, '_blank');
    if (newWindow) newWindow.focus(); else alert("Por favor, permita pop-ups.");
};

// UI Navigation
function navigateTo(viewId) {
    if (viewId === 'view-login') {
        Object.values(views).forEach(view => {
            if (view) {
                view.classList.remove('active');
                view.classList.add('hidden');
            }
        });
        if (views[viewId]) {
            const targetView = views[viewId];
            targetView.classList.remove('hidden');
            void targetView.offsetWidth;
            targetView.classList.add('active');
            state.currentView = viewId;
        }
        return;
    }

    // Auth Guard: if not targeting login, ensure user is authenticated
    if (!state.session) {
        if (viewId !== 'view-login') {
            navigateTo('view-login');
            return;
        }
    }

    // Admin Guard: block non-admins from admin panel
    if (viewId === 'view-admin') {
        if (!state.userProfile || state.userProfile.role !== 'admin') {
            alert('Acesso negado. Apenas administradores podem acessar esta página.');
            navigateTo('view-home');
            return;
        }
    }

    Object.values(views).forEach(view => {
        if (view) {
            view.classList.remove('active');
            view.classList.add('hidden');
        }
    });

    if (views[viewId]) {
        const targetView = views[viewId];
        targetView.classList.remove('hidden');
        // Force reflow for CSS transitions
        void targetView.offsetWidth;
        targetView.classList.add('active');
        state.currentView = viewId;
    }

    // Scroll to top when changing views
    window.scrollTo(0, 0);

    // Update nav button states
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (viewId === 'view-home' || viewId === 'view-patient-dashboard') {
        document.getElementById('btn-home').classList.add('active');
    }

    // Header Breadcrumb logic
    if (viewId === 'view-home') {
        btnHome.classList.add('active');
        btnHome.textContent = 'Início';
    } else if (viewId === 'view-segments') {
        btnHome.classList.remove('active');
        btnHome.textContent = '← Voltar ao Início';
    } else if (viewId === 'view-dashboard') {
        btnHome.classList.remove('active');
        btnHome.textContent = '← Voltar para Segmentos';
    } else if (viewId === 'view-patient-dashboard') {
        btnHome.classList.remove('active');
        btnHome.textContent = '← Voltar ao Início';
    } else {
        btnHome.classList.remove('active');
        btnHome.textContent = '← Cancelar e Voltar';

        // Edge case: if viewing a form directly from the dashboard, button should go to dashboard.
        if (state.patientId && viewId === 'view-patient-info') {
            // This doesn't apply to the patient form anymore
        }

    }
}

// 1. Select Segment
window.selectSegment = function (segmentId) {
    state.selectedSegment = segmentId;
    renderDashboard();
    navigateTo('view-dashboard');
};

// 2. Render Dashboard for Selected Segment
async function shareBlankQuestionnairePDF(qId, event) {
    if (event) event.preventDefault();

    // Find the questionnaire
    let q = questionnairesData[qId] || null;

    if (!q) return;

    // Show loading state on the clicked button
    const btn = event.currentTarget;
    const originalHtml = btn.innerHTML;
    if (btn) {
        btn.innerHTML = 'Gerando...';
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    }

    try {
        // Create an invisible container for the PDF content
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '800px';
        container.style.backgroundColor = '#ffffff';
        container.style.padding = '40px';
        container.style.fontFamily = "'Inter', sans-serif";
        container.style.color = '#333';

        let html = `
            <div style="text-align: center; border-bottom: 2px solid #e02f2f; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #e02f2f; margin: 0; font-size: 24px;">KINESIS LAB</h1>
                <h2 style="color: #555; margin: 10px 0 0 0; font-size: 20px;">${q.title}</h2>
            </div>
            
            <div style="margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                    <span style="font-weight: bold;">Nome do Paciente:</span>
                    <span style="flex-grow: 1; border-bottom: 1px solid #000; margin-left: 10px;"></span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #ccc; padding-bottom: 5px;">
                    <span style="font-weight: bold;">Data:</span>
                    <span style="width: 200px; border-bottom: 1px solid #000; margin-left: 10px;"></span>
                </div>
            </div>
            
            <p style="font-style: italic; color: #666; margin-bottom: 30px;">
                Por favor, leia atentamente cada questão e marque a alternativa que melhor descreve sua condição ou responda no espaço adequado.
            </p>
        `;

        let qNum = 1;
        q.questions.forEach((question) => {
            if (question.isInstruction) {
                html += `
                    <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #e02f2f;">
                        <strong>Instrução:</strong> ${question.text}
                    </div>
                `;
                return;
            }

            html += `
                <div style="margin-bottom: 25px; page-break-inside: avoid;">
                    <p style="font-weight: bold; margin: 0 0 10px 0;">${qNum}. ${question.text}</p>
            `;

            if (question.options) {
                question.options.forEach((opt) => {
                    html += `
                        <div style="margin-left: 20px; margin-bottom: 8px; display: flex; align-items:flex-start;">
                            <div style="width: 16px; height: 16px; border: 1px solid #000; border-radius: 3px; display: inline-block; margin-right: 10px; flex-shrink:0; margin-top:2px;"></div>
                            <span>${opt.label}</span>
                        </div>
                    `;
                });
            } else {
                html += `
                    <div style="margin-left: 20px; margin-top: 15px; border-bottom: 1px solid #000; height: 20px; width: 90%;"></div>
                `;
            }

            html += `</div>`;
            qNum++;
        });

        html += `
            <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px;">
                Documento gerado por Kinesis Lab - Fisioterapia Especializada
            </div>
        `;

        container.innerHTML = html;
        document.body.appendChild(container);

        const opt = {
            margin: 10,
            filename: `Questionario_${q.title.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        const pdfBlob = await html2pdf().set(opt).from(container).output('blob');
        const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

        document.body.removeChild(container);

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: q.title,
                text: `Olá! Segue em anexo o questionário: ${q.title}. Por favor, preencha e nos devolva.`
            });
        } else {
            alert("Seu navegador não suporta compartilhamento direto de arquivos. O PDF será baixado no seu computador. Após abrir o WhatsApp, por favor, anexe o arquivo manualmente na conversa do paciente.");
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = opt.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

    } catch (err) {
        console.error('Erro ao gerar questionário:', err);
        alert("Ops! Houve um erro ao gerar o PDF deste questionário.");
    } finally {
        if (btn) {
            btn.innerHTML = originalHtml;
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    }
}

function renderDashboard() {
    questionnaireList.innerHTML = '';

    // Filter by segment
    const segmentForms = Object.values(questionnairesData).filter(q => q.segment === state.selectedSegment);

    if (segmentForms.length === 0) {
        questionnaireList.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color: var(--text-muted)">Nenhum questionário disponível para este segmento ainda.</p>';
        return;
    }

    segmentForms.forEach(q => {
        const card = document.createElement('div');
        card.className = 'evaluation-card glass-panel';

        const canSendToPatient = q.questions && !q.type;

        card.innerHTML = `
            <div class="card-icon">
                ${q.icon}
            </div>
            <h3>${q.title}</h3>
            <p>${q.description}</p>
            <div class="card-action">
                Selecionar
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
            ${canSendToPatient ? `
            <a class="card-send-patient" 
               href="#" 
               onclick="shareBlankQuestionnairePDF('${q.id}', event)"
               title="Gerar PDF e compartilhar questionário em branco">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                Compartilhar
            </a>` : ''}
        `;

        card.addEventListener('click', (e) => {
            // Don't trigger card selection if clicking on the send button
            if (e.target.closest('.card-send-patient')) return;
            state.currentQuestionnaire = q;

            // Show dominance field only for 'cotovelo' (Mão e Cotovelo)
            const dominanceGroup = document.getElementById('patient-dominance-group');
            if (dominanceGroup) {
                if (state.selectedSegment === 'cotovelo') {
                    dominanceGroup.style.display = 'block';
                } else {
                    dominanceGroup.style.display = 'none';
                }
            }

            // Show activity level for MMII / Lombar / Geriatria where hip normatives or general health matter
            const activityGroup = document.getElementById('patient-activity-group');
            if (activityGroup) {
                if (state.selectedSegment === 'mmii') {
                    activityGroup.style.display = 'block';
                } else {
                    activityGroup.style.display = 'none';
                }
            }

            // If we already have a patient (from dash) or it's a quick assessment, skip the form
            if (state.patientId || state.isQuickAssessment) {
                // Determine whether to skip info screen depending on the questionnaire type
                if (q.type === 'clinical') {
                    renderClinicalForm();
                    navigateTo('view-questionnaire');
                } else if (q.id === 'ndi') {
                    window.abrirModalNDI();
                } else if (q.id === 'oswestry') {
                    window.abrirModalOswestry();
                } else if (q.id === 'quickdash') {
                    window.abrirModalQuickdash();
                } else if (q.id === 'lysholm') {
                    window.abrirModalLysholm();
                } else if (q.id === 'womac') {
                    window.abrirModalWomac();
                } else if (q.id === 'ikdc') {
                    window.abrirModalIkdc();
                } else if (q.id === 'aofas') {
                    window.abrirModalAofas();
                } else if (q.id === 'man') {
                    window.abrirModalMan();
                } else if (q.id === 'ves13') {
                    window.abrirModalVes13();
                } else if (q.id === 'lbpq') {
                    window.abrirModalLbpq();
                } else if (q.id === 'brief') {
                    window.abrirModalBrief();
                } else {
                    state.currentQuestionIndex = 0;
                    state.answers = {};
                    renderQuestion();
                    navigateTo('view-questionnaire');
                }
            } else {
                // Shouldn't happen in new architecture, but fallback just in case
                navigateTo('view-patient-info');
            }
        });

        questionnaireList.appendChild(card);
    });
}

// 3. Handle Patient Form Submission (New Patient Registration)
async function handlePatientFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('patient-name').value;
    const age = document.getElementById('patient-age').value;
    const gender = document.getElementById('patient-gender').value;
    const dominance = document.getElementById('patient-dominance').value;
    const activity = document.getElementById('patient-activity') ? document.getElementById('patient-activity').value : 'Ativo'; // Default if not present
    const date = document.getElementById('patient-date').value;

    if (!name || !age || !date) {
        alert('Por favor, preencha nome, idade e data da avaliação.');
        return;
    }

    const patientData = {
        name,
        age: parseInt(age),
        gender,
        dominance,
        activity_level: activity
    };

    // Also store local state info for immediate rendering
    state.patientInfo = { ...patientData, date };

    // Disable button to prevent double submit
    const submitBtn = document.getElementById('btn-save-patient') || document.querySelector('#patient-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Salvando...';
    submitBtn.disabled = true;

    try {
        const savedPatient = await window.db.savePatient(patientData);
        state.patientId = savedPatient.id;

        // After registering, where to go?
        // If they were doing a Quick Assessment and hit "Save" at the very end...
        if (state.pendingQuickSaveData) {
            // Save the pending assessment to this new patient
            const assessmentData = {
                patient_id: state.patientId,
                assessment_type: state.pendingQuickSaveData.q.id,
                segment: state.selectedSegment,
                clinical_data: state.pendingQuickSaveData.clinicalData || null,
                questionnaire_answers: state.pendingQuickSaveData.answers || null
            };

            await window.db.saveAssessment(assessmentData);

            // Clean up flags
            state.isQuickAssessment = false;
            state.pendingQuickSaveData = null;

            // Show the results now that saving is done
            if (state.currentQuestionnaire && state.currentQuestionnaire.type === 'clinical') {
                renderResults();
            } else if (state.currentQuestionnaire) {
                renderQuestionnaireResults();
            }
            navigateTo('view-results');
        } else {
            // Normal flow: Check if we arrived via a deep link for a specific questionnaire (e.g., from NDI button)
            if (state.currentQuestionnaire) {
                startQuestionnaire();
            } else {
                // Otherwise go to Segment Selection
                navigateTo('view-segments');
            }
        }
    } catch (err) {
        alert('Erro ao salvar paciente. Verifique sua conexão.');
        console.error(err);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// 4. Start Questionnaire
function startQuestionnaire() {
    state.answers = {};
    state.clinicalData = {}; // Clear previous clinical data
    state.currentQuestionIndex = 0;

    renderQuestionnaire();
    navigateTo('view-questionnaire');
}

// Render Questionnaire View
function renderQuestionnaire() {
    const q = state.currentQuestionnaire;

    if (q.type === 'clinical') {
        renderClinicalForm();
        return;
    }

    const isInstruction = q.questions[state.currentQuestionIndex].isInstruction;
    // ... existing questionnaire rendering code ...
    const totalQuestions = q.questions.filter(item => !item.isInstruction).length;
    let actualQuestionsAnswered = 0;
    for (let i = 0; i < state.currentQuestionIndex; i++) {
        if (!q.questions[i].isInstruction) actualQuestionsAnswered++;
    }
    const progressPerc = Math.round((actualQuestionsAnswered / totalQuestions) * 100);

    const questionText = q.questions[state.currentQuestionIndex].text;
    const options = q.questions[state.currentQuestionIndex].options || [];

    let html = `
        <header class="view-header">
            <h2>${q.title}</h2>
            <p>Paciente: ${state.patientInfo.name}</p>
        </header>

        <div class="question-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${isInstruction ? 0 : progressPerc}%"></div>
            </div>
            
            <h3 class="question-text">${questionText}</h3>
            
            <div class="options-list">
                ${options.map((opt, index) => `
                    <button class="option-btn ${state.answers[state.currentQuestionIndex] === opt.value ? 'selected' : ''}" 
                            data-value="${opt.value}">
                        ${opt.label}
                    </button>
                `).join('')}
            </div>

            <div class="question-navigation">
                <button class="btn btn-secondary" id="btn-prev" ${state.currentQuestionIndex === 0 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>
                    Voltar
                </button>
                ${isInstruction
            ? `<button class="btn btn-primary" id="btn-next">Continuar</button>`
            : `<button class="btn btn-primary" id="btn-next" ${state.answers[state.currentQuestionIndex] !== undefined ? '' : 'disabled style="opacity:0.5;cursor:not-allowed;"'}>Próxima</button>`
        }
            </div>
        </div>
    `;

    views['view-questionnaire'].innerHTML = html;

    if (!isInstruction) {
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const val = parseFloat(e.target.dataset.value);
                state.answers[state.currentQuestionIndex] = val;

                document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');

                const nextBtn = document.getElementById('btn-next');
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                nextBtn.style.cursor = 'pointer';

                setTimeout(handleNext, 400);
            });
        });
    }

    document.getElementById('btn-prev').addEventListener('click', handlePrev);
    document.getElementById('btn-next').addEventListener('click', handleNext);
}

// 4.1 Render Clinical Form
function renderClinicalForm() {
    const q = state.currentQuestionnaire;
    state.clinicalData = state.clinicalData || {};

    let html = `
            <div class="clinical-grid">
                <div class="clinical-field">
                    <label>Paciente</label>
                    <input type="text" value="${state.patientInfo.name}" readonly>
                </div>
                <div class="clinical-field">
                    <label>Data</label>
                    <input type="text" value="${new Intl.DateTimeFormat('pt-BR').format(new Date(state.patientInfo.date))}" readonly>
                </div>
            </div>

            ${q.sections.map(section => `
                <section class="clinical-section">
                    <h3>${section.title}</h3>
                    
                    ${section.type === 'table' ? `
                        <div class="clinical-table-wrapper">
                            <table class="clinical-table">
                                <thead>
                                    <tr>
                                        ${section.columns.map(col => {
        if (typeof col === 'object') {
            return `<th style="${col.width ? `width:${col.width}` : ''}">${col.label}</th>`;
        }
        return `<th>${col}</th>`;
    }).join('')}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${section.rows.map(row => `
                                        <tr>
                                            <td>${row.label}</td>
                                            ${row.fields.map(field => {
        const isObj = typeof field === 'object';
        const fId = isObj ? field.id : field;
        const fType = isObj ? field.type || 'text' : 'text';
        const fProps = isObj ? field.props || '' : '';
        const fReadonly = row.readonly && row.readonly.includes(fId) ? 'readonly' : '';
        const val = (state.clinicalData[section.id] && state.clinicalData[section.id][row.id] && state.clinicalData[section.id][row.id][fId]) || '';

        if (fType === 'checkbox') {
            // Custom checkbox rendering
            return `
                                                        <td style="text-align:center;">
                                                            <input type="checkbox" 
                                                                   class="clinical-input" 
                                                                   style="width: 24px; height: 24px; cursor: pointer;"
                                                                   data-section="${section.id}" 
                                                                   data-row="${row.id}" 
                                                                   data-field="${fId}"
                                                                   ${val ? 'checked' : ''}
                                                                   ${fReadonly}>
                                                        </td>
                                                    `;
        }

        // Default text input
        return `
                                                    <td>
                                                        <input type="${fType}" 
                                                               class="clinical-input" 
                                                               ${fProps}
                                                               data-section="${section.id}" 
                                                               data-row="${row.id}" 
                                                               data-field="${fId}"
                                                               value="${val}"
                                                               ${fReadonly}>
                                                    </td>
                                                `;
    }).join('')}
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : section.type === 'questionnaire' ? `
                        <div class="questionnaire-sub-section">
                            ${section.questions.map((sq, idx) => `
                                <div class="sub-question">
                                    <p>${sq.text}</p>
                                    <div class="sub-options">
                                        ${sq.options.map(opt => `
                                            <button class="btn-small-opt ${state.clinicalData[section.id] && state.clinicalData[section.id][idx] === opt.value ? 'selected' : ''}"
                                                    data-section="${section.id}"
                                                    data-question="${idx}"
                                                    data-value="${opt.value}">
                                                ${opt.label} (${opt.value})
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="clinical-grid">
                            ${section.fields.map(field => `
                                <div class="clinical-field" style="${(field.type === 'textarea' || field.type === 'bodyschema' || field.type === 'range') ? 'grid-column: 1/-1' : ''}">
                                    <label>${field.label}</label>
                                    ${field.type === 'textarea'
            ? `<textarea class="clinical-input" data-section="${section.id}" data-field="${field.id}">${(state.clinicalData[section.id] && state.clinicalData[section.id][field.id]) || ''}</textarea>`
            : field.type === 'bodyschema'
                ? `<div class="bodyschema-container">
                 <canvas class="bodyschema-canvas" id="canvas-${field.id}" data-section="${section.id}" data-field="${field.id}" data-image="${field.image}"></canvas>
                 <div class="bodyschema-controls">
                     <button type="button" class="btn btn-secondary btn-clear-canvas" data-target="canvas-${field.id}">Limpar / Refazer</button>
                 </div>
               </div>`
                : field.type === 'paintmap'
                    ? `<div class="paintmap-container" style="display: flex; gap: 20px; align-items: flex-start;">
                         <div style="flex: 1;">
                             <canvas class="paintmap-canvas" id="canvas-${field.id}" data-section="${section.id}" data-field="${field.id}" data-image="${field.image}" style="border: 1px solid #ddd; border-radius: 8px; cursor: crosshair;"></canvas>
                             <div class="bodyschema-controls" style="margin-top: 10px; display: flex; gap: 10px;">
                                 <button type="button" class="btn btn-secondary btn-clear-canvas" data-target="canvas-${field.id}">Limpar Tudo</button>
                                 <button type="button" class="btn btn-secondary btn-undo-canvas" data-target="canvas-${field.id}">Desfazer</button>
                             </div>
                         </div>
                         <div class="paintmap-palette" style="width: 250px; background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                             <h4>Legenda</h4>
                             <div class="color-swatches" id="swatches-${field.id}" style="display: flex; flex-direction: column; gap: 8px;">
                                 ${field.colors.map((c, i) => `
                                     <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px; border-radius: 4px; ${i === 0 ? 'background:#f0f0f0;' : ''}" class="color-swatch-label">
                                         <input type="radio" name="color-${field.id}" value="${c.hex}" ${i === 0 ? 'checked' : ''} style="display:none;" onchange="
                                             document.querySelectorAll('#swatches-${field.id} .color-swatch-label').forEach(el=>el.style.background='');
                                             this.parentElement.style.background='#f0f0f0';
                                         ">
                                         <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${c.hex}; border: 2px solid #ccc;"></div>
                                         <span style="font-size: 0.9em;">${c.label}</span>
                                     </label>
                                 `).join('')}
                             </div>
                         </div>
                       </div>`
                    : field.type === 'range'
                        ? `<div class="range-container">
                         <div class="range-labels">
                             <span>${field.min || 0}</span>
                             <span class="range-val-view">${(state.clinicalData[section.id] && state.clinicalData[section.id][field.id]) !== undefined ? state.clinicalData[section.id][field.id] : (field.min || 0)}</span>
                             <span>${field.max || 10}</span>
                         </div>
                         <input type="range" class="clinical-input range-slider" data-section="${section.id}" data-field="${field.id}" min="${field.min || 0}" max="${field.max || 10}" step="${field.step || 1}" value="${(state.clinicalData[section.id] && state.clinicalData[section.id][field.id]) !== undefined ? state.clinicalData[section.id][field.id] : (field.min || 0)}" oninput="this.parentElement.querySelector('.range-val-view').innerText = this.value">
                       </div>`
                        : field.type === 'button'
                            ? `<button type="button" class="btn btn-secondary clinical-input-button" data-section="${section.id}" data-field="${field.id}" ${field.props || ''}>${field.label}</button>`
                            : `<input type="${field.type || 'text'}" class="clinical-input" ${field.props || ''} data-section="${section.id}" data-field="${field.id}" value="${(state.clinicalData[section.id] && state.clinicalData[section.id][field.id]) || ''}">`
        }
                                </div>
                            `).join('')}
                        </div>
                    `}
                </section>
            `).join('')}

            <div style="margin-top: 2rem; display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-secondary" onclick="navigateTo('view-dashboard')">Cancelar</button>
                <button class="btn btn-primary" id="btn-finish-clinical">Finalizar e Ver Resultado</button>
            </div>
        </div>
    `;

    views['view-questionnaire'].innerHTML = html;

    // Attach listeners for inputs
    document.querySelectorAll('.clinical-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const { section, row, field } = e.target.dataset;
            const isCheckbox = e.target.type === 'checkbox';
            const valueToSave = isCheckbox ? e.target.checked : e.target.value;

            state.clinicalData[section] = state.clinicalData[section] || {};

            if (row) {
                state.clinicalData[section][row] = state.clinicalData[section][row] || {};
                state.clinicalData[section][row][field] = valueToSave;
            } else {
                state.clinicalData[section][field] = valueToSave;
            }

            // Auto-calculate deficits if in 'forca', 'forca_ombro', or 'forca_preensao' section
            if (section === 'forca' || section === 'forca_ombro' || section === 'forca_preensao') {
                updateDéficits(section);
            }
        });
    });

    // Attach listeners for sub-questionnaire buttons
    document.querySelectorAll('.btn-small-opt').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const { section, question, value } = e.target.dataset;
            const val = parseFloat(value);

            state.clinicalData[section] = state.clinicalData[section] || {};
            state.clinicalData[section][question] = val;

            // Update UI
            e.target.parentElement.querySelectorAll('.btn-small-opt').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
        });
    });

    // Setup body schema canvases
    document.querySelectorAll('.bodyschema-canvas').forEach(canvas => {
        setupCanvas(canvas);
    });

    // Setup paintmap canvases
    document.querySelectorAll('.paintmap-canvas').forEach(canvas => {
        setupPaintmapCanvas(canvas);
    });

    document.querySelectorAll('.btn-clear-canvas').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const canvasId = e.target.dataset.target;
            const canvas = document.getElementById(canvasId);
            if (canvas && canvas.ctx) {
                canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (canvas.bgImage) {
                    canvas.ctx.drawImage(canvas.bgImage, 0, 0, canvas.width, canvas.height);
                }

                if (canvas.strokeHistory) {
                    canvas.strokeHistory = [];
                    const section = canvas.dataset.section;
                    const field = canvas.dataset.field;
                    state.clinicalData[section][field + '_history'] = [];
                }
                saveCanvasData(canvas);
                if (canvas.history) canvas.history = []; // Clear old history array if present
            }
        });
    });

    document.querySelectorAll('.btn-undo-canvas').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const canvasId = e.target.dataset.target;
            const canvas = document.getElementById(canvasId);

            // Undo logic for paintmap (vector-based history)
            if (canvas && canvas.ctx && canvas.strokeHistory && canvas.strokeHistory.length > 0) {
                // Remove the last action
                canvas.strokeHistory.pop();

                // Redraw the original background
                canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (canvas.bgImage) {
                    canvas.ctx.drawImage(canvas.bgImage, 0, 0, canvas.width, canvas.height);
                }

                // Replay all remaining actions in history
                canvas.strokeHistory.forEach(action => {
                    canvas.ctx.beginPath();
                    canvas.ctx.arc(action.x, action.y, 8, 0, 2 * Math.PI);
                    canvas.ctx.fillStyle = action.color;
                    canvas.ctx.fill();
                });

                // Save updated state
                const section = canvas.dataset.section;
                const field = canvas.dataset.field;
                state.clinicalData[section][field + '_history'] = [...canvas.strokeHistory];
            }
        });
    });

    document.getElementById('btn-finish-clinical').addEventListener('click', () => {
        finishQuestionnaire();
    });
}

function updateDéficits(section = 'forca') {
    const sectionData = state.clinicalData[section];
    if (!sectionData) return;

    // Colunas de déficit genéricas (Membro E x Membro D)
    const rowsToCalculate = section === 'forca'
        ? ['abd_quadril', 'ext_quadril', 'flex_quadril', 'rot_int_quadril', 'ext_joelho', 'flex_joelho']
        : section === 'forca_preensao'
            ? ['preensao_palmar', 'pinca_polpa', 'pinca_lateral', 'pinca_tripode']
            : ['abd_ombro', 'rl_ombro', 'rm_ombro'];

    rowsToCalculate.forEach(rowId => {
        const rowData = sectionData[rowId];
        if (rowData && rowData.esquerdo && rowData.direito) {
            const e = parseFloat(rowData.esquerdo);
            const d = parseFloat(rowData.direito);
            if (!isNaN(e) && !isNaN(d) && (e > 0 || d > 0)) {
                const deficit = Math.abs(((e - d) / Math.max(e, d)) * 100).toFixed(1);
                state.clinicalData[section][rowId].deficit = deficit + '%';
                const input = document.querySelector(`input[data-section="${section}"][data-row="${rowId}"][data-field="deficit"]`);
                if (input) input.value = deficit + '%';
            }
        }
    });

    // Relações Específicas
    if (section === 'forca') {
        const forca = sectionData;
        ['esquerdo', 'direito'].forEach(side => {
            const flex = forca.flex_joelho && parseFloat(forca.flex_joelho[side]);
            const ext = forca.ext_joelho && parseFloat(forca.ext_joelho[side]);

            if (!isNaN(flex) && !isNaN(ext) && ext > 0) {
                const ratio = (flex / ext).toFixed(2);
                state.clinicalData.forca.relacao_iq = state.clinicalData.forca.relacao_iq || {};
                state.clinicalData.forca.relacao_iq[side] = ratio;
                const input = document.querySelector(`input[data-section="forca"][data-row="relacao_iq"][data-field="${side}"]`);
                if (input) input.value = ratio;
            }
        });

        const iqE = parseFloat(state.clinicalData.forca.relacao_iq?.esquerdo);
        const iqD = parseFloat(state.clinicalData.forca.relacao_iq?.direito);
        if (!isNaN(iqE) && !isNaN(iqD)) {
            const deficit = Math.abs(((iqE - iqD) / Math.max(iqE, iqD)) * 100).toFixed(1);
            state.clinicalData.forca.relacao_iq.deficit = deficit + '%';
            const input = document.querySelector(`input[data-section="forca"][data-row="relacao_iq"][data-field="deficit"]`);
            if (input) input.value = deficit + '%';
        }
    } else if (section === 'forca_ombro') {
        ['esquerdo', 'direito'].forEach(side => {
            const rl = sectionData.rl_ombro && parseFloat(sectionData.rl_ombro[side]);
            const rm = sectionData.rm_ombro && parseFloat(sectionData.rm_ombro[side]);

            if (!isNaN(rl) && !isNaN(rm) && rm > 0) {
                const ratio = ((rl / rm) * 100).toFixed(1);
                state.clinicalData.forca_ombro.relacao_rlrm = state.clinicalData.forca_ombro.relacao_rlrm || {};
                state.clinicalData.forca_ombro.relacao_rlrm[side] = ratio + '%';
                const input = document.querySelector(`input[data-section="forca_ombro"][data-row="relacao_rlrm"][data-field="${side}"]`);
                if (input) input.value = ratio + '%';
            }
        });

        const ratioE = parseFloat(state.clinicalData.forca_ombro.relacao_rlrm?.esquerdo);
        const ratioD = parseFloat(state.clinicalData.forca_ombro.relacao_rlrm?.direito);
        if (!isNaN(ratioE) && !isNaN(ratioD)) {
            const deficit = Math.abs(((ratioE - ratioD) / Math.max(ratioE, ratioD)) * 100).toFixed(1);
            state.clinicalData.forca_ombro.relacao_rlrm.deficit = deficit + '%';
            const input = document.querySelector(`input[data-section="forca_ombro"][data-row="relacao_rlrm"][data-field="deficit"]`);
            if (input) input.value = deficit + '%';
        }
    }
}

function setupCanvas(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.ctx = ctx;

    // Load background image
    const imgSrc = canvas.dataset.image;
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
        // Calculate dimensions to respect image's aspect ratio. Max width 600px
        const maxWidth = 600;
        let finalWidth = img.width;
        let finalHeight = img.height;

        if (finalWidth > maxWidth) {
            const ratio = maxWidth / finalWidth;
            finalWidth = maxWidth;
            finalHeight = finalHeight * ratio;
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Draw image scaled to fit canvas
        canvas.bgImage = img;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Load existing drawing if any
        const section = canvas.dataset.section;
        const field = canvas.dataset.field;
        const existingData = state.clinicalData[section] && state.clinicalData[section][field];
        const existingHistory = state.clinicalData[section] && state.clinicalData[section][field + '_history'];

        canvas.strokeHistory = existingHistory ? [...existingHistory] : [];

        if (existingData) {
            const savedImg = new Image();
            savedImg.onload = () => {
                ctx.drawImage(savedImg, 0, 0);
            };
            savedImg.src = existingData;
        } else if (existingHistory && existingHistory.length > 0) {
            // Replay strokes for tainted canvas fallback
            existingHistory.forEach(action => {
                if (action.type === 'line' && action.points && action.points.length > 0) {
                    ctx.beginPath();
                    restoreStrokeStyle(ctx);
                    ctx.moveTo(action.points[0].x, action.points[0].y);
                    for (let i = 1; i < action.points.length; i++) {
                        ctx.lineTo(action.points[i].x, action.points[i].y);
                    }
                    ctx.stroke();
                }
            });
        } else {
            // Save initial empty schema to state
            saveCanvasData(canvas);
        }

        // Context stroke attributes reset whenever canvas.width/height is modified.
        restoreStrokeStyle(ctx);
    };

    // Drawing state
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentStroke = [];

    // Stroke style is also set initially so getMousePos and others don't fail, 
    // although size isn't final until onload.
    restoreStrokeStyle(ctx);

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        // Calculate scale factors
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function startDrawing(e) {
        if (e.cancelable) e.preventDefault();
        isDrawing = true;
        const pos = getMousePos(e);
        lastX = pos.x;
        lastY = pos.y;
        currentStroke = [pos];
    }

    function draw(e) {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();

        const pos = getMousePos(e);

        ctx.beginPath();
        restoreStrokeStyle(ctx); // Ensure stroke style is applied right before drawing
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        lastX = pos.x;
        lastY = pos.y;
        currentStroke.push(pos);
    }

    function stopDrawing(e) {
        if (isDrawing) {
            isDrawing = false;
            if (!canvas.strokeHistory) canvas.strokeHistory = [];
            if (currentStroke.length > 0) {
                canvas.strokeHistory.push({ type: 'line', points: currentStroke });
                currentStroke = [];
            }
            saveCanvasData(canvas);
        }
    }

    // Mouse Events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch Events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
}

function restoreStrokeStyle(ctx) {
    // Stroke style (Red paint for pain)
    ctx.strokeStyle = 'rgba(217, 43, 43, 0.6)'; // Red color, slightly transparent
    ctx.lineWidth = 24; // Original max width
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function saveCanvasData(canvas) {
    const section = canvas.dataset.section;
    const field = canvas.dataset.field;

    state.clinicalData[section] = state.clinicalData[section] || {};

    // Save history array so fallback works safely across environments
    if (canvas.strokeHistory) {
        state.clinicalData[section][field + '_history'] = [...canvas.strokeHistory];
    }

    try {
        state.clinicalData[section][field] = canvas.toDataURL('image/png');
    } catch (e) {
        console.warn('Canvas is tainted (likely running via file://). DataURL save aborted.');
    }
}

function setupPaintmapCanvas(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.ctx = ctx;

    const imgSrc = canvas.dataset.image;
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
        const maxWidth = 600;
        let finalWidth = img.width;
        let finalHeight = img.height;

        if (finalWidth > maxWidth) {
            const ratio = maxWidth / finalWidth;
            finalWidth = maxWidth;
            finalHeight = finalHeight * ratio;
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        canvas.bgImage = img;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const section = canvas.dataset.section;
        const field = canvas.dataset.field;
        const existingData = state.clinicalData[section] && state.clinicalData[section][field];
        const existingHistory = state.clinicalData[section] && state.clinicalData[section][field + '_history'];

        // Initialize vector history
        canvas.strokeHistory = existingHistory ? [...existingHistory] : [];

        if (existingHistory && existingHistory.length > 0) {
            // Replay vector history
            existingHistory.forEach(action => {
                ctx.beginPath();
                ctx.arc(action.x, action.y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = action.color;
                ctx.fill();
            });
        } else if (existingData) {
            // Fallback to image data if present
            const savedImg = new Image();
            savedImg.onload = () => {
                ctx.drawImage(savedImg, 0, 0);
            };
            savedImg.src = existingData;
        } else {
            saveCanvasData(canvas);
        }
    };

    function hexToRgba(hex) {
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b, 255];
    }

    function floodFill(x, y, fillColor) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const w = canvas.width;
        const h = canvas.height;

        const pixelPos = (y * w + x) * 4;
        const startR = data[pixelPos];
        const startG = data[pixelPos + 1];
        const startB = data[pixelPos + 2];
        const startA = data[pixelPos + 3];

        // If the color matches the fill color, return
        if (startR === fillColor[0] && startG === fillColor[1] && startB === fillColor[2] && startA === fillColor[3]) return;

        // Tolerance for white-ish backgrounds, so we don't accidentally fill anti-aliased black lines
        function matchStartColor(pos) {
            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            const a = data[pos + 3];

            // If it's a completely different color or black border, don't fill
            // To be safe, we only fill pixels that are very close to the start color
            const dr = Math.abs(r - startR);
            const dg = Math.abs(g - startG);
            const db = Math.abs(b - startB);
            const da = Math.abs(a - startA);
            return (dr + dg + db + da) < 50; // tolerance
        }

        function colorPixel(pos) {
            data[pos] = fillColor[0];
            data[pos + 1] = fillColor[1];
            data[pos + 2] = fillColor[2];
            data[pos + 3] = fillColor[3];
        }

        const pixelStack = [[x, y]];

        while (pixelStack.length) {
            const newPos = pixelStack.pop();
            const px = newPos[0];
            let py = newPos[1];
            let pixelPos = (py * w + px) * 4;

            while (py-- >= 0 && matchStartColor(pixelPos)) {
                pixelPos -= w * 4;
            }
            pixelPos += w * 4;
            ++py;

            let reachLeft = false;
            let reachRight = false;

            while (py++ < h - 1 && matchStartColor(pixelPos)) {
                colorPixel(pixelPos);

                if (px > 0) {
                    if (matchStartColor(pixelPos - 4)) {
                        if (!reachLeft) {
                            pixelStack.push([px - 1, py]);
                            reachLeft = true;
                        }
                    } else if (reachLeft) {
                        reachLeft = false;
                    }
                }

                if (px < w - 1) {
                    if (matchStartColor(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push([px + 1, py]);
                            reachRight = true;
                        }
                    } else if (reachRight) {
                        reachRight = false;
                    }
                }

                pixelPos += w * 4;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        saveCanvasData(canvas);
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: Math.floor((clientX - rect.left) * scaleX),
            y: Math.floor((clientY - rect.top) * scaleY)
        };
    }

    function pushAction(canvas, action) {
        if (!canvas.strokeHistory) canvas.strokeHistory = [];
        canvas.strokeHistory.push(action);

        const section = canvas.dataset.section;
        const field = canvas.dataset.field;
        state.clinicalData[section] = state.clinicalData[section] || {};
        state.clinicalData[section][field + '_history'] = [...canvas.strokeHistory];

        // Try saving base64 for PDF rendering later if possible
        try {
            state.clinicalData[section][field] = canvas.toDataURL('image/png');
        } catch (e) { }
    }

    function handleInteraction(e) {
        if (e.cancelable) e.preventDefault();
        const pos = getMousePos(e);

        // Get selected color from the radio buttons
        const fieldId = canvas.dataset.field;
        const colorInput = document.querySelector(`input[name="color-${fieldId}"]:checked`);
        let hexColor = '#00FF00'; // Default
        if (colorInput) {
            hexColor = colorInput.value;
        }

        const rgbaColor = hexToRgba(hexColor);

        try {
            // Attempt to do a flood fill.
            floodFill(pos.x, pos.y, rgbaColor);
        } catch (err) {
            // Fallback for CORS SecurityError
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8, 0, 2 * Math.PI); // Reduced radius to 8
            ctx.fillStyle = hexColor;
            ctx.fill();
        }

        // Push this vector action to history for robust undo / persistence
        pushAction(canvas, { x: pos.x, y: pos.y, color: hexColor });
    }

    canvas.addEventListener('mousedown', handleInteraction);
    canvas.addEventListener('touchstart', handleInteraction, { passive: false });
}

function handlePrev() {
    if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex--;
        renderQuestionnaire();
    }
}

function handleNext() {
    const q = state.currentQuestionnaire;

    if (state.currentQuestionIndex < q.questions.length - 1) {
        state.currentQuestionIndex++;
        renderQuestionnaire();
    } else {
        finishQuestionnaire();
    }
}

// 5. Finish and Calculate
async function finishQuestionnaire() {
    const q = state.currentQuestionnaire;

    const actualAnswers = {};
    const qaPairs = [];
    let answerCount = 0;
    const collectedBodySchemas = []; // Store them safely here first

    if (q.questions) {
        q.questions.forEach((question, index) => {
            if (!question.isInstruction && state.answers[index] !== undefined) {
                const value = state.answers[index];
                actualAnswers[answerCount] = value;
                answerCount++;

                // Find the matching option label for the selected value
                const selectedOption = question.options
                    ? question.options.find(opt => opt.value === value)
                    : null;

                let displayVal = selectedOption ? selectedOption.label : String(value);
                if (typeof value === 'boolean') displayVal = value ? 'Positivo' : 'Negativo';

                qaPairs.push({
                    question: question.text,
                    answer: displayVal
                });
            }
        });
    }

    if (q.type === 'clinical' && q.sections) {
        q.sections.forEach(section => {
            const sectionData = state.clinicalData[section.id];
            if (!sectionData) return;

            if (section.fields) {
                section.fields.forEach(field => {
                    const val = sectionData[field.id];
                    if (field.type === 'bodyschema' || field.type === 'paintmap') {
                        collectedBodySchemas.push({
                            title: field.label,
                            image: field.image,
                            dataUrl: sectionData[field.id],
                            history: sectionData[field.id + '_history'] || []
                        });
                    } else if (val !== undefined && val !== null && val !== '' && field.type !== 'bodyschema' && field.type !== 'paintmap' && field.id !== 'intensidade_dor') {
                        qaPairs.push({
                            section: section.title,
                            question: field.label,
                            answer: val
                        });
                    }
                });
            }

            if (section.rows) {
                // Seção Palpação Miofascial precisa ser agrupada em colunas (Esquerdo x Direito)
                if (section.id.includes('miofascial')) {
                    const leftMuscles = [];
                    const rightMuscles = [];
                    section.rows.forEach(row => {
                        const rowData = sectionData[row.id];
                        if (rowData) {
                            if (rowData.esquerdo) leftMuscles.push(row.label);
                            if (rowData.direito) rightMuscles.push(row.label);
                        }
                    });

                    if (leftMuscles.length > 0 || rightMuscles.length > 0) {
                        let answerHtml = `<div style="display: flex; justify-content: space-between; gap: 2rem;">`;
                        answerHtml += `<div style="flex: 1;"><strong>Esquerdo:</strong><br>${leftMuscles.length > 0 ? leftMuscles.join('<br>') : '-'}</div>`;
                        answerHtml += `<div style="flex: 1;"><strong>Direito:</strong><br>${rightMuscles.length > 0 ? rightMuscles.join('<br>') : '-'}</div>`;
                        answerHtml += `</div>`;

                        // Set a special flag so rendering knows this is raw HTML
                        qaPairs.push({
                            section: section.title,
                            question: 'Músculos Positivos',
                            answer: answerHtml,
                            isHtml: true
                        });
                    }
                } else if (section.id.includes('neuro_forca')) {
                    const rowsContent = [];
                    section.rows.forEach(row => {
                        const rowData = sectionData[row.id];
                        if (rowData && (rowData.esquerdo || rowData.direito)) {
                            rowsContent.push(`
                                <div style="display: flex; border-bottom: 1px dashed #f0f0f0; padding: 6px 0;">
                                    <div style="flex: 2; font-weight: 500;">${row.label}</div>
                                    <div style="flex: 1; text-align: center;">${rowData.esquerdo || '-'}</div>
                                    <div style="flex: 1; text-align: center;">${rowData.direito || '-'}</div>
                                </div>
                            `);
                        }
                    });

                    if (rowsContent.length > 0) {
                        let answerHtml = `
                            <div style="display: flex; background: #fafafa; padding: 6px 0; font-weight: bold; border-bottom: 1px solid #ccc; font-size: 0.9em; text-transform: uppercase;">
                                <div style="flex: 2; padding-left: 4px;">Raiz / Músculo</div>
                                <div style="flex: 1; text-align: center;">Esquerdo</div>
                                <div style="flex: 1; text-align: center;">Direito</div>
                            </div>
                            <div style="font-size: 0.95rem; color: #444;">
                                ${rowsContent.join('')}
                            </div>
                        `;

                        qaPairs.push({
                            section: section.title,
                            question: 'Tabela de Força Muscular',
                            answer: answerHtml,
                            isHtml: true
                        });
                    }
                } else if (section.id.includes('testes_neurais') || section.id.includes('teste_neural')) {
                    const rowsContent = [];
                    section.rows.forEach(row => {
                        const rowData = sectionData[row.id];
                        if (rowData) {
                            let valEsq = rowData.esquerdo === true ? 'Positivo' : (rowData.esquerdo === false ? 'Negativo' : '-');
                            let valDir = rowData.direito === true ? 'Positivo' : (rowData.direito === false ? 'Negativo' : '-');

                            // Se apenas marcou um lado e o outro ficou undefined, na checkbox do layout v2 assume falso
                            if (valEsq === '-' && valDir !== '-') valEsq = 'Negativo';
                            if (valDir === '-' && valEsq !== '-') valDir = 'Negativo';

                            if (valEsq !== '-' || valDir !== '-') {
                                rowsContent.push(`
                                    <div style="display: flex; border-bottom: 1px dashed #f0f0f0; padding: 6px 0;">
                                        <div style="flex: 2; font-weight: 500;">${row.label}</div>
                                        <div style="flex: 1; text-align: center; color: ${valEsq === 'Positivo' ? 'var(--primary-red)' : '#666'}">${valEsq}</div>
                                        <div style="flex: 1; text-align: center; color: ${valDir === 'Positivo' ? 'var(--primary-red)' : '#666'}">${valDir}</div>
                                    </div>
                                `);
                            }
                        }
                    });

                    if (rowsContent.length > 0) {
                        let answerHtml = `
                            <div style="display: flex; background: #fafafa; padding: 6px 0; font-weight: bold; border-bottom: 1px solid #ccc; font-size: 0.9em; text-transform: uppercase;">
                                <div style="flex: 2; padding-left: 4px;">Nervo / Teste</div>
                                <div style="flex: 1; text-align: center;">Esquerdo</div>
                                <div style="flex: 1; text-align: center;">Direito</div>
                            </div>
                            <div style="font-size: 0.95rem; color: #444;">
                                ${rowsContent.join('')}
                            </div>
                        `;

                        qaPairs.push({
                            section: section.title,
                            question: 'Resultados dos Testes de Tensão',
                            answer: answerHtml,
                            isHtml: true
                        });
                    }
                } else {
                    section.rows.forEach(row => {
                        const rowData = sectionData[row.id];
                        if (rowData) {
                            const parts = [];
                            if (row.fields) {
                                row.fields.forEach(f => {
                                    const fId = typeof f === 'object' ? f.id : f;
                                    let val = rowData[fId];

                                    // Especial para Testes Neurais (mostrar Positivo / Negativo mesmo se false, desde que seja checkbox)
                                    if (section.id.includes('neurais') || section.id.includes('neural')) {
                                        if (typeof f === 'object' && f.type === 'checkbox') {
                                            if (val === undefined) val = false;
                                            parts.push(`${fId.charAt(0).toUpperCase() + fId.slice(1)}: ${val ? 'Positivo' : 'Negativo'}`);
                                            return;
                                        }
                                    }

                                    if (val !== undefined && val !== null && val !== '' && val !== false) {
                                        if (fId === 'dor') {
                                            parts.push('Dor');
                                        } else if (fId === 'intensidade') {
                                            parts.push(`Intensidade: ${val}`);
                                        } else if (['normal', 'hiper', 'hiperreflexia', 'hipo', 'hiporeflexia'].includes(fId.toLowerCase())) {
                                            let reflexName = fId.charAt(0).toUpperCase() + fId.slice(1);
                                            if (fId.toLowerCase() === 'hiper') reflexName = 'Hiperreflexia';
                                            if (fId.toLowerCase() === 'hipo') reflexName = 'Hiporreflexia';
                                            parts.push(reflexName);
                                        } else if (section.id.includes('movimento')) {
                                            if (fId === 'graus') parts.push(`${val} graus`);
                                            else if (fId === 'observacoes') parts.push(val);
                                        } else {
                                            let labelText = typeof f === 'object' && f.label ? f.label : fId.charAt(0).toUpperCase() + fId.slice(1);
                                            let displayVal = val;
                                            if (typeof val === 'boolean' && val === true) displayVal = 'Sim';
                                            parts.push(`${labelText}: ${displayVal}`);
                                        }
                                    }
                                });
                            }
                            if (parts.length > 0) {
                                let joinStr = ', ';
                                if (!section.id.includes('neuro') && !section.id.includes('reflexo') && !section.id.includes('movimento') && !section.id.includes('palpacao') && !section.id.includes('neural') && !section.id.includes('miofascial')) {
                                    joinStr = ' | ';
                                }
                                qaPairs.push({
                                    section: section.title,
                                    question: row.label,
                                    answer: parts.join(joinStr)
                                });
                            }
                        }
                    });
                }
            }
        });
    }

    let result = {};
    if (q.calculateScore) {
        result = q.calculateScore(q.type === 'clinical' ? state.clinicalData : actualAnswers);
    } else {
        // Fallback for clinical evaluations without scores
        result = { score: 0, percentage: 0, interpretation: 'Avaliação Clínica concluída.', max: 0, unit: '' };
    }

    result.qaPairs = qaPairs;

    // Attach collected body schemas (Fix for ReferenceError crash)
    if (collectedBodySchemas.length > 0) {
        result.bodySchemas = collectedBodySchemas;
    }

    if (q.id === 'ndi') {
        localStorage.setItem('ndi_sync_result', `${result.score} pts (${result.interpretation})`);
    } else if (q.id === 'oswestry') {
        localStorage.setItem('oswestry_sync_result', `${result.percentage}% - ${result.interpretation}`);
    } else if (q.id === 'quickdash' || q.id === 'lysholm' || q.id === 'ikdc' || q.id === 'aofas' || q.id === 'man' || q.id === 'ves13' || q.id === 'lbpq' || q.id === 'brief') {
        localStorage.setItem(`${q.id}_sync_result`, `${result.score} pts - ${result.interpretation}`);
    } else if (q.id === 'womac') {
        localStorage.setItem('womac_sync_result', `${result.score} pts (${result.percentage}%) - ${result.interpretation}`);
    }

    // --- Save to Supabase Workflow ---
    if (state.isQuickAssessment) {
        // Stop and ask if they want to save
        state.pendingQuickSaveData = { q, result, answers: state.answers, clinicalData: state.clinicalData };

        const modal = document.getElementById('modal-save-quick-assessment');
        modal.classList.remove('hidden');
        modal.style.pointerEvents = 'auto';

        // Expose global functions for the HTML buttons
        window.showResultsWithoutSaving = () => {
            renderResults(result);
            navigateTo('view-results');
        };

        window.navigateToPatientRegistrationForQuickSave = () => {
            navigateTo('view-patient-info');
        };

    } else if (state.patientId) {
        // Patient is known, save silently in background
        const submitBtnObj = document.getElementById('btn-next');
        const originalTextObj = submitBtnObj ? submitBtnObj.innerHTML : '';
        if (submitBtnObj) { submitBtnObj.innerHTML = 'Processando...'; submitBtnObj.disabled = true; }

        try {
            await window.db.saveAssessment({
                patient_id: state.patientId,
                assessment_type: q.id,
                segment: state.selectedSegment,
                clinical_data: q.type === 'clinical' ? state.clinicalData : null,
                questionnaire_answers: q.type !== 'clinical' ? state.answers : null
            });
        } catch (e) {
            console.error("Failed to save assessment to Supabase:", e);
            // Fail gracefully to results anyway
        } finally {
            if (submitBtnObj) { submitBtnObj.innerHTML = originalTextObj; submitBtnObj.disabled = false; }
        }

        renderResults(result);
        navigateTo('view-results');
    } else {
        // Edge case fallback
        renderResults(result);
        navigateTo('view-results');
    }
}

// 6. Render Results with Patient Info
function renderResults(result) {
    const q = state.currentQuestionnaire;

    // Format date specifically for Brazil (DD/MM/YYYY)
    const dateObj = new Date(state.patientInfo.date);
    // Ajustar fuso horário local
    dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
    const formattedDate = new Intl.DateTimeFormat('pt-BR').format(dateObj);

    let qaSectionHtml = '';
    if (result.qaPairs && result.qaPairs.length > 0) {
        let qaListHtml = '';
        let lastSection = null;
        result.qaPairs.forEach((pair, i) => {
            let sectionHeader = '';
            if (pair.section && pair.section !== lastSection) {
                // Changed to dark red for the section headers 
                sectionHeader = `<div style="margin-top: 1.5rem; margin-bottom: 0.5rem; font-weight: bold; color: var(--primary-red); text-transform: uppercase; font-size: 0.9rem; border-bottom: 1px solid #ccc; padding-bottom: 0.2rem;">${pair.section}</div>`;
                lastSection = pair.section;
            }

            let pairContent = '';
            if (q.type === 'clinical') {
                pairContent = `<div style="margin: 0; font-size: 0.95rem;">
                                   ${pair.isHtml ? pair.answer : `
                                   <span style="font-weight: 600; color: #333;">${pair.question}:</span> 
                                   <span style="color: #666; white-space: pre-wrap; margin-left: 0.3rem;">${pair.answer}</span>
                                   `}
                               </div>`;
            } else {
                pairContent = `<p style="font-weight: 600; color: #333; margin: 0 0 0.3rem 0; font-size: 0.95rem;">
                                   P${i + 1}: ${pair.question}
                               </p>
                               <p style="color: #666; margin: 0; white-space: pre-wrap; font-size: 0.95rem;">
                                   R: ${pair.answer}
                               </p>`;
            }

            qaListHtml += `
                ${sectionHeader}
                <div style="padding-bottom: ${q.type === 'clinical' ? '0.4rem' : '0.8rem'}; border-bottom: 1px dashed #f0f0f0;">
                    ${pairContent}
                </div>
            `;
        });

        // Duplicated Detalhamento header removed
        qaSectionHtml = `
            <div class="results-qa-section" style="text-align: left; margin-top: 1rem;">
                ${q.type === 'clinical' ? '' : `<h4 style="color: var(--primary-red); margin-bottom: 1.2rem;">Respostas do Paciente</h4>`}
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${qaListHtml}
                </div>
            </div>
        `;
    }

    let html = `
        <header class="view-header">
            <h2 class="no-print">Resultado da Avaliação</h2>
            <p class="no-print" style="color: var(--text-muted);">${q.title}</p>
            <h2 class="print-only" style="font-size: 1.6rem; font-weight: 800; color: #1a1a1a; margin: 0;">${q.title}</h2>
        </header>

        <div class="results-container glass-panel">
            <div style="text-align: left; border-bottom: 1px solid #eee; padding-bottom: 1.5rem; margin-bottom: 2rem;">
                <p><strong>Paciente:</strong> ${state.patientInfo.name}</p>
                <p><strong>Idade:</strong> ${state.patientInfo.age} anos</p>
                <p><strong>Sexo:</strong> ${state.patientInfo.gender}</p>
                ${state.selectedSegment === 'cotovelo' ? `<p><strong>Dominância:</strong> ${state.patientInfo.dominance}</p>` : ''}
                <p><strong>Data:</strong> ${formattedDate}</p>
            </div>

            ${q.type === 'clinical' ? '' : `
                <div class="score-circle">
                    ${result.percentage !== undefined ? result.percentage : result.score}<span style="font-size:1.5rem">${result.unit === '%' ? '%' : ''}</span>
                </div>
                
                <h3 style="font-size:2rem; margin-bottom: 0.5rem; color: var(--text-main);">
                    Score: ${result.score} <span style="font-size:1rem; color:var(--text-muted)">/ ${result.max} ${result.unit !== '%' ? result.unit : ''}</span>
                </h3>
                
                <div class="results-interpretation">
                    <strong>Interpretação Clínica:</strong> ${result.interpretation}
                </div>
            `}

            ${result.details ? `
                <div class="results-details" style="text-align: left; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
                    <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Detalhamento Clínico</h4>
                    
                    ${state.clinicalData && state.clinicalData.anamnese && state.clinicalData.anamnese.intensidade_dor !== undefined ? `
                        <div class="glass-panel" style="margin-bottom: 1.5rem; text-align: center;">
                            <p><strong>Intensidade da Dor (EVA):</strong> <span style="font-size: 1.5rem; font-weight: bold; color: var(--primary-red);">${state.clinicalData.anamnese.intensidade_dor}</span> / 10</p>
                        </div>
                    ` : ''}

                    ${(result.bodySchemas || []).map((bs, idx) => `
                        <div class="glass-panel" style="margin-bottom: 1.5rem; text-align: center;">
                            <p><strong>${bs.title}:</strong></p>
                            ${bs.dataUrl
            ? `<img src="${bs.dataUrl}" style="max-width: 50%; border-radius: 8px; border: 1px solid #eee; margin-top: 0.5rem; display: inline-block;">`
            : `<canvas id="res-canvas-bs-${idx}" data-image="${bs.image}" style="max-width: 50%; border-radius: 8px; border: 1px solid #eee; margin-top: 0.5rem; display: inline-block;"></canvas>`
        }
                        </div>
                    `).join('')}

                    ${result.details.lysholm ? `
                        <p><strong>Lysholm Score:</strong> ${result.details.lysholm.score} pts (${result.details.lysholm.interpretation})</p>
                    ` : ''}

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                        ${Object.keys(result.details).filter(k => k !== 'lysholm' && k !== 'relacao_iq' && k !== 'relacao_rlrm').map(m =>
            result.details[m] ? `<div class="glass-panel" style="padding: 0.5rem; font-size: 0.9rem;">
                                <strong>Déficit ${m.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Abd ', 'Abdução ').replace('Rl ', 'RL ').replace('Rm ', 'RM ')}:</strong> ${result.details[m].deficit}
                            </div>` : ''
        ).join('')}
                    </div>

                    ${result.details.relacao_iq ? `
                        <div class="glass-panel" style="margin-top: 1rem; padding: 0.8rem; border-left: 4px solid var(--primary-red);">
                            <p><strong>Relação I/Q:</strong> Esq: ${result.details.relacao_iq.esquerdo} | Dir: ${result.details.relacao_iq.direito} | Déficit: ${result.details.relacao_iq.deficit}</p>
                        </div>
                    ` : ''}

                    ${result.details.relacao_rlrm ? `
                        <div class="glass-panel" style="margin-top: 1rem; padding: 0.8rem; border-left: 4px solid var(--primary-red);">
                            <p><strong>Relação RL/RM:</strong> Esq: ${result.details.relacao_rlrm.esquerdo} | Dir: ${result.details.relacao_rlrm.direito} | Déficit: ${result.details.relacao_rlrm.deficit}</p>
                            <p style="font-size: 0.8rem; color: #666; margin-top: 0.3rem;">* Valor normativo RL/RM: 72-76%</p>
                        </div>
                    ` : ''}
                </div>
                
                ${renderChartsHtml(q, result)}
            ` : ''}

            ${qaSectionHtml}

            <div style="margin-top: 3rem; display: flex; gap: 1rem; justify-content: center;" class="no-print">
                <button class="btn btn-secondary" id="btn-restart">
                    Nova Avaliação
                </button>
                <a class="btn btn-whatsapp" id="btn-whatsapp" target="_blank" rel="noopener">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right:0.5rem"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                    Compartilhar no WhatsApp
                </a>
                <button class="btn btn-primary" onclick="window.print()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.5rem"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Imprimir Resultado
                </button>
            </div>
        </div>
    `;

    views['view-results'].innerHTML = html;

    // Draw body schemas in results to bypass toDataURL taint issues
    if (result.bodySchemas) {
        result.bodySchemas.forEach((bs, idx) => {
            const canvas = document.getElementById(`res-canvas-bs-${idx}`);
            if (canvas) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = bs.image;
                img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    // redraw history
                    if (bs.history && bs.history.length > 0) {
                        bs.history.forEach(action => {
                            if (action.type === 'line' && action.points && action.points.length > 0) {
                                ctx.beginPath();
                                ctx.strokeStyle = 'rgba(217, 43, 43, 0.6)'; // Red color, slightly transparent
                                ctx.lineWidth = 24; // Original max width
                                ctx.lineCap = 'round';
                                ctx.lineJoin = 'round';
                                ctx.moveTo(action.points[0].x, action.points[0].y);
                                for (let i = 1; i < action.points.length; i++) {
                                    ctx.lineTo(action.points[i].x, action.points[i].y);
                                }
                                ctx.stroke();
                            } else if (action.x && action.y) {
                                ctx.beginPath();
                                ctx.arc(action.x, action.y, 8, 0, 2 * Math.PI);
                                ctx.fillStyle = action.color || 'rgba(255, 0, 0, 0.5)';
                                ctx.fill();
                            }
                        });
                    }
                };
            }
        });
    }

    // Generate PDF and Share via WhatsApp/System Dialog
    const btnWA = document.getElementById('btn-whatsapp');
    if (btnWA) {
        // Change from <a> to <button> style behavior
        btnWA.removeAttribute('href');
        btnWA.removeAttribute('target');
        btnWA.style.cursor = 'pointer';

        btnWA.addEventListener('click', async (e) => {
            e.preventDefault();
            const originalText = btnWA.innerHTML;
            btnWA.innerHTML = 'Gerando PDF...';
            btnWA.style.opacity = '0.7';
            btnWA.style.pointerEvents = 'none';

            try {
                const element = document.querySelector('.results-container');
                const opt = {
                    margin: 10,
                    filename: `Avaliacao_${state.patientInfo.name.replace(/\s+/g, '_')}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                const waMessage = `Olá ${state.patientInfo.name}, este é o resultado da sua avaliação: ${q.title}.${result.score !== undefined ? `\nScore: ${result.score}` : ''}`;
                const encodedText = encodeURIComponent(waMessage);
                const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

                // Generate PDF as Blob
                const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
                const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

                // Check if device supports native file sharing and is mobile
                if (navigator.canShare && navigator.canShare({ files: [file] }) && /Mobi|Android/i.test(navigator.userAgent)) {
                    await navigator.share({
                        files: [file],
                        title: 'Resultado de Avaliação',
                        text: waMessage
                    });
                } else {
                    // Fallback for browsers that don't support file sharing or Desktop: download and open WA link
                    alert("Atenção: O WhatsApp Web não permite anexar arquivos de forma automática.\n\nO PDF foi baixado no seu computador. Quando a tela do WhatsApp abrir, anexe o PDF gerado manualmente na conversa.");

                    const url = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = opt.filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    setTimeout(() => {
                        window.open(whatsappUrl, '_blank');
                    }, 500);
                }
            } catch (err) {
                console.error('Erro ao gerar/compartilhar PDF:', err);
                alert("Houve um erro ao tentar gerar o PDF. Verifique se todas as imagens carregaram corretamente.");
            } finally {
                btnWA.innerHTML = originalText;
                btnWA.style.opacity = '1';
                btnWA.style.pointerEvents = 'auto';
            }
        });
    }

    document.getElementById('btn-restart').addEventListener('click', () => {
        // Clear patient info and select segment again
        state.patientInfo = null;
        state.clinicalData = {};
        state.answers = {};
        state.currentQuestionnaire = null;
        state.currentQuestionIndex = 0;
        document.getElementById('patient-form').reset();

        // Return to Segment page by default
        state.selectedSegment = null;
        navigateTo('view-segments');
    });

    // Render charts if necessary
    renderCharts();
}

function renderChartsHtml(q, result) {
    if (!state.clinicalData) return '';
    let html = '';

    // Preensao Palmar
    if (state.clinicalData.forca_preensao) {
        const preensao = state.clinicalData.forca_preensao.preensao_palmar;
        if (preensao && (preensao.esquerdo || preensao.direito)) {
            html += `
            <div class="results-details" style="text-align: left; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
                <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Análise de Preensão Palmar</h4>
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div id="preensao-palmar-text-results"></div>
                    <div style="height: 300px; margin-top: 1.5rem;">
                        <canvas id="preensaoPalmarChart"></canvas>
                    </div>
                </div>
            </div>
            `;
        }

        // Pinca Lateral
        const pinca = state.clinicalData.forca_preensao.pinca_lateral;
        if (pinca && (pinca.esquerdo || pinca.direito)) {
            html += `
        <div class="results-details" style="text-align: left; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
            <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Análise de Pinça Lateral (Chave)</h4>
            <div class="glass-panel" style="padding: 1.5rem;">
                <div id="pinca-lateral-text-results"></div>
                <div style="height: 300px; margin-top: 1.5rem;">
                    <canvas id="pincaLateralChart"></canvas>
                </div>
            </div>
        </div>
        `;
        }

        // Pinca Tripode
        const tripode = state.clinicalData.forca_preensao.pinca_tripode;
        if (tripode && (tripode.esquerdo || tripode.direito)) {
            html += `
        <div class="results-details" style="text-align: left; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
            <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Análise de Pinça Trípode (Palmer Pinch)</h4>
            <div class="glass-panel" style="padding: 1.5rem;">
                <div id="pinca-tripode-text-results"></div>
                <div style="height: 300px; margin-top: 1.5rem;">
                    <canvas id="pincaTripodeChart"></canvas>
                </div>
            </div>
        </div>
        `;
        }

        // Pinca Polpa a Polpa
        const polpa = state.clinicalData.forca_preensao.pinca_polpa;
        if (polpa && (polpa.esquerdo || polpa.direito)) {
            html += `
            <div class="results-details" style="text-align: left; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
                <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Análise de Pinça Polpa a Polpa (Tip Pinch)</h4>
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div id="pinca-polpa-text-results"></div>
                    <div style="height: 300px; margin-top: 1.5rem;">
                        <canvas id="pincaPolpaChart"></canvas>
                    </div>
                </div>
            </div>
            `;
        }
    }

    // --- Hip Strength Charts HTML ---
    if (state.clinicalData.forca) {
        const tests = [
            { id: 'abd_quadril', title: 'Abdução de Quadril' },
            { id: 'ext_quadril', title: 'Extensão de Quadril' },
            { id: 'flex_quadril', title: 'Flexão de Quadril' },
            { id: 'rot_int_quadril', title: 'Rotação Interna de Quadril' }
        ];

        tests.forEach(test => {
            const data = state.clinicalData.forca[test.id];
            if (data && (data.esquerdo || data.direito)) {
                html += `
                <div class="results-details" style="text-align: left; margin-top: 2rem; border-top: 1px solid #eee; padding-top: 1.5rem;">
                    <h4 style="color: var(--primary-red); margin-bottom: 1rem;">Análise de ${test.title}</h4>
                    <div class="glass-panel" style="padding: 1.5rem;">
                        <div id="${test.id}-text-results"></div>
                        <div style="height: 300px; margin-top: 1.5rem;">
                            <canvas id="${test.id}-Chart"></canvas>
                        </div>
                    </div>
                </div>
                `;
            }
        });
    }

    return html;
}

function renderCharts() {
    if (!state.clinicalData) return;

    const age = parseInt(state.patientInfo.age);
    const gender = state.patientInfo.gender; // "Masculino" or "Feminino"
    const dominance = state.patientInfo.dominance; // "Destro" or "Canhoto"

    if (isNaN(age)) return;

    // Helper for rendering a single chart
    const renderIndividualChart = (testId, canvasId, textContainerId, title, refDataMap) => {
        if (!state.clinicalData.forca_preensao) return;
        const testData = state.clinicalData.forca_preensao[testId];
        if (!testData || (!testData.esquerdo && !testData.direito)) return;

        const esq = parseFloat(testData.esquerdo);
        const dir = parseFloat(testData.direito);
        if (isNaN(esq) && isNaN(dir)) return;

        if (!refDataMap || !refDataMap[gender]) return;

        // Find reference block
        const refData = refDataMap[gender].find(r => age >= r.minAge && age <= r.maxAge) || refDataMap[gender][refDataMap[gender].length - 1];

        const labels = [];
        const classResults = [];

        // For Preensao Palmar: refData has minNormal, maxNormal
        // For Pinca Lateral, Tripode and Polpa: refData has domMin, domMax, ndomMin, ndomMax
        const isPinca = testId === 'pinca_lateral' || testId === 'pinca_tripode' || testId === 'pinca_polpa';

        const getLimits = (lado) => {
            if (!isPinca) return { min: refData.minNormal, max: refData.maxNormal };
            // For Pincas, determine if side is dominant
            const isDom = (lado === 'Direito' && dominance === 'Destro') || (lado === 'Esquerdo' && dominance === 'Canhoto');
            if (isDom) return { min: refData.domMin, max: refData.domMax };
            return { min: refData.ndomMin, max: refData.ndomMax };
        };

        const getClassification = (val, limits) => {
            if (val < limits.min) return "Fraco";
            if (val > limits.max) return "Forte";
            return "Normal";
        };

        if (!isNaN(esq)) {
            labels.push("Esquerdo");
            classResults.push({ lado: "Esquerdo", valor: esq, limits: getLimits("Esquerdo") });
        }
        if (!isNaN(dir)) {
            labels.push("Direito");
            classResults.push({ lado: "Direito", valor: dir, limits: getLimits("Direito") });
        }

        classResults.forEach(r => {
            r.class = getClassification(r.valor, r.limits);
        });

        const textContainer = document.getElementById(textContainerId);
        if (textContainer) {
            let textHtml = '';
            if (!isPinca) {
                textHtml += `<p style="margin-bottom: 0.5rem; color: #555;">Valores de Referência (${gender}, ${age} anos): <strong>${refData.minNormal} a ${refData.maxNormal} kgF</strong></p>`;
            } else {
                textHtml += `<p style="margin-bottom: 0.5rem; color: #555;">Valores de Referência (${gender}, ${age} anos, <strong>${dominance}</strong>):</p>`;
            }

            classResults.forEach(r => {
                let color = r.class === "Normal" ? "#2ecc71" : (r.class === "Fraco" ? "#e74c3c" : "#3498db");
                if (isPinca) {
                    textHtml += `<p>Membro ${r.lado} (Ref: ${r.limits.min} a ${r.limits.max} kgF): ${r.valor} kgF - <strong style="color: ${color};">${r.class}</strong></p>`;
                } else {
                    textHtml += `<p>Membro ${r.lado}: ${r.valor} kgF - <strong style="color: ${color};">${r.class}</strong></p>`;
                }
            });
            textContainer.innerHTML = textHtml;
        }

        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const pacienteData = classResults.map(r => r.valor);
        const minNormalData = classResults.map(r => r.limits.min);
        const maxNormalData = classResults.map(r => r.limits.max);

        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Paciente (kgF)',
                        data: pacienteData,
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgba(41, 128, 185, 1)',
                        borderWidth: 1,
                        order: 2
                    },
                    {
                        label: 'Normal Mínimo',
                        type: 'line',
                        data: minNormalData,
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        order: 1
                    },
                    {
                        label: 'Normal Máximo',
                        type: 'line',
                        data: maxNormalData,
                        borderColor: 'rgba(46, 204, 113, 1)',
                        borderWidth: 2,
                        fill: '-1',
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        order: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: 'Força (kgF)' }
                    }
                },
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: title }
                }
            }
        });
    };

    renderIndividualChart('preensao_palmar', 'preensaoPalmarChart', 'preensao-palmar-text-results', 'Comparativo de Força de Preensão Palmar', referencePreensaoPalmar);
    renderIndividualChart('pinca_lateral', 'pincaLateralChart', 'pinca-lateral-text-results', 'Comparativo de Pinça Lateral (Chave)', referencePincaLateral);
    renderIndividualChart('pinca_tripode', 'pincaTripodeChart', 'pinca-tripode-text-results', 'Comparativo de Pinça Trípode (Palmer Pinch)', referencePincaTripode);
    renderIndividualChart('pinca_polpa', 'pincaPolpaChart', 'pinca-polpa-text-results', 'Comparativo de Pinça Polpa a Polpa (Tip Pinch)', referencePincaPolpa);

    // --- Hip Strength Charts Logic ---
    if (state.clinicalData.forca && typeof referenceForcaQuadril !== 'undefined') {
        const activityLevel = state.patientInfo.activityLevel || 'Ativo';

        // Helper specifically for Hip Strength (Mean +/- SD logic)
        const renderIndividualHipChart = (testId, metricPrefix, canvasId, textContainerId, title) => {
            const testData = state.clinicalData.forca[testId];
            if (!testData || (!testData.esquerdo && !testData.direito)) return;

            const esq = parseFloat(testData.esquerdo);
            const dir = parseFloat(testData.direito);
            if (isNaN(esq) && isNaN(dir)) return;

            if (!referenceForcaQuadril[gender] || !referenceForcaQuadril[gender][activityLevel]) return;

            // Find reference block for Hip (Activity Level included)
            const refGroup = referenceForcaQuadril[gender][activityLevel];
            const refData = refGroup.find(r => age >= r.minAge && age <= r.maxAge) || refGroup[refGroup.length - 1];

            const labels = [];
            const classResults = [];

            // Calculate Normal Limits (Mean +/- SD)
            const getLimits = (lado) => {
                const suffix = lado === 'Direito' ? '_d' : '_e';
                const mean = refData[`${metricPrefix}${suffix}`];
                const sd = refData[`sd_${metricPrefix}${suffix}`];
                return {
                    min: parseFloat((mean - sd).toFixed(1)),
                    max: parseFloat((mean + sd).toFixed(1)),
                    mean: mean
                };
            };

            const getClassification = (val, limits) => {
                if (val < limits.min) return "Fraco";
                if (val > limits.max) return "Forte";
                return "Normal";
            };

            if (!isNaN(esq)) {
                labels.push("Esquerdo");
                classResults.push({ lado: "Esquerdo", valor: esq, limits: getLimits("Esquerdo") });
            }
            if (!isNaN(dir)) {
                labels.push("Direito");
                classResults.push({ lado: "Direito", valor: dir, limits: getLimits("Direito") });
            }

            classResults.forEach(r => {
                r.class = getClassification(r.valor, r.limits);
            });

            const textContainer = document.getElementById(textContainerId);
            if (textContainer) {
                let textHtml = `<p style="margin-bottom: 0.5rem; color: #555;">Valores Normativos (${gender}, ${age} anos, ${activityLevel}):</p>`;

                classResults.forEach(r => {
                    let color = r.class === "Normal" ? "#2ecc71" : (r.class === "Fraco" ? "#e74c3c" : "#3498db");
                    textHtml += `<p>Membro ${r.lado} (Média ${r.limits.mean} / Ref: ${r.limits.min} a ${r.limits.max} kgF): ${r.valor} kgF - <strong style="color: ${color};">${r.class}</strong></p>`;
                });
                textContainer.innerHTML = textHtml;
            }

            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            const pacienteData = classResults.map(r => r.valor);
            const minNormalData = classResults.map(r => r.limits.min);
            const maxNormalData = classResults.map(r => r.limits.max);

            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Paciente (kgF)',
                            data: pacienteData,
                            backgroundColor: 'rgba(52, 152, 219, 0.7)',
                            borderColor: 'rgba(41, 128, 185, 1)',
                            borderWidth: 1,
                            order: 2
                        },
                        {
                            label: 'Desvio Inferior',
                            type: 'line',
                            data: minNormalData,
                            borderColor: 'rgba(46, 204, 113, 1)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            fill: false,
                            order: 1
                        },
                        {
                            label: 'Desvio Superior',
                            type: 'line',
                            data: maxNormalData,
                            borderColor: 'rgba(46, 204, 113, 1)',
                            borderWidth: 2,
                            fill: '-1',
                            backgroundColor: 'rgba(46, 204, 113, 0.2)',
                            order: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: 'Força (kgF)' }
                        }
                    },
                    plugins: {
                        legend: { position: 'bottom' },
                        title: { display: true, text: title }
                    }
                }
            });
        };

        renderIndividualHipChart('abd_quadril', 'abd', 'abd_quadril-Chart', 'abd_quadril-text-results', 'Percentil de Abdução');
        renderIndividualHipChart('ext_quadril', 'ext', 'ext_quadril-Chart', 'ext_quadril-text-results', 'Percentil de Extensão');
        renderIndividualHipChart('flex_quadril', 'flx', 'flex_quadril-Chart', 'flex_quadril-text-results', 'Percentil de Flexão');
        renderIndividualHipChart('rot_int_quadril', 'rotl', 'rot_int_quadril-Chart', 'rot_int_quadril-text-results', 'Percentil de Rotação Interna');
    }
}

// Run app
document.addEventListener('DOMContentLoaded', initApp);
