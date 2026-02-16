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

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showError('Inserisci username e password');
            return;
        }

        // Credenziali admin hardcoded
        const adminCredentials = [
            { username: 'admin', password: 'admin' },
            { username: 'amministratore', password: 'admin123' }
        ];

        // Verifica se è un admin
        const isAdmin = adminCredentials.some(
            cred => cred.username.toLowerCase() === username.toLowerCase() && cred.password === password
        );

        if (isAdmin) {
            // Login admin
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('isAdmin', 'true');
            
            loginForm.style.opacity = '0';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
            return;
        }

        // Verifica se è un agente creato
        const agenti = JSON.parse(localStorage.getItem('agenti_registrati') || '[]');
        const agente = agenti.find(a => 
            a.username.toLowerCase() === username.toLowerCase() && a.password === password
        );

        if (agente) {
            // Login agente
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', agente.username);
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('agenteBadge', agente.matricola);
            
            loginForm.style.opacity = '0';
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 300);
            return;
        }

        // Credenziali non valide
        showError('Credenziali non valide. Solo amministratori e agenti registrati possono accedere.');
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.add('show');
        
        setTimeout(() => {
            errorMessage.classList.remove('show');
        }, 4000);
    }
}

// ==================== GESTIONE DASHBOARD ====================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    // Verifica login
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    }

    // Gestione logout
    logoutBtn.addEventListener('click', () => {
        if (confirm('Sei sicuro di voler uscire?')) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            window.location.href = 'login.html';
        }
    });

    // Mostra/nascondi card admin
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const adminCard = document.getElementById('adminCard');
    const adminCardCittadini = document.getElementById('adminCardCittadini');
    
    if (adminCard && !isAdmin) {
        adminCard.style.display = 'none';
    }
    if (adminCardCittadini && !isAdmin) {
        adminCardCittadini.style.display = 'none';
    }

    // Gestione click sulle card
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const page = card.getAttribute('data-page');
            if (page) {
                window.location.href = page;
            }
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

// Determina il tipo di pagina
const isAgentiPage = document.title.includes('Agenti');
const isCittadiniPage = document.title.includes('Cittadini');

// Carica i record dalla localStorage
function loadRecords() {
    if (isAgentiPage) {
        // Carica agenti
        currentRecords = JSON.parse(localStorage.getItem('agenti_registrati') || '[]');
    } else if (isCittadiniPage) {
        // Carica cittadini
        currentRecords = JSON.parse(localStorage.getItem('cittadini_registrati') || '[]');
    } else {
        // Carica record normali
        const pageName = document.title.split(' ')[1]; // "Multe", "Arresti", etc.
        const storageKey = `records_${pageName.toLowerCase()}`;
        const stored = localStorage.getItem(storageKey);
        currentRecords = stored ? JSON.parse(stored) : [];
    }
    renderRecords();
}

// Salva i record nella localStorage
function saveRecords() {
    if (isAgentiPage) {
        localStorage.setItem('agenti_registrati', JSON.stringify(currentRecords));
    } else if (isCittadiniPage) {
        localStorage.setItem('cittadini_registrati', JSON.stringify(currentRecords));
    } else {
        const pageName = document.title.split(' ')[1];
        const storageKey = `records_${pageName.toLowerCase()}`;
        localStorage.setItem(storageKey, JSON.stringify(currentRecords));
    }
}

