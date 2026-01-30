// admin.js - простая логика админки
document.addEventListener('DOMContentLoaded', function() {
    console.log('Админка загружается...');
    
    // Пароль
    const ADMIN_PASSWORD = '241512';
    
    // Данные
    let accounts = JSON.parse(localStorage.getItem('tg_accounts')) || [];
    let currentEditId = null;
    
    // Проверяем авторизацию
    const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
    
    if (isLoggedIn) {
        showAdminPanel();
    } else {
        showLoginForm();
    }
    
    // Логин форма
    document.getElementById('loginFormElement').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value.trim();
        
        if (password === ADMIN_PASSWORD) {
            localStorage.setItem('admin_logged_in', 'true');
            showAdminPanel();
        } else {
            const errorDiv = document.getElementById('loginError');
            errorDiv.textContent = 'Неверный пароль';
            errorDiv.classList.remove('hidden');
        }
    });
    
    // Выход
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Выйти из админ панели?')) {
            localStorage.removeItem('admin_logged_in');
            location.reload();
        }
    });
    
    // Функции
    function showLoginForm() {
        document.getElementById('loginForm').style.display = 'flex';
        document.getElementById('adminPanel').classList.add('hidden');
    }
    
    function showAdminPanel() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminPanel').classList.remove('hidden');
        
        // Загружаем демо данные если пусто
        if (accounts.length === 0) {
            loadDemoData();
        }
        
        // Инициализация админки
        initAdmin();
    }
    
    function loadDemoData() {
        const demoAccounts = [
            {
                id: '1',
                title: 'Премиум аккаунт 2018',
                description: 'Старый проверенный аккаунт с историей.',
                price: 2500,
                type: 'premium',
                status: 'active',
                phone: '7916',
                date: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Базовый аккаунт 2023',
                description: 'Новый аккаунт, готов к использованию.',
                price: 800,
                type: 'standard',
                status: 'active',
                phone: '7903',
                date: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('tg_accounts', JSON.stringify(demoAccounts));
        accounts = demoAccounts;
    }
    
    function initAdmin() {
        // Форма добавления
        document.getElementById('addAccountForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('accountTitle').value.trim();
            const description = document.getElementById('accountDescription').value.trim();
            const price = parseInt(document.getElementById('accountPrice').value);
            const phone = document.getElementById('accountPhone').value.trim();
            const status = document.getElementById('accountStatus').value;
            const type = document.getElementById('accountType').value;
            
            if (!title || !description || isNaN(price) || price < 100) {
                alert('Заполните все поля правильно! Минимальная цена - 100₽');
                return;
            }
            
            const newAccount = {
                id: Date.now().toString(),
                title,
                description,
                price,
                phone: phone || '',
                type,
                status,
                date: new Date().toISOString()
            };
            
            accounts.push(newAccount);
            saveAccounts();
            renderAdminAccounts();
            updateStats();
            clearForm();
            
            showNotification('Объявление добавлено!');
        });
        
        // Очистка формы
        document.getElementById('clearFormBtn').addEventListener('click', clearForm);
        
        // Обновить
        document.getElementById('refreshBtn').addEventListener('click', function() {
            accounts = JSON.parse(localStorage.getItem('tg_accounts')) || [];
            renderAdminAccounts();
            updateStats();
            showNotification('Данные обновлены!');
        });
        
        // Закрытие модалки
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', function() {
                document.getElementById('editModal').classList.add('hidden');
            });
        });
        
        // Инициальный рендер
        renderAdminAccounts();
        updateStats();
    }
    
    function clearForm() {
        document.getElementById('accountTitle').value = '';
        document.getElementById('accountDescription').value = '';
        document.getElementById('accountPrice').value = '';
        document.getElementById('accountPhone').value = '';
        document.getElementById('accountStatus').value = 'active';
        document.getElementById('accountType').value = 'premium';
    }
    
    function saveAccounts() {
        localStorage.setItem('tg_accounts', JSON.stringify(accounts));
    }
    
    function renderAdminAccounts() {
        const adminAccountsList = document.getElementById('adminAccountsList');
        const adminAccountsCount = document.getElementById('adminAccountsCount');
        
        // Сортируем по дате
        const sortedAccounts = [...accounts].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        adminAccountsList.innerHTML = '';
        
        if (sortedAccounts.length === 0) {
            adminAccountsList.innerHTML = `
                <div style="padding: 3rem; text-align: center; color: #666;">
                    <p>Нет объявлений</p>
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
        item.style.cssText = `
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 1rem;
        `;
        
        // Цвет статуса
        let statusColor = '#16a34a';
        let statusText = 'Активно';
        if (account.status === 'sold') {
            statusColor = '#dc2626';
            statusText = 'Продано';
        } else if (account.status === 'hidden') {
            statusColor = '#f59e0b';
            statusText = 'Скрыто';
        }
        
        // Тип
        let typeText = 'Премиум';
        if (account.type === 'standard') typeText = 'Стандарт';
        if (account.type === 'budget') typeText = 'Бюджет';
        
        item.innerHTML = `
            <div style="flex: 1; min-width: 300px;">
                <div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 0.5rem;">
                    <h4 style="font-size: 1.1rem; font-weight: 600;">${account.title}</h4>
                    <span style="
                        background: ${statusColor};
                        color: white;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 0.8rem;
                    ">${statusText}</span>
                </div>
                
                <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
                    <span style="color: #666;">${typeText}</span>
                    <span style="color: #666;">${account.price}₽</span>
                    <span style="color: #666;">ID: ${account.id}</span>
                    ${account.phone ? `<span style="color: #666;">Номер: ${account.phone}******</span>` : ''}
                </div>
                
                <p style="color: #666; line-height: 1.5;">${account.description}</p>
            </div>
            
            <div style="display: flex; gap: 0.5rem;">
                <button class="edit-btn" data-id="${account.id}" style="
                    padding: 6px 12px;
                    background: #0ea5e9;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                ">
                    <i class="fas fa-edit"></i>
                </button>
                
                <button class="toggle-btn" data-id="${account.id}" style="
                    padding: 6px 12px;
                    background: #f59e0b;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                ">
                    <i class="fas fa-eye${account.status === 'hidden' ? '-slash' : ''}"></i>
                </button>
                
                <button class="delete-btn" data-id="${account.id}" style="
                    padding: 6px 12px;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                ">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Обработчики
        item.querySelector('.edit-btn').addEventListener('click', () => openEditModal(account));
        item.querySelector('.toggle-btn').addEventListener('click', () => toggleStatus(account.id));
        item.querySelector('.delete-btn').addEventListener('click', () => deleteAccount(account.id));
        
        return item;
    }
    
    function openEditModal(account) {
        currentEditId = account.id;
        
        const form = document.getElementById('editAccountForm');
        form.innerHTML = `
            <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Название
                    </label>
                    <input type="text" id="editTitle" value="${account.title}" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--bg);
                        color: var(--text);
                    ">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Цена (₽)
                    </label>
                    <input type="number" id="editPrice" value="${account.price}" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--bg);
                        color: var(--text);
                    ">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Телефон
                    </label>
                    <input type="text" id="editPhone" value="${account.phone || ''}" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--bg);
                        color: var(--text);
                    ">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Тип
                    </label>
                    <select id="editType" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--bg);
                        color: var(--text);
                    ">
                        <option value="premium" ${account.type === 'premium' ? 'selected' : ''}>Премиум</option>
                        <option value="standard" ${account.type === 'standard' ? 'selected' : ''}>Стандарт</option>
                        <option value="budget" ${account.type === 'budget' ? 'selected' : ''}>Бюджет</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Статус
                    </label>
                    <select id="editStatus" style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--bg);
                        color: var(--text);
                    ">
                        <option value="active" ${account.status === 'active' ? 'selected' : ''}>Активно</option>
                        <option value="sold" ${account.status === 'sold' ? 'selected' : ''}>Продано</option>
                        <option value="hidden" ${account.status === 'hidden' ? 'selected' : ''}>Скрыто</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                        Описание
                    </label>
                    <textarea id="editDescription" rows="4" required style="
                        width: 100%;
                        padding: 12px;
                        border: 1px solid var(--border);
                        border-radius: 6px;
                        background: var(--bg);
                        color: var(--text);
                        resize: vertical;
                    ">${account.description}</textarea>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button type="submit" style="
                    padding: 12px 24px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <i class="fas fa-save"></i> Сохранить
                </button>
                
                <button type="button" id="cancelEdit" style="
                    padding: 12px 24px;
                    background: var(--card);
                    color: var(--text);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Отмена
                </button>
            </div>
        `;
        
        document.getElementById('editModal').classList.remove('hidden');
        
        // Отмена
        document.getElementById('cancelEdit').addEventListener('click', () => {
            document.getElementById('editModal').classList.add('hidden');
        });
        
        // Сохранение
        form.onsubmit = function(e) {
            e.preventDefault();
            
            const title = document.getElementById('editTitle').value.trim();
            const description = document.getElementById('editDescription').value.trim();
            const price = parseInt(document.getElementById('editPrice').value);
            const phone = document.getElementById('editPhone').value.trim();
            const type = document.getElementById('editType').value;
            const status = document.getElementById('editStatus').value;
            
            if (!title || !description || isNaN(price) || price < 100) {
                alert('Заполните все поля правильно!');
                return;
            }
            
            const index = accounts.findIndex(acc => acc.id === currentEditId);
            if (index !== -1) {
                accounts[index] = {
                    ...accounts[index],
                    title,
                    description,
                    price,
                    phone: phone || '',
                    type,
                    status
                };
                
                saveAccounts();
                renderAdminAccounts();
                updateStats();
                document.getElementById('editModal').classList.add('hidden');
                
                showNotification('Объявление обновлено!');
            }
        };
    }
    
    function toggleStatus(id) {
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
            showNotification('Статус изменен!');
        }
    }
    
    function deleteAccount(id) {
        if (confirm('Удалить это объявление?')) {
            accounts = accounts.filter(acc => acc.id !== id);
            saveAccounts();
            renderAdminAccounts();
            updateStats();
            showNotification('Объявление удалено!');
        }
    }
    
    function updateStats() {
        const active = accounts.filter(acc => acc.status === 'active').length;
        const sold = accounts.filter(acc => acc.status === 'sold').length;
        const total = accounts.reduce((sum, acc) => sum + acc.price, 0);
        
        document.getElementById('activeCount').textContent = active;
        document.getElementById('soldCount').textContent = sold;
        document.getElementById('totalValue').textContent = total;
    }
    
    function showNotification(message) {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Анимация
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
});
