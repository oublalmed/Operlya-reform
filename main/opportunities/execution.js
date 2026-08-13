// ================================= Import Firebase SDKs ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
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
let currentOpenedTaskId = null;
let currentUser = null;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
let pendingTaskIdFromUrl = null;
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
    currentUser = user;
    updateUserSection(user);
    updateInterfaceSubtitle(user);
    loadExecutorKPIs(user);
    loadExecutorTasks(user);
    switchView("list");
  } else {
    updateUserSection(null);
    if (!window.location.pathname.includes("/auth/login.html")) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = "/auth/login.html";
    }
  }
});

async function updateInterfaceSubtitle(user) {
  const selectedLang = getCurrentLang();
  const t = cvbTexecUITranslations[selectedLang] || cvbTexecUITranslations['en'];

  const welcomeEl = document.getElementById("interfaceWelcome");
  const subtitleEl = document.getElementById("interfacesubTitle");

  if (!welcomeEl || !subtitleEl) return;

  if (!user) {
    welcomeEl.textContent = t.interfaceWelcomeGuest || "Welcome,";
    subtitleEl.textContent = t.interfaceSubtitleGuest;
    return;
  }

  try {
    const docRef = doc(db, "profiles", user.uid);
    const docSnap = await getDoc(docRef);
    let firstName = "there";
    if (docSnap.exists()) {
      const data = docSnap.data();
      firstName = data.first_name || "there";
    }
    welcomeEl.innerHTML = `${t.interfaceSubtitleUserWelcome || "Welcome back,"} <strong>${firstName}</strong>`;
    subtitleEl.textContent = t.interfaceSubtitleUser;
  } catch (error) {
    console.error("Subtitle update error:", error);
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

    if (!notifItems || !notifCount) return;

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

// =============================== TASKS DISPLAY =================================

async function loadExecutorKPIs(user) {

  const selectedLang = getCurrentLang();
  const t = cvbTexecUITranslations[selectedLang] || cvbTexecUITranslations['en'];

  const q = query(
    collection(db, "opportunities"),
    where("status", "in", ["Open", "Assigned", "Progressing", "Completed", "Cancelled"])
  );

  const snap = await getDocs(q);

  const counts = {
    pending: 0,
    accepted: 0,
    assigned: 0,
    progressing: 0,
    completed: 0,
    declined: 0
  };

  for (const docSnap of snap.docs) {
    const applyRef = doc(db, "opportunities", docSnap.id, "applies", user.uid);
    const applySnap = await getDoc(applyRef);
    if (!applySnap.exists()) continue;
    const status = applySnap.data().status;
    if (counts[status] !== undefined) {
      counts[status]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const bar = document.getElementById("texec-kpiBar");
  bar.innerHTML = "";

  if (!total) {
    document.getElementById("texec-kpiTotal").innerText = 0;
    document.getElementById("kpiCompletedLabel").innerText = `0 ${t.completed}`;
    document.getElementById("kpiProgressingLabel").innerText = `0 ${t.completed}`;
    return;
  }

  document.getElementById("texec-kpiTotal").innerText = total;
  document.getElementById("kpiCompletedLabel").innerText = `${counts.completed} ${t.completed}`;
  document.getElementById("kpiProgressingLabel").innerText = `${counts.progressing} ${t.active}`;

  Object.entries(counts).forEach(([status, value]) => {
    if (!value) return;
    const segment = document.createElement("div");
    segment.className = `texec-kpiSegment ${status}`;
    segment.style.width = `${(value / total) * 100}%`;
    segment.title = `${status}: ${value}`;
    bar.appendChild(segment);
  });

}

async function loadExecutorTasks(user) {
  const q = query(
    collection(db, "opportunities"),
    where("status", "in", ["Open", "Assigned", "Progressing", "Completed", "Cancelled"])
  );
  const snap = await getDocs(q);
  const tasks = [];

  for (const docSnap of snap.docs) {
    const task = { id: docSnap.id, ...docSnap.data() };

    const appliedSnap = await getDoc(doc(db, "opportunities", docSnap.id, "applies", user.uid));
    const savedSnap = await getDoc(doc(db, "opportunities", docSnap.id, "saves", user.uid));

    let applyStatus = null;

    if (appliedSnap.exists()) {
      applyStatus = appliedSnap.data().status;
    }

    if (appliedSnap.exists() || savedSnap.exists()) {

      tasks.push({
        ...task,
        _applyStatus: applyStatus
      });
    }
  }

  executorTasks = tasks;
  setupTableFilters();
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  pendingTaskIdFromUrl = params.get("opportunityId");
});

// ================================ TASKS FILTERS ==================================

let applyFiltersGlobal = null;
let filtersInitialized = false;
let executorTasks = [];
let filterTimeout = null;

function setupTableFilters(allTasks) {

  if (filtersInitialized) {
    applyFilters();
    return;
  }

  filtersInitialized = true;
  
  const statusFilters = document.querySelectorAll("#texec-statusFilters input");
  const periodSelect = document.getElementById("texec-periodFilter");
  const startInput = document.getElementById("texec-startDate");
  const endInput = document.getElementById("texec-endDate");
  const searchInput = document.getElementById("texec-searchInput");

  const STATUS_STORAGE_KEY = "texec_status_filters";

  function loadStatusFilters() {
      const saved = localStorage.getItem(STATUS_STORAGE_KEY);
      if (!saved) return;
      const savedStatuses = JSON.parse(saved);
      statusFilters.forEach(cb => {
        cb.checked = savedStatuses.includes(cb.value);
      });
  }

  function saveStatusFilters() {
    const selected = [];
    statusFilters.forEach(cb => {
      if (cb.checked) selected.push(cb.value);
    });
    localStorage.setItem(
      STATUS_STORAGE_KEY,
      JSON.stringify(selected)
    );
  }

  function getFilteredTasks() {

    let filtered = [...executorTasks];

    const periodValue = periodSelect.value;

    const hasCustomStart = startInput.value.trim() !== "";
    const hasCustomEnd = endInput.value.trim() !== "";

    const now = new Date();

    let filterStart = null;
    let filterEnd = null;

    // =====================================================
    // 🟢 PRIORITY RULE:
    // If ANY custom date exists → ignore period dropdown
    // =====================================================

    if (hasCustomStart || hasCustomEnd) {

      if (hasCustomStart)
        filterStart = new Date(startInput.value);

      if (hasCustomEnd)
        filterEnd = new Date(endInput.value);

    } else {

      // Only use period filter if NO custom dates
      if (periodValue !== "all") {

        const days = parseInt(periodValue);

        filterEnd = now;
        filterStart = new Date();
        filterStart.setDate(now.getDate() - days);
      }
    }

    // =====================================================
    // Apply overlap filter
    // =====================================================

    if (filterStart || filterEnd) {

      filtered = filtered.filter(task => {

        const taskStart = task.schedule?.startDate
          ? new Date(task.schedule.startDate)
          : null;

        const taskEnd = task.schedule?.endDate
          ? new Date(task.schedule.endDate)
          : null;

        if (!taskStart && !taskEnd) return false;

        const realTaskEnd =
          taskEnd || new Date(taskStart.getTime() + 3600 * 1000);

        if (filterStart && realTaskEnd < filterStart)
          return false;

        if (filterEnd && taskStart > filterEnd)
          return false;

        return true;
      });
    }

    // =====================================================
    // Search filter
    // =====================================================

    const searchValue = searchInput.value.trim().toLowerCase();

    if (searchValue) {
      filtered = filtered.filter(task =>
        task.title?.toLowerCase().includes(searchValue) ||
        task.description?.toLowerCase().includes(searchValue)
      );
    }

    // ================= APPLY STATUS FILTER =================

    const selectedStatuses = [];
    statusFilters.forEach(cb => {
      if (cb.checked) selectedStatuses.push(cb.value);
    });
    if (selectedStatuses.length) {
      filtered = filtered.filter(task =>
        task._applyStatus && selectedStatuses.includes(task._applyStatus)
      );
    }
    return filtered;
  }

  function debouncedApplyFilters() {
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }
    
    filterTimeout = setTimeout(() => {
      const filtered = getFilteredTasks();
      renderList(filtered);
      renderBoard(filtered);
      renderGantt(filtered);
      filterTimeout = null;
    }, 300);
  }

  applyFiltersGlobal = debouncedApplyFilters;

  statusFilters.forEach(cb => {
    cb.addEventListener("change", () => {
      saveStatusFilters();
      debouncedApplyFilters();
    });
  });

  periodSelect.addEventListener("change", debouncedApplyFilters);
  startInput.addEventListener("input", debouncedApplyFilters);
  endInput.addEventListener("input", debouncedApplyFilters);
  searchInput.addEventListener("input", debouncedApplyFilters);

  loadStatusFilters();
  debouncedApplyFilters();
}

let viewSwitchTimeout = null;

function switchView(view) {
  if (viewSwitchTimeout) {
    clearTimeout(viewSwitchTimeout);
  }
  
  viewSwitchTimeout = setTimeout(() => {
    const listWrapper = document.getElementById("texec-listWrapper");
    const boardWrapper = document.getElementById("texec-boardWrapper");
    const ganttWrapper = document.getElementById("texec-ganttWrapper");

    listWrapper.style.display = "none";
    boardWrapper.style.display = "none";
    ganttWrapper.style.display = "none";

    document.querySelectorAll(".texec-viewBtn")
      .forEach(btn => btn.classList.remove("active"));

    const activeBtn = document.querySelector(
      `.texec-viewBtn[data-view="${view}"]`
    );

    if (activeBtn) activeBtn.classList.add("active");

    if (view === "list") {
      listWrapper.style.display = "block";
    }

    if (view === "board") {
      boardWrapper.style.display = "block";
    }

    if (view === "gantt") {
      ganttWrapper.style.display = "block";
    }
    
    viewSwitchTimeout = null;
  }, 100);
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

const statusFilters = document.querySelector(".texec-statusList");
const filterInputs = document.querySelector(".texec-filterInputs");
const advancedToggle = document.getElementById("texec-advancedToggle");
advancedToggle.addEventListener("click", () => {
  if(window.innerWidth <= 768){
    statusFilters.classList.toggle("expanded");
    filterInputs.classList.toggle("expanded");
  }
  advancedToggle.classList.toggle("active");
});

// ============================= EXECUTION NAV FORMAT ================================

function renderEmptyAppliesState() {
  const selectedLang = getCurrentLang();
  const t = cvbEmptyStateTranslations[selectedLang] || cvbEmptyStateTranslations['en'];
  
  return `
    <div class="texec-emptyState">
      <div class="texec-emptyIcon">
        <i class="ri-rocket-2-line"></i>
      </div>
      <h3>${t.noAppliesTitle}</h3>
      <p>${t.noAppliesText}</p>
      <a href="/feed.html" class="texec-emptyBtn">
        ${t.noAppliesBtn} <i class="ri-arrow-right-line"></i>
      </a>
    </div>
  `;
}

async function renderList(tasks) {
  const selectedLang = getCurrentLang();
  const tUI = cvbTexecUITranslations[selectedLang] || cvbTexecUITranslations['en'];
  const t = cvbTaskInfoTranslations[selectedLang] || cvbTaskInfoTranslations['en'];
  const T = taskForm_translations[selectedLang] || taskForm_translations['en'];
  const statusT = cvbTaskStatusTranslations[selectedLang] || cvbTaskStatusTranslations['en'];

  const wrapper = document.getElementById("texec-listWrapper");
  const list = document.getElementById("texec-list");
  list.innerHTML = "";

  if (!tasks.length) {
    wrapper.innerHTML = renderEmptyAppliesState();
    return;
  }

  const currentUser = auth.currentUser;

  for (const task of tasks) {

    /* ===== GET APPLY STATUS ===== */
    let applyStatus = null;

    if (currentUser) {
      const applySnap = await getDoc(
        doc(db, "opportunities", task.id, "applies", currentUser.uid)
      );

      if (applySnap.exists()) {
        applyStatus = applySnap.data().status;
      }
    }

    const statusKey = applyStatus || task.status || "pending";

    const statusClass = statusKey;

    const statusLabel =
      statusT[statusKey] ||
      t[`status${statusKey.charAt(0).toUpperCase()}${statusKey.slice(1)}`] ||
      statusKey;

    const schedule = task.schedule || {};

    /* ===== PERIOD ===== */
    let periodHTML = "";

    if (schedule.startDate || schedule.endDate) {
      if (schedule.startDate && schedule.endDate) {
        periodHTML = `
          <span class="period">
            ${formatDate(schedule.startDate, t)} → ${formatDate(schedule.endDate, t)}
          </span>
        `;
      } else if (schedule.startDate) {
        periodHTML = `
          <span class="period">
            ${t.from} ${formatDate(schedule.startDate, t)}
          </span>
        `;
      } else if (schedule.endDate) {
        periodHTML = `
          <span class="period">
            ${t.until} ${formatDate(schedule.endDate, t)}
          </span>
        `;
      }
    }

    /* ===== DURATION + FLEXIBILITY ===== */
    const durationFlexHTML =
      (schedule.estimatedDuration || schedule.timeFlexibility)
        ? `<span class="duration">
            ${t.duration}: ${
              [
                schedule.estimatedDuration && `${schedule.estimatedDuration}${t.hoursShort}`,
                T[`time-${schedule.timeFlexibility?.toLowerCase()}`] || schedule.timeFlexibility
              ].filter(Boolean).join(" · ")
            }
          </span>`
        : "";

    /* ===== DEADLINE ===== */
    const deadlineHTML = schedule.deadline
      ? `<span class="deadline">
          ${t.deadline}: ${formatDate(schedule.deadline, t)}
        </span>`
      : "";

    const card = document.createElement("div");
    card.className = "texec-listCard";
    card.dataset.id = task.id;

    card.innerHTML = `
      <div class="texec-listTop">
        <div class="texec-statusGroup">
          <div class="texec-statusDot ${statusClass}"></div>
          <span class="texec-statusText">${statusLabel}</span>
        </div>

        <div class="texec-date">
          ${task.createdAt ? formatDate(task.createdAt, t) : ""}
        </div>
      </div>

      <div class="texec-listTitle">
        ${task.title || t.taskNotFound}
      </div>

      ${
        task.description
          ? `<div class="texec-listDescription">${task.description}</div>`
          : ""
      }

      <div class="texec-listTiming">
        ${periodHTML}
        ${durationFlexHTML}
        ${deadlineHTML}
      </div>
    `;

    card.addEventListener("click", () => {

      document.querySelectorAll(".texec-listCard")
        .forEach(c => c.classList.remove("active"));

      card.classList.add("active");

      document
        .getElementById("tasksExecution-wrapper")
        .classList.add("open-task");

      displayTaskCard(task.id);
    });

    list.appendChild(card);
  }

  const oldCta = document.getElementById("texec-cta");
  if (oldCta) oldCta.remove();

  if (tasks.length <= 6) {
    const cta = document.createElement("div");
    cta.id = "texec-cta";
    cta.className = "texec-cta";

    cta.innerHTML = `
      <div class="texec-cta-content">
        <div class="texec-cta-icon">
          <i class="ri-flashlight-line"></i>
        </div>

        <div class="texec-cta-text">
          <strong>${tUI.texecCtaTitle}</strong>
          <span>${tUI.texecCtaText}</span>
        </div>

        <a href="/feed.html" class="texec-emptyBtn">
          ${tUI.texecCtaButton}
        </a>
      </div>
    `;

    document
      .getElementById("texec-tasksWrapper")
      .appendChild(cta);
  }

  // ================= AUTO OPEN FROM URL =================
  if (pendingTaskIdFromUrl) {
    const targetCard = document.querySelector(
      `.texec-listCard[data-id="${pendingTaskIdFromUrl}"]`
    );
    if (targetCard) {
      targetCard.click();
      targetCard.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      pendingTaskIdFromUrl = null;
    }
  }
}

const APPLY_PIPELINE = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "assigned", label: "Assigned" },
  { key: "progressing", label: "Progressing" },
  { key: "completed", label: "Completed" },
  { key: "declined", label: "Declined" }
];

async function renderBoard(tasks) {

  const selectedLang = getCurrentLang();
  const t = cvbTaskInfoTranslations[selectedLang] || cvbTaskInfoTranslations['en'];
  const T = taskForm_translations[selectedLang] || taskForm_translations['en'];
  const statusT = cvbTaskStatusTranslations[selectedLang] || cvbTaskStatusTranslations['en'];

  const wrapper = document.getElementById("texec-boardWrapper");
  const board = document.getElementById("texec-board");
  board.innerHTML = "";

  if (!tasks.length) {
    wrapper.innerHTML = renderEmptyAppliesState();
    return;
  }

  const currentUser = auth.currentUser;

  for (const stage of APPLY_PIPELINE) {

    const stageTasks = [];

    for (const task of tasks) {
      let applyStatus = null;

      if (currentUser) {
        const applySnap = await getDoc(doc(db, "opportunities", task.id, "applies", currentUser.uid));
        if (applySnap.exists()) {
          applyStatus = applySnap.data().status;
        }
      }

      if (applyStatus === stage.key) {
        stageTasks.push(task);
      }
    }

    const column = document.createElement("div");
    column.className = `texec-column ${stage.key}`;

    column.innerHTML = `
      <h4>
        ${statusT[stage.key] || stage.label}
        <span class="texec-columnCount">${stageTasks.length}</span>
      </h4>

      <div class="texec-columnBody">
        ${stageTasks.map(task => {

          const schedule = task.schedule || {};

          let periodHTML = "";
          if (schedule.startDate || schedule.endDate) {
            if (schedule.startDate && schedule.endDate) {
              periodHTML = `<span class="period">${formatDate(schedule.startDate, t)} → ${formatDate(schedule.endDate, t)}</span>`;
            } else if (schedule.startDate) {
              periodHTML = `<span class="period">${t.from} ${formatDate(schedule.startDate, t)}</span>`;
            } else {
              periodHTML = `<span class="period">${t.until} ${formatDate(schedule.endDate, t)}</span>`;
            }
          }

          const durationHTML =
            (schedule.estimatedDuration || schedule.timeFlexibility)
              ? `<span class="duration">
                  <i class="ri-hourglass-2-fill"></i>
                  ${t.duration}: ${
                    [
                      schedule.estimatedDuration && `${schedule.estimatedDuration}h`,
                      T[`time-${schedule.timeFlexibility?.toLowerCase()}`] || schedule.timeFlexibility
                    ].filter(Boolean).join(" · ")
                  }
                </span>`
              : "";

          const deadlineHTML = schedule.deadline
            ? `<span class="deadline">
                <i class="ri-timer-line"></i>
                ${t.deadline}: ${formatDate(schedule.deadline, t)}
              </span>`
            : "";

          return `
            <div class="texec-taskCardMini" data-id="${task.id}">
              <div class="texec-taskTitleMini">
                ${task.title || t.taskNotFound}
              </div>

              ${
                task.description
                  ? `<div class="texec-taskDescriptionMini">${task.description}</div>`
                  : ""
              }

              <div class="texec-taskTimingMini">
                ${periodHTML}
                ${durationHTML}
                ${deadlineHTML}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    board.appendChild(column);
  }

  document.querySelectorAll(".texec-taskCardMini").forEach(card => {
    card.addEventListener("click", () => {

      document.querySelectorAll(".texec-taskCardMini")
        .forEach(c => c.classList.remove("active"));

      card.classList.add("active");

      const wrapper = document.getElementById("tasksExecution-wrapper");
      wrapper.classList.add("open-task");

      displayTaskCard(card.dataset.id);
    });
  });
}

async function renderGantt(tasks) {

  const selectedLang = getCurrentLang();
  const t = cvbTaskInfoTranslations[selectedLang] || cvbTaskInfoTranslations['en'];
  const statusT = cvbTaskStatusTranslations[selectedLang] || cvbTaskStatusTranslations['en'];

  const wrapper = document.getElementById("texec-ganttWrapper");
  const gantt = document.getElementById("texec-gantt");

  if (!wrapper || !gantt) return;

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  gantt.innerHTML = "";

  if (!tasks.length) {
    wrapper.innerHTML = renderEmptyAppliesState();
    return;
  }

  const now = new Date();
  let minDate = new Date(now);
  let maxDate = new Date(now);

  const tasksWithStatus = [];

  for (const task of tasks) {

    const applySnap = await getDoc(doc(db, "opportunities", task.id, "applies", currentUser.uid));

    if (!applySnap.exists()) continue;

    const applyStatus = applySnap.data().status || "pending";

    const start = task.schedule?.startDate
      ? new Date(task.schedule.startDate)
      : now;

    const end = task.schedule?.endDate
      ? new Date(task.schedule.endDate)
      : new Date(start.getTime() + 3600*1000);

    if (start < minDate) minDate = start;
    if (end > maxDate) maxDate = end;

    tasksWithStatus.push({
      ...task,
      applyStatus,
      start,
      end
    });
  }

  minDate.setMinutes(0,0,0);
  maxDate.setMinutes(0,0,0);

  const totalHours = Math.ceil((maxDate - minDate) / (1000*60*60));

  generateGanttTimeRuler(minDate, maxDate, totalHours);

  for (const stage of APPLY_PIPELINE) {

    const stageTasks = tasksWithStatus.filter(
      t => t.applyStatus === stage.key
    );

    if (!stageTasks.length) continue;

    const group = document.createElement("div");
    group.className = "gantt-group";

    group.innerHTML = `
      <div class="gantt-groupHeader">
        ${statusT[stage.key] || stage.label}
        <span class="gantt-groupCount">${stageTasks.length}</span>
      </div>
    `;

    for (const task of stageTasks) {

      const row = document.createElement("div");
      row.className = "gantt-row";

      const bars = document.createElement("div");
      bars.className = "gantt-taskBars";
      bars.style.gridTemplateColumns = `repeat(${totalHours}, 3px)`;

      const bar = document.createElement("div");
      bar.className = `gantt-taskBar ${task.applyStatus}`;
      bar.style.cursor = "pointer";
      bar.addEventListener("click", () => {
        document.querySelectorAll(
          ".texec-listCard, .texec-taskCardMini, .gantt-taskBar"
        ).forEach(el => el.classList.remove("active"));

        bar.classList.add("active");
        const wrapper = document.getElementById("tasksExecution-wrapper");
        if (wrapper) {
          wrapper.classList.add("open-task");
        }
        displayTaskCard(task.id);
      });
      bar.textContent = task.title || "Untitled";

      const offsetHours =
        Math.floor((task.start - minDate) / (1000*60*60));

      const durationHours =
        Math.max(1, Math.ceil((task.end - task.start) / (1000*60*60)));

      bar.style.gridColumn =
        `${offsetHours + 1} / span ${durationHours}`;

      // ===== ADD DEADLINE LINE INSIDE BAR =====
      if (task.schedule?.deadline) {

        const deadlineDate = new Date(task.schedule.deadline);

        // Only show if deadline is inside task duration
        if (deadlineDate >= task.start && deadlineDate <= task.end) {

          const totalDuration =
            task.end - task.start;

          const deadlineOffset =
            deadlineDate - task.start;

          const percentage =
            (deadlineOffset / totalDuration) * 100;

          const line = document.createElement("div");
          line.className = "gantt-deadlineLine";

          line.style.left = `${percentage}%`;

          bar.appendChild(line);
        }
      }

      bars.appendChild(bar);
      row.appendChild(bars);

      group.appendChild(row);
    }

    gantt.appendChild(group);
  }

  gantt.style.minWidth = `${totalHours * 3}px`;
}

function generateGanttTimeRuler(minDate, maxDate, totalHours) {

  const ruler = document.getElementById("ganttTimeRuler");
  if (!ruler) return;

  ruler.innerHTML = "";

  const spacer = document.createElement("div");
  spacer.style.gridColumn = "1";
  ruler.appendChild(spacer);

  ruler.style.display = "grid";
  ruler.style.gridTemplateColumns = `repeat(${totalHours}, 3px)`;
  ruler.style.gridTemplateRows = `24px 22px`;

  const current = new Date(minDate);
  let currentDay = null;
  let dayStart = 0;

  const monthCursor = new Date(minDate);
  let currentMonth = null;
  let monthStart = 0;

  for (let h = 0; h < totalHours; h++) {

    const monthKey = monthCursor.getFullYear() + "-" + monthCursor.getMonth();

    if (monthKey !== currentMonth) {

      if (ruler.lastElementChild && currentMonth !== null) {
        ruler.lastElementChild.style.gridColumnEnd = `span ${h - monthStart}`;
      }

      const monthLabel = document.createElement("div");
      monthLabel.className = "gantt-monthLabel";

      monthLabel.textContent = monthCursor.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
      });

      monthLabel.style.gridRow = "1";
      monthLabel.style.gridColumnStart = h + 1;

      ruler.appendChild(monthLabel);

      currentMonth = monthKey;
      monthStart = h;
    }

    monthCursor.setHours(monthCursor.getHours() + 1);
  }

  if (ruler.lastElementChild) {
    ruler.lastElementChild.style.gridColumnEnd = `span ${totalHours - monthStart}`;
  }

  for (let h = 0; h < totalHours; h++) {

    const dayKey = current.toDateString();

    if (dayKey !== currentDay) {

      if (ruler.lastElementChild) {
        ruler.lastElementChild.style.gridColumnEnd = `span ${h - dayStart}`;
      }

      const dayLabel = document.createElement("div");
      dayLabel.className = "gantt-dayLabel";
      dayLabel.textContent = current.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });

      dayLabel.style.gridColumnStart = h + 1;
      dayLabel.style.gridRow = "2";

      ruler.appendChild(dayLabel);

      currentDay = dayKey;
      dayStart = h;
    }

    current.setHours(current.getHours() + 1);
  }

  if (ruler.lastElementChild) {
    ruler.lastElementChild.style.gridColumnEnd = `span ${totalHours - dayStart}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const viewButtons = document.querySelectorAll(".texec-viewBtn");

  function switchView(view) {

    const listWrapper = document.getElementById("texec-listWrapper");
    const boardWrapper = document.getElementById("texec-boardWrapper");
    const ganttWrapper = document.getElementById("texec-ganttWrapper");

    listWrapper.style.display = "none";
    boardWrapper.style.display = "none";
    ganttWrapper.style.display = "none";

    document.querySelectorAll(".texec-viewBtn")
      .forEach(btn => btn.classList.remove("active"));

    const activeBtn = document.querySelector(
      `.texec-viewBtn[data-view="${view}"]`
    );

    if (activeBtn) activeBtn.classList.add("active");

    if (view === "list") {
      listWrapper.style.display = "block";
    }

    if (view === "board") {
      boardWrapper.style.display = "block";
    }

    if (view === "gantt") {
      ganttWrapper.style.display = "block";
    }
  }

  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      switchView(btn.dataset.view);
    });
  });

  document.getElementById("texec-searchInput")
  ?.dispatchEvent(new Event("input"));

});

// =========================== EXECUTION SELECTED TASK ==============================

async function displayTaskCard(opportunityId) {

  currentOpenedTaskId = opportunityId;
  
  const selectedLang = getCurrentLang();
  const t = cvbTaskInfoTranslations[selectedLang] || cvbTaskInfoTranslations['en'];

  const container = document.getElementById("texec-taskDetails");
  container.innerHTML = "";

  try {

    const taskRef = doc(db, "opportunities", opportunityId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      container.innerHTML = `<p>${t.taskNotFound}</p>`;
      return;
    }

    const task = { id: taskSnap.id, ...taskSnap.data() };

    const currentUser = auth.currentUser;
    let applyStatus = null;
    let applierStatus = null;

    if (currentUser) {
      const applyRef = doc(db, "opportunities", opportunityId, "applies", currentUser.uid);
      const applySnap = await getDoc(applyRef);

      if (applySnap.exists()) {
        const data = applySnap.data();
        applyStatus = data.status;
        applierStatus = data.applierStatus || null;
      }
    }

    // ===== LOAD OWNER DATA =====
    let ownerData = {
      ownerName: "Unknown",
      ownerAvatar: "/images/default_avatar.png",
      ownerVerified: false,
      ownerIndustry: "",
      ownerRole: ""
    };

    if (task.ownerId) {
      const ownerSnap = await getDoc(doc(db, "profiles", task.ownerId));
      if (ownerSnap.exists()) {
        const data = ownerSnap.data();

        ownerData.ownerName =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() || "Anonymous";

        ownerData.ownerAvatar = data.avatar || ownerData.ownerAvatar;
        ownerData.ownerVerified = data.verified === true;
        ownerData.ownerIndustry = data.industry || "";
        ownerData.ownerRole = data.role || "";
      }
    }

    // ===== STATUS BLOCK =====
    if (applyStatus) {

      const statusRow = document.createElement("div");
      statusRow.className = "pv-statusRow";

      const statusBox = document.createElement("div");

      let icon = "ri-time-line";
      let label = t.statusPending;
      let visualStatus = applyStatus;

      if (applyStatus === "accepted") {
        icon = "ri-user-follow-line";
        label = t.statusAccepted;

      } else if (applyStatus === "assigned") {
        icon = "ri-checkbox-circle-line";
        label = t.statusAssigned;

      } else if (applyStatus === "progressing") {
        icon = "ri-flashlight-line";
        label = t.statusProgressing;

      } else if (applyStatus === "completed") {
        icon = "ri-checkbox-circle-fill";
        label = t.statusCompleted;

      } else if (applyStatus === "declined") {
        icon = "ri-close-circle-line";
        label = t.statusDeclined;
      }

      statusBox.className = `pv-applyStatus ${visualStatus}`;
      statusBox.innerHTML = `<i class="${icon}"></i> ${label}`;

      statusRow.appendChild(statusBox);
      container.appendChild(statusRow);

      const applyRef = doc(db, "opportunities", opportunityId, "applies", currentUser.uid);

      // ===== DECLARE PROGRESS =====
      if (applyStatus === "assigned" && !applierStatus) {

        const progressBtn = document.createElement("button");
        progressBtn.textContent = t.declareProgress;
        progressBtn.className = "pv-ProgressBtn";

        progressBtn.addEventListener("click", async () => {
          try {

            await updateDoc(applyRef, {
              applierStatus: "progressing"
            });

            progressBtn.remove();
            addCompleteBtn();

          } catch (err) {
            console.error("Failed to set progressing:", err);
          }
        });

        statusRow.appendChild(progressBtn);
      }

      // ===== COMPLETE BUTTON =====
      const addCompleteBtn = () => {

        const completeBtn = document.createElement("button");
        completeBtn.textContent = t.confirmCompleteness;
        completeBtn.className = "pv-ProgressBtn";

        completeBtn.addEventListener("click", async () => {

          try {

            await updateDoc(applyRef, {
              applierStatus: "completed"
            });

            completeBtn.remove();

            const confirmed = document.createElement("div");
            confirmed.className = "pv-confirmedMsg";
            confirmed.innerHTML = `
              <i class="ri-check-double-line"></i>
              ${t.confirmedCompletion}
            `;

            statusRow.appendChild(confirmed);

          } catch (err) {
            console.error("Failed to confirm completeness:", err);
          }
        });

        statusRow.appendChild(completeBtn);
      };

      if (applierStatus === "progressing") {
        addCompleteBtn();
      }

      if (applierStatus === "completed") {

        const confirmed = document.createElement("div");
        confirmed.className = "pv-confirmedMsg";
        confirmed.innerHTML = `
          <i class="ri-check-double-line"></i>
          ${t.confirmedCompletion}
        `;

        statusRow.appendChild(confirmed);
      }
    }

    // ===== BUILD CARD =====
    const card = document.createElement("div");
    card.className = "pv-taskCard collapsed";

    const isJob = task.category === "jobs";
    card.innerHTML = `
      <button class="pv-closeBtn" title="${t.closeTask}">
        <i class="ri-close-line"></i>
      </button>

      <button class="pv-expandBtn">
        <i class="ri-arrow-down-wide-line"></i>
      </button>

      ${isJob
        ? buildJobCard(task, ownerData)
        : buildTaskCard(task, ownerData)
      }
    `;

    const expandBtn = card.querySelector(".pv-expandBtn");
    expandBtn.addEventListener("click", () => {
      card.classList.toggle("collapsed");
    });

    card.querySelector(".pv-closeBtn").addEventListener("click", () => {
      currentOpenedTaskId = null;
      if (chatUnsubscribe) {
        chatUnsubscribe();
        chatUnsubscribe = null;
      }
      container.innerHTML = "";
      const wrapper = document.querySelector(".tasksExecution-wrapper");
      wrapper.classList.remove("open-task");
      document.querySelectorAll(".texec-listCard, .texec-taskCardMini")
        .forEach(c => c.classList.remove("active"));
    });

    container.appendChild(card);

    // ===== SCROLL =====
    const yOffset = -80;
    const y = container.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth"
    });

    // ===== CHAT =====
    if (["accepted", "assigned", "progressing", "completed"].includes(applyStatus)) {

      const chatContainer = document.createElement("div");
      chatContainer.className = "tm-chatContainer";

      container.appendChild(chatContainer);

      setTimeout(() => {
        openGroupChat(opportunityId);
      }, 100);
    }

  } catch (error) {
    console.error("Display task error:", error);
  }
}

function buildTaskCard(task, ownerData) {

  const selectedLang = getCurrentLang();
  const t = cvbTaskInfoTranslations[selectedLang] || cvbTaskInfoTranslations['en'];
  const f = taskForm_translations[selectedLang] || taskForm_translations['en'];

  const {
    ownerName,
    ownerAvatar,
    ownerVerified,
    ownerIndustry,
    ownerRole
  } = ownerData;

  const span = (content, cls = "", style = "") =>
    `<span ${cls ? `class="${cls}"` : ""} ${style ? `style="${style}"` : ""}>${content}</span>`;

  const iconTag = (icon, text, cls = "") =>
    `<span class="${cls}"><i class="${icon}"></i>${text}</span>`;

  const joinSafe = arr => arr.filter(Boolean).join("");

  // ================= EXECUTION TAGS =================
  const execEntityHTML = task.executionEntity
    ? `<span class="pv-tag--execution">
        ${f['execution-entity-label'] || "Execution Entity"} :
        ${f[`entity-${task.executionEntity.toLowerCase()}`] || task.executionEntity}
      </span>`
    : "";

  const taskScaleHTML = task.taskScale
    ? `<span class="pv-tag--scale">
        ${f['task-scale-label'] || "Task Scale"} :
        ${f[`scale-${task.taskScale.toLowerCase()}`] || task.taskScale}
      </span>`
    : "";

  const typeLabel = task.industry
    ? `${f[`work-nature-${task.type.toLowerCase()}`] || task.type || "Task"} ${t.in} ${f[`category-${task.industry.toLowerCase()}`] || task.industry.replaceAll("_", " ")}`
    : f[`work-nature-${task.type.toLowerCase()}`] || task.type || "Task";

  const skillsHTML = task.skills?.length
    ? `<div style="display: block;">
        ${task.skills.map(s => renderSkillCircle(s)).join("")}
      </div>`
    : "";

  const languagesHTML = task.languages?.length
    ? `<div style="display: block;">
        ${task.languages.map(l => renderSkillCircle(l)).join("")}
      </div>`
    : "";

  /* -------------------------------------------------- */
  /* EXECUTION TAGS                                     */
  /* -------------------------------------------------- */

  const executionTags = [];

  // ===== WORK SETTING =====
  if (task.workSetting) {

    let settingLabel = f["work-setting-label"] || "Work Setting";

    let settingValue =
      f[`setting-${task.workSetting.toLowerCase()}`] || task.workSetting;

    if (task.location?.reference)
      settingValue += ` · ${task.location.reference}`;

    if (task.location?.maxDistanceKm && task.location.reference)
      settingValue += ` (≤ ${task.location.maxDistanceKm} km)`;

    executionTags.push(
      iconTag(
        "ri-map-pin-2-line",
        `${settingLabel}: ${settingValue}`,
        "exec-tag"
      )
    );
  }

  // ===== WORK DYNAMICS =====
  if (task.workDynamics) {

    const dynamicsLabel = f["work-dynamics-label"] || "Work Dynamics";

    const dynamicsValue =
      f[`dynamics-${task.workDynamics.toLowerCase()}`] || task.workDynamics;

    executionTags.push(
      iconTag(
        "ri-group-line",
        `${dynamicsLabel}: ${dynamicsValue}`,
        "exec-tag"
      )
    );
  }

  // ===== SUBMISSION TYPE =====
  if (task.submissionType) {

    const proofLabel = f["proof-label"] || "Proof";

    const proofValue =
      f[`proof-${task.submissionType.toLowerCase()}`] || task.submissionType;

    executionTags.push(
      iconTag(
        "ri-thumb-up-line",
        `${proofLabel}: ${proofValue}`,
        "exec-tag"
      )
    );
  }

  const instructionsHTML = task.instructions
    ? `
      <div class="pv-instructions">
        <i class="ri-information-line"></i>
        ${task.instructions}
      </div>
    `
    : "";

  // ================= EVALUATION =================
  let evaluationHTML = "";

  if (task.evaluation?.method) {

    const { method, criteria = {}, revision = {} } = task.evaluation;

    const rules = joinSafe([
      criteria.deadlineRespected &&
        iconTag("ri-check-line", ` ${f['criteria-deadline'] || 'Deadline respected'}`, "pv-eval-rule"),

      criteria.requirementsFulfilled &&
        iconTag("ri-check-line", ` ${f['criteria-requirements'] || 'Requirements fulfilled'}`, "pv-eval-rule"),

      criteria.qualityScore && criteria.minScore &&
        iconTag("ri-star-line", ` ${f['criteria-min-score'] || 'Min Score'}: ${criteria.minScore}%`, "pv-eval-rule"),

      criteria.clientApproval &&
        iconTag("ri-user-voice-line", ` ${f['criteria-client'] || 'Client approval'}`, "pv-eval-rule"),

      revision.allowed &&
        iconTag("ri-refresh-line",
          ` ${f['revision-label'] || 'Revisions'}: ${revision.maxAttempts || 1}`,
          "pv-eval-rule")
    ]);

    evaluationHTML = `
      <div class="pv-evaluation">
        <div class="pv-eval-tags">
          <span class="pv-eval-tag">
            ${f['validation-logic-label'] || 'Validation Logic'}: ${f[`validation-${method}`.toLowerCase()] || method}
          </span>
        </div>
        <div class="pv-eval-rules">
          ${rules}
        </div>
      </div>
    `;
  }

  // ================= TIME =================
  const schedule = task.schedule || {};

  let periodHTML = "";
  if (schedule.startDate || schedule.endDate) {
    if (schedule.startDate && schedule.endDate)
      periodHTML = span(
        `${formatDate(schedule.startDate, t)} → ${formatDate(schedule.endDate, t)}`,
        "period"
      );
    else if (schedule.startDate)
      periodHTML = span(`${f['from'] || 'From'} ${formatDate(schedule.startDate, t)}`, "period");
    else
      periodHTML = span(`${f['until'] || 'Until'} ${formatDate(schedule.endDate, t)}`, "period");
  }

  const durationHTML = (schedule.estimatedDuration || schedule.timeFlexibility)
    ? span(
        `${f['estimated-duration-label'] || 'Duration'}: ${
          [
            schedule.estimatedDuration && `${schedule.estimatedDuration}${t.hoursShort}`,
            f[`time-${schedule.timeFlexibility?.toLowerCase()}`] || schedule.timeFlexibility
          ].filter(Boolean).join(" · ")
        }`,
        "duration"
      )
    : "";

  const deadlineHTML = schedule.deadline
    ? span(`${f['hard-deadline-label'] || 'Deadline'}: ${formatDate(schedule.deadline, t)}`, "deadline")
    : "";

  // ================= COMPENSATION =================
  const {
    price = {},
    paymentModel,
    escrow = {},
    additionalCosts = {},
    guarantees = {}
  } = task;

  const costCoverages = [
    additionalCosts.materials && (f['cost-materials'] || "Materials & Supplies"),
    additionalCosts.transport && (f['cost-transport'] || "Transport & Travel"),
    additionalCosts.tools && (f['cost-tools'] || "Tools & Equipment"),
    additionalCosts.accommodation && (f['cost-accommodation'] || "Accommodation"),
    additionalCosts.fees && (f['cost-fees'] || "Administrative / Legal Fees")
  ].filter(Boolean);

  const guaranteeList = [
    guarantees.latePenalty &&
      `${f['guarantee-late-penalty'] || "Late delivery penalty"} (${guarantees.latePenaltyPercent || 0}%)`,
    guarantees.damageLiability && (f['guarantee-damage'] || "Damage responsibility"),
    guarantees.replacementRequired && (f['guarantee-replacement'] || "Replacement guarantee")
  ].filter(Boolean);

  const compensationHTML = `
    <div class="pv-comp-tags">
      <span class="pv-comp-tag price">
        <i class="ri-exchange-2-line"></i>
        ${price.amount
          ? `${price.amount} ${price.currency || ""}`
          : f.priceNotSet || "Price not set"}
        · ${f[`payment-model-${paymentModel?.toLowerCase()}`] || paymentModel || f.paymentModelNotSelected || "Payment Model Not Selected"}
      </span>

      ${escrow.enabled
        ? iconTag("ri-safe-line", ` ${f.escrow || 'Escrow'}: ${escrow.percent || 0}%`, "pv-comp-tag")
        : ""}

      ${costCoverages.length
        ? iconTag("ri-stack-line",
            ` ${t.covers || 'Covers'}: ${costCoverages.join(", ")}`,
            "pv-comp-tag")
        : ""}

      ${additionalCosts.reimbursementMode
        ? iconTag("ri-repeat-line",
            ` ${f['reimbursement-label'] || 'Reimbursement'}: ${f[`reimbursement-${additionalCosts.reimbursementMode.toLowerCase()}`] || additionalCosts.reimbursementMode}`,
            "pv-comp-tag")
        : ""}

      ${guaranteeList.length
        ? iconTag("ri-shield-check-line",
            ` ${guaranteeList.join(" · ")}`,
            "pv-comp-tag secondary")
        : ""}
    </div>
  `;

  // ================= FINAL RENDER =================
  return `
    <h4>${task.title}</h4>

    <div class="pv-owner">
      <div class="pv-owner-avatar">
        <img src="${ownerAvatar}">
      </div>
      <div class="pv-owner-details">
        <div class="pv-owner-top">
          <span class="pv-owner-name">${ownerName}</span>
          ${ownerVerified ? `<span class="pv-owner-badge">Verified</span>` : ""}
        </div>
        <div class="pv-owner-meta">
          ${ownerRole || ""}
          ${ownerIndustry ? ` · ${ownerIndustry}` : ""}
        </div>
      </div>
    </div>

    <span class="pv-type">${typeLabel}</span>

    <p class="pv-goal">${task.description || ""}</p>

    <div class="pv-tags">
      ${execEntityHTML}
      ${taskScaleHTML}
    </div>

    ${skillsHTML}
    ${languagesHTML}

    <div class="pv-execution">
      ${executionTags.join("")}
      ${instructionsHTML}
    </div>

    ${evaluationHTML}

    <div class="pv-time">
      ${periodHTML}
      ${durationHTML}
      ${deadlineHTML}
    </div>

    ${compensationHTML}
  `;
}

function buildJobCard(task, ownerData) {

  const lang = getCurrentLang();
  const f = jobForm_translations[lang] || jobForm_translations['en'];
  const t = cvbJobInfoTranslations[lang] || cvbJobInfoTranslations['en'];
  const tIndustry = Industry_Speciality_translations[lang] || Industry_Speciality_translations["en"];

  const salary = task.salary || {};

  const salaryLabel = salary.negotiable
    ? (f.negotiable || "Negotiable")
    : `${salary.min || 0} - ${salary.max || 0} ${salary.currency || ""}`;

  const benefits = task.benefits || {};
  const benefitsList = [
    benefits.health && (f["benefit-health"] || "Health coverage"),
    benefits.transport && (f["benefit-transport"] || "Transport support"),
    benefits.remote && (f["benefit-remote"] || "Remote flexibility"),
    benefits.bonus && (f["benefit-bonus"] || "Bonuses"),
    benefits.equipment && (f["benefit-equipment"] || "Equipment provided")
  ].filter(Boolean);

  const industryLabel = task.industry
    ? tIndustry[`industry-${task.industry.toLowerCase()}`] || task.industry
    : "";

  const specialityLabel = task.speciality
    ? tIndustry[`speciality-${task.speciality}`] || task.speciality
    : "";

  const categoryLabel = specialityLabel
    ? `${industryLabel} • ${specialityLabel}`
    : industryLabel;
  
  const skillsHTML = task.skills?.length
  ? `<div style="display: block;">
      ${task.skills.map(s => renderSkillCircle(s)).join("")}
    </div>`
  : "";

  const languagesHTML = task.languages?.length
    ? `<div style="display: block;">
        ${task.languages.map(l => renderSkillCircle(l)).join("")}
      </div>`
    : "";

  let evaluationHTML = "";

  if (task.evaluation?.method) {

    const { method, criteria = {} } = task.evaluation;

    const rules = [
      criteria.commitment &&
        `<span class="pv-eval-rule">
          <i class="ri-check-line"></i>
          ${f["criteria-commitment"] || "Commitment & reliability"}
        </span>`,

      criteria.objectives &&
        `<span class="pv-eval-rule">
          <i class="ri-check-line"></i>
          ${f["criteria-objectives"] || "Objectives achieved"}
        </span>`,

      criteria.performance &&
        `<span class="pv-eval-rule">
          <i class="ri-star-line"></i>
          ${f["criteria-performance"] || "Performance level"}
          ${criteria.minScore ? ` (${criteria.minScore}%)` : ""}
        </span>`,

      criteria.team &&
        `<span class="pv-eval-rule">
          <i class="ri-team-line"></i>
          ${f["criteria-team"] || "Team collaboration"}
        </span>`
    ].filter(Boolean).join("");

    evaluationHTML = `
      <div class="pv-evaluation">
        <div class="pv-eval-tags">
          <span class="pv-eval-tag">
            ${f["evaluation-method"] || "Evaluation"}:
            ${f[method?.toLowerCase()] || method}
          </span>
        </div>

        <div class="pv-eval-rules">
          ${rules}
        </div>
      </div>
    `;
  }

  const schedule = task.schedule || {};

  let periodHTML = "";

  if (schedule.startDate || schedule.endDate) {
    if (schedule.startDate && schedule.endDate) {
      periodHTML = `
        <span class="period duration">
          <i class="ri-calendar-line"></i>
          ${formatDate(schedule.startDate, t)} → ${formatDate(schedule.endDate, t)}
        </span>
      `;
    } else if (schedule.startDate) {
      periodHTML = `
        <span class="period duration">
          <i class="ri-calendar-line"></i>
          ${t["from"] || "From"} ${formatDate(schedule.startDate, t)}
        </span>
      `;
    } else {
      periodHTML = `
        <span class="period duration">
          <i class="ri-calendar-line"></i>
          ${t} ${formatDate(schedule.endDate, t)}
        </span>
      `;
    }
  }

  const deadlineHTML = schedule.applicationDeadline
    ? `
      <span class="deadline">
        <i class="ri-alarm-line"></i>
        ${t["deadline"] || "Deadline"}: ${formatDate(schedule.applicationDeadline, t)}
      </span>
    `
    : "";

  const positionsHTML = `
    <span class="period">
      <i class="ri-group-line"></i>
      ${task.positions || 1} ${f["positions"] || "positions"}
    </span>
  `;

  return `
    <h4>${task.title}</h4>

    <div class="pv-owner">
      <div class="pv-owner-avatar">
        <img src="${ownerData.ownerAvatar}">
      </div>

      <div class="pv-owner-details">
        <div class="pv-owner-top">
          <span class="pv-owner-name">${ownerData.ownerName}</span>
          ${ownerData.ownerVerified ? `<span class="pv-owner-badge">${t.verified || "Verified"}</span>` : ""}
        </div>
        <div class="pv-owner-meta">
          ${ownerData.ownerRole || ""}
          ${ownerData.ownerIndustry ? ` · ${ownerData.ownerIndustry}` : ""}
        </div>
      </div>
    </div>

    <span class="pv-type">
      ${t.job || "Job"} ${t.in || "in"} ${categoryLabel}
    </span>

    <p class="pv-goal">${task.description || ""}</p>

    ${skillsHTML}
    ${languagesHTML}

    <div class="pv-execution">
      <span class="exec-tag">
        <i class="ri-user-line"></i>
        ${f["seniority"] || "Seniority"}: 
        ${f[task.seniority?.toLowerCase()] || task.seniority}
      </span>

      <span class="exec-tag">
        <i class="ri-briefcase-line"></i>
        ${f["employment-type"] || "Employment Type"}: 
        ${f[`employment-${task.employmentType?.toLowerCase()}`] || task.employmentType}
      </span>

      <span class="exec-tag">
        <i class="ri-map-pin-line"></i>
        ${f["work-setting"] || "Work Setting"}: 
        ${f[task.workSetting?.toLowerCase()] || task.workSetting}
      </span>
    </div>

    ${evaluationHTML}

    <div class="pv-time">
      ${positionsHTML}
      ${periodHTML}
      ${deadlineHTML}
    </div>

    <div class="pv-comp-tags">
      <span class="pv-comp-tag price">
        <i class="ri-exchange-2-line"></i>
        ${f["salary"] || "Salary"}: ${salaryLabel}
      </span>
      ${benefitsList.length ? `
        <span class="pv-comp-tag">
          <i class="ri-stack-line"></i>
          ${f["benefits"] || "Benefits"}: ${benefitsList.join(", ")}
        </span>
      ` : ""}
    </div>
  `;
}

function renderSkillCircle(skill) {
  const maxScore = 5;
  const filledCircles = skill.score || 0;
  let circlesHTML = "";
  for (let i = 1; i <= maxScore; i++) {
    circlesHTML += `<span class="pv-circle${i <= filledCircles ? " filled" : ""}"></span>`;
  }
  return `
    <div class="pv-skillLine">
      <span class="pv-skillName">${skill.name}</span>
      <span class="pv-scoreCircles">${circlesHTML}</span>
    </div>
  `;
}

// ================================= EXECUTION CHAT =================================

let chatUnsubscribe = null;
let lastVisibleDoc = null;
let isLoadingMore = false;
let hasMoreMessages = true;
let loadedMessageIds = new Set();
let lastMessageDate = null;

function openGroupChat(opportunityId) {
  openChat(opportunityId, "group");
}

async function openChat(opportunityId, chatId = "private") {

  const selectedLang = getCurrentLang();
  const t = cvbChatTranslations[selectedLang] || cvbChatTranslations['en'];

  lastMessageDate = null;
  lastVisibleDoc = null;
  loadedMessageIds.clear();
  hasMoreMessages = true;

  const existing = document.querySelector(".tm-chatBox");
  if (existing) existing.remove();

  const container = document.querySelector("#texec-taskDetails .tm-chatContainer");
  if (!container) return;

  const chatBox = document.createElement("div");
  chatBox.className = "tm-chatBox";

  // ===== GET OWNER INFO =====
  let ownerName = "Owner";
  let ownerAvatar = "/images/default_avatar.png";

  try {
    const taskSnap = await getDoc(doc(db, "opportunities", opportunityId));
    if (taskSnap.exists()) {
      const task = taskSnap.data();
      if (task.ownerId) {
        const profileSnap = await getDoc(doc(db, "profiles", task.ownerId));
        if (profileSnap.exists()) {
          const profile = profileSnap.data();
          const firstName = profile.first_name || "";
          const lastName = profile.last_name || "";
          const fullName = `${firstName} ${lastName}`.trim();
          ownerName = fullName || "Owner";
          ownerAvatar = profile.avatar || ownerAvatar;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }

  const isGroup = chatId === "group";

  chatBox.innerHTML = `
    <!-- ===== HEADER ===== -->
    <div class="tm-chatHeader">

      <div class="tm-chatHeader-left">

        ${
          isGroup
            ? `<div class="tm-chatHeader-flag">
                <i class="ri-megaphone-line"></i>
              </div>`
            : `<img class="tm-chatHeader-avatar" src="${ownerAvatar}">`
        }

        <div class="tm-chatHeader-info">
          <div class="tm-chatHeader-name">
            ${isGroup ? t.announcements : ownerName}
          </div>
          <div class="tm-chatHeader-status"></div>
        </div>
      </div>

      <div class="tm-chatHeader-actions">
        <div class="tm-chatTabs">
          <span class="tm-chatTab ${!isGroup ? "active" : ""}" data-chat="private">
            <i class="ri-user-line"></i> ${t.private}
          </span>
          <span class="tm-chatTab ${isGroup ? "active" : ""}" data-chat="group">
            <i class="ri-megaphone-line"></i> ${t.announcements}
          </span>
        </div>
      </div>
    </div>

    <!-- ===== MESSAGES ===== -->
    <div class="tm-chatMessages">
      <div class="tm-loadMoreWrapper">
        <button class="tm-loadMoreBtn">Load more</button>
      </div>

      <div class="tm-chatEmpty">
        <i class="ri-chat-3-line"></i>
        ${t.emptyTitle}<br>
        ${t.emptySubtitle}
      </div>
    </div>

    <!-- ===== INPUT ===== -->
    <div class="tm-chatInput">
      <input type="text" placeholder="${t.typeMessage}">
      <button>${t.send}</button>
    </div>
  `;

  container.appendChild(chatBox);

  const tabs = chatBox.querySelectorAll(".tm-chatTab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const selected = tab.dataset.chat;

      if (selected === "group") {
        openChat(opportunityId, "group");
      } else {
        openChat(opportunityId, "private");
      }
    });
  });

  const statusEl = chatBox.querySelector(".tm-chatHeader-status");

  const realChatId = chatId === "private"
    ? `private_${auth.currentUser.uid}`
    : "group";

  const chatDocRef = doc(db, "opportunities", opportunityId, "chats", realChatId);

  onSnapshot(chatDocRef, (snap) => {

    let status = "Awaiting";

    if (snap.exists()) {
      status = snap.data().status || "Awaiting";
    }

    const statusMap = {
      Awaiting: t.statusAwaiting,
      Open: t.statusOpen,
      Muted: t.statusMuted,
      Stopped: t.statusStopped
    };

    statusEl.textContent = statusMap[status] || status;

    statusEl.classList.remove("muted", "stopped", "awaiting");

    if (status === "Muted") {
      statusEl.classList.add("muted");
    }

    if (status === "Stopped") {
      statusEl.classList.add("stopped");
    }

    if (status === "Awaiting") {
      statusEl.classList.add("awaiting");
    }

    const input = chatBox.querySelector(".tm-chatInput input");
    const sendBtn = chatBox.querySelector(".tm-chatInput button");

    if (status === "Stopped" || status === "Awaiting") {
      input.disabled = true;
      sendBtn.disabled = true;

      input.placeholder =
        status === "Awaiting"
          ? t.awaitingPlaceholder
          : t.stoppedPlaceholder;
    } else {
      input.disabled = false;
      sendBtn.disabled = false;
      input.placeholder = t.typeMessage;
    }
  });

  const messagesContainer = chatBox.querySelector(".tm-chatMessages");
  const loadMoreBtn = chatBox.querySelector(".tm-loadMoreBtn");

  const messagesCol = collection(
    db,
    "opportunities",
    opportunityId,
    "chats",
    realChatId,
    "messages"
  );

  // ===== INITIAL LOAD =====
  await loadMessages(messagesCol, messagesContainer, t);
  scrollChatToBottom();

  // ===== LOAD MORE =====
  loadMoreBtn.addEventListener("click", async () => {
    if (!hasMoreMessages || isLoadingMore) return;

    isLoadingMore = true;
    loadMoreBtn.innerText = "Loading...";

    await loadMessages(messagesCol, messagesContainer, t, true);

    isLoadingMore = false;
    loadMoreBtn.innerText = "Load more";

    if (!hasMoreMessages) loadMoreBtn.style.display = "none";
  });

  // ===== REALTIME NEW MESSAGES =====
  if (chatUnsubscribe) chatUnsubscribe();

  const realtimeQuery = query(
    messagesCol,
    orderBy("createdAt", "desc"),
    limit(1)
  );

  chatUnsubscribe = onSnapshot(realtimeQuery, async snap => {
    snap.docChanges().forEach(async change => {
      if (change.type === "added") {

        const empty = messagesContainer.querySelector(".tm-chatEmpty");
        if (empty) empty.remove();

        const docSnap = change.doc;
        if (loadedMessageIds.has(docSnap.id)) return;

        const msg = docSnap.data();
        await appendMessage(messagesContainer, msg, t);

        loadedMessageIds.add(docSnap.id);
        scrollChatToBottom();
      }
    });
  });

  /* ===== SEND MESSAGE ===== */
  const sendBtn = chatBox.querySelector(".tm-chatInput button");
  const input = chatBox.querySelector(".tm-chatInput input");

  sendBtn.addEventListener("click", async () => {
    const currentStatus = statusEl.textContent;
    if (currentStatus === "Stopped" || currentStatus === "Awaiting") return;
    const text = input.value.trim();
    if (!text) return;
    await addDoc(messagesCol, {
      text,
      senderId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    });
    input.value = "";
    scrollChatToBottom();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendBtn.click();
    }
  });
}

async function loadMessages(messagesCol, container, t, prepend = false) {

  let q;
  if (lastVisibleDoc) {
    q = query(
      messagesCol,
      orderBy("createdAt", "desc"),
      startAfter(lastVisibleDoc),
      limit(15)
    );
  } else {
    q = query(
      messagesCol,
      orderBy("createdAt", "desc"),
      limit(15)
    );
  }

  const snap = await getDocs(q);

  if (snap.empty) {
    hasMoreMessages = false;

    const hasMessages = container.querySelector(".tm-messageRow");
    const loadMoreWrapper = container.querySelector(".tm-loadMoreWrapper");
    if (!hasMessages && loadMoreWrapper) loadMoreWrapper.style.display = "none";

    const emptyState = container.querySelector(".tm-chatEmpty");
    if (!hasMessages && !emptyState) {
      const empty = document.createElement("div");
      empty.className = "tm-chatEmpty";
      empty.innerHTML = `
        <i class="ri-chat-3-line"></i>
        ${t.emptyTitle}<br>
        ${t.emptySubtitle}
      `;
      container.appendChild(empty);
    }
    return;
  }

  lastVisibleDoc = snap.docs[snap.docs.length - 1];

  const messages = [];
  snap.forEach(doc => {
    if (!loadedMessageIds.has(doc.id)) {
      messages.push({ id: doc.id, ...doc.data() });
      loadedMessageIds.add(doc.id);
    }
  });

  messages.reverse();

  const fragment = document.createDocumentFragment();

  for (const msg of messages) {
    await appendMessage(fragment, msg, t);
  }

  const emptyState = container.querySelector(".tm-chatEmpty");
  if (messages.length > 0 && emptyState) {
    emptyState.remove();

    const loadMoreWrapper = container.querySelector(".tm-loadMoreWrapper");
    if (loadMoreWrapper) loadMoreWrapper.style.display = "block";
  }

  if (prepend) {
    const firstExistingSeparator = container.querySelector(".tm-dateSeparator");
    const newSeparators = fragment.querySelectorAll(".tm-dateSeparator");
    const lastNewSeparator = newSeparators[newSeparators.length - 1];

    if (firstExistingSeparator && lastNewSeparator &&
        firstExistingSeparator.textContent === lastNewSeparator.textContent) {
      firstExistingSeparator.remove();
    }

    const loadMoreWrapper = container.querySelector(".tm-loadMoreWrapper");
    if (loadMoreWrapper) container.insertBefore(fragment, loadMoreWrapper.nextSibling);
    else container.prepend(fragment);

  } else {
    container.appendChild(fragment);
  }
}

async function appendMessage(container, msg, t) {
  const currentUser = auth.currentUser;
  const isMe = msg.senderId === currentUser.uid;

  const profileSnap = await getDoc(doc(db, "profiles", msg.senderId));
  const profile = profileSnap.exists() ? profileSnap.data() : {};
  const firstName = profile.first_name || "";
  const lastName = profile.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const name = fullName || "User";
  const avatar = profile.avatar || "/images/default_avatar.png";

  const dateObj = msg.createdAt?.toDate?.() || new Date();
  const messageDay = formatChatDate(dateObj, t);

  const lastSeparator = [...container.querySelectorAll(".tm-dateSeparator")].pop();
  const lastLabel = lastSeparator ? lastSeparator.textContent : null;

  if (lastLabel !== messageDay) {
    const separator = document.createElement("div");
    separator.className = "tm-dateSeparator";
    separator.textContent = messageDay;
    container.appendChild(separator);
  }

  const row = document.createElement("div");
  row.className = "tm-messageRow" + (isMe ? " me" : "");

  row.innerHTML = `
    <img class="tm-avatar" src="${avatar}">
    <div>
      <div class="tm-meta">${isMe ? t.you : name}</div>
      <div class="tm-bubble">
        ${msg.text}
        <div class="tm-time">
          ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  `;

  container.appendChild(row);
}

function scrollChatToBottom() {
  const messagesContainer = document.querySelector(".tm-chatMessages");
  if (!messagesContainer) return;
  requestAnimationFrame(() => {
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth"
    });
  });
}

function formatChatDate(date, t) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return t.today;
  if (date.toDateString() === yesterday.toDateString()) return t.yesterday;

  const day = date.getDate();
  const month = t.months?.[date.getMonth()] || "";
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

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
      updateInterfaceSubtitle(user);
      loadExecutorTasks(user);  
      loadExecutorKPIs(user);
      switchView("list");
    } else {
      updateUserSection(null);
      updateInterfaceSubtitle(null);
      loadExecutorTasks(null);  
      loadExecutorKPIs(null);
    }
  });
  translateTopBar();
  translateHelpModal(lang);
  translateTexecInterface();
  if (applyFiltersGlobal) {
    applyFiltersGlobal();
  }
  if (currentOpenedTaskId) {
    displayTaskCard(currentOpenedTaskId);
  }
  translateEmptyAppliesState(lang);
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

const cvbTexecUITranslations = {
  en: {
    interfaceTitle: "Execution Center",
    interfaceSubtitleGuest: "Control, track and optimize your task performance.",
    interfaceSubtitleUserWelcome: "Welcome back, ",
    interfaceSubtitleUser: "Track your tasks and stay productive.",

    yourActivity: "Your Activity",
    completed: "completed",
    active: "active",

    advancedFilter: "Filters",
    searchPlaceholder: "Search by title...",
    periodAll: "All time",
    period7: "Last 7 days",
    period30: "Last month",
    period90: "Last 3 months",
    period365: "Last year",
    periodCustom: "Custom range",

    viewList: "List",
    viewBoard: "Board",
    viewGantt: "Gantt",

    texecCtaTitle: "You're just getting started",
    texecCtaText: "Apply to more tasks to unlock more opportunities and increase your chances of getting selected.",
    texecCtaButton: "Explore more opportunities",
  },

  fr: {
    interfaceTitle: "Centre d'exécution",
    interfaceSubtitleGuest: "Contrôlez, suivez et optimisez vos performances.",
    interfaceSubtitleUserWelcome: "Bon retour, ",
    interfaceSubtitleUser: "Suivez vos tâches et restez productif.",

    yourActivity: "Votre activité",
    completed: "terminées",
    active: "actives",

    advancedFilter: "Filtres",
    searchPlaceholder: "Rechercher par titre...",
    periodAll: "Toute période",
    period7: "7 derniers jours",
    period30: "Dernier mois",
    period90: "3 derniers mois",
    period365: "Dernière année",
    periodCustom: "Période personnalisée",

    viewList: "Liste",
    viewBoard: "Tableau",
    viewGantt: "Gantt",

    texecCtaTitle: "Vous ne faites que commencer",
    texecCtaText: "Postulez à plus de tâches pour débloquer plus d'opportunités et augmenter vos chances d'être sélectionné.",
    texecCtaButton: "Explorer plus d'opportunités",
  },

  ar: {
    interfaceTitle: "مركز التنفيذ",
    interfaceSubtitleGuest: "تحكم وتتبع وحسّن أداء مهامك.",
    interfaceSubtitleUserWelcome: "مرحباً بعودتك، ",
    interfaceSubtitleUser: "تابع مهامك وابقَ منتجاً",

    yourActivity: "نشاطك",
    completed: "مكتملة",
    active: "نشطة",

    advancedFilter: "الفلاتر",
    searchPlaceholder: "ابحث حسب العنوان...",
    periodAll: "كل الفترة",
    period7: "آخر 7 أيام",
    period30: "آخر شهر",
    period90: "آخر 3 أشهر",
    period365: "آخر سنة",
    periodCustom: "نطاق مخصص",

    viewList: "قائمة",
    viewBoard: "لوحة",
    viewGantt: "مخطط زمني",

    texecCtaTitle: "لقد بدأت للتو",
    texecCtaText: "تقدم لمزيد من المهام لفتح المزيد من الفرص وزيادة فرصك في الاختيار.",
    texecCtaButton: "استكشف المزيد من الفرص",
  },

  es: {
    interfaceTitle: "Centro de ejecución",
    interfaceSubtitleGuest: "Controla, sigue y optimiza el rendimiento de tus tareas.",
    interfaceSubtitleUserWelcome: "Bienvenido de nuevo, ",
    interfaceSubtitleUser: "Sigue tus tareas y mantente productivo.",

    yourActivity: "Tu actividad",
    completed: "completadas",
    active: "activas",

    searchPlaceholder: "Buscar por título...",
    periodAll: "Todo el tiempo",
    period7: "Últimos 7 días",
    period30: "Último mes",
    period90: "Últimos 3 meses",
    period365: "Último año",
    periodCustom: "Rango personalizado",

    viewList: "Lista",
    viewBoard: "Tablero",
    viewGantt: "Gantt",

    texecCtaTitle: "Estás empezando",
    texecCtaText: "Aplica a más tareas para desbloquear más oportunidades y aumentar tus posibilidades de ser seleccionado.",
    texecCtaButton: "Explorar más oportunidades",
  },

  de: {
    interfaceTitle: "Ausführungszentrum",
    interfaceSubtitleGuest: "Verwalte, verfolge und optimiere deine Aufgabenleistung.",
    interfaceSubtitleUserWelcome: "Willkommen zurück, ",
    interfaceSubtitleUser: "Verfolge deine Aufgaben und bleibe produktiv.",

    yourActivity: "Deine Aktivität",
    completed: "abgeschlossen",
    active: "aktiv",

    searchPlaceholder: "Nach Titel suchen...",
    periodAll: "Gesamte Zeit",
    period7: "Letzte 7 Tage",
    period30: "Letzter Monat",
    period90: "Letzte 3 Monate",
    period365: "Letztes Jahr",
    periodCustom: "Benutzerdefiniert",

    viewList: "Liste",
    viewBoard: "Board",
    viewGantt: "Gantt",

    texecCtaTitle: "Du fängst gerade erst an",
    texecCtaText: "Bewirb dich auf mehr Aufgaben, um weitere Chancen zu erhalten und deine Auswahlchancen zu erhöhen.",
    texecCtaButton: "Weitere Möglichkeiten entdecken",
  },

  pt: {
    interfaceTitle: "Centro de execução",
    interfaceSubtitleGuest: "Controle, acompanhe e otimize o desempenho das suas tarefas.",
    interfaceSubtitleUserWelcome: "Bem-vindo de volta, ",
    interfaceSubtitleUser: "Acompanhe suas tarefas e mantenha-se produtivo.",

    yourActivity: "Sua atividade",
    completed: "concluídas",
    active: "ativas",

    searchPlaceholder: "Pesquisar por título...",
    periodAll: "Todo o período",
    period7: "Últimos 7 dias",
    period30: "Último mês",
    period90: "Últimos 3 meses",
    period365: "Último ano",
    periodCustom: "Intervalo personalizado",

    viewList: "Lista",
    viewBoard: "Quadro",
    viewGantt: "Gantt",

    texecCtaTitle: "Você está apenas começando",
    texecCtaText: "Candidate-se a mais tarefas para desbloquear mais oportunidades e aumentar suas chances de ser selecionado.",
    texecCtaButton: "Explorar mais oportunidades",
  },

  zh: {
    interfaceTitle: "执行中心",
    interfaceSubtitleGuest: "管理、跟踪并优化你的任务表现。",
    interfaceSubtitleUserWelcome: "欢迎回来，",
    interfaceSubtitleUser: "跟踪你的任务并保持高效。",

    yourActivity: "你的活动",
    completed: "已完成",
    active: "进行中",

    searchPlaceholder: "按标题搜索...",
    periodAll: "全部时间",
    period7: "最近7天",
    period30: "最近一个月",
    period90: "最近3个月",
    period365: "最近一年",
    periodCustom: "自定义范围",

    viewList: "列表",
    viewBoard: "看板",
    viewGantt: "甘特图",

    texecCtaTitle: "你才刚刚开始",
    texecCtaText: "申请更多任务以解锁更多机会并提高被选中的几率。",
    texecCtaButton: "探索更多机会",
  },

  ja: {
    interfaceTitle: "実行センター",
    interfaceSubtitleGuest: "タスクの進捗を管理・追跡し、最適化します。",
    interfaceSubtitleUserWelcome: "おかえりなさい、",
    interfaceSubtitleUser: "タスクを管理して生産性を維持しましょう。",

    yourActivity: "あなたの活動",
    completed: "完了",
    active: "進行中",

    searchPlaceholder: "タイトルで検索...",
    periodAll: "全期間",
    period7: "過去7日間",
    period30: "過去1ヶ月",
    period90: "過去3ヶ月",
    period365: "過去1年",
    periodCustom: "カスタム範囲",

    viewList: "リスト",
    viewBoard: "ボード",
    viewGantt: "ガント",

    texecCtaTitle: "始めたばかりです",
    texecCtaText: "より多くのタスクに応募して、さらなる機会を解放し、選ばれる可能性を高めましょう。",
    texecCtaButton: "さらに多くの機会を探す",
  },

  ru: {
    interfaceTitle: "Центр выполнения",
    interfaceSubtitleGuest: "Контролируйте, отслеживайте и оптимизируйте выполнение задач.",
    interfaceSubtitleUserWelcome: "С возвращением, ",
    interfaceSubtitleUser: "отслеживайте задачи и оставайтесь продуктивными.",

    yourActivity: "Ваша активность",
    completed: "завершено",
    active: "активно",

    searchPlaceholder: "Поиск по названию...",
    periodAll: "За всё время",
    period7: "Последние 7 дней",
    period30: "Последний месяц",
    period90: "Последние 3 месяца",
    period365: "Последний год",
    periodCustom: "Произвольный период",

    viewList: "Список",
    viewBoard: "Доска",
    viewGantt: "Гантт",

    texecCtaTitle: "Вы только начинаете",
    texecCtaText: "Подайте заявку на большее количество задач, чтобы открыть больше возможностей и повысить свои шансы на отбор.",
    texecCtaButton: "Изучить больше возможностей",
  }
};
function translateTexecInterface() {

  const languageSelect = document.querySelector('#languageSelectorSidebar');
  const selectedLang =
    languageSelect?.getAttribute('data-selected') ||
    sessionStorage.getItem('mynextcv-language') ||
    'en';

  const t = cvbTexecUITranslations[selectedLang] || cvbTexecUITranslations['en'];

  /* ===== HEADER ===== */
  const title = document.getElementById("interfaceTitle");
  if (title) title.textContent = t.interfaceTitle;

  /* ===== KPI PIPELINE ===== */
  const kpiTitle = document.querySelector(".texec-kpiTitle");
  if (kpiTitle) kpiTitle.textContent = t.yourActivity;

  const completedLabel = document.getElementById("kpiCompletedLabel");
  const progressingLabel = document.getElementById("kpiProgressingLabel");

  if (completedLabel) completedLabel.textContent =
    completedLabel.dataset.count
      ? `${completedLabel.dataset.count} ${t.completed}`
      : `0 ${t.completed}`;

  if (progressingLabel) progressingLabel.textContent =
    progressingLabel.dataset.count
      ? `${progressingLabel.dataset.count} ${t.active}`
      : `0 ${t.active}`;

  /* ===== SEARCH INPUT ===== */
  const filterBtn = document.querySelector("#texec-advancedToggle .texec-filterText");
  if (filterBtn) {
    filterBtn.textContent = t.advancedFilter;
  }
  const searchInput = document.getElementById("texec-searchInput");
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;

  /* ===== PERIOD FILTER ===== */
  const periodFilter = document.getElementById("texec-periodFilter");
  if (periodFilter) {
    periodFilter.options[0].text = t.periodAll;
    periodFilter.options[1].text = t.period7;
    periodFilter.options[2].text = t.period30;
    periodFilter.options[3].text = t.period90;
    periodFilter.options[4].text = t.period365;
    periodFilter.options[5].text = t.periodCustom;
  }

  /* ===== VIEW SWITCHER (optional text if needed) ===== */
  const viewButtons = document.querySelectorAll(".texec-viewBtn");

  if (viewButtons[0]) viewButtons[0].title = t.viewList;
  if (viewButtons[1]) viewButtons[1].title = t.viewBoard;
  if (viewButtons[2]) viewButtons[2].title = t.viewGantt;

  /* ===== STATUS FILTERS ===== */
  const statusContainer = document.getElementById("texec-statusFilters");

  if (statusContainer) {

    const statusT =
      cvbTaskStatusTranslations[selectedLang] ||
      cvbTaskStatusTranslations['en'];

    const items = statusContainer.querySelectorAll(".texec-checkbox");

    items.forEach(item => {
      const input = item.querySelector("input");
      const label = item.querySelector(".texec-statusLabel");

      if (!input || !label) return;

      const statusKey = input.value; // pending, accepted, etc.

      label.textContent =
        statusT[statusKey] || statusKey;
    });
  }
}

const cvbEmptyStateTranslations = {
  en: {
    noAppliesTitle: "No applies yet",
    noAppliesText: "You’re missing opportunities.<br>Start applying and build your execution pipeline.",
    noAppliesBtn: "Explore Opportunities"
  },

  fr: {
    noAppliesTitle: "Aucune candidature",
    noAppliesText: "Vous manquez des opportunités.<br>Commencez à postuler et développez votre pipeline d’exécution.",
    noAppliesBtn: "Explorer les opportunités"
  },

  es: {
    noAppliesTitle: "Sin solicitudes",
    noAppliesText: "Estás perdiendo oportunidades.<br>Empieza a postular y construye tu flujo de ejecución.",
    noAppliesBtn: "Explorar oportunidades"
  },

  de: {
    noAppliesTitle: "Keine Bewerbungen",
    noAppliesText: "Dir entgehen Chancen.<br>Beginne dich zu bewerben und baue deine Pipeline auf.",
    noAppliesBtn: "Chancen entdecken"
  },

  ar: {
    noAppliesTitle: "لا توجد طلبات بعد",
    noAppliesText: "أنت تفوّت فرصًا.<br>ابدأ التقديم وابنِ مسار التنفيذ الخاص بك.",
    noAppliesBtn: "استكشاف الفرص"
  },

  pt: {
    noAppliesTitle: "Ainda sem candidaturas",
    noAppliesText: "Você está perdendo oportunidades.<br>Comece a se candidatar e construa seu fluxo de execução.",
    noAppliesBtn: "Explorar oportunidades"
  },

  ja: {
    noAppliesTitle: "応募はまだありません",
    noAppliesText: "チャンスを逃しています。<br>応募して実行パイプラインを構築しましょう。",
    noAppliesBtn: "機会を探す"
  },

  zh: {
    noAppliesTitle: "暂无申请",
    noAppliesText: "你正在错过机会。<br>开始申请并构建你的执行流程。",
    noAppliesBtn: "探索机会"
  },

  ru: {
    noAppliesTitle: "Пока нет откликов",
    noAppliesText: "Вы упускаете возможности.<br>Начните откликаться и создайте свой поток задач.",
    noAppliesBtn: "Посмотреть возможности"
  }
};
function translateEmptyAppliesState(lang) {
  const t = cvbEmptyStateTranslations[lang] || cvbEmptyStateTranslations['en'];
  const container = document.querySelector('.texec-emptyState');
  if (!container) return;
  const title = container.querySelector('h3');
  if (title) title.textContent = t.noAppliesTitle;
  const text = container.querySelector('p');
  if (text) text.innerHTML = t.noAppliesText;
  const btn = container.querySelector('.texec-emptyBtn');
  if (btn) {
    btn.innerHTML = `${t.noAppliesBtn} <i class="ri-arrow-right-line"></i>`;
  }
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

const cvbTaskInfoTranslations = {
  en: {
    in: "in",

    executionEntity: "Execution entity",
    taskScale: "Task scale",
    duration: "Duration",
    deadline: "Deadline",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    hoursShort: "hours",
    from: "From",
    until: "Until",
    priceNotSet: "Price not set",
    paymentModelNotSelected: "Payment model not selected",
    covers: "Covers",
    escrow: "Escrow",
    validationPer: "Validation per",
    revisions: "Revisions",
    clientApproval: "Client approval required",
    deadlineRespected: "Deadline respected",
    requirementsFulfilled: "Requirements fulfilled",
    minQuality: "Min quality",

    verified: "Verified",
    taskNotFound: "Task not found",

    statusAccepted: "You made the shortlist",
    statusAssigned: "Mission assigned — start progress",
    statusProgressing: "Work in progress — keep it going",
    statusCompleted: "Mission accomplished",
    statusDeclined: "Not selected this time",
    statusPending: "Application pending",

    declareProgress: "Declare Progress",
    confirmCompleteness: "Confirm Completeness",
    confirmedCompletion: "You've confirmed the completeness",

    closeTask: "Close task",

    // New words for live meta
    views: "views",
    applies: "applies",
    conversion: "conversion",
    posted: "Posted",

    categories: {
      tasks: "Tasks",
      task: "Task",
      jobs: "Jobs",
      job: "Job",
      contribution: "Contribution",
      work: "Opportunity"
    },
    
    // Time intervals for formatTimeAgo
    intervals: {
      year: "year",
      years: "years",
      month: "month",
      months: "months",
      day: "day",
      days: "days",
      hour: "hour",
      hours: "hours",
      minute: "minute",
      minutes: "minutes",
      justNow: "Just now"
    }
  },

  fr: {
    in: "dans",

    executionEntity: "Entité d'exécution",
    taskScale: "Échelle de la tâche",
    duration: "Durée",
    deadline: "Date limite",
    months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    hoursShort: "heures",
    from: "À partir de",
    until: "Jusqu'à",
    priceNotSet: "Prix non défini",
    paymentModelNotSelected: "Modèle de paiement non sélectionné",
    covers: "Couvre",
    escrow: "Séquestre",
    validationPer: "Validation par",
    revisions: "Révisions",
    clientApproval: "Validation client requise",
    deadlineRespected: "Deadline respectée",
    requirementsFulfilled: "Exigences remplies",
    minQuality: "Qualité min",

    verified: "Vérifié",
    taskNotFound: "Tâche introuvable",

    statusAccepted: "Vous êtes présélectionné",
    statusAssigned: "Mission assignée — commencez",
    statusProgressing: "Travail en cours — continuez",
    statusCompleted: "Mission accomplie",
    statusDeclined: "Non retenu cette fois",
    statusPending: "Candidature en attente",

    declareProgress: "Déclarer l’avancement",
    confirmCompleteness: "Confirmer la complétion",
    confirmedCompletion: "Vous avez confirmé la complétion",

    closeTask: "Fermer la tâche",

    views: "vues",
    applies: "candidatures",
    conversion: "conversion",
    posted: "Publié",

    categories: {
      tasks: "Tâches",
      task: "Tâche",
      jobs: "Emplois",
      job: "Emploi",
      contribution: "Contribution",
      work: "Opportunité"
    },

    intervals: {
      year: "an",
      years: "ans",
      month: "mois",
      months: "mois",
      day: "jour",
      days: "jours",
      hour: "heure",
      hours: "heures",
      minute: "minute",
      minutes: "minutes",
      justNow: "À l'instant"
    }
  },

  ar: {
    in: "في",

    executionEntity: "جهة التنفيذ",
    taskScale: "حجم المهمة",
    duration: "المدة",
    deadline: "الموعد النهائي",
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    hoursShort: "ساعات",
    from: "من",
    until: "حتى",
    priceNotSet: "السعر غير محدد",
    paymentModelNotSelected: "نموذج الدفع غير محدد",
    covers: "يشمل",
    escrow: "ضمان مالي",
    validationPer: "التحقق بواسطة",
    revisions: "المراجعات",
    clientApproval: "موافقة العميل مطلوبة",
    deadlineRespected: "تم احترام الموعد",
    requirementsFulfilled: "تم تحقيق المتطلبات",
    minQuality: "الحد الأدنى للجودة",

    verified: "موثّق",
    taskNotFound: "المهمة غير موجودة",

    statusAccepted: "تم اختيارك ضمن القائمة المختصرة",
    statusAssigned: "تم تعيين المهمة — ابدأ التنفيذ",
    statusProgressing: "العمل جارٍ — استمر",
    statusCompleted: "تم إنجاز المهمة",
    statusDeclined: "لم يتم اختيارك هذه المرة",
    statusPending: "الطلب قيد الانتظار",

    declareProgress: "إعلان بدء التنفيذ",
    confirmCompleteness: "تأكيد الإكمال",
    confirmedCompletion: "لقد أكدت اكتمال المهمة",

    closeTask: "إغلاق المهمة",

    views: "مشاهدة",
    applies: "تقديمات",
    conversion: "تحويل",
    posted: "نشر",

    categories: {
      tasks: "المهام",
      task: "مهمة",
      jobs: "وظائف",
      job: "وظيفة",
      contribution: "مساهمة",
      work: "فرصة"
    },

    intervals: {
      year: "سنة",
      years: "سنوات",
      month: "شهر",
      months: "أشهر",
      day: "يوم",
      days: "أيام",
      hour: "ساعة",
      hours: "ساعات",
      minute: "دقيقة",
      minutes: "دقائق",
      justNow: "الآن"
    }
  },

  es: {
    in: "en",

    executionEntity: "Entidad de ejecución",
    taskScale: "Escala de la tarea",
    duration: "Duración",
    deadline: "Fecha límite",
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    hoursShort: "horas",
    from: "Desde",
    until: "Hasta",
    priceNotSet: "Precio no definido",
    paymentModelNotSelected: "Modelo de pago no seleccionado",
    covers: "Cubre",
    escrow: "Depósito en garantía",
    validationPer: "Validación por",
    revisions: "Revisiones",
    clientApproval: "Aprobación del cliente requerida",
    deadlineRespected: "Plazo respetado",
    requirementsFulfilled: "Requisitos cumplidos",
    minQuality: "Calidad mínima",

    verified: "Verificado",
    taskNotFound: "Tarea no encontrada",

    statusAccepted: "Has sido preseleccionado",
    statusAssigned: "Misión asignada — comienza",
    statusProgressing: "Trabajo en progreso — sigue así",
    statusCompleted: "Misión cumplida",
    statusDeclined: "No seleccionado esta vez",
    statusPending: "Solicitud pendiente",

    declareProgress: "Declarar progreso",
    confirmCompleteness: "Confirmar finalización",
    confirmedCompletion: "Has confirmado la finalización",

    closeTask: "Cerrar tarea",

    views: "vistas",
    applies: "aplicaciones",
    conversion: "conversión",
    posted: "Publicado",

    categories: {
      tasks: "Tareas",
      task: "Tarea",
      jobs: "Empleos",
      job: "Empleo",
      contribution: "Contribución",
      work: "Oportunidad"
    },

    intervals: {
      year: "año",
      years: "años",
      month: "mes",
      months: "meses",
      day: "día",
      days: "días",
      hour: "hora",
      hours: "horas",
      minute: "minuto",
      minutes: "minutos",
      justNow: "Ahora mismo"
    }
  },

  de: {
    in: "in",

    executionEntity: "Ausführungseinheit",
    taskScale: "Aufgabenumfang",
    duration: "Dauer",
    deadline: "Frist",
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    hoursShort: "Stunden",
    from: "Von",
    until: "Bis",
    priceNotSet: "Preis nicht festgelegt",
    paymentModelNotSelected: "Zahlungsmodell nicht ausgewählt",
    covers: "Beinhaltet",
    escrow: "Treuhand",
    validationPer: "Validierung durch",
    revisions: "Überarbeitungen",
    clientApproval: "Kundenfreigabe erforderlich",
    deadlineRespected: "Frist eingehalten",
    requirementsFulfilled: "Anforderungen erfüllt",
    minQuality: "Mindestqualität",

    verified: "Verifiziert",
    taskNotFound: "Aufgabe nicht gefunden",

    statusAccepted: "Du bist in der engeren Auswahl",
    statusAssigned: "Auftrag zugewiesen — starte jetzt",
    statusProgressing: "Arbeit läuft — weitermachen",
    statusCompleted: "Auftrag abgeschlossen",
    statusDeclined: "Diesmal nicht ausgewählt",
    statusPending: "Bewerbung ausstehend",

    declareProgress: "Fortschritt melden",
    confirmCompleteness: "Abschluss bestätigen",
    confirmedCompletion: "Du hast den Abschluss bestätigt",

    closeTask: "Aufgabe schließen",

    views: "Aufrufe",
    applies: "Bewerbungen",
    conversion: "Konversion",
    posted: "Veröffentlicht",

    categories: {
      tasks: "Aufgaben",
      task: "Aufgabe",
      jobs: "Jobs",
      job: "Job",
      contribution: "Beitrag",
      work: "Gelegenheit"
    },

    intervals: {
      year: "Jahr",
      years: "Jahren",
      month: "Monat",
      months: "Monaten",
      day: "Tag",
      days: "Tagen",
      hour: "Stunde",
      hours: "Stunden",
      minute: "Minute",
      minutes: "Minuten",
      justNow: "Gerade jetzt"
    }
  },

  pt: {
    in: "em",

    executionEntity: "Entidade de execução",
    taskScale: "Escala da tarefa",
    duration: "Duração",
    deadline: "Prazo",
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    hoursShort: "horas",
    from: "De",
    until: "Até",
    priceNotSet: "Preço não definido",
    paymentModelNotSelected: "Modelo de pagamento não selecionado",
    covers: "Cobre",
    escrow: "Garantia",
    validationPer: "Validação por",
    revisions: "Revisões",
    clientApproval: "Aprovação do cliente necessária",
    deadlineRespected: "Prazo respeitado",
    requirementsFulfilled: "Requisitos cumpridos",
    minQuality: "Qualidade mínima",

    verified: "Verificado",
    taskNotFound: "Tarefa não encontrada",

    statusAccepted: "Você foi pré-selecionado",
    statusAssigned: "Missão atribuída — comece agora",
    statusProgressing: "Trabalho em andamento — continue",
    statusCompleted: "Missão concluída",
    statusDeclined: "Não selecionado desta vez",
    statusPending: "Candidatura pendente",

    declareProgress: "Declarar progresso",
    confirmCompleteness: "Confirmar conclusão",
    confirmedCompletion: "Você confirmou a conclusão",

    closeTask: "Encerrar tarefa",

    views: "visualizações",
    applies: "candidaturas",
    conversion: "conversão",
    posted: "Publicado",

    categories: {
      tasks: "Tarefas",
      task: "Tarefa",
      jobs: "Empregos",
      job: "Emprego",
      contribution: "Contribuição",
      work: "Oportunidade"
    },

    intervals: {
      year: "ano",
      years: "anos",
      month: "mês",
      months: "meses",
      day: "dia",
      days: "dias",
      hour: "hora",
      hours: "horas",
      minute: "minuto",
      minutes: "minutos",
      justNow: "Agora mesmo"
    }
  },

  zh: {
    in: "在",

    executionEntity: "执行主体",
    taskScale: "任务规模",
    duration: "时长",
    deadline: "截止日期",
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    hoursShort: "小时",
    from: "从",
    until: "到",
    priceNotSet: "价格未设置",
    paymentModelNotSelected: "未选择支付模式",
    covers: "包含",
    escrow: "托管",
    validationPer: "验证方式",
    revisions: "修改次数",
    clientApproval: "需要客户确认",
    deadlineRespected: "按时完成",
    requirementsFulfilled: "满足要求",
    minQuality: "最低质量",

    verified: "已验证",
    taskNotFound: "未找到任务",

    statusAccepted: "你已入围",
    statusAssigned: "任务已分配 — 请开始",
    statusProgressing: "进行中 — 请继续",
    statusCompleted: "任务完成",
    statusDeclined: "本次未被选中",
    statusPending: "申请处理中",

    declareProgress: "声明进度",
    confirmCompleteness: "确认完成",
    confirmedCompletion: "你已确认完成",

    closeTask: "关闭任务",

    views: "浏览",
    applies: "申请",
    conversion: "转化率",
    posted: "发布",

    categories: {
      tasks: "任务",
      task: "任务",
      jobs: "工作",
      job: "工作",
      contribution: "贡献",
      work: "机会"
    },

    intervals: {
      year: "年",
      years: "年",
      month: "个月",
      months: "个月",
      day: "天",
      days: "天",
      hour: "小时",
      hours: "小时",
      minute: "分钟",
      minutes: "分钟",
      justNow: "刚刚"
    }
  },

  ja: {
    in: "で",

    executionEntity: "実行主体",
    taskScale: "タスク規模",
    duration: "期間",
    deadline: "締切",
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    hoursShort: "時間",
    from: "開始",
    until: "終了",
    priceNotSet: "価格未設定",
    paymentModelNotSelected: "支払いモデル未選択",
    covers: "含む",
    escrow: "エスクロー",
    validationPer: "検証方法",
    revisions: "修正回数",
    clientApproval: "クライアント承認が必要",
    deadlineRespected: "期限遵守",
    requirementsFulfilled: "要件達成",
    minQuality: "最低品質",

    verified: "確認済み",
    taskNotFound: "タスクが見つかりません",

    statusAccepted: "候補に選ばれました",
    statusAssigned: "タスク割り当て済み — 開始してください",
    statusProgressing: "進行中 — 続けてください",
    statusCompleted: "完了しました",
    statusDeclined: "今回は選ばれませんでした",
    statusPending: "申請中",

    declareProgress: "進捗を報告",
    confirmCompleteness: "完了を確認",
    confirmedCompletion: "完了を確認しました",

    closeTask: "タスクを閉じる",

    views: "閲覧",
    applies: "応募",
    conversion: "コンバージョン",
    posted: "投稿",

    categories: {
      tasks: "タスク",
      task: "タスク",
      jobs: "仕事",
      job: "仕事",
      contribution: "貢献",
      work: "機会"
    },

    intervals: {
      year: "年",
      years: "年",
      month: "ヶ月",
      months: "ヶ月",
      day: "日",
      days: "日",
      hour: "時間",
      hours: "時間",
      minute: "分",
      minutes: "分",
      justNow: "たった今"
    }
  },

  ru: {
    in: "в",

    executionEntity: "Исполнитель",
    taskScale: "Масштаб задачи",
    duration: "Длительность",
    deadline: "Срок",
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    hoursShort: "часов",
    from: "С",
    until: "До",
    priceNotSet: "Цена не указана",
    paymentModelNotSelected: "Модель оплаты не выбрана",
    covers: "Покрывает",
    escrow: "Эскроу",
    validationPer: "Проверка",
    revisions: "Правки",
    clientApproval: "Требуется подтверждение клиента",
    deadlineRespected: "Срок соблюдён",
    requirementsFulfilled: "Требования выполнены",
    minQuality: "Мин. качество",

    verified: "Подтверждено",
    taskNotFound: "Задача не найдена",

    statusAccepted: "Вы в шорт-листе",
    statusAssigned: "Задача назначена — начинайте",
    statusProgressing: "В процессе — продолжайте",
    statusCompleted: "Задача выполнена",
    statusDeclined: "В этот раз не выбраны",
    statusPending: "Заявка в ожидании",

    declareProgress: "Сообщить о прогрессе",
    confirmCompleteness: "Подтвердить выполнение",
    confirmedCompletion: "Вы подтвердили выполнение",

    closeTask: "Закрыть задачу",

    views: "просмотров",
    applies: "откликов",
    conversion: "конверсия",
    posted: "Опубликовано",

    categories: {
      tasks: "Задачи",
      task: "Задача",
      jobs: "Работы",
      job: "Работа",
      contribution: "Вклад",
      work: "Возможность"
    },

    intervals: {
      year: "год",
      years: "лет",
      month: "месяц",
      months: "месяцев",
      day: "день",
      days: "дней",
      hour: "час",
      hours: "часов",
      minute: "минуту",
      minutes: "минут",
      justNow: "Только что"
    }
  }
};

const cvbJobInfoTranslations = {
  en: {
    in: "in",

    job: "Job",
    executionEntity: "Work entity",
    jobScale: "Job scale",
    duration: "Duration",
    deadline: "Application deadline",
    
    from: "From",
    until: "Until",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    hoursShort: "hours",

    salaryNotSet: "Salary not set",
    paymentModelNotSelected: "Payment model not selected",
    covers: "Covers",
    escrow: "Escrow",

    validationPer: "Validation per",
    revisions: "Revisions",
    clientApproval: "Client approval required",

    deadlineRespected: "Deadline respected",
    requirementsFulfilled: "Requirements fulfilled",
    minQuality: "Minimum quality",

    verified: "Verified",
    jobNotFound: "Job not found",

    statusAccepted: "You are shortlisted",
    statusAssigned: "You have been hired",
    statusProgressing: "Onboarding in progress",
    statusCompleted: "Employment completed",
    statusDeclined: "Not selected",
    statusPending: "Application pending",

    apply: "Apply",
    applied: "Applied",
    save: "Save Job",
    saved: "Saved Job",
    viewJob: "View Job",
    closeJob: "Close Job",

    views: "views",
    applies: "applications",
    conversion: "conversion",
    posted: "Posted",

    intervals: {
      year: "year",
      years: "years",
      month: "month",
      months: "months",
      day: "day",
      days: "days",
      hour: "hour",
      hours: "hours",
      minute: "minute",
      minutes: "minutes",
      justNow: "Just now"
    }
  },

  fr: {
    in: "dans",

    job: "Emploi",
    executionEntity: "Entité de travail",
    jobScale: "Échelle du poste",
    duration: "Durée",
    deadline: "Date limite de candidature",

    from: "Du",
    until: "Au",
    months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    hoursShort: "heures",

    salaryNotSet: "Salaire non défini",
    paymentModelNotSelected: "Modèle de paiement non sélectionné",
    covers: "Couvre",
    escrow: "Séquestre",

    validationPer: "Validation par",
    revisions: "Révisions",
    clientApproval: "Validation client requise",

    deadlineRespected: "Délai respecté",
    requirementsFulfilled: "Exigences remplies",
    minQuality: "Qualité minimale",

    verified: "Vérifié",
    jobNotFound: "Offre non trouvée",

    statusAccepted: "Vous êtes présélectionné",
    statusAssigned: "Vous avez été embauché",
    statusProgressing: "Intégration en cours",
    statusCompleted: "Emploi terminé",
    statusDeclined: "Non retenu",
    statusPending: "Candidature en attente",

    apply: "Postuler",
    applied: "Postulé",
    save: "Enregistrer l'offre",
    saved: "Offre enregistrée",
    viewJob: "Voir l'offre",
    closeJob: "Fermer l'offre",

    views: "vues",
    applies: "candidatures",
    conversion: "conversion",
    posted: "Publié",

    intervals: {
      year: "an",
      years: "ans",
      month: "mois",
      months: "mois",
      day: "jour",
      days: "jours",
      hour: "heure",
      hours: "heures",
      minute: "minute",
      minutes: "minutes",
      justNow: "À l'instant"
    }
  },

  ar: {
    in: "في",

    job: "وظيفة",
    executionEntity: "جهة العمل",
    jobScale: "حجم الوظيفة",
    duration: "المدة",
    deadline: "الموعد النهائي للتقديم",

    from: "من",
    until: "إلى",
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
    hoursShort: "ساعات",

    salaryNotSet: "الراتب غير محدد",
    paymentModelNotSelected: "نموذج الدفع غير محدد",
    covers: "يشمل",
    escrow: "ضمان",

    validationPer: "التحقق بواسطة",
    revisions: "المراجعات",
    clientApproval: "موافقة العميل مطلوبة",

    deadlineRespected: "تم احترام الموعد النهائي",
    requirementsFulfilled: "تم استيفاء المتطلبات",
    minQuality: "الحد الأدنى للجودة",

    verified: "موثّق",
    jobNotFound: "الوظيفة غير موجودة",

    statusAccepted: "تم اختيارك ضمن القائمة المختصرة",
    statusAssigned: "تم تعيينك",
    statusProgressing: "الإدماج جارٍ",
    statusCompleted: "اكتمل التوظيف",
    statusDeclined: "لم يتم اختيارك",
    statusPending: "الطلب قيد الانتظار",

    apply: "تقدم",
    applied: "تم التقديم",
    save: "حفظ الوظيفة",
    saved: "تم حفظ الوظيفة",
    viewJob: "عرض الوظيفة",
    closeJob: "إغلاق الوظيفة",

    views: "مشاهدات",
    applies: "تقديمات",
    conversion: "تحويل",
    posted: "نُشرت",

    intervals: {
      year: "سنة",
      years: "سنوات",
      month: "شهر",
      months: "أشهر",
      day: "يوم",
      days: "أيام",
      hour: "ساعة",
      hours: "ساعات",
      minute: "دقيقة",
      minutes: "دقائق",
      justNow: "الآن"
    }
  },

  es: {
    in: "en",

    job: "Trabajo",
    executionEntity: "Entidad de trabajo",
    jobScale: "Escala del puesto",
    duration: "Duración",
    deadline: "Fecha límite de solicitud",

    from: "Desde",
    until: "Hasta",
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    hoursShort: "horas",

    salaryNotSet: "Salario no definido",
    paymentModelNotSelected: "Modelo de pago no seleccionado",
    covers: "Cubre",
    escrow: "Depósito en garantía",

    validationPer: "Validación por",
    revisions: "Revisiones",
    clientApproval: "Aprobación del cliente requerida",

    deadlineRespected: "Plazo respetado",
    requirementsFulfilled: "Requisitos cumplidos",
    minQuality: "Calidad mínima",

    verified: "Verificado",
    jobNotFound: "Empleo no encontrado",

    statusAccepted: "Has sido preseleccionado",
    statusAssigned: "Has sido contratado",
    statusProgressing: "Integración en curso",
    statusCompleted: "Empleo completado",
    statusDeclined: "No seleccionado",
    statusPending: "Solicitud pendiente",

    apply: "Postular",
    applied: "Postulado",
    save: "Guardar empleo",
    saved: "Empleo guardado",
    viewJob: "Ver empleo",
    closeJob: "Cerrar empleo",

    views: "vistas",
    applies: "postulaciones",
    conversion: "conversión",
    posted: "Publicado",

    intervals: {
      year: "año",
      years: "años",
      month: "mes",
      months: "meses",
      day: "día",
      days: "días",
      hour: "hora",
      hours: "horas",
      minute: "minuto",
      minutes: "minutos",
      justNow: "Ahora mismo"
    }
  },

  de: {
    in: "in",

    job: "Job",
    executionEntity: "Arbeitseinheit",
    jobScale: "Aufgabenumfang",
    duration: "Dauer",
    deadline: "Bewerbungsfrist",

    from: "Von",
    until: "Bis",
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    hoursShort: "Stunden",

    salaryNotSet: "Gehalt nicht festgelegt",
    paymentModelNotSelected: "Zahlungsmodell nicht ausgewählt",
    covers: "Beinhaltet",
    escrow: "Treuhand",

    validationPer: "Validierung durch",
    revisions: "Überarbeitungen",
    clientApproval: "Kundenfreigabe erforderlich",

    deadlineRespected: "Frist eingehalten",
    requirementsFulfilled: "Anforderungen erfüllt",
    minQuality: "Mindestqualität",

    verified: "Verifiziert",
    jobNotFound: "Stelle nicht gefunden",

    statusAccepted: "Du bist in der engeren Auswahl",
    statusAssigned: "Du wurdest eingestellt",
    statusProgressing: "Onboarding läuft",
    statusCompleted: "Anstellung abgeschlossen",
    statusDeclined: "Nicht ausgewählt",
    statusPending: "Bewerbung ausstehend",

    apply: "Bewerben",
    applied: "Beworben",
    save: "Stelle speichern",
    saved: "Stelle gespeichert",
    viewJob: "Stelle ansehen",
    closeJob: "Stelle schließen",

    views: "Aufrufe",
    applies: "Bewerbungen",
    conversion: "Konversion",
    posted: "Veröffentlicht",

    intervals: {
      year: "Jahr",
      years: "Jahren",
      month: "Monat",
      months: "Monaten",
      day: "Tag",
      days: "Tagen",
      hour: "Stunde",
      hours: "Stunden",
      minute: "Minute",
      minutes: "Minuten",
      justNow: "Gerade jetzt"
    }
  },

  pt: {
    in: "em",

    job: "Emprego",
    executionEntity: "Entidade de trabalho",
    jobScale: "Escala do trabalho",
    duration: "Duração",
    deadline: "Prazo de candidatura",

    from: "De",
    until: "Até",
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
    hoursShort: "horas",

    salaryNotSet: "Salário não definido",
    paymentModelNotSelected: "Modelo de pagamento não selecionado",
    covers: "Cobre",
    escrow: "Garantia",

    validationPer: "Validação por",
    revisions: "Revisões",
    clientApproval: "Aprovação do cliente necessária",

    deadlineRespected: "Prazo respeitado",
    requirementsFulfilled: "Requisitos cumpridos",
    minQuality: "Qualidade mínima",

    verified: "Verificado",
    jobNotFound: "Trabalho não encontrado",

    statusAccepted: "Você foi pré-selecionado",
    statusAssigned: "Você foi contratado",
    statusProgressing: "Integração em andamento",
    statusCompleted: "Trabalho concluído",
    statusDeclined: "Não selecionado",
    statusPending: "Candidatura pendente",

    apply: "Candidatar-se",
    applied: "Candidatado",
    save: "Salvar vaga",
    saved: "Vaga salva",
    viewJob: "Ver vaga",
    closeJob: "Fechar vaga",

    views: "visualizações",
    applies: "candidaturas",
    conversion: "conversão",
    posted: "Publicado",

    intervals: {
      year: "ano",
      years: "anos",
      month: "mês",
      months: "meses",
      day: "dia",
      days: "dias",
      hour: "hora",
      hours: "horas",
      minute: "minuto",
      minutes: "minutos",
      justNow: "Agora mesmo"
    }
  },

  zh: {
    in: "在",

    job: "工作",
    executionEntity: "工作主体",
    jobScale: "工作规模",
    duration: "时长",
    deadline: "申请截止日期",

    from: "从",
    until: "到",
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    hoursShort: "小时",

    salaryNotSet: "薪资未设置",
    paymentModelNotSelected: "未选择支付模式",
    covers: "包含",
    escrow: "托管",

    validationPer: "验证方式",
    revisions: "修改次数",
    clientApproval: "需要客户确认",

    deadlineRespected: "按时完成",
    requirementsFulfilled: "满足要求",
    minQuality: "最低质量",

    verified: "已验证",
    jobNotFound: "未找到工作",

    statusAccepted: "你已入围",
    statusAssigned: "你已被录用",
    statusProgressing: "入职进行中",
    statusCompleted: "工作已完成",
    statusDeclined: "未被选中",
    statusPending: "申请处理中",

    apply: "申请",
    applied: "已申请",
    save: "保存工作",
    saved: "已保存工作",
    viewJob: "查看工作",
    closeJob: "关闭工作",

    views: "浏览",
    applies: "申请数",
    conversion: "转化率",
    posted: "发布",

    intervals: {
      year: "年",
      years: "年",
      month: "个月",
      months: "个月",
      day: "天",
      days: "天",
      hour: "小时",
      hours: "小时",
      minute: "分钟",
      minutes: "分钟",
      justNow: "刚刚"
    }
  },

  ja: {
    in: "で",

    job: "仕事",
    executionEntity: "作業主体",
    jobScale: "仕事の規模",
    duration: "期間",
    deadline: "応募締切",

    from: "開始",
    until: "終了",
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
    hoursShort: "時間",

    salaryNotSet: "給与未設定",
    paymentModelNotSelected: "支払いモデル未選択",
    covers: "含む",
    escrow: "エスクロー",

    validationPer: "検証方法",
    revisions: "修正回数",
    clientApproval: "クライアント承認が必要",

    deadlineRespected: "期限遵守",
    requirementsFulfilled: "要件達成",
    minQuality: "最低品質",

    verified: "確認済み",
    jobNotFound: "仕事が見つかりません",

    statusAccepted: "候補に選ばれました",
    statusAssigned: "採用されました",
    statusProgressing: "オンボーディング中",
    statusCompleted: "雇用完了",
    statusDeclined: "選ばれませんでした",
    statusPending: "申請中",

    apply: "応募する",
    applied: "応募済み",
    save: "仕事を保存",
    saved: "保存済み",
    viewJob: "仕事を見る",
    closeJob: "仕事を閉じる",

    views: "閲覧",
    applies: "応募",
    conversion: "コンバージョン",
    posted: "投稿",

    intervals: {
      year: "年",
      years: "年",
      month: "ヶ月",
      months: "ヶ月",
      day: "日",
      days: "日",
      hour: "時間",
      hours: "時間",
      minute: "分",
      minutes: "分",
      justNow: "たった今"
    }
  },

  ru: {
    in: "в",

    job: "Работа",
    executionEntity: "Рабочая единица",
    jobScale: "Масштаб работы",
    duration: "Длительность",
    deadline: "Дедлайн подачи заявки",

    from: "С",
    until: "До",
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
    hoursShort: "часов",

    salaryNotSet: "Зарплата не указана",
    paymentModelNotSelected: "Модель оплаты не выбрана",
    covers: "Покрывает",
    escrow: "Эскроу",

    validationPer: "Проверка",
    revisions: "Правки",
    clientApproval: "Требуется подтверждение клиента",

    deadlineRespected: "Срок соблюдён",
    requirementsFulfilled: "Требования выполнены",
    minQuality: "Мин. качество",

    verified: "Подтверждено",
    jobNotFound: "Работа не найдена",

    statusAccepted: "Вы в шорт-листе",
    statusAssigned: "Вы наняты",
    statusProgressing: "Онбординг в процессе",
    statusCompleted: "Работа завершена",
    statusDeclined: "Не выбран",
    statusPending: "Заявка в ожидании",

    apply: "Откликнуться",
    applied: "Откликнулись",
    save: "Сохранить работу",
    saved: "Работа сохранена",
    viewJob: "Просмотреть работу",
    closeJob: "Закрыть работу",

    views: "просмотров",
    applies: "откликов",
    conversion: "конверсия",
    posted: "Опубликовано",

    intervals: {
      year: "год",
      years: "лет",
      month: "месяц",
      months: "месяцев",
      day: "день",
      days: "дней",
      hour: "час",
      hours: "часов",
      minute: "минуту",
      minutes: "минут",
      justNow: "Только что"
    }
  }
};

const cvbTaskStatusTranslations = {
  en: {
    pending: "Pending",
    accepted: "Accepted",
    assigned: "Assigned",
    progressing: "Progressing",
    completed: "Completed",
    declined: "Declined"
  },

  fr: {
    pending: "En attente",
    accepted: "Accepté",
    assigned: "Attribué",
    progressing: "En cours",
    completed: "Terminé",
    declined: "Refusé"
  },

  ar: {
    pending: "قيد الانتظار",
    accepted: "مقبول",
    assigned: "مُعيّن",
    progressing: "قيد التنفيذ",
    completed: "مكتمل",
    declined: "مرفوض"
  },

  es: {
    pending: "Pendiente",
    accepted: "Aceptado",
    assigned: "Asignado",
    progressing: "En progreso",
    completed: "Completado",
    declined: "Rechazado"
  },

  de: {
    pending: "Ausstehend",
    accepted: "Akzeptiert",
    assigned: "Zugewiesen",
    progressing: "In Bearbeitung",
    completed: "Abgeschlossen",
    declined: "Abgelehnt"
  },

  pt: {
    pending: "Pendente",
    accepted: "Aceito",
    assigned: "Atribuído",
    progressing: "Em andamento",
    completed: "Concluído",
    declined: "Recusado"
  },

  zh: {
    pending: "待处理",
    accepted: "已接受",
    assigned: "已分配",
    progressing: "进行中",
    completed: "已完成",
    declined: "已拒绝"
  },

  ja: {
    pending: "保留中",
    accepted: "承認済み",
    assigned: "割り当て済み",
    progressing: "進行中",
    completed: "完了",
    declined: "拒否"
  },

  ru: {
    pending: "В ожидании",
    accepted: "Принято",
    assigned: "Назначено",
    progressing: "В процессе",
    completed: "Завершено",
    declined: "Отклонено"
  }
};

const cvbChatTranslations = {
  en: {
    typeMessage: "Type a message...",
    send: "Send",
    emptyTitle: "No conversation yet",
    emptySubtitle: "Stay tuned for a message from the opportunity owner",

    announcements: "Announcements",
    private: "Private",
    members: "members",

    awaitingPlaceholder: "Waiting for admin to start the conversation",
    stoppedPlaceholder: "Conversation stopped",

    statusAwaiting: "Awaiting",
    statusOpen: "Active",
    statusMuted: "Muted",
    statusStopped: "Stopped",

    today: "Today",
    yesterday: "Yesterday",
    
    you: "You",
    
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },

  fr: {
    typeMessage: "Écrivez un message...",
    send: "Envoyer",
    emptyTitle: "Aucune conversation pour le moment",
    emptySubtitle: "Restez attentif à un message du propriétaire de l’opportunité",

    announcements: "Annonces",
    private: "Privé",
    members: "membres",

    awaitingPlaceholder: "En attente que l’admin démarre la conversation",
    stoppedPlaceholder: "Conversation arrêtée",

    statusAwaiting: "En attente",
    statusOpen: "Active",
    statusMuted: "Muette",
    statusStopped: "Arrêtée",

    today: "Aujourd’hui",
    yesterday: "Hier",
    
    you: "Vous",
    
    months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
  },

  ar: {
    typeMessage: "اكتب رسالة...",
    send: "إرسال",
    emptyTitle: "لا توجد محادثة بعد",
    emptySubtitle: "ترقب رسالة من صاحب الفرصة",

    announcements: "الإعلانات",
    private: "خاص",
    members: "أعضاء",

    awaitingPlaceholder: "في انتظار بدء المحادثة من طرف المشرف",
    stoppedPlaceholder: "تم إيقاف المحادثة",

    statusAwaiting: "قيد الانتظار",
    statusOpen: "نشطة",
    statusMuted: "مكتومة",
    statusStopped: "متوقفة",

    today: "اليوم",
    yesterday: "أمس",
    
    you: "أنت",
    
    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
  },

  es: {
    typeMessage: "Escribe un mensaje...",
    send: "Enviar",
    emptyTitle: "Aún no hay conversación",
    emptySubtitle: "Mantente atento a un mensaje del propietario de la oportunidad",

    announcements: "Anuncios",
    private: "Privado",
    members: "miembros",

    awaitingPlaceholder: "Esperando a que el administrador inicie la conversación",
    stoppedPlaceholder: "Conversación detenida",

    statusAwaiting: "En espera",
    statusOpen: "Activa",
    statusMuted: "Silenciada",
    statusStopped: "Detenida",

    today: "Hoy",
    yesterday: "Ayer",
    
    you: "Tú",
    
    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
  },

  de: {
    typeMessage: "Nachricht eingeben...",
    send: "Senden",
    emptyTitle: "Noch keine Konversation",
    emptySubtitle: "Warte auf eine Nachricht vom Eigentümer der Gelegenheit",

    announcements: "Ankündigungen",
    private: "Privat",
    members: "Mitglieder",

    awaitingPlaceholder: "Warten auf den Start durch den Admin",
    stoppedPlaceholder: "Konversation gestoppt",

    statusAwaiting: "Wartend",
    statusOpen: "Aktiv",
    statusMuted: "Stumm",
    statusStopped: "Gestoppt",

    today: "Heute",
    yesterday: "Gestern",
    
    you: "Du",
    
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
  },

  pt: {
    typeMessage: "Digite uma mensagem...",
    send: "Enviar",
    emptyTitle: "Nenhuma conversa ainda",
    emptySubtitle: "Aguarde uma mensagem do proprietário da oportunidade",

    announcements: "Anúncios",
    private: "Privado",
    members: "membros",

    awaitingPlaceholder: "Aguardando o administrador iniciar a conversa",
    stoppedPlaceholder: "Conversa interrompida",

    statusAwaiting: "Aguardando",
    statusOpen: "Ativa",
    statusMuted: "Silenciada",
    statusStopped: "Interrompida",

    today: "Hoje",
    yesterday: "Ontem",
    
    you: "Você",
    
    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
  },

  zh: {
    typeMessage: "输入消息...",
    send: "发送",
    emptyTitle: "暂无对话",
    emptySubtitle: "请等待机会所有者发送消息",

    announcements: "公告",
    private: "私聊",
    members: "成员",

    awaitingPlaceholder: "等待管理员开始对话",
    stoppedPlaceholder: "对话已停止",

    statusAwaiting: "等待中",
    statusOpen: "活跃",
    statusMuted: "已静音",
    statusStopped: "已停止",

    today: "今天",
    yesterday: "昨天",
    
    you: "你",
    
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
  },

  ja: {
    typeMessage: "メッセージを入力...",
    send: "送信",
    emptyTitle: "まだ会話がありません",
    emptySubtitle: "機会の所有者からのメッセージをお待ちください",

    announcements: "お知らせ",
    private: "プライベート",
    members: "メンバー",

    awaitingPlaceholder: "管理者が会話を開始するのを待っています",
    stoppedPlaceholder: "会話は停止されました",

    statusAwaiting: "待機中",
    statusOpen: "アクティブ",
    statusMuted: "ミュート",
    statusStopped: "停止",

    today: "今日",
    yesterday: "昨日",
    
    you: "あなた",
    
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  },

  ru: {
    typeMessage: "Введите сообщение...",
    send: "Отправить",
    emptyTitle: "Пока нет диалога",
    emptySubtitle: "Ожидайте сообщение от владельца возможности",

    announcements: "Объявления",
    private: "Личное",
    members: "участников",

    awaitingPlaceholder: "Ожидание начала разговора администратором",
    stoppedPlaceholder: "Диалог остановлен",

    statusAwaiting: "Ожидание",
    statusOpen: "Активен",
    statusMuted: "Без звука",
    statusStopped: "Остановлен",

    today: "Сегодня",
    yesterday: "Вчера",
    
    you: "Вы",
    
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
  }
};

const taskForm_translations = {
  en: {
    // Header
    "tasks-header-title": "Add New Task",
    "tasks-header-description": "Create a new task to assign work, define requirements, and receive applications.",
    "tasks-reset-tooltip": "Reset Form",
    
    // Navigation steps
    "step-definition": "Task Definition",
    "step-skills": "Required Capabilities",
    "step-mode": "Execution Conditions",
    "step-evaluation": "Acceptance Criteria",
    "step-payment": "Compensation & Guarantees",
    
    // Task Definition page
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
    "category-placeholder": "Select a category",
    "category-it": "IT / Digital / AI / Cloud / Cybersecurity",
    "category-business": "Business / Management / Strategy / Consulting",
    "category-logistics": "Logistics / Operations / Supply Chain / Transport",
    "category-construction": "Construction / Infrastructure / Architecture / Civil",
    "category-maintenance": "Maintenance / Repair / Technical Support / Facilities",
    "category-technical": "Technical / Engineering / R&D / Industrial",
    "category-healthcare": "Healthcare / Care / Medical / Nursing",
    "category-education": "Education / Training / E-learning / Tutoring",
    "category-creative": "Creative / Media / Design / UX / Content",
    "category-domestic": "Domestic / Personal / Services / Assistance",
    "category-general": "General / Misc / Various / Other",
    "category-other": "Other / Unlisted",
    
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
    
    // Skills page
    "skills-title": "Required Capabilities",
    "skills-subtitle": "Skills",
    "skills-add-tech": "➕ Add Technical Skill",
    "languages-subtitle": "Languages",
    "languages-add": "➕ Add Language",
    
    // Execution Conditions page
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
    
    // Acceptance Criteria page
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
    "btn-publish": "Publish Task"
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
    "category-placeholder": "Sélectionnez une catégorie",
    "category-it": "IT / Numérique / IA / Cloud / Cybersécurité",
    "category-business": "Affaires / Management / Stratégie / Conseil",
    "category-logistics": "Logistique / Opérations / Chaîne d'approvisionnement / Transport",
    "category-construction": "Construction / Infrastructure / Architecture / Génie civil",
    "category-maintenance": "Maintenance / Réparation / Support technique / Installations",
    "category-technical": "Technique / Ingénierie / R&D / Industriel",
    "category-healthcare": "Santé / Soins / Médical / Infirmerie",
    "category-education": "Éducation / Formation / E-learning / Tutorat",
    "category-creative": "Créatif / Média / Design / UX / Contenu",
    "category-domestic": "Domestique / Personnel / Services / Assistance",
    "category-general": "Général / Divers / Varie / Autre",
    "category-other": "Autre / Non répertorié",
    
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
    "btn-publish": "Publier la tâche"
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
    "category-placeholder": "اختر فئة",
    "category-it": "تقنية المعلومات / الرقمنة / الذكاء الاصطناعي / السحابة / الأمن السيبراني",
    "category-business": "الأعمال / الإدارة / الاستراتيجية / الاستشارات",
    "category-logistics": "اللوجستيات / العمليات / سلسلة التوريد / النقل",
    "category-construction": "البناء / البنية التحتية / الهندسة المعمارية / المدني",
    "category-maintenance": "الصيانة / الإصلاح / الدعم الفني / المرافق",
    "category-technical": "التقني / الهندسة / البحث والتطوير / الصناعي",
    "category-healthcare": "الرعاية الصحية / التمريض / الطبي",
    "category-education": "التعليم / التدريب / التعلم الإلكتروني / الدروس الخصوصية",
    "category-creative": "الإبداع / الإعلام / التصميم / تجربة المستخدم / المحتوى",
    "category-domestic": "المنزلي / الشخصي / الخدمات / المساعدة",
    "category-general": "عام / متنوع / متفرقات / أخرى",
    "category-other": "أخرى / غير مصنفة",
    
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
    "btn-publish": "نشر المهمة"
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
    "category-placeholder": "Seleccione una categoría",
    "category-it": "TI / Digital / IA / Nube / Ciberseguridad",
    "category-business": "Negocios / Gestión / Estrategia / Consultoría",
    "category-logistics": "Logística / Operaciones / Cadena de Suministro / Transporte",
    "category-construction": "Construcción / Infraestructura / Arquitectura / Civil",
    "category-maintenance": "Mantenimiento / Reparación / Soporte Técnico / Instalaciones",
    "category-technical": "Técnico / Ingeniería / I+D / Industrial",
    "category-healthcare": "Salud / Asistencia / Médico / Enfermería",
    "category-education": "Educación / Formación / E-learning / Tutoría",
    "category-creative": "Creativo / Medios / Diseño / UX / Contenido",
    "category-domestic": "Doméstico / Personal / Servicios / Asistencia",
    "category-general": "General / Varios / Diversos / Otro",
    "category-other": "Otro / No Listado",
    
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
    "btn-publish": "Publicar Tarea"
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
    "category-placeholder": "选择类别",
    "category-it": "信息技术 / 数字化 / 人工智能 / 云计算 / 网络安全",
    "category-business": "商业 / 管理 / 战略 / 咨询",
    "category-logistics": "物流 / 运营 / 供应链 / 运输",
    "category-construction": "建筑 / 基础设施 / 建筑学 / 土木工程",
    "category-maintenance": "维护 / 维修 / 技术支持 / 设施",
    "category-technical": "技术 / 工程 / 研发 / 工业",
    "category-healthcare": "医疗保健 / 护理 / 医疗 / 看护",
    "category-education": "教育 / 培训 / 在线学习 / 辅导",
    "category-creative": "创意 / 媒体 / 设计 / 用户体验 / 内容",
    "category-domestic": "家政 / 个人 / 服务 / 协助",
    "category-general": "通用 / 杂项 / 各种 / 其他",
    "category-other": "其他 / 未列出",
    
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
    "btn-publish": "发布任务"
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
    "category-placeholder": "Kategorie auswählen",
    "category-it": "IT / Digital / KI / Cloud / Cybersicherheit",
    "category-business": "Wirtschaft / Management / Strategie / Beratung",
    "category-logistics": "Logistik / Betrieb / Lieferkette / Transport",
    "category-construction": "Bau / Infrastruktur / Architektur / Tiefbau",
    "category-maintenance": "Wartung / Reparatur / Technischer Support / Einrichtungen",
    "category-technical": "Technik / Ingenieurwesen / F&E / Industrie",
    "category-healthcare": "Gesundheitswesen / Pflege / Medizin / Krankenpflege",
    "category-education": "Bildung / Ausbildung / E-Learning / Nachhilfe",
    "category-creative": "Kreativ / Medien / Design / UX / Content",
    "category-domestic": "Häuslich / Persönlich / Dienstleistungen / Unterstützung",
    "category-general": "Allgemein / Verschiedenes / Diverse / Sonstiges",
    "category-other": "Sonstiges / Nicht aufgeführt",
    
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
    "btn-publish": "Aufgabe veröffentlichen"
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
    "category-placeholder": "Selecione uma categoria",
    "category-it": "TI / Digital / IA / Nuvem / Cibersegurança",
    "category-business": "Negócios / Gestão / Estratégia / Consultoria",
    "category-logistics": "Logística / Operações / Cadeia de Suprimentos / Transporte",
    "category-construction": "Construção / Infraestrutura / Arquitetura / Civil",
    "category-maintenance": "Manutenção / Reparação / Suporte Técnico / Instalações",
    "category-technical": "Técnico / Engenharia / P&D / Industrial",
    "category-healthcare": "Saúde / Assistência / Médico / Enfermagem",
    "category-education": "Educação / Formação / E-learning / Tutoria",
    "category-creative": "Criativo / Mídia / Design / UX / Conteúdo",
    "category-domestic": "Doméstico / Pessoal / Serviços / Assistência",
    "category-general": "Geral / Diversos / Vários / Outro",
    "category-other": "Outro / Não Listado",
    
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
    "btn-publish": "Publicar Tarefa"
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
    "category-placeholder": "カテゴリーを選択",
    "category-it": "IT / デジタル / AI / クラウド / サイバーセキュリティ",
    "category-business": "ビジネス / マネジメント / 戦略 / コンサルティング",
    "category-logistics": "ロジスティクス / オペレーション / サプライチェーン / 輸送",
    "category-construction": "建設 / インフラ / 建築 / 土木",
    "category-maintenance": "メンテナンス / 修理 / テクニカルサポート / 設備",
    "category-technical": "技術 / エンジニアリング / 研究開発 / 産業",
    "category-healthcare": "ヘルスケア / 介護 / 医療 / 看護",
    "category-education": "教育 / トレーニング / eラーニング / 家庭教師",
    "category-creative": "クリエイティブ / メディア / デザイン / UX / コンテンツ",
    "category-domestic": "家事 / 個人 / サービス / アシスタンス",
    "category-general": "一般 / その他 / 各種 / 他",
    "category-other": "その他 / 未分類",
    
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
    "btn-publish": "タスクを公開"
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
    "category-placeholder": "Выберите категорию",
    "category-it": "IT / Цифровые технологии / ИИ / Облако / Кибербезопасность",
    "category-business": "Бизнес / Управление / Стратегия / Консалтинг",
    "category-logistics": "Логистика / Операции / Цепочка поставок / Транспорт",
    "category-construction": "Строительство / Инфраструктура / Архитектура / Гражданское строительство",
    "category-maintenance": "Обслуживание / Ремонт / Техподдержка / Сооружения",
    "category-technical": "Технический / Инжиниринг / НИОКР / Промышленность",
    "category-healthcare": "Здравоохранение / Уход / Медицина / Сестринское дело",
    "category-education": "Образование / Обучение / Электронное обучение / Репетиторство",
    "category-creative": "Креатив / Медиа / Дизайн / UX / Контент",
    "category-domestic": "Домашний / Личный / Услуги / Помощь",
    "category-general": "Общее / Разное / Прочее / Другое",
    "category-other": "Другое / Не в списке",
    
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
    "btn-publish": "Опубликовать задачу"
  }
  
};

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