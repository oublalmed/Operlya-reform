// ================================= Import Firebase SDKs ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, increment, serverTimestamp, onSnapshot, query, orderBy, where, limit, startAfter } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyAEiWuQEiVKo61WXgqpJNtAduaMhs7w_MY",
  authDomain: "operlya.firebaseapp.com",
  projectId: "operlya",
  storageBucket: "operlya.firebasestorage.app",
  messagingSenderId: "456390805536",
  appId: "1:456390805536:web:311aa8aecadabd48c21445",
  measurementId: "G-MVH7XXTVVL"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUserId = null;
const THEME_KEY = "operlya-theme";
function applyThemeEarly() {
  const mode = localStorage.getItem(THEME_KEY) || "system";
  if (mode === "dark") {
    document.body.classList.add("dark-mode");
  } else if (mode === "white") {
    document.body.classList.remove("dark-mode");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.body.classList.toggle("dark-mode", prefersDark);
  }
}
applyThemeEarly();
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;
    updateUserSection(user);
    setupAccountView(user);
    loadUserConsumptionHistory(user.uid);
    loadUserOrdersHistory(user.uid);
    calculateAffiliateRewards(user.uid);
    checkWelcomeNotification(user.uid);
  } else {
    currentUserId = null;
    updateUserSection(null);
    if (!window.location.pathname.includes("/auth/login.html")) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = "/auth/login.html";
    }
  }
});

async function checkWelcomeNotification(userId) {
  try {
    const notifRef = collection(db, "users", userId, "notifications");
    const q = query(
      notifRef,
      where("reference", "==", "WELCOME40"),
      where("read", "==", false)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      snapshot.forEach(async (docSnap) => {
        const data = docSnap.data();
        showNotification("congrats", data.title, data.message);
        await updateDoc(doc(db, "users", userId, "notifications", docSnap.id), {
          read: true
        });
      });
    }
  } catch (error) {
    console.error("Error checking welcome notification:", error);
  }
}

async function updateUserSection(user) {
  const selectedLang = getCurrentLang();
  const t = cvbUserInfoTranslations[selectedLang] || cvbUserInfoTranslations['en'];
  const tUser = UserForm_translations[selectedLang] || UserForm_translations['en'];
  const p = cvbTopBarTranslations[selectedLang] || cvbTopBarTranslations['en'];
  
  const navbarActions = document.getElementById('navbarActions');
  if (!navbarActions) return;
  if (user) {
    try {
      const profileRef = doc(db, "profiles", user.uid);
      const userRef = doc(db, "users", user.uid);

      const [profileSnap, userSnap] = await Promise.all([
        getDoc(profileRef),
        getDoc(userRef)
      ]);

      let firstName = "";
      let lastName = "";
      let userCoins = 0;
      let userRole = "";
      let avatarURL = "";

      if (profileSnap.exists()) {
        const data = profileSnap.data();
        firstName = data.first_name || "";
        lastName = data.last_name || "";
        const roleKey = data.role
          ? `role-${data.role.toLowerCase().replace(/\s+/g, "_")}`
          : "role-talent";

        userRole = tUser[roleKey] || data.role || "Talent";
        avatarURL = data.avatar || "/images/default_avatar.png";
      }

      if (userSnap.exists()) {
        userCoins = await getUserTotalCoins(user.uid);
      }

      navbarActions.innerHTML = `
        <div class="user-info-container" id="userInfoContainer">
          <div class="user-info" id="userInfoToggle">
            <div class="user-avatar">
              <img id="navbarAvatar1" src="/images/default_avatar.png" alt="Avatar">
            </div>
            <i class="ri-arrow-down-s-line"></i>
            <div class="notification-bell" id="notificationBell">
              <i class="ri-notification-3-line"></i>
              <span class="notif-count" id="notifCount">0</span>
            </div>
          </div>
          <div class="user-dropdown" id="userDropdown">
            <div class="user-dropdown-Content" id="userDropdown-Content">
              <div class="user-dropdown-info">
                <div class="user-dropdown-avatar">
                  <img id="navbarAvatar2" src="/images/default_avatar.png" alt="Avatar">
                </div>
                <div class="user-dropdown-infoText">
                  <span class="spanName">${firstName} ${lastName} <span class="spanStatus">${userRole}</span></span>
                  <span class="spanEmail">${user.email}</span>
                </div>
              </div>
              <div class="user-balance">
                <div class="user-balanceCoins">
                  <strong id="userCoinsLab">${t.currentBalance}</strong>
                  <p>${userCoins}</p>
                </div>
                <button id="viewWalletBtn" class="user-balanceButton">${t.myWallet}</button>
              </div>
              <div class="user-actions">
                <button class="nav_account-button products-toggle" id="productsToggle">
                    <i class="ri-apps-line"></i>
                    <span>${p.workspace}</span>
                    <i class="ri-arrow-down-s-line products-arrow"></i>
                </button>
                <div class="products-dropdown" id="productsDropdown">
                  <a href="/talents/resume.html" class="nav_account-button">
                    <i class="ri-file-list-3-line"></i>${p.resumeBuilder}
                  </a>
                  <a href="/feed.html" class="nav_account-button">
                    <i class="ri-compass-discover-line"></i>${p.opportunitiesExplorer}
                  </a>
                  <a href="/execution.html" class="nav_account-button">
                    <i class="ri-timeline-view"></i>${p.executionCenter}
                  </a>
                  <a href="/manager.html" class="nav_account-button">
                    <i class="ri-speed-up-fill"></i>${p.opportunitiesManager}
                  </a>
                  <a href="/create.html" class="nav_account-button">
                    <i class="ri-add-circle-line"></i>${p.postOpportunity}
                  </a>
                </div>
                <button id="viewNotifsBtn" class="nav_account-button">
                  <i class="ri-notification-3-line"></i>${t.notifications}
                </button>
                <button id="viewAccountBtn" class="nav_account-button">
                  <i class="ri-settings-4-line"></i>${t.userAccount}
                </button>
                <button id="themeToggleBtn" class="nav_theme-button">
                  <i class="ri-moon-line" id="themeIcon"></i>
                  <span id="themeLabel">${t.theme}</span>
                </button>
                <button id="logoutBtn" class="nav_logout-button">
                  <i class="ri-logout-circle-r-line"></i>${t["userLogout"]}
                </button>
              </div>
            </div>
            <div class="notif-list" id="notifList">
              <div class="notif-header">
                <button class="notif-back" id="notifBackBtn">
                  <i class="ri-arrow-left-line"></i>
                </button>
                <span>${t.notifications}</span>
              </div>

              <div class="notif-items" id="notifItems"></div>
            </div>
          </div>
        </div>
      `;

      setTimeout(() => {
        const themeBtn = document.getElementById("themeToggleBtn");
        if (themeBtn) {
          themeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            cycleTheme();
          });
        }
        updateThemeButtonUI(localStorage.getItem(THEME_KEY) || "system");
      }, 0);
      
      initNotifications(user.uid);
      applyUserAvatar(avatarURL);

      const userInfoToggle = document.getElementById("userInfoToggle");
      const userDropdown = document.getElementById("userDropdown");
      const userInfoContainer = document.getElementById("userInfoContainer");

      const viewWalletBtn = document.getElementById("viewWalletBtn");

      const productsToggle = document.getElementById("productsToggle");
      const productsDropdown = document.getElementById("productsDropdown");

      const notificationBell = document.getElementById("notificationBell");
      const viewNotifsBtn = document.getElementById("viewNotifsBtn");

      const profileContent = document.getElementById("userDropdown-Content");
      const notifList = document.getElementById("notifList");
      const notifBackBtn = document.getElementById("notifBackBtn");

      function showProfilePanel() {
        profileContent.classList.remove("hidden");
        notifList.classList.remove("show");
        notifList.classList.add("hidden");
      }

      function showNotificationsPanel() {
        userDropdown.classList.add("show");
        profileContent.classList.add("hidden");
        notifList.classList.remove("hidden");
        notifList.classList.add("show");
      }

      userInfoToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
        if (userDropdown.classList.contains("show")) {
          showProfilePanel();
        }
      });

      if (viewWalletBtn) {
        viewWalletBtn.addEventListener("click", () => {
          window.location.href = "/account.html?tab=history";
        });
      }

      notificationBell.addEventListener("click", (e) => {
        e.stopPropagation();
        showNotificationsPanel();
      });

      viewNotifsBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        showNotificationsPanel();
      });

      notifBackBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        showProfilePanel();
      });

      document.addEventListener("click", (e) => {
        if (!userInfoContainer.contains(e.target)) {
          userDropdown.classList.remove("show");
          showProfilePanel();
        }
      });

      productsToggle?.addEventListener("click", () => {
        productsDropdown.classList.toggle("show");
        productsToggle.classList.toggle("active");
      });

      document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
          await signOut(auth);
        } catch (err) {
          console.error("Logout failed:", err);
        }
      });

      const viewAccountBtn = document.getElementById("viewAccountBtn");
      if (viewAccountBtn) {
        viewAccountBtn.addEventListener("click", () => {
          window.location.href = "/account.html";
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  } else {
    navbarActions.innerHTML = `
      <button id="loginButton" class="nav_flagButton">
        <i class="ri-login-circle-line"></i> ${t["userlogin"]}
      </button>
    `;

    document.getElementById("loginButton").addEventListener("click", () => {
      openLoginModal();
    });
  }
}

async function getUserTotalCoins(userId) {
  const rewardsRef = collection(db, "users", userId, "rewards");
  const consumptionsRef = collection(db, "users", userId, "consumptions");

  let rewardsCoins = 0;
  const rewardsSnap = await getDocs(rewardsRef);

  rewardsSnap.forEach(docSnap => {
    const p = Number(docSnap.data().coins ?? 0);
    rewardsCoins += p;
  });

  let consumedCoins = 0;
  const consumptionsSnap = await getDocs(consumptionsRef);

  consumptionsSnap.forEach(docSnap => {
    const p = Number(docSnap.data().coins_used ?? docSnap.data().coins ?? 0); // 🔥 FIX
    consumedCoins += p;
  });

  return rewardsCoins - consumedCoins;
}

function applyUserAvatar(avatarUrl) {
  if (!avatarUrl) return;

  document
    .querySelectorAll("#navbarAvatar1, #navbarAvatar2, #profileAvatar")
    .forEach(img => {
      img.src = avatarUrl;
    });
}

function initNotifications(userId) {

  const notifRef = collection(db, "users", userId, "notifications");

  onSnapshot(notifRef, (snapshot) => {

    const notifItems = document.getElementById("notifItems");
    const notifCount = document.getElementById("notifCount");

    if (!notifList || !notifCount) return;

    notifItems.innerHTML = "";

    let unread = 0;

    if (snapshot.empty) {
      notifItems.innerHTML = `
        <div class="notif-empty">
          <i class="ri-notification-off-line"></i>
          No notifications
        </div>
      `;
      notifCount.style.display = "none";
      return;
    }

    const notifications = [];

    snapshot.forEach(docSnap => {
      notifications.push({ id: docSnap.id, ...docSnap.data() });
    });

    notifications.sort((a, b) => {
      const ta = a.createdAt?.seconds || 0;
      const tb = b.createdAt?.seconds || 0;
      return tb - ta;
    });

    notifications.forEach(data => {

      if (!data.read) unread++;

      const time = data.createdAt?.seconds
        ? new Date(data.createdAt.seconds * 1000).toLocaleString()
        : "";

      const item = document.createElement("div");
      item.className = "notif-item " + (!data.read ? "unread" : "");

      item.innerHTML = `
        <div class="notif-title">${data.title || "Notification"}</div>
        <div class="notif-message">${data.message || data.notifText || ""}</div>
      `;

      item.onclick = async () => {
        try {
          if (!data.read) {
            const notifDoc = doc(db, "users", userId, "notifications", data.id);
            await updateDoc(notifDoc, {
              read: true
            });
          }
        } catch (err) {
        }
        if (data.link) {
          window.location.href = data.link;
        }
      };

      notifItems.appendChild(item);
    });

    if (unread > 0) {
      notifCount.style.display = "block";
      notifCount.innerText = unread;
    } else {
      notifCount.style.display = "none";
    }

  });
}

function applyTheme(mode) {
  const root = document.body;

  if (mode === "dark") {
    root.classList.add("dark-mode");
  } else if (mode === "white") {
    root.classList.remove("dark-mode");
  } else if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark-mode", prefersDark);
  }

  localStorage.setItem(THEME_KEY, mode);
  updateThemeButtonUI(mode);
}

function updateThemeButtonUI(currentMode) {
  const icon = document.getElementById("themeIcon");
  const label = document.getElementById("themeLabel");

  if (!icon || !label) return;

  const selectedLang = getCurrentLang();
  const t = cvbUserInfoTranslations[selectedLang] || cvbUserInfoTranslations.en;

  const nextMode =
    currentMode === "system" ? "white" :
    currentMode === "white" ? "dark" :
    "system";

  if (nextMode === "white") {
    icon.className = "ri-sun-line";
    label.textContent = t.themeLight;
  }
  else if (nextMode === "dark") {
    icon.className = "ri-moon-line";
    label.textContent = t.themeDark;
  }
  else {
    icon.className = "ri-computer-line";
    label.textContent = t.themeSystem;
  }
}

function cycleTheme() {
  const current = localStorage.getItem(THEME_KEY) || "system";

  const next =
    current === "system" ? "white" :
    current === "white" ? "dark" :
    "system";

  applyTheme(next);
}

document.getElementById('cvb_menu_toggle').addEventListener('click', mobiletopBar);
function mobiletopBar() {
  const menu = document.querySelector('.cvb-topbar-containerMobile');
  const toggle = document.querySelector('.cvb-menu-toggle');
  menu.classList.toggle('active');
  toggle.classList.toggle('active');
}

const avatarImg = document.getElementById("profileAvatar");
const avatarFileInput = document.getElementById("profileAvatarFile");
const avatarLinkInput = document.getElementById("profileAvatarLink");

let originalAvatar = "";
let pendingAvatar = "";

document.getElementById("editAvatarBtn").addEventListener("click", () => {
  avatarFileInput.click();
});

const avatarActions = document.getElementById("avatarActions");
avatarFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  originalAvatar = avatarImg.src;

  const reader = new FileReader();
  reader.onload = (event) => {
    pendingAvatar = event.target.result;
    avatarImg.src = pendingAvatar;
    avatarLinkInput.value = pendingAvatar;
    avatarActions.classList.add("show");
  };
  reader.readAsDataURL(file);
});

const cancelAvatarBtn = document.getElementById("cancelAvatarBtn");
cancelAvatarBtn.addEventListener("click", () => {
  avatarImg.src = originalAvatar;
  pendingAvatar = "";
  avatarActions.classList.remove("show");
});

const saveAvatarBtn = document.getElementById("saveAvatarBtn");
saveAvatarBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user || !pendingAvatar) return;

  const userRef = doc(db, "profiles", user.uid);
  await setDoc(userRef, {
    avatar: pendingAvatar
  }, { merge: true });

  avatarActions.classList.remove("show");
  applyUserAvatar(pendingAvatar);
});

// ================================ HELP TICKET ====================================

["openhelpMobile", "topBarHelp"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("click", () => {
      document.getElementById("helpModal").style.display = "flex";
    });
  }
});

document.getElementById("closeHelp").addEventListener("click", () => {
  document.getElementById("helpModal").style.display = "none";
  document.getElementById("helpFormContainer").style.display = "none";
});

const helpFormLabels = {
  en: {
    account: "Tell us what issue you're facing with your account.",
    coins: "Explain your problem with coins or payments.",
    builder: "Describe your issue with the CV builder.",
    bug: "Explain the bug you found so we can fix it quickly."
  },
  fr: {
    account: "Dites-nous quel problème vous rencontrez avec votre compte.",
    coins: "Expliquez votre problème avec les pièces ou les paiements.",
    builder: "Décrivez votre problème avec le créateur de CV.",
    bug: "Expliquez le bug que vous avez trouvé afin que nous puissions le corriger rapidement."
  },
  ar: {
    account: "أخبرنا بالمشكلة التي تواجهها مع حسابك.",
    coins: "اشرح مشكلتك مع العملات أو المدفوعات.",
    builder: "صف مشكلتك مع منشئ السيرة الذاتية.",
    bug: "اشرح الخطأ الذي وجدته حتى نتمكن من إصلاحه بسرعة."
  },
  es: {
    account: "Cuéntanos qué problema tienes con tu cuenta.",
    coins: "Explica tu problema con monedas o pagos.",
    builder: "Describe tu problema con el creador de CV.",
    bug: "Explica el error que encontraste para que podamos solucionarlo rápidamente."
  },
  zh: {
    account: "请告诉我们您的账户遇到了什么问题。",
    coins: "请说明您在使用币或付款时遇到的问题。",
    builder: "请描述您在使用简历生成器时遇到的问题。",
    bug: "请说明您发现的错误，以便我们尽快修复。"
  },
  de: {
    account: "Teilen Sie uns mit, welches Problem Sie mit Ihrem Konto haben.",
    coins: "Erklären Sie Ihr Problem mit Münzen oder Zahlungen.",
    builder: "Beschreiben Sie Ihr Problem mit dem Lebenslauf-Ersteller.",
    bug: "Erklären Sie den gefundenen Fehler, damit wir ihn schnell beheben können."
  },
  pt: {
    account: "Conte-nos qual problema você está enfrentando com sua conta.",
    coins: "Explique seu problema com moedas ou pagamentos.",
    builder: "Descreva seu problema com o criador de currículo.",
    bug: "Explique o bug que você encontrou para que possamos corrigi-lo rapidamente."
  },
  ja: {
    account: "アカウントで発生している問題をお知らせください。",
    coins: "コインや支払いに関する問題を説明してください。",
    builder: "CVビルダーでの問題を説明してください。",
    bug: "見つけたバグを説明してください。すぐに修正します。"
  },
  ru: {
    account: "Расскажите, с какой проблемой вы столкнулись в аккаунте.",
    coins: "Объясните вашу проблему с монетами или платежами.",
    builder: "Опишите вашу проблему с конструктором резюме.",
    bug: "Объясните найденную ошибку, чтобы мы могли быстро её исправить."
  }
};

function openHelpForm(type) {
  const selectedLang = getCurrentLang();
  const t = helpFormLabels[selectedLang] || helpFormLabels['en'];

  document.getElementById("helpFormContainer").style.display = "grid";

  const label = {
    account: t.account,
    coins: t.coins,
    builder: t.builder,
    bug: t.bug,
  };

  document.getElementById("helpMessage").placeholder = label[type];
}

const helpCategory = document.getElementById("helpCategory");
if (helpCategory) {
  helpCategory.addEventListener("change", (e) => {
    openHelpForm(e.target.value);
  });
}

const helpTicketTranslations = {
  en: {
    notLoggedInTitle: "Not Logged In",
    notLoggedIn: "Please log in to submit a help ticket.",
    incompleteFieldsTitle: "Incomplete Fields",
    incompleteFields: "Please complete all fields before submitting.",
    savedTitle: "Ticket Submitted",
    saved: "Your help ticket has been submitted. Our team will contact you soon.",
    saveErrorTitle: "Submission Failed",
    saveError: "Failed to submit help ticket."
  },
  fr: {
    notLoggedInTitle: "Non Connecté",
    notLoggedIn: "Veuillez vous connecter pour soumettre un ticket d'aide.",
    incompleteFieldsTitle: "Champs Incomplets",
    incompleteFields: "Veuillez remplir tous les champs avant de soumettre.",
    savedTitle: "Ticket Envoyé",
    saved: "Votre ticket d'aide a été soumis. Notre équipe vous contactera bientôt.",
    saveErrorTitle: "Échec de l'Envoi",
    saveError: "Échec de l'envoi du ticket d'aide."
  },
  ar: {
    notLoggedInTitle: "غير مسجل الدخول",
    notLoggedIn: "الرجاء تسجيل الدخول لإرسال طلب المساعدة.",
    incompleteFieldsTitle: "حقول ناقصة",
    incompleteFields: "يرجى إكمال جميع الحقول قبل الإرسال.",
    savedTitle: "تم الإرسال",
    saved: "تم إرسال طلب المساعدة الخاص بك. سيتواصل معك فريقنا قريبًا.",
    saveErrorTitle: "فشل الإرسال",
    saveError: "فشل في إرسال طلب المساعدة."
  },
  es: {
    notLoggedInTitle: "No Conectado",
    notLoggedIn: "Por favor, inicia sesión para enviar un ticket de ayuda.",
    incompleteFieldsTitle: "Campos Incompletos",
    incompleteFields: "Por favor, completa todos los campos antes de enviar.",
    savedTitle: "Ticket Enviado",
    saved: "Tu ticket de ayuda ha sido enviado. Nuestro equipo se pondrá en contacto pronto.",
    saveErrorTitle: "Error al Enviar",
    saveError: "No se pudo enviar el ticket de ayuda."
  },
  zh: {
    notLoggedInTitle: "未登录",
    notLoggedIn: "请登录以提交帮助请求。",
    incompleteFieldsTitle: "字段不完整",
    incompleteFields: "请在提交前填写所有字段。",
    savedTitle: "请求已提交",
    saved: "您的帮助请求已提交。我们的团队将尽快与您联系。",
    saveErrorTitle: "提交失败",
    saveError: "提交帮助请求失败。"
  },
  de: {
    notLoggedInTitle: "Nicht Eingeloggt",
    notLoggedIn: "Bitte melden Sie sich an, um ein Hilfeticket einzureichen.",
    incompleteFieldsTitle: "Unvollständige Felder",
    incompleteFields: "Bitte füllen Sie alle Felder aus, bevor Sie senden.",
    savedTitle: "Ticket Eingereicht",
    saved: "Ihr Hilfeticket wurde eingereicht. Unser Team wird Sie bald kontaktieren.",
    saveErrorTitle: "Fehler beim Senden",
    saveError: "Das Hilfeticket konnte nicht gesendet werden."
  },
  pt: {
    notLoggedInTitle: "Não Conectado",
    notLoggedIn: "Por favor, faça login para enviar um ticket de ajuda.",
    incompleteFieldsTitle: "Campos Incompletos",
    incompleteFields: "Por favor, preencha todos os campos antes de enviar.",
    savedTitle: "Ticket Enviado",
    saved: "Seu ticket de ajuda foi enviado. Nossa equipe entrará em contato em breve.",
    saveErrorTitle: "Falha no Envio",
    saveError: "Falha ao enviar o ticket de ajuda."
  },
  ja: {
    notLoggedInTitle: "未ログイン",
    notLoggedIn: "ヘルプチケットを送信するにはログインしてください。",
    incompleteFieldsTitle: "未入力の項目",
    incompleteFields: "送信する前にすべての項目を入力してください。",
    savedTitle: "チケット送信完了",
    saved: "ヘルプチケットが送信されました。チームがすぐにご連絡します。",
    saveErrorTitle: "送信失敗",
    saveError: "ヘルプチケットの送信に失敗しました。"
  },
  ru: {
    notLoggedInTitle: "Не Вошли в Систему",
    notLoggedIn: "Пожалуйста, войдите в систему, чтобы отправить заявку на помощь.",
    incompleteFieldsTitle: "Незаполненные Поля",
    incompleteFields: "Пожалуйста, заполните все поля перед отправкой.",
    savedTitle: "Заявка Отправлена",
    saved: "Ваша заявка на помощь отправлена. Наша команда свяжется с вами в ближайшее время.",
    saveErrorTitle: "Ошибка Отправки",
    saveError: "Не удалось отправить заявку на помощь."
  }
};
async function saveHelpTicket() {
  const selectedLang = getCurrentLang();
  const t = helpTicketTranslations[selectedLang] || helpTicketTranslations['en'];

  const user = auth.currentUser;
  if (!user) {
    showNotification("warning", t.notLoggedInTitle, t.notLoggedIn);
    return;
  }

  const category = document.getElementById("helpCategory")?.value;
  const email = document.getElementById("helpEmail")?.value.trim();
  const message = document.getElementById("helpMessage")?.value.trim();

  if (!category || !email || !message) {
    showNotification("warning", t.incompleteFieldsTitle, t.incompleteFields);
    return;
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-GB') + " " + now.toLocaleTimeString('en-GB');

  try {
    const ticketsRef = collection(db, "users", user.uid, "helpTickets");

    await addDoc(ticketsRef, {
      category,
      email,
      message,
      status: "Pending",
      createdAt: new Date(),
      submittedAt: formattedDate,
      userId: user.uid
    });

    document.getElementById("helpModal").style.display = "none";
    document.getElementById("helpFormContainer").style.display = "none";

    document.getElementById("helpCategory").value = "";
    document.getElementById("helpEmail").value = "";
    document.getElementById("helpMessage").value = "";

    showNotification("success", t.savedTitle, t.saved);
  } catch (error) {
    console.error("Error saving help ticket:", error);
    showNotification("error", t.saveErrorTitle, t.saveError);
  }
}

document.getElementById("helpSendBtn")?.addEventListener("click", () => {
  saveHelpTicket();
});

// ================================== NAVIGATION ====================================

document.querySelectorAll('.cvb-usertab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cvb-usertab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.cvb-usertab-content').forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

function openTab(tabId) {
  document.querySelectorAll('.cvb-usertab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.querySelectorAll('.cvb-usertab-content').forEach(content => {
    content.classList.remove('active');
  });

  const btn = document.querySelector(
    `.cvb-usertab-btn[data-tab="${tabId}"]`
  );

  const content = document.getElementById(tabId);

  if (btn && content) {
    btn.classList.add('active');
    content.classList.add('active');
  }
}

const urlParams = new URLSearchParams(window.location.search);
const tab = urlParams.get('tab');

if (tab === 'history') {
  openTab('historyTab');
}

const shareBtn = document.querySelector(".cta-btn");

