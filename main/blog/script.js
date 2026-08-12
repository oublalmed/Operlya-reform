// ================================= Import Firebase SDKs ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, increment, serverTimestamp, onSnapshot, query, orderBy, where, limit } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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

initOperlyaLayout();

onAuthStateChanged(auth, (user) => {
  if (user) {
    updateUserSection(user);
    loadUserReaction();
  } else {
    updateUserSection(null);
    loadUserReaction();
  }
});

async function updateUserSection(user) {
  const selectedLang = getCurrentLang();
  const t = cvbUserInfoTranslations[selectedLang] || cvbUserInfoTranslations['en'];
  const tUser = UserForm_translations[selectedLang] || UserForm_translations['en'];
  
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
              <img id="navbarAvatar" src="/images/default_avatar.png" alt="Avatar">
            </div>
            <div class="user-infoText">
              <span class="spanName">${firstName} ${lastName}</span>
              <span class="spanStatus">${userRole}</span>
            </div>
            <div class="notification-bell" id="notificationBell">
              <i class="ri-notification-3-line"></i>
              <span class="notif-count" id="notifCount">0</span>
            </div>
          </div>
          <div class="user-dropdown" id="userDropdown">
            <p><i class="ri-account-circle-fill"></i> ${firstName} ${lastName}</p>
            <p><i class="ri-mail-fill"></i> ${user.email}</p>
            <p><i class="ri-coin-fill"></i> <strong id="userCoinsLab">${t["userCoinsLabel"]}</strong> ${userCoins}</p>
            <button id="viewAccountBtn" class="nav_account-button">
              <i class="ri-user-line"></i> ${t["userAccount"]}
            </button>
            <button id="logoutBtn" class="nav_logout-button">
              <i class="ri-logout-circle-r-line"></i> ${t["userLogout"]}
            </button>
            <div class="notif-list" id="notifList"></div>
          </div>
        </div>
      `;
      
      initNotifications(user.uid);
      applyUserAvatar(avatarURL);

      const userInfoToggle = document.getElementById("userInfoToggle");
      const userDropdown = document.getElementById("userDropdown");
      const userInfoContainer = document.getElementById("userInfoContainer");

      userInfoToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
      });

      document.addEventListener("click", (e) => {
        if (!userInfoContainer.contains(e.target)) {
          userDropdown.classList.remove("show");
        }
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
    const p = Number(docSnap.data().coins_used ?? docSnap.data().coins ?? 0);
    consumedCoins += p;
  });

  return rewardsCoins - consumedCoins;
}

function applyUserAvatar(avatarUrl) {
  if (!avatarUrl) return;

  const navbarAvatar = document.getElementById("navbarAvatar");
  if (navbarAvatar) {
    navbarAvatar.src = avatarUrl;
  }
}

let unsubscribeNotifications = null;
function initNotifications(userId) {

  if (unsubscribeNotifications) {
    unsubscribeNotifications();
  }

  const notifRef = collection(db, "users", userId, "notifications");

  unsubscribeNotifications = onSnapshot(notifRef, async (snapshot) => {

    const notifList = document.getElementById("notifList");
    const notifCount = document.getElementById("notifCount");

    if (!notifList || !notifCount) return;

    notifList.innerHTML = "";

    let unread = 0;

    if (snapshot.empty) {
      notifList.innerHTML = `
        <div class="notif-empty">
          <i class="ri-notification-off-line"></i>
          No notifications
        </div>
      `;
      notifCount.style.display = "none";
      return;
    }

    const lang = getCurrentLang();
    const seen = new Set();
    const notifications = [];

    snapshot.forEach(docSnap => {
      const d = docSnap.data();

      const key = `${(d.title || "").trim().toLowerCase()}|${(d.message || d.notifText || "").trim().toLowerCase()}`;

      if (seen.has(key)) return;
      seen.add(key);

      notifications.push({
        id: docSnap.id,
        ...d
      });
    });

    notifications.sort((a, b) => {
      const ta = a.createdAt?.seconds || 0;
      const tb = b.createdAt?.seconds || 0;
      return tb - ta;
    });

    for (const data of notifications) {

      if (!data.read) unread++;

      const titleRaw = data.title || "Notification";
      const messageRaw = data.message || data.notifText || "";

      const title = await translateImportedText(titleRaw, lang);
      const message = await translateImportedText(messageRaw, lang);

      const cleanTitle = (title || "").replace(/\n/g, " ").trim();
      const cleanMessage = (message || "").replace(/\n/g, " ").trim();

      const item = document.createElement("div");
      item.className = "notif-item " + (!data.read ? "unread" : "");

      item.innerHTML = `
        <div class="notif-title">${cleanTitle}</div>
        <div class="notif-message">${cleanMessage}</div>
      `;

      item.onclick = async () => {
        try {
          if (!data.read) {
            const notifDoc = doc(db, "users", userId, "notifications", data.id);
            await updateDoc(notifDoc, { read: true });
          }
        } catch (err) {}

        if (data.link) {
          window.location.href = data.link;
        }
      };

      notifList.appendChild(item);
    }

    if (unread > 0) {
      notifCount.style.display = "block";
      notifCount.innerText = unread;
    } else {
      notifCount.style.display = "none";
    }

  });
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

function formatDate(value, t) {
  if (!value) return "";

  const date =
    typeof value?.toDate === "function"
      ? value.toDate()
      : new Date(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = t.months[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
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

// ================================ BLOG ====================================

function injectHeadAssets() {
  const head = document.head;

  const links = [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },

    { rel: "stylesheet", href: "/style/index.css" },
    { rel: "stylesheet", href: "/auth/login.css" },
    { rel: "stylesheet", href: "/style/forms.css" },
    { rel: "stylesheet", href: "/style/landing.css" },
    { rel: "stylesheet", href: "/u/account.css" },

    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/remixicon@4.1.0/fonts/remixicon.css" },
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/flag-icons/css/flag-icons.min.css" },

    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:wght@100..900&display=swap" },

    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@100..700&family=Tajawal:wght@200..900&display=swap"
    },

    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css",
      integrity: "sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==",
      crossorigin: "anonymous",
      referrerpolicy: "no-referrer"
    }
  ];

  links.forEach((l) => {
    const el = document.createElement("link");

    Object.entries(l).forEach(([key, value]) => {
      if (value !== "") el.setAttribute(key, value);
    });

    head.appendChild(el);
  });

  const scripts = [
    { src: "https://apis.google.com/js/api.js" }
  ];

  scripts.forEach((s) => {
    const el = document.createElement("script");
    el.src = s.src;
    el.async = true;
    head.appendChild(el);
  });
}

const BLOG_CONFIG = {
  file: window.location.pathname.split("/").pop(),
  title: null,
  badge: null,
  category: null,
  date: null,
};

export function initOperlyaLayout() {
  injectTopbar();
  injectHelpModal();
  injectNotification();
  injectLoginModal();
  injectFooter();
}

function injectTopbar() {
  const topbar = document.createElement("header");
  topbar.className = "cvb-topbar";

  topbar.innerHTML = `
    <div class="cvb-topbar-container">
        <div class="cvb-topbar-left">
        <a class="cvb-logo" href="/">
            <img src="/icons/operlya_favicon.png" alt="Operlya Logo" />
            <span class="cvb-logo-text">Operlya</span>
        </a>

        <button class="nav_helpButton" id="topBarHelp"><i class="ri-question-line"></i> Need Help?</button>
        </div>

        <div class="navbar-actionsRight">
        
        <div class="topbar-cta">
            <a href="/opportunities/create.html" data-title="postOpportunity" class="topbar-btn topbar-btn-primary">
            <i class="ri-add-circle-line"></i> Create Opportunity
            </a>

            <a href="/opportunities/execution.html" data-title="executionCenter" class="topbar-btn topbar-btn-outline">
            <i class="ri-timeline-view"></i> Execution Center
            </a>

            <a href="/talents/resume.html"  data-title="resumeBuilder" class="topbar-btn topbar-btn-outline">
            <i class="ri-file-list-3-line"></i> Resume Builder
            </a>
        </div>

        <div class="language-select" id="languageSelectorSidebar">
            <div class="selectedLanguage">
            <span class="fi fi-us"></span>
            <span class="lang-text">English</span>
            </div>
            <ul class="options">
            <li data-value="en"><span class="fi fi-us"></span> English</li>
            <li data-value="es"><span class="fi fi-es"></span> Español</li>
            <li data-value="zh"><span class="fi fi-cn"></span> 中文</li>
            <li data-value="fr"><span class="fi fi-fr"></span> Français</li>
            <li data-value="de"><span class="fi fi-de"></span> Deutsch</li>
            <li data-value="ar"><span class="fi fi-sa"></span> العربية</li>
            <li data-value="pt"><span class="fi fi-br"></span> Português</li>
            <li data-value="ja"><span class="fi fi-jp"></span> 日本語</li>
            <li data-value="ru"><span class="fi fi-ru"></span> Русский</li>
            </ul>
        </div>

        <div class="navbar-actions" id="navbarActions"></div>

        <div class="cvb-menu-toggle" id="cvb_menu_toggle">☰</div>
        </div>

    </div>

    <div class="cvb-topbar-containerMobile">
        <nav class="cvb-nav-mobile" id="cvb-default-navMobile">
        <ul>
            <li><a href="/opportunities/create.html" data-title="postOpportunity"><i class="ri-add-circle-line"></i> Create Opportunity</a></li>
            <li><a href="/opportunities/execution.html" data-title="executionCenter"><i class="ri-timeline-view"></i> Execution Center</a></li>
            <li><a href="/talents/resume.html" data-title="resumeBuilder"><i class="ri-user-3-line"></i> Resume Builder</a></li>
        </ul>
        </nav>
        <div class="cvb-mobileLeft">
        <div class="language-select mobile-lang" id="languageSelectorMobile">
            <div class="selectedLanguage">
            <span class="fi fi-us"></span>
            <span class="lang-text">English</span>
            </div>
            <ul class="options">
            <li data-value="en"><span class="fi fi-us"></span> English</li>
            <li data-value="es"><span class="fi fi-es"></span> Español</li>
            <li data-value="zh"><span class="fi fi-cn"></span> 中文</li>
            <li data-value="fr"><span class="fi fi-fr"></span> Français</li>
            <li data-value="de"><span class="fi fi-de"></span> Deutsch</li>
            <li data-value="ar"><span class="fi fi-sa"></span> العربية</li>
            <li data-value="pt"><span class="fi fi-br"></span> Português</li>
            <li data-value="ja"><span class="fi fi-jp"></span> 日本語</li>
            <li data-value="ru"><span class="fi fi-ru"></span> Русский</li>
            </ul>
        </div>
        <button class="nav_helpButton" id="openhelpMobile"><i class="ri-question-line"></i> Need Help?</button>
        </div>    
    </div>
  `;

  document.body.prepend(topbar);

  // Hook help button
  setTimeout(() => {
    document.getElementById("topBarHelp")?.addEventListener("click", () => {
      document.getElementById("helpModal").classList.add("active");
    });
  }, 0);
}

function injectHelpModal() {
  const modal = document.createElement("div");
  modal.id = "helpModal";
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
        
        <div class="modal-header">
        <h2>Need Help?</h2>

        <button class="close-icon" id="closeHelp" title="close help">
            <i class="ri-close-line"></i>
        </button>
        </div>

        <p class="modal-subtitle">
        We're here to support you. Choose a topic and tell us your issue.
        </p>

        <div class="modal-dropdown-wrapper">
        <i class="ri-arrow-down-s-line modal-dropdown-icon"></i>
        <select id="helpCategory" title="Help Category" class="modal-dropdown">
            <option value="" disabled selected>Select a category</option>
            <option value="account">Account & Login Issues</option>
            <option value="coins">Coins & Payments</option>
            <option value="builder">CV Builder Help</option>
            <option value="bug">Report a Bug</option>
        </select>
        </div>

        <div id="helpFormContainer">
        <input type="email" id="helpEmail" placeholder="Enter your email">
        <textarea id="helpMessage" placeholder="Write your message..." rows="4"></textarea>
        <button id="helpSendBtn">Send Message</button>
        </div>

    </div>
  `;

  document.body.appendChild(modal);

  // close logic
  setTimeout(() => {
    document.getElementById("closeHelp")?.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }, 0);
}

