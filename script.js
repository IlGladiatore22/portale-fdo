// ==================== CONFIGURAZIONE SUPABASE ====================
const SUPABASE_URL = 'https://wykhiqymjoykkzepthpf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5a2hpcXltam95a2t6ZXB0aHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjg1MzMsImV4cCI6MjA4NjkwNDUzM30.ygR0sHEU5b5U3LoE4tkjHc8LpBXLB7ELOJLpMhpjTqY';

// Leggi dati da Supabase
async function dbGet(table) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=id.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (!res.ok) throw new Error('Errore lettura');
        return await res.json();
    } catch (e) {
        console.error(`Errore dbGet(${table}):`, e);
        return [];
    }
}

// Inserisci record su Supabase
async function dbInsert(table, record) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(record)
        });
        if (!res.ok) {
            const err = await res.text();
            throw new Error(err);
        }
        return true;
    } catch (e) {
        console.error(`Errore dbInsert(${table}):`, e);
        return false;
    }
}

// Aggiorna record su Supabase
async function dbUpdate(table, id, record) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(record)
        });
        if (!res.ok) throw new Error('Errore aggiornamento');
        return true;
    } catch (e) {
        console.error(`Errore dbUpdate(${table}):`, e);
        return false;
    }
}

// Elimina record da Supabase
async function dbDelete(table, id) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (!res.ok) throw new Error('Errore eliminazione');
        return true;
    } catch (e) {
        console.error(`Errore dbDelete(${table}):`, e);
        return false;
    }
}

// ==================== GESTIONE TEMA ====================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
htmlElement.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ==================== GESTIONE LOGIN ====================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    const togglePassword = document.getElementById('togglePassword');
    const userTypeSelection = document.getElementById('userTypeSelection');
    const btnCittadino = document.getElementById('btnCittadino');
    const btnForzeOrdine = document.getElementById('btnForzeOrdine');
    const btnBackSelection = document.getElementById('btnBackSelection');
    const loginTitle = document.getElementById('loginTitle');
    const loginHint = document.getElementById('loginHint');

    let selectedUserType = null;

    if (btnCittadino) {
        btnCittadino.addEventListener('click', () => {
            selectedUserType = 'cittadino';
            userTypeSelection.style.display = 'none';
            loginForm.style.display = 'flex';
            loginTitle.textContent = 'Accesso Cittadino';
            loginHint.innerHTML = '<i class="fas fa-info-circle"></i> Usa il tuo <strong>Username Discord</strong> e la <strong>Password</strong> che hai scelto';
            usernameInput.placeholder = 'Username Discord';
            passwordInput.placeholder = 'Password';
        });
    }

    if (btnForzeOrdine) {
        btnForzeOrdine.addEventListener('click', () => {
            selectedUserType = 'forze';
            userTypeSelection.style.display = 'none';
            loginForm.style.display = 'flex';
            loginTitle.textContent = 'Accesso Forze dell\'Ordine';
            loginHint.innerHTML = '<i class="fas fa-info-circle"></i> Accesso riservato ad <strong>Amministratori</strong> e <strong>Agenti</strong>';
            usernameInput.placeholder = 'Username';
            passwordInput.placeholder = 'Password';
        });
    }

    if (btnBackSelection) {
        btnBackSelection.addEventListener('click', () => {
            selectedUserType = null;
            userTypeSelection.style.display = 'block';
            loginForm.style.display = 'none';
            loginForm.reset();
            errorMessage.classList.remove('show');
        });
    }

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            const icon = togglePassword.querySelector('i');
            icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
        });
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) { showError('Inserisci username e password'); return; }
        if (!selectedUserType) { showError('Seleziona prima il tipo di accesso'); return; }

        if (selectedUserType === 'cittadino') {
            const cittadini = await dbGet('cittadini_auto_registrati');
            const cittadino = cittadini.find(c =>
                c.username_discord.toLowerCase() === username.toLowerCase() && c.password === password
            );
            if (cittadino) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', cittadino.username_discord);
                localStorage.setItem('isAdmin', 'false');
                localStorage.setItem('userType', 'cittadino');
                localStorage.setItem('usernameDiscord', cittadino.username_discord);
                loginForm.style.opacity = '0';
                setTimeout(() => { window.location.href = 'bandi.html'; }, 300);
            } else {
                showError('Username Discord o Password errati. <a href="registrazione-cittadino.html" style="color:#3b82f6;text-decoration:underline;">Registrati qui</a>');
            }
            return;
        }

        if (selectedUserType === 'forze') {
            const adminCredentials = [
                { username: 'admin', password: 'admin' },
                { username: 'amministratore', password: 'admin123' }
            ];
            const isAdmin = adminCredentials.some(
                c => c.username.toLowerCase() === username.toLowerCase() && c.password === password
            );
            if (isAdmin) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('userType', 'admin');
                loginForm.style.opacity = '0';
                setTimeout(() => { window.location.href = 'index.html'; }, 300);
                return;
            }

            const agenti = await dbGet('agenti');
            const agente = agenti.find(a =>
                a.username.toLowerCase() === username.toLowerCase() && a.password === password
            );
            if (agente) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', agente.username);
                localStorage.setItem('isAdmin', 'false');
                localStorage.setItem('userType', 'agente');
                localStorage.setItem('agenteBadge', agente.matricola);
                loginForm.style.opacity = '0';
                setTimeout(() => { window.location.href = 'index.html'; }, 300);
                return;
            }
            showError('Credenziali non valide.');
        }
    });

    function showError(message) {
        errorMessage.innerHTML = message;
        errorMessage.classList.add('show');
        setTimeout(() => { errorMessage.classList.remove('show'); }, 4000);
    }
}

