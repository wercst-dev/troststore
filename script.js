// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    const accounts = JSON.parse(localStorage.getItem('telegram_accounts')) || [];
    const themeToggle = document.getElementById('themeToggle');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const accountsGrid = document.getElementById('accountsGrid');
    const accountsCount = document.getElementById('accountsCount');
    const noAccounts = document.getElementById('noAccounts');
    const buyModal = document.getElementById('buyModal');
    const modalClose = document.querySelector('.modal-close');
    const copyInfoBtn = document.getElementById('copyInfoBtn');
    const telegramLink = document.getElementById('telegramLink');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    
    let currentFilter = 'all';
    let currentSearch = '';
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    init();
    
    // ========== ФУНКЦИИ ==========
    
    function init() {
        // Загружаем темы
        loadTheme();
        
        // Загружаем демо данные если пусто
        if (accounts.length === 0) {
            loadDemoData();
        }
        
        // Рендерим аккаунты
        renderAccounts();
        
        // Добавляем обработчики событий
        setupEventListeners();
    }
    
    function loadDemoData() {
        const demoAccounts = [
            {
                id: '1',
                title: 'Премиум аккаунт с историей',
                description: 'Старый проверенный аккаунт 2018 года. Полная история переписок сохранена. Идеально для бизнеса.',
                price: 2500,
                type: 'premium',
                status: 'active',
                date: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Базовый рабочий аккаунт',
                description: 'Новый аккаунт 2023 года. Готов к использованию. 2FA не установлен.',
                price: 800,
                type: 'standard',
                status: 'active',
                date: new Date().toISOString()
            },
            {
                id: '3',
                title: 'Бюджетный вариант',
                description: 'Аккаунт 2022 года. Базовая функциональность. Подойдет для временного использования.',
                price: 450,
                type: 'budget',
                status: 'active',
                date: new Date().toISOString()
            },
            {
                id: '4',
                title: 'Бизнес аккаунт',
                description: 'Премиум аккаунт с верификацией. Подходит для корпоративного использования.',
                price: 3500,
                type: 'premium',
                status: 'active',
                date: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('telegram_accounts', JSON.stringify(demoAccounts));
        accounts.push(...demoAccounts);
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    function setupEventListeners() {
        // Переключение темы
        themeToggle.addEventListener('click', toggleTheme);
        
        // Поиск
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim();
            renderAccounts();
        });
        
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim();
                renderAccounts();
            }
        });
        
        // Фильтры
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderAccounts();
            });
        });
        
        // Модальное окно
        modalClose.addEventListener('click', () => {
            buyModal.classList.add('hidden');
        });
        
        // Копирование информации
        copyInfoBtn.addEventListener('click', copyAccountInfo);
        
        // Мобильное меню
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');
        });
        
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
        
        // Закрытие модального окна при клике вне его
        window.addEventListener('click', (e) => {
            if (e.target === buyModal) {
                buyModal.classList.add('hidden');
            }
            if (e.target === mobileMenu) {
                mobileMenu.classList.add('hidden');
            }
        });
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
    
    function renderAccounts() {
        // Фильтрация
        let filteredAccounts = accounts.filter(account => {
            // Поиск
            if (currentSearch) {
                const searchLower = currentSearch.toLowerCase();
                if (!account.title.toLowerCase().includes(searchLower) &&
                    !account.description.toLowerCase().includes(searchLower) &&
                    !account.price.toString().includes(currentSearch)) {
                    return false;
                }
            }
            
            // Фильтры
            if (currentFilter === 'available') {
                return account.status === 'active';
            } else if (currentFilter === 'premium') {
                return account.type === 'premium';
            } else if (currentFilter === 'cheap') {
                return account.price <= 1000;
            }
            
            return true;
        });
        
        // Сортируем: активные сверху
        filteredAccounts.sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            return b.price - a.price;
        });
        
        // Обновляем счетчик
        accountsCount.textContent = filteredAccounts.length;
        
        // Очищаем сетку
        accountsGrid.innerHTML = '';
        
        // Показываем/скрываем сообщение "нет аккаунтов"
        if (filteredAccounts.length === 0) {
            noAccounts.classList.remove('hidden');
            return;
        } else {
            noAccounts.classList.add('hidden');
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
        
        // Определяем класс бейджа
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
        
        // Определяем статус
        const isSold = account.status === 'sold';
        const isHidden = account.status === 'hidden';
        
        if (isHidden) return ''; // Пропускаем скрытые
        
        card.innerHTML = `
            <div class="account-header">
                <h3 class="account-title">${account.title}</h3>
                <span class="account-badge ${badgeClass}">${badgeText}</span>
            </div>
            <p class="account-description">${account.description}</p>
            <div class="account-footer">
                <div class="account-price">
                    ${account.price}₽
                </div>
                <button class="buy-btn ${isSold ? 'sold' : ''}" 
                        data-id="${account.id}"
                        ${isSold ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${isSold ? 'Продано' : 'Купить'}
                </button>
            </div>
        `;
        
        // Добавляем обработчик покупки
        if (!isSold) {
            const buyBtn = card.querySelector('.buy-btn');
            buyBtn.addEventListener('click', () => openBuyModal(account));
        }
        
        return card;
    }
    
    function openBuyModal(account) {
        // Заполняем информацию
        const modalAccountInfo = document.getElementById('modalAccountInfo');
        modalAccountInfo.innerHTML = `
            <div class="modal-account-info">
                <h4>${account.title}</h4>
                <p><strong>Описание:</strong> ${account.description}</p>
                <p><strong>Цена:</strong> ${account.price}₽</p>
                <p><strong>ID аккаунта:</strong> ${account.id}</p>
                <p><strong>Тип:</strong> ${account.type === 'premium' ? 'Премиум' : account.type === 'standard' ? 'Стандарт' : 'Бюджет'}</p>
                <p><strong>Дата добавления:</strong> ${new Date(account.date).toLocaleDateString('ru-RU')}</p>
            </div>
        `;
        
        // Обновляем ссылку на Telegram
        const message = `Здравствуйте! Хочу купить аккаунт:\n\n` +
                       `Название: ${account.title}\n` +
                       `ID: ${account.id}\n` +
                       `Цена: ${account.price}₽\n` +
                       `Тип: ${account.type === 'premium' ? 'Премиум' : account.type === 'standard' ? 'Стандарт' : 'Бюджет'}\n\n` +
                       `Пожалуйста, свяжитесь со мной для покупки.`;
        
        telegramLink.href = `https://t.me/tonurx?text=${encodeURIComponent(message)}`;
        
        // Сохраняем информацию для копирования
        telegramLink.dataset.accountInfo = message;
        
        // Показываем модальное окно
        buyModal.classList.remove('hidden');
    }
    
    function copyAccountInfo() {
        const accountInfo = telegramLink.dataset.accountInfo;
        
        // Используем Clipboard API если доступен
        if (navigator.clipboard) {
            navigator.clipboard.writeText(accountInfo)
                .then(() => {
                    const originalText = copyInfoBtn.innerHTML;
                    copyInfoBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                    
                    setTimeout(() => {
                        copyInfoBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Ошибка копирования:', err);
                    fallbackCopy(accountInfo);
                });
        } else {
            fallbackCopy(accountInfo);
        }
    }
    
    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            const originalText = copyInfoBtn.innerHTML;
            copyInfoBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
            
            setTimeout(() => {
                copyInfoBtn.innerHTML = originalText;
            }, 2000);
        } catch (err) {
            console.error('Ошибка копирования:', err);
            alert('Не удалось скопировать. Пожалуйста, скопируйте вручную.');
        }
        
        document.body.removeChild(textArea);
    }
});