if (shareBtn) {
  shareBtn.addEventListener("click", () => {
    const targetTab = "affiliationTab";

    document.querySelectorAll(".cvb-usertab-btn")
      .forEach(b => b.classList.remove("active"));

    document.querySelectorAll(".cvb-usertab-content")
      .forEach(c => c.classList.remove("active"));

    const tabBtn = document.querySelector(`[data-tab="${targetTab}"]`);
    if (tabBtn) tabBtn.classList.add("active");

    const tabContent = document.getElementById(targetTab);
    if (tabContent) tabContent.classList.add("active");

    tabContent?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function formatDate(date) {
  if (!date) return "-";
  if (date.toDate) return date.toDate().toLocaleString();
  return new Date(date).toLocaleString();
}

// ============================= PROFILE INFORMATIONS ===============================

let profileCoverAnimation = null;

const COUNTRIES = [
  { code: "AF", en: "Afghanistan", native: "افغانستان" },
  { code: "AL", en: "Albania", native: "Shqipëria" },
  { code: "DZ", en: "Algeria", native: "الجزائر" },
  { code: "FR", en: "France", native: "France" },
  { code: "DE", en: "Germany", native: "Deutschland" },
  { code: "MA", en: "Morocco", native: "المغرب" },
  { code: "ES", en: "Spain", native: "España" },
  { code: "CN", en: "China", native: "中国" },
  { code: "JP", en: "Japan", native: "日本" },
  { code: "RU", en: "Russia", native: "Россия" },
  { code: "SA", en: "Saudi Arabia", native: "السعودية" },
  { code: "KR", en: "South Korea", native: "대한민국" },
  { code: "TR", en: "Turkey", native: "Türkiye" },
  { code: "US", en: "United States", native: "United States" },
  { code: "GB", en: "United Kingdom", native: "United Kingdom" },
  { code: "IT", en: "Italy", native: "Italia" },
  { code: "BR", en: "Brazil", native: "Brasil" },
  { code: "IN", en: "India", native: "भारत" },
  { code: "NL", en: "Netherlands", native: "Nederland" },
  { code: "SE", en: "Sweden", native: "Sverige" },
  { code: "PL", en: "Poland", native: "Polska" },
  { code: "PT", en: "Portugal", native: "Portugal" },
  { code: "EG", en: "Egypt", native: "مصر" },
  { code: "TN", en: "Tunisia", native: "تونس" },
  { code: "AE", en: "United Arab Emirates", native: "الإمارات" }
];

function loadCountries(selectedCountry = "") {
  const countrySelect = document.getElementById("userCountry");
  if (!countrySelect) return;

  countrySelect.innerHTML = `<option value="">Select a country</option>`;

  COUNTRIES.forEach(country => {
    const option = document.createElement("option");

    option.value = country.code;

    option.textContent = 
      country.en === country.native
        ? country.en
        : `${country.en} (${country.native})`;

    if (country.code === selectedCountry) option.selected = true;

    countrySelect.appendChild(option);
  });
}

const INDUSTRIES = [
  { id: "agriculture", nameKey: "industry-agriculture" },
  { id: "automotive", nameKey: "industry-automotive" },
  { id: "aviation", nameKey: "industry-aviation" },
  { id: "banking", nameKey: "industry-banking" },
  { id: "biotech", nameKey: "industry-biotech" },
  { id: "construction", nameKey: "industry-construction" },
  { id: "consulting", nameKey: "industry-consulting" },
  { id: "cybersecurity", nameKey: "industry-cybersecurity" },
  { id: "education", nameKey: "industry-education" },
  { id: "energy", nameKey: "industry-energy" },
  { id: "engineering", nameKey: "industry-engineering" },
  { id: "ecommerce", nameKey: "industry-ecommerce" },
  { id: "entertainment", nameKey: "industry-entertainment" },
  { id: "fashion", nameKey: "industry-fashion" },
  { id: "food", nameKey: "industry-food" },
  { id: "government", nameKey: "industry-government" },
  { id: "healthcare", nameKey: "industry-healthcare" },
  { id: "hospitality", nameKey: "industry-hospitality" },
  { id: "hr", nameKey: "industry-hr" },
  { id: "insurance", nameKey: "industry-insurance" },
  { id: "legal", nameKey: "industry-legal" },
  { id: "logistics", nameKey: "industry-logistics" },
  { id: "manufacturing", nameKey: "industry-manufacturing" },
  { id: "marketing", nameKey: "industry-marketing" },
  { id: "mining", nameKey: "industry-mining" },
  { id: "nonprofit", nameKey: "industry-nonprofit" },
  { id: "pharma", nameKey: "industry-pharma" },
  { id: "realestate", nameKey: "industry-realestate" },
  { id: "retail", nameKey: "industry-retail" },
  { id: "sales", nameKey: "industry-sales" },
  { id: "software", nameKey: "industry-software" },
  { id: "telecom", nameKey: "industry-telecom" },
  { id: "transport", nameKey: "industry-transport" },
  { id: "wholesale", nameKey: "industry-wholesale" }
];

const SPECIALTIES = [
  { id: "frontend", nameKey: "speciality-frontend" },
  { id: "backend", nameKey: "speciality-backend" },
  { id: "fullstack", nameKey: "speciality-fullstack" },
  { id: "mobile", nameKey: "speciality-mobile" },
  { id: "devops", nameKey: "speciality-devops" },
  { id: "data_science", nameKey: "speciality-data_science" },
  { id: "qa", nameKey: "speciality-qa" },
  
  { id: "seo", nameKey: "speciality-seo" },
  { id: "ads", nameKey: "speciality-ads" },
  { id: "content", nameKey: "speciality-content" },
  { id: "social", nameKey: "speciality-social" },
  { id: "email", nameKey: "speciality-email" },
  { id: "analytics", nameKey: "speciality-analytics" },

  { id: "nursing", nameKey: "speciality-nursing" },
  { id: "surgery", nameKey: "speciality-surgery" },
  { id: "pharmacy", nameKey: "speciality-pharmacy" },
  { id: "radiology", nameKey: "speciality-radiology" },
  { id: "primary_care", nameKey: "speciality-primary_care" },
  { id: "mental_health", nameKey: "speciality-mental_health" },

  { id: "crop_farming", nameKey: "speciality-crop_farming" },
  { id: "livestock", nameKey: "speciality-livestock" },
  { id: "agronomy", nameKey: "speciality-agronomy" },
  { id: "agritech", nameKey: "speciality-agritech" },

  { id: "ev", nameKey: "speciality-ev" },
  { id: "manufacturing_auto", nameKey: "speciality-manufacturing_auto" },
  { id: "aftersales", nameKey: "speciality-aftersales" },
  { id: "autonomous", nameKey: "speciality-autonomous" },

  { id: "commercial_aviation", nameKey: "speciality-commercial_aviation" },
  { id: "defense_aero", nameKey: "speciality-defense_aero" },
  { id: "space", nameKey: "speciality-space" },
  { id: "mro", nameKey: "speciality-mro" },

  { id: "retail_banking", nameKey: "speciality-retail_banking" },
  { id: "investment_banking", nameKey: "speciality-investment_banking" },
  { id: "wealth_mgmt", nameKey: "speciality-wealth_mgmt" },
  { id: "fintech", nameKey: "speciality-fintech" },

  { id: "genomics", nameKey: "speciality-genomics" },
  { id: "therapeutics", nameKey: "speciality-therapeutics" },
  { id: "diagnostics", nameKey: "speciality-diagnostics" },
  { id: "bioprocessing", nameKey: "speciality-bioprocessing" },

  { id: "residential", nameKey: "speciality-residential" },
  { id: "commercial_const", nameKey: "speciality-commercial_const" },
  { id: "infrastructure", nameKey: "speciality-infrastructure" },
  { id: "project_mgmt", nameKey: "speciality-project_mgmt" },

  { id: "strategy", nameKey: "speciality-strategy" },
  { id: "operations", nameKey: "speciality-operations" },
  { id: "hr_consulting", nameKey: "speciality-hr_consulting" },
  { id: "tech_consulting", nameKey: "speciality-tech_consulting" },

  { id: "network_security", nameKey: "speciality-network_security" },
  { id: "app_security", nameKey: "speciality-app_security" },
  { id: "incident_response", nameKey: "speciality-incident_response" },
  { id: "compliance", nameKey: "speciality-compliance" },

  { id: "k12", nameKey: "speciality-k12" },
  { id: "higher_ed", nameKey: "speciality-higher_ed" },
  { id: "edtech", nameKey: "speciality-edtech" },
  { id: "corporate_training", nameKey: "speciality-corporate_training" },

  { id: "renewable", nameKey: "speciality-renewable" },
  { id: "oil_gas", nameKey: "speciality-oil_gas" },
  { id: "nuclear", nameKey: "speciality-nuclear" },
  { id: "grid_mgmt", nameKey: "speciality-grid_mgmt" },

  { id: "civil", nameKey: "speciality-civil" },
  { id: "mechanical", nameKey: "speciality-mechanical" },
  { id: "electrical", nameKey: "speciality-electrical" },
  { id: "chemical", nameKey: "speciality-chemical" },

  { id: "d2c", nameKey: "speciality-d2c" },
  { id: "marketplace", nameKey: "speciality-marketplace" },
  { id: "logistics_ecom", nameKey: "speciality-logistics_ecom" },
  { id: "conversion_opt", nameKey: "speciality-conversion_opt" },

  { id: "film_tv", nameKey: "speciality-film_tv" },
  { id: "music", nameKey: "speciality-music" },
  { id: "gaming", nameKey: "speciality-gaming" },
  { id: "digital_media", nameKey: "speciality-digital_media" },

  { id: "apparel_design", nameKey: "speciality-apparel_design" },
  { id: "luxury", nameKey: "speciality-luxury" },
  { id: "fast_fashion", nameKey: "speciality-fast_fashion" },
  { id: "sustainable_fashion", nameKey: "speciality-sustainable_fashion" },

  { id: "food_production", nameKey: "speciality-food_production" },
  { id: "fandb_service", nameKey: "speciality-fandb_service" },
  { id: "beverage", nameKey: "speciality-beverage" },
  { id: "food_safety", nameKey: "speciality-food_safety" },

  { id: "policy", nameKey: "speciality-policy" },
  { id: "public_admin", nameKey: "speciality-public_admin" },
  { id: "defense", nameKey: "speciality-defense" },
  { id: "public_health", nameKey: "speciality-public_health" },

  { id: "hotels", nameKey: "speciality-hotels" },
  { id: "fandb", nameKey: "speciality-fandb" },
  { id: "travel", nameKey: "speciality-travel" },
  { id: "events", nameKey: "speciality-events" },

  { id: "recruitment", nameKey: "speciality-recruitment" },
  { id: "comp_benefits", nameKey: "speciality-comp_benefits" },
  { id: "learning_dev", nameKey: "speciality-learning_dev" },
  { id: "hr_operations", nameKey: "speciality-hr_operations" },

  { id: "life_insurance", nameKey: "speciality-life_insurance" },
  { id: "health_insurance", nameKey: "speciality-health_insurance" },
  { id: "property_casualty", nameKey: "speciality-property_casualty" },
  { id: "reinsurance", nameKey: "speciality-reinsurance" },

  { id: "corp_law", nameKey: "speciality-corp_law" },
  { id: "litigation", nameKey: "speciality-litigation" },
  { id: "ip_law", nameKey: "speciality-ip_law" },
  { id: "family_law", nameKey: "speciality-family_law" },

  { id: "freight", nameKey: "speciality-freight" },
  { id: "warehousing", nameKey: "speciality-warehousing" },
  { id: "last_mile", nameKey: "speciality-last_mile" },
  { id: "scm", nameKey: "speciality-scm" },

  { id: "lean_mfg", nameKey: "speciality-lean_mfg" },
  { id: "automation", nameKey: "speciality-automation" },
  { id: "quality_control", nameKey: "speciality-quality_control" },
  { id: "supply_chain_mfg", nameKey: "speciality-supply_chain_mfg" },

  { id: "exploration", nameKey: "speciality-exploration" },
  { id: "extraction", nameKey: "speciality-extraction" },
  { id: "mineral_processing", nameKey: "speciality-mineral_processing" },
  { id: "hse_mining", nameKey: "speciality-hse_mining" },

  { id: "fundraising", nameKey: "speciality-fundraising" },
  { id: "program_mgmt", nameKey: "speciality-program_mgmt" },
  { id: "advocacy", nameKey: "speciality-advocacy" },
  { id: "grant_writing", nameKey: "speciality-grant_writing" },

  { id: "rnd", nameKey: "speciality-rnd" },
  { id: "clinical_trials", nameKey: "speciality-clinical_trials" },
  { id: "regulatory_affairs", nameKey: "speciality-regulatory_affairs" },
  { id: "commercial_pharma", nameKey: "speciality-commercial_pharma" },

  { id: "residential_re", nameKey: "speciality-residential_re" },
  { id: "commercial_re", nameKey: "speciality-commercial_re" },
  { id: "property_mgmt", nameKey: "speciality-property_mgmt" },
  { id: "re_investment", nameKey: "speciality-re_investment" },

  { id: "store_ops", nameKey: "speciality-store_ops" },
  { id: "merchandising", nameKey: "speciality-merchandising" },
  { id: "omnichannel", nameKey: "speciality-omnichannel" },
  { id: "category_mgmt", nameKey: "speciality-category_mgmt" },

  { id: "b2b_sales", nameKey: "speciality-b2b_sales" },
  { id: "b2c_sales", nameKey: "speciality-b2c_sales" },
  { id: "account_mgmt", nameKey: "speciality-account_mgmt" },
  { id: "sales_ops", nameKey: "speciality-sales_ops" },

  { id: "wireless", nameKey: "speciality-wireless" },
  { id: "broadband", nameKey: "speciality-broadband" },
  { id: "network_infra", nameKey: "speciality-network_infra" },
  { id: "telco_services", nameKey: "speciality-telco_services" },

  { id: "road_transport", nameKey: "speciality-road_transport" },
  { id: "rail", nameKey: "speciality-rail" },
  { id: "maritime", nameKey: "speciality-maritime" },
  { id: "public_transit", nameKey: "speciality-public_transit" },

  { id: "distributor_mgmt", nameKey: "speciality-distributor_mgmt" },
  { id: "bulk_purchasing", nameKey: "speciality-bulk_purchasing" },
  { id: "b2b_logistics", nameKey: "speciality-b2b_logistics" },
  { id: "inventory_mgmt", nameKey: "speciality-inventory_mgmt" },
];

function loadIndustries(selectedIndustry = "") {
  const industrySelect = document.getElementById("userIndustrySelect");
  if (!industrySelect) return;

  const selectedLang = getCurrentLang();
  const t = Industry_Speciality_translations[selectedLang] || Industry_Speciality_translations['en'];

  industrySelect.innerHTML = `
    <option value="">${t["placeholder-industry"]}</option>
  `;

  INDUSTRIES.forEach(ind => {
    const option = document.createElement("option");
    option.value = ind.id;

    option.textContent = t[ind.nameKey] || ind.nameKey;

    if (ind.id === selectedIndustry) option.selected = true;

    industrySelect.appendChild(option);
  });
}

function loadSpecialties(selectedSpeciality = "") {
  const specialitySelect = document.getElementById("userspecialitySelect");
  if (!specialitySelect) return;

  const selectedLang = getCurrentLang();
  const t = Industry_Speciality_translations[selectedLang] || Industry_Speciality_translations['en'];

  specialitySelect.innerHTML = `
    <option value="">${t["placeholder-speciality"]}</option>
  `;

  SPECIALTIES.forEach(spec => {
    const opt = document.createElement("option");
    opt.value = spec.id;
    opt.textContent = t[spec.nameKey] || spec.nameKey;

    if (spec.id === selectedSpeciality) opt.selected = true;

    specialitySelect.appendChild(opt);
  });
}

function initProfileCover(industry = "default") {
  const canvas = document.getElementById("profileCanvas");
  const cover = document.getElementById("profileCover");
  if (!canvas || !cover) return;

  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  if (profileCoverAnimation) {
    cancelAnimationFrame(profileCoverAnimation);
  }

  const themes = {
    software: ["#3178d3", "#00c6ff"],
    cybersecurity: ["#00d4ff", "#0a2f6c"],
    ecommerce: ["#ff6b35", "#f7931e"],
    telecom: ["#2c3e66", "#4a90e2"],
    robotics: ["#6c63ff", "#3a86ff"],
    semiconductors: ["#00adb5", "#3f72af"],
    
    marketing: ["#ff7a18", "#ff3d3d"],
    entertainment: ["#e1306c", "#f77737"],
    fashion: ["#d4af37", "#9b2e2e"],
    
    banking: ["#00c853", "#64dd17"],
    consulting: ["#2d3436", "#636e72"],
    insurance: ["#1e88e5", "#6ab04c"],
    sales: ["#f39c12", "#e67e22"],
    legal: ["#5d6d7e", "#2c3e50"],
    hr: ["#3498db", "#2980b9"],
    realestate: ["#e67e22", "#f39c12"],
    
    healthcare: ["#ff4d6d", "#ff758f"],
    biotech: ["#2ecc71", "#27ae60"],
    pharma: ["#48c9b0", "#1abc9c"],
    
    manufacturing: ["#95a5a6", "#7f8c8d"],
    engineering: ["#f1c40f", "#e67e22"],
    construction: ["#e67e22", "#d35400"],
    automotive: ["#34495e", "#2c3e50"],
    aviation: ["#2980b9", "#3498db"],
    transport: ["#16a085", "#1abc9c"],
    logistics: ["#f39c12", "#e67e22"],
    
    energy: ["#f1c40f", "#e67e22"],
    renewable_energy: ["#2ecc71", "#27ae60"],
    mining: ["#7f8c8d", "#95a5a6"],
    chemicals: ["#00adb5", "#4a90e2"],
    environmental: ["#27ae60", "#2ecc71"],
    
    agriculture: ["#6b8e23", "#9acd32"],
    food: ["#e67e22", "#f39c12"],
    
    education: ["#3498db", "#9b59b6"],
    government: ["#2c3e50", "#34495e"],
    nonprofit: ["#e84393", "#ff7675"],
    
    retail: ["#fd79a8", "#e84393"],
    consumer_goods: ["#00cec9", "#0984e3"],
    wholesale: ["#636e72", "#b2bec3"],
    sports: ["#00b894", "#55efc4"],
    
    hospitality: ["#ff7675", "#d63031"],
    
    default: ["#6366f1", "#22d3ee"]
  };

  const [c1, c2] = themes[industry] || themes.default;

  cover.style.setProperty("--c1", c1);
  cover.style.setProperty("--c2", c2);

  let lines = [];

  for (let i = 0; i < 6; i++) {
    lines.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: 80 + Math.random() * 60,
      speed: 0.2 + Math.random() * 0.3,
      angle: Math.random() * Math.PI * 2
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(l => {
      l.x += Math.cos(l.angle) * l.speed;
      l.y += Math.sin(l.angle) * l.speed;

      if (l.x > canvas.width) l.x = 0;
      if (l.x < 0) l.x = canvas.width;
      if (l.y > canvas.height) l.y = 0;
      if (l.y < 0) l.y = canvas.height;

      const x2 = l.x + Math.cos(l.angle) * l.length;
      const y2 = l.y + Math.sin(l.angle) * l.length;

      const gradient = ctx.createLinearGradient(l.x, l.y, x2, y2);
      gradient.addColorStop(0, c1 + "00");
      gradient.addColorStop(0.5, c1 + "55");
      gradient.addColorStop(1, c2 + "00");

      ctx.beginPath();
      ctx.moveTo(l.x, l.y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    profileCoverAnimation = requestAnimationFrame(animate);
  }

  animate();
}

document.getElementById("userIndustrySelect").addEventListener("change", (e) => {
  const industryId = e.target.value || "default";
  initProfileCover(industryId);
});

async function setupAccountView(user) {
  const lang = getCurrentLang();

  const tForm = UserForm_translations[lang] || UserForm_translations["en"];
  const tIndustry = Industry_Speciality_translations[lang] || Industry_Speciality_translations["en"];

  if (!user) return;

  const form = document.getElementById("cvb-user-info-form");

  const profileFullName = document.getElementById("profileFullName");
  const profileHeadline = document.getElementById("profileHeadline");
  const profileIndustry = document.getElementById("profileIndustry");

  const firstNameInput = document.getElementById("userFirstName");
  const lastNameInput = document.getElementById("userLastName");
  const emailInput = document.getElementById("userEmail");
  const birthdayInput = document.getElementById("userBirthday");
  const phoneInput = document.getElementById("userPhone");
  const headlineInput = document.getElementById("userHeadline");
  const availabilityInput = document.getElementById("userAvailability");
  const roleInput = document.getElementById("userRole");
  const goalsInput = document.getElementById("userGoals");

  try {
    const docRef = doc(db, "profiles", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return;

    const data = docSnap.data();

    const box = document.getElementById("profileCompletionBox");
    const fill = document.getElementById("pc-bar-fill");
    const text = document.getElementById("pc-missing-text");

    if (!box) return;

    updateProfileCompletionUI(data, user.uid);

    /* ================= Profile Card ================= */

    const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim();
    profileFullName.textContent = fullName || "—";
    profileHeadline.textContent = data.headline || "—";

    profileIndustry.textContent =
      (data.industries && data.industries.length)
        ? data.industries.map(ind => {
            const industryLabel = tIndustry[ind.nameKey] || ind.name || ind.id;
            const specialityLabel = ind.specialityKey
              ? tIndustry[ind.specialityKey]
              : null;

            return specialityLabel
              ? `${industryLabel} • ${specialityLabel}`
              : industryLabel;
          }).join(" • ")
        : tForm["placeholder-industry"];

    /* ================= VERIFIED BADGE ================= */
    const verifiedBadge = document.getElementById("profileVerified");
    const isVerified = data.verified === true;
    if (verifiedBadge) {
      if (isVerified) {
        verifiedBadge.style.display = "flex";
        verifiedBadge.querySelector("span").textContent =
          tForm["verified-badge"] || "Verified Account";
      } else {
        verifiedBadge.style.display = "none";
      }
    }

    const profileRole = document.getElementById("profileRole");
    const roleValue = (data.role || "talent").toLowerCase();
    const roleLabels = {
      talent: tForm["role-talent"],
      organization: tForm["role-organization"],
      freelancer: tForm["role-freelancer"],
      student: tForm["role-student"],
      team: tForm["role-team"]
    };
    profileRole.querySelector("span").textContent = roleLabels[roleValue] || roleValue;
    profileRole.className = `profile-badge role ${roleValue}`;

    const availabilityBadge = document.getElementById("profileAvailability");
    const availabilityValue = data.availability || "";
    if (availabilityValue) {
      availabilityBadge.querySelector("span").textContent =
        tForm[`availability-${availabilityValue}`] || availabilityValue;

      availabilityBadge.className =
        `profile-badge availability ${availabilityValue}`;
    } else {
      availabilityBadge.style.display = "none";
    }

    /* ================= User Form ================= */

    firstNameInput.value = data.first_name || "";
    lastNameInput.value = data.last_name || "";
    emailInput.value = data.email || user.email || "";
    birthdayInput.value = data.birthday || "";
    phoneInput.value = data.phone || "";
    headlineInput.value = data.headline || "";
    availabilityInput.value = data.availability || "";
    roleInput.value = data.role || "";
    goalsInput.value = data.goal || "";

    const selectedIndustryId =
      data.industries && data.industries.length
        ? data.industries[0].id
        : "";

    const selectedspecialityId =
      data.industries && data.industries.length
        ? data.industries[0].specialityId || ""
        : "";

    loadIndustries(selectedIndustryId);
    loadSpecialties(selectedspecialityId);
    loadCountries(data.country || "");

    const industryId =
      data.industries && data.industries.length
        ? data.industries[0].id
        : "default";

    initProfileCover(industryId);

    form.style.display = "flex";

    const avatar = data.profile?.avatar || user.photoURL || null;

    applyUserAvatar(avatar);

    const referralInput = document.getElementById("referralLinkInput");
    if (referralInput) {
      const username = data.username || data.first_name || "user";
      const referralLink = generateReferralLink(user.uid);
      referralInput.value = referralLink;
    }
    await loadAffiliateCoinsChart(user.uid);
    await loadReferrersList(user.uid);
    await loadUserRewards(user.uid);

    await loadSecuritySettings(user);

  } catch (err) {
    console.error("Error loading user profile:", err);
  }
}

function calculateProfileCompletion(data) {
  const fields = [
    data.first_name,
    data.last_name,
    data.birthday,
    data.country,
    data.phone,
    data.headline,
    data.availability,
    data.role,
    data.goal,
    (data.industries && data.industries.length > 0)
  ];

  const total = fields.length;
  const filled = fields.filter(v => v && v !== "").length;

  return {
    percent: Math.round((filled / total) * 100),
    missing: total - filled
  };
}

async function updateProfileCompletionUI(dataSource = "form", userId = null) {
  const box = document.getElementById("profileCompletionBox");
  const fill = document.getElementById("pc-bar-fill");

  if (!box || !fill) return;

  let data;

  if (dataSource === "form") {
    data = {
      first_name: document.getElementById("userFirstName")?.value,
      last_name: document.getElementById("userLastName")?.value,
      birthday: document.getElementById("userBirthday")?.value,
      country: document.getElementById("userCountry")?.value,
      phone: document.getElementById("userPhone")?.value,
      headline: document.getElementById("userHeadline")?.value,
      availability: document.getElementById("userAvailability")?.value,
      role: document.getElementById("userRole")?.value,
      goal: document.getElementById("userGoals")?.value,
      industries: document.getElementById("userIndustrySelect")?.value ? [{}] : []
    };
  } else {
    data = dataSource;
  }

  const completion = calculateProfileCompletion(data);
  const reward = document.getElementById("pc-reward");
  if (completion.percent >= 100) {
    box.classList.add("completed");
    fill.style.width = "100%";
  } else {
    box.classList.remove("completed");
    fill.style.width = completion.percent + "%";
  }

  let rewardExists = false;

  if (userId) {
    const rewardRef = doc(db, "users", userId, "rewards", "PROFILE_COMPLETION");
    const rewardSnap = await getDoc(rewardRef);
    rewardExists = rewardSnap.exists();
  }

  if (rewardExists) {
    box.classList.add("hidden");
  } else {
    box.classList.remove("hidden");
  }

}

[
  "userFirstName",
  "userLastName",
  "userBirthday",
  "userCountry",
  "userPhone",
  "userHeadline",
  "userAvailability",
  "userRole",
  "userGoals",
  "userIndustrySelect"
].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener("input", () => updateProfileCompletionUI("form"));
  el?.addEventListener("change", () => updateProfileCompletionUI("form"));
});

const profileBox = document.getElementById("profileCompletionBox");
profileBox?.addEventListener("click", (e) => {

  const targetTab = "infoTab";
  const activeTabBtn = document.querySelector('.cvb-usertab-btn.active');

  if (activeTabBtn?.dataset.tab === targetTab) return;

  document.querySelectorAll(".cvb-usertab-btn")
    .forEach(b => b.classList.remove("active"));

  document.querySelectorAll(".cvb-usertab-content")
    .forEach(c => c.classList.remove("active"));

  const tabBtn = document.querySelector(`[data-tab="${targetTab}"]`);
  const tabContent = document.getElementById(targetTab);

  tabBtn?.classList.add("active");
  tabContent?.classList.add("active");

  tabContent?.scrollIntoView({ behavior: "smooth", block: "start" });
});

// ============================== Update Informations ================================

document.addEventListener("DOMContentLoaded", () => {
  const updateBtn = document.getElementById("updateUserNameBtn");
  if (updateBtn) {
    updateBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const user = auth.currentUser;
      if (!user) return;
      await updateUserInfo(user);
    });
  }
});

async function updateUserInfo(user) {
  const selectedLang = getCurrentLang();
  const T = UserFormMsgs_translations[selectedLang] || UserFormMsgs_translations['en'];

  const firstNameInput = document.getElementById("userFirstName");
  const lastNameInput = document.getElementById("userLastName");
  const birthdayInput = document.getElementById("userBirthday");
  const countryInput = document.getElementById("userCountry");
  const phoneInput = document.getElementById("userPhone");
  const selectedIndustryId = document.getElementById("userIndustrySelect").value;
  const selectedspecialityId = document.getElementById("userspecialitySelect").value;
  const headlineInput = document.getElementById("userHeadline");
  const availabilityInput = document.getElementById("userAvailability");
  const role = document.getElementById("userRole").value;
  const goals = document.getElementById("userGoals").value;

  const firstName = firstNameInput?.value.trim();
  const lastName = lastNameInput?.value.trim();
  const country = countryInput?.value;
  const headline = headlineInput?.value.trim();
  const availability = availabilityInput?.value || "";

  let hasError = false;

  if (isEmpty(firstName)) {
    showSubSectionMessageErr(firstNameInput, T.firstNameRequired);
    hasError = true;
  }

  if (isEmpty(lastName)) {
    showSubSectionMessageErr(lastNameInput, T.lastNameRequired);
    hasError = true;
  }

  if (isEmpty(country)) {
    showSubSectionMessageErr(countryInput, T.countryRequired);
    hasError = true;
  }

  if (headline && !isValidHeadline(headline)) {
    showSubSectionMessageErr(headlineInput, T.headlineInvalid);
    hasError = true;
  }

  if (isEmpty(availabilityInput.value)) {
    showSubSectionMessageErr(availabilityInput, T.availabilityRequired);
    hasError = true;
  }

  if (hasError) return;

  const selectedIndustryObj = INDUSTRIES.find(
    ind => ind.id === selectedIndustryId
  );

  const selectedspecialityObj = SPECIALTIES.find(
    spec => spec.id === selectedspecialityId
  );

  const industriesToSave = selectedIndustryObj
    ? [{
        id: selectedIndustryObj.id,
        nameKey: selectedIndustryObj.nameKey,
        specialityId: selectedspecialityObj?.id || "",
        specialityKey: selectedspecialityObj?.nameKey || ""
      }]
    : [];

  try {
    const userRef = doc(db, "profiles", user.uid);

    await setDoc(
      userRef,
      {
        first_name: firstName,
        last_name: lastName || "",
        birthday: birthdayInput?.value || "",
        country: countryInput?.value || "",
        phone: phoneInput?.value || "",
        headline: headlineInput?.value || "",
        industries: industriesToSave,
        availability: availability,
        role: role,
        goal: goals,
        updated_at: new Date()
      },
      { merge: true }
    );

    const updatedSnap = await getDoc(userRef);
    const updatedData = updatedSnap.data();

    const completion = calculateProfileCompletion(updatedData);
    const isComplete = completion.percent >= 100;

    const rewardRef = doc(db, "users", user.uid, "rewards", "PROFILE_COMPLETION");
    const rewardSnap = await getDoc(rewardRef);

    if (isComplete && !rewardSnap.exists()) {
      await setDoc(rewardRef, {
        type: "PROFILE_COMPLETION",
        coins: 20,
        createdAt: serverTimestamp()
      });

      showNotification(
        "congrats",
        T.congratsTitle,
        T.congratsMessage
      );
    } else {
      showUserSectionNotification("success", T.updateSuccess);
    }

    updateUserSection(user);
    setupAccountView(user);

  } catch (error) {
    showUserSectionNotification("error", T.updateError);
  }
}

function isEmpty(value) {
  return !value || !value.trim();
}

function isValidHeadline(value) {
  return /^[A-Za-zÀ-ÿ\s]+$/.test(value);
}

function recheckUserInfoInputs() {
  const selectedLang = getCurrentLang();
  const T = UserFormMsgs_translations[selectedLang] || UserFormMsgs_translations['en'];

  const firstNameInput = document.getElementById("userFirstName");
  const lastNameInput = document.getElementById("userLastName");
  const countryInput = document.getElementById("userCountry");
  const headlineInput = document.getElementById("userHeadline");
  const availabilityInput = document.getElementById("userAvailability");

  let hasError = false;

  if (isEmpty(firstNameInput.value)) {
    showSubSectionMessageErr(firstNameInput, t.firstNameRequired);
    hasError = true;
  } else {
    hideSubSectionMessageErr(firstNameInput);
  }

  if (isEmpty(lastNameInput.value)) {
    showSubSectionMessageErr(lastNameInput, t.lastNameRequired);
    hasError = true;
  } else {
    hideSubSectionMessageErr(lastNameInput);
  }

  if (isEmpty(countryInput.value)) {
    showSubSectionMessageErr(countryInput, t.countryRequired);
    hasError = true;
  } else {
    hideSubSectionMessageErr(countryInput);
  }

  const headline = headlineInput.value.trim();
  if (headline && !isValidHeadline(headline)) {
    showSubSectionMessageErr(headlineInput, t.headlineInvalid);
    hasError = true;
  } else {
    hideSubSectionMessageErr(headlineInput);
  }

  if (isEmpty(availabilityInput.value)) {
    showSubSectionMessageErr(availabilityInput, t.availabilityRequired);
    hasError = true;
  } else {
    hideSubSectionMessageErr(availabilityInput);
  }

  return !hasError;
}

["userFirstName", "userLastName", "userCountry", "userHeadline", "userAvailability"].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener("input", recheckUserInfoInputs);
});

function showSubSectionMessageErr(inputEl, message) {
  let msg = inputEl.parentElement.querySelector('.cvb-user-subSectionMessage');

  if (!msg) {
    msg = document.createElement('span');
    msg.className = 'cvb-user-subSectionMessage';
    inputEl.parentElement.appendChild(msg);
  }

  msg.textContent = message;
  msg.style.display = 'block';
  msg.style.color = '#c90000';
}

function hideSubSectionMessageErr(inputEl) {
  const msg = inputEl.parentElement.querySelector('.cvb-user-subSectionMessage');
  if (msg) msg.style.display = 'none';
}

// ================================= CONSUMPTION ================================

let consumptionChart = null;

async function loadUserConsumptionHistory(userId, filters = {}) {
  const selectedLang = getCurrentLang();
  const t = UserForm_translationsHistory[selectedLang] || UserForm_translationsHistory['en'];

  const tbody = document.getElementById("cvb-history-body");
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>`;

  let records = [];
  let availableCoins = 0;

  try {
    const { search = "", startDate, endDate } = filters;

    let consumptionsRef = collection(db, "users", userId, "consumptions");

    let constraints = [];
    if (startDate) constraints.push(where("createdAt", ">=", new Date(startDate + "T00:00:00")));
    if (endDate) constraints.push(where("createdAt", "<=", new Date(endDate + "T23:59:59")));
    constraints.push(orderBy("createdAt", "desc"));

    const snapshot = await getDocs(query(consumptionsRef, ...constraints));

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const dateObj = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.date || 0);
      records.push({ id: docSnap.id, ...data, dateObj });
    });

    if (search) {
      records = records.filter(r =>
        r.file_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.action_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // ========== TABLE ==========
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">${t["no-history"]}</td></tr>`;
      if (consumptionChart) {
        consumptionChart.destroy();
        consumptionChart = null;
      }
      showEmptyHistoryMessage();
    } else {
      tbody.innerHTML = "";
      records.forEach(data => {
        const coins = data.coins_used ?? "-";
        const description = data.file_name
          ? `${data.action_name ?? "-"} - ${data.file_name}`
          : (data.action_name ?? "-");
        const date = data.createdAt?.toDate?.()?.toLocaleString?.() ?? "-";
        tbody.insertAdjacentHTML("beforeend",
          `<tr>
            <td>${coins}</td>
            <td>${description}</td>
            <td>${date}</td>
          </tr>`
        );
      });

      // ========== CHART ==========
      function restoreChartCanvas() {
        const container = document.querySelector(".cvb-history-graph");
        container.innerHTML = `<canvas id="consumptionChart"></canvas>`;
      }

      const dailyMap = {};
      records.forEach(r => {
        if (!r.dateObj) return;
        const dateKey = r.dateObj.toISOString().split("T")[0];
        if (!dailyMap[dateKey]) {
          dailyMap[dateKey] = 0;
        }
        dailyMap[dateKey] += Number(r.coins_used || 0);
      });

      const chartData = Object.entries(dailyMap)
        .map(([date, coins]) => ({ date, coins }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const labels = chartData.map(d => d.date);
      const coinsData = chartData.map(d => d.coins);

      if (labels.length === 0 || coinsData.length === 0) {
        showEmptyHistoryMessage();
        if (consumptionChart) {
          consumptionChart.destroy();
          consumptionChart = null;
        }
      } else {
        restoreChartCanvas();
        if (consumptionChart) consumptionChart.destroy();
        const ctx = document.getElementById("consumptionChart");
        ctx.height = 90;
        consumptionChart = new Chart(ctx.getContext("2d"), {
          type: "line",
          data: { labels, datasets: [{ label: "Coins Used", data: coinsData, borderColor: "#3178d3", backgroundColor: "rgba(49,120,211,0.1)", fill: true, tension: 0.3, pointRadius: 3 }] },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
        });
      }
    }

  } catch (error) {
    console.error("Error loading consumptions:", error);
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Failed to load history</td></tr>`;
  }

  // ========== KPIs (always run) ==========
  try {
    const now = new Date();
    const last30Days = new Date();
    last30Days.setDate(now.getDate() - 30);

    const coinsLast30Days = records
      .filter(r => r.dateObj >= last30Days)
      .reduce((sum, r) => sum + Number(r.coins_used || 0), 0);

    const lastRecord = records[0];
    const lastDate = lastRecord?.dateObj ? lastRecord.dateObj.toLocaleString() : "-";
    availableCoins = (await getUserTotalCoins(userId)) || 0;

    document.getElementById("kpi-used").textContent = coinsLast30Days;
    document.getElementById("kpi-last-date").textContent = lastDate;
    document.getElementById("kpi-available").textContent = availableCoins;

  } catch (e) {
    console.warn("Could not calculate KPIs", e);
    document.getElementById("kpi-used").textContent = 0;
    document.getElementById("kpi-last-date").textContent = "-";
    document.getElementById("kpi-available").textContent = availableCoins ?? 0;
  }
}

document.getElementById("consumption-filter-btn").addEventListener("click", () => {
  const search = document.getElementById("consumption-search").value;
  const startDate = document.getElementById("consumption-start-date").value;
  const endDate = document.getElementById("consumption-end-date").value;
  loadUserConsumptionHistory(currentUserId, { search, startDate, endDate });
});

function showEmptyHistoryMessage() {
  const selectedLang = getCurrentLang();
  const t = UserForm_translationsHistory[selectedLang] || UserForm_translationsHistory['en'];

  const message = t["empty-history-chart"] || "Your history will show here";
  const container = document.querySelector(".cvb-history-graph");
  container.innerHTML = `<div class="cvb-history-graphEmpty">${message}</div>`;
}

// ================================= Order Coins ================================

const ORDER_STATUS_LABELS = {
  pending: { en: "Pending", fr: "En attente", ar: "قيد الانتظار", es: "Pendiente", zh: "待处理", de: "Ausstehend", pt: "Pendente", ja: "保留中", ru: "Ожидает" },
  awaiting_payment: { en: "Awaiting Payment", fr: "En attente de paiement", ar: "في انتظار الدفع", es: "Esperando pago", zh: "等待付款", de: "Zahlung ausstehend", pt: "Aguardando pagamento", ja: "支払い待ち", ru: "Ожидает оплаты" },
  awaiting_confirmation: { en: "Awaiting Confirmation", fr: "En attente de confirmation", ar: "في انتظار التأكيد", es: "Esperando confirmación", zh: "等待确认", de: "Bestätigung ausstehend", pt: "Aguardando confirmação", ja: "確認待ち", ru: "Ожидает подтверждения" },
  paid: { en: "Paid", fr: "Payé", ar: "تم الدفع", es: "Pagado", zh: "已付款", de: "Bezahlt", pt: "Pago", ja: "支払済み", ru: "Оплачено" },
  rejected: { en: "Rejected", fr: "Rejeté", ar: "مرفوض", es: "Rechazado", zh: "已拒绝", de: "Abgelehnt", pt: "Rejeitado", ja: "却下", ru: "Отклонено" },
  expired: { en: "Expired", fr: "Expiré", ar: "منتهي الصلاحية", es: "Expirado", zh: "已过期", de: "Abgelaufen", pt: "Expirado", ja: "期限切れ", ru: "Истек" }
};

function getOrderStatusBadge(status, lang = 'en') {
  const key = status.toLowerCase().replace(/\s/g, "_"); // normalize
  const labelObj = ORDER_STATUS_LABELS[key] || { [lang]: status };
  const label = labelObj[lang] || status;

  let colorClass = "pending"; // default
  switch (key) {
    case "paid":
      colorClass = "completed"; break;
    case "rejected":
    case "expired":
      colorClass = "rejected"; break;
    case "awaiting_payment":
    case "awaiting_confirmation":
      colorClass = "pending"; break;
  }

  return `<span class="order-status ${colorClass}">${label}</span>`;
}

function appendOrderToTable(order) {
  const tbody = document.getElementById("coinsOrdersTablebody");
  if (!tbody) return;

  if (tbody.children.length === 1 && tbody.children[0].children.length === 1) {
    tbody.innerHTML = "";
  }

  const row = `
    <tr>
      <td>${formatDate(order.createdAt)}</td>
      <td>${getOrderStatusBadge(order.status ?? "pending", getCurrentLang())}</td>
      <td>${order.coins ?? 0}</td>
      <td>${order.price ?? "-"} ${order.currency ?? ""}</td>
      <td>${order.payment_method ?? "-"}</td>
      <td>${order.payment_address ?? "-"}</td>
      <td>${order.payment_instructions ?? "-"}</td>
      <td>${order.payment_deadline ?? "-"}</td>
      <td>${order.payment_reference ?? "-"}</td>
      <td>${order.payment_date ?? "-"}</td>
      <td>${order.payment_proof ? `<a href="${order.payment_proof}" target="_blank">View</a>` : "-"}</td>
      <td>${order.confirmation_date ?? "-"}</td>
    </tr>
  `;

  tbody.insertAdjacentHTML("afterbegin", row);
}

async function loadUserOrdersHistory(userId) {
  const selectedLang = getCurrentLang();
  const t = UserForm_translationsPay[selectedLang] || UserForm_translationsPay['en'];
  
  const tbody = document.getElementById("coinsOrdersTablebody");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Loading...</td></tr>`;

  try {
    const ordersRef = collection(db, "users", userId, "orders");
    const snapshot = await getDocs(ordersRef);

    if (snapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">${t["no-orders"]}</td></tr>`;
      return;
    }

    const orders = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const dateObj = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date(0);
      orders.push({ id: docSnap.id, ...data, dateObj });
    });

    orders.sort((a, b) => b.dateObj - a.dateObj);

    tbody.innerHTML = "";

    orders.forEach(order => {
      const orderDate = formatDate(order.createdAt);
      const statusBadge = getOrderStatusBadge(order.status, getCurrentLang());

      const row = `
        <tr>
          <td>${orderDate}</td>
          <td>${statusBadge}</td>
          <td>${order.coins ?? 0}</td>
          <td>${order.price ?? "-"} ${order.currency ?? ""}</td>
          <td>${order.payment_method ?? "-"}</td>
          <td>${order.payment_address ?? "-"}</td>
          <td>${order.payment_instructions ?? "-"}</td>
          <td>${order.payment_deadline ?? "-"}</td>
          <td>${order.payment_reference ?? "-"}</td>
          <td>${order.payment_date ?? "-"}</td>
          <td>${order.payment_proof ? `<a href="${order.payment_proof}" target="_blank">View</a>` : "-"}</td>
          <td>${order.confirmation_date ?? "-"}</td>
        </tr>
      `;

      tbody.insertAdjacentHTML("beforeend", row);
    });

  } catch (error) {
    console.error("Error loading orders:", error);
    tbody.innerHTML = `<tr>
        <td colspan="17" style="text-align:center;">
          ${t["no-orders"]}
        </td>
      </tr>`;
  }
}

const coinsPack = document.getElementById('coinsPack');
const coinsCustomContainer = document.getElementById('customCoinsContainer');

coinsPack.addEventListener('change', () => {
  coinsCustomContainer.style.display = coinsPack.value === 'custom' ? 'block' : 'none';
});

async function saveUserOrder() {
  const selectedLang = getCurrentLang();
  const t = saveCoinsOrderTranslations[selectedLang] || saveCoinsOrderTranslations['en'];

  const user = auth.currentUser;
  if (!user) {
    showUserSectionNotification("warning", t.notLoggedInMessage);
    return;
  }

  const coinsPackSelect = document.getElementById("coinsPack");
  const coinsPack = coinsPackSelect.value;
  const selectedOption = coinsPackSelect.options[coinsPackSelect.selectedIndex];

  const paymentMethod = document.getElementById("paymentMethod")?.value;
  const customCoinsInput = document.getElementById("customCoins")?.value;

  const requiredFields = [
    document.getElementById("userFirstName"),
    document.getElementById("userLastName"),
    document.getElementById("userBirthday"),
    document.getElementById("userCountry"),
    document.getElementById("userPhone"),
    document.getElementById("userEmail")
  ];

  const emptyField = requiredFields.find(input => !input.value || input.value.trim() === "");
  if (emptyField) {
    document.querySelectorAll('.cvb-usertab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.cvb-usertab-content').forEach(tab => tab.classList.remove('active'));

    document.querySelector('[data-tab="infoTab"]').classList.add('active');
    document.getElementById("infoTab").classList.add('active');

    emptyField.scrollIntoView({ behavior: "smooth", block: "center" });
    emptyField.focus();

    showUserSectionNotification("warning", t.incompleteProfile);
    return;
  }

  let coinsToBuy;
  let price = null;
  let currency = null;

  if (coinsPack === "custom") {
    coinsToBuy = parseInt(customCoinsInput, 10);

    if (!coinsToBuy || coinsToBuy < 10) {
      showUserSectionNotification("warning", t.invalidCustomCoins);
      return;
    }

    // simple pricing logic (you can change later)
    price = coinsToBuy;
    currency = "USD";

  } else {
    coinsToBuy = parseInt(coinsPack, 10);
    price = parseFloat(selectedOption.dataset.price || 0);
    currency = selectedOption.dataset.currency || "USD";
  }

  try {
    const orderRef = collection(db, "users", user.uid, "orders");
    await addDoc(orderRef, {
      coins: coinsToBuy,
      price: price,
      currency: currency,
      payment_method: paymentMethod,
      status: "pending",
      createdAt: serverTimestamp(),
      userFirstName: document.getElementById("userFirstName")?.value,
      userPhone: document.getElementById("userPhone")?.value,
      userEmail: document.getElementById("userEmail")?.value
    });

    showUserSectionNotification("success", t.orderSaved);

    appendOrderToTable({
      createdAt: new Date(),
      coins: coinsToBuy,
      price: {price: price, currency: currency},
      payment_method: paymentMethod,
      userFirstName: document.getElementById("userFirstName")?.value,
      userPhone: document.getElementById("userPhone")?.value,
      userEmail: document.getElementById("userEmail")?.value
    });

  } catch (error) {
    console.error("Error saving order:", error);
    showUserSectionNotification("error", t.orderError);
  }
}

document.getElementById("purchaseCoinsBtn")?.addEventListener("click", () => {
  saveUserOrder();
});

// =============================== Affilate =============================

let AFFILIATE_STATE = {
  coins: 0,
  invites: 0,
  conversions: 0
};

const AFFILIATE_LEVELS = [
  { name: "Operator Affiliate", key: "operator", min: 0 },
  { name: "Builder Affiliate", key: "builder", min: 300 },
  { name: "Architect Affiliate", key: "architect", min: 800 },
  { name: "Elite Affiliate", key: "elite", min: 1500 },
  { name: "Core Affiliate", key: "core", min: 3000 }
];

const LEVEL_COLORS = {
  operator: "#cbd5e1",
  builder: "#3b82f6",
  architect: "#a855f7",
  elite: "#22c55e",
  core: "#22d3ee"
};

const LEVEL_BENEFITS = {
  operator: [
    "+10% referral reward boost",
    "Basic CV visibility boost"
  ],
  builder: [
    "+12% referral rewards",
    "Improved CV ranking in search",
    "Faster reward confirmation"
  ],
  architect: [
    "+15% referral rewards",
    "Priority matching in opportunities",
    "Profile highlighted in searches"
  ],
  elite: [
    "+20% referral rewards",
    "Elite badge visibility boost",
    "Early access to platform features"
  ],
  core: [
    "+25% referral rewards",
    "Maximum visibility boost",
    "Core network status (top ranking layer)"
  ]
};

const LEVEL_BONUS = {
  operator: 0.10,
  builder: 0.12,
  architect: 0.15,
  elite: 0.20,
  core: 0.25
};

function generateReferralLink(uid) {
  if (!uid) return "";
  return `https://www.operlya.com/auth/login?ref=${uid}`;
}

function getReferralLink() {
  return document.getElementById("referralLinkInput")?.value || "";
}

document.getElementById("shareReferralBtn")?.addEventListener("click", async () => {
  const link = getReferralLink();
  if (!link) return;

  const text = `Join me on Operlya 🚀`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Operlya Invitation",
        text: text,
        url: link
      });
    } catch (err) {
      console.warn("Share cancelled");
    }
  } else {
    // fallback → copy full message (with link)
    const fullText = `${text} ${link}`;
    navigator.clipboard.writeText(fullText);

    showUserSectionNotification("success", "Link copied to share");
  }
});

document.getElementById("openReferralBtn")?.addEventListener("click", () => {
  const link = getReferralLink();
  if (!link) return;

  window.open(link, "_blank");
});

document.getElementById("shareFacebook")?.addEventListener("click", () => {
  const link = getReferralLink();
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, "_blank");
});

