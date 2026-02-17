// ==================== CONFIGURAZIONE SUPABASE ====================
const SUPABASE_URL = 'https://wykhiqymjoykkzepthpf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5a2hpcXltam95a2t6ZXB0aHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMjg1MzMsImV4cCI6MjA4NjkwNDUzM30.ygR0sHEU5b5U3LoE4tkjHc8LpBXLB7ELOJLpMhpjTqY';

// Funzioni per operare con il database
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

// ==================== GESTIONE LOGOUT ====================
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
}

// ==================== GESTIONE DASHBOARD ====================
// Mostra o nasconde le card in base al tipo di utente
const isAdmin = localStorage.getItem('isAdmin') === 'true';
const adminCard = document.getElementById('adminCard');
if (adminCard && !isAdmin) adminCard.style.display = 'none';

document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => {
        const page = card.getAttribute('data-page');
        if (page) window.location.href = page;
    });
});

// ==================== GESTIONE SEZIONI (Multe, Arresti, Denunce, etc.) ====================
const btnCreateMulta = document.getElementById('btnCreateMulta');
const overlayForm = document.getElementById('overlayForm');
const multaForm = document.getElementById('multaForm');

if (btnCreateMulta) {
    btnCreateMulta.addEventListener('click', () => {
        document.getElementById('formTitle').textContent = 'Crea Nuovo Record';
        if (multaForm) multaForm.reset();
        overlayForm.classList.add('active');
    });
}

if (multaForm) {
    multaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const table = 'multe';  // Usa la tabella 'multe' come esempio
        const formData = {
            id: Date.now(),
            nome_cittadino: document.getElementById('nomeCittadino').value,
            cognome_cittadino: document.getElementById('cognomeCittadino').value,
            codice_fiscale: document.getElementById('codiceFiscale').value,
            targa_veicolo: document.getElementById('targaVeicolo').value || '',
            tipo_infrazione: document.getElementById('tipoInfrazione').value || '',
            importo: document.getElementById('importo').value || '',
            data_infrazione: document.getElementById('dataInfrazione').value || '',
            luogo: document.getElementById('luogo').value,
            note: document.getElementById('note').value
        };

        await dbInsert(table, formData);
        overlayForm.classList.remove('active');
        multaForm.reset();
    });
}

// ==================== GESTIONE VISUALIZZAZIONE RECORDS ====================
const recordsContainer = document.getElementById('recordsContainer');
async function loadRecords() {
    const records = await dbGet('multe');  // Usa la tabella 'multe'
    recordsContainer.innerHTML = records.map(r => `
        <div class="record-item" data-id="${r.id}">
            <div class="record-info">
                <h3>${r.nome_cittadino} ${r.cognome_cittadino}</h3>
                <p>${r.codice_fiscale}</p>
            </div>
            <div class="record-actions">
                <button class="btn-details" onclick="showDetails(${r.id})">Dettagli</button>
            </div>
        </div>
    `).join('');
}

function showDetails(id) {
    const record = currentRecords.find(r => r.id === id);
    if (!record) return;
    const detailsContent = document.getElementById('detailsContent');
    detailsContent.innerHTML = `
        <div class="detail-row"><div class="detail-label">Nome:</div><div class="detail-value">${record.nome_cittadino}</div></div>
        <div class="detail-row"><div class="detail-label">Cognome:</div><div class="detail-value">${record.cognome_cittadino}</div></div>
        <div class="detail-row"><div class="detail-label">Codice Fiscale:</div><div class="detail-value">${record.codice_fiscale}</div></div>
        <div class="detail-row"><div class="detail-label">Targa:</div><div class="detail-value">${record.targa_veicolo}</div></div>
        <div class="detail-row"><div class="detail-label">Tipo Infrazione:</div><div class="detail-value">${record.tipo_infrazione}</div></div>
        <div class="detail-row"><div class="detail-label">Importo:</div><div class="detail-value">${record.importo}</div></div>
        <div class="detail-row"><div class="detail-label">Data:</div><div class="detail-value">${record.data_infrazione}</div></div>
        <div class="detail-row"><div class="detail-label">Luogo:</div><div class="detail-value">${record.luogo}</div></div>
        <div class="detail-row"><div class="detail-label">Note:</div><div class="detail-value">${record.note}</div></div>
    `;
    overlayDetails.classList.add('active');
}

window.showDetails = showDetails;
