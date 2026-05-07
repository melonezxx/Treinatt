document.addEventListener('DOMContentLoaded', () => {
    console.log('ROOT SCRIPT LOADED');
    // Current Date
    const dateDisplay = document.getElementById('current-date');
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateDisplay.innerText = new Date().toLocaleDateString('pt-BR', options);

    // User Data Initialization
    const userData = JSON.parse(localStorage.getItem('treinatt_user')) || {
        name: 'João Silva',
        status: 'Operador em Treinamento',
        isNew: false
    };

    // Update Profile Info
    document.querySelector('.user-name').innerText = userData.name;
    document.querySelector('.user-status').innerText = userData.status;
    document.querySelector('.avatar').innerText = userData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    pageTitle.innerText = `Bem-vindo de volta, ${userData.name.split(' ')[0]}! 👋`;

    // Progress State
    let completedClasses = userData.isNew ? 0 : 13;
    const totalClasses = 20;

    const progressCircle = document.getElementById('progress-circle');
    const progressText = document.getElementById('progress-text');
    const completedText = document.getElementById('classes-completed');
    const remainingText = document.getElementById('classes-remaining');

    function updateProgress() {
        const percentage = Math.round((completedClasses / totalClasses) * 100);
        const degrees = (percentage / 100) * 360;
        
        progressCircle.style.background = `conic-gradient(var(--primary-red) ${degrees}deg, var(--light-gray) 0deg)`;
        progressText.innerText = `${percentage}%`;
        completedText.innerText = completedClasses;
        remainingText.innerText = totalClasses - completedClasses;

        // Sync with Certificates page if exists
        const fill = document.querySelector('.progress-fill');
        if (fill) fill.style.width = `${percentage}%`;
        const label = document.querySelector('.progress-label');
        if (label) label.innerText = `Faltam ${totalClasses - completedClasses} aulas`;

        if (completedClasses === totalClasses) {
            const box = document.querySelector('.remaining-box');
            if (box) {
                box.innerHTML = "<strong>Parabéns!</strong> Você concluiu todas as aulas.";
                box.style.backgroundColor = "#E8F5E9";
                box.style.color = "#2E7D32";
            }
        }
    }

    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        sections.forEach(section => section.classList.add('hidden'));
        const targetSection = document.getElementById(`section-${sectionId}`);
        if (targetSection) targetSection.classList.remove('hidden');

        // Update Title/Subtitle
        if (!pageTitle || !pageSubtitle) return;

        switch(sectionId) {
            case 'dashboard':
                pageTitle.innerText = `Bem-vindo de volta, ${userData.name.split(' ')[0]}! 👋`;
                pageSubtitle.innerText = 'Continue sua jornada para se tornar um operador especialista.';
                break;
            case 'classes':
                pageTitle.innerText = 'Minhas Aulas 📖';
                pageSubtitle.innerText = 'Gerencie sua trilha de aprendizado e veja seu histórico.';
                populateAllClasses();
                break;
            case 'materials':
                pageTitle.innerText = 'Materiais de Apoio 📁';
                pageSubtitle.innerText = 'Acesse apostilas, vídeos e tabelas técnicas.';
                break;
            case 'certificates':
                pageTitle.innerText = 'Certificados 🎓';
                pageSubtitle.innerText = 'Emissão de documentos oficiais após a conclusão.';
                break;
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const target = item.id.replace('nav-', '');
            showSection(target);
        });
    });

    // Populate All Classes
    function populateAllClasses() {
        const list = document.querySelector('.module-list-full');
        list.innerHTML = ''; // Clear
        
        const classes = userData.isNew ? [
            { id: 1, title: 'Introdução à NR-11', status: 'Acessar' },
            { id: 2, title: 'Componentes da Empilhadeira', status: 'Bloqueado' },
            { id: 3, title: 'Checklist e Manutenção', status: 'Bloqueado' },
            { id: 4, title: 'Estabilidade e Centro de Gravidade', status: 'Bloqueado' },
            { id: 5, title: 'NR-11: Normas de Segurança', status: 'Bloqueado' }
        ] : [
            { id: 1, title: 'Introdução à NR-11', status: 'Concluído' },
            { id: 2, title: 'Componentes da Empilhadeira', status: 'Concluído' },
            { id: 3, title: 'Checklist e Manutenção', status: 'Em andamento' },
            { id: 4, title: 'Estabilidade e Centro de Gravidade', status: 'Pendente' },
            { id: 5, title: 'NR-11: Normas de Segurança', status: 'Bloqueado' }
        ];

        classes.forEach(cls => {
            const item = document.createElement('div');
            item.className = 'class-item';
            item.innerHTML = `
                <div class="class-time">Mód. ${cls.id}</div>
                <div class="class-details">
                    <h4>${cls.title}</h4>
                    <p>Status: ${cls.status}</p>
                </div>
                <button class="btn-action" ${cls.status === 'Bloqueado' ? 'disabled' : ''}>${cls.status === 'Concluído' ? 'Revisar' : 'Acessar'}</button>
            `;
            list.appendChild(item);
        });
    }

    // Handle Class Actions (Daily)
    const actionButtons = document.querySelectorAll('.btn-action');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const classItem = this.closest('.class-item');
            if (!classItem) return;

            if (this.innerText === 'Iniciar') {
                this.innerText = 'Concluir';
                this.style.backgroundColor = '#1A1A1A';
                classItem.style.opacity = '0.8';
            } else if (this.innerText === 'Concluir') {
                completedClasses++;
                updateProgress();
                this.innerText = 'Concluído';
                this.disabled = true;
                this.style.backgroundColor = '#2E7D32';
                classItem.style.borderLeftColor = '#2E7D32';
                classItem.style.opacity = '0.6';
                
                const badge = document.querySelector('.badge');
                if (badge) {
                    const currentCount = parseInt(badge.innerText);
                    if (currentCount > 1) {
                        badge.innerText = `${currentCount - 1} Pendentes`;
                    } else {
                        badge.innerText = `Tudo em dia!`;
                        badge.style.backgroundColor = '#E8F5E9';
                        badge.style.color = '#2E7D32';
                    }
                }
            }
        });
    });

    updateProgress();
});

