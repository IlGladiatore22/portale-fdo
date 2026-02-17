// ==================== CONFIGURAZIONE SUPABASE ====================
const SUPABASE_URL = 'https://wykhiqymjoykkzepthpf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5a2hpcXltam95a2t6ZXB0aHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjg1MzMsImV4cCI6MjA4NjkwNDUzM30.ygR0sHEU5b5U3LoE4tkjHc8LpBXLB7ELOJLpMhpjTqY';

async function dbGet(table) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=id.desc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (!res.ok) throw new Error('Errore lettura');
        return await res.json();
    } catch (e) {
        console.error(`Errore dbGet(${table}):`, e);
        return [];
    }
}

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
        if (!res.ok) { const err = await res.text(); throw new Error(err); }
        return true;
    } catch (e) {
        console.error(`Errore dbInsert(${table}):`, e);
        return false;
    }
}

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

async function dbDelete(table, id) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
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

        // Credenziali admin hardcoded
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

        // Verifica agente su Supabase
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

// ==================== GESTIONE SEZIONI (Multe, Arresti, Denunce, etc.) ====================
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
