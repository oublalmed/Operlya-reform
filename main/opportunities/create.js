// ================================= Import Firebase SDKs ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, serverTimestamp, onSnapshot, updateDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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
let currentEditingTaskId = null;
let currentEditingJobId = null;
let currentEditingInternshipId = null;
let currentEditingVolunteerId = null;
let currentEditingChallengeId = null;
let currentEditingMentorshipId = null;
let currentEditingResearchId = null;
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
    updateUserSection(user);
    loadUserDrafts(user);
    draftsContainer.classList.toggle("collapsed");
  } else {
    updateUserSection(null);
  }
});

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
      <div class="topbar-cta guest-actions">
        <button id="loginButton" class="nav_flagButton">
          <i class="ri-login-circle-line"></i> ${t["userlogin"]}
        </button>
        
        <button id="themeToggleBtn" class="nav_theme-button">
          <i class="ri-moon-line" id="themeIcon"></i>
        </button>
      </div>
    `;

    document.getElementById("loginButton").addEventListener("click", () => {
      openLoginModal();
    });

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
    .querySelectorAll("#navbarAvatar1, #navbarAvatar2")
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

function openLoginModal() {
  requestAnimationFrame(() => {
    document
      .getElementById("loginModalPage")
      ?.classList.add("active");
  });
}

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

// ================================ LOADING TASK =================================

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const editTaskId = params.get("edit");
  if (!editTaskId) return;
  const user = auth.currentUser;
  if (!user) {
    onAuthStateChanged(auth, async (user) => {
      if (user) await loadOpportunityForEditing(editTaskId);
    });
  } else {
    await loadOpportunityForEditing(editTaskId);
  }
});

async function loadOpportunityForEditing(opportunityId) {
  const docRef = doc(db, "opportunities", opportunityId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    alert("Opportunity not found");
    return;
  }

  const data = snap.data();
  const type = (data.category || "").toLowerCase();

  showCreatePage(type);

  if (type === "tasks" || type === "task") {
    await populateTaskDraft(opportunityId);
    currentEditingTaskId = opportunityId;

  } else if (type === "jobs" || type === "job") {
    await populateJobDraft(opportunityId);
    currentEditingJobId = opportunityId;
  } else if (type === "internships" || type === "internship") {
    await populateInternshipDraft(opportunityId);
    currentEditingInternshipId = opportunityId;
  } else if (type === "volunteers" || type === "volunteer") {
    await populateVolunteerDraft(opportunityId);
    currentEditingVolunteerId = opportunityId;
  } else if (type === "challenges" || type === "challenge") {
    await populateChallengeDraft(opportunityId);
    currentEditingChallengeId = opportunityId;
  } else if (type === "mentorships" || type === "mentorship") {
    await populateMentorshipDraft(opportunityId);
    currentEditingMentorshipId = opportunityId;
  } else if (type === "researchs" || type === "research") {
    await populateResearchDraft(opportunityId);
    currentEditingResearchId = opportunityId;
  } else {
    console.warn("Unknown type, fallback to Task:", type);

    showCreatePage("tasks");
    await populateTaskDraft(opportunityId);
    currentEditingTaskId = opportunityId;
  }
}

function showCreatePage(type) {
  const isTask = type === "tasks" || type === "task";
  const isJob = type === "jobs" || type === "job";

  const targetId = isTask ? "taskPage" : isJob ? "jobPage" : "taskPage";

  document.querySelectorAll("#addNewPages > div").forEach(p => {
    p.style.display = (p.id === targetId) ? "block" : "none";
  });

  document.querySelectorAll(".rightMiniBar-inner .rmb-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.target === `#${targetId}`);
  });
}

// ================================ Industries ===================================

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

function loadIndustries(selectId, selectedIndustry = "") {
  const selectedLang = getCurrentLang();
  const t = Industry_Speciality_translations[selectedLang] || Industry_Speciality_translations["en"];

  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = `<option value="">${t["placeholder-industry"]}</option>`;

  INDUSTRIES.forEach(ind => {
    const opt = document.createElement("option");
    opt.value = ind.id;
    opt.textContent = t[ind.nameKey] || ind.nameKey;

    if (ind.id === selectedIndustry) opt.selected = true;

    select.appendChild(opt);
  });
}

function loadSpecialties(selectId, selectedSpeciality = "") {
  const selectedLang = getCurrentLang();
  const t = Industry_Speciality_translations[selectedLang] || Industry_Speciality_translations["en"];

  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = `<option value="">${t["placeholder-speciality"]}</option>`;

  SPECIALTIES.forEach(spec => {
    const opt = document.createElement("option");
    opt.value = spec.id;
    opt.textContent = t[spec.nameKey] || spec.nameKey;

    if (spec.id === selectedSpeciality) opt.selected = true;

    select.appendChild(opt);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadIndustries("task_industry");
  loadSpecialties("task_speciality");

  loadIndustries("job_industry");
  loadSpecialties("job_speciality");

  loadIndustries("internship_industry");
  loadSpecialties("internship_speciality");

  loadIndustries("volunteer_industry");
  loadSpecialties("volunteer_speciality");

  loadIndustries("challenge_industry");
  loadSpecialties("challenge_speciality");

  loadIndustries("mentorship_industry");
  loadSpecialties("mentorship_speciality");
});

// ================================ App Starting =================================

document.addEventListener('DOMContentLoaded', () => {
  AddSkillTasks('skills');
  AddSkillTasks('langs');

  AddSkillJob('skills');
  AddSkillJob('langs');

  AddSkillIntern('skills');
  AddSkillIntern('langs');

  AddSkillVolunteer('skills');
  AddSkillVolunteer('langs');

  AddSkillChallenge('skills');
  AddSkillChallenge('langs');

  AddSkillMentorship('skills');
  AddSkillMentorship('langs');

  AddSkillResearch('skills');
  AddSkillResearch('langs');
});

// ================================ Skills Adding =================================



// ================================ Navigate Tasks =================================

function initTabs(navId, pagesId, pageClass = "horizontal-newTaskPage") {
    const nav = document.getElementById(navId);
    const pagesContainer = document.getElementById(pagesId);

    if (!nav || !pagesContainer) return;

    const buttons = nav.querySelectorAll("button");
    const pages = pagesContainer.querySelectorAll(`.${pageClass}`);

    function show(target) {
        const id = target.replace("#", "");

        pages.forEach(p => {
            p.style.display = (p.id === id) ? "block" : "none";
        });

        buttons.forEach(b => {
            b.classList.toggle("active", b.dataset.target === target);
        });
    }

    buttons.forEach(b => {
        b.addEventListener("click", () => show(b.dataset.target));
    });

    if (buttons.length) show(buttons[0].dataset.target);
}

function initSwitcher(containerSelector, pageSelector) {
    const container = document.querySelector(containerSelector);
    const buttons = container.querySelectorAll(".rmb-item");
    const pages = document.querySelectorAll(pageSelector);

    if (!container) return;

    function show(targetId) {
        const cleanId = targetId.replace("#", "");

        pages.forEach(p => {
            p.style.display = (p.id === cleanId) ? "block" : "none";
        });

        buttons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.target === targetId);
        });
    }

    buttons.forEach(btn => {
        if (btn.classList.contains("disabled")) return;

        btn.addEventListener("click", () => {
            show(btn.dataset.target);
        });
    });

    // Init default
    const activeBtn = container.querySelector(".rmb-item.active");
    if (activeBtn) {
        show(activeBtn.dataset.target);
    }
}

document.addEventListener("DOMContentLoaded", () => {
  initTabs("newTaskNavs", "newTaskPages");
  initTabs("newJobNavs", "newJobPages");
  initTabs("newVolunteerNavs", "newVolunteerPages");
  initTabs("newInternshipNavs", "newInternshipPages");
  initTabs("newChallengeNavs", "newChallengePages");
  initTabs("newMentorshipNavs", "newMentorshipPages");
  initTabs("newResearchNavs", "newResearchPages");

  initSwitcher(".rightMiniBar-inner", "#addNewPages > div");
});

// ====================================================================================
// ================================= TASKS SETTINGS ===================================
// ====================================================================================

const skillCounters = {
  skills: 0,
  langs: 0
};

function AddSkillTasks(type) {
  const selectedLang = getCurrentLang();
  const T = App_translations[selectedLang] || App_translations['en'];

  const listId = type === 'skills'
    ? 'taskSkills-skills'
    : 'taskSkills-Langs';

  const container = document.getElementById(listId);
  if (!container) return;

  const skillIndex = ++skillCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  // input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder =
    type === 'langs'
      ? "English, French, Spanish..."
      : "JavaScript, Logistics, Marketing...";
  input.name = `${skillId}-name`;

  // rating group
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;

    const label = document.createElement('label');
    label.setAttribute('for', radio.id);

    ratingGroup.appendChild(radio);
    ratingGroup.appendChild(label);
  }

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
  };

  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);
}

document.getElementById('taskAddSkill').addEventListener('click', () => AddSkillTasks('skills'));
document.getElementById('taskAddLang').addEventListener('click', () => AddSkillTasks('langs'));

const task_distanceInput = document.getElementById("task_max_distance_km");
const task_distanceSlider = document.getElementById("task_max_distance_slider");
function updateTasksSlider(value) {
  const min = task_distanceSlider.min;
  const max = task_distanceSlider.max;
  const percent = ((value - min) / (max - min)) * 100;

  task_distanceSlider.style.background = `linear-gradient(
    to right,
    #3b82f6 0%,
    #3b82f6 ${percent}%,
    #ddd ${percent}%,
    #ddd 100%
  )`;
}
task_distanceSlider.addEventListener("input", () => {
  task_distanceInput.value = task_distanceSlider.value;
  updateTasksSlider(task_distanceSlider.value);
});
task_distanceInput.addEventListener("input", () => {
  let value = Number(task_distanceInput.value);

  if (value < task_distanceSlider.min) value = task_distanceSlider.min;
  if (value > task_distanceSlider.max) value = task_distanceSlider.max;

  task_distanceSlider.value = value;
  updateTasksSlider(value);
});
updateTasksSlider(task_distanceSlider.value);

// =================================== DRAFT TASKS ================================

async function loadUserDrafts(user) {
  const selectedLang = getCurrentLang();
  const t = messages_translations[selectedLang] || messages_translations['en'];

  const draftsContainer = document.getElementById("draftsContainer");
  const draftsGrid = document.getElementById("draftsGrid");
  const draftsCount = document.getElementById("draftsCount");

  draftsGrid.innerHTML = "";

  const q = query(
    collection(db, "opportunities"),
    where("ownerId", "==", user.uid),
    where("status", "==", "Draft")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    draftsContainer.style.display = "none";
    return;
  }

  draftsContainer.style.display = "grid";
  draftsCount.textContent = snap.size;

  snap.forEach(docSnap => {
    const data = docSnap.data();

    let createdDate = "";
    if (data.createdAt?.toDate) {
      createdDate = data.createdAt.toDate().toLocaleDateString();
    }

    const card = document.createElement("div");
    card.className = "draftCard";

    card.innerHTML = `
      <h4>${data.title || "Untitled Draft"}</h4>

      <p class="draftDesc">
        ${data.description ? data.description.substring(0,120) : ""}
      </p>

      <div class="draftMeta">
        <i class="ri-time-line"></i>
        ${createdDate}
      </div>
    `;

    card.addEventListener("click", async () => {
      const draftId = docSnap.id;
      const data = docSnap.data();

      const type = (data.category || "").toLowerCase();

      const isTask = type === "task" || type === "tasks";
      const isJob = type === "job" || type === "jobs";
      const isInternship = type === "internship" || type === "internships";
      const isVolunteer = type === "volunteer" || type === "volunteers";
      const isChallenge = type === "challenge" || type === "challenges";
      const isMentorship = type === "mentorship" || type === "mentorships";
      const isResearch = type === "research" || type === "researchs";

      const isEmpty =
          isTask ? isTaskEmpty() :
          isJob ? isJobEmpty() :
          isInternship ? isInternshipEmpty() :
          isVolunteer ? isVolunteerEmpty() :
          isChallenge ? isVolunteerEmpty() :
          isMentorship ? isMentorshipEmpty() :
          isResearch ? isResearchEmpty() :
          true;

      const loadDraft = async () => {
          if (isTask) {
              await populateTaskDraft(draftId);
          } else if (isJob) {
              await populateJobDraft(draftId);
          } else if (isInternship) {
              await populateInternshipDraft(draftId);
          } else if (isVolunteer) {
              await populateVolunteerDraft(draftId);
          } else if (isChallenge) {
              await populateChallengeDraft(draftId);
          } else if (isMentorship) {
              await populateMentorshipDraft(draftId);
          } else if (isResearch) {
              await populateResearchDraft(draftId);
          }
      };

      if (!isEmpty) {
        showNotification({
          type: "warning",
          title: t.draftReplaceTitle,
          message: t.draftReplaceMessage,
          onConfirm: loadDraft
        });
        return;
      }

      await loadDraft();
    });

    draftsGrid.appendChild(card);
  });
}

document.getElementById('draftsToggleBtn').addEventListener('click', () => {
  draftsContainer.classList.toggle("collapsed");
});

function isTaskEmpty() {
  const title = document.getElementById("task_title").value.trim();
  const description = document.getElementById("task_goal").value.trim();
  return !title && !description;
}

async function populateTaskDraft(opportunityId) {
  const selectedLang = getCurrentLang();
  const t = messages_translations[selectedLang] || messages_translations['en'];
  
  cleanTaskForm();

  const docRef = doc(db, "opportunities", opportunityId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    alert("Draft not found.");
    return;
  }

  const data = snap.data();

  loadIndustries(data.industry);
  loadSpecialties(data.industry, data.speciality);

  // ===== BASIC =====
  document.getElementById("task_title").value = data.title || "";
  document.getElementById("task_goal").value = data.description || "";
  document.getElementById("task_type").value = data.type || "";
  document.getElementById("task_industry").value = data.industry || "";
  document.getElementById("task_speciality").value = data.speciality || "";

  // ===== SCHEDULE =====
  if (data.schedule) {
    document.getElementById("task_start_date").value = data.schedule.startDate || "";
    document.getElementById("task_end_date").value = data.schedule.endDate || "";
    document.getElementById("task_hard_deadline").value = data.schedule.deadline || "";
    document.getElementById("task_estimated_duration").value = data.schedule.estimatedDuration || 0;
  }

  setRadio("Task-Exec", data.executionEntity);
  setRadio("Task-TaskScale", data.taskScale);
  setRadio("Task-ExecMode", data.workSetting);
  setRadio("Task-Engine", data.workDynamics);
  setRadio("Task-Submit", data.submissionType);
  setRadio("Task-TaskTimeFlex", data.schedule?.timeFlexibility);
  setRadio("Task-EvalMeth", data.evaluation?.method);

  document.getElementById("task_max_executors").value = data.maxExecutors || 1;
  document.getElementById("task_instructions").value = data.instructions || "";

  // ===== LOCATION =====
  if (data.location) {
    document.getElementById("task_location").value = data.location.reference || "";
    document.getElementById("task_max_distance_km").value = data.location.maxDistanceKm || 0;
  }

  // ===== PRICE =====
  if (data.price) {
    document.getElementById("task_price").value = data.price.amount || 0;
    document.getElementById("task_priceCurrency").value = data.price.currency || "USD";
  }

  document.getElementById("task_payment_model").value = data.paymentModel || "Fixed";

  // ===== EVALUATION =====
  if (data.evaluation?.criteria) {
    setCheckbox("task_criteria_deadline", data.evaluation.criteria.deadlineRespected);
    setCheckbox("task_criteria_requirements", data.evaluation.criteria.requirementsFulfilled);
    setCheckbox("task_criteria_quality", data.evaluation.criteria.qualityScore);
    setCheckbox("task_criteria_client", data.evaluation.criteria.clientApproval);
    document.getElementById("task_criteria_min_score").value =
      data.evaluation.criteria.minScore || 0;
  }

  if (data.evaluation?.revision) {
    setCheckbox("task_revision_allowed", data.evaluation.revision.allowed);
    document.getElementById("task_max_attempts").value =
      data.evaluation.revision.maxAttempts || 0;
  }

  // ===== ADDITIONAL COSTS =====
  if (data.additionalCosts) {
    setCheckbox("task_cover_materials", data.additionalCosts.materials);
    setCheckbox("task_cover_transport", data.additionalCosts.transport);
    setCheckbox("task_cover_tools", data.additionalCosts.tools);
    setCheckbox("task_cover_accommodation", data.additionalCosts.accommodation);
    setCheckbox("task_cover_fees", data.additionalCosts.fees);
    document.getElementById("task_reimbursement_mode").value =
      data.additionalCosts.reimbursementMode || "";
  }

  // ===== GUARANTEES =====
  if (data.guarantees) {
    setCheckbox("task_late_penalty", data.guarantees.latePenalty);
    document.getElementById("task_late_penalty_percent").value =
      data.guarantees.latePenaltyPercent || 0;
    setCheckbox("task_damage_liability", data.guarantees.damageLiability);
    setCheckbox("task_replacement_required", data.guarantees.replacementRequired);
  }

  // ===== SKILLS =====
  if (data.skills && data.skills.length > 0) {
    const skillsContainer = document.getElementById("taskSkills-skills");
    skillsContainer.innerHTML = "";

    data.skills.forEach(skill => {
      AddSkillTasks("skills");

      const groups = skillsContainer.querySelectorAll(".navCard-requiresGroup");
      const lastGroup = groups[groups.length - 1];

      lastGroup.querySelector("input[type='text']").value = skill.name;

      const radio = lastGroup.querySelector(
        `input[type="radio"][value="${skill.score}"]`
      );
      if (radio) radio.checked = true;
    });
  }

  // ===== LANGUAGES =====
  if (data.languages && data.languages.length > 0) {
    const langContainer = document.getElementById("taskSkills-Langs");
    langContainer.innerHTML = "";

    data.languages.forEach(lang => {
      AddSkillTasks("langs");

      const groups = langContainer.querySelectorAll(".navCard-requiresGroup");
      const lastGroup = groups[groups.length - 1];

      lastGroup.querySelector("input[type='text']").value = lang.name;

      const radio = lastGroup.querySelector(
        `input[type="radio"][value="${lang.score}"]`
      );
      if (radio) radio.checked = true;
    });
  }

  currentEditingTaskId = opportunityId;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function isJobEmpty() {
  const title = document.getElementById("job_title").value.trim();
  const description = document.getElementById("job_goal").value.trim();
  return !title && !description;
}

async function populateJobDraft(opportunityId) {
  const selectedLang = getCurrentLang();
  const t = messages_translations[selectedLang] || messages_translations['en'];

  const docRef = doc(db, "opportunities", opportunityId);
  const snap = await getDoc(docRef);

  cleanJobForm();

  if (!snap.exists()) {
    alert(t.draftNotFound);
    return;
  }

  const data = snap.data();

  // ===== BASIC =====
  document.getElementById("job_title").value = data.title || "";
  document.getElementById("job_goal").value = data.description || "";

  document.getElementById("job_industry").value = data.industry || "";
  document.getElementById("job_speciality").value = data.speciality || "";

  // ===== SCHEDULE =====
  if (data.schedule) {
    document.getElementById("application_start_date").value = data.schedule.startDate || "";
    document.getElementById("application_end_date").value = data.schedule.endDate || "";
    document.getElementById("application_deadline").value = data.schedule.applicationDeadline || "";
  }

  // ===== WORK CONDITIONS =====
  setRadio("job_seniority", data.seniority);
  setRadio("job-ExecMode", data.workSetting);

  document.getElementById("job_numb_positions").value = data.positions || 1;

  if (data.location) {
    document.getElementById("job_location").value = data.location.reference || "";
    document.getElementById("job_max_distance_km").value = data.location.maxDistanceKm || 0;
  }

  // ===== SKILLS =====
  if (data.skills?.length) {
    const container = document.getElementById("jobSkills-skills");
    container.innerHTML = "";

    data.skills.forEach(skill => {
      AddSkillJob("skills");

      const groups = container.querySelectorAll(".navCard-requiresGroup");
      const last = groups[groups.length - 1];

      last.querySelector("input[type='text']").value = skill.name;

      const radio = last.querySelector(`input[type="radio"][value="${skill.score}"]`);
      if (radio) radio.checked = true;
    });
  }

  // ===== LANGUAGES =====
  if (data.languages?.length) {
    const container = document.getElementById("jobSkills-Langs");
    container.innerHTML = "";

    data.languages.forEach(lang => {
      AddSkillJob("langs");

      const groups = container.querySelectorAll(".navCard-requiresGroup");
      const last = groups[groups.length - 1];

      last.querySelector("input[type='text']").value = lang.name;

      const radio = last.querySelector(`input[type="radio"][value="${lang.score}"]`);
      if (radio) radio.checked = true;
    });
  }

  // ===== EVALUATION =====
  if (data.evaluation) {
    setRadio("Job-EvalMeth", data.evaluation.method);

    if (data.evaluation.criteria) {
      setCheckbox("job_criteria_commitment", data.evaluation.criteria.commitment);
      setCheckbox("job_criteria_objectives", data.evaluation.criteria.objectives);
      setCheckbox("job_criteria_performance", data.evaluation.criteria.performance);
      setCheckbox("job_criteria_team", data.evaluation.criteria.team);

      document.getElementById("job_criteria_min_score").value =
        data.evaluation.criteria.minScore || 0;
    }
  }

  // ===== SALARY =====
  if (data.salary) {
    document.getElementById("job_salary_negotiable").checked = data.salary.negotiable || false;

    document.getElementById("job_salary_min").value = data.salary.min || 0;
    document.getElementById("job_salary_max").value = data.salary.max || 0;
    document.getElementById("job_priceCurrency").value = data.salary.currency || "";
  }

  // ===== EMPLOYMENT =====
  document.getElementById("employment_type").value = data.employmentType || "";

  // ===== BENEFITS =====
  if (data.benefits) {
    setCheckbox("job_benefit_health", data.benefits.health);
    setCheckbox("job_benefit_transport", data.benefits.transport);
    setCheckbox("job_benefit_equipment", data.benefits.equipment);
    setCheckbox("job_benefit_remote", data.benefits.remote);
    setCheckbox("job_benefit_bonus", data.benefits.bonus);
  }

  currentEditingJobId = opportunityId;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function isInternshipEmpty() {
    const title = document.getElementById("internship_title").value.trim();
    const description = document.getElementById("internship_description").value.trim();

    return !title && !description;
}

async function populateInternshipDraft(opportunityId) {
    const selectedLang = getCurrentLang();
    const t = messages_translations[selectedLang] || messages_translations['en'];

    const docRef = doc(db, "opportunities", opportunityId);
    const snap = await getDoc(docRef);

    cleanJobForm();

    if (!snap.exists()) {
      alert(t.draftNotFound);
      return;
    }

    const data = snap.data();

    // =========================
    // BASIC
    // =========================

    loadIndustries(data.industry);
    loadSpecialties(data.industry, data.speciality);

    document.getElementById("internship_title").value = data.title || "";
    document.getElementById("internship_description").value = data.description || "";

    document.getElementById("internship_industry").value = data.industry || "";
    document.getElementById("internship_speciality").value = data.speciality || "";

    if (data.schedule) {
        document.getElementById("internship_start_date").value =
            data.schedule.startDate || "";

        document.getElementById("internship_end_date").value =
            data.schedule.endDate || "";

        document.getElementById("internship_deadline").value =
            data.schedule.applicationDeadline || "";
    }

    document.getElementById("internship_positions").value =
        data.positions || 1;

    // =========================
    // SKILLS
    // =========================

    if (data.skills?.length) {

        const container = document.getElementById("internshipSkills-skills");
        container.innerHTML = "";

        data.skills.forEach(skill => {

            cvbAddSkillInternship("skills");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value = skill.name;

            const radio = last.querySelector(
                `input[type="radio"][value="${skill.score}"]`
            );

            if (radio) radio.checked = true;

        });

    }

    // =========================
    // LANGUAGES
    // =========================

    if (data.languages?.length) {

        const container = document.getElementById("internshipSkills-Langs");
        container.innerHTML = "";

        data.languages.forEach(lang => {

            cvbAddSkillInternship("langs");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value = lang.name;

            const radio = last.querySelector(
                `input[type="radio"][value="${lang.score}"]`
            );

            if (radio) radio.checked = true;

        });

    }

    // =========================
    // CONDITIONS
    // =========================

    document.getElementById("internship_academic_required").value =
        data.academicRequirement || "";

    document.getElementById("internship_credit_eligibility").value =
        data.creditEligibility || "";

    setRadio("internship_mode", data.workSetting);
    setRadio("internship_hours", data.scheduleType);

    if (data.period) {

        document.getElementById("internship_start_period").value =
            data.period.start || "";

        document.getElementById("internship_end_period").value =
            data.period.end || "";

    }

    if (data.location) {

        document.getElementById("internship_location").value =
            data.location.reference || "";

        document.getElementById("internship_max_distance_km").value =
            data.location.maxDistanceKm || 0;

        document.getElementById("internship_max_distance_slider").value =
            data.location.maxDistanceKm || 0;

    }

    // =========================
    // EVALUATION
    // =========================

    if (data.evaluation) {

        document.getElementById("internship_feedback_frequency").value =
            data.evaluation.feedbackFrequency || "";

        document.getElementById("internship_evaluation_format").value =
            data.evaluation.format || "";

        document.getElementById("internship_completion_requirement").value =
            data.evaluation.completionRequirement || "";

        document.getElementById("internship_final_output").value =
            data.evaluation.finalOutput || "";

        if (data.evaluation.criteria) {

            setCheckbox(
                "internship_learning_progress",
                data.evaluation.criteria.learningProgress
            );

            setCheckbox(
                "internship_task_completion",
                data.evaluation.criteria.taskCompletion
            );

            setCheckbox(
                "internship_engagement",
                data.evaluation.criteria.engagement
            );

        }

    }

    // =========================
    // BENEFITS
    // =========================

    document.getElementById("internship_type").value =
        data.internshipType || "";

    if (data.outcomes) {

        setCheckbox(
            "internship_job_offer",
            data.outcomes.jobOffer
        );

        setCheckbox(
            "internship_certificate",
            data.outcomes.certificate
        );

        setCheckbox(
            "internship_portfolio",
            data.outcomes.portfolio
        );

        setCheckbox(
            "internship_recommendation_guarantee",
            data.outcomes.recommendation
        );

    }

    if (data.support) {

        setCheckbox(
            "internship_onboarding",
            data.support.onboarding
        );

        setCheckbox(
            "internship_tools",
            data.support.tools
        );

        setCheckbox(
            "internship_mentorship",
            data.support.mentorship
        );

        setCheckbox(
            "internship_communication",
            data.support.communication
        );

    }

    currentEditingInternshipId = opportunityId;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function setRadio(name, value) {
  if (!value) return;
  const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

function setCheckbox(id, value) {
  const el = document.getElementById(id);
  if (el) el.checked = !!value;
}

// ================================== ADD NEW TASK ================================

document.addEventListener("DOMContentLoaded", () => {
  const taskTitleInput = document.getElementById("task_title");

  if (!taskTitleInput) return;

  const params = new URLSearchParams(window.location.search);
  const taskTitle = params.get("task_title");

  if (taskTitle) {
    taskTitleInput.value = taskTitle;

    taskTitleInput.dispatchEvent(
      new Event("input", { bubbles: true })
    );

    taskTitleInput.focus();
  }
});

function getTaskSkills(type) {
  const containerId = type === "skills"
    ? "taskSkills-skills"
    : "taskSkills-Langs";
  const container = document.getElementById(containerId);
  if (!container) return [];
  const result = [];
  container.querySelectorAll(".navCard-requiresGroup").forEach(group => {
    const nameInput = group.querySelector("input[type='text']");
    const scoreInput = group.querySelector("input[type='radio']:checked");
    if (!nameInput || !nameInput.value.trim()) return;
    const score = scoreInput ? parseInt(scoreInput.value) : 0;
    result.push({
      name: nameInput.value.trim(),
      score: score
    });
  });
  return result;
}

document.getElementById('saveDraft').addEventListener('click', saveDraft);
document.getElementById("publishTask").addEventListener("click", () => {publishTask(false);});
document.getElementById("boostTask").addEventListener("click", () => {publishTask(true);});

function buildTaskData(user, statusValue) {
  return {
    // ===== BASIC =====
    category: "tasks",
    title: document.getElementById("task_title").value || "",
    description: document.getElementById("task_goal").value || "",
    type: document.getElementById("task_type").value || "",
    industry: document.getElementById("task_industry").value || "",
    speciality: document.getElementById("task_speciality").value || "",

    executionEntity:
      document.querySelector('input[name="Task-Exec"]:checked')?.value || "",

    maxExecutors: Number(document.getElementById("task_max_executors").value || 1),

    taskScale:
      document.querySelector('input[name="Task-TaskScale"]:checked')?.value || "",

    skills: getTaskSkills("skills"),
    languages: getTaskSkills("langs"),

    workSetting:
      document.querySelector('input[name="Task-ExecMode"]:checked')?.value || "",

    workDynamics:
      document.querySelector('input[name="Task-Engine"]:checked')?.value || "",

    submissionType:
      document.querySelector('input[name="Task-Submit"]:checked')?.value || "",

    instructions: document.getElementById("task_instructions").value || "",

    schedule: {
      startDate: document.getElementById("task_start_date").value || null,
      endDate: document.getElementById("task_end_date").value || null,
      deadline: document.getElementById("task_hard_deadline").value || null,
      estimatedDuration: Number(document.getElementById("task_estimated_duration").value || 0),
      timeFlexibility:
        document.querySelector('input[name="Task-TaskTimeFlex"]:checked')?.value || ""
    },

    location: {
      reference: document.getElementById("task_location").value || "",
      maxDistanceKm: Number(document.getElementById("task_max_distance_km").value || 0)
    },

    evaluation: {
      method:
        document.querySelector('input[name="Task-EvalMeth"]:checked')?.value || "",
      criteria: {
        deadlineRespected: document.getElementById("task_criteria_deadline")?.checked || false,
        requirementsFulfilled: document.getElementById("task_criteria_requirements")?.checked || false,
        qualityScore: document.getElementById("task_criteria_quality")?.checked || false,
        minScore: Number(document.getElementById("task_criteria_min_score")?.value || 0),
        clientApproval: document.getElementById("task_criteria_client")?.checked || false
      },
      revision: {
        allowed: document.getElementById("task_revision_allowed")?.checked || false,
        maxAttempts: Number(document.getElementById("task_max_attempts")?.value || 0)
      }
    },

    price: {
      amount: Number(document.getElementById("task_price").value || 0),
      currency: document.getElementById("task_priceCurrency").value || "USD"
    },

    paymentModel: document.getElementById("task_payment_model").value || "Fixed",

    additionalCosts: {
      materials: document.getElementById("task_cover_materials")?.checked || false,
      transport: document.getElementById("task_cover_transport")?.checked || false,
      tools: document.getElementById("task_cover_tools")?.checked || false,
      accommodation: document.getElementById("task_cover_accommodation")?.checked || false,
      fees: document.getElementById("task_cover_fees")?.checked || false,
      reimbursementMode: document.getElementById("task_reimbursement_mode")?.value || ""
    },

    guarantees: {
      latePenalty: document.getElementById("task_late_penalty")?.checked || false,
      latePenaltyPercent: Number(document.getElementById("task_late_penalty_percent")?.value || 0),
      damageLiability: document.getElementById("task_damage_liability")?.checked || false,
      replacementRequired: document.getElementById("task_replacement_required")?.checked || false
    },

    createdAt: serverTimestamp(),
    ownerId: user.uid,
    status: statusValue,
    applicants: 0,
    completed: false
  };
}

function validateTaskInputs() {
  const selectedLang = getCurrentLang();
  const t = messages_translations[selectedLang] || messages_translations['en'];
  
  let isValid = true;

  function showError(input, messageKey) {
    let errorSpan = input.parentElement.querySelector('.error-span');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-span';
      errorSpan.style.color = 'red';
      errorSpan.style.fontSize = '12px';
      input.parentElement.appendChild(errorSpan);
    }
    errorSpan.textContent = t[messageKey];
    input.classList.add('invalid');
    isValid = false;
  }

  function clearError(input) {
    const errorSpan = input.parentElement.querySelector('.error-span');
    if (errorSpan) errorSpan.remove();
    input.classList.remove('invalid');
  }

  // ===== Task Definition =====
  const title = document.getElementById("task_title");
  const description = document.getElementById("task_goal");
  const workNature = document.getElementById("task_type");
  const taskCategory = document.getElementById("task_industry");
  const startDate = document.getElementById("task_start_date");
  const endDate = document.getElementById("task_end_date");
  const timeFlex = document.querySelector('input[name="Task-TaskTimeFlex"]:checked');

  [title, description, workNature, taskCategory, startDate, endDate].forEach(input => clearError(input));

  if (!title.value.trim()) showError(title, "validationTitleRequired");
  if (!description.value.trim()) showError(description, "validationDescriptionRequired");
  if (!workNature.value) showError(workNature, "validationWorkNatureRequired");
  if (!taskCategory.value) showError(taskCategory, "validationCategoryRequired");
  if (!startDate.value) showError(startDate, "validationStartDateRequired");
  if (!endDate.value) showError(endDate, "validationEndDateRequired");
  if (!timeFlex) showError(document.getElementById("task_time_flexibility"), "validationTimeFlexRequired");

  // ===== Skills & Languages =====
  if (getTaskSkills("skills").length === 0) {
    showError(document.getElementById("taskSkills-skills"), "validationSkillRequired");
  }
  if (getTaskSkills("langs").length === 0) {
    showError(document.getElementById("taskSkills-Langs"), "validationLanguageRequired");
  }

  // ===== Execution Conditions =====
  const executionEntity = document.querySelector('input[name="Task-Exec"]:checked');
  const maxExecutors = document.getElementById("task_max_executors");
  const taskScale = document.querySelector('input[name="Task-TaskScale"]:checked');
  const workSetting = document.querySelector('input[name="Task-ExecMode"]:checked');
  const workDynamics = document.querySelector('input[name="Task-Engine"]:checked');
  const submissionType = document.querySelector('input[name="Task-Submit"]:checked');

  [maxExecutors].forEach(input => clearError(input));
  if (!executionEntity) showError(document.getElementById("task_entity"), "validationExecutionEntityRequired");
  if (!taskScale) showError(document.getElementById("task_scale"), "validationTaskScaleRequired");
  if (!workSetting) showError(document.getElementById("task_execution_mode"), "validationWorkSettingRequired");
  if (!workDynamics) showError(document.getElementById("task_execution_engine"), "validationWorkDynamicsRequired");
  if (!submissionType) showError(document.getElementById("task_submission_type"), "validationProofRequired");
  if (!maxExecutors.value || Number(maxExecutors.value) < 1) showError(maxExecutors, "validationMaxExecutorsMin");

  // ===== Acceptance Criteria =====
  const evalMethod = document.querySelector('input[name="Task-EvalMeth"]:checked');
  if (!evalMethod) showError(document.getElementById("task_evaluation_method"), "validationValidationLogicRequired");

  // ===== Payment =====
  const taskPrice = document.getElementById("task_price");
  const currency = document.getElementById("task_priceCurrency");
  const paymentModel = document.getElementById("task_payment_model");

  [taskPrice, currency, paymentModel].forEach(input => clearError(input));
  if (!taskPrice.value || Number(taskPrice.value) <= 0) showError(taskPrice, "validationPriceRequired");
  if (!currency.value) showError(currency, "validationCurrencyRequired");
  if (!paymentModel.value) showError(paymentModel, "validationPaymentModelRequired");

  return isValid;
}

async function saveDraft() {
  const selectedLang = getCurrentLang();
  const t = messages_translations[selectedLang] || messages_translations['en'];

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  const title = document.getElementById("task_title").value.trim();
  const description = document.getElementById("task_goal").value.trim();
  if (!title || !description) {
    showNotification("warning", t.draftRequiredTitle, t.draftRequiredMessage);
    return;
  }

  try {
    const draftData = buildTaskData(user, "Draft");
    if (currentEditingTaskId) {
      await updateDoc(
        doc(db, "opportunities", currentEditingTaskId),
        {
          ...draftData,
          updatedAt: serverTimestamp()
        }
      );
      cleanTaskForm();
      showNotification("success", t.draftUpdatedTitle, t.draftUpdatedMessage);

    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), draftData);
      currentEditingTaskId = taskRef.id;
      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId: taskRef.id,
        title: draftData.title,
        status: "Draft",
        createdAt: serverTimestamp()
      });
      cleanTaskForm();
      showNotification("success", t.draftSavedTitle, t.draftSavedMessage);
    }
    loadUserDrafts(user);
  } catch (error) {
    showNotification("error", t.draftSaveFailedTitle, t.draftSaveFailedMessage);
  }
}

async function publishTask(isBoosted = false) {
  const selectedLang = getCurrentLang();
  const t = messages_translations[selectedLang] || messages_translations['en'];

  const cost = isBoosted ? 15 : 10;
  const actionName = isBoosted ? "Publish Boosted Task" : "Publish Task";

  if (!validateTaskInputs()) {
    showNotification("warning", t.taskPublishRequiredTitle, t.taskPublishRequiredMessage);
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  try {
    const taskData = buildTaskData(user, "Pending");
    taskData.isBoosted = isBoosted;
    let opportunityId;
    if (currentEditingTaskId) {
      opportunityId = currentEditingTaskId;
      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...taskData,
        status: "Pending",
        updatedAt: serverTimestamp()
      });
    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), taskData);
      opportunityId = taskRef.id;
      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId,
        title: taskData.title,
        price: taskData.price,
        status: "Pending",
        createdAt: serverTimestamp()
      });
    }
    await saveTaskPublishConsumption(user.uid, opportunityId, cost, actionName);
    updateUserSection(user);
    cleanTaskForm();
    showNotification("success", t.taskSubmittedTitle, t.taskSubmittedMessage);

    currentEditingTaskId = null;
    loadUserDrafts(user);
  } catch (error) {
    showNotification("error", t.taskSaveFailedTitle, t.taskSaveFailedMessage);
  }
}

async function saveTaskPublishConsumption(userId, opportunityId, cost, actionName) {
  const consumptionRef = doc(db, "users", userId, "consumptions", opportunityId);
  await setDoc(consumptionRef, {
    coins_used: cost,
    action_name: actionName,
    opportunityId: opportunityId,
    updatedAt: serverTimestamp()
  });
}

// ================================== CLEAR TASK FORM ================================

document.getElementById('cleanTask').addEventListener('click', cleanTaskForm);

function cleanTaskForm() {

  document.querySelectorAll("#taskPage input").forEach(input => {
    const type = input.type;

    if (type === "text" || type === "number" || type === "datetime-local") {
      input.value = "";
    }

    if (type === "checkbox" || type === "radio") {
      input.checked = false;
    }
  });

  document.querySelectorAll("#taskPage textarea").forEach(textarea => {
    textarea.value = "";
  });

  document.querySelectorAll("#taskPage select").forEach(select => {
    select.selectedIndex = 0;
  });

  const slider = document.getElementById("task_max_distance_slider");
  if (slider) slider.value = 140;

  const defaultChecked = [
    "task_criteria_deadline",
    "task_criteria_requirements",
    "task_criteria_quality"
  ];

  defaultChecked.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });

  const minScore = document.getElementById("task_criteria_min_score");
  if (minScore) minScore.value = 90;

  const skillsContainer = document.getElementById("taskSkills-skills");
  const langsContainer = document.getElementById("taskSkills-Langs");

  if (skillsContainer) skillsContainer.innerHTML = "";
  if (langsContainer) langsContainer.innerHTML = "";

  document.querySelectorAll(".error-span").forEach(e => e.remove());
  document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));

  currentEditingTaskId = null;

  navigateToTaskFirstStep("taskPage");

  AddSkillTasks('skills');
  AddSkillTasks('langs');
  
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateTaskSections(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pages = container.querySelectorAll('.horizontal-newTaskPage');
  const steps = container.querySelectorAll('.horizontal-newTask button');

  let currentIndex = Array.from(pages)
    .findIndex(page => page.style.display !== 'none');

  if (currentIndex === -1) currentIndex = 0;

  pages[currentIndex].style.display = 'none';
  if (steps[currentIndex]) steps[currentIndex].classList.remove('active');

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= pages.length) nextIndex = pages.length - 1;

  pages[nextIndex].style.display = 'block';
  if (steps[nextIndex]) steps[nextIndex].classList.add('active');

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', () => {
  const taskPage = document.getElementById("taskPage");

  if (taskPage) {
    taskPage.querySelectorAll(".nextStep").forEach(btn => {
      btn.addEventListener("click", () => navigateTaskSections("taskPage", 1));
    });

    taskPage.querySelectorAll(".prevStep").forEach(btn => {
      btn.addEventListener("click", () => navigateTaskSections("taskPage", -1));
    });
  }
});

function navigateToTaskFirstStep(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll(".horizontal-newTask button");
  const pages = container.querySelectorAll(".horizontal-newTaskPage");

  buttons.forEach(btn => btn.classList.remove("active"));
  pages.forEach(page => page.style.display = "none");

  if (buttons[0]) buttons[0].classList.add("active");
  if (pages[0]) pages[0].style.display = "block";
}

// ====================================================================================
// ==================================== JOBS SETTINGS =================================
// ====================================================================================

const skillJobCounters = {
  skills: 0,
  langs: 0
};

function AddSkillJob(type) {
  const selectedLang = getCurrentLang();
  const T = App_translations[selectedLang] || App_translations['en'];

  const listId = type === 'skills'
    ? 'jobSkills-skills'
    : 'jobSkills-Langs';

  const container = document.getElementById(listId);
  if (!container) return;

  const skillIndex = ++skillJobCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  // input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder =
    type === 'langs'
      ? "English, French, Spanish..."
      : "JavaScript, Logistics, Marketing...";
  input.name = `${skillId}-name`;

  // rating group
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;

    const label = document.createElement('label');
    label.setAttribute('for', radio.id);

    ratingGroup.appendChild(radio);
    ratingGroup.appendChild(label);
  }

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
  };

  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);
}

document.getElementById('jobAddSkill').addEventListener('click', () => AddSkillJob('skills'));
document.getElementById('jobAddLang').addEventListener('click', () => AddSkillJob('langs'));

const job_distanceInput = document.getElementById("job_max_distance_km");
const job_distanceSlider = document.getElementById("job_max_distance_slider");
function updateJobSlider(value) {
  const min = job_distanceSlider.min;
  const max = job_distanceSlider.max;
  const percent = ((value - min) / (max - min)) * 100;

  job_distanceSlider.style.background = `linear-gradient(
    to right,
    #3b82f6 0%,
    #3b82f6 ${percent}%,
    #ddd ${percent}%,
    #ddd 100%
  )`;
}
job_distanceSlider.addEventListener("input", () => {
  job_distanceInput.value = job_distanceSlider.value;
  updateJobSlider(job_distanceSlider.value);
});
job_distanceInput.addEventListener("input", () => {
  let value = Number(job_distanceInput.value);

  if (value < job_distanceSlider.min) value = job_distanceSlider.min;
  if (value > job_distanceSlider.max) value = job_distanceSlider.max;

  job_distanceSlider.value = value;
  updateJobSlider(value);
});
updateJobSlider(job_distanceSlider.value);

const negotiableCheckbox = document.getElementById("job_salary_negotiable");
const salaryMin = document.getElementById("job_salary_min");
const salaryMax = document.getElementById("job_salary_max");
const currency = document.getElementById("job_priceCurrency");
function updateSalaryState() {
  const isNegotiable = negotiableCheckbox.checked;
  const hasValue = salaryMin.value || salaryMax.value;

  if (isNegotiable) {
    salaryMin.disabled = true;
    salaryMax.disabled = true;
    currency.disabled = true;

    salaryMin.value = "";
    salaryMax.value = "";
    currency.selectedIndex = 0;

    salaryMin.style.opacity = "0.6";
    salaryMax.style.opacity = "0.6";
    currency.style.opacity = "0.6";

  } else {
    salaryMin.disabled = false;
    salaryMax.disabled = false;

    salaryMin.style.opacity = "1";
    salaryMax.style.opacity = "1";

    if (hasValue) {
      currency.disabled = false;
      currency.style.opacity = "1";
    } else {
      currency.disabled = true;
      currency.style.opacity = "0.6";
      currency.selectedIndex = 0;
    }
  }
}
negotiableCheckbox.addEventListener("change", updateSalaryState);
salaryMin.addEventListener("input", updateSalaryState);
salaryMax.addEventListener("input", updateSalaryState);
updateSalaryState();

// ================================== ADD NEW JOB ================================

function getJobSkills(type) {
  const containerId = type === "skills"
    ? "jobSkills-skills"
    : "jobSkills-Langs";
  const container = document.getElementById(containerId);
  if (!container) return [];
  const result = [];
  container.querySelectorAll(".navCard-requiresGroup").forEach(group => {
    const nameInput = group.querySelector("input[type='text']");
    const scoreInput = group.querySelector("input[type='radio']:checked");
    if (!nameInput || !nameInput.value.trim()) return;
    const score = scoreInput ? parseInt(scoreInput.value) : 0;
    result.push({
      name: nameInput.value.trim(),
      score: score
    });
  });
  return result;
}

document.getElementById('saveJobDraft').addEventListener('click', saveJobDraft);
document.getElementById("publishJob").addEventListener("click", () => {publishJob(false);});
document.getElementById("boostJob").addEventListener("click", () => {publishJob(true);});

function buildJobData(user, statusValue) {
  const salaryMin = document.getElementById("job_salary_min");
  const salaryMax = document.getElementById("job_salary_max");
  const currency = document.getElementById("job_priceCurrency");
  const negotiable = document.getElementById("job_salary_negotiable");

  return {
    // ===== CORE =====
    category: "jobs",
    title: document.getElementById("job_title").value || "",
    description: document.getElementById("job_goal").value || "",

    industry: document.getElementById("job_industry").value || "",
    speciality: document.getElementById("job_speciality").value || "",

    // ===== TIMELINE =====
    schedule: {
      startDate: document.getElementById("application_start_date").value || null,
      endDate: document.getElementById("application_end_date").value || null,
      applicationDeadline: document.getElementById("application_deadline").value || null
    },

    // ===== CAPABILITIES =====
    skills: getJobSkills("skills"),
    languages: getJobSkills("langs"),

    // ===== WORK CONDITIONS =====
    seniority:
      document.querySelector('input[name="job_seniority"]:checked')?.value || "",

    positions: Number(document.getElementById("job_numb_positions").value || 1),

    workSetting:
      document.querySelector('input[name="job-ExecMode"]:checked')?.value || "",

    location: {
      reference: document.getElementById("job_location").value || "",
      maxDistanceKm: Number(document.getElementById("job_max_distance_km").value || 0)
    },

    // ===== EVALUATION =====
    evaluation: {
      method:
        document.querySelector('input[name="Job-EvalMeth"]:checked')?.value || "",

      criteria: {
        commitment: document.getElementById("job_criteria_commitment")?.checked || false,
        objectives: document.getElementById("job_criteria_objectives")?.checked || false,
        performance: document.getElementById("job_criteria_performance")?.checked || false,
        minScore: Number(document.getElementById("job_criteria_min_score")?.value || 0),
        team: document.getElementById("job_criteria_team")?.checked || false
      }
    },

    // ===== COMPENSATION =====
    employmentType: document.getElementById("employment_type").value || "",

    salary: {
      negotiable: negotiable.checked,

      min: negotiable.checked ? null : Number(salaryMin.value || 0),
      max: negotiable.checked ? null : Number(salaryMax.value || 0),

      currency: negotiable.checked ? null : currency.value || null
    },

    benefits: {
      health: document.getElementById("job_benefit_health")?.checked || false,
      transport: document.getElementById("job_benefit_transport")?.checked || false,
      equipment: document.getElementById("job_benefit_equipment")?.checked || false,
      remote: document.getElementById("job_benefit_remote")?.checked || false,
      bonus: document.getElementById("job_benefit_bonus")?.checked || false
    },

    // ===== META =====
    createdAt: serverTimestamp(),
    ownerId: user.uid,
    status: statusValue,

    applicants: 0,
    hires: 0,
    completed: false
  };
}

function validateJobInputs() {
  const selectedLang = getCurrentLang();
  const t = msgJob_translations[selectedLang] || msgJob_translations['en'];

  let isValid = true;

  function showError(input, messageKey) {
    if (!input) return;

    let container = input.closest('.navCard-inputGroup') || input.parentElement;

    let errorSpan = container.querySelector('.error-span');
    if (!errorSpan) {
      errorSpan = document.createElement('span');
      errorSpan.className = 'error-span';
      errorSpan.style.color = 'red';
      errorSpan.style.fontSize = '12px';
      container.appendChild(errorSpan);
    }

    errorSpan.textContent = t[messageKey] || "Required field";
    input.classList.add('invalid');
    isValid = false;
  }

  function clearError(input) {
    if (!input) return;

    let container = input.closest('.navCard-inputGroup') || input.parentElement;
    const errorSpan = container.querySelector('.error-span');

    if (errorSpan) errorSpan.remove();
    input.classList.remove('invalid');
  }

  // ===== STEP 1: JOB DEFINITION =====
  const title = document.getElementById("job_title");
  const description = document.getElementById("job_goal");
  const industry = document.getElementById("job_industry");
  const speciality = document.getElementById("job_speciality");

  [title, description, industry, speciality]
    .forEach(clearError);

  if (!title.value.trim()) showError(title, "validationTitleRequired");
  if (!description.value.trim()) showError(description, "validationDescriptionRequired");
  if (!industry.value) showError(industry, "validationIndustryRequired");
  if (!speciality.value) showError(speciality, "validationSpecialityRequired");

  // ===== STEP 2: SKILLS =====
  if (getJobSkills("skills").length === 0) {
    showError(document.getElementById("jobSkills-skills"), "validationSkillRequired");
  }

  // Languages optional (keep or remove depending your UX)
  // if (getJobSkills("langs").length === 0) {
  //   showError(document.getElementById("jobSkills-Langs"), "validationLanguageRequired");
  // }

  // ===== STEP 3: WORK CONDITIONS =====
  const seniority = document.querySelector('input[name="job_seniority"]:checked');
  const positions = document.getElementById("numb_positions");
  const execMode = document.querySelector('input[name="job-ExecMode"]:checked');
  const location = document.getElementById("job_location");

  [positions, location].forEach(clearError);

  if (!seniority) showError(document.getElementById("seniority_level"), "validationSeniorityRequired");
  if (!execMode) showError(document.getElementById("execution_mode"), "validationWorkSettingRequired");

  if (!positions.value || Number(positions.value) < 1) {
    showError(positions, "validationPositionsRequired");
  }

  // If NOT remote → require location
  if (execMode && execMode.value !== "Remote" && !location.value.trim()) {
    showError(location, "validationLocationRequired");
  }

  // ===== STEP 4: EVALUATION =====
  const evalMethod = document.querySelector('input[name="Job-EvalMeth"]:checked');

  if (!evalMethod) {
    showError(document.getElementById("evaluation_method"), "validationEvaluationMethodRequired");
  }

  const performanceChecked = document.getElementById("criteria_performance")?.checked;
  const minScore = document.getElementById("criteria_min_score");

  if (performanceChecked && (!minScore.value || Number(minScore.value) <= 0)) {
    showError(minScore, "validationMinScoreRequired");
  }

  // ===== STEP 5: PAYMENT =====
  const employmentType = document.getElementById("employment_type");
  const salaryMin = document.getElementById("job_salary_min");
  const salaryMax = document.getElementById("job_salary_max");
  const currency = document.getElementById("job_priceCurrency");

  [employmentType, salaryMin, salaryMax, currency].forEach(clearError);

  if (!employmentType.value) {
    showError(employmentType, "validationEmploymentTypeRequired");
  }

  const isNegotiable = document.getElementById("salary_negotiable")?.checked;

  if (!isNegotiable) {
    if (!salaryMin.value || Number(salaryMin.value) <= 0) {
      showError(salaryMin, "validationSalaryMinRequired");
    }
    if (!salaryMax.value || Number(salaryMax.value) <= 0) {
      showError(salaryMax, "validationSalaryMaxRequired");
    }
    if (Number(salaryMin.value) > Number(salaryMax.value)) {
      showError(salaryMax, "validationSalaryRangeInvalid");
    }
  }

  if (!isNegotiable && !currency.value) {
    showError(currency, "validationCurrencyRequired");
  }

  return isValid;
}

async function saveJobDraft() {
  const selectedLang = getCurrentLang();
  const t = msgJob_translations[selectedLang] || msgJob_translations['en'];

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  const title = document.getElementById("job_title").value.trim();
  const description = document.getElementById("job_goal").value.trim();

  if (!title || !description) {
    showNotification("warning", t.draftRequiredTitle, t.draftRequiredMessage);
    return;
  }

  try {
    const draftData = buildJobData(user, "Draft");

    if (currentEditingJobId) {
      await updateDoc(doc(db, "opportunities", currentEditingJobId), {
        ...draftData,
        updatedAt: serverTimestamp()
      });

      showNotification("success", t.draftUpdatedTitle, t.draftUpdatedMessage);
    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), draftData);
      currentEditingJobId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId: taskRef.id,
        title: draftData.title,
        status: "Draft",
        createdAt: serverTimestamp()
      });

      showNotification("success", t.draftSavedTitle, t.draftSavedMessage);
    }

    cleanJobForm();
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.draftSaveFailedTitle, t.draftSaveFailedMessage);
  }
}

async function publishJob(isBoosted = false) {
  const selectedLang = getCurrentLang();
  const t = msgJob_translations[selectedLang] || msgJob_translations['en'];

  const cost = isBoosted ? 25 : 20;
  const actionName = isBoosted ? "Publish Boosted Job" : "Publish Job";

  if (!validateJobInputs()) {
    showNotification("warning", t.jobPublishRequiredTitle, t.jobPublishRequiredMessage);
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  try {
    const jobData = buildJobData(user, "Pending");
    jobData.isBoosted = isBoosted;

    let opportunityId;

    if (currentEditingJobId) {
      opportunityId = currentEditingJobId;

      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...jobData,
        updatedAt: serverTimestamp()
      });

    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), jobData);
      opportunityId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId,
        title: jobData.title,
        status: "Pending",
        createdAt: serverTimestamp()
      });
    }

    await saveJobPublishConsumption(user.uid, opportunityId, cost, actionName);

    updateUserSection(user);
    cleanJobForm();

    showNotification("success", t.jobSubmittedTitle, t.jobSubmittedMessage);

    currentEditingJobId = null;
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.jobSaveFailedTitle, t.jobSaveFailedMessage);
  }
}

async function saveJobPublishConsumption(userId, opportunityId, cost, actionName) {
  const consumptionRef = doc(db, "users", userId, "consumptions", opportunityId);

  await setDoc(consumptionRef, {
    coins_used: cost,
    action_name: actionName,
    category: "job",
    opportunityId: opportunityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ================================== CLEAR JOB FORM ================================

document.getElementById('cleanJobForm').addEventListener('click', cleanJobForm);

function cleanJobForm() {

  document.querySelectorAll("#jobPage input").forEach(input => {
    const type = input.type;

    if (["text", "number", "datetime-local"].includes(type)) {
      input.value = "";
    }

    if (type === "checkbox") {
      input.checked = false;
    }

    if (type === "radio") {
      input.checked = false;
    }
  });

  document.querySelectorAll("#jobPage textarea").forEach(textarea => {
    textarea.value = "";
  });

  document.querySelectorAll("#jobPage select").forEach(select => {
    select.selectedIndex = 0;
  });

  const slider = document.getElementById("job_max_distance_slider");
  if (slider) {
    slider.value = 140;

    const label = document.getElementById("job_max_distance_label");
    if (label) label.textContent = "140 km";
  }

  const defaultChecked = [
    "job_criteria_commitment",
    "job_criteria_objectives",
    "job_criteria_performance"
  ];

  defaultChecked.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });

  const minScore = document.getElementById("job_criteria_min_score");
  if (minScore) minScore.value = 90;

  const negotiable = document.getElementById("job_salary_negotiable");
  if (negotiable) negotiable.checked = false;

  const salaryMin = document.getElementById("job_salary_min");
  const salaryMax = document.getElementById("job_salary_max");

  if (salaryMin) salaryMin.disabled = false;
  if (salaryMax) salaryMax.disabled = false;

  const skillsContainer = document.getElementById("jobSkills-skills");
  const langsContainer = document.getElementById("jobSkills-Langs");

  if (skillsContainer) skillsContainer.innerHTML = "";
  if (langsContainer) langsContainer.innerHTML = "";

  AddSkillJob('skills');
  AddSkillJob('langs');

  document.querySelectorAll(".error-span").forEach(e => e.remove());
  document.querySelectorAll(".invalid").forEach(e => e.classList.remove("invalid"));

  currentEditingJobId = null;

  navigateToJobFirstStep();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateJobSections(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pages = container.querySelectorAll('.horizontal-newTaskPage');
  const steps = container.querySelectorAll('.horizontal-newTask button');

  let currentIndex = Array.from(pages)
    .findIndex(page => page.style.display !== 'none');

  if (currentIndex === -1) currentIndex = 0;

  pages[currentIndex].style.display = 'none';
  if (steps[currentIndex]) steps[currentIndex].classList.remove('active');

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= pages.length) nextIndex = pages.length - 1;

  pages[nextIndex].style.display = 'block';
  if (steps[nextIndex]) steps[nextIndex].classList.add('active');

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', () => {
  const taskPage = document.getElementById("jobPage");

  if (taskPage) {
    taskPage.querySelectorAll(".nextStep").forEach(btn => {
      btn.addEventListener("click", () => navigateJobSections("jobPage", 1));
    });

    taskPage.querySelectorAll(".prevStep").forEach(btn => {
      btn.addEventListener("click", () => navigateJobSections("jobPage", -1));
    });
  }
});

function navigateToJobFirstStep(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll(".horizontal-newTask button");
  const pages = container.querySelectorAll(".horizontal-newTaskPage");

  buttons.forEach(btn => btn.classList.remove("active"));
  pages.forEach(page => page.style.display = "none");

  if (buttons[0]) buttons[0].classList.add("active");
  if (pages[0]) pages[0].style.display = "block";
}

// ====================================================================================
// ================================= INTERN SETTINGS ==================================
// ====================================================================================

const skillInternCounters = {
  skills: 0,
  langs: 0
};

function AddSkillIntern(type) {
  const selectedLang = getCurrentLang();
  const T = App_translations[selectedLang] || App_translations['en'];

  const listId = type === 'skills'
    ? 'internshipSkills-skills'
    : 'internshipSkills-Langs';

  const container = document.getElementById(listId);
  if (!container) return;

  const skillIndex = ++skillInternCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder =
    type === 'langs'
      ? "English, French, Spanish..."
      : "JavaScript, Logistics, Marketing...";
  input.name = `${skillId}-name`;

  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;

    const label = document.createElement('label');
    label.setAttribute('for', radio.id);

    ratingGroup.appendChild(radio);
    ratingGroup.appendChild(label);
  }

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
  };

  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);
}

document.getElementById('internshipAddSkill').addEventListener('click', () => AddSkillIntern('skills'));
document.getElementById('internshipAddLang').addEventListener('click', () => AddSkillIntern('langs'));

const intern_distanceInput = document.getElementById("internship_max_distance_km");
const intern_distanceSlider = document.getElementById("internship_max_distance_slider");
function updateInternSlider(value) {
  const min = intern_distanceSlider.min;
  const max = intern_distanceSlider.max;
  const percent = ((value - min) / (max - min)) * 100;

  intern_distanceSlider.style.background = `linear-gradient(
    to right,
    #3b82f6 0%,
    #3b82f6 ${percent}%,
    #ddd ${percent}%,
    #ddd 100%
  )`;
}
intern_distanceSlider.addEventListener("input", () => {
  intern_distanceInput.value = intern_distanceSlider.value;
  updateInternSlider(intern_distanceSlider.value);
});
intern_distanceInput.addEventListener("input", () => {
  let value = Number(intern_distanceInput.value);

  if (value < intern_distanceSlider.min) value = intern_distanceSlider.min;
  if (value > intern_distanceSlider.max) value = intern_distanceSlider.max;

  intern_distanceSlider.value = value;
  updateInternSlider(value);
});
updateInternSlider(intern_distanceSlider.value);

// ================================== ADD NEW INTERN ================================

function getInternshipSkills(type) {
  const containerId = type === "skills"
    ? "internshipSkills-skills"
    : "internshipSkills-Langs";
  const container = document.getElementById(containerId);
  if (!container) return [];
  const result = [];
  container.querySelectorAll(".navCard-requiresGroup").forEach(group => {
    const nameInput = group.querySelector("input[type='text']");
    const scoreInput = group.querySelector("input[type='radio']:checked");
    if (!nameInput || !nameInput.value.trim()) return;
    const score = scoreInput ? parseInt(scoreInput.value) : 0;
    result.push({
      name: nameInput.value.trim(),
      score: score
    });
  });
  return result;
}

document.getElementById('saveInternshipDraft').addEventListener('click', saveInternshipDraft);
document.getElementById("publishInternship").addEventListener("click", () => {publishInternship(false);});
document.getElementById("boostInternship").addEventListener("click", () => {publishInternship(true);});

function buildInternshipData(user, statusValue) {
  return {
    // ===== CORE =====
    category: "internships",

    title: document.getElementById("internship_title")?.value || "",
    description: document.getElementById("internship_description")?.value || "",

    industry: document.getElementById("internship_industry")?.value || "",
    speciality: document.getElementById("internship_speciality")?.value || "",

    // ===== TIMELINE =====
    schedule: {
      startDate: document.getElementById("internship_start_date")?.value || null,
      endDate: document.getElementById("internship_end_date")?.value || null,
      applicationDeadline: document.getElementById("internship_deadline")?.value || null
    },

    // ===== REQUIREMENTS =====
    skills: getInternshipSkills("skills"),
    languages: getInternshipSkills("langs"),

    // ===== WORK CONDITIONS =====
    positions: Number(document.getElementById("internship_positions")?.value || 1),

    academicRequirement:
      document.getElementById("internship_academic_required")?.value || "",

    creditEligibility:
      document.getElementById("internship_credit_eligibility")?.value || "",

    workSetting:
      document.querySelector('input[name="internship_mode"]:checked')?.value || "",

    scheduleType:
      document.querySelector('input[name="internship_hours"]:checked')?.value || "",

    period: {
      start:
        document.getElementById("internship_start_period")?.value || null,

      end:
        document.getElementById("internship_end_period")?.value || null
    },

    location: {
      reference:
        document.getElementById("internship_location")?.value || "",

      maxDistanceKm: Number(
        document.getElementById("internship_max_distance_km")?.value || 0
      )
    },

    // ===== EVALUATION =====
    evaluation: {
      feedbackFrequency:
        document.getElementById("internship_feedback_frequency")?.value || "",

      format:
        document.getElementById("internship_evaluation_format")?.value || "",

      completionRequirement:
        document.getElementById("internship_completion_requirement")?.value || "",

      finalOutput:
        document.getElementById("internship_final_output")?.value || "",

      criteria: {
        learningProgress:
          document.getElementById("internship_learning_progress")?.checked || false,

        taskCompletion:
          document.getElementById("internship_task_completion")?.checked || false,

        engagement:
          document.getElementById("internship_engagement")?.checked || false
      }
    },

    // ===== BENEFITS =====
    internshipType:
      document.getElementById("internship_type")?.value || "",

    outcomes: {
      jobOffer:
        document.getElementById("internship_job_offer")?.checked || false,

      certificate:
        document.getElementById("internship_certificate")?.checked || false,

      portfolio:
        document.getElementById("internship_portfolio")?.checked || false,

      recommendation:
        document.getElementById("internship_recommendation_guarantee")?.checked || false
    },

    support: {
      onboarding:
        document.getElementById("internship_onboarding")?.checked || false,

      tools:
        document.getElementById("internship_tools")?.checked || false,

      mentorship:
        document.getElementById("internship_mentorship")?.checked || false,

      communication:
        document.getElementById("internship_communication")?.checked || false
    },

    // ===== META =====
    createdAt: serverTimestamp(),
    ownerId: user.uid,
    status: statusValue,

    applicants: 0,
    accepted: 0,
    completed: false
  };
}

function validateInternshipInputs() {
  const selectedLang = getCurrentLang();
  const t = msgInternship_translations[selectedLang] || msgInternship_translations.en;

  let isValid = true;

  function showError(input, messageKey) {
    if (!input) return;

    const container = input.closest(".navCard-inputGroup") || input.parentElement;

    let errorSpan = container.querySelector(".error-span");
    if (!errorSpan) {
      errorSpan = document.createElement("span");
      errorSpan.className = "error-span";
      errorSpan.style.color = "red";
      errorSpan.style.fontSize = "12px";
      container.appendChild(errorSpan);
    }

    errorSpan.textContent = t[messageKey] || "Required field";
    input.classList.add("invalid");
    isValid = false;
  }

  function clearError(input) {
    if (!input) return;

    const container = input.closest(".navCard-inputGroup") || input.parentElement;
    container.querySelector(".error-span")?.remove();
    input.classList.remove("invalid");
  }

  // =====================================================
  // STEP 1
  // =====================================================

  const title = document.getElementById("internship_title");
  const description = document.getElementById("internship_description");
  const industry = document.getElementById("internship_industry");
  const speciality = document.getElementById("internship_speciality");
  const positions = document.getElementById("internship_positions");
  const startDate = document.getElementById("internship_start_date");
  const endDate = document.getElementById("internship_end_date");
  const deadline = document.getElementById("internship_deadline");

  [
    title,
    description,
    industry,
    speciality,
    positions,
    startDate,
    endDate,
    deadline
  ].forEach(clearError);

  if (!title.value.trim())
    showError(title, "validationTitleRequired");

  if (!description.value.trim())
    showError(description, "validationDescriptionRequired");

  if (!industry.value)
    showError(industry, "validationIndustryRequired");

  if (!speciality.value)
    showError(speciality, "validationSpecialityRequired");

  if (!positions.value || Number(positions.value) < 1)
    showError(positions, "validationPositionsRequired");

  if (!deadline.value)
    showError(deadline, "validationDeadlineRequired");

  if (startDate.value && endDate.value) {
    if (new Date(endDate.value) <= new Date(startDate.value)) {
      showError(endDate, "validationEndDateAfterStart");
    }
  }

  // =====================================================
  // STEP 2
  // =====================================================

  if (getInternshipSkills("skills").length === 0) {
    showError(document.getElementById("internshipSkills-skills"), "validationSkillRequired");
  }

  // =====================================================
  // STEP 3
  // =====================================================

  const academic = document.getElementById("internship_academic_required");
  const credit = document.getElementById("internship_credit_eligibility");
  const workSetting = document.querySelector(
    'input[name="internship_mode"]:checked'
  );
  const scheduleType = document.querySelector(
    'input[name="internship_hours"]:checked'
  );

  const location = document.getElementById("internship_location");
  const periodStart = document.getElementById("internship_start_period");
  const periodEnd = document.getElementById("internship_end_period");

  [
    academic,
    credit,
    location,
    periodStart,
    periodEnd
  ].forEach(clearError);

  if (!academic.value)
    showError(academic, "validationAcademicRequired");

  if (!credit.value)
    showError(credit, "validationCreditRequired");

  if (!workSetting)
    showError(
      document.querySelector(".inputRadio2"),
      "validationWorkSettingRequired"
    );

  if (!scheduleType)
    showError(
      document.querySelectorAll(".inputRadio2")[1],
      "validationScheduleTypeRequired"
    );

  if (workSetting && workSetting.value !== "Remote") {
    if (!location.value.trim()) {
      showError(location, "validationLocationRequired");
    }
  }

  if (periodStart.value && periodEnd.value) {
    if (new Date(periodEnd.value) <= new Date(periodStart.value)) {
      showError(periodEnd, "validationEndDateAfterStart");
    }
  }

  // =====================================================
  // STEP 4
  // =====================================================

  const feedback = document.getElementById("internship_feedback_frequency");
  const format = document.getElementById("internship_evaluation_format");
  const completion = document.getElementById("internship_completion_requirement");
  const output = document.getElementById("internship_final_output");

  [feedback, format, completion, output].forEach(clearError);

  if (!feedback.value)
    showError(feedback, "validationFeedbackFrequencyRequired");

  if (!format.value)
    showError(format, "validationEvaluationFormatRequired");

  if (!completion.value)
    showError(completion, "validationCompletionRequirementRequired");

  if (!output.value)
    showError(output, "validationFinalOutputRequired");

  // =====================================================
  // STEP 5
  // =====================================================

  const internshipType = document.getElementById("internship_type");

  clearError(internshipType);

  if (!internshipType.value) {
    showError(internshipType, "validationInternshipTypeRequired");
  }

  return isValid;
}

async function saveInternshipDraft() {
  const selectedLang = getCurrentLang();
  const t = msgInternship_translations[selectedLang] || msgInternship_translations['en'];

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  const title = document.getElementById("internship_title").value.trim();
  const description = document.getElementById("internship_description").value.trim();

  if (!title || !description) {
    showNotification("warning", t.draftRequiredTitle, t.draftRequiredMessage);
    return;
  }

  try {
    const draftData = buildInternshipData(user, "Draft");

    if (currentEditingInternshipId) {
      await updateDoc(doc(db, "opportunities", currentEditingInternshipId), {
        ...draftData,
        updatedAt: serverTimestamp()
      });

      showNotification("success", t.draftUpdatedTitle, t.draftUpdatedMessage);
    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), draftData);
      currentEditingInternshipId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId: taskRef.id,
        title: draftData.title,
        status: "Draft",
        createdAt: serverTimestamp()
      });

      showNotification("success", t.draftSavedTitle, t.draftSavedMessage);
    }

    cleanInternshipForm();
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.draftSaveFailedTitle, t.draftSaveFailedMessage);
  }
}

async function publishInternship(isBoosted = false) {
  const selectedLang = getCurrentLang();
  const t = msgInternship_translations[selectedLang] || msgInternship_translations['en'];

  const cost = isBoosted ? 25 : 20;
  const actionName = isBoosted ? "Publish Boosted Internship" : "Publish Internship";

  if (!validateInternshipInputs()) {
    showNotification("warning", t.jobPublishRequiredTitle, t.jobPublishRequiredMessage);
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  try {
    const jobData = buildInternshipData(user, "Pending");
    jobData.isBoosted = isBoosted;

    let opportunityId;

    if (currentEditingInternshipId) {
      opportunityId = currentEditingInternshipId;

      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...jobData,
        updatedAt: serverTimestamp()
      });

    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), jobData);
      opportunityId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId,
        title: jobData.title,
        status: "Pending",
        createdAt: serverTimestamp()
      });
    }

    await saveInternshipPublishConsumption(user.uid, opportunityId, cost, actionName);

    updateUserSection(user);
    cleanInternshipForm();

    showNotification("success", t.jobSubmittedTitle, t.jobSubmittedMessage);

    currentEditingInternshipId = null;
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.jobSaveFailedTitle, t.jobSaveFailedMessage);
  }
}

async function saveInternshipPublishConsumption(userId, opportunityId, cost, actionName) {
  const consumptionRef = doc(db, "users", userId, "consumptions", opportunityId);

  await setDoc(consumptionRef, {
    coins_used: cost,
    action_name: actionName,
    category: "internship",
    opportunityId: opportunityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ================================== CLEAR INTERN FORM ==============================

document.getElementById('cleanInternshipForm').addEventListener('click', cleanInternshipForm);

function cleanInternshipForm() {

  document.querySelectorAll("#internshipPage input").forEach(input => {
    const type = input.type;

    if (["text", "number", "datetime-local"].includes(type)) {
      input.value = "";
    }

    if (type === "checkbox" || type === "radio") {
      input.checked = false;
    }
  });

  document.querySelectorAll("#internshipPage textarea").forEach(textarea => {
    textarea.value = "";
  });

  document.querySelectorAll("#internshipPage select").forEach(select => {
    select.selectedIndex = 0;
  });

  // Reset distance
  const slider = document.getElementById("internship_max_distance_slider");
  const distance = document.getElementById("internship_max_distance_km");

  if (slider) slider.value = 140;
  if (distance) distance.value = 140;

  // Default checked evaluation criteria
  [
    "internship_learning_progress",
    "internship_task_completion"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });

  // Reset dynamic skills/languages
  const skillsContainer = document.getElementById("internshipSkills-skills");
  const langsContainer = document.getElementById("internshipSkills-Langs");

  if (skillsContainer) skillsContainer.innerHTML = "";
  if (langsContainer) langsContainer.innerHTML = "";

  AddSkillVolunteer("skills");
  AddSkillVolunteer("langs");

  // Remove validation
  document.querySelectorAll("#internshipPage .error-span").forEach(e => e.remove());
  document.querySelectorAll("#internshipPage .invalid").forEach(e => e.classList.remove("invalid"));

  currentEditingInternshipId = null;

  navigateToInternshipPageFirstStep();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function navigateInternshipSections(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pages = container.querySelectorAll('.horizontal-newTaskPage');
  const steps = container.querySelectorAll('.horizontal-newTask button');

  let currentIndex = Array.from(pages)
    .findIndex(page => page.style.display !== 'none');

  if (currentIndex === -1) currentIndex = 0;

  pages[currentIndex].style.display = 'none';
  if (steps[currentIndex]) steps[currentIndex].classList.remove('active');

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= pages.length) nextIndex = pages.length - 1;

  pages[nextIndex].style.display = 'block';
  if (steps[nextIndex]) steps[nextIndex].classList.add('active');

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', () => {
  const taskPage = document.getElementById("internshipPage");

  if (taskPage) {
    taskPage.querySelectorAll(".nextStep").forEach(btn => {
      btn.addEventListener("click", () => navigateInternshipSections("internshipPage", 1));
    });

    taskPage.querySelectorAll(".prevStep").forEach(btn => {
      btn.addEventListener("click", () => navigateInternshipSections("internshipPage", -1));
    });
  }
});

function navigateToInternshipPageFirstStep(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll(".horizontal-newTask button");
  const pages = container.querySelectorAll(".horizontal-newTaskPage");

  buttons.forEach(btn => btn.classList.remove("active"));
  pages.forEach(page => page.style.display = "none");

  if (buttons[0]) buttons[0].classList.add("active");
  if (pages[0]) pages[0].style.display = "block";
}

// =====================================================================================
// ================================= VOLUNTEER SETTINGS ================================
// =====================================================================================

const skillVolunteerCounters = {
  skills: 0,
  langs: 0
};

function AddSkillVolunteer(type) {
  const selectedLang = getCurrentLang();
  const T = App_translations[selectedLang] || App_translations['en'];

  const listId = type === 'skills'
    ? 'volunteerSkills-skills'
    : 'volunteerSkills-Langs';

  const container = document.getElementById(listId);
  if (!container) return;

  const skillIndex = ++skillVolunteerCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  // input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder =
    type === 'langs'
      ? "English, French, Spanish..."
      : "JavaScript, Logistics, Marketing...";
  input.name = `${skillId}-name`;

  // rating group
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;

    const label = document.createElement('label');
    label.setAttribute('for', radio.id);

    ratingGroup.appendChild(radio);
    ratingGroup.appendChild(label);
  }

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
  };

  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);
}

document.getElementById('volunteerAddSkill').addEventListener('click', () => AddSkillVolunteer('skills'));
document.getElementById('volunteerAddLang').addEventListener('click', () => AddSkillVolunteer('langs'));


function isVolunteerEmpty() {
    const title = document.getElementById("volunteer_title").value.trim();
    const description = document.getElementById("volunteer_description").value.trim();

    return !title && !description;
}

async function populateVolunteerDraft(opportunityId) {
    const selectedLang = getCurrentLang();
    const t = msgVolunteer_translations[selectedLang] || msgVolunteer_translations["en"];

    const docRef = doc(db, "opportunities", opportunityId);
    const snap = await getDoc(docRef);

    cleanVolunteerForm();

    if (!snap.exists()) {
        alert(t.draftNotFound);
        return;
    }

    const data = snap.data();

    // ======================================
    // BASIC
    // ======================================

    loadIndustries(data.industry);
    loadSpecialties(data.industry, data.speciality);

    document.getElementById("volunteer_title").value =
        data.title || "";

    document.getElementById("volunteer_description").value =
        data.description || "";

    document.getElementById("volunteer_industry").value =
        data.industry || "";

    document.getElementById("volunteer_speciality").value =
        data.speciality || "";

    if (data.schedule) {

        document.getElementById("vol_application_start_date").value =
            data.schedule.applicationStartDate || "";

        document.getElementById("vol_application_end_date").value =
            data.schedule.applicationEndDate || "";

        document.getElementById("vol_application_deadline").value =
            data.schedule.applicationDeadline || "";
    }

    // ======================================
    // REQUIREMENTS
    // ======================================

    document.getElementById("vol_min_age").value =
        data.minimumAge || "";

    // Skills
    if (data.skills?.length) {

        const container = document.getElementById("volunteerSkills-skills");
        container.innerHTML = "";

        skillVolunteerCounters.skills = 0;

        data.skills.forEach(skill => {

            AddSkillVolunteer("skills");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                skill.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${skill.score}"]`
            );

            if (radio) radio.checked = true;

        });
    }

    // Languages
    if (data.languages?.length) {

        const container = document.getElementById("volunteerSkills-Langs");
        container.innerHTML = "";

        skillVolunteerCounters.langs = 0;

        data.languages.forEach(language => {

            AddSkillVolunteer("langs");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                language.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${language.score}"]`
            );

            if (radio) radio.checked = true;

        });
    }

    // ======================================
    // CONDITIONS
    // ======================================

    if (data.executionMode) {
        setRadio("vol-ExecMode", data.executionMode);
    }

    document.getElementById("vol_numb_positions").value =
        data.positions || 1;

    if (data.period) {

        document.getElementById("volunteer_start_period").value =
            data.period.start || "";

        document.getElementById("volunteer_end_period").value =
            data.period.end || "";

    }

    if (data.commitment) {
        const commitment = document.getElementById(data.commitment);
        if (commitment) commitment.checked = true;
    }

    if (data.location) {

        document.getElementById("volunteer_location").value =
            data.location.reference || "";

        document.getElementById("volunteer_max_distance_km").value =
            data.location.maxDistanceKm || 0;

        document.getElementById("volunteer_max_distance_slider").value =
            data.location.maxDistanceKm || 0;
    }

    // ======================================
    // SELECTION
    // ======================================

    if (data.selection) {

        setCheckbox(
            "vol_interview",
            data.selection.interview
        );

        setCheckbox(
            "vol_background",
            data.selection.backgroundCheck
        );

        setCheckbox(
            "vol_agreement",
            data.selection.agreementRequired
        );

        document.getElementById("volunteer_terms").value =
            data.selection.volunteerTerms || "";
    }

    // ======================================
    // BENEFITS
    // ======================================

    if (data.recognition) {

        setCheckbox(
            "vol_certificate",
            data.recognition.certificate
        );

        setCheckbox(
            "vol_recommendation",
            data.recognition.recommendationLetter
        );

        setCheckbox(
            "vol_reference",
            data.recognition.professionalReference
        );
    }

    if (data.learning) {

        setCheckbox(
            "vol_training",
            data.learning.training
        );

        setCheckbox(
            "vol_mentorship",
            data.learning.mentorship
        );

        setCheckbox(
            "vol_networking",
            data.learning.networking
        );
    }

    if (data.support) {

        setCheckbox(
            "vol_transport",
            data.support.transport
        );

        setCheckbox(
            "vol_meals",
            data.support.meals
        );

        setCheckbox(
            "vol_accommodation",
            data.support.accommodation
        );
    }

    currentEditingVolunteerId = opportunityId;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================================== ADD NEW VOLUNTEER ================================

function getVolunteerSkills(type) {
  const containerId = type === "skills"
    ? "volunteerSkills-skills"
    : "volunteerSkills-Langs";
  const container = document.getElementById(containerId);
  if (!container) return [];
  const result = [];
  container.querySelectorAll(".navCard-requiresGroup").forEach(group => {
    const nameInput = group.querySelector("input[type='text']");
    const scoreInput = group.querySelector("input[type='radio']:checked");
    if (!nameInput || !nameInput.value.trim()) return;
    const score = scoreInput ? parseInt(scoreInput.value) : 0;
    result.push({
      name: nameInput.value.trim(),
      score: score
    });
  });
  return result;
}

document.getElementById('saveVolunteerDraft').addEventListener('click', saveVolunteerDraft);
document.getElementById("publishVolunteer").addEventListener("click", () => {publishVolunteer(false);});
document.getElementById("boostVolunteer").addEventListener("click", () => {publishVolunteer(true);});

function buildVolunteerData(user, statusValue) {
  return {
    // ===== CORE =====
    category: "volunteers",

    title: document.getElementById("volunteer_title")?.value || "",
    description: document.getElementById("volunteer_description")?.value || "",

    industry: document.getElementById("volunteer_industry")?.value || "",
    speciality: document.getElementById("volunteer_speciality")?.value || "",

    // ===== APPLICATION TIMELINE =====
    schedule: {
      applicationStartDate:
        document.getElementById("vol_application_start_date")?.value || null,

      applicationEndDate:
        document.getElementById("vol_application_end_date")?.value || null,

      applicationDeadline:
        document.getElementById("vol_application_deadline")?.value || null
    },

    // ===== REQUIREMENTS =====
    minimumAge: Number(
      document.getElementById("vol_min_age")?.value || 0
    ),

    skills: getVolunteerSkills("skills"),
    languages: getVolunteerSkills("langs"),

    // ===== VOLUNTEER CONDITIONS =====
    executionMode:
      document.querySelector('input[name="vol-ExecMode"]:checked')?.value || "",

    positions: Number(
      document.getElementById("vol_numb_positions")?.value || 1
    ),

    period: {
      start: document.getElementById("vol_start_date")?.value || null,
      end: document.getElementById("vol_end_date")?.value || null
    },

    commitment:
      document.querySelector('input[name="volCommitment"]:checked')?.id || "",

    location: {
      reference:
        document.getElementById("volunteer_location")?.value || "",

      maxDistanceKm: Number(
        document.getElementById("volunteer_max_distance_km")?.value || 0
      )
    },

    // ===== SELECTION =====
    selection: {
      interview:
        document.getElementById("vol_interview")?.checked || false,

      backgroundCheck:
        document.getElementById("vol_background")?.checked || false,

      agreementRequired:
        document.getElementById("vol_agreement")?.checked || false,

      volunteerTerms:
        document.getElementById("volunteer_terms")?.value || ""
    },

    // ===== BENEFITS =====
    recognition: {
      certificate:
        document.getElementById("vol_certificate")?.checked || false,

      recommendationLetter:
        document.getElementById("vol_recommendation")?.checked || false,

      professionalReference:
        document.getElementById("vol_reference")?.checked || false
    },

    learning: {
      training:
        document.getElementById("vol_training")?.checked || false,

      mentorship:
        document.getElementById("vol_mentorship")?.checked || false,

      networking:
        document.getElementById("vol_networking")?.checked || false
    },

    support: {
      transport:
        document.getElementById("vol_transport")?.checked || false,

      meals:
        document.getElementById("vol_meals")?.checked || false,

      accommodation:
        document.getElementById("vol_accommodation")?.checked || false
    },

    // ===== META =====
    createdAt: serverTimestamp(),
    ownerId: user.uid,
    status: statusValue,

    applicants: 0,
    accepted: 0,
    completed: false
  };
}

function validateVolunteerInputs() {

    const selectedLang = getCurrentLang();
    const t = msgVolunteer_translations[selectedLang] || msgVolunteer_translations.en;

    let isValid = true;

    function showError(input, messageKey) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        let errorSpan = container.querySelector(".error-span");

        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.className = "error-span";
            errorSpan.style.color = "red";
            errorSpan.style.fontSize = "12px";
            container.appendChild(errorSpan);
        }

        errorSpan.textContent = t[messageKey] || "Required field";

        input.classList.add("invalid");

        isValid = false;
    }

    function clearError(input) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        container.querySelector(".error-span")?.remove();

        input.classList.remove("invalid");
    }

    // =====================================================
    // STEP 1
    // =====================================================

    const title = document.getElementById("volunteer_title");
    const description = document.getElementById("volunteer_description");
    const industry = document.getElementById("volunteer_industry");
    const speciality = document.getElementById("volunteer_speciality");
    const deadline = document.getElementById("vol_application_deadline");
    const timelineStart = document.getElementById("vol_application_start_date");
    const timelineEnd = document.getElementById("vol_application_end_date");

    [
        title,
        description,
        industry,
        speciality,
        deadline,
        timelineStart,
        timelineEnd
    ].forEach(clearError);

    if (!title.value.trim())
        showError(title, "validationTitleRequired");

    if (!description.value.trim())
        showError(description, "validationDescriptionRequired");

    if (!industry.value)
        showError(industry, "validationIndustryRequired");

    if (!speciality.value)
        showError(speciality, "validationSpecialityRequired");

    if (!deadline.value)
        showError(deadline, "validationDeadlineRequired");

    if (timelineStart.value && timelineEnd.value) {
        if (new Date(timelineEnd.value) <= new Date(timelineStart.value)) {
            showError(timelineEnd, "validationEndDateAfterStart");
        }
    }

    // =====================================================
    // STEP 2
    // =====================================================

    const minAge = document.getElementById("vol_min_age");

    clearError(minAge);

    if (!minAge.value || Number(minAge.value) < 1)
        showError(minAge, "validationMinAgeRequired");

    if (getVolunteerSkills("skills").length === 0)
        showError(
            document.getElementById("volunteerSkills-skills"),
            "validationSkillRequired"
        );

    if (getVolunteerSkills("langs").length === 0)
        showError(
            document.getElementById("volunteerSkills-Langs"),
            "validationLanguageRequired"
        );

    // =====================================================
    // STEP 3
    // =====================================================

    const workSetting =
        document.querySelector('input[name="vol-ExecMode"]:checked');

    const commitment =
        document.querySelector('input[name="volCommitment"]:checked');

    const positions =
        document.getElementById("vol_numb_positions");

    const location =
        document.getElementById("volunteer_location");

    const startPeriod =
        document.getElementById("volunteer_start_period");

    const endPeriod =
        document.getElementById("volunteer_end_period");

    [
        positions,
        location,
        startPeriod,
        endPeriod
    ].forEach(clearError);

    if (!workSetting)
        showError(
            document.querySelector("#vol_execution_mode"),
            "validationWorkSettingRequired"
        );

    if (!commitment)
        showError(
            document.querySelectorAll(".inputRadio2")[1],
            "validationCommitmentRequired"
        );

    if (!positions.value || Number(positions.value) < 1)
        showError(
            positions,
            "validationPositionsRequired"
        );

    if (
        workSetting &&
        workSetting.value !== "Remote" &&
        !location.value.trim()
    ) {
        showError(location, "validationLocationRequired");
    }

    if (startPeriod.value && endPeriod.value) {
        if (new Date(endPeriod.value) <= new Date(startPeriod.value)) {
            showError(endPeriod, "validationEndDateAfterStart");
        }
    }

    // =====================================================
    // STEP 4
    // =====================================================

    const terms = document.getElementById("volunteer_terms");

    clearError(terms);

    if (!terms.value.trim())
        showError(terms, "validationTermsRequired");

    return isValid;
}

async function saveVolunteerDraft() {
  const selectedLang = getCurrentLang();
  const t = msgVolunteer_translations[selectedLang] || msgVolunteer_translations['en'];

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  const title = document.getElementById("volunteer_title").value.trim();
  const description = document.getElementById("volunteer_description").value.trim();

  if (!title || !description) {
    showNotification("warning", t.draftRequiredTitle, t.draftRequiredMessage);
    return;
  }

  try {
    const draftData = buildVolunteerData(user, "Draft");

    if (currentEditingVolunteerId) {
      await updateDoc(doc(db, "opportunities", currentEditingVolunteerId), {
        ...draftData,
        updatedAt: serverTimestamp()
      });

      showNotification("success", t.draftUpdatedTitle, t.draftUpdatedMessage);
    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), draftData);
      currentEditingVolunteerId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId: taskRef.id,
        title: draftData.title,
        status: "Draft",
        createdAt: serverTimestamp()
      });

      showNotification("success", t.draftSavedTitle, t.draftSavedMessage);
    }

    cleanVolunteerForm();
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.draftSaveFailedTitle, t.draftSaveFailedMessage);
  }
}

async function publishVolunteer(isBoosted = false) {
  const selectedLang = getCurrentLang();
  const t = msgVolunteer_translations[selectedLang] || msgVolunteer_translations['en'];

  const cost = isBoosted ? 25 : 20;
  const actionName = isBoosted ? "Publish Boosted Volunteer" : "Publish Volunteer";

  if (!validateVolunteerInputs()) {
    showNotification("warning", t.volunteerPublishRequiredTitle, t.volunteerPublishRequiredMessage);
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  try {
    const jobData = buildVolunteerData(user, "Pending");
    jobData.isBoosted = isBoosted;

    let opportunityId;

    if (currentEditingVolunteerId) {
      opportunityId = currentEditingVolunteerId;

      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...jobData,
        updatedAt: serverTimestamp()
      });

    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), jobData);
      opportunityId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId,
        title: jobData.title,
        status: "Pending",
        createdAt: serverTimestamp()
      });
    }

    await saveVolunteerPublishConsumption(user.uid, opportunityId, cost, actionName);

    updateUserSection(user);
    cleanVolunteerForm();

    showNotification("success", t.volunteerSubmittedTitle, t.volunteerSubmittedMessage);

    currentEditingVolunteerId = null;
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.volunteerSaveFailedTitle, t.volunteerSaveFailedMessage);
  }
}

async function saveVolunteerPublishConsumption(userId, opportunityId, cost, actionName) {
  const consumptionRef = doc(db, "users", userId, "consumptions", opportunityId);

  await setDoc(consumptionRef, {
    coins_used: cost,
    action_name: actionName,
    category: "volunteer",
    opportunityId: opportunityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ============================== CLEAR VOLUNTEER FORM ===============================

document.getElementById('cleanVolunteer').addEventListener('click', cleanVolunteerForm);

function cleanVolunteerForm() {

  // =========================
  // Reset inputs
  // =========================
  document.querySelectorAll("#volunteerPage input").forEach(input => {
    switch (input.type) {
      case "text":
      case "number":
      case "datetime-local":
        input.value = "";
        break;

      case "checkbox":
      case "radio":
        input.checked = false;
        break;

      case "range":
        input.value = 140;
        break;
    }
  });

  // =========================
  // Reset textareas
  // =========================
  document.querySelectorAll("#volunteerPage textarea").forEach(textarea => {
    textarea.value = "";
  });

  // =========================
  // Reset selects
  // =========================
  document.querySelectorAll("#volunteerPage select").forEach(select => {
    select.selectedIndex = 0;
  });

  // =========================
  // Reset distance
  // =========================
  const slider = document.getElementById("volunteer_max_distance_slider");
  const distance = document.getElementById("volunteer_max_distance_km");

  if (slider) slider.value = 140;
  if (distance) distance.value = 140;

  // =========================
  // Default checked options
  // =========================
  [
    "vol_interview",
    "vol_certificate"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });

  // =========================
  // Reset dynamic Skills/Languages
  // =========================
  const skillsContainer = document.getElementById("volunteerSkills-skills");
  const langsContainer = document.getElementById("volunteerSkills-Langs");

  if (skillsContainer) skillsContainer.innerHTML = "";
  if (langsContainer) langsContainer.innerHTML = "";

  AddSkillVolunteer("skills");
  AddSkillVolunteer("langs");

  // =========================
  // Remove validation
  // =========================
  document.querySelectorAll("#volunteerPage .error-span")
    .forEach(el => el.remove());

  document.querySelectorAll("#volunteerPage .invalid")
    .forEach(el => el.classList.remove("invalid"));

  // =========================
  // Reset editing state
  // =========================
  currentEditingVolunteerId = null;

  navigateToVolunteerPageFirstStep();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function navigateVolunteerSections(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pages = container.querySelectorAll('.horizontal-newTaskPage');
  const steps = container.querySelectorAll('.horizontal-newTask button');

  let currentIndex = Array.from(pages)
    .findIndex(page => page.style.display !== 'none');

  if (currentIndex === -1) currentIndex = 0;

  pages[currentIndex].style.display = 'none';
  if (steps[currentIndex]) steps[currentIndex].classList.remove('active');

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= pages.length) nextIndex = pages.length - 1;

  pages[nextIndex].style.display = 'block';
  if (steps[nextIndex]) steps[nextIndex].classList.add('active');

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', () => {
  const taskPage = document.getElementById("volunteerPage");

  if (taskPage) {
    taskPage.querySelectorAll(".nextStep").forEach(btn => {
      btn.addEventListener("click", () => navigateVolunteerSections("volunteerPage", 1));
    });

    taskPage.querySelectorAll(".prevStep").forEach(btn => {
      btn.addEventListener("click", () => navigateVolunteerSections("volunteerPage", -1));
    });
  }
});

function navigateToVolunteerPageFirstStep(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll(".horizontal-newTask button");
  const pages = container.querySelectorAll(".horizontal-newTaskPage");

  buttons.forEach(btn => btn.classList.remove("active"));
  pages.forEach(page => page.style.display = "none");

  if (buttons[0]) buttons[0].classList.add("active");
  if (pages[0]) pages[0].style.display = "block";
}

// ======================================================================================
// ================================= CHALLENGE SETTINGS =================================
// ======================================================================================

const skillChallengeCounters = {
  skills: 0,
  langs: 0
};

function AddSkillChallenge(type) {
  const selectedLang = getCurrentLang();
  const T = App_translations[selectedLang] || App_translations['en'];

  const listId = type === 'skills'
    ? 'challengeSkills-skills'
    : 'challengeSkills-Langs';

  const container = document.getElementById(listId);
  if (!container) return;

  const skillIndex = ++skillChallengeCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  // input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder =
    type === 'langs'
      ? "English, French, Spanish..."
      : "JavaScript, Logistics, Marketing...";
  input.name = `${skillId}-name`;

  // rating group
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;

    const label = document.createElement('label');
    label.setAttribute('for', radio.id);

    ratingGroup.appendChild(radio);
    ratingGroup.appendChild(label);
  }

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
  };

  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);
}

document.getElementById('challengeAddSkill').addEventListener('click', () => AddSkillChallenge('skills'));
document.getElementById('challengeAddLang').addEventListener('click', () => AddSkillChallenge('langs'));

function isChallengeEmpty() {
  const title = document.getElementById("challenge_title").value.trim();
  const description = document.getElementById("challenge_description").value.trim();

  return !title && !description;
}

async function populateChallengeDraft(opportunityId) {

    const selectedLang = getCurrentLang();
    const t = msgChallenge_translations[selectedLang] || msgChallenge_translations.en;

    const docRef = doc(db, "opportunities", opportunityId);
    const snap = await getDoc(docRef);

    cleanChallengeForm();

    if (!snap.exists()) {
        alert(t.draftNotFound);
        return;
    }

    const data = snap.data();

    // =====================================================
    // STEP 1 - CHALLENGE DEFINITION
    // =====================================================

    loadIndustries(data.industry);
    loadSpecialties(data.industry, data.speciality);

    document.getElementById("challenge_title").value =
        data.title || "";

    document.getElementById("challenge_description").value =
        data.description || "";

    document.getElementById("challenge_industry").value =
        data.industry || "";

    document.getElementById("challenge_speciality").value =
        data.speciality || "";

    if (data.challengeType) {
        const radio = document.querySelector(
            `input[name="challenge_type"][value="${data.challengeType}"]`
        );
        if (radio) radio.checked = true;
    }

    if (data.schedule) {

        document.getElementById("challenge_start_date").value =
            data.schedule.startDate || "";

        document.getElementById("challenge_end_date").value =
            data.schedule.endDate || "";

        document.getElementById("challenge_deadline").value =
            data.schedule.submissionDeadline || "";
    }

    document.getElementById("challenge_max_participants").value =
        data.maximumParticipants || "";

    // =====================================================
    // STEP 2 - REQUIREMENTS
    // =====================================================

    document.getElementById("challenge_min_age").value =
        data.minimumAge || "";

    // ---------- Skills ----------

    if (data.skills?.length) {

        const container = document.getElementById("challengeSkills-skills");
        container.innerHTML = "";

        skillChallengeCounters.skills = 0;

        data.skills.forEach(skill => {

            AddSkillChallenge("skills");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                skill.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${skill.score}"]`
            );

            if (radio) radio.checked = true;
        });
    }

    // ---------- Languages ----------

    if (data.languages?.length) {

        const container = document.getElementById("challengeSkills-Langs");
        container.innerHTML = "";

        skillChallengeCounters.langs = 0;

        data.languages.forEach(language => {

            AddSkillChallenge("langs");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                language.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${language.score}"]`
            );

            if (radio) radio.checked = true;
        });
    }

    // =====================================================
    // STEP 3 - FORMAT
    // =====================================================

    if (data.difficultyLevel) {
        const radio = document.getElementById(data.difficultyLevel);
        if (radio) radio.checked = true;
    }

    if (data.participationMode) {
        setRadio("challenge_mode", data.participationMode);
    }

    if (data.submissionFormat) {
        setRadio("challenge_submission", data.submissionFormat);
    }

    document.getElementById("challenge_brief").value =
        data.brief || "";

    // =====================================================
    // STEP 4 - EVALUATION
    // =====================================================

    if (data.evaluation) {

        if (data.evaluation.judgingCriteria) {

            const criteria =
                document.querySelectorAll("#challengeEvaluation .criteria-item input");

            criteria[0].checked =
                data.evaluation.judgingCriteria.innovation ?? false;

            criteria[1].checked =
                data.evaluation.judgingCriteria.impact ?? false;

            criteria[2].checked =
                data.evaluation.judgingCriteria.feasibility ?? false;

            criteria[3].checked =
                data.evaluation.judgingCriteria.presentationQuality ?? false;
        }

        if (data.evaluation.winnerSelection) {
            setRadio(
                "challenge_selection",
                data.evaluation.winnerSelection
            );
        }

        document.getElementById("challenge_winners").value =
            data.evaluation.numberOfWinners || "";
    }

    // =====================================================
    // STEP 5 - REWARDS
    // =====================================================

    if (data.rewards) {

        setCheckbox(
            "challenge_cash",
            data.rewards.cashPrize
        );

        setCheckbox(
            "challenge_certificate",
            data.rewards.certificate
        );

        setCheckbox(
            "challenge_internship",
            data.rewards.internshipOpportunity
        );

        setCheckbox(
            "challenge_job",
            data.rewards.jobOpportunity
        );

        document.getElementById("challenge_reward_description").value =
            data.rewards.description || "";
    }

    // =====================================================
    // FINAL
    // =====================================================

    currentEditingChallengeId = opportunityId;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ================================== ADD NEW CHALLENGE ================================

function getChallengeSkills(type) {
  const containerId = type === "skills"
    ? "challengeSkills-skills"
    : "challengeSkills-Langs";
  const container = document.getElementById(containerId);
  if (!container) return [];
  const result = [];
  container.querySelectorAll(".navCard-requiresGroup").forEach(group => {
    const nameInput = group.querySelector("input[type='text']");
    const scoreInput = group.querySelector("input[type='radio']:checked");
    if (!nameInput || !nameInput.value.trim()) return;
    const score = scoreInput ? parseInt(scoreInput.value) : 0;
    result.push({
      name: nameInput.value.trim(),
      score: score
    });
  });
  return result;
}

document.getElementById('saveChallengeDraft').addEventListener('click', saveChallengeDraft);
document.getElementById("publishChallenge").addEventListener("click", () => {publishChallenge(false);});
document.getElementById("boostChallenge").addEventListener("click", () => {publishChallenge(true);});

function buildChallengeData(user, statusValue) {
  return {

    // ===== CORE =====
    category: "challenges",

    title:
      document.getElementById("challenge_title")?.value || "",

    description:
      document.getElementById("challenge_description")?.value || "",

    industry:
      document.getElementById("challenge_industry")?.value || "",

    speciality:
      document.getElementById("challenge_speciality")?.value || "",

    challengeType:
      document.querySelector('input[name="challenge_type"]:checked')?.value || "",

    // ===== CHALLENGE SCHEDULE =====
    schedule: {

      startDate:
        document.getElementById("challenge_start_date")?.value || null,

      endDate:
        document.getElementById("challenge_end_date")?.value || null,

      submissionDeadline:
        document.getElementById("challenge_deadline")?.value || null

    },

    maximumParticipants: Number(
      document.getElementById("challenge_max_participants")?.value || 0
    ),

    // ===== REQUIREMENTS =====

    minimumAge: Number(
      document.getElementById("challenge_min_age")?.value || 0
    ),

    skills: getChallengeSkills("skills"),

    languages: getChallengeSkills("langs"),

    // ===== FORMAT =====

    difficultyLevel:
      document.querySelector('input[name="challenge_level"]:checked')?.id || "",

    participationMode:
      document.querySelector('input[name="challenge_mode"]:checked')?.value || "",

    submissionFormat:
      document.querySelector('input[name="challenge_submission"]:checked')?.value || "",

    brief:
      document.getElementById("challenge_brief")?.value || "",

    // ===== EVALUATION =====

    evaluation: {

      judgingCriteria: {

        innovation:
          document.querySelectorAll("#challengeEvaluation .criteria-item input")[0]?.checked || false,

        impact:
          document.querySelectorAll("#challengeEvaluation .criteria-item input")[1]?.checked || false,

        feasibility:
          document.querySelectorAll("#challengeEvaluation .criteria-item input")[2]?.checked || false,

        presentationQuality:
          document.querySelectorAll("#challengeEvaluation .criteria-item input")[3]?.checked || false

      },

      winnerSelection:
        document.querySelector('input[name="challenge_selection"]:checked')?.value || "",

      numberOfWinners: Number(
        document.getElementById("challenge_winners")?.value || 0
      )

    },

    // ===== REWARDS =====

    rewards: {

      cashPrize:
        document.getElementById("challenge_cash")?.checked || false,

      certificate:
        document.getElementById("challenge_certificate")?.checked || false,

      internshipOpportunity:
        document.getElementById("challenge_internship")?.checked || false,

      jobOpportunity:
        document.getElementById("challenge_job")?.checked || false,

      description:
        document.getElementById("challenge_reward_description")?.value || ""

    },

    // ===== META =====

    createdAt: serverTimestamp(),

    ownerId: user.uid,

    status: statusValue,

    applicants: 0,

    accepted: 0,

    completed: false

  };
}

function validateChallengeInputs() {
    const selectedLang = getCurrentLang();
    const t = msgChallenge_translations[selectedLang] || msgChallenge_translations.en;

    let isValid = true;

    function showError(input, messageKey) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        let errorSpan = container.querySelector(".error-span");

        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.className = "error-span";
            errorSpan.style.color = "red";
            errorSpan.style.fontSize = "12px";
            container.appendChild(errorSpan);
        }

        errorSpan.textContent = t[messageKey] || "Required field";
        input.classList.add("invalid");
        isValid = false;
    }

    function clearError(input) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        container.querySelector(".error-span")?.remove();
        input.classList.remove("invalid");
    }

    // =====================================================
    // STEP 1
    // =====================================================

    const title = document.getElementById("challenge_title");
    const description = document.getElementById("challenge_description");
    const industry = document.getElementById("challenge_industry");
    const speciality = document.getElementById("challenge_speciality");
    const deadline = document.getElementById("challenge_deadline");
    const startDate = document.getElementById("challenge_start_date");
    const endDate = document.getElementById("challenge_end_date");
    const participants = document.getElementById("challenge_max_participants");

    [
        title,
        description,
        industry,
        speciality,
        deadline,
        startDate,
        endDate,
        participants
    ].forEach(clearError);

    if (!title.value.trim())
        showError(title, "validationTitleRequired");

    if (!description.value.trim())
        showError(description, "validationDescriptionRequired");

    if (!industry.value)
        showError(industry, "validationIndustryRequired");

    if (!speciality.value)
        showError(speciality, "validationSpecialityRequired");

    if (!document.querySelector('input[name="challenge_type"]:checked'))
        showError(
            document.querySelector('input[name="challenge_type"]')?.parentElement,
            "validationChallengeTypeRequired"
        );

    if (!deadline.value)
        showError(deadline, "validationDeadlineRequired");

    if (!participants.value || Number(participants.value) < 1)
        showError(participants, "validationParticipantsRequired");

    if (startDate.value && endDate.value) {
        if (new Date(endDate.value) <= new Date(startDate.value)) {
            showError(endDate, "validationEndDateAfterStart");
        }
    }

    // =====================================================
    // STEP 2
    // =====================================================

    const minAge = document.getElementById("challenge_min_age");

    clearError(minAge);

    if (!minAge.value || Number(minAge.value) < 1)
        showError(minAge, "validationMinAgeRequired");

    if (getChallengeSkills("skills").length === 0)
        showError(
            document.getElementById("challengeSkills-skills"),
            "validationSkillRequired"
        );

    if (getChallengeSkills("langs").length === 0)
        showError(
            document.getElementById("challengeSkills-Langs"),
            "validationLanguageRequired"
        );

    // =====================================================
    // STEP 3
    // =====================================================

    const difficulty =
        document.querySelector('input[name="challenge_level"]:checked');

    const mode =
        document.querySelector('input[name="challenge_mode"]:checked');

    const submission =
        document.querySelector('input[name="challenge_submission"]:checked');

    const brief =
        document.getElementById("challenge_brief");

    clearError(brief);

    if (!difficulty)
        showError(
            document.querySelectorAll(".inputRadio2")[1],
            "validationDifficultyRequired"
        );

    if (!mode)
        showError(
            document.querySelectorAll(".inputRadio2")[2],
            "validationParticipationModeRequired"
        );

    if (!submission)
        showError(
            document.querySelectorAll(".inputRadio2")[3],
            "validationSubmissionFormatRequired"
        );

    if (!brief.value.trim())
        showError(
            brief,
            "validationBriefRequired"
        );

    // =====================================================
    // STEP 4
    // =====================================================

    const winnerSelection =
        document.querySelector('input[name="challenge_selection"]:checked');

    const winners =
        document.getElementById("challenge_winners");

    clearError(winners);

    if (!winnerSelection)
        showError(
            document.querySelectorAll(".inputRadio2")[4],
            "validationWinnerSelectionRequired"
        );

    if (!winners.value || Number(winners.value) < 1)
        showError(
            winners,
            "validationWinnerCountRequired"
        );

    // =====================================================
    // STEP 5
    // =====================================================

    const rewardSelected =
        document.getElementById("challenge_cash").checked ||
        document.getElementById("challenge_certificate").checked ||
        document.getElementById("challenge_internship").checked ||
        document.getElementById("challenge_job").checked;

    if (!rewardSelected)
        showError(
            document.querySelector("#challengeRewards .criteria-list"),
            "validationRewardRequired"
        );

    return isValid;
}

async function saveChallengeDraft() {
  const selectedLang = getCurrentLang();
  const t = msgChallenge_translations[selectedLang] || msgChallenge_translations['en'];

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  const title = document.getElementById("challenge_title").value.trim();
  const description = document.getElementById("challenge_description").value.trim();

  if (!title || !description) {
    showNotification("warning", t.draftRequiredTitle, t.draftRequiredMessage);
    return;
  }

  try {
    const draftData = buildChallengeData(user, "Draft");

    if (currentEditingChallengeId) {
      await updateDoc(doc(db, "opportunities", currentEditingChallengeId), {
        ...draftData,
        updatedAt: serverTimestamp()
      });

      showNotification("success", t.draftUpdatedTitle, t.draftUpdatedMessage);
    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), draftData);
      currentEditingChallengeId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId: taskRef.id,
        title: draftData.title,
        status: "Draft",
        createdAt: serverTimestamp()
      });

      showNotification("success", t.draftSavedTitle, t.draftSavedMessage);
    }

    cleanChallengeForm();
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.draftSaveFailedTitle, t.draftSaveFailedMessage);
  }
}

async function publishChallenge(isBoosted = false) {
  const selectedLang = getCurrentLang();
  const t = msgMentorship_translations[selectedLang] || msgMentorship_translations['en'];

  const cost = isBoosted ? 25 : 20;
  const actionName = isBoosted ? "Publish Boosted Challenge" : "Publish Challenge";

  if (!validateChallengeInputs()) {
    showNotification("warning", t.mentorshipPublishRequiredTitle, t.mentorshipPublishRequiredMessage);
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  try {
    const jobData = buildChallengeData(user, "Pending");
    jobData.isBoosted = isBoosted;

    let opportunityId;

    if (currentEditingChallengeId) {
      opportunityId = currentEditingChallengeId;

      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...jobData,
        updatedAt: serverTimestamp()
      });

    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), jobData);
      opportunityId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId,
        title: jobData.title,
        status: "Pending",
        createdAt: serverTimestamp()
      });
    }

    await saveChallengePublishConsumption(user.uid, opportunityId, cost, actionName);

    updateUserSection(user);
    cleanChallengeForm();

    showNotification("success", t.mentorshipSubmittedTitle, t.mentorshipSubmittedMessage);

    currentEditingChallengeId = null;
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.mentorshipSaveFailedTitle, t.mentorshipSaveFailedMessage);
  }
}

async function saveChallengePublishConsumption(userId, opportunityId, cost, actionName) {
  const consumptionRef = doc(db, "users", userId, "consumptions", opportunityId);

  await setDoc(consumptionRef, {
    coins_used: cost,
    action_name: actionName,
    category: "challenge",
    opportunityId: opportunityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ============================== CLEAR CHALLENGE FORM =================================

document.getElementById('cleanChallengeForm').addEventListener('click', cleanChallengeForm);

function cleanChallengeForm() {

  // =========================
  // Reset inputs
  // =========================
  document.querySelectorAll("#challengePage input").forEach(input => {
    switch (input.type) {
      case "text":
      case "number":
      case "datetime-local":
        input.value = "";
        break;

      case "checkbox":
      case "radio":
        input.checked = false;
        break;

      case "range":
        input.value = 140;
        break;
    }
  });

  // =========================
  // Reset textareas
  // =========================
  document.querySelectorAll("#challengePage textarea").forEach(textarea => {
    textarea.value = "";
  });

  // =========================
  // Reset selects
  // =========================
  document.querySelectorAll("#challengePage select").forEach(select => {
    select.selectedIndex = 0;
  });

  // =========================
  // Reset distance
  // =========================
  const slider = document.getElementById("volunteer_max_distance_slider");
  const distance = document.getElementById("volunteer_max_distance_km");

  if (slider) slider.value = 140;
  if (distance) distance.value = 140;

  // =========================
  // Default checked options
  // =========================
  [
    "vol_interview",
    "vol_certificate"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = true;
  });

  // =========================
  // Reset dynamic Skills/Languages
  // =========================
  const skillsContainer = document.getElementById("volunteerSkills-skills");
  const langsContainer = document.getElementById("volunteerSkills-Langs");

  if (skillsContainer) skillsContainer.innerHTML = "";
  if (langsContainer) langsContainer.innerHTML = "";

  AddSkillVolunteer("skills");
  AddSkillVolunteer("langs");

  // =========================
  // Remove validation
  // =========================
  document.querySelectorAll("#volunteerPage .error-span")
    .forEach(el => el.remove());

  document.querySelectorAll("#volunteerPage .invalid")
    .forEach(el => el.classList.remove("invalid"));

  // =========================
  // Reset editing state
  // =========================
  currentEditingVolunteerId = null;

  navigateToChallengePageFirstStep();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function navigateChallengeSections(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pages = container.querySelectorAll('.horizontal-newTaskPage');
  const steps = container.querySelectorAll('.horizontal-newTask button');

  let currentIndex = Array.from(pages)
    .findIndex(page => page.style.display !== 'none');

  if (currentIndex === -1) currentIndex = 0;

  pages[currentIndex].style.display = 'none';
  if (steps[currentIndex]) steps[currentIndex].classList.remove('active');

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= pages.length) nextIndex = pages.length - 1;

  pages[nextIndex].style.display = 'block';
  if (steps[nextIndex]) steps[nextIndex].classList.add('active');

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', () => {
  const taskPage = document.getElementById("challengePage");

  if (taskPage) {
    taskPage.querySelectorAll(".nextStep").forEach(btn => {
      btn.addEventListener("click", () => navigateChallengeSections("challengePage", 1));
    });

    taskPage.querySelectorAll(".prevStep").forEach(btn => {
      btn.addEventListener("click", () => navigateChallengeSections("challengePage", -1));
    });
  }
});

function navigateToChallengePageFirstStep(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll(".horizontal-newTask button");
  const pages = container.querySelectorAll(".horizontal-newTaskPage");

  buttons.forEach(btn => btn.classList.remove("active"));
  pages.forEach(page => page.style.display = "none");

  if (buttons[0]) buttons[0].classList.add("active");
  if (pages[0]) pages[0].style.display = "block";
}

// ======================================================================================
// ================================= MENTORSHIP SETTINGS ================================
// ======================================================================================

const skillMentorshipCounters = {
  skills: 0,
  langs: 0
};

function AddSkillMentorship(type) {
  const selectedLang = getCurrentLang();
  const T = App_translations[selectedLang] || App_translations['en'];

  const listId = type === 'skills'
    ? 'mentorshipSkills-skills'
    : 'mentorshipSkills-Langs';

  const container = document.getElementById(listId);
  if (!container) return;

  const skillIndex = ++skillMentorshipCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  // input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder =
    type === 'langs'
      ? "English, French, Spanish..."
      : "JavaScript, Logistics, Marketing...";
  input.name = `${skillId}-name`;

  // rating group
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;

    const label = document.createElement('label');
    label.setAttribute('for', radio.id);

    ratingGroup.appendChild(radio);
    ratingGroup.appendChild(label);
  }

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
  };

  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);
}

document.getElementById('mentorshipAddSkill').addEventListener('click', () => AddSkillMentorship('skills'));
document.getElementById('mentorshipAddLang').addEventListener('click', () => AddSkillMentorship('langs'));

function isMentorshipEmpty() {
  const title = document.getElementById("mentorship_title").value.trim();
  const description = document.getElementById("mentorship_description").value.trim();

  return !title && !description;
}

async function populateMentorshipDraft(opportunityId) {
  const selectedLang = getCurrentLang();
  const t = msgMentorship_translations[selectedLang] || msgMentorship_translations.en;

  const docRef = doc(db, "opportunities", opportunityId);
  const snap = await getDoc(docRef);

  cleanMentorshipForm();

  if (!snap.exists()) {
    alert(t.draftNotFound);
    return;
  }

  const data = snap.data();

    // =====================================================
    // STEP 1 - MENTORSHIP DEFINITION
    // =====================================================

  loadIndustries(data.industry);
  loadSpecialties(data.industry, data.speciality);

  document.getElementById("mentorship_title").value = data.title || "";
  document.getElementById("mentorship_description").value = data.description || "";
  document.getElementById("mentorship_industry").value = data.industry || "";
  document.getElementById("mentorship_speciality").value = data.speciality || "";

    if (data.mentorshipFocus) {
        const radio = document.getElementById(data.mentorshipFocus);
        if (radio) radio.checked = true;
    }

    if (data.schedule) {

        document.getElementById("mentorship_start_date").value =
            data.schedule.startDate || "";

        document.getElementById("mentorship_end_date").value =
            data.schedule.endDate || "";

    }

    document.getElementById("mentorship_slots").value =
        data.availableSlots || "";

    // =====================================================
    // STEP 2 - MENTOR REQUIREMENTS
    // =====================================================

    if (data.mentorLevel) {
        const radio = document.getElementById(data.mentorLevel);
        if (radio) radio.checked = true;
    }

    // ---------- Skills ----------

    if (data.skills?.length) {

        const container = document.getElementById("mentorshipSkills-skills");
        container.innerHTML = "";

        mentorshipSkillCounters.skills = 0;

        data.skills.forEach(skill => {

            AddSkillMentorship("skills");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                skill.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${skill.score}"]`
            );

            if (radio) radio.checked = true;

        });

    }

    // ---------- Languages ----------

    if (data.languages?.length) {

        const container = document.getElementById("mentorshipSkills-Langs");
        container.innerHTML = "";

        mentorshipSkillCounters.langs = 0;

        data.languages.forEach(language => {

            AddSkillMentorship("langs");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                language.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${language.score}"]`
            );

            if (radio) radio.checked = true;

        });

    }

    // =====================================================
    // STEP 3 - PROGRAM STRUCTURE
    // =====================================================

    if (data.sessionFormat) {
        const radio = document.getElementById(data.sessionFormat);
        if (radio) radio.checked = true;
    }

    if (data.meetingMode) {
        const radio = document.getElementById(data.meetingMode);
        if (radio) radio.checked = true;
    }

    document.getElementById("mentorship_sessions_per_month").value =
        data.sessionsPerMonth || "";

    document.getElementById("mentorship_session_duration").value =
        data.sessionDuration || "";

    // =====================================================
    // STEP 4 - OUTCOMES
    // =====================================================

    if (data.outcomes) {

        setCheckbox(
            "mentorship_outcome_career",
            data.outcomes.careerDevelopment
        );

        setCheckbox(
            "mentorship_outcome_portfolio",
            data.outcomes.portfolioBuilding
        );

        setCheckbox(
            "mentorship_outcome_interview",
            data.outcomes.interviewPreparation
        );

        setCheckbox(
            "mentorship_outcome_networking",
            data.outcomes.networkingGrowth
        );

        document.getElementById("mentorship_expectations").value =
            data.outcomes.expectations || "";

    }

    // =====================================================
    // STEP 5 - BENEFITS
    // =====================================================

    if (data.benefits) {

        setCheckbox(
            "mentorship_certificate",
            data.benefits.certificate
        );

        setCheckbox(
            "mentorship_recommendation",
            data.benefits.recommendationLetter
        );

        setCheckbox(
            "mentorship_networking",
            data.benefits.networkingAccess
        );

        setCheckbox(
            "mentorship_internship",
            data.benefits.internshipOpportunity
        );

        document.getElementById("mentorship_additional_benefits").value =
            data.benefits.additionalBenefits || "";

    }

    // =====================================================
    // FINAL
    // =====================================================

    currentEditingMentorshipId = opportunityId;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ================================== ADD NEW MENTORSHIP ================================

function getMentorshipSkills(type) {
  const containerId = type === "skills"
    ? "mentorshipSkills-skills"
    : "mentorshipSkills-Langs";
  const container = document.getElementById(containerId);
  if (!container) return [];
  const result = [];
  container.querySelectorAll(".navCard-requiresGroup").forEach(group => {
    const nameInput = group.querySelector("input[type='text']");
    const scoreInput = group.querySelector("input[type='radio']:checked");
    if (!nameInput || !nameInput.value.trim()) return;
    const score = scoreInput ? parseInt(scoreInput.value) : 0;
    result.push({
      name: nameInput.value.trim(),
      score: score
    });
  });
  return result;
}

document.getElementById('saveMentorshipDraft').addEventListener('click', saveMentorshipDraft);
document.getElementById("publishMentorship").addEventListener("click", () => {publishMentorship(false);});
document.getElementById("boostMentorship").addEventListener("click", () => {publishMentorship(true);});

function buildMentorshipData(user, statusValue) {

  return {

    // ===== CORE =====

    category: "mentorships",

    title:
      document.getElementById("mentorship_title")?.value || "",

    description:
      document.getElementById("mentorship_description")?.value || "",

    industry:
      document.getElementById("mentorship_industry")?.value || "",

    speciality:
      document.getElementById("mentorship_speciality")?.value || "",

    mentorshipFocus:
      document.querySelector('input[name="mentorship_focus"]:checked')?.id || "",

    // ===== PROGRAM =====

    schedule: {

      startDate:
        document.getElementById("mentorship_start_date")?.value || null,

      endDate:
        document.getElementById("mentorship_end_date")?.value || null

    },

    availableSlots: Number(
      document.getElementById("mentorship_slots")?.value || 0
    ),

    // ===== MENTOR REQUIREMENTS =====

    mentorLevel:
      document.querySelector('input[name="mentor_level"]:checked')?.id || "",

    skills:
      getMentorshipSkills("skills"),

    languages:
      getMentorshipSkills("langs"),

    // ===== PROGRAM STRUCTURE =====

    sessionFormat:
      document.querySelector('input[name="session_type"]:checked')?.id || "",

    meetingMode:
      document.querySelector('input[name="meeting_mode"]:checked')?.id || "",

    sessionsPerMonth: Number(
      document.getElementById("mentorship_sessions_per_month")?.value || 0
    ),

    sessionDuration: Number(
      document.getElementById("mentorship_session_duration")?.value || 0
    ),

    // ===== OUTCOMES =====

    outcomes: {

      careerDevelopment:
        document.getElementById("mentorship_outcome_career")?.checked || false,

      portfolioBuilding:
        document.getElementById("mentorship_outcome_portfolio")?.checked || false,

      interviewPreparation:
        document.getElementById("mentorship_outcome_interview")?.checked || false,

      networkingGrowth:
        document.getElementById("mentorship_outcome_networking")?.checked || false,

      expectations:
        document.getElementById("mentorship_expectations")?.value || ""

    },

    // ===== BENEFITS =====

    benefits: {

      certificate:
        document.getElementById("mentorship_certificate")?.checked || false,

      recommendationLetter:
        document.getElementById("mentorship_recommendation")?.checked || false,

      networkingAccess:
        document.getElementById("mentorship_networking")?.checked || false,

      internshipOpportunity:
        document.getElementById("mentorship_internship")?.checked || false,

      additionalBenefits:
        document.getElementById("mentorship_additional_benefits")?.value || ""

    },

    // ===== META =====

    createdAt: serverTimestamp(),

    ownerId: user.uid,

    status: statusValue,

    applicants: 0,

    accepted: 0,

    completed: false

  };

}

function validateMentorshipInputs() {
    const selectedLang = getCurrentLang();
    const t = msgMentorship_translations[selectedLang] || msgMentorship_translations.en;

    let isValid = true;

    function showError(input, messageKey) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        let errorSpan = container.querySelector(".error-span");

        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.className = "error-span";
            errorSpan.style.color = "red";
            errorSpan.style.fontSize = "12px";
            container.appendChild(errorSpan);
        }

        errorSpan.textContent = t[messageKey] || "Required field";
        input.classList.add("invalid");

        isValid = false;
    }

    function clearError(input) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        container.querySelector(".error-span")?.remove();
        input.classList.remove("invalid");
    }

    // =====================================================
    // STEP 1
    // =====================================================

    const title = document.getElementById("mentorship_title");
    const description = document.getElementById("mentorship_description");
    const industry = document.getElementById("mentorship_industry");
    const speciality = document.getElementById("mentorship_speciality");
    const startDate = document.getElementById("mentorship_start_date");
    const endDate = document.getElementById("mentorship_end_date");
    const slots = document.getElementById("mentorship_slots");

    [
        title,
        description,
        industry,
        speciality,
        startDate,
        endDate,
        slots
    ].forEach(clearError);

    if (!title.value.trim())
        showError(title, "validationTitleRequired");

    if (!description.value.trim())
        showError(description, "validationDescriptionRequired");

    if (!industry.value)
        showError(industry, "validationIndustryRequired");

    if (!speciality.value)
        showError(speciality, "validationSpecialityRequired");

    if (!document.querySelector('input[name="mentorship_focus"]:checked'))
        showError(
            document.querySelector('input[name="mentorship_focus"]')?.parentElement,
            "validationFocusRequired"
        );

    if (!slots.value || Number(slots.value) < 1)
        showError(slots, "validationSlotsRequired");

    if (startDate.value && endDate.value) {

        if (new Date(endDate.value) <= new Date(startDate.value)) {

            showError(endDate, "validationEndDateAfterStart");

        }

    }

    // =====================================================
    // STEP 2
    // =====================================================

    if (!document.querySelector('input[name="mentor_level"]:checked'))
        showError(
            document.querySelector('input[name="mentor_level"]')?.parentElement,
            "validationMentorLevelRequired"
        );

    if (getMentorshipSkills("skills").length === 0)
        showError(
            document.getElementById("mentorshipSkills-skills"),
            "validationSkillRequired"
        );

    if (getMentorshipSkills("langs").length === 0)
        showError(
            document.getElementById("mentorshipSkills-Langs"),
            "validationLanguageRequired"
        );

    // =====================================================
    // STEP 3
    // =====================================================

    const sessions =
        document.getElementById("mentorship_sessions_per_month");

    const duration =
        document.getElementById("mentorship_session_duration");

    clearError(sessions);
    clearError(duration);

    if (!document.querySelector('input[name="session_type"]:checked'))
        showError(
            document.querySelector('input[name="session_type"]')?.parentElement,
            "validationSessionFormatRequired"
        );

    if (!document.querySelector('input[name="meeting_mode"]:checked'))
        showError(
            document.querySelector('input[name="meeting_mode"]')?.parentElement,
            "validationMeetingModeRequired"
        );

    if (!sessions.value || Number(sessions.value) < 1)
        showError(sessions, "validationSessionsRequired");

    if (!duration.value || Number(duration.value) < 1)
        showError(duration, "validationDurationRequired");

    // =====================================================
    // STEP 4
    // =====================================================

    const expectations =
        document.getElementById("mentorship_expectations");

    clearError(expectations);

    if (!expectations.value.trim())
        showError(expectations, "validationExpectationsRequired");

    // =====================================================
    // STEP 5
    // =====================================================

    const benefitSelected =
        document.getElementById("mentorship_certificate").checked ||
        document.getElementById("mentorship_recommendation").checked ||
        document.getElementById("mentorship_networking").checked ||
        document.getElementById("mentorship_internship").checked;

    if (!benefitSelected)
        showError(
            document.querySelector("#mentorshipBenefits .criteria-list"),
            "validationBenefitRequired"
        );

    return isValid;

}

async function saveMentorshipDraft() {
  const selectedLang = getCurrentLang();
  const t = msgMentorship_translations[selectedLang] || msgMentorship_translations['en'];

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  const title = document.getElementById("mentorship_title").value.trim();
  const description = document.getElementById("mentorship_description").value.trim();

  if (!title || !description) {
    showNotification("warning", t.draftRequiredTitle, t.draftRequiredMessage);
    return;
  }

  try {
    const draftData = buildMentorshipData(user, "Draft");

    if (currentEditingMentorshipId) {
      await updateDoc(doc(db, "opportunities", currentEditingMentorshipId), {
        ...draftData,
        updatedAt: serverTimestamp()
      });

      showNotification("success", t.draftUpdatedTitle, t.draftUpdatedMessage);
    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), draftData);
      currentEditingMentorshipId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId: taskRef.id,
        title: draftData.title,
        status: "Draft",
        createdAt: serverTimestamp()
      });

      showNotification("success", t.draftSavedTitle, t.draftSavedMessage);
    }

    cleanMentorshipForm();
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.draftSaveFailedTitle, t.draftSaveFailedMessage);
  }
}

async function publishMentorship(isBoosted = false) {
  const selectedLang = getCurrentLang();
  const t = msgMentorship_translations[selectedLang] || msgMentorship_translations['en'];

  const cost = isBoosted ? 25 : 20;
  const actionName = isBoosted ? "Publish Boosted Mentorship" : "Publish Mentorship";

  if (!validateMentorshipInputs()) {
    showNotification("warning", t.mentorshipPublishRequiredTitle, t.mentorshipPublishRequiredMessage);
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  try {
    const jobData = buildMentorshipData(user, "Pending");
    jobData.isBoosted = isBoosted;

    let opportunityId;

    if (currentEditingMentorshipId) {
      opportunityId = currentEditingMentorshipId;

      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...jobData,
        updatedAt: serverTimestamp()
      });

    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), jobData);
      opportunityId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId,
        title: jobData.title,
        status: "Pending",
        createdAt: serverTimestamp()
      });
    }

    await saveMentorshipPublishConsumption(user.uid, opportunityId, cost, actionName);

    updateUserSection(user);
    cleanMentorshipForm();

    showNotification("success", t.mentorshipSubmittedTitle, t.mentorshipSubmittedMessage);

    currentEditingMentorshipId = null;
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.mentorshipSaveFailedTitle, t.mentorshipSaveFailedMessage);
  }
}

async function saveMentorshipPublishConsumption(userId, opportunityId, cost, actionName) {
  const consumptionRef = doc(db, "users", userId, "consumptions", opportunityId);

  await setDoc(consumptionRef, {
    coins_used: cost,
    action_name: actionName,
    category: "mentorship",
    opportunityId: opportunityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ============================== CLEAR MENTORSHIP FORM ================================

document.getElementById('cleanMentorshipForm').addEventListener('click', cleanMentorshipForm);

function cleanMentorshipForm() {

    // =========================
    // Reset Inputs
    // =========================
    document.querySelectorAll("#mentorshipPage input").forEach(input => {

        switch (input.type) {

            case "text":
            case "number":
            case "datetime-local":
                input.value = "";
                break;

            case "checkbox":
            case "radio":
                input.checked = false;
                break;

        }

    });

    // =========================
    // Reset Textareas
    // =========================
    document.querySelectorAll("#mentorshipPage textarea").forEach(textarea => {
        textarea.value = "";
    });

    // =========================
    // Reset Selects
    // =========================
    document.querySelectorAll("#mentorshipPage select").forEach(select => {
        select.selectedIndex = 0;
    });

    const skillsContainer = document.getElementById("mentorshipSkills-skills");
    const langsContainer = document.getElementById("mentorshipSkills-Langs");

    if (skillsContainer) skillsContainer.innerHTML = "";
    if (langsContainer) langsContainer.innerHTML = "";

    AddSkillMentorship("skills");
    AddSkillMentorship("langs");

    // =========================
    // Remove Validation
    // =========================
    document.querySelectorAll("#mentorshipPage .error-span")
        .forEach(el => el.remove());

    document.querySelectorAll("#mentorshipPage .invalid")
        .forEach(el => el.classList.remove("invalid"));

    currentEditingMentorshipId = null;
    navigateToMentorshipPageFirstStep();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function navigateMentorshipSections(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pages = container.querySelectorAll('.horizontal-newTaskPage');
  const steps = container.querySelectorAll('.horizontal-newTask button');

  let currentIndex = Array.from(pages)
    .findIndex(page => page.style.display !== 'none');

  if (currentIndex === -1) currentIndex = 0;

  pages[currentIndex].style.display = 'none';
  if (steps[currentIndex]) steps[currentIndex].classList.remove('active');

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= pages.length) nextIndex = pages.length - 1;

  pages[nextIndex].style.display = 'block';
  if (steps[nextIndex]) steps[nextIndex].classList.add('active');

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', () => {
  const taskPage = document.getElementById("mentorshipPage");

  if (taskPage) {
    taskPage.querySelectorAll(".nextStep").forEach(btn => {
      btn.addEventListener("click", () => navigateMentorshipSections("mentorshipPage", 1));
    });

    taskPage.querySelectorAll(".prevStep").forEach(btn => {
      btn.addEventListener("click", () => navigateMentorshipSections("mentorshipPage", -1));
    });
  }
});

function navigateToMentorshipPageFirstStep(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll(".horizontal-newTask button");
  const pages = container.querySelectorAll(".horizontal-newTaskPage");

  buttons.forEach(btn => btn.classList.remove("active"));
  pages.forEach(page => page.style.display = "none");

  if (buttons[0]) buttons[0].classList.add("active");
  if (pages[0]) pages[0].style.display = "block";
}

// =====================================================================================
// ================================= RESEARCH SETTINGS =================================
// =====================================================================================

const skillResearchCounters = {
  skills: 0,
  langs: 0
};

function AddSkillResearch(type) {
  const selectedLang = getCurrentLang();
  const T = App_translations[selectedLang] || App_translations['en'];

  const listId = type === 'skills'
    ? 'researchSkills-skills'
    : 'researchSkills-Langs';

  const container = document.getElementById(listId);
  if (!container) return;

  const skillIndex = ++skillResearchCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  // input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder =
    type === 'langs'
      ? "English, French, Spanish..."
      : "JavaScript, Logistics, Marketing...";
  input.name = `${skillId}-name`;

  // rating group
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;

    const label = document.createElement('label');
    label.setAttribute('for', radio.id);

    ratingGroup.appendChild(radio);
    ratingGroup.appendChild(label);
  }

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
  };

  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);
}

document.getElementById('researchAddSkill').addEventListener('click', () => AddSkillResearch('skills'));
document.getElementById('researchAddLang').addEventListener('click', () => AddSkillResearch('langs'));

function isResearchEmpty() {
  const title = document.getElementById("research_title").value.trim();
  const description = document.getElementById("research_problem").value.trim();

  return !title && !description;
}

async function populateResearchDraft(opportunityId) {

    const selectedLang = getCurrentLang();
    const t = msgResearch_translations[selectedLang] || msgResearch_translations.en;

    const docRef = doc(db, "opportunities", opportunityId);
    const snap = await getDoc(docRef);

    cleanResearchForm();

    if (!snap.exists()) {
        alert(t.draftNotFound);
        return;
    }

    const data = snap.data();

    // =====================================================
    // STEP 1 - RESEARCH DEFINITION
    // =====================================================

    document.getElementById("research_title").value =
        data.title || "";

    document.getElementById("research_problem").value =
        data.problem || data.description || "";

    document.getElementById("research_field").value =
        data.field || "";

    if (data.schedule) {

        document.getElementById("research_start").value =
            data.schedule.startDate || "";

        document.getElementById("research_end").value =
            data.schedule.endDate || "";

    }

    document.getElementById("research_duration").value =
        data.duration || "";

    // =====================================================
    // STEP 2 - SCOPE & METHODOLOGY
    // =====================================================

    document.getElementById("research_hypothesis").value =
        data.hypothesis || "";

    document.getElementById("research_methodology").value =
        data.methodology || "";

    if (data.researchType) {

        const radio = document.getElementById(data.researchType);

        if (radio) radio.checked = true;

    }

    // =====================================================
    // STEP 3 - RESOURCES & DATA
    // =====================================================

    // ---------- Skills ----------

    if (data.skills?.length) {

        const container = document.getElementById("researchSkills-skills");

        container.innerHTML = "";

        researchSkillCounters.skills = 0;

        data.skills.forEach(skill => {

            AddSkillResearch("skills");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                skill.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${skill.score}"]`
            );

            if (radio) radio.checked = true;

        });

    }

    // ---------- Languages ----------

    if (data.languages?.length) {

        const container = document.getElementById("researchSkills-Langs");

        container.innerHTML = "";

        researchSkillCounters.langs = 0;

        data.languages.forEach(language => {

            AddSkillResearch("langs");

            const groups = container.querySelectorAll(".navCard-requiresGroup");
            const last = groups[groups.length - 1];

            last.querySelector("input[type='text']").value =
                language.name || "";

            const radio = last.querySelector(
                `input[type="radio"][value="${language.score}"]`
            );

            if (radio) radio.checked = true;

        });

    }

    document.getElementById("research_data_sources").value =
        data.dataSources || "";

    if (data.dataType) {

        const radio = document.getElementById(data.dataType);

        if (radio) radio.checked = true;

    }

    // =====================================================
    // STEP 4 - VALIDATION
    // =====================================================

    if (data.validationMethod) {

        const radio = document.getElementById(data.validationMethod);

        if (radio) radio.checked = true;

    }

    if (data.acceptanceCriteria) {

        const criteria = document.querySelectorAll(
            "#researchValidation .criteria-item input[type='checkbox']"
        );

        if (criteria.length >= 4) {

            criteria[0].checked = !!data.acceptanceCriteria.reproducibility;
            criteria[1].checked = !!data.acceptanceCriteria.methodologicalRigor;
            criteria[2].checked = !!data.acceptanceCriteria.statisticalSignificance;
            criteria[3].checked = !!data.acceptanceCriteria.ethicalCompliance;

        }

    }

    // =====================================================
    // STEP 5 - OUTPUT
    // =====================================================

    if (data.outputType) {

        const radio = document.getElementById(data.outputType);

        if (radio) radio.checked = true;

    }

    document.getElementById("research_publication_target").value =
        data.publicationTarget || "";

    document.getElementById("research_notes").value =
        data.notes || "";

    // =====================================================
    // FINAL
    // =====================================================

    currentEditingResearchId = opportunityId;

    navigateToResearchPageFirstStep("researchPage");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

// ================================== ADD NEW RESEARCH =================================

function getResearchSkills(type) {
  const containerId = type === "skills"
    ? "researchSkills-skills"
    : "researchSkills-Langs";
  const container = document.getElementById(containerId);
  if (!container) return [];
  const result = [];
  container.querySelectorAll(".navCard-requiresGroup").forEach(group => {
    const nameInput = group.querySelector("input[type='text']");
    const scoreInput = group.querySelector("input[type='radio']:checked");
    if (!nameInput || !nameInput.value.trim()) return;
    const score = scoreInput ? parseInt(scoreInput.value) : 0;
    result.push({
      name: nameInput.value.trim(),
      score: score
    });
  });
  return result;
}

document.getElementById('saveResearchDraft').addEventListener('click', saveResearchDraft);
document.getElementById("publishResearch").addEventListener("click", () => {publishResearch(false);});
document.getElementById("boostResearch").addEventListener("click", () => {publishResearch(true);});

function buildResearchData(user, statusValue) {

    const criteria = document.querySelectorAll(
        "#researchValidation .criteria-item input[type='checkbox']"
    );

    return {

        // =====================================================
        // CORE
        // =====================================================

        category: "research",

        title:
            document.getElementById("research_title")?.value.trim() || "",

        problem:
            document.getElementById("research_problem")?.value.trim() || "",

        description:
            document.getElementById("research_problem")?.value.trim() || "",

        field:
            document.getElementById("research_field")?.value || "",

        // =====================================================
        // RESEARCH PERIOD
        // =====================================================

        schedule: {

            startDate:
                document.getElementById("research_start")?.value || null,

            endDate:
                document.getElementById("research_end")?.value || null

        },

        duration: Number(
            document.getElementById("research_duration")?.value || 0
        ),

        // =====================================================
        // METHODOLOGY
        // =====================================================

        hypothesis:
            document.getElementById("research_hypothesis")?.value.trim() || "",

        methodology:
            document.getElementById("research_methodology")?.value.trim() || "",

        researchType:
            document.querySelector('input[name="research_type"]:checked')?.id || "",

        // =====================================================
        // RESOURCES
        // =====================================================

        skills:
            getResearchSkills("skills"),

        languages:
            getResearchSkills("langs"),

        dataSources:
            document.getElementById("research_data_sources")?.value.trim() || "",

        dataType:
            document.querySelector('input[name="data_type"]:checked')?.id || "",

        // =====================================================
        // VALIDATION
        // =====================================================

        validationMethod:
            document.querySelector('input[name="research_validation"]:checked')?.id || "",

        acceptanceCriteria: {

            reproducibility:
                criteria[0]?.checked || false,

            methodologicalRigor:
                criteria[1]?.checked || false,

            statisticalSignificance:
                criteria[2]?.checked || false,

            ethicalCompliance:
                criteria[3]?.checked || false

        },

        // =====================================================
        // OUTPUT
        // =====================================================

        outputType:
            document.querySelector('input[name="research_output"]:checked')?.id || "",

        publicationTarget:
            document.getElementById("research_publication_target")?.value.trim() || "",

        notes:
            document.getElementById("research_notes")?.value.trim() || "",

        // =====================================================
        // META
        // =====================================================

        createdAt: serverTimestamp(),

        ownerId: user.uid,

        status: statusValue,

        applicants: 0,

        accepted: 0,

        completed: false

    };

}

function validateResearchInputs() {

    const selectedLang = getCurrentLang();
    const t = msgResearch_translations[selectedLang] || msgResearch_translations.en;

    let isValid = true;

    function showError(input, messageKey) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        let errorSpan = container.querySelector(".error-span");

        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.className = "error-span";
            errorSpan.style.color = "red";
            errorSpan.style.fontSize = "12px";
            container.appendChild(errorSpan);
        }

        errorSpan.textContent = t[messageKey] || "Required field";
        input.classList.add("invalid");

        isValid = false;
    }

    function clearError(input) {

        if (!input) return;

        const container =
            input.closest(".navCard-inputGroup") ||
            input.parentElement;

        container.querySelector(".error-span")?.remove();
        input.classList.remove("invalid");
    }

    // =====================================================
    // STEP 1 - RESEARCH DEFINITION
    // =====================================================

    const title = document.getElementById("research_title");
    const problem = document.getElementById("research_problem");
    const field = document.getElementById("research_field");
    const start = document.getElementById("research_start");
    const end = document.getElementById("research_end");
    const duration = document.getElementById("research_duration");

    [
        title,
        problem,
        field,
        start,
        end,
        duration
    ].forEach(clearError);

    if (!title.value.trim())
        showError(title, "validationTitleRequired");

    if (!problem.value.trim())
        showError(problem, "validationProblemRequired");

    if (!field.value)
        showError(field, "validationFieldRequired");

    if (!duration.value || Number(duration.value) < 1)
        showError(duration, "validationDurationRequired");

    if (start.value && end.value) {

        if (new Date(end.value) <= new Date(start.value)) {

            showError(end, "validationEndDateAfterStart");

        }

    }

    // =====================================================
    // STEP 2 - SCOPE & METHODOLOGY
    // =====================================================

    const hypothesis = document.getElementById("research_hypothesis");
    const methodology = document.getElementById("research_methodology");

    clearError(hypothesis);
    clearError(methodology);

    if (!hypothesis.value.trim())
        showError(hypothesis, "validationHypothesisRequired");

    if (!methodology.value.trim())
        showError(methodology, "validationMethodologyRequired");

    if (!document.querySelector('input[name="research_type"]:checked'))
        showError(
            document.querySelector('input[name="research_type"]')?.parentElement,
            "validationResearchTypeRequired"
        );

    // =====================================================
    // STEP 3 - RESOURCES
    // =====================================================

    const dataSources = document.getElementById("research_data_sources");

    clearError(dataSources);

    if (getResearchSkills("skills").length === 0)
        showError(
            document.getElementById("researchSkills-skills"),
            "validationSkillRequired"
        );

    if (getResearchSkills("langs").length === 0)
        showError(
            document.getElementById("researchSkills-Langs"),
            "validationLanguageRequired"
        );

    if (!dataSources.value.trim())
        showError(dataSources, "validationDataSourcesRequired");

    if (!document.querySelector('input[name="data_type"]:checked'))
        showError(
            document.querySelector('input[name="data_type"]')?.parentElement,
            "validationDataTypeRequired"
        );

    // =====================================================
    // STEP 4 - VALIDATION
    // =====================================================

    if (!document.querySelector('input[name="research_validation"]:checked'))
        showError(
            document.querySelector('input[name="research_validation"]')?.parentElement,
            "validationValidationMethodRequired"
        );

    // =====================================================
    // STEP 5 - OUTPUT
    // =====================================================

    const publication =
        document.getElementById("research_publication_target");

    clearError(publication);

    if (!document.querySelector('input[name="research_output"]:checked'))
        showError(
            document.querySelector('input[name="research_output"]')?.parentElement,
            "validationOutputRequired"
        );

    if (!publication.value.trim())
        showError(
            publication,
            "validationPublicationRequired"
        );

    return isValid;
}

async function saveResearchDraft() {
  const selectedLang = getCurrentLang();
  const t = msgResearch_translations[selectedLang] || msgResearch_translations['en'];

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  const title = document.getElementById("research_title").value.trim();
  const description = document.getElementById("research_problem").value.trim();

  if (!title || !description) {
    showNotification("warning", t.draftRequiredTitle, t.draftRequiredMessage);
    return;
  }

  try {
    const draftData = buildResearchData(user, "Draft");

    if (currentEditingResearchId) {
      await updateDoc(doc(db, "opportunities", currentEditingResearchId), {
        ...draftData,
        updatedAt: serverTimestamp()
      });

      showNotification("success", t.draftUpdatedTitle, t.draftUpdatedMessage);
    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), draftData);
      currentEditingResearchId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId: taskRef.id,
        title: draftData.title,
        status: "Draft",
        createdAt: serverTimestamp()
      });

      showNotification("success", t.draftSavedTitle, t.draftSavedMessage);
    }

    cleanResearchForm();
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.draftSaveFailedTitle, t.draftSaveFailedMessage);
  }
}

async function publishResearch(isBoosted = false) {
  const selectedLang = getCurrentLang();
  const t = msgResearch_translations[selectedLang] || msgResearch_translations['en'];

  const cost = isBoosted ? 25 : 20;
  const actionName = isBoosted ? "Publish Boosted Mentorship" : "Publish Mentorship";

  if (!validateResearchInputs()) {
    showNotification("warning", t.researchPublishRequiredTitle, t.researchPublishRequiredMessage);
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    showNotification("warning", t.loginRequiredTitle, t.loginRequiredMessage);
    return;
  }

  try {
    const jobData = buildResearchData(user, "Pending");
    jobData.isBoosted = isBoosted;

    let opportunityId;

    if (currentEditingResearchId) {
      opportunityId = currentEditingResearchId;

      await updateDoc(doc(db, "opportunities", opportunityId), {
        ...jobData,
        updatedAt: serverTimestamp()
      });

    } else {
      const taskRef = await addDoc(collection(db, "opportunities"), jobData);
      opportunityId = taskRef.id;

      await addDoc(collection(db, "users", user.uid, "myTasks"), {
        opportunityId,
        title: jobData.title,
        status: "Pending",
        createdAt: serverTimestamp()
      });
    }

    await saveResearchPublishConsumption(user.uid, opportunityId, cost, actionName);

    updateUserSection(user);
    cleanResearchForm();

    showNotification("success", t.researchSubmittedTitle, t.researchSubmittedMessage);

    currentEditingResearchId = null;
    loadUserDrafts(user);

  } catch (error) {
    showNotification("error", t.researchSaveFailedTitle, t.researchSaveFailedMessage);
  }
}

async function saveResearchPublishConsumption(userId, opportunityId, cost, actionName) {
  const consumptionRef = doc(db, "users", userId, "consumptions", opportunityId);

  await setDoc(consumptionRef, {
    coins_used: cost,
    action_name: actionName,
    category: "research",
    opportunityId: opportunityId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ================================= CLEAR RESEARCH FORM ==============================

document.getElementById("cleanResearchForm").addEventListener("click", cleanResearchForm);

function cleanResearchForm() {

    // ==========================================
    // Reset all inputs
    // ==========================================

    document.querySelectorAll("#researchPage input").forEach(input => {

        switch (input.type) {

            case "text":
            case "number":
            case "datetime-local":
                input.value = "";
                break;

            case "checkbox":
            case "radio":
                input.checked = false;
                break;

        }

    });

    // ==========================================
    // Reset textareas
    // ==========================================

    document.querySelectorAll("#researchPage textarea").forEach(textarea => {
        textarea.value = "";
    });

    // ==========================================
    // Reset selects
    // ==========================================

    document.querySelectorAll("#researchPage select").forEach(select => {
        select.selectedIndex = 0;
    });

    // ==========================================
    // Reset skills & languages
    // ==========================================

    const skillsContainer = document.getElementById("researchSkills-skills");
    const langsContainer = document.getElementById("researchSkills-Langs");

    if (skillsContainer) skillsContainer.innerHTML = "";
    if (langsContainer) langsContainer.innerHTML = "";

    AddSkillResearch("skills");
    AddSkillResearch("langs");

    // ==========================================
    // Reset Acceptance Criteria
    // (restore default state from HTML)
    // ==========================================

    const criteria =
        document.querySelectorAll("#researchValidation .criteria-item input[type='checkbox']");

    if (criteria.length >= 4) {

        criteria[0].checked = true;   // Reproducibility
        criteria[1].checked = true;   // Methodological rigor
        criteria[2].checked = false;  // Statistical significance
        criteria[3].checked = false;  // Ethical compliance

    }

    // ==========================================
    // Remove validation
    // ==========================================

    document.querySelectorAll("#researchPage .error-span")
        .forEach(el => el.remove());

    document.querySelectorAll("#researchPage .invalid")
        .forEach(el => el.classList.remove("invalid"));

    // ==========================================
    // Reset editing state
    // ==========================================

    currentEditingResearchId = null;

    navigateToResearchPageFirstStep();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}

function navigateResearchSections(containerId, direction) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pages = container.querySelectorAll('.horizontal-newTaskPage');
  const steps = container.querySelectorAll('.horizontal-newTask button');

  let currentIndex = Array.from(pages)
    .findIndex(page => page.style.display !== 'none');

  if (currentIndex === -1) currentIndex = 0;

  pages[currentIndex].style.display = 'none';
  if (steps[currentIndex]) steps[currentIndex].classList.remove('active');

  let nextIndex = currentIndex + direction;

  if (nextIndex < 0) nextIndex = 0;
  if (nextIndex >= pages.length) nextIndex = pages.length - 1;

  pages[nextIndex].style.display = 'block';
  if (steps[nextIndex]) steps[nextIndex].classList.add('active');

  container.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener('DOMContentLoaded', () => {
  const taskPage = document.getElementById("researchPage");

  if (taskPage) {
    taskPage.querySelectorAll(".nextStep").forEach(btn => {
      btn.addEventListener("click", () => navigateResearchSections("researchPage", 1));
    });

    taskPage.querySelectorAll(".prevStep").forEach(btn => {
      btn.addEventListener("click", () => navigateResearchSections("researchPage", -1));
    });
  }
});

function navigateToResearchPageFirstStep(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const buttons = container.querySelectorAll(".horizontal-newTask button");
  const pages = container.querySelectorAll(".horizontal-newTaskPage");

  buttons.forEach(btn => btn.classList.remove("active"));
  pages.forEach(page => page.style.display = "none");

  if (buttons[0]) buttons[0].classList.add("active");
  if (pages[0]) pages[0].style.display = "block";
}

// ================================== Notifications ===================================

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
    } else {
      updateUserSection(null);
    }
  });
  translateTopBar();
  translateHelpModal(lang);
  translateFooter();
  draftsContainer_translatePage(lang);
  rightMiniBar_translatePage(lang);
  taskForm_translatePage(lang);
  jobForm_translatePage(lang);

  document.dispatchEvent(new CustomEvent("languageChanged", {detail: { lang }}));
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

const helpModalTranslations = {
  en: {
    title: "Need Help?",
    subtitle: "We're here to support you. Choose a topic and tell us your issue.",
    categoryPlaceholder: "Select a category",
    categoryAccount: "Account & Login Issues",
    categoryCoins: "Coins & Payments",
    categoryBuilder: "CV Builder Help",
    categoryBug: "Report a Bug",
    emailPlaceholder: "Enter your email",
    messagePlaceholder: "Write your message...",
    sendBtn: "Send Message"
  },
  fr: {
    title: "Besoin d'aide ?",
    subtitle: "Nous sommes là pour vous aider. Choisissez un sujet et expliquez-nous votre problème.",
    categoryPlaceholder: "Sélectionnez une catégorie",
    categoryAccount: "Problèmes de compte et de connexion",
    categoryCoins: "Pièces et paiements",
    categoryBuilder: "Aide du créateur de CV",
    categoryBug: "Signaler un bug",
    emailPlaceholder: "Entrez votre email",
    messagePlaceholder: "Écrivez votre message...",
    sendBtn: "Envoyer le message"
  },
  ar: {
    title: "تحتاج مساعدة؟",
    subtitle: "نحن هنا لدعمك. اختر موضوعًا وأخبرنا بمشكلتك.",
    categoryPlaceholder: "اختر الفئة",
    categoryAccount: "مشاكل الحساب وتسجيل الدخول",
    categoryCoins: "العملات والمدفوعات",
    categoryBuilder: "مساعدة منشئ السيرة الذاتية",
    categoryBug: "الإبلاغ عن خطأ",
    emailPlaceholder: "أدخل بريدك الإلكتروني",
    messagePlaceholder: "اكتب رسالتك...",
    sendBtn: "إرسال الرسالة"
  },
  es: {
    title: "¿Necesitas ayuda?",
    subtitle: "Estamos aquí para apoyarte. Elige un tema y cuéntanos tu problema.",
    categoryPlaceholder: "Selecciona una categoría",
    categoryAccount: "Problemas de cuenta e inicio de sesión",
    categoryCoins: "Monedas y pagos",
    categoryBuilder: "Ayuda del creador de CV",
    categoryBug: "Reportar un error",
    emailPlaceholder: "Ingresa tu correo electrónico",
    messagePlaceholder: "Escribe tu mensaje...",
    sendBtn: "Enviar mensaje"
  },
  zh: {
    title: "需要帮助？",
    subtitle: "我们随时为您提供支持。请选择一个主题并告诉我们您的问题。",
    categoryPlaceholder: "选择类别",
    categoryAccount: "账户与登录问题",
    categoryCoins: "币与付款",
    categoryBuilder: "简历生成器帮助",
    categoryBug: "报告错误",
    emailPlaceholder: "输入您的电子邮箱",
    messagePlaceholder: "写下您的消息...",
    sendBtn: "发送消息"
  },
  de: {
    title: "Brauchen Sie Hilfe?",
    subtitle: "Wir sind hier, um Sie zu unterstützen. Wählen Sie ein Thema und schildern Sie uns Ihr Problem.",
    categoryPlaceholder: "Kategorie auswählen",
    categoryAccount: "Konto- und Login-Probleme",
    categoryCoins: "Münzen und Zahlungen",
    categoryBuilder: "Hilfe zum Lebenslauf-Ersteller",
    categoryBug: "Fehler melden",
    emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
    messagePlaceholder: "Schreiben Sie Ihre Nachricht...",
    sendBtn: "Nachricht senden"
  },
  pt: {
    title: "Precisa de ajuda?",
    subtitle: "Estamos aqui para apoiá-lo. Escolha um assunto e conte-nos o seu problema.",
    categoryPlaceholder: "Selecione uma categoria",
    categoryAccount: "Problemas de conta e login",
    categoryCoins: "Moedas e pagamentos",
    categoryBuilder: "Ajuda do criador de currículo",
    categoryBug: "Reportar um erro",
    emailPlaceholder: "Digite seu e-mail",
    messagePlaceholder: "Escreva sua mensagem...",
    sendBtn: "Enviar mensagem"
  },
  ja: {
    title: "ヘルプが必要ですか？",
    subtitle: "サポートのためにここにいます。トピックを選択して問題をお知らせください。",
    categoryPlaceholder: "カテゴリを選択",
    categoryAccount: "アカウントとログインの問題",
    categoryCoins: "コインと支払い",
    categoryBuilder: "CVビルダーのヘルプ",
    categoryBug: "バグを報告",
    emailPlaceholder: "メールアドレスを入力してください",
    messagePlaceholder: "メッセージを入力してください...",
    sendBtn: "メッセージを送信"
  },
  ru: {
    title: "Нужна помощь?",
    subtitle: "Мы здесь, чтобы поддержать вас. Выберите тему и расскажите о вашей проблеме.",
    categoryPlaceholder: "Выберите категорию",
    categoryAccount: "Проблемы с аккаунтом и входом",
    categoryCoins: "Монеты и платежи",
    categoryBuilder: "Помощь с конструктором резюме",
    categoryBug: "Сообщить об ошибке",
    emailPlaceholder: "Введите ваш email",
    messagePlaceholder: "Напишите ваше сообщение...",
    sendBtn: "Отправить сообщение"
  }
};
function translateHelpModal(lang) {
  const t = helpModalTranslations[lang] || helpModalTranslations['en'];

  const modal = document.getElementById('helpModal');
  if (!modal) return;

  const title = modal.querySelector('.modal-header h2');
  if (title) title.textContent = t.title;

  const subtitle = modal.querySelector('.modal-subtitle');
  if (subtitle) subtitle.textContent = t.subtitle;

  const categorySelect = modal.querySelector('#helpCategory');
  if (categorySelect) {
    categorySelect.options[0].textContent = t.categoryPlaceholder;
    categorySelect.options[1].textContent = t.categoryAccount;
    categorySelect.options[2].textContent = t.categoryCoins;
    categorySelect.options[3].textContent = t.categoryBuilder;
    categorySelect.options[4].textContent = t.categoryBug;
  }

  const emailInput = modal.querySelector('#helpEmail');
  if (emailInput) emailInput.placeholder = t.emailPlaceholder;

  const messageInput = modal.querySelector('#helpMessage');
  if (messageInput) messageInput.placeholder = t.messagePlaceholder;

  const sendBtn = modal.querySelector('#helpSendBtn');
  if (sendBtn) sendBtn.textContent = t.sendBtn;
}

const operlyaFooterTranslations = {
  en: {
    description: "Build your resume, publish your professional profile, find opportunities, and manage real work — all in one platform.",
    discover: "Discover",
    resumeBuilder: "Resume Builder",
    opportunities: "Opportunities",
    publicProfiles: "Public Profiles",
    workManagement: "Work Management",
    resources: "Resources",
    howItWorks: "How it works",
    helpCenter: "Help Center",
    careerTips: "Career Tips",
    atsGuide: "ATS Resume Guide",
    company: "Company",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms",
    ctaTitle: "Start your career system",
    ctaDesc: "Create your profile and start getting opportunities today.",
    createProfile: "Create my Profile",
    copyright: "© 2026 Operlya. All rights reserved.",
    cookies: "Cookies"
  },
  fr: {
    description: "Créez votre CV, publiez votre profil professionnel, trouvez des opportunités et gérez du travail réel — tout en une seule plateforme.",
    discover: "Découvrir",
    resumeBuilder: "Créateur de CV",
    opportunities: "Opportunités",
    publicProfiles: "Profils publics",
    workManagement: "Gestion du travail",
    resources: "Ressources",
    howItWorks: "Comment ça marche",
    helpCenter: "Centre d'aide",
    careerTips: "Conseils de carrière",
    atsGuide: "Guide CV ATS",
    company: "Entreprise",
    about: "À propos",
    contact: "Contact",
    privacy: "Politique de confidentialité",
    terms: "Conditions",
    ctaTitle: "Démarrez votre système de carrière",
    ctaDesc: "Créez votre profil et commencez à recevoir des opportunités.",
    createProfile: "Créer mon profil",
    copyright: "© 2026 Operlya. Tous droits réservés.",
    cookies: "Cookies"
  },
  ar: {
    description: "أنشئ سيرتك الذاتية، انشر ملفك المهني، اعثر على فرص، وادِر عملك — كل ذلك في منصة واحدة.",
    discover: "اكتشف",
    resumeBuilder: "منشئ السيرة الذاتية",
    opportunities: "الفرص",
    publicProfiles: "الملفات العامة",
    workManagement: "إدارة العمل",
    resources: "الموارد",
    howItWorks: "كيف يعمل",
    helpCenter: "مركز المساعدة",
    careerTips: "نصائح مهنية",
    atsGuide: "دليل السيرة الذاتية ATS",
    company: "الشركة",
    about: "حول",
    contact: "اتصال",
    privacy: "سياسة الخصوصية",
    terms: "الشروط",
    ctaTitle: "ابدأ نظامك المهني",
    ctaDesc: "أنشئ ملفك وابدأ في الحصول على الفرص اليوم.",
    createProfile: "إنشاء حسابي",
    copyright: "© 2026 Operlya. جميع الحقوق محفوظة.",
    cookies: "ملفات تعريف الارتباط"
  },
  es: {
    description: "Crea tu currículum, publica tu perfil profesional, encuentra oportunidades y gestiona trabajo real — todo en una sola plataforma.",
    discover: "Descubrir",
    resumeBuilder: "Creador de Currículum",
    opportunities: "Oportunidades",
    publicProfiles: "Perfiles Públicos",
    workManagement: "Gestión de Trabajo",
    resources: "Recursos",
    howItWorks: "Cómo funciona",
    helpCenter: "Centro de Ayuda",
    careerTips: "Consejos Profesionales",
    atsGuide: "Guía de Currículum ATS",
    company: "Empresa",
    about: "Acerca de",
    contact: "Contacto",
    privacy: "Política de Privacidad",
    terms: "Términos",
    ctaTitle: "Comienza tu sistema profesional",
    ctaDesc: "Crea tu perfil y comienza a recibir oportunidades hoy.",
    createProfile: "Crear mi Perfil",
    copyright: "© 2026 Operlya. Todos los derechos reservados.",
    cookies: "Cookies"
  },
  zh: {
    description: "制作简历、发布职业档案、寻找机会并管理工作 — 一站式平台全搞定。",
    discover: "发现",
    resumeBuilder: "简历制作器",
    opportunities: "工作机会",
    publicProfiles: "公开档案",
    workManagement: "工作管理",
    resources: "资源",
    howItWorks: "工作原理",
    helpCenter: "帮助中心",
    careerTips: "职业建议",
    atsGuide: "ATS简历指南",
    company: "公司",
    about: "关于我们",
    contact: "联系方式",
    privacy: "隐私政策",
    terms: "服务条款",
    ctaTitle: "开启您的职业系统",
    ctaDesc: "立即创建档案，开始获取机会。",
    createProfile: "创建我的档案",
    copyright: "© 2026 Operlya。保留所有权利。",
    cookies: "Cookie政策"
  },
  de: {
    description: "Erstellen Sie Ihren Lebenslauf, veröffentlichen Sie Ihr Berufsprofil, finden Sie Chancen und verwalten Sie echte Arbeit — alles auf einer Plattform.",
    discover: "Entdecken",
    resumeBuilder: "Lebenslauf-Ersteller",
    opportunities: "Chancen",
    publicProfiles: "Öffentliche Profile",
    workManagement: "Arbeitsverwaltung",
    resources: "Ressourcen",
    howItWorks: "So funktioniert's",
    helpCenter: "Hilfezentrum",
    careerTips: "Karrieretipps",
    atsGuide: "ATS-Lebenslauf-Leitfaden",
    company: "Unternehmen",
    about: "Über uns",
    contact: "Kontakt",
    privacy: "Datenschutz",
    terms: "AGB",
    ctaTitle: "Starten Sie Ihr Karrieresystem",
    ctaDesc: "Erstellen Sie Ihr Profil und erhalten Sie noch heute Chancen.",
    createProfile: "Profil erstellen",
    copyright: "© 2026 Operlya. Alle Rechte vorbehalten.",
    cookies: "Cookies"
  },
  pt: {
    description: "Crie seu currículo, publique seu perfil profissional, encontre oportunidades e gerencie trabalho real — tudo em uma plataforma.",
    discover: "Descobrir",
    resumeBuilder: "Criador de Currículo",
    opportunities: "Oportunidades",
    publicProfiles: "Perfis Públicos",
    workManagement: "Gestão de Trabalho",
    resources: "Recursos",
    howItWorks: "Como funciona",
    helpCenter: "Central de Ajuda",
    careerTips: "Dicas de Carreira",
    atsGuide: "Guia de Currículo ATS",
    company: "Empresa",
    about: "Sobre",
    contact: "Contato",
    privacy: "Política de Privacidade",
    terms: "Termos",
    ctaTitle: "Inicie seu sistema de carreira",
    ctaDesc: "Crie seu perfil e comece a receber oportunidades hoje.",
    createProfile: "Criar meu Perfil",
    copyright: "© 2026 Operlya. Todos os direitos reservados.",
    cookies: "Cookies"
  },
  ja: {
    description: "履歴書の作成、プロフェッショナルプロフィールの公開、機会の発見、実際の仕事の管理 — すべてを1つのプラットフォームで。",
    discover: "発見",
    resumeBuilder: "履歴書作成ツール",
    opportunities: "求人機会",
    publicProfiles: "公開プロフィール",
    workManagement: "業務管理",
    resources: "リソース",
    howItWorks: "仕組み",
    helpCenter: "ヘルプセンター",
    careerTips: "キャリアのヒント",
    atsGuide: "ATS履歴書ガイド",
    company: "会社情報",
    about: "关于我们",
    contact: "お問い合わせ",
    privacy: "プライバシーポリシー",
    terms: "利用規約",
    ctaTitle: "キャリアシステムを始める",
    ctaDesc: "プロフィールを作成して、今日から機会を得ましょう。",
    createProfile: "プロフィール作成",
    copyright: "© 2026 Operlya。無断転載を禁じます。",
    cookies: "クッキー"
  },
  ru: {
    description: "Создайте резюме, опубликуйте профессиональный профиль, найдите возможности и управляйте реальной работой — всё на одной платформе.",
    discover: "Обзор",
    resumeBuilder: "Конструктор резюме",
    opportunities: "Возможности",
    publicProfiles: "Публичные профили",
    workManagement: "Управление работой",
    resources: "Ресурсы",
    howItWorks: "Как это работает",
    helpCenter: "Центр помощи",
    careerTips: "Карьерные советы",
    atsGuide: "Руководство по резюме ATS",
    company: "Компания",
    about: "О нас",
    contact: "Контакты",
    privacy: "Политика конфиденциальности",
    terms: "Условия использования",
    ctaTitle: "Начните свою карьерную систему",
    ctaDesc: "Создайте профиль и начните получать возможности сегодня.",
    createProfile: "Создать профиль",
    copyright: "© 2026 Operlya. Все права защищены.",
    cookies: "Файлы cookie"
  }
};
function translateFooter() {
  const lang = getCurrentLang();
  const t = operlyaFooterTranslations[lang] || operlyaFooterTranslations["en"];

  const footer = document.querySelector(".operlya-footer");
  if (!footer) return;

  const desc = footer.querySelector(".footer-col.brand p");
  if (desc) desc.textContent = t.description;

  const titles = footer.querySelectorAll(".footer-col h4");
  if (titles[0]) titles[0].textContent = t.discover;
  if (titles[1]) titles[1].textContent = t.resources;
  if (titles[2]) titles[2].textContent = t.company;
  if (titles[3]) titles[3].textContent = t.ctaTitle;

  const discoverLinks = footer.querySelectorAll(".footer-col:nth-child(2) a");
  if (discoverLinks[0]) discoverLinks[0].textContent = t.resumeBuilder;
  if (discoverLinks[1]) discoverLinks[1].textContent = t.opportunities;

  const resourceLinks = footer.querySelectorAll(".footer-col:nth-child(3) a");
  if (resourceLinks[0]) resourceLinks[0].textContent = t.helpCenter;
  if (resourceLinks[1]) resourceLinks[1].textContent = t.careerTips;
  if (resourceLinks[2]) resourceLinks[2].textContent = t.atsGuide;

  const companyLinks = footer.querySelectorAll(".footer-col:nth-child(4) a");
  if (companyLinks[0]) companyLinks[0].textContent = t.about;
  if (companyLinks[1]) companyLinks[1].textContent = t.contact;
  if (companyLinks[2]) companyLinks[2].textContent = t.privacy;
  if (companyLinks[3]) companyLinks[3].textContent = t.terms;

  const ctaDesc = footer.querySelector(".footer-cta p");
  if (ctaDesc) ctaDesc.textContent = t.ctaDesc;

  const ctaBtn = footer.querySelector(".footer-cta a");
  if (ctaBtn) {
    const icon = ctaBtn.querySelector("i")?.outerHTML || "";
    ctaBtn.innerHTML = `${icon} ${t.createProfile}`;
  }

  const copyright = footer.querySelector(".footer-bottom p");
  if (copyright) copyright.textContent = t.copyright;

  const bottomLinks = footer.querySelectorAll(".footer-bottom-links a");
  if (bottomLinks[0]) bottomLinks[0].textContent = t.privacy;
  if (bottomLinks[1]) bottomLinks[1].textContent = t.terms;
  if (bottomLinks[2]) bottomLinks[2].textContent = t.cookies;
}

const draftsContainer_translations = {
  en: {
    "drafts-title": "Your Drafts",
    "drafts-description": "Continue editing unfinished opportunities.",
    "drafts-toggle-collapse": "Collapse",
    "drafts-toggle-expand": "Expand"
  },
  
  fr: {
    "drafts-title": "Vos brouillons",
    "drafts-description": "Continuez à modifier les opportunités inachevées.",
    "drafts-toggle-collapse": "Réduire",
    "drafts-toggle-expand": "Développer"
  },
  
  ar: {
    "drafts-title": "مسوداتك",
    "drafts-description": "استمر في تحرير الفرص غير المكتملة.",
    "drafts-toggle-collapse": "طي",
    "drafts-toggle-expand": "توسيع"
  },
  
  es: {
    "drafts-title": "Tus borradores",
    "drafts-description": "Continúa editando oportunidades inacabadas.",
    "drafts-toggle-collapse": "Contraer",
    "drafts-toggle-expand": "Expandir"
  },
  
  zh: {
    "drafts-title": "你的草稿",
    "drafts-description": "继续编辑未完成的商机。",
    "drafts-toggle-collapse": "折叠",
    "drafts-toggle-expand": "展开"
  },
  
  de: {
    "drafts-title": "Ihre Entwürfe",
    "drafts-description": "Bearbeiten Sie unfertige Gelegenheiten weiter.",
    "drafts-toggle-collapse": "Einklappen",
    "drafts-toggle-expand": "Ausklappen"
  },
  
  pt: {
    "drafts-title": "Seus rascunhos",
    "drafts-description": "Continue editando oportunidades inacabadas.",
    "drafts-toggle-collapse": "Recolher",
    "drafts-toggle-expand": "Expandir"
  },
  
  ja: {
    "drafts-title": "下書き",
    "drafts-description": "未完了の機会の編集を続けます。",
    "drafts-toggle-collapse": "折りたたむ",
    "drafts-toggle-expand": "展開する"
  },
  
  ru: {
    "drafts-title": "Ваши черновики",
    "drafts-description": "Продолжите редактирование незавершенных возможностей.",
    "drafts-toggle-collapse": "Свернуть",
    "drafts-toggle-expand": "Развернуть"
  }
};
function draftsContainer_translatePage(lang) {
  const t = draftsContainer_translations[lang] || draftsContainer_translations['en'];

  const draftsContainer = document.getElementById('draftsContainer');
  if (!draftsContainer) return;

  const titleElement = draftsContainer.querySelector('.draftsHeader-left h3');
  const descriptionElement = draftsContainer.querySelector('.draftsHeader-left p');
  const countSpan = draftsContainer.querySelector('#draftsCount');

  if (titleElement) {
    const currentCount = countSpan ? countSpan.textContent : '0';
    titleElement.innerHTML = `${t["drafts-title"]}<span id="draftsCount" class="draftsCount">${currentCount}</span>`;
  }

  if (descriptionElement) {
    descriptionElement.textContent = t["drafts-description"];
  }

  const toggleBtn = draftsContainer.querySelector('#draftsToggleBtn');
  if (toggleBtn) {
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      const isExpanded = icon.classList.contains('ri-arrow-up-s-line');
      toggleBtn.title = isExpanded ? t["drafts-toggle-collapse"] : t["drafts-toggle-expand"];
      toggleBtn.setAttribute('aria-label', isExpanded ? t["drafts-toggle-collapse"] : t["drafts-toggle-expand"]);
    }
  }
}

const rightMiniBarTranslations = {
  en: {
    tasks: "Tasks",
    jobs: "Jobs",
    internship: "Internship",
    volunteer: "Volunteer",
    challenge: "Challenge",
    mentorship: "Mentorship",
    research: "Research",
    soon: "Soon"
  },

  fr: {
    tasks: "Tâches",
    jobs: "Emplois",
    internship: "Stage",
    volunteer: "Bénévolat",
    challenge: "Défi",
    mentorship: "Mentorat",
    research: "Recherche",
    soon: "Bientôt"
  },

  ar: {
    tasks: "المهام",
    jobs: "الوظائف",
    internship: "تدريب",
    volunteer: "تطوع",
    challenge: "تحدي",
    mentorship: "إرشاد",
    research: "بحث",
    soon: "قريباً"
  },

  es: {
    tasks: "Tareas",
    jobs: "Empleos",
    internship: "Prácticas",
    volunteer: "Voluntariado",
    challenge: "Desafío",
    mentorship: "Mentoría",
    research: "Investigación",
    soon: "Pronto"
  },

  zh: {
    tasks: "任务",
    jobs: "工作",
    internship: "实习",
    volunteer: "志愿者",
    challenge: "挑战",
    mentorship: "导师计划",
    research: "研究",
    soon: "即将推出"
  },

  de: {
    tasks: "Aufgaben",
    jobs: "Jobs",
    internship: "Praktikum",
    volunteer: "Ehrenamt",
    challenge: "Wettbewerb",
    mentorship: "Mentoring",
    research: "Forschung",
    soon: "Demnächst"
  },

  pt: {
    tasks: "Tarefas",
    jobs: "Empregos",
    internship: "Estágio",
    volunteer: "Voluntariado",
    challenge: "Desafio",
    mentorship: "Mentoria",
    research: "Pesquisa",
    soon: "Em breve"
  },

  ja: {
    tasks: "タスク",
    jobs: "仕事",
    internship: "インターン",
    volunteer: "ボランティア",
    challenge: "チャレンジ",
    mentorship: "メンタリング",
    research: "研究",
    soon: "近日公開"
  },

  ru: {
    tasks: "Задачи",
    jobs: "Работа",
    internship: "Стажировка",
    volunteer: "Волонтёрство",
    challenge: "Челлендж",
    mentorship: "Наставничество",
    research: "Исследования",
    soon: "Скоро"
  }
};

function rightMiniBar_translatePage(lang) {
  const t = rightMiniBarTranslations[lang] || rightMiniBarTranslations.en;

  const buttons = document.querySelectorAll(".rightMiniBar .rmb-item");

  buttons.forEach((btn) => {
    const target = btn.dataset.target || "";

    const span = btn.querySelector("span");
    const small = btn.querySelector("small");

    if (!span) return;

    if (target.includes("taskPage")) {
      span.textContent = t.tasks;
    } else if (target.includes("jobPage")) {
      span.textContent = t.jobs;
    } else if (target.includes("internshipPage")) {
      span.textContent = t.internship;
    } else if (target.includes("volunteerPage")) {
      span.textContent = t.volunteer;
    } else if (target.includes("challengePage")) {
      span.textContent = t.challenge;
    } else if (target.includes("mentorshipPage")) {
      span.textContent = t.mentorship;
    } else if (target.includes("researchPage")) {
      span.textContent = t.research;
    }

    if (small) {
      small.textContent = t.soon;
    }
  });
}

const taskForm_translations = {
  en: {
    "tasks-header-title": "Add New Task",
    "tasks-header-description": "Create a new task to assign work, define requirements, and receive applications.",
    "tasks-reset-tooltip": "Reset Form",
    
    "step-definition": "Task Definition",
    "step-skills": "Required Capabilities",
    "step-mode": "Execution Conditions",
    "step-evaluation": "Acceptance Criteria",
    "step-payment": "Compensation & Guarantees",
    
    "definition-title": "Task Definition",
    "task-title-label": "Task Title",
    "task-title-placeholder": "Design homepage mockup",
    "task-description-label": "Task Description",
    "task-description-placeholder": "Define the scope, objectives, constraints, and expected outcome of the task.",
    "work-nature-label": "Work Nature",
    "work-nature-placeholder": "Select work nature",
    "work-nature-development": "Development",
    "work-nature-operations": "Operations",
    "work-nature-maintenance": "Maintenance",
    "work-nature-support": "Support",
    "work-nature-construction": "Construction",
    "work-nature-consulting": "Consulting",
    "work-nature-repair": "Repair",
    "work-nature-creative": "Creative",
    "work-nature-audit": "Audit",
    "work-nature-other": "Other",
    
    "category-label": "Task Category",
    "speciality-label": "Task Speciality",
    
    "task-period-label": "Task Period",
    "start-date-placeholder": "Task Start",
    "end-date-placeholder": "Task End",
    "estimated-duration-label": "Estimated Duration",
    "estimated-duration-suffix": "hours",
    "time-flexibility-label": "Time Flexibility",
    "time-flexible": "Flexible",
    "time-moderate": "Moderate",
    "time-strict": "Strict",
    "hard-deadline-label": "Hard Deadline",
    
    "skills-title": "Required Capabilities",
    "skills-subtitle": "Skills",
    "skills-add-tech": "➕ Add Technical Skill",
    "languages-subtitle": "Languages",
    "languages-add": "➕ Add Language",
    
    "conditions-title": "Execution Conditions",
    "execution-entity-label": "Execution Entity",
    "entity-individual": "Individual",
    "entity-individual-desc": "Single person executing the task independently",
    "entity-professional": "Professional",
    "entity-professional-desc": "Certified or experienced specialist",
    "entity-organization": "Organization",
    "entity-organization-desc": "Company, agency, or formal entity",
    
    "max-executors-label": "Maximum Executors",
    "max-executors-hint": "Controls how many executors can join this task",
    
    "task-scale-label": "Task Scale",
    "scale-micro": "Micro",
    "scale-micro-desc": "Small task for 1–2 people, simple scope",
    "scale-standard": "Standard",
    "scale-standard-desc": "Medium complexity, may involve a small team",
    "scale-project": "Project",
    "scale-project-desc": "Large task with multiple executors and stages",
    
    "work-setting-label": "Work Setting",
    "setting-remote": "Remote",
    "setting-remote-desc": "Performed off-site using digital tools",
    "setting-onsite": "On-Site",
    "setting-onsite-desc": "Executed physically at a specific location",
    "setting-hybrid": "Hybrid",
    "setting-hybrid-desc": "Combination of remote and on-site work",
    "setting-independent": "Independent",
    "setting-independent-desc": "Flexible execution without location constraints",
    
    "work-dynamics-label": "Work Dynamics",
    "dynamics-supervised": "Supervised",
    "dynamics-supervised-desc": "Guided execution under oversight",
    "dynamics-team": "Team",
    "dynamics-team-desc": "Collaborative execution by multiple people",
    "dynamics-solo": "Solo",
    "dynamics-solo-desc": "Independent execution by one person",
    "dynamics-simulated": "Simulated",
    "dynamics-simulated-desc": "Controlled or virtual environment execution",
    
    "proof-label": "Proof of Completion",
    "proof-milestones": "Milestones",
    "proof-milestones-desc": "Tracked stages demonstrate progress",
    "proof-executable": "Executable",
    "proof-executable-desc": "Delivered program or software running",
    "proof-assessment": "Assessment",
    "proof-assessment-desc": "Validated via tests or evaluations",
    "proof-files": "Files",
    "proof-files-desc": "Digital documents or deliverables reports",
    
    "instructions-label": "Execution Instructions",
    "instructions-placeholder": "Steps, constraints, deliverables, environment notes...",
    
    "location-label": "Reference Location",
    "location-placeholder": "Casablanca, Morocco or 33.5731,-7.5898",
    "location-hint": "Add or select a location if needed.",
    
    "max-distance-label": "Maximum Distance",
    "max-distance-suffix": "km",
    
    "criteria-title": "Acceptance Criteria",
    "validation-logic-label": "Validation Logic",
    "validation-objective": "Objective",
    "validation-objective-desc": "Task meets defined goals",
    "validation-inspection": "Inspection",
    "validation-inspection-desc": "Checked against Criteria",
    "validation-approval": "Approval",
    "validation-approval-desc": "Final authorization required",
    "validation-collective": "Collective",
    "validation-collective-desc": "Validated by the team",
    
    "acceptance-criteria-label": "Acceptance Criteria",
    "criteria-deadline": "Deadline respected",
    "criteria-deadline-desc": "Uses hard deadline defined in Schedule",
    "criteria-requirements": "Requirements fulfilled",
    "criteria-requirements-desc": "Based on task instructions & deliverables",
    "criteria-quality": "Quality score threshold",
    "criteria-min-score": "Minimum score",
    "criteria-min-score-suffix": "%",
    "criteria-client": "Client approval required",
    "criteria-client-desc": "Task is accepted only after explicit client validation",
    
    "revision-label": "Allow Revision",
    "max-attempts-label": "Max times",
    "revision-hint": "Enable this if users are allowed to submit revisions for this task.",
    
    // Payment page
    "payment-title": "Compensation & Guarantees",
    "price-label": "Task Price",
    "currency-label": "Currency",
    
    "additional-costs-label": "Additional Cost Coverage",
    "cost-materials": "Materials & Supplies",
    "cost-materials-desc": "Client covers raw materials, consumables, or parts",
    "cost-transport": "Transport & Travel",
    "cost-transport-desc": "Fuel, tickets, delivery, or commuting expenses",
    "cost-tools": "Tools & Equipment",
    "cost-tools-desc": "Rental or usage of required equipment",
    "cost-accommodation": "Accommodation",
    "cost-accommodation-desc": "Hotel or lodging for on-site or remote locations",
    "cost-fees": "Administrative / Legal Fees",
    "cost-fees-desc": "Permits, certifications, or documentation costs",
    
    "reimbursement-label": "Reimbursement Mode",
    "reimbursement-placeholder": "Select reimbursement mode",
    "reimbursement-reimbursed": "Reimbursed After Proof",
    "reimbursement-prepaid": "Prepaid by Client",
    "reimbursement-hint": "Applies only if additional costs are selected above.",
    
    "guarantees-label": "Guarantees & Protections",
    "guarantee-late-penalty": "Late delivery penalty",
    "guarantee-late-penalty-desc": "Payment reduced if deadline is missed",
    "guarantee-penalty-label": "Penalty",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "Damage responsibility",
    "guarantee-damage-desc": "Executor liable for damages caused during execution",
    "guarantee-replacement": "Replacement guarantee",
    "guarantee-replacement-desc": "Executor must fix or redo failed work",
    
    "payment-model-label": "Payment Model",
    "payment-model-fixed": "Fixed",
    "payment-model-milestone": "Milestone",
    "payment-model-performance": "Performance Based",
    
    // Buttons
    "btn-previous": "← Previous",
    "btn-next": "Next →",
    "btn-save-draft": "Save Draft",
    "btn-publish": "Publish Task",
    "btn-publish-boost": "Publish Boosted Task",
    "coins": "coins"
  },
  
  fr: {
    // Header
    "tasks-header-title": "Ajouter une nouvelle tâche",
    "tasks-header-description": "Créez une nouvelle tâche pour assigner du travail, définir les exigences et recevoir des candidatures.",
    "tasks-reset-tooltip": "Réinitialiser le formulaire",
    
    // Navigation steps
    "step-definition": "Définition de la tâche",
    "step-skills": "Capacités requises",
    "step-mode": "Conditions d'exécution",
    "step-evaluation": "Critères d'acceptation",
    "step-payment": "Rémunération et garanties",
    
    // Task Definition page
    "definition-title": "Définition de la tâche",
    "task-title-label": "Titre de la tâche",
    "task-title-placeholder": "Concevoir une maquette de page d'accueil",
    "task-description-label": "Description de la tâche",
    "task-description-placeholder": "Définissez la portée, les objectifs, les contraintes et le résultat attendu de la tâche.",
    "work-nature-label": "Nature du travail",
    "work-nature-placeholder": "Sélectionnez la nature du travail",
    "work-nature-development": "Développement",
    "work-nature-operations": "Opérations",
    "work-nature-maintenance": "Maintenance",
    "work-nature-support": "Support",
    "work-nature-construction": "Construction",
    "work-nature-consulting": "Conseil",
    "work-nature-repair": "Réparation",
    "work-nature-creative": "Créatif",
    "work-nature-audit": "Audit",
    "work-nature-other": "Autre",
    
    "category-label": "Catégorie de tâche",
    "speciality-label": "Spécialité de la tâche",
    
    "task-period-label": "Période de la tâche",
    "start-date-placeholder": "Début de la tâche",
    "end-date-placeholder": "Fin de la tâche",
    "estimated-duration-label": "Durée estimée",
    "estimated-duration-suffix": "heures",
    "time-flexibility-label": "Flexibilité horaire",
    "time-flexible": "Flexible",
    "time-moderate": "Modérée",
    "time-strict": "Stricte",
    "hard-deadline-label": "Date limite stricte",
    
    // Skills page
    "skills-title": "Capacités requises",
    "skills-subtitle": "Compétences",
    "skills-add-tech": "➕ Ajouter une compétence technique",
    "languages-subtitle": "Langues",
    "languages-add": "➕ Ajouter une langue",
    
    // Execution Conditions page
    "conditions-title": "Conditions d'exécution",
    "execution-entity-label": "Entité d'exécution",
    "entity-individual": "Individu",
    "entity-individual-desc": "Personne seule exécutant la tâche indépendamment",
    "entity-professional": "Professionnel",
    "entity-professional-desc": "Spécialiste certifié ou expérimenté",
    "entity-organization": "Organisation",
    "entity-organization-desc": "Entreprise, agence ou entité formelle",
    
    "max-executors-label": "Nombre maximum d'exécutants",
    "max-executors-hint": "Contrôle combien d'exécutants peuvent rejoindre cette tâche",
    
    "task-scale-label": "Échelle de la tâche",
    "scale-micro": "Micro",
    "scale-micro-desc": "Petite tâche pour 1–2 personnes, portée simple",
    "scale-standard": "Standard",
    "scale-standard-desc": "Complexité moyenne, peut impliquer une petite équipe",
    "scale-project": "Projet",
    "scale-project-desc": "Grande tâche avec plusieurs exécutants et étapes",
    
    "work-setting-label": "Cadre de travail",
    "setting-remote": "À distance",
    "setting-remote-desc": "Effectué hors site avec des outils numériques",
    "setting-onsite": "Sur site",
    "setting-onsite-desc": "Exécuté physiquement à un endroit spécifique",
    "setting-hybrid": "Hybride",
    "setting-hybrid-desc": "Combinaison de travail à distance et sur site",
    "setting-independent": "Indépendant",
    "setting-independent-desc": "Exécution flexible sans contraintes de lieu",
    
    "work-dynamics-label": "Dynamique de travail",
    "dynamics-supervised": "Supervisé",
    "dynamics-supervised-desc": "Exécution guidée sous supervision",
    "dynamics-team": "Équipe",
    "dynamics-team-desc": "Exécution collaborative par plusieurs personnes",
    "dynamics-solo": "Seul",
    "dynamics-solo-desc": "Exécution indépendante par une personne",
    "dynamics-simulated": "Simulé",
    "dynamics-simulated-desc": "Exécution en environnement contrôlé ou virtuel",
    
    "proof-label": "Preuve d'achèvement",
    "proof-milestones": "Jalons",
    "proof-milestones-desc": "Étapes suivies démontrant la progression",
    "proof-executable": "Exécutable",
    "proof-executable-desc": "Programme livré ou logiciel fonctionnel",
    "proof-assessment": "Évaluation",
    "proof-assessment-desc": "Validé par des tests ou évaluations",
    "proof-files": "Fichiers",
    "proof-files-desc": "Documents numériques ou rapports de livrables",
    
    "instructions-label": "Instructions d'exécution",
    "instructions-placeholder": "Étapes, contraintes, livrables, notes d'environnement...",
    
    "location-label": "Lieu de référence",
    "location-placeholder": "Casablanca, Maroc ou 33.5731,-7.5898",
    "location-hint": "Ajoutez ou sélectionnez un lieu si nécessaire.",
    
    "max-distance-label": "Distance maximale",
    "max-distance-suffix": "km",
    
    // Acceptance Criteria page
    "criteria-title": "Critères d'acceptation",
    "validation-logic-label": "Logique de validation",
    "validation-objective": "Objectif",
    "validation-objective-desc": "La tâche atteint les objectifs définis",
    "validation-inspection": "Inspection",
    "validation-inspection-desc": "Vérifié selon des critères",
    "validation-approval": "Approbation",
    "validation-approval-desc": "Autorisation finale requise",
    "validation-collective": "Collectif",
    "validation-collective-desc": "Validé par l'équipe",
    
    "acceptance-criteria-label": "Critères d'acceptation",
    "criteria-deadline": "Délai respecté",
    "criteria-deadline-desc": "Utilise la date limite stricte définie dans le calendrier",
    "criteria-requirements": "Exigences remplies",
    "criteria-requirements-desc": "Basé sur les instructions de la tâche et les livrables",
    "criteria-quality": "Seuil de qualité",
    "criteria-min-score": "Score minimum",
    "criteria-min-score-suffix": "%",
    "criteria-client": "Approbation client requise",
    "criteria-client-desc": "La tâche n'est acceptée qu'après validation explicite du client",
    
    "revision-label": "Autoriser les révisions",
    "max-attempts-label": "Nombre max",
    "revision-hint": "Activez cette option si les utilisateurs sont autorisés à soumettre des révisions pour cette tâche.",
    
    // Payment page
    "payment-title": "Rémunération et garanties",
    "price-label": "Prix de la tâche",
    "currency-label": "Devise",
    
    "additional-costs-label": "Couverture des coûts supplémentaires",
    "cost-materials": "Matériaux et fournitures",
    "cost-materials-desc": "Le client couvre les matières premières, consommables ou pièces",
    "cost-transport": "Transport et déplacements",
    "cost-transport-desc": "Carburant, billets, livraison ou frais de trajet",
    "cost-tools": "Outils et équipement",
    "cost-tools-desc": "Location ou utilisation d'équipement requis",
    "cost-accommodation": "Hébergement",
    "cost-accommodation-desc": "Hôtel ou logement pour sites sur place ou à distance",
    "cost-fees": "Frais administratifs/juridiques",
    "cost-fees-desc": "Permis, certifications ou frais de documentation",
    
    "reimbursement-label": "Mode de remboursement",
    "reimbursement-placeholder": "Sélectionnez le mode de remboursement",
    "reimbursement-reimbursed": "Remboursé sur justificatif",
    "reimbursement-prepaid": "Prép payé par le client",
    "reimbursement-hint": "S'applique uniquement si des coûts supplémentaires sont sélectionnés ci-dessus.",
    
    "guarantees-label": "Garanties et protections",
    "guarantee-late-penalty": "Pénalité de retard",
    "guarantee-late-penalty-desc": "Paiement réduit si la date limite n'est pas respectée",
    "guarantee-penalty-label": "Pénalité",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "Responsabilité en cas de dommage",
    "guarantee-damage-desc": "L'exécutant est responsable des dommages causés pendant l'exécution",
    "guarantee-replacement": "Garantie de remplacement",
    "guarantee-replacement-desc": "L'exécutant doit réparer ou refaire le travail échoué",
    
    "payment-model-label": "Modèle de paiement",
    "payment-model-fixed": "Fixe",
    "payment-model-milestone": "Par jalon",
    "payment-model-performance": "Basé sur la performance",
    
    // Buttons
    "btn-previous": "← Précédent",
    "btn-next": "Suivant →",
    "btn-save-draft": "Enregistrer le brouillon",
    "btn-publish": "Publier la tâche",
    "btn-publish-boost": "Publier une tâche boostée",
    "coins": "pièces"
  },
  
  ar: {
    // Header
    "tasks-header-title": "إضافة مهمة جديدة",
    "tasks-header-description": "أنشئ مهمة جديدة لتعيين العمل وتحديد المتطلبات واستقبال الطلبات.",
    "tasks-reset-tooltip": "إعادة تعيين النموذج",
    
    // Navigation steps
    "step-definition": "تعريف المهمة",
    "step-skills": "القدرات المطلوبة",
    "step-mode": "شروط التنفيذ",
    "step-evaluation": "معايير القبول",
    "step-payment": "التعويضات والضمانات",
    
    // Task Definition page
    "definition-title": "تعريف المهمة",
    "task-title-label": "عنوان المهمة",
    "task-title-placeholder": "تصميم نموذج الصفحة الرئيسية",
    "task-description-label": "وصف المهمة",
    "task-description-placeholder": "حدد النطاق والأهداف والقيود والنتيجة المتوقعة للمهمة.",
    "work-nature-label": "طبيعة العمل",
    "work-nature-placeholder": "اختر طبيعة العمل",
    "work-nature-development": "تطوير",
    "work-nature-operations": "عمليات",
    "work-nature-maintenance": "صيانة",
    "work-nature-support": "دعم",
    "work-nature-construction": "بناء",
    "work-nature-consulting": "استشارات",
    "work-nature-repair": "إصلاح",
    "work-nature-creative": "إبداعي",
    "work-nature-audit": "تدقيق",
    "work-nature-other": "أخرى",
    
    "category-label": "فئة المهمة",
    "speciality-label": "تخصص المهمة",
    
    "task-period-label": "فترة المهمة",
    "start-date-placeholder": "بداية المهمة",
    "end-date-placeholder": "نهاية المهمة",
    "estimated-duration-label": "المدة التقديرية",
    "estimated-duration-suffix": "ساعات",
    "time-flexibility-label": "مرونة الوقت",
    "time-flexible": "مرن",
    "time-moderate": "متوسط",
    "time-strict": "صارم",
    "hard-deadline-label": "موعد نهائي صارم",
    
    // Skills page
    "skills-title": "القدرات المطلوبة",
    "skills-subtitle": "المهارات",
    "skills-add-tech": "➕ إضافة مهارة تقنية",
    "languages-subtitle": "اللغات",
    "languages-add": "➕ إضافة لغة",
    
    // Execution Conditions page
    "conditions-title": "شروط التنفيذ",
    "execution-entity-label": "جهة التنفيذ",
    "entity-individual": "فرد",
    "entity-individual-desc": "شخص واحد ينفذ المهمة بشكل مستقل",
    "entity-professional": "محترف",
    "entity-professional-desc": "متخصص معتمد أو ذو خبرة",
    "entity-organization": "مؤسسة",
    "entity-organization-desc": "شركة، وكالة، أو كيان رسمي",
    
    "max-executors-label": "الحد الأقصى للمنفذين",
    "max-executors-hint": "يتحكم في عدد المنفذين الذين يمكنهم الانضمام إلى هذه المهمة",
    
    "task-scale-label": "نطاق المهمة",
    "scale-micro": "متناهي الصغر",
    "scale-micro-desc": "مهمة صغيرة لـ1-2 شخص، نطاق بسيط",
    "scale-standard": "قياسي",
    "scale-standard-desc": "تعقيد متوسط، قد يشمل فريقًا صغيرًا",
    "scale-project": "مشروع",
    "scale-project-desc": "مهمة كبيرة مع منفذين ومراحل متعددة",
    
    "work-setting-label": "بيئة العمل",
    "setting-remote": "عن بعد",
    "setting-remote-desc": "يتم تنفيذها خارج الموقع باستخدام الأدوات الرقمية",
    "setting-onsite": "في الموقع",
    "setting-onsite-desc": "يتم تنفيذها فعليًا في موقع محدد",
    "setting-hybrid": "هجين",
    "setting-hybrid-desc": "مزيج من العمل عن بعد وفي الموقع",
    "setting-independent": "مستقل",
    "setting-independent-desc": "تنفيذ مرن بدون قيود الموقع",
    
    "work-dynamics-label": "ديناميكية العمل",
    "dynamics-supervised": "بإشراف",
    "dynamics-supervised-desc": "تنفيذ موجه تحت الإشراف",
    "dynamics-team": "فريق",
    "dynamics-team-desc": "تنفيذ تعاوني بواسطة عدة أشخاص",
    "dynamics-solo": "فردي",
    "dynamics-solo-desc": "تنفيذ مستقل بواسطة شخص واحد",
    "dynamics-simulated": "محاكاة",
    "dynamics-simulated-desc": "تنفيذ في بيئة خاضعة للتحكم أو افتراضية",
    
    "proof-label": "إثبات الإنجاز",
    "proof-milestones": "مراحل",
    "proof-milestones-desc": "مراحل متتبعة تظهر التقدم",
    "proof-executable": "برنامج تنفيذي",
    "proof-executable-desc": "برنامج أو تطبيق تم تسليمه يعمل",
    "proof-assessment": "تقييم",
    "proof-assessment-desc": "تم التحقق عبر اختبارات أو تقييمات",
    "proof-files": "ملفات",
    "proof-files-desc": "مستندات رقمية أو تقارير التسليمات",
    
    "instructions-label": "تعليمات التنفيذ",
    "instructions-placeholder": "الخطوات، القيود، التسليمات، ملاحظات البيئة...",
    
    "location-label": "الموقع المرجعي",
    "location-placeholder": "الدار البيضاء، المغرب أو 33.5731,-7.5898",
    "location-hint": "أضف أو اختر موقعًا إذا لزم الأمر.",
    
    "max-distance-label": "أقصى مسافة",
    "max-distance-suffix": "كم",
    
    // Acceptance Criteria page
    "criteria-title": "معايير القبول",
    "validation-logic-label": "منطق التحقق",
    "validation-objective": "موضوعي",
    "validation-objective-desc": "المهمة تحقق الأهداف المحددة",
    "validation-inspection": "فحص",
    "validation-inspection-desc": "تم التحقق وفقًا للمعايير",
    "validation-approval": "موافقة",
    "validation-approval-desc": "التفويض النهائي مطلوب",
    "validation-collective": "جماعي",
    "validation-collective-desc": "تم التحقق من قبل الفريق",
    
    "acceptance-criteria-label": "معايير القبول",
    "criteria-deadline": "احترام الموعد النهائي",
    "criteria-deadline-desc": "يستخدم الموعد النهائي الصارم المحدد في الجدول",
    "criteria-requirements": "استيفاء المتطلبات",
    "criteria-requirements-desc": "بناءً على تعليمات المهمة والتسليمات",
    "criteria-quality": "حد درجة الجودة",
    "criteria-min-score": "الحد الأدنى للدرجة",
    "criteria-min-score-suffix": "%",
    "criteria-client": "موافقة العميل مطلوبة",
    "criteria-client-desc": "يتم قبول المهمة فقط بعد التحقق الصريح من العميل",
    
    "revision-label": "السماح بالمراجعة",
    "max-attempts-label": "الحد الأقصى",
    "revision-hint": "قم بتمكين هذا إذا كان مسموحًا للمستخدمين بتقديم مراجعات لهذه المهمة.",
    
    // Payment page
    "payment-title": "التعويضات والضمانات",
    "price-label": "سعر المهمة",
    "currency-label": "العملة",
    
    "additional-costs-label": "تغطية التكاليف الإضافية",
    "cost-materials": "المواد واللوازم",
    "cost-materials-desc": "العميل يغطي المواد الخام أو المستهلكات أو القطع",
    "cost-transport": "النقل والسفر",
    "cost-transport-desc": "الوقود، التذاكر، التوصيل، أو مصاريف التنقل",
    "cost-tools": "الأدوات والمعدات",
    "cost-tools-desc": "تأجير أو استخدام المعدات المطلوبة",
    "cost-accommodation": "الإقامة",
    "cost-accommodation-desc": "فندق أو سكن للمواقع البعيدة أو في الموقع",
    "cost-fees": "الرسوم الإدارية / القانونية",
    "cost-fees-desc": "التصاريح أو الشهادات أو تكاليف التوثيق",
    
    "reimbursement-label": "طريقة السداد",
    "reimbursement-placeholder": "اختر طريقة السداد",
    "reimbursement-reimbursed": "السداد بعد الإثبات",
    "reimbursement-prepaid": "مدفوع مقدمًا من العميل",
    "reimbursement-hint": "ينطبق فقط إذا تم تحديد تكاليف إضافية أعلاه.",
    
    "guarantees-label": "الضمانات والحماية",
    "guarantee-late-penalty": "غرامة التأخير",
    "guarantee-late-penalty-desc": "تخفيض الدفع إذا تم تفويت الموعد النهائي",
    "guarantee-penalty-label": "الغرامة",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "المسؤولية عن الضرر",
    "guarantee-damage-desc": "المنفذ مسؤول عن الأضرار الناتجة أثناء التنفيذ",
    "guarantee-replacement": "ضمان الاستبدال",
    "guarantee-replacement-desc": "يجب على المنفذ إصلاح أو إعادة العمل الفاشل",
    
    "payment-model-label": "نموذج الدفع",
    "payment-model-fixed": "ثابت",
    "payment-model-milestone": "مرحلي",
    "payment-model-performance": "على أساس الأداء",
    
    // Buttons
    "btn-previous": "→ السابق",
    "btn-next": "التالي ←",
    "btn-save-draft": "حفظ المسودة",
    "btn-publish": "نشر المهمة",
    "btn-publish-boost": "نشر مهمة معززة",
    "coins": "عملات"
  },

  es: {
    // Header
    "tasks-header-title": "Agregar Nueva Tarea",
    "tasks-header-description": "Crea una nueva tarea para asignar trabajo, definir requisitos y recibir solicitudes.",
    "tasks-reset-tooltip": "Restablecer Formulario",
    
    // Navigation steps
    "step-definition": "Definición de Tarea",
    "step-skills": "Capacidades Requeridas",
    "step-mode": "Condiciones de Ejecución",
    "step-evaluation": "Criterios de Aceptación",
    "step-payment": "Compensación y Garantías",
    
    // Task Definition page
    "definition-title": "Definición de Tarea",
    "task-title-label": "Título de la Tarea",
    "task-title-placeholder": "Diseñar maqueta de página de inicio",
    "task-description-label": "Descripción de la Tarea",
    "task-description-placeholder": "Defina el alcance, objetivos, restricciones y resultado esperado de la tarea.",
    "work-nature-label": "Naturaleza del Trabajo",
    "work-nature-placeholder": "Seleccione naturaleza del trabajo",
    "work-nature-development": "Desarrollo",
    "work-nature-operations": "Operaciones",
    "work-nature-maintenance": "Mantenimiento",
    "work-nature-support": "Soporte",
    "work-nature-construction": "Construcción",
    "work-nature-consulting": "Consultoría",
    "work-nature-repair": "Reparación",
    "work-nature-creative": "Creativo",
    "work-nature-audit": "Auditoría",
    "work-nature-other": "Otro",
    
    "category-label": "Categoría de Tarea",
    "speciality-label": "Especialidad de la Tarea",
    
    "task-period-label": "Período de la Tarea",
    "start-date-placeholder": "Inicio de Tarea",
    "end-date-placeholder": "Fin de Tarea",
    "estimated-duration-label": "Duración Estimada",
    "estimated-duration-suffix": "horas",
    "time-flexibility-label": "Flexibilidad Horaria",
    "time-flexible": "Flexible",
    "time-moderate": "Moderada",
    "time-strict": "Estricta",
    "hard-deadline-label": "Fecha Límite Estricta",
    
    // Skills page
    "skills-title": "Capacidades Requeridas",
    "skills-subtitle": "Habilidades",
    "skills-add-tech": "➕ Agregar Habilidad Técnica",
    "languages-subtitle": "Idiomas",
    "languages-add": "➕ Agregar Idioma",
    
    // Execution Conditions page
    "conditions-title": "Condiciones de Ejecución",
    "execution-entity-label": "Entidad de Ejecución",
    "entity-individual": "Individuo",
    "entity-individual-desc": "Persona sola ejecutando la tarea independientemente",
    "entity-professional": "Profesional",
    "entity-professional-desc": "Especialista certificado o con experiencia",
    "entity-organization": "Organización",
    "entity-organization-desc": "Empresa, agencia o entidad formal",
    
    "max-executors-label": "Máximo de Ejecutores",
    "max-executors-hint": "Controla cuántos ejecutores pueden unirse a esta tarea",
    
    "task-scale-label": "Escala de la Tarea",
    "scale-micro": "Micro",
    "scale-micro-desc": "Tarea pequeña para 1-2 personas, alcance simple",
    "scale-standard": "Estándar",
    "scale-standard-desc": "Complejidad media, puede involucrar un equipo pequeño",
    "scale-project": "Proyecto",
    "scale-project-desc": "Tarea grande con múltiples ejecutores y etapas",
    
    "work-setting-label": "Entorno de Trabajo",
    "setting-remote": "Remoto",
    "setting-remote-desc": "Realizado fuera del sitio usando herramientas digitales",
    "setting-onsite": "Presencial",
    "setting-onsite-desc": "Ejecutado físicamente en una ubicación específica",
    "setting-hybrid": "Híbrido",
    "setting-hybrid-desc": "Combinación de trabajo remoto y presencial",
    "setting-independent": "Independiente",
    "setting-independent-desc": "Ejecución flexible sin restricciones de ubicación",
    
    "work-dynamics-label": "Dinámica de Trabajo",
    "dynamics-supervised": "Supervisado",
    "dynamics-supervised-desc": "Ejecución guiada bajo supervisión",
    "dynamics-team": "Equipo",
    "dynamics-team-desc": "Ejecución colaborativa por múltiples personas",
    "dynamics-solo": "Individual",
    "dynamics-solo-desc": "Ejecución independiente por una persona",
    "dynamics-simulated": "Simulado",
    "dynamics-simulated-desc": "Ejecución en entorno controlado o virtual",
    
    "proof-label": "Prueba de Finalización",
    "proof-milestones": "Hitos",
    "proof-milestones-desc": "Etapas rastreadas demuestran progreso",
    "proof-executable": "Ejecutable",
    "proof-executable-desc": "Programa entregado o software funcionando",
    "proof-assessment": "Evaluación",
    "proof-assessment-desc": "Validado mediante pruebas o evaluaciones",
    "proof-files": "Archivos",
    "proof-files-desc": "Documentos digitales o informes de entregables",
    
    "instructions-label": "Instrucciones de Ejecución",
    "instructions-placeholder": "Pasos, restricciones, entregables, notas de entorno...",
    
    "location-label": "Ubicación de Referencia",
    "location-placeholder": "Casablanca, Marruecos o 33.5731,-7.5898",
    "location-hint": "Agregue o seleccione una ubicación si es necesario.",
    
    "max-distance-label": "Distancia Máxima",
    "max-distance-suffix": "km",
    
    // Acceptance Criteria page
    "criteria-title": "Criterios de Aceptación",
    "validation-logic-label": "Lógica de Validación",
    "validation-objective": "Objetivo",
    "validation-objective-desc": "La tarea cumple los objetivos definidos",
    "validation-inspection": "Inspección",
    "validation-inspection-desc": "Verificado según criterios",
    "validation-approval": "Aprobación",
    "validation-approval-desc": "Autorización final requerida",
    "validation-collective": "Colectivo",
    "validation-collective-desc": "Validado por el equipo",
    
    "acceptance-criteria-label": "Criterios de Aceptación",
    "criteria-deadline": "Plazo respetado",
    "criteria-deadline-desc": "Usa la fecha límite estricta definida en el cronograma",
    "criteria-requirements": "Requisitos cumplidos",
    "criteria-requirements-desc": "Basado en instrucciones de la tarea y entregables",
    "criteria-quality": "Umbral de calidad",
    "criteria-min-score": "Puntuación mínima",
    "criteria-min-score-suffix": "%",
    "criteria-client": "Aprobación del cliente requerida",
    "criteria-client-desc": "La tarea se acepta solo después de validación explícita del cliente",
    
    "revision-label": "Permitir Revisión",
    "max-attempts-label": "Veces máx",
    "revision-hint": "Active esto si los usuarios pueden enviar revisiones para esta tarea.",
    
    // Payment page
    "payment-title": "Compensación y Garantías",
    "price-label": "Precio de la Tarea",
    "currency-label": "Moneda",
    
    "additional-costs-label": "Cobertura de Costos Adicionales",
    "cost-materials": "Materiales y Suministros",
    "cost-materials-desc": "El cliente cubre materias primas, consumibles o piezas",
    "cost-transport": "Transporte y Viajes",
    "cost-transport-desc": "Combustible, boletos, entrega o gastos de desplazamiento",
    "cost-tools": "Herramientas y Equipos",
    "cost-tools-desc": "Alquiler o uso de equipo requerido",
    "cost-accommodation": "Alojamiento",
    "cost-accommodation-desc": "Hotel o alojamiento para ubicaciones presenciales o remotas",
    "cost-fees": "Honorarios Administrativos/Legales",
    "cost-fees-desc": "Permisos, certificaciones o costos de documentación",
    
    "reimbursement-label": "Modo de Reembolso",
    "reimbursement-placeholder": "Seleccione modo de reembolso",
    "reimbursement-reimbursed": "Reembolsado después de comprobante",
    "reimbursement-prepaid": "Prepago por el Cliente",
    "reimbursement-hint": "Aplica solo si se seleccionan costos adicionales arriba.",
    
    "guarantees-label": "Garantías y Protecciones",
    "guarantee-late-penalty": "Penalización por retraso",
    "guarantee-late-penalty-desc": "Pago reducido si no se cumple el plazo",
    "guarantee-penalty-label": "Penalización",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "Responsabilidad por daños",
    "guarantee-damage-desc": "El ejecutor es responsable de los daños causados durante la ejecución",
    "guarantee-replacement": "Garantía de reemplazo",
    "guarantee-replacement-desc": "El ejecutor debe arreglar o rehacer el trabajo fallido",
    
    "payment-model-label": "Modelo de Pago",
    "payment-model-fixed": "Fijo",
    "payment-model-milestone": "Por Hitos",
    "payment-model-performance": "Basado en Rendimiento",
    
    // Buttons
    "btn-previous": "← Anterior",
    "btn-next": "Siguiente →",
    "btn-save-draft": "Guardar Borrador",
    "btn-publish": "Publicar tarea",
    "btn-publish-boost": "Publicar tarea destacada",
    "coins": "monedas"
  },

  zh: {
    // Header
    "tasks-header-title": "添加新任务",
    "tasks-header-description": "创建新任务以分配工作、定义要求和接收申请。",
    "tasks-reset-tooltip": "重置表单",
    
    // Navigation steps
    "step-definition": "任务定义",
    "step-skills": "所需能力",
    "step-mode": "执行条件",
    "step-evaluation": "验收标准",
    "step-payment": "报酬与保障",
    
    // Task Definition page
    "definition-title": "任务定义",
    "task-title-label": "任务标题",
    "task-title-placeholder": "设计主页模型",
    "task-description-label": "任务描述",
    "task-description-placeholder": "定义任务的范围、目标、约束条件和预期结果。",
    "work-nature-label": "工作性质",
    "work-nature-placeholder": "选择工作性质",
    "work-nature-development": "开发",
    "work-nature-operations": "运营",
    "work-nature-maintenance": "维护",
    "work-nature-support": "支持",
    "work-nature-construction": "建设",
    "work-nature-consulting": "咨询",
    "work-nature-repair": "维修",
    "work-nature-creative": "创意",
    "work-nature-audit": "审计",
    "work-nature-other": "其他",
    
    "category-label": "任务类别",
    "speciality-label": "任务专业",
    
    "task-period-label": "任务周期",
    "start-date-placeholder": "任务开始",
    "end-date-placeholder": "任务结束",
    "estimated-duration-label": "预计时长",
    "estimated-duration-suffix": "小时",
    "time-flexibility-label": "时间灵活性",
    "time-flexible": "灵活",
    "time-moderate": "适中",
    "time-strict": "严格",
    "hard-deadline-label": "硬性截止日期",
    
    // Skills page
    "skills-title": "所需能力",
    "skills-subtitle": "技能",
    "skills-add-tech": "➕ 添加技术技能",
    "languages-subtitle": "语言",
    "languages-add": "➕ 添加语言",
    
    // Execution Conditions page
    "conditions-title": "执行条件",
    "execution-entity-label": "执行实体",
    "entity-individual": "个人",
    "entity-individual-desc": "独立执行任务的单个人",
    "entity-professional": "专业人士",
    "entity-professional-desc": "持证或有经验的专家",
    "entity-organization": "组织",
    "entity-organization-desc": "公司、机构或正式实体",
    
    "max-executors-label": "最大执行人数",
    "max-executors-hint": "控制可以加入此任务的执行者数量",
    
    "task-scale-label": "任务规模",
    "scale-micro": "微小",
    "scale-micro-desc": "1-2人的小任务，范围简单",
    "scale-standard": "标准",
    "scale-standard-desc": "中等复杂度，可能涉及小团队",
    "scale-project": "项目",
    "scale-project-desc": "具有多个执行者和阶段的大型任务",
    
    "work-setting-label": "工作环境",
    "setting-remote": "远程",
    "setting-remote-desc": "使用数字工具在异地执行",
    "setting-onsite": "现场",
    "setting-onsite-desc": "在特定地点实际执行",
    "setting-hybrid": "混合",
    "setting-hybrid-desc": "远程和现场工作的组合",
    "setting-independent": "独立",
    "setting-independent-desc": "灵活执行，无地点限制",
    
    "work-dynamics-label": "工作动态",
    "dynamics-supervised": "受监督",
    "dynamics-supervised-desc": "在监督下指导执行",
    "dynamics-team": "团队",
    "dynamics-team-desc": "多人协作执行",
    "dynamics-solo": "单人",
    "dynamics-solo-desc": "由一个人独立执行",
    "dynamics-simulated": "模拟",
    "dynamics-simulated-desc": "在受控或虚拟环境中执行",
    
    "proof-label": "完成证明",
    "proof-milestones": "里程碑",
    "proof-milestones-desc": "跟踪阶段展示进展",
    "proof-executable": "可执行文件",
    "proof-executable-desc": "交付的程序或运行的软件",
    "proof-assessment": "评估",
    "proof-assessment-desc": "通过测试或评估验证",
    "proof-files": "文件",
    "proof-files-desc": "数字文档或交付物报告",
    
    "instructions-label": "执行说明",
    "instructions-placeholder": "步骤、约束、交付物、环境说明...",
    
    "location-label": "参考位置",
    "location-placeholder": "摩洛哥卡萨布兰卡 或 33.5731,-7.5898",
    "location-hint": "如有需要，添加或选择位置。",
    
    "max-distance-label": "最大距离",
    "max-distance-suffix": "公里",
    
    // Acceptance Criteria page
    "criteria-title": "验收标准",
    "validation-logic-label": "验证逻辑",
    "validation-objective": "客观",
    "validation-objective-desc": "任务达到定义的目标",
    "validation-inspection": "检查",
    "validation-inspection-desc": "根据标准检查",
    "validation-approval": "批准",
    "validation-approval-desc": "需要最终授权",
    "validation-collective": "集体",
    "validation-collective-desc": "由团队验证",
    
    "acceptance-criteria-label": "验收标准",
    "criteria-deadline": "遵守截止日期",
    "criteria-deadline-desc": "使用日程中定义的硬性截止日期",
    "criteria-requirements": "满足要求",
    "criteria-requirements-desc": "基于任务说明和交付物",
    "criteria-quality": "质量分数阈值",
    "criteria-min-score": "最低分数",
    "criteria-min-score-suffix": "%",
    "criteria-client": "需要客户批准",
    "criteria-client-desc": "只有在客户明确验证后才接受任务",
    
    "revision-label": "允许修订",
    "max-attempts-label": "最大次数",
    "revision-hint": "如果允许用户为此任务提交修订，请启用此选项。",
    
    // Payment page
    "payment-title": "报酬与保障",
    "price-label": "任务价格",
    "currency-label": "货币",
    
    "additional-costs-label": "额外费用覆盖",
    "cost-materials": "材料和用品",
    "cost-materials-desc": "客户承担原材料、消耗品或零件",
    "cost-transport": "交通和旅行",
    "cost-transport-desc": "燃料、车票、送货或通勤费用",
    "cost-tools": "工具和设备",
    "cost-tools-desc": "所需设备的租赁或使用",
    "cost-accommodation": "住宿",
    "cost-accommodation-desc": "现场或远程地点的酒店或住宿",
    "cost-fees": "行政/法律费用",
    "cost-fees-desc": "许可证、认证或文件费用",
    
    "reimbursement-label": "报销方式",
    "reimbursement-placeholder": "选择报销方式",
    "reimbursement-reimbursed": "凭证明报销",
    "reimbursement-prepaid": "客户预付",
    "reimbursement-hint": "仅当上面选择了额外费用时适用。",
    
    "guarantees-label": "保障与保护",
    "guarantee-late-penalty": "逾期罚款",
    "guarantee-late-penalty-desc": "如果错过截止日期，减少付款",
    "guarantee-penalty-label": "罚款",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "损坏责任",
    "guarantee-damage-desc": "执行者对执行过程中造成的损坏负责",
    "guarantee-replacement": "更换保证",
    "guarantee-replacement-desc": "执行者必须修复或重做失败的工作",
    
    "payment-model-label": "支付模式",
    "payment-model-fixed": "固定",
    "payment-model-milestone": "按里程碑",
    "payment-model-performance": "基于绩效",
    
    // Buttons
    "btn-previous": "← 上一步",
    "btn-next": "下一步 →",
    "btn-save-draft": "保存草稿",
    "btn-publish": "发布任务",
    "btn-publish-boost": "发布加速任务",
    "coins": "金币"
  },

  de: {
    // Header
    "tasks-header-title": "Neue Aufgabe hinzufügen",
    "tasks-header-description": "Erstellen Sie eine neue Aufgabe, um Arbeit zuzuweisen, Anforderungen zu definieren und Bewerbungen zu erhalten.",
    "tasks-reset-tooltip": "Formular zurücksetzen",
    
    // Navigation steps
    "step-definition": "Aufgabendefinition",
    "step-skills": "Erforderliche Fähigkeiten",
    "step-mode": "Ausführungsbedingungen",
    "step-evaluation": "Abnahmekriterien",
    "step-payment": "Vergütung und Garantien",
    
    // Task Definition page
    "definition-title": "Aufgabendefinition",
    "task-title-label": "Aufgabentitel",
    "task-title-placeholder": "Homepage-Entwurf gestalten",
    "task-description-label": "Aufgabenbeschreibung",
    "task-description-placeholder": "Definieren Sie den Umfang, die Ziele, Einschränkungen und das erwartete Ergebnis der Aufgabe.",
    "work-nature-label": "Arbeitsart",
    "work-nature-placeholder": "Arbeitsart auswählen",
    "work-nature-development": "Entwicklung",
    "work-nature-operations": "Betrieb",
    "work-nature-maintenance": "Wartung",
    "work-nature-support": "Support",
    "work-nature-construction": "Bau",
    "work-nature-consulting": "Beratung",
    "work-nature-repair": "Reparatur",
    "work-nature-creative": "Kreativ",
    "work-nature-audit": "Prüfung",
    "work-nature-other": "Sonstiges",
    
    "category-label": "Aufgabenkategorie",
    "speciality-label": "Aufgabenspezialität",
    
    "task-period-label": "Aufgabenzeitraum",
    "start-date-placeholder": "Aufgabenbeginn",
    "end-date-placeholder": "Aufgabenende",
    "estimated-duration-label": "Geschätzte Dauer",
    "estimated-duration-suffix": "Stunden",
    "time-flexibility-label": "Zeitflexibilität",
    "time-flexible": "Flexibel",
    "time-moderate": "Mäßig",
    "time-strict": "Streng",
    "hard-deadline-label": "Feste Frist",
    
    // Skills page
    "skills-title": "Erforderliche Fähigkeiten",
    "skills-subtitle": "Fertigkeiten",
    "skills-add-tech": "➕ Technische Fähigkeit hinzufügen",
    "languages-subtitle": "Sprachen",
    "languages-add": "➕ Sprache hinzufügen",
    
    // Execution Conditions page
    "conditions-title": "Ausführungsbedingungen",
    "execution-entity-label": "Ausführende Einheit",
    "entity-individual": "Einzelperson",
    "entity-individual-desc": "Einzelperson, die die Aufgabe unabhängig ausführt",
    "entity-professional": "Fachkraft",
    "entity-professional-desc": "Zertifizierter oder erfahrener Spezialist",
    "entity-organization": "Organisation",
    "entity-organization-desc": "Unternehmen, Agentur oder formelle Einheit",
    
    "max-executors-label": "Maximale Ausführende",
    "max-executors-hint": "Steuert, wie viele Ausführende dieser Aufgabe beitreten können",
    
    "task-scale-label": "Aufgabenumfang",
    "scale-micro": "Mikro",
    "scale-micro-desc": "Kleine Aufgabe für 1–2 Personen, einfacher Umfang",
    "scale-standard": "Standard",
    "scale-standard-desc": "Mittlere Komplexität, kann ein kleines Team einbeziehen",
    "scale-project": "Projekt",
    "scale-project-desc": "Große Aufgabe mit mehreren Ausführenden und Phasen",
    
    "work-setting-label": "Arbeitsumgebung",
    "setting-remote": "Remote",
    "setting-remote-desc": "Außerhalb des Standorts mit digitalen Werkzeugen durchgeführt",
    "setting-onsite": "Vor Ort",
    "setting-onsite-desc": "Physisch an einem bestimmten Ort ausgeführt",
    "setting-hybrid": "Hybrid",
    "setting-hybrid-desc": "Kombination aus Remote- und Vor-Ort-Arbeit",
    "setting-independent": "Unabhängig",
    "setting-independent-desc": "Flexible Ausführung ohne Standorteinschränkungen",
    
    "work-dynamics-label": "Arbeitsdynamik",
    "dynamics-supervised": "Überwacht",
    "dynamics-supervised-desc": "Geführte Ausführung unter Aufsicht",
    "dynamics-team": "Team",
    "dynamics-team-desc": "Gemeinsame Ausführung durch mehrere Personen",
    "dynamics-solo": "Allein",
    "dynamics-solo-desc": "Unabhängige Ausführung durch eine Person",
    "dynamics-simulated": "Simuliert",
    "dynamics-simulated-desc": "Ausführung in kontrollierter oder virtueller Umgebung",
    
    "proof-label": "Abschlussnachweis",
    "proof-milestones": "Meilensteine",
    "proof-milestones-desc": "Verfolgte Phasen zeigen Fortschritt",
    "proof-executable": "Ausführbar",
    "proof-executable-desc": "Geliefertes Programm oder laufende Software",
    "proof-assessment": "Bewertung",
    "proof-assessment-desc": "Durch Tests oder Bewertungen validiert",
    "proof-files": "Dateien",
    "proof-files-desc": "Digitale Dokumente oder Berichte zu Liefergegenständen",
    
    "instructions-label": "Ausführungsanweisungen",
    "instructions-placeholder": "Schritte, Einschränkungen, Liefergegenstände, Umgebungsnotizen...",
    
    "location-label": "Referenzstandort",
    "location-placeholder": "Casablanca, Marokko oder 33.5731,-7.5898",
    "location-hint": "Fügen Sie bei Bedarf einen Standort hinzu oder wählen Sie einen aus.",
    
    "max-distance-label": "Maximale Entfernung",
    "max-distance-suffix": "km",
    
    // Acceptance Criteria page
    "criteria-title": "Abnahmekriterien",
    "validation-logic-label": "Validierungslogik",
    "validation-objective": "Objektiv",
    "validation-objective-desc": "Aufgabe erfüllt definierte Ziele",
    "validation-inspection": "Inspektion",
    "validation-inspection-desc": "Geprüft gegen Kriterien",
    "validation-approval": "Genehmigung",
    "validation-approval-desc": "Endgültige Autorisierung erforderlich",
    "validation-collective": "Kollektiv",
    "validation-collective-desc": "Vom Team validiert",
    
    "acceptance-criteria-label": "Abnahmekriterien",
    "criteria-deadline": "Frist eingehalten",
    "criteria-deadline-desc": "Verwendet die im Zeitplan festgelegte feste Frist",
    "criteria-requirements": "Anforderungen erfüllt",
    "criteria-requirements-desc": "Basiert auf Aufgabenanweisungen und Liefergegenständen",
    "criteria-quality": "Qualitätsschwellenwert",
    "criteria-min-score": "Mindestpunktzahl",
    "criteria-min-score-suffix": "%",
    "criteria-client": "Kundengenehmigung erforderlich",
    "criteria-client-desc": "Aufgabe wird erst nach ausdrücklicher Kundenvalidierung akzeptiert",
    
    "revision-label": "Überarbeitung erlauben",
    "max-attempts-label": "Max. Versuche",
    "revision-hint": "Aktivieren Sie dies, wenn Benutzer Überarbeitungen für diese Aufgabe einreichen dürfen.",
    
    // Payment page
    "payment-title": "Vergütung und Garantien",
    "price-label": "Aufgabenpreis",
    "currency-label": "Währung",
    
    "additional-costs-label": "Abdeckung zusätzlicher Kosten",
    "cost-materials": "Materialien und Zubehör",
    "cost-materials-desc": "Kunde übernimmt Rohstoffe, Verbrauchsmaterialien oder Teile",
    "cost-transport": "Transport und Reisen",
    "cost-transport-desc": "Kraftstoff, Tickets, Lieferung oder Pendelkosten",
    "cost-tools": "Werkzeuge und Ausrüstung",
    "cost-tools-desc": "Miete oder Nutzung erforderlicher Ausrüstung",
    "cost-accommodation": "Unterkunft",
    "cost-accommodation-desc": "Hotel oder Unterkunft für Vor-Ort- oder entfernte Standorte",
    "cost-fees": "Verwaltungs-/Rechtsgebühren",
    "cost-fees-desc": "Genehmigungen, Zertifizierungen oder Dokumentationskosten",
    
    "reimbursement-label": "Erstattungsmodus",
    "reimbursement-placeholder": "Erstattungsmodus auswählen",
    "reimbursement-reimbursed": "Erstattung nach Nachweis",
    "reimbursement-prepaid": "Vom Kunden vorausbezahlt",
    "reimbursement-hint": "Gilt nur, wenn oben zusätzliche Kosten ausgewählt wurden.",
    
    "guarantees-label": "Garantien und Schutz",
    "guarantee-late-penalty": "Verspätungsstrafe",
    "guarantee-late-penalty-desc": "Zahlung reduziert, wenn Frist verpasst wird",
    "guarantee-penalty-label": "Strafe",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "Schadenshaftung",
    "guarantee-damage-desc": "Ausführender haftet für während der Ausführung verursachte Schäden",
    "guarantee-replacement": "Ersatzgarantie",
    "guarantee-replacement-desc": "Ausführender muss fehlgeschlagene Arbeit reparieren oder wiederholen",
    
    "payment-model-label": "Zahlungsmodell",
    "payment-model-fixed": "Festpreis",
    "payment-model-milestone": "Meilensteinbasiert",
    "payment-model-performance": "Leistungsbasiert",
    
    // Buttons
    "btn-previous": "← Zurück",
    "btn-next": "Weiter →",
    "btn-save-draft": "Entwurf speichern",
    "btn-publish": "Aufgabe veröffentlichen",
    "btn-publish-boost": "Hervorgehobene Aufgabe veröffentlichen",
    "coins": "Münzen"
  },

  pt: {
    // Header
    "tasks-header-title": "Adicionar Nova Tarefa",
    "tasks-header-description": "Crie uma nova tarefa para atribuir trabalho, definir requisitos e receber candidaturas.",
    "tasks-reset-tooltip": "Redefinir Formulário",
    
    // Navigation steps
    "step-definition": "Definição da Tarefa",
    "step-skills": "Capacidades Requeridas",
    "step-mode": "Condições de Execução",
    "step-evaluation": "Critérios de Aceitação",
    "step-payment": "Compensação e Garantias",
    
    // Task Definition page
    "definition-title": "Definição da Tarefa",
    "task-title-label": "Título da Tarefa",
    "task-title-placeholder": "Projetar maquete da página inicial",
    "task-description-label": "Descrição da Tarefa",
    "task-description-placeholder": "Defina o escopo, objetivos, restrições e resultado esperado da tarefa.",
    "work-nature-label": "Natureza do Trabalho",
    "work-nature-placeholder": "Selecione a natureza do trabalho",
    "work-nature-development": "Desenvolvimento",
    "work-nature-operations": "Operações",
    "work-nature-maintenance": "Manutenção",
    "work-nature-support": "Suporte",
    "work-nature-construction": "Construção",
    "work-nature-consulting": "Consultoria",
    "work-nature-repair": "Reparação",
    "work-nature-creative": "Criativo",
    "work-nature-audit": "Auditoria",
    "work-nature-other": "Outro",
    
    "category-label": "Categoria da Tarefa",
    "speciality-label": "Especialidade da Tarefa",
    
    "task-period-label": "Período da Tarefa",
    "start-date-placeholder": "Início da Tarefa",
    "end-date-placeholder": "Fim da Tarefa",
    "estimated-duration-label": "Duração Estimada",
    "estimated-duration-suffix": "horas",
    "time-flexibility-label": "Flexibilidade de Horário",
    "time-flexible": "Flexível",
    "time-moderate": "Moderada",
    "time-strict": "Rigorosa",
    "hard-deadline-label": "Prazo Final Rigoroso",
    
    // Skills page
    "skills-title": "Capacidades Requeridas",
    "skills-subtitle": "Habilidades",
    "skills-add-tech": "➕ Adicionar Habilidade Técnica",
    "languages-subtitle": "Idiomas",
    "languages-add": "➕ Adicionar Idioma",
    
    // Execution Conditions page
    "conditions-title": "Condições de Execução",
    "execution-entity-label": "Entidade de Execução",
    "entity-individual": "Indivíduo",
    "entity-individual-desc": "Pessoa única executando a tarefa independentemente",
    "entity-professional": "Profissional",
    "entity-professional-desc": "Especialista certificado ou experiente",
    "entity-organization": "Organização",
    "entity-organization-desc": "Empresa, agência ou entidade formal",
    
    "max-executors-label": "Máximo de Executores",
    "max-executors-hint": "Controla quantos executores podem participar desta tarefa",
    
    "task-scale-label": "Escala da Tarefa",
    "scale-micro": "Micro",
    "scale-micro-desc": "Tarefa pequena para 1–2 pessoas, escopo simples",
    "scale-standard": "Padrão",
    "scale-standard-desc": "Complexidade média, pode envolver uma pequena equipa",
    "scale-project": "Projeto",
    "scale-project-desc": "Tarefa grande com múltiplos executores e etapas",
    
    "work-setting-label": "Ambiente de Trabalho",
    "setting-remote": "Remoto",
    "setting-remote-desc": "Realizado fora do local usando ferramentas digitais",
    "setting-onsite": "Presencial",
    "setting-onsite-desc": "Executado fisicamente num local específico",
    "setting-hybrid": "Híbrido",
    "setting-hybrid-desc": "Combinação de trabalho remoto e presencial",
    "setting-independent": "Independente",
    "setting-independent-desc": "Execução flexível sem restrições de local",
    
    "work-dynamics-label": "Dinâmica de Trabalho",
    "dynamics-supervised": "Supervisionado",
    "dynamics-supervised-desc": "Execução guiada sob supervisão",
    "dynamics-team": "Equipa",
    "dynamics-team-desc": "Execução colaborativa por múltiplas pessoas",
    "dynamics-solo": "Individual",
    "dynamics-solo-desc": "Execução independente por uma pessoa",
    "dynamics-simulated": "Simulado",
    "dynamics-simulated-desc": "Execução em ambiente controlado ou virtual",
    
    "proof-label": "Comprovante de Conclusão",
    "proof-milestones": "Marcos",
    "proof-milestones-desc": "Etapas acompanhadas demonstram progresso",
    "proof-executable": "Executável",
    "proof-executable-desc": "Programa entregue ou software em funcionamento",
    "proof-assessment": "Avaliação",
    "proof-assessment-desc": "Validado através de testes ou avaliações",
    "proof-files": "Arquivos",
    "proof-files-desc": "Documentos digitais ou relatórios de entregas",
    
    "instructions-label": "Instruções de Execução",
    "instructions-placeholder": "Passos, restrições, entregas, notas de ambiente...",
    
    "location-label": "Local de Referência",
    "location-placeholder": "Casablanca, Marrocos ou 33.5731,-7.5898",
    "location-hint": "Adicione ou selecione um local se necessário.",
    
    "max-distance-label": "Distância Máxima",
    "max-distance-suffix": "km",
    
    // Acceptance Criteria page
    "criteria-title": "Critérios de Aceitação",
    "validation-logic-label": "Lógica de Validação",
    "validation-objective": "Objetivo",
    "validation-objective-desc": "A tarefa atinge os objetivos definidos",
    "validation-inspection": "Inspeção",
    "validation-inspection-desc": "Verificado de acordo com critérios",
    "validation-approval": "Aprovação",
    "validation-approval-desc": "Autorização final necessária",
    "validation-collective": "Coletivo",
    "validation-collective-desc": "Validado pela equipa",
    
    "acceptance-criteria-label": "Critérios de Aceitação",
    "criteria-deadline": "Prazo respeitado",
    "criteria-deadline-desc": "Usa o prazo rigoroso definido no cronograma",
    "criteria-requirements": "Requisitos cumpridos",
    "criteria-requirements-desc": "Baseado nas instruções da tarefa e entregas",
    "criteria-quality": "Limiar de pontuação de qualidade",
    "criteria-min-score": "Pontuação mínima",
    "criteria-min-score-suffix": "%",
    "criteria-client": "Aprovação do cliente necessária",
    "criteria-client-desc": "A tarefa só é aceite após validação explícita do cliente",
    
    "revision-label": "Permitir Revisão",
    "max-attempts-label": "Máx. vezes",
    "revision-hint": "Ative isto se os utilizadores puderem enviar revisões para esta tarefa.",
    
    // Payment page
    "payment-title": "Compensação e Garantias",
    "price-label": "Preço da Tarefa",
    "currency-label": "Moeda",
    
    "additional-costs-label": "Cobertura de Custos Adicionais",
    "cost-materials": "Materiais e Suprimentos",
    "cost-materials-desc": "Cliente cobre matérias-primas, consumíveis ou peças",
    "cost-transport": "Transporte e Viagens",
    "cost-transport-desc": "Combustível, bilhetes, entrega ou despesas de deslocação",
    "cost-tools": "Ferramentas e Equipamentos",
    "cost-tools-desc": "Aluguer ou uso de equipamento necessário",
    "cost-accommodation": "Alojamento",
    "cost-accommodation-desc": "Hotel ou alojamento para locais presenciais ou remotos",
    "cost-fees": "Taxas Administrativas/Jurídicas",
    "cost-fees-desc": "Licenças, certificações ou custos de documentação",
    
    "reimbursement-label": "Modo de Reembolso",
    "reimbursement-placeholder": "Selecione o modo de reembolso",
    "reimbursement-reimbursed": "Reembolsado após comprovativo",
    "reimbursement-prepaid": "Pré-pago pelo Cliente",
    "reimbursement-hint": "Aplica-se apenas se custos adicionais forem selecionados acima.",
    
    "guarantees-label": "Garantias e Proteções",
    "guarantee-late-penalty": "Penalidade por atraso",
    "guarantee-late-penalty-desc": "Pagamento reduzido se o prazo não for cumprido",
    "guarantee-penalty-label": "Penalidade",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "Responsabilidade por danos",
    "guarantee-damage-desc": "Executor responsável por danos causados durante a execução",
    "guarantee-replacement": "Garantia de substituição",
    "guarantee-replacement-desc": "Executor deve corrigir ou refazer trabalho falhado",
    
    "payment-model-label": "Modelo de Pagamento",
    "payment-model-fixed": "Fixo",
    "payment-model-milestone": "Por Marco",
    "payment-model-performance": "Baseado em Desempenho",
    
    // Buttons
    "btn-previous": "← Anterior",
    "btn-next": "Próximo →",
    "btn-save-draft": "Guardar Rascunho",
    "btn-publish": "Publicar tarefa",
    "btn-publish-boost": "Publicar tarefa impulsionada",
    "coins": "moedas"
  },

  ja: {
    // Header
    "tasks-header-title": "新しいタスクを追加",
    "tasks-header-description": "新しいタスクを作成して、作業の割り当て、要件の定義、申請の受け付けを行います。",
    "tasks-reset-tooltip": "フォームをリセット",
    
    // Navigation steps
    "step-definition": "タスク定義",
    "step-skills": "必要な能力",
    "step-mode": "実行条件",
    "step-evaluation": "合格基準",
    "step-payment": "報酬と保証",
    
    // Task Definition page
    "definition-title": "タスク定義",
    "task-title-label": "タスクタイトル",
    "task-title-placeholder": "ホームページのモックアップをデザイン",
    "task-description-label": "タスク説明",
    "task-description-placeholder": "タスクの範囲、目的、制約、期待される結果を定義します。",
    "work-nature-label": "作業の性質",
    "work-nature-placeholder": "作業の性質を選択",
    "work-nature-development": "開発",
    "work-nature-operations": "運用",
    "work-nature-maintenance": "メンテナンス",
    "work-nature-support": "サポート",
    "work-nature-construction": "建設",
    "work-nature-consulting": "コンサルティング",
    "work-nature-repair": "修理",
    "work-nature-creative": "クリエイティブ",
    "work-nature-audit": "監査",
    "work-nature-other": "その他",
    
    "category-label": "タスクカテゴリー",
    "speciality-label": "タスク専門分野",
    
    "task-period-label": "タスク期間",
    "start-date-placeholder": "タスク開始",
    "end-date-placeholder": "タスク終了",
    "estimated-duration-label": "推定所要時間",
    "estimated-duration-suffix": "時間",
    "time-flexibility-label": "時間の柔軟性",
    "time-flexible": "柔軟",
    "time-moderate": "普通",
    "time-strict": "厳格",
    "hard-deadline-label": "厳格な期限",
    
    // Skills page
    "skills-title": "必要な能力",
    "skills-subtitle": "スキル",
    "skills-add-tech": "➕ 技術スキルを追加",
    "languages-subtitle": "言語",
    "languages-add": "➕ 言語を追加",
    
    // Execution Conditions page
    "conditions-title": "実行条件",
    "execution-entity-label": "実行主体",
    "entity-individual": "個人",
    "entity-individual-desc": "タスクを独立して実行する単独の人物",
    "entity-professional": "専門家",
    "entity-professional-desc": "認定された、または経験豊富な専門家",
    "entity-organization": "組織",
    "entity-organization-desc": "会社、代理店、または正式な団体",
    
    "max-executors-label": "最大実行人数",
    "max-executors-hint": "このタスクに参加できる実行者の数を制御します",
    
    "task-scale-label": "タスク規模",
    "scale-micro": "極小",
    "scale-micro-desc": "1〜2人用の小規模タスク、シンプルな範囲",
    "scale-standard": "標準",
    "scale-standard-desc": "中程度の複雑さ、小規模チームが関与する可能性あり",
    "scale-project": "プロジェクト",
    "scale-project-desc": "複数の実行者と段階を持つ大規模タスク",
    
    "work-setting-label": "作業環境",
    "setting-remote": "リモート",
    "setting-remote-desc": "デジタルツールを使用してオフサイトで実行",
    "setting-onsite": "オンサイト",
    "setting-onsite-desc": "特定の場所で物理的に実行",
    "setting-hybrid": "ハイブリッド",
    "setting-hybrid-desc": "リモートとオンサイト作業の組み合わせ",
    "setting-independent": "独立",
    "setting-independent-desc": "場所の制約なしの柔軟な実行",
    
    "work-dynamics-label": "作業ダイナミクス",
    "dynamics-supervised": "監督下",
    "dynamics-supervised-desc": "監督下でのガイド付き実行",
    "dynamics-team": "チーム",
    "dynamics-team-desc": "複数人による協調実行",
    "dynamics-solo": "単独",
    "dynamics-solo-desc": "一人による独立した実行",
    "dynamics-simulated": "シミュレーション",
    "dynamics-simulated-desc": "制御された、または仮想環境での実行",
    
    "proof-label": "完了証明",
    "proof-milestones": "マイルストーン",
    "proof-milestones-desc": "追跡された段階が進捗を示す",
    "proof-executable": "実行可能ファイル",
    "proof-executable-desc": "納品されたプログラムまたは実行中のソフトウェア",
    "proof-assessment": "評価",
    "proof-assessment-desc": "テストまたは評価によって検証",
    "proof-files": "ファイル",
    "proof-files-desc": "デジタル文書または納品物レポート",
    
    "instructions-label": "実行手順",
    "instructions-placeholder": "手順、制約、納品物、環境メモ...",
    
    "location-label": "参照場所",
    "location-placeholder": "カサブランカ、モロッコ または 33.5731,-7.5898",
    "location-hint": "必要に応じて場所を追加または選択してください。",
    
    "max-distance-label": "最大距離",
    "max-distance-suffix": "km",
    
    // Acceptance Criteria page
    "criteria-title": "合格基準",
    "validation-logic-label": "検証ロジック",
    "validation-objective": "客観的",
    "validation-objective-desc": "タスクが定義された目標を達成",
    "validation-inspection": "検査",
    "validation-inspection-desc": "基準に対してチェック",
    "validation-approval": "承認",
    "validation-approval-desc": "最終承認が必要",
    "validation-collective": "集団的",
    "validation-collective-desc": "チームによって検証",
    
    "acceptance-criteria-label": "合格基準",
    "criteria-deadline": "期限を遵守",
    "criteria-deadline-desc": "スケジュールで定義された厳格な期限を使用",
    "criteria-requirements": "要件を満たした",
    "criteria-requirements-desc": "タスクの指示と納品物に基づく",
    "criteria-quality": "品質スコア閾値",
    "criteria-min-score": "最低スコア",
    "criteria-min-score-suffix": "%",
    "criteria-client": "クライアントの承認が必要",
    "criteria-client-desc": "クライアントの明示的な検証後にのみタスクが受け入れられる",
    
    "revision-label": "修正を許可",
    "max-attempts-label": "最大回数",
    "revision-hint": "ユーザーがこのタスクの修正を提出できる場合は、これを有効にします。",
    
    // Payment page
    "payment-title": "報酬と保証",
    "price-label": "タスク価格",
    "currency-label": "通貨",
    
    "additional-costs-label": "追加費用の負担",
    "cost-materials": "材料と消耗品",
    "cost-materials-desc": "クライアントが原材料、消耗品、または部品を負担",
    "cost-transport": "交通と旅行",
    "cost-transport-desc": "燃料、チケット、配送、または通勤費",
    "cost-tools": "工具と設備",
    "cost-tools-desc": "必要な設備のレンタルまたは使用",
    "cost-accommodation": "宿泊",
    "cost-accommodation-desc": "オンサイトまたはリモート場所のホテルまたは宿泊施設",
    "cost-fees": "管理/法律手数料",
    "cost-fees-desc": "許可証、認証、または書類作成費用",
    
    "reimbursement-label": "払い戻し方法",
    "reimbursement-placeholder": "払い戻し方法を選択",
    "reimbursement-reimbursed": "証明後払い戻し",
    "reimbursement-prepaid": "クライアントが前払い",
    "reimbursement-hint": "上記で追加費用が選択された場合のみ適用されます。",
    
    "guarantees-label": "保証と保護",
    "guarantee-late-penalty": "遅延ペナルティ",
    "guarantee-late-penalty-desc": "期限を過ぎた場合、支払いが減額",
    "guarantee-penalty-label": "ペナルティ",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "損害賠償責任",
    "guarantee-damage-desc": "実行中に生じた損害について実行者が責任を負う",
    "guarantee-replacement": "交換保証",
    "guarantee-replacement-desc": "実行者は失敗した作業を修正またはやり直す必要がある",
    
    "payment-model-label": "支払いモデル",
    "payment-model-fixed": "固定",
    "payment-model-milestone": "マイルストーン",
    "payment-model-performance": "パフォーマンスベース",
    
    // Buttons
    "btn-previous": "← 前へ",
    "btn-next": "次へ →",
    "btn-save-draft": "下書きを保存",
    "btn-publish": "タスクを公開",
    "btn-publish-boost": "ブースト付きで公開",
    "coins": "コイン"
  },

  ru: {
    // Header
    "tasks-header-title": "Добавить новую задачу",
    "tasks-header-description": "Создайте новую задачу, чтобы назначить работу, определить требования и получать заявки.",
    "tasks-reset-tooltip": "Сбросить форму",
    
    // Navigation steps
    "step-definition": "Определение задачи",
    "step-skills": "Необходимые навыки",
    "step-mode": "Условия выполнения",
    "step-evaluation": "Критерии приемки",
    "step-payment": "Оплата и гарантии",
    
    // Task Definition page
    "definition-title": "Определение задачи",
    "task-title-label": "Название задачи",
    "task-title-placeholder": "Дизайн макета главной страницы",
    "task-description-label": "Описание задачи",
    "task-description-placeholder": "Определите объем, цели, ограничения и ожидаемый результат задачи.",
    "work-nature-label": "Характер работы",
    "work-nature-placeholder": "Выберите характер работы",
    "work-nature-development": "Разработка",
    "work-nature-operations": "Операции",
    "work-nature-maintenance": "Обслуживание",
    "work-nature-support": "Поддержка",
    "work-nature-construction": "Строительство",
    "work-nature-consulting": "Консалтинг",
    "work-nature-repair": "Ремонт",
    "work-nature-creative": "Творческая работа",
    "work-nature-audit": "Аудит",
    "work-nature-other": "Другое",
    
    "category-label": "Категория задачи",
    "speciality-label": "Специализация задачи",
    
    "task-period-label": "Период задачи",
    "start-date-placeholder": "Начало задачи",
    "end-date-placeholder": "Окончание задачи",
    "estimated-duration-label": "Предполагаемая длительность",
    "estimated-duration-suffix": "часов",
    "time-flexibility-label": "Гибкость времени",
    "time-flexible": "Гибкий",
    "time-moderate": "Умеренный",
    "time-strict": "Строгий",
    "hard-deadline-label": "Жесткий дедлайн",
    
    // Skills page
    "skills-title": "Необходимые навыки",
    "skills-subtitle": "Навыки",
    "skills-add-tech": "➕ Добавить технический навык",
    "languages-subtitle": "Языки",
    "languages-add": "➕ Добавить язык",
    
    // Execution Conditions page
    "conditions-title": "Условия выполнения",
    "execution-entity-label": "Исполнитель",
    "entity-individual": "Частное лицо",
    "entity-individual-desc": "Один человек, выполняющий задачу самостоятельно",
    "entity-professional": "Профессионал",
    "entity-professional-desc": "Сертифицированный или опытный специалист",
    "entity-organization": "Организация",
    "entity-organization-desc": "Компания, агентство или официальное лицо",
    
    "max-executors-label": "Максимум исполнителей",
    "max-executors-hint": "Определяет, сколько исполнителей может присоединиться к этой задаче",
    
    "task-scale-label": "Масштаб задачи",
    "scale-micro": "Микро",
    "scale-micro-desc": "Небольшая задача для 1-2 человек, простой объем",
    "scale-standard": "Стандартный",
    "scale-standard-desc": "Средняя сложность, может включать небольшую команду",
    "scale-project": "Проект",
    "scale-project-desc": "Крупная задача с несколькими исполнителями и этапами",
    
    "work-setting-label": "Условия работы",
    "setting-remote": "Удаленно",
    "setting-remote-desc": "Выполняется вне офиса с использованием цифровых инструментов",
    "setting-onsite": "На месте",
    "setting-onsite-desc": "Выполняется физически в определенном месте",
    "setting-hybrid": "Гибридный",
    "setting-hybrid-desc": "Сочетание удаленной работы и работы на месте",
    "setting-independent": "Независимый",
    "setting-independent-desc": "Гибкое выполнение без ограничений по месту",
    
    "work-dynamics-label": "Динамика работы",
    "dynamics-supervised": "Под наблюдением",
    "dynamics-supervised-desc": "Направляемое выполнение под контролем",
    "dynamics-team": "Команда",
    "dynamics-team-desc": "Совместное выполнение несколькими людьми",
    "dynamics-solo": "Индивидуально",
    "dynamics-solo-desc": "Независимое выполнение одним человеком",
    "dynamics-simulated": "Симуляция",
    "dynamics-simulated-desc": "Выполнение в контролируемой или виртуальной среде",
    
    "proof-label": "Подтверждение выполнения",
    "proof-milestones": "Этапы",
    "proof-milestones-desc": "Отслеживаемые этапы демонстрируют прогресс",
    "proof-executable": "Исполняемый файл",
    "proof-executable-desc": "Поставленная программа или работающее ПО",
    "proof-assessment": "Оценка",
    "proof-assessment-desc": "Проверено с помощью тестов или оценок",
    "proof-files": "Файлы",
    "proof-files-desc": "Цифровые документы или отчеты о результатах",
    
    "instructions-label": "Инструкции по выполнению",
    "instructions-placeholder": "Шаги, ограничения, результаты, заметки по среде...",
    
    "location-label": "Базовое местоположение",
    "location-placeholder": "Касабланка, Марокко или 33.5731,-7.5898",
    "location-hint": "Добавьте или выберите местоположение при необходимости.",
    
    "max-distance-label": "Максимальное расстояние",
    "max-distance-suffix": "км",
    
    // Acceptance Criteria page
    "criteria-title": "Критерии приемки",
    "validation-logic-label": "Логика проверки",
    "validation-objective": "Объективный",
    "validation-objective-desc": "Задача достигает поставленных целей",
    "validation-inspection": "Инспекция",
    "validation-inspection-desc": "Проверено по критериям",
    "validation-approval": "Утверждение",
    "validation-approval-desc": "Требуется окончательное разрешение",
    "validation-collective": "Коллективный",
    "validation-collective-desc": "Проверено командой",
    
    "acceptance-criteria-label": "Критерии приемки",
    "criteria-deadline": "Соблюдение срока",
    "criteria-deadline-desc": "Использует жесткий дедлайн, указанный в расписании",
    "criteria-requirements": "Требования выполнены",
    "criteria-requirements-desc": "На основе инструкций к задаче и результатов",
    "criteria-quality": "Порог качества",
    "criteria-min-score": "Минимальный балл",
    "criteria-min-score-suffix": "%",
    "criteria-client": "Требуется одобрение клиента",
    "criteria-client-desc": "Задача принимается только после явного подтверждения клиентом",
    
    "revision-label": "Разрешить доработку",
    "max-attempts-label": "Макс. раз",
    "revision-hint": "Включите это, если пользователям разрешено отправлять доработки для этой задачи.",
    
    // Payment page
    "payment-title": "Оплата и гарантии",
    "price-label": "Цена задачи",
    "currency-label": "Валюта",
    
    "additional-costs-label": "Покрытие дополнительных расходов",
    "cost-materials": "Материалы и принадлежности",
    "cost-materials-desc": "Клиент покрывает сырье, расходные материалы или детали",
    "cost-transport": "Транспорт и поездки",
    "cost-transport-desc": "Топливо, билеты, доставка или расходы на дорогу",
    "cost-tools": "Инструменты и оборудование",
    "cost-tools-desc": "Аренда или использование необходимого оборудования",
    "cost-accommodation": "Проживание",
    "cost-accommodation-desc": "Отель или жилье для работы на месте или удаленно",
    "cost-fees": "Административные/юридические сборы",
    "cost-fees-desc": "Разрешения, сертификации или расходы на документацию",
    
    "reimbursement-label": "Способ возмещения",
    "reimbursement-placeholder": "Выберите способ возмещения",
    "reimbursement-reimbursed": "Возмещение после подтверждения",
    "reimbursement-prepaid": "Предоплата клиентом",
    "reimbursement-hint": "Применяется только если выбраны дополнительные расходы выше.",
    
    "guarantees-label": "Гарантии и защита",
    "guarantee-late-penalty": "Штраф за просрочку",
    "guarantee-late-penalty-desc": "Уменьшение оплаты при пропуске срока",
    "guarantee-penalty-label": "Штраф",
    "guarantee-penalty-suffix": "%",
    "guarantee-damage": "Ответственность за ущерб",
    "guarantee-damage-desc": "Исполнитель несет ответственность за ущерб, причиненный во время выполнения",
    "guarantee-replacement": "Гарантия замены",
    "guarantee-replacement-desc": "Исполнитель должен исправить или переделать неудачную работу",
    
    "payment-model-label": "Модель оплаты",
    "payment-model-fixed": "Фиксированная",
    "payment-model-milestone": "По этапам",
    "payment-model-performance": "По результатам",
    
    // Buttons
    "btn-previous": "← Назад",
    "btn-next": "Далее →",
    "btn-save-draft": "Сохранить черновик",
    "btn-publish": "Опубликовать задачу",
    "btn-publish-boost": "Опубликовать с продвижением",
    "coins": "монеты"
  }
  
};
function taskForm_translatePage(lang) {
  const t = taskForm_translations[lang] || taskForm_translations['en'];
  
  const header = document.querySelector('#taskPage .nt-header');
  if (header) {
    const h2 = header.querySelector('h2');
    const p = header.querySelector('p');
    const resetBtn = header.querySelector('#cleanTask');
    const draftButton = document.getElementById('saveDraft');
    
    if (h2) h2.textContent = t["tasks-header-title"];
    if (p) p.textContent = t["tasks-header-description"];
    if (resetBtn) resetBtn.title = t["tasks-reset-tooltip"];
    if (draftButton) draftButton.title = t["btn-save-draft"];
  }

  const navButtons = document.querySelectorAll('#taskPage .horizontal-newTask button');
  if (navButtons.length >= 5) {
    navButtons[0].querySelector('.step-label').textContent = t["step-definition"];
    navButtons[1].querySelector('.step-label').textContent = t["step-skills"];
    navButtons[2].querySelector('.step-label').textContent = t["step-mode"];
    navButtons[3].querySelector('.step-label').textContent = t["step-evaluation"];
    navButtons[4].querySelector('.step-label').textContent = t["step-payment"];
  }

  const taskIdentity = document.getElementById('taskIdentity');
  if (taskIdentity) {
    const section = taskIdentity.querySelector('section');
    if (section) {
      const h2 = section.querySelector('h2');
      if (h2) h2.textContent = t["definition-title"];

      const titleLabel = section.querySelector('label[for="task_title"]');
      const titleInput = section.querySelector('#task_title');
      if (titleLabel) titleLabel.textContent = t["task-title-label"];
      if (titleInput) titleInput.placeholder = t["task-title-placeholder"];
      
      const descLabel = section.querySelector('label[for="task_goal"]');
      const descTextarea = section.querySelector('#task_goal');
      if (descLabel) descLabel.textContent = t["task-description-label"];
      if (descTextarea) descTextarea.placeholder = t["task-description-placeholder"];
      
      const natureLabel = section.querySelector('label[for="task_type"]');
      const natureSelect = section.querySelector('#task_type');
      if (natureLabel) natureLabel.textContent = t["work-nature-label"];
      if (natureSelect) {
        const options = natureSelect.querySelectorAll('option');
        if (options.length > 0) {
          options[0].textContent = t["work-nature-placeholder"];
          if (options.length > 1) options[1].textContent = t["work-nature-development"];
          if (options.length > 2) options[2].textContent = t["work-nature-operations"];
          if (options.length > 3) options[3].textContent = t["work-nature-maintenance"];
          if (options.length > 4) options[4].textContent = t["work-nature-support"];
          if (options.length > 5) options[5].textContent = t["work-nature-construction"];
          if (options.length > 6) options[6].textContent = t["work-nature-consulting"];
          if (options.length > 7) options[7].textContent = t["work-nature-repair"];
          if (options.length > 8) options[8].textContent = t["work-nature-creative"];
          if (options.length > 9) options[9].textContent = t["work-nature-audit"];
          if (options.length > 10) options[10].textContent = t["work-nature-other"];
        }
      }
      
      const categoryLabel = section.querySelector('label[for="task_industry"]');
      if (categoryLabel) categoryLabel.textContent = t["category-label"];
      const specialityLabel = section.querySelector('label[for="task_speciality"]');
      if (specialityLabel) specialityLabel.textContent = t["speciality-label"];
      
      const selectedIndustry = document.getElementById("task_industry")?.value;
      const selectedSpeciality = document.getElementById("task_speciality")?.value;
      loadIndustries("task_industry", selectedIndustry);
      loadSpecialties("task_speciality", selectedSpeciality);
      
      const periodLabel = section.querySelector('label[for="task_start_date"]');
      if (periodLabel) periodLabel.textContent = t["task-period-label"];
      
      const startDate = section.querySelector('#task_start_date');
      const endDate = section.querySelector('#task_end_date');
      if (startDate) startDate.placeholder = t["start-date-placeholder"];
      if (endDate) endDate.placeholder = t["end-date-placeholder"];
      
      const durationLabel = section.querySelector('label[for="task_estimated_duration"]');
      const durationInput = section.querySelector('#task_estimated_duration');
      const durationSpan = section.querySelector('.navCard-percentInput span');
      if (durationLabel) durationLabel.textContent = t["estimated-duration-label"];
      if (durationInput) durationInput.placeholder = "10";
      if (durationSpan) durationSpan.textContent = t["estimated-duration-suffix"];

      const flexibilityLabel = section.querySelector('label[for="task_time_flexibility"]');
      if (flexibilityLabel) flexibilityLabel.textContent = t["time-flexibility-label"];
      const flexibilityLabels = section.querySelectorAll('#task_time_flexibility > label');
      if (flexibilityLabels.length >= 3) {
        flexibilityLabels[0].textContent = t["time-flexible"];
        flexibilityLabels[1].textContent = t["time-moderate"];
        flexibilityLabels[2].textContent = t["time-strict"];
      }

      const deadlineLabel = section.querySelector('label[for="task_hard_deadline"]');
      const deadlineInput = section.querySelector('#task_hard_deadline');
      if (deadlineLabel) deadlineLabel.textContent = t["hard-deadline-label"];
      if (deadlineInput) deadlineInput.placeholder = t["hard-deadline-label"];
    }
  }

  const taskSkills = document.getElementById('taskSkills');
  if (taskSkills) {
    const h2 = taskSkills.querySelector('section > h2');
    if (h2) h2.textContent = t["skills-title"];
    
    const h3Elements = taskSkills.querySelectorAll('h3');
    if (h3Elements.length >= 2) {
      h3Elements[0].textContent = t["skills-subtitle"];
      h3Elements[1].textContent = t["languages-subtitle"];
    }
    
    const addSkillBtn = document.getElementById('taskAddSkill');
    const addLangBtn = document.getElementById('taskAddLang');
    if (addSkillBtn) addSkillBtn.textContent = t["skills-add-tech"];
    if (addLangBtn) addLangBtn.textContent = t["languages-add"];
  }

  const taskMode = document.getElementById('taskMode');
  if (taskMode) {
    const h2 = taskMode.querySelector('section > h2');
    if (h2) h2.textContent = t["conditions-title"];

    const entityLabel = taskMode.querySelector('label[for="task_entity"]');
    if (entityLabel) entityLabel.textContent = t["execution-entity-label"];
    const entityStrongs = taskMode.querySelectorAll('.inputRadio3-description strong');
    if (entityStrongs.length >= 3) {
      entityStrongs[0].textContent = t["entity-individual"];
      entityStrongs[1].textContent = t["entity-professional"];
      entityStrongs[2].textContent = t["entity-organization"];
    }
    const entitySpans = taskMode.querySelectorAll('.inputRadio3-description span');
    if (entitySpans.length >= 3) {
      entitySpans[0].textContent = t["entity-individual-desc"];
      entitySpans[1].textContent = t["entity-professional-desc"];
      entitySpans[2].textContent = t["entity-organization-desc"];
    }
    
    const maxExecutorsLabel = taskMode.querySelector('label[for="task_max_executors"]');
    const maxExecutorsHint = taskMode.querySelector('small[for="task_max_executors"]');
    if (maxExecutorsLabel) maxExecutorsLabel.textContent = t["max-executors-label"];
    if (maxExecutorsHint) maxExecutorsHint.textContent = t["max-executors-hint"];

    const scaleLabel = taskMode.querySelector('label[for="task_scale"]');
    if (scaleLabel) scaleLabel.textContent = t["task-scale-label"];

    const scaleLabels = taskMode.querySelectorAll('#task_scale > label');
    const scaleSmalls = taskMode.querySelectorAll('#task_scale > label > small');

    if (scaleLabels.length >= 3) {
      const scaleText0 = scaleLabels[0].childNodes[0];
      const scaleText1 = scaleLabels[1].childNodes[0];
      const scaleText2 = scaleLabels[2].childNodes[0];
      
      if (scaleText0) scaleText0.textContent = t["scale-micro"];
      if (scaleText1) scaleText1.textContent = t["scale-standard"];
      if (scaleText2) scaleText2.textContent = t["scale-project"];
    }

    if (scaleSmalls.length >= 3) {
      scaleSmalls[0].textContent = t["scale-micro-desc"];
      scaleSmalls[1].textContent = t["scale-standard-desc"];
      scaleSmalls[2].textContent = t["scale-project-desc"];
    }

    const settingLabel = taskMode.querySelector('label[for="task_execution_mode"]');
    if (settingLabel) settingLabel.textContent = t["work-setting-label"];

    const settingLabels = taskMode.querySelectorAll('#task_execution_mode > label');
    const settingSmalls = taskMode.querySelectorAll('#task_execution_mode > label > small');

    if (settingLabels.length >= 4) {
      const settingText0 = settingLabels[0].childNodes[0];
      const settingText1 = settingLabels[1].childNodes[0];
      const settingText2 = settingLabels[2].childNodes[0];
      const settingText3 = settingLabels[3].childNodes[0];
      
      if (settingText0) settingText0.textContent = t["setting-remote"];
      if (settingText1) settingText1.textContent = t["setting-onsite"];
      if (settingText2) settingText2.textContent = t["setting-hybrid"];
      if (settingText3) settingText3.textContent = t["setting-independent"];
    }

    if (settingSmalls.length >= 4) {
      settingSmalls[0].textContent = t["setting-remote-desc"];
      settingSmalls[1].textContent = t["setting-onsite-desc"];
      settingSmalls[2].textContent = t["setting-hybrid-desc"];
      settingSmalls[3].textContent = t["setting-independent-desc"];
    }

    const dynamicsLabel = taskMode.querySelector('label[for="task_execution_engine"]');
    if (dynamicsLabel) dynamicsLabel.textContent = t["work-dynamics-label"];

    const dynamicsLabels = taskMode.querySelectorAll('#task_execution_engine > label');
    const dynamicsSmalls = taskMode.querySelectorAll('#task_execution_engine > label > small');

    if (dynamicsLabels.length >= 4) {
      const dynamicsText0 = dynamicsLabels[0].childNodes[0];
      const dynamicsText1 = dynamicsLabels[1].childNodes[0];
      const dynamicsText2 = dynamicsLabels[2].childNodes[0];
      const dynamicsText3 = dynamicsLabels[3].childNodes[0];
      
      if (dynamicsText0) dynamicsText0.textContent = t["dynamics-supervised"];
      if (dynamicsText1) dynamicsText1.textContent = t["dynamics-team"];
      if (dynamicsText2) dynamicsText2.textContent = t["dynamics-solo"];
      if (dynamicsText3) dynamicsText3.textContent = t["dynamics-simulated"];
    }

    if (dynamicsSmalls.length >= 4) {
      dynamicsSmalls[0].textContent = t["dynamics-supervised-desc"];
      dynamicsSmalls[1].textContent = t["dynamics-team-desc"];
      dynamicsSmalls[2].textContent = t["dynamics-solo-desc"];
      dynamicsSmalls[3].textContent = t["dynamics-simulated-desc"];
    }

    const proofLabel = taskMode.querySelector('label[for="task_submission_type"]');
    if (proofLabel) proofLabel.textContent = t["proof-label"];

    const proofLabels = taskMode.querySelectorAll('#task_submission_type > label');
    const proofSmalls = taskMode.querySelectorAll('#task_submission_type > label > small');

    if (proofLabels.length >= 4) {
      const proofText0 = proofLabels[0].childNodes[0];
      const proofText1 = proofLabels[1].childNodes[0];
      const proofText2 = proofLabels[2].childNodes[0];
      const proofText3 = proofLabels[3].childNodes[0];
      
      if (proofText0) proofText0.textContent = t["proof-milestones"];
      if (proofText1) proofText1.textContent = t["proof-executable"];
      if (proofText2) proofText2.textContent = t["proof-assessment"];
      if (proofText3) proofText3.textContent = t["proof-files"];
    }

    if (proofSmalls.length >= 4) {
      proofSmalls[0].textContent = t["proof-milestones-desc"];
      proofSmalls[1].textContent = t["proof-executable-desc"];
      proofSmalls[2].textContent = t["proof-assessment-desc"];
      proofSmalls[3].textContent = t["proof-files-desc"];
    }
    
    const instructionsLabel = taskMode.querySelector('label[for="task_instructions"]');
    const instructionsTextarea = taskMode.querySelector('#task_instructions');
    if (instructionsLabel) instructionsLabel.textContent = t["instructions-label"];
    if (instructionsTextarea) instructionsTextarea.placeholder = t["instructions-placeholder"];
    
    const locationLabel = taskMode.querySelector('label[for="task_location"]');
    const locationInput = taskMode.querySelector('#task_location');
    const locationHint = taskMode.querySelectorAll('.navCard-inputHint')[1];
    if (locationLabel) locationLabel.textContent = t["location-label"];
    if (locationInput) locationInput.placeholder = t["location-placeholder"];
    if (locationHint) locationHint.textContent = t["location-hint"];
    
    const distanceLabel = taskMode.querySelector('label[for="task_max_distance_km"]');
    const distanceSpan = taskMode.querySelectorAll('.navCard-percentInput span')[1];
    if (distanceLabel) distanceLabel.textContent = t["max-distance-label"];
    if (distanceSpan) distanceSpan.textContent = t["max-distance-suffix"];
  }
  
  const taskEvaluation = document.getElementById('taskEvaluation');
  if (taskEvaluation) {
    const h2 = taskEvaluation.querySelector('section > h2');
    if (h2) h2.textContent = t["criteria-title"];
    
    const validationLabel = taskEvaluation.querySelector('label[for="task_evaluation_method"]');
    if (validationLabel) validationLabel.textContent = t["validation-logic-label"];

    const validationLabels = taskEvaluation.querySelectorAll('#task_evaluation_method > label');
    const validationSmalls = taskEvaluation.querySelectorAll('#task_evaluation_method > label > small');

    if (validationLabels.length >= 4) {
      const valText0 = validationLabels[0].childNodes[0];
      const valText1 = validationLabels[1].childNodes[0];
      const valText2 = validationLabels[2].childNodes[0];
      const valText3 = validationLabels[3].childNodes[0];
      
      if (valText0) valText0.textContent = t["validation-objective"];
      if (valText1) valText1.textContent = t["validation-inspection"];
      if (valText2) valText2.textContent = t["validation-approval"];
      if (valText3) valText3.textContent = t["validation-collective"];
    }

    if (validationSmalls.length >= 4) {
      validationSmalls[0].textContent = t["validation-objective-desc"];
      validationSmalls[1].textContent = t["validation-inspection-desc"];
      validationSmalls[2].textContent = t["validation-approval-desc"];
      validationSmalls[3].textContent = t["validation-collective-desc"];
    }

    const criteriaContainer = document.getElementById("task_acceptance_criteria");
    if (!criteriaContainer) return;
    const criteriaGroup = criteriaContainer.closest(".criteria-inputGroup");
    const label = criteriaGroup?.querySelector(".Label");

    if (label) {
      label.textContent = t["acceptance-criteria-label"];
    }

    const criteriaItems = criteriaContainer.querySelectorAll('.criteria-item');

    if (criteriaItems.length >= 4) {
      const deadlineStrong = criteriaItems[0].querySelector('strong');
      const deadlineSpan = criteriaItems[0].querySelector('span');

      if (deadlineStrong) deadlineStrong.textContent = t["criteria-deadline"];
      if (deadlineSpan) deadlineSpan.textContent = t["criteria-deadline-desc"];

      const reqStrong = criteriaItems[1].querySelector('strong');
      const reqSpan = criteriaItems[1].querySelector('span');

      if (reqStrong) reqStrong.textContent = t["criteria-requirements"];
      if (reqSpan) reqSpan.textContent = t["criteria-requirements-desc"];

      const qualityStrong = criteriaItems[2].querySelector('strong');
      const qualityInline = criteriaItems[2].querySelector('.criteria-inline');

      if (qualityStrong) qualityStrong.textContent = t["criteria-quality"];

      if (qualityInline) {
        qualityInline.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = t["criteria-min-score"] + ' ';
          }
        });

        const percentText = qualityInline.lastChild;
        if (percentText && percentText.nodeType === Node.TEXT_NODE) {
          percentText.textContent = t["criteria-min-score-suffix"];
        }
      }

      const clientStrong = criteriaItems[3].querySelector('strong');
      const clientSpan = criteriaItems[3].querySelector('span');

      if (clientStrong) clientStrong.textContent = t["criteria-client"];
      if (clientSpan) clientSpan.textContent = t["criteria-client-desc"];
    }
    
    const revisionLabel = taskEvaluation.querySelector('label[for="revision_allowed"]');
    const maxAttemptsSpan = taskEvaluation.querySelector('.navCard-percentInput span');
    const revisionHint = taskEvaluation.querySelector('.navCard-inputHint');
    if (revisionLabel) revisionLabel.textContent = t["revision-label"];
    if (maxAttemptsSpan) maxAttemptsSpan.textContent = t["max-attempts-label"];
    if (revisionHint) revisionHint.textContent = t["revision-hint"];
  }
  
  const taskPayment = document.getElementById('taskPayment');
  if (taskPayment) {
    const h2 = taskPayment.querySelector('section > h2');
    if (h2) h2.textContent = t["payment-title"];
    
    const priceLabel = taskPayment.querySelector('label[for="task_price"]');
    const currencyLabel = taskPayment.querySelector('label[for="task_priceCurrency"]');
    if (priceLabel) priceLabel.textContent = t["price-label"];
    if (currencyLabel) currencyLabel.textContent = t["currency-label"];
    
    const costsLabel = taskPayment.querySelectorAll('.criteria-inputGroup .Label')[0];
    if (costsLabel) costsLabel.textContent = t["additional-costs-label"];
    
    const costItems = taskPayment.querySelectorAll('.criteria-item');
    if (costItems.length >= 5) {
      const materialsStrong = costItems[0].querySelector('strong');
      const materialsSpan = costItems[0].querySelector('span');
      if (materialsStrong) materialsStrong.textContent = t["cost-materials"];
      if (materialsSpan) materialsSpan.textContent = t["cost-materials-desc"];
      
      const transportStrong = costItems[1].querySelector('strong');
      const transportSpan = costItems[1].querySelector('span');
      if (transportStrong) transportStrong.textContent = t["cost-transport"];
      if (transportSpan) transportSpan.textContent = t["cost-transport-desc"];
      
      const toolsStrong = costItems[2].querySelector('strong');
      const toolsSpan = costItems[2].querySelector('span');
      if (toolsStrong) toolsStrong.textContent = t["cost-tools"];
      if (toolsSpan) toolsSpan.textContent = t["cost-tools-desc"];
      
      const accomStrong = costItems[3].querySelector('strong');
      const accomSpan = costItems[3].querySelector('span');
      if (accomStrong) accomStrong.textContent = t["cost-accommodation"];
      if (accomSpan) accomSpan.textContent = t["cost-accommodation-desc"];
      
      const feesStrong = costItems[4].querySelector('strong');
      const feesSpan = costItems[4].querySelector('span');
      if (feesStrong) feesStrong.textContent = t["cost-fees"];
      if (feesSpan) feesSpan.textContent = t["cost-fees-desc"];
    }
    
    const reimbursementLabel = taskPayment.querySelector('label[for="task_reimbursement_mode"]');
    const reimbursementSelect = taskPayment.querySelector('#task_reimbursement_mode');
    const reimbursementHint = taskPayment.querySelectorAll('.navCard-inputHint')[0];
    if (reimbursementLabel) reimbursementLabel.textContent = t["reimbursement-label"];
    if (reimbursementHint) reimbursementHint.textContent = t["reimbursement-hint"];
    if (reimbursementSelect) {
      const options = reimbursementSelect.querySelectorAll('option');
      if (options.length > 0) {
        options[0].textContent = t["reimbursement-placeholder"];
        if (options.length > 1) options[1].textContent = t["reimbursement-reimbursed"];
        if (options.length > 2) options[2].textContent = t["reimbursement-prepaid"];
      }
    }
    
    const guaranteesLabel = taskPayment.querySelectorAll('.criteria-inputGroup .Label')[1];
    if (guaranteesLabel) guaranteesLabel.textContent = t["guarantees-label"];
    
    const guaranteeItems = taskPayment.querySelectorAll('.criteria-list .criteria-item');
    const startIndex = 5; // After the 5 cost items
    if (guaranteeItems.length >= startIndex + 3) {
      const penaltyStrong = guaranteeItems[startIndex].querySelector('strong');
      const penaltySpan = guaranteeItems[startIndex].querySelector('span');
      const penaltyInline = guaranteeItems[startIndex].querySelector('.criteria-inline');
      if (penaltyStrong) penaltyStrong.textContent = t["guarantee-late-penalty"];
      if (penaltySpan) penaltySpan.textContent = t["guarantee-late-penalty-desc"];
      if (penaltyInline) {
        const textNode = penaltyInline.childNodes[0];
        if (textNode) textNode.textContent = t["guarantee-penalty-label"] + ':';
        const percentSpan = penaltyInline.querySelector('span');
        if (percentSpan) percentSpan.textContent = t["guarantee-penalty-suffix"];
      }
      
      const damageStrong = guaranteeItems[startIndex + 1].querySelector('strong');
      const damageSpan = guaranteeItems[startIndex + 1].querySelector('span');
      if (damageStrong) damageStrong.textContent = t["guarantee-damage"];
      if (damageSpan) damageSpan.textContent = t["guarantee-damage-desc"];
      
      const replaceStrong = guaranteeItems[startIndex + 2].querySelector('strong');
      const replaceSpan = guaranteeItems[startIndex + 2].querySelector('span');
      if (replaceStrong) replaceStrong.textContent = t["guarantee-replacement"];
      if (replaceSpan) replaceSpan.textContent = t["guarantee-replacement-desc"];
    }
    
    const paymentModelLabel = taskPayment.querySelector('label[for="task_payment_model"]');
    const paymentModelSelect = taskPayment.querySelector('#task_payment_model');
    if (paymentModelLabel) paymentModelLabel.textContent = t["payment-model-label"];
    if (paymentModelSelect) {
      const options = paymentModelSelect.querySelectorAll('option');
      if (options.length >= 3) {
        options[0].textContent = t["payment-model-fixed"];
        options[1].textContent = t["payment-model-milestone"];
        options[2].textContent = t["payment-model-performance"];
      }
    }
  }
  
  const prevButtons = document.querySelectorAll('.prevStep');
  const nextButtons = document.querySelectorAll('.nextStep');
  const publishButton = document.getElementById('publishTask');
  const boostButton = document.getElementById('boostTask');
  
  prevButtons.forEach(btn => {
    btn.textContent = t["btn-previous"];
  });
  
  nextButtons.forEach(btn => {
    btn.textContent = t["btn-next"];
  });
  
  if (publishButton) {
    const span = publishButton.querySelector('.btn-content span');
    const small = publishButton.querySelector('small');

    if (span) span.textContent = t["btn-publish"];
    if (small) small.innerHTML = `<i class="ri-coin-fill"></i> 10 ${t["coins"]}`;
  }

  if (boostButton) {
    const span = boostButton.querySelector('.btn-content span');
    const small = boostButton.querySelector('small');

    if (span) span.textContent = t["btn-publish-boost"];
    if (small) small.innerHTML = `<i class="ri-coin-fill"></i> 15 ${t["coins"]}`;
  }
}

const jobForm_translations = {
  en: {
    "header-title": "Add New Job Offer",
    "header-subtitle": "Create a new job offer to define requirements, assign work, and receive applications.",
    "clear-fields": "Clear all fields",
    "save-draft": "Save as draft",

    "step-definition": "Job Definition",
    "step-skills": "Required Capabilities",
    "step-mode": "Work Conditions",
    "step-evaluation": "Evaluation & Expectations",
    "step-payment": "Compensation & Benefits",

    "job-definition": "Job Definition",
    "job-title": "Job Title",
    "job-title-placeholder": "Frontend Developer...",
    "job-description": "Job Description",
    "job-description-placeholder": "Describe the role...",
    "job-industry": "Industry",
    "job-speciality": "Speciality",
    "job-timeline": "Employment Timeline",
    "application-deadline": "Application Deadline",

    "skills-title": "Required Capabilities",
    "skills": "Skills",
    "languages": "Languages",
    "add-skill": "➕ Add Skill",
    "add-language": "➕ Add Language",

    "work-conditions": "Work Conditions",
    "seniority": "Seniority Level",
    "junior": "Junior",
    "mid": "Mid-level",
    "senior": "Senior",
    "lead": "Lead",
    "junior-desc": "Entry-level, requires guidance and support",
    "mid-desc": "Works independently with solid experience",
    "senior-desc": "Expert, handles complex tasks and decisions",
    "lead-desc": "Leads projects, mentors team members",
    "positions": "Number of positions",
    "positions-hint": "Defines how many candidates can be hired for this role",
    "work-setting": "Work Setting",
    "remote": "Remote",
    "onsite": "On-site",
    "hybrid": "Hybrid",
    "remote-desc": "Work performed remotely using digital tools",
    "onsite-desc": "Work performed at a physical location",
    "hybrid-desc": "Mix of remote and on-site work",
    "location": "Reference Location",
    "location-hint": "Add or select a location if needed",
    "distance": "Maximum Distance",

    "evaluation": "Evaluation & Expectations",
    "evaluation-method": "Evaluation Method",
    "manager": "Manager Review",
    "kpi": "KPI-Based",
    "peer": "Peer Review",
    "probation": "Probation Period",
    "manager-desc": "Evaluated by supervisor or manager",
    "kpi-desc": "Measured using defined performance metrics",
    "peer-desc": "Feedback from team members",
    "probation-desc": "Evaluated during initial trial period",

    "performance-criteria": "Performance Criteria",
    "criteria-commitment": "Commitment & reliability",
    "criteria-commitment-desc": "Consistent attendance and engagement",
    "criteria-objectives": "Objectives achieved",
    "criteria-objectives-desc": "Meets assigned goals and responsibilities",
    "criteria-performance": "Performance level",
    "criteria-team": "Team collaboration",
    "criteria-team-desc": "Works effectively within the team",
    "minimum-rating": "Minimum rating:",

    "payment": "Compensation & Benefits",
    "employment-type": "Employment Type",
    "employment-select": "Select type",
    "employment-full": "Full-time",
    "employment-part": "Part-time",
    "employment-contract": "Contract",
    "employment-intern": "Internship",

    "salary": "Salary Range",
    "currency": "Currency",
    "currency-select": "Select currency",
    "negotiable": "Negotiable",
    "benefits": "Benefits & Perks",

    "benefit-health": "Health coverage",
    "benefit-health-desc": "Insurance or medical support",
    "benefit-transport": "Transport support",
    "benefit-transport-desc": "Commute or travel assistance",
    "benefit-equipment": "Equipment provided",
    "benefit-equipment-desc": "Laptop, tools, or resources",
    "benefit-remote": "Remote flexibility",
    "benefit-remote-desc": "Work-from-home options",
    "benefit-bonus": "Bonuses",
    "benefit-bonus-desc": "Performance or annual bonuses",

    "publish": "Publish Job",
    "boost": "Publish Boosted Job",

    "previous": "← Previous",
    "next": "Next →"
  },

  fr: {
    "header-title": "Ajouter une nouvelle offre d'emploi",
    "header-subtitle": "Créez une nouvelle offre d'emploi pour définir les exigences, attribuer le travail et recevoir des candidatures.",
    "clear-fields": "Effacer tous les champs",
    "save-draft": "Enregistrer comme brouillon",

    "step-definition": "Définition du poste",
    "step-skills": "Compétences requises",
    "step-mode": "Conditions de travail",
    "step-evaluation": "Évaluation et attentes",
    "step-payment": "Rémunération et avantages",

    "job-definition": "Définition du poste",
    "job-title": "Intitulé du poste",
    "job-title-placeholder": "Développeur Frontend...",
    "job-description": "Description du poste",
    "job-description-placeholder": "Décrivez le rôle...",
    "job-industry": "Secteur",
    "job-speciality": "Spécialité",
    "job-timeline": "Calendrier d'emploi",
    "application-deadline": "Date limite de candidature",

    "skills-title": "Compétences requises",
    "skills": "Compétences",
    "languages": "Langues",
    "add-skill": "➕ Ajouter une compétence",
    "add-language": "➕ Ajouter une langue",

    "work-conditions": "Conditions de travail",
    "seniority": "Niveau d'ancienneté",
    "junior": "Junior",
    "mid": "Intermédiaire",
    "senior": "Senior",
    "lead": "Leader",
    "junior-desc": "Débutant, nécessite des conseils et du soutien",
    "mid-desc": "Travaille de manière autonome avec une solide expérience",
    "senior-desc": "Expert, gère des tâches et décisions complexes",
    "lead-desc": "Dirige des projets, encadre les membres de l'équipe",
    "positions": "Nombre de postes",
    "positions-hint": "Définit combien de candidats peuvent être embauchés pour ce rôle",
    "work-setting": "Cadre de travail",
    "remote": "À distance",
    "onsite": "Sur site",
    "hybrid": "Hybride",
    "remote-desc": "Travail effectué à distance avec des outils numériques",
    "onsite-desc": "Travail effectué dans un lieu physique",
    "hybrid-desc": "Mélange de travail à distance et sur site",
    "location": "Lieu de référence",
    "location-hint": "Ajoutez ou sélectionnez un lieu si nécessaire",
    "distance": "Distance maximale",

    "evaluation": "Évaluation et attentes",
    "evaluation-method": "Méthode d'évaluation",
    "manager": "Évaluation par le manager",
    "kpi": "Basé sur les KPI",
    "peer": "Évaluation par les pairs",
    "probation": "Période d'essai",
    "manager-desc": "Évalué par le superviseur ou le manager",
    "kpi-desc": "Mesuré à l'aide de métriques de performance définies",
    "peer-desc": "Retour d'information des membres de l'équipe",
    "probation-desc": "Évalué pendant la période d'essai initiale",

    "performance-criteria": "Critères de performance",
    "criteria-commitment": "Engagement et fiabilité",
    "criteria-commitment-desc": "Assiduité et implication constantes",
    "criteria-objectives": "Objectifs atteints",
    "criteria-objectives-desc": "Répond aux objectifs et responsabilités assignés",
    "criteria-performance": "Niveau de performance",
    "criteria-team": "Collaboration d'équipe",
    "criteria-team-desc": "Travaille efficacement au sein de l'équipe",
    "minimum-rating": "Note minimale :",

    "payment": "Rémunération et avantages",
    "employment-type": "Type d'emploi",
    "salary": "Fourchette de salaire",
    "currency": "Devise",
    "negotiable": "Négociable",
    "benefits": "Avantages sociaux",

    "employment-select": "Sélectionnez le type",
    "employment-full": "Temps plein",
    "employment-part": "Temps partiel",
    "employment-contract": "Contrat",
    "employment-intern": "Stage",
    "currency-select": "Sélectionnez la devise",

    "benefit-health": "Couverture santé",
    "benefit-health-desc": "Assurance ou soutien médical",
    "benefit-transport": "Soutien au transport",
    "benefit-transport-desc": "Aide au déplacement ou aux trajets",
    "benefit-equipment": "Équipement fourni",
    "benefit-equipment-desc": "Ordinateur portable, outils ou ressources",
    "benefit-remote": "Flexibilité à distance",
    "benefit-remote-desc": "Options de télétravail",
    "benefit-bonus": "Primes",
    "benefit-bonus-desc": "Primes de performance ou annuelles",

    "publish": "Publier l'offre",
    "boost": "Publier l'offre boostée",

    "previous": "← Précédent",
    "next": "Suivant →"
  },

  ar: {
    "header-title": "إضافة عرض وظيفة جديد",
    "header-subtitle": "أنشئ عرض وظيفة جديد لتحديد المتطلبات، وتعيين العمل، واستقبال الطلبات.",
    "clear-fields": "مسح جميع الحقول",
    "save-draft": "حفظ كمسودة",

    "step-definition": "تعريف الوظيفة",
    "step-skills": "القدرات المطلوبة",
    "step-mode": "ظروف العمل",
    "step-evaluation": "التقييم والتوقعات",
    "step-payment": "التعويضات والمزايا",

    "job-definition": "تعريف الوظيفة",
    "job-title": "المسمى الوظيفي",
    "job-title-placeholder": "مطور واجهة أمامية...",
    "job-description": "وصف الوظيفة",
    "job-description-placeholder": "صف الدور...",
    "job-industry": "الصناعة",
    "job-speciality": "التخصص",
    "job-timeline": "الجدول الزمني للتوظيف",
    "application-deadline": "الموعد النهائي للتقديم",

    "skills-title": "القدرات المطلوبة",
    "skills": "المهارات",
    "languages": "اللغات",
    "add-skill": "➕ أضف مهارة",
    "add-language": "➕ أضف لغة",

    "work-conditions": "ظروف العمل",
    "seniority": "مستوى الأقدمية",
    "junior": "مبتدئ",
    "mid": "متوسط",
    "senior": "كبير",
    "lead": "قائد",
    "junior-desc": "مستوى مبتدئ، يحتاج إلى توجيه ودعم",
    "mid-desc": "يعمل بشكل مستقل مع خبرة قوية",
    "senior-desc": "خبير، يتعامل مع المهام والقرارات المعقدة",
    "lead-desc": "يقود المشاريع، يوجه أعضاء الفريق",
    "positions": "عدد الوظائف",
    "positions-hint": "يحدد عدد المرشحين الذين يمكن تعيينهم لهذا الدور",
    "work-setting": "بيئة العمل",
    "remote": "عن بعد",
    "onsite": "في الموقع",
    "hybrid": "هجين",
    "remote-desc": "عمل يتم عن بعد باستخدام الأدوات الرقمية",
    "onsite-desc": "عمل يتم في موقع فعلي",
    "hybrid-desc": "مزيج من العمل عن بعد وفي الموقع",
    "location": "الموقع المرجعي",
    "location-hint": "أضف أو اختر موقعًا إذا لزم الأمر",
    "distance": "أقصى مسافة",

    "evaluation": "التقييم والتوقعات",
    "evaluation-method": "طريقة التقييم",
    "manager": "مراجعة المدير",
    "kpi": "قائم على مؤشرات الأداء",
    "peer": "مراجعة الأقران",
    "probation": "فترة الاختبار",
    "manager-desc": "يتم التقييم بواسطة المشرف أو المدير",
    "kpi-desc": "يقاس باستخدام مقاييس أداء محددة",
    "peer-desc": "ملاحظات من أعضاء الفريق",
    "probation-desc": "يتم التقييم خلال فترة التجربة الأولية",

    "performance-criteria": "معايير الأداء",
    "criteria-commitment": "الالتزام والموثوقية",
    "criteria-commitment-desc": "الحضور والمشاركة المستمرة",
    "criteria-objectives": "تحقيق الأهداف",
    "criteria-objectives-desc": "يلبي الأهداف والمسؤوليات الموكلة إليه",
    "criteria-performance": "مستوى الأداء",
    "criteria-team": "التعاون الجماعي",
    "criteria-team-desc": "يعمل بفعالية ضمن الفريق",
    "minimum-rating": "الحد الأدنى للتقييم:",

    "payment": "التعويضات والمزايا",
    "employment-type": "نوع التوظيف",
    "salary": "نطاق الراتب",
    "currency": "العملة",
    "negotiable": "قابل للتفاوض",
    "benefits": "المزايا والحوافز",

    "employment-select": "اختر النوع",
    "employment-full": "دوام كامل",
    "employment-part": "دوام جزئي",
    "employment-contract": "عقد",
    "employment-intern": "تدريب",
    "currency-select": "اختر العملة",

    "benefit-health": "تغطية صحية",
    "benefit-health-desc": "تأمين أو دعم طبي",
    "benefit-transport": "دعم النقل",
    "benefit-transport-desc": "مساعدة في التنقل أو السفر",
    "benefit-equipment": "معدات مقدمة",
    "benefit-equipment-desc": "حاسوب محمول، أدوات أو موارد",
    "benefit-remote": "مرونة العمل عن بعد",
    "benefit-remote-desc": "خيارات العمل من المنزل",
    "benefit-bonus": "مكافآت",
    "benefit-bonus-desc": "مكافآت أداء أو سنوية",

    "publish": "نشر الوظيفة",
    "boost": "نشر وظيفة مدعومة",

    "previous": "← السابق",
    "next": "التالي →"
  },

  es: {
    "header-title": "Agregar nueva oferta de empleo",
    "header-subtitle": "Crea una nueva oferta de empleo para definir requisitos, asignar trabajo y recibir solicitudes.",
    "clear-fields": "Limpiar todos los campos",
    "save-draft": "Guardar como borrador",

    "step-definition": "Definición del puesto",
    "step-skills": "Capacidades requeridas",
    "step-mode": "Condiciones laborales",
    "step-evaluation": "Evaluación y expectativas",
    "step-payment": "Compensación y beneficios",

    "job-definition": "Definición del puesto",
    "job-title": "Título del puesto",
    "job-title-placeholder": "Desarrollador Frontend...",
    "job-description": "Descripción del puesto",
    "job-description-placeholder": "Describe el rol...",
    "job-industry": "Industria",
    "job-speciality": "Especialidad",
    "job-timeline": "Cronograma laboral",
    "application-deadline": "Fecha límite de postulación",

    "skills-title": "Capacidades requeridas",
    "skills": "Habilidades",
    "languages": "Idiomas",
    "add-skill": "➕ Agregar habilidad",
    "add-language": "➕ Agregar idioma",

    "work-conditions": "Condiciones laborales",
    "seniority": "Nivel de antigüedad",
    "junior": "Junior",
    "mid": "Nivel medio",
    "senior": "Senior",
    "lead": "Líder",
    "junior-desc": "Nivel inicial, requiere orientación y apoyo",
    "mid-desc": "Trabaja de forma independiente con experiencia sólida",
    "senior-desc": "Experto, maneja tareas y decisiones complejas",
    "lead-desc": "Lidera proyectos, asesora a los miembros del equipo",
    "positions": "Número de vacantes",
    "positions-hint": "Define cuántos candidatos pueden ser contratados para este rol",
    "work-setting": "Entorno laboral",
    "remote": "Remoto",
    "onsite": "Presencial",
    "hybrid": "Híbrido",
    "remote-desc": "Trabajo realizado de forma remota utilizando herramientas digitales",
    "onsite-desc": "Trabajo realizado en una ubicación física",
    "hybrid-desc": "Combinación de trabajo remoto y presencial",
    "location": "Ubicación de referencia",
    "location-hint": "Agrega o selecciona una ubicación si es necesario",
    "distance": "Distancia máxima",

    "evaluation": "Evaluación y expectativas",
    "evaluation-method": "Método de evaluación",
    "manager": "Revisión del gerente",
    "kpi": "Basado en KPI",
    "peer": "Revisión por pares",
    "probation": "Período de prueba",
    "manager-desc": "Evaluado por el supervisor o gerente",
    "kpi-desc": "Medido mediante métricas de rendimiento definidas",
    "peer-desc": "Comentarios de los miembros del equipo",
    "probation-desc": "Evaluado durante el período de prueba inicial",

    "performance-criteria": "Criterios de rendimiento",
    "criteria-commitment": "Compromiso y fiabilidad",
    "criteria-commitment-desc": "Asistencia y participación constantes",
    "criteria-objectives": "Objetivos alcanzados",
    "criteria-objectives-desc": "Cumple con los objetivos y responsabilidades asignados",
    "criteria-performance": "Nivel de rendimiento",
    "criteria-team": "Colaboración en equipo",
    "criteria-team-desc": "Trabaja eficazmente dentro del equipo",
    "minimum-rating": "Calificación mínima:",

    "payment": "Compensación y beneficios",
    "employment-type": "Tipo de empleo",
    "salary": "Rango salarial",
    "currency": "Moneda",
    "negotiable": "Negociable",
    "benefits": "Beneficios y ventajas",

    "employment-select": "Seleccionar tipo",
    "employment-full": "Tiempo completo",
    "employment-part": "Tiempo parcial",
    "employment-contract": "Contrato",
    "employment-intern": "Pasantía",
    "currency-select": "Seleccionar moneda",

    "benefit-health": "Cobertura de salud",
    "benefit-health-desc": "Seguro o apoyo médico",
    "benefit-transport": "Apoyo de transporte",
    "benefit-transport-desc": "Asistencia para el desplazamiento o viajes",
    "benefit-equipment": "Equipo proporcionado",
    "benefit-equipment-desc": "Portátil, herramientas o recursos",
    "benefit-remote": "Flexibilidad remota",
    "benefit-remote-desc": "Opciones de trabajo desde casa",
    "benefit-bonus": "Bonificaciones",
    "benefit-bonus-desc": "Bonificaciones por rendimiento o anuales",

    "publish": "Publicar empleo",
    "boost": "Publicar empleo destacado",

    "previous": "← Anterior",
    "next": "Siguiente →"
  },

  zh: {
    "header-title": "添加新职位",
    "header-subtitle": "创建新职位以定义要求、分配工作并接收申请。",
    "clear-fields": "清除所有字段",
    "save-draft": "保存为草稿",

    "step-definition": "职位定义",
    "step-skills": "所需能力",
    "step-mode": "工作条件",
    "step-evaluation": "评估与期望",
    "step-payment": "薪酬与福利",

    "job-definition": "职位定义",
    "job-title": "职位名称",
    "job-title-placeholder": "前端开发人员...",
    "job-description": "职位描述",
    "job-description-placeholder": "描述角色...",
    "job-industry": "行业",
    "job-speciality": "专业领域",
    "job-timeline": "雇佣时间表",
    "application-deadline": "申请截止日期",

    "skills-title": "所需能力",
    "skills": "技能",
    "languages": "语言",
    "add-skill": "➕ 添加技能",
    "add-language": "➕ 添加语言",

    "work-conditions": "工作条件",
    "seniority": "资历级别",
    "junior": "初级",
    "mid": "中级",
    "senior": "高级",
    "lead": "主管",
    "junior-desc": "入门级，需要指导和支持",
    "mid-desc": "独立工作，经验丰富",
    "senior-desc": "专家，处理复杂任务和决策",
    "lead-desc": "领导项目，指导团队成员",
    "positions": "职位数量",
    "positions-hint": "定义该职位可以招聘多少候选人",
    "work-setting": "工作环境",
    "remote": "远程",
    "onsite": "现场",
    "hybrid": "混合",
    "remote-desc": "使用数字工具远程完成工作",
    "onsite-desc": "在实体地点完成工作",
    "hybrid-desc": "远程和现场工作的混合",
    "location": "参考地点",
    "location-hint": "如有需要，添加或选择地点",
    "distance": "最大距离",

    "evaluation": "评估与期望",
    "evaluation-method": "评估方法",
    "manager": "经理评审",
    "kpi": "基于KPI",
    "peer": "同行评审",
    "probation": "试用期",
    "manager-desc": "由主管或经理评估",
    "kpi-desc": "使用定义的绩效指标衡量",
    "peer-desc": "团队成员的反馈",
    "probation-desc": "在初始试用期内评估",

    "performance-criteria": "绩效标准",
    "criteria-commitment": "承诺与可靠性",
    "criteria-commitment-desc": "持续出勤和参与",
    "criteria-objectives": "达成目标",
    "criteria-objectives-desc": "完成分配的目标和职责",
    "criteria-performance": "绩效水平",
    "criteria-team": "团队协作",
    "criteria-team-desc": "在团队中有效工作",
    "minimum-rating": "最低评分：",

    "payment": "薪酬与福利",
    "employment-type": "雇佣类型",
    "salary": "薪资范围",
    "currency": "货币",
    "negotiable": "可协商",
    "benefits": "福利与津贴",

    "employment-select": "选择类型",
    "employment-full": "全职",
    "employment-part": "兼职",
    "employment-contract": "合同工",
    "employment-intern": "实习",
    "currency-select": "选择货币",

    "benefit-health": "健康保险",
    "benefit-health-desc": "保险或医疗支持",
    "benefit-transport": "交通补助",
    "benefit-transport-desc": "通勤或旅行援助",
    "benefit-equipment": "提供设备",
    "benefit-equipment-desc": "笔记本电脑、工具或资源",
    "benefit-remote": "远程灵活性",
    "benefit-remote-desc": "在家工作选项",
    "benefit-bonus": "奖金",
    "benefit-bonus-desc": "绩效或年度奖金",

    "publish": "发布职位",
    "boost": "发布推广职位",

    "previous": "← 上一步",
    "next": "下一步 →"
  },

  de: {
    "header-title": "Neues Stellenangebot hinzufügen",
    "header-subtitle": "Erstellen Sie ein neues Stellenangebot, um Anforderungen zu definieren, Arbeit zuzuweisen und Bewerbungen zu erhalten.",
    "clear-fields": "Alle Felder löschen",
    "save-draft": "Als Entwurf speichern",

    "step-definition": "Stellenbeschreibung",
    "step-skills": "Erforderliche Fähigkeiten",
    "step-mode": "Arbeitsbedingungen",
    "step-evaluation": "Bewertung und Erwartungen",
    "step-payment": "Vergütung und Zusatzleistungen",

    "job-definition": "Stellenbeschreibung",
    "job-title": "Stellenbezeichnung",
    "job-title-placeholder": "Frontend-Entwickler...",
    "job-description": "Stellenbeschreibung",
    "job-description-placeholder": "Beschreiben Sie die Rolle...",
    "job-industry": "Branche",
    "job-speciality": "Fachgebiet",
    "job-timeline": "Anstellungszeitraum",
    "application-deadline": "Bewerbungsfrist",

    "skills-title": "Erforderliche Fähigkeiten",
    "skills": "Fähigkeiten",
    "languages": "Sprachen",
    "add-skill": "➕ Fähigkeit hinzufügen",
    "add-language": "➕ Sprache hinzufügen",

    "work-conditions": "Arbeitsbedingungen",
    "seniority": "Erfahrungsstufe",
    "junior": "Einsteiger",
    "mid": "Mittlere Stufe",
    "senior": "Senior",
    "lead": "Leitend",
    "junior-desc": "Einstiegsniveau, benötigt Anleitung und Unterstützung",
    "mid-desc": "Arbeitet selbstständig mit solider Erfahrung",
    "senior-desc": "Experte, bearbeitet komplexe Aufgaben und Entscheidungen",
    "lead-desc": "Leitet Projekte, betreut Teammitglieder",
    "positions": "Anzahl der Stellen",
    "positions-hint": "Definiert, wie viele Kandidaten für diese Rolle eingestellt werden können",
    "work-setting": "Arbeitsumgebung",
    "remote": "Remote",
    "onsite": "Vor Ort",
    "hybrid": "Hybrid",
    "remote-desc": "Arbeit wird remote mit digitalen Werkzeugen durchgeführt",
    "onsite-desc": "Arbeit wird an einem physischen Ort durchgeführt",
    "hybrid-desc": "Mischung aus Remote- und Vor-Ort-Arbeit",
    "location": "Referenzstandort",
    "location-hint": "Fügen Sie bei Bedarf einen Standort hinzu oder wählen Sie ihn aus",
    "distance": "Maximale Entfernung",

    "evaluation": "Bewertung und Erwartungen",
    "evaluation-method": "Bewertungsmethode",
    "manager": "Manager-Bewertung",
    "kpi": "KPI-basiert",
    "peer": "Kollegenbewertung",
    "probation": "Probezeit",
    "manager-desc": "Bewertet durch Vorgesetzten oder Manager",
    "kpi-desc": "Gemessen an definierten Leistungskennzahlen",
    "peer-desc": "Feedback von Teammitgliedern",
    "probation-desc": "Bewertung während der ersten Probezeit",

    "performance-criteria": "Leistungskriterien",
    "criteria-commitment": "Engagement und Zuverlässigkeit",
    "criteria-commitment-desc": "Konsequente Anwesenheit und Beteiligung",
    "criteria-objectives": "Ziele erreicht",
    "criteria-objectives-desc": "Erfüllt zugewiesene Ziele und Verantwortlichkeiten",
    "criteria-performance": "Leistungsniveau",
    "criteria-team": "Teamzusammenarbeit",
    "criteria-team-desc": "Arbeitet effektiv im Team",
    "minimum-rating": "Mindestbewertung:",

    "payment": "Vergütung und Zusatzleistungen",
    "employment-type": "Anstellungsart",
    "salary": "Gehaltsspanne",
    "currency": "Währung",
    "negotiable": "Verhandelbar",
    "benefits": "Zusatzleistungen",

    "employment-select": "Typ auswählen",
    "employment-full": "Vollzeit",
    "employment-part": "Teilzeit",
    "employment-contract": "Vertrag",
    "employment-intern": "Praktikum",
    "currency-select": "Währung auswählen",

    "benefit-health": "Krankenversicherung",
    "benefit-health-desc": "Versicherung oder medizinische Unterstützung",
    "benefit-transport": "Transportunterstützung",
    "benefit-transport-desc": "Fahrkosten- oder Reisehilfe",
    "benefit-equipment": "Ausrüstung gestellt",
    "benefit-equipment-desc": "Laptop, Werkzeuge oder Ressourcen",
    "benefit-remote": "Remote-Flexibilität",
    "benefit-remote-desc": "Möglichkeiten für Homeoffice",
    "benefit-bonus": "Boni",
    "benefit-bonus-desc": "Leistungs- oder Jahresboni",

    "publish": "Stelle veröffentlichen",
    "boost": "Beworbene Stelle veröffentlichen",

    "previous": "← Zurück",
    "next": "Weiter →"
  },

  pt: {
    "header-title": "Adicionar nova oferta de emprego",
    "header-subtitle": "Crie uma nova oferta de emprego para definir requisitos, atribuir trabalho e receber candidaturas.",
    "clear-fields": "Limpar todos os campos",
    "save-draft": "Salvar como rascunho",

    "step-definition": "Definição do cargo",
    "step-skills": "Capacidades necessárias",
    "step-mode": "Condições de trabalho",
    "step-evaluation": "Avaliação e expectativas",
    "step-payment": "Remuneração e benefícios",

    "job-definition": "Definição do cargo",
    "job-title": "Título do cargo",
    "job-title-placeholder": "Desenvolvedor Frontend...",
    "job-description": "Descrição do cargo",
    "job-description-placeholder": "Descreva a função...",
    "job-industry": "Setor",
    "job-speciality": "Especialidade",
    "job-timeline": "Cronograma de emprego",
    "application-deadline": "Prazo de candidatura",

    "skills-title": "Capacidades necessárias",
    "skills": "Competências",
    "languages": "Idiomas",
    "add-skill": "➕ Adicionar competência",
    "add-language": "➕ Adicionar idioma",

    "work-conditions": "Condições de trabalho",
    "seniority": "Nível de antiguidade",
    "junior": "Júnior",
    "mid": "Nível médio",
    "senior": "Sénior",
    "lead": "Líder",
    "junior-desc": "Nível inicial, necessita de orientação e apoio",
    "mid-desc": "Trabalha de forma independente com experiência sólida",
    "senior-desc": "Especialista, lida com tarefas e decisões complexas",
    "lead-desc": "Lidera projetos, orienta membros da equipa",
    "positions": "Número de vagas",
    "positions-hint": "Define quantos candidatos podem ser contratados para esta função",
    "work-setting": "Ambiente de trabalho",
    "remote": "Remoto",
    "onsite": "Presencial",
    "hybrid": "Híbrido",
    "remote-desc": "Trabalho realizado remotamente usando ferramentas digitais",
    "onsite-desc": "Trabalho realizado num local físico",
    "hybrid-desc": "Mistura de trabalho remoto e presencial",
    "location": "Local de referência",
    "location-hint": "Adicione ou selecione um local se necessário",
    "distance": "Distância máxima",

    "evaluation": "Avaliação e expectativas",
    "evaluation-method": "Método de avaliação",
    "manager": "Revisão do gestor",
    "kpi": "Baseado em KPI",
    "peer": "Revisão por pares",
    "probation": "Período de experiência",
    "manager-desc": "Avaliado pelo supervisor ou gestor",
    "kpi-desc": "Medido usando métricas de desempenho definidas",
    "peer-desc": "Feedback dos membros da equipa",
    "probation-desc": "Avaliado durante o período experimental inicial",

    "performance-criteria": "Critérios de desempenho",
    "criteria-commitment": "Compromisso e fiabilidade",
    "criteria-commitment-desc": "Assiduidade e envolvimento consistentes",
    "criteria-objectives": "Objetivos alcançados",
    "criteria-objectives-desc": "Cumpre as metas e responsabilidades atribuídas",
    "criteria-performance": "Nível de desempenho",
    "criteria-team": "Colaboração em equipa",
    "criteria-team-desc": "Trabalha eficazmente dentro da equipa",
    "minimum-rating": "Classificação mínima:",

    "payment": "Remuneração e benefícios",
    "employment-type": "Tipo de contrato",
    "salary": "Faixa salarial",
    "currency": "Moeda",
    "negotiable": "Negociável",
    "benefits": "Benefícios e regalias",

    "employment-select": "Selecionar tipo",
    "employment-full": "Tempo integral",
    "employment-part": "Meio período",
    "employment-contract": "Contrato",
    "employment-intern": "Estágio",
    "currency-select": "Selecionar moeda",

    "benefit-health": "Cobertura de saúde",
    "benefit-health-desc": "Seguro ou apoio médico",
    "benefit-transport": "Apoio ao transporte",
    "benefit-transport-desc": "Assistência para deslocação ou viagens",
    "benefit-equipment": "Equipamento fornecido",
    "benefit-equipment-desc": "Portátil, ferramentas ou recursos",
    "benefit-remote": "Flexibilidade remota",
    "benefit-remote-desc": "Opções de trabalho em casa",
    "benefit-bonus": "Bónus",
    "benefit-bonus-desc": "Bónus de desempenho ou anuais",

    "publish": "Publicar vaga",
    "boost": "Publicar vaga impulsionada",

    "previous": "← Anterior",
    "next": "Seguinte →"
  },

  ja: {
    "header-title": "新しい求人を追加",
    "header-subtitle": "新しい求人を作成して要件を定義し、作業を割り当て、応募を受け取ります。",
    "clear-fields": "すべてのフィールドをクリア",
    "save-draft": "下書きとして保存",

    "step-definition": "職務定義",
    "step-skills": "必要な能力",
    "step-mode": "労働条件",
    "step-evaluation": "評価と期待",
    "step-payment": "報酬と特典",

    "job-definition": "職務定義",
    "job-title": "職種",
    "job-title-placeholder": "フロントエンド開発者...",
    "job-description": "職務内容",
    "job-description-placeholder": "役割の説明...",
    "job-industry": "業界",
    "job-speciality": "専門分野",
    "job-timeline": "雇用スケジュール",
    "application-deadline": "応募締切",

    "skills-title": "必要な能力",
    "skills": "スキル",
    "languages": "言語",
    "add-skill": "➕ スキルを追加",
    "add-language": "➕ 言語を追加",

    "work-conditions": "労働条件",
    "seniority": "経験レベル",
    "junior": "ジュニア",
    "mid": "ミッドレベル",
    "senior": "シニア",
    "lead": "リード",
    "junior-desc": "エントリーレベル、指導とサポートが必要",
    "mid-desc": "確かな経験を持って独立して働く",
    "senior-desc": "エキスパート、複雑なタスクと意思決定を処理",
    "lead-desc": "プロジェクトをリードし、チームメンバーを指導",
    "positions": "募集人数",
    "positions-hint": "この役割に対して採用可能な候補者の数を定義します",
    "work-setting": "勤務形態",
    "remote": "リモート",
    "onsite": "オンサイト",
    "hybrid": "ハイブリッド",
    "remote-desc": "デジタルツールを使用してリモートで行う仕事",
    "onsite-desc": "物理的な場所で行う仕事",
    "hybrid-desc": "リモートとオンサイトの混合",
    "location": "基準所在地",
    "location-hint": "必要に応じて場所を追加または選択",
    "distance": "最大距離",

    "evaluation": "評価と期待",
    "evaluation-method": "評価方法",
    "manager": "マネージャーレビュー",
    "kpi": "KPIベース",
    "peer": "ピアレビュー",
    "probation": "試用期間",
    "manager-desc": "監督者またはマネージャーが評価",
    "kpi-desc": "定義されたパフォーマンス指標を使用して測定",
    "peer-desc": "チームメンバーからのフィードバック",
    "probation-desc": "初期試用期間中に評価",

    "performance-criteria": "パフォーマンス基準",
    "criteria-commitment": "コミットメントと信頼性",
    "criteria-commitment-desc": "一貫した出席と関与",
    "criteria-objectives": "達成された目標",
    "criteria-objectives-desc": "割り当てられた目標と責任を満たす",
    "criteria-performance": "パフォーマンスレベル",
    "criteria-team": "チームコラボレーション",
    "criteria-team-desc": "チーム内で効果的に働く",
    "minimum-rating": "最低評価：",

    "payment": "報酬と特典",
    "employment-type": "雇用形態",
    "salary": "給与範囲",
    "currency": "通貨",
    "negotiable": "交渉可能",
    "benefits": "福利厚生",

    "employment-select": "タイプを選択",
    "employment-full": "フルタイム",
    "employment-part": "パートタイム",
    "employment-contract": "契約社員",
    "employment-intern": "インターン",
    "currency-select": "通貨を選択",

    "benefit-health": "健康保険",
    "benefit-health-desc": "保険または医療サポート",
    "benefit-transport": "交通サポート",
    "benefit-transport-desc": "通勤または旅行支援",
    "benefit-equipment": "設備提供",
    "benefit-equipment-desc": "ラップトップ、ツール、またはリソース",
    "benefit-remote": "リモートの柔軟性",
    "benefit-remote-desc": "在宅勤務オプション",
    "benefit-bonus": "ボーナス",
    "benefit-bonus-desc": "業績または年次ボーナス",

    "publish": "求人を公開",
    "boost": "宣伝求人を公開",

    "previous": "← 前へ",
    "next": "次へ →"
  },

  ru: {
    "header-title": "Добавить новую вакансию",
    "header-subtitle": "Создайте новую вакансию, чтобы определить требования, распределить работу и получать заявки.",
    "clear-fields": "Очистить все поля",
    "save-draft": "Сохранить как черновик",

    "step-definition": "Описание должности",
    "step-skills": "Необходимые навыки",
    "step-mode": "Условия работы",
    "step-evaluation": "Оценка и ожидания",
    "step-payment": "Компенсация и льготы",

    "job-definition": "Описание должности",
    "job-title": "Название должности",
    "job-title-placeholder": "Frontend-разработчик...",
    "job-description": "Описание должности",
    "job-description-placeholder": "Опишите роль...",
    "job-industry": "Отрасль",
    "job-speciality": "Специализация",
    "job-timeline": "График работы",
    "application-deadline": "Срок подачи заявок",

    "skills-title": "Необходимые навыки",
    "skills": "Навыки",
    "languages": "Языки",
    "add-skill": "➕ Добавить навык",
    "add-language": "➕ Добавить язык",

    "work-conditions": "Условия работы",
    "seniority": "Уровень квалификации",
    "junior": "Начальный",
    "mid": "Средний",
    "senior": "Старший",
    "lead": "Ведущий",
    "junior-desc": "Начальный уровень, требует руководства и поддержки",
    "mid-desc": "Работает независимо с солидным опытом",
    "senior-desc": "Эксперт, выполняет сложные задачи и принимает решения",
    "lead-desc": "Руководит проектами, обучает членов команды",
    "positions": "Количество позиций",
    "positions-hint": "Определяет, сколько кандидатов может быть нанято на эту роль",
    "work-setting": "Режим работы",
    "remote": "Удаленно",
    "onsite": "В офисе",
    "hybrid": "Гибридный",
    "remote-desc": "Работа выполняется удаленно с использованием цифровых инструментов",
    "onsite-desc": "Работа выполняется в физическом месте",
    "hybrid-desc": "Смешанный формат удаленной и офисной работы",
    "location": "Базовое расположение",
    "location-hint": "Добавьте или выберите местоположение при необходимости",
    "distance": "Максимальное расстояние",

    "evaluation": "Оценка и ожидания",
    "evaluation-method": "Метод оценки",
    "manager": "Оценка руководителем",
    "kpi": "На основе KPI",
    "peer": "Оценка коллегами",
    "probation": "Испытательный срок",
    "manager-desc": "Оценивается руководителем или менеджером",
    "kpi-desc": "Измеряется с использованием определенных показателей эффективности",
    "peer-desc": "Обратная связь от членов команды",
    "probation-desc": "Оценивается в течение начального испытательного срока",

    "performance-criteria": "Критерии эффективности",
    "criteria-commitment": "Ответственность и надежность",
    "criteria-commitment-desc": "Постоянная посещаемость и вовлеченность",
    "criteria-objectives": "Достигнутые цели",
    "criteria-objectives-desc": "Выполняет поставленные цели и обязанности",
    "criteria-performance": "Уровень производительности",
    "criteria-team": "Командная работа",
    "criteria-team-desc": "Эффективно работает в команде",
    "minimum-rating": "Минимальный рейтинг:",

    "payment": "Компенсация и льготы",
    "employment-type": "Тип занятости",
    "salary": "Диапазон зарплаты",
    "currency": "Валюта",
    "negotiable": "Договорная",
    "benefits": "Льготы и преимущества",

    "employment-select": "Выберите тип",
    "employment-full": "Полная занятость",
    "employment-part": "Частичная занятость",
    "employment-contract": "Контракт",
    "employment-intern": "Стажировка",
    "currency-select": "Выберите валюту",

    "benefit-health": "Медицинское страхование",
    "benefit-health-desc": "Страховка или медицинская поддержка",
    "benefit-transport": "Транспортная поддержка",
    "benefit-transport-desc": "Помощь с проездом или поездками",
    "benefit-equipment": "Предоставление оборудования",
    "benefit-equipment-desc": "Ноутбук, инструменты или ресурсы",
    "benefit-remote": "Удаленная гибкость",
    "benefit-remote-desc": "Возможность работы из дома",
    "benefit-bonus": "Бонусы",
    "benefit-bonus-desc": "Бонусы по результатам работы или годовые",

    "publish": "Опубликовать вакансию",
    "boost": "Опубликовать продвигаемую вакансию",

    "previous": "← Назад",
    "next": "Далее →"
  }
};
function jobForm_translatePage(lang) {
  const t = jobForm_translations[lang] || jobForm_translations['en'];

  const header = document.querySelector('#jobPage .nt-header');
  if (header) {
    header.querySelector('h2').textContent = t["header-title"];
    header.querySelector('p').textContent = t["header-subtitle"];

    const cleanBtn = document.getElementById('cleanTask');
    const draftBtn = document.getElementById('saveDraft');

    if (cleanBtn) cleanBtn.title = t["clear-fields"];
    if (draftBtn) draftBtn.title = t["save-draft"];
  }

  const navButtons = document.querySelectorAll('#jobPage .horizontal-newTask button');
  if (navButtons.length >= 5) {
    navButtons[0].querySelector('.step-label').textContent = t["step-definition"];
    navButtons[1].querySelector('.step-label').textContent = t["step-skills"];
    navButtons[2].querySelector('.step-label').textContent = t["step-mode"];
    navButtons[3].querySelector('.step-label').textContent = t["step-evaluation"];
    navButtons[4].querySelector('.step-label').textContent = t["step-payment"];
  }

  const jobIdentity = document.getElementById('jobIdentity');
  if (jobIdentity) {
    const section = jobIdentity.querySelector('section');

    section.querySelector('h2').textContent = t["job-definition"];

    section.querySelector('label[for="job_title"]').textContent = t["job-title"];
    section.querySelector('#job_title').placeholder = t["job-title-placeholder"];

    section.querySelector('label[for="job_goal"]').textContent = t["job-description"];
    section.querySelector('#job_goal').placeholder = t["job-description-placeholder"];

    section.querySelector('label[for="job_industry"]').textContent = t["job-industry"];
    section.querySelector('label[for="job_speciality"]').textContent = t["job-speciality"];

    section.querySelector('label[for="application_start_date"]').textContent = t["job-timeline"];
    section.querySelector('label[for="application_deadline"]').textContent = t["application-deadline"];
  }
  
  const selectedJobIndustry = document.getElementById("job_industry")?.value;
  const selectedJobSpeciality = document.getElementById("job_speciality")?.value;
  loadIndustries("job_industry", selectedJobIndustry);
  loadSpecialties("job_speciality", selectedJobSpeciality);

  // =========================
  // SKILLS
  // =========================
  const jobSkills = document.getElementById('jobSkills');
  if (jobSkills) {
    jobSkills.querySelector('h2').textContent = t["skills-title"];

    const h3 = jobSkills.querySelectorAll('h3');
    h3[0].textContent = t["skills"];
    h3[1].textContent = t["languages"];

    document.getElementById('jobAddSkill').textContent = t["add-skill"];
    document.getElementById('jobAddLang').textContent = t["add-language"];
  }

  const jobMode = document.getElementById('jobMode');
  if (jobMode) {
    jobMode.querySelector('h2').textContent = t["work-conditions"];
    jobMode.querySelector('label[for="job_seniority_level"]').textContent = t["seniority"];

    const seniority = jobMode.querySelectorAll('.inputRadio3-description strong');
    seniority[0].textContent = t["junior"];
    seniority[1].textContent = t["mid"];
    seniority[2].textContent = t["senior"];
    seniority[3].textContent = t["lead"];

    const seniorityDesc = jobMode.querySelectorAll('.inputRadio3-description span');
    seniorityDesc[0].textContent = t["junior-desc"];
    seniorityDesc[1].textContent = t["mid-desc"];
    seniorityDesc[2].textContent = t["senior-desc"];
    seniorityDesc[3].textContent = t["lead-desc"];

    jobMode.querySelector('label[for="job_numb_positions"]').textContent = t["positions"];
    jobMode.querySelector('small[for="job_numb_positions"]').textContent = t["positions-hint"];
    jobMode.querySelector('label[for="job_execution_mode"]').textContent = t["work-setting"];

    const execLabels = jobMode.querySelectorAll('#job_execution_mode > label');
    execLabels[0].childNodes[0].textContent = t["onsite"];
    execLabels[1].childNodes[0].textContent = t["hybrid"];
    execLabels[2].childNodes[0].textContent = t["remote"];

    const execDesc = jobMode.querySelectorAll('#job_execution_mode .subLabel');
    execDesc[0].textContent = t["onsite-desc"];
    execDesc[1].textContent = t["hybrid-desc"];
    execDesc[2].textContent = t["remote-desc"];

    jobMode.querySelector('label[for="job_location"]').textContent = t["location"];
    jobMode.querySelector('label[for="job_max_distance_km"]').textContent = t["distance"];
    jobMode.querySelector('#job_location').nextElementSibling.textContent = t["location-hint"];
  }

  const jobEvaluation = document.getElementById('jobEvaluation');
  if (jobEvaluation) {
    jobEvaluation.querySelector('h2').textContent = t["evaluation"];

    jobEvaluation.querySelector('label[for="job_evaluation_method"]').textContent = t["evaluation-method"];

    const labels = jobEvaluation.querySelectorAll('#job_evaluation_method > label');
    labels[0].childNodes[0].textContent = t["manager"];
    labels[1].childNodes[0].textContent = t["kpi"];
    labels[2].childNodes[0].textContent = t["peer"];
    labels[3].childNodes[0].textContent = t["probation"];
    const evalDesc = jobEvaluation.querySelectorAll('#job_evaluation_method .subLabel');
    evalDesc[0].textContent = t["manager-desc"];
    evalDesc[1].textContent = t["kpi-desc"];
    evalDesc[2].textContent = t["peer-desc"];
    evalDesc[3].textContent = t["probation-desc"];

    jobEvaluation.querySelector('.criteria-inputGroup .Label').textContent = t["performance-criteria"];

    const criteria = jobEvaluation.querySelectorAll('.criteria-content strong');
    criteria[0].textContent = t["criteria-commitment"];
    criteria[1].textContent = t["criteria-objectives"];
    criteria[2].textContent = t["criteria-performance"];
    criteria[3].textContent = t["criteria-team"];

    const criteriaDesc = jobEvaluation.querySelectorAll('.criteria-content span');
    criteriaDesc[0].textContent = t["criteria-commitment-desc"];
    criteriaDesc[1].textContent = t["criteria-objectives-desc"];
    criteriaDesc[2].textContent = "";
    criteriaDesc[3].textContent = t["criteria-team-desc"];

    jobEvaluation.querySelector('#job_criteria_min_score').previousSibling.textContent = t["minimum-rating"];
  }

  const jobPayment = document.getElementById('jobPayment');
  if (jobPayment) {
    jobPayment.querySelector('h2').textContent = t["payment"];

    jobPayment.querySelector('label[for="employment_type"]').textContent = t["employment-type"];
    jobPayment.querySelector('label[for="job_salary_min"]').textContent = t["salary"];
    jobPayment.querySelector('label[for="job_priceCurrency"]').textContent = t["currency"];
    jobPayment.querySelector('label[for="job_salary_negotiable"]').textContent = t["negotiable"];

    const employmentSelect = document.getElementById('employment_type');
    if (employmentSelect) {
      const options = employmentSelect.querySelectorAll('option');

      if (options.length >= 5) {
        options[0].textContent = t["employment-select"];
        options[1].textContent = t["employment-full"];
        options[2].textContent = t["employment-part"];
        options[3].textContent = t["employment-contract"];
        options[4].textContent = t["employment-intern"];
      }
    }

    const currencySelect = document.getElementById('job_priceCurrency');
    if (currencySelect) {
      const firstOption = currencySelect.querySelector('option[value=""]');
      if (firstOption) {
        firstOption.textContent = t["currency-select"];
      }
    }

    const benefits = jobPayment.querySelectorAll('.criteria-content strong');
    benefits[0].textContent = t["benefit-health"];
    benefits[1].textContent = t["benefit-transport"];
    benefits[2].textContent = t["benefit-equipment"];
    benefits[3].textContent = t["benefit-remote"];
    benefits[4].textContent = t["benefit-bonus"];

    const benefitsDesc = jobPayment.querySelectorAll('.criteria-content span');
    benefitsDesc[0].textContent = t["benefit-health-desc"];
    benefitsDesc[1].textContent = t["benefit-transport-desc"];
    benefitsDesc[2].textContent = t["benefit-equipment-desc"];
    benefitsDesc[3].textContent = t["benefit-remote-desc"];
    benefitsDesc[4].textContent = t["benefit-bonus-desc"];

    jobPayment.querySelector('.Label').textContent = t["benefits"];

    const publishBtn = document.getElementById('publishJob');
    const boostBtn = document.getElementById('boostJob');

    publishBtn.querySelector('span').textContent = t["publish"];
    boostBtn.querySelector('span').textContent = t["boost"];
  }

  document.querySelectorAll('.prevStep').forEach(btn => {
    btn.textContent = t["previous"];
  });

  document.querySelectorAll('.nextStep').forEach(btn => {
    btn.textContent = t["next"];
  });
}

// =============================== Translation Words ================================

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

const UserForm_translations = {
  en: {
    "header-title": "Profile",
    "header-description": "Manage your personal details and profile settings",
    "verified-badge": "Verified Account",
    "tab-user-info": "Profile",
    "tab-history": "Activity",
    "tab-buy-coins": "Billing",
    "tab-security": "Security",
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
    "tab-user-info": "Profil",
    "tab-history": "Activité",
    "tab-buy-coins": "Facturation",
    "tab-security": "Sécurité",
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
    "tab-user-info": "الملف الشخصي",
    "tab-history": "النشاط",
    "tab-buy-coins": "الفواتير",
    "tab-security": "الأمان",
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
    "tab-user-info": "Perfil",
    "tab-history": "Actividad",
    "tab-buy-coins": "Facturación",
    "tab-security": "Seguridad",
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
    "tab-user-info": "个人资料",
    "tab-history": "活动",
    "tab-buy-coins": "账单",
    "tab-security": "安全设置",
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
    "tab-user-info": "Profil",
    "tab-history": "Aktivität",
    "tab-buy-coins": "Abrechnung",
    "tab-security": "Sicherheit",
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
    "tab-user-info": "Perfil",
    "tab-history": "Atividade",
    "tab-buy-coins": "Faturamento",
    "tab-security": "Segurança",
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
    "tab-user-info": "プロフィール",
    "tab-history": "アクティビティ",
    "tab-buy-coins": "請求",
    "tab-security": "セキュリティ",
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
    "tab-user-info": "Профиль",
    "tab-history": "Активность",
    "tab-buy-coins": "Платежи",
    "tab-security": "Безопасность",
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

const messages_translations = {
  en: {
    // Notification buttons
    "notifyCancel": "Cancel",
    "notifyConfirm": "Confirm",
    
    // Login related
    "loginRequiredTitle": "Login Required",
    "loginRequiredMessage": "You must be logged in to continue.",
    
    // Draft related
    "draftRequiredTitle": "Required Fields",
    "draftRequiredMessage": "Title and Description are required to save a draft.",
    "draftSavedTitle": "Draft saved",
    "draftSavedMessage": "Draft saved successfully!",
    "draftUpdatedTitle": "Draft updated",
    "draftUpdatedMessage": "Draft updated successfully!",
    "draftSaveFailedTitle": "Save failed",
    "draftSaveFailedMessage": "Failed to save draft.",
    "draftSubmittedTitle": "Draft submitted",
    "draftSubmittedMessage": "Draft submitted for approval!",
    "draftReplaceTitle": "Replace Form?",
    "draftReplaceMessage": "Your current form contains data. Do you want to replace it?",
    
    // Task related
    "taskSubmittedTitle": "Task submitted",
    "taskSubmittedMessage": "Task submitted for approval!",
    "taskSaveFailedTitle": "Save Failed",
    "taskSaveFailedMessage": "Failed to submit task.",
    "taskPublishRequiredTitle": "Required Fields",
    "taskPublishRequiredMessage": "Please complete all required fields before publishing.",
    
    // Not found
    "draftNotFound": "Draft not found.",
    
    // Validation messages
    "validationTitleRequired": "Title is required.",
    "validationDescriptionRequired": "Description is required.",
    "validationWorkNatureRequired": "Work Nature is required.",
    "validationCategoryRequired": "Task Category is required.",
    "validationStartDateRequired": "Start Date is required.",
    "validationEndDateRequired": "End Date is required.",
    "validationTimeFlexRequired": "Time Flexibility is required.",
    "validationSkillRequired": "At least one skill is required.",
    "validationLanguageRequired": "At least one language is required.",
    "validationExecutionEntityRequired": "Execution Entity is required.",
    "validationTaskScaleRequired": "Task Scale is required.",
    "validationWorkSettingRequired": "Work Setting is required.",
    "validationWorkDynamicsRequired": "Work Dynamics is required.",
    "validationProofRequired": "Proof of Completion is required.",
    "validationMaxExecutorsMin": "Maximum Executors must be at least 1.",
    "validationValidationLogicRequired": "Validation Logic is required.",
    "validationPriceRequired": "Task Price is required.",
    "validationCurrencyRequired": "Currency is required.",
    "validationPaymentModelRequired": "Payment Model is required."
  },
  
  fr: {
    // Notification buttons
    "notifyCancel": "Annuler",
    "notifyConfirm": "Confirmer",
    
    // Login related
    "loginRequiredTitle": "Connexion requise",
    "loginRequiredMessage": "Vous devez être connecté pour continuer.",
    
    // Draft related
    "draftRequiredTitle": "Champs requis",
    "draftRequiredMessage": "Le titre et la description sont requis pour enregistrer un brouillon.",
    "draftSavedTitle": "Brouillon enregistré",
    "draftSavedMessage": "Brouillon enregistré avec succès !",
    "draftUpdatedTitle": "Brouillon mis à jour",
    "draftUpdatedMessage": "Brouillon mis à jour avec succès !",
    "draftSaveFailedTitle": "Échec de l'enregistrement",
    "draftSaveFailedMessage": "Échec de l'enregistrement du brouillon.",
    "draftSubmittedTitle": "Brouillon soumis",
    "draftSubmittedMessage": "Brouillon soumis pour approbation !",
    "draftReplaceTitle": "Remplacer le formulaire ?",
    "draftReplaceMessage": "Votre formulaire actuel contient des données. Voulez-vous le remplacer ?",
    
    // Task related
    "taskSubmittedTitle": "Tâche soumise",
    "taskSubmittedMessage": "Tâche soumise pour approbation !",
    "taskSaveFailedTitle": "Échec de l'enregistrement",
    "taskSaveFailedMessage": "Échec de la soumission de la tâche.",
    "taskPublishRequiredTitle": "Champs requis",
    "taskPublishRequiredMessage": "Veuillez remplir tous les champs requis avant de publier.",
    
    // Not found
    "draftNotFound": "Brouillon introuvable.",
    
    // Validation messages
    "validationTitleRequired": "Le titre est requis.",
    "validationDescriptionRequired": "La description est requise.",
    "validationWorkNatureRequired": "La nature du travail est requise.",
    "validationCategoryRequired": "La catégorie de tâche est requise.",
    "validationStartDateRequired": "La date de début est requise.",
    "validationEndDateRequired": "La date de fin est requise.",
    "validationTimeFlexRequired": "La flexibilité horaire est requise.",
    "validationSkillRequired": "Au moins une compétence est requise.",
    "validationLanguageRequired": "Au moins une langue est requise.",
    "validationExecutionEntityRequired": "L'entité d'exécution est requise.",
    "validationTaskScaleRequired": "L'échelle de la tâche est requise.",
    "validationWorkSettingRequired": "Le cadre de travail est requis.",
    "validationWorkDynamicsRequired": "La dynamique de travail est requise.",
    "validationProofRequired": "La preuve d'achèvement est requise.",
    "validationMaxExecutorsMin": "Le nombre maximum d'exécutants doit être d'au moins 1.",
    "validationValidationLogicRequired": "La logique de validation est requise.",
    "validationPriceRequired": "Le prix de la tâche est requis.",
    "validationCurrencyRequired": "La devise est requise.",
    "validationPaymentModelRequired": "Le modèle de paiement est requis."
  },
  
  ar: {
    // Notification buttons
    "notifyCancel": "إلغاء",
    "notifyConfirm": "تأكيد",
    
    // Login related
    "loginRequiredTitle": "تسجيل الدخول مطلوب",
    "loginRequiredMessage": "يجب عليك تسجيل الدخول للمتابعة.",
    
    // Draft related
    "draftRequiredTitle": "الحقول المطلوبة",
    "draftRequiredMessage": "العنوان والوصف مطلوبان لحفظ المسودة.",
    "draftSavedTitle": "تم حفظ المسودة",
    "draftSavedMessage": "تم حفظ المسودة بنجاح!",
    "draftUpdatedTitle": "تم تحديث المسودة",
    "draftUpdatedMessage": "تم تحديث المسودة بنجاح!",
    "draftSaveFailedTitle": "فشل الحفظ",
    "draftSaveFailedMessage": "فشل حفظ المسودة.",
    "draftSubmittedTitle": "تم تقديم المسودة",
    "draftSubmittedMessage": "تم تقديم المسودة للموافقة!",
    "draftReplaceTitle": "استبدال النموذج؟",
    "draftReplaceMessage": "النموذج الحالي يحتوي على بيانات. هل تريد استبداله؟",
    
    // Task related
    "taskSubmittedTitle": "تم تقديم المهمة",
    "taskSubmittedMessage": "تم تقديم المهمة للموافقة!",
    "taskSaveFailedTitle": "فشل الحفظ",
    "taskSaveFailedMessage": "فشل تقديم المهمة.",
    "taskPublishRequiredTitle": "الحقول المطلوبة",
    "taskPublishRequiredMessage": "يرجى إكمال جميع الحقول المطلوبة قبل النشر.",
    
    // Not found
    "draftNotFound": "المسودة غير موجودة.",
    
    // Validation messages
    "validationTitleRequired": "العنوان مطلوب.",
    "validationDescriptionRequired": "الوصف مطلوب.",
    "validationWorkNatureRequired": "طبيعة العمل مطلوبة.",
    "validationCategoryRequired": "فئة المهمة مطلوبة.",
    "validationStartDateRequired": "تاريخ البدء مطلوب.",
    "validationEndDateRequired": "تاريخ الانتهاء مطلوب.",
    "validationTimeFlexRequired": "مرونة الوقت مطلوبة.",
    "validationSkillRequired": "مهارة واحدة على الأقل مطلوبة.",
    "validationLanguageRequired": "لغة واحدة على الأقل مطلوبة.",
    "validationExecutionEntityRequired": "جهة التنفيذ مطلوبة.",
    "validationTaskScaleRequired": "نطاق المهمة مطلوب.",
    "validationWorkSettingRequired": "بيئة العمل مطلوبة.",
    "validationWorkDynamicsRequired": "ديناميكية العمل مطلوبة.",
    "validationProofRequired": "إثبات الإنجاز مطلوب.",
    "validationMaxExecutorsMin": "يجب أن يكون الحد الأقصى للمنفذين 1 على الأقل.",
    "validationValidationLogicRequired": "منطق التحقق مطلوب.",
    "validationPriceRequired": "سعر المهمة مطلوب.",
    "validationCurrencyRequired": "العملة مطلوبة.",
    "validationPaymentModelRequired": "نموذج الدفع مطلوب."
  },
  
  es: {
    // Notification buttons
    "notifyCancel": "Cancelar",
    "notifyConfirm": "Confirmar",
    
    // Login related
    "loginRequiredTitle": "Inicio de sesión requerido",
    "loginRequiredMessage": "Debes iniciar sesión para continuar.",
    
    // Draft related
    "draftRequiredTitle": "Campos requeridos",
    "draftRequiredMessage": "El título y la descripción son necesarios para guardar un borrador.",
    "draftSavedTitle": "Borrador guardado",
    "draftSavedMessage": "¡Borrador guardado con éxito!",
    "draftUpdatedTitle": "Borrador actualizado",
    "draftUpdatedMessage": "¡Borrador actualizado con éxito!",
    "draftSaveFailedTitle": "Error al guardar",
    "draftSaveFailedMessage": "Error al guardar el borrador.",
    "draftSubmittedTitle": "Borrador enviado",
    "draftSubmittedMessage": "¡Borrador enviado para aprobación!",
    "draftReplaceTitle": "¿Reemplazar formulario?",
    "draftReplaceMessage": "Tu formulario actual contiene datos. ¿Quieres reemplazarlo?",
    
    // Task related
    "taskSubmittedTitle": "Tarea enviada",
    "taskSubmittedMessage": "¡Tarea enviada para aprobación!",
    "taskSaveFailedTitle": "Error al guardar",
    "taskSaveFailedMessage": "Error al enviar la tarea.",
    "taskPublishRequiredTitle": "Campos requeridos",
    "taskPublishRequiredMessage": "Por favor completa todos los campos requeridos antes de publicar.",
    
    // Not found
    "draftNotFound": "Borrador no encontrado.",
    
    // Validation messages
    "validationTitleRequired": "El título es requerido.",
    "validationDescriptionRequired": "La descripción es requerida.",
    "validationWorkNatureRequired": "La naturaleza del trabajo es requerida.",
    "validationCategoryRequired": "La categoría de tarea es requerida.",
    "validationStartDateRequired": "La fecha de inicio es requerida.",
    "validationEndDateRequired": "La fecha de fin es requerida.",
    "validationTimeFlexRequired": "La flexibilidad horaria es requerida.",
    "validationSkillRequired": "Se requiere al menos una habilidad.",
    "validationLanguageRequired": "Se requiere al menos un idioma.",
    "validationExecutionEntityRequired": "La entidad de ejecución es requerida.",
    "validationTaskScaleRequired": "La escala de la tarea es requerida.",
    "validationWorkSettingRequired": "El entorno de trabajo es requerido.",
    "validationWorkDynamicsRequired": "La dinámica de trabajo es requerida.",
    "validationProofRequired": "La prueba de finalización es requerida.",
    "validationMaxExecutorsMin": "El máximo de ejecutores debe ser al menos 1.",
    "validationValidationLogicRequired": "La lógica de validación es requerida.",
    "validationPriceRequired": "El precio de la tarea es requerido.",
    "validationCurrencyRequired": "La moneda es requerida.",
    "validationPaymentModelRequired": "El modelo de pago es requerido."
  },
  
  zh: {
    // Notification buttons
    "notifyCancel": "取消",
    "notifyConfirm": "确认",
    
    // Login related
    "loginRequiredTitle": "需要登录",
    "loginRequiredMessage": "您必须登录才能继续。",
    
    // Draft related
    "draftRequiredTitle": "必填字段",
    "draftRequiredMessage": "需要标题和描述才能保存草稿。",
    "draftSavedTitle": "草稿已保存",
    "draftSavedMessage": "草稿保存成功！",
    "draftUpdatedTitle": "草稿已更新",
    "draftUpdatedMessage": "草稿更新成功！",
    "draftSaveFailedTitle": "保存失败",
    "draftSaveFailedMessage": "保存草稿失败。",
    "draftSubmittedTitle": "草稿已提交",
    "draftSubmittedMessage": "草稿已提交审批！",
    "draftReplaceTitle": "替换表单？",
    "draftReplaceMessage": "您当前的表单包含数据。要替换它吗？",
    
    // Task related
    "taskSubmittedTitle": "任务已提交",
    "taskSubmittedMessage": "任务已提交审批！",
    "taskSaveFailedTitle": "保存失败",
    "taskSaveFailedMessage": "提交任务失败。",
    "taskPublishRequiredTitle": "必填字段",
    "taskPublishRequiredMessage": "请在发布前完成所有必填字段。",
    
    // Not found
    "draftNotFound": "未找到草稿。",
    
    // Validation messages
    "validationTitleRequired": "标题是必需的。",
    "validationDescriptionRequired": "描述是必需的。",
    "validationWorkNatureRequired": "工作性质是必需的。",
    "validationCategoryRequired": "任务类别是必需的。",
    "validationStartDateRequired": "开始日期是必需的。",
    "validationEndDateRequired": "结束日期是必需的。",
    "validationTimeFlexRequired": "时间灵活性是必需的。",
    "validationSkillRequired": "至少需要一项技能。",
    "validationLanguageRequired": "至少需要一种语言。",
    "validationExecutionEntityRequired": "执行实体是必需的。",
    "validationTaskScaleRequired": "任务规模是必需的。",
    "validationWorkSettingRequired": "工作环境是必需的。",
    "validationWorkDynamicsRequired": "工作动态是必需的。",
    "validationProofRequired": "完成证明是必需的。",
    "validationMaxExecutorsMin": "最大执行人数必须至少为1。",
    "validationValidationLogicRequired": "验证逻辑是必需的。",
    "validationPriceRequired": "任务价格是必需的。",
    "validationCurrencyRequired": "货币是必需的。",
    "validationPaymentModelRequired": "支付模式是必需的。"
  },
  
  de: {
    // Notification buttons
    "notifyCancel": "Abbrechen",
    "notifyConfirm": "Bestätigen",
    
    // Login related
    "loginRequiredTitle": "Anmeldung erforderlich",
    "loginRequiredMessage": "Sie müssen angemeldet sein, um fortzufahren.",
    
    // Draft related
    "draftRequiredTitle": "Pflichtfelder",
    "draftRequiredMessage": "Titel und Beschreibung sind erforderlich, um einen Entwurf zu speichern.",
    "draftSavedTitle": "Entwurf gespeichert",
    "draftSavedMessage": "Entwurf erfolgreich gespeichert!",
    "draftUpdatedTitle": "Entwurf aktualisiert",
    "draftUpdatedMessage": "Entwurf erfolgreich aktualisiert!",
    "draftSaveFailedTitle": "Speichern fehlgeschlagen",
    "draftSaveFailedMessage": "Fehler beim Speichern des Entwurfs.",
    "draftSubmittedTitle": "Entwurf eingereicht",
    "draftSubmittedMessage": "Entwurf zur Genehmigung eingereicht!",
    "draftReplaceTitle": "Formular ersetzen?",
    "draftReplaceMessage": "Ihr aktuelles Formular enthält Daten. Möchten Sie es ersetzen?",
    
    // Task related
    "taskSubmittedTitle": "Aufgabe eingereicht",
    "taskSubmittedMessage": "Aufgabe zur Genehmigung eingereicht!",
    "taskSaveFailedTitle": "Speichern fehlgeschlagen",
    "taskSaveFailedMessage": "Fehler beim Einreichen der Aufgabe.",
    "taskPublishRequiredTitle": "Pflichtfelder",
    "taskPublishRequiredMessage": "Bitte füllen Sie alle Pflichtfelder aus, bevor Sie veröffentlichen.",
    
    // Not found
    "draftNotFound": "Entwurf nicht gefunden.",
    
    // Validation messages
    "validationTitleRequired": "Titel ist erforderlich.",
    "validationDescriptionRequired": "Beschreibung ist erforderlich.",
    "validationWorkNatureRequired": "Arbeitsart ist erforderlich.",
    "validationCategoryRequired": "Aufgabenkategorie ist erforderlich.",
    "validationStartDateRequired": "Startdatum ist erforderlich.",
    "validationEndDateRequired": "Enddatum ist erforderlich.",
    "validationTimeFlexRequired": "Zeitflexibilität ist erforderlich.",
    "validationSkillRequired": "Mindestens eine Fähigkeit ist erforderlich.",
    "validationLanguageRequired": "Mindestens eine Sprache ist erforderlich.",
    "validationExecutionEntityRequired": "Ausführende Einheit ist erforderlich.",
    "validationTaskScaleRequired": "Aufgabenumfang ist erforderlich.",
    "validationWorkSettingRequired": "Arbeitsumgebung ist erforderlich.",
    "validationWorkDynamicsRequired": "Arbeitsdynamik ist erforderlich.",
    "validationProofRequired": "Abschlussnachweis ist erforderlich.",
    "validationMaxExecutorsMin": "Maximale Ausführende muss mindestens 1 sein.",
    "validationValidationLogicRequired": "Validierungslogik ist erforderlich.",
    "validationPriceRequired": "Aufgabenpreis ist erforderlich.",
    "validationCurrencyRequired": "Währung ist erforderlich.",
    "validationPaymentModelRequired": "Zahlungsmodell ist erforderlich."
  },
  
  pt: {
    // Notification buttons
    "notifyCancel": "Cancelar",
    "notifyConfirm": "Confirmar",
    
    // Login related
    "loginRequiredTitle": "Login necessário",
    "loginRequiredMessage": "Você precisa estar logado para continuar.",
    
    // Draft related
    "draftRequiredTitle": "Campos obrigatórios",
    "draftRequiredMessage": "Título e descrição são necessários para guardar um rascunho.",
    "draftSavedTitle": "Rascunho guardado",
    "draftSavedMessage": "Rascunho guardado com sucesso!",
    "draftUpdatedTitle": "Rascunho atualizado",
    "draftUpdatedMessage": "Rascunho atualizado com sucesso!",
    "draftSaveFailedTitle": "Falha ao guardar",
    "draftSaveFailedMessage": "Falha ao guardar o rascunho.",
    "draftSubmittedTitle": "Rascunho enviado",
    "draftSubmittedMessage": "Rascunho enviado para aprovação!",
    "draftReplaceTitle": "Substituir formulário?",
    "draftReplaceMessage": "O seu formulário atual contém dados. Deseja substituí-lo?",
    
    // Task related
    "taskSubmittedTitle": "Tarefa enviada",
    "taskSubmittedMessage": "Tarefa enviada para aprovação!",
    "taskSaveFailedTitle": "Falha ao guardar",
    "taskSaveFailedMessage": "Falha ao enviar a tarefa.",
    "taskPublishRequiredTitle": "Campos obrigatórios",
    "taskPublishRequiredMessage": "Por favor, preencha todos os campos obrigatórios antes de publicar.",
    
    // Not found
    "draftNotFound": "Rascunho não encontrado.",
    
    // Validation messages
    "validationTitleRequired": "O título é obrigatório.",
    "validationDescriptionRequired": "A descrição é obrigatória.",
    "validationWorkNatureRequired": "A natureza do trabalho é obrigatória.",
    "validationCategoryRequired": "A categoria da tarefa é obrigatória.",
    "validationStartDateRequired": "A data de início é obrigatória.",
    "validationEndDateRequired": "A data de fim é obrigatória.",
    "validationTimeFlexRequired": "A flexibilidade de horário é obrigatória.",
    "validationSkillRequired": "É necessária pelo menos uma habilidade.",
    "validationLanguageRequired": "É necessário pelo menos um idioma.",
    "validationExecutionEntityRequired": "A entidade de execução é obrigatória.",
    "validationTaskScaleRequired": "A escala da tarefa é obrigatória.",
    "validationWorkSettingRequired": "O ambiente de trabalho é obrigatório.",
    "validationWorkDynamicsRequired": "A dinâmica de trabalho é obrigatória.",
    "validationProofRequired": "O comprovante de conclusão é obrigatório.",
    "validationMaxExecutorsMin": "O máximo de executores deve ser pelo menos 1.",
    "validationValidationLogicRequired": "A lógica de validação é obrigatória.",
    "validationPriceRequired": "O preço da tarefa é obrigatório.",
    "validationCurrencyRequired": "A moeda é obrigatória.",
    "validationPaymentModelRequired": "O modelo de pagamento é obrigatório."
  },
  
  ja: {
    // Notification buttons
    "notifyCancel": "キャンセル",
    "notifyConfirm": "確認",
    
    // Login related
    "loginRequiredTitle": "ログインが必要です",
    "loginRequiredMessage": "続行するにはログインする必要があります。",
    
    // Draft related
    "draftRequiredTitle": "必須項目",
    "draftRequiredMessage": "下書きを保存するにはタイトルと説明が必要です。",
    "draftSavedTitle": "下書きを保存しました",
    "draftSavedMessage": "下書きが正常に保存されました！",
    "draftUpdatedTitle": "下書きを更新しました",
    "draftUpdatedMessage": "下書きが正常に更新されました！",
    "draftSaveFailedTitle": "保存に失敗しました",
    "draftSaveFailedMessage": "下書きの保存に失敗しました。",
    "draftSubmittedTitle": "下書きを提出しました",
    "draftSubmittedMessage": "下書きが承認待ちとして提出されました！",
    "draftReplaceTitle": "フォームを置き換えますか？",
    "draftReplaceMessage": "現在のフォームにデータが含まれています。置き換えますか？",
    
    // Task related
    "taskSubmittedTitle": "タスクを提出しました",
    "taskSubmittedMessage": "タスクが承認待ちとして提出されました！",
    "taskSaveFailedTitle": "保存に失敗しました",
    "taskSaveFailedMessage": "タスクの提出に失敗しました。",
    "taskPublishRequiredTitle": "必須項目",
    "taskPublishRequiredMessage": "公開する前にすべての必須項目を入力してください。",
    
    // Not found
    "draftNotFound": "下書きが見つかりません。",
    
    // Validation messages
    "validationTitleRequired": "タイトルは必須です。",
    "validationDescriptionRequired": "説明は必須です。",
    "validationWorkNatureRequired": "作業の性質は必須です。",
    "validationCategoryRequired": "タスクカテゴリーは必須です。",
    "validationStartDateRequired": "開始日は必須です。",
    "validationEndDateRequired": "終了日は必須です。",
    "validationTimeFlexRequired": "時間の柔軟性は必須です。",
    "validationSkillRequired": "少なくとも1つのスキルが必要です。",
    "validationLanguageRequired": "少なくとも1つの言語が必要です。",
    "validationExecutionEntityRequired": "実行主体は必須です。",
    "validationTaskScaleRequired": "タスク規模は必須です。",
    "validationWorkSettingRequired": "作業環境は必須です。",
    "validationWorkDynamicsRequired": "作業ダイナミクスは必須です。",
    "validationProofRequired": "完了証明は必須です。",
    "validationMaxExecutorsMin": "最大実行人数は1以上である必要があります。",
    "validationValidationLogicRequired": "検証ロジックは必須です。",
    "validationPriceRequired": "タスク価格は必須です。",
    "validationCurrencyRequired": "通貨は必須です。",
    "validationPaymentModelRequired": "支払いモデルは必須です。"
  },
  
  ru: {
    // Notification buttons
    "notifyCancel": "Отмена",
    "notifyConfirm": "Подтвердить",
    
    // Login related
    "loginRequiredTitle": "Требуется вход",
    "loginRequiredMessage": "Вы должны войти в систему, чтобы продолжить.",
    
    // Draft related
    "draftRequiredTitle": "Обязательные поля",
    "draftRequiredMessage": "Название и описание необходимы для сохранения черновика.",
    "draftSavedTitle": "Черновик сохранен",
    "draftSavedMessage": "Черновик успешно сохранен!",
    "draftUpdatedTitle": "Черновик обновлен",
    "draftUpdatedMessage": "Черновик успешно обновлен!",
    "draftSaveFailedTitle": "Ошибка сохранения",
    "draftSaveFailedMessage": "Не удалось сохранить черновик.",
    "draftSubmittedTitle": "Черновик отправлен",
    "draftSubmittedMessage": "Черновик отправлен на утверждение!",
    "draftReplaceTitle": "Заменить форму?",
    "draftReplaceMessage": "Ваша текущая форма содержит данные. Хотите заменить ее?",
    
    // Task related
    "taskSubmittedTitle": "Задача отправлена",
    "taskSubmittedMessage": "Задача отправлена на утверждение!",
    "taskSaveFailedTitle": "Ошибка сохранения",
    "taskSaveFailedMessage": "Не удалось отправить задачу.",
    "taskPublishRequiredTitle": "Обязательные поля",
    "taskPublishRequiredMessage": "Пожалуйста, заполните все обязательные поля перед публикацией.",
    
    // Not found
    "draftNotFound": "Черновик не найден.",
    
    // Validation messages
    "validationTitleRequired": "Название обязательно.",
    "validationDescriptionRequired": "Описание обязательно.",
    "validationWorkNatureRequired": "Характер работы обязателен.",
    "validationCategoryRequired": "Категория задачи обязательна.",
    "validationStartDateRequired": "Дата начала обязательна.",
    "validationEndDateRequired": "Дата окончания обязательна.",
    "validationTimeFlexRequired": "Гибкость времени обязательна.",
    "validationSkillRequired": "Требуется хотя бы один навык.",
    "validationLanguageRequired": "Требуется хотя бы один язык.",
    "validationExecutionEntityRequired": "Исполнитель обязателен.",
    "validationTaskScaleRequired": "Масштаб задачи обязателен.",
    "validationWorkSettingRequired": "Условия работы обязательны.",
    "validationWorkDynamicsRequired": "Динамика работы обязательна.",
    "validationProofRequired": "Подтверждение выполнения обязательно.",
    "validationMaxExecutorsMin": "Максимум исполнителей должен быть не менее 1.",
    "validationValidationLogicRequired": "Логика проверки обязательна.",
    "validationPriceRequired": "Цена задачи обязательна.",
    "validationCurrencyRequired": "Валюта обязательна.",
    "validationPaymentModelRequired": "Модель оплаты обязательна."
  }
};

const msgJob_translations = {
  en: {
    "notifyCancel": "Cancel",
    "notifyConfirm": "Confirm",
    "loginRequiredTitle": "Login Required",
    "loginRequiredMessage": "You must be logged in to continue.",
    "draftRequiredTitle": "Required Fields",
    "draftRequiredMessage": "Title and Description are required to save a draft.",
    "draftSavedTitle": "Draft saved",
    "draftSavedMessage": "Draft saved successfully!",
    "draftUpdatedTitle": "Draft updated",
    "draftUpdatedMessage": "Draft updated successfully!",
    "draftSaveFailedTitle": "Save failed",
    "draftSaveFailedMessage": "Failed to save draft.",
    "draftSubmittedTitle": "Draft submitted",
    "draftSubmittedMessage": "Draft submitted for approval!",
    "draftReplaceTitle": "Replace Form?",
    "draftReplaceMessage": "Your current form contains data. Do you want to replace it?",
    "draftNotFound": "Draft not found.",
    "jobSubmittedTitle": "Job submitted",
    "jobSubmittedMessage": "Job submitted for approval!",
    "jobSaveFailedTitle": "Submission failed",
    "jobSaveFailedMessage": "Failed to submit job.",
    "jobPublishRequiredTitle": "Required Fields",
    "jobPublishRequiredMessage": "Please complete all required fields before publishing.",
    "validationIndustryRequired": "Industry is required.",
    "validationSpecialityRequired": "Speciality is required.",
    "validationDeadlineRequired": "Application deadline is required.",
    "validationSeniorityRequired": "Seniority level is required.",
    "validationPositionsRequired": "Number of positions must be at least 1.",
    "validationLocationRequired": "Location is required for this work setting.",
    "validationEvaluationMethodRequired": "Evaluation method is required.",
    "validationEmploymentTypeRequired": "Employment type is required.",
    "validationSalaryMinRequired": "Minimum salary is required.",
    "validationSalaryMaxRequired": "Maximum salary is required.",
    "validationSalaryRangeInvalid": "Salary max must be greater than min.",
    "validationMinScoreRequired": "Minimum score must be greater than 0.",
    "validationEndDateAfterStart": "End date must be after start date."
  },
  
  fr: {
    "notifyCancel": "Annuler",
    "notifyConfirm": "Confirmer",
    "loginRequiredTitle": "Connexion requise",
    "loginRequiredMessage": "Vous devez être connecté pour continuer.",
    "draftRequiredTitle": "Champs requis",
    "draftRequiredMessage": "Le titre et la description sont requis pour enregistrer un brouillon.",
    "draftSavedTitle": "Brouillon enregistré",
    "draftSavedMessage": "Brouillon enregistré avec succès !",
    "draftUpdatedTitle": "Brouillon mis à jour",
    "draftUpdatedMessage": "Brouillon mis à jour avec succès !",
    "draftSaveFailedTitle": "Échec de l'enregistrement",
    "draftSaveFailedMessage": "Échec de l'enregistrement du brouillon.",
    "draftSubmittedTitle": "Brouillon soumis",
    "draftSubmittedMessage": "Brouillon soumis pour approbation !",
    "draftReplaceTitle": "Remplacer le formulaire ?",
    "draftReplaceMessage": "Votre formulaire actuel contient des données. Voulez-vous le remplacer ?",
    "draftNotFound": "Brouillon introuvable.",
    "jobSubmittedTitle": "Offre soumise",
    "jobSubmittedMessage": "Offre soumise pour approbation !",
    "jobSaveFailedTitle": "Échec de l'envoi",
    "jobSaveFailedMessage": "Échec de la soumission de l'offre.",
    "jobPublishRequiredTitle": "Champs requis",
    "jobPublishRequiredMessage": "Veuillez remplir tous les champs requis avant de publier.",
    "validationTitleRequired": "Le titre est requis.",
    "validationDescriptionRequired": "La description est requise.",
    "validationWorkNatureRequired": "La nature du travail est requise.",
    "validationCategoryRequired": "La catégorie est requise.",
    "validationStartDateRequired": "La date de début est requise.",
    "validationEndDateRequired": "La date de fin est requise.",
    "validationTimeFlexRequired": "La flexibilité horaire est requise.",
    "validationSkillRequired": "Au moins une compétence est requise.",
    "validationLanguageRequired": "Au moins une langue est requise.",
    "validationExecutionEntityRequired": "L'entité d'exécution est requise.",
    "validationTaskScaleRequired": "L'échelle de la tâche est requise.",
    "validationWorkSettingRequired": "Le cadre de travail est requis.",
    "validationWorkDynamicsRequired": "La dynamique de travail est requise.",
    "validationProofRequired": "La preuve d'achèvement est requise.",
    "validationMaxExecutorsMin": "Le nombre maximum d'exécutants doit être d'au moins 1.",
    "validationValidationLogicRequired": "La logique de validation est requise.",
    "validationPriceRequired": "Le prix est requis.",
    "validationCurrencyRequired": "La devise est requise.",
    "validationPaymentModelRequired": "Le modèle de paiement est requis."
  },
  
  ar: {
    "notifyCancel": "إلغاء",
    "notifyConfirm": "تأكيد",
    "loginRequiredTitle": "تسجيل الدخول مطلوب",
    "loginRequiredMessage": "يجب عليك تسجيل الدخول للمتابعة.",
    "draftRequiredTitle": "الحقول المطلوبة",
    "draftRequiredMessage": "العنوان والوصف مطلوبان لحفظ المسودة.",
    "draftSavedTitle": "تم حفظ المسودة",
    "draftSavedMessage": "تم حفظ المسودة بنجاح!",
    "draftUpdatedTitle": "تم تحديث المسودة",
    "draftUpdatedMessage": "تم تحديث المسودة بنجاح!",
    "draftSaveFailedTitle": "فشل الحفظ",
    "draftSaveFailedMessage": "فشل حفظ المسودة.",
    "draftSubmittedTitle": "تم تقديم المسودة",
    "draftSubmittedMessage": "تم تقديم المسودة للموافقة!",
    "draftReplaceTitle": "استبدال النموذج؟",
    "draftReplaceMessage": "النموذج الحالي يحتوي على بيانات. هل تريد استبداله؟",
    "draftNotFound": "المسودة غير موجودة.",
    "jobSubmittedTitle": "تم تقديم الوظيفة",
    "jobSubmittedMessage": "تم تقديم الوظيفة للموافقة!",
    "jobSaveFailedTitle": "فشل الإرسال",
    "jobSaveFailedMessage": "فشل تقديم الوظيفة.",
    "jobPublishRequiredTitle": "الحقول المطلوبة",
    "jobPublishRequiredMessage": "يرجى إكمال جميع الحقول المطلوبة قبل النشر.",
    "validationTitleRequired": "العنوان مطلوب.",
    "validationDescriptionRequired": "الوصف مطلوب.",
    "validationWorkNatureRequired": "طبيعة العمل مطلوبة.",
    "validationCategoryRequired": "الفئة مطلوبة.",
    "validationStartDateRequired": "تاريخ البدء مطلوب.",
    "validationEndDateRequired": "تاريخ الانتهاء مطلوب.",
    "validationTimeFlexRequired": "مرونة الوقت مطلوبة.",
    "validationSkillRequired": "مهارة واحدة على الأقل مطلوبة.",
    "validationLanguageRequired": "لغة واحدة على الأقل مطلوبة.",
    "validationExecutionEntityRequired": "جهة التنفيذ مطلوبة.",
    "validationTaskScaleRequired": "نطاق المهمة مطلوب.",
    "validationWorkSettingRequired": "بيئة العمل مطلوبة.",
    "validationWorkDynamicsRequired": "ديناميكية العمل مطلوبة.",
    "validationProofRequired": "إثبات الإنجاز مطلوب.",
    "validationMaxExecutorsMin": "يجب أن يكون الحد الأقصى للمنفذين 1 على الأقل.",
    "validationValidationLogicRequired": "منطق التحقق مطلوب.",
    "validationPriceRequired": "السعر مطلوب.",
    "validationCurrencyRequired": "العملة مطلوبة.",
    "validationPaymentModelRequired": "نموذج الدفع مطلوب."
  },
  
  es: {
    "notifyCancel": "Cancelar",
    "notifyConfirm": "Confirmar",
    "loginRequiredTitle": "Inicio de sesión requerido",
    "loginRequiredMessage": "Debes iniciar sesión para continuar.",
    "draftRequiredTitle": "Campos requeridos",
    "draftRequiredMessage": "El título y la descripción son necesarios para guardar un borrador.",
    "draftSavedTitle": "Borrador guardado",
    "draftSavedMessage": "¡Borrador guardado con éxito!",
    "draftUpdatedTitle": "Borrador actualizado",
    "draftUpdatedMessage": "¡Borrador actualizado con éxito!",
    "draftSaveFailedTitle": "Error al guardar",
    "draftSaveFailedMessage": "Error al guardar el borrador.",
    "draftSubmittedTitle": "Borrador enviado",
    "draftSubmittedMessage": "¡Borrador enviado para aprobación!",
    "draftReplaceTitle": "¿Reemplazar formulario?",
    "draftReplaceMessage": "Tu formulario actual contiene datos. ¿Quieres reemplazarlo?",
    "draftNotFound": "Borrador no encontrado.",
    "jobSubmittedTitle": "Trabajo enviado",
    "jobSubmittedMessage": "¡Trabajo enviado para aprobación!",
    "jobSaveFailedTitle": "Error al enviar",
    "jobSaveFailedMessage": "Error al enviar el trabajo.",
    "jobPublishRequiredTitle": "Campos requeridos",
    "jobPublishRequiredMessage": "Completa todos los campos requeridos antes de publicar.",
    "validationTitleRequired": "El título es requerido.",
    "validationDescriptionRequired": "La descripción es requerida.",
    "validationWorkNatureRequired": "La naturaleza del trabajo es requerida.",
    "validationCategoryRequired": "La categoría es requerida.",
    "validationStartDateRequired": "La fecha de inicio es requerida.",
    "validationEndDateRequired": "La fecha de fin es requerida.",
    "validationTimeFlexRequired": "La flexibilidad horaria es requerida.",
    "validationSkillRequired": "Se requiere al menos una habilidad.",
    "validationLanguageRequired": "Se requiere al menos un idioma.",
    "validationExecutionEntityRequired": "La entidad de ejecución es requerida.",
    "validationTaskScaleRequired": "La escala de la tarea es requerida.",
    "validationWorkSettingRequired": "El entorno de trabajo es requerido.",
    "validationWorkDynamicsRequired": "La dinámica de trabajo es requerida.",
    "validationProofRequired": "La prueba de finalización es requerida.",
    "validationMaxExecutorsMin": "El máximo de ejecutores debe ser al menos 1.",
    "validationValidationLogicRequired": "La lógica de validación es requerida.",
    "validationPriceRequired": "El precio es requerido.",
    "validationCurrencyRequired": "La moneda es requerida.",
    "validationPaymentModelRequired": "El modelo de pago es requerido."
  },
  
  zh: {
    "notifyCancel": "取消",
    "notifyConfirm": "确认",
    "loginRequiredTitle": "需要登录",
    "loginRequiredMessage": "您必须登录才能继续。",
    "draftRequiredTitle": "必填字段",
    "draftRequiredMessage": "需要标题和描述才能保存草稿。",
    "draftSavedTitle": "草稿已保存",
    "draftSavedMessage": "草稿保存成功！",
    "draftUpdatedTitle": "草稿已更新",
    "draftUpdatedMessage": "草稿更新成功！",
    "draftSaveFailedTitle": "保存失败",
    "draftSaveFailedMessage": "保存草稿失败。",
    "draftSubmittedTitle": "草稿已提交",
    "draftSubmittedMessage": "草稿已提交审批！",
    "draftReplaceTitle": "替换表单？",
    "draftReplaceMessage": "您当前的表单包含数据。要替换它吗？",
    "draftNotFound": "未找到草稿。",
    "jobSubmittedTitle": "职位已提交",
    "jobSubmittedMessage": "职位已提交审批！",
    "jobSaveFailedTitle": "提交失败",
    "jobSaveFailedMessage": "提交职位失败。",
    "jobPublishRequiredTitle": "必填字段",
    "jobPublishRequiredMessage": "请在发布前完成所有必填字段。",
    "validationTitleRequired": "标题是必需的。",
    "validationDescriptionRequired": "描述是必需的。",
    "validationWorkNatureRequired": "工作性质是必需的。",
    "validationCategoryRequired": "类别是必需的。",
    "validationStartDateRequired": "开始日期是必需的。",
    "validationEndDateRequired": "结束日期是必需的。",
    "validationTimeFlexRequired": "时间灵活性是必需的。",
    "validationSkillRequired": "至少需要一项技能。",
    "validationLanguageRequired": "至少需要一种语言。",
    "validationExecutionEntityRequired": "执行实体是必需的。",
    "validationTaskScaleRequired": "任务规模是必需的。",
    "validationWorkSettingRequired": "工作环境是必需的。",
    "validationWorkDynamicsRequired": "工作动态是必需的。",
    "validationProofRequired": "完成证明是必需的。",
    "validationMaxExecutorsMin": "最大执行人数必须至少为1。",
    "validationValidationLogicRequired": "验证逻辑是必需的。",
    "validationPriceRequired": "价格是必需的。",
    "validationCurrencyRequired": "货币是必需的。",
    "validationPaymentModelRequired": "支付模式是必需的。"
  },
  
  de: {
    "notifyCancel": "Abbrechen",
    "notifyConfirm": "Bestätigen",
    "loginRequiredTitle": "Anmeldung erforderlich",
    "loginRequiredMessage": "Sie müssen angemeldet sein, um fortzufahren.",
    "draftRequiredTitle": "Pflichtfelder",
    "draftRequiredMessage": "Titel und Beschreibung sind erforderlich, um einen Entwurf zu speichern.",
    "draftSavedTitle": "Entwurf gespeichert",
    "draftSavedMessage": "Entwurf erfolgreich gespeichert!",
    "draftUpdatedTitle": "Entwurf aktualisiert",
    "draftUpdatedMessage": "Entwurf erfolgreich aktualisiert!",
    "draftSaveFailedTitle": "Speichern fehlgeschlagen",
    "draftSaveFailedMessage": "Fehler beim Speichern des Entwurfs.",
    "draftSubmittedTitle": "Entwurf eingereicht",
    "draftSubmittedMessage": "Entwurf zur Genehmigung eingereicht!",
    "draftReplaceTitle": "Formular ersetzen?",
    "draftReplaceMessage": "Ihr aktuelles Formular enthält Daten. Möchten Sie es ersetzen?",
    "draftNotFound": "Entwurf nicht gefunden.",
    "jobSubmittedTitle": "Stelle eingereicht",
    "jobSubmittedMessage": "Stelle zur Genehmigung eingereicht!",
    "jobSaveFailedTitle": "Einreichung fehlgeschlagen",
    "jobSaveFailedMessage": "Fehler beim Einreichen der Stelle.",
    "jobPublishRequiredTitle": "Pflichtfelder",
    "jobPublishRequiredMessage": "Bitte füllen Sie alle Pflichtfelder aus, bevor Sie veröffentlichen.",
    "validationTitleRequired": "Titel ist erforderlich.",
    "validationDescriptionRequired": "Beschreibung ist erforderlich.",
    "validationWorkNatureRequired": "Arbeitsart ist erforderlich.",
    "validationCategoryRequired": "Kategorie ist erforderlich.",
    "validationStartDateRequired": "Startdatum ist erforderlich.",
    "validationEndDateRequired": "Enddatum ist erforderlich.",
    "validationTimeFlexRequired": "Zeitflexibilität ist erforderlich.",
    "validationSkillRequired": "Mindestens eine Fähigkeit ist erforderlich.",
    "validationLanguageRequired": "Mindestens eine Sprache ist erforderlich.",
    "validationExecutionEntityRequired": "Ausführende Einheit ist erforderlich.",
    "validationTaskScaleRequired": "Aufgabenumfang ist erforderlich.",
    "validationWorkSettingRequired": "Arbeitsumgebung ist erforderlich.",
    "validationWorkDynamicsRequired": "Arbeitsdynamik ist erforderlich.",
    "validationProofRequired": "Abschlussnachweis ist erforderlich.",
    "validationMaxExecutorsMin": "Maximale Ausführende muss mindestens 1 sein.",
    "validationValidationLogicRequired": "Validierungslogik ist erforderlich.",
    "validationPriceRequired": "Preis ist erforderlich.",
    "validationCurrencyRequired": "Währung ist erforderlich.",
    "validationPaymentModelRequired": "Zahlungsmodell ist erforderlich."
  },
  
  pt: {
    "notifyCancel": "Cancelar",
    "notifyConfirm": "Confirmar",
    "loginRequiredTitle": "Login necessário",
    "loginRequiredMessage": "Você precisa estar logado para continuar.",
    "draftRequiredTitle": "Campos obrigatórios",
    "draftRequiredMessage": "Título e descrição são necessários para guardar um rascunho.",
    "draftSavedTitle": "Rascunho guardado",
    "draftSavedMessage": "Rascunho guardado com sucesso!",
    "draftUpdatedTitle": "Rascunho atualizado",
    "draftUpdatedMessage": "Rascunho atualizado com sucesso!",
    "draftSaveFailedTitle": "Falha ao guardar",
    "draftSaveFailedMessage": "Falha ao guardar o rascunho.",
    "draftSubmittedTitle": "Rascunho enviado",
    "draftSubmittedMessage": "Rascunho enviado para aprovação!",
    "draftReplaceTitle": "Substituir formulário?",
    "draftReplaceMessage": "O seu formulário atual contém dados. Deseja substituí-lo?",
    "draftNotFound": "Rascunho não encontrado.",
    "jobSubmittedTitle": "Vaga enviada",
    "jobSubmittedMessage": "Vaga enviada para aprovação!",
    "jobSaveFailedTitle": "Falha no envio",
    "jobSaveFailedMessage": "Falha ao enviar a vaga.",
    "jobPublishRequiredTitle": "Campos obrigatórios",
    "jobPublishRequiredMessage": "Preencha todos os campos obrigatórios antes de publicar.",
    "validationTitleRequired": "O título é obrigatório.",
    "validationDescriptionRequired": "A descrição é obrigatória.",
    "validationWorkNatureRequired": "A natureza do trabalho é obrigatória.",
    "validationCategoryRequired": "A categoria é obrigatória.",
    "validationStartDateRequired": "A data de início é obrigatória.",
    "validationEndDateRequired": "A data de fim é obrigatória.",
    "validationTimeFlexRequired": "A flexibilidade de horário é obrigatória.",
    "validationSkillRequired": "É necessária pelo menos uma habilidade.",
    "validationLanguageRequired": "É necessário pelo menos um idioma.",
    "validationExecutionEntityRequired": "A entidade de execução é obrigatória.",
    "validationTaskScaleRequired": "A escala da tarefa é obrigatória.",
    "validationWorkSettingRequired": "O ambiente de trabalho é obrigatório.",
    "validationWorkDynamicsRequired": "A dinâmica de trabalho é obrigatória.",
    "validationProofRequired": "O comprovante de conclusão é obrigatório.",
    "validationMaxExecutorsMin": "O máximo de executores deve ser pelo menos 1.",
    "validationValidationLogicRequired": "A lógica de validação é obrigatória.",
    "validationPriceRequired": "O preço é obrigatório.",
    "validationCurrencyRequired": "A moeda é obrigatória.",
    "validationPaymentModelRequired": "O modelo de pagamento é obrigatório."
  },
  
  ja: {
    "notifyCancel": "キャンセル",
    "notifyConfirm": "確認",
    "loginRequiredTitle": "ログインが必要です",
    "loginRequiredMessage": "続行するにはログインする必要があります。",
    "draftRequiredTitle": "必須項目",
    "draftRequiredMessage": "下書きを保存するにはタイトルと説明が必要です。",
    "draftSavedTitle": "下書きを保存しました",
    "draftSavedMessage": "下書きが正常に保存されました！",
    "draftUpdatedTitle": "下書きを更新しました",
    "draftUpdatedMessage": "下書きが正常に更新されました！",
    "draftSaveFailedTitle": "保存に失敗しました",
    "draftSaveFailedMessage": "下書きの保存に失敗しました。",
    "draftSubmittedTitle": "下書きを提出しました",
    "draftSubmittedMessage": "下書きが承認待ちとして提出されました！",
    "draftReplaceTitle": "フォームを置き換えますか？",
    "draftReplaceMessage": "現在のフォームにデータが含まれています。置き換えますか？",
    "draftNotFound": "下書きが見つかりません。",
    "jobSubmittedTitle": "求人を提出しました",
    "jobSubmittedMessage": "求人が承認待ちとして提出されました！",
    "jobSaveFailedTitle": "提出に失敗しました",
    "jobSaveFailedMessage": "求人の提出に失敗しました。",
    "jobPublishRequiredTitle": "必須項目",
    "jobPublishRequiredMessage": "公開する前にすべての必須項目を入力してください。",
    "validationTitleRequired": "タイトルは必須です。",
    "validationDescriptionRequired": "説明は必須です。",
    "validationWorkNatureRequired": "作業の性質は必須です。",
    "validationCategoryRequired": "カテゴリーは必須です。",
    "validationStartDateRequired": "開始日は必須です。",
    "validationEndDateRequired": "終了日は必須です。",
    "validationTimeFlexRequired": "時間の柔軟性は必須です。",
    "validationSkillRequired": "少なくとも1つのスキルが必要です。",
    "validationLanguageRequired": "少なくとも1つの言語が必要です。",
    "validationExecutionEntityRequired": "実行主体は必須です。",
    "validationTaskScaleRequired": "タスク規模は必須です。",
    "validationWorkSettingRequired": "作業環境は必須です。",
    "validationWorkDynamicsRequired": "作業ダイナミクスは必須です。",
    "validationProofRequired": "完了証明は必須です。",
    "validationMaxExecutorsMin": "最大実行人数は1以上である必要があります。",
    "validationValidationLogicRequired": "検証ロジックは必須です。",
    "validationPriceRequired": "価格は必須です。",
    "validationCurrencyRequired": "通貨は必須です。",
    "validationPaymentModelRequired": "支払いモデルは必須です。"
  },
  
  ru: {
    "notifyCancel": "Отмена",
    "notifyConfirm": "Подтвердить",
    "loginRequiredTitle": "Требуется вход",
    "loginRequiredMessage": "Вы должны войти в систему, чтобы продолжить.",
    "draftRequiredTitle": "Обязательные поля",
    "draftRequiredMessage": "Название и описание необходимы для сохранения черновика.",
    "draftSavedTitle": "Черновик сохранён",
    "draftSavedMessage": "Черновик успешно сохранён!",
    "draftUpdatedTitle": "Черновик обновлён",
    "draftUpdatedMessage": "Черновик успешно обновлён!",
    "draftSaveFailedTitle": "Ошибка сохранения",
    "draftSaveFailedMessage": "Не удалось сохранить черновик.",
    "draftSubmittedTitle": "Черновик отправлен",
    "draftSubmittedMessage": "Черновик отправлен на утверждение!",
    "draftReplaceTitle": "Заменить форму?",
    "draftReplaceMessage": "Ваша текущая форма содержит данные. Хотите заменить её?",
    "draftNotFound": "Черновик не найден.",
    "jobSubmittedTitle": "Вакансия отправлена",
    "jobSubmittedMessage": "Вакансия отправлена на утверждение!",
    "jobSaveFailedTitle": "Ошибка отправки",
    "jobSaveFailedMessage": "Не удалось отправить вакансию.",
    "jobPublishRequiredTitle": "Обязательные поля",
    "jobPublishRequiredMessage": "Пожалуйста, заполните все обязательные поля перед публикацией.",
    "validationTitleRequired": "Название обязательно.",
    "validationDescriptionRequired": "Описание обязательно.",
    "validationWorkNatureRequired": "Характер работы обязателен.",
    "validationCategoryRequired": "Категория обязательна.",
    "validationStartDateRequired": "Дата начала обязательна.",
    "validationEndDateRequired": "Дата окончания обязательна.",
    "validationTimeFlexRequired": "Гибкость времени обязательна.",
    "validationSkillRequired": "Требуется хотя бы один навык.",
    "validationLanguageRequired": "Требуется хотя бы один язык.",
    "validationExecutionEntityRequired": "Исполнитель обязателен.",
    "validationTaskScaleRequired": "Масштаб задачи обязателен.",
    "validationWorkSettingRequired": "Условия работы обязательны.",
    "validationWorkDynamicsRequired": "Динамика работы обязательна.",
    "validationProofRequired": "Подтверждение выполнения обязательно.",
    "validationMaxExecutorsMin": "Максимум исполнителей должен быть не менее 1.",
    "validationValidationLogicRequired": "Логика проверки обязательна.",
    "validationPriceRequired": "Цена обязательна.",
    "validationCurrencyRequired": "Валюта обязательна.",
    "validationPaymentModelRequired": "Модель оплаты обязательна."
  }
};

const msgInternship_translations = {
  en: {
    notifyCancel: "Cancel",
    notifyConfirm: "Confirm",

    loginRequiredTitle: "Login Required",
    loginRequiredMessage: "You must be logged in to continue.",

    draftRequiredTitle: "Required Fields",
    draftRequiredMessage: "Internship title and description are required to save a draft.",

    draftSavedTitle: "Draft saved",
    draftSavedMessage: "Draft saved successfully!",

    draftUpdatedTitle: "Draft updated",
    draftUpdatedMessage: "Draft updated successfully!",

    draftSaveFailedTitle: "Save failed",
    draftSaveFailedMessage: "Failed to save draft.",

    draftSubmittedTitle: "Draft submitted",
    draftSubmittedMessage: "Draft submitted for approval!",

    draftReplaceTitle: "Replace Form?",
    draftReplaceMessage: "Your current form contains data. Do you want to replace it?",

    draftNotFound: "Draft not found.",

    internshipSubmittedTitle: "Internship submitted",
    internshipSubmittedMessage: "Internship submitted for approval!",

    internshipSaveFailedTitle: "Submission failed",
    internshipSaveFailedMessage: "Failed to submit internship.",

    internshipPublishRequiredTitle: "Required Fields",
    internshipPublishRequiredMessage: "Please complete all required fields before publishing.",

    validationTitleRequired: "Internship title is required.",
    validationDescriptionRequired: "Internship description is required.",
    validationIndustryRequired: "Industry is required.",
    validationSpecialityRequired: "Speciality is required.",
    validationDeadlineRequired: "Application deadline is required.",

    validationSkillRequired: "At least one skill is required.",
    validationLanguageRequired: "At least one language is required.",

    validationAcademicRequired: "Academic requirement is required.",
    validationCreditRequired: "Credit eligibility is required.",

    validationWorkSettingRequired: "Work setting is required.",
    validationScheduleTypeRequired: "Schedule type is required.",

    validationLocationRequired: "Location is required for this work setting.",

    validationPositionsRequired: "Number of positions must be at least 1.",

    validationFeedbackFrequencyRequired: "Feedback frequency is required.",
    validationEvaluationFormatRequired: "Evaluation format is required.",
    validationCompletionRequirementRequired: "Completion requirement is required.",
    validationFinalOutputRequired: "Final output is required.",

    validationInternshipTypeRequired: "Internship type is required.",

    validationEndDateAfterStart: "End date must be after start date."
  },

};

const msgVolunteer_translations = {
  en: {
    notifyCancel: "Cancel",
    notifyConfirm: "Confirm",

    loginRequiredTitle: "Login Required",
    loginRequiredMessage: "You must be logged in to continue.",

    draftRequiredTitle: "Required Fields",
    draftRequiredMessage: "Volunteer title and description are required to save a draft.",

    draftSavedTitle: "Draft saved",
    draftSavedMessage: "Volunteer draft saved successfully!",

    draftUpdatedTitle: "Draft updated",
    draftUpdatedMessage: "Volunteer draft updated successfully!",

    draftSaveFailedTitle: "Save failed",
    draftSaveFailedMessage: "Failed to save volunteer draft.",

    draftSubmittedTitle: "Volunteer submitted",
    draftSubmittedMessage: "Volunteer submitted for approval!",

    draftReplaceTitle: "Replace Form?",
    draftReplaceMessage: "Your current form contains data. Do you want to replace it?",

    draftNotFound: "Draft not found.",

    volunteerSubmittedTitle: "Volunteer submitted",
    volunteerSubmittedMessage: "Volunteer submitted for approval!",

    volunteerSaveFailedTitle: "Submission failed",
    volunteerSaveFailedMessage: "Failed to submit volunteer.",

    volunteerPublishRequiredTitle: "Required Fields",
    volunteerPublishRequiredMessage: "Please complete all required fields before publishing.",

    validationTitleRequired: "Volunteer title is required.",
    validationDescriptionRequired: "Volunteer description is required.",
    validationIndustryRequired: "Industry is required.",
    validationSpecialityRequired: "Speciality is required.",

    validationDeadlineRequired: "Application deadline is required.",

    validationMinAgeRequired: "Minimum age is required.",

    validationSkillRequired: "At least one skill is required.",
    validationLanguageRequired: "At least one language is required.",

    validationWorkSettingRequired: "Volunteer setting is required.",
    validationCommitmentRequired: "Commitment is required.",

    validationPositionsRequired: "Number of positions must be at least 1.",

    validationLocationRequired: "Location is required for on-site or hybrid volunteering.",

    validationTermsRequired: "Volunteer terms are required.",

    validationEndDateAfterStart: "End date must be after start date."
  }
};

const msgChallenge_translations = {
  en: {
    notifyCancel: "Cancel",
    notifyConfirm: "Confirm",

    loginRequiredTitle: "Login Required",
    loginRequiredMessage: "You must be logged in to continue.",

    draftRequiredTitle: "Required Fields",
    draftRequiredMessage: "Challenge title and description are required to save a draft.",

    draftSavedTitle: "Draft saved",
    draftSavedMessage: "Challenge draft saved successfully!",

    draftUpdatedTitle: "Draft updated",
    draftUpdatedMessage: "Challenge draft updated successfully!",

    draftSaveFailedTitle: "Save failed",
    draftSaveFailedMessage: "Failed to save challenge draft.",

    draftSubmittedTitle: "Challenge submitted",
    draftSubmittedMessage: "Challenge submitted for approval!",

    draftReplaceTitle: "Replace Form?",
    draftReplaceMessage: "Your current challenge form contains data. Do you want to replace it?",

    draftNotFound: "Challenge draft not found.",

    challengeSubmittedTitle: "Challenge submitted",
    challengeSubmittedMessage: "Challenge submitted for approval!",

    challengeSaveFailedTitle: "Submission failed",
    challengeSaveFailedMessage: "Failed to submit challenge.",

    challengePublishRequiredTitle: "Required Fields",
    challengePublishRequiredMessage: "Please complete all required fields before publishing.",

    validationTitleRequired: "Challenge title is required.",
    validationDescriptionRequired: "Challenge description is required.",
    validationIndustryRequired: "Industry is required.",
    validationSpecialityRequired: "Speciality is required.",
    validationChallengeTypeRequired: "Challenge type is required.",
    validationDeadlineRequired: "Submission deadline is required.",
    validationParticipantsRequired: "Maximum participants must be at least 1.",

    validationMinAgeRequired: "Minimum age is required.",
    validationSkillRequired: "At least one skill is required.",
    validationLanguageRequired: "At least one language is required.",

    validationDifficultyRequired: "Difficulty level is required.",
    validationParticipationModeRequired: "Participation mode is required.",
    validationSubmissionFormatRequired: "Submission format is required.",
    validationBriefRequired: "Challenge brief is required.",

    validationWinnerSelectionRequired: "Winner selection is required.",
    validationWinnerCountRequired: "Number of winners must be at least 1.",

    validationRewardRequired: "Select at least one reward.",

    validationEndDateAfterStart: "End date must be after start date."
  }
};

const msgMentorship_translations = {
  en: {
    notifyCancel: "Cancel",
    notifyConfirm: "Confirm",

        loginRequiredTitle: "Login Required",
        loginRequiredMessage: "You must be logged in to continue.",

        draftRequiredTitle: "Required Fields",
        draftRequiredMessage: "Mentorship title and description are required to save a draft.",

        draftSavedTitle: "Draft Saved",
        draftSavedMessage: "Mentorship draft saved successfully!",

        draftUpdatedTitle: "Draft Updated",
        draftUpdatedMessage: "Mentorship draft updated successfully!",

        draftSaveFailedTitle: "Save Failed",
        draftSaveFailedMessage: "Failed to save mentorship draft.",

        draftNotFound: "Mentorship draft not found.",

        mentorshipSubmittedTitle: "Mentorship Submitted",
        mentorshipSubmittedMessage: "Mentorship submitted for approval!",

        mentorshipSaveFailedTitle: "Submission Failed",
        mentorshipSaveFailedMessage: "Failed to submit mentorship.",

        mentorshipPublishRequiredTitle: "Required Fields",
        mentorshipPublishRequiredMessage: "Please complete all required fields before publishing.",

        validationTitleRequired: "Program title is required.",
        validationDescriptionRequired: "Program description is required.",
        validationIndustryRequired: "Industry is required.",
        validationSpecialityRequired: "Speciality is required.",

        validationFocusRequired: "Mentorship focus is required.",

        validationSlotsRequired: "Available mentee slots must be at least 1.",

        validationMentorLevelRequired: "Mentor experience level is required.",

        validationSkillRequired: "At least one skill is required.",

        validationLanguageRequired: "At least one language is required.",

        validationSessionFormatRequired: "Session format is required.",

        validationMeetingModeRequired: "Meeting mode is required.",

        validationSessionsRequired: "Sessions per month must be at least 1.",

        validationDurationRequired: "Session duration must be greater than 0.",

        validationExpectationsRequired: "Mentorship expectations are required.",

        validationBenefitRequired: "Select at least one benefit.",

        validationEndDateAfterStart: "End date must be after the start date."

    }

};

const msgResearch_translations = {
    en: {

        notifyCancel: "Cancel",
        notifyConfirm: "Confirm",

        loginRequiredTitle: "Login Required",
        loginRequiredMessage: "You must be logged in to continue.",

        draftRequiredTitle: "Required Fields",
        draftRequiredMessage: "Research title and problem statement are required to save a draft.",

        draftSavedTitle: "Draft Saved",
        draftSavedMessage: "Research draft saved successfully!",

        draftUpdatedTitle: "Draft Updated",
        draftUpdatedMessage: "Research draft updated successfully!",

        draftSaveFailedTitle: "Save Failed",
        draftSaveFailedMessage: "Failed to save research draft.",

        draftNotFound: "Research draft not found.",

        researchSubmittedTitle: "Research Submitted",
        researchSubmittedMessage: "Research submitted for approval!",

        researchSaveFailedTitle: "Submission Failed",
        researchSaveFailedMessage: "Failed to submit research.",

        researchPublishRequiredTitle: "Required Fields",
        researchPublishRequiredMessage: "Please complete all required fields before publishing.",

        validationTitleRequired: "Research title is required.",

        validationProblemRequired: "Problem statement is required.",

        validationFieldRequired: "Research field is required.",

        validationDurationRequired: "Estimated duration must be at least 1 month.",

        validationHypothesisRequired: "Hypothesis is required.",

        validationMethodologyRequired: "Methodology is required.",

        validationResearchTypeRequired: "Research type is required.",

        validationSkillRequired: "At least one required skill is required.",

        validationLanguageRequired: "At least one language is required.",

        validationDataSourcesRequired: "Data sources are required.",

        validationDataTypeRequired: "Data type is required.",

        validationValidationMethodRequired: "Validation method is required.",

        validationOutputRequired: "Expected output is required.",

        validationPublicationRequired: "Publication target is required.",

        validationEndDateAfterStart: "End date must be after the start date."

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

const App_translations = {
  en: {
    "all-chooseTitle": "Include in CV",
    
    "tab-personal": "Personal",
    "tab-exp": "Experiences",
    "tab-edu": "Educations",
    "tab-cert": "Certifications",
    "tab-skills": "Skills & Languages",
    "tab-interests": "Interests",

    "personal-title": "Personal Information",
    "photo-label": "Profile Picture",
    "photo-tip": "Tip: Add a professional headshot to boost your profile visibility.",
    "fullname-label": "Full Name",
    "phone-label": "Phone Number",
    "email-label": "Email Address",
    "linkedin-label": "LinkedIn / Portfolio",
    "address-label": "Address (City/Country)",
    "speciality-label": "Speciality",
    "summary-label": "Professional Summary (3-5 lines)",

    "exp-title": "Work Experience",
    "exp-add": "Add Another Experience",
    "exp-jobtitle": "Job Title",
    "exp-company": "Company Name",
    "exp-start": "Start Date",
    "exp-end": "End Date",
    "exp-location": "Location",
    "exp-type": "Type of Job",
    "exp-type-placeholder": "CDD, Freelance, Internship, CDI...",
    "exp-resp": "Responsibilities & Achievements",
    "exp-choose": "Choose the right experiences for the job offer",
    "exp-unnamed": "Unnamed Job",

    "edu-title": "Education",
    "edu-add": "Add Another Education",
    "edu-degree": "Degree / Diploma",
    "edu-institution": "Institution",
    "edu-start": "Start Date",
    "edu-end": "End Date",
    "edu-location": "Location",
    "edu-honors": "Honors (optional)",
    "edu-choose": "Choose the right educations for the job offer",
    "edu-default": "Degree {n}",
    "edu-unnamed": "Unnamed Degree",

    "cert-title": "Courses & Certifications",
    "cert-add": "Add Another Course/Certification",
    "cert-desc": "Description / Course Title",
    "cert-institution": "Institution",
    "cert-id": "Certificate ID",
    "cert-start": "Start Date",
    "cert-end": "End Date",
    "cert-location": "Location",
    "cert-choose": "Choose the right certifications for the job offer",
    "cert-default": "Cert {n}",
    "cert-unnamed": "Unnamed Cert",

    "skills-title": "Skills",
    "skills-add-tech": "Add Technical Skill",
    "skills-title-lang": "Languages",
    "skills-add-lang": "Add Language",
    "skills-checkbox-tip": "Include this skill in CV",

    "interests-title": "Interests",
    "interests-add": "Add Interest",
    "interests-checkbox-tip": "Include this interest in CV",

    "import-excel": "Import my CV in XLS format",
    "browse": "Browse",
    "download-template": "Download Empty XLS Template",
  },

  fr: {
    "all-chooseTitle": "Inclure dans le CV",
    
    "tab-personal": "Informations personnelles",
    "tab-exp": "Expériences",
    "tab-edu": "Formations",
    "tab-cert": "Certifications",
    "tab-skills": "Compétences & Langues",
    "tab-interests": "Centres dintérêt",

    "personal-title": "Informations personnelles",
    "photo-label": "Photo de profil",
    "photo-tip": "Astuce : Ajoutez une photo professionnelle pour renforcer votre visibilité.",
    "fullname-label": "Nom complet",
    "phone-label": "Numéro de téléphone",
    "email-label": "Adresse e-mail",
    "linkedin-label": "LinkedIn / Portfolio",
    "address-label": "Adresse (Ville/Pays)",
    "speciality-label": "Spécialité",
    "summary-label": "Résumé professionnel (3-5 lignes)",

    "exp-title": "Expérience professionnelle",
    "exp-add": "Ajouter une autre expérience",
    "exp-jobtitle": "Intitulé du poste",
    "exp-company": "Nom de l'entreprise",
    "exp-start": "Date de début",
    "exp-end": "Date de fin",
    "exp-location": "Lieu",
    "exp-type": "Type de contrat",
    "exp-type-placeholder": "CDD, Freelance, Stage, CDI...",
    "exp-resp": "Responsabilités & Réalisations",
    "exp-choose": "Choisissez les expériences adaptées à l'offre d'emploi",
    "exp-unnamed": "Poste sans nom",

    "edu-title": "Formation",
    "edu-add": "Ajouter une autre formation",
    "edu-degree": "Diplôme / Certificat",
    "edu-institution": "Établissement",
    "edu-start": "Date de début",
    "edu-end": "Date de fin",
    "edu-location": "Lieu",
    "edu-honors": "Distinctions (optionnel)",
    "edu-choose": "Choisissez les formations adaptées à l'offre d'emploi",
    "edu-default": "Formation {n}",
    "edu-unnamed": "Formation sans nom",

    "cert-title": "Cours et Certifications",
    "cert-add": "Ajouter un autre cours/certification",
    "cert-desc": "Description / Intitulé du cours",
    "cert-institution": "Établissement",
    "cert-id": "Identifiant du certificat",
    "cert-start": "Date de début",
    "cert-end": "Date de fin",
    "cert-location": "Lieu",
    "cert-choose": "Choisissez les certifications adaptées à l'offre d'emploi",
    "cert-default": "Certif {n}",
    "cert-unnamed": "Certification sans nom",

    "skills-title": "Compétences",
    "skills-add-tech": "Ajouter une compétence technique",
    "skills-title-lang": "Langues",
    "skills-add-lang": "Ajouter une langue",
    "skills-checkbox-tip": "Inclure cette compétence dans le CV",

    "interests-title": "Centres d'intérêt",
    "interests-add": "Ajouter un centre d'intérêt",
    "interests-checkbox-tip": "Inclure cet intérêt dans le CV",
    "interests-placeholder": "Intérêt...",
    
    "import-excel": "Importer mon CV au format XLS",
    "browse": "Parcourir",
    "download-template": "Télécharger un modèle XLS vide",
  },

  ar: {
    "all-chooseTitle": "أدرج في السيرة الذاتية",
    
    "tab-personal": "المعلومات الشخصية",
    "tab-exp": "الخبرات",
    "tab-edu": "التعليم",
    "tab-cert": "الشهادات",
    "tab-skills": "المهارات واللغات",
    "tab-interests": "الاهتمامات",

    "personal-title": "المعلومات الشخصية",
    "photo-label": "الصورة الشخصية",
    "photo-tip": "نصيحة: أضف صورة احترافية لزيادة ظهورك.",
    "fullname-label": "الاسم الكامل",
    "phone-label": "رقم الهاتف",
    "email-label": "البريد الإلكتروني",
    "linkedin-label": "لينكدإن / معرض الأعمال",
    "address-label": "العنوان (المدينة/الدولة)",
    "speciality-label": "التخصص",
    "summary-label": "الملخص المهني (3-5 أسطر)",

    "exp-title": "الخبرة العملية",
    "exp-add": "إضافة خبرة أخرى",
    "exp-jobtitle": "المسمى الوظيفي",
    "exp-company": "اسم الشركة",
    "exp-start": "تاريخ البداية",
    "exp-end": "تاريخ الانتهاء",
    "exp-location": "الموقع",
    "exp-type": "نوع الوظيفة",
    "exp-type-placeholder": "عقد محدد, عمل حر, تدريب, عقد دائم...",
    "exp-resp": "المسؤوليات والإنجازات",
    "exp-choose": "اختر الخبرات المناسبة لعرض العمل",
    "exp-unnamed": "وظيفة غير مسماة",

    "edu-title": "التعليم",
    "edu-add": "إضافة تعليم آخر",
    "edu-degree": "الشهادة / الدبلوم",
    "edu-institution": "المؤسسة",
    "edu-start": "تاريخ البداية",
    "edu-end": "تاريخ الانتهاء",
    "edu-location": "الموقع",
    "edu-honors": "الجوائز (اختياري)",
    "edu-choose": "اختر التعليم المناسب لعرض العمل",
    "edu-default": "شهادة {n}",
    "edu-unnamed": "تعليم غير مسمى",

    "cert-title": "الدورات والشهادات",
    "cert-add": "إضافة دورة/شهادة أخرى",
    "cert-desc": "الوصف / عنوان الدورة",
    "cert-institution": "المؤسسة",
    "cert-id": "معرف الشهادة",
    "cert-start": "تاريخ البداية",
    "cert-end": "تاريخ الانتهاء",
    "cert-location": "الموقع",
    "cert-choose": "اختر الشهادات المناسبة لعرض العمل",
    "cert-default": "شهادة {n}",
    "cert-unnamed": "شهادة غير مسماة",

    "skills-title": "المهارات",
    "skills-add-tech": "إضافة مهارة تقنية",
    "skills-title-lang": "اللغات",
    "skills-add-lang": "إضافة لغة",
    "skills-checkbox-tip": "تضمين هذه المهارة في السيرة الذاتية",

    "interests-title": "الاهتمامات",
    "interests-add": "إضافة اهتمام",
    "interests-checkbox-tip": "تضمين هذا الاهتمام في السيرة الذاتية",

    "import-excel": "استيراد سيرتي الذاتية بصيغة XLS",
    "browse": "تصفح",
    "download-template": "تحميل نموذج XLS فارغ",
  },
  
  es: {
    "all-chooseTitle": "Incluir en CV",

    "tab-personal": "Personal",
    "tab-exp": "Experiencias",
    "tab-edu": "Educación",
    "tab-cert": "Certificaciones",
    "tab-skills": "Habilidades y Idiomas",
    "tab-interests": "Intereses",

    "personal-title": "Información Personal",
    "photo-label": "Foto de Perfil",
    "photo-tip": "Consejo: Agrega una foto profesional para aumentar la visibilidad de tu perfil.",
    "fullname-label": "Nombre Completo",
    "phone-label": "Número de Teléfono",
    "email-label": "Correo Electrónico",
    "linkedin-label": "LinkedIn / Portafolio",
    "address-label": "Dirección (Ciudad/País)",
    "speciality-label": "Especialidad",
    "summary-label": "Resumen Profesional (3-5 líneas)",

    "exp-title": "Experiencia Laboral",
    "exp-add": "Agregar Otra Experiencia",
    "exp-jobtitle": "Título del Puesto",
    "exp-company": "Nombre de la Empresa",
    "exp-start": "Fecha de Inicio",
    "exp-end": "Fecha de Fin",
    "exp-location": "Ubicación",
    "exp-type": "Tipo de Trabajo",
    "exp-type-placeholder": "Temporal, Freelance, Prácticas, Permanente...",
    "exp-resp": "Responsabilidades y Logros",
    "exp-choose": "Elige las experiencias adecuadas para la oferta de trabajo",
    "exp-unnamed": "Trabajo Sin Nombre",

    "edu-title": "Educación",
    "edu-add": "Agregar Otra Educación",
    "edu-degree": "Título / Diploma",
    "edu-institution": "Institución",
    "edu-start": "Fecha de Inicio",
    "edu-end": "Fecha de Fin",
    "edu-location": "Ubicación",
    "edu-honors": "Honores (opcional)",
    "edu-choose": "Elige la educación adecuada para la oferta de trabajo",
    "edu-default": "Título {n}",
    "edu-unnamed": "Título Sin Nombre",

    "cert-title": "Cursos y Certificaciones",
    "cert-add": "Agregar Otro Curso/Certificación",
    "cert-desc": "Descripción / Título del Curso",
    "cert-institution": "Institución",
    "cert-id": "ID del Certificado",
    "cert-start": "Fecha de Inicio",
    "cert-end": "Fecha de Fin",
    "cert-location": "Ubicación",
    "cert-choose": "Elige las certificaciones adecuadas para la oferta de trabajo",
    "cert-default": "Cert {n}",
    "cert-unnamed": "Certificación Sin Nombre",

    "skills-title": "Habilidades",
    "skills-add-tech": "Agregar Habilidad Técnica",
    "skills-title-lang": "Idiomas",
    "skills-add-lang": "Agregar Idioma",
    "skills-checkbox-tip": "Incluir esta habilidad en el CV",

    "interests-title": "Intereses",
    "interests-add": "Agregar Interés",
    "interests-checkbox-tip": "Incluir este interés en el CV",

    "import-excel": "Importar mi CV en formato XLS",
    "browse": "Explorar",
    "download-template": "Descargar plantilla XLS vacía",
  },
  
  zh: {
    "all-chooseTitle": "包含在简历中",

    "tab-personal": "个人信息",
    "tab-exp": "工作经验",
    "tab-edu": "教育经历",
    "tab-cert": "课程与证书",
    "tab-skills": "技能与语言",
    "tab-interests": "兴趣爱好",

    "personal-title": "个人信息",
    "photo-label": "头像",
    "photo-tip": "提示: 添加专业头像可提高简历的曝光度.",
    "fullname-label": "全名",
    "phone-label": "电话号码",
    "email-label": "电子邮箱",
    "linkedin-label": "LinkedIn / 作品集",
	  "address-label": "地址 (城市/国家)",
    "speciality-label": "专业方向",
    "summary-label": "职业总结 (3-5行)",

    "exp-title": "工作经验",
    "exp-add": "添加其他经验",
    "exp-jobtitle": "职位名称",
    "exp-company": "公司名称",
    "exp-start": "开始日期",
    "exp-end": "结束日期",
    "exp-location": "工作地点",
    "exp-type": "工作类型",
    "exp-type-placeholder": "固定期限合同, 自由职业, 实习, 永久合同...",
    "exp-resp": "职责与成就",
    "exp-choose": "为职位选择合适的经验",
    "exp-unnamed": "未命名职位",

    "edu-title": "教育经历",
    "edu-add": "添加其他教育经历",
    "edu-degree": "学位 / 文凭",
    "edu-institution": "学校/机构",
    "edu-start": "开始日期",
    "edu-end": "结束日期",
    "edu-location": "地点",
    "edu-honors": "荣誉（可选）",
    "edu-choose": "为职位选择合适的教育经历",
    "edu-default": "学位 {n}",
    "edu-unnamed": "未命名学位",

    "cert-title": "课程与证书",
    "cert-add": "添加其他课程/证书",
    "cert-desc": "描述 / 课程名称",
    "cert-institution": "机构",
    "cert-id": "证书编号",
    "cert-start": "开始日期",
    "cert-end": "结束日期",
    "cert-location": "地点",
    "cert-choose": "为职位选择合适的证书",
    "cert-default": "证书 {n}",
    "cert-unnamed": "未命名证书",

    "skills-title": "技能",
    "skills-add-tech": "添加技术技能",
    "skills-title-lang": "语言",
    "skills-add-lang": "添加语言",
    "skills-checkbox-tip": "在简历中包含此技能",

    "interests-title": "兴趣爱好",
    "interests-add": "添加兴趣",
    "interests-checkbox-tip": "在简历中包含此兴趣",

    "import-excel": "以 XLS 格式导入我的简历",
    "browse": "浏览",
    "download-template": "下载空白 XLS 模板",
  },
  
  de: {
    "all-chooseTitle": "Im Lebenslauf aufnehmen",

    "tab-personal": "Persönlich",
    "tab-exp": "Berufserfahrung",
    "tab-edu": "Bildung",
    "tab-cert": "Zertifikate",
    "tab-skills": "Fähigkeiten & Sprachen",
    "tab-interests": "Interessen",

    "personal-title": "Persönliche Informationen",
    "photo-label": "Profilbild",
    "photo-tip": "Tipp: Fügen Sie ein professionelles Foto hinzu, um Ihre Sichtbarkeit zu erhöhen.",
    "fullname-label": "Vollständiger Name",
    "phone-label": "Telefonnummer",
    "email-label": "E-Mail-Adresse",
    "linkedin-label": "LinkedIn / Portfolio",
    "address-label": "Adresse (Stadt/Land)",
    "speciality-label": "Fachrichtung",
    "summary-label": "Berufliche Zusammenfassung (3-5 Zeilen)",

    "exp-title": "Berufserfahrung",
    "exp-add": "Weitere Erfahrung hinzufügen",
    "exp-jobtitle": "Berufsbezeichnung",
    "exp-company": "Firmenname",
    "exp-start": "Startdatum",
    "exp-end": "Enddatum",
    "exp-location": "Ort",
    "exp-type": "Art der Anstellung",
    "exp-type-placeholder": "Befristet, Freelancer, Praktikum, Festanstellung...",
    "exp-resp": "Aufgaben & Erfolge",
    "exp-choose": "Wählen Sie passende Erfahrungen für die Stellenanzeige aus",
    "exp-unnamed": "Unbenannter Job",

    "edu-title": "Bildung",
    "edu-add": "Weitere Ausbildung hinzufügen",
    "edu-degree": "Abschluss / Diplom",
    "edu-institution": "Einrichtung",
    "edu-start": "Startdatum",
    "edu-end": "Enddatum",
    "edu-location": "Ort",
    "edu-honors": "Auszeichnungen (optional)",
    "edu-choose": "Wählen Sie passende Bildungsabschlüsse für die Stellenanzeige aus",
    "edu-default": "Abschluss {n}",
    "edu-unnamed": "Unbenannter Abschluss",

    "cert-title": "Kurse & Zertifikate",
    "cert-add": "Weiteren Kurs/Zertifikat hinzufügen",
    "cert-desc": "Beschreibung / Kurstitel",
    "cert-institution": "Einrichtung",
    "cert-id": "Zertifikats-ID",
    "cert-start": "Startdatum",
    "cert-end": "Enddatum",
    "cert-location": "Ort",
    "cert-choose": "Wählen Sie passende Zertifikate für die Stellenanzeige aus",
    "cert-default": "Zertifikat {n}",
    "cert-unnamed": "Unbenanntes Zertifikat",

    "skills-title": "Fähigkeiten",
    "skills-add-tech": "Technische Fähigkeit hinzufügen",
    "skills-title-lang": "Sprachen",
    "skills-add-lang": "Sprache hinzufügen",
    "skills-checkbox-tip": "Diese Fähigkeit im Lebenslauf aufnehmen",

    "interests-title": "Interessen",
    "interests-add": "Interesse hinzufügen",
    "interests-checkbox-tip": "Dieses Interesse im Lebenslauf aufnehmen",

    "import-excel": "Meinen Lebenslauf im XLS-Format importieren",
    "browse": "Durchsuchen",
    "download-template": "Leere XLS-Vorlage herunterladen",
  },
  
  pt: {
    "all-chooseTitle": "Incluir no CV",

    "tab-personal": "Pessoal",
    "tab-exp": "Experiências",
    "tab-edu": "Educação",
    "tab-cert": "Certificações",
    "tab-skills": "Habilidades & Idiomas",
    "tab-interests": "Interesses",

    "personal-title": "Informações Pessoais",
    "photo-label": "Foto de Perfil",
    "photo-tip": "Dica: Adicione uma foto profissional para aumentar a visibilidade do seu perfil.",
    "fullname-label": "Nome Completo",
    "phone-label": "Telefone",
    "email-label": "E-mail",
    "linkedin-label": "LinkedIn / Portfólio",
    "address-label": "Endereço (Cidade/País)",
    "speciality-label": "Especialidade",
    "summary-label": "Resumo Profissional (3-5 linhas)",

    "exp-title": "Experiência Profissional",
    "exp-add": "Adicionar Outra Experiência",
    "exp-jobtitle": "Cargo",
    "exp-company": "Empresa",
    "exp-start": "Data de Início",
    "exp-end": "Data de Término",
    "exp-location": "Localização",
    "exp-type": "Tipo de Emprego",
    "exp-type-placeholder": "Contrato Temporário, Freelancer, Estágio, Efetivo...",
    "exp-resp": "Responsabilidades & Realizações",
    "exp-choose": "Escolha as experiências certas para a vaga",
    "exp-unnamed": "Cargo Sem Nome",

    "edu-title": "Educação",
    "edu-add": "Adicionar Outra Educação",
    "edu-degree": "Grau / Diploma",
    "edu-institution": "Instituição",
    "edu-start": "Data de Início",
    "edu-end": "Data de Término",
    "edu-location": "Localização",
    "edu-honors": "Honras (opcional)",
    "edu-choose": "Escolha a educação adequada para a vaga",
    "edu-default": "Grau {n}",
    "edu-unnamed": "Grau Sem Nome",

    "cert-title": "Cursos & Certificações",
    "cert-add": "Adicionar Outro Curso/Certificação",
    "cert-desc": "Descrição / Título do Curso",
    "cert-institution": "Instituição",
    "cert-id": "ID do Certificado",
    "cert-start": "Data de Início",
    "cert-end": "Data de Término",
    "cert-location": "Localização",
    "cert-choose": "Escolha as certificações certas para a vaga",
    "cert-default": "Cert {n}",
    "cert-unnamed": "Certificação Sem Nome",

    "skills-title": "Habilidades",
    "skills-add-tech": "Adicionar Habilidade Técnica",
    "skills-title-lang": "Idiomas",
    "skills-add-lang": "Adicionar Idioma",
    "skills-checkbox-tip": "Incluir esta habilidade no CV",

    "interests-title": "Interesses",
    "interests-add": "Adicionar Interesse",
    "interests-checkbox-tip": "Incluir este interesse no CV",

    "import-excel": "Importar meu CV em formato XLS",
    "browse": "Procurar",
    "download-template": "Baixar modelo XLS vazio",
  },
  
  ja: {
    "all-chooseTitle": "履歴書に含める",

    "tab-personal": "個人情報",
    "tab-exp": "職務経験",
    "tab-edu": "学歴",
    "tab-cert": "資格・認定",
    "tab-skills": "スキル & 言語",
    "tab-interests": "興味・関心",

    "personal-title": "個人情報",
    "photo-label": "プロフィール写真",
    "photo-tip": "ヒント: プロフェッショナルな写真を追加して, プロフィールの視認性を高めましょう.",
    "fullname-label": "氏名",
    "phone-label": "電話番号",
    "email-label": "メールアドレス",
    "linkedin-label": "LinkedIn / ポートフォリオ",
    "address-label": "住所 (市/国)",
    "speciality-label": "専門分野",
    "summary-label": "職務概要 (3-5行)",

    "exp-title": "職務経験",
    "exp-add": "別の経験を追加",
    "exp-jobtitle": "役職名",
    "exp-company": "会社名",
    "exp-start": "開始日",
    "exp-end": "終了日",
    "exp-location": "勤務地",
    "exp-type": "雇用形態",
    "exp-type-placeholder": "契約社員、フリーランス, インターン、正社員...",
    "exp-resp": "職務内容・実績",
    "exp-choose": "求人に適した経験を選択してください",
    "exp-unnamed": "未記入の職務",

    "edu-title": "学歴",
    "edu-add": "別の学歴を追加",
    "edu-degree": "学位 / 資格",
    "edu-institution": "教育機関",
    "edu-start": "開始日",
    "edu-end": "終了日",
    "edu-location": "所在地",
    "edu-honors": "表彰 (任意)",
    "edu-choose": "求人に適した学歴を選択してください",
    "edu-default": "学位 {n}",
    "edu-unnamed": "未記入の学位",

    "cert-title": "コース・認定資格",
    "cert-add": "別のコース/認定資格を追加",
    "cert-desc": "説明 / コース名",
    "cert-institution": "教育機関",
    "cert-id": "認定ID",
    "cert-start": "開始日",
    "cert-end": "終了日",
    "cert-location": "場所",
    "cert-choose": "求人に適した資格を選択してください",
    "cert-default": "資格 {n}",
    "cert-unnamed": "未記入の資格",

    "skills-title": "スキル",
    "skills-add-tech": "技術スキルを追加",
    "skills-title-lang": "言語",
    "skills-add-lang": "言語を追加",
    "skills-checkbox-tip": "このスキルを履歴書に含める",

    "interests-title": "興味・関心",
    "interests-add": "興味を追加",
    "interests-checkbox-tip": "この興味を履歴書に含める",

    "import-excel": "XLS形式で履歴書をインポート",
    "browse": "参照",
    "download-template": "空のXLSテンプレートをダウンロード",
  },
  
  ru: {
    "all-chooseTitle": "Включить в резюме",

    "tab-personal": "Личные данные",
    "tab-exp": "Опыт работы",
    "tab-edu": "Образование",
    "tab-cert": "Курсы и сертификаты",
    "tab-skills": "Навыки и языки",
    "tab-interests": "Интересы",

    "personal-title": "Личная информация",
    "photo-label": "Фото профиля",
    "photo-tip": "Совет: добавьте профессиональное фото, чтобы повысить видимость профиля.",
    "fullname-label": "Полное имя",
    "phone-label": "Номер телефона",
    "email-label": "Адрес электронной почты",
    "linkedin-label": "LinkedIn / Портфолио",
    "address-label": "Адрес (Город/Страна)",
    "speciality-label": "Специальность",
    "summary-label": "Профессиональное резюме (3-5 строк)",

    "exp-title": "Опыт работы",
    "exp-add": "Добавить другой опыт",
    "exp-jobtitle": "Должность",
    "exp-company": "Название компании",
    "exp-start": "Дата начала",
    "exp-end": "Дата окончания",
    "exp-location": "Местоположение",
    "exp-type": "Тип занятости",
    "exp-type-placeholder": "Контракт, Фриланс, Стажировка, Постоянная работа...",
    "exp-resp": "Обязанности и достижения",
    "exp-choose": "Выберите подходящий опыт для этой вакансии",
    "exp-unnamed": "Безымянная должность",

    "edu-title": "Образование",
    "edu-add": "Добавить другое образование",
    "edu-degree": "Степень / Диплом",
    "edu-institution": "Учебное заведение",
    "edu-start": "Дата начала",
    "edu-end": "Дата окончания",
    "edu-location": "Местоположение",
    "edu-honors": "Награды (необязательно)",
    "edu-choose": "Выберите подходящее образование для этой вакансии",
    "edu-default": "Степень {n}",
    "edu-unnamed": "Безымянная степень",

    "cert-title": "Курсы и сертификаты",
    "cert-add": "Добавить другой курс/сертификат",
    "cert-desc": "Описание / Название курса",
    "cert-institution": "Учебное заведение",
    "cert-id": "ID сертификата",
    "cert-start": "Дата начала",
    "cert-end": "Дата окончания",
    "cert-location": "Местоположение",
    "cert-choose": "Выберите подходящие сертификаты для вакансии",
    "cert-default": "Сертификат {n}",
    "cert-unnamed": "Безымянный сертификат",

    "skills-title": "Навыки",
    "skills-add-tech": "Добавить технический навык",
    "skills-title-lang": "Языки",
    "skills-add-lang": "Добавить язык",
    "skills-checkbox-tip": "Включить этот навык в резюме",

    "interests-title": "Интересы",
    "interests-add": "Добавить интерес",
    "interests-checkbox-tip": "Включить этот интерес в резюме",

    "import-excel": "Импортировать резюме в формате XLS",
    "browse": "Обзор",
    "download-template": "Скачать пустой XLS шаблон",
  },
};