document.getElementById("shareTwitter")?.addEventListener("click", () => {
  const link = getReferralLink();
  const text = "Join me on Operlya 🚀";

  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`, "_blank");
});

document.getElementById("shareLinkedIn")?.addEventListener("click", () => {
  const link = getReferralLink();

  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, "_blank");
});

document.getElementById("shareWhatsApp")?.addEventListener("click", () => {
  const link = getReferralLink();
  const text = `Join me on Operlya 🚀 ${link}`;

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
});

document.getElementById("shareEmail")?.addEventListener("click", () => {
  const link = getReferralLink();

  const subject = "Join me on Operlya";
  const body = `Hey,\n\nI'm using Operlya and thought you might like it.\n\nJoin here:\n${link}\n\n`;

  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById("copyReferralBtn")?.addEventListener("click", () => {
  const input = document.getElementById("referralLinkInput");

  if (!input) return;

  input.select();
  input.setSelectionRange(0, 99999);

  navigator.clipboard.writeText(input.value);

  showUserSectionNotification("success", "Referral link copied");
});

async function calculateAffiliateRewards(userUid) {
  if (!userUid) return;

  let confirmedRewards = 0;
  let affiliateEarnings = 0;
  let inviteCount = 0;
  let conversions = 0;

  try {
    const rewardsRef = collection(db, "users", userUid, "rewards");
    const rewardsSnap = await getDocs(rewardsRef);

    rewardsSnap.forEach(doc => {
      const coins = doc.data()?.coins;
      if (typeof coins === "number") {
        confirmedRewards += coins;
      }
    });
  } catch (e) {
    console.warn("User rewards not accessible:", e.message);
  }

  let referredSnap;

  try {
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("referrerUid", "==", userUid));
    referredSnap = await getDocs(q);
  } catch (e) {
    console.warn("Referral query failed:", e.message);
    referredSnap = null;
  }

  if (referredSnap && !referredSnap.empty) {
    inviteCount = referredSnap.size;

    const ownerCoins = confirmedRewards;
    const ownerLevel = getAffiliateLevel(ownerCoins).current.key;
    const bonusRate = LEVEL_BONUS[ownerLevel] || 0.10;

    for (const userDoc of referredSnap.docs) {
      const referredUid = userDoc.id;
      if (!referredUid) continue;

      try {
        const refRewardsRef = collection(db, "users", referredUid, "rewards");
        const refRewardsSnap = await getDocs(refRewardsRef);

        let referredCoins = 0;

        refRewardsSnap.forEach(r => {
          const coins = r.data()?.coins;
          if (typeof coins === "number") {
            referredCoins += coins;
          }
        });

        const referralEarning = referredCoins * bonusRate;
        affiliateEarnings += referralEarning;

        conversions = affiliateEarnings;

      } catch (e) {
        console.warn(`Skipped referred user ${referredUid}:`, e.message);
      }
    }
  }

  updateAffiliateUI(
    confirmedRewards,
    inviteCount,
    affiliateEarnings
  );
}

function updateAffiliateUI(confirmedRewards = 0, invites = 0, affiliateEarnings = 0) {
  AFFILIATE_STATE = {
    coins: confirmedRewards,
    invites,
    conversions: affiliateEarnings
  };

  const selectedLang = getCurrentLang();
  const t = UserForm_translationsAffiliation[selectedLang] || UserForm_translationsAffiliation['en'];

  const progressBar = document.querySelector(".cvb-aff-progress-fill");
  const progressText = document.querySelector(".cvb-aff-progress-text");

  const coinsEl = document.getElementById("affCoins");
  const invitesEl = document.getElementById("affInvites");
  const conversionsEl = document.getElementById("affConversions");

  const levelRing = document.querySelector(".cvb-level-ring");
  const levelName = document.querySelector(".cvb-aff-level");
  const levelNum = document.querySelector(".cvb-aff-level-num");

  const coins = Math.floor(confirmedRewards);

  const { current, next } = getAffiliateLevel(coins);

  if (levelName) {
    levelName.innerText = t.levels?.[current.key] || current.name;
  }

  if (levelNum) {
    levelNum.innerText = `Level ${AFFILIATE_LEVELS.indexOf(current) + 1}`;
  }

  const benefitsList = document.getElementById("affiliateBenefitsList");
  if (benefitsList) {
    const benefits = t.benefits?.[current.key] || [];

    benefitsList.innerHTML = benefits
      .map(b => `<li><i class="ri-check-line"></i> ${b}</li>`)
      .join("");
  }

  if (progressText) {
    if (next) {
      const remaining = next.min - coins;

      const nextName = t.levels?.[next.key] || next.name;

      progressText.innerText = t.progress.remaining
        .replace("{coins}", remaining)
        .replace("{level}", nextName.replace(" Affiliate", ""));
    } else {
      progressText.innerText = t.progress.max;
    }
  }

  const currentColor = LEVEL_COLORS[current.key];
  const nextColor = next ? LEVEL_COLORS[next.key] : LEVEL_COLORS.core;

  const gradient = next
    ? `linear-gradient(90deg, ${currentColor}, ${nextColor})`
    : `linear-gradient(90deg, ${currentColor}, ${currentColor})`;

  const nextMin = next ? next.min : current.min;
  const prevMin = current.min;

  const progress =
    next ? ((coins - prevMin) / (nextMin - prevMin)) * 100 : 100;

  const safeProgress = Math.min(Math.max(progress, 0), 100);

  if (levelRing) {
    AFFILIATE_LEVELS.forEach(lvl => {
      levelRing.classList.remove(lvl.key);
    });

    levelRing.classList.add(current.key);
  }

  if (progressBar) {
    progressBar.style.width = `${safeProgress}%`;
    progressBar.style.background = gradient;
  }

  if (coinsEl) coinsEl.innerText = Math.floor(confirmedRewards);
  if (invitesEl) invitesEl.innerText = invites;
  if (conversionsEl) conversionsEl.innerText = Math.floor(affiliateEarnings);
  updateBadgesUI(coins);
}

function getAffiliateLevel(coins) {
  let current = AFFILIATE_LEVELS[0];
  let next = AFFILIATE_LEVELS[1];

  for (let i = 0; i < AFFILIATE_LEVELS.length; i++) {
    if (coins >= AFFILIATE_LEVELS[i].min) {
      current = AFFILIATE_LEVELS[i];
      next = AFFILIATE_LEVELS[i + 1] || null;
    }
  }

  return { current, next };
}

let affiliateCoinsChart = null;

async function loadAffiliateCoinsChart(userId) {
  const selectedLang = getCurrentLang();
  const t = UserForm_translationsAffiliation[selectedLang] || UserForm_translationsAffiliation['en'];

  if (!userId) return;

  try {
    const now = new Date();
    const last12Months = new Date();
    last12Months.setMonth(now.getMonth() - 11);

    const directMap = new Map();
    const referralMap = new Map();

    const rewardsRef = collection(db, "users", userId, "rewards");
    const rewardsSnap = await getDocs(rewardsRef);

    rewardsSnap.forEach(doc => {
      const data = doc.data();

      const dateObj = data.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.date
        ? new Date(data.date)
        : null;

      if (!dateObj || dateObj < last12Months) return;

      const dayKey = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, "0")}-${String(
        dateObj.getDate()
      ).padStart(2, "0")}`;

      directMap.set(dayKey, (directMap.get(dayKey) || 0) + (data.coins || 0));
    });

    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("referrerUid", "==", userId));
    const referredSnap = await getDocs(q);

    const totalCoins = Array.from(directMap.values()).reduce((a, b) => a + b, 0);
    const level = getAffiliateLevel(totalCoins).current.key;
    const bonusRate = LEVEL_BONUS[level] || 0.10;

    for (const userDoc of referredSnap.docs) {
      const referredUid = userDoc.id;

      try {
        const refRewardsRef = collection(db, "users", referredUid, "rewards");
        const refRewardsSnap = await getDocs(refRewardsRef);

        refRewardsSnap.forEach(r => {
          const data = r.data();

          const dateObj = data.createdAt?.toDate
            ? data.createdAt.toDate()
            : data.date
            ? new Date(data.date)
            : null;

          if (!dateObj || dateObj < last12Months) return;

          const dayKey = `${dateObj.getFullYear()}-${String(
            dateObj.getMonth() + 1
          ).padStart(2, "0")}-${String(
            dateObj.getDate()
          ).padStart(2, "0")}`;

          const coins = (data.coins || 0) * bonusRate;

          referralMap.set(dayKey, (referralMap.get(dayKey) || 0) + coins);
        });

      } catch (e) {
        console.warn("Referral fetch failed:", referredUid);
      }
    }

    const allMonths = new Set([
      ...directMap.keys(),
      ...referralMap.keys()
    ]);

    const labels = Array.from(allMonths).sort();
    if (labels.length === 0) {
      showEmptyAffiliateChart();
      if (affiliateCoinsChart) {
        affiliateCoinsChart.destroy();
        affiliateCoinsChart = null;
      }
      return;
    }

    restoreAffiliateCanvas();

    const directData = labels.map(m => directMap.get(m) || 0);
    const referralData = labels.map(m => referralMap.get(m) || 0);

    const canvas = document.getElementById("affiliateCoinsChart");
    if (!canvas) return;

    if (affiliateCoinsChart) {
      affiliateCoinsChart.destroy();
    }

    affiliateCoinsChart = new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t.chart.your,
            data: directData,
            borderColor: "#3178d3",
            backgroundColor: "rgba(49,120,211,0.12)",
            fill: true,
            tension: 0.35
          },
          {
            label: t.chart.referral,
            data: referralData,
            borderColor: "#22c55e",
            backgroundColor: "rgba(34,197,94,0.12)",
            fill: true,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        
        plugins: {
          legend: { display: true }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });

  } catch (err) {
    console.error("Affiliate chart error:", err);
  }
}

async function loadReferrersList(userId) {
  const selectedLang = getCurrentLang();
  const t = UserForm_translationsAffiliation[selectedLang] || UserForm_translationsAffiliation['en'];

  if (!userId) return;

  const container = document.getElementById("referrersList");
  if (!container) return;

  container.innerHTML = `<div class="cvb-aff-muted">${t.referrers.loading}</div>`;

  try {
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("referrerUid", "==", userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      container.innerHTML = `
        <div class="cvb-aff-muted">${t.referrers.empty}</div>
      `;
      return;
    }

    const referrers = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const referredUid = docSnap.id;

      let totalCoins = 0;

      try {
        const rewardsRef = collection(db, "users", referredUid, "rewards");
        const rewardsSnap = await getDocs(rewardsRef);

        rewardsSnap.forEach(r => {
          const coins = r.data()?.coins;
          if (typeof coins === "number") {
            totalCoins += coins;
          }
        });

      } catch (e) {
        console.warn("Coins fetch failed for:", referredUid);
      }

      referrers.push({
        uid: referredUid,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
        avatar: data.avatar || "/images/default_avatar.png",
        coins: totalCoins
      });
    }

    referrers.sort((a, b) => b.coins - a.coins);

    container.innerHTML = referrers.map((r, index) => `
      <div class="cvb-referrer-item">
        <img src="${r.avatar}" alt="${r.name}">
        
        <div class="cvb-referrer-info">
          <span class="name">${r.name}</span>
          <span class="meta">
            ${t.referrers.rank.replace("{rank}", index + 1)}
          </span>
        </div>
        <div class="cvb-referrer-badge">
          ${t.referrers.coins.replace("{coins}", Math.floor(r.coins))}
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error("Referrers load error:", err);

    container.innerHTML = `
      <div class="cvb-aff-muted">${t.referrers.failed}</div>
    `;
  }
}

function showEmptyAffiliateChart() {
  const selectedLang = getCurrentLang();
  const t = UserForm_translationsAffiliation[selectedLang] || UserForm_translationsAffiliation['en'];
  const container = document.querySelector(".cvb-aff-chart-container");
  container.innerHTML = `
    <div class="cvb-history-graphEmpty">
      ${t.chart.empty}
    </div>
  `;
}

function restoreAffiliateCanvas() {
  const container = document.querySelector(".cvb-aff-chart-container");
  container.innerHTML = `<canvas id="affiliateCoinsChart"></canvas>`;
}

async function loadUserRewards(userId) {
  if (!userId) return;

  const container = document.getElementById("userRewardsList");
  if (!container) return;

  const lang = getCurrentLang();
  const t = UserForm_translationsAffiliation[lang] || UserForm_translationsAffiliation.en;

  container.innerHTML = `<div class="cvb-aff-muted">${t.rewards.loading}</div>`;

  try {
    const rewardsRef = collection(db, "users", userId, "rewards");
    const snapshot = await getDocs(rewardsRef);

    if (snapshot.empty) {
      container.innerHTML = `<div class="cvb-aff-muted">${t.rewards.empty}</div>`;
      return;
    }

    const rewards = [];

    snapshot.forEach(doc => {
      const data = doc.data();

      rewards.push({
        title: data.title || t.rewards.defaultTitle,
        coins: data.coins || 0,
        type: data.type || "default",
        date: data.createdAt?.toDate
          ? data.createdAt.toDate()
          : data.date
          ? new Date(data.date)
          : null
      });
    });

    rewards.sort((a, b) => (b.date || 0) - (a.date || 0));

    container.innerHTML = rewards.map(r => {

      const dateStr = formatRewardDate(r.date, lang);

      const iconClass =
        r.type === "referral" ? "green" :
        r.type === "bonus" ? "purple" :
        r.type === "action" ? "blue" :
        "orange";

      const icon =
        r.type === "referral" ? "ri-user-add-line" :
        r.type === "bonus" ? "ri-star-line" :
        r.type === "action" ? "ri-task-line" :
        "ri-coins-line";

      return `
        <div class="cvb-reward-item">

          <div class="cvb-reward-icon ${iconClass}">
            <i class="${icon}"></i>
          </div>

          <div class="cvb-reward-info">
            <span class="title">${r.title}</span>
            <span class="meta">${dateStr}</span>
          </div>

          <div class="cvb-reward-coins">
            +${Math.floor(r.coins)}
          </div>

        </div>
      `;
    }).join("");

  } catch (err) {
    console.error("Rewards load error:", err);

    container.innerHTML = `
      <div class="cvb-aff-muted">${t.rewards.failed}</div>
    `;
  }
}

function formatRewardDate(date, lang = "en") {
  if (!date) return "";

  const locales = {
    en: "en-US",
    fr: "fr-FR",
    ar: "ar-MA",
    es: "es-ES",
    zh: "zh-CN",
    de: "de-DE",
    pt: "pt-PT",
    ja: "ja-JP",
    ru: "ru-RU"
  };

  return new Intl.DateTimeFormat(locales[lang] || "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function updateBadgesUI(coins) {
  const { current } = getAffiliateLevel(coins);

  const currentIndex = AFFILIATE_LEVELS.findIndex(l => l.key === current.key);

  const badgeCards = document.querySelectorAll(".cvb-badge-card");

  badgeCards.forEach((card, index) => {
    card.classList.remove("disabled");

    if (index > currentIndex) {
      card.classList.add("disabled");
    }
  });
}

function scrollToCurrentBadge() {
  const coins = AFFILIATE_STATE.coins;
  const { current } = getAffiliateLevel(coins);

  const currentCard = document.querySelector(
    `.cvb-badge-card.${current.key}`
  );

  if (currentCard) {
    currentCard.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}

const badgesOverlay = document.getElementById("affBadgesOverlay");
const openBadgesBtn = document.querySelector(".cvb-aff-btn");
const closeBadgesBtn = document.getElementById("closeBadgesBtn");

openBadgesBtn?.addEventListener("click", () => {
  badgesOverlay?.classList.add("active");
  setTimeout(() => {
    scrollToCurrentBadge();
  }, 150);
});

closeBadgesBtn?.addEventListener("click", () => {
  badgesOverlay?.classList.remove("active");
});

badgesOverlay?.addEventListener("click", (e) => {
  if (e.target === badgesOverlay) {
    badgesOverlay.classList.remove("active");
  }
});

// =============================== Security & Privacy =============================

const securityTab = document.getElementById("securityTab");
const saveSecurityBtn = document.getElementById("saveSecurityBtn");

let securityDirty = false;

function markSecurityDirty() {
  if (!securityDirty) {
    securityDirty = true;
    saveSecurityBtn.style.display = "inline-flex";
  }
}

securityTab.querySelectorAll("input, select").forEach(el => {
  el.addEventListener("change", markSecurityDirty);
});

async function saveSecuritySettings() {
  const user = auth.currentUser;
  if (!user) return;

  const data = {
    security: {
      profileVisibility: document.getElementById("profileVisibilitySelect").value,
      fieldVisibility: {
        email: document.getElementById("visibilityEmail").checked,
        phone: document.getElementById("visibilityPhone").checked,
        location: document.getElementById("visibilityLocation").checked
      },
      dataUsage: {
        improvements: document.getElementById("productImprovements").checked,
        personalization: document.getElementById("personalization").checked,
        marketing: document.getElementById("marketingCommunications").checked
      }
    }
  };

  try {
    await setDoc(doc(db, "users", user.uid), data, { merge: true });

    showUserSectionNotification("success", "Security settings saved");
    securityDirty = false;
    saveSecurityBtn.style.display = "none";

    await loadSecuritySettings(user); // reload after save
  } catch (err) {
    console.error(err);
    showUserSectionNotification("error", "Failed to save security settings");
  }
}
saveSecurityBtn.addEventListener("click", saveSecuritySettings);

async function loadSecuritySettings(user) {
  if (!user) return;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return;

    const security = snap.data().security || {};

    if (security.profileVisibility) {
      document.getElementById("profileVisibilitySelect").value =
        security.profileVisibility;
    }

    if (security.fieldVisibility) {
      document.getElementById("visibilityEmail").checked =
        !!security.fieldVisibility.email;
      document.getElementById("visibilityPhone").checked =
        !!security.fieldVisibility.phone;
      document.getElementById("visibilityLocation").checked =
        !!security.fieldVisibility.location;
    }

    if (security.dataUsage) {
      document.getElementById("productImprovements").checked =
        !!security.dataUsage.improvements;
      document.getElementById("personalization").checked =
        !!security.dataUsage.personalization;
      document.getElementById("marketingCommunications").checked =
        !!security.dataUsage.marketing;
    }

    securityDirty = false;
    saveSecurityBtn.style.display = "none";

  } catch (err) {
    console.error("Failed to load security settings", err);
  }
}

const changePasswordBtn = document.getElementById("changePassword");
changePasswordBtn.addEventListener("click", async () => {
  const emailInput = document.getElementById("userEmail");
  const userEmail = emailInput?.value;

  if (!userEmail) {
    showUserSectionNotification("error", "No email found for password reset.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, userEmail);
    showUserSectionNotification("success", `Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Password reset failed:", error);
    let msg = "Failed to send password reset email.";
    if (error.code === "auth/user-not-found") msg = "No user found with this email.";
    else if (error.code === "auth/invalid-email") msg = "Invalid email address.";
    showUserSectionNotification("error", msg);
  }
});

// ================================== Notifications ===================================

function showUserSectionNotification(type, message, duration = 2000) {
  const notifyDiv = document.getElementById("cvb-user-form-notify");
  if (!notifyDiv) return;

  notifyDiv.textContent = message;
  notifyDiv.className = `cvb-InternalNotify ${type}`;
  notifyDiv.classList.remove("hidden");

  notifyDiv.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

  setTimeout(() => {
    notifyDiv.classList.add("hidden");
  }, duration);
}

function showNotification(typeOrOptions, title, message, delay = false) {
  const modal = document.getElementById("newTaskNotif");
  const content = modal.querySelector(".notify2-content");
  const confirmBtn = document.getElementById("notifyConfirm");
  const cancelBtn = document.getElementById("notifyCancel");
  const closeTopBtn = document.getElementById("notifyCloseTop");

  let type = "success";
  let onConfirm = null;
  let autoClose = delay;

  if (typeof typeOrOptions === "object") {
    type = typeOrOptions.type || "warning";
    title = typeOrOptions.title;
    message = typeOrOptions.message;
    onConfirm = typeOrOptions.onConfirm || null;
    autoClose = typeOrOptions.delay || false;
  } else {
    type = typeOrOptions || "success";
  }

  if (type === "congrats") {
    autoClose = true;
  }

  content.classList.remove(
    "notify2-success",
    "notify2-warning",
    "notify2-error",
    "notify2-congrats"
  );

  confirmBtn.style.display = "none";
  cancelBtn.style.display = "none";

  content.classList.add(`notify2-${type}`);

  const icon = document.getElementById("notifyIcon");
  icon.className = "notify2-icon";

  if (type === "success") icon.classList.add("ri-checkbox-circle-fill");
  if (type === "warning") icon.classList.add("ri-error-warning-fill");
  if (type === "error") icon.classList.add("ri-close-circle-fill");
  if (type === "congrats") icon.classList.add("ri-gift-2-fill");

  document.getElementById("notifyTitle").textContent = title || "";
  document.getElementById("notifyMessage").textContent = message || "";

  // ===== Confirmation Mode =====
  if (onConfirm) {
    confirmBtn.textContent = t.notifyConfirm;
    cancelBtn.textContent = t.notifyCancel;

    confirmBtn.style.display = "inline-block";
    cancelBtn.style.display = "inline-block";

    confirmBtn.onclick = () => {
      modal.style.display = "none";
      onConfirm();
    };

    cancelBtn.onclick = () => {
      modal.style.display = "none";
    };

    closeTopBtn.onclick = () => {
      modal.style.display = "none";
    };
  } else {
    closeTopBtn.onclick = () => {
      modal.style.display = "none";
    };
  }

  // ===== Show Modal =====
  modal.style.display = "flex";

  if (type === "congrats") {
    triggerPopColors(content);
  }

  // ===== Auto-close =====
  if (autoClose && !onConfirm) {
    setTimeout(() => {
      modal.style.display = "none";
    }, 3000);
  }
}
document.getElementById("newTaskNotif").addEventListener("click", (e) => {
  if (e.target === document.getElementById("newTaskNotif")) {
    e.target.style.display = "none";
  }
});

function triggerPopColors(notification) {
  const colors = ["#ff69b4", "#ffcc00", "#00e6e6", "#33ff77", "#ff6f61", "#8a2be2", "#ff4500"];

  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti-piece";
    confetti.style.setProperty("--confetti-color", colors[Math.floor(Math.random() * colors.length)]);
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${Math.random() * 70 - 10}px`;
    const size = 4 + Math.random() * 6;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.animationDelay = `${Math.random() * 0.3}s`;
    confetti.style.transform = `translateY(0) rotate(${Math.random() * 360}deg)`;
    notification.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

const notify = document.querySelector('.cvb-InternalNotify.notify-congrats');
if (notify) triggerPopColors(notify);

// ================================= LANGUAGES SELECT =================================

function getCurrentLang() {
  const languageSelect = document.querySelector('#languageSelectorSidebar');

  return (
    languageSelect?.getAttribute('data-selected') ||
    sessionStorage.getItem('mynextcv-language') ||
    'en'
  );
}

function initLanguageSelector(selectorId) {
  const languageSelect = document.getElementById(selectorId);
  if (!languageSelect) return;

  const selectedLang = languageSelect.querySelector('.selectedLanguage');
  const options = languageSelect.querySelectorAll('.options li');

  selectedLang.addEventListener('click', () => {
    languageSelect.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (!languageSelect.contains(e.target)) {
      languageSelect.classList.remove('open');
    }
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      const selectedValue = option.getAttribute('data-value');

      // Update ALL selectors (sync desktop + mobile)
      document.querySelectorAll('.language-select').forEach(select => {
        const display = select.querySelector('.selectedLanguage');
        display.innerHTML = option.innerHTML;
        select.setAttribute('data-selected', selectedValue);
        select.classList.remove('open');
      });

      sessionStorage.setItem('mynextcv-language', selectedValue);
      applyTranslations(selectedValue);
    });
  });
}

initLanguageSelector('languageSelectorSidebar');
initLanguageSelector('languageSelectorMobile');

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = sessionStorage.getItem('mynextcv-language') || 'en';

  document.querySelectorAll('.language-select').forEach(select => {
    const option = select.querySelector(`.options li[data-value="${savedLang}"]`);
    if (option) {
      select.querySelector('.selectedLanguage').innerHTML = option.innerHTML;
      select.setAttribute('data-selected', savedLang);
    }
  });

  applyTranslations(savedLang);
});

// =================================== TRANSLATIONS ====================================

function setBodyFont(lang) {
  const body = document.body;

  const font = lang === "ar" ? '"Tajawal", sans-serif' : '"Roboto", sans-serif';
  body.style.fontFamily = font;
}

function applyTranslations(lang) {
  setBodyFont(lang);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateUserSection(user);
      setupAccountView(user);
    } else {
      updateUserSection(null);
      setupAccountView(null);
    }
  });
  translateTopBar();
  UserForm_translateSidebar(lang);
  UserForm_translatePage(lang);
  UserForm_translateHistory(lang);
  UserForm_translatePay(lang);
  UserForm_translateAffiliation(lang);
  UserForm_translateSecurity(lang);
}

const cvbTopBarTranslations = {
  en: {
    help: "Need Help?",
    workspace: "Workspace",
    postOpportunity: "Create Opportunity",
    executionCenter: "Execution Center",
    opportunitiesManager: "Opportunities Manager",
    resumeBuilder: "Resume Builder",
    opportunitiesExplorer: "Opportunities Explorer"
  },

  fr: {
    help: "Besoin d'aide ?",
    workspace: "Espace de travail",
    postOpportunity: "Publier une opportunité",
    executionCenter: "Centre d'exécution",
    opportunitiesManager: "Gestionnaire d'opportunités",
    resumeBuilder: "Créateur de CV",
    opportunitiesExplorer: "Explorateur d'opportunités"
  },

  ar: {
    help: "تحتاج مساعدة؟",
    workspace: "مساحة العمل",
    postOpportunity: "نشر فرصة",
    executionCenter: "مركز التنفيذ",
    opportunitiesManager: "مدير الفرص",
    resumeBuilder: "منشئ السيرة الذاتية",
    opportunitiesExplorer: "مستكشف الفرص"
  },

  es: {
    help: "¿Necesitas ayuda?",
    workspace: "Espacio de trabajo",
    postOpportunity: "Publicar oportunidad",
    executionCenter: "Centro de ejecución",
    opportunitiesManager: "Gestor de oportunidades",
    resumeBuilder: "Creador de currículum",
    opportunitiesExplorer: "Explorador de oportunidades"
  },

  de: {
    help: "Brauchst du Hilfe?",
    workspace: "Arbeitsbereich",
    postOpportunity: "Opportunität erstellen",
    executionCenter: "Ausführungszentrum",
    opportunitiesManager: "Opportunitäten-Manager",
    resumeBuilder: "Lebenslauf-Ersteller",
    opportunitiesExplorer: "Opportunitäten-Explorer"
  },

  pt: {
    help: "Precisa de ajuda?",
    workspace: "Espaço de trabalho",
    postOpportunity: "Publicar oportunidade",
    executionCenter: "Centro de execução",
    opportunitiesManager: "Gerente de oportunidades",
    resumeBuilder: "Criador de currículo",
    opportunitiesExplorer: "Explorador de oportunidades"
  },

  zh: {
    help: "需要帮助？",
    workspace: "工作区",
    postOpportunity: "发布机会",
    executionCenter: "执行中心",
    opportunitiesManager: "机会管理器",
    resumeBuilder: "简历生成器",
    opportunitiesExplorer: "机会浏览器"
  },

  ja: {
    help: "サポートが必要ですか？",
    workspace: "ワークスペース",
    postOpportunity: "機会を投稿",
    executionCenter: "実行センター",
    opportunitiesManager: "機会マネージャー",
    resumeBuilder: "履歴書ビルダー",
    opportunitiesExplorer: "機会エクスプローラー"
  },

  ru: {
    help: "Нужна помощь?",
    workspace: "Рабочее пространство",
    postOpportunity: "Опубликовать возможность",
    executionCenter: "Центр выполнения",
    opportunitiesManager: "Менеджер возможностей",
    resumeBuilder: "Конструктор резюме",
    opportunitiesExplorer: "Обозреватель возможностей"
  }
};
function translateTopBar() {
  const lang = getCurrentLang();
  const t = cvbTopBarTranslations[lang] || cvbTopBarTranslations["en"];

  const helpBtn = document.getElementById("topBarHelp");
  if (helpBtn) {
    helpBtn.innerHTML = `<i class="ri-question-line"></i> ${t.help}`;
  }

  const helpMobile = document.getElementById("openhelpMobile");
  if (helpMobile) {
    helpMobile.innerHTML = `<i class="ri-question-line"></i> ${t.help}`;
  }

  document.querySelectorAll("[data-title]").forEach(el => {
    const key = el.getAttribute("data-title");
    if (!key || !t[key]) return;

    const icon = el.querySelector("i");
    const iconHTML = icon ? icon.outerHTML : "";

    el.innerHTML = `${iconHTML} ${t[key]}`;
  });
}

const UserForm_translationsSidebar = {
  en: {
    "verified-badge": "Verified Account",
    "tab-user-info": "Profile",
    "tab-history": "Activity",
    "tab-buy-coins": "Billing",
    "tab-security": "Security",
    "tab-affiliation": "Affiliation",

    "cta-title": "Boost Your Earnings",
    "cta-desc": "Share your link and unlock bonus coins",
    "cta-btn": "Share Now",
    "cta-stats": "Unlock up to 25% with your network."
  },
  fr: {
    "verified-badge": "Compte vérifié",
    "tab-user-info": "Profil",
    "tab-history": "Activité",
    "tab-buy-coins": "Facturation",
    "tab-security": "Sécurité",
    "tab-affiliation": "Affiliation",

    "cta-title": "Boostez vos gains",
    "cta-desc": "Partagez votre lien et débloquez des pièces bonus",
    "cta-btn": "Partager",
    "cta-stats": "Débloquez jusqu'à 25% avec votre réseau."
  },
  ar: {
    "verified-badge": "حساب موثق",
    "tab-user-info": "الملف الشخصي",
    "tab-history": "النشاط",
    "tab-buy-coins": "الفواتير",
    "tab-security": "الأمان",
    "tab-affiliation": "الانتساب",

    "cta-title": "عزز أرباحك",
    "cta-desc": "شارك رابطك واحصل على عملات إضافية",
    "cta-btn": "مشاركة",
    "cta-stats": "افتح حتى 25٪ من خلال شبكتك."
  },
  es: {
    "verified-badge": "Cuenta verificada",
    "tab-user-info": "Perfil",
    "tab-history": "Actividad",
    "tab-buy-coins": "Facturación",
    "tab-security": "Seguridad",
    "tab-affiliation": "Afiliación",

    "cta-title": "Aumenta tus ganancias",
    "cta-desc": "Comparte tu enlace y desbloquea monedas extra",
    "cta-btn": "Compartir",
    "cta-stats": "Desbloquea hasta un 25% con tu red."
  },
  zh: {
    "verified-badge": "已验证账户",
    "tab-user-info": "个人资料",
    "tab-history": "活动",
    "tab-buy-coins": "账单",
    "tab-security": "安全设置",
    "tab-affiliation": "隶属关系",

    "cta-title": "提升您的收益",
    "cta-desc": "分享您的链接并解锁额外金币",
    "cta-btn": "分享",
    "cta-stats": "通过您的网络解锁高达25%的收益。"
  },
  de: {
    "verified-badge": "Verifiziertes Konto",
    "tab-user-info": "Profil",
    "tab-history": "Aktivität",
    "tab-buy-coins": "Abrechnung",
    "tab-security": "Sicherheit",
    "tab-affiliation": "Zugehörigkeit",

    "cta-title": "Steigere deine Einnahmen",
    "cta-desc": "Teile deinen Link und schalte Bonusmünzen frei",
    "cta-btn": "Teilen",
    "cta-stats": "Schalte bis zu 25 % mit deinem Netzwerk frei."
  },
  pt: {
    "verified-badge": "Conta verificada",
    "tab-user-info": "Perfil",
    "tab-history": "Atividade",
    "tab-buy-coins": "Faturamento",
    "tab-security": "Segurança",
    "tab-affiliation": "Afiliação",

    "cta-title": "Aumente seus ganhos",
    "cta-desc": "Compartilhe seu link e desbloqueie moedas extras",
    "cta-btn": "Compartilhar",
    "cta-stats": "Desbloqueie até 25% com sua rede."
  },
  ja: {
    "verified-badge": "認証済みアカウント",
    "tab-user-info": "プロフィール",
    "tab-history": "アクティビティ",
    "tab-buy-coins": "請求",
    "tab-security": "セキュリティ",
    "tab-affiliation": "所属",

    "cta-title": "収益を増やす",
    "cta-desc": "リンクを共有してボーナスコインを獲得",
    "cta-btn": "共有",
    "cta-stats": "ネットワークで最大25％をアンロック。"
  },
  ru: {
    "verified-badge": "Подтверждённый аккаунт",
    "tab-user-info": "Профиль",
    "tab-history": "Активность",
    "tab-buy-coins": "Платежи",
    "tab-security": "Безопасность",
    "tab-affiliation": "Принадлежность",

    "cta-title": "Увеличьте свой доход",
    "cta-desc": "Поделитесь ссылкой и получите бонусные монеты",
    "cta-btn": "Поделиться",
    "cta-stats": "Разблокируйте до 25% с вашей сетью."
  }
};
function UserForm_translateSidebar(lang) {
  const t = UserForm_translationsSidebar[lang] || UserForm_translationsSidebar['en'];

  const tabs = document.querySelectorAll('#cvb-user-info-formNav .cvb-usertab-btn');
  tabs.forEach(tab => {
    const tabName = tab.dataset.tab;
    if (tabName === "infoTab") tab.innerHTML = `<i class="ri-user-line"></i> ${t["tab-user-info"]}`;
    if (tabName === "historyTab") tab.innerHTML = `<i class="ri-time-line"></i> ${t["tab-history"]}`;
    if (tabName === "buyCoinsTab") tab.innerHTML = `<i class="ri-shopping-bag-3-line"></i> ${t["tab-buy-coins"]}`;
    if (tabName === "affiliationTab") tab.innerHTML = `<i class="ri-share-forward-line"></i> ${t["tab-affiliation"]}`;
    if (tabName === "securityTab") tab.innerHTML = `<i class="ri-lock-password-line"></i> ${t["tab-security"] || "Security"}`;
  });

  const cta = document.querySelector(".sidebar-footer-cta");
  if (cta) {
    const title = cta.querySelector("h4");
    const desc = cta.querySelector("p");
    const btn = cta.querySelector(".cta-btn");
    const stats = cta.querySelector(".cta-stats span");

    if (title) title.textContent = t["cta-title"];
    if (desc) desc.textContent = t["cta-desc"];
    if (btn) btn.innerHTML = `<i class="ri-share-forward-line"></i> ${t["cta-btn"]}`;
    if (stats) stats.textContent = t["cta-stats"];
  }
}

