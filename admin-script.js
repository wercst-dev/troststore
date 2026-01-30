// admin-script.js
document.addEventListener('DOMContentLoaded', function() {
    // ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
    const ADMIN_PASSWORD = 'admin123'; // Смените после первого входа!
    let accounts = JSON.parse(localStorage.getItem('telegram_accounts')) || [];
    
    // Элементы DOM
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const loginFormElement = document.getElementById('loginFormElement');
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
    
    let currentEditId = null;
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    initAdmin();
    
    // ========== ФУНКЦИИ ==========
    
    function initAdmin() {
        // Проверяем авторизацию
        checkAuth();
        
        // Загружаем тему
        loadThemeAdmin();
        
        // Загружаем демо данные если пусто
        if (accounts.length === 0) {
            loadDemoDataAdmin();
        }
        
        // Инициализируем UI
        initAdminUI();
        
        // Обновляем статистику
        updateStats();
    }
    
    function checkAuth() {
        const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
        
        if (isLoggedIn) {
            loginForm.style.display = 'none';
            adminPanel.classList.remove('hidden');
        } else {
            loginForm.style.display = 'flex';
            adminPanel.classList.add('hidden');
        }
    }
    
    function loadDemoDataAdmin() {
        if (accounts.length === 0) {
            const demoAccounts = [
                {
                    id: '1',
                    title: 'Премиум аккаунт с историей',
                    description: 'Старый проверенный аккаунт 2018 года.',
                    price: 2500,
                    type: 'premium',
                    status: 'active',
                    date: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Базовый рабочий аккаунт',
                    description: 'Новый аккаунт 2023 года.',
                    price: 800,
                    type: 'standard',
                    status: 'active',
                    date: new Date().toISOString()
                }
            ];
            
            localStorage.setItem('telegram_accounts', JSON.stringify(demoAccounts));
            accounts = demoAccounts;
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
        
        // Закрытие модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close')) {
                editModal.classList.add('hidden');
            }
            if (e.target === editModal) {
                editModal.classList.add('hidden');
            }
        });
        
        // Загружаем список аккаунтов
        renderAdminAccounts();
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        const password = adminPassword.value.trim();
        
        if (password === ADMIN_PASSWORD) {
            // Успешный вход
            localStorage.setItem('admin_logged_in', 'true');
            loginError.classList.add('hidden');
            adminPassword.value = '';
            
            // Показываем админку
            loginForm.style.display = 'none';
            adminPanel.classList.remove('hidden');
            
            // Обновляем данные
            accounts = JSON.parse(localStorage.getItem('telegram_accounts')) || [];
            renderAdminAccounts();
            updateStats();
        } else {
            // Ошибка входа
            loginError.textContent = 'Неверный пароль. Попробуйте снова.';
            loginError.classList.remove('hidden');
        }
    }
    
    function handleLogout() {
        if (confirm('Вы уверены, что хотите выйти из админ-панели?')) {
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
    
    function handleAddAccount(e) {
        e.preventDefault();
        
        const title = document.getElementById('accountTitle').value.trim();
        const description = document.getElementById('accountDescription').value.trim();
        const price = parseInt(document.getElementById('accountPrice').value);
        const status = document.getElementById('accountStatus').value;
        const type = document.getElementById('accountType').value;
        
        if (!title || !description || isNaN(price) || price < 100) {
            alert('Пожалуйста, заполните все поля корректно. Минимальная цена - 100₽');
            return;
        }
        
        const newAccount = {
            id: Date.now().toString(),
            title,
            description,
            price,
            type,
            status,
            date: new Date().toISOString()
        };
        
        accounts.push(newAccount);
        saveAccounts();
        
        // Очищаем форму
        clearAddForm();
        
        // Обновляем UI
        renderAdminAccounts();
        updateStats();
        
        // Показываем уведомление
        showNotification('Объявление успешно добавлено!');
    }
    
    function clearAddForm() {
        document.getElementById('accountTitle').value = '';
        document.getElementById('accountDescription').value = '';
        document.getElementById('accountPrice').value = '';
        document.getElementById('accountStatus').value = 'active';
        document.getElementById('accountType').value = 'premium';
    }
    
    function renderAdminAccounts() {
        if (!adminAccountsList) return;
        
        // Сортируем по дате (новые сверху)
        const sortedAccounts = [...accounts].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
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
        
        item.innerHTML = `
            <div class="account-info">
                <h4>${account.title}</h4>
                <div class="account-details">
                    <span style="color: ${statusColor}">● ${statusText}</span>
                    <span>${typeText}</span>
                    <span>${account.price}₽</span>
                    <span>ID: ${account.id}</span>
                    <span>${new Date(account.date).toLocaleDateString('ru-RU')}</span>
                </div>
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
        
        // Добавляем обработчики
        const editBtn = item.querySelector('.edit-btn');
        const toggleBtn = item.querySelector('.toggle-btn');
        const deleteBtn = item.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => openEditModal(account));
        toggleBtn.addEventListener('click', () => toggleAccountStatus(account.id));
        deleteBtn.addEventListener('click', () => deleteAccount(account.id));
        
        return item;
    }
    
    function openEditModal(account) {
        currentEditId = account.id;
        
        // Заполняем форму
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
        
        // Показываем модальное окно
        editModal.classList.remove('hidden');
        
        // Добавляем обработчики
        editForm.onsubmit = handleEditSubmit;
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            editModal.classList.add('hidden');
        });
    }
    
    function handleEditSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('editTitle').value.trim();
        const description = document.getElementById('editDescription').value.trim();
        const price = parseInt(document.getElementById('editPrice').value);
        const type = document.getElementById('editType').value;
        const status = document.getElementById('editStatus').value;
        
        if (!title || !description || isNaN(price) || price < 100) {
            alert('Пожалуйста, заполните все поля корректно');
            return;
        }
        
        // Находим и обновляем аккаунт
        const index = accounts.findIndex(acc => acc.id === currentEditId);
        if (index !== -1) {
            accounts[index] = {
                ...accounts[index],
                title,
                description,
                price,
                type,
                status,
                date: accounts[index].date // Сохраняем оригинальную дату
            };
            
            saveAccounts();
            renderAdminAccounts();
            updateStats();
            
            // Закрываем модальное окно
            editModal.classList.add('hidden');
            
            // Показываем уведомление
            showNotification('Объявление успешно обновлено!');
        }
    }
    
    function toggleAccountStatus(id) {
        const index = accounts.findIndex(acc => acc.id === id);
        if (index !== -1) {
            if (accounts[index].status === 'hidden') {
                accounts[index].status = 'active';
            } else {
                accounts[index].status = 'hidden';
            }
            
            saveAccounts();
            renderAdminAccounts();
            updateStats();
            
            showNotification('Статус объявления изменен!');
        }
    }
    
    function deleteAccount(id) {
        if (confirm('Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить.')) {
            accounts = accounts.filter(acc => acc.id !== id);
            saveAccounts();
            renderAdminAccounts();
            updateStats();
            
            showNotification('Объявление удалено!');
        }
    }
    
    function updateStats() {
        if (!activeCount || !soldCount || !totalValue) return;
        
        const activeAccounts = accounts.filter(acc => acc.status === 'active');
        const soldAccounts = accounts.filter(acc => acc.status === 'sold');
        const totalSum = accounts.reduce((sum, acc) => sum + acc.price, 0);
        
        activeCount.textContent = activeAccounts.length;
        soldCount.textContent = soldAccounts.length;
        totalValue.textContent = totalSum.toLocaleString('ru-RU');
    }
    
    function exportData() {
        const dataStr = JSON.stringify(accounts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `telegram_accounts_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showNotification('Данные экспортированы!');
    }
    
    function refreshAdminData() {
        accounts = JSON.parse(localStorage.getItem('telegram_accounts')) || [];
        renderAdminAccounts();
        updateStats();
        showNotification('Данные обновлены!');
    }
    
    function saveAccounts() {
        localStorage.setItem('telegram_accounts', JSON.stringify(accounts));
    }
    
    function showNotification(message) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Добавляем CSS анимации
        if (!document.querySelector('#notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
});