function injectNotification() {
  const modal = document.createElement("div");
  modal.id = "newTaskNotif";
  modal.className = "notify2-modal";

  modal.innerHTML = `
    <div class="notify2-content">
        <button title="Close Form" class="notify2-close-top" id="notifyCloseTop"><i class="ri-close-line"></i></button>
        <div class="notify2-icon" id="notifyIcon"></div>
        <h3 id="notifyTitle">Title</h3>
        <p id="notifyMessage">Message goes here</p>
        <div class="notify2-actions" id="notifyActions">
        <button class="notify2-btn notify2-btn-secondary" id="notifyCancel">Cancel</button>
        <button class="notify2-btn notify2-btn-primary" id="notifyConfirm">Reset settings</button>
        </div>
    </div>
  `;

  document.body.appendChild(modal);
}

function injectLoginModal() {
  const modal = document.createElement("div");
  modal.className = "loginModalPage";
  modal.id = "loginModalPage";
  document.body.appendChild(modal);
}

function injectFooter() {

  const footer = document.createElement("footer");
  footer.className = "operlya-footer";

  footer.innerHTML = `
    <div class="footer-container">

      <div class="footer-col brand">
        <div class="footer-logo">
          <img src="/icons/operlya_favicon.png" alt="Operlya logo">
          <span>Operlya</span>
        </div>

        <p>
          Build your resume, publish your professional profile,
          find opportunities, and manage real work — all in one platform.
        </p>

        <div class="footer-socials">
          <a title="X" href="https://x.com/operlya" target="_blank">
            <i class="ri-twitter-x-line"></i>
          </a>

          <a title="LinkedIn" href="https://linkedin.com/company/operlya/" target="_blank">
            <i class="ri-linkedin-line"></i>
          </a>

          <a title="Instagram" href="https://instagram.com/operlya" target="_blank">
            <i class="ri-instagram-line"></i>
          </a>

          <a title="TikTok" href="https://tiktok.com/operlyaa" target="_blank">
            <i class="ri-tiktok-line"></i>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <h4>Discover</h4>
        <a href="/talents/resume.html">Resume Builder</a>
        <a href="/feed.html">Opportunities</a>
      </div>

      <div class="footer-col">
        <h4>Resources</h4>
        <a href="/contact.html">Help Center</a>
        <a href="/career-tips.html">Career Tips</a>
        <a href="/resume-builder.html">ATS Resume Guide</a>
      </div>

      <div class="footer-col">
        <h4>Company</h4>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
        <a href="/privacy.html">Privacy Policy</a>
        <a href="/terms.html">Terms</a>
      </div>

      <div class="footer-col footer-cta">
        <h4>Start your career system</h4>

        <p>
          Create your profile and start getting opportunities today.
        </p>

        <a href="/talents/resume.html" class="btn-primary">
          <i class="ri-user-3-line"></i>
          Create Profile
        </a>
      </div>

    </div>

    <div class="footer-bottom">
      <p>© 2026 Operlya. All rights reserved.</p>

      <div class="footer-bottom-links">
        <a href="/privacy.html">Privacy</a>
        <a href="/terms.html">Terms</a>
        <a href="/cookies.html">Cookies</a>
      </div>
    </div>
  `;

  const blogContainer = document.getElementById("blog-container");

  if (blogContainer) {
    blogContainer.insertAdjacentElement("afterend", footer);
  } else {
    document.body.appendChild(footer);
  }
}