const UserForm_translations = {
  en: {
    "header-title": "Profile",
    "header-description": "Manage your personal details and profile settings",
    "verified-badge": "Verified Account",
    "label-first-name": "First Name:",
    "label-last-name": "Last Name:",
    "label-email": "Email:",
    "label-birthday": "Birthday:",
    "label-country": "Country:",
    "label-phone": "Phone Number:",
    "label-industry": "Industry:",
    "label-speciality": "speciality:",
    "label-headline": "Headline:",
    "label-availability": "Availability:",
    "label-role": "Status:",
    "label-goals": "Goals:",
    "btn-update-info": "Update informations",
    "notice-info": "This information is <strong>not used for your CV</strong>. It helps us improve your experience and provide more personalized service.",
    "placeholder-country": "Select a country",
    "placeholder-industry": "Select an industry",
    "placeholder-speciality": "Select a speciality",
    "placeholder-availability": "Select availability",
    "placeholder-role": "Select your status",
    "placeholder-goals": "Select your goal",
    "availability-full_time": "Full-time",
    "availability-part_time": "Part-time",
    "availability-freelance": "Freelance",
    "availability-open_projects": "Open for projects",
    "availability-temporarily_unavailable": "Temporarily unavailable",
    "role-talent": "Talent",
    "role-organization": "Organization",
    "role-freelancer": "Freelancer",
    "role-student": "Student",
    "role-team": "Team",
    "goal-money": "Earn money",
    "goal-experience": "Gain experience",
    "goal-network": "Build network",
    "goal-learn": "Learn new skills",
    "goal-hire": "Hire talent",
    "goal-outsource_tasks": "Outsource tasks"
  },
  fr: {
    "header-title": "Profil",
    "header-description": "Gérez vos informations personnelles et les paramètres de votre profil",
    "verified-badge": "Compte vérifié",
    "label-first-name": "Prénom:",
    "label-last-name": "Nom:",
    "label-email": "Email:",
    "label-birthday": "Date de naissance:",
    "label-country": "Pays:",
    "label-phone": "Numéro de téléphone:",
    "label-industry": "Secteur d'activité:",
    "label-speciality": "Spécialité:",
    "label-headline": "Titre professionnel:",
    "label-availability": "Disponibilité:",
    "label-role": "Statut:",
    "label-goals": "Objectifs:",
    "btn-update-info": "Mettre à jour",
    "notice-info": "Ces informations <strong>ne sont pas utilisées pour votre CV</strong>. Elles nous aident à améliorer votre expérience et fournir un service plus personnalisé.",
    "placeholder-country": "Sélectionner un pays",
    "placeholder-industry": "Sélectionner un secteur",
    "placeholder-speciality": "Sélectionner une spécialité",
    "placeholder-availability": "Sélectionner la disponibilité",
    "placeholder-role": "Sélectionner votre statut",
    "placeholder-goals": "Sélectionner votre objectif",
    "availability-full_time": "Temps plein",
    "availability-part_time": "Temps partiel",
    "availability-freelance": "Freelance",
    "availability-open_projects": "Ouvert aux projets",
    "availability-temporarily_unavailable": "Indisponible temporairement",
    "role-talent": "Talent",
    "role-organization": "Organisation",
    "role-freelancer": "Freelance",
    "role-student": "Étudiant",
    "role-team": "Équipe",
    "goal-money": "Gagner de l'argent",
    "goal-experience": "Acquérir de l'expérience",
    "goal-network": "Développer mon réseau",
    "goal-learn": "Apprendre de nouvelles compétences",
    "goal-hire": "Recruter des talents",
    "goal-outsource_tasks": "Externaliser des tâches"
  },
  ar: {
    "header-title": "الملف الشخصي",
    "header-description": "إدارة تفاصيلك الشخصية وإعدادات الملف الشخصي",
    "verified-badge": "حساب موثق",
    "label-first-name": "الاسم الأول:",
    "label-last-name": "اسم العائلة:",
    "label-email": "البريد الإلكتروني:",
    "label-birthday": "تاريخ الميلاد:",
    "label-country": "البلد:",
    "label-phone": "رقم الهاتف:",
    "label-industry": "القطاع:",
    "label-speciality": "التخصص:",
    "label-headline": "المسمى الوظيفي:",
    "label-availability": "التوفر:",
    "label-role": "الحالة:",
    "label-goals": "الأهداف:",
    "btn-update-info": "تحديث المعلومات",
    "notice-info": "هذه المعلومات <strong>غير مستخدمة في سيرتك الذاتية</strong>. تساعدنا في تحسين تجربتك وتقديم خدمة أكثر تخصيصًا.",
    "placeholder-country": "اختر البلد",
    "placeholder-industry": "اختر القطاع",
    "placeholder-speciality": "اختر التخصص",
    "placeholder-availability": "اختر حالة التوفر",
    "placeholder-role": "اختر حالتك",
    "placeholder-goals": "اختر هدفك",
    "availability-full_time": "دوام كامل",
    "availability-part_time": "دوام جزئي",
    "availability-freelance": "عمل حر",
    "availability-open_projects": "مفتوح للمشاريع",
    "availability-temporarily_unavailable": "غير متاح مؤقتاً",
    "role-talent": "موهبة",
    "role-organization": "مؤسسة",
    "role-freelancer": "مستقل",
    "role-student": "طالب",
    "role-team": "فريق",
    "goal-money": "كسب المال",
    "goal-experience": "اكتساب الخبرة",
    "goal-network": "بناء علاقات مهنية",
    "goal-learn": "تعلم مهارات جديدة",
    "goal-hire": "توظيف المواهب",
    "goal-outsource_tasks": "الاستعانة بمصادر خارجية"
  },
  es: {
    "header-title": "Perfil",
    "header-description": "Administra tus datos personales y la configuración de tu perfil",
    "verified-badge": "Cuenta verificada",
    "label-first-name": "Nombre:",
    "label-last-name": "Apellido:",
    "label-email": "Correo electrónico:",
    "label-birthday": "Fecha de nacimiento:",
    "label-country": "País:",
    "label-phone": "Número de teléfono:",
    "label-industry": "Industria:",
    "label-speciality": "Especialidad:",
    "label-headline": "Título profesional:",
    "label-availability": "Disponibilidad:",
    "label-role": "Estado:",
    "label-goals": "Objetivos:",
    "btn-update-info": "Actualizar información",
    "notice-info": "Esta información <strong>no se utiliza para tu CV</strong>. Nos ayuda a mejorar tu experiencia y ofrecer un servicio más personalizado.",
    "placeholder-country": "Seleccionar un país",
    "placeholder-industry": "Seleccionar una industria",
    "placeholder-speciality": "Seleccionar una especialidad",
    "placeholder-availability": "Seleccionar disponibilidad",
    "placeholder-role": "Seleccionar tu estado",
    "placeholder-goals": "Seleccionar tu objetivo",
    "availability-full_time": "Tiempo completo",
    "availability-part_time": "Medio tiempo",
    "availability-freelance": "Freelance",
    "availability-open_projects": "Abierto a proyectos",
    "availability-temporarily_unavailable": "No disponible temporalmente",
    "role-talent": "Talento",
    "role-organization": "Organización",
    "role-freelancer": "Freelance",
    "role-student": "Estudiante",
    "role-team": "Equipo",
    "goal-money": "Ganar dinero",
    "goal-experience": "Adquirir experiencia",
    "goal-network": "Construir red de contactos",
    "goal-learn": "Aprender nuevas habilidades",
    "goal-hire": "Contratar talento",
    "goal-outsource_tasks": "Externalizar tareas"
  },
  zh: {
    "header-title": "个人资料",
    "header-description": "管理您的个人信息和资料设置",
    "verified-badge": "已验证账户",
    "label-first-name": "名：",
    "label-last-name": "姓：",
    "label-email": "电子邮件：",
    "label-birthday": "生日：",
    "label-country": "国家：",
    "label-phone": "电话号码：",
    "label-industry": "行业：",
    "label-speciality": "专业领域：",
    "label-headline": "职位头衔：",
    "label-availability": "可用状态：",
    "label-role": "身份：",
    "label-goals": "目标：",
    "btn-update-info": "更新信息",
    "notice-info": "此信息<strong>不会用于您的简历</strong>。它有助于我们改善您的体验并提供更个性化的服务。",
    "placeholder-country": "选择国家",
    "placeholder-industry": "选择行业",
    "placeholder-speciality": "选择专业领域",
    "placeholder-availability": "选择可用状态",
    "placeholder-role": "选择您的身份",
    "placeholder-goals": "选择您的目标",
    "availability-full_time": "全职",
    "availability-part_time": "兼职",
    "availability-freelance": "自由职业",
    "availability-open_projects": "接受项目合作",
    "availability-temporarily_unavailable": "暂时不可用",
    "role-talent": "人才",
    "role-organization": "组织",
    "role-freelancer": "自由职业者",
    "role-student": "学生",
    "role-team": "团队",
    "goal-money": "赚取收入",
    "goal-experience": "积累经验",
    "goal-network": "建立人脉",
    "goal-learn": "学习新技能",
    "goal-hire": "招聘人才",
    "goal-outsource_tasks": "外包任务"
  },
  de: {
    "header-title": "Profil",
    "header-description": "Verwalten Sie Ihre persönlichen Daten und Profileinstellungen",
    "verified-badge": "Verifiziertes Konto",
    "label-first-name": "Vorname:",
    "label-last-name": "Nachname:",
    "label-email": "E-Mail:",
    "label-birthday": "Geburtsdatum:",
    "label-country": "Land:",
    "label-phone": "Telefonnummer:",
    "label-industry": "Branche:",
    "label-speciality": "Fachgebiet:",
    "label-headline": "Berufsbezeichnung:",
    "label-availability": "Verfügbarkeit:",
    "label-role": "Status:",
    "label-goals": "Ziele:",
    "btn-update-info": "Informationen aktualisieren",
    "notice-info": "Diese Informationen werden <strong>nicht für deinen Lebenslauf verwendet</strong>. Sie helfen uns, deine Erfahrung zu verbessern und einen personalisierten Service anzubieten.",
    "placeholder-country": "Land auswählen",
    "placeholder-industry": "Branche auswählen",
    "placeholder-speciality": "Fachgebiet auswählen",
    "placeholder-availability": "Verfügbarkeit auswählen",
    "placeholder-role": "Status auswählen",
    "placeholder-goals": "Ziel auswählen",
    "availability-full_time": "Vollzeit",
    "availability-part_time": "Teilzeit",
    "availability-freelance": "Freiberuflich",
    "availability-open_projects": "Offen für Projekte",
    "availability-temporarily_unavailable": "Vorübergehend nicht verfügbar",
    "role-talent": "Talent",
    "role-organization": "Organisation",
    "role-freelancer": "Freiberufler",
    "role-student": "Student",
    "role-team": "Team",
    "goal-money": "Geld verdienen",
    "goal-experience": "Erfahrung sammeln",
    "goal-network": "Netzwerk aufbauen",
    "goal-learn": "Neue Fähigkeiten lernen",
    "goal-hire": "Talente einstellen",
    "goal-outsource_tasks": "Aufgaben auslagern"
  },
  pt: {
    "header-title": "Perfil",
    "header-description": "Gerencie seus dados pessoais e configurações de perfil",
    "verified-badge": "Conta verificada",
    "label-first-name": "Nome:",
    "label-last-name": "Sobrenome:",
    "label-email": "E-mail:",
    "label-birthday": "Data de nascimento:",
    "label-country": "País:",
    "label-phone": "Número de telefone:",
    "label-industry": "Setor:",
    "label-speciality": "Especialidade:",
    "label-headline": "Título profissional:",
    "label-availability": "Disponibilidade:",
    "label-role": "Status:",
    "label-goals": "Objetivos:",
    "btn-update-info": "Atualizar informações",
    "notice-info": "Essas informações <strong>não são usadas no seu currículo</strong>. Elas nos ajudam a melhorar sua experiência e oferecer um serviço mais personalizado.",
    "placeholder-country": "Selecionar país",
    "placeholder-industry": "Selecionar setor",
    "placeholder-speciality": "Selecionar especialidade",
    "placeholder-availability": "Selecionar disponibilidade",
    "placeholder-role": "Selecionar seu status",
    "placeholder-goals": "Selecionar seu objetivo",
    "availability-full_time": "Tempo integral",
    "availability-part_time": "Meio período",
    "availability-freelance": "Freelance",
    "availability-open_projects": "Aberto a projetos",
    "availability-temporarily_unavailable": "Temporariamente indisponível",
    "role-talent": "Talento",
    "role-organization": "Organização",
    "role-freelancer": "Freelancer",
    "role-student": "Estudante",
    "role-team": "Equipe",
    "goal-money": "Ganhar dinheiro",
    "goal-experience": "Adquirir experiência",
    "goal-network": "Construir rede de contatos",
    "goal-learn": "Aprender novas habilidades",
    "goal-hire": "Contratar talentos",
    "goal-outsource_tasks": "Terceirizar tarefas"
  },
  ja: {
    "header-title": "プロフィール",
    "header-description": "個人情報とプロフィール設定を管理します",
    "verified-badge": "認証済みアカウント",
    "label-first-name": "名：",
    "label-last-name": "姓：",
    "label-email": "メールアドレス：",
    "label-birthday": "生年月日：",
    "label-country": "国：",
    "label-phone": "電話番号：",
    "label-industry": "業界：",
    "label-speciality": "専門分野：",
    "label-headline": "職種：",
    "label-availability": "稼働状況：",
    "label-role": "ステータス：",
    "label-goals": "目標：",
    "btn-update-info": "情報を更新",
    "notice-info": "この情報は<strong>履歴書には使用されません</strong>。より良い体験と個別のサービスを提供するために役立ちます。",
    "placeholder-country": "国を選択",
    "placeholder-industry": "業界を選択",
    "placeholder-speciality": "専門分野を選択",
    "placeholder-availability": "稼働状況を選択",
    "placeholder-role": "ステータスを選択",
    "placeholder-goals": "目標を選択",
    "availability-full_time": "正社員",
    "availability-part_time": "パートタイム",
    "availability-freelance": "フリーランス",
    "availability-open_projects": "プロジェクト受付中",
    "availability-temporarily_unavailable": "一時的に利用不可",
    "role-talent": "タレント",
    "role-organization": "組織",
    "role-freelancer": "フリーランサー",
    "role-student": "学生",
    "role-team": "チーム",
    "goal-money": "収入を得る",
    "goal-experience": "経験を積む",
    "goal-network": "人脈を作る",
    "goal-learn": "新しいスキルを学ぶ",
    "goal-hire": "人材を採用する",
    "goal-outsource_tasks": "タスクを外注する"
  },
  ru: {
    "header-title": "Профиль",
    "header-description": "Управляйте своими личными данными и настройками профиля",
    "verified-badge": "Подтверждённый аккаунт",
    "label-first-name": "Имя:",
    "label-last-name": "Фамилия:",
    "label-email": "Электронная почта:",
    "label-birthday": "Дата рождения:",
    "label-country": "Страна:",
    "label-phone": "Номер телефона:",
    "label-industry": "Отрасль:",
    "label-speciality": "Специализация:",
    "label-headline": "Должность:",
    "label-availability": "Доступность:",
    "label-role": "Статус:",
    "label-goals": "Цели:",
    "btn-update-info": "Обновить информацию",
    "notice-info": "Эта информация <strong>не используется для вашего резюме</strong>. Она помогает нам улучшить ваш опыт и предоставить более персонализированный сервис.",
    "placeholder-country": "Выберите страну",
    "placeholder-industry": "Выберите отрасль",
    "placeholder-speciality": "Выберите специализацию",
    "placeholder-availability": "Выберите доступность",
    "placeholder-role": "Выберите статус",
    "placeholder-goals": "Выберите цель",
    "availability-full_time": "Полная занятость",
    "availability-part_time": "Частичная занятость",
    "availability-freelance": "Фриланс",
    "availability-open_projects": "Открыт для проектов",
    "availability-temporarily_unavailable": "Временно недоступен",
    "role-talent": "Талант",
    "role-organization": "Организация",
    "role-freelancer": "Фрилансер",
    "role-student": "Студент",
    "role-team": "Команда",
    "goal-money": "Заработать деньги",
    "goal-experience": "Получить опыт",
    "goal-network": "Расширить сеть контактов",
    "goal-learn": "Изучить новые навыки",
    "goal-hire": "Нанять таланты",
    "goal-outsource_tasks": "Аутсорсинг задач"
  }
};
function UserForm_translatePage(lang) {
  const t = UserForm_translations[lang] || UserForm_translations['en'];

  const headerTitle = document.querySelector('.cvb-page-title h2');
  if (headerTitle) headerTitle.textContent = t["header-title"];

  const headerDesc = document.querySelector('.cvb-page-title p');
  if (headerDesc) headerDesc.textContent = t["header-description"];

  document.querySelector('label[for="userFirstName"]').textContent = t["label-first-name"];
  document.querySelector('label[for="userLastName"]').textContent = t["label-last-name"];
  document.querySelector('label[for="userEmail"]').textContent = t["label-email"];
  document.querySelector('label[for="userBirthday"]').textContent = t["label-birthday"];
  document.querySelector('label[for="userCountry"]').textContent = t["label-country"];
  document.querySelector('label[for="userPhone"]').textContent = t["label-phone"];
  document.querySelector('label[for="userIndustrySelect"]').textContent = t["label-industry"];
  document.querySelector('label[for="userspecialitySelect"]').textContent = t["label-speciality"];
  document.querySelector('label[for="userHeadline"]').textContent = t["label-headline"];
  document.querySelector('label[for="userAvailability"]').textContent = t["label-availability"];
  document.querySelector('label[for="userRole"]').textContent = t["label-role"];
  document.querySelector('label[for="userGoals"]').textContent = t["label-goals"];

  const countrySelect = document.getElementById('userCountry');
  if (countrySelect && countrySelect.options[0]) {
    countrySelect.options[0].textContent = t["placeholder-country"];
  }
  
  const industrySelect = document.getElementById('userIndustrySelect');
  if (industrySelect && industrySelect.options[0]) {
    industrySelect.options[0].textContent = t["placeholder-industry"];
  }
  
  const specialitySelect = document.getElementById('userspecialitySelect');
  if (specialitySelect && specialitySelect.options[0]) {
    specialitySelect.options[0].textContent = t["placeholder-speciality"];
  }
  
  const availabilitySelect = document.getElementById('userAvailability');
  if (availabilitySelect) {
    for (let i = 0; i < availabilitySelect.options.length; i++) {
      const option = availabilitySelect.options[i];
      if (option.value === "") {
        option.textContent = t["placeholder-availability"];
      } else {
        option.textContent = t[`availability-${option.value}`] || option.textContent;
      }
    }
  }
  
  const roleSelect = document.getElementById('userRole');
  if (roleSelect) {
    for (let i = 0; i < roleSelect.options.length; i++) {
      const option = roleSelect.options[i];
      if (option.value === "") {
        option.textContent = t["placeholder-role"];
      } else {
        option.textContent = t[`role-${option.value.toLowerCase()}`] || option.textContent;
      }
    }
  }
  
  const goalsSelect = document.getElementById('userGoals');
  if (goalsSelect) {
    for (let i = 0; i < goalsSelect.options.length; i++) {
      const option = goalsSelect.options[i];
      if (option.value === "") {
        option.textContent = t["placeholder-goals"];
      } else {
        option.textContent = t[`goal-${option.value}`] || option.textContent;
      }
    }
  }

  const selectedIndustry = document.getElementById("userIndustrySelect")?.value;
  const selectedspeciality = document.getElementById("userspecialitySelect")?.value;

  loadIndustries(selectedIndustry);
  loadSpecialties(selectedIndustry, selectedspeciality);

  const updateBtn = document.getElementById('updateUserNameBtn');
  if (updateBtn) {
    updateBtn.innerHTML = `<i class="ri-save-3-line"></i> ${t["btn-update-info"]}`;
  }

  const notice = document.getElementById('cvb-user-info-noticeInfos');
  if (notice) notice.innerHTML = `<i class="ri-information-line"></i> ${t["notice-info"]}`;
}

function UserForm_translateHistory(lang) {
  const t = UserForm_translationsHistory[lang] || UserForm_translationsHistory['en'];

  const pageTitle = document.getElementById('history-page-title');
  if (pageTitle) pageTitle.textContent = t["page-title"];

  const pageDesc = document.getElementById('history-page-description');
  if (pageDesc) pageDesc.textContent = t["page-description"];

  const searchInput = document.getElementById('consumption-search');
  if (searchInput) searchInput.placeholder = t["filter-search"];

  const startDate = document.getElementById('consumption-start-date');
  if (startDate) startDate.placeholder = t["filter-from"];

  const endDate = document.getElementById('consumption-end-date');
  if (endDate) endDate.placeholder = t["filter-to"];

  const filterBtn = document.getElementById('consumption-filter-btn');
  if (filterBtn) filterBtn.textContent = t["filter-btn"];

  const historyTitle = document.querySelector('.cvb-usertab-tableTitle');
  if (historyTitle) historyTitle.textContent = t["history-title"];

  const kpiAvailable = document.getElementById("kpi-label-available");
  if (kpiAvailable) kpiAvailable.textContent = t["kpi-available"];

  const kpiUsed = document.getElementById("kpi-label-used");
  if (kpiUsed) kpiUsed.textContent = t["kpi-used"];

  const kpiLast = document.getElementById("kpi-label-last");
  if (kpiLast) kpiLast.textContent = t["kpi-last"];

  const th = document.querySelectorAll('#historyTab thead th');
  if (th.length >= 3) {
    th[0].textContent = t["table-coins"];
    th[1].textContent = t["table-description"];
    th[2].textContent = t["table-date"];
  }

  const emptyGraph = document.querySelector('.cvb-history-graphEmpty');
  if (emptyGraph) {
    emptyGraph.textContent = t["empty-history-chart"];
  }

  const tbody = document.getElementById('cvb-history-body');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  if (rows.length === 1) {
    const cell = rows[0].querySelector('td[colspan]');
    if (cell) {
      cell.textContent = t["no-history"];
    }
  }
  
}

function UserForm_translatePay(lang) {
  const t = UserForm_translationsPay[lang] || UserForm_translationsPay['en'];

  const titleEl = document.getElementById('userPayTitle');
  if (titleEl) titleEl.textContent = t["title"];

  const descEl = document.getElementById('userPayDescription');
  if (descEl) descEl.textContent = t["description"];
  
  document.querySelector('label[for="coinsPack"]').textContent = t["label-select-pack"];
  document.querySelector('label[for="customCoins"]').textContent = t["label-custom-coins"];
  document.querySelector('label[for="paymentMethod"]').textContent = t["label-payment-method"];
  document.getElementById('purchaseCoinsBtn').innerHTML =
    `<i class="ri-shopping-cart-2-line"></i> ${t["btn-purchase"]}`;

  const tableTitle = document.getElementById('coinsOrdersTableTitle');
  if (tableTitle) tableTitle.textContent = t["table-order-title"];
  
  const th = document.querySelectorAll('#coinsOrdersTable thead th');
  if (th.length >= 11) {
    th[0].textContent = t["table-order-date"];
    th[1].textContent = t["table-status"];
    th[2].textContent = t["table-description"];
    th[3].textContent = t["table-price"];
    th[4].textContent = t["table-method"];
    th[5].textContent = t["table-payment-address"];
    th[6].textContent = t["table-instructions"];
    th[7].textContent = t["table-deadline"];
    th[8].textContent = t["table-reference"];
    th[9].textContent = t["table-payment-date"];
    th[10].textContent = t["table-proof"];
    th[11].textContent = t["table-confirmation"];
  }

  if (auth.currentUser) {
    loadUserOrdersHistory(auth.currentUser.uid);
  }

  const tbody = document.getElementById('coinsOrdersTablebody');
  if (!tbody) return;
  const rows = tbody.querySelectorAll('tr');
  if (rows.length === 1) {
    const cell = rows[0].querySelector('td[colspan]');
    if (cell) {
      cell.textContent = t["no-orders"];
    }
  }

  const availableMethods = document.querySelector('.cvb-payment-methods p');
  if (availableMethods) availableMethods.textContent = t["available-methods"];

  const note = document.querySelector('.cvb-order-note');
  if (note) note.innerHTML = `<i class="ri-time-line"></i> ${t["note-orders"]}`;

  const secure = document.getElementById('cvb-user-info-noticePay');
  if (secure) {
    secure.innerHTML = `
      <i class="ri-shield-check-line"></i>
      <strong>${t["secure-title"]}</strong><br>
      ${t["secure-line1"]}<br>
      ${t["secure-line2"]}<br>
      ${t["secure-line3"]}<br>
      <em>${t["secure-line4"]}</em>
    `;
  }
}

const UserForm_translationsAffiliation = {
  en: {
    "hero-title": "Affiliate Program",
    "hero-subtitle": "Invite. Engage. Earn.",
    "hero-desc": "Earn coins when users join, activate, and complete actions through your referral link.",

    "btn-share": "Share Link",

    "link-title": "Your Referral Link",
    "share-on": "Share on",

    "kpi-invites": "Accepted Invites",
    "kpi-conversions": "Affiliate Conversions",
    "kpi-confirmed": "Confirmed Rewards",

    "earn-title": "How You Earn",

    "step1-title": "Complete Actions",
    "step1-desc": "Earn coins by completing your profile, creating CVs, and applying",

    "step2-title": "Invite Users",
    "step2-desc": "Share your referral link with your network",

    "step3-title": "They Join",
    "step3-desc": "You earn when they create an account",

    "step4-title": "They Activate",
    "step4-desc": "Earn more when they complete actions on Operlya",

    "step5-title": "Scale Earnings",
    "step5-desc": "Increase rewards as your network grows",

    "progress-title": "Your Progress",
    "benefits-title": "Benefits",
    "btn-levels": "View All Levels",

    "levels": {
      "operator": "Operator Affiliate",
      "builder": "Builder Affiliate",
      "architect": "Architect Affiliate",
      "elite": "Elite Affiliate",
      "core": "Core Affiliate"
    },

    "benefits": {
      "operator": [
        "+10% referral reward boost",
        "Basic CV visibility boost"
      ],
      "builder": [
        "+12% referral rewards",
        "Improved CV ranking in search",
        "Faster reward confirmation"
      ],
      "architect": [
        "+15% referral rewards",
        "Priority matching in opportunities",
        "Profile highlighted in searches"
      ],
      "elite": [
        "+20% referral rewards",
        "Elite badge visibility boost",
        "Early access to platform features"
      ],
      "core": [
        "+25% referral rewards",
        "Maximum visibility boost",
        "Core network status (top ranking layer)"
      ]
    },

    "progress": {
      "remaining": "{coins} coins left to unlock {level}",
      "max": "Max Level Reached"
    },

    "chart-title": "Earned Coins Overview",
    "chart-sub": "Last 360 days",

    "chart": {
      "your": "Your Earnings",
      "referral": "Referral Earnings",
      "empty": "No earnings data yet"
    },

    "ref-title": "Top Referrers",
    "ref-sub": "Network ranking",

    "referrers": {
      "loading": "Loading...",
      "empty": "No referrals yet",
      "failed": "Failed to load",
      "rank": "Rank #{rank}",
      "coins": "{coins} coins"
    },

    "rewards": {
      "title": "User Rewards",
      "sub": "Latest activity",
      "loading": "Loading rewards...",
      "empty": "No rewards yet",
      "failed": "Failed to load rewards",
      "defaultTitle": "Reward"
    },

    "badges-header": "All Affiliate Levels",

    "badges": {
      "operator": {
        "title": "Operator",
        "desc": "Enter the system. Start earning from your first actions."
      },
      "builder": {
        "title": "Builder",
        "desc": "Turn activity into growth. Expand your referral engine."
      },
      "architect": {
        "title": "Architect",
        "desc": "Design influence. Structure a high-performing network."
      },
      "elite": {
        "title": "Elite",
        "desc": "Unlock premium rewards. Operate at top-tier performance."
      },
      "core": {
        "title": "Core",
        "desc": "Inner circle access. Shape the future of the ecosystem."
      }
    }
  },

  fr: {
    "hero-title": "Programme d'affiliation",
    "hero-subtitle": "Invitez. Engagez. Gagnez.",
    "hero-desc": "Gagnez des pièces lorsque des utilisateurs rejoignent, s'activent et complètent des actions via votre lien.",

    "btn-share": "Partager le lien",

    "link-title": "Votre lien de parrainage",
    "share-on": "Partager sur",

    "kpi-invites": "Invitations acceptées",
    "kpi-conversions": "Conversions d'affiliation",
    "kpi-confirmed": "Récompenses confirmées",

    "earn-title": "Comment vous gagnez",

    "step1-title": "Compléter des actions",
    "step1-desc": "Gagnez des pièces en complétant votre profil, en créant des CVs et en postulant",

    "step2-title": "Inviter des utilisateurs",
    "step2-desc": "Partagez votre lien avec votre réseau",

    "step3-title": "Ils rejoignent",
    "step3-desc": "Vous gagnez quand ils créent un compte",

    "step4-title": "Ils s'activent",
    "step4-desc": "Gagnez plus quand ils complètent des actions sur Operlya",

    "step5-title": "Augmenter les gains",
    "step5-desc": "Augmentez vos récompenses avec votre réseau",

    "progress-title": "Votre progression",
    "benefits-title": "Avantages",
    "btn-levels": "Voir tous les niveaux",

    "levels": {
      "operator": "Affilié Opérateur",
      "builder": "Affilié Constructeur",
      "architect": "Affilié Architecte",
      "elite": "Affilié Élite",
      "core": "Affilié Core"
    },

    "benefits": {
      "operator": [
        "+10% de récompense de parrainage",
        "Visibilité CV de base"
      ],
      "builder": [
        "+12% de récompenses de parrainage",
        "Meilleur classement CV dans les recherches",
        "Confirmation plus rapide des récompenses"
      ],
      "architect": [
        "+15% de récompenses de parrainage",
        "Priorité dans les opportunités",
        "Profil mis en avant dans les recherches"
      ],
      "elite": [
        "+20% de récompenses de parrainage",
        "Visibilité du badge Élite",
        "Accès anticipé aux fonctionnalités"
      ],
      "core": [
        "+25% de récompenses de parrainage",
        "Visibilité maximale",
        "Statut réseau Core (top classement)"
      ]
    },

    "progress": {
      "remaining": "{coins} pièces restantes pour débloquer {level}",
      "max": "Niveau max atteint"
    },

    "chart-title": "Aperçu des pièces gagnées",
    "chart-sub": "360 derniers jours",

    "chart": {
      "your": "Vos gains",
      "referral": "Gains de parrainage",
      "empty": "Aucune donnée pour le moment"
    },

    "ref-title": "Top parrains",
    "ref-sub": "Classement réseau",

    "referrers": {
      "loading": "Chargement...",
      "empty": "Aucune invitation pour le moment",
      "failed": "Échec du chargement",
      "rank": "Rang #{rank}",
      "coins": "{coins} pièces"
    },

    "rewards": {
      "title": "Récompenses utilisateur",
      "sub": "Dernière activité",
      "loading": "Chargement des récompenses...",
      "empty": "Aucune récompense",
      "failed": "Échec du chargement des récompenses",
      "defaultTitle": "Récompense"
    },

    "badges-header": "Tous les niveaux d'affiliation",

    "badges": {
      "operator": {
        "title": "Opérateur",
        "desc": "Entrez dans le système. Commencez à gagner dès vos premières actions."
      },
      "builder": {
        "title": "Constructeur",
        "desc": "Transformez l’activité en croissance. Développez votre réseau."
      },
      "architect": {
        "title": "Architecte",
        "desc": "Structurez votre influence. Créez un réseau performant."
      },
      "elite": {
        "title": "Élite",
        "desc": "Débloquez des récompenses premium. Atteignez un niveau supérieur."
      },
      "core": {
        "title": "Core",
        "desc": "Accès cercle fermé. Façonnez l’avenir de l’écosystème."
      }
    }
  },

  ar: {
    "hero-title": "برنامج الإحالة",
    "hero-subtitle": "ادعُ. تفاعل. اربح.",
    "hero-desc": "اربح عملات عندما ينضم المستخدمون ويفعلون ويكملون الإجراءات عبر رابط الإحالة الخاص بك.",

    "btn-share": "مشاركة الرابط",

    "link-title": "رابط الإحالة الخاص بك",
    "share-on": "مشاركة عبر",

    "kpi-invites": "الدعوات المقبولة",
    "kpi-conversions": "تحويلات الإحالة",
    "kpi-confirmed": "المكافآت المؤكدة",

    "earn-title": "كيف تربح",

    "step1-title": "إكمال الإجراءات",
    "step1-desc": "اربح عملات بإكمال ملفك الشخصي، وإنشاء السير الذاتية، والتقديم",

    "step2-title": "دعوة المستخدمين",
    "step2-desc": "شارك رابط الإحالة الخاص بك مع شبكتك",

    "step3-title": "انضمامهم",
    "step3-desc": "تربح عندما يقومون بإنشاء حساب",

    "step4-title": "تفعيلهم",
    "step4-desc": "تربح أكثر عندما يكملون إجراءات على Operlya",

    "step5-title": "توسيع الأرباح",
    "step5-desc": "زد المكافآت مع نمو شبكتك",

    "progress-title": "تقدمك",
    "benefits-title": "المزايا",
    "btn-levels": "عرض جميع المستويات",

    "levels": {
      "operator": "مسوق تابع مبتدئ",
      "builder": "مسوق تابع منشئ",
      "architect": "مسوق تابع مهندس",
      "elite": "مسوق تابع نخبة",
      "core": "مسوق تابع أساسي"
    },

    "benefits": {
      "operator": [
        "+10٪ مكافأة إحالة",
        "تعزيز أساسي لظهور السيرة الذاتية"
      ],
      "builder": [
        "+12٪ مكافآت إحالة",
        "ترتيب أفضل للسيرة الذاتية في البحث",
        "تأكيد أسرع للمكافآت"
      ],
      "architect": [
        "+15٪ مكافآت إحالة",
        "أولوية في الفرص",
        "إبراز الملف الشخصي في البحوث"
      ],
      "elite": [
        "+20٪ مكافآت إحالة",
        "تعزيز ظهور شارة النخبة",
        "وصول مبكر لميزات المنصة"
      ],
      "core": [
        "+25٪ مكافآت إحالة",
        "تعزيز ظهور أقصى",
        "حالة الشبكة الأساسية (أعلى طبقة ترتيب)"
      ]
    },

    "progress": {
      "remaining": "{coins} عملة متبقية لفتح {level}",
      "max": "تم الوصول إلى المستوى الأقصى"
    },

    "chart-title": "نظرة عامة على العملات المربوحة",
    "chart-sub": "آخر 360 يومًا",

    "chart": {
      "your": "أرباحك",
      "referral": "أرباح الإحالة",
      "empty": "لا توجد بيانات أرباح بعد"
    },

    "ref-title": "أفضل المحيلين",
    "ref-sub": "ترتيب الشبكة",

    "referrers": {
      "loading": "جارٍ التحميل...",
      "empty": "لا توجد إحالات بعد",
      "failed": "فشل في التحميل",
      "rank": "المرتبة #{rank}",
      "coins": "{coins} عملة"
    },

    "rewards": {
      "title": "مكافآت المستخدم",
      "sub": "آخر النشاطات",
      "loading": "جارٍ تحميل المكافآت...",
      "empty": "لا توجد مكافآت بعد",
      "failed": "فشل في تحميل المكافآت",
      "defaultTitle": "مكافأة"
    }
  },

  // Spanish (esp)
  es: {
    "hero-title": "Programa de Afiliados",
    "hero-subtitle": "Invita. Involucra. Gana.",
    "hero-desc": "Gana monedas cuando los usuarios se unan, activen y completen acciones a través de tu enlace de referencia.",

    "btn-share": "Compartir Enlace",

    "link-title": "Tu Enlace de Referencia",
    "share-on": "Compartir en",

    "kpi-invites": "Invitaciones Aceptadas",
    "kpi-conversions": "Conversiones de Afiliado",
    "kpi-confirmed": "Recompensas Confirmadas",

    "earn-title": "Cómo Ganas",

    "step1-title": "Completa Acciones",
    "step1-desc": "Gana monedas completando tu perfil, creando CVs y postulando",

    "step2-title": "Invita Usuarios",
    "step2-desc": "Comparte tu enlace de referencia con tu red",

    "step3-title": "Ellos se Unen",
    "step3-desc": "Ganas cuando crean una cuenta",

    "step4-title": "Ellos se Activan",
    "step4-desc": "Gana más cuando completen acciones en Operlya",

    "step5-title": "Escala tus Ganancias",
    "step5-desc": "Aumenta las recompensas a medida que tu red crece",

    "progress-title": "Tu Progreso",
    "benefits-title": "Beneficios",
    "btn-levels": "Ver Todos los Niveles",

    "levels": {
      "operator": "Afiliado Operador",
      "builder": "Afiliado Constructor",
      "architect": "Afiliado Arquitecto",
      "elite": "Afiliado Élite",
      "core": "Afiliado Core"
    },

    "benefits": {
      "operator": [
        "+10% de mejora en recompensas por referencia",
        "Mejora básica de visibilidad del CV"
      ],
      "builder": [
        "+12% de recompensas por referencia",
        "Mejor clasificación del CV en búsquedas",
        "Confirmación más rápida de recompensas"
      ],
      "architect": [
        "+15% de recompensas por referencia",
        "Prioridad en emparejamientos de oportunidades",
        "Perfil destacado en búsquedas"
      ],
      "elite": [
        "+20% de recompensas por referencia",
        "Mejora de visibilidad con insignia Élite",
        "Acceso anticipado a funciones de la plataforma"
      ],
      "core": [
        "+25% de recompensas por referencia",
        "Mejora máxima de visibilidad",
        "Estado de red Core (capa de clasificación superior)"
      ]
    },

    "progress": {
      "remaining": "{coins} monedas restantes para desbloquear {level}",
      "max": "Nivel Máximo Alcanzado"
    },

    "chart-title": "Resumen de Monedas Ganadas",
    "chart-sub": "Últimos 360 días",

    "chart": {
      "your": "Tus Ganancias",
      "referral": "Ganancias por Referencias",
      "empty": "Aún no hay datos de ganancias"
    },

    "ref-title": "Mejores Referentes",
    "ref-sub": "Clasificación de la red",

    "referrers": {
      "loading": "Cargando...",
      "empty": "Aún no hay referencias",
      "failed": "Error al cargar",
      "rank": "Puesto #{rank}",
      "coins": "{coins} monedas"
    },

    "rewards": {
      "title": "Recompensas de Usuario",
      "sub": "Actividad reciente",
      "loading": "Cargando recompensas...",
      "empty": "Aún no hay recompensas",
      "failed": "Error al cargar recompensas",
      "defaultTitle": "Recompensa"
    }
  },

  // Chinese (zh)
  zh: {
    "hero-title": "联盟计划",
    "hero-subtitle": "邀请。互动。赚钱。",
    "hero-desc": "当用户通过您的推荐链接加入、激活并完成操作时，即可赚取金币。",

    "btn-share": "分享链接",

    "link-title": "您的推荐链接",
    "share-on": "分享至",

    "kpi-invites": "已接受的邀请",
    "kpi-conversions": "联盟转化",
    "kpi-confirmed": "已确认奖励",

    "earn-title": "如何赚钱",

    "step1-title": "完成任务",
    "step1-desc": "通过完善个人资料、创建简历和申请职位来赚取金币",

    "step2-title": "邀请用户",
    "step2-desc": "与您的社交网络分享推荐链接",

    "step3-title": "他们加入",
    "step3-desc": "当他们创建账户时，您即可获得收益",

    "step4-title": "他们激活",
    "step4-desc": "当他们在Operlya上完成更多操作时，您将获得更多收益",

    "step5-title": "扩展收益",
    "step5-desc": "随着您的网络规模增长，增加奖励",

    "progress-title": "您的进度",
    "benefits-title": "权益",
    "btn-levels": "查看所有等级",

    "levels": {
      "operator": "操作员联盟",
      "builder": "建设者联盟",
      "architect": "架构师联盟",
      "elite": "精英联盟",
      "core": "核心联盟"
    },

    "benefits": {
      "operator": [
        "+10% 推荐奖励加成",
        "基础简历可见度提升"
      ],
      "builder": [
        "+12% 推荐奖励",
        "提升简历在搜索中的排名",
        "更快的奖励确认"
      ],
      "architect": [
        "+15% 推荐奖励",
        "机会匹配优先级",
        "搜索结果中个人资料高亮"
      ],
      "elite": [
        "+20% 推荐奖励",
        "精英徽章可见度提升",
        "平台功能优先体验"
      ],
      "core": [
        "+25% 推荐奖励",
        "最高可见度提升",
        "核心网络状态（顶级排名层）"
      ]
    },

    "progress": {
      "remaining": "还需 {coins} 枚金币解锁 {level}",
      "max": "已达到最高等级"
    },

    "chart-title": "赚取金币概览",
    "chart-sub": "最近 360 天",

    "chart": {
      "your": "您的收益",
      "referral": "推荐收益",
      "empty": "暂无收益数据"
    },

    "ref-title": "顶级推荐人",
    "ref-sub": "网络排名",

    "referrers": {
      "loading": "加载中...",
      "empty": "暂无推荐",
      "failed": "加载失败",
      "rank": "排名 #{rank}",
      "coins": "{coins} 枚金币"
    },

    "rewards": {
      "title": "用户奖励",
      "sub": "最新动态",
      "loading": "加载奖励中...",
      "empty": "暂无奖励",
      "failed": "加载奖励失败",
      "defaultTitle": "奖励"
    }
  },

  // German (de)
  de: {
    "hero-title": "Partnerprogramm",
    "hero-subtitle": "Einladen. Binden. Verdienen.",
    "hero-desc": "Verdiene Münzen, wenn Benutzer über deinen Empfehlungslink beitreten, sich aktivieren und Aktionen abschließen.",

    "btn-share": "Link teilen",

    "link-title": "Dein Empfehlungslink",
    "share-on": "Teilen auf",

    "kpi-invites": "Akzeptierte Einladungen",
    "kpi-conversions": "Partner-Konversionen",
    "kpi-confirmed": "Bestätigte Belohnungen",

    "earn-title": "Wie du verdienst",

    "step1-title": "Aktionen abschließen",
    "step1-desc": "Verdiene Münzen durch Vervollständigung deines Profils, Erstellen von Lebensläufen und Bewerbungen",

    "step2-title": "Benutzer einladen",
    "step2-desc": "Teile deinen Empfehlungslink mit deinem Netzwerk",

    "step3-title": "Sie treten bei",
    "step3-desc": "Du verdienst, wenn sie ein Konto erstellen",

    "step4-title": "Sie aktivieren sich",
    "step4-desc": "Verdiene mehr, wenn sie Aktionen auf Operlya abschließen",

    "step5-title": "Skaliere deine Einnahmen",
    "step5-desc": "Erhöhe die Belohnungen, während dein Netzwerk wächst",

    "progress-title": "Dein Fortschritt",
    "benefits-title": "Vorteile",
    "btn-levels": "Alle Stufen anzeigen",

    "levels": {
      "operator": "Operator-Partner",
      "builder": "Builder-Partner",
      "architect": "Architect-Partner",
      "elite": "Elite-Partner",
      "core": "Core-Partner"
    },

    "benefits": {
      "operator": [
        "+10% Empfehlungsprämie",
        "Grundlegende Lebenslauf-Sichtbarkeit"
      ],
      "builder": [
        "+12% Empfehlungsprämien",
        "Verbessertes Lebenslauf-Ranking in der Suche",
        "Schnellere Prämienbestätigung"
      ],
      "architect": [
        "+15% Empfehlungsprämien",
        "Priorität bei Chancen-Matching",
        "Profil in Suchergebnissen hervorgehoben"
      ],
      "elite": [
        "+20% Empfehlungsprämien",
        "Elite-Abzeichen Sichtbarkeitsboost",
        "Früher Zugriff auf Plattformfunktionen"
      ],
      "core": [
        "+25% Empfehlungsprämien",
        "Maximale Sichtbarkeitsverbesserung",
        "Core-Netzwerkstatus (Top-Ranking-Ebene)"
      ]
    },

    "progress": {
      "remaining": "Noch {coins} Münzen, um {level} freizuschalten",
      "max": "Maximale Stufe erreicht"
    },

    "chart-title": "Übersicht der verdienten Münzen",
    "chart-sub": "Letzte 360 Tage",

    "chart": {
      "your": "Deine Einnahmen",
      "referral": "Empfehlungseinnahmen",
      "empty": "Noch keine Einnahmedaten"
    },

    "ref-title": "Top-Empfehler",
    "ref-sub": "Netzwerk-Ranking",

    "referrers": {
      "loading": "Laden...",
      "empty": "Noch keine Empfehlungen",
      "failed": "Laden fehlgeschlagen",
      "rank": "Rang #{rank}",
      "coins": "{coins} Münzen"
    },

    "rewards": {
      "title": "Benutzerbelohnungen",
      "sub": "Letzte Aktivität",
      "loading": "Lade Belohnungen...",
      "empty": "Noch keine Belohnungen",
      "failed": "Laden der Belohnungen fehlgeschlagen",
      "defaultTitle": "Belohnung"
    }
  },

  // Portuguese (pt)
  pt: {
    "hero-title": "Programa de Afiliados",
    "hero-subtitle": "Convide. Engaje. Ganhe.",
    "hero-desc": "Ganhe moedas quando usuários entrarem, ativarem e completarem ações através do seu link de referência.",

    "btn-share": "Compartilhar Link",

    "link-title": "Seu Link de Indicação",
    "share-on": "Compartilhar em",

    "kpi-invites": "Convites Aceitos",
    "kpi-conversions": "Conversões de Afiliado",
    "kpi-confirmed": "Recompensas Confirmadas",

    "earn-title": "Como Você Ganha",

    "step1-title": "Complete Ações",
    "step1-desc": "Ganhe moedas completando seu perfil, criando CVs e se candidatando",

    "step2-title": "Convide Usuários",
    "step2-desc": "Compartilhe seu link de indicação com sua rede",

    "step3-title": "Eles Entram",
    "step3-desc": "Você ganha quando eles criam uma conta",

    "step4-title": "Eles Ativam",
    "step4-desc": "Ganhe mais quando eles completarem ações no Operlya",

    "step5-title": "Aumente seus Ganhos",
    "step5-desc": "Aumente as recompensas à medida que sua rede cresce",

    "progress-title": "Seu Progresso",
    "benefits-title": "Benefícios",
    "btn-levels": "Ver Todos os Níveis",

    "levels": {
      "operator": "Afiliado Operador",
      "builder": "Afiliado Construtor",
      "architect": "Afiliado Arquiteto",
      "elite": "Afiliado Élite",
      "core": "Afiliado Core"
    },

    "benefits": {
      "operator": [
        "+10% de bônus em recompensas de indicação",
        "Aumento básico de visibilidade do CV"
      ],
      "builder": [
        "+12% de recompensas de indicação",
        "Melhor classificação do CV em buscas",
        "Confirmação mais rápida de recompensas"
      ],
      "architect": [
        "+15% de recompensas de indicação",
        "Prioridade em correspondência de oportunidades",
        "Perfil destacado em buscas"
      ],
      "elite": [
        "+20% de recompensas de indicação",
        "Aumento de visibilidade com distintivo Élite",
        "Acesso antecipado a recursos da plataforma"
      ],
      "core": [
        "+25% de recompensas de indicação",
        "Aumento máximo de visibilidade",
        "Status de rede Core (camada de classificação superior)"
      ]
    },

    "progress": {
      "remaining": "{coins} moedas restantes para desbloquear {level}",
      "max": "Nível Máximo Atingido"
    },

    "chart-title": "Visão Geral das Moedas Ganhas",
    "chart-sub": "Últimos 360 dias",

    "chart": {
      "your": "Seus Ganhos",
      "referral": "Ganhos de Indicação",
      "empty": "Ainda não há dados de ganhos"
    },

    "ref-title": "Maiores Indicadores",
    "ref-sub": "Classificação da rede",

    "referrers": {
      "loading": "Carregando...",
      "empty": "Ainda não há indicações",
      "failed": "Falha ao carregar",
      "rank": "Posição #{rank}",
      "coins": "{coins} moedas"
    },

    "rewards": {
      "title": "Recompensas do Usuário",
      "sub": "Atividade recente",
      "loading": "Carregando recompensas...",
      "empty": "Ainda não há recompensas",
      "failed": "Falha ao carregar recompensas",
      "defaultTitle": "Recompensa"
    }
  },

  // Japanese (ja)
  ja: {
    "hero-title": "アフィリエイトプログラム",
    "hero-subtitle": "招待する。関与する。稼ぐ。",
    "hero-desc": "ユーザーがあなたの紹介リンクから登録、アクティベート、アクションを完了するとコインを獲得できます。",

    "btn-share": "リンクを共有",

    "link-title": "あなたの紹介リンク",
    "share-on": "共有する",

    "kpi-invites": "承認された招待",
    "kpi-conversions": "アフィリエイトコンバージョン",
    "kpi-confirmed": "確定報酬",

    "earn-title": "収入を得る方法",

    "step1-title": "アクションを完了する",
    "step1-desc": "プロフィールの完成、履歴書の作成、応募でコインを獲得",

    "step2-title": "ユーザーを招待する",
    "step2-desc": "あなたのネットワークと紹介リンクを共有する",

    "step3-title": "彼らが登録する",
    "step3-desc": "彼らがアカウントを作成すると収入が発生",

    "step4-title": "彼らがアクティベートする",
    "step4-desc": "彼らがOperlyaでアクションを完了するとより多くの収入を得る",

    "step5-title": "収益を拡大する",
    "step5-desc": "ネットワークの成長に合わせて報酬を増やす",

    "progress-title": "進捗状況",
    "benefits-title": "特典",
    "btn-levels": "全レベルを表示",

    "levels": {
      "operator": "オペレーターアフィリエイト",
      "builder": "ビルダーアフィリエイト",
      "architect": "アーキテクトアフィリエイト",
      "elite": "エリートアフィリエイト",
      "core": "コアアフィリエイト"
    },

    "benefits": {
      "operator": [
        "+10% 紹介報酬アップ",
        "基本的な履歴書の可視性向上"
      ],
      "builder": [
        "+12% 紹介報酬",
        "検索での履歴書ランキング向上",
        "より迅速な報酬確認"
      ],
      "architect": [
        "+15% 紹介報酬",
        "機会マッチングの優先度向上",
        "検索でプロフィールが強調表示"
      ],
      "elite": [
        "+20% 紹介報酬",
        "エリートバッジの可視性向上",
        "プラットフォーム機能の早期アクセス"
      ],
      "core": [
        "+25% 紹介報酬",
        "最大の可視性向上",
        "コアネットワークステータス（トップランキング層）"
      ]
    },

    "progress": {
      "remaining": "{level} アンロックまであと {coins} コイン",
      "max": "最大レベルに到達しました"
    },

    "chart-title": "獲得コイン概要",
    "chart-sub": "過去360日間",

    "chart": {
      "your": "あなたの収益",
      "referral": "紹介収益",
      "empty": "収益データはまだありません"
    },

    "ref-title": "トップ紹介者",
    "ref-sub": "ネットワークランキング",

    "referrers": {
      "loading": "読み込み中...",
      "empty": "紹介はまだありません",
      "failed": "読み込みに失敗しました",
      "rank": "ランク #{rank}",
      "coins": "{coins} コイン"
    },

    "rewards": {
      "title": "ユーザー報酬",
      "sub": "最新のアクティビティ",
      "loading": "報酬を読み込み中...",
      "empty": "まだ報酬はありません",
      "failed": "報酬の読み込みに失敗しました",
      "defaultTitle": "報酬"
    }
  },

  // Russian (ru)
  ru: {
    "hero-title": "Партнёрская программа",
    "hero-subtitle": "Приглашайте. Вовлекайте. Зарабатывайте.",
    "hero-desc": "Зарабатывайте монеты, когда пользователи присоединяются, активируются и выполняют действия по вашей реферальной ссылке.",

    "btn-share": "Поделиться ссылкой",

    "link-title": "Ваша реферальная ссылка",
    "share-on": "Поделиться в",

    "kpi-invites": "Принятые приглашения",
    "kpi-conversions": "Партнёрские конверсии",
    "kpi-confirmed": "Подтверждённые награды",

    "earn-title": "Как вы зарабатываете",

    "step1-title": "Выполняйте действия",
    "step1-desc": "Зарабатывайте монеты, заполняя профиль, создавая резюме и откликаясь на вакансии",

    "step2-title": "Приглашайте пользователей",
    "step2-desc": "Поделитесь своей реферальной ссылкой с вашим окружением",

    "step3-title": "Они присоединяются",
    "step3-desc": "Вы зарабатываете, когда они создают аккаунт",

    "step4-title": "Они активируются",
    "step4-desc": "Зарабатывайте больше, когда они выполняют действия на Operlya",

    "step5-title": "Масштабируйте заработок",
    "step5-desc": "Увеличивайте награды по мере роста вашей сети",

    "progress-title": "Ваш прогресс",
    "benefits-title": "Преимущества",
    "btn-levels": "Посмотреть все уровни",

    "levels": {
      "operator": "Оператор",
      "builder": "Строитель",
      "architect": "Архитектор",
      "elite": "Элита",
      "core": "Ядро"
    },

    "benefits": {
      "operator": [
        "+10% к реферальному вознаграждению",
        "Базовое повышение видимости резюме"
      ],
      "builder": [
        "+12% к реферальным вознаграждениям",
        "Улучшенный рейтинг резюме в поиске",
        "Более быстрое подтверждение наград"
      ],
      "architect": [
        "+15% к реферальным вознаграждениям",
        "Приоритет при поиске возможностей",
        "Выделение профиля в результатах поиска"
      ],
      "elite": [
        "+20% к реферальным вознаграждениям",
        "Повышение видимости знака «Элита»",
        "Ранний доступ к функциям платформы"
      ],
      "core": [
        "+25% к реферальным вознаграждениям",
        "Максимальное повышение видимости",
        "Статус ядра сети (верхний уровень рейтинга)"
      ]
    },

    "progress": {
      "remaining": "Осталось {coins} монет, чтобы открыть {level}",
      "max": "Достигнут максимальный уровень"
    },

    "chart-title": "Обзор заработанных монет",
    "chart-sub": "Последние 360 дней",

    "chart": {
      "your": "Ваш заработок",
      "referral": "Реферальный заработок",
      "empty": "Нет данных о заработке"
    },

    "ref-title": "Лучшие рефералы",
    "ref-sub": "Рейтинг сети",

    "referrers": {
      "loading": "Загрузка...",
      "empty": "Пока нет рефералов",
      "failed": "Не удалось загрузить",
      "rank": "Место #{rank}",
      "coins": "{coins} монет"
    },

    "rewards": {
      "title": "Награды пользователя",
      "sub": "Последние действия",
      "loading": "Загрузка наград...",
      "empty": "Пока нет наград",
      "failed": "Не удалось загрузить награды",
      "defaultTitle": "Награда"
    }
  }
};
function UserForm_translateAffiliation(lang) {
  const t = UserForm_translationsAffiliation[lang] || UserForm_translationsAffiliation.en;

  const hero = document.getElementById("cvb-hero-left");

  if (hero) {
    const h1 = hero.querySelector("h1");
    const h2 = hero.querySelector("h2");
    const p = hero.querySelector("p");

    if (h1) h1.textContent = t["hero-title"];
    if (h2) h2.textContent = t["hero-subtitle"];
    if (p) p.textContent = t["hero-desc"];
  }

  const shareBtn = document.getElementById("shareReferralBtn");
  if (shareBtn) {
    shareBtn.innerHTML = `<i class="ri-share-forward-line"></i> ${t["btn-share"]}`;
  }

  const heroCard = document.querySelector(".cvb-hero-card");
  if (heroCard) {
    const titles = heroCard.querySelectorAll("h4");

    if (titles[0]) titles[0].textContent = t["link-title"];
    if (titles[1]) titles[1].textContent = t["share-on"];
  }

  const kpis = document.querySelectorAll(".cvb-affiliation-stats .cvb-kpi-label");
  if (kpis[0]) kpis[0].textContent = t["kpi-invites"];
  if (kpis[1]) kpis[1].textContent = t["kpi-conversions"];
  if (kpis[2]) kpis[2].textContent = t["kpi-confirmed"];

  const earnCard = document.querySelector(".cvb-affiliation-grid .cvb-aff-card:first-child");
  if (earnCard) {
    const title = earnCard.querySelector("h3");
    if (title) title.textContent = t["earn-title"];

    const steps = earnCard.querySelectorAll(".cvb-aff-step");

    if (steps[0]) {
      steps[0].querySelector("h4").textContent = t["step1-title"];
      steps[0].querySelector("p").textContent = t["step1-desc"];
    }
    if (steps[1]) {
      steps[1].querySelector("h4").textContent = t["step2-title"];
      steps[1].querySelector("p").textContent = t["step2-desc"];
    }
    if (steps[2]) {
      steps[2].querySelector("h4").textContent = t["step3-title"];
      steps[2].querySelector("p").textContent = t["step3-desc"];
    }
    if (steps[3]) {
      steps[3].querySelector("h4").textContent = t["step4-title"];
      steps[3].querySelector("p").textContent = t["step4-desc"];
    }
    if (steps[4]) {
      steps[4].querySelector("h4").textContent = t["step5-title"];
      steps[4].querySelector("p").textContent = t["step5-desc"];
    }
  }

  const progressCard = document.querySelector(".cvb-affiliation-grid .cvb-aff-card:nth-child(2)");

  if (progressCard) {
    const progressTitle = progressCard.querySelector(".cvb-aff-progress-header h3");
    if (progressTitle) progressTitle.textContent = t["progress-title"];

    const benefitsTitle = progressCard.querySelector(".cvb-aff-benefits h4");
    if (benefitsTitle) benefitsTitle.textContent = t["benefits-title"];

    const btn = progressCard.querySelector(".cvb-aff-btn");
    if (btn) btn.textContent = t["btn-levels"];
  }

  const chartCard = document.querySelector(".cvb-aff-chart-card");
  if (chartCard) {
    const h3 = chartCard.querySelector("h3");
    const sub = chartCard.querySelector(".cvb-aff-muted");

    if (h3) h3.textContent = t["chart-title"];
    if (sub) sub.textContent = t["chart-sub"];
  }

  const refCard = document.querySelector(".cvb-aff-referrers-card");
  if (refCard) {
    const h3 = refCard.querySelector("h3");
    const sub = refCard.querySelector(".cvb-aff-muted");

    if (h3) h3.textContent = t["ref-title"];
    if (sub) sub.textContent = t["ref-sub"];
  }

  const rewardsCard = document.querySelector(".cvb-aff-rewards-card");
  if (rewardsCard) {
    const title = rewardsCard.querySelector("h3");
    const sub = rewardsCard.querySelector(".cvb-aff-muted");

    if (title) title.textContent = t.rewards.title;
    if (sub) sub.textContent = t.rewards.sub;
  }

  const badgesHeader = document.querySelector(".cvb-aff-badges-header h3");
  if (badgesHeader) {
    badgesHeader.textContent = t["badges-header"];
  }
  document.querySelectorAll(".cvb-badge-card").forEach(card => {
    const key = card.dataset.badge;
    const badge = t.badges?.[key];
    if (!badge) return;
    card.querySelector("h4").textContent = badge.title;
    card.querySelector("p").textContent = badge.desc;
  });

  updateAffiliateUI(
    AFFILIATE_STATE.coins,
    AFFILIATE_STATE.invites,
    AFFILIATE_STATE.conversions
  );
  loadAffiliateCoinsChart(currentUserUid);
  loadReferrersList(currentUserUid);
}

