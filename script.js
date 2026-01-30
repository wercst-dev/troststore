// script.js - ОБНОВЛЕННАЯ ВЕРСИЯ
document.addEventListener('DOMContentLoaded', function() {
    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    let accounts = [];
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
    const loadingScreen = document.getElementById('loadingScreen');
    
    let currentFilter = 'all';
    let currentSearch = '';
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    init();
    
    // ========== ФУНКЦИИ ==========
    
    function init() {
        // Загружаем темы
        loadTheme();
        
        // Загружаем аккаунты из Firebase
        loadAccounts();
        
        // Добавляем обработчики событий
        setupEventListeners();
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }
    
    function loadAccounts() {
        // Показываем загрузку
        if (loadingScreen) loadingScreen.style.display = 'flex';
        
        // Подписываемся на обновления в реальном времени
        if (typeof subscribeToAccounts === 'function') {
            subscribeToAccounts((firebaseAccounts) => {
                accounts = firebaseAccounts;
                renderAccounts();
                if (loadingScreen) loadingScreen.style.display = 'none';
            });
        } else {
            // Запасной вариант
            getAccountsFromFirebase((firebaseAccounts) => {
                accounts = firebaseAccounts;
                renderAccounts();
                if (loadingScreen) loadingScreen.style.display = 'none';
            });
        }
    }
    
    // Остальные функции остаются похожими, но работают с данными из Firebase
    // ...
    
    function openBuyModal(account) {
        // ДОБАВЛЕНА ИНФОРМАЦИЯ О НОМЕРЕ
        const modalAccountInfo = document.getElementById('modalAccountInfo');
        modalAccountInfo.innerHTML = `
            <div class="modal-account-info">
                <h4>${account.title}</h4>
                <p><strong>Описание:</strong> ${account.description}</p>
                <p><strong>Цена:</strong> ${account.price}₽</p>
                ${account.phoneNumber ? `<p><strong>Номер:</strong> ${account.phoneNumber}</p>` : ''}
                ${account.phonePreview ? `<p><strong>Начальные цифры:</strong> ${account.phonePreview}</p>` : ''}
                <p><strong>ID аккаунта:</strong> ${account.id}</p>
                <p><strong>Тип:</strong> ${getTypeText(account.type)}</p>
                <p><strong>Дата добавления:</strong> ${formatDate(account.createdAt)}</p>
            </div>
        `;
        
        // ... остальной код
    }
    
    // Вспомогательные функции
    function getTypeText(type) {
        const types = {
            'premium': 'Премиум',
            'standard': 'Стандарт',
            'budget': 'Бюджет'
        };
        return types[type] || type;
    }
    
    function formatDate(timestamp) {
        if (!timestamp) return 'Нет даты';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ru-RU');
    }
});
