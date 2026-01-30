// admin-script.js - ОБНОВЛЕННАЯ ВЕРСИЯ С НОМЕРАМИ
document.addEventListener('DOMContentLoaded', function() {
    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    const ADMIN_EMAIL = 'admin@tgshop.com'; // Измените на свой
    const ADMIN_PASSWORD = 'admin123456';   // Измените на сложный
    
    // Элементы DOM
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const loginFormElement = document.getElementById('loginFormElement');
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    const themeToggleAdmin = document.getElementById('themeToggleAdmin');
    const addAccountForm = document.getElementById('addAccountForm');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const adminAccountsList = document.getElementById('adminAccountsList');
    const adminAccountsCount = document.getElementById('adminAccountsCount');
    const activeCount = document.getElementById('activeCount');
    const soldCount = document.getElementById('soldCount');
    const totalValue = document.getElementById('totalValue');
    const exportBtn = document.getElementById('exportBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const editModal = document.getElementById('editModal');
    
    let accounts = [];
    let currentEditId = null;
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    initAdmin();
    
    // ========== ФУНКЦИИ ==========
    
    async function initAdmin() {
        // Проверяем авторизацию Firebase
        checkFirebaseAuth();
        
        // Загружаем тему
        loadThemeAdmin();
        
        // Инициализируем UI
        initAdminUI();
        
        // Подписываемся на обновления аккаунтов
        subscribeToAdminAccounts();
    }
    
    function checkFirebaseAuth() {
        if (typeof checkAdminAuth === 'function') {
            checkAdminAuth((isLoggedIn) => {
                if (isLoggedIn) {
                    loginForm.style.display = 'none';
                    adminPanel.classList.remove('hidden');
                } else {
                    loginForm.style.display = 'flex';
                    adminPanel.classList.add('hidden');
                }
            });
        }
    }
    
    function loadThemeAdmin() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeToggleAdmin) {
                themeToggleAdmin.innerHTML = '<i class="fas fa-sun"></i>';
            }
        }
    }
    
    function initAdminUI() {
        // Обработчики событий формы входа
        if (loginFormElement) {
            loginFormElement.addEventListener('submit', handleLogin);
        }
        
        // Обработчики админки
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        if (themeToggleAdmin) {
            themeToggleAdmin.addEventListener('click', toggleThemeAdmin);
        }
        
        if (addAccountForm) {
            addAccountForm.addEventListener('submit', handleAddAccount);
        }
        
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', clearAddForm);
        }
        
        if (exportBtn) {
            exportBtn.addEventListener('click', exportData);
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', refreshAdminData);
        }
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail') ? 
                     document.getElementById('adminEmail').value.trim() : 
                     ADMIN_EMAIL;
        const password = adminPassword.value.trim();
        
        if (typeof adminLogin === 'function') {
            adminLogin(email, password, (success, user) => {
                if (success) {
                    loginError.classList.add('hidden');
                    adminPassword.value = '';
                    
                    // Показываем админку
                    loginForm.style.display = 'none';
                    adminPanel.classList.remove('hidden');
                    
                    // Загружаем данные
                    subscribeToAdminAccounts();
                } else {
                    loginError.textContent = 'Неверный email или пароль';
                    loginError.classList.remove('hidden');
                }
            });
        }
    }
    
    function handleLogout() {
        if (confirm('Вы уверены, что хотите выйти из админ-панели?')) {
            if (typeof adminLogout === 'function') {
                adminLogout();
            }
            localStorage.removeItem('admin_logged_in');
            window.location.reload();
        }
    }
    
    function toggleThemeAdmin() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleAdmin.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleAdmin.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    function subscribeToAdminAccounts() {
        if (typeof subscribeToAccounts === 'function') {
            subscribeToAccounts((firebaseAccounts) => {
                accounts = firebaseAccounts;
                renderAdminAccounts();
                updateStats();
            });
        }
    }
    
    // ОБНОВЛЕННАЯ ФОРМА ДОБАВЛЕНИЯ
    function handleAddAccount(e) {
        e.preventDefault();
        
        const title = document.getElementById('accountTitle').value.trim();
        const description = document.getElementById('accountDescription').value.trim();
        const price = parseInt(document.getElementById('accountPrice').value);
        const phoneNumber = document.getElementById('accountPhone').value.trim();
        const phonePreview = document.getElementById('accountPhonePreview').value.trim();
        const status = document.getElementById('accountStatus').value;
        const type = document.getElementById('accountType').value;
        
        if (!title || !description || isNaN(price) || price < 100) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        const newAccount = {
            title,
            description,
            price,
            phoneNumber: phoneNumber || null,
            phonePreview: phonePreview || this.getPhonePreview(phoneNumber),
            type,
            status,
            views: 0,
            createdAt: new Date().toISOString()
        };
        
        if (typeof addAccountToFirebase === 'function') {
            addAccountToFirebase(newAccount, (success, id) => {
                if (success) {
                    clearAddForm();
                    showNotification('Объявление успешно добавлено!');
                } else {
                    showNotification('Ошибка добавления', 'error');
                }
            });
        }
    }
    
    // НОВАЯ ФУНКЦИЯ: Получение превью номера
    function getPhonePreview(phoneNumber) {
        if (!phoneNumber) return '';
        // Показываем только первые 4 цифры
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned.length >= 4) {
            return cleaned.substring(0, 4) + '******';
        }
        return phoneNumber;
    }
    
    // ОБНОВЛЕННЫЙ РЕНДЕРИНГ АККАУНТОВ
    function renderAdminAccounts() {
        if (!adminAccountsList) return;
        
        const sortedAccounts = [...accounts].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        adminAccountsList.innerHTML = '';
        
        if (sortedAccounts.length === 0) {
            adminAccountsList.innerHTML = `
                <div class="no-accounts-message">
                    <p>Нет объявлений. Добавьте первое объявление!</p>
                </div>
            `;
            adminAccountsCount.textContent = '0';
            return;
        }
        
        sortedAccounts.forEach(account => {
            const item = createAdminAccountItem(account);
            adminAccountsList.appendChild(item);
        });
        
        adminAccountsCount.textContent = sortedAccounts.length;
    }
    
    // ОБНОВЛЕННЫЙ ШАБЛОН АККАУНТА
    function createAdminAccountItem(account) {
        const item = document.createElement('div');
        item.className = 'admin-account-item';
        
        // Определяем цвет статуса
        let statusColor = '#28a745';
        let statusText = 'Активно';
        
        if (account.status === 'sold') {
            statusColor = '#dc3545';
            statusText = 'Продано';
        } else if (account.status === 'hidden') {
            statusColor = '#ffc107';
            statusText = 'Скрыто';
        }
        
        // Определяем текст типа
        let typeText = '';
        switch(account.type) {
            case 'premium':
                typeText = 'Премиум';
                break;
            case 'standard':
                typeText = 'Стандарт';
                break;
            case 'budget':
                typeText = 'Бюджет';
                break;
        }
        
        // ДОБАВЛЕНА ИНФОРМАЦИЯ О НОМЕРЕ
        const phoneInfo = account.phonePreview ? 
            `<div><strong>Номер:</strong> ${account.phonePreview}</div>` : '';
        
        const phoneFull = account.phoneNumber ? 
            `<div class="phone-full" style="margin-top: 5px; color: #666; font-size: 0.9em;">
                <strong>Полный номер:</strong> ${account.phoneNumber}
            </div>` : '';
        
        item.innerHTML = `
            <div class="account-info">
                <h4>${account.title}</h4>
                <div class="account-details">
                    <span style="color: ${statusColor}">● ${statusText}</span>
                    <span>${typeText}</span>
                    <span>${account.price}₽</span>
                    <span>ID: ${account.id}</span>
                    <span>${formatDate(account.createdAt)}</span>
                </div>
                ${phoneInfo}
                ${phoneFull}
                <p class="account-description">${account.description}</p>
            </div>
            <div class="account-actions">
                <button class="action-btn edit-btn" data-id="${account.id}">
                    <i class="fas fa-edit"></i> Изменить
                </button>
                <button class="action-btn toggle-btn" data-id="${account.id}">
                    <i class="fas fa-eye${account.status === 'hidden' ? '-slash' : ''}"></i> 
                    ${account.status === 'hidden' ? 'Показать' : 'Скрыть'}
                </button>
                <button class="action-btn delete-btn" data-id="${account.id}">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        `;
        
        // Обработчики
        const editBtn = item.querySelector('.edit-btn');
        const toggleBtn = item.querySelector('.toggle-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => openEditModal(account));
        toggleBtn.addEventListener('click', () => toggleAccountStatus(account.id, account.status));
        deleteBtn.addEventListener('click', () => deleteAccount(account.id));
        
        return item;
    }
    
    // ОБНОВЛЕННАЯ ФОРМА РЕДАКТИРОВАНИЯ
    function openEditModal(account) {
        currentEditId = account.id;
        
        const editForm = document.getElementById('editAccountForm');
        editForm.innerHTML = `
            <div class="form-grid">
                <div class="form-group">
                    <label for="editTitle">Название</label>
                    <input type="text" id="editTitle" value="${account.title}" required>
                </div>
                
                <div class="form-group">
                    <label for="editPrice">Цена (₽)</label>
                    <input type="number" id="editPrice" value="${account.price}" required min="100">
                </div>
                
                <div class="form-group">
                    <label for="editPhone">Номер телефона</label>
                    <input type="text" id="editPhone" value="${account.phoneNumber || ''}" 
                           placeholder="+7XXXXXXXXXX">
                </div>
                
                <div class="form-group">
                    <label for="editPhonePreview">Превью номера</label>
                    <input type="text" id="editPhonePreview" value="${account.phonePreview || ''}" 
                           placeholder="Первые 4 цифры">
                </div>
                
                <div class="form-group">
                    <label for="editType">Тип</label>
                    <select id="editType">
                        <option value="premium" ${account.type === 'premium' ? 'selected' : ''}>Премиум</option>
                        <option value="standard" ${account.type === 'standard' ? 'selected' : ''}>Стандарт</option>
                        <option value="budget" ${account.type === 'budget' ? 'selected' : ''}>Бюджет</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editStatus">Статус</label>
                    <select id="editStatus">
                        <option value="active" ${account.status === 'active' ? 'selected' : ''}>Активно</option>
                        <option value="sold" ${account.status === 'sold' ? 'selected' : ''}>Продано</option>
                        <option value="hidden" ${account.status === 'hidden' ? 'selected' : ''}>Скрыто</option>
                    </select>
                </div>
                
                <div class="form-group full-width">
                    <label for="editDescription">Описание</label>
                    <textarea id="editDescription" rows="4" required>${account.description}</textarea>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn-primary">
                    <i class="fas fa-save"></i> Сохранить
                </button>
                <button type="button" class="btn-secondary" id="cancelEditBtn">
                    <i class="fas fa-times"></i> Отмена
                </button>
            </div>
        `;
        
        editModal.classList.remove('hidden');
        editForm.onsubmit = handleEditSubmit;
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            editModal.classList.add('hidden');
        });
    }
    
    // Остальные функции остаются, но используют Firebase
    // ...
});