function UserForm_translateSecurity(lang) {
  const t = UserForm_translationsSecurity[lang] || UserForm_translationsSecurity['en'];

  document.getElementById('securityTitle').textContent = t["title"];
  document.getElementById('securityDescription').textContent = t["description"];

  document.getElementById('profilePrivacyTitle').textContent = t["profile-privacy"];
  document.getElementById('profilePrivacyDesc').textContent = t["profile-privacy-desc"];
  document.querySelector('label[for="profileVisibilitySelect"]').textContent =
    t["profile-visibility-label"];

  const select = document.getElementById('profileVisibilitySelect');
  if (select) {
    select.options[0].text = t["visibility-public"];
    select.options[1].text = t["visibility-registered"];
    select.options[2].text = t["visibility-verified"];
    select.options[3].text = t["visibility-private"];
  }

  document.getElementById('fieldVisibilityTitle').textContent = t["field-visibility"];
  document.getElementById('fieldVisibilityDesc').innerHTML = t["field-visibility-desc"];

  const fieldSection = document.getElementById('fieldVisibilityTitle').closest('.cvb-security-card');
  const fieldLabels = fieldSection.querySelectorAll('.field-visibility span');

  fieldLabels.forEach(el => {
    const key = el.dataset.key;
    if (t[key]) el.textContent = t[key];
  });

  document.getElementById('passwordTitle').textContent = t["password-title"];
  document.getElementById('passwordDesc').textContent = t["password-desc"];
  document.getElementById('changePassword').innerHTML =
    `<i class="ri-door-lock-line"></i> ${t["change-password"]}`;

  document.getElementById('dataUsageTitle').textContent = t["data-usage"];
  document.getElementById('dataUsageDesc').innerHTML =
    `${t["data-usage-desc"]} <a class="cvb-read-more" href="/privacy.html" id="dataUsageReadMore">${t["read-more"]}</a>`;

  const dataUsageSection = document.getElementById('dataUsageTitle').closest('.cvb-security-card');
  const usageLabels = dataUsageSection.querySelectorAll('.field-visibility span');

  usageLabels.forEach(el => {
    const key = el.dataset.key;
    if (t[key]) el.textContent = t[key];
  });

  document.getElementById('dataExportTitle').textContent = t["data-export"];
  document.getElementById('dataExportDesc').innerHTML = t["data-export-desc"];
  document.getElementById('exportUserDataBtn').innerHTML =
    `<i class="ri-file-download-line"></i> ${t["export-btn"]}`;

  document.getElementById('saveSecurityBtn').innerHTML =
    `<i class="ri-save-3-line"></i> ${t["save"]}`;
}

// =============================== TRANSLATIONS WORDS ================================
const cvbUserInfoTranslations = {
  en: {
    userlogin: "Login",
    userAccount: "Account Settings",
    userLogout: "Logout",
    userCoinsLabel: "Coins:",
    notifications: "Notifications",
    currentBalance: "Current Balance",
    myWallet: "My Wallet",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System"
  },

  fr: {
    userlogin: "Connexion",
    userAccount: "Paramètres du compte",
    userLogout: "Déconnexion",
    userCoinsLabel: "Pièces :",
    notifications: "Notifications",
    currentBalance: "Solde actuel",
    myWallet: "Mon portefeuille",
    theme: "Thème",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeSystem: "Système"
  },

  es: {
    userlogin: "Iniciar sesión",
    userAccount: "Configuración de la cuenta",
    userLogout: "Cerrar sesión",
    userCoinsLabel: "Monedas:",
    notifications: "Notificaciones",
    currentBalance: "Saldo actual",
    myWallet: "Mi billetera",
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Oscuro",
    themeSystem: "Sistema"
  },

  de: {
    userlogin: "Anmelden",
    userAccount: "Kontoeinstellungen",
    userLogout: "Abmelden",
    userCoinsLabel: "Münzen:",
    notifications: "Benachrichtigungen",
    currentBalance: "Aktuelles Guthaben",
    myWallet: "Meine Wallet",
    theme: "Thema",
    themeLight: "Hell",
    themeDark: "Dunkel",
    themeSystem: "System"
  },

  ar: {
    userlogin: "تسجيل الدخول",
    userAccount: "إعدادات الحساب",
    userLogout: "تسجيل الخروج",
    userCoinsLabel: "العملات:",
    notifications: "الإشعارات",
    currentBalance: "الرصيد الحالي",
    myWallet: "محفظتي",
    theme: "السمة",
    themeLight: "فاتح",
    themeDark: "داكن",
    themeSystem: "النظام"
  },

  pt: {
    userlogin: "Entrar",
    userAccount: "Configurações da conta",
    userLogout: "Sair",
    userCoinsLabel: "Moedas:",
    notifications: "Notificações",
    currentBalance: "Saldo atual",
    myWallet: "Minha carteira",
    theme: "Tema",
    themeLight: "Claro",
    themeDark: "Escuro",
    themeSystem: "Sistema"
  },

  ja: {
    userlogin: "ログイン",
    userAccount: "アカウント設定",
    userLogout: "ログアウト",
    userCoinsLabel: "コイン:",
    notifications: "通知",
    currentBalance: "現在の残高",
    myWallet: "ウォレット",
    theme: "テーマ",
    themeLight: "ライト",
    themeDark: "ダーク",
    themeSystem: "システム"
  },

  zh: {
    userlogin: "登录",
    userAccount: "账户设置",
    userLogout: "退出登录",
    userCoinsLabel: "币:",
    notifications: "通知",
    currentBalance: "当前余额",
    myWallet: "我的钱包",
    theme: "主题",
    themeLight: "浅色",
    themeDark: "深色",
    themeSystem: "系统"
  },

  ru: {
    userlogin: "Войти",
    userAccount: "Настройки аккаунта",
    userLogout: "Выйти",
    userCoinsLabel: "Монеты:",
    notifications: "Уведомления",
    currentBalance: "Текущий баланс",
    myWallet: "Мой кошелёк",
    theme: "Тема",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    themeSystem: "Системная"
  }
};