function injectBlogHero() {
  const blogPage = document.querySelector(".blog-page");
  const article = document.querySelector(".blog-content");

  if (!blogPage || !article) return;

  const h1 = article.querySelector("h1");

  const title = h1 ? h1.textContent.trim() : "Untitled Article";

  const paragraphs = article.querySelectorAll("p");
  const subtitle = paragraphs.length ? paragraphs[0].textContent.trim() : "";

  const keywords = extractKeywords(article);

  const date = extractDate();

  const wordCount = article.innerText.trim().split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200)) + " min read";

  const breadcrumb = `
    <div class="blog-breadcrumb">
      <a href="/">Home</a>
      <span>/</span>
      <a href="/blog.html">Blog</a>
      <span>/</span>
      <span>${title}</span>
    </div>
  `;

  const hero = document.createElement("div");
  hero.className = "blog-hero";

  hero.innerHTML = `
    ${breadcrumb}

    <div class="blog-hero-content">

      <div class="blog-badge">
        ${keywords.join(" • ") || "Operlya • Work System"}
      </div>

      <h1>${title}</h1>

      <p class="blog-subtitle">
        ${subtitle}
      </p>

      <div class="blog-meta">
        <span><i class="ri-calendar-line"></i> ${date}</span>
        <span><i class="ri-time-line"></i> ${readTime}</span>
        <span><i class="ri-folder-line"></i> ${keywords[0] || "Operations"}</span>
      </div>

    </div>
  `;

  blogPage.insertBefore(hero, article.parentElement);
}

function extractKeywords(article) {
  const text = article.innerText.toLowerCase();

  const keywords = [];

  const dictionary = [
    "operations",
    "opportunity",
    "work system",
    "career",
    "jobs",
    "execution",
    "productivity",
    "growth",
    "freelance",
    "automation",
  ];

  dictionary.forEach((k) => {
    if (text.includes(k)) {
      keywords.push(k.charAt(0).toUpperCase() + k.slice(1));
    }
  });

  return keywords.slice(0, 3);
}

function extractDate() {
  const file = window.location.pathname;

  const match = file.match(/(\d{4})-(\d{2})/);

  if (match) {
    const date = new Date(match[0] + "-01");
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }

  return "May 2026";
}

function generateHeadingIds() {
    document.querySelectorAll(".blog-content h2").forEach((heading) => {
        if (!heading.id) {
            heading.id = heading.textContent
                .toLowerCase()
                .replace(/[^\w\s]/g, "")
                .replace(/\s+/g, "-");
        }
    });
}