// ==================== GESTIONE DASHBOARD ====================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    if (!localStorage.getItem('isLoggedIn')) window.location.href = 'login.html';

    logoutBtn.addEventListener('click', () => {
        if (confirm('Sei sicuro di voler uscire?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userType');
            localStorage.removeItem('agenteBadge');
            localStorage.removeItem('codiceFiscaleCittadino');
            window.location.href = 'login.html';
        }
    });

    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminCard = document.getElementById('adminCard');
    const adminCardCittadini = document.getElementById('adminCardCittadini');
    const adminCardBandi = document.getElementById('adminCardBandi');
    if (adminCard && !isAdmin) adminCard.style.display = 'none';
    if (adminCardCittadini && !isAdmin) adminCardCittadini.style.display = 'none';
    if (adminCardBandi && !isAdmin) adminCardBandi.style.display = 'none';

    document.querySelectorAll('.action-card').forEach(card => {
        card.addEventListener('click', () => {
            const page = card.getAttribute('data-page');
            if (page) window.location.href = page;
        });
    });
}

// ==================== GESTIONE SEZIONI (Multe, Arresti, etc.) ====================
const btnCreateMulta = document.getElementById('btnCreateMulta');
const btnCreateAgente = document.getElementById('btnCreateAgente');
const btnCreateCittadino = document.getElementById('btnCreateCittadino');
const overlayForm = document.getElementById('overlayForm');
const overlayDetails = document.getElementById('overlayDetails');
const multaForm = document.getElementById('multaForm');
const agenteForm = document.getElementById('agenteForm');
const cittadinoForm = document.getElementById('cittadinoForm');
const btnCancelForm = document.getElementById('btnCancelForm');
const btnCloseDetails = document.getElementById('btnCloseDetails');
const btnEditRecord = document.getElementById('btnEditRecord');
const btnDeleteRecord = document.getElementById('btnDeleteRecord');
const recordsContainer = document.getElementById('recordsContainer');
const searchInput = document.getElementById('searchInput');

let currentRecords = [];
let currentEditId = null;
let currentDetailId = null;

const isAgentiPage = document.title.includes('Agenti');
const isCittadiniPage = document.title.includes('Cittadini');

function getTableName() {
    if (isAgentiPage) return 'agenti';
    if (isCittadiniPage) return 'cittadini';
    const title = document.title;
    if (title.includes('Multe')) return 'multe';
    if (title.includes('Arresti')) return 'arresti';
    if (title.includes('Denunce')) return 'denunce';
    if (title.includes('Veicoli')) return 'veicoli';
    if (title.includes('Armi')) return 'armi';
    if (title.includes('Assicurazioni')) return 'assicurazioni';
    return null;
}

async function loadRecords() {
    const table = getTableName();
    if (!table) return;
    currentRecords = await dbGet(table);
    renderRecords();
}