const Industry_Speciality_translations = {
  en: {
    // Industries
    "industry-agriculture": "Agriculture & Farming",
    "industry-automotive": "Automotive",
    "industry-aviation": "Aviation & Aerospace",
    "industry-banking": "Banking & Financial Services",
    "industry-biotech": "Biotechnology",
    "industry-construction": "Construction & Infrastructure",
    "industry-consulting": "Consulting",
    "industry-cybersecurity": "Cybersecurity",
    "industry-education": "Education & Training",
    "industry-energy": "Energy & Utilities",
    "industry-engineering": "Engineering",
    "industry-ecommerce": "E-commerce",
    "industry-entertainment": "Entertainment & Media",
    "industry-fashion": "Fashion & Apparel",
    "industry-food": "Food & Beverage",
    "industry-government": "Government & Public Sector",
    "industry-healthcare": "Healthcare & Medical",
    "industry-hospitality": "Hospitality & Tourism",
    "industry-hr": "Human Resources",
    "industry-insurance": "Insurance",
    "industry-legal": "Legal Services",
    "industry-logistics": "Logistics & Supply Chain",
    "industry-manufacturing": "Manufacturing",
    "industry-marketing": "Marketing & Advertising",
    "industry-mining": "Mining & Metals",
    "industry-nonprofit": "Non-Profit & NGOs",
    "industry-pharma": "Pharmaceuticals",
    "industry-realestate": "Real Estate",
    "industry-retail": "Retail",
    "industry-sales": "Sales & Business Development",
    "industry-software": "Software & IT Services",
    "industry-telecom": "Telecommunications",
    "industry-transport": "Transportation",
    "industry-wholesale": "Wholesale & Distribution",
    
    // Specialties - Software
    "speciality-frontend": "Frontend Development",
    "speciality-backend": "Backend Development",
    "speciality-fullstack": "Fullstack Development",
    "speciality-mobile": "Mobile Development",
    "speciality-devops": "DevOps & Cloud",
    "speciality-data_science": "Data Science & AI",
    "speciality-qa": "Quality Assurance",
    
    // Specialties - Marketing
    "speciality-seo": "SEO",
    "speciality-ads": "Paid Ads",
    "speciality-content": "Content Marketing",
    "speciality-social": "Social Media",
    "speciality-email": "Email Marketing",
    "speciality-analytics": "Marketing Analytics",
    
    // Specialties - Healthcare
    "speciality-nursing": "Nursing",
    "speciality-surgery": "Surgery",
    "speciality-pharmacy": "Pharmacy",
    "speciality-radiology": "Radiology",
    "speciality-primary_care": "Primary Care",
    "speciality-mental_health": "Mental Health",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "Crop Farming",
    "speciality-livestock": "Livestock & Animal Husbandry",
    "speciality-agronomy": "Agronomy",
    "speciality-agritech": "AgriTech",
    
    // Specialties - Automotive
    "speciality-ev": "Electric Vehicles",
    "speciality-manufacturing_auto": "Vehicle Manufacturing",
    "speciality-aftersales": "Aftersales & Service",
    "speciality-autonomous": "Autonomous Vehicles",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "Commercial Aviation",
    "speciality-defense_aero": "Defense & Military Aerospace",
    "speciality-space": "Space Exploration",
    "speciality-mro": "Maintenance, Repair & Overhaul",
    
    // Specialties - Banking
    "speciality-retail_banking": "Retail Banking",
    "speciality-investment_banking": "Investment Banking",
    "speciality-wealth_mgmt": "Wealth Management",
    "speciality-fintech": "FinTech",
    
    // Specialties - Biotech
    "speciality-genomics": "Genomics",
    "speciality-therapeutics": "Therapeutics",
    "speciality-diagnostics": "Diagnostics",
    "speciality-bioprocessing": "Bioprocessing",
    
    // Specialties - Construction
    "speciality-residential": "Residential Construction",
    "speciality-commercial_const": "Commercial Construction",
    "speciality-infrastructure": "Infrastructure",
    "speciality-project_mgmt": "Project Management",
    
    // Specialties - Consulting
    "speciality-strategy": "Strategy Consulting",
    "speciality-operations": "Operations Consulting",
    "speciality-hr_consulting": "HR Consulting",
    "speciality-tech_consulting": "Technology Consulting",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "Network Security",
    "speciality-app_security": "Application Security",
    "speciality-incident_response": "Incident Response",
    "speciality-compliance": "Compliance & Risk",
    
    // Specialties - Education
    "speciality-k12": "K-12 Education",
    "speciality-higher_ed": "Higher Education",
    "speciality-edtech": "EdTech",
    "speciality-corporate_training": "Corporate Training",
    
    // Specialties - Energy
    "speciality-renewable": "Renewable Energy",
    "speciality-oil_gas": "Oil & Gas",
    "speciality-nuclear": "Nuclear Energy",
    "speciality-grid_mgmt": "Grid Management",
    
    // Specialties - Engineering
    "speciality-civil": "Civil Engineering",
    "speciality-mechanical": "Mechanical Engineering",
    "speciality-electrical": "Electrical Engineering",
    "speciality-chemical": "Chemical Engineering",
    
    // Specialties - E-commerce
    "speciality-d2c": "Direct-to-Consumer",
    "speciality-marketplace": "Marketplace Operations",
    "speciality-logistics_ecom": "E-commerce Logistics",
    "speciality-conversion_opt": "Conversion Optimization",
    
    // Specialties - Entertainment
    "speciality-film_tv": "Film & Television",
    "speciality-music": "Music",
    "speciality-gaming": "Gaming",
    "speciality-digital_media": "Digital Media",
    
    // Specialties - Fashion
    "speciality-apparel_design": "Apparel Design",
    "speciality-luxury": "Luxury Goods",
    "speciality-fast_fashion": "Fast Fashion",
    "speciality-sustainable_fashion": "Sustainable Fashion",
    
    // Specialties - Food
    "speciality-food_production": "Food Production",
    "speciality-fandb_service": "Food Service",
    "speciality-beverage": "Beverage",
    "speciality-food_safety": "Food Safety",
    
    // Specialties - Government
    "speciality-policy": "Policy & Regulation",
    "speciality-public_admin": "Public Administration",
    "speciality-defense": "Defense",
    "speciality-public_health": "Public Health",
    
    // Specialties - Hospitality
    "speciality-hotels": "Hotels & Lodging",
    "speciality-fandb": "Food & Beverage",
    "speciality-travel": "Travel Services",
    "speciality-events": "Events & Conferences",
    
    // Specialties - HR
    "speciality-recruitment": "Recruitment",
    "speciality-comp_benefits": "Compensation & Benefits",
    "speciality-learning_dev": "Learning & Development",
    "speciality-hr_operations": "HR Operations",
    
    // Specialties - Insurance
    "speciality-life_insurance": "Life Insurance",
    "speciality-health_insurance": "Health Insurance",
    "speciality-property_casualty": "Property & Casualty",
    "speciality-reinsurance": "Reinsurance",
    
    // Specialties - Legal
    "speciality-corp_law": "Corporate Law",
    "speciality-litigation": "Litigation",
    "speciality-ip_law": "Intellectual Property",
    "speciality-family_law": "Family Law",
    
    // Specialties - Logistics
    "speciality-freight": "Freight & Cargo",
    "speciality-warehousing": "Warehousing",
    "speciality-last_mile": "Last Mile Delivery",
    "speciality-scm": "Supply Chain Management",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "Lean Manufacturing",
    "speciality-automation": "Industrial Automation",
    "speciality-quality_control": "Quality Control",
    "speciality-supply_chain_mfg": "Supply Chain",
    
    // Specialties - Mining
    "speciality-exploration": "Exploration",
    "speciality-extraction": "Extraction",
    "speciality-mineral_processing": "Mineral Processing",
    "speciality-hse_mining": "Health, Safety & Environment",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "Fundraising",
    "speciality-program_mgmt": "Program Management",
    "speciality-advocacy": "Advocacy",
    "speciality-grant_writing": "Grant Writing",
    
    // Specialties - Pharma
    "speciality-rnd": "R&D",
    "speciality-clinical_trials": "Clinical Trials",
    "speciality-regulatory_affairs": "Regulatory Affairs",
    "speciality-commercial_pharma": "Commercial & Sales",
    
    // Specialties - Real Estate
    "speciality-residential_re": "Residential Real Estate",
    "speciality-commercial_re": "Commercial Real Estate",
    "speciality-property_mgmt": "Property Management",
    "speciality-re_investment": "Real Estate Investment",
    
    // Specialties - Retail
    "speciality-store_ops": "Store Operations",
    "speciality-merchandising": "Merchandising",
    "speciality-omnichannel": "Omnichannel Retail",
    "speciality-category_mgmt": "Category Management",
    
    // Specialties - Sales
    "speciality-b2b_sales": "B2B Sales",
    "speciality-b2c_sales": "B2C Sales",
    "speciality-account_mgmt": "Account Management",
    "speciality-sales_ops": "Sales Operations",
    
    // Specialties - Telecom
    "speciality-wireless": "Wireless",
    "speciality-broadband": "Broadband",
    "speciality-network_infra": "Network Infrastructure",
    "speciality-telco_services": "Telecom Services",
    
    // Specialties - Transport
    "speciality-road_transport": "Road Transport",
    "speciality-rail": "Rail",
    "speciality-maritime": "Maritime",
    "speciality-public_transit": "Public Transit",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "Distributor Management",
    "speciality-bulk_purchasing": "Bulk Purchasing",
    "speciality-b2b_logistics": "B2B Logistics",
    "speciality-inventory_mgmt": "Inventory Management",

    "industry-management": "Management & Leadership",
    "speciality-moderation": "Community Moderation",
    
    // Placeholders
    "placeholder-industry": "Select an industry",
    "placeholder-speciality": "Select a speciality"
  },
  fr: {
    // Industries
    "industry-agriculture": "Agriculture & Élevage",
    "industry-automotive": "Automobile",
    "industry-aviation": "Aviation & Aérospatiale",
    "industry-banking": "Banque & Services Financiers",
    "industry-biotech": "Biotechnologie",
    "industry-construction": "Construction & Infrastructure",
    "industry-consulting": "Conseil",
    "industry-cybersecurity": "Cybersécurité",
    "industry-education": "Éducation & Formation",
    "industry-energy": "Énergie & Services Publics",
    "industry-engineering": "Ingénierie",
    "industry-ecommerce": "E-commerce",
    "industry-entertainment": "Divertissement & Médias",
    "industry-fashion": "Mode & Habillement",
    "industry-food": "Alimentation & Boissons",
    "industry-government": "Gouvernement & Secteur Public",
    "industry-healthcare": "Santé & Médical",
    "industry-hospitality": "Hôtellerie & Tourisme",
    "industry-hr": "Ressources Humaines",
    "industry-insurance": "Assurance",
    "industry-legal": "Services Juridiques",
    "industry-logistics": "Logistique & Chaîne d'Approvisionnement",
    "industry-manufacturing": "Fabrication",
    "industry-marketing": "Marketing & Publicité",
    "industry-mining": "Mines & Métallurgie",
    "industry-nonprofit": "Organisations à But Non Lucratif & ONG",
    "industry-pharma": "Produits Pharmaceutiques",
    "industry-realestate": "Immobilier",
    "industry-retail": "Commerce de Détail",
    "industry-sales": "Ventes & Développement Commercial",
    "industry-software": "Logiciels & Services Informatiques",
    "industry-telecom": "Télécommunications",
    "industry-transport": "Transport",
    "industry-wholesale": "Vente en Gros & Distribution",
    
    // Specialties - Software
    "speciality-frontend": "Développement Frontend",
    "speciality-backend": "Développement Backend",
    "speciality-fullstack": "Développement Fullstack",
    "speciality-mobile": "Développement Mobile",
    "speciality-devops": "DevOps & Cloud",
    "speciality-data_science": "Data Science & IA",
    "speciality-qa": "Assurance Qualité",
    
    // Specialties - Marketing
    "speciality-seo": "Référencement SEO",
    "speciality-ads": "Publicité Payante",
    "speciality-content": "Marketing de Contenu",
    "speciality-social": "Réseaux Sociaux",
    "speciality-email": "Email Marketing",
    "speciality-analytics": "Analytique Marketing",
    
    // Specialties - Healthcare
    "speciality-nursing": "Soins Infirmiers",
    "speciality-surgery": "Chirurgie",
    "speciality-pharmacy": "Pharmacie",
    "speciality-radiology": "Radiologie",
    "speciality-primary_care": "Soins Primaires",
    "speciality-mental_health": "Santé Mentale",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "Culture Agricole",
    "speciality-livestock": "Élevage",
    "speciality-agronomy": "Agronomie",
    "speciality-agritech": "AgriTech",
    
    // Specialties - Automotive
    "speciality-ev": "Véhicules Électriques",
    "speciality-manufacturing_auto": "Fabrication Automobile",
    "speciality-aftersales": "Service Après-Vente",
    "speciality-autonomous": "Véhicules Autonomes",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "Aviation Commerciale",
    "speciality-defense_aero": "Défense & Aérospatiale Militaire",
    "speciality-space": "Exploration Spatiale",
    "speciality-mro": "Maintenance, Réparation & Révision",
    
    // Specialties - Banking
    "speciality-retail_banking": "Banque de Détail",
    "speciality-investment_banking": "Banque d'Investissement",
    "speciality-wealth_mgmt": "Gestion de Patrimoine",
    "speciality-fintech": "FinTech",
    
    // Specialties - Biotech
    "speciality-genomics": "Génomique",
    "speciality-therapeutics": "Thérapeutique",
    "speciality-diagnostics": "Diagnostic",
    "speciality-bioprocessing": "Biotraitement",
    
    // Specialties - Construction
    "speciality-residential": "Construction Résidentielle",
    "speciality-commercial_const": "Construction Commerciale",
    "speciality-infrastructure": "Infrastructure",
    "speciality-project_mgmt": "Gestion de Projet",
    
    // Specialties - Consulting
    "speciality-strategy": "Conseil en Stratégie",
    "speciality-operations": "Conseil en Opérations",
    "speciality-hr_consulting": "Conseil en RH",
    "speciality-tech_consulting": "Conseil Technologique",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "Sécurité Réseau",
    "speciality-app_security": "Sécurité des Applications",
    "speciality-incident_response": "Réponse aux Incidents",
    "speciality-compliance": "Conformité & Risques",
    
    // Specialties - Education
    "speciality-k12": "Éducation Primaire & Secondaire",
    "speciality-higher_ed": "Enseignement Supérieur",
    "speciality-edtech": "EdTech",
    "speciality-corporate_training": "Formation d'Entreprise",
    
    // Specialties - Energy
    "speciality-renewable": "Énergies Renouvelables",
    "speciality-oil_gas": "Pétrole & Gaz",
    "speciality-nuclear": "Énergie Nucléaire",
    "speciality-grid_mgmt": "Gestion du Réseau Électrique",
    
    // Specialties - Engineering
    "speciality-civil": "Génie Civil",
    "speciality-mechanical": "Génie Mécanique",
    "speciality-electrical": "Génie Électrique",
    "speciality-chemical": "Génie Chimique",
    
    // Specialties - E-commerce
    "speciality-d2c": "Vente Directe au Consommateur",
    "speciality-marketplace": "Opérations de Marketplace",
    "speciality-logistics_ecom": "Logistique E-commerce",
    "speciality-conversion_opt": "Optimisation de la Conversion",
    
    // Specialties - Entertainment
    "speciality-film_tv": "Film & Télévision",
    "speciality-music": "Musique",
    "speciality-gaming": "Jeux Vidéo",
    "speciality-digital_media": "Médias Numériques",
    
    // Specialties - Fashion
    "speciality-apparel_design": "Création de Mode",
    "speciality-luxury": "Produits de Luxe",
    "speciality-fast_fashion": "Fast Fashion",
    "speciality-sustainable_fashion": "Mode Durable",
    
    // Specialties - Food
    "speciality-food_production": "Production Alimentaire",
    "speciality-fandb_service": "Restauration",
    "speciality-beverage": "Boissons",
    "speciality-food_safety": "Sécurité Alimentaire",
    
    // Specialties - Government
    "speciality-policy": "Politique & Réglementation",
    "speciality-public_admin": "Administration Publique",
    "speciality-defense": "Défense",
    "speciality-public_health": "Santé Publique",
    
    // Specialties - Hospitality
    "speciality-hotels": "Hôtels & Hébergement",
    "speciality-fandb": "Restauration",
    "speciality-travel": "Services de Voyage",
    "speciality-events": "Événements & Conférences",
    
    // Specialties - HR
    "speciality-recruitment": "Recrutement",
    "speciality-comp_benefits": "Rémunération & Avantages",
    "speciality-learning_dev": "Formation & Développement",
    "speciality-hr_operations": "Opérations RH",
    
    // Specialties - Insurance
    "speciality-life_insurance": "Assurance Vie",
    "speciality-health_insurance": "Assurance Santé",
    "speciality-property_casualty": "Assurance IARD",
    "speciality-reinsurance": "Réassurance",
    
    // Specialties - Legal
    "speciality-corp_law": "Droit des Sociétés",
    "speciality-litigation": "Contentieux",
    "speciality-ip_law": "Propriété Intellectuelle",
    "speciality-family_law": "Droit de la Famille",
    
    // Specialties - Logistics
    "speciality-freight": "Fret & Cargo",
    "speciality-warehousing": "Entreposage",
    "speciality-last_mile": "Dernier Kilomètre",
    "speciality-scm": "Gestion de la Chaîne Logistique",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "Production Lean",
    "speciality-automation": "Automatisation Industrielle",
    "speciality-quality_control": "Contrôle Qualité",
    "speciality-supply_chain_mfg": "Chaîne d'Approvisionnement",
    
    // Specialties - Mining
    "speciality-exploration": "Exploration",
    "speciality-extraction": "Extraction",
    "speciality-mineral_processing": "Traitement des Minéraux",
    "speciality-hse_mining": "Santé, Sécurité & Environnement",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "Collecte de Fonds",
    "speciality-program_mgmt": "Gestion de Programme",
    "speciality-advocacy": "Plaidoyer",
    "speciality-grant_writing": "Rédaction de Subventions",
    
    // Specialties - Pharma
    "speciality-rnd": "R&D",
    "speciality-clinical_trials": "Essais Cliniques",
    "speciality-regulatory_affairs": "Affaires Réglementaires",
    "speciality-commercial_pharma": "Commercial & Ventes",
    
    // Specialties - Real Estate
    "speciality-residential_re": "Immobilier Résidentiel",
    "speciality-commercial_re": "Immobilier Commercial",
    "speciality-property_mgmt": "Gestion Immobilière",
    "speciality-re_investment": "Investissement Immobilier",
    
    // Specialties - Retail
    "speciality-store_ops": "Opérations de Magasin",
    "speciality-merchandising": "Merchandising",
    "speciality-omnichannel": "Commerce Omnicanal",
    "speciality-category_mgmt": "Gestion de Catégorie",
    
    // Specialties - Sales
    "speciality-b2b_sales": "Ventes B2B",
    "speciality-b2c_sales": "Ventes B2C",
    "speciality-account_mgmt": "Gestion de Comptes",
    "speciality-sales_ops": "Opérations Commerciales",
    
    // Specialties - Telecom
    "speciality-wireless": "Sans Fil",
    "speciality-broadband": "Haut Débit",
    "speciality-network_infra": "Infrastructure Réseau",
    "speciality-telco_services": "Services Télécom",
    
    // Specialties - Transport
    "speciality-road_transport": "Transport Routier",
    "speciality-rail": "Transport Ferroviaire",
    "speciality-maritime": "Transport Maritime",
    "speciality-public_transit": "Transports Publics",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "Gestion des Distributeurs",
    "speciality-bulk_purchasing": "Achats en Vrac",
    "speciality-b2b_logistics": "Logistique B2B",
    "speciality-inventory_mgmt": "Gestion des Stocks",

    "industry-management": "Gestion & Leadership",
    "speciality-moderation": "Modération de la communauté",
    
    // Placeholders
    "placeholder-industry": "Sélectionnez un secteur",
    "placeholder-speciality": "Sélectionnez une spécialité"
  },
  ar: {
    // Industries
    "industry-agriculture": "الزراعة وتربية الحيوانات",
    "industry-automotive": "صناعة السيارات",
    "industry-aviation": "الطيران والفضاء",
    "industry-banking": "الخدمات المصرفية والمالية",
    "industry-biotech": "التكنولوجيا الحيوية",
    "industry-construction": "البناء والبنية التحتية",
    "industry-consulting": "الاستشارات",
    "industry-cybersecurity": "الأمن السيبراني",
    "industry-education": "التعليم والتدريب",
    "industry-energy": "الطاقة والمرافق",
    "industry-engineering": "الهندسة",
    "industry-ecommerce": "التجارة الإلكترونية",
    "industry-entertainment": "الترفيه والإعلام",
    "industry-fashion": "الأزياء والملابس",
    "industry-food": "الأغذية والمشروبات",
    "industry-government": "الحكومة والقطاع العام",
    "industry-healthcare": "الرعاية الصحية والطبية",
    "industry-hospitality": "الضيافة والسياحة",
    "industry-hr": "الموارد البشرية",
    "industry-insurance": "التأمين",
    "industry-legal": "الخدمات القانونية",
    "industry-logistics": "اللوجستيات وسلسلة التوريد",
    "industry-manufacturing": "التصنيع",
    "industry-marketing": "التسويق والإعلان",
    "industry-mining": "التعدين والمعادن",
    "industry-nonprofit": "المنظمات غير الربحية",
    "industry-pharma": "المستحضرات الصيدلانية",
    "industry-realestate": "العقارات",
    "industry-retail": "البيع بالتجزئة",
    "industry-sales": "المبيعات وتطوير الأعمال",
    "industry-software": "البرمجيات وخدمات تكنولوجيا المعلومات",
    "industry-telecom": "الاتصالات",
    "industry-transport": "النقل",
    "industry-wholesale": "البيع بالجملة والتوزيع",
    
    // Specialties - Software
    "speciality-frontend": "تطوير الواجهة الأمامية",
    "speciality-backend": "تطوير الخلفية",
    "speciality-fullstack": "تطوير شامل",
    "speciality-mobile": "تطوير التطبيقات المحمولة",
    "speciality-devops": "تطوير العمليات والسحابة",
    "speciality-data_science": "علوم البيانات والذكاء الاصطناعي",
    "speciality-qa": "ضمان الجودة",
    
    // Specialties - Marketing
    "speciality-seo": "تحسين محركات البحث",
    "speciality-ads": "الإعلانات المدفوعة",
    "speciality-content": "تسويق المحتوى",
    "speciality-social": "وسائل التواصل الاجتماعي",
    "speciality-email": "التسويق عبر البريد الإلكتروني",
    "speciality-analytics": "تحليلات التسويق",
    
    // Specialties - Healthcare
    "speciality-nursing": "التمريض",
    "speciality-surgery": "الجراحة",
    "speciality-pharmacy": "الصيدلة",
    "speciality-radiology": "الأشعة",
    "speciality-primary_care": "الرعاية الأولية",
    "speciality-mental_health": "الصحة النفسية",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "الزراعة المحصولية",
    "speciality-livestock": "تربية الماشية",
    "speciality-agronomy": "العلوم الزراعية",
    "speciality-agritech": "التكنولوجيا الزراعية",
    
    // Specialties - Automotive
    "speciality-ev": "المركبات الكهربائية",
    "speciality-manufacturing_auto": "تصنيع المركبات",
    "speciality-aftersales": "خدمات ما بعد البيع",
    "speciality-autonomous": "المركبات ذاتية القيادة",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "الطيران التجاري",
    "speciality-defense_aero": "الدفاع والفضاء العسكري",
    "speciality-space": "استكشاف الفضاء",
    "speciality-mro": "الصيانة والإصلاح",
    
    // Specialties - Banking
    "speciality-retail_banking": "الخدمات المصرفية للأفراد",
    "speciality-investment_banking": "الخدمات المصرفية الاستثمارية",
    "speciality-wealth_mgmt": "إدارة الثروات",
    "speciality-fintech": "التكنولوجيا المالية",
    
    // Specialties - Biotech
    "speciality-genomics": "علم الجينوم",
    "speciality-therapeutics": "العلاجات",
    "speciality-diagnostics": "التشخيص",
    "speciality-bioprocessing": "المعالجة الحيوية",
    
    // Specialties - Construction
    "speciality-residential": "البناء السكني",
    "speciality-commercial_const": "البناء التجاري",
    "speciality-infrastructure": "البنية التحتية",
    "speciality-project_mgmt": "إدارة المشاريع",
    
    // Specialties - Consulting
    "speciality-strategy": "استشارات استراتيجية",
    "speciality-operations": "استشارات عملياتية",
    "speciality-hr_consulting": "استشارات الموارد البشرية",
    "speciality-tech_consulting": "استشارات تقنية",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "أمن الشبكات",
    "speciality-app_security": "أمن التطبيقات",
    "speciality-incident_response": "الاستجابة للحوادث",
    "speciality-compliance": "الامتثال والمخاطر",
    
    // Specialties - Education
    "speciality-k12": "التعليم الأساسي",
    "speciality-higher_ed": "التعليم العالي",
    "speciality-edtech": "التكنولوجيا التعليمية",
    "speciality-corporate_training": "التدريب المؤسسي",
    
    // Specialties - Energy
    "speciality-renewable": "الطاقة المتجددة",
    "speciality-oil_gas": "النفط والغاز",
    "speciality-nuclear": "الطاقة النووية",
    "speciality-grid_mgmt": "إدارة الشبكات",
    
    // Specialties - Engineering
    "speciality-civil": "الهندسة المدنية",
    "speciality-mechanical": "الهندسة الميكانيكية",
    "speciality-electrical": "الهندسة الكهربائية",
    "speciality-chemical": "الهندسة الكيميائية",
    
    // Specialties - E-commerce
    "speciality-d2c": "البيع المباشر للمستهلك",
    "speciality-marketplace": "عمليات الأسواق الإلكترونية",
    "speciality-logistics_ecom": "لوجستيات التجارة الإلكترونية",
    "speciality-conversion_opt": "تحسين التحويل",
    
    // Specialties - Entertainment
    "speciality-film_tv": "الأفلام والتلفزيون",
    "speciality-music": "الموسيقى",
    "speciality-gaming": "الألعاب",
    "speciality-digital_media": "الوسائط الرقمية",
    
    // Specialties - Fashion
    "speciality-apparel_design": "تصميم الأزياء",
    "speciality-luxury": "السلع الفاخرة",
    "speciality-fast_fashion": "الموضة السريعة",
    "speciality-sustainable_fashion": "الموضة المستدامة",
    
    // Specialties - Food
    "speciality-food_production": "الإنتاج الغذائي",
    "speciality-fandb_service": "خدمات الطعام",
    "speciality-beverage": "المشروبات",
    "speciality-food_safety": "سلامة الغذاء",
    
    // Specialties - Government
    "speciality-policy": "السياسات واللوائح",
    "speciality-public_admin": "الإدارة العامة",
    "speciality-defense": "الدفاع",
    "speciality-public_health": "الصحة العامة",
    
    // Specialties - Hospitality
    "speciality-hotels": "الفنادق والإقامة",
    "speciality-fandb": "الأطعمة والمشروبات",
    "speciality-travel": "خدمات السفر",
    "speciality-events": "الفعاليات والمؤتمرات",
    
    // Specialties - HR
    "speciality-recruitment": "التوظيف",
    "speciality-comp_benefits": "التعويضات والمزايا",
    "speciality-learning_dev": "التعلم والتطوير",
    "speciality-hr_operations": "عمليات الموارد البشرية",
    
    // Specialties - Insurance
    "speciality-life_insurance": "التأمين على الحياة",
    "speciality-health_insurance": "التأمين الصحي",
    "speciality-property_casualty": "تأمين الممتلكات",
    "speciality-reinsurance": "إعادة التأمين",
    
    // Specialties - Legal
    "speciality-corp_law": "قانون الشركات",
    "speciality-litigation": "التقاضي",
    "speciality-ip_law": "الملكية الفكرية",
    "speciality-family_law": "قانون الأسرة",
    
    // Specialties - Logistics
    "speciality-freight": "الشحن",
    "speciality-warehousing": "التخزين",
    "speciality-last_mile": "التوصيل للميل الأخير",
    "speciality-scm": "إدارة سلسلة التوريد",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "التصنيع الرشيق",
    "speciality-automation": "الأتمتة الصناعية",
    "speciality-quality_control": "مراقبة الجودة",
    "speciality-supply_chain_mfg": "سلسلة التوريد",
    
    // Specialties - Mining
    "speciality-exploration": "الاستكشاف",
    "speciality-extraction": "الاستخراج",
    "speciality-mineral_processing": "معالجة المعادن",
    "speciality-hse_mining": "الصحة والسلامة والبيئة",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "جمع التبرعات",
    "speciality-program_mgmt": "إدارة البرامج",
    "speciality-advocacy": "الدعوة",
    "speciality-grant_writing": "كتابة المنح",
    
    // Specialties - Pharma
    "speciality-rnd": "البحث والتطوير",
    "speciality-clinical_trials": "التجارب السريرية",
    "speciality-regulatory_affairs": "الشؤون التنظيمية",
    "speciality-commercial_pharma": "التجارة والمبيعات",
    
    // Specialties - Real Estate
    "speciality-residential_re": "العقارات السكنية",
    "speciality-commercial_re": "العقارات التجارية",
    "speciality-property_mgmt": "إدارة الممتلكات",
    "speciality-re_investment": "الاستثمار العقاري",
    
    // Specialties - Retail
    "speciality-store_ops": "عمليات المتجر",
    "speciality-merchandising": "التسويق التجاري",
    "speciality-omnichannel": "البيع متعدد القنوات",
    "speciality-category_mgmt": "إدارة الفئات",
    
    // Specialties - Sales
    "speciality-b2b_sales": "مبيعات الأعمال",
    "speciality-b2c_sales": "مبيعات المستهلكين",
    "speciality-account_mgmt": "إدارة الحسابات",
    "speciality-sales_ops": "عمليات المبيعات",
    
    // Specialties - Telecom
    "speciality-wireless": "الاتصالات اللاسلكية",
    "speciality-broadband": "النطاق العريض",
    "speciality-network_infra": "البنية التحتية للشبكات",
    "speciality-telco_services": "خدمات الاتصالات",
    
    // Specialties - Transport
    "speciality-road_transport": "النقل البري",
    "speciality-rail": "النقل بالسكك الحديدية",
    "speciality-maritime": "النقل البحري",
    "speciality-public_transit": "النقل العام",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "إدارة الموزعين",
    "speciality-bulk_purchasing": "الشراء بالجملة",
    "speciality-b2b_logistics": "لوجستيات الأعمال",
    "speciality-inventory_mgmt": "إدارة المخزون",

    "industry-management": "الإدارة والقيادة",
    "speciality-moderation": "إشراف المجتمع",
    
    // Placeholders
    "placeholder-industry": "اختر القطاع",
    "placeholder-speciality": "اختر التخصص"
  },
  es: {
    // Industries
    "industry-agriculture": "Agricultura y Ganadería",
    "industry-automotive": "Automoción",
    "industry-aviation": "Aviación y Aeroespacial",
    "industry-banking": "Banca y Servicios Financieros",
    "industry-biotech": "Biotecnología",
    "industry-construction": "Construcción e Infraestructura",
    "industry-consulting": "Consultoría",
    "industry-cybersecurity": "Ciberseguridad",
    "industry-education": "Educación y Formación",
    "industry-energy": "Energía y Servicios Públicos",
    "industry-engineering": "Ingeniería",
    "industry-ecommerce": "Comercio Electrónico",
    "industry-entertainment": "Entretenimiento y Medios",
    "industry-fashion": "Moda y Vestimenta",
    "industry-food": "Alimentos y Bebidas",
    "industry-government": "Gobierno y Sector Público",
    "industry-healthcare": "Salud y Medicina",
    "industry-hospitality": "Hostelería y Turismo",
    "industry-hr": "Recursos Humanos",
    "industry-insurance": "Seguros",
    "industry-legal": "Servicios Legales",
    "industry-logistics": "Logística y Cadena de Suministro",
    "industry-manufacturing": "Manufactura",
    "industry-marketing": "Marketing y Publicidad",
    "industry-mining": "Minería y Metales",
    "industry-nonprofit": "Organizaciones Sin Fines de Lucro y ONG",
    "industry-pharma": "Productos Farmacéuticos",
    "industry-realestate": "Bienes Raíces",
    "industry-retail": "Comercio Minorista",
    "industry-sales": "Ventas y Desarrollo de Negocios",
    "industry-software": "Software y Servicios de TI",
    "industry-telecom": "Telecomunicaciones",
    "industry-transport": "Transporte",
    "industry-wholesale": "Venta al por Mayor y Distribución",
    
    // Specialties - Software
    "speciality-frontend": "Desarrollo Frontend",
    "speciality-backend": "Desarrollo Backend",
    "speciality-fullstack": "Desarrollo Fullstack",
    "speciality-mobile": "Desarrollo Móvil",
    "speciality-devops": "DevOps y Nube",
    "speciality-data_science": "Ciencia de Datos e IA",
    "speciality-qa": "Aseguramiento de Calidad",
    
    // Specialties - Marketing
    "speciality-seo": "SEO",
    "speciality-ads": "Anuncios Pagados",
    "speciality-content": "Marketing de Contenidos",
    "speciality-social": "Redes Sociales",
    "speciality-email": "Email Marketing",
    "speciality-analytics": "Analítica de Marketing",
    
    // Specialties - Healthcare
    "speciality-nursing": "Enfermería",
    "speciality-surgery": "Cirugía",
    "speciality-pharmacy": "Farmacia",
    "speciality-radiology": "Radiología",
    "speciality-primary_care": "Atención Primaria",
    "speciality-mental_health": "Salud Mental",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "Cultivos Agrícolas",
    "speciality-livestock": "Ganadería",
    "speciality-agronomy": "Agronomía",
    "speciality-agritech": "AgriTech",
    
    // Specialties - Automotive
    "speciality-ev": "Vehículos Eléctricos",
    "speciality-manufacturing_auto": "Fabricación de Vehículos",
    "speciality-aftersales": "Servicio Postventa",
    "speciality-autonomous": "Vehículos Autónomos",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "Aviación Comercial",
    "speciality-defense_aero": "Defensa y Aeroespacial Militar",
    "speciality-space": "Exploración Espacial",
    "speciality-mro": "Mantenimiento, Reparación y Revisión",
    
    // Specialties - Banking
    "speciality-retail_banking": "Banca Minorista",
    "speciality-investment_banking": "Banca de Inversión",
    "speciality-wealth_mgmt": "Gestión de Patrimonios",
    "speciality-fintech": "FinTech",
    
    // Specialties - Biotech
    "speciality-genomics": "Genómica",
    "speciality-therapeutics": "Terapéutica",
    "speciality-diagnostics": "Diagnóstico",
    "speciality-bioprocessing": "Bioprocesamiento",
    
    // Specialties - Construction
    "speciality-residential": "Construcción Residencial",
    "speciality-commercial_const": "Construcción Comercial",
    "speciality-infrastructure": "Infraestructura",
    "speciality-project_mgmt": "Gestión de Proyectos",
    
    // Specialties - Consulting
    "speciality-strategy": "Consultoría Estratégica",
    "speciality-operations": "Consultoría Operativa",
    "speciality-hr_consulting": "Consultoría de RRHH",
    "speciality-tech_consulting": "Consultoría Tecnológica",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "Seguridad de Redes",
    "speciality-app_security": "Seguridad de Aplicaciones",
    "speciality-incident_response": "Respuesta a Incidentes",
    "speciality-compliance": "Cumplimiento y Riesgos",
    
    // Specialties - Education
    "speciality-k12": "Educación Primaria y Secundaria",
    "speciality-higher_ed": "Educación Superior",
    "speciality-edtech": "EdTech",
    "speciality-corporate_training": "Formación Corporativa",
    
    // Specialties - Energy
    "speciality-renewable": "Energías Renovables",
    "speciality-oil_gas": "Petróleo y Gas",
    "speciality-nuclear": "Energía Nuclear",
    "speciality-grid_mgmt": "Gestión de Redes",
    
    // Specialties - Engineering
    "speciality-civil": "Ingeniería Civil",
    "speciality-mechanical": "Ingeniería Mecánica",
    "speciality-electrical": "Ingeniería Eléctrica",
    "speciality-chemical": "Ingeniería Química",
    
    // Specialties - E-commerce
    "speciality-d2c": "Venta Directa al Consumidor",
    "speciality-marketplace": "Operaciones de Marketplace",
    "speciality-logistics_ecom": "Logística de E-commerce",
    "speciality-conversion_opt": "Optimización de Conversión",
    
    // Specialties - Entertainment
    "speciality-film_tv": "Cine y Televisión",
    "speciality-music": "Música",
    "speciality-gaming": "Videojuegos",
    "speciality-digital_media": "Medios Digitales",
    
    // Specialties - Fashion
    "speciality-apparel_design": "Diseño de Moda",
    "speciality-luxury": "Bienes de Lujo",
    "speciality-fast_fashion": "Moda Rápida",
    "speciality-sustainable_fashion": "Moda Sostenible",
    
    // Specialties - Food
    "speciality-food_production": "Producción de Alimentos",
    "speciality-fandb_service": "Servicio de Alimentos",
    "speciality-beverage": "Bebidas",
    "speciality-food_safety": "Seguridad Alimentaria",
    
    // Specialties - Government
    "speciality-policy": "Políticas y Regulaciones",
    "speciality-public_admin": "Administración Pública",
    "speciality-defense": "Defensa",
    "speciality-public_health": "Salud Pública",
    
    // Specialties - Hospitality
    "speciality-hotels": "Hoteles y Alojamiento",
    "speciality-fandb": "Alimentos y Bebidas",
    "speciality-travel": "Servicios de Viaje",
    "speciality-events": "Eventos y Conferencias",
    
    // Specialties - HR
    "speciality-recruitment": "Reclutamiento",
    "speciality-comp_benefits": "Compensación y Beneficios",
    "speciality-learning_dev": "Aprendizaje y Desarrollo",
    "speciality-hr_operations": "Operaciones de RRHH",
    
    // Specialties - Insurance
    "speciality-life_insurance": "Seguro de Vida",
    "speciality-health_insurance": "Seguro de Salud",
    "speciality-property_casualty": "Seguros de Propiedad y Accidentes",
    "speciality-reinsurance": "Reaseguro",
    
    // Specialties - Legal
    "speciality-corp_law": "Derecho Corporativo",
    "speciality-litigation": "Litigios",
    "speciality-ip_law": "Propiedad Intelectual",
    "speciality-family_law": "Derecho de Familia",
    
    // Specialties - Logistics
    "speciality-freight": "Flete y Carga",
    "speciality-warehousing": "Almacenamiento",
    "speciality-last_mile": "Última Milla",
    "speciality-scm": "Gestión de la Cadena de Suministro",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "Manufactura Lean",
    "speciality-automation": "Automatización Industrial",
    "speciality-quality_control": "Control de Calidad",
    "speciality-supply_chain_mfg": "Cadena de Suministro",
    
    // Specialties - Mining
    "speciality-exploration": "Exploración",
    "speciality-extraction": "Extracción",
    "speciality-mineral_processing": "Procesamiento de Minerales",
    "speciality-hse_mining": "Salud, Seguridad y Medio Ambiente",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "Recaudación de Fondos",
    "speciality-program_mgmt": "Gestión de Programas",
    "speciality-advocacy": "Defensa",
    "speciality-grant_writing": "Redacción de Subvenciones",
    
    // Specialties - Pharma
    "speciality-rnd": "I+D",
    "speciality-clinical_trials": "Ensayos Clínicos",
    "speciality-regulatory_affairs": "Asuntos Regulatorios",
    "speciality-commercial_pharma": "Comercial y Ventas",
    
    // Specialties - Real Estate
    "speciality-residential_re": "Bienes Raíces Residenciales",
    "speciality-commercial_re": "Bienes Raíces Comerciales",
    "speciality-property_mgmt": "Administración de Propiedades",
    "speciality-re_investment": "Inversión Inmobiliaria",
    
    // Specialties - Retail
    "speciality-store_ops": "Operaciones de Tienda",
    "speciality-merchandising": "Merchandising",
    "speciality-omnichannel": "Comercio Omnicanal",
    "speciality-category_mgmt": "Gestión de Categorías",
    
    // Specialties - Sales
    "speciality-b2b_sales": "Ventas B2B",
    "speciality-b2c_sales": "Ventas B2C",
    "speciality-account_mgmt": "Gestión de Cuentas",
    "speciality-sales_ops": "Operaciones de Ventas",
    
    // Specialties - Telecom
    "speciality-wireless": "Inalámbrico",
    "speciality-broadband": "Banda Ancha",
    "speciality-network_infra": "Infraestructura de Red",
    "speciality-telco_services": "Servicios de Telecomunicaciones",
    
    // Specialties - Transport
    "speciality-road_transport": "Transporte por Carretera",
    "speciality-rail": "Ferrocarril",
    "speciality-maritime": "Marítimo",
    "speciality-public_transit": "Transporte Público",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "Gestión de Distribuidores",
    "speciality-bulk_purchasing": "Compras al por Mayor",
    "speciality-b2b_logistics": "Logística B2B",
    "speciality-inventory_mgmt": "Gestión de Inventario",

    "industry-management": "Gestión y liderazgo",
    "speciality-moderation": "Moderación de la comunidad",
    
    // Placeholders
    "placeholder-industry": "Seleccionar una industria",
    "placeholder-speciality": "Seleccionar una especialidad"
  },
  zh: {
    // Industries
    "industry-agriculture": "农业与养殖业",
    "industry-automotive": "汽车工业",
    "industry-aviation": "航空航天",
    "industry-banking": "银行与金融服务",
    "industry-biotech": "生物技术",
    "industry-construction": "建筑与基础设施",
    "industry-consulting": "咨询",
    "industry-cybersecurity": "网络安全",
    "industry-education": "教育与培训",
    "industry-energy": "能源与公用事业",
    "industry-engineering": "工程",
    "industry-ecommerce": "电子商务",
    "industry-entertainment": "娱乐与媒体",
    "industry-fashion": "时尚与服装",
    "industry-food": "食品与饮料",
    "industry-government": "政府与公共部门",
    "industry-healthcare": "医疗健康",
    "industry-hospitality": "酒店与旅游",
    "industry-hr": "人力资源",
    "industry-insurance": "保险",
    "industry-legal": "法律服务",
    "industry-logistics": "物流与供应链",
    "industry-manufacturing": "制造业",
    "industry-marketing": "市场营销与广告",
    "industry-mining": "采矿与金属",
    "industry-nonprofit": "非营利组织与非政府组织",
    "industry-pharma": "制药",
    "industry-realestate": "房地产",
    "industry-retail": "零售",
    "industry-sales": "销售与业务发展",
    "industry-software": "软件与信息技术服务",
    "industry-telecom": "电信",
    "industry-transport": "运输",
    "industry-wholesale": "批发与分销",
    
    // Specialties - Software
    "speciality-frontend": "前端开发",
    "speciality-backend": "后端开发",
    "speciality-fullstack": "全栈开发",
    "speciality-mobile": "移动开发",
    "speciality-devops": "DevOps与云服务",
    "speciality-data_science": "数据科学与人工智能",
    "speciality-qa": "质量保证",
    
    // Specialties - Marketing
    "speciality-seo": "搜索引擎优化",
    "speciality-ads": "付费广告",
    "speciality-content": "内容营销",
    "speciality-social": "社交媒体",
    "speciality-email": "电子邮件营销",
    "speciality-analytics": "营销分析",
    
    // Specialties - Healthcare
    "speciality-nursing": "护理",
    "speciality-surgery": "外科",
    "speciality-pharmacy": "药学",
    "speciality-radiology": "放射科",
    "speciality-primary_care": "初级保健",
    "speciality-mental_health": "心理健康",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "作物种植",
    "speciality-livestock": "畜牧业",
    "speciality-agronomy": "农学",
    "speciality-agritech": "农业科技",
    
    // Specialties - Automotive
    "speciality-ev": "电动汽车",
    "speciality-manufacturing_auto": "汽车制造",
    "speciality-aftersales": "售后服务",
    "speciality-autonomous": "自动驾驶汽车",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "商业航空",
    "speciality-defense_aero": "国防与军用航空航天",
    "speciality-space": "太空探索",
    "speciality-mro": "维护、修理和大修",
    
    // Specialties - Banking
    "speciality-retail_banking": "零售银行业务",
    "speciality-investment_banking": "投资银行业务",
    "speciality-wealth_mgmt": "财富管理",
    "speciality-fintech": "金融科技",
    
    // Specialties - Biotech
    "speciality-genomics": "基因组学",
    "speciality-therapeutics": "治疗学",
    "speciality-diagnostics": "诊断学",
    "speciality-bioprocessing": "生物加工",
    
    // Specialties - Construction
    "speciality-residential": "住宅建设",
    "speciality-commercial_const": "商业建筑",
    "speciality-infrastructure": "基础设施",
    "speciality-project_mgmt": "项目管理",
    
    // Specialties - Consulting
    "speciality-strategy": "战略咨询",
    "speciality-operations": "运营咨询",
    "speciality-hr_consulting": "人力资源咨询",
    "speciality-tech_consulting": "技术咨询",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "网络安全",
    "speciality-app_security": "应用程序安全",
    "speciality-incident_response": "事件响应",
    "speciality-compliance": "合规与风险",
    
    // Specialties - Education
    "speciality-k12": "K-12教育",
    "speciality-higher_ed": "高等教育",
    "speciality-edtech": "教育科技",
    "speciality-corporate_training": "企业培训",
    
    // Specialties - Energy
    "speciality-renewable": "可再生能源",
    "speciality-oil_gas": "石油与天然气",
    "speciality-nuclear": "核能",
    "speciality-grid_mgmt": "电网管理",
    
    // Specialties - Engineering
    "speciality-civil": "土木工程",
    "speciality-mechanical": "机械工程",
    "speciality-electrical": "电气工程",
    "speciality-chemical": "化学工程",
    
    // Specialties - E-commerce
    "speciality-d2c": "直接面向消费者",
    "speciality-marketplace": "市场运营",
    "speciality-logistics_ecom": "电子商务物流",
    "speciality-conversion_opt": "转化率优化",
    
    // Specialties - Entertainment
    "speciality-film_tv": "电影与电视",
    "speciality-music": "音乐",
    "speciality-gaming": "游戏",
    "speciality-digital_media": "数字媒体",
    
    // Specialties - Fashion
    "speciality-apparel_design": "服装设计",
    "speciality-luxury": "奢侈品",
    "speciality-fast_fashion": "快时尚",
    "speciality-sustainable_fashion": "可持续时尚",
    
    // Specialties - Food
    "speciality-food_production": "食品生产",
    "speciality-fandb_service": "餐饮服务",
    "speciality-beverage": "饮料",
    "speciality-food_safety": "食品安全",
    
    // Specialties - Government
    "speciality-policy": "政策与法规",
    "speciality-public_admin": "公共管理",
    "speciality-defense": "国防",
    "speciality-public_health": "公共卫生",
    
    // Specialties - Hospitality
    "speciality-hotels": "酒店与住宿",
    "speciality-fandb": "餐饮",
    "speciality-travel": "旅行服务",
    "speciality-events": "活动与会议",
    
    // Specialties - HR
    "speciality-recruitment": "招聘",
    "speciality-comp_benefits": "薪酬与福利",
    "speciality-learning_dev": "学习与发展",
    "speciality-hr_operations": "人力资源运营",
    
    // Specialties - Insurance
    "speciality-life_insurance": "人寿保险",
    "speciality-health_insurance": "健康保险",
    "speciality-property_casualty": "财产与意外险",
    "speciality-reinsurance": "再保险",
    
    // Specialties - Legal
    "speciality-corp_law": "公司法",
    "speciality-litigation": "诉讼",
    "speciality-ip_law": "知识产权",
    "speciality-family_law": "家庭法",
    
    // Specialties - Logistics
    "speciality-freight": "货运",
    "speciality-warehousing": "仓储",
    "speciality-last_mile": "最后一公里配送",
    "speciality-scm": "供应链管理",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "精益制造",
    "speciality-automation": "工业自动化",
    "speciality-quality_control": "质量控制",
    "speciality-supply_chain_mfg": "供应链",
    
    // Specialties - Mining
    "speciality-exploration": "勘探",
    "speciality-extraction": "开采",
    "speciality-mineral_processing": "矿物加工",
    "speciality-hse_mining": "健康、安全与环境",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "筹款",
    "speciality-program_mgmt": "项目管理",
    "speciality-advocacy": "倡导",
    "speciality-grant_writing": "拨款申请撰写",
    
    // Specialties - Pharma
    "speciality-rnd": "研发",
    "speciality-clinical_trials": "临床试验",
    "speciality-regulatory_affairs": "法规事务",
    "speciality-commercial_pharma": "商业与销售",
    
    // Specialties - Real Estate
    "speciality-residential_re": "住宅房地产",
    "speciality-commercial_re": "商业房地产",
    "speciality-property_mgmt": "物业管理",
    "speciality-re_investment": "房地产投资",
    
    // Specialties - Retail
    "speciality-store_ops": "门店运营",
    "speciality-merchandising": "商品推销",
    "speciality-omnichannel": "全渠道零售",
    "speciality-category_mgmt": "品类管理",
    
    // Specialties - Sales
    "speciality-b2b_sales": "B2B销售",
    "speciality-b2c_sales": "B2C销售",
    "speciality-account_mgmt": "客户管理",
    "speciality-sales_ops": "销售运营",
    
    // Specialties - Telecom
    "speciality-wireless": "无线通信",
    "speciality-broadband": "宽带",
    "speciality-network_infra": "网络基础设施",
    "speciality-telco_services": "电信服务",
    
    // Specialties - Transport
    "speciality-road_transport": "公路运输",
    "speciality-rail": "铁路运输",
    "speciality-maritime": "海上运输",
    "speciality-public_transit": "公共交通",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "分销商管理",
    "speciality-bulk_purchasing": "批量采购",
    "speciality-b2b_logistics": "B2B物流",
    "speciality-inventory_mgmt": "库存管理",

    "industry-management": "管理与领导力",
    "speciality-moderation": "社区管理",
    
    // Placeholders
    "placeholder-industry": "选择行业",
    "placeholder-speciality": "选择专业领域"
  },
  de: {
    // Industries
    "industry-agriculture": "Landwirtschaft & Tierhaltung",
    "industry-automotive": "Automobilindustrie",
    "industry-aviation": "Luft- und Raumfahrt",
    "industry-banking": "Bank- und Finanzdienstleistungen",
    "industry-biotech": "Biotechnologie",
    "industry-construction": "Bauwesen und Infrastruktur",
    "industry-consulting": "Beratung",
    "industry-cybersecurity": "Cybersicherheit",
    "industry-education": "Bildung und Training",
    "industry-energy": "Energie und Versorgung",
    "industry-engineering": "Ingenieurwesen",
    "industry-ecommerce": "E-Commerce",
    "industry-entertainment": "Unterhaltung und Medien",
    "industry-fashion": "Mode und Bekleidung",
    "industry-food": "Lebensmittel und Getränke",
    "industry-government": "Öffentlicher Sektor",
    "industry-healthcare": "Gesundheitswesen",
    "industry-hospitality": "Gastgewerbe und Tourismus",
    "industry-hr": "Personalwesen",
    "industry-insurance": "Versicherung",
    "industry-legal": "Rechtsdienstleistungen",
    "industry-logistics": "Logistik und Lieferkette",
    "industry-manufacturing": "Produktion",
    "industry-marketing": "Marketing und Werbung",
    "industry-mining": "Bergbau und Metalle",
    "industry-nonprofit": "Gemeinnützige Organisationen und NGOs",
    "industry-pharma": "Pharmaindustrie",
    "industry-realestate": "Immobilien",
    "industry-retail": "Einzelhandel",
    "industry-sales": "Vertrieb und Geschäftsentwicklung",
    "industry-software": "Software und IT-Dienstleistungen",
    "industry-telecom": "Telekommunikation",
    "industry-transport": "Transport",
    "industry-wholesale": "Großhandel und Distribution",
    
    // Specialties - Software
    "speciality-frontend": "Frontend-Entwicklung",
    "speciality-backend": "Backend-Entwicklung",
    "speciality-fullstack": "Fullstack-Entwicklung",
    "speciality-mobile": "Mobile Entwicklung",
    "speciality-devops": "DevOps & Cloud",
    "speciality-data_science": "Data Science & KI",
    "speciality-qa": "Qualitätssicherung",
    
    // Specialties - Marketing
    "speciality-seo": "SEO",
    "speciality-ads": "Bezahlte Anzeigen",
    "speciality-content": "Content-Marketing",
    "speciality-social": "Soziale Medien",
    "speciality-email": "E-Mail-Marketing",
    "speciality-analytics": "Marketing-Analytik",
    
    // Specialties - Healthcare
    "speciality-nursing": "Krankenpflege",
    "speciality-surgery": "Chirurgie",
    "speciality-pharmacy": "Pharmazie",
    "speciality-radiology": "Radiologie",
    "speciality-primary_care": "Primärversorgung",
    "speciality-mental_health": "Psychische Gesundheit",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "Pflanzenanbau",
    "speciality-livestock": "Viehzucht",
    "speciality-agronomy": "Agronomie",
    "speciality-agritech": "AgrarTech",
    
    // Specialties - Automotive
    "speciality-ev": "Elektrofahrzeuge",
    "speciality-manufacturing_auto": "Fahrzeugherstellung",
    "speciality-aftersales": "Kundendienst",
    "speciality-autonomous": "Autonome Fahrzeuge",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "Kommerzielle Luftfahrt",
    "speciality-defense_aero": "Verteidigung & Militärluftfahrt",
    "speciality-space": "Weltraumforschung",
    "speciality-mro": "Wartung, Reparatur & Überholung",
    
    // Specialties - Banking
    "speciality-retail_banking": "Privatkundengeschäft",
    "speciality-investment_banking": "Investmentbanking",
    "speciality-wealth_mgmt": "Vermögensverwaltung",
    "speciality-fintech": "FinTech",
    
    // Specialties - Biotech
    "speciality-genomics": "Genomik",
    "speciality-therapeutics": "Therapeutika",
    "speciality-diagnostics": "Diagnostik",
    "speciality-bioprocessing": "Bioprozessierung",
    
    // Specialties - Construction
    "speciality-residential": "Wohnungsbau",
    "speciality-commercial_const": "Gewerbebau",
    "speciality-infrastructure": "Infrastruktur",
    "speciality-project_mgmt": "Projektmanagement",
    
    // Specialties - Consulting
    "speciality-strategy": "Strategieberatung",
    "speciality-operations": "Operationsberatung",
    "speciality-hr_consulting": "HR-Beratung",
    "speciality-tech_consulting": "Technologieberatung",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "Netzwerksicherheit",
    "speciality-app_security": "Anwendungssicherheit",
    "speciality-incident_response": "Vorfallreaktion",
    "speciality-compliance": "Compliance & Risiko",
    
    // Specialties - Education
    "speciality-k12": "Schulbildung",
    "speciality-higher_ed": "Hochschulbildung",
    "speciality-edtech": "EdTech",
    "speciality-corporate_training": "Unternehmensschulung",
    
    // Specialties - Energy
    "speciality-renewable": "Erneuerbare Energien",
    "speciality-oil_gas": "Öl & Gas",
    "speciality-nuclear": "Kernenergie",
    "speciality-grid_mgmt": "Netzmanagement",
    
    // Specialties - Engineering
    "speciality-civil": "Bauingenieurwesen",
    "speciality-mechanical": "Maschinenbau",
    "speciality-electrical": "Elektrotechnik",
    "speciality-chemical": "Chemieingenieurwesen",
    
    // Specialties - E-commerce
    "speciality-d2c": "Direktvertrieb",
    "speciality-marketplace": "Marktplatzbetrieb",
    "speciality-logistics_ecom": "E-Commerce-Logistik",
    "speciality-conversion_opt": "Conversion-Optimierung",
    
    // Specialties - Entertainment
    "speciality-film_tv": "Film & Fernsehen",
    "speciality-music": "Musik",
    "speciality-gaming": "Gaming",
    "speciality-digital_media": "Digitale Medien",
    
    // Specialties - Fashion
    "speciality-apparel_design": "Modedesign",
    "speciality-luxury": "Luxusgüter",
    "speciality-fast_fashion": "Fast Fashion",
    "speciality-sustainable_fashion": "Nachhaltige Mode",
    
    // Specialties - Food
    "speciality-food_production": "Lebensmittelproduktion",
    "speciality-fandb_service": "Gastronomie",
    "speciality-beverage": "Getränke",
    "speciality-food_safety": "Lebensmittelsicherheit",
    
    // Specialties - Government
    "speciality-policy": "Politik & Regulierung",
    "speciality-public_admin": "Öffentliche Verwaltung",
    "speciality-defense": "Verteidigung",
    "speciality-public_health": "Öffentliche Gesundheit",
    
    // Specialties - Hospitality
    "speciality-hotels": "Hotels & Unterkünfte",
    "speciality-fandb": "Gastronomie",
    "speciality-travel": "Reisedienstleistungen",
    "speciality-events": "Veranstaltungen & Konferenzen",
    
    // Specialties - HR
    "speciality-recruitment": "Personalbeschaffung",
    "speciality-comp_benefits": "Vergütung & Leistungen",
    "speciality-learning_dev": "Lernen & Entwicklung",
    "speciality-hr_operations": "HR-Operationen",
    
    // Specialties - Insurance
    "speciality-life_insurance": "Lebensversicherung",
    "speciality-health_insurance": "Krankenversicherung",
    "speciality-property_casualty": "Sach- und Haftpflichtversicherung",
    "speciality-reinsurance": "Rückversicherung",
    
    // Specialties - Legal
    "speciality-corp_law": "Gesellschaftsrecht",
    "speciality-litigation": "Prozessführung",
    "speciality-ip_law": "Geistiges Eigentum",
    "speciality-family_law": "Familienrecht",
    
    // Specialties - Logistics
    "speciality-freight": "Fracht",
    "speciality-warehousing": "Lagerhaltung",
    "speciality-last_mile": "Letzte Meile",
    "speciality-scm": "Supply Chain Management",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "Lean Production",
    "speciality-automation": "Industrieautomation",
    "speciality-quality_control": "Qualitätskontrolle",
    "speciality-supply_chain_mfg": "Lieferkette",
    
    // Specialties - Mining
    "speciality-exploration": "Exploration",
    "speciality-extraction": "Förderung",
    "speciality-mineral_processing": "Mineralienverarbeitung",
    "speciality-hse_mining": "Gesundheit, Sicherheit & Umwelt",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "Fundraising",
    "speciality-program_mgmt": "Programmmanagement",
    "speciality-advocacy": "Interessenvertretung",
    "speciality-grant_writing": "Förderanträge",
    
    // Specialties - Pharma
    "speciality-rnd": "Forschung & Entwicklung",
    "speciality-clinical_trials": "Klinische Studien",
    "speciality-regulatory_affairs": "Regulierungsangelegenheiten",
    "speciality-commercial_pharma": "Vertrieb & Verkauf",
    
    // Specialties - Real Estate
    "speciality-residential_re": "Wohnimmobilien",
    "speciality-commercial_re": "Gewerbeimmobilien",
    "speciality-property_mgmt": "Immobilienverwaltung",
    "speciality-re_investment": "Immobilieninvestition",
    
    // Specialties - Retail
    "speciality-store_ops": "Filialbetrieb",
    "speciality-merchandising": "Merchandising",
    "speciality-omnichannel": "Omnichannel-Einzelhandel",
    "speciality-category_mgmt": "Kategoriemanagement",
    
    // Specialties - Sales
    "speciality-b2b_sales": "B2B-Vertrieb",
    "speciality-b2c_sales": "B2C-Vertrieb",
    "speciality-account_mgmt": "Kundenbetreuung",
    "speciality-sales_ops": "Vertriebsoperationen",
    
    // Specialties - Telecom
    "speciality-wireless": "Mobilfunk",
    "speciality-broadband": "Breitband",
    "speciality-network_infra": "Netzwerkinfrastruktur",
    "speciality-telco_services": "Telekommunikationsdienste",
    
    // Specialties - Transport
    "speciality-road_transport": "Straßentransport",
    "speciality-rail": "Schienenverkehr",
    "speciality-maritime": "Seeverkehr",
    "speciality-public_transit": "Öffentlicher Nahverkehr",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "Distributorenmanagement",
    "speciality-bulk_purchasing": "Großeinkauf",
    "speciality-b2b_logistics": "B2B-Logistik",
    "speciality-inventory_mgmt": "Bestandsmanagement",

    "industry-management": "Management & Führung",
    "speciality-moderation": "Community-Moderation",
    
    // Placeholders
    "placeholder-industry": "Branche auswählen",
    "placeholder-speciality": "Fachgebiet auswählen"
  },
  pt: {
    // Industries
    "industry-agriculture": "Agricultura e Pecuária",
    "industry-automotive": "Automotivo",
    "industry-aviation": "Aviação e Aeroespacial",
    "industry-banking": "Serviços Bancários e Financeiros",
    "industry-biotech": "Biotecnologia",
    "industry-construction": "Construção e Infraestrutura",
    "industry-consulting": "Consultoria",
    "industry-cybersecurity": "Cibersegurança",
    "industry-education": "Educação e Treinamento",
    "industry-energy": "Energia e Serviços Públicos",
    "industry-engineering": "Engenharia",
    "industry-ecommerce": "E-commerce",
    "industry-entertainment": "Entretenimento e Mídia",
    "industry-fashion": "Moda e Vestuário",
    "industry-food": "Alimentos e Bebidas",
    "industry-government": "Governo e Setor Público",
    "industry-healthcare": "Saúde e Médico",
    "industry-hospitality": "Hotelaria e Turismo",
    "industry-hr": "Recursos Humanos",
    "industry-insurance": "Seguros",
    "industry-legal": "Serviços Jurídicos",
    "industry-logistics": "Logística e Cadeia de Suprimentos",
    "industry-manufacturing": "Manufatura",
    "industry-marketing": "Marketing e Publicidade",
    "industry-mining": "Mineração e Metais",
    "industry-nonprofit": "Organizações sem Fins Lucrativos e ONGs",
    "industry-pharma": "Produtos Farmacêuticos",
    "industry-realestate": "Imobiliário",
    "industry-retail": "Varejo",
    "industry-sales": "Vendas e Desenvolvimento de Negócios",
    "industry-software": "Software e Serviços de TI",
    "industry-telecom": "Telecomunicações",
    "industry-transport": "Transporte",
    "industry-wholesale": "Atacado e Distribuição",
    
    // Specialties - Software
    "speciality-frontend": "Desenvolvimento Frontend",
    "speciality-backend": "Desenvolvimento Backend",
    "speciality-fullstack": "Desenvolvimento Fullstack",
    "speciality-mobile": "Desenvolvimento Mobile",
    "speciality-devops": "DevOps e Nuvem",
    "speciality-data_science": "Ciência de Dados e IA",
    "speciality-qa": "Garantia de Qualidade",
    
    // Specialties - Marketing
    "speciality-seo": "SEO",
    "speciality-ads": "Anúncios Pagos",
    "speciality-content": "Marketing de Conteúdo",
    "speciality-social": "Redes Sociais",
    "speciality-email": "Email Marketing",
    "speciality-analytics": "Análise de Marketing",
    
    // Specialties - Healthcare
    "speciality-nursing": "Enfermagem",
    "speciality-surgery": "Cirurgia",
    "speciality-pharmacy": "Farmácia",
    "speciality-radiology": "Radiologia",
    "speciality-primary_care": "Atenção Primária",
    "speciality-mental_health": "Saúde Mental",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "Cultivo Agrícola",
    "speciality-livestock": "Pecuária",
    "speciality-agronomy": "Agronomia",
    "speciality-agritech": "AgriTech",
    
    // Specialties - Automotive
    "speciality-ev": "Veículos Elétricos",
    "speciality-manufacturing_auto": "Fabricação de Veículos",
    "speciality-aftersales": "Pós-venda e Serviço",
    "speciality-autonomous": "Veículos Autônomos",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "Aviação Comercial",
    "speciality-defense_aero": "Defesa e Aeroespacial Militar",
    "speciality-space": "Exploração Espacial",
    "speciality-mro": "Manutenção, Reparo e Revisão",
    
    // Specialties - Banking
    "speciality-retail_banking": "Banco de Varejo",
    "speciality-investment_banking": "Banco de Investimento",
    "speciality-wealth_mgmt": "Gestão de Patrimônio",
    "speciality-fintech": "FinTech",
    
    // Specialties - Biotech
    "speciality-genomics": "Genômica",
    "speciality-therapeutics": "Terapêutica",
    "speciality-diagnostics": "Diagnóstico",
    "speciality-bioprocessing": "Bioprocessamento",
    
    // Specialties - Construction
    "speciality-residential": "Construção Residencial",
    "speciality-commercial_const": "Construção Comercial",
    "speciality-infrastructure": "Infraestrutura",
    "speciality-project_mgmt": "Gestão de Projetos",
    
    // Specialties - Consulting
    "speciality-strategy": "Consultoria Estratégica",
    "speciality-operations": "Consultoria Operacional",
    "speciality-hr_consulting": "Consultoria de RH",
    "speciality-tech_consulting": "Consultoria Tecnológica",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "Segurança de Rede",
    "speciality-app_security": "Segurança de Aplicações",
    "speciality-incident_response": "Resposta a Incidentes",
    "speciality-compliance": "Conformidade e Risco",
    
    // Specialties - Education
    "speciality-k12": "Educação Infantil e Fundamental",
    "speciality-higher_ed": "Ensino Superior",
    "speciality-edtech": "EdTech",
    "speciality-corporate_training": "Treinamento Corporativo",
    
    // Specialties - Energy
    "speciality-renewable": "Energia Renovável",
    "speciality-oil_gas": "Petróleo e Gás",
    "speciality-nuclear": "Energia Nuclear",
    "speciality-grid_mgmt": "Gestão de Rede",
    
    // Specialties - Engineering
    "speciality-civil": "Engenharia Civil",
    "speciality-mechanical": "Engenharia Mecânica",
    "speciality-electrical": "Engenharia Elétrica",
    "speciality-chemical": "Engenharia Química",
    
    // Specialties - E-commerce
    "speciality-d2c": "Direto ao Consumidor",
    "speciality-marketplace": "Operações de Marketplace",
    "speciality-logistics_ecom": "Logística de E-commerce",
    "speciality-conversion_opt": "Otimização de Conversão",
    
    // Specialties - Entertainment
    "speciality-film_tv": "Cinema e Televisão",
    "speciality-music": "Música",
    "speciality-gaming": "Jogos",
    "speciality-digital_media": "Mídia Digital",
    
    // Specialties - Fashion
    "speciality-apparel_design": "Design de Moda",
    "speciality-luxury": "Bens de Luxo",
    "speciality-fast_fashion": "Fast Fashion",
    "speciality-sustainable_fashion": "Moda Sustentável",
    
    // Specialties - Food
    "speciality-food_production": "Produção de Alimentos",
    "speciality-fandb_service": "Serviço de Alimentação",
    "speciality-beverage": "Bebidas",
    "speciality-food_safety": "Segurança Alimentar",
    
    // Specialties - Government
    "speciality-policy": "Políticas e Regulamentações",
    "speciality-public_admin": "Administração Pública",
    "speciality-defense": "Defesa",
    "speciality-public_health": "Saúde Pública",
    
    // Specialties - Hospitality
    "speciality-hotels": "Hotéis e Acomodações",
    "speciality-fandb": "Alimentos e Bebidas",
    "speciality-travel": "Serviços de Viagem",
    "speciality-events": "Eventos e Conferências",
    
    // Specialties - HR
    "speciality-recruitment": "Recrutamento",
    "speciality-comp_benefits": "Compensação e Benefícios",
    "speciality-learning_dev": "Aprendizagem e Desenvolvimento",
    "speciality-hr_operations": "Operações de RH",
    
    // Specialties - Insurance
    "speciality-life_insurance": "Seguro de Vida",
    "speciality-health_insurance": "Seguro de Saúde",
    "speciality-property_casualty": "Seguro de Propriedade e Acidentes",
    "speciality-reinsurance": "Resseguro",
    
    // Specialties - Legal
    "speciality-corp_law": "Direito Corporativo",
    "speciality-litigation": "Litígio",
    "speciality-ip_law": "Propriedade Intelectual",
    "speciality-family_law": "Direito de Família",
    
    // Specialties - Logistics
    "speciality-freight": "Frete e Carga",
    "speciality-warehousing": "Armazenagem",
    "speciality-last_mile": "Última Milha",
    "speciality-scm": "Gestão da Cadeia de Suprimentos",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "Manufatura Enxuta",
    "speciality-automation": "Automação Industrial",
    "speciality-quality_control": "Controle de Qualidade",
    "speciality-supply_chain_mfg": "Cadeia de Suprimentos",
    
    // Specialties - Mining
    "speciality-exploration": "Exploração",
    "speciality-extraction": "Extração",
    "speciality-mineral_processing": "Processamento de Minerais",
    "speciality-hse_mining": "Saúde, Segurança e Meio Ambiente",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "Captação de Recursos",
    "speciality-program_mgmt": "Gestão de Programas",
    "speciality-advocacy": "Advocacia",
    "speciality-grant_writing": "Redação de Projetos",
    
    // Specialties - Pharma
    "speciality-rnd": "P&D",
    "speciality-clinical_trials": "Ensaios Clínicos",
    "speciality-regulatory_affairs": "Assuntos Regulatórios",
    "speciality-commercial_pharma": "Comercial e Vendas",
    
    // Specialties - Real Estate
    "speciality-residential_re": "Imóveis Residenciais",
    "speciality-commercial_re": "Imóveis Comerciais",
    "speciality-property_mgmt": "Gestão de Propriedades",
    "speciality-re_investment": "Investimento Imobiliário",
    
    // Specialties - Retail
    "speciality-store_ops": "Operações de Loja",
    "speciality-merchandising": "Merchandising",
    "speciality-omnichannel": "Varejo Omnicanal",
    "speciality-category_mgmt": "Gestão de Categorias",
    
    // Specialties - Sales
    "speciality-b2b_sales": "Vendas B2B",
    "speciality-b2c_sales": "Vendas B2C",
    "speciality-account_mgmt": "Gestão de Contas",
    "speciality-sales_ops": "Operações de Vendas",
    
    // Specialties - Telecom
    "speciality-wireless": "Sem Fio",
    "speciality-broadband": "Banda Larga",
    "speciality-network_infra": "Infraestrutura de Rede",
    "speciality-telco_services": "Serviços de Telecomunicações",
    
    // Specialties - Transport
    "speciality-road_transport": "Transporte Rodoviário",
    "speciality-rail": "Transporte Ferroviário",
    "speciality-maritime": "Transporte Marítimo",
    "speciality-public_transit": "Transporte Público",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "Gestão de Distribuidores",
    "speciality-bulk_purchasing": "Compras em Massa",
    "speciality-b2b_logistics": "Logística B2B",
    "speciality-inventory_mgmt": "Gestão de Estoque",

    "industry-management": "Gestão e liderança",
    "speciality-moderation": "Moderação da comunidade",
    
    // Placeholders
    "placeholder-industry": "Selecionar setor",
    "placeholder-speciality": "Selecionar especialidade"
  },
  ja: {
    // Industries
    "industry-agriculture": "農業・畜産業",
    "industry-automotive": "自動車産業",
    "industry-aviation": "航空宇宙",
    "industry-banking": "銀行・金融サービス",
    "industry-biotech": "バイオテクノロジー",
    "industry-construction": "建設・インフラ",
    "industry-consulting": "コンサルティング",
    "industry-cybersecurity": "サイバーセキュリティ",
    "industry-education": "教育・研修",
    "industry-energy": "エネルギー・公益事業",
    "industry-engineering": "エンジニアリング",
    "industry-ecommerce": "Eコマース",
    "industry-entertainment": "エンターテイメント・メディア",
    "industry-fashion": "ファッション・アパレル",
    "industry-food": "食品・飲料",
    "industry-government": "政府・公共部門",
    "industry-healthcare": "ヘルスケア・医療",
    "industry-hospitality": "ホスピタリティ・観光",
    "industry-hr": "人事",
    "industry-insurance": "保険",
    "industry-legal": "法務サービス",
    "industry-logistics": "物流・サプライチェーン",
    "industry-manufacturing": "製造業",
    "industry-marketing": "マーケティング・広告",
    "industry-mining": "鉱業・金属",
    "industry-nonprofit": "非営利団体・NGO",
    "industry-pharma": "製薬",
    "industry-realestate": "不動産",
    "industry-retail": "小売",
    "industry-sales": "営業・事業開発",
    "industry-software": "ソフトウェア・ITサービス",
    "industry-telecom": "通信",
    "industry-transport": "運輸",
    "industry-wholesale": "卸売・流通",
    
    // Specialties - Software
    "speciality-frontend": "フロントエンド開発",
    "speciality-backend": "バックエンド開発",
    "speciality-fullstack": "フルスタック開発",
    "speciality-mobile": "モバイル開発",
    "speciality-devops": "DevOps・クラウド",
    "speciality-data_science": "データサイエンス・AI",
    "speciality-qa": "品質保証",
    
    // Specialties - Marketing
    "speciality-seo": "SEO",
    "speciality-ads": "有料広告",
    "speciality-content": "コンテンツマーケティング",
    "speciality-social": "ソーシャルメディア",
    "speciality-email": "メールマーケティング",
    "speciality-analytics": "マーケティング分析",
    
    // Specialties - Healthcare
    "speciality-nursing": "看護",
    "speciality-surgery": "外科",
    "speciality-pharmacy": "薬学",
    "speciality-radiology": "放射線科",
    "speciality-primary_care": "プライマリケア",
    "speciality-mental_health": "メンタルヘルス",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "作物栽培",
    "speciality-livestock": "畜産",
    "speciality-agronomy": "農学",
    "speciality-agritech": "農業技術",
    
    // Specialties - Automotive
    "speciality-ev": "電気自動車",
    "speciality-manufacturing_auto": "自動車製造",
    "speciality-aftersales": "アフターサービス",
    "speciality-autonomous": "自動運転車",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "商業航空",
    "speciality-defense_aero": "防衛・軍事航空宇宙",
    "speciality-space": "宇宙探査",
    "speciality-mro": "保守・修理・改修",
    
    // Specialties - Banking
    "speciality-retail_banking": "リテールバンキング",
    "speciality-investment_banking": "投資銀行業務",
    "speciality-wealth_mgmt": "資産管理",
    "speciality-fintech": "フィンテック",
    
    // Specialties - Biotech
    "speciality-genomics": "ゲノミクス",
    "speciality-therapeutics": "治療学",
    "speciality-diagnostics": "診断学",
    "speciality-bioprocessing": "バイオプロセシング",
    
    // Specialties - Construction
    "speciality-residential": "住宅建設",
    "speciality-commercial_const": "商業建築",
    "speciality-infrastructure": "インフラ",
    "speciality-project_mgmt": "プロジェクト管理",
    
    // Specialties - Consulting
    "speciality-strategy": "戦略コンサルティング",
    "speciality-operations": "オペレーションコンサルティング",
    "speciality-hr_consulting": "人事コンサルティング",
    "speciality-tech_consulting": "技術コンサルティング",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "ネットワークセキュリティ",
    "speciality-app_security": "アプリケーションセキュリティ",
    "speciality-incident_response": "インシデント対応",
    "speciality-compliance": "コンプライアンス・リスク",
    
    // Specialties - Education
    "speciality-k12": "小中高一貫教育",
    "speciality-higher_ed": "高等教育",
    "speciality-edtech": "教育技術",
    "speciality-corporate_training": "企業研修",
    
    // Specialties - Energy
    "speciality-renewable": "再生可能エネルギー",
    "speciality-oil_gas": "石油・ガス",
    "speciality-nuclear": "原子力エネルギー",
    "speciality-grid_mgmt": "グリッド管理",
    
    // Specialties - Engineering
    "speciality-civil": "土木工学",
    "speciality-mechanical": "機械工学",
    "speciality-electrical": "電気工学",
    "speciality-chemical": "化学工学",
    
    // Specialties - E-commerce
    "speciality-d2c": "直接販売",
    "speciality-marketplace": "マーケットプレイス運営",
    "speciality-logistics_ecom": "Eコマース物流",
    "speciality-conversion_opt": "コンバージョン最適化",
    
    // Specialties - Entertainment
    "speciality-film_tv": "映画・テレビ",
    "speciality-music": "音楽",
    "speciality-gaming": "ゲーム",
    "speciality-digital_media": "デジタルメディア",
    
    // Specialties - Fashion
    "speciality-apparel_design": "アパレルデザイン",
    "speciality-luxury": "高級品",
    "speciality-fast_fashion": "ファストファッション",
    "speciality-sustainable_fashion": "サステナブルファッション",
    
    // Specialties - Food
    "speciality-food_production": "食品生産",
    "speciality-fandb_service": "飲食サービス",
    "speciality-beverage": "飲料",
    "speciality-food_safety": "食品安全",
    
    // Specialties - Government
    "speciality-policy": "政策・規制",
    "speciality-public_admin": "行政",
    "speciality-defense": "防衛",
    "speciality-public_health": "公衆衛生",
    
    // Specialties - Hospitality
    "speciality-hotels": "ホテル・宿泊",
    "speciality-fandb": "飲食",
    "speciality-travel": "旅行サービス",
    "speciality-events": "イベント・会議",
    
    // Specialties - HR
    "speciality-recruitment": "採用",
    "speciality-comp_benefits": "報酬・福利厚生",
    "speciality-learning_dev": "学習・開発",
    "speciality-hr_operations": "人事オペレーション",
    
    // Specialties - Insurance
    "speciality-life_insurance": "生命保険",
    "speciality-health_insurance": "健康保険",
    "speciality-property_casualty": "損害保険",
    "speciality-reinsurance": "再保険",
    
    // Specialties - Legal
    "speciality-corp_law": "企業法務",
    "speciality-litigation": "訴訟",
    "speciality-ip_law": "知的財産権",
    "speciality-family_law": "家族法",
    
    // Specialties - Logistics
    "speciality-freight": "貨物輸送",
    "speciality-warehousing": "倉庫保管",
    "speciality-last_mile": "ラストマイル配送",
    "speciality-scm": "サプライチェーン管理",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "リーン生産",
    "speciality-automation": "産業オートメーション",
    "speciality-quality_control": "品質管理",
    "speciality-supply_chain_mfg": "サプライチェーン",
    
    // Specialties - Mining
    "speciality-exploration": "探査",
    "speciality-extraction": "採掘",
    "speciality-mineral_processing": "鉱物処理",
    "speciality-hse_mining": "健康・安全・環境",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "資金調達",
    "speciality-program_mgmt": "プログラム管理",
    "speciality-advocacy": "アドボカシー",
    "speciality-grant_writing": "助成金申請",
    
    // Specialties - Pharma
    "speciality-rnd": "研究開発",
    "speciality-clinical_trials": "臨床試験",
    "speciality-regulatory_affairs": "規制対応",
    "speciality-commercial_pharma": "営業・販売",
    
    // Specialties - Real Estate
    "speciality-residential_re": "住宅不動産",
    "speciality-commercial_re": "商業不動産",
    "speciality-property_mgmt": "不動産管理",
    "speciality-re_investment": "不動産投資",
    
    // Specialties - Retail
    "speciality-store_ops": "店舗運営",
    "speciality-merchandising": "マーチャンダイジング",
    "speciality-omnichannel": "オムニチャネル小売",
    "speciality-category_mgmt": "カテゴリー管理",
    
    // Specialties - Sales
    "speciality-b2b_sales": "B2B営業",
    "speciality-b2c_sales": "B2C営業",
    "speciality-account_mgmt": "アカウント管理",
    "speciality-sales_ops": "営業オペレーション",
    
    // Specialties - Telecom
    "speciality-wireless": "無線通信",
    "speciality-broadband": "ブロードバンド",
    "speciality-network_infra": "ネットワークインフラ",
    "speciality-telco_services": "通信サービス",
    
    // Specialties - Transport
    "speciality-road_transport": "道路輸送",
    "speciality-rail": "鉄道輸送",
    "speciality-maritime": "海上輸送",
    "speciality-public_transit": "公共交通",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "卸売業者管理",
    "speciality-bulk_purchasing": "一括購入",
    "speciality-b2b_logistics": "B2B物流",
    "speciality-inventory_mgmt": "在庫管理",
    
    "industry-management": "マネジメント＆リーダーシップ",
    "speciality-moderation": "コミュニティモデレーション",

    // Placeholders
    "placeholder-industry": "業界を選択",
    "placeholder-speciality": "専門分野を選択"
  },
  ru: {
    // Industries
    "industry-agriculture": "Сельское хозяйство и животноводство",
    "industry-automotive": "Автомобильная промышленность",
    "industry-aviation": "Авиация и космонавтика",
    "industry-banking": "Банковские и финансовые услуги",
    "industry-biotech": "Биотехнологии",
    "industry-construction": "Строительство и инфраструктура",
    "industry-consulting": "Консалтинг",
    "industry-cybersecurity": "Кибербезопасность",
    "industry-education": "Образование и обучение",
    "industry-energy": "Энергетика и коммунальные услуги",
    "industry-engineering": "Инженерия",
    "industry-ecommerce": "Электронная коммерция",
    "industry-entertainment": "Развлечения и медиа",
    "industry-fashion": "Мода и одежда",
    "industry-food": "Продукты питания и напитки",
    "industry-government": "Государственный и общественный сектор",
    "industry-healthcare": "Здравоохранение и медицина",
    "industry-hospitality": "Гостиничный бизнес и туризм",
    "industry-hr": "Управление персоналом",
    "industry-insurance": "Страхование",
    "industry-legal": "Юридические услуги",
    "industry-logistics": "Логистика и цепочки поставок",
    "industry-manufacturing": "Производство",
    "industry-marketing": "Маркетинг и реклама",
    "industry-mining": "Горнодобывающая промышленность и металлы",
    "industry-nonprofit": "Некоммерческие организации и НПО",
    "industry-pharma": "Фармацевтика",
    "industry-realestate": "Недвижимость",
    "industry-retail": "Розничная торговля",
    "industry-sales": "Продажи и развитие бизнеса",
    "industry-software": "Программное обеспечение и ИТ-услуги",
    "industry-telecom": "Телекоммуникации",
    "industry-transport": "Транспорт",
    "industry-wholesale": "Оптовая торговля и дистрибуция",
    
    // Specialties - Software
    "speciality-frontend": "Фронтенд-разработка",
    "speciality-backend": "Бэкенд-разработка",
    "speciality-fullstack": "Фуллстек-разработка",
    "speciality-mobile": "Мобильная разработка",
    "speciality-devops": "DevOps и облачные технологии",
    "speciality-data_science": "Наука о данных и ИИ",
    "speciality-qa": "Обеспечение качества",
    
    // Specialties - Marketing
    "speciality-seo": "SEO",
    "speciality-ads": "Платная реклама",
    "speciality-content": "Контент-маркетинг",
    "speciality-social": "Социальные сети",
    "speciality-email": "Email-маркетинг",
    "speciality-analytics": "Маркетинговая аналитика",
    
    // Specialties - Healthcare
    "speciality-nursing": "Сестринское дело",
    "speciality-surgery": "Хирургия",
    "speciality-pharmacy": "Фармация",
    "speciality-radiology": "Радиология",
    "speciality-primary_care": "Первичная помощь",
    "speciality-mental_health": "Психическое здоровье",
    
    // Specialties - Agriculture
    "speciality-crop_farming": "Растениеводство",
    "speciality-livestock": "Животноводство",
    "speciality-agronomy": "Агрономия",
    "speciality-agritech": "Агротехнологии",
    
    // Specialties - Automotive
    "speciality-ev": "Электромобили",
    "speciality-manufacturing_auto": "Производство автомобилей",
    "speciality-aftersales": "Послепродажное обслуживание",
    "speciality-autonomous": "Автономные транспортные средства",
    
    // Specialties - Aviation
    "speciality-commercial_aviation": "Коммерческая авиация",
    "speciality-defense_aero": "Оборона и военная авиация",
    "speciality-space": "Космические исследования",
    "speciality-mro": "Техническое обслуживание и ремонт",
    
    // Specialties - Banking
    "speciality-retail_banking": "Розничный банкинг",
    "speciality-investment_banking": "Инвестиционный банкинг",
    "speciality-wealth_mgmt": "Управление благосостоянием",
    "speciality-fintech": "Финтех",
    
    // Specialties - Biotech
    "speciality-genomics": "Геномика",
    "speciality-therapeutics": "Терапевтика",
    "speciality-diagnostics": "Диагностика",
    "speciality-bioprocessing": "Биопроцессинг",
    
    // Specialties - Construction
    "speciality-residential": "Жилищное строительство",
    "speciality-commercial_const": "Коммерческое строительство",
    "speciality-infrastructure": "Инфраструктура",
    "speciality-project_mgmt": "Управление проектами",
    
    // Specialties - Consulting
    "speciality-strategy": "Стратегический консалтинг",
    "speciality-operations": "Операционный консалтинг",
    "speciality-hr_consulting": "Консалтинг по персоналу",
    "speciality-tech_consulting": "Технологический консалтинг",
    
    // Specialties - Cybersecurity
    "speciality-network_security": "Сетевая безопасность",
    "speciality-app_security": "Безопасность приложений",
    "speciality-incident_response": "Реагирование на инциденты",
    "speciality-compliance": "Соответствие и риски",
    
    // Specialties - Education
    "speciality-k12": "Школьное образование",
    "speciality-higher_ed": "Высшее образование",
    "speciality-edtech": "Образовательные технологии",
    "speciality-corporate_training": "Корпоративное обучение",
    
    // Specialties - Energy
    "speciality-renewable": "Возобновляемая энергия",
    "speciality-oil_gas": "Нефть и газ",
    "speciality-nuclear": "Ядерная энергия",
    "speciality-grid_mgmt": "Управление сетями",
    
    // Specialties - Engineering
    "speciality-civil": "Гражданское строительство",
    "speciality-mechanical": "Механическая инженерия",
    "speciality-electrical": "Электротехника",
    "speciality-chemical": "Химическая инженерия",
    
    // Specialties - E-commerce
    "speciality-d2c": "Прямые продажи потребителям",
    "speciality-marketplace": "Операции маркетплейса",
    "speciality-logistics_ecom": "Логистика электронной коммерции",
    "speciality-conversion_opt": "Оптимизация конверсии",
    
    // Specialties - Entertainment
    "speciality-film_tv": "Кино и телевидение",
    "speciality-music": "Музыка",
    "speciality-gaming": "Игры",
    "speciality-digital_media": "Цифровые медиа",
    
    // Specialties - Fashion
    "speciality-apparel_design": "Дизайн одежды",
    "speciality-luxury": "Предметы роскоши",
    "speciality-fast_fashion": "Быстрая мода",
    "speciality-sustainable_fashion": "Устойчивая мода",
    
    // Specialties - Food
    "speciality-food_production": "Производство продуктов",
    "speciality-fandb_service": "Общественное питание",
    "speciality-beverage": "Напитки",
    "speciality-food_safety": "Безопасность пищевых продуктов",
    
    // Specialties - Government
    "speciality-policy": "Политика и регулирование",
    "speciality-public_admin": "Государственное управление",
    "speciality-defense": "Оборона",
    "speciality-public_health": "Общественное здравоохранение",
    
    // Specialties - Hospitality
    "speciality-hotels": "Отели и размещение",
    "speciality-fandb": "Питание и напитки",
    "speciality-travel": "Туристические услуги",
    "speciality-events": "Мероприятия и конференции",
    
    // Specialties - HR
    "speciality-recruitment": "Рекрутинг",
    "speciality-comp_benefits": "Компенсации и льготы",
    "speciality-learning_dev": "Обучение и развитие",
    "speciality-hr_operations": "Операции по персоналу",
    
    // Specialties - Insurance
    "speciality-life_insurance": "Страхование жизни",
    "speciality-health_insurance": "Медицинское страхование",
    "speciality-property_casualty": "Страхование имущества и ответственности",
    "speciality-reinsurance": "Перестрахование",
    
    // Specialties - Legal
    "speciality-corp_law": "Корпоративное право",
    "speciality-litigation": "Судебные процессы",
    "speciality-ip_law": "Интеллектуальная собственность",
    "speciality-family_law": "Семейное право",
    
    // Specialties - Logistics
    "speciality-freight": "Грузоперевозки",
    "speciality-warehousing": "Складское хозяйство",
    "speciality-last_mile": "Последняя миля",
    "speciality-scm": "Управление цепочками поставок",
    
    // Specialties - Manufacturing
    "speciality-lean_mfg": "Бережливое производство",
    "speciality-automation": "Промышленная автоматизация",
    "speciality-quality_control": "Контроль качества",
    "speciality-supply_chain_mfg": "Цепочка поставок",
    
    // Specialties - Mining
    "speciality-exploration": "Разведка",
    "speciality-extraction": "Добыча",
    "speciality-mineral_processing": "Переработка минералов",
    "speciality-hse_mining": "Здоровье, безопасность и окружающая среда",
    
    // Specialties - Nonprofit
    "speciality-fundraising": "Сбор средств",
    "speciality-program_mgmt": "Управление программами",
    "speciality-advocacy": "Адвокация",
    "speciality-grant_writing": "Написание грантов",
    
    // Specialties - Pharma
    "speciality-rnd": "НИОКР",
    "speciality-clinical_trials": "Клинические исследования",
    "speciality-regulatory_affairs": "Регуляторные вопросы",
    "speciality-commercial_pharma": "Коммерция и продажи",
    
    // Specialties - Real Estate
    "speciality-residential_re": "Жилая недвижимость",
    "speciality-commercial_re": "Коммерческая недвижимость",
    "speciality-property_mgmt": "Управление недвижимостью",
    "speciality-re_investment": "Инвестиции в недвижимость",
    
    // Specialties - Retail
    "speciality-store_ops": "Операции магазина",
    "speciality-merchandising": "Мерчандайзинг",
    "speciality-omnichannel": "Омниканальная розница",
    "speciality-category_mgmt": "Управление категориями",
    
    // Specialties - Sales
    "speciality-b2b_sales": "B2B продажи",
    "speciality-b2c_sales": "B2C продажи",
    "speciality-account_mgmt": "Управление клиентами",
    "speciality-sales_ops": "Операции продаж",
    
    // Specialties - Telecom
    "speciality-wireless": "Беспроводная связь",
    "speciality-broadband": "Широкополосный доступ",
    "speciality-network_infra": "Сетевая инфраструктура",
    "speciality-telco_services": "Телекоммуникационные услуги",
    
    // Specialties - Transport
    "speciality-road_transport": "Автомобильный транспорт",
    "speciality-rail": "Железнодорожный транспорт",
    "speciality-maritime": "Морской транспорт",
    "speciality-public_transit": "Общественный транспорт",
    
    // Specialties - Wholesale
    "speciality-distributor_mgmt": "Управление дистрибьюторами",
    "speciality-bulk_purchasing": "Оптовые закупки",
    "speciality-b2b_logistics": "B2B логистика",
    "speciality-inventory_mgmt": "Управление запасами",
    
    "industry-management": "Управление и лидерство",
    "speciality-moderation": "Модерация сообщества",
    
    // Placeholders
    "placeholder-industry": "Выберите отрасль",
    "placeholder-speciality": "Выберите специализацию"
  }
};

