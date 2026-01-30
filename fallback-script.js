// fallback-script.js - работа без Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log('Используем localStorage версию');
    
    // Скрываем loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) loadingScreen.style.display = 'none';
    
    // Глобальные переменные
    let accounts = JSON.parse(localStorage.getItem('telegram_accounts')) || [];
    const themeToggle = document.getElementById('themeToggle');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const accountsGrid = document.getElementById('accountsGrid');
    const accountsCount = document.getElementById('accountsCount');
    const noAccounts = document.getElementById('noAccounts');
    
    // Загрузка демо данных если пусто
    if (accounts.length === 0) {
        loadDemoData();
        accounts = JSON.parse(localStorage.getItem('telegram_accounts'));
    }
    
    // Инициализация
    loadTheme();
    renderAccounts();
    setupEventListeners();
    
    // Функции
    function loadDemoData() {
        const demoAccounts = [
            {
                id: '1',
                title: 'Премиум аккаунт 2018',
                description: 'Старый проверенный аккаунт с историей. Идеально для бизнеса.',
                price: 2500,
                type: 'premium',
                status: 'active',
                phoneNumber: '+79161234567',
                phonePreview: '7916*******',
                date: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Базовый аккаунт 2023',
                description: 'Новый аккаунт, готов к использованию. 2FA не установлен.',
                price: 800,
                type: 'standard',
                status: 'active',
                phoneNumber: '+79031112233',
                phonePreview: '7903*******',
                date: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Бюджетный вариант',
                description: 'Аккаунт 2022 года. Базовая функциональность.',
                price: 450,
                type: 'budget',
                status: 'active',
                phoneNumber: '+79558887766',
                phonePreview: '7955*******',
                date: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('telegram_accounts', JSON.stringify(demoAccounts));
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
    }
    
    function setupEventListeners() {
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                handleSearch(searchInput.value.trim());
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    handleSearch(searchInput.value.trim());
                }
            });
        }
        
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    renderAccounts(btn.dataset.filter, searchInput.value.trim());
                });
            });
        }
    }
    
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    function handleSearch(searchTerm) {
        renderAccounts('all', searchTerm);
    }
    
    function renderAccounts(filter = 'all', searchTerm = '') {
        if (!accountsGrid) return;
        
        // Фильтрация
        let filteredAccounts = accounts.filter(account => {
            // Поиск
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return account.title.toLowerCase().includes(term) ||
                       account.description.toLowerCase().includes(term) ||
                       account.price.toString().includes(searchTerm) ||
                       (account.phonePreview && account.phonePreview.includes(searchTerm));
            }
            
            // Фильтр по статусу
            if (filter === 'available') return account.status === 'active';
            if (filter === 'premium') return account.type === 'premium';
            if (filter === 'cheap') return account.price <= 1000;
            
            return true;
        });
        
        // Скрываем неактивные
        filteredAccounts = filteredAccounts.filter(acc => acc.status !== 'hidden');
        
        // Обновляем счетчик
        if (accountsCount) {
            accountsCount.textContent = filteredAccounts.length;
        }
        
        // Очищаем сетку
        accountsGrid.innerHTML = '';
        
        // Показываем/скрываем сообщение
        if (noAccounts) {
            if (filteredAccounts.length === 0) {
                noAccounts.classList.remove('hidden');
                return;
            } else {
                noAccounts.classList.add('hidden');
            }
        }
        
        // Рендерим аккаунты
        filteredAccounts.forEach(account => {
            const card = createAccountCard(account);
            accountsGrid.appendChild(card);
        });
    }
    
    function createAccountCard(account) {
        const card = document.createElement('div');
        card.className = 'account-card';
        
        // Бейдж
        let badgeClass = '';
        let badgeText = '';
        switch(account.type) {
            case 'premium':
                badgeClass = 'badge-premium';
                badgeText = 'Премиум';
                break;
            case 'standard':
                badgeClass = 'badge-standard';
                badgeText = 'Стандарт';
                break;
            case 'budget':
                badgeClass = 'badge-budget';
                badgeText = 'Бюджет';
                break;
        }
        
        const isSold = account.status === 'sold';
        
        card.innerHTML = `
            <div class="account-header">
                <h3 class="account-title">${account.title}</h3>
                <span class="account-badge ${badgeClass}">${badgeText}</span>
            </div>
            <p class="account-description">${account.description}</p>
            ${account.phonePreview ? 
                `<p class="phone-info"><i class="fas fa-phone"></i> ${account.phonePreview}</p>` : ''}
            <div class="account-footer">
                <div class="account-price">${account.price}₽</div>
                <button class="buy-btn ${isSold ? 'sold' : ''}" 
                        onclick="openBuyModal('${account.id}')"
                        ${isSold ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${isSold ? 'Продано' : 'Купить'}
                </button>
            </div>
        `;
        
        return card;
    }
});

// Функция для модального окна (глобальная)
function openBuyModal(accountId) {
    const accounts = JSON.parse(localStorage.getItem('telegram_accounts')) || [];
    const account = accounts.find(acc => acc.id === accountId);
    
    if (!account) return;
    
    const modalAccountInfo = document.getElementById('modalAccountInfo');
    if (modalAccountInfo) {
        modalAccountInfo.innerHTML = `
            <div class="modal-account-info">
                <h4>${account.title}</h4>
                <p><strong>Описание:</strong> ${account.description}</p>
                <p><strong>Цена:</strong> ${account.price}₽</p>
                ${account.phonePreview ? `<p><strong>Номер:</strong> ${account.phonePreview}</p>` : ''}
                <p><strong>ID аккаунта:</strong> ${account.id}</p>
            </div>
        `;
    }
    
    const telegramLink = document.getElementById('telegramLink');
    if (telegramLink) {
        const message = `Здравствуйте! Хочу купить аккаунт:\n\n` +
                       `Название: ${account.title}\n` +
                       `ID: ${account.id}\n` +
                       `Цена: ${account.price}₽\n\n` +
                       `Пожалуйста, свяжитесь со мной для покупки.`;
        telegramLink.href = `https://t.me/tonurx?text=${encodeURIComponent(message)}`;
        telegramLink.dataset.accountInfo = message;
    }
    
    const buyModal = document.getElementById('buyModal');
    if (buyModal) {
        buyModal.classList.remove('hidden');
    }
}