function generateBlogSidebar() {
    const lang = getCurrentLang();
    const t = blogTranslations[lang] || blogTranslations['en'];

    const blogLayout = document.querySelector(".blog-layout");
    const article = document.querySelector(".blog-content");

    if (!blogLayout || !article) return;

    const headings = article.querySelectorAll("h2");

    let tocLinks = "";

    headings.forEach((heading) => {
        tocLinks += `
            <a href="#${heading.id}">
                ${heading.textContent}
            </a>
        `;
    });

    const sidebar = document.createElement("aside");
    sidebar.className = "blog-sidebar";

    sidebar.innerHTML = `
        <div class="sidebar-card toc">
            <h3>${t.toc}</h3>
            ${tocLinks}
        </div>

        <div class="sidebar-card author">
            <img src="/icons/operlya_favicon.png" alt="Operlya">
            <h4>${t.aboutOperlya}</h4>
            <p>${t.aboutOperlyaDesc}</p>
        </div>

        <div class="sidebar-card cta">
            <h3>${t.startUsing}</h3>
            <p>${t.startUsingDesc}</p>
            <a href="/opportunities" class="sidebar-btn">${t.exploreOpportunities}</a>
        </div>

        <div class="sidebar-card related-posts">
            <h3>${t.relatedArticles}</h3>
            <div id="relatedArticles"></div>
        </div>
    `;

    blogLayout.appendChild(sidebar);
}

const blogArticles = [
  {
    title: "Operlya: A Different Way to Think About Work",
    url: "/blog/operlya-work-operating-system"
  },
  {
    title: "The Future of Work Is Not Tools — It’s Systems",
    url: "/blog/future-of-work-not-tools-systems"
  },
  {
    title: "The Hidden Reason Work Feels Broken",
    url: "/blog/why-work-feels-broken-work-operating-systems-future-of-productivity"
  }
];

function generateRelatedArticles() {
    const container = document.getElementById("relatedArticles");
    if (!container) return;
    container.innerHTML = blogArticles
        .map(article => `
            <a href="${article.url}">
                ${article.title}
            </a>
        `)
        .join("");
}