const UserFormMsgs_translations = { 
  en: {
    updateSuccess: "Your information has been successfully updated.",
    updateError: "Failed to update your information. Please try again.",
    firstNameRequired: "First name is required.",
    lastNameRequired: "Last name is required.",
    countryRequired: "Country is required.",
    headlineInvalid: "Headline must be between 2 and 100 characters.",
    availabilityRequired: "Availability is required.",
    congratsTitle: "Congratulations!",
    congratsMessage: "Your profile is fully completed! You earned 20 coins."
  },

  fr: {
    updateSuccess: "Vos informations ont été mises à jour avec succès.",
    updateError: "Échec de la mise à jour de vos informations. Veuillez réessayer.",
    firstNameRequired: "Le prénom est requis.",
    lastNameRequired: "Le nom est requis.",
    countryRequired: "Le pays est requis.",
    headlineInvalid: "Le titre professionnel doit contenir entre 2 et 100 caractères.",
    availabilityRequired: "La disponibilité est requise.",
    congratsTitle: "Félicitations !",
    congratsMessage: "Votre profil est complété à 100% ! Vous avez gagné 20 coins."
  },

  ar: {
    updateSuccess: "تم تحديث معلوماتك بنجاح.",
    updateError: "فشل تحديث معلوماتك. يرجى المحاولة مرة أخرى.",
    firstNameRequired: "الاسم الأول مطلوب.",
    lastNameRequired: "اسم العائلة مطلوب.",
    countryRequired: "البلد مطلوب.",
    headlineInvalid: "يجب أن يحتوي المسمى الوظيفي على 2 إلى 100 حرف.",
    availabilityRequired: "التوفر مطلوب.",
    congratsTitle: "تهانينا!",
    congratsMessage: "اكتمل ملفك الشخصي بالكامل! لقد ربحت 20 قطعة نقدية."
  },

  es: {
    updateSuccess: "Tu información ha sido actualizada correctamente.",
    updateError: "Error al actualizar tu información. Inténtalo de nuevo.",
    firstNameRequired: "El nombre es requerido.",
    lastNameRequired: "El apellido es requerido.",
    countryRequired: "El país es requerido.",
    headlineInvalid: "El título profesional debe tener entre 2 y 100 caracteres.",
    availabilityRequired: "La disponibilidad es requerida.",
    congratsTitle: "¡Felicitaciones!",
    congratsMessage: "¡Tu perfil está completamente completo! Has ganado 20 monedas."
  },

  zh: {
    updateSuccess: "您的信息已成功更新。",
    updateError: "更新信息失败，请重试。",
    firstNameRequired: "名字是必填项。",
    lastNameRequired: "姓氏是必填项。",
    countryRequired: "国家是必填项。",
    headlineInvalid: "职位头衔必须在2到100个字符之间。",
    availabilityRequired: "可用状态是必填项。",
    congratsTitle: "🎉 恭喜！",
    congratsMessage: "您的个人资料已完全填写！您获得了20个硬币。"
  },

  de: {
    updateSuccess: "Ihre Informationen wurden erfolgreich aktualisiert.",
    updateError: "Fehler beim Aktualisieren Ihrer Informationen. Bitte versuchen Sie es erneut.",
    firstNameRequired: "Vorname ist erforderlich.",
    lastNameRequired: "Nachname ist erforderlich.",
    countryRequired: "Land ist erforderlich.",
    headlineInvalid: "Die Berufsbezeichnung muss zwischen 2 und 100 Zeichen lang sein.",
    availabilityRequired: "Verfügbarkeit ist erforderlich.",
    congratsTitle: "Glückwunsch!",
    congratsMessage: "Ihr Profil ist vollständig ausgefüllt! Sie haben 20 Münzen verdient."
  },

  pt: {
    updateSuccess: "Suas informações foram atualizadas com sucesso.",
    updateError: "Falha ao atualizar suas informações. Tente novamente.",
    firstNameRequired: "O nome é obrigatório.",
    lastNameRequired: "O sobrenome é obrigatório.",
    countryRequired: "O país é obrigatório.",
    headlineInvalid: "O título profissional deve ter entre 2 e 100 caracteres.",
    availabilityRequired: "A disponibilidade é obrigatória.",
    congratsTitle: "Parabéns!",
    congratsMessage: "Seu perfil está completamente preenchido! Você ganhou 20 moedas."
  },

  ja: {
    updateSuccess: "情報が正常に更新されました。",
    updateError: "情報の更新に失敗しました。もう一度お試しください。",
    firstNameRequired: "名は必須です。",
    lastNameRequired: "姓は必須です。",
    countryRequired: "国は必須です。",
    headlineInvalid: "職種は2文字以上100文字以下である必要があります。",
    availabilityRequired: "稼働状況は必須です。",
    congratsTitle: "おめでとうございます！",
    congratsMessage: "プロフィールが完全に入力されました！20コインを獲得しました。"
  },

  ru: {
    updateSuccess: "Ваши данные успешно обновлены.",
    updateError: "Не удалось обновить данные. Попробуйте снова.",
    firstNameRequired: "Имя обязательно.",
    lastNameRequired: "Фамилия обязательна.",
    countryRequired: "Страна обязательна.",
    headlineInvalid: "Должность должна содержать от 2 до 100 символов.",
    availabilityRequired: "Доступность обязательна.",
    congratsTitle: "Поздравляем!",
    congratsMessage: "Ваш профиль полностью заполнен! Вы заработали 20 монет."
  }
};

