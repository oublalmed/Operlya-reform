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

  const selectedLang = getCurrentLang();
  const t = cvbUserInfoTranslations[selectedLang] || cvbUserInfoTranslations.en;

  const nextMode =
    currentMode === "system" ? "white" :
    currentMode === "white" ? "dark" :
    "system";

  if (icon) {
    if (nextMode === "white") {
      icon.className = "ri-sun-line";
    } else if (nextMode === "dark") {
      icon.className = "ri-moon-line";
    } else {
      icon.className = "ri-computer-line";
    }
  }

  if (label) {
    if (nextMode === "white") {
      label.textContent = t.themeLight;
    } else if (nextMode === "dark") {
      label.textContent = t.themeDark;
    } else {
      label.textContent = t.themeSystem;
    }
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

function openLoginModal() {
  requestAnimationFrame(() => {
    document
      .getElementById("loginModalPage")
      ?.classList.add("active");
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

// =============================== LOAD OPPORTUNITIES ================================

function createExternalOpportunityCard(task) {
  const lang = getCurrentLang();
  const t = externalTasksTranslations[lang] || externalTasksTranslations.en;

  const user = auth.currentUser;

  const card = document.createElement("div");
  card.className = "external-card";

  const provider = task.source?.provider || "External";

    function slugify(text = "") {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const slug =
    slugify(task.title || "opportunity");

  const opportunityUrl =
    `/opportunities/${slug}--${task.id}`;

  card.innerHTML = `
    <div class="external-title">${task.title || t.untitled}</div>
    <div class="external-description">${task.description || ""}</div>
    <div class="external-meta">
      ${task.industry ? `
        <span>
          <i class="ri-briefcase-line"></i>
          ${task.industry}
        </span>
      ` : ""}

      ${task.location?.reference ? `
        <span>
          <i class="ri-map-pin-line"></i>
          ${task.location.reference}
        </span>
      ` : ""}

      ${task.employmentType ? `
        <span>
          <i class="ri-user-line"></i>
          ${task.employmentType}
        </span>
      ` : ""}
    </div>

    <div class="external-actions">

      <button class="external-openBtn">
        <i class="ri-external-link-line"></i> ${t.openOpportunity}
      </button>

      <button class="external-saveBtn">
        <i class="ri-bookmark-line"></i>
      </button>

    </div>

    <div class="external-info">
      <i class="ri-information-line"></i> ${t.externalSource} / ${provider || t.external}
    </div>
  `;

  // ================= OPEN =================

  const openBtn = card.querySelector(".external-openBtn");
  openBtn.onclick = (e) => {
    e.stopPropagation();
    window.location.href = opportunityUrl;
  };

  card.onclick = () => {
    window.location.href = opportunityUrl;
  };

  // ================= SAVE =================

  const saveBtn = card.querySelector(".external-saveBtn");
  if (user && saveBtn) {

    const saveRef = doc(
      db,
      "externalOpportunities",
      task.id,
      "saves",
      user.uid
    );

    getDoc(saveRef).then((snap) => {
      if (snap.exists()) {
        saveBtn.classList.add("saved");
        saveBtn.innerHTML = `<i class="ri-bookmark-fill"></i>`;
      }
    });

    saveBtn.onclick = async (e) => {

      e.stopPropagation();

      try {

        const snap = await getDoc(saveRef);

        if (snap.exists()) {

          await deleteDoc(saveRef);
          saveBtn.classList.remove("saved");
          saveBtn.innerHTML = `<i class="ri-bookmark-line"></i>`;

        } else {

          await setDoc(saveRef, {
            userId: user.uid,
            createdAt: serverTimestamp()
          });

          saveBtn.classList.add("saved");
          saveBtn.innerHTML = `<i class="ri-bookmark-fill"></i>`;

        }

      } catch (err) {

        console.error("External opportunity save error:", err);

      }

    };

  }

  return card;
}

async function loadHeroOpportunities() {
  const container = document.getElementById("heroOpportunitiesList");

  if (!container) return;

  container.innerHTML = "";

  try {
    const snap = await getDocs(
      query(
        collection(db, "externalOpportunities"),
        orderBy("createdAt", "desc"),
        limit(3)
      )
    );

    snap.forEach(docSnap => {
      const task = {
        id: docSnap.id,
        ...docSnap.data()
      };

      container.appendChild(
        createExternalOpportunityCard(task)
      );
    });

    // Duplicate for infinite loop
    container.innerHTML += container.innerHTML;

  } catch (err) {
    console.error("Hero opportunities error:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHeroOpportunities();
});

// =============================== QUICK ACTIONS ================================

const input = document.getElementById("quickInput");

let exampleIndex = 0;
let charIndex = 0;
let typing = true;
let typingTimeout;

function getCurrentExamples() {
  const lang = getCurrentLang?.() || "en";
  return (
    quickActionExamples[lang] ||
    quickActionExamples.en
  );
}

function resetTypingAnimation() {
  clearTimeout(typingTimeout);
  exampleIndex = 0;
  charIndex = 0;
  typing = true;
  typeEffect();
}

const TYPING_SPEED = 40;
const DELETING_SPEED = 20;
const PAUSE_AFTER_TYPING = 6000;

function typeEffect() {
  if (!input || input.value.trim() !== "") return;

  const examples = getCurrentExamples();

  if (!examples.length) return;

  const text = examples[exampleIndex];

  if (typing) {
    input.placeholder = text.slice(0, charIndex++);

    if (charIndex > text.length) {
      typing = false;

      typingTimeout = setTimeout(typeEffect, PAUSE_AFTER_TYPING);
      return;
    }

    typingTimeout = setTimeout(typeEffect, TYPING_SPEED);
  } else {
    input.placeholder = text.slice(0, charIndex--);

    if (charIndex < 0) {
      typing = true;
      exampleIndex = (exampleIndex + 1) % examples.length;
    }

    typingTimeout = setTimeout(typeEffect, DELETING_SPEED);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  typeEffect();
});

function populateQuickInput(text) {
  if (!input) return;

  clearTimeout(typingTimeout);

  input.value = text;
  input.placeholder = "";
  input.focus();

  exampleIndex = 0;
  charIndex = 0;
  typing = true;
}

document.addEventListener("DOMContentLoaded", () => {
  typeEffect();

  const examplesContainer = document.querySelector(
    ".quick-action-examples"
  );

  examplesContainer?.addEventListener("click", (e) => {
    const example = e.target.closest("span");

    if (!example) return;

    populateQuickInput(example.textContent.trim());
  });
});

input?.addEventListener("blur", () => {
  if (input.value.trim() === "") {
    resetTypingAnimation();
  }
});

const createOpportunityBtn = document.getElementById("createOpportunity");
createOpportunityBtn?.addEventListener("click", () => {
  const value = input?.value.trim();
  if (!value) {
    window.location.href = "/opportunities/create.html";
    return;
  }
  window.location.href =
    `/opportunities/create.html?task_title=${encodeURIComponent(value)}`;
});

input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    createOpportunityBtn?.click();
  }
});

// =============================== ACTIVE PROFILES ================================

async function loadRecentProfiles() {
  const container = document.getElementById("recentProfiles");
  if (!container) return;

  container.innerHTML = "";

  try {
    const snap = await getDocs(
      query(
        collection(db, "profiles"),
        orderBy("createdAt", "desc"),
        limit(5)
      )
    );

    snap.forEach(docSnap => {
      const p = docSnap.data();

      const name = `${p.first_name || ""} ${p.last_name || ""}`.trim();

      const lang = getCurrentLang?.() || "en";

      const industryTranslations =
        Industry_Speciality_translations?.[lang] ||
        Industry_Speciality_translations.en;

      const userTranslations =
        UserForm_translations?.[lang] ||
        UserForm_translations.en;

      const industryObj = p.industries?.[0];

      const industryLabel = industryObj?.nameKey
        ? industryTranslations[industryObj.nameKey] || industryObj.id
        : "";

      const specialityLabel = industryObj?.specialityKey
        ? industryTranslations[industryObj.specialityKey] || ""
        : "";

      const roleKey = p.role ? `role-${p.role}` : "role-talent";

      const fallbackRole =
        userTranslations[roleKey] ||
        UserForm_translations.en[roleKey] ||
        "Talent";

      const role = industryLabel
        ? (
            specialityLabel
              ? `${industryLabel} • ${specialityLabel}`
              : industryLabel
          )
        : fallbackRole;

      const spec = p.headline || "Professional";
      const avatar = p.avatar || "/images/default_avatar.png";

      const card = document.createElement("div");
      card.className = "recentProfile-card";

      card.innerHTML = `
        <div class="recentProfile-avatar">
          <img src="${avatar}" alt="${name}" />
        </div>

        <div class="recentProfile-info">
          <div class="recentProfile-name">${name}</div>

          <div
            class="recentProfile-role"
            data-industry-key="${industryObj?.nameKey || ""}"
            data-speciality-key="${industryObj?.specialityKey || ""}"
            data-role-key="${roleKey}">
            ${role}
          </div>

          <div class="recentProfile-spec">${spec}</div>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error("Recent profiles error:", err);
  }
}

document.addEventListener("DOMContentLoaded", loadRecentProfiles);

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
  translateFooter();
  translateHero(lang);
  translateQuickAction(lang);
  translateValues(lang);
  translateStats(lang);
  translateFomo(lang);
  translateFinalCta(lang);
  setBodyFont(lang);
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

const heroTranslations = {
  en: {
    badge: "People, teams and opportunities are actively operating on Operlya",

    title_before: "Start",
    title_highlight1: "instantly",
    title_middle: "with the right people and",
    title_highlight2: "operate with performance",

    subtext: "We connect talent, projects, and opportunities into one intelligent workspace. Find the right profiles, collaborate in real time, manage tasks and opportunities, and turn execution into a measurable system — built for fast-moving teams.",

    btnPrimary: "Create Your Profile",
    btnSecondary: "Explore Opportunities",

    socialProof: "Join the first users",
    socialSubProof: "already collaborating, hiring, and executing work with Operlya",

    opportunitiesTitle: "Latest Opportunities",
    opportunitiesLink: "View all",

    trustTitle: "Connected Partners"
  },

  fr: {
    badge: "Les personnes, équipes et opportunités opèrent activement sur Operlya",

    title_before: "Commencez",
    title_highlight1: "instantanément",
    title_middle: "avec les bonnes personnes et",
    title_highlight2: "opérez avec performance",

    subtext: "Nous connectons talents, projets et opportunités dans un espace de travail intelligent. Trouvez les bons profils, collaborez en temps réel, gérez les tâches et opportunités, et transformez l'exécution en un système mesurable — conçu pour les équipes à croissance rapide.",

    btnPrimary: "Créer votre profil",
    btnSecondary: "Explorer les opportunités",

    socialProof: "Rejoignez les premiers utilisateurs",
    socialSubProof: "qui collaborent, recrutent et exécutent leur travail avec Operlya",

    opportunitiesTitle: "Dernières opportunités",
    opportunitiesLink: "Voir tout",

    trustTitle: "Partenaires connectés"
  },

  ar: {
    badge: "الأشخاص والفرق والفرص تعمل بنشاط على Operlya",

    title_before: "ابدأ",
    title_highlight1: "فوراً",
    title_middle: "مع الأشخاص المناسبين و",
    title_highlight2: "اعمل بأداء متميز",

    subtext: "نربط المواهب والمشاريع والفرص في مساحة عمل ذكية واحدة. ابحث عن الملفات الشخصية المناسبة، وتعاون في الوقت الفعلي، وأدر المهام والفرص، وحوّل التنفيذ إلى نظام قابل للقياس — مصمم للفرق سريعة الحركة.",

    btnPrimary: "إنشاء ملفك الشخصي",
    btnSecondary: "استكشاف الفرص",

    socialProof: "انضم إلى أوائل المستخدمين",
    socialSubProof: "الذين يتعاونون ويوظفون وينفذون العمل مع Operlya",

    opportunitiesTitle: "أحدث الفرص",
    opportunitiesLink: "عرض الكل",

    trustTitle: "شركاء متصلون"
  },

  es: {
    badge: "Personas, equipos y oportunidades operan activamente en Operlya",

    title_before: "Comienza",
    title_highlight1: "instantáneamente",
    title_middle: "con las personas adecuadas y",
    title_highlight2: "opera con rendimiento",

    subtext: "Conectamos talentos, proyectos y oportunidades en un espacio de trabajo inteligente. Encuentra los perfiles adecuados, colabora en tiempo real, gestiona tareas y oportunidades, y convierte la ejecución en un sistema medible — diseñado para equipos de ritmo rápido.",

    btnPrimary: "Crear tu perfil",
    btnSecondary: "Explorar oportunidades",

    socialProof: "Únete a los primeros usuarios",
    socialSubProof: "que ya colaboran, contratan y ejecutan trabajo con Operlya",

    opportunitiesTitle: "Últimas oportunidades",
    opportunitiesLink: "Ver todas",

    trustTitle: "Socios conectados"
  },

  zh: {
    badge: "人才、团队和机遇正在 Operlya 上积极运作",

    title_before: "立即",
    title_highlight1: "开始",
    title_middle: "与合适的人才和团队",
    title_highlight2: "高效执行",

    subtext: "我们将人才、项目和机遇连接到一个智能工作空间中。找到合适的档案，实时协作，管理任务和机遇，将执行转化为可衡量的系统 — 专为快节奏团队打造。",

    btnPrimary: "创建您的档案",
    btnSecondary: "探索机遇",

    socialProof: "加入首批用户",
    socialSubProof: "正在 Operlya 上协作、招聘和执行工作",

    opportunitiesTitle: "最新机遇",
    opportunitiesLink: "查看全部",

    trustTitle: "合作伙伴"
  },

  de: {
    badge: "Menschen, Teams und Möglichkeiten arbeiten aktiv auf Operlya",

    title_before: "Starten Sie",
    title_highlight1: "sofort",
    title_middle: "mit den richtigen Leuten und",
    title_highlight2: "arbeiten Sie mit Höchstleistung",

    subtext: "Wir verbinden Talente, Projekte und Möglichkeiten in einem intelligenten Arbeitsbereich. Finden Sie die richtigen Profile, arbeiten Sie in Echtzeit zusammen, verwalten Sie Aufgaben und Möglichkeiten und verwandeln Sie die Ausführung in ein messbares System — entwickelt für schnelllebige Teams.",

    btnPrimary: "Profil erstellen",
    btnSecondary: "Möglichkeiten entdecken",

    socialProof: "Werden Sie einer der ersten Nutzer",
    socialSubProof: "die bereits mit Operlya zusammenarbeiten, einstellen und Arbeit ausführen",

    opportunitiesTitle: "Aktuelle Möglichkeiten",
    opportunitiesLink: "Alle anzeigen",

    trustTitle: "Verbundene Partner"
  },

  pt: {
    badge: "Pessoas, equipes e oportunidades estão operando ativamente na Operlya",

    title_before: "Comece",
    title_highlight1: "instantaneamente",
    title_middle: "com as pessoas certas e",
    title_highlight2: "opere com performance",

    subtext: "Conectamos talentos, projetos e oportunidades em um espaço de trabalho inteligente. Encontre os perfis certos, colabore em tempo real, gerencie tarefas e oportunidades, e transforme a execução em um sistema mensurável — criado para equipes de ritmo acelerado.",

    btnPrimary: "Criar seu perfil",
    btnSecondary: "Explorar oportunidades",

    socialProof: "Junte-se aos primeiros usuários",
    socialSubProof: "que já estão colaborando, contratando e executando trabalho com a Operlya",

    opportunitiesTitle: "Últimas oportunidades",
    opportunitiesLink: "Ver todas",

    trustTitle: "Parceiros conectados"
  },

  ja: {
    badge: "人々、チーム、機会がOperlyaで積極的に活動しています",

    title_before: "適切な人材と",
    title_highlight1: "即座に",
    title_middle: "始めて",
    title_highlight2: "高いパフォーマンスで運営",

    subtext: "才能、プロジェクト、機会を1つのインテリジェントなワークスペースに結びつけます。適切なプロフィールを見つけ、リアルタイムでコラボレーションし、タスクと機会を管理し、実行を測定可能なシステムに変える — 高速なチームのために構築されました。",

    btnPrimary: "プロフィールを作成",
    btnSecondary: "機会を探す",

    socialProof: "最初のユーザーになりましょう",
    socialSubProof: "Operlyaで協力、採用、業務を実行している",

    opportunitiesTitle: "最新の機会",
    opportunitiesLink: "すべて表示",

    trustTitle: "連携パートナー"
  },

  ru: {
    badge: "Люди, команды и возможности активно работают на Operlya",

    title_before: "Начните",
    title_highlight1: "мгновенно",
    title_middle: "с нужными людьми и",
    title_highlight2: "работайте с высокой эффективностью",

    subtext: "Мы объединяем таланты, проекты и возможности в едином интеллектуальном пространстве. Найдите подходящие профили, сотрудничайте в реальном времени, управляйте задачами и возможностями, превращайте выполнение в измеримую систему — создано для быстрорастущих команд.",

    btnPrimary: "Создать профиль",
    btnSecondary: "Изучить возможности",

    socialProof: "Присоединяйтесь к первым пользователям",
    socialSubProof: "которые сотрудничают, нанимают и выполняют работу с Operlya",

    opportunitiesTitle: "Последние возможности",
    opportunitiesLink: "Смотреть все",

    trustTitle: "Подключенные партнеры"
  }
};
function translateHero(lang) {
  const t = heroTranslations[lang] || heroTranslations.en;

  const hero = document.querySelector(".operlya-hero");
  if (hero) {
    const badge = hero.querySelector(".badge-live span:last-child");
    if (badge) badge.textContent = t.badge;

    const h1 = hero.querySelector("h1");
    if (h1) {
      h1.innerHTML = `
        ${t.title_before} 
        <span>${t.title_highlight1}</span> 
        ${t.title_middle} 
        <span class="second">${t.title_highlight2}</span>
      `;
    }

    const subtext = hero.querySelector(".hero-subtext");
    if (subtext) subtext.textContent = t.subtext;

    const btnPrimary = hero.querySelector(".btn-primary");
    if (btnPrimary) {
      btnPrimary.innerHTML = `<i class="ri-user-3-line"></i> ${t.btnPrimary}`;
    }

    const btnSecondary = hero.querySelector(".btn-secondary");
    if (btnSecondary) {
      btnSecondary.innerHTML = `<i class="ri-compass-discover-line"></i> ${t.btnSecondary}`;
    }

    const social = hero.querySelector(".hero-social-proof strong");
    if (social) social.innerHTML = `${t.socialProof}`;
    const subSocial = hero.querySelector(".hero-social-proof p");
    if (subSocial) subSocial.innerHTML = `${t.socialSubProof}`;

    const oppTitle = hero.querySelector(".hero-opportunities-header h3");
    if (oppTitle) oppTitle.textContent = t.opportunitiesTitle;

    const oppLink = hero.querySelector(".hero-opportunities-link");
    if (oppLink) {
      oppLink.innerHTML = `${t.opportunitiesLink} <i class="ri-arrow-right-line"></i>`;
    }
  }

  // Translate trust section
  const trustSection = document.querySelector(".operlya-trust");
  if (trustSection) {
    const trustTitle = trustSection.querySelector(".trust-title");
    if (trustTitle) trustTitle.textContent = t.trustTitle;
  }
}

const quickActionExamples = {
  en: [
    "I need a website for my local business",
    "Hiring a marketing freelancer for my startup",
    "Find a delivery driver in Paris ASAP",
    "Looking for a designer for a new fashion collection launch",
    "I need a developer to build a mobile app",
  ],

  fr: [
    "J'ai besoin d'un site web pour mon entreprise locale",
    "Je cherche un freelance en marketing pour ma startup",
    "Trouvez un chauffeur-livreur à Paris ASAP",
    "Je cherche un designer pour le lancement d'une nouvelle collection de mode",
    "J'ai besoin d'un développeur pour créer une application mobile"
  ],

  ar: [
    "أحتاج موقع ويب لعملي المحلي",
    "أبحث عن مسوق مستقل لشركتي الناشئة",
    "ابحث عن سائق توصيل في باريس في أقرب وقت",
    "أبحث عن مصمم لإطلاق مجموعة أزياء جديدة",
    "أحتاج مطوراً لبناء تطبيق جوال"
  ],

  es: [
    "Necesito un sitio web para mi negocio local",
    "Contratar a un freelancer de marketing para mi startup",
    "Encuentra un repartidor en París lo antes posible",
    "Busco un diseñador para el lanzamiento de una nueva colección de moda",
    "Necesito un desarrollador para crear una aplicación móvil"
  ],

  zh: [
    "我需要为我的本地企业建立一个网站",
    "为我的初创公司招聘一名营销自由职业者",
    "尽快在巴黎找一名送货司机",
    "寻找一名时装设计师来推出新的时装系列",
    "我需要一名开发人员来构建移动应用程序"
  ],

  de: [
    "Ich brauche eine Website für mein lokales Geschäft",
    "Ich suche einen Marketing-Freelancer für mein Startup",
    "Finden Sie sofort einen Zustellfahrer in Paris",
    "Suche einen Designer für die Einführung einer neuen Modekollektion",
    "Ich brauche einen Entwickler, um eine mobile App zu erstellen"
  ],

  pt: [
    "Preciso de um site para meu negócio local",
    "Contratar um freelancer de marketing para minha startup",
    "Encontre um motorista de entregas em Paris o mais rápido possível",
    "Procurando um designer para o lançamento de uma nova coleção de moda",
    "Preciso de um desenvolvedor para criar um aplicativo móvel"
  ],

  ja: [
    "地元のビジネス用のウェブサイトが必要です",
    "スタートアップ向けのマーケティングフリーランサーを募集しています",
    "パリで配達ドライバーを至急見つけてください",
    "新しいファッションコレクションのローンチ用デザイナーを探しています",
    "モバイルアプリを開発する開発者が必要です"
  ],

  ru: [
    "Мне нужен сайт для моего местного бизнеса",
    "Ищу фрилансера-маркетолога для моего стартапа",
    "Найдите водителя доставки в Париже срочно",
    "Ищу дизайнера для запуска новой модной коллекции",
    "Мне нужен разработчик для создания мобильного приложения"
  ]
};
const quickActionTranslations = {
  en: {
    title: "What do you need help with?",
    subtitle: "Describe your need and Operlya will connect you instantly",
    placeholder: "Describe what you need...",
    recentTitle: "Recent talents",
    recentSubtitle: "People currently active on Operlya"
  },

  fr: {
    title: "Avec quoi avez-vous besoin d'aide ?",
    subtitle: "Décrivez votre besoin et Operlya vous mettra en relation instantanément",
    placeholder: "Décrivez ce dont vous avez besoin...",
    recentTitle: "Talents récents",
    recentSubtitle: "Personnes actuellement actives sur Operlya"
  },

  ar: {
    title: "بماذا تحتاج المساعدة؟",
    subtitle: "صف احتياجك وسوف يوصلك Operlya على الفور",
    placeholder: "صف ما تحتاجه...",
    recentTitle: "المواهب الأخيرة",
    recentSubtitle: "الأشخاص النشطون حالياً على Operlya"
  },

  es: {
    title: "¿En qué necesitas ayuda?",
    subtitle: "Describe tu necesidad y Operlya te conectará instantáneamente",
    placeholder: "Describe lo que necesitas...",
    recentTitle: "Talentos recientes",
    recentSubtitle: "Personas activas actualmente en Operlya"
  },

  zh: {
    title: "您需要什么帮助？",
    subtitle: "描述您的需求，Operlya 将立即为您连接",
    placeholder: "描述您需要什么...",
    recentTitle: "近期人才",
    recentSubtitle: "目前在 Operlya 上活跃的人"
  },

  de: {
    title: "Womit brauchen Sie Hilfe?",
    subtitle: "Beschreiben Sie Ihren Bedarf und Operlya verbindet Sie sofort",
    placeholder: "Beschreiben Sie, was Sie brauchen...",
    recentTitle: "Aktuelle Talente",
    recentSubtitle: "Derzeit aktive Personen auf Operlya"
  },

  pt: {
    title: "Com o que você precisa de ajuda?",
    subtitle: "Descreva sua necessidade e a Operlya conectará você instantaneamente",
    placeholder: "Descreva o que você precisa...",
    recentTitle: "Talentos recentes",
    recentSubtitle: "Pessoas ativas atualmente na Operlya"
  },

  ja: {
    title: "どのようなお手伝いが必要ですか？",
    subtitle: "ニーズを説明すると、Operlyaが即座に接続します",
    placeholder: "必要なことを説明してください...",
    recentTitle: "最近のタレント",
    recentSubtitle: "現在Operlyaで活動している人々"
  },

  ru: {
    title: "С чем вам нужна помощь?",
    subtitle: "Опишите свою потребность, и Operlya мгновенно соединит вас",
    placeholder: "Опишите, что вам нужно...",
    recentTitle: "Недавние таланты",
    recentSubtitle: "Люди, активные в настоящее время на Operlya"
  }
};
function translateQuickAction(lang) {
  const t = quickActionTranslations[lang] || quickActionTranslations.en;
  const localizedExamples = quickActionExamples[lang] || quickActionExamples.en;

  const section = document.querySelector(".operlya-quick-action");
  if (!section) return;

  const headerTitle = section.querySelector(".quick-action-header h3");
  if (headerTitle) headerTitle.textContent = t.title;

  const headerSubtitle = section.querySelector(".quick-action-header p");
  if (headerSubtitle) headerSubtitle.textContent = t.subtitle;

  const input = section.querySelector("#quickInput");
  if (input) input.placeholder = t.placeholder;

  const examples = section.querySelectorAll(".quick-action-examples span");
  examples.forEach((example, index) => {
    if (localizedExamples[index]) {
      example.textContent = localizedExamples[index];
    }
  });

  const recentTitle = section.querySelector(".qa-right-header h4");
  if (recentTitle) recentTitle.textContent = t.recentTitle;

  const recentSubtitle = section.querySelector(".qa-right-header p");
  if (recentSubtitle) recentSubtitle.textContent = t.recentSubtitle;

  const profilesContainer = section.querySelector("#recentProfiles");
  if (profilesContainer && typeof Industry_Speciality_translations !== 'undefined') {
    const roles = profilesContainer.querySelectorAll(".recentProfile-role");

    roles.forEach(roleElement => {
      const industryTranslations =
        Industry_Speciality_translations?.[lang] ||
        Industry_Speciality_translations.en;

      const userTranslations =
        UserForm_translations?.[lang] ||
        UserForm_translations.en;

      const industryKey = roleElement.dataset.industryKey;
      const specialityKey = roleElement.dataset.specialityKey;
      const roleKey = roleElement.dataset.roleKey;

      const industryLabel =
        industryTranslations[industryKey] ||
        Industry_Speciality_translations.en[industryKey];

      const specialityLabel =
        industryTranslations[specialityKey] ||
        Industry_Speciality_translations.en[specialityKey];

      if (industryLabel) {
        roleElement.textContent = specialityLabel
          ? `${industryLabel} • ${specialityLabel}`
          : industryLabel;
      } else {
        roleElement.textContent =
          userTranslations[roleKey] ||
          UserForm_translations.en[roleKey] ||
          "Talent";
      }
    });
  }
}

const valuesTranslations = {
  en: {
    header: {
      title: "Everything you need to build a",
      titleHighlight: "high-performing career",
      subtitle: "One platform to create, manage, and accelerate your professional growth."
    },
    cards: [
      {
        title: "Smart Resume Builder",
        desc: "Create modern resumes, optimize content, and improve your ATS score.",
        link: "Build my resume"
      },
      {
        title: "Personalized Opportunities",
        desc: "Discover opportunities that match your profile every day.",
        link: "Explore"
      },
      {
        title: "Real-Time Career Management",
        desc: "Track applications, interviews, and professional progress.",
        link: "Manage my activity"
      },
      {
        title: "Career Copilot & Action Engine",
        desc: "Recommendations, improvements, and next-step execution in one flow.",
        link: "Take action now"
      }
    ]
  },

  fr: {
    header: {
      title: "Tout ce dont vous avez besoin pour bâtir une",
      titleHighlight: "carrière à haute performance",
      subtitle: "Une plateforme pour créer, gérer et accélérer votre croissance professionnelle."
    },
    cards: [
      {
        title: "Créateur de CV intelligent",
        desc: "Créez des CV modernes, optimisez le contenu et améliorez votre score ATS.",
        link: "Créer mon CV"
      },
      {
        title: "Opportunités personnalisées",
        desc: "Découvrez chaque jour des opportunités qui correspondent à votre profil.",
        link: "Explorer"
      },
      {
        title: "Gestion de carrière en temps réel",
        desc: "Suivez les candidatures, les entretiens et l'évolution professionnelle.",
        link: "Gérer mon activité"
      },
      {
        title: "Copilote de carrière et moteur d'action",
        desc: "Recommandations, améliorations et exécution des prochaines étapes en un seul flux.",
        link: "Agir maintenant"
      }
    ]
  },

  ar: {
    header: {
      title: "كل ما تحتاجه لبناء",
      titleHighlight: "مهنة عالية الأداء",
      subtitle: "منصة واحدة لإنشاء وإدارة وتسريع نموك المهني."
    },
    cards: [
      {
        title: "منشئ سيرة ذاتية ذكي",
        desc: "أنشئ سيراً ذاتية حديثة، حسّن المحتوى، وارفع درجة ATS الخاصة بك.",
        link: "بناء سيرتي"
      },
      {
        title: "فرص مخصصة",
        desc: "اكتشف يومياً فرصاً تتناسب مع ملفك الشخصي.",
        link: "استكشاف"
      },
      {
        title: "إدارة مهنية في الوقت الفعلي",
        desc: "تتبع الطلبات والمقابلات والتقدم المهني.",
        link: "إدارة نشاطي"
      },
      {
        title: "مساعد مهني ومحرك تنفيذ",
        desc: "توصيات وتحسينات وتنفيذ الخطوات التالية في تدفق واحد.",
        link: "اتخذ إجراءً الآن"
      }
    ]
  },

  es: {
    header: {
      title: "Todo lo que necesitas para construir una",
      titleHighlight: "carrera de alto rendimiento",
      subtitle: "Una plataforma para crear, gestionar y acelerar tu crecimiento profesional."
    },
    cards: [
      {
        title: "Creador de currículum inteligente",
        desc: "Crea currículums modernos, optimiza el contenido y mejora tu puntuación ATS.",
        link: "Crear mi currículum"
      },
      {
        title: "Oportunidades personalizadas",
        desc: "Descubre cada día oportunidades que coinciden con tu perfil.",
        link: "Explorar"
      },
      {
        title: "Gestión de carrera en tiempo real",
        desc: "Realiza un seguimiento de solicitudes, entrevistas y progreso profesional.",
        link: "Gestionar mi actividad"
      },
      {
        title: "Copiloto de carrera y motor de acción",
        desc: "Recomendaciones, mejoras y ejecución del siguiente paso en un solo flujo.",
        link: "Actuar ahora"
      }
    ]
  },

  zh: {
    header: {
      title: "打造",
      titleHighlight: "高绩效职业",
      subtitle: "一站式平台，创建、管理和加速您的职业发展。"
    },
    cards: [
      {
        title: "智能简历生成器",
        desc: "创建现代简历，优化内容，并提高您的ATS评分。",
        link: "创建我的简历"
      },
      {
        title: "个性化机遇",
        desc: "每天发现与您的档案匹配的机遇。",
        link: "探索"
      },
      {
        title: "实时职业管理",
        desc: "跟踪申请、面试和职业进展。",
        link: "管理我的活动"
      },
      {
        title: "职业副驾驶与行动引擎",
        desc: "在一个流程中获得建议、改进和下一步执行。",
        link: "立即行动"
      }
    ]
  },

  de: {
    header: {
      title: "Alles, was Sie brauchen, um eine",
      titleHighlight: "hochleistungsfähige Karriere",
      subtitle: "Eine Plattform zum Erstellen, Verwalten und Beschleunigen Ihres beruflichen Wachstums."
    },
    cards: [
      {
        title: "Intelligenter Lebenslauf-Ersteller",
        desc: "Erstellen Sie moderne Lebensläufe, optimieren Sie Inhalte und verbessern Sie Ihren ATS-Score.",
        link: "Meinen Lebenslauf erstellen"
      },
      {
        title: "Personalisierte Möglichkeiten",
        desc: "Entdecken Sie täglich Möglichkeiten, die zu Ihrem Profil passen.",
        link: "Entdecken"
      },
      {
        title: "Echtzeit-Karrieremanagement",
        desc: "Verfolgen Sie Bewerbungen, Interviews und beruflichen Fortschritt.",
        link: "Meine Aktivität verwalten"
      },
      {
        title: "Karriere-Copilot und Aktions-Engine",
        desc: "Empfehlungen, Verbesserungen und Ausführung der nächsten Schritte in einem Fluss.",
        link: "Jetzt handeln"
      }
    ]
  },

  pt: {
    header: {
      title: "Tudo o que você precisa para construir uma",
      titleHighlight: "carreira de alto desempenho",
      subtitle: "Uma plataforma para criar, gerenciar e acelerar seu crescimento profissional."
    },
    cards: [
      {
        title: "Criador de currículo inteligente",
        desc: "Crie currículos modernos, otimize o conteúdo e melhore sua pontuação ATS.",
        link: "Criar meu currículo"
      },
      {
        title: "Oportunidades personalizadas",
        desc: "Descubra diariamente oportunidades que correspondem ao seu perfil.",
        link: "Explorar"
      },
      {
        title: "Gestão de carreira em tempo real",
        desc: "Acompanhe candidaturas, entrevistas e progresso profissional.",
        link: "Gerenciar minha atividade"
      },
      {
        title: "Copiloto de carreira e motor de ação",
        desc: "Recomendações, melhorias e execução do próximo passo em um só fluxo.",
        link: "Agir agora"
      }
    ]
  },

  ja: {
    header: {
      title: "構築するために必要なすべて",
      titleHighlight: "高性能なキャリア",
      subtitle: "プロフェッショナルな成長を創り、管理し、加速するためのワンプラットフォーム。"
    },
    cards: [
      {
        title: "スマート履歴書ビルダー",
        desc: "モダンな履歴書を作成し、コンテンツを最適化し、ATSスコアを向上させます。",
        link: "履歴書を作成"
      },
      {
        title: "パーソナライズされた機会",
        desc: "プロフィールに合った機会を毎日発見します。",
        link: "探す"
      },
      {
        title: "リアルタイムキャリア管理",
        desc: "応募、面接、キャリアの進捗を追跡します。",
        link: "アクティビティを管理"
      },
      {
        title: "キャリアコパイロット＆アクションエンジン",
        desc: "レコメンデーション、改善、次のステップの実行を一つの流れで。",
        link: "今すぐ行動する"
      }
    ]
  },

  ru: {
    header: {
      title: "Всё, что нужно для построения",
      titleHighlight: "высокоэффективной карьеры",
      subtitle: "Одна платформа для создания, управления и ускорения профессионального роста."
    },
    cards: [
      {
        title: "Умный конструктор резюме",
        desc: "Создавайте современные резюме, оптимизируйте содержание и улучшайте свой ATS-рейтинг.",
        link: "Создать резюме"
      },
      {
        title: "Персонализированные возможности",
        desc: "Ежедневно открывайте возможности, соответствующие вашему профилю.",
        link: "Изучить"
      },
      {
        title: "Управление карьерой в реальном времени",
        desc: "Отслеживайте заявки, собеседования и профессиональный прогресс.",
        link: "Управлять активностью"
      },
      {
        title: "Карьерный копилот и движок действий",
        desc: "Рекомендации, улучшения и выполнение следующего шага в одном потоке.",
        link: "Действовать сейчас"
      }
    ]
  }
};
function translateValues(lang) {
  const t = valuesTranslations[lang] || valuesTranslations.en;

  const section = document.querySelector(".operlya-values-container");
  if (!section) return;

  // Translate header
  const headerTitle = section.querySelector(".values-header h2");
  if (headerTitle) {
    const span = headerTitle.querySelector("span");
    if (span) {
      headerTitle.childNodes[0].textContent = t.header.title + " ";
      span.textContent = t.header.titleHighlight;
    }
  }

  const headerSubtitle = section.querySelector(".values-header p");
  if (headerSubtitle) {
    headerSubtitle.textContent = t.header.subtitle;
  }

  // Translate cards
  const cards = section.querySelectorAll(".value-card");
  cards.forEach((card, index) => {
    const data = t.cards[index];
    if (!data) return;

    const title = card.querySelector("h3");
    const desc = card.querySelector("p");
    const link = card.querySelector(".value-link");

    if (title) title.textContent = data.title;
    if (desc) desc.textContent = data.desc;
    if (link) {
      const linkText = link.childNodes[0];
      if (linkText) linkText.textContent = data.link;
    }
  });
}

const statsTranslations = {
  en: {
    stats: [
      {
        number: "+25,000",
        label: "Professionals Connected"
      },
      {
        number: "+60,000",
        label: "Profiles Created"
      },
      {
        number: "+30,000",
        label: "Opportunities Published"
      },
      {
        number: "92%",
        label: "Satisfaction Rate"
      }
    ]
  },

  fr: {
    stats: [
      {
        number: "+25 000",
        label: "Professionnels Connectés"
      },
      {
        number: "+60 000",
        label: "Profils Créés"
      },
      {
        number: "+30 000",
        label: "Opportunités Publiées"
      },
      {
        number: "92%",
        label: "Taux de Satisfaction"
      }
    ]
  },

  ar: {
    stats: [
      {
        number: "+25,000",
        label: "محترفين متصلين"
      },
      {
        number: "+60,000",
        label: "ملف شخصي تم إنشاؤه"
      },
      {
        number: "+30,000",
        label: "فرصة منشورة"
      },
      {
        number: "92%",
        label: "معدل الرضا"
      }
    ]
  },

  es: {
    stats: [
      {
        number: "+25,000",
        label: "Profesionales Conectados"
      },
      {
        number: "+60,000",
        label: "Perfiles Creados"
      },
      {
        number: "+30,000",
        label: "Oportunidades Publicadas"
      },
      {
        number: "92%",
        label: "Tasa de Satisfacción"
      }
    ]
  },

  zh: {
    stats: [
      {
        number: "+25,000",
        label: "专业人士已连接"
      },
      {
        number: "+60,000",
        label: "档案已创建"
      },
      {
        number: "+30,000",
        label: "机遇已发布"
      },
      {
        number: "92%",
        label: "满意度"
      }
    ]
  },

  de: {
    stats: [
      {
        number: "+25.000",
        label: "Fachleute verbunden"
      },
      {
        number: "+60.000",
        label: "Profile erstellt"
      },
      {
        number: "+30.000",
        label: "Möglichkeiten veröffentlicht"
      },
      {
        number: "92%",
        label: "Zufriedenheitsrate"
      }
    ]
  },

  pt: {
    stats: [
      {
        number: "+25.000",
        label: "Profissionais Conectados"
      },
      {
        number: "+60.000",
        label: "Perfis Criados"
      },
      {
        number: "+30.000",
        label: "Oportunidades Publicadas"
      },
      {
        number: "92%",
        label: "Taxa de Satisfação"
      }
    ]
  },

  ja: {
    stats: [
      {
        number: "+25,000",
        label: "プロフェッショナルが接続"
      },
      {
        number: "+60,000",
        label: "プロフィールが作成"
      },
      {
        number: "+30,000",
        label: "機会が公開"
      },
      {
        number: "92%",
        label: "満足度"
      }
    ]
  },

  ru: {
    stats: [
      {
        number: "+25 000",
        label: "Специалистов подключено"
      },
      {
        number: "+60 000",
        label: "Профилей создано"
      },
      {
        number: "+30 000",
        label: "Возможностей опубликовано"
      },
      {
        number: "92%",
        label: "Уровень удовлетворённости"
      }
    ]
  }
};
function translateStats(lang) {
  const t = statsTranslations[lang] || statsTranslations.en;

  const section = document.querySelector(".operlya-stats");
  if (!section) return;

  const statItems = section.querySelectorAll(".stat-item");

  statItems.forEach((item, index) => {
    const data = t.stats[index];
    if (!data) return;

    const numberElement = item.querySelector("h3");
    const labelElement = item.querySelector("p");

    if (numberElement) numberElement.textContent = data.number;
    if (labelElement) labelElement.textContent = data.label;
  });
}

const fomoTranslations = {
  en: {
    title: "Professionals are already using Operlya to manage real work",

    items: [
      {
        title: "New profiles are being published",
        desc: "Users are turning their resumes into public professional identities."
      },
      {
        title: "Opportunities are being posted daily",
        desc: "Projects, tasks, and jobs are shared by opportunity owners."
      },
      {
        title: "Applications are actively reviewed",
        desc: "Profiles are evaluated based on real skills and experience."
      },
      {
        title: "Work is being managed in real time",
        desc: "Tasks, conversations, and progress are tracked inside projects."
      },
      {
        title: "Resumes are continuously improved",
        desc: "Users optimize their CVs with ATS analysis and feedback."
      },
      {
        title: "Profiles are getting visibility",
        desc: "Users receive views and opportunities from their public profiles."
      }
    ],

    ctaPrimary: "Create My Resume",
    ctaSecondary: "Explore Opportunities"
  },

  fr: {
    title: "Les professionnels utilisent déjà Operlya pour gérer du travail réel",

    items: [
      {
        title: "De nouveaux profils sont publiés",
        desc: "Les utilisateurs transforment leur CV en identités professionnelles publiques."
      },
      {
        title: "Des opportunités sont publiées chaque jour",
        desc: "Projets, tâches et emplois sont partagés par les créateurs."
      },
      {
        title: "Les candidatures sont activement examinées",
        desc: "Les profils sont évalués selon les compétences réelles."
      },
      {
        title: "Le travail est géré en temps réel",
        desc: "Les tâches, conversations et progrès sont suivis dans les projets."
      },
      {
        title: "Les CV sont continuellement améliorés",
        desc: "Les utilisateurs optimisent leurs CV avec l'analyse ATS."
      },
      {
        title: "Les profils gagnent en visibilité",
        desc: "Les utilisateurs reçoivent des vues et des opportunités."
      }
    ],

    ctaPrimary: "Créer mon CV",
    ctaSecondary: "Explorer les opportunités"
  },

  ar: {
    title: "المحترفون يستخدمون Operlya بالفعل لإدارة العمل الحقيقي",

    items: [
      {
        title: "يتم نشر ملفات جديدة",
        desc: "يقوم المستخدمون بتحويل سيرهم الذاتية إلى هويات مهنية عامة."
      },
      {
        title: "يتم نشر فرص يوميًا",
        desc: "يتم مشاركة المشاريع والمهام والوظائف من قبل أصحاب الفرص."
      },
      {
        title: "تتم مراجعة الطلبات بنشاط",
        desc: "يتم تقييم الملفات الشخصية بناءً على المهارات الحقيقية."
      },
      {
        title: "يتم إدارة العمل في الوقت الحقيقي",
        desc: "تتم متابعة المهام والمحادثات والتقدم داخل المشاريع."
      },
      {
        title: "يتم تحسين السير الذاتية باستمرار",
        desc: "يقوم المستخدمون بتحسين سيرهم باستخدام تحليل ATS."
      },
      {
        title: "تحصل الملفات على رؤية أكبر",
        desc: "يحصل المستخدمون على مشاهدات وفرص من ملفاتهم العامة."
      }
    ],

    ctaPrimary: "إنشاء سيرتي",
    ctaSecondary: "استكشاف الفرص"
  },

  es: {
    title: "Los profesionales ya están usando Operlya para gestionar trabajo real",

    items: [
      {
        title: "Se están publicando nuevos perfiles",
        desc: "Los usuarios están convirtiendo sus currículums en identidades profesionales públicas."
      },
      {
        title: "Se publican oportunidades diariamente",
        desc: "Proyectos, tareas y empleos son compartidos por los dueños de oportunidades."
      },
      {
        title: "Las solicitudes se revisan activamente",
        desc: "Los perfiles se evalúan según habilidades y experiencia reales."
      },
      {
        title: "El trabajo se gestiona en tiempo real",
        desc: "Tareas, conversaciones y progreso se rastrean dentro de los proyectos."
      },
      {
        title: "Los currículums se mejoran continuamente",
        desc: "Los usuarios optimizan sus CV con análisis y comentarios de ATS."
      },
      {
        title: "Los perfiles obtienen visibilidad",
        desc: "Los usuarios reciben vistas y oportunidades desde sus perfiles públicos."
      }
    ],

    ctaPrimary: "Crear mi currículum",
    ctaSecondary: "Explorar oportunidades"
  },

  zh: {
    title: "专业人士已经在使用 Operlya 管理真正的工作",

    items: [
      {
        title: "新档案正在发布",
        desc: "用户正在将他们的简历转变为公开的职业身份。"
      },
      {
        title: "每天都有机会被发布",
        desc: "项目、任务和工作由机会所有者分享。"
      },
      {
        title: "申请正在被积极审核",
        desc: "档案根据真实的技能和经验进行评估。"
      },
      {
        title: "工作正在实时管理",
        desc: "任务、对话和进度在项目内部被跟踪。"
      },
      {
        title: "简历在不断改进",
        desc: "用户通过 ATS 分析和反馈优化他们的简历。"
      },
      {
        title: "档案正在获得曝光度",
        desc: "用户通过他们的公开档案获得浏览量和机会。"
      }
    ],

    ctaPrimary: "创建我的简历",
    ctaSecondary: "探索机遇"
  },

  de: {
    title: "Professionelle nutzen Operlya bereits, um echte Arbeit zu verwalten",

    items: [
      {
        title: "Neue Profile werden veröffentlicht",
        desc: "Benutzer verwandeln ihre Lebensläufe in öffentliche berufliche Identitäten."
      },
      {
        title: "Täglich werden neue Möglichkeiten veröffentlicht",
        desc: "Projekte, Aufgaben und Jobs werden von Chancengebern geteilt."
      },
      {
        title: "Bewerbungen werden aktiv geprüft",
        desc: "Profile werden basierend auf echten Fähigkeiten und Erfahrungen bewertet."
      },
      {
        title: "Arbeit wird in Echtzeit verwaltet",
        desc: "Aufgaben, Gespräche und Fortschritte werden innerhalb von Projekten verfolgt."
      },
      {
        title: "Lebensläufe werden kontinuierlich verbessert",
        desc: "Benutzer optimieren ihre CVs mit ATS-Analyse und Feedback."
      },
      {
        title: "Profile gewinnen an Sichtbarkeit",
        desc: "Benutzer erhalten Aufrufe und Angebote über ihre öffentlichen Profile."
      }
    ],

    ctaPrimary: "Meinen Lebenslauf erstellen",
    ctaSecondary: "Möglichkeiten entdecken"
  },

  pt: {
    title: "Profissionais já estão usando o Operlya para gerenciar trabalho real",

    items: [
      {
        title: "Novos perfis estão sendo publicados",
        desc: "Usuários estão transformando seus currículos em identidades profissionais públicas."
      },
      {
        title: "Oportunidades são publicadas diariamente",
        desc: "Projetos, tarefas e empregos são compartilhados pelos criadores de oportunidades."
      },
      {
        title: "As candidaturas são ativamente revisadas",
        desc: "Os perfis são avaliados com base em habilidades e experiência reais."
      },
      {
        title: "O trabalho é gerenciado em tempo real",
        desc: "Tarefas, conversas e progresso são rastreados dentro dos projetos."
      },
      {
        title: "Os currículos são continuamente melhorados",
        desc: "Usuários otimizam seus CVs com análise e feedback ATS."
      },
      {
        title: "Os perfis estão ganhando visibilidade",
        desc: "Usuários recebem visualizações e oportunidades de seus perfis públicos."
      }
    ],

    ctaPrimary: "Criar meu currículo",
    ctaSecondary: "Explorar oportunidades"
  },

  ja: {
    title: "プロフェッショナルはすでにOperlyaを使用して実際の仕事を管理しています",

    items: [
      {
        title: "新しいプロフィールが公開されています",
        desc: "ユーザーは履歴書を公開されたプロフェッショナルアイデンティティに変えています。"
      },
      {
        title: "毎日機会が投稿されています",
        desc: "プロジェクト、タスク、仕事が機会の所有者によって共有されています。"
      },
      {
        title: "応募は積極的にレビューされています",
        desc: "プロフィールは実際のスキルと経験に基づいて評価されています。"
      },
      {
        title: "仕事はリアルタイムで管理されています",
        desc: "タスク、会話、進捗はプロジェクト内で追跡されています。"
      },
      {
        title: "履歴書は継続的に改善されています",
        desc: "ユーザーはATS分析とフィードバックで履歴書を最適化しています。"
      },
      {
        title: "プロフィールの可視性が高まっています",
        desc: "ユーザーは公開プロフィールから閲覧数や機会を得ています。"
      }
    ],

    ctaPrimary: "履歴書を作成",
    ctaSecondary: "機会を探す"
  },

  ru: {
    title: "Профессионалы уже используют Operlya для управления реальной работой",

    items: [
      {
        title: "Публикуются новые профили",
        desc: "Пользователи превращают свои резюме в публичные профессиональные идентичности."
      },
      {
        title: "Возможности публикуются ежедневно",
        desc: "Проекты, задачи и вакансии публикуются владельцами возможностей."
      },
      {
        title: "Заявки активно рассматриваются",
        desc: "Профили оцениваются на основе реальных навыков и опыта."
      },
      {
        title: "Работа управляется в реальном времени",
        desc: "Задачи, разговоры и прогресс отслеживаются внутри проектов."
      },
      {
        title: "Резюме постоянно улучшаются",
        desc: "Пользователи оптимизируют свои резюме с помощью анализа ATS и обратной связи."
      },
      {
        title: "Профили получают видимость",
        desc: "Пользователи получают просмотры и предложения из своих публичных профилей."
      }
    ],

    ctaPrimary: "Создать резюме",
    ctaSecondary: "Изучить возможности"
  }
};
function translateFomo(lang) {
  const t = fomoTranslations[lang] || fomoTranslations.en;

  const section = document.querySelector(".operlya-fomo");
  if (!section) return;

  const title = section.querySelector("h2");
  if (title) title.textContent = t.title;

  const items = section.querySelectorAll(".fomo-item");

  items.forEach((item, index) => {
    const data = t.items[index];
    if (!data) return;

    const strong = item.querySelector("strong");
    const desc = item.querySelector("p");

    if (strong) strong.textContent = data.title;
    if (desc) desc.textContent = data.desc;
  });

  const btnPrimary = section.querySelector(".btn-primary");
  if (btnPrimary) {
    btnPrimary.innerHTML = `<i class="ri-user-3-line"></i> ${t.ctaPrimary}`;
  }

  const btnSecondary = section.querySelector(".btn-secondary");
  if (btnSecondary) {
    btnSecondary.innerHTML = `<i class="ri-compass-discover-line"></i> ${t.ctaSecondary}`;
  }
}

const finalCtaTranslations = {
  en: {
    title: "Stop scrolling. Start building your future.",
    desc: "Build your profile, find opportunities, and manage your work — all in one place.",
    button: "Start My Career System"
  },

  fr: {
    title: "Arrêtez de scroller. Commencez à construire votre avenir.",
    desc: "Créez votre profil, trouvez des opportunités et gérez votre travail — tout en un seul endroit.",
    button: "Commencer mon système de carrière"
  },

  ar: {
    title: "توقف عن التمرير. ابدأ في بناء مستقبلك.",
    desc: "أنشئ ملفك الشخصي، اعثر على الفرص، وأدر عملك — في مكان واحد.",
    button: "ابدأ نظام مسيرتي المهنية"
  },

    es: {
    title: "Deja de desplazarte. Comienza a construir tu futuro.",
    desc: "Crea tu perfil, encuentra oportunidades y gestiona tu trabajo — todo en un solo lugar.",
    button: "Iniciar mi sistema de carrera"
  },

  zh: {
    title: "停止滚动。开始建设你的未来。",
    desc: "创建你的档案，寻找机会，并管理工作 — 一切都在一个地方。",
    button: "启动我的职业系统"
  },

  de: {
    title: "Hören Sie auf zu scrollen. Beginnen Sie, Ihre Zukunft aufzubauen.",
    desc: "Erstellen Sie Ihr Profil, finden Sie Chancen und verwalten Sie Ihre Arbeit — alles an einem Ort.",
    button: "Mein Karrieresystem starten"
  },

  pt: {
    title: "Pare de rolar. Comece a construir seu futuro.",
    desc: "Crie seu perfil, encontre oportunidades e gerencie seu trabalho — tudo em um só lugar.",
    button: "Iniciar meu sistema de carreira"
  },

  ja: {
    title: "スクロールするのはやめて。未来の構築を始めましょう。",
    desc: "プロフィールを作成し、機会を見つけ、仕事を管理する — すべて一か所で。",
    button: "キャリアシステムを始める"
  },

  ru: {
    title: "Хватит листать. Начните строить свое будущее.",
    desc: "Создайте профиль, найдите возможности и управляйте своей работой — всё в одном месте.",
    button: "Запустить мою карьерную систему"
  }
};
function translateFinalCta(lang) {
  const t = finalCtaTranslations[lang] || finalCtaTranslations.en;

  const section = document.querySelector(".operlya-final-cta");
  if (!section) return;

  const title = section.querySelector("h2");
  if (title) title.textContent = t.title;

  const desc = section.querySelector("p");
  if (desc) desc.textContent = t.desc;

  const btn = section.querySelector(".btn-primary.big");
  if (btn) {
    btn.innerHTML = `${t.button}`;
  }
}

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

const externalTasksTranslations = {
  en: {
    noOpportunities: "No external opportunities",
    noOpportunitiesDesc: "New imported opportunities will appear here",

    loadMore: "Load more",

    untitled: "Untitled",
    openOpportunity: "Open Opportunity",

    externalSource: "External Source",
    external: "External"
  },

  fr: {
    noOpportunities: "Aucune opportunité externe",
    noOpportunitiesDesc: "Les nouvelles opportunités importées apparaîtront ici",

    loadMore: "Charger plus",

    untitled: "Sans titre",
    openOpportunity: "Ouvrir l’opportunité",

    externalSource: "Source externe",
    external: "Externe"
  },

  ar: {
    noOpportunities: "لا توجد فرص خارجية",
    noOpportunitiesDesc: "ستظهر الفرص المستوردة الجديدة هنا",

    loadMore: "تحميل المزيد",

    untitled: "بدون عنوان",
    openOpportunity: "فتح الفرصة",

    externalSource: "مصدر خارجي",
    external: "خارجي"
  },

  es: {
    noOpportunities: "No hay oportunidades externas",
    noOpportunitiesDesc: "Las nuevas oportunidades importadas aparecerán aquí",

    loadMore: "Cargar más",

    untitled: "Sin título",
    openOpportunity: "Abrir oportunidad",

    externalSource: "Fuente externa",
    external: "Externo"
  },

  de: {
    noOpportunities: "Keine externen Möglichkeiten",
    noOpportunitiesDesc: "Neue importierte Möglichkeiten erscheinen hier",

    loadMore: "Mehr laden",

    untitled: "Ohne Titel",
    openOpportunity: "Möglichkeit öffnen",

    externalSource: "Externe Quelle",
    external: "Extern"
  },

  pt: {
    noOpportunities: "Nenhuma oportunidade externa",
    noOpportunitiesDesc: "Novas oportunidades importadas aparecerão aqui",

    loadMore: "Carregar mais",

    untitled: "Sem título",
    openOpportunity: "Abrir oportunidade",

    externalSource: "Fonte externa",
    external: "Externo"
  },

  zh: {
    noOpportunities: "暂无外部机会",
    noOpportunitiesDesc: "新的导入机会将显示在这里",

    loadMore: "加载更多",

    untitled: "无标题",
    openOpportunity: "打开机会",

    externalSource: "外部来源",
    external: "外部"
  },

  ja: {
    noOpportunities: "外部機会はありません",
    noOpportunitiesDesc: "新しくインポートされた機会がここに表示されます",

    loadMore: "さらに読み込む",

    untitled: "無題",
    openOpportunity: "機会を開く",

    externalSource: "外部ソース",
    external: "外部"
  },

  ru: {
    noOpportunities: "Нет внешних возможностей",
    noOpportunitiesDesc: "Новые импортированные возможности появятся здесь",

    loadMore: "Загрузить ещё",

    untitled: "Без названия",
    openOpportunity: "Открыть возможность",

    externalSource: "Внешний источник",
    external: "Внешний"
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