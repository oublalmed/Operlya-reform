// ================================= Import Firebase SDKs ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, serverTimestamp, onSnapshot, updateDoc, where, query, orderBy, limit, startAfter } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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
onAuthStateChanged(auth, (user) => {
  if (user) {
    updateUserSection(user);
  } else {
    updateUserSection(null);
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
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/auth/login.html';
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

  const navbarAvatar = document.getElementById("navbarAvatar");
  if (navbarAvatar) {
    navbarAvatar.src = avatarUrl;
  }
}

function initNotifications(userId) {

  const notifRef = collection(db, "users", userId, "notifications");

  onSnapshot(notifRef, (snapshot) => {

    const notifList = document.getElementById("notifList");
    const notifCount = document.getElementById("notifCount");

    if (!notifItems || !notifCount) return;

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

    // Convert snapshot to array
    const notifications = [];

    snapshot.forEach(docSnap => {
      notifications.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Sort by createdAt DESC (newest first)
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

      notifList.appendChild(item);
    });

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


document.querySelectorAll('.cvb-template-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const template = btn.dataset.template;
    window.location.href = `/talents/resume.html?template=${template}`;
  });
});

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
  const user = auth.currentUser;
  if (user) {
    updateUserSection(user);
  } else {
    updateUserSection(null);
  }
  translateTopBar();
  translateHelpModal(lang);
  Landing_translateTemplates(lang);
  Landing_translateHero(lang);
  Landing_translateSteps(lang);
  Landing_translateCTAFree(lang);
  translateFooter();
  setBodyFont(lang);
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

const Landing_translationsHero = {
  en: {
    "title-line1": "Build a Resume",
    "title-line2": "That Gets You Hired",
    "subtitle": "Create a recruiter-ready CV in minutes. Optimized for ATS, designed to stand out, and built to match real opportunities.",

    "btn-primary": "Build My Resume",
    "btn-secondary": "Select a Template",

    "trust-users": "ATS-friendly templates",
    "trust-rating": "Free to get started",
    "trust-top": "Multi-language support",

    "card1-title": "ATS Optimized",
    "card1-desc": "Pass automated screenings and reach recruiters faster.",

    "card2-title": "Smart Builder",
    "card2-desc": "Auto-structure your CV with clean, professional sections.",

    "card3-title": "Job Matching",
    "card3-desc": "Align your CV with real job requirements instantly.",

    "card4-title": "Multi-language",
    "card4-desc": "Create CVs ready for international opportunities."
  },

  fr: {
    "title-line1": "Créez un CV",
    "title-line2": "Qui Vous Fait Embaucher",
    "subtitle": "Créez un CV prêt pour les recruteurs en quelques minutes. Optimisé pour les ATS et conçu pour se démarquer.",

    "btn-primary": "Créer mon CV",
    "btn-secondary": "Choisir un modèle",

    "trust-users": "Modèles compatibles ATS",
    "trust-rating": "Gratuit pour commencer",
    "trust-top": "Support multilingue",

    "card1-title": "Optimisé ATS",
    "card1-desc": "Passez les filtres automatiques et atteignez les recruteurs plus vite.",

    "card2-title": "Générateur intelligent",
    "card2-desc": "Structure automatiquement votre CV avec des sections propres.",

    "card3-title": "Matching emploi",
    "card3-desc": "Alignez votre CV avec les exigences réelles des offres.",

    "card4-title": "Multi-langue",
    "card4-desc": "Créez des CV prêts pour l’international."
  },

  ar: {
    "title-line1": "أنشئ سيرة ذاتية",
    "title-line2": "تجعلك تحصل على وظيفة",
    "subtitle": "أنشئ سيرة ذاتية احترافية خلال دقائق، متوافقة مع أنظمة ATS ومصممة للتميز.",

    "btn-primary": "أنشئ سيرتي",
    "btn-secondary": "اختر نموذج",

    "trust-users": "قوالب متوافقة مع ATS",
    "trust-rating": "مجاني للبدء",
    "trust-top": "دعم متعدد اللغات",

    "card1-title": "متوافق مع ATS",
    "card1-desc": "تجاوز أنظمة الفرز والوصول إلى أصحاب العمل بسرعة.",

    "card2-title": "منشئ ذكي",
    "card2-desc": "ينظم سيرتك الذاتية تلقائيًا بشكل احترافي.",

    "card3-title": "مطابقة الوظائف",
    "card3-desc": "طابق سيرتك مع متطلبات الوظائف بسهولة.",

    "card4-title": "متعدد اللغات",
    "card4-desc": "أنشئ سير ذاتية جاهزة للعمل دوليًا."
  },

  es: {
    "title-line1": "Crea un Currículum",
    "title-line2": "Que Te Consiga Empleo",
    "subtitle": "Crea un CV listo para reclutadores en minutos. Optimizado para ATS, diseñado para destacar y construido para coincidir con oportunidades reales.",

    "btn-primary": "Crear Mi Currículum",
    "btn-secondary": "Seleccionar una Plantilla",

    "trust-users": "Plantillas compatibles con ATS",
    "trust-rating": "Gratis para empezar",
    "trust-top": "Soporte multiidioma",

    "card1-title": "Optimizado para ATS",
    "card1-desc": "Supera los filtros automáticos y llega a los reclutadores más rápido.",

    "card2-title": "Creador Inteligente",
    "card2-desc": "Auto-estructura tu CV con secciones limpias y profesionales.",

    "card3-title": "Coincidencia de Empleo",
    "card3-desc": "Alinea tu CV con los requisitos reales del trabajo al instante.",

    "card4-title": "Multi-idioma",
    "card4-desc": "Crea CVs listos para oportunidades internacionales."
  },

  zh: {
    "title-line1": "打造一份",
    "title-line2": "助你成功入职的简历",
    "subtitle": "几分钟内创建一份让招聘官满意的简历。针对ATS优化，设计出众，精准匹配真实职位机会。",

    "btn-primary": "创建我的简历",
    "btn-secondary": "选择模板",

    "trust-users": "兼容ATS的模板",
    "trust-rating": "免费开始使用",
    "trust-top": "多语言支持",

    "card1-title": "ATS优化",
    "card1-desc": "通过自动筛选，更快触达招聘官。",

    "card2-title": "智能生成器",
    "card2-desc": "自动构建结构清晰、专业的简历板块。",

    "card3-title": "职位匹配",
    "card3-desc": "让你的简历与真实职位要求即时对齐。",

    "card4-title": "多语言支持",
    "card4-desc": "创建面向国际机会的简历。"
  },

  de: {
    "title-line1": "Erstellen Sie einen Lebenslauf",
    "title-line2": "Der Eingestellt Wird",
    "subtitle": "Erstellen Sie in wenigen Minuten einen recruiterfertigen Lebenslauf. Optimiert für ATS, designed um aufzufallen und gebaut, um zu echten Chancen zu passen.",

    "btn-primary": "Meinen Lebenslauf Erstellen",
    "btn-secondary": "Vorlage Auswählen",

    "trust-users": "ATS-freundliche Vorlagen",
    "trust-rating": "Kostenloser Einstieg",
    "trust-top": "Mehrsprachige Unterstützung",

    "card1-title": "ATS-optimiert",
    "card1-desc": "Bestehen Sie automatisierte Screenings und erreichen Sie Recruiter schneller.",

    "card2-title": "Intelligenter Builder",
    "card2-desc": "Strukturieren Sie Ihren Lebenslauf automatisch mit sauberen, professionellen Abschnitten.",

    "card3-title": "Job-Matching",
    "card3-desc": "Passen Sie Ihren Lebenslauf sofort an echte Jobanforderungen an.",

    "card4-title": "Mehrsprachig",
    "card4-desc": "Erstellen Sie Lebensläufe für internationale Chancen."
  },

  pt: {
    "title-line1": "Crie um Currículo",
    "title-line2": "Que Te Consiga Emprego",
    "subtitle": "Crie um CV pronto para recrutadores em minutos. Otimizado para ATS, projetado para se destacar e construído para corresponder a oportunidades reais.",

    "btn-primary": "Criar Meu Currículo",
    "btn-secondary": "Selecionar um Modelo",

    "trust-users": "Modelos compatíveis com ATS",
    "trust-rating": "Grátis para começar",
    "trust-top": "Suporte multilíngue",

    "card1-title": "Otimizado para ATS",
    "card1-desc": "Passe por triagens automatizadas e alcance recrutadores mais rapidamente.",

    "card2-title": "Construtor Inteligente",
    "card2-desc": "Auto-estructure seu CV com seções limpas e profissionais.",

    "card3-title": "Correspondência de Emprego",
    "card3-desc": "Alinhe seu CV com os requisitos reais das vagas instantaneamente.",

    "card4-title": "Multilíngue",
    "card4-desc": "Crie CVs prontos para oportunidades internacionais."
  },

  ja: {
    "title-line1": "採用される",
    "title-line2": "履歴書を作成",
    "subtitle": "数分で採用担当者に響く履歴書を作成。ATS最適化、目立つデザイン、実際の求人に合わせた構成。",

    "btn-primary": "履歴書を作成",
    "btn-secondary": "テンプレートを選択",

    "trust-users": "ATS対応テンプレート",
    "trust-rating": "無料で始められる",
    "trust-top": "多言語対応",

    "card1-title": "ATS最適化",
    "card1-desc": "自動選考を通過し、採用担当者により早くリーチします。",

    "card2-title": "スマートビルダー",
    "card2-desc": "クリーンでプロフェッショナルなセクションで履歴書を自動構築。",

    "card3-title": "求人マッチング",
    "card3-desc": "実際の求人要件に即座に履歴書を合わせます。",

    "card4-title": "多言語対応",
    "card4-desc": "国際的な機会に対応した履歴書を作成。"
  },

  ru: {
    "title-line1": "Создайте резюме",
    "title-line2": "Которое поможет вам получить работу",
    "subtitle": "Создайте готовое для рекрутера резюме за несколько минут. Оптимизировано для ATS, выделяется из толпы и соответствует реальным вакансиям.",

    "btn-primary": "Создать моё резюме",
    "btn-secondary": "Выбрать шаблон",

    "trust-users": "Шаблоны, совместимые с ATS",
    "trust-rating": "Бесплатный старт",
    "trust-top": "Поддержка нескольких языков",

    "card1-title": "Оптимизировано для ATS",
    "card1-desc": "Проходите автоматические проверки и быстрее достигайте рекрутеров.",

    "card2-title": "Умный конструктор",
    "card2-desc": "Автоматически структурирует ваше резюме с чистыми, профессиональными разделами.",

    "card3-title": "Соответствие вакансиям",
    "card3-desc": "Мгновенно согласуйте ваше резюме с реальными требованиями работы.",

    "card4-title": "Многоязычность",
    "card4-desc": "Создавайте резюме, готовые для международных возможностей."
  }
};
function Landing_translateHero(lang) {
  const t = Landing_translationsHero[lang] || Landing_translationsHero['en'];

  // Title
  document.querySelector('.hero-line-1').textContent = t["title-line1"];
  document.querySelector('.hero-line-2').textContent = t["title-line2"];

  // Subtitle
  document.querySelector('.cvb-hero-subtitle').textContent = t["subtitle"];

  // Buttons
  document.querySelector('.btn-primary span').textContent = t["btn-primary"];
  document.querySelector('.btn-secondary').textContent = t["btn-secondary"];

  // Trust
  const trustItems = document.querySelectorAll('.trust-item span');
  trustItems[0].textContent = t["trust-users"];
  trustItems[1].textContent = t["trust-rating"];
  trustItems[2].textContent = t["trust-top"];

  // Cards
  const cards = document.querySelectorAll('.cvb-hero-card');

  cards[0].querySelector('h3').textContent = t["card1-title"];
  cards[0].querySelector('p').textContent = t["card1-desc"];

  cards[1].querySelector('h3').textContent = t["card2-title"];
  cards[1].querySelector('p').textContent = t["card2-desc"];

  cards[2].querySelector('h3').textContent = t["card3-title"];
  cards[2].querySelector('p').textContent = t["card3-desc"];

  cards[3].querySelector('h3').textContent = t["card4-title"];
  cards[3].querySelector('p').textContent = t["card4-desc"];
}

const Landing_translationsTemplates = {
  en: {
    "templates-title": "Choose Your Perfect CV Template",
    "template1-title": "Modern Analyst",
    "template1-description": "Clean, structured layout perfect for professionals in business and analytics.",
    "template2-title": "Creative Strategist",
    "template2-description": "A bold design with modern typography that highlights your personal brand.",
    "template3-title": "Classic Authority",
    "template3-description": "Traditional elegance with a touch of modern professionalism.",
    "template4-title": "Executive Agent",
    "template4-description": "Traditional elegance with a touch of modern professionalism.",
    "template-btn": "Use this template",
    "view-all": "View all templates",
  },

  fr: {
    "templates-title": "Choisissez le modèle de CV parfait",
    "template1-title": "Analyste Moderne",
    "template1-description": "Mise en page propre et structurée, parfaite pour les professionnels du business et de l'analyse.",
    "template2-title": "Stratège Créatif",
    "template2-description": "Un design audacieux avec une typographie moderne qui met en valeur votre marque personnelle.",
    "template3-title": "Autorité Classique",
    "template3-description": "Élégance traditionnelle avec une touche de professionnalisme moderne.",
    "template4-title": "Agent Exécutif",
    "template4-description": "Élégance traditionnelle avec une touche de professionnalisme moderne.",
    "template-btn": "Utiliser ce modèle",
    "view-all": "Voir tous les modèles",
  },

  ar: {
    "templates-title": "اختر نموذج السيرة الذاتية المثالي",
    "template1-title": "المحلل العصري",
    "template1-description": "تصميم نظيف ومنظم مناسب للمهنيين في الأعمال والتحليلات.",
    "template2-title": "الاستراتيجي المبدع",
    "template2-description": "تصميم جريء مع خطوط حديثة تبرز علامتك الشخصية.",
    "template3-title": "السلطة الكلاسيكية",
    "template3-description": "أناقة تقليدية مع لمسة من الاحترافية الحديثة.",
    "template4-title": "الوكيل التنفيذي",
    "template4-description": "أناقة تقليدية مع لمسة من الاحترافية الحديثة.",
    "template-btn": "استخدام هذا النموذج",
    "view-all": "عرض جميع النماذج",
  },

  es: {
    "templates-title": "Elige tu plantilla de CV perfecta",
    "template1-title": "Analista Moderno",
    "template1-description": "Diseño limpio y estructurado, perfecto para profesionales en negocios y análisis.",
    "template2-title": "Estratega Creativo",
    "template2-description": "Un diseño audaz con tipografía moderna que resalta tu marca personal.",
    "template3-title": "Autoridad Clásica",
    "template3-description": "Elegancia tradicional con un toque de profesionalismo moderno.",
    "template4-title": "Agente Ejecutivo",
    "template4-description": "Elegancia tradicional con un toque de profesionalismo moderno.",
    "template-btn": "Usar esta plantilla",
    "view-all": "Ver todas las plantillas",
  },

  zh: {
    "templates-title": "选择完美的简历模板",
    "template1-title": "现代分析师",
    "template1-description": "简洁有序的布局，非常适合商业和分析领域的专业人士。",
    "template2-title": "创意策略师",
    "template2-description": "大胆的设计，现代字体，突出您的个人品牌。",
    "template3-title": "经典权威",
    "template3-description": "传统优雅，融入现代专业感。",
    "template4-title": "执行代理",
    "template4-description": "传统优雅，融入现代专业感。",
    "template-btn": "使用此模板",
    "view-all": "查看所有模板",
  },

  de: {
    "templates-title": "Wählen Sie Ihre perfekte CV-Vorlage",
    "template1-title": "Moderner Analyst",
    "template1-description": "Sauberes, strukturiertes Layout, perfekt für Fachkräfte in Wirtschaft und Analyse.",
    "template2-title": "Kreativer Stratege",
    "template2-description": "Ein mutiges Design mit moderner Typografie, das Ihre persönliche Marke hervorhebt.",
    "template3-title": "Klassische Autorität",
    "template3-description": "Traditionelle Eleganz mit einem Hauch moderner Professionalität.",
    "template4-title": "Executive Agent",
    "template4-description": "Traditionelle Eleganz mit einem Hauch moderner Professionalität.",
    "template-btn": "Diese Vorlage verwenden",
    "view-all": "Alle Vorlagen anzeigen",
  },

  pt: {
    "templates-title": "Escolha seu modelo de CV perfeito",
    "template1-title": "Analista Moderno",
    "template1-description": "Layout limpo e estruturado, perfeito para profissionais de negócios e análise.",
    "template2-title": "Estrategista Criativo",
    "template2-description": "Design ousado com tipografia moderna que destaca sua marca pessoal.",
    "template3-title": "Autoridade Clássica",
    "template3-description": "Elegância tradicional com um toque de profissionalismo moderno.",
    "template4-title": "Agente Executivo",
    "template4-description": "Elegância tradicional com um toque de profissionalismo moderno.",
    "template-btn": "Usar este modelo",
    "view-all": "Ver todos os modelos",
  },

  ja: {
    "templates-title": "完璧な履歴書テンプレートを選択",
    "template1-title": "モダンアナリスト",
    "template1-description": "ビジネスや分析職に最適な、整理されたクリーンなレイアウト。",
    "template2-title": "クリエイティブストラテジスト",
    "template2-description": "モダンなタイポグラフィで個人ブランドを強調した大胆なデザイン。",
    "template3-title": "クラシックオーソリティ",
    "template3-description": "伝統的な優雅さに現代的なプロフェッショナリズムを加えたデザイン。",
    "template4-title": "エグゼクティブエージェント",
    "template4-description": "伝統的な優雅さに現代的なプロフェッショナリズムを加えたデザイン。",
    "template-btn": "このテンプレートを使用",
    "view-all": "すべてのテンプレートを見る",
  },

  ru: {
    "templates-title": "Выберите идеальный шаблон резюме",
    "template1-title": "Современный аналитик",
    "template1-description": "Чистая, структурированная раскладка, идеально подходящая для специалистов по бизнесу и аналитике.",
    "template2-title": "Креативный стратег",
    "template2-description": "Смелый дизайн с современной типографикой, подчеркивающий ваш личный бренд.",
    "template3-title": "Классическая власть",
    "template3-description": "Традиционная элегантность с ноткой современного профессионализма.",
    "template4-title": "Исполнительный агент",
    "template4-description": "Традиционная элегантность с ноткой современного профессионализма.",
    "template-btn": "Использовать этот шаблон",
    "view-all": "Посмотреть все шаблоны",
  }
};
function Landing_translateTemplates(lang) {
  const t = Landing_translationsTemplates[lang] || Landing_translationsTemplates['en'];

  document.querySelector('.cvb-section-title').textContent = t["templates-title"];

  document.querySelectorAll('.cvb-template-title')[0].textContent = t["template1-title"];
  document.querySelectorAll('.cvb-template-description')[0].textContent = t["template1-description"];

  document.querySelectorAll('.cvb-template-title')[1].textContent = t["template2-title"];
  document.querySelectorAll('.cvb-template-description')[1].textContent = t["template2-description"];

  document.querySelectorAll('.cvb-template-title')[2].textContent = t["template3-title"];
  document.querySelectorAll('.cvb-template-description')[2].textContent = t["template3-description"];

  document.querySelectorAll('.cvb-template-title')[3].textContent = t["template4-title"];
  document.querySelectorAll('.cvb-template-description')[3].textContent = t["template4-description"];

  document.querySelectorAll('.cvb-template-btn').forEach(btn => {
    btn.textContent = t["template-btn"];
  });

  document.querySelector('.view-text').textContent = t["view-all"];
}

const Landing_translationSteps = {
  en: {
    "steps-main-title": "Build Your Job Ready CV Step by Step with Operlya",

    "step1-title": "Step 1: Import and Edit Your Data",
    "step1-p1": "Easily get started by uploading your current CV or creating one from our smart, ready to use templates. Operlya automatically organizes your information into clear sections; personal details, education, experience, and skills so everything stays structured and professional.",
    "step1-p2": "You can update each part directly from the dashboard: correct dates, refine job titles, or add new achievements with simple clicks.",
    "step1-tip": "Keep your descriptions short and focused on measurable results. For example, “Increased sales by 20%” instead of “Responsible for sales.”",

    "step2-title": "Step 2: Analyze the Job Offer",
    "step2-p1": "Copy and paste the job description you’re targeting, and Operlya will help you break it down into what really matters. Instantly see which keywords, skills, and qualifications the recruiter is looking for, and how your CV compares.",
    "step2-p2": "You’ll get a clear overview of essential requirements such as experience, education, certifications, and technical or soft skills. So you can understand exactly what to emphasize or adjust in your profile.",
    "step2-tip": "Review the “Key Needs” section to identify missing elements. If the role highlights “logistics coordination” or “ERP management,” make sure those terms appear naturally in your experience or skills section. Always align your responsibilities with the job’s priorities — for example, mention how you optimized transport routes or improved delivery times to match logistics-focused roles.",

    "step3-title": "Step 3: Customize Your Style",
    "step3-p1": "Your CV isn’t just about what you’ve done, it’s also about how you present it. In this step, you can personalize the entire look and feel of your CV to reflect your professional identity.",
    "step3-p2": "Browse through a curated collection of modern, professional, and creative templates, each designed to meet different career goals and industries. Whether you prefer a sleek corporate layout like “Strategist” or a bold and creative one like “Luminary”, Operlya helps you find the perfect match.",
    "step3-p3": "You can easily adjust the color palette, typography, and layout, and even switch the language to tailor your CV for international applications. Each change updates instantly for a seamless preview.",
    "step3-tip": "Choose a template that matches your industry. Creative profiles can stand out with more visual styles, while corporate or ATS-focused templates work best for formal or multinational applications. Keep the design consistent with your personality and target role. Your layout should support your message, not distract from it.",
  },

  fr: {
    "steps-main-title": "Créez votre CV prêt à l’emploi étape par étape avec Operlya",

    "step1-title": "Étape 1 : Importez et modifiez vos données",
    "step1-p1": "Commencez facilement en téléchargeant votre CV actuel ou en créant un nouveau à partir de nos modèles intelligents prêts à l’emploi. Operlya organise automatiquement vos informations en sections claires : informations personnelles, formation, expérience et compétences.",
    "step1-p2": "Vous pouvez mettre à jour chaque partie directement depuis le tableau de bord : corriger des dates, affiner des intitulés de poste ou ajouter de nouvelles réalisations en quelques clics.",
    "step1-tip": "Gardez vos descriptions courtes et centrées sur des résultats mesurables. Par exemple : « Augmentation des ventes de 20 % » au lieu de « Responsable des ventes ».",

    "step2-title": "Étape 2 : Analysez l’offre d’emploi",
    "step2-p1": "Copiez et collez la description du poste visé, et Operlya vous aide à identifier les éléments essentiels : mots-clés, compétences et qualifications recherchés par le recruteur, ainsi que la compatibilité de votre CV.",
    "step2-p2": "Vous obtenez une vue claire des exigences clés : expérience, formation, certifications, compétences techniques et comportementales. Cela vous permet d’ajuster votre profil avec précision.",
    "step2-tip": "Consultez la section « Besoins clés » pour repérer les éléments manquants. Si le poste mentionne « coordination logistique » ou « gestion ERP », veillez à inclure ces termes dans votre CV. Adaptez toujours vos responsabilités aux priorités du poste. Par exemple, mentionnez comment vous avez optimisé les itinéraires de transport ou amélioré les délais de livraison pour des postes orientés logistique.",

    "step3-title": "Étape 3 : Personnalisez votre style",
    "step3-p1": "Votre CV ne se limite pas à ce que vous avez fait, il montre aussi comment vous vous présentez. Dans cette étape, vous pouvez personnaliser entièrement le style de votre CV pour refléter votre identité professionnelle.",
    "step3-p2": "Parcourez une collection de modèles modernes, professionnels et créatifs, chacun conçu pour différents secteurs et objectifs de carrière.",
    "step3-p3": "Ajustez facilement la palette de couleurs, la typographie et la mise en page, et changez même la langue pour vos candidatures internationales. Les modifications s’appliquent instantanément pour un aperçu fluide.",
    "step3-tip": "Choisissez un modèle adapté à votre secteur. Les profils créatifs se démarquent avec des styles visuels, tandis que les modèles plus sobres conviennent mieux aux candidatures formelles. Assurez-vous que le design reste cohérent avec votre personnalité et votre poste cible, il doit soutenir votre message, pas le détourner.",
  },

  ar: {
    "steps-main-title": "أنشئ سيرتك الذاتية الجاهزة للوظيفة خطوة بخطوة مع Operlya",
    "step1-title": "الخطوة 1: استيراد بياناتك وتحريرها",
    "step1-p1": "ابدأ بسهولة بتحميل سيرتك الذاتية الحالية أو أنشئ واحدة جديدة من قوالبنا الذكية الجاهزة. يقوم Operlya بتنظيم معلوماتك تلقائيًا في أقسام واضحة مثل البيانات الشخصية، والتعليم، والخبرة، والمهارات.",
    "step1-p2": "يمكنك تعديل كل جزء مباشرةً من لوحة التحكم: تصحيح التواريخ، تحسين المسميات الوظيفية، أو إضافة إنجازات جديدة بكل سهولة.",
    "step1-tip": "اجعل أوصافك قصيرة ومرتكزة على نتائج قابلة للقياس. مثال: «زيادة المبيعات بنسبة 20٪» بدلًا من «مسؤول عن المبيعات».",
    
    "step2-title": "الخطوة 2: تحليل عرض العمل",
    "step2-p1": "انسخ وصف الوظيفة التي تستهدفها، وسيساعدك Operlya على تحليلها لاستخراج المهارات والكلمات المفتاحية المطلوبة، ومعرفة مدى توافق سيرتك الذاتية معها.",
    "step2-p2": "ستحصل على رؤية واضحة للمتطلبات الأساسية مثل الخبرة، والتعليم، والشهادات، والمهارات التقنية والسلوكية.",
    "step2-tip": "تحقّق دائمًا من قسم «الاحتياجات الأساسية» لتحديد العناصر المفقودة مثل «تنسيق اللوجستيك» أو «إدارة نظام تخطيط الموارد (ERP)». كما يُنصح بربط مسؤولياتك بأولويات الوظيفة المستهدفة، مثل تحسين مسارات النقل أو تقليص أوقات التسليم.",
    
    "step3-title": "الخطوة 3: خصّص أسلوبك",
    "step3-p1": "سيرتك الذاتية لا تعبّر فقط عن خبراتك، بل أيضًا عن شخصيتك المهنية. في هذه الخطوة يمكنك تخصيص المظهر بالكامل ليعكس هويتك الاحترافية.",
    "step3-p2": "تصفّح مجموعة من القوالب العصرية والمهنية والإبداعية المصممة لمختلف المجالات والقطاعات. سواء كنت تفضّل تصميماً أنيقاً للأعمال أو مظهراً جريئاً للإبداع، ستجد ما يناسبك.",
    "step3-p3": "يمكنك تعديل الألوان، والخطوط، والتخطيط، وحتى اللغة لتناسب الطلبات الدولية. تظهر جميع التغييرات فورًا لتتمكن من معاينتها في الوقت الحقيقي.",
    "step3-tip": "اختر القالب الذي يناسب مجالك المهني، وحافظ على اتساق التصميم مع شخصيتك وطبيعة الوظيفة التي تتقدّم إليها.",
  },

  es: {
    "steps-main-title": "Crea tu CV listo para el trabajo paso a paso con Operlya",

    "step1-title": "Paso 1: Importa y edita tus datos",
    "step1-p1": "Comienza fácilmente cargando tu CV actual o creando uno desde nuestras plantillas inteligentes listas para usar. Operlya organiza automáticamente tu información en secciones claras: datos personales, educación, experiencia y habilidades.",
    "step1-p2": "Puedes actualizar cada parte directamente desde el panel: corregir fechas, afinar títulos de trabajo o añadir nuevos logros con unos clics.",
    "step1-tip": "Mantén tus descripciones breves y centradas en resultados medibles. Por ejemplo: “Aumenté las ventas un 20 %” en lugar de “Responsable de ventas”.",

    "step2-title": "Paso 2: Analiza la oferta de trabajo",
    "step2-p1": "Copia y pega la descripción del puesto al que optas y Operlya te ayudará a desglosarla para ver lo que realmente importa. Verás al instante qué palabras clave, habilidades y cualificaciones busca el reclutador y cómo se compara tu CV.",
    "step2-p2": "Obtendrás una visión clara de los requisitos esenciales como experiencia, educación, certificaciones y habilidades técnicas o blandas. Así sabrás exactamente qué destacar o ajustar en tu perfil.",
    "step2-tip": "Revisa la sección “Necesidades clave” para identificar elementos que faltan. Si el puesto menciona “coordinación logística” o “gestión de ERP”, asegúrate de incluir esos términos de forma natural en tu experiencia o sección de habilidades. Alinea siempre tus responsabilidades con las prioridades del puesto — por ejemplo, mencionar cómo optimizaste rutas de transporte o mejoraste tiempos de entrega para roles enfocados en logística.",

    "step3-title": "Paso 3: Personaliza tu estilo",
    "step3-p1": "Tu CV no solo trata de lo que has hecho, también de cómo lo presentas. En este paso puedes personalizar por completo el aspecto de tu CV para reflejar tu identidad profesional.",
    "step3-p2": "Explora una colección curada de plantillas modernas, profesionales y creativas, cada una diseñada para distintos objetivos de carrera e industrias. Ya sea que prefieras un diseño corporativo elegante como “Strategist” o uno audaz y creativo como “Luminary”, Operlya te ayuda a encontrar el encaje perfecto.",
    "step3-p3": "Puedes ajustar fácilmente la paleta de colores, la tipografía y la disposición, e incluso cambiar el idioma para adaptar tu CV a candidaturas internacionales. Cada cambio se actualiza al instante para una vista previa perfecta.",
    "step3-tip": "Elige una plantilla que coincida con tu industria. Los perfiles creativos pueden destacar con estilos más visuales, mientras que las plantillas corporativas o centradas en ATS funcionan mejor para candidaturas formales o multinacionales. Mantén el diseño coherente con tu personalidad y el rol objetivo — tu layout debe respaldar tu mensaje, no distraer de él.",
  },
  zh: {
    "steps-main-title": "使用 Operlya 逐步打造面向就业的简历",
    "step1-title": "第 1 步：导入并编辑您的资料",
    "step1-p1": "通过上传当前的简历或从我们的智能、即用模板创建新的简历，轻松开始。Operlya 会自动将您的信息整理到清晰的版块：个人信息、教育背景、工作经验和技能。",
    "step1-p2": "您可直接在仪表盘中更新每一部分：纠正日期、优化职位名称或通过简单点击添加新的成就。",
    "step1-tip": "保持描述简洁，并聚焦于可衡量的成果。例如，“销售额增长 20%”而不是“负责销售”。",
    "step2-title": "第 2 步：分析职位需求",
    "step2-p1": "复制并粘贴您所申请职位的描述，Operlya 会帮助您拆解其中真正重要的内容。即刻查看招聘方所寻找的关键词、技能和资质，以及您的简历如何匹配。",
    "step2-p2": "您将清晰看到诸如经验、教育、认证和技术或软技能等核心要求。这样您就能准确了解应强调或调整哪些部分。",
    "step2-tip": "查看“关键需求”部分以识别缺失项。例如，如职位强调“物流协调”或“ERP 管理”，请确保这些术语自然地出现在您的经验或技能部分。始终使您的职责与职位的优先事项保持一致 — 例如，提及您如何优化运输路线或改善交付时间，以匹配以物流为重点的角色。",
    "step3-title": "第 3 步：定制您的风格",
    "step3-p1": "您的简历不仅展现您做过什么，更展现您如何呈现它。在此步骤中，您可以完全个性化简历的外观与感觉，以反映您的职业身份。",
    "step3-p2": "浏览我们精心策划的现代、专业和创意模板集合，每一种都针对不同职业目标和行业设计。无论您喜欢“Strategist”那样的简洁企业布局，还是“Luminary”那样大胆创意的设计，Operlya 都能帮您找到理想匹配。",
    "step3-p3": "您可以轻松调整颜色方案、排版和布局，甚至切换语言以适应国际申请。每次修改都会立即更新，提供无缝预览体验。",
    "step3-tip": "选择适合您行业的模板。创意类档案可用更具视觉性的风格脱颖而出，而面向企业或 ATS 的模板则更适合正式或跨国申请。保持设计与您的个性和目标角色一致 — 您的排版应增强您的信息，而非分散注意力。",
  },
  de: {
    "steps-main-title": "Erstellen Sie mit Operlya Schritt für Schritt Ihren berufsfähigen Lebenslauf",
    "step1-title": "Schritt 1: Daten importieren und bearbeiten",
    "step1-p1": "Starten Sie ganz einfach, indem Sie Ihren aktuellen Lebenslauf hochladen oder eine neue Version mit unseren intelligenten, einsatzbereiten Vorlagen erstellen. Operlya ordnet Ihre Informationen automatisch in klaren Abschnitten wie persönliche Daten, Ausbildung, Berufserfahrung und Fähigkeiten.",
    "step1-p2": "Sie können jeden Abschnitt direkt über das Dashboard aktualisieren: Daten korrigieren, Jobtitel verfeinern oder neue Erfolge mit wenigen Klicks hinzufügen.",
    "step1-tip": "Halten Sie Ihre Beschreibungen kurz und auf messbare Ergebnisse fokussiert. Zum Beispiel: „Umsatz um 20 % gesteigert“ statt „Verantwortlich für Umsatz“. ",
    "step2-title": "Schritt 2: Jobangebot analysieren",
    "step2-p1": "Kopieren Sie die Stellenbeschreibung, auf die Sie sich bewerben möchten, und Operlya hilft Ihnen dabei, die wirklich wichtigen Inhalte zu erkennen. Sehen Sie sofort, nach welchen Schlüsselwörtern, Fähigkeiten und Qualifikationen der Recruiter sucht und wie Ihr Lebenslauf abschneidet.",
    "step2-p2": "Sie erhalten einen klaren Überblick über zentrale Anforderungen wie Erfahrung, Ausbildung, Zertifikate sowie technische und soziale Kompetenzen. So wissen Sie genau, worauf Sie sich in Ihrem Profil konzentrieren oder was Sie anpassen sollten.",
    "step2-tip": "Überprüfen Sie den Bereich „Schlüsselanforderungen“, um fehlende Elemente zu identifizieren – wenn z. B. „Logistikkoordination“ oder „ERP-Management“ genannt werden, stellen Sie sicher, dass diese Begriffe in Ihrer Erfahrung oder Skills-Sektion enthalten sind. Stimmen Sie stets Ihre Verantwortlichkeiten auf die Prioritäten der Stelle ab – z. B. wie Sie Transportwege optimiert oder Lieferzeiten verkürzt haben, wenn es sich um logistikorientierte Rollen handelt.",
    "step3-title": "Schritt 3: Ihren Stil anpassen",
    "step3-p1": "Ihr Lebenslauf zeigt nicht nur, was Sie gemacht haben, sondern auch, wie Sie es darstellen. In diesem Schritt können Sie das gesamte Erscheinungsbild Ihres Lebenslaufs personalisieren, um Ihre professionelle Identität widerzuspiegeln.",
    "step3-p2": "Durchstöbern Sie eine kuratierte Sammlung moderner, professioneller und kreativer Vorlagen, jede entworfen für unterschiedliche Karriereziele und Branchen. Ob Sie ein schlichtes, geschäftliches Layout wie „Strategist“ oder ein mutiges und kreatives Design wie „Luminary“ bevorzugen – Operlya hilft Ihnen beim Finden des perfekten Fits.",
    "step3-p3": "Sie können ganz einfach die Farbpalette, Typografie und das Layout anpassen und sogar die Sprache wechseln, um Ihren Lebenslauf auf internationale Bewerbungen auszurichten. Jede Änderung wird sofort aktualisiert – für eine nahtlose Vorschau.",
    "step3-tip": "Wählen Sie eine Vorlage, die zu Ihrer Branche passt. Kreative Profile können mit visuellen Stilen hervorstechen, während Corporate- oder ATS-optimierte Vorlagen besser für formelle oder multinationale Bewerbungen geeignet sind. Achten Sie darauf, dass das Design mit Ihrer Persönlichkeit und der angestrebten Rolle übereinstimmt – Ihr Layout sollte Ihre Botschaft unterstützen, nicht ablenken.",
  },
  pt: {
    "steps-main-title": "Construa seu currículo pronto para o trabalho passo a passo com o Operlya",
    "step1-title": "Passo 1: Importe e edite seus dados",
    "step1-p1": "Comece facilmente fazendo upload do seu currículo atual ou criando um novo a partir de nossos modelos inteligentes prontos para uso. O Operlya organiza automaticamente suas informações em seções claras: dados pessoais, educação, experiência e habilidades.",
    "step1-p2": "Você pode atualizar cada parte diretamente no painel: corrigir datas, refinar títulos de trabalho ou adicionar novas realizações com alguns cliques.",
    "step1-tip": "Mantenha suas descrições curtas e focadas em resultados mensuráveis. Por exemplo: “Aumentei as vendas em 20 %” em vez de “Responsável pelas vendas”.",
    "step2-title": "Passo 2: Analise a oferta de emprego",
    "step2-p1": "Copie e cole a descrição da vaga que você está mirando e o Operlya ajudará você a decompor o que realmente importa. Veja instantaneamente quais palavras-chave, habilidades e qualificações o recrutador procura e como seu currículo se compara.",
    "step2-p2": "Você obterá uma visão clara dos requisitos essenciais, como experiência, educação, certificações e habilidades técnicas ou emocionais. Assim, você entenderá exatamente o que enfatizar ou ajustar no seu perfil.",
    "step2-tip": "Revise a seção “Necessidades-chave” para identificar elementos faltantes. Se a função destaca “coordenação logística” ou “gestão de ERP”, certifique-se de que esses termos apareçam de forma natural em sua experiência ou seção de habilidades. Alinhe sempre suas responsabilidades com as prioridades da vaga — por exemplo, mencione como você otimizou rotas de transporte ou reduziu tempos de entrega para funções com foco em logística.",
    "step3-title": "Passo 3: Personalize seu estilo",
    "step3-p1": "Seu currículo não é apenas sobre o que você fez — também é sobre como você o apresenta. Nesta etapa, você pode personalizar completamente o visual e a sensação de seu currículo para refletir sua identidade profissional.",
    "step3-p2": "Explore uma coleção selecionada de modelos modernos, profissionais e criativos, cada um projetado para diferentes metas de carreira e indústrias. Quer prefira um layout corporativo elegante como “Strategist” ou um design ousado e criativo como “Luminary”, o Operlya ajuda você a encontrar a combinação perfeita.",
    "step3-p3": "Você pode ajustar facilmente a paleta de cores, a tipografia e o layout, e até trocar o idioma para adaptar seu currículo a candidaturas internacionais. Cada mudança é atualizada instantaneamente para uma pré-visualização sem falhas.",
    "step3-tip": "Escolha um modelo que combine com sua indústria. Perfis criativos podem se destacar com estilos mais visuais, enquanto modelos corporativos ou otimizados para ATS funcionam melhor para candidaturas formais ou multinacionais. Mantenha o design consistente com sua personalidade e função-alvo — seu layout deve apoiar sua mensagem, não distraí-la.",
  },
  ja: {
    "steps-main-title": "Operlya で就職向け履歴書をステップバイステップで作成",
    "step1-title": "ステップ 1：データをインポートして編集",
    "step1-p1": "現在の履歴書をアップロードするか、弊社のスマートな即利用テンプレートから新規作成して、簡単に始めましょう。Operlya はあなたの情報を「個人情報」「学歴」「経験」「スキル」などの明確なセクションに自動整理します。",
    "step1-p2": "ダッシュボードから各部分を直接更新できます：日付を修正したり、職務名を洗練させたり、ワンクリックで新しい実績を追加したり。",
    "step1-tip": "説明は短く、測定可能な成果に焦点を当てましょう。例：「売上を 20 % 増加させた」ではなく「売上を担当した」。",
    "step2-title": "ステップ 2：求人情報を分析",
    "step2-p1": "応募先の求人内容をコピー＆ペーストし、Operlya が本当に重要な要素を分析してサポートします。採用担当者が求めるキーワード、スキル、資格が何か、そしてあなたの履歴書がどれだけ合致しているかを即座に確認できます。",
    "step2-p2": "経験、学歴、認証、技術的・ソフトスキルなど、必須要件を明確に把握できます。これにより、あなたのプロフィールで何を強調または調整すべきかが的確に分かります。",
    "step2-tip": "「重要なニーズ」セクションを確認して、必須項目の漏れを特定しましょう。例えば、求人が「物流コーディネーション」や「ERP 管理」を強調している場合、それらの用語があなたの経験やスキルセクションに自然に含まれているか確認してください。応募ポジションの優先事項にあなたの責任を常に合わせましょう ― 例えば、運搬ルートを最適化した、納期を短縮したなど、物流に特化した役割の場合です。",
    "step3-title": "ステップ 3：スタイルをカスタマイズ",
    "step3-p1": "あなたの履歴書は「何をしたか」だけでなく「どう見せるか」でもあります。このステップでは、プロフェッショナルとしてのアイデンティティを反映するために、履歴書の見た目と感触を完全にパーソナライズできます。",
    "step3-p2": "キャリア目標や業界ごとに設計された、モダンでプロフェッショナル、そしてクリエイティブなテンプレートを厳選して取り揃えています。例えば、ビジネス用の洗練されたレイアウト「Strategist」、マーケティング・デザイン系の大胆な「Luminary」など、お好みに応じて最適なものが見つかります。",
    "step3-p3": "色パレット、タイポグラフィ、レイアウトを簡単に調整でき、国際応募向けに言語切り替えも可能です。全ての変更は即座に反映され、スムーズなプレビューを提供します。",
    "step3-tip": "ご自身の業界にマッチするテンプレートを選びましょう。クリエイティブなプロフィールはより視覚的なスタイルで際立たせ、コーポレートまたは ATS 向けのテンプレートは正式または多国籍応募に最適です。デザインはあなたの個性と目指す役割に一致させてください — レイアウトはあなたのメッセージを支えるものであり、妨げるものであってはなりません。",
  },
  ru: {
    "steps-main-title": "Создайте готовое к работе резюме шаг за шагом с Operlya",
    "step1-title": "Шаг 1: Импортируйте и отредактируйте свои данные",
    "step1-p1": "Начните легко: загрузите ваше текущее резюме или создайте новое на основе наших умных шаблонов, готовых к использованию. Operlya автоматически организует вашу информацию по понятным разделам: личные данные, образование, опыт и навыки.",
    "step1-p2": "Вы можете обновить каждую часть прямо с панели управления: исправьте даты, уточните названия должностей или добавьте новые достижения в пару кликов.",
    "step1-tip": "Держите описания краткими и ориентированными на измеримые результаты. Например: «Увеличил продажи на 20 %» вместо «Отвечал за продажи».",
    "step2-title": "Шаг 2: Проанализируйте вакансию",
    "step2-p1": "Скопируйте и вставьте описание вакансии, на которую вы претендуете, и Operlya поможет вам выделить действительно важное. Вы мгновенно увидите, какие ключевые слова, навыки и квалификации ищет рекрутер и как ваше резюме с ними сравнивается.",
    "step2-p2": "Вы получите чёткое представление о ключевых требованиях: опыт, образование, сертификаты и технические или мягкие навыки. Это поможет вам точно понять, на чём сосредоточиться или что скорректировать в своём профиле.",
    "step2-tip": "Проверьте раздел «Ключевые потребности», чтобы выявить недостающие элементы — если в вакансии упоминаются «логистическая координация» или «управление ERP», убедитесь, что эти термины естественно присутствуют в разделе ваших навыков или опыта. Всегда сопоставляйте ваши обязанности с приоритетами позиции — например, как вы оптимизировали маршруты перевозки или сократили время доставки для логистически ориентированных ролей.",
    "step3-title": "Шаг 3: Настройте свой стиль",
    "step3-p1": "Ваше резюме — это не только то, что вы сделали, но и как вы это представили. На этом этапе вы можете полностью персонализировать внешний вид своего резюме, чтобы отразить свою профессиональную идентичность.",
    "step3-p2": "Просмотрите кураторскую подборку современных, профессиональных и креативных шаблонов, каждая из которых разработана для разных карьерных целей и отраслей. Предпочитаете ли вы лаконичное корпоративное оформление «Strategist» или смелый и креативный дизайн «Luminary», Operlya поможет найти идеальную пару.",
    "step3-p3": "Вы можете легко отрегулировать цветовую палитру, типографику и макет, а также переключить язык для международных заявок. Каждое изменение обновляется мгновенно, обеспечивая бесшовный просмотр.",
    "step3-tip": "Выберите шаблон, который соответствует вашей отрасли. Креативные профили могут выделяться с помощью более визуальных стилей, тогда как корпоративные или оптимизированные под ATS шаблоны лучше подходят для формальных или многонациональных заявок. Убедитесь, что дизайн согласован с вашей личностью и целевой ролью — макет должен поддерживать ваше сообщение, а не отвлекать от него.",
  }
};
function Landing_translateSteps(lang) {
  const t = Landing_translationSteps[lang] || Landing_translationSteps['en'];

  document.querySelector(".cvb-landing-steps h1").textContent = t["steps-main-title"];

  document.querySelector("#cvb-landing-step1 .cvb-landing-title").textContent = t["step1-title"];
  const step1Texts = document.querySelectorAll("#cvb-landing-step1 .cvb-landing-text");
  step1Texts[0].textContent = t["step1-p1"];
  step1Texts[1].textContent = t["step1-p2"];
  step1Texts[2].textContent = t["step1-tip"];

  document.querySelector("#cvb-landing-step2 .cvb-landing-title").textContent = t["step2-title"];
  const step2Texts = document.querySelectorAll("#cvb-landing-step2 .cvb-landing-text");
  step2Texts[0].textContent = t["step2-p1"];
  step2Texts[1].textContent = t["step2-p2"];
  step2Texts[2].textContent = t["step2-tip"];

  document.querySelector("#cvb-landing-step3 .cvb-landing-title").textContent = t["step3-title"];
  const step3Texts = document.querySelectorAll("#cvb-landing-step3 .cvb-landing-text");
  step3Texts[0].textContent = t["step3-p1"];
  step3Texts[1].textContent = t["step3-p2"];
  step3Texts[2].textContent = t["step3-p3"];
  step3Texts[3].textContent = t["step3-tip"];
}

const Landing_translationCTAFree = {
  en: {
    "cta-title": "Ready to Land Interviews?",
    "cta-paragraph": "Turn your experiences into a powerful, recruiter-friendly CV. Every click gets you closer to your next career move.",
    "cta-button": "Build My CV Now",
  },

  fr: {
    "cta-title": "Prêt à décrocher des entretiens ?",
    "cta-paragraph": "Transformez vos expériences en un CV puissant et attractif pour les recruteurs. Chaque clic vous rapproche de votre prochaine opportunité de carrière.",
    "cta-button": "Créer mon CV maintenant",
  },

  ar: {
    "cta-title": "هل أنت مستعد للحصول على مقابلات عمل؟",
    "cta-paragraph": "حوّل خبراتك إلى سيرة ذاتية قوية وجذابة لأصحاب العمل. كل نقرة تقرّبك أكثر من خطوتك المهنية التالية.",
    "cta-button": "أنشئ سيرتي الذاتية الآن",
  },

  es: {
    "cta-title": "¿Listo para conseguir entrevistas?",
    "cta-paragraph": "Convierte tu experiencia en un currículum potente y atractivo para los reclutadores. Cada clic te acerca a tu próximo paso profesional.",
    "cta-button": "Crear mi CV ahora",
  },

  zh: {
    "cta-title": "准备好开始面试了吗？",
    "cta-paragraph": "将您的经验转化为强大且吸引招聘人员的简历。每一次点击都让您更接近职业的下一步。",
    "cta-button": "立即创建我的简历",
  },

  de: {
    "cta-title": "Bereit für Vorstellungsgespräche?",
    "cta-paragraph": "Verwandeln Sie Ihre Erfahrungen in einen überzeugenden, recruiterfreundlichen Lebenslauf. Jeder Klick bringt Sie Ihrem nächsten Karriereschritt näher.",
    "cta-button": "Jetzt meinen Lebenslauf erstellen",
  },

  pt: {
    "cta-title": "Pronto para conquistar entrevistas?",
    "cta-paragraph": "Transforme suas experiências em um currículo poderoso e atraente para recrutadores. Cada clique o aproxima do seu próximo passo na carreira.",
    "cta-button": "Criar meu currículo agora",
  },

  ja: {
    "cta-title": "面接の準備はできていますか？",
    "cta-paragraph": "あなたの経験を、採用担当者に響く強力な履歴書に変えましょう。クリックするたびに、次のキャリアステップに近づきます。",
    "cta-button": "今すぐ履歴書を作成",
  },

  ru: {
    "cta-title": "Готовы проходить собеседования?",
    "cta-paragraph": "Преобразуйте свой опыт в мощное и привлекательное резюме для рекрутеров. Каждый клик приближает вас к следующему карьерному шагу.",
    "cta-button": "Создать мое резюме сейчас",
  },
};
function Landing_translateCTAFree(lang) {
  const t = Landing_translationCTAFree[lang] || Landing_translationCTAFree['en'];

  document.querySelector('.cvb-ctaFree-content h2').textContent = t["cta-title"];
  document.querySelector('.cvb-ctaFree-content p').textContent = t["cta-paragraph"];
  document.querySelector('.cvb-ctaFree-content .cta-text').textContent = t["cta-button"];
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