// Renderizza i record
function renderRecords(filter = '') {
    if (!recordsContainer) return;

    const filtered = filter
        ? currentRecords.filter(r => {
            if (isAgentiPage) {
                return `${r.nomeAgente} ${r.cognomeAgente} ${r.matricola} ${r.username}`.toLowerCase().includes(filter.toLowerCase());
            } else if (isCittadiniPage) {
                return `${r.nomeCittadino} ${r.cognomeCittadino} ${r.codiceFiscale}`.toLowerCase().includes(filter.toLowerCase());
            } else {
                return `${r.nomeCittadino} ${r.cognomeCittadino}`.toLowerCase().includes(filter.toLowerCase()) ||
                    (r.codiceFiscale && r.codiceFiscale.toLowerCase().includes(filter.toLowerCase()));
            }
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
        // Renderizza agenti
        recordsContainer.innerHTML = filtered.map(agente => `
            <div class="record-item" data-id="${agente.id}">
                <div class="record-info">
                    <h3>${agente.nomeAgente} ${agente.cognomeAgente} - ${agente.grado}</h3>
                    <p>${agente.forzaOrdine} | Matricola: ${agente.matricola} | Username: ${agente.username}</p>
                </div>
                <div class="record-actions">
                    <button class="btn-details" onclick="showDetails(${agente.id})">Dettagli</button>
                </div>
            </div>
        `).join('');
    } else if (isCittadiniPage) {
        // Renderizza cittadini
        recordsContainer.innerHTML = filtered.map(cittadino => `
            <div class="record-item" data-id="${cittadino.id}">
                <div class="record-info">
                    <h3>${cittadino.nomeCittadino} ${cittadino.cognomeCittadino}</h3>
                    <p>CF: ${cittadino.codiceFiscale} | Nato/a: ${cittadino.dataNascita} | ${cittadino.citta} (${cittadino.provincia})</p>
                </div>
                <div class="record-actions">
                    <button class="btn-details" onclick="showDetails(${cittadino.id})">Dettagli</button>
                </div>
            </div>
        `).join('');
    } else {
        // Renderizza record normali
        recordsContainer.innerHTML = filtered.map(record => `
            <div class="record-item" data-id="${record.id}">
                <div class="record-info">
                    <h3>${record.nomeCittadino} ${record.cognomeCittadino} - ${getTipoRecord()}</h3>
                    <p>${record.tipoInfrazione || record.tipoReato || record.tipoDenuncia || 'N/A'} | ${record.dataInfrazione || record.dataArresto || record.dataDenuncia || 'N/A'}</p>
                </div>
                <div class="record-actions">
                    <button class="btn-details" onclick="showDetails(${record.id})">Dettagli</button>
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

// Mostra overlay creazione
if (btnCreateMulta) {
    btnCreateMulta.addEventListener('click', () => {
        currentEditId = null;
        document.getElementById('formTitle').textContent = `Crea Nuovo ${getTipoRecord()}`;
        if (multaForm) multaForm.reset();
        overlayForm.classList.add('active');
    });
}

// Mostra overlay creazione agente
if (btnCreateAgente) {
    btnCreateAgente.addEventListener('click', () => {
        currentEditId = null;
        document.getElementById('formTitle').textContent = 'Crea Nuovo Agente';
        if (agenteForm) agenteForm.reset();
        overlayForm.classList.add('active');
    });
}

// Mostra overlay creazione cittadino
if (btnCreateCittadino) {
    btnCreateCittadino.addEventListener('click', () => {
        currentEditId = null;
        document.getElementById('formTitle').textContent = 'Crea Nuovo Cittadino';
        if (cittadinoForm) cittadinoForm.reset();
        overlayForm.classList.add('active');
    });
}

// Chiudi overlay form
if (btnCancelForm) {
    btnCancelForm.addEventListener('click', () => {
        overlayForm.classList.remove('active');
        if (multaForm) multaForm.reset();
        if (agenteForm) agenteForm.reset();
        if (cittadinoForm) cittadinoForm.reset();
        currentEditId = null;
    });
}

// Chiudi overlay dettagli
if (btnCloseDetails) {
    btnCloseDetails.addEventListener('click', () => {
        overlayDetails.classList.remove('active');
        currentDetailId = null;
    });
}

// Submit form
if (multaForm) {
    multaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            nomeCittadino: document.getElementById('nomeCittadino').value,
            cognomeCittadino: document.getElementById('cognomeCittadino').value,
            codiceFiscale: document.getElementById('codiceFiscale').value,
            targaVeicolo: document.getElementById('targaVeicolo')?.value || '',
            tipoInfrazione: document.getElementById('tipoInfrazione')?.value || '',
            tipoReato: document.getElementById('tipoReato')?.value || '',
            tipoDenuncia: document.getElementById('tipoDenuncia')?.value || '',
            importo: document.getElementById('importo')?.value || '',
            dataInfrazione: document.getElementById('dataInfrazione')?.value || '',
            dataArresto: document.getElementById('dataArresto')?.value || '',
            dataDenuncia: document.getElementById('dataDenuncia')?.value || '',
            luogo: document.getElementById('luogo').value,
            note: document.getElementById('note').value,
            agenteVerbalizzante: document.getElementById('agenteVerbalizzante')?.value || '',
            timestamp: new Date().toISOString()
        };

        if (currentEditId !== null) {
            // Modifica esistente
            const index = currentRecords.findIndex(r => r.id === currentEditId);
            if (index !== -1) {
                currentRecords[index] = { ...currentRecords[index], ...formData };
            }
        } else {
            // Nuovo record
            formData.id = Date.now();
            currentRecords.unshift(formData);
        }

        saveRecords();
        renderRecords();
        overlayForm.classList.remove('active');
        multaForm.reset();
        currentEditId = null;
    });
}

// Submit form agenti
if (agenteForm) {
    agenteForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const matricola = document.getElementById('matricola').value.trim();

        // Verifica username duplicato
        if (currentEditId === null) {
            const agenti = JSON.parse(localStorage.getItem('agenti_registrati') || '[]');
            if (agenti.some(a => a.username.toLowerCase() === username.toLowerCase())) {
                alert('Username già esistente. Scegli un altro username.');
                return;
            }
            if (agenti.some(a => a.matricola === matricola)) {
                alert('Matricola già esistente. Inserisci una matricola diversa.');
                return;
            }
        }

        const formData = {
            nomeAgente: document.getElementById('nomeAgente').value,
            cognomeAgente: document.getElementById('cognomeAgente').value,
            matricola: matricola,
            forzaOrdine: document.getElementById('forzaOrdine').value,
            grado: document.getElementById('grado').value,
            username: username,
            password: document.getElementById('passwordAgente').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            dataAssunzione: document.getElementById('dataAssunzione').value,
            noteAgente: document.getElementById('noteAgente').value,
            timestamp: new Date().toISOString()
        };

        if (currentEditId !== null) {
            // Modifica esistente
            const index = currentRecords.findIndex(r => r.id === currentEditId);
            if (index !== -1) {
                currentRecords[index] = { ...currentRecords[index], ...formData };
            }
        } else {
            // Nuovo agente
            formData.id = Date.now();
            currentRecords.unshift(formData);
        }

        saveRecords();
        renderRecords();
        overlayForm.classList.remove('active');
        agenteForm.reset();
        currentEditId = null;

        alert('Agente salvato con successo! Ora può accedere al sistema con le credenziali create.');
    });
}

// Submit form cittadini
if (cittadinoForm) {
    cittadinoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const codiceFiscale = document.getElementById('codiceFiscale').value.trim().toUpperCase();

        // Verifica codice fiscale duplicato
        if (currentEditId === null) {
            const cittadini = JSON.parse(localStorage.getItem('cittadini_registrati') || '[]');
            if (cittadini.some(c => c.codiceFiscale === codiceFiscale)) {
                alert('Codice Fiscale già esistente nel database.');
                return;
            }
        }

        const formData = {
            nomeCittadino: document.getElementById('nomeCittadino').value,
            cognomeCittadino: document.getElementById('cognomeCittadino').value,
            codiceFiscale: codiceFiscale,
            dataNascita: document.getElementById('dataNascita').value,
            luogoNascita: document.getElementById('luogoNascita').value,
            sesso: document.getElementById('sesso').value,
            nazionalita: document.getElementById('nazionalita').value,
            indirizzoResidenza: document.getElementById('indirizzoResidenza').value,
            citta: document.getElementById('citta').value,
            cap: document.getElementById('cap').value,
            provincia: document.getElementById('provincia').value.toUpperCase(),
            numeroDocumento: document.getElementById('numeroDocumento').value,
            tipoDocumento: document.getElementById('tipoDocumento').value,
            scadenzaDocumento: document.getElementById('scadenzaDocumento').value,
            email: document.getElementById('email').value,
            telefono: document.getElementById('telefono').value,
            statoCivile: document.getElementById('statoCivile').value,
            professione: document.getElementById('professione').value,
            note: document.getElementById('note').value,
            timestamp: new Date().toISOString()
        };

        if (currentEditId !== null) {
            // Modifica esistente
            const index = currentRecords.findIndex(r => r.id === currentEditId);
            if (index !== -1) {
                currentRecords[index] = { ...currentRecords[index], ...formData };
            }
        } else {
            // Nuovo cittadino
            formData.id = Date.now();
            currentRecords.unshift(formData);
        }

        saveRecords();
        renderRecords();
        overlayForm.classList.remove('active');
        cittadinoForm.reset();
        currentEditId = null;

        alert('Cittadino salvato con successo nel database!');
    });
}

// Mostra dettagli
window.showDetails = function(id) {
    const record = currentRecords.find(r => r.id === id);
    if (!record) return;

    currentDetailId = id;
    const detailsContent = document.getElementById('detailsContent');
    
    if (isAgentiPage) {
        // Mostra dettagli agente
        detailsContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Nome:</div>
                <div class="detail-value">${record.nomeAgente}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cognome:</div>
                <div class="detail-value">${record.cognomeAgente}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Matricola:</div>
                <div class="detail-value">${record.matricola}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Forza dell'Ordine:</div>
                <div class="detail-value">${record.forzaOrdine}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Grado:</div>
                <div class="detail-value">${record.grado}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Username:</div>
                <div class="detail-value">${record.username}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${record.email}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Telefono:</div>
                <div class="detail-value">${record.telefono}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Data Assunzione:</div>
                <div class="detail-value">${record.dataAssunzione}</div>
            </div>
            ${record.noteAgente ? `
            <div class="detail-row">
                <div class="detail-label">Note:</div>
                <div class="detail-value">${record.noteAgente}</div>
            </div>` : ''}
            <div class="detail-row">
                <div class="detail-label">Creato il:</div>
                <div class="detail-value">${new Date(record.timestamp).toLocaleString('it-IT')}</div>
            </div>
        `;
    } else if (isCittadiniPage) {
        // Mostra dettagli cittadino
        detailsContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Nome:</div>
                <div class="detail-value">${record.nomeCittadino}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cognome:</div>
                <div class="detail-value">${record.cognomeCittadino}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Codice Fiscale:</div>
                <div class="detail-value">${record.codiceFiscale}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Data di Nascita:</div>
                <div class="detail-value">${record.dataNascita}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Luogo di Nascita:</div>
                <div class="detail-value">${record.luogoNascita}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Sesso:</div>
                <div class="detail-value">${record.sesso}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Nazionalità:</div>
                <div class="detail-value">${record.nazionalita}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Residenza:</div>
                <div class="detail-value">${record.indirizzoResidenza}, ${record.citta} (${record.provincia}) - ${record.cap}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Documento:</div>
                <div class="detail-value">${record.tipoDocumento} n. ${record.numeroDocumento} (scad. ${record.scadenzaDocumento})</div>
            </div>
            ${record.email ? `
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${record.email}</div>
            </div>` : ''}
            ${record.telefono ? `
            <div class="detail-row">
                <div class="detail-label">Telefono:</div>
                <div class="detail-value">${record.telefono}</div>
            </div>` : ''}
            ${record.statoCivile ? `
            <div class="detail-row">
                <div class="detail-label">Stato Civile:</div>
                <div class="detail-value">${record.statoCivile}</div>
            </div>` : ''}
            ${record.professione ? `
            <div class="detail-row">
                <div class="detail-label">Professione:</div>
                <div class="detail-value">${record.professione}</div>
            </div>` : ''}
            ${record.note ? `
            <div class="detail-row">
                <div class="detail-label">Note / Precedenti:</div>
                <div class="detail-value">${record.note}</div>
            </div>` : ''}
            <div class="detail-row">
                <div class="detail-label">Registrato il:</div>
                <div class="detail-value">${new Date(record.timestamp).toLocaleString('it-IT')}</div>
            </div>
        `;
    } else {
        // Mostra dettagli record normale
        detailsContent.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Nome:</div>
                <div class="detail-value">${record.nomeCittadino}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Cognome:</div>
                <div class="detail-value">${record.cognomeCittadino}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Codice Fiscale:</div>
                <div class="detail-value">${record.codiceFiscale}</div>
            </div>
            ${record.targaVeicolo ? `
            <div class="detail-row">
                <div class="detail-label">Targa:</div>
                <div class="detail-value">${record.targaVeicolo}</div>
            </div>` : ''}
            ${record.tipoInfrazione ? `
            <div class="detail-row">
                <div class="detail-label">Tipo Infrazione:</div>
                <div class="detail-value">${record.tipoInfrazione}</div>
            </div>` : ''}
            ${record.tipoReato ? `
            <div class="detail-row">
                <div class="detail-label">Tipo Reato:</div>
                <div class="detail-value">${record.tipoReato}</div>
            </div>` : ''}
            ${record.tipoDenuncia ? `
            <div class="detail-row">
                <div class="detail-label">Tipo Denuncia:</div>
                <div class="detail-value">${record.tipoDenuncia}</div>
            </div>` : ''}
            ${record.importo ? `
            <div class="detail-row">
                <div class="detail-label">Importo:</div>
                <div class="detail-value">€ ${record.importo}</div>
            </div>` : ''}
            <div class="detail-row">
                <div class="detail-label">Data:</div>
                <div class="detail-value">${record.dataInfrazione || record.dataArresto || record.dataDenuncia}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Luogo:</div>
                <div class="detail-value">${record.luogo}</div>
            </div>
            ${record.note ? `
            <div class="detail-row">
                <div class="detail-label">Note:</div>
                <div class="detail-value">${record.note}</div>
            </div>` : ''}
            ${record.agenteVerbalizzante ? `
            <div class="detail-row">
                <div class="detail-label">Agente:</div>
                <div class="detail-value">${record.agenteVerbalizzante}</div>
            </div>` : ''}
            <div class="detail-row">
                <div class="detail-label">Creato il:</div>
                <div class="detail-value">${new Date(record.timestamp).toLocaleString('it-IT')}</div>
            </div>
        `;
    }

    overlayDetails.classList.add('active');
};

// Modifica record
if (btnEditRecord) {
    btnEditRecord.addEventListener('click', () => {
        const record = currentRecords.find(r => r.id === currentDetailId);
        if (!record) return;

        currentEditId = currentDetailId;
        
        if (isAgentiPage) {
            document.getElementById('formTitle').textContent = 'Modifica Agente';
            
            // Popola il form agente
            document.getElementById('nomeAgente').value = record.nomeAgente;
            document.getElementById('cognomeAgente').value = record.cognomeAgente;
            document.getElementById('matricola').value = record.matricola;
            document.getElementById('forzaOrdine').value = record.forzaOrdine;
            document.getElementById('grado').value = record.grado;
            document.getElementById('username').value = record.username;
            document.getElementById('passwordAgente').value = record.password;
            document.getElementById('email').value = record.email;
            document.getElementById('telefono').value = record.telefono;
            document.getElementById('dataAssunzione').value = record.dataAssunzione;
            document.getElementById('noteAgente').value = record.noteAgente || '';
        } else if (isCittadiniPage) {
            document.getElementById('formTitle').textContent = 'Modifica Cittadino';
            
            // Popola il form cittadino
            document.getElementById('nomeCittadino').value = record.nomeCittadino;
            document.getElementById('cognomeCittadino').value = record.cognomeCittadino;
            document.getElementById('codiceFiscale').value = record.codiceFiscale;
            document.getElementById('dataNascita').value = record.dataNascita;
            document.getElementById('luogoNascita').value = record.luogoNascita;
            document.getElementById('sesso').value = record.sesso;
            document.getElementById('nazionalita').value = record.nazionalita;
            document.getElementById('indirizzoResidenza').value = record.indirizzoResidenza;
            document.getElementById('citta').value = record.citta;
            document.getElementById('cap').value = record.cap;
            document.getElementById('provincia').value = record.provincia;
            document.getElementById('numeroDocumento').value = record.numeroDocumento;
            document.getElementById('tipoDocumento').value = record.tipoDocumento;
            document.getElementById('scadenzaDocumento').value = record.scadenzaDocumento;
            document.getElementById('email').value = record.email || '';
            document.getElementById('telefono').value = record.telefono || '';
            document.getElementById('statoCivile').value = record.statoCivile || '';
            document.getElementById('professione').value = record.professione || '';
            document.getElementById('note').value = record.note || '';
        } else {
            document.getElementById('formTitle').textContent = `Modifica ${getTipoRecord()}`;
            
            // Popola il form normale
            document.getElementById('nomeCittadino').value = record.nomeCittadino;
            document.getElementById('cognomeCittadino').value = record.cognomeCittadino;
            document.getElementById('codiceFiscale').value = record.codiceFiscale;
            if (document.getElementById('targaVeicolo')) document.getElementById('targaVeicolo').value = record.targaVeicolo || '';
            if (document.getElementById('tipoInfrazione')) document.getElementById('tipoInfrazione').value = record.tipoInfrazione || '';
            if (document.getElementById('importo')) document.getElementById('importo').value = record.importo || '';
            if (document.getElementById('dataInfrazione')) document.getElementById('dataInfrazione').value = record.dataInfrazione || '';
            document.getElementById('luogo').value = record.luogo;
            document.getElementById('note').value = record.note || '';
            if (document.getElementById('agenteVerbalizzante')) document.getElementById('agenteVerbalizzante').value = record.agenteVerbalizzante || '';
        }

        overlayDetails.classList.remove('active');
        overlayForm.classList.add('active');
    });
}

// Elimina record
if (btnDeleteRecord) {
    btnDeleteRecord.addEventListener('click', () => {
        if (confirm('Sei sicuro di voler eliminare questo record?')) {
            currentRecords = currentRecords.filter(r => r.id !== currentDetailId);
            saveRecords();
            renderRecords();
            overlayDetails.classList.remove('active');
            currentDetailId = null;
        }
    });
}

// Ricerca
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderRecords(e.target.value);
    });
}

// Chiudi overlay cliccando fuori
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

// Carica i record all'avvio se siamo in una pagina di sezione
if (recordsContainer) {
    loadRecords();
}

// Animazione al caricamento
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