const UserForm_translationsHistory = {
  en: {
    "page-title": "Activity",
    "page-description": "Track your actions and coins usage over time",
    "filter-search": "Search file or action...",
    "filter-from": "From",
    "filter-to": "To",
    "filter-btn": "Filter",

    "history-title": "Your activity history",
    "table-coins": "Coins",
    "table-description": "Description",
    "table-date": "Date",
    "empty-history-chart": "Your history will show here",
    "no-history": "No history available",

    "kpi-available": "Available Coins",
    "kpi-used": "Coins Used (30d)",
    "kpi-last": "Last Activity"
  },

  fr: {
    "page-title": "Activité",
    "page-description": "Suivez vos actions et l'utilisation de vos pièces au fil du temps",
    "filter-search": "Rechercher un fichier ou une action...",
    "filter-from": "De",
    "filter-to": "À",
    "filter-btn": "Filtrer",

    "history-title": "Votre historique d'activité",
    "table-coins": "Pièces",
    "table-description": "Description",
    "table-date": "Date",
    "empty-history-chart": "Votre historique apparaîtra ici",
    "no-history": "Aucun historique disponible",

    "kpi-available": "Pièces disponibles",
    "kpi-used": "Pièces utilisées (30j)",
    "kpi-last": "Dernière activité"
  },

  ar: {
    "page-title": "النشاط",
    "page-description": "تتبع نشاطك واستخدام العملات بمرور الوقت",
    "filter-search": "ابحث عن ملف أو نشاط...",
    "filter-from": "من",
    "filter-to": "إلى",
    "filter-btn": "تصفية",

    "history-title": "سجل نشاطك",
    "table-coins": "العملات",
    "table-description": "الوصف",
    "table-date": "التاريخ",
    "empty-history-chart": "سجل النشاط الخاص بك سوف يظهر هنا",
    "no-history": "لا يوجد سجل متاح",

    "kpi-available": "العملات المتاحة",
    "kpi-used": "العملات المستخدمة (٣٠ يومًا)",
    "kpi-last": "آخر نشاط"
  },

  es: {
    "page-title": "Actividad",
    "page-description": "Realiza un seguimiento de tus acciones y el uso de monedas a lo largo del tiempo",
    "filter-search": "Buscar archivo o acción...",
    "filter-from": "Desde",
    "filter-to": "Hasta",
    "filter-btn": "Filtrar",

    "history-title": "Tu historial de actividad",
    "table-coins": "Monedas",
    "table-description": "Descripción",
    "table-date": "Fecha",
    "empty-history-chart": "Tu historial se mostrará aquí",
    "no-history": "No hay historial disponible",

    "kpi-available": "Monedas disponibles",
    "kpi-used": "Monedas usadas (30d)",
    "kpi-last": "Última actividad"
  },

  zh: {
    "page-title": "活动",
    "page-description": "跟踪您的操作和币使用情况",
    "filter-search": "搜索文件或操作...",
    "filter-from": "从",
    "filter-to": "到",
    "filter-btn": "筛选",

    "history-title": "您的活动记录",
    "table-coins": "币",
    "table-description": "描述",
    "table-date": "日期",
    "empty-history-chart": "您的历史记录将显示在这里",
    "no-history": "暂无历史记录",

    "kpi-available": "可用币",
    "kpi-used": "已用币 (30天)",
    "kpi-last": "最近活动"
  },

  de: {
    "page-title": "Aktivität",
    "page-description": "Verfolgen Sie Ihre Aktionen und die Nutzung Ihrer Münzen im Laufe der Zeit",
    "filter-search": "Datei oder Aktion suchen...",
    "filter-from": "Von",
    "filter-to": "Bis",
    "filter-btn": "Filtern",

    "history-title": "Ihr Aktivitätsverlauf",
    "table-coins": "Münzen",
    "table-description": "Beschreibung",
    "table-date": "Datum",
    "empty-history-chart": "Ihr Verlauf wird hier angezeigt",
    "no-history": "Kein Verlauf verfügbar",

    "kpi-available": "Verfügbare Münzen",
    "kpi-used": "Genutzte Münzen (30T)",
    "kpi-last": "Letzte Aktivität"
  },

  pt: {
    "page-title": "Atividade",
    "page-description": "Acompanhe suas ações e o uso de moedas ao longo do tempo",
    "filter-search": "Pesquisar arquivo ou ação...",
    "filter-from": "De",
    "filter-to": "Até",
    "filter-btn": "Filtrar",

    "history-title": "Seu histórico de atividade",
    "table-coins": "Moedas",
    "table-description": "Descrição",
    "table-date": "Data",
    "empty-history-chart": "Seu histórico será exibido aqui",
    "no-history": "Nenhum histórico disponível",

    "kpi-available": "Moedas disponíveis",
    "kpi-used": "Moedas usadas (30d)",
    "kpi-last": "Última atividade"
  },

  ja: {
    "page-title": "アクティビティ",
    "page-description": "操作履歴とコインの使用状況を追跡します",
    "filter-search": "ファイルまたは操作を検索...",
    "filter-from": "開始",
    "filter-to": "終了",
    "filter-btn": "フィルター",

    "history-title": "アクティビティ履歴",
    "table-coins": "コイン",
    "table-description": "説明",
    "table-date": "日付",
    "empty-history-chart": "履歴はここに表示されます",
    "no-history": "履歴はありません",

    "kpi-available": "利用可能コイン",
    "kpi-used": "使用コイン (30日)",
    "kpi-last": "最終アクティビティ"
  },

  ru: {
    "page-title": "Активность",
    "page-description": "Отслеживайте свои действия и использование монет с течением времени",
    "filter-search": "Поиск файла или действия...",
    "filter-from": "С",
    "filter-to": "По",
    "filter-btn": "Фильтр",

    "history-title": "История активности",
    "table-coins": "Монеты",
    "table-description": "Описание",
    "table-date": "Дата",
    "empty-history-chart": "Ваша история будет показана здесь",
    "no-history": "История отсутствует",

    "kpi-available": "Доступные монеты",
    "kpi-used": "Использовано монет (30д)",
    "kpi-last": "Последняя активность"
  }
};

const UserForm_translationsPay = {
  en: {

    "title": "Billing",
    "description": "Increase your balance to unlock more actions",

    "label-select-pack": "Select Coins Pack:",
    "label-custom-coins": "Enter Custom Coins:",
    "label-payment-method": "Payment Method:",
    "btn-purchase": "Order Coins",

    "table-order-title": "Your Coins Orders",
    "table-order-date": "Order Date",
    "table-method": "Payment Method",
    "table-status": "Status",
    "table-description": "Description",
    "table-price": "Price",
    "table-currency": "Currency",
    "table-payment-address": "Payment Address",
    "table-instructions": "Instructions",
    "table-deadline": "Deadline",
    "table-reference": "Reference",
    "table-payment-date": "Payment Date",
    "table-proof": "Proof",
    "table-confirmation": "Confirmation",
    "no-orders": "No orders available",

    "available-methods": "Available Payment Methods",

    "note-orders":
      "Your new orders will appear here once submitted. You can contact us anytime if you need to update or confirm your order.",

    "secure-title": "Secure & Personalized Purchase:",
    "secure-line1":
      "Once you submit this form, our team will contact you directly to confirm your order and guide you through the payment process.",
    "secure-line2":
      "We work manually to ensure safe transactions, quick coin activation, and personalized assistance for every user.",
    "secure-line3":
      "You can pay using PayPal, Western Union, Stripe (manual), Google Pay, or bank transfer, whichever feels most convenient for you.",
    "secure-line4":
      "Our priority is your confidence, security, and satisfaction. You're in good hands."
  },

  fr: {

    "title": "Facturation",
    "description": "Augmentez votre solde pour débloquer plus d'actions",

    "label-select-pack": "Choisir un pack de pièces :",
    "label-custom-coins": "Entrer un nombre personnalisé de pièces :",
    "label-payment-method": "Méthode de paiement :",
    "btn-purchase": "Commander des pièces",

    "table-order-title": "Vos commandes de pièces",
    "table-order-date": "Date de commande",
    "table-method": "Méthode de paiement",
    "table-status": "Statut",
    "table-description": "Description",
    "table-price": "Prix",
    "table-currency": "Devise",
    "table-payment-address": "Adresse de paiement",
    "table-instructions": "Instructions",
    "table-deadline": "Date limite",
    "table-reference": "Référence",
    "table-payment-date": "Date de paiement",
    "table-proof": "Justificatif",
    "table-confirmation": "Confirmation",
    "no-orders": "Aucune commande disponible",

    "available-methods": "Méthodes de paiement disponibles",

    "note-orders":
      "Vos nouvelles commandes apparaîtront ici une fois envoyées. Vous pouvez nous contacter à tout moment pour mettre à jour ou confirmer votre commande.",

    "secure-title": "Achat sécurisé et personnalisé :",
    "secure-line1":
      "Une fois le formulaire envoyé, notre équipe vous contactera directement pour confirmer votre commande et vous guider dans le paiement.",
    "secure-line2":
      "Nous travaillons manuellement pour garantir des transactions sûres, une activation rapide des pièces, et une assistance personnalisée.",
    "secure-line3":
      "Vous pouvez payer via PayPal, Western Union, Stripe (manuel), Google Pay ou virement bancaire, selon ce qui vous convient le mieux.",
    "secure-line4":
      "Notre priorité est votre confiance, votre sécurité et votre satisfaction. Vous êtes entre de bonnes mains."
  },

  ar: {

    "title": "الفواتير",
    "description": "زيادة رصيدك لفتح المزيد من الإجراءات",

    "label-select-pack": "اختر حزمة العملات:",
    "label-custom-coins": "أدخل عددًا مخصصًا من العملات:",
    "label-payment-method": "طريقة الدفع:",
    "btn-purchase": "طلب العملات",

    "table-order-title": "طلبات العملات الخاصة بك",
    "table-order-date": "تاريخ الطلب",
    "table-method": "طريقة الدفع",
    "table-status": "الحالة",
    "table-description": "الوصف",
    "table-price": "السعر",
    "table-currency": "العملة",
    "table-payment-address": "عنوان الدفع",
    "table-instructions": "التعليمات",
    "table-deadline": "الموعد النهائي",
    "table-reference": "المرجع",
    "table-payment-date": "تاريخ الدفع",
    "table-proof": "إثبات الدفع",
    "table-confirmation": "التأكيد",
    "no-orders": "لا توجد طلبات متاحة",

    "available-methods": "طرق الدفع المتاحة",

    "note-orders":
      "ستظهر طلباتك الجديدة هنا بعد إرسالها. يمكنك التواصل معنا في أي وقت لتحديث أو تأكيد طلبك.",

    "secure-title": "شراء آمن ومخصص:",
    "secure-line1":
      "بعد إرسال النموذج، سيتواصل معك فريقنا مباشرة لتأكيد طلبك وتوجيهك في عملية الدفع.",
    "secure-line2":
      "نعمل يدويًا لضمان معاملات آمنة، وتفعيل سريع للعملات، ومساعدة شخصية لكل مستخدم.",
    "secure-line3":
      "يمكنك الدفع عبر PayPal أو Western Union أو Stripe اليدوي أو Google Pay أو التحويل البنكي، حسب ما يناسبك.",
    "secure-line4":
      "أولويتنا هي ثقتك وأمانك ورضاك. أنت في أيدٍ أمينة."
  },

  es: {

    "title": "Facturación",
    "description": "Aumenta tu saldo para desbloquear más acciones",

    "label-select-pack": "Seleccionar paquete de monedas:",
    "label-custom-coins": "Ingresar monedas personalizadas:",
    "label-payment-method": "Método de pago:",
    "btn-purchase": "Ordenar monedas",

    "table-order-title": "Tus pedidos de monedas",
    "table-order-date": "Fecha del pedido",
    "table-method": "Método de pago",
    "table-status": "Estado",
    "table-description": "Descripción",
    "table-price": "Precio",
    "table-currency": "Moneda",
    "table-payment-address": "Dirección de pago",
    "table-instructions": "Instrucciones",
    "table-deadline": "Fecha límite",
    "table-reference": "Referencia",
    "table-payment-date": "Fecha de pago",
    "table-proof": "Comprobante",
    "table-confirmation": "Confirmación",
    "no-orders": "No hay pedidos disponibles",

    "available-methods": "Métodos de pago disponibles",

    "note-orders":
      "Tus nuevos pedidos aparecerán aquí una vez enviados. Puedes contactarnos en cualquier momento si necesitas actualizar o confirmar tu pedido.",

    "secure-title": "Compra segura y personalizada:",
    "secure-line1":
      "Una vez enviado el formulario, nuestro equipo te contactará directamente para confirmar tu pedido y guiarte en el proceso de pago.",
    "secure-line2":
      "Trabajamos manualmente para garantizar transacciones seguras, activación rápida de monedas y asistencia personalizada.",
    "secure-line3":
      "Puedes pagar con PayPal, Western Union, Stripe manual, Google Pay o transferencia bancaria.",
    "secure-line4":
      "Nuestra prioridad es tu confianza, seguridad y satisfacción. Estás en buenas manos."
  },

  zh: {

    "title": "账单",
    "description": "增加余额以解锁更多操作",

    "label-select-pack": "选择币套餐：",
    "label-custom-coins": "输入自定义币数量：",
    "label-payment-method": "付款方式：",
    "btn-purchase": "订购币",

    "table-order-title": "币订单",
    "table-order-date": "订单日期",
    "table-method": "付款方式",
    "table-status": "状态",
    "table-description": "描述",
    "table-price": "价格",
    "table-currency": "货币",
    "table-payment-address": "付款地址",
    "table-instructions": "说明",
    "table-deadline": "截止日期",
    "table-reference": "参考号",
    "table-payment-date": "付款日期",
    "table-proof": "付款凭证",
    "table-confirmation": "确认",
    "no-orders": "暂无订单",

    "available-methods": "可用的付款方式",

    "note-orders":
      "提交后，你的新订单将显示在这里。如需更新或确认订单，可随时联系我们。",

    "secure-title": "安全且个性化的购买：",
    "secure-line1":
      "提交表单后，我们的团队会直接联系你以确认订单，并指导你完成付款过程。",
    "secure-line2":
      "我们采用人工处理，以确保安全交易、快速激活币，并为每位用户提供个性化协助。",
    "secure-line3":
      "你可以使用 PayPal、Western Union、Stripe（人工）、Google Pay 或银行转账进行付款。",
    "secure-line4":
      "我们的首要任务是你的信任、安全与满意。你完全可以放心。"
  },

  de: {

    "title": "Abrechnung",
    "description": "Erhöhen Sie Ihr Guthaben, um weitere Aktionen freizuschalten",

    "label-select-pack": "Münzpaket auswählen:",
    "label-custom-coins": "Benutzerdefinierte Münzen eingeben:",
    "label-payment-method": "Zahlungsmethode:",
    "btn-purchase": "Münzen bestellen",

    "table-order-title": "Ihre Münzbestellungen",
    "table-order-date": "Bestelldatum",
    "table-method": "Zahlungsmethode",
    "table-status": "Status",
    "table-description": "Beschreibung",
    "table-price": "Preis",
    "table-currency": "Währung",
    "table-payment-address": "Zahlungsadresse",
    "table-instructions": "Anweisungen",
    "table-deadline": "Frist",
    "table-reference": "Referenz",
    "table-payment-date": "Zahlungsdatum",
    "table-proof": "Nachweis",
    "table-confirmation": "Bestätigung",
    "no-orders": "Keine Bestellungen verfügbar",

    "available-methods": "Verfügbare Zahlungsmethoden",

    "note-orders":
      "Ihre neuen Bestellungen erscheinen hier, sobald sie eingereicht wurden. Sie können uns jederzeit kontaktieren, wenn Sie Ihre Bestellung aktualisieren oder bestätigen möchten.",

    "secure-title": "Sicherer & personalisierter Kauf:",
    "secure-line1":
      "Nachdem Sie das Formular eingereicht haben, wird unser Team Sie direkt kontaktieren, um Ihre Bestellung zu bestätigen und Sie durch den Zahlungsprozess zu führen.",
    "secure-line2":
      "Wir arbeiten manuell, um sichere Transaktionen, schnelle Münzaktivierung und persönliche Unterstützung zu gewährleisten.",
    "secure-line3":
      "Sie können mit PayPal, Western Union, Stripe (manuell), Google Pay oder Banküberweisung bezahlen.",
    "secure-line4":
      "Unsere Priorität ist Ihr Vertrauen, Ihre Sicherheit und Ihre Zufriedenheit. Sie sind in guten Händen."
  },

  pt: {

    "title": "Faturamento",
    "description": "Aumente seu saldo para desbloquear mais ações",

    "label-select-pack": "Selecionar pacote de moedas:",
    "label-custom-coins": "Inserir moedas personalizadas:",
    "label-payment-method": "Método de pagamento:",
    "btn-purchase": "Pedir moedas",

    "table-order-title": "Seus pedidos de moedas",
    "table-order-date": "Data do pedido",
    "table-method": "Método de pagamento",
    "table-status": "Status",
    "table-description": "Descrição",
    "table-price": "Preço",
    "table-currency": "Moeda",
    "table-payment-address": "Endereço de pagamento",
    "table-instructions": "Instruções",
    "table-deadline": "Prazo",
    "table-reference": "Referência",
    "table-payment-date": "Data de pagamento",
    "table-proof": "Comprovante",
    "table-confirmation": "Confirmação",
    "no-orders": "Nenhum pedido disponível",

    "available-methods": "Métodos de pagamento disponíveis",

    "note-orders":
      "Seus novos pedidos aparecerão aqui após serem enviados. Você pode nos contatar a qualquer momento para atualizar ou confirmar seu pedido.",

    "secure-title": "Compra segura e personalizada:",
    "secure-line1":
      "Após enviar o formulário, nossa equipe entrará em contato diretamente para confirmar seu pedido e guiá-lo no processo de pagamento.",
    "secure-line2":
      "Trabalhamos manualmente para garantir transações seguras, ativação rápida de moedas e assistência personalizada.",
    "secure-line3":
      "Você pode pagar via PayPal, Western Union, Stripe manual, Google Pay ou transferência bancária.",
    "secure-line4":
      "Nossa prioridade é sua confiança, segurança e satisfação. Você está em boas mãos."
  },

  ja: {

    "title": "請求",
    "description": "残高を増やして、より多くのアクションをアンロック",

    "label-select-pack": "コインパックを選択：",
    "label-custom-coins": "カスタムコインを入力：",
    "label-payment-method": "支払い方法：",
    "btn-purchase": "コインを注文",

    "table-order-title": "コイン注文一覧",
    "table-order-date": "注文日",
    "table-method": "支払い方法",
    "table-status": "ステータス",
    "table-description": "説明",
    "table-price": "価格",
    "table-currency": "通貨",
    "table-payment-address": "支払い先アドレス",
    "table-instructions": "手順",
    "table-deadline": "期限",
    "table-reference": "参照番号",
    "table-payment-date": "支払い日",
    "table-proof": "支払い証明",
    "table-confirmation": "確認",
    "no-orders": "利用可能な注文はありません",

    "available-methods": "利用可能な支払い方法",

    "note-orders":
      "送信後、新しい注文はここに表示されます。注文の更新や確認が必要な場合は、いつでもお問い合わせください。",

    "secure-title": "安全でパーソナライズされた購入：",
    "secure-line1":
      "フォーム送信後、チームが直接ご連絡し、注文の確認と支払い手続きのご案内をいたします。",
    "secure-line2":
      "安全な取引、迅速なコイン反映、そして個別サポートを確実にするため手作業で対応しています。",
    "secure-line3":
      "支払い方法は PayPal、Western Union、Stripe（手動）、Google Pay、または銀行振込をご利用いただけます。",
    "secure-line4":
      "私たちの最優先は、あなたの信頼・安全・満足です。ご安心ください。"
  },

  ru: {

    "title": "Оплата",
    "description": "Увеличьте баланс, чтобы открыть больше действий",

    "label-select-pack": "Выберите пакет монет:",
    "label-custom-coins": "Введите количество монет:",
    "label-payment-method": "Способ оплаты:",
    "btn-purchase": "Заказать монеты",

    "table-order-title": "Ваши заказы монет",
    "table-order-date": "Дата заказа",
    "table-method": "Способ оплаты",
    "table-status": "Статус",
    "table-description": "Описание",
    "table-price": "Цена",
    "table-currency": "Валюта",
    "table-payment-address": "Адрес для оплаты",
    "table-instructions": "Инструкции",
    "table-deadline": "Срок",
    "table-reference": "Ссылка",
    "table-payment-date": "Дата оплаты",
    "table-proof": "Подтверждение",
    "table-confirmation": "Подтверждение",
    "no-orders": "Нет доступных заказов",

    "available-methods": "Доступные способы оплаты",

    "note-orders":
      "Новые заказы появятся здесь после отправки. Вы можете связаться с нами в любое время, чтобы обновить или подтвердить заказ.",

    "secure-title": "Безопасная и персонализированная покупка:",
    "secure-line1":
      "После отправки формы наша команда свяжется с вами для подтверждения заказа и поможет пройти процесс оплаты.",
    "secure-line2":
      "Мы работаем вручную, чтобы обеспечить безопасные транзакции, быстрое начисление монет и персональную поддержку.",
    "secure-line3":
      "Оплата возможна через PayPal, Western Union, Stripe (вручную), Google Pay или банковский перевод.",
    "secure-line4":
      "Наш приоритет — ваше доверие, безопасность и удовлетворённость. Вы в надёжных руках."
  }
};

const saveCoinsOrderTranslations = {
  en: {
    notLoggedInMessage: "Please log in to order your coins.",
    incompleteProfile: "Please complete your profile to order coins.",
    invalidCustomCoins: "Please enter a valid custom coins amount (min 10).",
    orderSaved: "Your order has been saved. Our team will contact you soon to confirm the payment.",
    orderError: "Failed to save order.",
  },

  fr: {
    notLoggedInMessage: "Veuillez vous connecter pour commander des pièces.",
    incompleteProfile: "Veuillez compléter votre profil pour commander des pièces.",
    invalidCustomCoins: "Veuillez entrer un nombre de pièces personnalisé valide (minimum 10).",
    orderSaved: "Votre commande a été enregistrée. Notre équipe vous contactera bientôt pour confirmer le paiement.",
    orderError: "Échec de l'enregistrement de la commande.",
  },

  ar: {
    notLoggedInMessage: "الرجاء تسجيل الدخول لطلب العملات.",
    incompleteProfile: "يرجى إكمال ملفك الشخصي لطلب العملات.",
    invalidCustomCoins: "يرجى إدخال عدد عملات مخصص صالح (الحد الأدنى 10).",
    orderSaved: "تم حفظ طلبك. سيتواصل معك فريقنا قريبًا لتأكيد عملية الدفع.",
    orderError: "فشل في حفظ الطلب.",
  },

  es: {
    notLoggedInMessage: "Por favor, inicia sesión para ordenar tus monedas.",
    incompleteProfile: "Por favor, completa tu perfil para ordenar monedas.",
    invalidCustomCoins: "Ingresa una cantidad válida de monedas personalizadas (mínimo 10).",
    orderSaved: "Tu pedido ha sido guardado. Nuestro equipo te contactará pronto para confirmar el pago.",
    orderError: "Error al guardar el pedido.",
  },

  zh: {
    notLoggedInMessage: "请登录以订购币。",
    incompleteProfile: "请完善您的个人资料以订购币。",
    invalidCustomCoins: "请输入有效的自定义币数量（至少 10）。",
    orderSaved: "您的订单已保存。我们的团队会尽快联系您确认付款。",
    orderError: "保存订单失败。",
  },

  de: {
    notLoggedInMessage: "Bitte melden Sie sich an, um Münzen zu bestellen.",
    incompleteProfile: "Bitte vervollständigen Sie Ihr Profil, um Münzen zu bestellen.",
    invalidCustomCoins: "Bitte geben Sie eine gültige benutzerdefinierte Münzanzahl ein (mind. 10).",
    orderSaved: "Ihre Bestellung wurde gespeichert. Unser Team wird Sie bald kontaktieren, um die Zahlung zu bestätigen.",
    orderError: "Fehler beim Speichern der Bestellung.",
  },

  pt: {
    notLoggedInMessage: "Faça login para pedir suas moedas.",
    incompleteProfile: "Complete seu perfil para pedir moedas.",
    invalidCustomCoins: "Insira uma quantidade válida de moedas personalizadas (mínimo 10).",
    orderSaved: "Seu pedido foi salvo. Nossa equipe entrará em contato em breve para confirmar o pagamento.",
    orderError: "Falha ao salvar o pedido.",
  },

  ja: {
    notLoggedInMessage: "コインを注文するにはログインしてください。",
    incompleteProfile: "コインを注文するにはプロフィールを完成させてください。",
    invalidCustomCoins: "有効なカスタムコイン数を入力してください（最低 10）。",
    orderSaved: "ご注文は保存されました。支払い確認のため、近日中にチームからご連絡いたします。",
    orderError: "注文の保存に失敗しました。",
  },

  ru: {
    notLoggedInMessage: "Пожалуйста, войдите в систему, чтобы заказать монеты.",
    incompleteProfile: "Пожалуйста, заполните профиль, чтобы заказать монеты.",
    invalidCustomCoins: "Введите корректное количество монет (минимум 10).",
    orderSaved: "Ваш заказ сохранён. Наша команда скоро свяжется с вами для подтверждения оплаты.",
    orderError: "Не удалось сохранить заказ.",
  }
};

const UserForm_translationsSecurity = {
  en: {
    "title": "Security",
    "description": "Control your account safety and data preferences",

    "profile-privacy": "Profile Privacy",
    "profile-privacy-desc": "Control who can see your profile information",
    "profile-visibility-label": "Profile Visibility:",
    "visibility-public": "Public (everyone)",
    "visibility-registered": "Registered users only",
    "visibility-verified": "Only verified users",
    "visibility-private": "Private (only me)",

    "field-visibility": "Field-Level Visibility",
    "field-visibility-desc":
      "Choose which personal details are visible on your profile.<br>Hidden fields will not be shared with other users.",
    "email": "Email",
    "phone": "Phone",
    "location": "Location",

    "password-title": "Password & Login",
    "password-desc": "Secure access to your account",
    "change-password": "Change Password",

    "data-usage": "Data Usage Preferences",
    "data-usage-desc": "Help us improve by sharing anonymous usage data.",
    "read-more": "Read more",
    "product-improvements": "Product improvements",
    "personalization": "Personalization",
    "marketing": "Marketing communications",

    "data-export": "Data Export & Portability",
    "data-export-desc":
      "Download a copy of your personal data in a structured and secure format.<br>This includes your profile information, activity history, and preferences.",
    "export-btn": "Export My Data",

    "save": "Save changes"
  },

  fr: {
    "title": "Sécurité",
    "description": "Contrôlez la sécurité de votre compte et vos préférences",

    "profile-privacy": "Confidentialité du profil",
    "profile-privacy-desc": "Contrôlez qui peut voir vos informations",
    "profile-visibility-label": "Visibilité du profil :",
    "visibility-public": "Public (tout le monde)",
    "visibility-registered": "Utilisateurs inscrits seulement",
    "visibility-verified": "Utilisateurs vérifiés uniquement",
    "visibility-private": "Privé (seulement moi)",

    "field-visibility": "Visibilité des champs",
    "field-visibility-desc":
      "Choisissez quelles informations sont visibles.<br>Les champs cachés ne seront pas partagés.",
    "email": "Email",
    "phone": "Téléphone",
    "location": "Localisation",

    "password-title": "Mot de passe & Connexion",
    "password-desc": "Sécurisez l’accès à votre compte",
    "change-password": "Changer le mot de passe",

    "data-usage": "Préférences d'utilisation des données",
    "data-usage-desc": "Aidez-nous à améliorer avec des données anonymes.",
    "read-more": "Lire plus",
    "product-improvements": "Amélioration du produit",
    "personalization": "Personnalisation",
    "marketing": "Communication marketing",

    "data-export": "Export des données",
    "data-export-desc":
      "Téléchargez vos données personnelles dans un format sécurisé.",
    "export-btn": "Exporter mes données",

    "save": "Enregistrer"
  },

  ar: {
    "title": "الأمان",
    "description": "التحكم في أمان حسابك وتفضيلاتك",

    "profile-privacy": "خصوصية الملف الشخصي",
    "profile-privacy-desc": "تحكم في من يمكنه رؤية معلوماتك",
    "profile-visibility-label": "رؤية الملف الشخصي:",
    "visibility-public": "عام (الجميع)",
    "visibility-registered": "المستخدمون المسجلون فقط",
    "visibility-verified": "المستخدمون الموثقون فقط",
    "visibility-private": "خاص (أنا فقط)",

    "field-visibility": "رؤية الحقول",
    "field-visibility-desc":
      "اختر المعلومات التي تظهر في ملفك الشخصي.<br>الحقول المخفية لن تتم مشاركتها.",
    "email": "البريد الإلكتروني",
    "phone": "الهاتف",
    "location": "الموقع",

    "password-title": "كلمة المرور وتسجيل الدخول",
    "password-desc": "تأمين الوصول إلى حسابك",
    "change-password": "تغيير كلمة المرور",

    "data-usage": "تفضيلات استخدام البيانات",
    "data-usage-desc": "ساعدنا على التحسين عبر بيانات مجهولة.",
    "read-more": "اقرأ المزيد",
    "product-improvements": "تحسين المنتج",
    "personalization": "التخصيص",
    "marketing": "التسويق",

    "data-export": "تصدير البيانات",
    "data-export-desc":
      "قم بتنزيل نسخة من بياناتك بشكل آمن ومنظم.",
    "export-btn": "تصدير بياناتي",

    "save": "حفظ التغييرات"
  },

  es: {
    "title": "Seguridad",
    "description": "Controla la seguridad de tu cuenta y tus preferencias de datos",

    "profile-privacy": "Privacidad del perfil",
    "profile-privacy-desc": "Controla quién puede ver la información de tu perfil",
    "profile-visibility-label": "Visibilidad del perfil:",
    "visibility-public": "Público (todos)",
    "visibility-registered": "Solo usuarios registrados",
    "visibility-verified": "Solo usuarios verificados",
    "visibility-private": "Privado (solo yo)",

    "field-visibility": "Visibilidad por campo",
    "field-visibility-desc":
      "Elige qué datos personales son visibles en tu perfil.<br>Los campos ocultos no se compartirán con otros usuarios.",
    "email": "Correo electrónico",
    "phone": "Teléfono",
    "location": "Ubicación",

    "password-title": "Contraseña e inicio de sesión",
    "password-desc": "Acceso seguro a tu cuenta",
    "change-password": "Cambiar contraseña",

    "data-usage": "Preferencias de uso de datos",
    "data-usage-desc": "Ayúdanos a mejorar compartiendo datos anónimos de uso.",
    "read-more": "Leer más",
    "product-improvements": "Mejoras del producto",
    "personalization": "Personalización",
    "marketing": "Comunicaciones de marketing",

    "data-export": "Exportación y portabilidad de datos",
    "data-export-desc":
      "Descarga una copia de tus datos personales en un formato estructurado y seguro.<br>Esto incluye la información de tu perfil, historial de actividad y preferencias.",
    "export-btn": "Exportar mis datos",

    "save": "Guardar cambios"
  },

  zh: {
    "title": "安全设置",
    "description": "控制您的账户安全和数据偏好",

    "profile-privacy": "个人资料隐私",
    "profile-privacy-desc": "控制谁可以看到您的个人资料信息",
    "profile-visibility-label": "个人资料可见性：",
    "visibility-public": "公开（所有人）",
    "visibility-registered": "仅限注册用户",
    "visibility-verified": "仅限认证用户",
    "visibility-private": "私密（仅自己）",

    "field-visibility": "字段级可见性",
    "field-visibility-desc":
      "选择哪些个人信息在您的个人资料中可见。<br>隐藏的字段不会与其他用户共享。",
    "email": "电子邮箱",
    "phone": "电话号码",
    "location": "位置",

    "password-title": "密码与登录",
    "password-desc": "安全访问您的账户",
    "change-password": "修改密码",

    "data-usage": "数据使用偏好",
    "data-usage-desc": "通过分享匿名使用数据帮助我们改进产品。",
    "read-more": "了解更多",
    "product-improvements": "产品改进",
    "personalization": "个性化推荐",
    "marketing": "营销通讯",

    "data-export": "数据导出与迁移",
    "data-export-desc":
      "以结构化且安全的格式下载您的个人数据副本。<br>这包括您的个人资料信息、活动记录和偏好设置。",
    "export-btn": "导出我的数据",

    "save": "保存更改"
  },

  de: {
    "title": "Sicherheit",
    "description": "Kontrollieren Sie die Sicherheit Ihres Kontos und Ihre Dateneinstellungen",

    "profile-privacy": "Profildatenschutz",
    "profile-privacy-desc": "Bestimmen Sie, wer Ihre Profilinformationen sehen kann",
    "profile-visibility-label": "Profilsichtbarkeit:",
    "visibility-public": "Öffentlich (alle)",
    "visibility-registered": "Nur registrierte Benutzer",
    "visibility-verified": "Nur verifizierte Benutzer",
    "visibility-private": "Privat (nur ich)",

    "field-visibility": "Feldbezogene Sichtbarkeit",
    "field-visibility-desc":
      "Wählen Sie aus, welche persönlichen Daten in Ihrem Profil sichtbar sind.<br>Ausgeblendete Felder werden nicht mit anderen Benutzern geteilt.",
    "email": "E-Mail",
    "phone": "Telefon",
    "location": "Standort",

    "password-title": "Passwort & Anmeldung",
    "password-desc": "Sicherer Zugang zu Ihrem Konto",
    "change-password": "Passwort ändern",

    "data-usage": "Datennutzungseinstellungen",
    "data-usage-desc": "Helfen Sie uns, indem Sie anonyme Nutzungsdaten teilen.",
    "read-more": "Mehr erfahren",
    "product-improvements": "Produktverbesserungen",
    "personalization": "Personalisierung",
    "marketing": "Marketingkommunikation",

    "data-export": "Datenexport & Übertragbarkeit",
    "data-export-desc":
      "Laden Sie eine Kopie Ihrer persönlichen Daten in einem strukturierten und sicheren Format herunter.<br>Dies umfasst Ihre Profilinformationen, Aktivitätsverlauf und Einstellungen.",
    "export-btn": "Meine Daten exportieren",

    "save": "Änderungen speichern"
  },

  pt: {
    "title": "Segurança",
    "description": "Controle a segurança da sua conta e preferências de dados",

    "profile-privacy": "Privacidade do perfil",
    "profile-privacy-desc": "Controle quem pode ver as informações do seu perfil",
    "profile-visibility-label": "Visibilidade do perfil:",
    "visibility-public": "Público (todos)",
    "visibility-registered": "Apenas usuários registrados",
    "visibility-verified": "Apenas usuários verificados",
    "visibility-private": "Privado (apenas eu)",

    "field-visibility": "Visibilidade por campo",
    "field-visibility-desc":
      "Escolha quais dados pessoais são visíveis no seu perfil.<br>Campos ocultos não serão compartilhados com outros usuários.",
    "email": "E-mail",
    "phone": "Telefone",
    "location": "Localização",

    "password-title": "Senha e login",
    "password-desc": "Acesso seguro à sua conta",
    "change-password": "Alterar senha",

    "data-usage": "Preferências de uso de dados",
    "data-usage-desc": "Ajude-nos a melhorar compartilhando dados anônimos de uso.",
    "read-more": "Leia mais",
    "product-improvements": "Melhorias do produto",
    "personalization": "Personalização",
    "marketing": "Comunicações de marketing",

    "data-export": "Exportação e portabilidade de dados",
    "data-export-desc":
      "Baixe uma cópia dos seus dados pessoais em um formato estruturado e seguro.<br>Isso inclui as informações do seu perfil, histórico de atividades e preferências.",
    "export-btn": "Exportar meus dados",

    "save": "Salvar alterações"
  },

  ja: {
    "title": "セキュリティ",
    "description": "アカウントの安全性とデータ設定を管理",

    "profile-privacy": "プロフィールプライバシー",
    "profile-privacy-desc": "プロフィール情報を表示できるユーザーを制御",
    "profile-visibility-label": "プロフィール公開範囲：",
    "visibility-public": "公開（全員）",
    "visibility-registered": "登録ユーザーのみ",
    "visibility-verified": "認証済みユーザーのみ",
    "visibility-private": "非公開（本人のみ）",

    "field-visibility": "項目別公開設定",
    "field-visibility-desc":
      "プロフィールで表示する個人情報を選択します。<br>非表示にした項目は他のユーザーと共有されません。",
    "email": "メールアドレス",
    "phone": "電話番号",
    "location": "所在地",

    "password-title": "パスワードとログイン",
    "password-desc": "アカウントへの安全なアクセス",
    "change-password": "パスワードを変更",

    "data-usage": "データ利用設定",
    "data-usage-desc": "匿名の利用データを共有して、サービス改善にご協力ください。",
    "read-more": "詳細を見る",
    "product-improvements": "製品改善",
    "personalization": "パーソナライズ",
    "marketing": "マーケティング通知",

    "data-export": "データエクスポートとポータビリティ",
    "data-export-desc":
      "個人データのコピーを構造化された安全な形式でダウンロードします。<br>プロフィール情報、アクティビティ履歴、設定が含まれます。",
    "export-btn": "データをエクスポート",

    "save": "変更を保存"
  },

  ru: {
    "title": "Безопасность",
    "description": "Управляйте безопасностью аккаунта и настройками данных",

    "profile-privacy": "Конфиденциальность профиля",
    "profile-privacy-desc": "Управляйте тем, кто видит информацию вашего профиля",
    "profile-visibility-label": "Видимость профиля:",
    "visibility-public": "Публичный (все)",
    "visibility-registered": "Только зарегистрированные пользователи",
    "visibility-verified": "Только верифицированные пользователи",
    "visibility-private": "Приватный (только я)",

    "field-visibility": "Видимость полей",
    "field-visibility-desc":
      "Выберите, какие личные данные видны в вашем профиле.<br>Скрытые поля не будут доступны другим пользователям.",
    "email": "Электронная почта",
    "phone": "Телефон",
    "location": "Местоположение",

    "password-title": "Пароль и вход",
    "password-desc": "Безопасный доступ к вашему аккаунту",
    "change-password": "Изменить пароль",

    "data-usage": "Настройки использования данных",
    "data-usage-desc": "Помогите нам улучшить сервис, поделившись анонимными данными об использовании.",
    "read-more": "Подробнее",
    "product-improvements": "Улучшение продукта",
    "personalization": "Персонализация",
    "marketing": "Маркетинговые коммуникации",

    "data-export": "Экспорт и переносимость данных",
    "data-export-desc":
      "Загрузите копию ваших личных данных в структурированном и безопасном формате.<br>Сюда входит информация профиля, история активности и настройки.",
    "export-btn": "Экспортировать мои данные",

    "save": "Сохранить изменения"
  }
};