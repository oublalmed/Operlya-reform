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

// ================================= Contact ===============================

const msg = document.getElementById("contactMessage");
const counter = document.getElementById("charCount");
const statusBox = document.getElementById("contactStatus");
const btn = document.getElementById("sendContactBtn");

msg.addEventListener("input", () => {
  counter.textContent = msg.value.length;
});

function setStatus(text, type = "info") {
  statusBox.textContent = text;

  if (type === "error") statusBox.style.color = "#e74c3c";
  if (type === "success") statusBox.style.color = "#2ecc71";
  if (type === "info") statusBox.style.color = "#3498db";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

btn.addEventListener("click", async () => {

  const lang = getCurrentLang();
  const t = cvbContactTranslations[lang] || cvbContactTranslations.en;

  const category = document.getElementById("contactCategory").value;
  const email = document.getElementById("contactEmail").value.trim();
  const message = msg.value.trim();

  if (!email || !message) {
    return setStatus(t.required, "error");
  }

  if (!validateEmail(email)) {
    return setStatus(t.invalidEmail, "error");
  }

  if (message.length < 10) {
    return setStatus(t.shortMessage, "error");
  }

  try {
    btn.disabled = true;
    btn.textContent = "Sending...";

    setStatus(t.sending, "info");

    await addDoc(collection(db, "contacts"), {
      category,
      email,
      message,
      userId: auth.currentUser?.uid || null,
      createdAt: serverTimestamp(),
      status: "new",
      source: "web_app"
    });

    setStatus(t.success, "success");

    msg.value = "";
    counter.textContent = "0";
    document.getElementById("contactEmail").value = "";

  } catch (err) {
    console.error(err);
    setStatus(t.error, "error");

  } finally {
    btn.disabled = false;
    btn.textContent = "Send Message";
  }
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
  translateFooter();
  translateContactForm()
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

  // Description
  const desc = footer.querySelector(".footer-col.brand p");
  if (desc) desc.textContent = t.description;

  // Titles
  const titles = footer.querySelectorAll(".footer-col h4");
  if (titles[0]) titles[0].textContent = t.discover;
  if (titles[1]) titles[1].textContent = t.resources;
  if (titles[2]) titles[2].textContent = t.company;
  if (titles[3]) titles[3].textContent = t.ctaTitle;

  // Discover links
  const discoverLinks = footer.querySelectorAll(".footer-col:nth-child(2) a");
  if (discoverLinks[0]) discoverLinks[0].textContent = t.resumeBuilder;
  if (discoverLinks[1]) discoverLinks[1].textContent = t.opportunities;

  // Resources links
  const resourceLinks = footer.querySelectorAll(".footer-col:nth-child(3) a");
  if (resourceLinks[0]) resourceLinks[0].textContent = t.helpCenter;
  if (resourceLinks[1]) resourceLinks[1].textContent = t.careerTips;
  if (resourceLinks[2]) resourceLinks[2].textContent = t.atsGuide;

  // Company links
  const companyLinks = footer.querySelectorAll(".footer-col:nth-child(4) a");
  if (companyLinks[0]) companyLinks[0].textContent = t.about;
  if (companyLinks[1]) companyLinks[1].textContent = t.contact;
  if (companyLinks[2]) companyLinks[2].textContent = t.privacy;
  if (companyLinks[3]) companyLinks[3].textContent = t.terms;

  // CTA
  const ctaDesc = footer.querySelector(".footer-cta p");
  if (ctaDesc) ctaDesc.textContent = t.ctaDesc;

  const ctaBtn = footer.querySelector(".footer-cta a");
  if (ctaBtn) {
    const icon = ctaBtn.querySelector("i")?.outerHTML || "";
    ctaBtn.innerHTML = `${icon} ${t.createProfile}`;
  }

  // Bottom
  const copyright = footer.querySelector(".footer-bottom p");
  if (copyright) copyright.textContent = t.copyright;

  const bottomLinks = footer.querySelectorAll(".footer-bottom-links a");
  if (bottomLinks[0]) bottomLinks[0].textContent = t.privacy;
  if (bottomLinks[1]) bottomLinks[1].textContent = t.terms;
  if (bottomLinks[2]) bottomLinks[2].textContent = t.cookies;
}

const cvbContactTranslations = {
  en: {
    sending: "Sending your message to our support team...",
    success: "Your message has been sent successfully. Our team will get back to you shortly.",
    error: "We couldn’t send your message. Please try again in a few moments.",
    required: "Please complete all required fields before sending.",
    invalidEmail: "Please enter a valid email address.",
    shortMessage: "Please provide more details so we can better assist you."
  },

  fr: {
    sending: "Envoi de votre message à notre équipe support...",
    success: "Votre message a été envoyé avec succès. Notre équipe vous répondra sous peu.",
    error: "Impossible d’envoyer votre message. Veuillez réessayer dans quelques instants.",
    required: "Veuillez remplir tous les champs obligatoires.",
    invalidEmail: "Veuillez entrer une adresse email valide.",
    shortMessage: "Veuillez fournir plus de détails pour que nous puissions mieux vous aider."
  },

  es: {
    sending: "Enviando tu mensaje al equipo de soporte...",
    success: "Tu mensaje se ha enviado correctamente. Nuestro equipo te responderá pronto.",
    error: "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos momentos.",
    required: "Por favor completa todos los campos obligatorios.",
    invalidEmail: "Introduce un correo electrónico válido.",
    shortMessage: "Proporciona más detalles para ayudarte mejor."
  },

  de: {
    sending: "Ihre Nachricht wird an unser Support-Team gesendet...",
    success: "Ihre Nachricht wurde erfolgreich gesendet. Unser Team wird sich bald bei Ihnen melden.",
    error: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
    required: "Bitte füllen Sie alle Pflichtfelder aus.",
    invalidEmail: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    shortMessage: "Bitte geben Sie mehr Details an, damit wir Ihnen besser helfen können."
  },

  ar: {
    sending: "جارٍ إرسال رسالتك إلى فريق الدعم...",
    success: "تم إرسال رسالتك بنجاح. سيتواصل معك فريقنا قريبًا.",
    error: "تعذر إرسال رسالتك. حاول مرة أخرى لاحقًا.",
    required: "يرجى ملء جميع الحقول المطلوبة.",
    invalidEmail: "يرجى إدخال بريد إلكتروني صالح.",
    shortMessage: "يرجى تقديم مزيد من التفاصيل لمساعدتك بشكل أفضل."
  },

  pt: {
    sending: "Enviando sua mensagem para nossa equipe de suporte...",
    success: "Sua mensagem foi enviada com sucesso. Nossa equipe responderá em breve.",
    error: "Não foi possível enviar sua mensagem. Tente novamente em instantes.",
    required: "Por favor preencha todos os campos obrigatórios.",
    invalidEmail: "Digite um e-mail válido.",
    shortMessage: "Forneça mais detalhes para que possamos ajudar melhor."
  },

  ja: {
    sending: "サポートチームにメッセージを送信中...",
    success: "メッセージが正常に送信されました。担当チームがまもなく対応します。",
    error: "メッセージを送信できませんでした。しばらくしてから再試行してください。",
    required: "すべての必須項目を入力してください。",
    invalidEmail: "有効なメールアドレスを入力してください。",
    shortMessage: "より詳細な情報を入力してください。"
  },

  zh: {
    sending: "正在将您的消息发送给支持团队...",
    success: "消息发送成功。我们的团队将尽快回复您。",
    error: "无法发送您的消息，请稍后再试。",
    required: "请填写所有必填字段。",
    invalidEmail: "请输入有效的电子邮件地址。",
    shortMessage: "请提供更多详细信息以便我们更好地帮助您。"
  },

  ru: {
    sending: "Отправка вашего сообщения в службу поддержки...",
    success: "Сообщение успешно отправлено. Наша команда скоро свяжется с вами.",
    error: "Не удалось отправить сообщение. Попробуйте позже.",
    required: "Пожалуйста, заполните все обязательные поля.",
    invalidEmail: "Введите корректный email адрес.",
    shortMessage: "Пожалуйста, добавьте больше деталей."
  }
};
const cvbContactFormTranslations = {
  en: {
    headerTitle: "Contact Support",
    headerDesc: "We're here to help. Describe your issue and our team will respond as soon as possible.",
    categoryLabel: "Category",
    emailLabel: "Email",
    messageLabel: "Message",
    messagePlaceholder: "Please describe your issue in detail. The more information you provide, the faster we can help you.",
    button: "Send Message",

    categories: {
        account: "Account & Authentication",
        billing: "Payments, Coins & Billing",
        cv_builder: "CV Builder & Profile Tools",
        tasks: "Tasks & Marketplace",
        technical: "Technical Issue / Bug",
        performance: "Performance & Loading Issues",
        data: "Data, Privacy & Security",
        suggestion: "Feature Request / Suggestion",
        report: "Report a User or Content",
        other: "Other Inquiry"
    },

    aiTitle: "Support System",
    aiDesc: "Your request is automatically analyzed and routed to the appropriate team to ensure efficient handling.",
    aiStat1: "Fast response time",
    aiStat2: "Accurate request routing",
    aiStat3: "Secure data handling",
  },

  fr: {
    headerTitle: "Contacter le support",
    headerDesc: "Nous sommes là pour vous aider. Décrivez votre problème et notre équipe vous répondra rapidement.",
    categoryLabel: "Catégorie",
    emailLabel: "Email",
    messageLabel: "Message",
    messagePlaceholder: "Décrivez votre problème en détail. Plus vous donnez d'informations, plus nous pourrons vous aider rapidement.",
    button: "Envoyer le message",

    categories: {
        account: "Compte et authentification",
        billing: "Paiements, pièces et facturation",
        cv_builder: "Constructeur CV et outils de profil",
        tasks: "Tâches et marché",
        technical: "Problème technique / Bug",
        performance: "Problèmes de performances et de chargement",
        data: "Données, confidentialité et sécurité",
        suggestion: "Demande de fonctionnalité / Suggestion",
        report: "Signaler un utilisateur ou un contenu",
        other: "Autre demande"
    },

    aiTitle: "Système de support",
    aiDesc: "Votre demande est automatiquement analysée et acheminée vers l'équipe appropriée pour garantir un traitement efficace.",
    aiStat1: "Temps de réponse rapide",
    aiStat2: "Acheminement précis des demandes",
    aiStat3: "Traitement sécurisé des données"
  },

  es: {
    headerTitle: "Contactar soporte",
    headerDesc: "Estamos aquí para ayudarte. Describe tu problema y nuestro equipo responderá lo antes posible.",
    categoryLabel: "Categoría",
    emailLabel: "Correo electrónico",
    messageLabel: "Mensaje",
    messagePlaceholder: "Describe tu problema en detalle. Cuanta más información proporciones, más rápido podremos ayudarte.",
    button: "Enviar mensaje",

    categories: {
        account: "Cuenta y autenticación",
        billing: "Pagos, monedas y facturación",
        cv_builder: "Constructor de CV y herramientas de perfil",
        tasks: "Tareas y mercado",
        technical: "Problema técnico / Error",
        performance: "Problemas de rendimiento y carga",
        data: "Datos, privacidad y seguridad",
        suggestion: "Solicitud de función / Sugerencia",
        report: "Reportar un usuario o contenido",
        other: "Otra consulta"
    },

    aiTitle: "Sistema de soporte",
    aiDesc: "Tu solicitud se analiza y se enruta automáticamente al equipo adecuado para garantizar un manejo eficiente.",
    aiStat1: "Respuesta rápida",
    aiStat2: "Enrutamiento preciso de solicitudes",
    aiStat3: "Manejo seguro de datos"
  },

  de: {
    headerTitle: "Support kontaktieren",
    headerDesc: "Wir helfen dir gerne. Beschreibe dein Problem und unser Team antwortet so schnell wie möglich.",
    categoryLabel: "Kategorie",
    emailLabel: "E-Mail",
    messageLabel: "Nachricht",
    messagePlaceholder: "Beschreibe dein Problem detailliert. Je mehr Informationen du gibst, desto schneller können wir helfen.",
    button: "Nachricht senden",

    categories: {
        account: "Konto und Authentifizierung",
        billing: "Zahlungen, Coins und Abrechnung",
        cv_builder: "CV-Builder und Profil-Tools",
        tasks: "Aufgaben und Marktplatz",
        technical: "Technisches Problem / Fehler",
        performance: "Leistungs- und Ladeprobleme",
        data: "Daten, Datenschutz und Sicherheit",
        suggestion: "Funktionsanfrage / Vorschlag",
        report: "Benutzer oder Inhalt melden",
        other: "Sonstige Anfrage"
    },

    aiTitle: "Support-System",
    aiDesc: "Ihre Anfrage wird automatisch analysiert und an das entsprechende Team weitergeleitet, um eine effiziente Bearbeitung zu gewährleisten.",
    aiStat1: "Schnelle Reaktionszeit",
    aiStat2: "Präzise Weiterleitung von Anfragen",
    aiStat3: "Sichere Datenverarbeitung"
  },

  ar: {
    headerTitle: "تواصل مع الدعم",
    headerDesc: "نحن هنا لمساعدتك. صف مشكلتك وسنرد عليك في أقرب وقت.",
    categoryLabel: "الفئة",
    emailLabel: "البريد الإلكتروني",
    messageLabel: "الرسالة",
    messagePlaceholder: "يرجى وصف مشكلتك بالتفصيل. كلما زادت المعلومات، تمكنا من مساعدتك بشكل أسرع.",
    button: "إرسال الرسالة",

    categories: {
        account: "الحساب والمصادقة",
        billing: "المدفوعات والعملات والفواتير",
        cv_builder: "منشئ السيرة الذاتية وأدوات الملف الشخصي",
        tasks: "المهام والسوق",
        technical: "مشكلة تقنية / خطأ",
        performance: "مشاكل الأداء والتحميل",
        data: "البيانات والخصوصية والأمان",
        suggestion: "طلب ميزة / اقتراح",
        report: "الإبلاغ عن مستخدم أو محتوى",
        other: "استفسار آخر"
    },

    aiTitle: "نظام الدعم",
    aiDesc: "يتم تحليل طلبك تلقائيًا وتوجيهه إلى الفريق المناسب لضمان المعالجة الفعالة.",
    aiStat1: "وقت استجابة سريع",
    aiStat2: "توجيه دقيق للطلبات",
    aiStat3: "معالجة آمنة للبيانات"
  },

  pt: {
    headerTitle: "Contactar suporte",
    headerDesc: "Estamos aqui para ajudar. Descreva o seu problema e nossa equipe responderá o mais rápido possível.",
    categoryLabel: "Categoria",
    emailLabel: "Email",
    messageLabel: "Mensagem",
    messagePlaceholder: "Descreva seu problema em detalhe. Quanto mais informação, mais rápido podemos ajudar.",
    button: "Enviar mensagem",

    categories: {
        account: "Conta e autenticação",
        billing: "Pagamentos, moedas e faturamento",
        cv_builder: "Construtor de CV e ferramentas de perfil",
        tasks: "Tarefas e mercado",
        technical: "Problema técnico / Bug",
        performance: "Problemas de desempenho e carregamento",
        data: "Dados, privacidade e segurança",
        suggestion: "Solicitação de recurso / Sugestão",
        report: "Denunciar usuário ou conteúdo",
        other: "Outra consulta"
    },

    aiTitle: "Sistema de suporte",
    aiDesc: "Sua solicitação é analisada automaticamente e encaminhada para a equipe apropriada para garantir um tratamento eficiente.",
    aiStat1: "Tempo de resposta rápido",
    aiStat2: "Encaminhamento preciso de solicitações",
    aiStat3: "Manipulação segura de dados"
  },

  ja: {
    headerTitle: "サポートに連絡",
    headerDesc: "問題を詳しく説明してください。できるだけ早く対応します。",
    categoryLabel: "カテゴリー",
    emailLabel: "メール",
    messageLabel: "メッセージ",
    messagePlaceholder: "できるだけ詳細に問題を説明してください。情報が多いほど早く対応できます。",
    button: "送信",

    categories: {
        account: "アカウントと認証",
        billing: "支払い、コイン、請求",
        cv_builder: "CVビルダーとプロフィールツール",
        tasks: "タスクとマーケットプレイス",
        technical: "技術的な問題 / バグ",
        performance: "パフォーマンスと読み込みの問題",
        data: "データ、プライバシーとセキュリティ",
        suggestion: "機能リクエスト / 提案",
        report: "ユーザーまたはコンテンツを報告",
        other: "その他のお問い合わせ"
    },

    aiTitle: "サポートシステム",
    aiDesc: "リクエストは自動的に分析され、効率的な処理を確保するために適切なチームにルーティングされます。",
    aiStat1: "迅速な応答時間",
    aiStat2: "正確なリクエストルーティング",
    aiStat3: "安全なデータ処理"
  },

  zh: {
    headerTitle: "联系支持",
    headerDesc: "我们随时为您提供帮助。请描述您的问题，我们会尽快回复。",
    categoryLabel: "类别",
    emailLabel: "邮箱",
    messageLabel: "消息",
    messagePlaceholder: "请尽可能详细描述问题，信息越多，我们处理越快。",
    button: "发送消息",

    categories: {
        account: "账户与认证",
        billing: "支付、积分与账单",
        cv_builder: "简历生成器与个人资料工具",
        tasks: "任务与市场",
        technical: "技术问题 / 错误",
        performance: "性能与加载问题",
        data: "数据、隐私与安全",
        suggestion: "功能请求 / 建议",
        report: "举报用户或内容",
        other: "其他咨询"
    },

    aiTitle: "支持系统",
    aiDesc: "您的请求会被自动分析并路由到合适的团队，以确保高效处理。",
    aiStat1: "快速响应时间",
    aiStat2: "准确的请求路由",
    aiStat3: "安全的数据处理"
  },

  ru: {
    headerTitle: "Связаться с поддержкой",
    headerDesc: "Опишите вашу проблему, и наша команда ответит как можно скорее.",
    categoryLabel: "Категория",
    emailLabel: "Email",
    messageLabel: "Сообщение",
    messagePlaceholder: "Чем подробнее описание, тем быстрее мы сможем помочь.",
    button: "Отправить",

    categories: {
        account: "Аккаунт и аутентификация",
        billing: "Платежи, монеты и биллинг",
        cv_builder: "Конструктор резюме и инструменты профиля",
        tasks: "Задачи и маркетплейс",
        technical: "Техническая проблема / Ошибка",
        performance: "Проблемы производительности и загрузки",
        data: "Данные, конфиденциальность и безопасность",
        suggestion: "Запрос функции / Предложение",
        report: "Пожаловаться на пользователя или контент",
        other: "Другой запрос"
    },

    aiTitle: "Система поддержки",
    aiDesc: "Ваш запрос автоматически анализируется и направляется в соответствующую команду для обеспечения эффективной обработки.",
    aiStat1: "Быстрое время ответа",
    aiStat2: "Точная маршрутизация запросов",
    aiStat3: "Безопасная обработка данных"
  }
};
function translateContactForm() {
    const lang = getCurrentLang();
    const t = cvbContactFormTranslations[lang] || cvbContactFormTranslations.en;

    const section = document.querySelector(".contact-live");
    if (!section) return;

    const title = section.querySelector(".contact-header h2");
    const desc = section.querySelector(".contact-header p");

    if (title) title.textContent = t.headerTitle;
    if (desc) desc.textContent = t.headerDesc;

    const categorySelect = document.getElementById("contactCategory");

    if (categorySelect && t.categories) {
    Array.from(categorySelect.options).forEach(option => {
        const key = option.value;
        if (t.categories[key]) {
        option.textContent = t.categories[key];
        }
    });
    }

    const labels = section.querySelectorAll(".field label");

    if (labels[0]) labels[0].textContent = t.categoryLabel;
    if (labels[1]) labels[1].textContent = t.emailLabel;
    if (labels[2]) labels[2].textContent = t.messageLabel;

    const textarea = document.getElementById("contactMessage");
    if (textarea) textarea.placeholder = t.messagePlaceholder;

    const btn = document.getElementById("sendContactBtn");
    if (btn) btn.textContent = t.button;

    const aiTitle = section.querySelector(".ai-title");
        const aiDesc = section.querySelector(".ai-desc");
    const aiStats = section.querySelectorAll(".ai-stat");

    if (aiTitle) aiTitle.textContent = t.aiTitle;
    if (aiDesc) aiDesc.textContent = t.aiDesc;

    if (aiStats[0]) aiStats[0].textContent = t.aiStat1;
    if (aiStats[1]) aiStats[1].textContent = t.aiStat2;
    if (aiStats[2]) aiStats[2].textContent = t.aiStat3;
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