function injectBlogEngagement() {
    const lang = getCurrentLang();
    const t = blogTranslations[lang] || blogTranslations['en'];

    const article = document.querySelector(".blog-content");
    if (!article) return;

    const engagement = document.createElement("div");
    engagement.className = "blog-engagement";

    const url = window.location.href;

    engagement.innerHTML = `
        <div class="blog-engagementDiv">
            <div class="blog-feedback">
            <p>${t.helpful}</p>

            <div class="feedback-buttons">

                <button class="fb-btn reaction-btn" data-reaction="like" id="fbLike">
                    <i class="ri-thumb-up-line"></i>
                </button>

                <button class="fb-btn reaction-btn" data-reaction="love" id="fbLove">
                    <i class="ri-heart-line"></i>
                </button>

                <button class="fb-btn reaction-btn" data-reaction="insightful" id="fbInsightful">
                    <i class="ri-lightbulb-line"></i>
                </button>

                <button class="fb-btn reaction-btn" data-reaction="dislike" id="fbDislike">
                    <i class="ri-thumb-down-line"></i>
                </button>

            </div>

            <span id="fbResult" class="fb-result"></span>
            </div>

            <div class="blog-share">
                <button class="share-buttons" id="copyLink" data-share="copy">
                    <i class="ri-link"></i>
                </button>

                <button class="share-buttons" data-share="facebook">
                    <i class="ri-facebook-line"></i>
                </button>

                <button class="share-buttons" data-share="twitter">
                    <i class="ri-twitter-x-line"></i>
                </button>

                <button class="share-buttons" data-share="linkedin">
                    <i class="ri-linkedin-line"></i>
                </button>
            </div>
        </div>

        <div class="blog-cta">
        <h3>${t.ctaTitle}</h3>
        <p>${t.ctaDesc}</p>
        <a href="/feed.html" class="blog-cta-btn">${t.exploreOpportunities}</a>
        </div>
    `;

    article.appendChild(engagement);
    const result = document.getElementById("fbResult");

    // ================= EVENTS =================

    const reactionButtons = document.querySelectorAll(".reaction-btn");
    reactionButtons.forEach((btn) => {

        btn.addEventListener("click", async () => {
            const user = auth.currentUser;
            if (!user) {
                openLoginModal();
                return;
            }

            const reaction = btn.dataset.reaction;
            try {
                reactionButtons.forEach((b) =>
                    b.classList.remove("active")
                );
                btn.classList.add("active");
                const articleId = window.location.pathname.replace(/\//g, "_").replace(/^_/, "");
                await setDoc(
                doc(db, "profiles", user.uid, "engagements", `blog_${articleId}`),
                {
                    type: "blog_reaction",
                    reaction,
                    article: window.location.pathname,
                    createdAt: serverTimestamp()
                },
                );

                result.textContent = t.reactionSaved;
            } catch (err) {
                console.error(err);
                result.textContent = t.reactionFailed;
            }
        });
    });

    document.getElementById("copyLink")?.addEventListener("click", async () => {
        try {
        await navigator.clipboard.writeText(url);
        result.textContent = t.linkCopied;
        } catch {
        result.textContent = t.copyFailed;
        }
    });

    document.querySelectorAll(".share-buttons").forEach((btn) => {
    btn.addEventListener("click", async () => {

        const type = btn.dataset.share;

        switch (type) {

        case "facebook":
            window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank",
            "width=600,height=500"
            );
            break;

        case "twitter":
            window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(document.title)}`,
            "_blank",
            "width=600,height=500"
            );
            break;

        case "linkedin":
            window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            "_blank",
            "width=600,height=500"
            );
            break;

        case "copy":
            try {
            await navigator.clipboard.writeText(url);
            result.textContent = t.linkCopied;
            } catch {
            result.textContent = t.copyFailed;
            }
            break;
        }
    });
    });
}

async function loadUserReaction() {
  const user = auth.currentUser;
  if (!user) return;

  const articleId = window.location.pathname.replace(/\//g, "_").replace(/^_/, "");
  const reactionRef = doc(db, "profiles", user.uid, "engagements", `blog_${articleId}`);
  const snap = await getDoc(reactionRef);

  if (!snap.exists()) return;
  const reaction = snap.data().reaction;
  document
    .querySelector(
      `.reaction-btn[data-reaction="${reaction}"]`
    )
    ?.classList.add("active");
}

async function googleTranslateText(text, targetLang) {
  if (!text || targetLang === "en") return text;

  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
    );

    const data = await res.json();

    return data[0].map(x => x[0]).join("");
  } catch (err) {
    console.warn("Translation failed:", err);
    return text;
  }
}

async function translateBlogPage(lang) {
  const article = document.querySelector(".blog-content");
  const hero = document.querySelector(".blog-hero");
  const sidebar = document.querySelector(".blog-sidebar");
  const footer = document.querySelector(".operlya-footer");

  if (!article) return;

  // ================= HERO =================
  if (hero) {
    const h1 = hero.querySelector("h1");
    const subtitle = hero.querySelector(".blog-subtitle");
    const meta = hero.querySelector(".blog-meta");

    if (h1) h1.textContent = await googleTranslateText(h1.textContent, lang);
    if (subtitle) subtitle.textContent = await googleTranslateText(subtitle.textContent, lang);
    if (meta) {
      meta.querySelectorAll("span").forEach(async (el) => {
        el.textContent = await googleTranslateText(el.textContent, lang);
      });
    }
  }

  // ================= ARTICLE =================
  const elements = article.querySelectorAll("p, li, h2, h3, h4");

  for (const el of elements) {
    if (!el.dataset.original) {
      el.dataset.original = el.textContent;
    }

    el.textContent = await googleTranslateText(el.dataset.original, lang);
  }

  // ================= TABLE OF CONTENT =================
  const tocLinks = document.querySelectorAll(".blog-sidebar .toc a");

  tocLinks.forEach(async (link) => {
    if (!link.dataset.original) {
      link.dataset.original = link.textContent;
    }

    link.textContent = await googleTranslateText(link.dataset.original, lang);
  });

  // ================= SIDEBAR =================
  if (sidebar) {
    const sidebarTexts = sidebar.querySelectorAll("h3, h4, p, a");

    sidebarTexts.forEach(async (el) => {
      if (!el.dataset.original) {
        el.dataset.original = el.textContent;
      }

      el.textContent = await googleTranslateText(el.dataset.original, lang);
    });
  }

  // ================= FOOTER =================
  if (footer) {
    const footerTexts = footer.querySelectorAll("h4, p, a, span");

    footerTexts.forEach(async (el) => {
      if (!el.dataset.original) {
        el.dataset.original = el.textContent;
      }

      el.textContent = await googleTranslateText(el.dataset.original, lang);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
    injectHeadAssets();
    injectBlogHero();
    generateHeadingIds();
    generateBlogSidebar();
    generateRelatedArticles();
    injectBlogEngagement();
});

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
  translateBlogPage(lang);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        updateUserSection(user);
      } else {
        updateUserSection(null);
      }
    });
  translateHelpModal(lang);
  translateTopBar();
  translateFooter();

  document.dispatchEvent(new CustomEvent("languageChanged", {detail: { lang }}));
}

const cvbTopBarTranslations = {
  en: {
    help: "Need Help?",
    postOpportunity: "Create Opportunity",
    executionCenter: "Execution Center",
    opportunitiesManager: "Opportunities Manager",
    resumeBuilder: "Resume Builder",
    opportunitiesExplorer: "Opportunities Explorer"
  },

  fr: {
    help: "Besoin d'aide ?",
    postOpportunity: "Publier une opportunité",
    executionCenter: "Centre d'exécution",
    opportunitiesManager: "Gestionnaire d'opportunités",
    resumeBuilder: "Créateur de CV",
    opportunitiesExplorer: "Explorateur d'opportunités"
  },

  ar: {
    help: "تحتاج مساعدة؟",
    postOpportunity: "نشر فرصة",
    executionCenter: "مركز التنفيذ",
    opportunitiesManager: "مدير الفرص",
    resumeBuilder: "منشئ السيرة الذاتية",
    opportunitiesExplorer: "مستكشف الفرص"
  },

  es: {
    help: "¿Necesitas ayuda?",
    postOpportunity: "Publicar oportunidad",
    executionCenter: "Centro de ejecución",
    opportunitiesManager: "Gestor de oportunidades",
    resumeBuilder: "Creador de currículum",
    opportunitiesExplorer: "Explorador de oportunidades"
  },

  de: {
    help: "Brauchst du Hilfe?",
    postOpportunity: "Opportunität erstellen",
    executionCenter: "Ausführungszentrum",
    opportunitiesManager: "Opportunitäten-Manager",
    resumeBuilder: "Lebenslauf-Ersteller",
    opportunitiesExplorer: "Opportunitäten-Explorer"
  },

  pt: {
    help: "Precisa de ajuda?",
    postOpportunity: "Publicar oportunidade",
    executionCenter: "Centro de execução",
    opportunitiesManager: "Gerente de oportunidades",
    resumeBuilder: "Criador de currículo",
    opportunitiesExplorer: "Explorador de oportunidades"
  },

  zh: {
    help: "需要帮助？",
    postOpportunity: "发布机会",
    executionCenter: "执行中心",
    opportunitiesManager: "机会管理器",
    resumeBuilder: "简历生成器",
    opportunitiesExplorer: "机会浏览器"
  },

  ja: {
    help: "サポートが必要ですか？",
    postOpportunity: "機会を投稿",
    executionCenter: "実行センター",
    opportunitiesManager: "機会マネージャー",
    resumeBuilder: "履歴書ビルダー",
    opportunitiesExplorer: "機会エクスプローラー"
  },

  ru: {
    help: "Нужна помощь?",
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

// =============================== TRANSLATIONS WORDS ================================

const cvbUserInfoTranslations = {
  en: {
    "userlogin": "Login",
    "userAccount": "User Account",
    "userLogout": "Logout",
    "userCoinsLabel": "Coins:"
  },
  fr: {
    "userlogin": "Connexion",
    "userAccount": "Compte utilisateur",
    "userLogout": "Déconnexion",
    "userCoinsLabel": "Pièces :"
  },
  es: {
    "userlogin": "Iniciar sesión",
    "userAccount": "Cuenta de usuario",
    "userLogout": "Cerrar sesión",
    "userCoinsLabel": "Monedas:"
  },
  de: {
    "userlogin": "Anmelden",
    "userAccount": "Benutzerkonto",
    "userLogout": "Abmelden",
    "userCoinsLabel": "Münzen:"
  },
  ar: {
    "userlogin": "تسجيل الدخول",
    "userAccount": "حساب المستخدم",
    "userLogout": "تسجيل الخروج",
    "userCoinsLabel": "العملات:"
  },
  pt: {
    "userlogin": "Entrar",
    "userAccount": "Conta do usuário",
    "userLogout": "Sair",
    "userCoinsLabel": "Moedas:"
  },
  ja: {
    "userlogin": "ログイン",
    "userAccount": "ユーザーアカウント",
    "userLogout": "ログアウト",
    "userCoinsLabel": "コイン:"
  },
  zh: {
    "userlogin": "登录",
    "userAccount": "用户账户",
    "userLogout": "退出登录",
    "userCoinsLabel": "币:"
  },
  ru: {
    "userlogin": "Войти",
    "userAccount": "Учетная запись пользователя",
    "userLogout": "Выйти",
    "userCoinsLabel": "Монеты:"
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
    "operlya-member": "Operlya Member",
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
    "operlya-member": "Membre Operlya",
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
    "operlya-member": "عضو أوبيرليا",
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
    "operlya-member": "Miembro de Operlya",
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
    "operlya-member": "Operlya成员",
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
    "operlya-member": "Operlya-Mitglied",
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
    "operlya-member": "Membro Operlya",
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
    "operlya-member": "Operlyaメンバー",
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
    "operlya-member": "Участник Operlya",
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

const blogTranslations = {
  en: {
    // Hero
    home: "Home",
    blog: "Blog",
    minRead: "min read",
    // Sidebar
    toc: "Table of Contents",
    aboutOperlya: "About Operlya",
    aboutOperlyaDesc: "Building the operating system for opportunities, work execution and growth.",
    startUsing: "Start Using Operlya",
    startUsingDesc: "Create your profile and discover opportunities.",
    exploreOpportunities: "Explore Opportunities",
    relatedArticles: "Related Articles",
    // Engagement
    helpful: "Was this helpful?",
    reactionSaved: "Reaction saved",
    reactionFailed: "Failed to save reaction",
    linkCopied: "Link copied!",
    copyFailed: "Copy failed",
    // CTA
    ctaTitle: "Start building your work system today",
    ctaDesc: "Discover real opportunities and manage execution inside Operlya.",
    // Footer
    footerDesc: "Build your resume, publish your professional profile, find opportunities, and manage real work — all in one platform.",
    discover: "Discover",
    resources: "Resources",
    company: "Company",
    publicProfiles: "Public Profiles",
    workManagement: "Work Management",
    howItWorks: "How it works",
    helpCenter: "Help Center",
    careerTips: "Career Tips",
    atsGuide: "ATS Resume Guide",
    about: "About",
    contact: "Contact",
    privacy: "Privacy Policy",
    terms: "Terms",
    cookies: "Cookies",
    careerSystem: "Start your career system",
    careerSystemDesc: "Create your profile and start getting opportunities today.",
    createProfile: "Create Profile",
    rightsReserved: "All rights reserved."
  },
  fr: {
    home: "Accueil",
    blog: "Blog",
    minRead: "min de lecture",
    toc: "Table des matières",
    aboutOperlya: "À propos d'Operlya",
    aboutOperlyaDesc: "Le système d'exploitation pour les opportunités, l'exécution du travail et la croissance.",
    startUsing: "Commencer avec Operlya",
    startUsingDesc: "Créez votre profil et découvrez des opportunités.",
    exploreOpportunities: "Explorer les opportunités",
    relatedArticles: "Articles similaires",
    helpful: "Cet article vous a-t-il aidé ?",
    reactionSaved: "Réaction enregistrée",
    reactionFailed: "Échec de l'enregistrement",
    linkCopied: "Lien copié !",
    copyFailed: "Échec de la copie",
    ctaTitle: "Commencez à construire votre système de travail",
    ctaDesc: "Découvrez de vraies opportunités et gérez l'exécution dans Operlya.",
    footerDesc: "Créez votre CV, publiez votre profil professionnel, trouvez des opportunités et gérez votre travail depuis une seule plateforme.",
    discover: "Découvrir",
    resources: "Ressources",
    company: "Entreprise",
    publicProfiles: "Profils publics",
    workManagement: "Gestion du travail",
    howItWorks: "Comment ça marche",
    helpCenter: "Centre d'aide",
    careerTips: "Conseils carrière",
    atsGuide: "Guide CV ATS",
    about: "À propos",
    contact: "Contact",
    privacy: "Politique de confidentialité",
    terms: "Conditions",
    cookies: "Cookies",
    careerSystem: "Démarrez votre système de carrière",
    careerSystemDesc: "Créez votre profil et commencez à recevoir des opportunités.",
    createProfile: "Créer un profil",
    rightsReserved: "Tous droits réservés."
  },
  ar: {
    home: "الرئيسية",
    blog: "المدونة",
    minRead: "دقائق قراءة",
    toc: "جدول المحتويات",
    aboutOperlya: "حول Operlya",
    aboutOperlyaDesc: "نظام التشغيل للفرص وإدارة العمل والنمو.",
    startUsing: "ابدأ باستخدام Operlya",
    startUsingDesc: "أنشئ ملفك الشخصي واكتشف الفرص.",
    exploreOpportunities: "استكشف الفرص",
    relatedArticles: "مقالات ذات صلة",
    helpful: "هل كان هذا مفيدًا؟",
    reactionSaved: "تم حفظ التفاعل",
    reactionFailed: "فشل حفظ التفاعل",
    linkCopied: "تم نسخ الرابط",
    copyFailed: "فشل النسخ",
    ctaTitle: "ابدأ ببناء نظام عملك اليوم",
    ctaDesc: "اكتشف فرصًا حقيقية وأدر التنفيذ داخل Operlya.",
    footerDesc: "أنشئ سيرتك الذاتية، وانشر ملفك المهني، واعثر على الفرص وأدر عملك من منصة واحدة.",
    discover: "اكتشف",
    resources: "الموارد",
    company: "الشركة",
    publicProfiles: "الملفات العامة",
    workManagement: "إدارة العمل",
    howItWorks: "كيف يعمل",
    helpCenter: "مركز المساعدة",
    careerTips: "نصائح مهنية",
    atsGuide: "دليل السيرة الذاتية ATS",
    about: "حول",
    contact: "اتصل بنا",
    privacy: "سياسة الخصوصية",
    terms: "الشروط",
    cookies: "ملفات تعريف الارتباط",
    careerSystem: "ابدأ نظامك المهني",
    careerSystemDesc: "أنشئ ملفك الشخصي وابدأ بالحصول على الفرص.",
    createProfile: "إنشاء ملف شخصي",
    rightsReserved: "جميع الحقوق محفوظة."
  },
  es: {
    home: "Inicio",
    blog: "Blog",
    minRead: "min de lectura",
    toc: "Tabla de contenido",
    aboutOperlya: "Acerca de Operlya",
    aboutOperlyaDesc: "El sistema operativo para oportunidades, ejecución de trabajo y crecimiento.",
    startUsing: "Empieza a usar Operlya",
    startUsingDesc: "Crea tu perfil y descubre oportunidades.",
    exploreOpportunities: "Explorar oportunidades",
    relatedArticles: "Artículos relacionados",
    helpful: "¿Te fue útil?",
    reactionSaved: "Reacción guardada",
    reactionFailed: "Error al guardar la reacción",
    linkCopied: "¡Enlace copiado!",
    copyFailed: "Error al copiar",
    ctaTitle: "Comienza a construir tu sistema de trabajo hoy",
    ctaDesc: "Descubre oportunidades reales y gestiona la ejecución dentro de Operlya.",
    footerDesc: "Crea tu currículum, publica tu perfil profesional, encuentra oportunidades y gestiona trabajo real, todo en una plataforma.",
    discover: "Descubrir",
    resources: "Recursos",
    company: "Empresa",
    publicProfiles: "Perfiles públicos",
    workManagement: "Gestión de trabajo",
    howItWorks: "Cómo funciona",
    helpCenter: "Centro de ayuda",
    careerTips: "Consejos profesionales",
    atsGuide: "Guía de currículum ATS",
    about: "Acerca de",
    contact: "Contacto",
    privacy: "Política de privacidad",
    terms: "Términos",
    cookies: "Cookies",
    careerSystem: "Inicia tu sistema profesional",
    careerSystemDesc: "Crea tu perfil y comienza a recibir oportunidades hoy.",
    createProfile: "Crear perfil",
    rightsReserved: "Todos los derechos reservados."
  },
  zh: {
    home: "首页",
    blog: "博客",
    minRead: "分钟阅读",
    toc: "目录",
    aboutOperlya: "关于 Operlya",
    aboutOperlyaDesc: "为机会、工作执行和增长构建的操作系统。",
    startUsing: "开始使用 Operlya",
    startUsingDesc: "创建您的个人资料并发现机会。",
    exploreOpportunities: "探索机会",
    relatedArticles: "相关文章",
    helpful: "这对您有帮助吗？",
    reactionSaved: "反馈已保存",
    reactionFailed: "保存反馈失败",
    linkCopied: "链接已复制！",
    copyFailed: "复制失败",
    ctaTitle: "立即开始构建您的工作系统",
    ctaDesc: "在 Operlya 中发现真实机会并管理工作执行。",
    footerDesc: "在一个平台上构建您的简历、发布您的专业档案、寻找机会并管理工作。",
    discover: "发现",
    resources: "资源",
    company: "公司",
    publicProfiles: "公开档案",
    workManagement: "工作管理",
    howItWorks: "工作原理",
    helpCenter: "帮助中心",
    careerTips: "职业建议",
    atsGuide: "ATS 简历指南",
    about: "关于我们",
    contact: "联系我们",
    privacy: "隐私政策",
    terms: "服务条款",
    cookies: "Cookie 政策",
    careerSystem: "启动您的职业系统",
    careerSystemDesc: "创建您的档案，立即开始获取机会。",
    createProfile: "创建档案",
    rightsReserved: "保留所有权利。"
  },
  de: {
    home: "Startseite",
    blog: "Blog",
    minRead: "Min. Lesezeit",
    toc: "Inhaltsverzeichnis",
    aboutOperlya: "Über Operlya",
    aboutOperlyaDesc: "Das Betriebssystem für Chancen, Arbeitsausführung und Wachstum.",
    startUsing: "Loslegen mit Operlya",
    startUsingDesc: "Erstellen Sie Ihr Profil und entdecken Sie Möglichkeiten.",
    exploreOpportunities: "Möglichkeiten entdecken",
    relatedArticles: "Ähnliche Artikel",
    helpful: "War das hilfreich?",
    reactionSaved: "Reaktion gespeichert",
    reactionFailed: "Speichern fehlgeschlagen",
    linkCopied: "Link kopiert!",
    copyFailed: "Kopieren fehlgeschlagen",
    ctaTitle: "Starten Sie noch heute Ihr Arbeitssystem",
    ctaDesc: "Entdecken Sie echte Chancen und verwalten Sie die Ausführung in Operlya.",
    footerDesc: "Erstellen Sie Ihren Lebenslauf, veröffentlichen Sie Ihr berufliches Profil, finden Sie Chancen und verwalten Sie echte Arbeit – alles auf einer Plattform.",
    discover: "Entdecken",
    resources: "Ressourcen",
    company: "Unternehmen",
    publicProfiles: "Öffentliche Profile",
    workManagement: "Arbeitsverwaltung",
    howItWorks: "So funktioniert's",
    helpCenter: "Hilfezentrum",
    careerTips: "Karrieretipps",
    atsGuide: "ATS-Lebenslauf-Ratgeber",
    about: "Über uns",
    contact: "Kontakt",
    privacy: "Datenschutz",
    terms: "AGB",
    cookies: "Cookies",
    careerSystem: "Starten Sie Ihr Karrieresystem",
    careerSystemDesc: "Erstellen Sie Ihr Profil und erhalten Sie noch heute Chancen.",
    createProfile: "Profil erstellen",
    rightsReserved: "Alle Rechte vorbehalten."
  },
  pt: {
    home: "Início",
    blog: "Blog",
    minRead: "min de leitura",
    toc: "Índice",
    aboutOperlya: "Sobre a Operlya",
    aboutOperlyaDesc: "O sistema operacional para oportunidades, execução de trabalho e crescimento.",
    startUsing: "Começar a usar Operlya",
    startUsingDesc: "Crie seu perfil e descubra oportunidades.",
    exploreOpportunities: "Explorar oportunidades",
    relatedArticles: "Artigos relacionados",
    helpful: "Isso foi útil?",
    reactionSaved: "Reação salva",
    reactionFailed: "Falha ao salvar reação",
    linkCopied: "Link copiado!",
    copyFailed: "Falha ao copiar",
    ctaTitle: "Comece a construir seu sistema de trabalho hoje",
    ctaDesc: "Descubra oportunidades reais e gerencie a execução dentro da Operlya.",
    footerDesc: "Crie seu currículo, publique seu perfil profissional, encontre oportunidades e gerencie o trabalho real — tudo em uma plataforma.",
    discover: "Descobrir",
    resources: "Recursos",
    company: "Empresa",
    publicProfiles: "Perfis públicos",
    workManagement: "Gestão de trabalho",
    howItWorks: "Como funciona",
    helpCenter: "Central de ajuda",
    careerTips: "Dicas de carreira",
    atsGuide: "Guia de currículo ATS",
    about: "Sobre",
    contact: "Contato",
    privacy: "Política de privacidade",
    terms: "Termos",
    cookies: "Cookies",
    careerSystem: "Inicie seu sistema de carreira",
    careerSystemDesc: "Crie seu perfil e comece a receber oportunidades hoje.",
    createProfile: "Criar perfil",
    rightsReserved: "Todos os direitos reservados."
  },
  ja: {
    home: "ホーム",
    blog: "ブログ",
    minRead: "分で読める",
    toc: "目次",
    aboutOperlya: "Operlyaについて",
    aboutOperlyaDesc: "機会、仕事の実行、成長のためのオペレーティングシステム。",
    startUsing: "Operlyaを使い始める",
    startUsingDesc: "プロフィールを作成して機会を発見しましょう。",
    exploreOpportunities: "機会を探す",
    relatedArticles: "関連記事",
    helpful: "参考になりましたか？",
    reactionSaved: "リアクションを保存しました",
    reactionFailed: "リアクションの保存に失敗しました",
    linkCopied: "リンクをコピーしました！",
    copyFailed: "コピーに失敗しました",
    ctaTitle: "今すぐワークシステムを構築しましょう",
    ctaDesc: "Operlyaで実際の機会を見つけ、実行を管理しましょう。",
    footerDesc: "履歴書の作成、プロフェッショナルプロフィールの公開、機会の発見、実際の仕事の管理をすべて1つのプラットフォームで。",
    discover: "発見",
    resources: "リソース",
    company: "会社情報",
    publicProfiles: "公開プロフィール",
    workManagement: "業務管理",
    howItWorks: "仕組み",
    helpCenter: "ヘルプセンター",
    careerTips: "キャリアのヒント",
    atsGuide: "ATS履歴書ガイド",
    about: "会社概要",
    contact: "お問い合わせ",
    privacy: "プライバシーポリシー",
    terms: "利用規約",
    cookies: "クッキーポリシー",
    careerSystem: "キャリアシステムを始める",
    careerSystemDesc: "プロフィールを作成して、今すぐ機会を手に入れましょう。",
    createProfile: "プロフィール作成",
    rightsReserved: "無断転載を禁じます。"
  },
  ru: {
    home: "Главная",
    blog: "Блог",
    minRead: "мин чтения",
    toc: "Содержание",
    aboutOperlya: "Об Operlya",
    aboutOperlyaDesc: "Операционная система для возможностей, выполнения работы и роста.",
    startUsing: "Начать использовать Operlya",
    startUsingDesc: "Создайте профиль и откройте для себя возможности.",
    exploreOpportunities: "Изучить возможности",
    relatedArticles: "Похожие статьи",
    helpful: "Было ли это полезно?",
    reactionSaved: "Реакция сохранена",
    reactionFailed: "Не удалось сохранить реакцию",
    linkCopied: "Ссылка скопирована!",
    copyFailed: "Не удалось скопировать",
    ctaTitle: "Начните строить свою рабочую систему сегодня",
    ctaDesc: "Откройте для себя реальные возможности и управляйте выполнением в Operlya.",
    footerDesc: "Создайте резюме, опубликуйте профессиональный профиль, найдите возможности и управляйте реальной работой — все на одной платформе.",
    discover: "Открыть",
    resources: "Ресурсы",
    company: "Компания",
    publicProfiles: "Публичные профили",
    workManagement: "Управление работой",
    howItWorks: "Как это работает",
    helpCenter: "Справочный центр",
    careerTips: "Карьерные советы",
    atsGuide: "Руководство по ATS-резюме",
    about: "О нас",
    contact: "Контакты",
    privacy: "Политика конфиденциальности",
    terms: "Условия",
    cookies: "Файлы cookie",
    careerSystem: "Запустите свою карьерную систему",
    careerSystemDesc: "Создайте профиль и начните получать возможности уже сегодня.",
    createProfile: "Создать профиль",
    rightsReserved: "Все права защищены."
  }
};