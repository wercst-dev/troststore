// firebase-config.js
const firebaseConfig = {
    apiKey: "ВАШ_API_KEY",
    authDomain: "ВАШ_AUTH_DOMAIN",
    projectId: "ВАШ_PROJECT_ID",
    storageBucket: "ВАШ_STORAGE_BUCKET",
    messagingSenderId: "ВАШ_SENDER_ID",
    appId: "ВАШ_APP_ID"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Публичные функции для использования
function getAccountsFromFirebase(callback) {
    db.collection("accounts")
        .orderBy("createdAt", "desc")
        .get()
        .then((querySnapshot) => {
            const accounts = [];
            querySnapshot.forEach((doc) => {
                accounts.push({ id: doc.id, ...doc.data() });
            });
            callback(accounts);
        })
        .catch((error) => {
            console.error("Ошибка загрузки: ", error);
            callback([]);
        });
}

function addAccountToFirebase(account, callback) {
    const accountWithMeta = {
        ...account,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection("accounts").add(accountWithMeta)
        .then((docRef) => {
            console.log("Документ добавлен с ID: ", docRef.id);
            callback(true, docRef.id);
        })
        .catch((error) => {
            console.error("Ошибка добавления: ", error);
            callback(false, null);
        });
}

function updateAccountInFirebase(id, updates, callback) {
    const updatedData = {
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection("accounts").doc(id).update(updatedData)
        .then(() => {
            console.log("Документ обновлен");
            callback(true);
        })
        .catch((error) => {
            console.error("Ошибка обновления: ", error);
            callback(false);
        });
}

function deleteAccountFromFirebase(id, callback) {
    db.collection("accounts").doc(id).delete()
        .then(() => {
            console.log("Документ удален");
            callback(true);
        })
        .catch((error) => {
            console.error("Ошибка удаления: ", error);
            callback(false);
        });
}

// Реальное время обновление
function subscribeToAccounts(callback) {
    db.collection("accounts")
        .orderBy("createdAt", "desc")
        .onSnapshot((querySnapshot) => {
            const accounts = [];
            querySnapshot.forEach((doc) => {
                accounts.push({ id: doc.id, ...doc.data() });
            });
            callback(accounts);
        }, (error) => {
            console.error("Ошибка подписки: ", error);
        });
}

// Авторизация администратора
function adminLogin(email, password, callback) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            callback(true, userCredential.user);
        })
        .catch((error) => {
            console.error("Ошибка входа: ", error);
            callback(false, null);
        });
}

function checkAdminAuth(callback) {
    auth.onAuthStateChanged((user) => {
        callback(!!user);
    });
}

function adminLogout() {
    auth.signOut();
}