function renderRecords(filter = '') {
    if (!recordsContainer) return;

    const filtered = filter
        ? currentRecords.filter(r => {
            if (isAgentiPage) return `${r.nome_agente} ${r.cognome_agente} ${r.matricola} ${r.username}`.toLowerCase().includes(filter.toLowerCase());
            if (isCittadiniPage) return `${r.nome_cittadino} ${r.cognome_cittadino} ${r.codice_fiscale}`.toLowerCase().includes(filter.toLowerCase());
            return `${r.nome_cittadino} ${r.cognome_cittadino} ${r.codice_fiscale || ''}`.toLowerCase().includes(filter.toLowerCase());
        })
        : currentRecords;

    if (filtered.length === 0) {
        recordsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Nessun record trovato</h3>
                <p>Clicca su "Crea" per aggiungere un nuovo record</p>
            </div>
        `;
        return;
    }

    if (isAgentiPage) {
        recordsContainer.innerHTML = filtered.map(a => `
            <div class="record-item" data-id="${a.id}">
                <div class="record-info">
                    <h3>${a.nome_agente} ${a.cognome_agente} - ${a.grado}</h3>
                    <p>${a.forza_ordine} | Matricola: ${a.matricola} | Username: ${a.username}</p>
                </div>
                <div class="record-actions">
                    <button class="btn-details" onclick="showDetails(${a.id})">Dettagli</button>
                </div>
            </div>
        `).join('');
    } else if (isCittadiniPage) {
        recordsContainer.innerHTML = filtered.map(c => `
            <div class="record-item" data-id="${c.id}">
                <div class="record-info">
                    <h3>${c.nome_cittadino} ${c.cognome_cittadino}</h3>
                    <p>CF: ${c.codice_fiscale} | Nato/a: ${c.data_nascita} | ${c.citta} (${c.provincia})</p>
                </div>
                <div class="record-actions">
                    <button class="btn-details" onclick="showDetails(${c.id})">Dettagli</button>
                </div>
            </div>
        `).join('');
    } else {
        recordsContainer.innerHTML = filtered.map(r => `
            <div class="record-item" data-id="${r.id}">
                <div class="record-info">
                    <h3>${r.nome_cittadino} ${r.cognome_cittadino} - ${getTipoRecord()}</h3>
                    <p>${r.tipo_infrazione || r.tipo_reato || r.tipo_denuncia || 'N/A'} | ${r.data_infrazione || r.data_arresto || r.data_denuncia || 'N/A'}</p>
                </div>
                <div class="record-actions">
                    <button class="btn-details" onclick="showDetails(${r.id})">Dettagli</button>
                </div>
            </div>
        `).join('');
    }
}

function getTipoRecord() {
    const title = document.title;
    if (title.includes('Multe')) return 'MULTA';
    if (title.includes('Arresti')) return 'ARRESTO';
    if (title.includes('Denunce')) return 'DENUNCIA';
    if (title.includes('Assicurazioni')) return 'ASSICURAZIONE';
    return 'RECORD';
}

if (btnCreateMulta) {
    btnCreateMulta.addEventListener('click', () => {
        currentEditId = null;
        document.getElementById('formTitle').textContent = `Crea Nuovo ${getTipoRecord()}`;
        if (multaForm) multaForm.reset();
        overlayForm.classList.add('active');
    });
}

if (btnCreateAgente) {
    btnCreateAgente.addEventListener('click', () => {
        currentEditId = null;
        document.getElementById('formTitle').textContent = 'Crea Nuovo Agente';
        if (agenteForm) agenteForm.reset();
        overlayForm.classList.add('active');
    });
}

if (btnCreateCittadino) {
    btnCreateCittadino.addEventListener('click', () => {
        currentEditId = null;
        document.getElementById('formTitle').textContent = 'Crea Nuovo Cittadino';
        if (cittadinoForm) cittadinoForm.reset();
        overlayForm.classList.add('active');
    });
}

if (btnCancelForm) {
    btnCancelForm.addEventListener('click', () => {
        overlayForm.classList.remove('active');
        if (multaForm) multaForm.reset();
        if (agenteForm) agenteForm.reset();
        if (cittadinoForm) cittadinoForm.reset();
        currentEditId = null;
    });
}

if (btnCloseDetails) {
    btnCloseDetails.addEventListener('click', () => {
        overlayDetails.classList.remove('active');
        currentDetailId = null;
    });
}

if (multaForm) {
    multaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const table = getTableName();
        const formData = {
            id: currentEditId || Date.now(),
            nome_cittadino: document.getElementById('nomeCittadino').value,
            cognome_cittadino: document.getElementById('cognomeCittadino').value,
            codice_fiscale: document.getElementById('codiceFiscale').value,
            targa_veicolo: document.getElementById('targaVeicolo')?.value || '',
            tipo_infrazione: document.getElementById('tipoInfrazione')?.value || '',
            tipo_reato: document.getElementById('tipoReato')?.value || '',
            tipo_denuncia: document.getElementById('tipoDenuncia')?.value || '',
            importo: document.getElementById('importo')?.value || '',
            data_infrazione: document.getElementById('dataInfrazione')?.value || '',
            data_arresto: document.getElementById('dataArresto')?.value || '',
            data_denuncia: document.getElementById('dataDenuncia')?.value || '',
            luogo: document.getElementById('luogo').value,
            note: document.getElementById('note').value,
            agente_verbalizzante: document.getElementById('agenteVerbalizzante')?.value || ''
        };

        if (currentEditId !== null) {
            await dbUpdate(table, currentEditId, formData);
        } else {
            await dbInsert(table, formData);
        }

        await loadRecords();
        overlayForm.classList.remove('active');
        multaForm.reset();
        currentEditId = null;
    });
}

if (agenteForm) {
    agenteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const matricola = document.getElementById('matricola').value.trim();

        if (currentEditId === null) {
            const agenti = await dbGet('agenti');
            if (agenti.some(a => a.username.toLowerCase() === username.toLowerCase())) {
                alert('Username già esistente.'); return;
            }
            if (agenti.some(a => a.matricola === matricola)) {
                alert('Matricola già esistente.'); return;
            }
        }

        const formData = {
            id: currentEditId || Date.now(),
            nome_agente: document.getElementById('nomeAgente').value,
            cognome_agente: document.getElementById('cognomeAgente').value,
            matricola,
            forza_ordine: document.getElementById('forzaOrdine').value,
            grado: document.getElementById('grado').value,
            username,
            password: document.getElementById('passwordAgente').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            data_assunzione: document.getElementById('dataAssunzione').value,
            note_agente: document.getElementById('noteAgente').value
        };

        if (currentEditId !== null) {
            await dbUpdate('agenti', currentEditId, formData);
        } else {
            await dbInsert('agenti', formData);
        }

        await loadRecords();
        overlayForm.classList.remove('active');
        agenteForm.reset();
        currentEditId = null;
        alert('Agente salvato con successo!');
    });
}

if (cittadinoForm) {
    cittadinoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const codice_fiscale = document.getElementById('codiceFiscale').value.trim().toUpperCase();
        const username_discord = document.getElementById('usernameDiscord').value.trim();
        const password_cittadino = document.getElementById('passwordCittadino').value.trim();

        if (currentEditId === null) {
            const cittadini = await dbGet('cittadini');
            if (cittadini.some(c => c.codice_fiscale === codice_fiscale)) {
                alert('Codice Fiscale già esistente.'); return;
            }
            if (cittadini.some(c => c.username_discord?.toLowerCase() === username_discord.toLowerCase())) {
                alert('Username Discord già utilizzato.'); return;
            }
        }

        const formData = {
            id: currentEditId || Date.now(),
            nome_cittadino: document.getElementById('nomeCittadino').value,
            cognome_cittadino: document.getElementById('cognomeCittadino').value,
            codice_fiscale,
            data_nascita: document.getElementById('dataNascita').value,
            luogo_nascita: document.getElementById('luogoNascita').value,
            sesso: document.getElementById('sesso').value,
            nazionalita: document.getElementById('nazionalita').value,
            indirizzo_residenza: document.getElementById('indirizzoResidenza').value,
            citta: document.getElementById('citta').value,
            cap: document.getElementById('cap').value,
            provincia: document.getElementById('provincia').value.toUpperCase(),
            numero_documento: document.getElementById('numeroDocumento').value,
            tipo_documento: document.getElementById('tipoDocumento').value,
            scadenza_documento: document.getElementById('scadenzaDocumento').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            stato_civile: document.getElementById('statoCivile').value,
            professione: document.getElementById('professione').value,
            username_discord,
            password_cittadino,
            note: document.getElementById('note').value
        };

        if (currentEditId !== null) {
            await dbUpdate('cittadini', currentEditId, formData);
        } else {
            await dbInsert('cittadini', formData);
        }

        await loadRecords();
        overlayForm.classList.remove('active');
        cittadinoForm.reset();
        currentEditId = null;
        alert('Cittadino salvato! Username Discord: ' + username_discord);
    });
}

window.showDetails = function(id) {
    const record = currentRecords.find(r => r.id === id);
    if (!record) return;
    currentDetailId = id;
    const detailsContent = document.getElementById('detailsContent');

    if (isAgentiPage) {
        detailsContent.innerHTML = `
            <div class="detail-row"><div class="detail-label">Nome:</div><div class="detail-value">${record.nome_agente}</div></div>
            <div class="detail-row"><div class="detail-label">Cognome:</div><div class="detail-value">${record.cognome_agente}</div></div>
            <div class="detail-row"><div class="detail-label">Matricola:</div><div class="detail-value">${record.matricola}</div></div>
            <div class="detail-row"><div class="detail-label">Forza dell'Ordine:</div><div class="detail-value">${record.forza_ordine}</div></div>
            <div class="detail-row"><div class="detail-label">Grado:</div><div class="detail-value">${record.grado}</div></div>
            <div class="detail-row"><div class="detail-label">Username:</div><div class="detail-value">${record.username}</div></div>
            <div class="detail-row"><div class="detail-label">Email:</div><div class="detail-value">${record.email}</div></div>
            <div class="detail-row"><div class="detail-label">Telefono:</div><div class="detail-value">${record.telefono}</div></div>
            <div class="detail-row"><div class="detail-label">Data Assunzione:</div><div class="detail-value">${record.data_assunzione}</div></div>
            ${record.note_agente ? `<div class="detail-row"><div class="detail-label">Note:</div><div class="detail-value">${record.note_agente}</div></div>` : ''}
            <div class="detail-row"><div class="detail-label">Creato il:</div><div class="detail-value">${new Date(record.timestamp).toLocaleString('it-IT')}</div></div>
        `;
    } else if (isCittadiniPage) {
        detailsContent.innerHTML = `
            <div class="detail-row"><div class="detail-label">Nome:</div><div class="detail-value">${record.nome_cittadino}</div></div>
            <div class="detail-row"><div class="detail-label">Cognome:</div><div class="detail-value">${record.cognome_cittadino}</div></div>
            <div class="detail-row"><div class="detail-label">Codice Fiscale:</div><div class="detail-value">${record.codice_fiscale}</div></div>
            <div class="detail-row"><div class="detail-label">Data di Nascita:</div><div class="detail-value">${record.data_nascita}</div></div>
            <div class="detail-row"><div class="detail-label">Luogo di Nascita:</div><div class="detail-value">${record.luogo_nascita}</div></div>
            <div class="detail-row"><div class="detail-label">Sesso:</div><div class="detail-value">${record.sesso}</div></div>
            <div class="detail-row"><div class="detail-label">Nazionalità:</div><div class="detail-value">${record.nazionalita}</div></div>
            <div class="detail-row"><div class="detail-label">Residenza:</div><div class="detail-value">${record.indirizzo_residenza}, ${record.citta} (${record.provincia}) - ${record.cap}</div></div>
            <div class="detail-row"><div class="detail-label">Documento:</div><div class="detail-value">${record.tipo_documento} n. ${record.numero_documento} (scad. ${record.scadenza_documento})</div></div>
            ${record.email ? `<div class="detail-row"><div class="detail-label">Email:</div><div class="detail-value">${record.email}</div></div>` : ''}
            ${record.telefono ? `<div class="detail-row"><div class="detail-label">Telefono:</div><div class="detail-value">${record.telefono}</div></div>` : ''}
            ${record.stato_civile ? `<div class="detail-row"><div class="detail-label">Stato Civile:</div><div class="detail-value">${record.stato_civile}</div></div>` : ''}
            ${record.professione ? `<div class="detail-row"><div class="detail-label">Professione:</div><div class="detail-value">${record.professione}</div></div>` : ''}
            ${record.username_discord ? `<div class="detail-row"><div class="detail-label">Username Discord:</div><div class="detail-value">${record.username_discord}</div></div>` : ''}
            ${record.note ? `<div class="detail-row"><div class="detail-label">Note:</div><div class="detail-value">${record.note}</div></div>` : ''}
            <div class="detail-row"><div class="detail-label">Registrato il:</div><div class="detail-value">${new Date(record.timestamp).toLocaleString('it-IT')}</div></div>
        `;
    } else {
        detailsContent.innerHTML = `
            <div class="detail-row"><div class="detail-label">Nome:</div><div class="detail-value">${record.nome_cittadino}</div></div>
            <div class="detail-row"><div class="detail-label">Cognome:</div><div class="detail-value">${record.cognome_cittadino}</div></div>
            <div class="detail-row"><div class="detail-label">Codice Fiscale:</div><div class="detail-value">${record.codice_fiscale}</div></div>
            ${record.targa_veicolo ? `<div class="detail-row"><div class="detail-label">Targa:</div><div class="detail-value">${record.targa_veicolo}</div></div>` : ''}
            ${record.tipo_infrazione ? `<div class="detail-row"><div class="detail-label">Tipo Infrazione:</div><div class="detail-value">${record.tipo_infrazione}</div></div>` : ''}
            ${record.tipo_reato ? `<div class="detail-row"><div class="detail-label">Tipo Reato:</div><div class="detail-value">${record.tipo_reato}</div></div>` : ''}
            ${record.tipo_denuncia ? `<div class="detail-row"><div class="detail-label">Tipo Denuncia:</div><div class="detail-value">${record.tipo_denuncia}</div></div>` : ''}
            ${record.importo ? `<div class="detail-row"><div class="detail-label">Importo:</div><div class="detail-value">€ ${record.importo}</div></div>` : ''}
            <div class="detail-row"><div class="detail-label">Data:</div><div class="detail-value">${record.data_infrazione || record.data_arresto || record.data_denuncia}</div></div>
            <div class="detail-row"><div class="detail-label">Luogo:</div><div class="detail-value">${record.luogo}</div></div>
            ${record.note ? `<div class="detail-row"><div class="detail-label">Note:</div><div class="detail-value">${record.note}</div></div>` : ''}
            ${record.agente_verbalizzante ? `<div class="detail-row"><div class="detail-label">Agente:</div><div class="detail-value">${record.agente_verbalizzante}</div></div>` : ''}
            <div class="detail-row"><div class="detail-label">Creato il:</div><div class="detail-value">${new Date(record.timestamp).toLocaleString('it-IT')}</div></div>
        `;
    }
    overlayDetails.classList.add('active');
};

if (btnEditRecord) {
    btnEditRecord.addEventListener('click', () => {
        const record = currentRecords.find(r => r.id === currentDetailId);
        if (!record) return;
        currentEditId = currentDetailId;

        if (isAgentiPage) {
            document.getElementById('formTitle').textContent = 'Modifica Agente';
            document.getElementById('nomeAgente').value = record.nome_agente;
            document.getElementById('cognomeAgente').value = record.cognome_agente;
            document.getElementById('matricola').value = record.matricola;
            document.getElementById('forzaOrdine').value = record.forza_ordine;
            document.getElementById('grado').value = record.grado;
            document.getElementById('username').value = record.username;
            document.getElementById('passwordAgente').value = record.password;
            document.getElementById('email').value = record.email;
            document.getElementById('telefono').value = record.telefono;
            document.getElementById('dataAssunzione').value = record.data_assunzione;
            document.getElementById('noteAgente').value = record.note_agente || '';
        } else if (isCittadiniPage) {
            document.getElementById('formTitle').textContent = 'Modifica Cittadino';
            document.getElementById('nomeCittadino').value = record.nome_cittadino;
            document.getElementById('cognomeCittadino').value = record.cognome_cittadino;
            document.getElementById('codiceFiscale').value = record.codice_fiscale;
            document.getElementById('dataNascita').value = record.data_nascita;
            document.getElementById('luogoNascita').value = record.luogo_nascita;
            document.getElementById('sesso').value = record.sesso;
            document.getElementById('nazionalita').value = record.nazionalita;
            document.getElementById('indirizzoResidenza').value = record.indirizzo_residenza;
            document.getElementById('citta').value = record.citta;
            document.getElementById('cap').value = record.cap;
            document.getElementById('provincia').value = record.provincia;
            document.getElementById('numeroDocumento').value = record.numero_documento;
            document.getElementById('tipoDocumento').value = record.tipo_documento;
            document.getElementById('scadenzaDocumento').value = record.scadenza_documento;
            document.getElementById('email').value = record.email || '';
            document.getElementById('telefono').value = record.telefono || '';
            document.getElementById('statoCivile').value = record.stato_civile || '';
            document.getElementById('professione').value = record.professione || '';
            document.getElementById('usernameDiscord').value = record.username_discord || '';
            document.getElementById('passwordCittadino').value = record.password_cittadino || '';
            document.getElementById('note').value = record.note || '';
        } else {
            document.getElementById('formTitle').textContent = `Modifica ${getTipoRecord()}`;
            document.getElementById('nomeCittadino').value = record.nome_cittadino;
            document.getElementById('cognomeCittadino').value = record.cognome_cittadino;
            document.getElementById('codiceFiscale').value = record.codice_fiscale;
            if (document.getElementById('targaVeicolo')) document.getElementById('targaVeicolo').value = record.targa_veicolo || '';
            if (document.getElementById('tipoInfrazione')) document.getElementById('tipoInfrazione').value = record.tipo_infrazione || '';
            if (document.getElementById('importo')) document.getElementById('importo').value = record.importo || '';
            if (document.getElementById('dataInfrazione')) document.getElementById('dataInfrazione').value = record.data_infrazione || '';
            document.getElementById('luogo').value = record.luogo;
            document.getElementById('note').value = record.note || '';
            if (document.getElementById('agenteVerbalizzante')) document.getElementById('agenteVerbalizzante').value = record.agente_verbalizzante || '';
        }

        overlayDetails.classList.remove('active');
        overlayForm.classList.add('active');
    });
}

if (btnDeleteRecord) {
    btnDeleteRecord.addEventListener('click', async () => {
        if (confirm('Sei sicuro di voler eliminare questo record?')) {
            await dbDelete(getTableName(), currentDetailId);
            await loadRecords();
            overlayDetails.classList.remove('active');
            currentDetailId = null;
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => { renderRecords(e.target.value); });
}

if (overlayForm) {
    overlayForm.addEventListener('click', (e) => {
        if (e.target === overlayForm) {
            overlayForm.classList.remove('active');
            if (multaForm) multaForm.reset();
            currentEditId = null;
        }
    });
}

if (overlayDetails) {
    overlayDetails.addEventListener('click', (e) => {
        if (e.target === overlayDetails) {
            overlayDetails.classList.remove('active');
            currentDetailId = null;
        }
    });
}

if (recordsContainer) { loadRecords(); }

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.action-card, .record-item');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });
});

// ==================== GESTIONE BANDI ====================
if (document.getElementById('bandiContainer')) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const userName = localStorage.getItem('username') || 'Utente';

    document.getElementById('userName').textContent = userName;
    if (isAdmin) {
        document.getElementById('userInfo').textContent = 'Amministratore - Puoi creare e gestire bandi';
        document.getElementById('adminSection').style.display = 'block';
    } else {
        const usernameDiscord = localStorage.getItem('usernameDiscord');
        if (usernameDiscord) document.getElementById('userInfo').textContent = 'Discord: ' + usernameDiscord;
    }

    let bandi = [];
    let filtroAttivo = 'all';
    let currentEditIdBando = null;
    let currentBandoId = null;

    async function loadBandi() {
        bandi = await dbGet('bandi');
        renderBandi();
    }

    document.getElementById('btnCreateBando')?.addEventListener('click', () => {
        currentEditIdBando = null;
        document.getElementById('formBandoTitle').textContent = 'Crea Nuovo Bando';
        document.getElementById('bandoForm').reset();
        document.getElementById('overlayFormBando').classList.add('active');
    });

    document.getElementById('btnCancelFormBando')?.addEventListener('click', () => {
        document.getElementById('overlayFormBando').classList.remove('active');
    });

    document.getElementById('bandoForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            id: currentEditIdBando || Date.now(),
            titolo: document.getElementById('titoloBando').value,
            ente: document.getElementById('enteBando').value,
            categoria: document.getElementById('categoriaBando').value,
            descrizione: document.getElementById('descrizioneBando').value,
            requisiti: document.getElementById('requisitiBando').value,
            importo: document.getElementById('importoBando').value,
            pubblicazione: document.getElementById('dataPubblicazione').value,
            scadenza: document.getElementById('dataScadenza').value,
            stato: document.getElementById('statoBando').value,
            candidati: currentEditIdBando ? bandi.find(b => b.id === currentEditIdBando)?.candidati || [] : []
        };

        if (currentEditIdBando) {
            await dbUpdate('bandi', currentEditIdBando, formData);
        } else {
            await dbInsert('bandi', formData);
        }

        await loadBandi();
        document.getElementById('overlayFormBando').classList.remove('active');
        alert('Bando salvato!');
    });

    function renderBandi(filtro = filtroAttivo, search = '') {
        let filtered = bandi;
        if (filtro !== 'all') filtered = filtered.filter(b => b.stato === filtro);
        if (search) filtered = filtered.filter(b =>
            b.titolo.toLowerCase().includes(search.toLowerCase()) ||
            b.ente.toLowerCase().includes(search.toLowerCase())
        );

        const container = document.getElementById('bandiContainer');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Nessun bando disponibile</h3>
                    <p>${isAdmin ? 'Crea il primo bando!' : 'Nessun bando pubblicato'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filtered.map(b => {
            const scadenza = new Date(b.scadenza);
            const giorni = Math.ceil((scadenza - new Date()) / 86400000);
            const numCandidati = b.candidati?.length || 0;
            let statoClass = b.stato === 'scaduti' ? 'scaduto' : b.stato === 'inCorso' ? 'in-corso' : 'aperto';
            let statoText = b.stato === 'scaduti' ? 'Scaduto' : b.stato === 'inCorso' ? 'In Corso' : 'Aperto';
            return `
                <div class="bando-card" onclick="mostraBando(${b.id})">
                    <div class="bando-badge ${statoClass}">${statoText}</div>
                    ${isAdmin ? '<div class="admin-badge-card">ADMIN</div>' : ''}
                    <div class="bando-categoria">${b.categoria}</div>
                    <h3>${b.titolo}</h3>
                    <p class="bando-ente"><i class="fas fa-building"></i> ${b.ente}</p>
                    <div class="bando-info">
                        <div class="info-item"><i class="fas fa-calendar-alt"></i><span>Scadenza: ${scadenza.toLocaleDateString('it-IT')}</span></div>
                        ${giorni > 0 && b.stato === 'aperti' ? `<div class="info-item urgente"><i class="fas fa-clock"></i><span>${giorni} giorni rimanenti</span></div>` : ''}
                        <div class="info-item candidati"><i class="fas fa-users"></i><span>Persone Candidate: ${numCandidati}</span></div>
                    </div>
                    <button class="btn-dettagli">Vedi Dettagli</button>
                </div>
            `;
        }).join('');
    }

    window.mostraBando = function(id) {
        const bando = bandi.find(b => b.id === id);
        if (!bando) return;
        document.getElementById('bandoTitolo').textContent = bando.titolo;
        let actions = '';
        if (!isAdmin && bando.stato === 'aperti') {
            actions = `<div class="bando-actions"><button class="btn-partecipa" onclick="apriCandidatura(${bando.id})"><i class="fas fa-paper-plane"></i> Candidati Ora</button></div>`;
        } else if (isAdmin) {
            actions = `<div class="admin-actions-detail">
                <button class="btn-edit-bando" onclick="editBando(${bando.id})"><i class="fas fa-edit"></i> Modifica</button>
                <button class="btn-delete-bando" onclick="deleteBando(${bando.id})"><i class="fas fa-trash"></i> Elimina</button>
            </div>`;
        }
        document.getElementById('bandoDetails').innerHTML = `
            <div class="detail-section"><h3><i class="fas fa-building"></i> Ente</h3><p>${bando.ente}</p></div>
            <div class="detail-section"><h3><i class="fas fa-info-circle"></i> Descrizione</h3><p>${bando.descrizione}</p></div>
            <div class="detail-section"><h3><i class="fas fa-list-check"></i> Requisiti</h3><p>${bando.requisiti}</p></div>
            <div class="detail-row">
                <div class="detail-item"><strong><i class="fas fa-tag"></i> Categoria</strong><span>${bando.categoria}</span></div>
                <div class="detail-item"><strong><i class="fas fa-euro-sign"></i> Importo</strong><span>${bando.importo}</span></div>
            </div>
            <div class="detail-row">
                <div class="detail-item"><strong><i class="fas fa-calendar-plus"></i> Pubblicazione</strong><span>${new Date(bando.pubblicazione).toLocaleDateString('it-IT')}</span></div>
                <div class="detail-item"><strong><i class="fas fa-calendar-times"></i> Scadenza</strong><span>${new Date(bando.scadenza).toLocaleDateString('it-IT')}</span></div>
            </div>
            ${actions}
        `;
        document.getElementById('overlayBando').classList.add('active');
    };

    window.editBando = function(id) {
        const b = bandi.find(b => b.id === id);
        if (!b) return;
        currentEditIdBando = id;
        document.getElementById('formBandoTitle').textContent = 'Modifica Bando';
        document.getElementById('titoloBando').value = b.titolo;
        document.getElementById('enteBando').value = b.ente;
        document.getElementById('categoriaBando').value = b.categoria;
        document.getElementById('descrizioneBando').value = b.descrizione;
        document.getElementById('requisitiBando').value = b.requisiti;
        document.getElementById('importoBando').value = b.importo;
        document.getElementById('dataPubblicazione').value = b.pubblicazione;
        document.getElementById('dataScadenza').value = b.scadenza;
        document.getElementById('statoBando').value = b.stato;
        document.getElementById('overlayBando').classList.remove('active');
        document.getElementById('overlayFormBando').classList.add('active');
    };

    window.deleteBando = async function(id) {
        if (confirm('Eliminare questo bando?')) {
            await dbDelete('bandi', id);
            await loadBandi();
            document.getElementById('overlayBando').classList.remove('active');
        }
    };

    window.apriCandidatura = function(id) {
        currentBandoId = id;
        document.getElementById('nomeCandidato').value = userName;
        document.getElementById('overlayBando').classList.remove('active');
        document.getElementById('overlayCandidatura').classList.add('active');
    };

    document.getElementById('candidaturaForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const bando = bandi.find(b => b.id === currentBandoId);
        if (!bando) return;
        const candidatura = {
            nome: document.getElementById('nomeCandidato').value,
            email: document.getElementById('emailCandidato').value,
            telefono: document.getElementById('telefonoCandidato').value,
            dataNascita: document.getElementById('dataNascitaCandidato').value,
            citta: document.getElementById('cittaCandidato').value,
            motivazione: document.getElementById('motivazioneCandidato').value,
            dataInvio: new Date().toISOString()
        };
        const candidatiAggiornati = [...(bando.candidati || []), candidatura];
        await dbUpdate('bandi', bando.id, { candidati: candidatiAggiornati });

        // Decommenta per Discord:
        // const webhookURL = 'IL_TUO_WEBHOOK_DISCORD_QUI';
        // await fetch(webhookURL, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({...}) });

        await loadBandi();
        document.getElementById('overlayCandidatura').classList.remove('active');
        document.getElementById('candidaturaForm').reset();
        alert('Candidatura inviata!');
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtroAttivo = btn.dataset.filter;
            renderBandi();
        });
    });

    document.getElementById('searchInput')?.addEventListener('input', (e) => { renderBandi(filtroAttivo, e.target.value); });
    document.getElementById('closeBando')?.addEventListener('click', () => document.getElementById('overlayBando').classList.remove('active'));
    document.getElementById('closeCandidatura')?.addEventListener('click', () => document.getElementById('overlayCandidatura').classList.remove('active'));

    loadBandi();
}
