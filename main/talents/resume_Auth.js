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

async function hasReward(userId, rewardId) {
  const ref = doc(db, "users", userId, "rewards", rewardId);
  const snap = await getDoc(ref);
  return snap.exists();
}

async function updateUserSection(user) {
  const selectedLang = getCurrentLang();
  const t = cvbUserInfoTranslations[selectedLang] || cvbUserInfoTranslations['en'];
  const tUser = UserForm_translations[selectedLang] || UserForm_translations['en'];
  const p = cvbTopBarTranslations[selectedLang] || cvbTopBarTranslations['en'];
  
  const promoBar = document.querySelector('.cvb-top-promo-bar');
  if (user && promoBar) {
    promoBar.style.display = 'none';
  } else if (!user && promoBar) {
    promoBar.style.display = 'flex';
  }
  
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

      try {
        const infoBox = document.getElementById("exclusive-CoinsOnFirstSave");
        if (infoBox) {
          const alreadyClaimed = await hasReward(user.uid, "FIRST_CV_SAVE");
          if (alreadyClaimed) {
            infoBox.style.display = "none";
          } else {
            infoBox.style.display = "flex";
            infoBox.style.opacity = "0";
            infoBox.style.transform = "translateY(-5px)";
            setTimeout(() => {
              infoBox.style.transition = "opacity 0.4s ease, transform 0.4s ease";
              infoBox.style.opacity = "1";
              infoBox.style.transform = "translateY(0)";
            }, 50);
          }
        }
      } catch (e) {
        console.error("Error checking user's CV existence:", e);
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

// =============================== Mobile App Navigation ================================

document.addEventListener("DOMContentLoaded", () => {
  const navButtons = document.querySelectorAll(".cvb-mobile-nav button");
  const sections = ["#cvb-fields", "#cvb-joboffer", "#cvb-theme"];

  function showSection(target) {
    sections.forEach(id => {
      document.querySelector(id).classList.add("cvb-hidden");
    });
    document.querySelector(target).classList.remove("cvb-hidden");

    navButtons.forEach(btn => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`.cvb-mobile-nav button[data-target="${target}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }

  if (window.innerWidth <= 768) {
    showSection("#cvb-fields");
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sections.forEach(id => document.querySelector(id).classList.remove("cvb-hidden"));
      navButtons.forEach(btn => btn.classList.remove("active"));
    } else {
      const hasActive = document.querySelector(".cvb-mobile-nav button.active");
      if (!hasActive) {
        showSection("#cvb-fields");
      }
    }
  });

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      showSection(btn.getAttribute("data-target"));
    });
  });
});

// =================================== App Starting =====================================

window.onload = () => {
  cvbAddEducationSection();
  cvbAddExperienceSection();
  cvbAddInterest();
  cvbAddCertSection();
  cvbAddSkill('tech');
  cvbAddSkill('soft');

  refreshCVProgress({
    personal: personalData,
    experience: expRows,
    education: eduRows,
    certifications: certRows,
    skills: skillRows,
    languages: langRows,
    interests: interestRows
  });
};

function cvbResetAllForms() {
  educationCount = 0;
  experienceCount = 0;
  skillCounters = { tech: 0, soft: 0 };
  certCount = 0;
  interestCount = 0;

  document.getElementById('cvb-exp-tabs').innerHTML = '';
  document.getElementById('cvb-exp-content').innerHTML = '';
  document.getElementById('cvb-edu-tabs').innerHTML = '';
  document.getElementById('cvb-edu-content').innerHTML = '';
  document.getElementById('cvb-cert-tabs').innerHTML = '';
  document.getElementById('cvb-cert-content').innerHTML = '';
  document.getElementById('cvb-tech-skills-list').innerHTML = '';
  document.getElementById('cvb-soft-skills-list').innerHTML = '';
  document.getElementById('cvb-interests-list').innerHTML = '';

  const photoInput = document.getElementById('cvb-photo');
  if (photoInput) photoInput.value = '';
  const photoLink = document.getElementById('cvb-photolink');
  if (photoLink) photoLink.value = '';
  const preview = document.getElementById('cvb-photo-preview');
  if (preview) preview.textContent = 'No photo selected';

  document.querySelectorAll('#cvb-fields input[type="text"], #cvb-fields input[type="date"], #cvb-fields textarea')
    .forEach(el => el.value = '');

  document.querySelectorAll('#cvb-fields input[type="checkbox"], #cvb-fields input[type="radio"]')
    .forEach(el => el.checked = false);

  document.querySelectorAll('#cvb-fields input[type="checkbox"]').forEach(cb => {
    cb.style.outline = "";
    cb.style.backgroundColor = "";
  });

  const loadingEl = document.getElementById("cvb-ai-loading");
  const btn = document.getElementById("AnalyzeJobOfferMatch");
  if (loadingEl) loadingEl.style.display = "none";
  if (btn) btn.disabled = false;

  cvbAddEducationSection();
  cvbAddExperienceSection();
  cvbAddInterest();
  cvbAddCertSection();
  cvbAddSkill('tech');
  cvbAddSkill('soft');

  refreshCVProgress();
}
document.getElementById("cvbResetAllForms")?.addEventListener("click", cvbResetAllForms);

document.getElementById('cvb-photo').addEventListener('change', function (e) {
    const preview = document.getElementById('cvb-photo-preview');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const base64String = event.target.result;
        document.getElementById('cvb-photolink').value = base64String;
        preview.innerHTML = `<img src="${base64String}" alt="Profile Preview" style="max-width: 100px; max-height: 100px; border-radius: 5px;" />`;
      };
      reader.readAsDataURL(file);
    }
});
document.getElementById('cvb-photolink').addEventListener('input', function (e) {
    let link = e.target.value.trim();
    const preview = document.getElementById('cvb-photo-preview');
    const driveMatch = link.match(/\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
      const fileId = driveMatch[1] || driveMatch[2];
      link = `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    if (link) {
      preview.innerHTML = `<img src="${link}" alt="Profile Preview" style="max-width: 100px; max-height: 100px; border-radius: 5px;" />`;
    } else {
      preview.textContent = 'No photo selected';
    }
});

// =================================== CV Excel Management ===================================

function cvbImportFromExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  cvbResetAllForms();
  
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // --- PERSONAL INFO ---
    const personalSheet = workbook.Sheets["Personal"];
    if (personalSheet) {
      const [info] = XLSX.utils.sheet_to_json(personalSheet);
      if (info) {
        document.getElementById("cvb-fullName").value = info["Full Name"] || "";
        document.getElementById("cvb-phone").value = info["Phone"] || "";
        document.getElementById("cvb-email").value = info["Email"] || "";
        document.getElementById("cvb-linkedin").value = info["LinkedIn"] || "";
        document.getElementById("cvb-address").value = info["Address"] || "";
        document.getElementById("cvb-speciality").value = info["Speciality"] || "";
        const photoLink = info["Picture"];
        if (photoLink) {
          const photoInput = document.getElementById("cvb-photolink");
          const preview = document.getElementById("cvb-photo-preview");

          photoInput.value = photoLink.trim();

          preview.innerHTML = `<img src="${photoLink}" alt="Profile Preview" style="max-width: 100px; max-height: 100px; border-radius: 5px;" />`;
        }
      }
    }

    // --- SUMMARY ---
    const summarySheet = workbook.Sheets["Summary"];
    if (summarySheet) {
      const [summaryRow] = XLSX.utils.sheet_to_json(summarySheet);
      if (summaryRow) {
        document.getElementById("cvb-summary-text").value = summaryRow["Summary"] || "";
      }
    }

    // Handle Education
    const eduSheet = workbook.Sheets["Education"];
    if (eduSheet) {
      const eduData = XLSX.utils.sheet_to_json(eduSheet);
      const eduPanes = document.querySelectorAll(`#cvb-edu-content .cvb-tab-pane`);
      let used = 0;
	  
      eduData.sort((a, b) => {
        const dateA = new Date(`${a["Year (End)"]}-${a["Month (End)"] || 1}-${a["Day (End)"] || 1}`);
        const dateB = new Date(`${b["Year (End)"]}-${b["Month (End)"] || 1}-${b["Day (End)"] || 1}`);
        return dateB - dateA; // Descending
      });
      eduData.forEach(row => {
        let pane;
        if (used < eduPanes.length) {
          const inputs = Array.from(eduPanes[used].querySelectorAll('input')).filter(i => i.type !== "checkbox");
		  const isEmpty = inputs.every(input => input.value.trim() === "");
          if (isEmpty) pane = eduPanes[used];
        }
        if (!pane) {
          cvbAddEducationSection();
          pane = document.querySelector(`#cvb-edu-content .cvb-tab-pane:last-child`);
        }

        const inputs = Array.from(pane.querySelectorAll('input')).filter(i => i.type !== "checkbox");
        if (inputs.length >= 6) {
          const start = `${row["Year (Start)"]?.toString().padStart(4, '0')}-${row["Month (Start)"]?.toString().padStart(2, '0')}-${row["Day (Start)"]?.toString().padStart(2, '0')}`;
          const end = `${row["Year (End)"]?.toString().padStart(4, '0')}-${row["Month (End)"]?.toString().padStart(2, '0')}-${row["Day (End)"]?.toString().padStart(2, '0')}`;

          inputs[0].value = row["Degree"] || "";
          inputs[1].value = row["Institution"] || "";
          inputs[2].value = start || "";
          inputs[3].value = end || "";
          inputs[4].value = row["Location"] || "";
          inputs[5].value = row["Honors"] || "";
          cvbUpdateTabTitle(pane.id, inputs[0].value);
        }
        used++;
      });
    }
    cvbActivateFirstTab("cvb-edu-tabs", "cvb-edu-content");

    // Handle Experience
    const expSheet = workbook.Sheets["Experience"];
    if (expSheet) {
      const expData = XLSX.utils.sheet_to_json(expSheet);
      const expPanes = document.querySelectorAll(`#cvb-exp-content .cvb-tab-pane`);
      let used = 0;
	  
      expData.sort((a, b) => {
        const dateA = new Date(`${a["Year (End)"]}-${a["Month (End)"] || 1}-${a["Day (End)"] || 1}`);
        const dateB = new Date(`${b["Year (End)"]}-${b["Month (End)"] || 1}-${b["Day (End)"] || 1}`);
        return dateB - dateA;
      });
      expData.forEach(row => {
        let pane;
        if (used < expPanes.length) {
          const inputs = Array.from(expPanes[used].querySelectorAll('input')).filter(i => i.type !== "checkbox");
          const textarea = expPanes[used].querySelector('textarea');
          const isEmpty = inputs.every(i => i.value.trim() === "") &&
                (!textarea || textarea.value.trim() === "");
          if (isEmpty) pane = expPanes[used];
        }
        if (!pane) {
          cvbAddExperienceSection();
          pane = document.querySelector(`#cvb-exp-content .cvb-tab-pane:last-child`);
        }

        const inputs = Array.from(pane.querySelectorAll('input')).filter(i => i.type !== "checkbox");
        const textarea = pane.querySelector('textarea');
        if (inputs.length >= 6) {
          const start = `${row["Year (Start)"]?.toString().padStart(4, '0')}-${row["Month (Start)"]?.toString().padStart(2, '0')}-${row["Day (Start)"]?.toString().padStart(2, '0')}`;
          const end = `${row["Year (End)"]?.toString().padStart(4, '0')}-${row["Month (End)"]?.toString().padStart(2, '0')}-${row["Day (End)"]?.toString().padStart(2, '0')}`;

          inputs[0].value = row["Job Title"] || "";
          inputs[1].value = row["Company"] || "";
          inputs[2].value = start || "";
          inputs[3].value = end || "";
          inputs[4].value = row["Location"] || "";
          inputs[5].value = row["Type"] || "";
          if (textarea) textarea.value = row["Responsibilities"] || "";
          cvbUpdateExperienceTabTitle(pane.id, inputs[0].value);
        }
        used++;
      });
    }
    cvbActivateFirstTab("cvb-exp-tabs", "cvb-exp-content");

    // --- CERTIFICATIONS ---
    const certSheet = workbook.Sheets["Certifications"];
    if (certSheet) {
      const certData = XLSX.utils.sheet_to_json(certSheet);
      certData.sort((a, b) => {
        const dateA = new Date(`${a["Year (End)"]}-${a["Month (End)"] || 1}-${a["Day (End)"] || 1}`);
        const dateB = new Date(`${b["Year (End)"]}-${b["Month (End)"] || 1}-${b["Day (End)"] || 1}`);
        return dateB - dateA;
      });
      certData.forEach(row => {
        let pane;
        const certPanes = document.querySelectorAll(`#cvb-cert-content .cvb-tab-pane`);
        let reused = false;

        for (const p of certPanes) {
          const inputs = Array.from(p.querySelectorAll('input')).filter(i => i.type !== "checkbox");
          const isEmpty = inputs.every(i => i.value.trim() === "");
          if (isEmpty) {
            pane = p;
            reused = true;
            break;
          }
        }

        if (!reused) {
          cvbAddCertSection();
          pane = document.querySelector(`#cvb-cert-content .cvb-tab-pane:last-child`);
        }
        const inputs = pane.querySelectorAll('input');
        const start = `${row["Year (Start)"]?.toString().padStart(4, '0')}-${row["Month (Start)"]?.toString().padStart(2, '0')}-${row["Day (Start)"]?.toString().padStart(2, '0')}`;
        const end = `${row["Year (End)"]?.toString().padStart(4, '0')}-${row["Month (End)"]?.toString().padStart(2, '0')}-${row["Day (End)"]?.toString().padStart(2, '0')}`;
        inputs[0].value = row["Description"] || "";
        inputs[1].value = row["Institution"] || "";
        inputs[2].value = row["Certificate ID"] || "";
        inputs[3].value = start || "";
        inputs[4].value = end || "";
        inputs[5].value = row["Location"] || "";
        cvbUpdateCertTabTitle(pane.id, inputs[0].value);
      });
    }
    cvbActivateFirstTab("cvb-cert-tabs", "cvb-cert-content");

    // --- SKILLS ---
    const skillsSheet = workbook.Sheets["Skills"];
    if (skillsSheet) {
      const skills = XLSX.utils.sheet_to_json(skillsSheet);
      skills.forEach((row, index) => {
      let container = document.getElementById("cvb-tech-skills-list");
      let items = container.querySelectorAll(".navCard-requiresGroup");
      let item;

      if (index < items.length) {
        const input = items[index].querySelector('input[type="text"]');
        const isEmpty = input && input.value.trim() === "";
        if (isEmpty) item = items[index];
      }

      if (!item) {
        cvbAddSkill('tech');
        container = document.getElementById("cvb-tech-skills-list");
        item = container.lastElementChild;
      }

      item.querySelector('input[type="text"]').value = row["Skills"] || "";
      const radios = item.querySelectorAll('input[type="radio"]');
      radios.forEach(r => { if (parseInt(r.value) === row["Score"]) r.checked = true; });
    });
    }
    
    // --- INTERESTS ---
    const interestSheet = workbook.Sheets["Interest"];
    if (interestSheet) {
      const interestData = XLSX.utils.sheet_to_json(interestSheet, { header: 1 });

      for (let i = 1; i < interestData.length; i++) {
        const row = interestData[i];
        row.forEach(cell => {
          if (cell && typeof cell === 'string') {
            const list = document.querySelectorAll("#cvb-interests-list input");
            let input = Array.from(list).find(i => i.value.trim() === "");

            if (!input) {
              cvbAddInterest();
              const updatedList = document.querySelectorAll("#cvb-interests-list input");
              input = updatedList[updatedList.length - 1];
            }

            if (input) input.value = cell.trim(); // Only one assignment
          }
        });
      }
    }

    // --- LANGUAGES ---
	const langSheet = workbook.Sheets["Languages"];
    if (langSheet) {
      const langs = XLSX.utils.sheet_to_json(langSheet);
      langs.forEach(row => {
        const container = document.getElementById("cvb-soft-skills-list");
        let item = Array.from(container.querySelectorAll('.navCard-requiresGroup')).find(i => {
          const input = i.querySelector('input[type="text"]');
          return input && input.value.trim() === "";
        });

        if (!item) {
          cvbAddSkill('soft');
          const items = container.querySelectorAll('.navCard-requiresGroup');
          item = items[items.length - 1];
        }

        const input = item.querySelector('input[type="text"]');
        if (input) input.value = row["Language"] || "";

        const radios = item.querySelectorAll('input[type="radio"]');
        radios.forEach(r => {
          if (parseInt(r.value) === row["Score"]) r.checked = true;
        });
      });
    }
  };
  reader.readAsArrayBuffer(file);
}
document.getElementById("cvbImportFromExcel")?.addEventListener("change", cvbImportFromExcel);

function cvbExportTemplate() {
  const wb = XLSX.utils.book_new();

  // --- PERSONAL INFO ---
  const personalHeaders = [{
    "Full Name": "",
    "Phone": "",
    "Email": "",
    "LinkedIn": "",
    "Address": "",
    "Speciality": "",
    "Picture": ""
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(personalHeaders), "Personal");

  // --- SUMMARY ---
  const summaryHeaders = [{ "Summary": "" }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryHeaders), "Summary");

  // --- EDUCATION ---
  const eduHeaders = [{
    "Degree": "",
    "Institution": "",
    "Year (Start)": "",
    "Month (Start)": "",
    "Day (Start)": "",
    "Year (End)": "",
    "Month (End)": "",
    "Day (End)": "",
    "Location": "",
    "Honors": ""
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eduHeaders), "Education");

  // --- EXPERIENCE ---
  const expHeaders = [{
    "Job Title": "",
    "Company": "",
    "Year (Start)": "",
    "Month (Start)": "",
    "Day (Start)": "",
    "Year (End)": "",
    "Month (End)": "",
    "Day (End)": "",
    "Location": "",
    "Type": "",
    "Responsibilities": ""
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expHeaders), "Experience");

  // --- CERTIFICATIONS ---
  const certHeaders = [{
    "Description": "",
    "Institution": "",
    "Certificate ID": "",
    "Year (Start)": "",
    "Month (Start)": "",
    "Day (Start)": "",
    "Year (End)": "",
    "Month (End)": "",
    "Day (End)": "",
    "Location": ""
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(certHeaders), "Certifications");

  // --- SKILLS ---
  const skillHeaders = [{ "Skills": "", "Score": "" }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(skillHeaders), "Skills");

  // --- INTERESTS ---
  const interestHeaders = [["Interest"]];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(interestHeaders), "Interest");

  // --- LANGUAGES ---
  const langHeaders = [{ "Language": "", "Score": "" }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(langHeaders), "Languages");

  // --- DOWNLOAD ---
  XLSX.writeFile(wb, "CV_Template.xlsx");
}
document.getElementById("cvbExportTemplate")?.addEventListener("click", cvbExportTemplate);

function cvbExportToExcel() {
  const wb = XLSX.utils.book_new();

  // --- PERSONAL INFO ---
  const link = document.getElementById("cvb-photolink").value.trim();
  const pictureValue = (link && !link.startsWith("data:image")) ? link : "";
  const personalSheet = [{
    "Full Name": document.getElementById("cvb-fullName").value || "",
    "Phone": document.getElementById("cvb-phone").value || "",
    "Email": document.getElementById("cvb-email").value || "",
    "LinkedIn": document.getElementById("cvb-linkedin").value || "",
    "Address": document.getElementById("cvb-address").value || "",
    "Speciality": document.getElementById("cvb-speciality").value || "",
  	"Picture": pictureValue
  }];
  
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(personalSheet), "Personal");

  // --- SUMMARY ---
  const summarySheet = [{
    "Summary": document.getElementById("cvb-summary-text").value || ""
  }];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summarySheet), "Summary");

  // --- EDUCATION ---
  const eduRows = [];
  document.querySelectorAll("#cvb-edu-content .cvb-tab-pane").forEach(pane => {
    const inputs = pane.querySelectorAll('input');
    if (Array.from(inputs).some(i => i.value.trim() !== "")) {
      const [degree, institution, startDate, endDate, location, honors] = [...inputs].map(i => i.value);
      const [sy, sm = "01", sd = "01"] = (startDate || "").split("-");
      const [ey, em = "01", ed = "01"] = (endDate || "").split("-");
      eduRows.push({
        "Degree": degree, "Institution": institution,
        "Year (Start)": sy, "Month (Start)": sm, "Day (Start)": sd,
        "Year (End)": ey, "Month (End)": em, "Day (End)": ed,
        "Location": location, "Honors": honors
      });
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(eduRows), "Education");

  // --- EXPERIENCE ---
  const expRows = [];
  document.querySelectorAll("#cvb-exp-content .cvb-tab-pane").forEach(pane => {
    const inputs = pane.querySelectorAll('input');
    const textarea = pane.querySelector('textarea');
    if (Array.from(inputs).some(i => i.value.trim() !== "") || (textarea && textarea.value.trim() !== "")) {
      const [title, company, startDate, endDate, location, type] = [...inputs].map(i => i.value);
      const [sy, sm = "01", sd = "01"] = (startDate || "").split("-");
      const [ey, em = "01", ed = "01"] = (endDate || "").split("-");
      expRows.push({
        "Job Title": title, "Company": company,
        "Year (Start)": sy, "Month (Start)": sm, "Day (Start)": sd,
        "Year (End)": ey, "Month (End)": em, "Day (End)": ed,
        "Location": location, "Type": type,
        "Responsibilities": textarea?.value || ""
      });
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expRows), "Experience");

  // --- CERTIFICATIONS ---
  const certRows = [];
  document.querySelectorAll("#cvb-cert-content .cvb-tab-pane").forEach(pane => {
    const inputs = pane.querySelectorAll('input');
    if (Array.from(inputs).some(i => i.value.trim() !== "")) {
      const [desc, inst, certId, startDate, endDate, location] = [...inputs].map(i => i.value);
      const [sy, sm = "01", sd = "01"] = (startDate || "").split("-");
      const [ey, em = "01", ed = "01"] = (endDate || "").split("-");
      certRows.push({
        "Description": desc, "Institution": inst, "Certificate ID": certId,
        "Year (Start)": sy, "Month (Start)": sm, "Day (Start)": sd,
        "Year (End)": ey, "Month (End)": em, "Day (End)": ed,
        "Location": location
      });
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(certRows), "Certifications");

  // --- SKILLS ---
  const skillRows = [];
  document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup").forEach(item => {
    const name = item.querySelector('input[type="text"]')?.value.trim();
    const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
    if (name) {
      skillRows.push({ "Skills": name, "Score": score || 1 });
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(skillRows), "Skills");

  // --- INTERESTS ---
  const interests = [];
  const textInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const checkboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
  textInputs.forEach((input, i) => {
    if (checkboxes[i]?.checked && input.value.trim()) {
      interests.push([input.value.trim()]);
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Interest"], ...interests]), "Interest");

  // --- LANGUAGES ---
  const langRows = [];
  document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup").forEach(item => {
    const name = item.querySelector('input[type="text"]')?.value.trim();
    const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
    if (name) {
      langRows.push({ "Language": name, "Score": score || 1 });
    }
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(langRows), "Languages");

  // --- DOWNLOAD ---
  const fullName = document.getElementById("cvb-fullName")?.value || "CV";
  XLSX.writeFile(wb, `${fullName.replace(/\s+/g, "_")}_CV.xlsx`);
}
["cvbExportToExcel", "cvbExportToExcelResume"].forEach(id => {
  document.getElementById(id)?.addEventListener("click", cvbExportToExcel);
});

// ================================== CV Sections Navigation ==============================

function cvbSwitchTab(tabId, prefix) {
  const buttons = document.querySelectorAll(`#${prefix}-tabs .navCard-button`);
  const panes = document.querySelectorAll(`#${prefix}-content .cvb-tab-pane`);

  buttons.forEach(btn => btn.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));
  const activePane = document.getElementById(tabId);
  if (activePane) activePane.classList.add('active');
  const activeButton = document.querySelector(`#${prefix}-tabs .navCard-button[data-tab-id="${tabId}"]`);
  if (activeButton) activeButton.classList.add('active');
}

function cvbActivateFirstTab(tabsContainerId, contentContainerId) {
  const tabButtons = document.querySelectorAll(`#${tabsContainerId} .navCard-button`);
  const tabPanes = document.querySelectorAll(`#${contentContainerId} .cvb-tab-pane`);

  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabPanes.forEach(pane => pane.classList.remove("active"));
  if (tabButtons.length > 0) tabButtons[0].classList.add("active");
  if (tabPanes.length > 0) tabPanes[0].classList.add("active");
}

document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".horizontal-navigator button");
    const tabPages = document.querySelectorAll(".horizontal-navPage");
    function showTab(targetId) {
      tabPages.forEach(page => {
        page.style.display = (page.id === targetId.slice(1)) ? "block" : "none";
      });
      tabButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.target === targetId);
      });
    }
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");
        showTab(target);
      });
    });
    showTab(tabButtons[0].dataset.target);
});

// ================================= CV Sections Progress =================================

function refreshCVProgress() {
  const cvData = {};

  // --- Personal ---
  cvData.personal = {
    fullName: document.getElementById("cvb-fullName")?.value || "",
    phone: document.getElementById("cvb-phone")?.value || "",
    email: document.getElementById("cvb-email")?.value || "",
    linkedin: document.getElementById("cvb-linkedin")?.value || "",
    address: document.getElementById("cvb-address")?.value || "",
    speciality: document.getElementById("cvb-speciality")?.value || "",
    picture: document.getElementById("cvb-photolink")?.value || "",
    summary: document.getElementById("cvb-summary-text")?.value || ""
  };

  // --- Experience ---
  cvData.experience = [];
  document.querySelectorAll("#cvb-exp-content .cvb-tab-pane").forEach(pane => {
    const checkbox = pane.querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      const inputs = pane.querySelectorAll("input");
      const textarea = pane.querySelector("textarea");
      if (inputs.length >= 6) {
        cvData.experience.push({
          title: inputs[0].value,
          company: inputs[1].value,
          startDate: inputs[2].value,
          endDate: inputs[3].value,
          location: inputs[4].value,
          type: inputs[5].value,
          responsibilities: textarea?.value || ""
        });
      }
    }
  });

  // --- Education ---
  cvData.education = [];
  document.querySelectorAll("#cvb-edu-content .cvb-tab-pane").forEach(pane => {
    const checkbox = pane.querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      const inputs = pane.querySelectorAll("input");
      if (inputs.length >= 6) {
        cvData.education.push({
          degree: inputs[0].value,
          institution: inputs[1].value,
          startDate: inputs[2].value,
          endDate: inputs[3].value,
          location: inputs[4].value,
          honors: inputs[5].value
        });
      }
    }
  });

  // --- Certifications ---
  cvData.certifications = [];
  document.querySelectorAll("#cvb-cert-content .cvb-tab-pane").forEach(pane => {
    const checkbox = pane.querySelector("input[type='checkbox']");
    if (checkbox && checkbox.checked) {
      const inputs = pane.querySelectorAll("input");
      if (inputs.length >= 6) {
        cvData.certifications.push({
          description: inputs[0].value,
          institution: inputs[1].value,
          certId: inputs[2].value,
          startDate: inputs[3].value,
          endDate: inputs[4].value,
          location: inputs[5].value
        });
      }
    }
  });

  // --- Technical Skills ---
  cvData.skills = [];
  document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup").forEach(item => {
    const name = item.querySelector("input[type='text']")?.value;
    const checkbox = item.querySelector("input[type='checkbox']");
    if (checkbox?.checked && name && name.trim() !== "") {
      cvData.skills.push({ name: name.trim() });
    }
  });

  // --- Languages ---
  cvData.languages = [];
  document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup").forEach(item => {
    const name = item.querySelector("input[type='text']")?.value;
    const checkbox = item.querySelector("input[type='checkbox']");
    if (checkbox?.checked && name && name.trim() !== "") {
      cvData.languages.push({ name: name.trim() });
    }
  });

  // --- Interests ---
  cvData.interests = [];
  document.querySelectorAll("#cvb-interests-list .navCard-requiresGroup").forEach(item => {
    const textInput = item.querySelector("input[type='text']");
    const checkbox = item.querySelector("input[type='checkbox']");
    if (textInput && checkbox && checkbox.checked && textInput.value.trim()) {
      cvData.interests.push(textInput.value.trim());
    }
  });

  // --- Progress Steps ---
  const steps = [
    { key: 'personal', min: 1 },
    { key: 'experience', min: 2 },
    { key: 'education', min: 1 },
    { key: 'certifications', min: 2 },
    { key: 'skills', min: 5 },
    { key: 'languages', min: 2 },
    { key: 'interests', min: 1 },
  ];

  steps.forEach((step, index) => {
    const stepEl = document.querySelector(`#progressBar .step:nth-child(${index + 1})`);
    let count = 0;

    switch (step.key) {
      case 'personal':
        const personal = cvData.personal || {};
        const requiredFields = ['fullName', 'phone', 'email', 'address', 'speciality', 'summary'];
        const allFilled = requiredFields.every(key => personal[key] && personal[key].trim() !== "");
        count = allFilled ? 1 : 0;
        break;

      case 'experience':
        count = (cvData.experience || []).filter(exp =>
          ['title', 'company', 'startDate', 'endDate', 'location', 'type']
            .every(key => exp[key] && exp[key].trim() !== "")
        ).length;
        break;

      case 'education':
        count = (cvData.education || []).filter(edu =>
          ['degree', 'institution', 'startDate', 'endDate', 'location']
            .every(key => edu[key] && edu[key].trim() !== "")
        ).length;
        break;

      case 'certifications':
        count = (cvData.certifications || []).filter(cert =>
          ['description', 'institution', 'certId', 'startDate', 'endDate']
            .every(key => cert[key] && cert[key].trim() !== "")
        ).length;
        break;

      case 'skills':
        count = (cvData.skills || []).length;
        break;

      case 'languages':
        count = (cvData.languages || []).length;
        break;

      case 'interests':
        count = (cvData.interests || []).length;
        break;
    }

    if (count >= step.min) {
      stepEl.classList.add('completed');
      stepEl.classList.remove('incomplete');
    } else {
      stepEl.classList.add('incomplete');
      stepEl.classList.remove('completed');
    }
  });

  // --- Global completion check ---
  const progressContainer = document.getElementById("progressBar");
  const allCompleted = steps.every((step, index) => {
    const stepEl = document.querySelector(`#progressBar .step:nth-child(${index + 1})`);
    return stepEl.classList.contains('completed');
  });

  const fullWrapper = document.querySelector(".progressBar-containerAll");

  if (allCompleted) {
    progressContainer.classList.add("all-completed");
    fullWrapper.classList.add("all-completed");
  } else {
    progressContainer.classList.remove("all-completed");
    fullWrapper.classList.remove("all-completed");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const personalFields = [
    "cvb-fullName",
    "cvb-phone",
    "cvb-email",
    "cvb-linkedin",
    "cvb-address",
    "cvb-speciality",
    "cvb-photolink",
    "cvb-summary-text"
  ];

  personalFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", refreshCVProgress);
      el.addEventListener("change", refreshCVProgress);
    }
  });
});

document.getElementById("cvProgressToggle").addEventListener("click", function () {
    const wrapper = document.querySelector(".progressBar-containerAll");
    this.classList.toggle("collapsed");
    wrapper.classList.toggle("progressBar-collapsed");
});

// =================================== DATA MANAGEMENT ===================================

function checkCVCompletionBeforeSave() {
  const personalFields = ["cvb-fullName", "cvb-phone", "cvb-email", "cvb-address", "cvb-speciality", "cvb-summary-text"];
  const personalFilled = personalFields.every(id => {
    const el = document.getElementById(id);
    return el && el.value.trim() !== "";
  });

  const experienceFilled = Array.from(document.querySelectorAll("#cvb-exp-content .cvb-tab-pane")).some(pane => {
    const inputs = pane.querySelectorAll("input");
    const textarea = pane.querySelector("textarea");
    return Array.from(inputs).some(i => i.value.trim() !== "") || (textarea && textarea.value.trim() !== "");
  });

  const educationFilled = Array.from(document.querySelectorAll("#cvb-edu-content .cvb-tab-pane")).some(pane => {
    const inputs = pane.querySelectorAll("input");
    return Array.from(inputs).some(i => i.value.trim() !== "");
  });

  const skillsFilled = Array.from(document.querySelectorAll("#cvb-tech-skills-list input[type='text']")).some(i => i.value.trim() !== "");
  const languagesFilled = Array.from(document.querySelectorAll("#cvb-soft-skills-list input[type='text']")).some(i => i.value.trim() !== "");
  const interestsFilled = Array.from(document.querySelectorAll("#cvb-interests-list input[type='text']")).some(i => i.value.trim() !== "");

  return personalFilled && experienceFilled && educationFilled && skillsFilled && languagesFilled && interestsFilled;
}

const cvbSaveCVTranslations = {
  en: {
    notLoggedInTitle: "Not Logged In",
    notLoggedInMessage: "Please log in to save your CV.",
    incompleteTitle: "CV Incomplete",
    incompleteMessage: "Please complete your CV before saving. Check missing sections and try again.",
    firstSaveTitle: "First CV Saved!",
    firstSaveMessage: "Congratulations! You earned +20 coins for saving your first CV!",
    successTitle: "CV Saved",
    successMessage: "Your CV has been securely saved to your account.",
    saveErrorTitle: "Save Failed"
  },
  fr: {
    notLoggedInTitle: "Non connecté",
    notLoggedInMessage: "Veuillez vous connecter pour enregistrer votre CV.",
    incompleteTitle: "CV incomplet",
    incompleteMessage: "Veuillez compléter votre CV avant de l'enregistrer. Vérifiez les sections manquantes et réessayez.",
    firstSaveTitle: "Premier CV enregistré !",
    firstSaveMessage: "Félicitations ! Vous avez gagné +20 pièces pour avoir enregistré votre premier CV !",
    successTitle: "CV enregistré",
    successMessage: "Votre CV a été enregistré en toute sécurité sur votre compte.",
    saveErrorTitle: "Échec de l'enregistrement"
  },
  es: {
    notLoggedInTitle: "No has iniciado sesión",
    notLoggedInMessage: "Por favor, inicia sesión para guardar tu CV.",
    incompleteTitle: "CV incompleto",
    incompleteMessage: "Por favor, completa tu CV antes de guardarlo. Verifica las secciones faltantes e inténtalo de nuevo.",
    firstSaveTitle: "¡Primer CV guardado!",
    firstSaveMessage: "¡Felicidades! ¡Has ganado +20 monedas por guardar tu primer CV!",
    successTitle: "CV guardado",
    successMessage: "Tu CV se ha guardado de forma segura en tu cuenta.",
    saveErrorTitle: "Error al guardar"
  },
  de: {
    notLoggedInTitle: "Nicht angemeldet",
    notLoggedInMessage: "Bitte melden Sie sich an, um Ihren Lebenslauf zu speichern.",
    incompleteTitle: "Lebenslauf unvollständig",
    incompleteMessage: "Bitte vervollständigen Sie Ihren Lebenslauf, bevor Sie ihn speichern. Überprüfen Sie fehlende Abschnitte und versuchen Sie es erneut.",
    firstSaveTitle: "Erster Lebenslauf gespeichert!",
    firstSaveMessage: "Glückwunsch! Sie haben +20 Münzen für das Speichern Ihres ersten Lebenslaufs erhalten!",
    successTitle: "Lebenslauf gespeichert",
    successMessage: "Ihr Lebenslauf wurde sicher in Ihrem Konto gespeichert.",
    saveErrorTitle: "Speichern fehlgeschlagen"
  },
  ar: {
    notLoggedInTitle: "لم تقم بتسجيل الدخول",
    notLoggedInMessage: "يرجى تسجيل الدخول لحفظ سيرتك الذاتية.",
    incompleteTitle: "السيرة الذاتية غير مكتملة",
    incompleteMessage: "يرجى إكمال سيرتك الذاتية قبل الحفظ. تحقق من الأقسام المفقودة وحاول مرة أخرى.",
    firstSaveTitle: "تم حفظ السيرة الذاتية لأول مرة!",
    firstSaveMessage: "تهانينا! لقد حصلت على +20 عملة لحفظ سيرتك الذاتية لأول مرة!",
    successTitle: "تم حفظ السيرة الذاتية",
    successMessage: "تم حفظ سيرتك الذاتية بأمان في حسابك.",
    saveErrorTitle: "فشل الحفظ"
  },
  pt: {
    notLoggedInTitle: "Não conectado",
    notLoggedInMessage: "Por favor, faça login para salvar seu CV.",
    incompleteTitle: "CV incompleto",
    incompleteMessage: "Por favor, complete seu CV antes de salvá-lo. Verifique as seções faltantes e tente novamente.",
    firstSaveTitle: "Primeiro CV salvo!",
    firstSaveMessage: "Parabéns! Você ganhou +20 moedas por salvar seu primeiro CV!",
    successTitle: "CV salvo",
    successMessage: "Seu CV foi salvo com segurança em sua conta.",
    saveErrorTitle: "Falha ao salvar"
  },
  ja: {
    notLoggedInTitle: "ログインしていません",
    notLoggedInMessage: "CVを保存するにはログインしてください。",
    incompleteTitle: "CV未完成",
    incompleteMessage: "保存する前にCVを完成させてください。欠落しているセクションを確認して再度お試しください。",
    firstSaveTitle: "初回CV保存！",
    firstSaveMessage: "おめでとうございます！初めてのCV保存で+20コインを獲得しました！",
    successTitle: "CV保存完了",
    successMessage: "あなたのCVは安全にアカウントに保存されました。",
    saveErrorTitle: "保存失敗"
  },
  zh: {
    notLoggedInTitle: "未登录",
    notLoggedInMessage: "请登录以保存您的简历。",
    incompleteTitle: "简历不完整",
    incompleteMessage: "请在保存前完成您的简历。检查缺失部分后重试。",
    firstSaveTitle: "首次保存简历！",
    firstSaveMessage: "恭喜！您首次保存简历获得 +20 币！",
    successTitle: "简历已保存",
    successMessage: "您的简历已安全保存到账户中。",
    saveErrorTitle: "保存失败"
  },
  ru: {
    notLoggedInTitle: "Не вошли в систему",
    notLoggedInMessage: "Пожалуйста, войдите, чтобы сохранить ваше резюме.",
    incompleteTitle: "Резюме неполное",
    incompleteMessage: "Пожалуйста, заполните резюме перед сохранением. Проверьте отсутствующие разделы и попробуйте снова.",
    firstSaveTitle: "Первое сохранение резюме!",
    firstSaveMessage: "Поздравляем! Вы получили +20 монет за сохранение первого резюме!",
    successTitle: "Резюме сохранено",
    successMessage: "Ваше резюме было успешно сохранено в аккаунте.",
    saveErrorTitle: "Ошибка сохранения"
  }
};
document.getElementById('saveCVToFirestore').addEventListener('click', async (event) => {
  const selectedLang = getCurrentLang();
  const T = cvbSaveCVTranslations[selectedLang] || cvbSaveCVTranslations['en'];

  const user = auth.currentUser;
  if (!user) {
    showNotification("warning", T.notLoggedInTitle, T.notLoggedInMessage);
    return;
  }

  const isComplete = checkCVCompletionBeforeSave();
  if (!isComplete) {
    showNotification("warning", T.incompleteTitle, T.incompleteMessage);
    return;
  }

  try {
    const pictureValue = document.getElementById("cvb-photolink").value.trim();

    const personalData = {
      fullName: document.getElementById("cvb-fullName").value || "",
      phone: document.getElementById("cvb-phone").value || "",
      email: document.getElementById("cvb-email").value || "",
      linkedin: document.getElementById("cvb-linkedin").value || "",
      address: document.getElementById("cvb-address").value || "",
      speciality: document.getElementById("cvb-speciality").value || "",
      picture: pictureValue
    };

    const summaryData = {
      summary: document.getElementById("cvb-summary-text").value || ""
    };

    const eduRows = [];
    document.querySelectorAll("#cvb-edu-content .cvb-tab-pane").forEach(pane => {
      const inputs = pane.querySelectorAll("input");
      if (Array.from(inputs).some(i => i.value.trim() !== "")) {
        const [degree, institution, startDate, endDate, location, honors] = [...inputs].map(i => i.value);
        eduRows.push({ degree, institution, startDate, endDate, location, honors });
      }
    });

    const expRows = [];
    document.querySelectorAll("#cvb-exp-content .cvb-tab-pane").forEach(pane => {
      const inputs = pane.querySelectorAll("input");
      const textarea = pane.querySelector("textarea");
      if (Array.from(inputs).some(i => i.value.trim() !== "") || (textarea && textarea.value.trim() !== "")) {
        const [title, company, startDate, endDate, location, type] = [...inputs].map(i => i.value);
        expRows.push({
          title, company, startDate, endDate, location, type,
          responsibilities: textarea?.value || ""
        });
      }
    });

    const certRows = [];
    document.querySelectorAll("#cvb-cert-content .cvb-tab-pane").forEach(pane => {
      const inputs = pane.querySelectorAll("input");
      if (Array.from(inputs).some(i => i.value.trim() !== "")) {
        const [desc, inst, certId, startDate, endDate, location] = [...inputs].map(i => i.value);
        certRows.push({ description: desc, institution: inst, certId, startDate, endDate, location });
      }
    });

    const skillRows = [];
    document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup").forEach(item => {
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name) skillRows.push({ name, score: score || 1 });
    });

    const interestRows = [];
    const textInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    textInputs.forEach((input) => {
      if (input.value.trim()) interestRows.push(input.value.trim());
    });

    const langRows = [];
    document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup").forEach(item => {
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name) langRows.push({ name, score: score || 1 });
    });

  const userRef = doc(db, "profiles", user.uid);

  await setDoc(userRef, {
    cv: {
      personal: personalData,
      summary: summaryData,
      education: eduRows,
      experience: expRows,
      certifications: certRows,
      skills: skillRows,
      interests: interestRows,
      languages: langRows,
      updatedAt: new Date()
    }
  }, { merge: true });

  const rewardRef = doc(db, "users", user.uid, "rewards", "FIRST_CV_SAVE");
  const rewardSnap = await getDoc(rewardRef);
  const alreadyClaimed = rewardSnap.exists();

  if (!alreadyClaimed) {
    await setDoc(doc(db, "users", user.uid, "rewards", "FIRST_CV_SAVE"), {
      type: "FIRST_CV_SAVE",
      coins: 20,
      createdAt: serverTimestamp()
    });

    const notifRef = doc(collection(db, "users", user.uid, "notifications"));
    await setDoc(notifRef, {
      reference: "FIRST_CV_SAVE_20",
      title: "🎉 +20 coins unlocked!",
      message: "You completed your first CV. +20 coins added.",
      read: false,
      createdAt: serverTimestamp()
    });

    showNotification("congrats", T.firstSaveTitle, T.firstSaveMessage);
  }
  updateUserSection(user);
} catch (error) {
  showNotification("error", T.saveErrorTitle, error.message);
}
});

const cvbLoadCVTranslations = {
  en: {
    notLoggedInTitle: "Not Logged In",
    notLoggedInMessage: "Please log in to load your CV.",
    noCVTitle: "No CV Found",
    noCVMessage: "You don’t have a saved CV yet.",
    successTitle: "CV Loaded",
    successMessage: "Your saved CV has been loaded into the form.",
    loadErrorTitle: "Load Failed"
  },
  fr: {
    notLoggedInTitle: "Non connecté",
    notLoggedInMessage: "Veuillez vous connecter pour charger votre CV.",
    noCVTitle: "CV introuvable",
    noCVMessage: "Vous n’avez pas encore enregistré de CV.",
    successTitle: "CV chargé",
    successMessage: "Votre CV enregistré a été chargé dans le formulaire.",
    loadErrorTitle: "Échec du chargement"
  },
  es: {
    notLoggedInTitle: "No has iniciado sesión",
    notLoggedInMessage: "Por favor, inicia sesión para cargar tu CV.",
    noCVTitle: "CV no encontrado",
    noCVMessage: "Aún no tienes un CV guardado.",
    successTitle: "CV cargado",
    successMessage: "Tu CV guardado ha sido cargado en el formulario.",
    loadErrorTitle: "Error al cargar"
  },
  de: {
    notLoggedInTitle: "Nicht angemeldet",
    notLoggedInMessage: "Bitte melden Sie sich an, um Ihren Lebenslauf zu laden.",
    noCVTitle: "Kein Lebenslauf gefunden",
    noCVMessage: "Sie haben noch keinen Lebenslauf gespeichert.",
    successTitle: "Lebenslauf geladen",
    successMessage: "Ihr gespeicherter Lebenslauf wurde in das Formular geladen.",
    loadErrorTitle: "Laden fehlgeschlagen"
  },
  ar: {
    notLoggedInTitle: "لم تقم بتسجيل الدخول",
    notLoggedInMessage: "يرجى تسجيل الدخول لتحميل سيرتك الذاتية.",
    noCVTitle: "لم يتم العثور على السيرة الذاتية",
    noCVMessage: "ليس لديك سيرة ذاتية محفوظة بعد.",
    successTitle: "تم تحميل السيرة الذاتية",
    successMessage: "تم تحميل سيرتك الذاتية المحفوظة في النموذج.",
    loadErrorTitle: "فشل التحميل"
  },
  pt: {
    notLoggedInTitle: "Não conectado",
    notLoggedInMessage: "Por favor, faça login para carregar seu CV.",
    noCVTitle: "CV não encontrado",
    noCVMessage: "Você ainda não salvou um CV.",
    successTitle: "CV Carregado",
    successMessage: "Seu CV salvo foi carregado no formulário.",
    loadErrorTitle: "Falha ao carregar"
  },
  ja: {
    notLoggedInTitle: "ログインしていません",
    notLoggedInMessage: "CVを読み込むにはログインしてください。",
    noCVTitle: "CVが見つかりません",
    noCVMessage: "まだ保存されたCVがありません。",
    successTitle: "CV読み込み完了",
    successMessage: "保存されたCVがフォームに読み込まれました。",
    loadErrorTitle: "読み込み失敗"
  },
  zh: {
    notLoggedInTitle: "未登录",
    notLoggedInMessage: "请登录以加载您的简历。",
    noCVTitle: "未找到简历",
    noCVMessage: "您尚未保存任何简历。",
    successTitle: "简历已加载",
    successMessage: "您保存的简历已加载到表单中。",
    loadErrorTitle: "加载失败"
  },
  ru: {
    notLoggedInTitle: "Не вошли в систему",
    notLoggedInMessage: "Пожалуйста, войдите, чтобы загрузить ваше резюме.",
    noCVTitle: "Резюме не найдено",
    noCVMessage: "У вас ещё нет сохранённого резюме.",
    successTitle: "Резюме загружено",
    successMessage: "Ваше сохранённое резюме было загружено в форму.",
    loadErrorTitle: "Ошибка загрузки"
  }
};
document.getElementById('loadCVFromFirestore').addEventListener('click', async (event) => {
  const selectedLang = getCurrentLang();
  const t = cvbLoadCVTranslations[selectedLang] || cvbLoadCVTranslations['en'];

  const user = auth.currentUser;
  if (!user) {
    showNotification("warning", t.notLoggedInTitle, t.notLoggedInMessage);
    return;
  }

  try {
    const docRef = doc(db, "profiles", user.uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists() || !docSnap.data().cv) {
      showNotification("info", t.noCVTitle, t.noCVMessage);
      return;
    }

    cvbResetAllForms();

    const data = docSnap.data().cv;

    // --- Personal ---
    if (data.personal) {
      document.getElementById("cvb-fullName").value = data.personal.fullName || "";
      document.getElementById("cvb-phone").value = data.personal.phone || "";
      document.getElementById("cvb-email").value = data.personal.email || "";
      document.getElementById("cvb-linkedin").value = data.personal.linkedin || "";
      document.getElementById("cvb-address").value = data.personal.address || "";
      document.getElementById("cvb-speciality").value = data.personal.speciality || "";

      if (data.personal.picture) {
        document.getElementById("cvb-photolink").value = data.personal.picture;
        document.getElementById("cvb-photo-preview").innerHTML =
          `<img src="${data.personal.picture}" alt="Profile Preview" style="max-width:100px;max-height:100px;border-radius:5px;" />`;
      }
    }

    // --- Summary ---
    if (data.summary) {
      document.getElementById("cvb-summary-text").value = data.summary.summary || "";
    }

    // --- Education ---
    if (Array.isArray(data.education)) {
      data.education.forEach((row, index) => {
        if (index > 0) cvbAddEducationSection();
        const pane = document.querySelectorAll("#cvb-edu-content .cvb-tab-pane")[index];
        const inputs = pane.querySelectorAll("input");
        if (inputs.length >= 6) {
          inputs[0].value = row.degree || "";
          inputs[1].value = row.institution || "";
          inputs[2].value = row.startDate || "";
          inputs[3].value = row.endDate || "";
          inputs[4].value = row.location || "";
          inputs[5].value = row.honors || "";
          cvbUpdateTabTitle(pane.id, inputs[0].value);
        }
      });
      cvbActivateFirstTab("cvb-edu-tabs", "cvb-edu-content");
    }

    // --- Experience ---
    if (Array.isArray(data.experience)) {
      data.experience.forEach((row, index) => {
        if (index > 0) cvbAddExperienceSection();
        const pane = document.querySelectorAll("#cvb-exp-content .cvb-tab-pane")[index];
        const inputs = pane.querySelectorAll("input");
        const textarea = pane.querySelector("textarea");
        if (inputs.length >= 6) {
          inputs[0].value = row.title || "";
          inputs[1].value = row.company || "";
          inputs[2].value = row.startDate || "";
          inputs[3].value = row.endDate || "";
          inputs[4].value = row.location || "";
          inputs[5].value = row.type || "";
          if (textarea) textarea.value = row.responsibilities || "";
          cvbUpdateExperienceTabTitle(pane.id, inputs[0].value);
        }
      });
      cvbActivateFirstTab("cvb-exp-tabs", "cvb-exp-content");
    }

    // --- Certifications ---
    if (Array.isArray(data.certifications)) {
      data.certifications.forEach((row, index) => {
        if (index > 0) cvbAddCertSection();
        const pane = document.querySelectorAll("#cvb-cert-content .cvb-tab-pane")[index];
        const inputs = pane.querySelectorAll("input");
        if (inputs.length >= 6) {
          inputs[0].value = row.description || "";
          inputs[1].value = row.institution || "";
          inputs[2].value = row.certId || "";
          inputs[3].value = row.startDate || "";
          inputs[4].value = row.endDate || "";
          inputs[5].value = row.location || "";
          cvbUpdateCertTabTitle(pane.id, inputs[0].value);
        }
      });
      cvbActivateFirstTab("cvb-cert-tabs", "cvb-cert-content");
    }

    // --- Skills ---
    if (Array.isArray(data.skills)) {
      data.skills.forEach((row, index) => {
        if (index > 0) cvbAddSkill("tech");
        const item = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup")[index];
        const input = item.querySelector("input[type='text']");
        const radios = item.querySelectorAll("input[type='radio']");
        if (input) input.value = row.name || "";
        radios.forEach(r => { if (parseInt(r.value) === row.score) r.checked = true; });
      });
    }

    // --- Interests ---
    if (Array.isArray(data.interests)) {
      data.interests.forEach((val, index) => {
        if (index > 0) cvbAddInterest();
        const input = document.querySelectorAll("#cvb-interests-list input[type='text']")[index];
        const checkbox = document.querySelectorAll("#cvb-interests-list input[type='checkbox']")[index];
        if (input) input.value = val;
        if (checkbox) checkbox.checked = true;
      });
    }

    // --- Languages ---
    if (Array.isArray(data.languages)) {
      data.languages.forEach((row, index) => {
        if (index > 0) cvbAddSkill("soft");
        const item = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup")[index];
        const input = item.querySelector("input[type='text']");
        const radios = item.querySelectorAll("input[type='radio']");
        if (input) input.value = row.name || "";
        radios.forEach(r => { if (parseInt(r.value) === row.score) r.checked = true; });
      });
    }
    
    refreshCVProgress();
    showNotification("success", t.successTitle, t.successMessage);
  } catch (error) {
    showNotification("error", t.loadErrorTitle, error.message);
  }
});

document.getElementById('closeExclusiveInfo')?.addEventListener('click', () => {
  const box = document.getElementById('exclusive-CoinsOnFirstSave');
  if (box) {
    box.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    box.style.opacity = "0";
    box.style.transform = "translateY(-10px)";
    setTimeout(() => box.remove(), 300);
  }
});

// ================================= Download Consumption ==================================

const cvCoinsMap = {
  'cvbDownloadPDF_Diplomat': 10,
  'cvbDownloadPDF_Visionary': 15,
  'cvbDownloadPDF_Innovator': 15,
  'cvbDownloadPDF_Titan': 15,
  'cvbDownloadPDF_Luminary': 20,
  'cvbDownloadPDF_Commander': 10,
  'cvbDownloadPDF_Analyst': 20,
  'cvbDownloadPDF_Executive': 15,
  'cvbDownloadPDF_Strategist': 20,
  'cvbDownloadPDF_Authority': 15,
  'cvbDownloadPDF_Minimalist': 15,
  'cvbDownloadPDF_Precisionist': 15,
  'cvbDownloadPDF_Coordinator': 15,
  'cvbDownloadPDF_Mentor': 20,
  'cvbDownloadPDF_Architect': 15,
  'cvbDownloadPDF_Connector': 20,
  'cvbDownloadPDF_Specialist': 10,
  'cvbDownloadPDF_Vanguard': 10,
  'cvbDownloadPDF_Virtuoso': 20
};

const cvbCoinsConsumptionTranslations = {
  en: {
    notLoggedInTitle: "Not Logged In",
    notLoggedInText: "Please log in to continue",
    
    userNotFoundTitle: "User Not Found",
    userNotFoundText: "No profile data found for your account.",
    
    insufficientCoinsTitle: "Insufficient Coins",
    insufficientCoinsText: "You don't have enough coins to download this CV.",
    
    cvValidationFailedTitle: "CV Validation Failed",
    cvValidationFailedText: "Your CV must fit on one page before downloading.",
    
    cvDownloadedSuccessTitle: "CV Downloaded Successfully",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `Your CV "${fileName}" was successfully downloaded. (${coinsUsed} coins used)`,

    cvDownloadedFreeTitle: "CV Downloaded",
    cvDownloadedFreeText: (fileName) =>
      `Your CV "${fileName}" was downloaded for free. (0 coins used)`,

    downloadFailedTitle: "Download Failed",
  },

  fr: {
    notLoggedInTitle: "Non connecté",
    notLoggedInText: "Veuillez vous connecter pour continuer",
    
    userNotFoundTitle: "Utilisateur non trouvé",
    userNotFoundText: "Aucune donnée de profil trouvée pour votre compte.",
    
    insufficientCoinsTitle: "Pièces insuffisantes",
    insufficientCoinsText: "Vous n'avez pas assez de pièces pour télécharger ce CV.",
    
    cvValidationFailedTitle: "Échec de validation du CV",
    cvValidationFailedText: "Votre CV doit tenir sur une page avant d'être téléchargé.",
    
    cvDownloadedSuccessTitle: "CV téléchargé avec succès",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `Votre CV "${fileName}" a été téléchargé avec succès. (${coinsUsed} pièces utilisées)`,

    cvDownloadedFreeTitle: "CV téléchargé",
    cvDownloadedFreeText: (fileName) =>
      `Votre CV "${fileName}" a été téléchargé gratuitement. (0 pièce utilisée)`,

    downloadFailedTitle: "Échec du téléchargement",
  },

  ar: {
    notLoggedInTitle: "غير مسجل الدخول",
    notLoggedInText: "يرجى تسجيل الدخول للمتابعة",
    
    userNotFoundTitle: "المستخدم غير موجود",
    userNotFoundText: "لم يتم العثور على بيانات الملف الشخصي لحسابك.",
    
    insufficientCoinsTitle: "عملات غير كافية",
    insufficientCoinsText: "ليس لديك عملات كافية لتنزيل هذه السيرة الذاتية.",
    
    cvValidationFailedTitle: "فشل التحقق من السيرة الذاتية",
    cvValidationFailedText: "يجب أن تتناسب سيرتك الذاتية مع صفحة واحدة قبل التنزيل.",
    
    cvDownloadedSuccessTitle: "تم تنزيل السيرة الذاتية بنجاح",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `تم تنزيل سيرتك الذاتية "${fileName}" بنجاح. (تم استخدام ${coinsUsed} عملة)`,

    cvDownloadedFreeTitle: "تم تنزيل السيرة الذاتية",
    cvDownloadedFreeText: (fileName) =>
      `تم تنزيل سيرتك الذاتية "${fileName}" مجانًا. (0 عملة مستخدمة)`,

    downloadFailedTitle: "فشل التنزيل",
  },

  es: {
    notLoggedInTitle: "No has iniciado sesión",
    notLoggedInText: "Por favor, inicia sesión para continuar",
    
    userNotFoundTitle: "Usuario no encontrado",
    userNotFoundText: "No se encontraron datos de perfil para tu cuenta.",
    
    insufficientCoinsTitle: "Monedas insuficientes",
    insufficientCoinsText: "No tienes suficientes monedas para descargar este CV.",
    
    cvValidationFailedTitle: "Error de validación del CV",
    cvValidationFailedText: "Tu CV debe caber en una página antes de descargarlo.",
    
    cvDownloadedSuccessTitle: "CV descargado con éxito",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `Tu CV "${fileName}" se descargó con éxito. (Se usaron ${coinsUsed} monedas)`,

    cvDownloadedFreeTitle: "CV descargado",
    cvDownloadedFreeText: (fileName) =>
      `Tu CV "${fileName}" se descargó gratis. (0 monedas usadas)`,

    downloadFailedTitle: "Error al descargar",
  },

  zh: {
    notLoggedInTitle: "未登录",
    notLoggedInText: "请登录以继续",
    
    userNotFoundTitle: "用户未找到",
    userNotFoundText: "未找到您的账户资料。",
    
    insufficientCoinsTitle: "币不足",
    insufficientCoinsText: "您的币不足以下载此简历。",
    
    cvValidationFailedTitle: "简历验证失败",
    cvValidationFailedText: "您的简历必须在一页内才能下载。",
    
    cvDownloadedSuccessTitle: "简历下载成功",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `您的简历 "${fileName}" 已成功下载。（使用了 ${coinsUsed} 币）`,

    cvDownloadedFreeTitle: "简历已下载",
    cvDownloadedFreeText: (fileName) =>
      `您的简历 "${fileName}" 已免费下载。（0 币使用）`,

    downloadFailedTitle: "下载失败",
  },

  de: {
    notLoggedInTitle: "Nicht eingeloggt",
    notLoggedInText: "Bitte melden Sie sich an, um fortzufahren",
    
    userNotFoundTitle: "Benutzer nicht gefunden",
    userNotFoundText: "Keine Profildaten für Ihr Konto gefunden.",
    
    insufficientCoinsTitle: "Nicht genügend Münzen",
    insufficientCoinsText: "Sie haben nicht genügend Münzen, um diesen Lebenslauf herunterzuladen.",
    
    cvValidationFailedTitle: "CV-Validierung fehlgeschlagen",
    cvValidationFailedText: "Ihr Lebenslauf muss auf eine Seite passen, bevor Sie ihn herunterladen.",
    
    cvDownloadedSuccessTitle: "CV erfolgreich heruntergeladen",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `Ihr Lebenslauf "${fileName}" wurde erfolgreich heruntergeladen. (${coinsUsed} Münzen verwendet)`,

    cvDownloadedFreeTitle: "CV heruntergeladen",
    cvDownloadedFreeText: (fileName) =>
      `Ihr Lebenslauf "${fileName}" wurde kostenlos heruntergeladen. (0 Münzen verwendet)`,

    downloadFailedTitle: "Download fehlgeschlagen",
  },

  pt: {
    notLoggedInTitle: "Não conectado",
    notLoggedInText: "Por favor, faça login para continuar",
    
    userNotFoundTitle: "Usuário não encontrado",
    userNotFoundText: "Nenhum dado de perfil encontrado para sua conta.",
    
    insufficientCoinsTitle: "Moedas insuficientes",
    insufficientCoinsText: "Você não tem moedas suficientes para baixar este CV.",
    
    cvValidationFailedTitle: "Falha na validação do CV",
    cvValidationFailedText: "Seu CV deve caber em uma página antes de baixar.",
    
    cvDownloadedSuccessTitle: "CV baixado com sucesso",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `Seu CV "${fileName}" foi baixado com sucesso. (${coinsUsed} moedas usadas)`,

    cvDownloadedFreeTitle: "CV baixado",
    cvDownloadedFreeText: (fileName) =>
      `Seu CV "${fileName}" foi baixado gratuitamente. (0 moedas usadas)`,

    downloadFailedTitle: "Falha no download",
  },

  ja: {
    notLoggedInTitle: "未ログイン",
    notLoggedInText: "続行するにはログインしてください",
    
    userNotFoundTitle: "ユーザーが見つかりません",
    userNotFoundText: "アカウントのプロフィールデータが見つかりません。",
    
    insufficientCoinsTitle: "コイン不足",
    insufficientCoinsText: "この履歴書をダウンロードするにはコインが足りません。",
    
    cvValidationFailedTitle: "履歴書の検証に失敗しました",
    cvValidationFailedText: "履歴書は1ページに収める必要があります。",
    
    cvDownloadedSuccessTitle: "履歴書のダウンロード成功",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `履歴書 "${fileName}" が正常にダウンロードされました。(${coinsUsed} コイン使用)`,

    cvDownloadedFreeTitle: "履歴書をダウンロードしました",
    cvDownloadedFreeText: (fileName) =>
      `履歴書 "${fileName}" が無料でダウンロードされました。(0 コイン使用)`,

    downloadFailedTitle: "ダウンロードに失敗しました",
  },

  ru: {
    notLoggedInTitle: "Не вошли в систему",
    notLoggedInText: "Пожалуйста, войдите в систему, чтобы продолжить",
    
    userNotFoundTitle: "Пользователь не найден",
    userNotFoundText: "Данные профиля для вашей учетной записи не найдены.",
    
    insufficientCoinsTitle: "Недостаточно монет",
    insufficientCoinsText: "У вас недостаточно монет, чтобы скачать это резюме.",
    
    cvValidationFailedTitle: "Ошибка проверки резюме",
    cvValidationFailedText: "Ваше резюме должно помещаться на одной странице перед загрузкой.",
    
    cvDownloadedSuccessTitle: "Резюме успешно загружено",
    cvDownloadedSuccessText: (fileName, coinsUsed) =>
      `Ваше резюме "${fileName}" успешно загружено. (Использовано ${coinsUsed} монет)`,

    cvDownloadedFreeTitle: "Резюме загружено",
    cvDownloadedFreeText: (fileName) =>
      `Ваше резюме "${fileName}" загружено бесплатно. (0 монет использовано)`,

    downloadFailedTitle: "Ошибка загрузки",
  },
};
async function DownloadCV_saveConsumption(fileFormat = "PDF") {
  const selectedLang = getCurrentLang();
  const t = cvbCoinsConsumptionTranslations[selectedLang] || cvbCoinsConsumptionTranslations['en'];

  const user = auth.currentUser;
  if (!user) {
    showNotification("warning", t.notLoggedInTitle, t.notLoggedInText);
    return;
  }

  const selectedStyle = selectedCVStyle || "cvbDownloadPDF_Diplomat";
  const coinsUsed = Number(cvCoinsMap[selectedStyle] ?? 0);
  const fileName = selectedStyle.replace("cvbDownloadPDF_", "CV_") + ".pdf";

  try {
    const currentCoins = await getUserTotalCoins(user.uid);

    if (coinsUsed > 0 && currentCoins < coinsUsed) {
      showNotification("warning", t.insufficientCoinsTitle, t.insufficientCoinsText);
      return;
    }

    const valid = await downloadSelectedCV();
    if (!valid) {
      showNotification("warning", t.cvValidationFailedTitle, t.cvValidationFailedText);
      return;
    }

    if (coinsUsed > 0) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-GB') + " " + now.toLocaleTimeString('en-GB');
      const consumptionRef = collection(db, "users", user.uid, "consumptions");

      await addDoc(consumptionRef, {
        coins_used: coinsUsed,
        action_name: "CV Download",
        file_name: fileName,
        createdAt: now
      });

      showNotification("success", t.cvDownloadedSuccessTitle, t.cvDownloadedSuccessText(fileName, coinsUsed));
      updateUserSection(user);
    } else {
      showNotification("success", t.cvDownloadedFreeTitle, t.cvDownloadedFreeText(fileName));
    }

  } catch (error) {
    console.error("Error saving consumption:", error);
    showNotification("error", t.downloadFailedTitle, error.message);
  }
}
document.getElementById("cvb-save-consumption")?.addEventListener("click", () => {
  DownloadCV_saveConsumption("PDF");
});

// ================================== Job Offer Analyzer ==================================

const keywordGroups = {
  // ---------------- Core Soft Skills ----------------
  'communication': [
    'communication', 'communicate', 'communicating',
    'communiquer', 'communicationnel', 'échange', 'dialogue',
    'تواصل', 'التواصل', 'اتصال', 'الاتصال'
  ],
  'problem-solving': [
    'problem-solving', 'problem solving', 'solve problems', 'troubleshooting',
    'résolution de problèmes', 'résoudre', 'solutionner', 'dépannage',
    'حل المشكلات', 'حل', 'معالجة المشاكل', 'إيجاد حلول'
  ],
  'teamwork': [
    'teamwork', 'team player', 'collaboration', 'cooperation',
    'travail en équipe', 'esprit d’équipe', 'coopération', 'collaboration',
    'عمل جماعي', 'فريق', 'التعاون', 'العمل ضمن فريق'
  ],
  'adaptability': [
    'adaptability', 'adaptable', 'flexibility', 'resilience',
    'adaptabilité', 'flexibilité', 'souplesse',
    'التكيف', 'مرونة', 'القدرة على التكيف', 'المرونة'
  ],
  'critical thinking': [
    'critical thinking', 'analytical thinking', 'thinking critically',
    'pensée critique', 'réflexion critique', 'analyse critique',
    'تفكير نقدي', 'تفكير تحليلي', 'تفكير منطقي'
  ],
  'leadership': [
    'leadership', 'leader', 'management skills',
    'leadership', 'dirigeant', 'gestion d’équipe',
    'قيادة', 'مهارات القيادة', 'إدارة الفريق'
  ],
  'organization': [
    'organization', 'organizational skills', 'time management',
    'organisation', 'gestion du temps', 'structuration',
    'تنظيم', 'تنظيم الوقت', 'إدارة الوقت'
  ],

  // ---------------- Project & Business ----------------
  'project management': [
    'project management', 'project planning', 'project manager',
    'gestion de projet', 'management de projet', 'chef de projet',
    'إدارة المشاريع', 'تخطيط المشاريع', 'مدير مشروع'
  ],
  'business analysis': [
    'business analysis', 'business analyst', 'process analysis',
    'analyse métier', 'analyse des affaires', 'analyse organisationnelle',
    'تحليل الأعمال', 'محلل أعمال', 'تحليل العمليات'
  ],
  'agile': ['agile', 'méthode agile', 'scrum agile', 'approche agile', 'أجايل', 'المنهجية الرشيقة'],
  'scrum': ['scrum', 'méthode scrum', 'framework scrum', 'سكرم', 'سكْرَم'],
  'kanban': ['kanban', 'méthode kanban', 'لوحة كانبان', 'كانبان'],

  // ---------------- Logistics & Supply Chain ----------------
  'logistics': [
    'logistics', 'supply logistics',
    'logistique', 'gestion logistique',
    'الخدمات اللوجستية', 'لوجستيك'
  ],
  'supply chain': [
    'supply chain', 'supply management',
    'chaîne logistique', 'chaîne d’approvisionnement',
    'سلسلة التوريد', 'إدارة سلسلة الإمداد'
  ],
  'inventory': [
    'inventory', 'stock management', 'stock control',
    'stock', 'inventaire', 'gestion de stock',
    'مخزون', 'المخزون', 'إدارة المخزون'
  ],
  'warehouse': [
    'warehouse', 'storage', 'depot',
    'entrepôt', 'stockage', 'dépôt',
    'مستودع', 'مخزن', 'المخزن'
  ],
  'procurement': [
    'procurement', 'purchasing', 'sourcing',
    'approvisionnement', 'achat', 'achats',
    'المشتريات', 'شراء', 'التوريد'
  ],
  'transportation': [
    'transportation', 'shipping', 'freight',
    'transport', 'expédition', 'livraison',
    'النقل', 'الشحن', 'التوصيل'
  ],
  'distribution': [
    'distribution', 'delivery', 'dispatching',
    'distribution', 'logistique distribution', 'répartition',
    'توزيع', 'التوزيع', 'التسليم'
  ],
  'import/export': [
    'import', 'export', 'international shipping',
    'import/export', 'commerce international',
    'استيراد', 'تصدير', 'التجارة الدولية'
  ],

  // ---------------- ERP / Tools ----------------
  'erp': ['erp', 'enterprise resource planning', 'progiciel de gestion', 'système erp', 'إي آر بي', 'نظام تخطيط الموارد'],
  'sap': ['sap', 'système sap', 'ساب'],
  'oracle': ['oracle', 'oracle erp', 'أوراكل'],
  'excel': ['excel', 'ms excel', 'tableur', 'feuille de calcul', 'إكسل', 'برنامج إكسل'],
  'powerpoint': ['powerpoint', 'ms powerpoint', 'présentation', 'diaporama', 'بوربوينت'],
  'jira': ['jira', 'outil jira', 'جيرا'],
  'trello': ['trello', 'outil trello', 'تريلو'],
  'word': ['word', 'ms word', 'microsoft word', 'traitement de texte', 'وورد', 'برنامج وورد'],

  // ---------------- Data / Analytics ----------------
  'data analysis': [
    'data analysis', 'data analytics', 'analyzing data',
    'analyse de données', 'statistiques', 'études de données',
    'تحليل البيانات', 'تحليلات البيانات', 'إحصائيات'
  ],
  'sql': ['sql', 'structured query language', 'base de données', 'requêtes sql', 'إس كيو إل', 'لغة الاستعلام الهيكلية'],
  'python': ['python', 'langage python', 'بايثون'],
  'machine learning': [
    'machine learning', 'ml', 'deep learning',
    'apprentissage automatique', 'apprentissage profond',
    'التعلم الآلي', 'التعلم العميق'
  ],
  'ai': [
    'ai', 'artificial intelligence',
    'intelligence artificielle',
    'ذكاء اصطناعي', 'الذكاء الاصطناعي'
  ],

  // ---------------- Marketing / Sales ----------------
  'marketing': [
    'marketing', 'digital marketing', 'market research',
    'marketing digital', 'étude de marché', 'mercatique',
    'تسويق', 'التسويق الرقمي', 'دراسة السوق'
  ],
  'sales': [
    'sales', 'selling', 'commercial',
    'ventes', 'commerce', 'commercialisation',
    'مبيعات', 'البيع', 'التجارة'
  ],
  'crm': [
    'crm', 'customer relationship management',
    'gestion client', 'relation client',
    'إدارة علاقات العملاء', 'نظام crm'
  ],

  // ---------------- HR / Admin ----------------
  'recruitment': [
    'recruitment', 'hiring', 'talent acquisition',
    'recrutement', 'embauche', 'sélection',
    'التوظيف', 'التعيين', 'استقطاب المواهب'
  ],
  'payroll': [
    'payroll', 'salary management', 'wages',
    'paie', 'salaire', 'gestion salariale',
    'أجور', 'الرواتب', 'إدارة الرواتب'
  ],
  'administration': [
    'administration', 'management', 'admin tasks',
    'gestion administrative', 'administratif',
    'إدارة', 'إدارة إدارية', 'الأعمال الإدارية'
  ],

  // ---------------- Education ----------------
  'bachelor': ['bachelor', 'licence', 'bac+3', 'إجازة', 'بكالوريوس'],
  'master': ['master', 'maîtrise', 'bac+5', 'ماستر', 'ماجستير'],
  'phd': ['phd', 'doctorat', 'دكتوراه'],
  'diploma': ['diploma', 'certificat', 'diplôme', 'شهادة', 'دبلوم'],
  'training': ['training', 'course', 'formation', 'stage', 'تدريب', 'دورة'],

  // ---------------- Certifications ----------------
  'apics': ['apics', 'certification apics'],
  'six sigma': ['six sigma', 'lean six sigma', 'certification six sigma', 'ستة سيجما', 'لين ستة سيجما'],
  'pmp': ['pmp', 'project management professional', 'certification pmp'],
  'lean': ['lean', 'lean management', 'gestion lean', 'لين', 'الإدارة الرشيقة'],

  // ---------------- Languages ----------------
  'english': ['english', 'anglais', 'الإنجليزية', 'انجليزي'],
  'french': ['french', 'français', 'الفرنسية', 'فرنسي'],
  'arabic': ['arabic', 'arabe', 'العربية'],
  'spanish': ['spanish', 'espagnol', 'الإسبانية'],
  'german': ['german', 'allemand', 'الألمانية'],

  // ---------------- Interests ----------------
  'sports': ['sports', 'athletics', 'football', 'soccer', 'basketball', 'sport', 'رياضة', 'كرة القدم', 'كرة السلة'],
  'travel': ['travel', 'voyage', 'tourism', 'trip', 'voyager', 'tourisme', 'سفر', 'رحلات', 'سياحة'],
  'reading': ['reading', 'books', 'literature', 'lecture', 'lire', 'قراءة', 'كتب', 'مطالعة'],
  'music': ['music', 'musician', 'musique', 'موسيقى'],
  'volunteering': ['volunteering', 'community service', 'bénévolat', 'service communautaire', 'تطوع', 'العمل التطوعي']
};

function normalizeWords(text) {
  const stopwords = new Set([
    'a','an','the','and','or','but','if','in','on','at','for','to','from','of',
    'by','with','as','is','are','was','were','it','its','this','that','these',
    'those','be','been','being','do','does','did','have','has','had','can','will',
    'would','could','should','may','might','must','about','into','than','then',
    'so','because','while','during','after','before','above','below','between',
    'under','over','out','up','down','off','again','further','once'
  ]);

  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(w => w.length > 2 && !stopwords.has(w));
}

function groupMatch(jobText, keywords) {
  const normalizedText = jobText.toLowerCase();
  return keywords.some(v => {
    if (/[\u0600-\u06FF]/.test(v)) {
      return normalizedText.includes(v.toLowerCase());
    }
    const pattern = new RegExp(`\\b${v.toLowerCase()}(?!\\w)\\b`, 'i');
    return pattern.test(normalizedText);
  });
}

async function cvbAnalyzeJobOfferMatchKeys(jobText) {
  const keyNeedsContainer = document.getElementById("cvb-keyneeds-list");
  const keyNeedsWrapper = document.getElementById("cvb-joboffer-keyneeds");
  keyNeedsContainer.innerHTML = "";
  keyNeedsWrapper.style.display = "grid";

  const normalizedText = jobText.toLowerCase();
  const detectedKeys = [];

  for (const [key, variants] of Object.entries(keywordGroups)) {
    if (groupMatch(normalizedText, variants)) detectedKeys.push(key);
  }

  let cvText = "";
  const selectors = [
    '#cvb-exp-content .cvb-tab-pane input, #cvb-exp-content .cvb-tab-pane textarea',
    '#cvb-edu-content .cvb-tab-pane input',
    '#cvb-cert-content .cvb-tab-pane input',
    '#cvb-tech-skills-list input[type="text"]',
    '#cvb-soft-skills-list input[type="text"]',
    '#cvb-interests-list input[type="text"]'
  ];
  cvText = Array.from(document.querySelectorAll(selectors.join(',')))
    .map(el => el.value)
    .join(" ")
    .toLowerCase();

  detectedKeys.forEach(key => {
    const span = document.createElement("span");
    const variants = keywordGroups[key];
    const foundVariants = variants.filter(v => {
      const pattern = /[\u0600-\u06FF]/.test(v)
        ? v.toLowerCase()
        : `\\b${v.toLowerCase()}(?!\\w)\\b`;
      const regex = new RegExp(pattern, 'i');
      return regex.test(normalizedText);
    });

    let displayText = foundVariants.length > 0 ? foundVariants[0] : key;
    span.textContent = displayText;

    const hasMatch = groupMatch(cvText, keywordGroups[key]);
    span.classList.add(
      hasMatch
        ? "cvb-keyneeds-pill--matched"
        : "cvb-keyneeds-pill--missing"
    );

    span.style.padding = "5px 12px";
    span.style.borderRadius = "10px";
    span.style.fontSize = "0.85rem";
    span.style.fontWeight = "500";
    span.style.lineHeight = "1.2";
    keyNeedsContainer.appendChild(span);
  });
}

async function cvbAnalyzeJobOfferMatch() {
  const loadingEl = document.getElementById("cvb-ai-loading");
  const loadingDotsEl = document.getElementById("cvb-loading-dots");
  const btn = document.getElementById("AnalyzeJobOfferMatch");

  const selectedLang = getCurrentLang();
  const t = cvbJobOfferConsumptionTranslations[selectedLang] || cvbJobOfferConsumptionTranslations['en'];

  const loadingTexts = t.loadingTexts || ["Analyzing"];
  const chosenText = loadingTexts[Math.floor(Math.random() * loadingTexts.length)];

  loadingDotsEl.textContent = "";
  loadingEl.textContent = chosenText;
  loadingEl.appendChild(loadingDotsEl);
  loadingEl.style.display = "inline-flex";
  btn.disabled = true;

  const delay = Math.random() * 6000;
  await new Promise(resolve => setTimeout(resolve, delay));

  const jobText = document.getElementById("cvb-joboffer-text").value.toLowerCase();
  if (!jobText.trim()) {
    loadingEl.style.display = "none";
    btn.disabled = false;
    return;
  }

  let totalChecked = 0;
  let matchedCount = 0;

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.style.outline = "";
    cb.style.backgroundColor = "";
  });

  const updateItemStatus = (containerSelector, keywordExtractor) => {
    document.querySelectorAll(containerSelector).forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (!checkbox || !checkbox.checked) return;

      totalChecked++;
      const keywords = keywordExtractor(item);

      let match = false;
      for (const kw of keywords) {
        if (groupMatch(jobText, [kw])) { 
          match = true;
          break;
        }
        for (const variants of Object.values(keywordGroups)) {
          if (variants.includes(kw.toLowerCase())) {
            if (groupMatch(jobText, variants)) {
              match = true;
              break;
            }
          }
        }
        if (match) break;
      }

      if (match) {
        matchedCount++;
        checkbox.style.outline = "2px solid green";
        checkbox.style.backgroundColor = "#d4edda";
      } else {
        checkbox.style.outline = "2px solid red";
        checkbox.style.backgroundColor = "#f8d7da";
      }
    });
  };

  const certStopwords = new Set([
    'certification', 'certifications', 'شهادة', 'certificat', 'diplôme'
  ]);
  const filterCertKeywords = (keywords) => {
    return keywords.filter(kw => !certStopwords.has(kw.toLowerCase()));
  };

  updateItemStatus('#cvb-exp-content .cvb-tab-pane', item =>
    normalizeWords(Array.from(item.querySelectorAll('input, textarea')).map(el => el.value).join(" "))
  );
  updateItemStatus('#cvb-edu-content .cvb-tab-pane', item =>
    normalizeWords(Array.from(item.querySelectorAll('input')).map(el => el.value).join(" "))
  );
  updateItemStatus('#cvb-cert-content .cvb-tab-pane', item => {
    const keywords = normalizeWords(Array.from(item.querySelectorAll('input')).map(el => el.value).join(" "));
    return filterCertKeywords(keywords);
  });
  updateItemStatus('#cvb-tech-skills-list .navCard-requiresGroup', item =>
    normalizeWords(item.querySelector('input[type="text"]')?.value || "")
  );
  updateItemStatus('#cvb-soft-skills-list .navCard-requiresGroup', item =>
    normalizeWords(item.querySelector('input[type="text"]')?.value || "")
  );
  updateItemStatus('#cvb-interests-list .navCard-requiresGroup', item =>
    normalizeWords(item.querySelector('input[type="text"]')?.value || "")
  );

  const overallProgress = totalChecked > 0 ? (matchedCount / totalChecked) * 100 : 0;
  const mainProgress = document.getElementById("cvb-joboffer-progress-bar");
  const label = document.getElementById("cvb-joboffer-progress-label");

  if (mainProgress && label) {
    const rounded = Math.round(overallProgress);
    mainProgress.style.width = `${rounded}%`;
    label.textContent = `${rounded}% ${t.jobofferProgress || "Corresponding to selected"}`;
  }
  
  cvbAnalyzeJobOfferMatchKeys(jobText);
  cvbAnalyzeJobspeciality(jobText);
  cvbAddProgressBars(jobText);

  loadingEl.style.display = "none";
  btn.disabled = false;
}

async function cvbSelectJobOfferMatch() {
  cvbAnalyzeJobOfferMatch();
  const jobText = document.getElementById("cvb-joboffer-text").value.toLowerCase();
  if (!jobText.trim()) return;

  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

  const matchesAnyGroup = (word) => {
    for (const variants of Object.values(keywordGroups)) {
      if (variants.includes(word.toLowerCase())) {
        if (groupMatch(jobText, variants)) return true;
      }
    }
    return groupMatch(jobText, [word]);
  };

  const certStopwords = new Set(['certification', 'certifications', 'شهادة', 'certificat', 'diplôme']);
  const filterCertKeywords = (keywords) => keywords.filter(kw => !certStopwords.has(kw.toLowerCase()));

  const autoSelectMatching = (containerSelector, keywordExtractor) => {
    document.querySelectorAll(containerSelector).forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (!checkbox) return;

      const keywords = keywordExtractor(item);
      for (const kw of keywords) {
        if (matchesAnyGroup(kw)) {
          checkbox.checked = true;
          break;
        }
      }
    });
  };

  autoSelectMatching('#cvb-exp-content .cvb-tab-pane', item =>
    normalizeWords(Array.from(item.querySelectorAll('input, textarea')).map(el => el.value).join(" "))
  );

  autoSelectMatching('#cvb-edu-content .cvb-tab-pane', item =>
    normalizeWords(Array.from(item.querySelectorAll('input')).map(el => el.value).join(" "))
  );

  autoSelectMatching('#cvb-cert-content .cvb-tab-pane', item => {
    const keywords = normalizeWords(Array.from(item.querySelectorAll('input')).map(el => el.value).join(" "));
    return filterCertKeywords(keywords);
  });

  autoSelectMatching('#cvb-tech-skills-list .navCard-requiresGroup', item =>
    normalizeWords(item.querySelector('input[type="text"]')?.value || "")
  );

  autoSelectMatching('#cvb-soft-skills-list .navCard-requiresGroup', item =>
    normalizeWords(item.querySelector('input[type="text"]')?.value || "")
  );

  autoSelectMatching('#cvb-interests-list .navCard-requiresGroup', item =>
    normalizeWords(item.querySelector('input[type="text"]')?.value || "")
  );
  refreshCVProgress();
}

async function saveJobOfferConsumption(coinsUsed, actionName) {
  const selectedLang = getCurrentLang();
  const t = cvbJobOfferConsumptionTranslations[selectedLang] || cvbJobOfferConsumptionTranslations['en'];

  const user = auth.currentUser;
  if (!user) {
    showNotification("warning", t.notLoggedInTitle, t.notLoggedInMessage);
    return;
  }

  if (!cvbValidateRequiredData()) {
    showNotification("warning", t.cvContentRequiredTitle, t.cvContentRequiredMessage);
    return;
  }

  const jobOfferText = document.getElementById("cvb-joboffer-text");
  if (!jobOfferText || !jobOfferText.value.trim()) {
    showNotification("warning", t.noJobOfferTitle, t.noJobOfferMessage);
    return;
  }

  try {
    const currentCoins = await getUserTotalCoins(user.uid);
    const newCoins = currentCoins - coinsUsed;

    if (newCoins < 0) {
      showNotification("warning", t.notEnoughCoinsTitle, t.notEnoughCoinsMessage);
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB') + " " + now.toLocaleTimeString('en-GB');
    const consumptionRef = collection(db, "users", user.uid, "consumptions");

    await addDoc(consumptionRef, {
      coins_used: Number(coinsUsed),
      action_name: actionName,
      createdAt: now
    });

    if (actionName === "Analyze Job Offer Match") {
      await cvbAnalyzeJobOfferMatch();
    } else if (actionName === "Select Job Offer Match") {
      await cvbSelectJobOfferMatch();
    }

    showNotification("success", t.analysisCompleteTitle, t.analysisCompleteMessage(coinsUsed));
    updateUserSection(user);
  } catch (error) {
    console.error("Error saving job offer consumption:", error);
    showNotification("error", t.saveErrorTitle, error.message || t.saveErrorTitle);
  }
}

document.getElementById("AnalyzeJobOfferMatch")?.addEventListener("click", () => {
  saveJobOfferConsumption(2, "Analyze Job Offer Match");
});

document.getElementById("SelectJobOfferMatch")?.addEventListener("click", () => {
  saveJobOfferConsumption(5, "Select Job Offer Match");
});

document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
  cb.style.outline = "";
  cb.style.backgroundColor = "";
});

const cvbJobOfferConsumptionTranslations = {
  en: {
    notLoggedInTitle: "Not Logged In",
    notLoggedInMessage: "Please log in to use the job offer analyzer.",
    userNotFoundTitle: "User Not Found",
    userNotFoundMessage: "No profile data found.",
    noJobOfferTitle: "Job Offer Missing",
    noJobOfferMessage: "Please paste a job offer before starting the analysis.",
    cvContentRequiredTitle: "CV Content Required",
    cvContentRequiredMessage: "Please fill in more sections of your CV before starting the analysis.",
    notEnoughCoinsTitle: "Not Enough Coins",
    notEnoughCoinsMessage: "You don't have enough coins for this action.",
    analysisCompleteTitle: "Analysis Complete",
    analysisCompleteMessage: (coinsUsed) =>
      `Your job offer was successfully analyzed and matched with your CV. (${coinsUsed} coins used)`,
    saveErrorTitle: "Save Failed",
    jobofferProgress: "Matching selected criteria",
    loadingTexts: ["Analyzing", "Loading", "Verifying"],
  },
  fr: {
    notLoggedInTitle: "Non connecté",
    notLoggedInMessage: "Veuillez vous connecter pour utiliser l'analyseur d'offres d'emploi.",
    userNotFoundTitle: "Utilisateur non trouvé",
    userNotFoundMessage: "Aucune donnée de profil trouvée.",
    noJobOfferTitle: "Offre d'emploi manquante",
    noJobOfferMessage: "Veuillez coller une offre d'emploi avant de lancer l'analyse.",
    cvContentRequiredTitle: "Contenu du CV requis",
    cvContentRequiredMessage: "Veuillez remplir davantage de sections de votre CV avant de lancer l'analyse.",
    notEnoughCoinsTitle: "Pièces insuffisantes",
    notEnoughCoinsMessage: "Vous n'avez pas assez de pièces pour cette action.",
    analysisCompleteTitle: "Analyse terminée",
    analysisCompleteMessage: (coinsUsed) =>
      `Votre offre d'emploi a été analysée et comparée à votre CV avec succès. (${coinsUsed} pièces utilisées)`,
    saveErrorTitle: "Échec de l'enregistrement",
    jobofferProgress: "Correspond aux critères sélectionnés",
    loadingTexts: ["Analyse en cours", "Chargement", "Vérification"],
  },
  es: {
    notLoggedInTitle: "No has iniciado sesión",
    notLoggedInMessage: "Por favor, inicia sesión para usar el analizador de ofertas de trabajo.",
    userNotFoundTitle: "Usuario no encontrado",
    userNotFoundMessage: "No se encontraron datos del perfil.",
    noJobOfferTitle: "Oferta de trabajo faltante",
    noJobOfferMessage: "Por favor, pega una oferta de trabajo antes de iniciar el análisis.",
    cvContentRequiredTitle: "Contenido del CV requerido",
    cvContentRequiredMessage: "Completa más secciones de tu CV antes de iniciar el análisis.",
    notEnoughCoinsTitle: "Monedas insuficientes",
    notEnoughCoinsMessage: "No tienes suficientes monedas para esta acción.",
    analysisCompleteTitle: "Análisis completado",
    analysisCompleteMessage: (coinsUsed) =>
      `Tu oferta de trabajo fue analizada y comparada con tu CV correctamente. (${coinsUsed} monedas usadas)`,
    saveErrorTitle: "Error al guardar",
    jobofferProgress: "Corresponde a los criterios seleccionados",
    loadingTexts: ["Analizando", "Cargando", "Verificando"],
  },
  de: {
    notLoggedInTitle: "Nicht angemeldet",
    notLoggedInMessage: "Bitte melden Sie sich an, um den Jobangebot-Analyzer zu verwenden.",
    userNotFoundTitle: "Benutzer nicht gefunden",
    userNotFoundMessage: "Keine Profildaten gefunden.",
    noJobOfferTitle: "Jobangebot fehlt",
    noJobOfferMessage: "Bitte fügen Sie ein Jobangebot ein, bevor Sie die Analyse starten.",
    cvContentRequiredTitle: "Lebenslauf-Inhalt erforderlich",
    cvContentRequiredMessage: "Bitte füllen Sie mehr Bereiche Ihres Lebenslaufs aus, bevor Sie die Analyse starten.",
    notEnoughCoinsTitle: "Nicht genügend Münzen",
    notEnoughCoinsMessage: "Sie haben nicht genügend Münzen für diese Aktion.",
    analysisCompleteTitle: "Analyse abgeschlossen",
    analysisCompleteMessage: (coinsUsed) =>
      `Ihr Jobangebot wurde erfolgreich analysiert und mit Ihrem Lebenslauf abgeglichen. (${coinsUsed} Münzen verwendet)`,
    saveErrorTitle: "Speichern fehlgeschlagen",
    jobofferProgress: "Entspricht den ausgewählten Kriterien",
    loadingTexts: ["Analysiere", "Lade", "Überprüfe"],
  },
  ar: {
    notLoggedInTitle: "لم تقم بتسجيل الدخول",
    notLoggedInMessage: "يرجى تسجيل الدخول لاستخدام محلل عروض العمل.",
    userNotFoundTitle: "المستخدم غير موجود",
    userNotFoundMessage: "لم يتم العثور على بيانات الملف الشخصي.",
    noJobOfferTitle: "عرض العمل مفقود",
    noJobOfferMessage: "يرجى لصق عرض العمل قبل بدء التحليل.",
    cvContentRequiredTitle: "محتوى السيرة الذاتية مطلوب",
    cvContentRequiredMessage: "يرجى ملء المزيد من أقسام سيرتك الذاتية قبل بدء التحليل.",
    notEnoughCoinsTitle: "عملات غير كافية",
    notEnoughCoinsMessage: "ليس لديك عملات كافية لهذا الإجراء.",
    analysisCompleteTitle: "اكتمل التحليل",
    analysisCompleteMessage: (coinsUsed) =>
      `تم تحليل عرض العمل ومطابقته مع سيرتك الذاتية بنجاح. (تم استخدام ${coinsUsed} عملة)`,
    saveErrorTitle: "فشل الحفظ",
    jobofferProgress: "يتوافق مع المعايير المحددة",
    loadingTexts: ["جار التحليل", "جار التحميل", "جار التحقق"],
  },
  pt: {
    notLoggedInTitle: "Não conectado",
    notLoggedInMessage: "Por favor, faça login para usar o analisador de ofertas de emprego.",
    userNotFoundTitle: "Usuário não encontrado",
    userNotFoundMessage: "Nenhum dado de perfil encontrado.",
    noJobOfferTitle: "Oferta de emprego ausente",
    noJobOfferMessage: "Cole uma oferta de emprego antes de iniciar a análise.",
    cvContentRequiredTitle: "Conteúdo do CV necessário",
    cvContentRequiredMessage: "Preencha mais seções do seu CV antes de iniciar a análise.",
    notEnoughCoinsTitle: "Moedas insuficientes",
    notEnoughCoinsMessage: "Você não tem moedas suficientes para esta ação.",
    analysisCompleteTitle: "Análise concluída",
    analysisCompleteMessage: (coinsUsed) =>
      `Sua oferta de emprego foi analisada e comparada com seu CV com sucesso. (${coinsUsed} moedas usadas)`,
    saveErrorTitle: "Falha ao salvar",
    jobofferProgress: "Corresponde aos critérios selecionados",
    loadingTexts: ["Analisando", "Carregando", "Verificando"],
  },
  ja: {
    notLoggedInTitle: "ログインしていません",
    notLoggedInMessage: "求人分析ツールを使用するにはログインしてください。",
    userNotFoundTitle: "ユーザーが見つかりません",
    userNotFoundMessage: "プロフィールデータが見つかりません。",
    noJobOfferTitle: "求人情報がありません",
    noJobOfferMessage: "分析を開始する前に求人情報を貼り付けてください。",
    cvContentRequiredTitle: "履歴書の内容が不足しています",
    cvContentRequiredMessage: "分析を開始する前に、履歴書のセクションをさらに入力してください。",
    notEnoughCoinsTitle: "コインが不足しています",
    notEnoughCoinsMessage: "この操作に必要なコインが足りません。",
    analysisCompleteTitle: "分析完了",
    analysisCompleteMessage: (coinsUsed) =>
      `求人情報が正常に分析され、履歴書と照合されました。(${coinsUsed} コイン使用)`,
    saveErrorTitle: "保存失敗",
    jobofferProgress: "選択された基準に一致",
    loadingTexts: ["分析中", "読み込み中", "確認中"],
  },
  zh: {
    notLoggedInTitle: "未登录",
    notLoggedInMessage: "请登录以使用职位分析器。",
    userNotFoundTitle: "用户未找到",
    userNotFoundMessage: "未找到个人资料数据。",
    noJobOfferTitle: "职位信息缺失",
    noJobOfferMessage: "请在开始分析之前粘贴职位信息。",
    cvContentRequiredTitle: "简历内容不足",
    cvContentRequiredMessage: "请在开始分析前填写更多简历内容。",
    notEnoughCoinsTitle: "币不足",
    notEnoughCoinsMessage: "您的币不足以此操作。",
    analysisCompleteTitle: "分析完成",
    analysisCompleteMessage: (coinsUsed) =>
      `您的职位已成功分析并与简历匹配。（已使用 ${coinsUsed} 币）`,
    saveErrorTitle: "保存失败",
    jobofferProgress: "与所选标准匹配",
    loadingTexts: ["分析中", "加载中", "验证中"],
  },
  ru: {
    notLoggedInTitle: "Не вошли в систему",
    notLoggedInMessage: "Пожалуйста, войдите, чтобы использовать анализатор вакансий.",
    userNotFoundTitle: "Пользователь не найден",
    userNotFoundMessage: "Данные профиля не найдены.",
    noJobOfferTitle: "Вакансия отсутствует",
    noJobOfferMessage: "Пожалуйста, вставьте описание вакансии перед началом анализа.",
    cvContentRequiredTitle: "Требуется содержание резюме",
    cvContentRequiredMessage: "Заполните больше разделов вашего резюме перед началом анализа.",
    notEnoughCoinsTitle: "Недостаточно монет",
    notEnoughCoinsMessage: "У вас недостаточно монет для этого действия.",
    analysisCompleteTitle: "Анализ завершен",
    analysisCompleteMessage: (coinsUsed) =>
      `Вакансия успешно проанализирована и сопоставлена с вашим резюме. (Использовано ${coinsUsed} монет)`,
    saveErrorTitle: "Ошибка сохранения",
    jobofferProgress: "Соответствует выбранным критериям",
    loadingTexts: ["Анализ", "Загрузка", "Проверка"],
  }
};

const App_translationsLabels = {
  en: {
    "title-breakdown": "Job speciality Breakdown",
    "label-speciality": "speciality",
    "label-sector": "Sector",
    "label-function": "Function",
    "label-seniority": "Seniority",
    "label-skills": "Skills Type",
    "label-requires": "Job speciality Requires"
  },
  fr: {
    "title-breakdown": "Analyse de la Spécialité du Poste",
    "label-speciality": "Spécialité",
    "label-sector": "Secteur",
    "label-function": "Fonction",
    "label-seniority": "Niveau hiérarchique",
    "label-skills": "Type de Compétences",
    "label-requires": "La Spécialité du Poste Nécessite"
  },
  ar: {
    "title-breakdown": "تحليل تخصص الوظيفة",
    "label-speciality": "التخصص",
    "label-sector": "القطاع",
    "label-function": "الوظيفة",
    "label-seniority": "الرتبة الوظيفية",
    "label-skills": "نوع المهارات",
    "label-requires": "يتطلب التخصص الوظيفي"
  },
  es: {
    "title-breakdown": "Análisis de la Especialidad del Puesto",
    "label-speciality": "Especialidad",
    "label-sector": "Sector",
    "label-function": "Función",
    "label-seniority": "Nivel de Seniority",
    "label-skills": "Tipo de Habilidades",
    "label-requires": "La Especialidad del Puesto Requiere"
  },
  zh: {
    "title-breakdown": "职位专业分析",
    "label-speciality": "专业",
    "label-sector": "部门",
    "label-function": "职能",
    "label-seniority": "职级",
    "label-skills": "技能类型",
    "label-requires": "职位专业要求"
  },
  de: {
    "title-breakdown": "Analyse der Berufsspezialität",
    "label-speciality": "Fachgebiet",
    "label-sector": "Sektor",
    "label-function": "Funktion",
    "label-seniority": "Hierarchieebene",
    "label-skills": "Art der Fähigkeiten",
    "label-requires": "Berufsspezialität erfordert"
  },
  pt: {
    "title-breakdown": "Análise da Especialidade do Cargo",
    "label-speciality": "Especialidade",
    "label-sector": "Setor",
    "label-function": "Função",
    "label-seniority": "Nível Hierárquico",
    "label-skills": "Tipo de Competências",
    "label-requires": "A Especialidade do Cargo Requer"
  },
  ja: {
    "title-breakdown": "職務専門性の分析",
    "label-speciality": "専門分野",
    "label-sector": "セクター",
    "label-function": "職務",
    "label-seniority": "職位レベル",
    "label-skills": "スキルタイプ",
    "label-requires": "職務専門性に必要なもの"
  },
  ru: {
    "title-breakdown": "Анализ профессиональной специализации",
    "label-speciality": "Специальность",
    "label-sector": "Сектор",
    "label-function": "Функция",
    "label-seniority": "Уровень",
    "label-skills": "Тип навыков",
    "label-requires": "Требования по специальности"
  }
};

const App_translationsLogistics = {
  en: {
    speciality: "Logistics & Supply Chain Management (Operational Focus)",
    sector: "Manufacturing / Distribution / Retail",
    function: "Operations / Procurement / Warehouse Management",
    seniority: "Mid-level Manager",
    skills: "Technical + Analytical + Leadership"
  },
  fr: {
    speciality: "Logistique et Gestion de la Chaîne d’Approvisionnement (Orientation Opérationnelle)",
    sector: "Fabrication / Distribution / Vente au détail",
    function: "Opérations / Approvisionnement / Gestion d’entrepôt",
    seniority: "Manager intermédiaire",
    skills: "Technique + Analytique + Leadership"
  },
  ar: {
    speciality: "إدارة اللوجستيك وسلسلة التوريد (تركيز تشغيلي)",
    sector: "التصنيع / التوزيع / البيع بالتجزئة",
    function: "العمليات / المشتريات / إدارة المستودعات",
    seniority: "مدير متوسط المستوى",
    skills: "تقني + تحليلي + قيادي"
  },
  es: {
    speciality: "Gestión de Logística y Cadena de Suministro (Enfoque Operativo)",
    sector: "Fabricación / Distribución / Retail",
    function: "Operaciones / Compras / Gestión de Almacenes",
    seniority: "Gerente de nivel medio",
    skills: "Técnico + Analítico + Liderazgo"
  },
  zh: {
    speciality: "物流与供应链管理（运营方向）",
    sector: "制造 / 分销 / 零售",
    function: "运营 / 采购 / 仓储管理",
    seniority: "中级经理",
    skills: "技术 + 分析 + 领导力"
  },
  de: {
    speciality: "Logistik- & Supply-Chain-Management (Operativer Fokus)",
    sector: "Fertigung / Vertrieb / Einzelhandel",
    function: "Betrieb / Beschaffung / Lagerverwaltung",
    seniority: "Mittleres Management",
    skills: "Technisch + Analytisch + Führung"
  },
  pt: {
    speciality: "Gestão de Logística e Cadeia de Suprimentos (Foco Operacional)",
    sector: "Fabricação / Distribuição / Varejo",
    function: "Operações / Compras / Gestão de Armazéns",
    seniority: "Gerente de nível médio",
    skills: "Técnico + Analítico + Liderança"
  },
  ja: {
    speciality: "ロジスティクス＆サプライチェーン管理（オペレーショナルフォーカス）",
    sector: "製造 / 流通 / 小売",
    function: "オペレーション / 調達 / 倉庫管理",
    seniority: "中堅マネージャー",
    skills: "技術 + 分析 + リーダーシップ"
  },
  ru: {
    speciality: "Логистика и управление цепочкой поставок (оперативный фокус)",
    sector: "Производство / Дистрибуция / Розничная торговля",
    function: "Операции / Закупки / Управление складом",
    seniority: "Менеджер среднего звена",
    skills: "Технические + Аналитические + Лидерские навыки"
  }
};

const App_translationsProject = {
  en: {
    speciality: "Project Management",
    sector: "IT / Business / Operations",
    function: "Project Planning / Coordination / Delivery",
    seniority: "Mid-level Manager",
    skills: "Leadership + Communication + Organization"
  },
  fr: {
    speciality: "Gestion de Projet",
    sector: "Informatique / Affaires / Opérations",
    function: "Planification / Coordination / Livraison de Projets",
    seniority: "Manager intermédiaire",
    skills: "Leadership + Communication + Organisation"
  },
  ar: {
    speciality: "إدارة المشاريع",
    sector: "تكنولوجيا المعلومات / الأعمال / العمليات",
    function: "تخطيط / تنسيق / تنفيذ المشاريع",
    seniority: "مدير متوسط المستوى",
    skills: "قيادة + تواصل + تنظيم"
  },
  es: {
    speciality: "Gestión de Proyectos",
    sector: "TI / Negocios / Operaciones",
    function: "Planificación / Coordinación / Entrega de Proyectos",
    seniority: "Gerente de nivel medio",
    skills: "Liderazgo + Comunicación + Organización"
  },
  zh: {
    speciality: "项目管理",
    sector: "IT / 商业 / 运营",
    function: "项目规划 / 协调 / 执行",
    seniority: "中级经理",
    skills: "领导力 + 沟通能力 + 组织能力"
  },
  de: {
    speciality: "Projektmanagement",
    sector: "IT / Geschäft / Betrieb",
    function: "Projektplanung / Koordination / Durchführung",
    seniority: "Mid-Level Manager",
    skills: "Führung + Kommunikation + Organisation"
  },
  pt: {
    speciality: "Gestão de Projetos",
    sector: "TI / Negócios / Operações",
    function: "Planejamento / Coordenação / Entrega de Projetos",
    seniority: "Gerente de nível médio",
    skills: "Liderança + Comunicação + Organização"
  },
  ja: {
    speciality: "プロジェクトマネジメント",
    sector: "IT / ビジネス / オペレーション",
    function: "プロジェクト計画 / 調整 / 実行",
    seniority: "中堅マネージャー",
    skills: "リーダーシップ + コミュニケーション + 組織力"
  },
  ru: {
    speciality: "Управление проектами",
    sector: "ИТ / Бизнес / Операции",
    function: "Планирование / Координация / Выполнение проектов",
    seniority: "Менеджер среднего уровня",
    skills: "Лидерство + Коммуникация + Организация"
  }
};

const App_translationsData = {
  en: {
    speciality: "Data & Analytics",
    sector: "Finance / Marketing / Operations",
    function: "Data Analysis / Reporting / Machine Learning",
    seniority: "Analyst / Specialist",
    skills: "Analytical + Technical + Problem Solving"
  },
  fr: {
    speciality: "Données et Analyse",
    sector: "Finance / Marketing / Opérations",
    function: "Analyse de données / Reporting / Apprentissage automatique",
    seniority: "Analyste / Spécialiste",
    skills: "Analytique + Technique + Résolution de problèmes"
  },
  ar: {
    speciality: "تحليل البيانات",
    sector: "المالية / التسويق / العمليات",
    function: "تحليل البيانات / إعداد التقارير / التعلم الآلي",
    seniority: "محلل / متخصص",
    skills: "تحليلي + تقني + حل المشكلات"
  },
  es: {
    speciality: "Datos y Análisis",
    sector: "Finanzas / Marketing / Operaciones",
    function: "Análisis de datos / Informes / Aprendizaje automático",
    seniority: "Analista / Especialista",
    skills: "Analítico + Técnico + Resolución de Problemas"
  },
  zh: {
    speciality: "数据与分析",
    sector: "金融 / 营销 / 运营",
    function: "数据分析 / 报告 / 机器学习",
    seniority: "分析师 / 专家",
    skills: "分析能力 + 技术能力 + 解决问题能力"
  },
  de: {
    speciality: "Daten & Analytik",
    sector: "Finanzen / Marketing / Betrieb",
    function: "Datenanalyse / Reporting / Maschinelles Lernen",
    seniority: "Analyst / Spezialist",
    skills: "Analytisch + Technisch + Problemlösungsfähig"
  },
  pt: {
    speciality: "Dados e Análise",
    sector: "Finanças / Marketing / Operações",
    function: "Análise de Dados / Relatórios / Aprendizado de Máquina",
    seniority: "Analista / Especialista",
    skills: "Analítico + Técnico + Resolução de Problemas"
  },
  ja: {
    speciality: "データと分析",
    sector: "金融 / マーケティング / オペレーション",
    function: "データ分析 / レポーティング / 機械学習",
    seniority: "アナリスト / スペシャリスト",
    skills: "分析力 + 技術力 + 問題解決能力"
  },
  ru: {
    speciality: "Данные и аналитика",
    sector: "Финансы / Маркетинг / Операции",
    function: "Анализ данных / Отчётность / Машинное обучение",
    seniority: "Аналитик / Специалист",
    skills: "Аналитические + Технические + Решение проблем"
  }
};

const App_translationsFinance = {
  en: {
    speciality: "Finance & Accounting",
    sector: "Finance / Banking / Audit",
    function: "Accounting / Budgeting / Financial Analysis",
    seniority: "Analyst / Specialist",
    skills: "Analytical + Numerical + Compliance"
  },
  fr: {
    speciality: "Finance et Comptabilité",
    sector: "Finance / Banque / Audit",
    function: "Comptabilité / Budget / Analyse Financière",
    seniority: "Analyste / Spécialiste",
    skills: "Analytique + Numérique + Conformité"
  },
  ar: {
    speciality: "المالية والمحاسبة",
    sector: "المالية / البنوك / التدقيق",
    function: "المحاسبة / الميزانية / التحليل المالي",
    seniority: "محلل / متخصص",
    skills: "تحليلي + رقمي + الالتزام بالمعايير"
  },
  es: {
    speciality: "Finanzas y Contabilidad",
    sector: "Finanzas / Banca / Auditoría",
    function: "Contabilidad / Presupuestos / Análisis Financiero",
    seniority: "Analista / Especialista",
    skills: "Analítico + Numérico + Cumplimiento"
  },
  zh: {
    speciality: "财务与会计",
    sector: "金融 / 银行 / 审计",
    function: "会计 / 预算 / 财务分析",
    seniority: "分析师 / 专家",
    skills: "分析能力 + 数字能力 + 合规性"
  },
  de: {
    speciality: "Finanzen & Buchhaltung",
    sector: "Finanzen / Bank / Prüfung",
    function: "Buchhaltung / Budgetierung / Finanzanalyse",
    seniority: "Analyst / Spezialist",
    skills: "Analytisch + Numerisch + Compliance"
  },
  pt: {
    speciality: "Finanças e Contabilidade",
    sector: "Finanças / Bancos / Auditoria",
    function: "Contabilidade / Orçamento / Análise Financeira",
    seniority: "Analista / Especialista",
    skills: "Analítico + Numérico + Conformidade"
  },
  ja: {
    speciality: "財務・会計",
    sector: "金融 / 銀行 / 監査",
    function: "会計 / 予算 / 財務分析",
    seniority: "アナリスト / スペシャリスト",
    skills: "分析力 + 数値能力 + コンプライアンス"
  },
  ru: {
    speciality: "Финансы и Бухгалтерия",
    sector: "Финансы / Банки / Аудит",
    function: "Бухгалтерия / Бюджетирование / Финансовый анализ",
    seniority: "Аналитик / Специалист",
    skills: "Аналитические + Числовые + Соответствие"
  }
};

const App_translationsMarketing = {
  en: {
    speciality: "Marketing & Digital Strategy",
    sector: "Marketing / Advertising / Digital",
    function: "Digital Marketing / SEO / Content & Social Media",
    seniority: "Coordinator / Specialist",
    skills: "Creative + Analytical + Communication"
  },
  fr: {
    speciality: "Marketing & Stratégie Digitale",
    sector: "Marketing / Publicité / Digital",
    function: "Marketing digital / SEO / Contenu & Réseaux sociaux",
    seniority: "Coordinateur / Spécialiste",
    skills: "Créatif + Analytique + Communication"
  },
  ar: {
    speciality: "التسويق والاستراتيجية الرقمية",
    sector: "التسويق / الإعلان / الرقمي",
    function: "التسويق الرقمي / تحسين محركات البحث / المحتوى ووسائل التواصل",
    seniority: "منسق / متخصص",
    skills: "إبداعي + تحليلي + تواصل"
  },
  es: {
    speciality: "Marketing y Estrategia Digital",
    sector: "Marketing / Publicidad / Digital",
    function: "Marketing digital / SEO / Contenido y Redes Sociales",
    seniority: "Coordinador / Especialista",
    skills: "Creativo + Analítico + Comunicación"
  },
  zh: {
    speciality: "营销与数字策略",
    sector: "营销 / 广告 / 数字",
    function: "数字营销 / SEO / 内容与社交媒体",
    seniority: "协调员 / 专家",
    skills: "创意 + 分析 + 沟通"
  },
  de: {
    speciality: "Marketing & Digitale Strategie",
    sector: "Marketing / Werbung / Digital",
    function: "Digitales Marketing / SEO / Content & Social Media",
    seniority: "Koordinator / Spezialist",
    skills: "Kreativ + Analytisch + Kommunikation"
  },
  pt: {
    speciality: "Marketing e Estratégia Digital",
    sector: "Marketing / Publicidade / Digital",
    function: "Marketing digital / SEO / Conteúdo e Mídias Sociais",
    seniority: "Coordenador / Especialista",
    skills: "Criativo + Analítico + Comunicação"
  },
  ja: {
    speciality: "マーケティング＆デジタル戦略",
    sector: "マーケティング / 広告 / デジタル",
    function: "デジタルマーケティング / SEO / コンテンツ＆ソーシャルメディア",
    seniority: "コーディネーター / スペシャリスト",
    skills: "クリエイティブ + 分析力 + コミュニケーション"
  },
  ru: {
    speciality: "Маркетинг и Цифровая Стратегия",
    sector: "Маркетинг / Реклама / Цифровой",
    function: "Цифровой маркетинг / SEO / Контент и соцсети",
    seniority: "Координатор / Специалист",
    skills: "Креативность + Аналитика + Коммуникация"
  }
};

const App_translationsSales = {
  en: {
    speciality: "Sales & Business Development",
    sector: "Sales / Business / Retail",
    function: "Account Management / Client Relations / Negotiation",
    seniority: "Representative / Manager",
    skills: "Persuasive + Negotiation + Customer-Oriented"
  },
  fr: {
    speciality: "Ventes et Développement Commercial",
    sector: "Ventes / Affaires / Commerce",
    function: "Gestion de comptes / Relations clients / Négociation",
    seniority: "Représentant / Manager",
    skills: "Persuasif + Négociation + Orienté client"
  },
  ar: {
    speciality: "المبيعات وتطوير الأعمال",
    sector: "المبيعات / الأعمال / التجزئة",
    function: "إدارة الحسابات / علاقات العملاء / التفاوض",
    seniority: "ممثل / مدير",
    skills: "إقناعي + تفاوض + موجه نحو العميل"
  },
  es: {
    speciality: "Ventas y Desarrollo de Negocios",
    sector: "Ventas / Negocios / Retail",
    function: "Gestión de cuentas / Relaciones con clientes / Negociación",
    seniority: "Representante / Gerente",
    skills: "Persuasivo + Negociación + Orientado al cliente"
  },
  zh: {
    speciality: "销售与业务发展",
    sector: "销售 / 业务 / 零售",
    function: "客户管理 / 客户关系 / 谈判",
    seniority: "代表 / 经理",
    skills: "说服力 + 谈判能力 + 客户导向"
  },
  de: {
    speciality: "Vertrieb & Geschäftsentwicklung",
    sector: "Vertrieb / Business / Einzelhandel",
    function: "Account-Management / Kundenbeziehungen / Verhandlung",
    seniority: "Vertreter / Manager",
    skills: "Überzeugend + Verhandlung + Kundenorientiert"
  },
  pt: {
    speciality: "Vendas e Desenvolvimento de Negócios",
    sector: "Vendas / Negócios / Varejo",
    function: "Gestão de contas / Relações com clientes / Negociação",
    seniority: "Representante / Gerente",
    skills: "Persuasivo + Negociação + Orientado ao Cliente"
  },
  ja: {
    speciality: "営業＆事業開発",
    sector: "営業 / ビジネス / 小売",
    function: "アカウント管理 / 顧客関係 / 交渉",
    seniority: "担当者 / マネージャー",
    skills: "説得力 + 交渉力 + 顧客志向"
  },
  ru: {
    speciality: "Продажи и Развитие Бизнеса",
    sector: "Продажи / Бизнес / Розница",
    function: "Управление аккаунтами / Взаимоотношения с клиентами / Переговоры",
    seniority: "Представитель / Менеджер",
    skills: "Убедительность + Переговоры + Ориентация на клиента"
  }
};

const App_translationsHR = {
  en: {
    speciality: "Human Resources",
    sector: "HR / Recruitment / Talent Management",
    function: "Recruitment / Training / Employee Relations",
    seniority: "Specialist / Manager",
    skills: "Communication + Organizational + People-Oriented"
  },
  fr: {
    speciality: "Ressources Humaines",
    sector: "RH / Recrutement / Gestion des Talents",
    function: "Recrutement / Formation / Relations Employés",
    seniority: "Spécialiste / Manager",
    skills: "Communication + Organisation + Relationnel"
  },
  ar: {
    speciality: "الموارد البشرية",
    sector: "الموارد البشرية / التوظيف / إدارة المواهب",
    function: "التوظيف / التدريب / علاقات الموظفين",
    seniority: "متخصص / مدير",
    skills: "تواصل + تنظيم + مهارات التعامل مع الناس"
  },
  es: {
    speciality: "Recursos Humanos",
    sector: "RRHH / Reclutamiento / Gestión de Talento",
    function: "Reclutamiento / Capacitación / Relaciones Laborales",
    seniority: "Especialista / Gerente",
    skills: "Comunicación + Organización + Orientación a Personas"
  },
  zh: {
    speciality: "人力资源",
    sector: "人力资源 / 招聘 / 人才管理",
    function: "招聘 / 培训 / 员工关系",
    seniority: "专员 / 经理",
    skills: "沟通 + 组织 + 人际能力"
  },
  de: {
    speciality: "Personalwesen",
    sector: "HR / Rekrutierung / Talentmanagement",
    function: "Recruiting / Schulung / Mitarbeiterbeziehungen",
    seniority: "Spezialist / Manager",
    skills: "Kommunikation + Organisation + Menschenorientiert"
  },
  pt: {
    speciality: "Recursos Humanos",
    sector: "RH / Recrutamento / Gestão de Talentos",
    function: "Recrutamento / Treinamento / Relações com Funcionários",
    seniority: "Especialista / Gerente",
    skills: "Comunicação + Organização + Orientação a Pessoas"
  },
  ja: {
    speciality: "人事",
    sector: "人事 / 採用 / タレントマネジメント",
    function: "採用 / トレーニング / 従業員関係",
    seniority: "スペシャリスト / マネージャー",
    skills: "コミュニケーション + 組織力 + 人間力"
  },
  ru: {
    speciality: "Человеческие ресурсы",
    sector: "HR / Рекрутмент / Управление талантами",
    function: "Подбор персонала / Обучение / Взаимоотношения с сотрудниками",
    seniority: "Специалист / Менеджер",
    skills: "Коммуникация + Организация + Ориентация на людей"
  }
};

const App_translationsIT = {
  en: {
    speciality: "Information Technology",
    sector: "IT / Software / Networking",
    function: "Software Development / IT Support / Systems Administration",
    seniority: "Developer / Specialist",
    skills: "Technical + Problem-Solving + Analytical"
  },
  fr: {
    speciality: "Technologies de l’Information",
    sector: "IT / Logiciel / Réseaux",
    function: "Développement logiciel / Support IT / Administration des systèmes",
    seniority: "Développeur / Spécialiste",
    skills: "Technique + Résolution de problèmes + Analytique"
  },
  ar: {
    speciality: "تكنولوجيا المعلومات",
    sector: "تكنولوجيا المعلومات / البرمجيات / الشبكات",
    function: "تطوير البرمجيات / دعم IT / إدارة الأنظمة",
    seniority: "مطور / متخصص",
    skills: "تقني + حل المشكلات + تحليلي"
  },
  es: {
    speciality: "Tecnología de la Información",
    sector: "TI / Software / Redes",
    function: "Desarrollo de Software / Soporte IT / Administración de Sistemas",
    seniority: "Desarrollador / Especialista",
    skills: "Técnico + Resolución de Problemas + Analítico"
  },
  zh: {
    speciality: "信息技术",
    sector: "IT / 软件 / 网络",
    function: "软件开发 / IT 支持 / 系统管理",
    seniority: "开发人员 / 专家",
    skills: "技术 + 解决问题 + 分析能力"
  },
  de: {
    speciality: "Informationstechnologie",
    sector: "IT / Software / Netzwerke",
    function: "Softwareentwicklung / IT-Support / Systemadministration",
    seniority: "Entwickler / Spezialist",
    skills: "Technisch + Problemlösung + Analytisch"
  },
  pt: {
    speciality: "Tecnologia da Informação",
    sector: "TI / Software / Redes",
    function: "Desenvolvimento de Software / Suporte de TI / Administração de Sistemas",
    seniority: "Desenvolvedor / Especialista",
    skills: "Técnico + Resolução de Problemas + Analítico"
  },
  ja: {
    speciality: "情報技術",
    sector: "IT / ソフトウェア / ネットワーク",
    function: "ソフトウェア開発 / ITサポート / システム管理",
    seniority: "開発者 / スペシャリスト",
    skills: "技術 + 問題解決 + 分析力"
  },
  ru: {
    speciality: "Информационные технологии",
    sector: "IT / Программное обеспечение / Сети",
    function: "Разработка ПО / IT-поддержка / Администрирование систем",
    seniority: "Разработчик / Специалист",
    skills: "Технические + Решение проблем + Аналитические"
  }
};

const App_translationsDesign = {
  en: {
    speciality: "Design & Creative",
    sector: "Design / UI / UX / Illustration",
    function: "Graphic Design / UI / UX / Adobe Tools",
    seniority: "Designer / Specialist",
    skills: "Creative + Visual + Technical"
  },
  fr: {
    speciality: "Design et Créatif",
    sector: "Design / UI / UX / Illustration",
    function: "Design graphique / UI / UX / Outils Adobe",
    seniority: "Designer / Spécialiste",
    skills: "Créatif + Visuel + Technique"
  },
  ar: {
    speciality: "التصميم والإبداع",
    sector: "التصميم / UI / UX / الرسوم التوضيحية",
    function: "التصميم الجرافيكي / UI / UX / أدوات أدوبي",
    seniority: "مصمم / متخصص",
    skills: "إبداعي + بصري + تقني"
  },
  es: {
    speciality: "Diseño y Creatividad",
    sector: "Diseño / UI / UX / Ilustración",
    function: "Diseño Gráfico / UI / UX / Herramientas Adobe",
    seniority: "Diseñador / Especialista",
    skills: "Creativo + Visual + Técnico"
  },
  zh: {
    speciality: "设计与创意",
    sector: "设计 / UI / UX / 插画",
    function: "平面设计 / UI / UX / Adobe 工具",
    seniority: "设计师 / 专家",
    skills: "创意 + 视觉 + 技术"
  },
  de: {
    speciality: "Design & Kreativ",
    sector: "Design / UI / UX / Illustration",
    function: "Grafikdesign / UI / UX / Adobe Tools",
    seniority: "Designer / Spezialist",
    skills: "Kreativ + Visuell + Technisch"
  },
  pt: {
    speciality: "Design e Criatividade",
    sector: "Design / UI / UX / Ilustração",
    function: "Design Gráfico / UI / UX / Ferramentas Adobe",
    seniority: "Designer / Especialista",
    skills: "Criativo + Visual + Técnico"
  },
  ja: {
    speciality: "デザイン＆クリエイティブ",
    sector: "デザイン / UI / UX / イラストレーション",
    function: "グラフィックデザイン / UI / UX / Adobeツール",
    seniority: "デザイナー / スペシャリスト",
    skills: "クリエイティブ + 視覚 + 技術"
  },
  ru: {
    speciality: "Дизайн и Креатив",
    sector: "Дизайн / UI / UX / Иллюстрация",
    function: "Графический дизайн / UI / UX / Adobe",
    seniority: "Дизайнер / Специалист",
    skills: "Креативность + Визуальное + Техническое"
  }
};

const App_translationsEngineering = {
  en: {
    speciality: "Engineering",
    sector: "Mechanical / Electrical / Civil / Design",
    function: "Mechanical Design / Electrical Systems / Civil Engineering / Manufacturing",
    seniority: "Engineer / Specialist",
    skills: "Technical + Analytical + Problem Solving"
  },
  fr: {
    speciality: "Ingénierie",
    sector: "Mécanique / Électrique / Génie Civil / Conception",
    function: "Conception Mécanique / Systèmes Électriques / Génie Civil / Fabrication",
    seniority: "Ingénieur / Spécialiste",
    skills: "Technique + Analytique + Résolution de problèmes"
  },
  ar: {
    speciality: "الهندسة",
    sector: "ميكانيكي / كهربائي / مدني / تصميم",
    function: "تصميم ميكانيكي / أنظمة كهربائية / الهندسة المدنية / التصنيع",
    seniority: "مهندس / متخصص",
    skills: "تقني + تحليلي + حل المشكلات"
  },
  es: {
    speciality: "Ingeniería",
    sector: "Mecánica / Eléctrica / Civil / Diseño",
    function: "Diseño Mecánico / Sistemas Eléctricos / Ingeniería Civil / Manufactura",
    seniority: "Ingeniero / Especialista",
    skills: "Técnico + Analítico + Resolución de Problemas"
  },
  zh: {
    speciality: "工程",
    sector: "机械 / 电气 / 土木 / 设计",
    function: "机械设计 / 电气系统 / 土木工程 / 制造",
    seniority: "工程师 / 专家",
    skills: "技术 + 分析 + 解决问题"
  },
  de: {
    speciality: "Ingenieurwesen",
    sector: "Mechanik / Elektrotechnik / Bauwesen / Konstruktion",
    function: "Maschinenbau / Elektrische Systeme / Bauingenieurwesen / Fertigung",
    seniority: "Ingenieur / Spezialist",
    skills: "Technisch + Analytisch + Problemlösungsfähig"
  },
  pt: {
    speciality: "Engenharia",
    sector: "Mecânica / Elétrica / Civil / Design",
    function: "Design Mecânico / Sistemas Elétricos / Engenharia Civil / Manufatura",
    seniority: "Engenheiro / Especialista",
    skills: "Técnico + Analítico + Resolução de Problemas"
  },
  ja: {
    speciality: "エンジニアリング",
    sector: "機械 / 電気 / 土木 / 設計",
    function: "機械設計 / 電気システム / 土木工学 / 製造",
    seniority: "エンジニア / スペシャリスト",
    skills: "技術 + 分析 + 問題解決"
  },
  ru: {
    speciality: "Инженерия",
    sector: "Механика / Электрика / Гражданское строительство / Проектирование",
    function: "Механический дизайн / Электросистемы / Гражданское строительство / Производство",
    seniority: "Инженер / Специалист",
    skills: "Технические + Аналитические + Решение проблем"
  }
};

const App_translationsCustomerSupport = {
  en: {
    speciality: "Customer Support",
    sector: "Support / Service / Client Relations",
    function: "Customer Service / Helpdesk / Technical Support",
    seniority: "Representative / Specialist",
    skills: "Communication + Problem Solving + Empathy"
  },
  fr: {
    speciality: "Support Client",
    sector: "Support / Service / Relations Clients",
    function: "Service Client / Assistance / Support Technique",
    seniority: "Représentant / Spécialiste",
    skills: "Communication + Résolution de problèmes + Empathie"
  },
  ar: {
    speciality: "دعم العملاء",
    sector: "الدعم / الخدمة / علاقات العملاء",
    function: "خدمة العملاء / المساعدة / الدعم الفني",
    seniority: "ممثل / متخصص",
    skills: "تواصل + حل المشكلات + تعاطف"
  },
  es: {
    speciality: "Atención al Cliente",
    sector: "Soporte / Servicio / Relaciones con Clientes",
    function: "Servicio al Cliente / Helpdesk / Soporte Técnico",
    seniority: "Representante / Especialista",
    skills: "Comunicación + Resolución de Problemas + Empatía"
  },
  zh: {
    speciality: "客户支持",
    sector: "支持 / 服务 / 客户关系",
    function: "客户服务 / 帮助台 / 技术支持",
    seniority: "代表 / 专家",
    skills: "沟通 + 解决问题 + 同理心"
  },
  de: {
    speciality: "Kundensupport",
    sector: "Support / Service / Kundenbeziehungen",
    function: "Kundenservice / Helpdesk / Technischer Support",
    seniority: "Vertreter / Spezialist",
    skills: "Kommunikation + Problemlösung + Empathie"
  },
  pt: {
    speciality: "Suporte ao Cliente",
    sector: "Suporte / Serviço / Relações com Clientes",
    function: "Atendimento ao Cliente / Helpdesk / Suporte Técnico",
    seniority: "Representante / Especialista",
    skills: "Comunicação + Resolução de Problemas + Empatia"
  },
  ja: {
    speciality: "カスタマーサポート",
    sector: "サポート / サービス / 顧客関係",
    function: "カスタマーサービス / ヘルプデスク / テクニカルサポート",
    seniority: "担当者 / スペシャリスト",
    skills: "コミュニケーション + 問題解決 + 共感"
  },
  ru: {
    speciality: "Поддержка клиентов",
    sector: "Поддержка / Сервис / Взаимоотношения с клиентами",
    function: "Обслуживание клиентов / Служба поддержки / Техническая поддержка",
    seniority: "Представитель / Специалист",
    skills: "Коммуникация + Решение проблем + Эмпатия"
  }
};

const App_translationsHealthcare = {
  en: {
    speciality: "Healthcare",
    sector: "Medical / Nursing / Pharmacy",
    function: "Patient Care / Clinical Support / Medical Assistance",
    seniority: "Nurse / Specialist / Clinician",
    skills: "Compassion + Medical Knowledge + Communication"
  },
  fr: {
    speciality: "Santé",
    sector: "Médical / Soins Infirmiers / Pharmacie",
    function: "Soins aux Patients / Support Clinique / Assistance Médicale",
    seniority: "Infirmier / Spécialiste / Clinicien",
    skills: "Compassion + Connaissances médicales + Communication"
  },
  ar: {
    speciality: "الرعاية الصحية",
    sector: "الطب / التمريض / الصيدلة",
    function: "رعاية المرضى / الدعم السريري / المساعدة الطبية",
    seniority: "ممرض / متخصص / أخصائي",
    skills: "تعاطف + معرفة طبية + تواصل"
  },
  es: {
    speciality: "Salud",
    sector: "Médico / Enfermería / Farmacia",
    function: "Atención al Paciente / Apoyo Clínico / Asistencia Médica",
    seniority: "Enfermero / Especialista / Clínico",
    skills: "Compasión + Conocimientos Médicos + Comunicación"
  },
  zh: {
    speciality: "医疗保健",
    sector: "医疗 / 护理 / 药学",
    function: "患者护理 / 临床支持 / 医疗协助",
    seniority: "护士 / 专家 / 临床医生",
    skills: "同情心 + 医学知识 + 沟通"
  },
  de: {
    speciality: "Gesundheitswesen",
    sector: "Medizin / Pflege / Pharmazie",
    function: "Patientenversorgung / Klinische Unterstützung / Medizinische Hilfe",
    seniority: "Krankenpfleger / Spezialist / Kliniker",
    skills: "Mitgefühl + Medizinisches Wissen + Kommunikation"
  },
  pt: {
    speciality: "Saúde",
    sector: "Médico / Enfermagem / Farmácia",
    function: "Cuidados ao Paciente / Suporte Clínico / Assistência Médica",
    seniority: "Enfermeiro / Especialista / Clínico",
    skills: "Compaixão + Conhecimento Médico + Comunicação"
  },
  ja: {
    speciality: "ヘルスケア",
    sector: "医療 / 看護 / 薬学",
    function: "患者ケア / 臨床サポート / 医療支援",
    seniority: "看護師 / スペシャリスト / 臨床医",
    skills: "思いやり + 医学知識 + コミュニケーション"
  },
  ru: {
    speciality: "Здравоохранение",
    sector: "Медицина / Сестринское дело / Аптека",
    function: "Уход за пациентами / Клиническая поддержка / Медицинская помощь",
    seniority: "Медсестра / Специалист / Врач",
    skills: "Сострадание + Медицинские знания + Коммуникация"
  }
};

const App_translationsLegal = {
  en: {
    speciality: "Legal",
    sector: "Law / Compliance / Contracts",
    function: "Legal Advice / Contract Management / Litigation",
    seniority: "Lawyer / Legal Counsel / Specialist",
    skills: "Analytical + Regulatory Knowledge + Communication"
  },
  fr: {
    speciality: "Juridique",
    sector: "Droit / Conformité / Contrats",
    function: "Conseil Juridique / Gestion des Contrats / Contentieux",
    seniority: "Avocat / Conseiller Juridique / Spécialiste",
    skills: "Analytique + Connaissance Réglementaire + Communication"
  },
  ar: {
    speciality: "القانونية",
    sector: "القانون / الامتثال / العقود",
    function: "الاستشارات القانونية / إدارة العقود / التقاضي",
    seniority: "محامٍ / مستشار قانوني / متخصص",
    skills: "تحليلي + معرفة تنظيمية + تواصل"
  },
  es: {
    speciality: "Legal",
    sector: "Derecho / Cumplimiento / Contratos",
    function: "Asesoría Legal / Gestión de Contratos / Litigación",
    seniority: "Abogado / Consejero Legal / Especialista",
    skills: "Analítico + Conocimiento Normativo + Comunicación"
  },
  zh: {
    speciality: "法律",
    sector: "法律 / 合规 / 合同",
    function: "法律咨询 / 合同管理 / 诉讼",
    seniority: "律师 / 法律顾问 / 专家",
    skills: "分析能力 + 法规知识 + 沟通能力"
  },
  de: {
    speciality: "Recht",
    sector: "Gesetz / Compliance / Verträge",
    function: "Rechtsberatung / Vertragsmanagement / Rechtsstreit",
    seniority: "Rechtsanwalt / Juristischer Berater / Spezialist",
    skills: "Analytisch + Regulatorisches Wissen + Kommunikation"
  },
  pt: {
    speciality: "Jurídico",
    sector: "Direito / Conformidade / Contratos",
    function: "Assessoria Jurídica / Gestão de Contratos / Litígios",
    seniority: "Advogado / Conselheiro Jurídico / Especialista",
    skills: "Analítico + Conhecimento Regulatório + Comunicação"
  },
  ja: {
    speciality: "法務",
    sector: "法律 / コンプライアンス / 契約",
    function: "法務アドバイス / 契約管理 / 訴訟",
    seniority: "弁護士 / 法務担当 / スペシャリスト",
    skills: "分析力 + 規制知識 + コミュニケーション"
  },
  ru: {
    speciality: "Юридическая",
    sector: "Право / Комплаенс / Контракты",
    function: "Юридическая консультация / Управление контрактами / Судебные дела",
    seniority: "Юрист / Консультант / Специалист",
    skills: "Аналитика + Знание нормативов + Коммуникация"
  }
};

const App_translationsEducation = {
  en: {
    speciality: "Education",
    sector: "Teaching / Training / Curriculum",
    function: "Lesson Planning / Teaching / Academic Support",
    seniority: "Teacher / Lecturer / Trainer",
    skills: "Communication + Instructional Design + Mentoring"
  },
  fr: {
    speciality: "Éducation",
    sector: "Enseignement / Formation / Programme",
    function: "Planification des Cours / Enseignement / Support Académique",
    seniority: "Enseignant / Conférencier / Formateur",
    skills: "Communication + Conception Pédagogique + Mentorat"
  },
  ar: {
    speciality: "التعليم",
    sector: "التدريس / التدريب / المنهج الدراسي",
    function: "تخطيط الدروس / التدريس / الدعم الأكاديمي",
    seniority: "معلم / محاضر / مدرب",
    skills: "تواصل + تصميم تعليمي + إرشاد"
  },
  es: {
    speciality: "Educación",
    sector: "Enseñanza / Formación / Currículo",
    function: "Planificación de Clases / Enseñanza / Apoyo Académico",
    seniority: "Profesor / Conferencista / Entrenador",
    skills: "Comunicación + Diseño Instruccional + Mentoría"
  },
  zh: {
    speciality: "教育",
    sector: "教学 / 培训 / 课程",
    function: "课程规划 / 教学 / 学术支持",
    seniority: "教师 / 讲师 / 培训师",
    skills: "沟通 + 教学设计 + 指导"
  },
  de: {
    speciality: "Bildung",
    sector: "Unterrichten / Schulung / Lehrplan",
    function: "Stundenplanung / Unterricht / Akademische Unterstützung",
    seniority: "Lehrer / Dozent / Ausbilder",
    skills: "Kommunikation + Lehrplanentwicklung + Mentoring"
  },
  pt: {
    speciality: "Educação",
    sector: "Ensino / Treinamento / Currículo",
    function: "Planejamento de Aulas / Ensino / Apoio Acadêmico",
    seniority: "Professor / Palestrante / Treinador",
    skills: "Comunicação + Design Instrucional + Mentoria"
  },
  ja: {
    speciality: "教育",
    sector: "指導 / トレーニング / カリキュラム",
    function: "授業計画 / 教育 / 学術支援",
    seniority: "教師 / 講師 / トレーナー",
    skills: "コミュニケーション + 教育設計 + メンタリング"
  },
  ru: {
    speciality: "Образование",
    sector: "Преподавание / Обучение / Учебный план",
    function: "Планирование уроков / Преподавание / Академическая поддержка",
    seniority: "Учитель / Лектор / Тренер",
    skills: "Коммуникация + Методическое проектирование + Наставничество"
  }
};

const App_translationsResearch = {
  en: {
    speciality: "Research",
    sector: "Scientific / Laboratory / Analysis",
    function: "Experiments / Data Analysis / Reporting",
    seniority: "Researcher / Scientist / Analyst",
    skills: "Analytical + Critical Thinking + Problem Solving"
  },
  fr: {
    speciality: "Recherche",
    sector: "Scientifique / Laboratoire / Analyse",
    function: "Expériences / Analyse de Données / Reporting",
    seniority: "Chercheur / Scientifique / Analyste",
    skills: "Analytique + Pensée Critique + Résolution de Problèmes"
  },
  ar: {
    speciality: "البحث",
    sector: "علمي / مختبر / تحليل",
    function: "تجارب / تحليل البيانات / إعداد التقارير",
    seniority: "باحث / عالم / محلل",
    skills: "تحليلي + تفكير نقدي + حل المشكلات"
  },
  es: {
    speciality: "Investigación",
    sector: "Científico / Laboratorio / Análisis",
    function: "Experimentos / Análisis de Datos / Reportes",
    seniority: "Investigador / Científico / Analista",
    skills: "Analítico + Pensamiento Crítico + Resolución de Problemas"
  },
  zh: {
    speciality: "研究",
    sector: "科学 / 实验室 / 分析",
    function: "实验 / 数据分析 / 报告",
    seniority: "研究员 / 科学家 / 分析师",
    skills: "分析 + 批判性思维 + 解决问题"
  },
  de: {
    speciality: "Forschung",
    sector: "Wissenschaftlich / Labor / Analyse",
    function: "Experimente / Datenanalyse / Berichterstattung",
    seniority: "Forscher / Wissenschaftler / Analyst",
    skills: "Analytisch + Kritisches Denken + Problemlösung"
  },
  pt: {
    speciality: "Pesquisa",
    sector: "Científico / Laboratório / Análise",
    function: "Experimentos / Análise de Dados / Relatórios",
    seniority: "Pesquisador / Cientista / Analista",
    skills: "Analítico + Pensamento Crítico + Resolução de Problemas"
  },
  ja: {
    speciality: "研究",
    sector: "科学 / ラボ / 分析",
    function: "実験 / データ分析 / レポート作成",
    seniority: "研究者 / 科学者 / アナリスト",
    skills: "分析 + 批判的思考 + 問題解決"
  },
  ru: {
    speciality: "Исследования",
    sector: "Научный / Лаборатория / Анализ",
    function: "Эксперименты / Анализ данных / Отчётность",
    seniority: "Исследователь / Учёный / Аналитик",
    skills: "Аналитика + Критическое мышление + Решение проблем"
  }
};

const App_translationsOperations = {
  en: {
    speciality: "Operations",
    sector: "Operations / Production / Supply Chain",
    function: "Process Improvement / Production Management / Workflow Optimization",
    seniority: "Operations Manager / Coordinator / Specialist",
    skills: "Organizational + Analytical + Process-Oriented"
  },
  fr: {
    speciality: "Opérations",
    sector: "Opérations / Production / Chaîne d'approvisionnement",
    function: "Amélioration des Processus / Gestion de Production / Optimisation des Flux",
    seniority: "Manager des Opérations / Coordinateur / Spécialiste",
    skills: "Organisation + Analytique + Orienté Processus"
  },
  ar: {
    speciality: "العمليات",
    sector: "العمليات / الإنتاج / سلسلة الإمداد",
    function: "تحسين العمليات / إدارة الإنتاج / تحسين سير العمل",
    seniority: "مدير العمليات / منسق / متخصص",
    skills: "تنظيم + تحليلي + موجه نحو العمليات"
  },
  es: {
    speciality: "Operaciones",
    sector: "Operaciones / Producción / Cadena de Suministro",
    function: "Mejora de Procesos / Gestión de Producción / Optimización de Flujos",
    seniority: "Gerente de Operaciones / Coordinador / Especialista",
    skills: "Organización + Analítico + Orientado a Procesos"
  },
  zh: {
    speciality: "运营",
    sector: "运营 / 生产 / 供应链",
    function: "流程改进 / 生产管理 / 工作流程优化",
    seniority: "运营经理 / 协调员 / 专家",
    skills: "组织能力 + 分析能力 + 流程导向"
  },
  de: {
    speciality: "Betrieb",
    sector: "Betrieb / Produktion / Lieferkette",
    function: "Prozessverbesserung / Produktionsmanagement / Workflow-Optimierung",
    seniority: "Betriebsleiter / Koordinator / Spezialist",
    skills: "Organisatorisch + Analytisch + Prozessorientiert"
  },
  pt: {
    speciality: "Operações",
    sector: "Operações / Produção / Cadeia de Suprimentos",
    function: "Melhoria de Processos / Gestão de Produção / Otimização de Fluxos",
    seniority: "Gerente de Operações / Coordenador / Especialista",
    skills: "Organizacional + Analítico + Orientado a Processos"
  },
  ja: {
    speciality: "オペレーション",
    sector: "オペレーション / 生産 / サプライチェーン",
    function: "プロセス改善 / 生産管理 / ワークフロー最適化",
    seniority: "オペレーションマネージャー / コーディネーター / スペシャリスト",
    skills: "組織力 + 分析力 + プロセス志向"
  },
  ru: {
    speciality: "Операции",
    sector: "Операции / Производство / Цепочка поставок",
    function: "Оптимизация процессов / Управление производством / Улучшение рабочих процессов",
    seniority: "Менеджер по операциям / Координатор / Специалист",
    skills: "Организация + Аналитика + Процессно-ориентированный"
  }
};

const App_translationsQuality = {
  en: {
    speciality: "Quality",
    sector: "Quality Control / QA / Standards Compliance",
    function: "Testing / Auditing / Standards Enforcement",
    seniority: "Quality Engineer / QA Specialist / Auditor",
    skills: "Attention to Detail + Analytical + Compliance-Oriented"
  },
  fr: {
    speciality: "Qualité",
    sector: "Contrôle Qualité / Assurance Qualité / Conformité aux Normes",
    function: "Tests / Audits / Application des Normes",
    seniority: "Ingénieur Qualité / Spécialiste QA / Auditeur",
    skills: "Souci du détail + Analytique + Orienté Conformité"
  },
  ar: {
    speciality: "الجودة",
    sector: "مراقبة الجودة / ضمان الجودة / الالتزام بالمعايير",
    function: "اختبار / تدقيق / تطبيق المعايير",
    seniority: "مهندس جودة / متخصص ضمان الجودة / مدقق",
    skills: "اهتمام بالتفاصيل + تحليلي + موجه نحو الالتزام"
  },
  es: {
    speciality: "Calidad",
    sector: "Control de Calidad / QA / Cumplimiento de Normas",
    function: "Pruebas / Auditoría / Aplicación de Normas",
    seniority: "Ingeniero de Calidad / Especialista QA / Auditor",
    skills: "Atención al Detalle + Analítico + Orientado a Cumplimiento"
  },
  zh: {
    speciality: "质量",
    sector: "质量控制 / QA / 标准合规",
    function: "测试 / 审计 / 标准执行",
    seniority: "质量工程师 / QA专家 / 审核员",
    skills: "关注细节 + 分析能力 + 合规导向"
  },
  de: {
    speciality: "Qualität",
    sector: "Qualitätskontrolle / QA / Standardkonformität",
    function: "Tests / Audits / Einhaltung von Standards",
    seniority: "Qualitätsingenieur / QA Spezialist / Auditor",
    skills: "Detailgenauigkeit + Analytisch + Compliance-orientiert"
  },
  pt: {
    speciality: "Qualidade",
    sector: "Controle de Qualidade / QA / Conformidade com Normas",
    function: "Testes / Auditoria / Aplicação de Normas",
    seniority: "Engenheiro de Qualidade / Especialista QA / Auditor",
    skills: "Atenção aos Detalhes + Analítico + Orientado à Conformidade"
  },
  ja: {
    speciality: "品質",
    sector: "品質管理 / QA / 標準遵守",
    function: "テスト / 監査 / 標準遵守",
    seniority: "品質エンジニア / QAスペシャリスト / 監査人",
    skills: "細部への注意 + 分析力 + コンプライアンス志向"
  },
  ru: {
    speciality: "Качество",
    sector: "Контроль качества / QA / Соответствие стандартам",
    function: "Тестирование / Аудит / Соблюдение стандартов",
    seniority: "Инженер по качеству / Специалист QA / Аудитор",
    skills: "Внимание к деталям + Аналитика + Ориентация на соблюдение"
  }
};

const App_translationsProcurement = {
  en: {
    speciality: "Procurement",
    sector: "Procurement / Sourcing / Vendor Management",
    function: "Purchasing / Supplier Management / Contract Negotiation",
    seniority: "Procurement Manager / Buyer / Specialist",
    skills: "Negotiation + Supplier Relations + Analytical"
  },
  fr: {
    speciality: "Achats",
    sector: "Approvisionnement / Sourcing / Gestion des Fournisseurs",
    function: "Achat / Gestion des Fournisseurs / Négociation de Contrats",
    seniority: "Manager des Achats / Acheteur / Spécialiste",
    skills: "Négociation + Relations Fournisseurs + Analytique"
  },
  ar: {
    speciality: "المشتريات",
    sector: "المشتريات / المصادر / إدارة الموردين",
    function: "الشراء / إدارة الموردين / التفاوض على العقود",
    seniority: "مدير المشتريات / مشتري / متخصص",
    skills: "تفاوض + علاقات الموردين + تحليلي"
  },
  es: {
    speciality: "Adquisiciones",
    sector: "Compras / Sourcing / Gestión de Proveedores",
    function: "Compras / Gestión de Proveedores / Negociación de Contratos",
    seniority: "Gerente de Compras / Comprador / Especialista",
    skills: "Negociación + Relaciones con Proveedores + Analítico"
  },
  zh: {
    speciality: "采购",
    sector: "采购 / 供应商管理 / 采购来源",
    function: "采购 / 供应商管理 / 合同谈判",
    seniority: "采购经理 / 采购员 / 专家",
    skills: "谈判 + 供应商关系 + 分析能力"
  },
  de: {
    speciality: "Beschaffung",
    sector: "Beschaffung / Sourcing / Lieferantenmanagement",
    function: "Einkauf / Lieferantenmanagement / Vertragsverhandlung",
    seniority: "Einkaufsleiter / Einkäufer / Spezialist",
    skills: "Verhandlung + Lieferantenbeziehungen + Analytisch"
  },
  pt: {
    speciality: "Aquisição",
    sector: "Compras / Sourcing / Gestão de Fornecedores",
    function: "Compra / Gestão de Fornecedores / Negociação de Contratos",
    seniority: "Gerente de Compras / Comprador / Especialista",
    skills: "Negociação + Relações com Fornecedores + Analítico"
  },
  ja: {
    speciality: "調達",
    sector: "調達 / ソーシング / ベンダー管理",
    function: "購買 / サプライヤー管理 / 契約交渉",
    seniority: "調達マネージャー / バイヤー / スペシャリスト",
    skills: "交渉力 + サプライヤー関係 + 分析力"
  },
  ru: {
    speciality: "Закупки",
    sector: "Закупки / Поиск поставщиков / Управление поставщиками",
    function: "Закупки / Управление поставщиками / Ведение контрактов",
    seniority: "Менеджер по закупкам / Закупщик / Специалист",
    skills: "Переговоры + Взаимоотношения с поставщиками + Аналитика"
  }
};

const App_translationsBusinessAnalyst = {
  en: {
    speciality: "Business Analyst",
    sector: "Business Analysis / Process Mapping / Requirements",
    function: "Requirements Gathering / Stakeholder Management / Process Improvement",
    seniority: "Analyst / Specialist / Consultant",
    skills: "Analytical + Problem-Solving + Communication"
  },
  fr: {
    speciality: "Analyste d'Affaires",
    sector: "Analyse d'Affaires / Cartographie des Processus / Exigences",
    function: "Collecte des Exigences / Gestion des Parties Prenantes / Amélioration des Processus",
    seniority: "Analyste / Spécialiste / Consultant",
    skills: "Analytique + Résolution de Problèmes + Communication"
  },
  ar: {
    speciality: "محلل أعمال",
    sector: "تحليل الأعمال / رسم خرائط العمليات / جمع المتطلبات",
    function: "جمع المتطلبات / إدارة أصحاب المصلحة / تحسين العمليات",
    seniority: "محلل / متخصص / مستشار",
    skills: "تحليلي + حل المشكلات + تواصل"
  },
  es: {
    speciality: "Analista de Negocios",
    sector: "Análisis de Negocios / Mapeo de Procesos / Requisitos",
    function: "Recopilación de Requisitos / Gestión de Stakeholders / Mejora de Procesos",
    seniority: "Analista / Especialista / Consultor",
    skills: "Analítico + Resolución de Problemas + Comunicación"
  },
  zh: {
    speciality: "业务分析师",
    sector: "业务分析 / 流程映射 / 需求",
    function: "需求收集 / 利益相关者管理 / 流程改进",
    seniority: "分析师 / 专家 / 顾问",
    skills: "分析能力 + 解决问题能力 + 沟通能力"
  },
  de: {
    speciality: "Business Analyst",
    sector: "Business Analyse / Prozessabbildung / Anforderungen",
    function: "Anforderungserhebung / Stakeholder-Management / Prozessverbesserung",
    seniority: "Analyst / Spezialist / Berater",
    skills: "Analytisch + Problemlösung + Kommunikation"
  },
  pt: {
    speciality: "Analista de Negócios",
    sector: "Análise de Negócios / Mapeamento de Processos / Requisitos",
    function: "Coleta de Requisitos / Gestão de Stakeholders / Melhoria de Processos",
    seniority: "Analista / Especialista / Consultor",
    skills: "Analítico + Resolução de Problemas + Comunicação"
  },
  ja: {
    speciality: "ビジネスアナリスト",
    sector: "ビジネス分析 / プロセスマッピング / 要件",
    function: "要件収集 / ステークホルダー管理 / プロセス改善",
    seniority: "アナリスト / スペシャリスト / コンサルタント",
    skills: "分析力 + 問題解決力 + コミュニケーション力"
  },
  ru: {
    speciality: "Бизнес-аналитик",
    sector: "Бизнес-анализ / Картирование процессов / Требования",
    function: "Сбор требований / Управление заинтересованными сторонами / Улучшение процессов",
    seniority: "Аналитик / Специалист / Консультант",
    skills: "Аналитика + Решение проблем + Коммуникация"
  }
};

const App_translationsConsulting = {
  en: {
    speciality: "Consulting",
    sector: "Consulting / Strategy / Advisory",
    function: "Management Consulting / Problem Solving / Advisory Services",
    seniority: "Consultant / Senior Consultant / Advisor",
    skills: "Analytical + Strategic Thinking + Communication"
  },
  fr: {
    speciality: "Consulting",
    sector: "Consulting / Stratégie / Conseil",
    function: "Conseil en Management / Résolution de Problèmes / Services de Conseil",
    seniority: "Consultant / Consultant Senior / Conseiller",
    skills: "Analytique + Pensée Stratégique + Communication"
  },
  ar: {
    speciality: "استشارات",
    sector: "الاستشارات / الاستراتيجية / تقديم المشورة",
    function: "استشارات إدارية / حل المشكلات / خدمات استشارية",
    seniority: "مستشار / مستشار أول / خبير",
    skills: "تحليلي + تفكير استراتيجي + تواصل"
  },
  es: {
    speciality: "Consultoría",
    sector: "Consultoría / Estrategia / Asesoría",
    function: "Consultoría de Gestión / Resolución de Problemas / Servicios de Asesoría",
    seniority: "Consultor / Consultor Senior / Asesor",
    skills: "Analítico + Pensamiento Estratégico + Comunicación"
  },
  zh: {
    speciality: "咨询",
    sector: "咨询 / 战略 / 顾问服务",
    function: "管理咨询 / 解决问题 / 顾问服务",
    seniority: "顾问 / 高级顾问 / 顾问专家",
    skills: "分析能力 + 战略思维 + 沟通能力"
  },
  de: {
    speciality: "Consulting",
    sector: "Beratung / Strategie / Advisory",
    function: "Management Consulting / Problemlösung / Beratungsleistungen",
    seniority: "Berater / Senior Berater / Advisor",
    skills: "Analytisch + Strategisches Denken + Kommunikation"
  },
  pt: {
    speciality: "Consultoria",
    sector: "Consultoria / Estratégia / Assessoria",
    function: "Consultoria de Gestão / Resolução de Problemas / Serviços de Assessoria",
    seniority: "Consultor / Consultor Sênior / Assessor",
    skills: "Analítico + Pensamento Estratégico + Comunicação"
  },
  ja: {
    speciality: "コンサルティング",
    sector: "コンサルティング / 戦略 / アドバイザリー",
    function: "経営コンサルティング / 問題解決 / アドバイザリーサービス",
    seniority: "コンサルタント / シニアコンサルタント / アドバイザー",
    skills: "分析力 + 戦略的思考 + コミュニケーション力"
  },
  ru: {
    speciality: "Консалтинг",
    sector: "Консалтинг / Стратегия / Консультации",
    function: "Управленческий консалтинг / Решение проблем / Консультационные услуги",
    seniority: "Консультант / Старший консультант / Советник",
    skills: "Аналитика + Стратегическое мышление + Коммуникация"
  }
};

const App_translationsSpecialties = {
  logistics: App_translationsLogistics,
  project: App_translationsProject,
  data: App_translationsData,
  finance: App_translationsFinance,
  marketing: App_translationsMarketing,
  sales: App_translationsSales,
  hr: App_translationsHR,
  it: App_translationsIT,
  design: App_translationsDesign,
  engineering: App_translationsEngineering,
  customerSupport: App_translationsCustomerSupport,
  healthcare: App_translationsHealthcare,
  legal: App_translationsLegal,
  education: App_translationsEducation,
  research: App_translationsResearch,
  operations: App_translationsOperations,
  quality: App_translationsQuality,
  procurement: App_translationsProcurement,
  businessAnalyst: App_translationsBusinessAnalyst,
  consulting: App_translationsConsulting,
};

const jobspecialityMap = [
  { id: "logistics", keywords: ["logistics", "supply chain", "warehouse", "inventory", "procurement", "distribution", "transportation"] },
  { id: "project", keywords: ["project management", "project planning", "scrum", "agile", "kanban"] },
  { id: "data", keywords: ["data analysis", "sql", "python", "machine learning", "ai", "analytics"] },
  { id: "finance", keywords: ["accounting", "finance", "budgeting", "financial analysis", "audit", "tax"] },
  { id: "marketing", keywords: ["marketing", "digital marketing", "seo", "content marketing", "social media", "branding"] },
  { id: "sales", keywords: ["sales", "business development", "account management", "crm", "negotiation"] },
  { id: "hr", keywords: ["human resources", "recruitment", "talent acquisition", "training", "employee relations"] },
  { id: "it", keywords: ["software development", "it support", "programming", "networking", "systems administration"] },
  { id: "design", keywords: ["graphic design", "ui", "ux", "illustration", "photoshop", "adobe"] },
  { id: "engineering", keywords: ["mechanical", "electrical", "civil engineering", "design engineering", "manufacturing"] },
  { id: "customerSupport", keywords: ["customer service", "support", "client relations", "helpdesk", "technical support"] },
  { id: "healthcare", keywords: ["nursing", "medical", "pharmacy", "healthcare", "clinic", "patient care"] },
  { id: "legal", keywords: ["law", "legal", "contracts", "compliance", "litigation"] },
  { id: "education", keywords: ["teaching", "training", "education", "lecturer", "curriculum"] },
  { id: "research", keywords: ["research", "lab", "scientific", "analysis", "experiments"] },
  { id: "operations", keywords: ["operations", "process improvement", "production", "supply chain operations", "manufacturing"] },
  { id: "quality", keywords: ["quality control", "qa", "qc", "testing", "standards compliance"] },
  { id: "procurement", keywords: ["procurement", "purchasing", "vendor management", "sourcing", "contract negotiation"] },
  { id: "businessAnalyst", keywords: ["business analysis", "requirements gathering", "process mapping", "stakeholder"] },
  { id: "consulting", keywords: ["consulting", "advisory", "strategy", "management consulting", "problem solving"] }
];

function cvbAnalyzeJobspeciality(jobText) {
  const specialityResultContainer = document.getElementById("cvb-joboffer-subProgress");
  if (specialityResultContainer) specialityResultContainer.style.height = "auto";
  if (specialityResultContainer) specialityResultContainer.style.marginBottom = "15px";

  const container = document.getElementById("cvb-job-speciality-result");
  container.innerHTML = "";
  container.style.display = "block";

  const lang = getCurrentLang();

  const lowerText = jobText.toLowerCase();
  let detected = null;

  for (const spec of jobspecialityMap) {
    for (const kw of spec.keywords) {
      const variants = keywordGroups?.[kw] || [kw];
      if (groupMatch(lowerText, variants)) {
        detected = spec;
        break;
      }
    }
    if (detected) break;
  }

  if (!detected) {
    container.innerHTML = `<p style="color:#555;font-style:italic;">${lang === 'fr' ? 'Aucune spécialité détectée.' : lang === 'ar' ? 'لم يتم اكتشاف تخصص واضح.' : 'No clear job speciality detected.'}</p>`;
    return;
  }

  const id = detected.id;

  const T = {
    ...App_translationsLabels[lang],
    ...App_translationsSpecialties[id]?.[lang]
  };

  const card = document.createElement("div");
  card.className = "speciality-card";
  card.dataset.specialityId = id;

  card.innerHTML = `
    <h3>${T["title-breakdown"]}</h3>
    <p><strong>${T["label-speciality"]}:</strong> <span class="badge">${T.speciality}</span></p>
    <p><strong>${T["label-sector"]}:</strong> ${T.sector}</p>
    <p><strong>${T["label-function"]}:</strong> ${T.function}</p>
    <p><strong>${T["label-seniority"]}:</strong> <span class="badge">${T.seniority}</span></p>
    <p><strong>${T["label-skills"]}:</strong> ${T.skills}</p>
    <p style="margin-top:12px; font-weight:600; color:#0061ff;">
      ${T["label-requires"]}: ${T.speciality.split(" (")[0]}, ${T.seniority}
    </p>
  `;
  container.appendChild(card);
}

function cvbRefreshspecialityTranslation() {
  const container = document.getElementById("cvb-job-speciality-result");
  const card = container?.querySelector(".speciality-card");
  if (!card) return;

  const id = card.dataset.specialityId;
  if (!id) return;

  const lang =
    document.querySelector('#languageSelectorSidebar')?.getAttribute('data-selected') ||
    sessionStorage.getItem('mynextcv-language') ||
    'en';

  const T = {
    ...App_translationsLabels[lang],
    ...App_translationsSpecialties[id]?.[lang]
  };

  card.innerHTML = `
    <h3>${T["title-breakdown"]}</h3>
    <p><strong>${T["label-speciality"]}:</strong> <span class="badge">${T.speciality}</span></p>
    <p><strong>${T["label-sector"]}:</strong> ${T.sector}</p>
    <p><strong>${T["label-function"]}:</strong> ${T.function}</p>
    <p><strong>${T["label-seniority"]}:</strong> <span class="badge">${T.seniority}</span></p>
    <p><strong>${T["label-skills"]}:</strong> ${T.skills}</p>
    <p style="margin-top:12px; font-weight:600; color:#0061ff;">
      ${T["label-requires"]}: ${T.speciality.split(" (")[0]}, ${T.seniority}
    </p>
  `;
}

async function cvbAddProgressBars(jobText) {
  const container = document.getElementById("cvb-premium-progress-section");
  if (!container) return;

  container.innerHTML = "";

  const languageSelect = document.querySelector('#languageSelectorSidebar');
  const selectedLang =
    languageSelect?.getAttribute('data-selected') ||
    sessionStorage.getItem('mynextcv-language') ||
    'en';

  const T = App_translations[selectedLang] || App_translations['en'];

  const categories = [
    { id: "#cvb-exp-content .cvb-tab-pane", key: "exp-title", defaultName: "Experience" },
    { id: "#cvb-edu-content .cvb-tab-pane", key: "edu-title", defaultName: "Education" },
    { id: "#cvb-cert-content .cvb-tab-pane", key: "cert-title", defaultName: "Certifications" },
    { id: "#cvb-tech-skills-list .navCard-requiresGroup", key: "skills-title", defaultName: "Skills" },
    { id: "#cvb-soft-skills-list .navCard-requiresGroup", key: "skills-title-lang", defaultName: "Languages" },
    { id: "#cvb-interests-list .navCard-requiresGroup", key: "interests-title", defaultName: "Interests" }
  ];

  const normalizedJobText = jobText.toLowerCase();

  for (const cat of categories) {
    let total = 0;
    let matched = 0;

    const items = document.querySelectorAll(cat.id);
    items.forEach(item => {
      total++;
      const text = Array.from(item.querySelectorAll("input, textarea"))
        .map(el => el.value)
        .join(" ")
        .toLowerCase();

      if (!text.trim()) return;

      let matchFound = false;
      for (const [_, variants] of Object.entries(keywordGroups)) {
        if (groupMatch(normalizedJobText, variants) && groupMatch(text, variants)) {
          matchFound = true;
          break;
        }
      }
      if (matchFound) matched++;
    });

    const percent = total > 0 ? Math.round((matched / total) * 100) : 0;

    // Get translated name
    const translatedName = T[cat.key] || cat.defaultName;

    // Build progress bar DOM
    const wrapper = document.createElement("div");
    wrapper.className = "cvb-premium-progress";

    wrapper.innerHTML = `
      <div class="cvb-premium-progress-label">
        <span>${translatedName}</span>
        <span>${percent}%</span>
      </div>
      <div class="cvb-premium-progress-bar-wrapper">
        <div class="cvb-premium-progress-bar" style="width:${percent}%"></div>
      </div>
    `;

    container.appendChild(wrapper);
  }
}

document.getElementById("cvb-clear-joboffer").addEventListener("click", () => {
  // Clear textarea
  const textarea = document.getElementById("cvb-joboffer-text");
  if (textarea) textarea.value = "";

  // Clear key needs
  const keyNeedsContainer = document.getElementById("cvb-keyneeds-list");
  const keyNeedsWrapper = document.getElementById("cvb-joboffer-keyneeds");
  if (keyNeedsContainer) keyNeedsContainer.innerHTML = "";
  if (keyNeedsWrapper) keyNeedsWrapper.style.display = "none";

  // Reset main progress bar
  const progressBar = document.getElementById("cvb-joboffer-progress-bar");
  const progressLabel = document.getElementById("cvb-joboffer-progress-label");
  if (progressBar) progressBar.style.width = "0%";
  if (progressLabel) progressLabel.textContent = "0% Corresponding to selected";

  // Clear speciality results
  const specialityResult = document.getElementById("cvb-job-speciality-result");
  if (specialityResult) specialityResult.innerHTML = "";
  const specialityResultContainer = document.getElementById("cvb-joboffer-subProgress");
  if (specialityResultContainer) specialityResultContainer.style.height = "0";
  if (specialityResultContainer) specialityResultContainer.style.marginBottom = "0";

  // Clear premium progress bars
  const premiumContainer = document.getElementById("cvb-premium-progress-section");
  if (premiumContainer) premiumContainer.innerHTML = "";

  // Reset checkboxes style and state
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.style.outline = "";
    cb.style.backgroundColor = "";
  });
});

// =================================== Colors Suggestion ====================================

const suggestedColors = [
    { name: "Sage Green", value: "#9BA17B" },           // earthy and fresh
    { name: "Midnight Blue", value: "#2E3A59" },        // sleek and modern
    { name: "Blush Coral", value: "#F27D72" },          // subtle, creative
    { name: "Deep Plum", value: "#5c476b" },
    { name: "Charcoal Blue", value: "#3B4C5C" },        // professional depth
    { name: "Modern Terracotta", value: "#D96C4F" },    // earthy and bold
    { name: "Graphite Gray", value: "#4A4A4A" },        // ultra readable
    { name: "Forest Green", value: "#395144" },         // nature and trust
    { name: "Cobalt Blue", value: "#0047AB" },          // energetic corporate
    { name: "Soft Black", value: "#2B2B2B" },           // luxury contrast
    { name: "Sunset Orange", value: "#FF6B35" },        // creative pop
    { name: "Pacific Teal", value: "#358F80" },         // modern and fresh
    { name: "Royal Burgundy", value: "#582534" },       // premium and bold
];

const colorDropdown = document.getElementById('cvb-color-dropdown');
const colorSelected = document.getElementById('cvb-color-selected');
const optionsContainer = document.getElementById('cvb-color-options');
const colorInput = document.getElementById('cvb-theme-color');

suggestedColors.forEach(color => {
    const option = document.createElement('div');
    option.className = 'cvb-color-option';
    option.innerHTML = `
      <span class="cvb-color-sample" style="background-color: ${color.value}"></span>
      <span class="cvb-color-name">${color.name}</span>
    `;
    option.dataset.color = color.value;
    option.dataset.label = color.name;
    option.addEventListener('click', () => {
      colorSelected.innerHTML = `
        <span class="cvb-color-sample" style="background-color: ${color.value}"></span>
        <span class="cvb-color-name">${color.name}</span>
      `;
      colorInput.value = color.value;
      document.documentElement.style.setProperty('--cv-theme-color', color.value);
      optionsContainer.style.display = 'none';
    });
    optionsContainer.appendChild(option);
});

colorSelected.addEventListener('click', () => {
    const isOpen = optionsContainer.style.display === 'block';
    optionsContainer.style.display = isOpen ? 'none' : 'block';
});

colorInput.addEventListener('input', () => {
    colorSelected.innerHTML = `
      <span class="cvb-color-sample" style="background-color: ${colorInput.value}"></span>
      <span class="cvb-color-name">Custom Color</span>
    `;
    document.documentElement.style.setProperty('--cv-theme-color', colorInput.value);
});

document.addEventListener('click', (e) => {
    if (!colorDropdown.contains(e.target)) {
      optionsContainer.style.display = 'none';
    }
});

// ================================= CV Sections Creation =================================

let educationCount = 0;
let experienceCount = 0;
let skillCounters = { tech: 0, soft: 0 };
let certCount = 0;
let interestCount = 0;

function cvbAddExperienceSection() {
  experienceCount++;
  const tabId = `exp-${experienceCount}`;
  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];

  // Create tab button
  const tabButton = document.createElement('button');
  tabButton.className = 'navCard-button';
  tabButton.textContent = `${T["exp-jobtitle"]} ${experienceCount}`;
  tabButton.setAttribute('data-tab-id', tabId);
  tabButton.onclick = () => cvbSwitchTab(tabId, 'cvb-exp');
  document.getElementById('cvb-exp-tabs').appendChild(tabButton);

  // Create pane
  const pane = document.createElement('div');
  pane.className = 'cvb-tab-pane';
  pane.id = tabId;

  const jobInputId = `job-${experienceCount}`;

  pane.innerHTML = `
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["exp-jobtitle"]}</label>
        <input type="text" id="${jobInputId}" placeholder="Logistics Coordinator, Project Manager..." 
               oninput="cvbUpdateExperienceTabTitle('${tabId}', this.value); refreshCVProgress();" />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["exp-company"]}</label>
        <input type="text" placeholder="Amazon, Deloitte, StartupX..." oninput="refreshCVProgress()" />
      </div>
    </div>
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["exp-start"]}</label>
        <input type="date" placeholder="Select start date" onchange="refreshCVProgress()" />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["exp-end"]}</label>
        <input type="date" placeholder="Select end date" onchange="refreshCVProgress()" />
      </div>
    </div>
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["exp-location"]}</label>
        <input type="text" placeholder="California, USA..." oninput="refreshCVProgress()" />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["exp-type"]}</label>
        <input type="text" placeholder="CDD, Freelance, Internship, CDI..." oninput="refreshCVProgress()" />
      </div>
    </div>
    <div class="navCard-inputGroup">
      <label>${T["exp-resp"]}</label>
      <textarea placeholder="Describe your key responsibilities & achievements..." oninput="refreshCVProgress()"></textarea>
    </div>
    <div class="cvb-skill-progress-container">
      <input type="checkbox" checked title="${T["all-chooseTitle"]}" onchange="refreshCVProgress()" />
      <label>${T["exp-choose"]}</label>

      <button type="button" class="navCard-btnDelete" onclick="cvbDeleteExperienceSection('${tabId}')">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  `;

  document.getElementById('cvb-exp-content').appendChild(pane);
  cvbSwitchTab(tabId, 'cvb-exp');

  // Trigger progress refresh after adding
  refreshCVProgress();
}
function cvbDeleteExperienceSection(tabId) {
  const pane = document.getElementById(tabId);
  if (pane) pane.remove();
  const tabButton = document.querySelector(`#cvb-exp-tabs .navCard-button[data-tab-id="${tabId}"]`);
  if (tabButton) tabButton.remove();
  const firstTab = document.querySelector("#cvb-exp-tabs .navCard-button");
  if (firstTab) {
    const firstTabId = firstTab.getAttribute("data-tab-id");
    cvbSwitchTab(firstTabId, "cvb-exp");
  }
  refreshCVProgress();
}
function cvbUpdateExperienceTabTitle(tabId, value) {
  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];
  const tabButtons = document.querySelectorAll(`#cvb-exp-tabs .navCard-button`);
  tabButtons.forEach(button => {
    if (button.getAttribute('data-tab-id') === tabId) {
      button.textContent = value.trim() !== '' ? value : T["exp-unnamed"];
    }
  });
  refreshCVProgress();
}
  
function cvbAddEducationSection() {
  educationCount++;
  const tabId = `edu-${educationCount}`;

  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];

  const tabButton = document.createElement('button');
  tabButton.className = 'navCard-button';
  const defaultLabel = T["edu-default"].replace("{n}", educationCount);
  tabButton.textContent = defaultLabel;
  tabButton.setAttribute('data-tab-id', tabId);
  tabButton.onclick = () => cvbSwitchTab(tabId, 'cvb-edu');
  document.getElementById('cvb-edu-tabs').appendChild(tabButton);

  const pane = document.createElement('div');
  pane.className = 'cvb-tab-pane';
  pane.id = tabId;

  const degreeInputId = `degree-${educationCount}`;
  pane.innerHTML = `
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["edu-degree"]}</label>
        <input type="text" id="${degreeInputId}" 
               placeholder="Bachelor in Logistics, MBA..." 
               oninput="cvbUpdateTabTitle('${tabId}', this.value)" />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["edu-institution"]}</label>
        <input type="text" placeholder="Harvard University, HEC Paris..." />
      </div>
    </div>
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["edu-start"]}</label>
        <input type="date" placeholder="Select start date" />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["edu-end"]}</label>
        <input type="date" placeholder="Select end date" />
      </div>
    </div>
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["edu-location"]}</label>
        <input type="text" placeholder="USA, France, Canada..." />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["edu-honors"]}</label>
        <input type="text" placeholder="Honors, awards, mention..." />
      </div>
    </div>
    <div class="cvb-skill-progress-container">
      <label style="display: contents; margin-right: 10px;">
        <input type="checkbox" checked title="${T["all-chooseTitle"]}" />
        ${T["edu-choose"]}
      </label>

      <button type="button" class="navCard-btnDelete" onclick="cvbDeleteEducationSection('${tabId}')">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  `;

  document.getElementById('cvb-edu-content').appendChild(pane);
  cvbSwitchTab(tabId, 'cvb-edu');

  pane.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", refreshCVProgress);
    input.addEventListener("change", refreshCVProgress);
  });

  refreshCVProgress();
}
function cvbDeleteEducationSection(tabId) {
  const pane = document.getElementById(tabId);
  if (pane) pane.remove();

  const tabButton = document.querySelector(`#cvb-edu-tabs .navCard-button[data-tab-id="${tabId}"]`);
  if (tabButton) tabButton.remove();

  const firstTab = document.querySelector("#cvb-edu-tabs .navCard-button");
  if (firstTab) {
    const firstTabId = firstTab.getAttribute("data-tab-id");
    cvbSwitchTab(firstTabId, "cvb-edu");
  }

  refreshCVProgress();
}
function cvbUpdateTabTitle(tabId, value) {
  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];

  const tabButtons = document.querySelectorAll(`#cvb-edu-tabs .navCard-button`);
  tabButtons.forEach(button => {
    if (button.getAttribute('data-tab-id') === tabId) {
      button.textContent = value.trim() !== '' ? value : T["edu-unnamed"];
    }
  });

  refreshCVProgress();
}

function cvbAddCertSection() {
  certCount++;
  const tabId = `cert-${certCount}`;

  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];

  // Create tab button
  const tabButton = document.createElement('button');
  tabButton.className = 'navCard-button';
  tabButton.textContent = T["cert-default"].replace("{n}", certCount);
  tabButton.setAttribute('data-tab-id', tabId);
  tabButton.onclick = () => cvbSwitchTab(tabId, 'cvb-cert');
  document.getElementById('cvb-cert-tabs').appendChild(tabButton);

  // Create tab content pane
  const pane = document.createElement('div');
  pane.className = 'cvb-tab-pane';
  pane.id = tabId;

  const descInputId = `cert-desc-${certCount}`;
  pane.innerHTML = `
    <div class="navCard-inputGroup">
      <label>${T["cert-desc"]}</label>
      <input type="text" id="${descInputId}" 
             placeholder="Data Analysis with Python, PMP Certification..." 
             oninput="cvbUpdateCertTabTitle('${tabId}', this.value)" />
    </div>
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["cert-institution"]}</label>
        <input type="text" placeholder="Coursera, Microsoft, PMI..." />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["cert-id"]}</label>
        <input type="text" placeholder="Enter certificate ID" />
      </div>
    </div>
    <div class="navCard-inputGroup_x2">
      <div class="navCard-inputGroup">
        <label>${T["cert-start"]}</label>
        <input type="date" placeholder="Select start date" />
      </div>
      <div class="navCard-inputGroup">
        <label>${T["cert-end"]}</label>
        <input type="date" placeholder="Select end date" />
      </div>
    </div>
    <div class="navCard-inputGroup">
      <label>${T["cert-location"]}</label>
      <input type="text" placeholder="Online, Paris, France..." />
    </div>
    <div class="cvb-skill-progress-container">
      <label style="display: contents; margin-right: 10px;">
        <input type="checkbox" checked title="${T["all-chooseTitle"]}" />
        ${T["cert-choose"]}
      </label>
      <button type="button" class="navCard-btnDelete" onclick="cvbDeleteCertSection('${tabId}')">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  `;

  document.getElementById('cvb-cert-content').appendChild(pane);
  cvbSwitchTab(tabId, 'cvb-cert');

  pane.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", refreshCVProgress);
    input.addEventListener("change", refreshCVProgress);
  });

  refreshCVProgress();
}
function cvbDeleteCertSection(tabId) {
  const pane = document.getElementById(tabId);
  if (pane) pane.remove();

  const tabButton = document.querySelector(`#cvb-cert-tabs .navCard-button[data-tab-id="${tabId}"]`);
  if (tabButton) tabButton.remove();

  const firstTab = document.querySelector("#cvb-cert-tabs .navCard-button");
  if (firstTab) {
    const firstTabId = firstTab.getAttribute("data-tab-id");
    cvbSwitchTab(firstTabId, "cvb-cert");
  }

  refreshCVProgress();
}
function cvbUpdateCertTabTitle(tabId, value) {
  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];

  const tabButtons = document.querySelectorAll(`#cvb-cert-tabs .navCard-button`);
  tabButtons.forEach(button => {
    if (button.getAttribute('data-tab-id') === tabId) {
      button.textContent = value.trim() !== '' ? value : T["cert-unnamed"];
    }
  });

  refreshCVProgress();
}
  
function cvbAddSkill(type) {
  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];

  const listId = type === 'tech' ? 'cvb-tech-skills-list' : 'cvb-soft-skills-list';
  const container = document.getElementById(listId);
  const skillIndex = ++skillCounters[type];
  const skillId = `${type}-skill-${skillIndex}`;

  const div = document.createElement('div');
  div.className = 'navCard-requiresGroup';
  div.id = skillId;

  // checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = true;
  checkbox.title = T["all-chooseTitle"];
  checkbox.onchange = refreshCVProgress;

  // input
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = type === 'soft' ? "English, French, Spanish..." : "Communication, social media, distribution...";
  input.name = `${skillId}-name`;
  input.addEventListener('input', refreshCVProgress);

  // rating group
  const ratingGroup = document.createElement('div');
  ratingGroup.className = 'navCard-requiresScore';
  ratingGroup.style.flexWrap = 'nowrap';

  for (let i = 1; i <= 5; i++) {
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = `${skillId}-score`;
    radio.id = `${skillId}-score-${i}`;
    radio.value = i;
    radio.addEventListener('change', refreshCVProgress);

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
    refreshCVProgress();
  };

  // assemble
  div.appendChild(checkbox);
  div.appendChild(input);
  div.appendChild(ratingGroup);
  div.appendChild(deleteBtn);

  container.appendChild(div);

  refreshCVProgress();
}

function cvbAddInterest() {
  const lang = sessionStorage.getItem('mynextcv-language') || 'en';
  const T = App_translations[lang] || App_translations['en'];

  interestCount++;
  const list = document.getElementById("cvb-interests-list");

  const div = document.createElement("div");
  div.className = "navCard-requiresGroup";
  div.id = `interest-${interestCount}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;
  checkbox.title = T["interests-checkbox-tip"];
  checkbox.onchange = refreshCVProgress;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Interest...";
  input.name = `interest-${interestCount}`;
  input.addEventListener("input", refreshCVProgress);

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'navCard-btnDelete';
  deleteBtn.innerHTML = `<i class="ri-delete-bin-line"></i>`;
  deleteBtn.onclick = () => {
    div.remove();
    refreshCVProgress();
  };

  div.appendChild(checkbox);
  div.appendChild(input);
  div.appendChild(deleteBtn);

  list.appendChild(div);

  refreshCVProgress();
}

window.cvbAddExperienceSection = cvbAddExperienceSection;
window.cvbDeleteExperienceSection = cvbDeleteExperienceSection;
window.cvbUpdateExperienceTabTitle = cvbUpdateExperienceTabTitle;

window.cvbAddEducationSection = cvbAddEducationSection;
window.cvbDeleteEducationSection = cvbDeleteEducationSection;
window.cvbUpdateTabTitle = cvbUpdateTabTitle;

window.cvbAddCertSection = cvbAddCertSection;
window.cvbDeleteCertSection = cvbDeleteCertSection;
window.cvbUpdateCertTabTitle = cvbUpdateCertTabTitle;

window.cvbAddSkill = cvbAddSkill;
window.cvbAddInterest = cvbAddInterest;

function filterCVs(category) {
  const filters = document.querySelectorAll('.cv-style-filter');
  filters.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === category);
  });

  const items = document.querySelectorAll('.cv-style-captioned');

  items.forEach(item => {
    const altText = item.querySelector('img')?.alt.toLowerCase() || '';

    const match =
      category === 'all' ||
      altText.includes(`(${category.toLowerCase()})`);

    item.style.display = match ? 'flex' : 'none';
  });
}
document.querySelectorAll(".cv-style-filter").forEach(btn => {
  btn.addEventListener("click", () => {
    const category = btn.dataset.filter;
    filterCVs(category);
  });
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
  Menu_translatePage(lang);
  Steps_translatePage(lang);
  translateHelpModal(lang);
  App_translateDynamicSectionLabels(lang);
  App_translatePage(lang);
  App_translateExclusive(lang);
  App_translateAnalyzer(lang);
  App_refreshProgressBarTranslations();
  App_translatePreview(lang);

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

function Menu_translatePage(lang) {
  const t = Menu_translations[lang] || Menu_translations['en'];

  const appActions = document.querySelector('#cvb-app-actions');
  if (appActions) {
    const [saveBtn, reloadBtn, clearBtn, downloadBtn] = appActions.querySelectorAll('button');
    if (saveBtn) saveBtn.innerHTML = `<i class="ri-upload-line"></i> ${t["app-save"]}`;
    if (reloadBtn) reloadBtn.innerHTML = `<i class="ri-download-cloud-2-line"></i> ${t["app-reload"]}`;
    if (clearBtn) clearBtn.innerHTML = `<i class="ri-restart-line"></i> ${t["app-clear"]}`;
    if (downloadBtn) downloadBtn.innerHTML = `<i class="ri-file-pdf-line"></i> ${t["app-download"]}`;
  }

  const mobileButtons = document.querySelectorAll('.cvb-mobile-nav button');
  if (mobileButtons.length >= 3) {
    const cvBtn = mobileButtons[0];
    const jobBtn = mobileButtons[1];
    const themeBtn = mobileButtons[2];

    cvBtn.querySelector('h4').textContent = t["mobile-cv-title"];
    cvBtn.querySelector('p').textContent = t["mobile-cv-desc"];

    jobBtn.querySelector('h4').textContent = t["mobile-job-title"];
    jobBtn.querySelector('p').textContent = t["mobile-job-desc"];

    themeBtn.querySelector('h4').textContent = t["mobile-theme-title"];
    themeBtn.querySelector('p').textContent = t["mobile-theme-desc"];
  }
}

function Steps_translatePage(lang) {
  const t = Steps_translations[lang] || Steps_translations['en'];

  const progressTitle = document.querySelector('.progressBar-title');
  if (progressTitle) progressTitle.textContent = t["progress-title"];
  
  const progressDesc = document.querySelector('.progressBar-description');
  if (progressDesc) progressDesc.textContent = t["progress-desc"];
  
  const stepKeyMap = {
    Personals: "progress-personals",
    Experience: "progress-experience",
    Education: "progress-education",
    Certifications: "progress-certifications",
    Skills: "progress-skills",
    Languages: "progress-languages",
    Interests: "progress-interests"
  };

  const steps = document.querySelectorAll('#progressBar .step');
  steps.forEach(step => {
    const label = step.querySelector('.label');
    if (!label) return;
    const key = stepKeyMap[step.dataset.step];
    if (t[key]) label.textContent = t[key];
  });
}

function App_translatePage(lang) {
  const t = App_translations[lang] || App_translations['en'];

  // Tabs
  document.querySelector('[data-target="#cvb-personal"]').innerHTML = `<i class="ri-user-line"></i> ${t["tab-personal"]}`;
  document.querySelector('[data-target="#cvb-exp-section"]').innerHTML = `<i class="ri-briefcase-line"></i> ${t["tab-exp"]}`;
  document.querySelector('[data-target="#cvb-edu-section"]').innerHTML = `<i class="ri-graduation-cap-line"></i> ${t["tab-edu"]}`;
  document.querySelector('[data-target="#cvb-cert-section"]').innerHTML = `<i class="ri-award-line"></i> ${t["tab-cert"]}`;
  document.querySelector('[data-target="#cvb-skills-section"]').innerHTML = `<i class="ri-code-s-slash-line"></i> ${t["tab-skills"]}`;
  document.querySelector('[data-target="#cvb-interests"]').innerHTML = `<i class="ri-heart-line"></i> ${t["tab-interests"]}`;

  // Personal Info
  document.querySelector('#cvb-personal h2').textContent = t["personal-title"];
  document.querySelector('label[for="cvb-photo"]').textContent = t["photo-label"];
  document.querySelector('#cvb-photo + p').textContent = t["photo-tip"];
  document.querySelector('label[for="cvb-fullName"]').textContent = t["fullname-label"];
  document.querySelector('label[for="cvb-phone"]').textContent = t["phone-label"];
  document.querySelector('label[for="cvb-email"]').textContent = t["email-label"];
  document.querySelector('label[for="cvb-linkedin"]').textContent = t["linkedin-label"];
  document.querySelector('label[for="cvb-address"]').textContent = t["address-label"];
  document.querySelector('label[for="cvb-speciality"]').textContent = t["speciality-label"];
  document.querySelector('label[for="cvb-summary-text"]').textContent = t["summary-label"];

  // Experience
  document.querySelector('#cvb-exp-section h2').textContent = t["exp-title"];
  document.querySelector('#cvb-exp-section .navCard-btn').textContent = t["exp-add"];

  // Education
  document.querySelector('#cvb-edu-section h2').textContent = t["edu-title"];
  document.querySelector('#cvb-edu-section .navCard-btn').textContent = t["edu-add"];

  // Certifications
  document.querySelector('#cvb-cert-section h2').textContent = t["cert-title"];
  document.querySelector('#cvb-cert-section .navCard-btn').textContent = t["cert-add"];

  // Skills
  document.querySelector('#cvb-skills > h2').textContent = t["skills-title"];
  document.querySelector('#cvb-skills > .navCard-inputGroup .navCard-btn').textContent = t["skills-add-tech"];

  // Languages
  document.querySelector('#cvb-skills .cvb-section-Languages h2').textContent = t["skills-title-lang"];
  document.querySelector('#cvb-skills .cvb-section-Languages .navCard-btn').textContent = t["skills-add-lang"];

  // Interests
  document.querySelector('#cvb-interests h2').textContent = t["interests-title"];
  document.querySelector('#cvb-interests .navCard-btn').textContent = t["interests-add"];

  // Import/Export
  document.querySelector('label[for="cvbImportFromExcel"]').textContent = t["import-excel"];
  document.querySelector('.import-container span').innerHTML = `<i class="ri-folder-open-line"></i> ${t["browse"]}`;
  document.querySelector('#cvbExportTemplate').textContent = t["download-template"];
}

function App_translateExclusive(lang) {
  const t = App_translationsExclusive[lang] || App_translationsExclusive['en'];
  const exclusiveContainer = document.getElementById('exclusive-CoinsOnFirstSave');
  if (exclusiveContainer) {
    exclusiveContainer.querySelector('p').innerHTML = t["exclusive-firstSave"];
  }
}

function App_translateAnalyzer(lang) {
  const t = App_translationsAnalyzer[lang] || App_translationsAnalyzer['en'];

  document.querySelector('#cvb-joboffer .cvb-joboffer-title').textContent = t["joboffer-title"];
  document.querySelector('#cvb-joboffer .cvb-joboffer-subtitle').textContent = t["joboffer-subtitle"];
  document.querySelector('#cvb-joboffer-keyneeds strong').textContent = t["joboffer-keyneeds"];
  const progressLabel = document.getElementById('cvb-joboffer-progress-label');
  if (progressLabel) {
    const currentText = progressLabel.textContent || "0%";
    const numberMatch = currentText.match(/^(\d+%)/);
    const numberPart = numberMatch ? numberMatch[1] : "0%";
    progressLabel.textContent = `${numberPart} ${t["joboffer-progress"]}`;
  }
  const analyzeText = document.querySelector('#AnalyzeJobOfferMatch span');
  const selectText = document.querySelector('#SelectJobOfferMatch span');
  const analyzeCoins = document.querySelector('#AnalyzeJobOfferMatch small');
  const selectCoins = document.querySelector('#SelectJobOfferMatch small');
  if (analyzeText) analyzeText.textContent = t["joboffer-analyze"];
  if (selectText) selectText.textContent = t["joboffer-select"];
  if (analyzeCoins) analyzeCoins.innerHTML = `<i class="ri-coin-fill"></i> ${t["coins_2"]}`;
  if (selectCoins) selectCoins.innerHTML = `<i class="ri-coin-fill"></i> ${t["coins_5"]}`;
  document.querySelector('#cvb-ai-loading').childNodes[0].textContent = t["joboffer-analyzing"];
  const clearBtn = document.getElementById("cvb-clear-joboffer");
  if (clearBtn) clearBtn.innerHTML = `<i class="ri-restart-line"></i> ${t["joboffer-clear"]}`;
}

function App_refreshProgressBarTranslations() {
  const container = document.getElementById("cvb-premium-progress-section");
  if (!container) return;

  // detect selected language
  const languageSelect = document.querySelector('#languageSelectorSidebar');
  const selectedLang =
    languageSelect?.getAttribute('data-selected') ||
    sessionStorage.getItem('mynextcv-language') ||
    'en';

  const T = App_translations[selectedLang] || App_translations['en'];

  const categories = [
    { key: "exp-title", defaultName: "Experience" },
    { key: "edu-title", defaultName: "Education" },
    { key: "cert-title", defaultName: "Certifications" },
    { key: "skills-title", defaultName: "Skills" },
    { key: "skills-title-lang", defaultName: "Languages" },
    { key: "interests-title", defaultName: "Interests" }
  ];

  // Get all progress labels in the same order they were generated
  const labels = container.querySelectorAll(".cvb-premium-progress-label span:first-child");

  labels.forEach((label, index) => {
    const cat = categories[index];
    if (!cat) return;
    label.textContent = T[cat.key] || cat.defaultName;
  });
}

function App_translatePreview(lang) {
  const t = App_translationsPreview[lang] || App_translationsPreview['en'];

  document.querySelector('#cvb-theme .cvb-color-title').textContent = t["theme-title"];
  document.querySelector('#cvb-theme .cvb-color-label').textContent = t["theme-select-label"];
  document.querySelector('.cvb-preview-sidebar button[onclick="previewSelectedCV()"]').title = t["preview-refresh"];
  document.querySelector('.cvb-preview-sidebar button[onclick="zoomInPreview()"]').title = t["preview-zoomIn"];
  document.querySelector('.cvb-preview-sidebar button[onclick="zoomOutPreview()"]').title = t["preview-zoomOut"];
  document.getElementById('cvb-save-consumption').title = t["preview-download-pdf"];
  document.getElementById('cvbExportToExcelResume').title = t["preview-download-excel"];

  const placeholder = document.querySelector('#cvb-preview-placeholder p');
  if (placeholder) placeholder.textContent = t["preview-placeholder"];
}

function App_translateDynamicSectionLabels(lang) {
  const T = App_translations[lang] || App_translations['en'];

  // Helper to update checkbox title
  function updateCheckboxTitle(containerSelector) {
    document.querySelectorAll(containerSelector).forEach(container => {
      const checkbox = container.querySelector('input[type="checkbox"]');
      if (checkbox) checkbox.title = T["all-chooseTitle"];
    });
  }

  // Experience sections
  document.querySelectorAll('#cvb-exp-content .cvb-tab-pane').forEach((pane, index) => {
    const labels = pane.querySelectorAll('label');
    if (labels[0]) labels[0].textContent = T["exp-jobtitle"];
    if (labels[1]) labels[1].textContent = T["exp-company"];
    if (labels[2]) labels[2].textContent = T["exp-start"];
    if (labels[3]) labels[3].textContent = T["exp-end"];
    if (labels[4]) labels[4].textContent = T["exp-location"];
    if (labels[5]) labels[5].textContent = T["exp-type"];
    if (labels[6]) labels[6].textContent = T["exp-resp"];

    const checkboxLabel = pane.querySelector('.cvb-skill-progress-container label');
    if (checkboxLabel) {
      checkboxLabel.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      checkboxLabel.append(` ${T["exp-choose"]}`);
    }
    updateCheckboxTitle('.cvb-skill-progress-container');
  });
  
  // Update Experience tab buttons
  document.querySelectorAll('#cvb-exp-tabs .navCard-button').forEach((btn, index) => {
    const pane = document.querySelector(`#cvb-exp-content .cvb-tab-pane:nth-child(${index+1}) input[type="text"]`);
    const value = pane && pane.value.trim();
    btn.textContent = value !== '' ? value : T["exp-unnamed"];
  });

  // Education sections
  document.querySelectorAll('#cvb-edu-content .cvb-tab-pane').forEach((pane, index) => {
    const labels = pane.querySelectorAll('label');
    if (labels[0]) labels[0].textContent = T["edu-degree"];
    if (labels[1]) labels[1].textContent = T["edu-institution"];
    if (labels[2]) labels[2].textContent = T["edu-start"];
    if (labels[3]) labels[3].textContent = T["edu-end"];
    if (labels[4]) labels[4].textContent = T["edu-location"];
    if (labels[5]) labels[5].textContent = T["edu-honors"];

    const checkboxLabel = pane.querySelector('.cvb-skill-progress-container label');
    if (checkboxLabel) {
      checkboxLabel.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      checkboxLabel.append(` ${T["edu-choose"]}`);
    }
    updateCheckboxTitle('.cvb-skill-progress-container');
  });
  
  // Update Education tab buttons
  document.querySelectorAll('#cvb-edu-tabs .navCard-button').forEach((btn, index) => {
    const pane = document.querySelector(`#cvb-edu-content .cvb-tab-pane:nth-child(${index+1}) input[type="text"]`);
    const value = pane && pane.value.trim();
    btn.textContent = value !== '' ? value : T["edu-unnamed"];
  });

  // Certifications sections
  document.querySelectorAll('#cvb-cert-content .cvb-tab-pane').forEach((pane, index) => {
    const labels = pane.querySelectorAll('label');
    if (labels[0]) labels[0].textContent = T["cert-desc"];
    if (labels[1]) labels[1].textContent = T["cert-institution"];
    if (labels[2]) labels[2].textContent = T["cert-id"];
    if (labels[3]) labels[3].textContent = T["cert-start"];
    if (labels[4]) labels[4].textContent = T["cert-end"];
    if (labels[5]) labels[5].textContent = T["cert-location"];

    const checkboxLabel = pane.querySelector('.cvb-skill-progress-container label');
    if (checkboxLabel) {
      checkboxLabel.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      checkboxLabel.append(` ${T["cert-choose"]}`);
    }
    updateCheckboxTitle('.cvb-skill-progress-container');
  });
  
  // Update Certification tab buttons
  document.querySelectorAll('#cvb-cert-tabs .navCard-button').forEach((btn, index) => {
    const pane = document.querySelector(`#cvb-cert-content .cvb-tab-pane:nth-child(${index+1}) input[type="text"]`);
    const value = pane && pane.value.trim();
    btn.textContent = value !== '' ? value : T["cert-unnamed"];
  });

  // Keep skills & interests placeholders as-is (unchanged)
  document.querySelectorAll('#cvb-tech-skills-list .navCard-requiresGroup input[type="checkbox"]').forEach(checkbox => {
    checkbox.title = T["skills-checkbox-tip"];
  });
  document.querySelectorAll('#cvb-soft-skills-list .navCard-requiresGroup input[type="checkbox"]').forEach(checkbox => {
    checkbox.title = T["skills-checkbox-tip"];
  });
  document.querySelectorAll('#cvb-interests-list .navCard-requiresGroup input[type="checkbox"]').forEach(checkbox => {
    checkbox.title = T["interests-checkbox-tip"];
  });
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

const Menu_translations = {
  en: {
    "menu-home": "Home",
    "menu-start": "Start Building",
    "menu-smart-cv": "Smart CV Maker",
    "menu-why-us": "Why Choose Us",
    "menu-faq": "FAQ",
    "menu-help": "Need Help?",
    "menu-privacy": "Privacy Policy",
    "menu-terms": "Terms of Use",
    "navbar-login": "Login",

    "user-coins": "Coins:",
    "user-account": "Account",
    "user-logout": "Logout",

    "app-save": "Save My CV",
    "app-reload": "Reload My CV",
    "app-clear": "Clear All",
    "app-download": "Download CV",

    "mobile-cv-title": "CV Creation",
    "mobile-cv-desc": "Create your resume fields",
    "mobile-job-title": "Job Offer",
    "mobile-job-desc": "Analyze your job post",
    "mobile-theme-title": "Templates",
    "mobile-theme-desc": "Pick your CV design",
  },

  fr: {
    "menu-home": "Accueil",
    "menu-start": "Commencer la création",
    "menu-smart-cv": "Créateur de CV intelligent",
    "menu-why-us": "Pourquoi nous choisir",
    "menu-faq": "FAQ",
    "menu-help": "Besoin d'aide ?",
    "menu-privacy": "Politique de confidentialité",
    "menu-terms": "Conditions d'utilisation",
    "navbar-login": "Connexion",

    "user-coins": "Pièces :",
    "user-account": "Mon compte",
    "user-logout": "Déconnexion",

    "app-save": "Sauvegarder mon CV",
    "app-reload": "Recharger mon CV",
    "app-clear": "Tout effacer",
    "app-download": "Télécharger le CV",

    "mobile-cv-title": "Création de CV",
    "mobile-cv-desc": "Créez les champs de votre CV",
    "mobile-job-title": "Offre d'emploi",
    "mobile-job-desc": "Analysez votre annonce",
    "mobile-theme-title": "Modèles",
    "mobile-theme-desc": "Choisissez votre design de CV",
  },

  ar: {
    "menu-home": "الرئيسية",
    "menu-start": "بدء الإنشاء",
    "menu-smart-cv": "منشئ السيرة الذاتية الذكي",
    "menu-why-us": "لماذا تختارنا",
    "menu-faq": "الأسئلة الشائعة",
    "menu-help": "هل تحتاج مساعدة؟",
    "menu-privacy": "سياسة الخصوصية",
    "menu-terms": "شروط الاستخدام",
    "navbar-login": "تسجيل الدخول",

    "user-coins": "العملات:",
    "user-account": "الحساب",
    "user-logout": "تسجيل الخروج",

    "app-save": "حفظ سيرتي الذاتية",
    "app-reload": "إعادة تحميل السيرة الذاتية",
    "app-clear": "مسح الكل",
    "app-download": "تحميل السيرة الذاتية",

    "mobile-cv-title": "إنشاء السيرة الذاتية",
    "mobile-cv-desc": "أنشئ حقول سيرتك الذاتية",
    "mobile-job-title": "عرض العمل",
    "mobile-job-desc": "حلل إعلانك الوظيفي",
    "mobile-theme-title": "القوالب",
    "mobile-theme-desc": "اختر تصميم سيرتك الذاتية",
  },

  es: {
    "menu-home": "Inicio",
    "menu-start": "Comenzar a crear",
    "menu-smart-cv": "Creador de CV inteligente",
    "menu-why-us": "Por qué elegirnos",
    "menu-faq": "Preguntas frecuentes",
    "menu-help": "¿Necesitas ayuda?",
    "menu-privacy": "Política de privacidad",
    "menu-terms": "Términos de uso",
    "navbar-login": "Iniciar sesión",

    "user-coins": "Monedas:",
    "user-account": "Cuenta",
    "user-logout": "Cerrar sesión",

    "app-save": "Guardar mi CV",
    "app-reload": "Recargar mi CV",
    "app-clear": "Borrar todo",
    "app-download": "Descargar CV",

    "mobile-cv-title": "Creación de CV",
    "mobile-cv-desc": "Crea los campos de tu currículum",
    "mobile-job-title": "Oferta de trabajo",
    "mobile-job-desc": "Analiza tu oferta laboral",
    "mobile-theme-title": "Plantillas",
    "mobile-theme-desc": "Elige el diseño de tu CV",
  },

  zh: {
    "menu-home": "首页",
    "menu-start": "开始创建",
    "menu-smart-cv": "智能简历生成器",
    "menu-why-us": "为什么选择我们",
    "menu-faq": "常见问题",
    "menu-help": "需要帮助吗？",
    "menu-privacy": "隐私政策",
    "menu-terms": "使用条款",
    "navbar-login": "登录",

    "user-coins": "币:",
    "user-account": "账户",
    "user-logout": "退出登录",

    "app-save": "保存简历",
    "app-reload": "重新加载简历",
    "app-clear": "清空全部",
    "app-download": "下载简历",

    "mobile-cv-title": "简历创建",
    "mobile-cv-desc": "创建简历字段",
    "mobile-job-title": "工作机会",
    "mobile-job-desc": "分析职位信息",
    "mobile-theme-title": "模板",
    "mobile-theme-desc": "选择简历设计",
  },

  de: {
    "menu-home": "Startseite",
    "menu-start": "Erstellung starten",
    "menu-smart-cv": "Intelligenter Lebenslauf-Ersteller",
    "menu-why-us": "Warum uns wählen",
    "menu-faq": "FAQ",
    "menu-help": "Brauchen Sie Hilfe?",
    "menu-privacy": "Datenschutzerklärung",
    "menu-terms": "Nutzungsbedingungen",
    "navbar-login": "Anmelden",

    "user-coins": "Münzen:",
    "user-account": "Konto",
    "user-logout": "Abmelden",

    "app-save": "Lebenslauf speichern",
    "app-reload": "Lebenslauf neu laden",
    "app-clear": "Alles löschen",
    "app-download": "Lebenslauf herunterladen",

    "mobile-cv-title": "Lebenslauf-Erstellung",
    "mobile-cv-desc": "Erstellen Sie Ihre Lebenslauf-Felder",
    "mobile-job-title": "Stellenangebot",
    "mobile-job-desc": "Analysieren Sie Ihre Stellenausschreibung",
    "mobile-theme-title": "Vorlagen",
    "mobile-theme-desc": "Wählen Sie Ihr Lebenslauf-Design",
  },

  pt: {
    "menu-home": "Início",
    "menu-start": "Começar a criar",
    "menu-smart-cv": "Criador de currículo inteligente",
    "menu-why-us": "Por que escolher-nos",
    "menu-faq": "Perguntas frequentes",
    "menu-help": "Precisa de ajuda?",
    "menu-privacy": "Política de privacidade",
    "menu-terms": "Termos de uso",
    "navbar-login": "Entrar",

    "user-coins": "Moedas:",
    "user-account": "Conta",
    "user-logout": "Sair",

    "app-save": "Salvar meu currículo",
    "app-reload": "Recarregar meu currículo",
    "app-clear": "Limpar tudo",
    "app-download": "Baixar currículo",

    "mobile-cv-title": "Criação de currículo",
    "mobile-cv-desc": "Crie os campos do seu currículo",
    "mobile-job-title": "Oferta de emprego",
    "mobile-job-desc": "Analise sua vaga de emprego",
    "mobile-theme-title": "Modelos",
    "mobile-theme-desc": "Escolha o design do seu currículo",
  },

  ja: {
    "menu-home": "ホーム",
    "menu-start": "作成を開始",
    "menu-smart-cv": "スマート履歴書メーカー",
    "menu-why-us": "選ばれる理由",
    "menu-faq": "よくある質問",
    "menu-help": "サポートが必要ですか？",
    "menu-privacy": "プライバシーポリシー",
    "menu-terms": "利用規約",
    "navbar-login": "ログイン",

    "user-coins": "コイン:",
    "user-account": "アカウント",
    "user-logout": "ログアウト",

    "app-save": "履歴書を保存",
    "app-reload": "履歴書を再読み込み",
    "app-clear": "すべて削除",
    "app-download": "履歴書をダウンロード",

    "mobile-cv-title": "履歴書作成",
    "mobile-cv-desc": "履歴書の項目を作成",
    "mobile-job-title": "求人情報",
    "mobile-job-desc": "求人票を分析",
    "mobile-theme-title": "テンプレート",
    "mobile-theme-desc": "履歴書のデザインを選択",
  },

  ru: {
    "menu-home": "Главная",
    "menu-start": "Начать создание",
    "menu-smart-cv": "Умный конструктор резюме",
    "menu-why-us": "Почему выбирают нас",
    "menu-faq": "Часто задаваемые вопросы",
    "menu-help": "Нужна помощь?",
    "menu-privacy": "Политика конфиденциальности",
    "menu-terms": "Условия использования",
    "navbar-login": "Войти",

    "user-coins": "Монеты:",
    "user-account": "Аккаунт",
    "user-logout": "Выйти",

    "app-save": "Сохранить резюме",
    "app-reload": "Перезагрузить резюме",
    "app-clear": "Очистить всё",
    "app-download": "Скачать резюме",

    "mobile-cv-title": "Создание резюме",
    "mobile-cv-desc": "Создайте поля вашего резюме",
    "mobile-job-title": "Вакансия",
    "mobile-job-desc": "Проанализируйте объявление о вакансии",
    "mobile-theme-title": "Шаблоны",
    "mobile-theme-desc": "Выберите дизайн резюме",
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

const Steps_translations = {
  en: {
    "progress-title": "Your CV Progress",
    "progress-desc": "Track how much of your CV you have completed. Fill each section to achieve a fully completed CV.",
    "progress-personals": "Personals",
    "progress-experience": "Experiences",
    "progress-education": "Educations",
    "progress-certifications": "Certifications",
    "progress-skills": "Skills",
    "progress-languages": "Languages",
    "progress-interests": "Interests",
  },
  fr: {
    "progress-title": "Progression de votre CV",
    "progress-desc": "Suivez combien de votre CV est complété. Remplissez chaque section pour obtenir un CV entièrement complété.",
    "progress-personals": "Informations personnelles",
    "progress-experience": "Expériences",
    "progress-education": "Formations",
    "progress-certifications": "Certifications",
    "progress-skills": "Compétences",
    "progress-languages": "Langues",
    "progress-interests": "Centres d'intérêt",
  },
  ar: {
    "progress-title": "تقدم سيرتك الذاتية",
    "progress-desc": "تتبع مقدار ما أكملته في سيرتك الذاتية. املأ كل قسم لتحقيق سيره ذاتية مكتملة.",
    "progress-personals": "المعلومات الشخصية",
    "progress-experience": "الخبرات",
    "progress-education": "التعليم",
    "progress-certifications": "الشهادات",
    "progress-skills": "المهارات",
    "progress-languages": "اللغات",
    "progress-interests": "الاهتمامات",
  },
  es: {
    "progress-title": "Progreso de tu CV",
    "progress-desc": "Sigue cuánto has completado de tu CV. Llena cada sección para lograr un CV completamente completo.",
    "progress-personals": "Datos Personales",
    "progress-experience": "Experiencias",
    "progress-education": "Educación",
    "progress-certifications": "Certificaciones",
    "progress-skills": "Habilidades",
    "progress-languages": "Idiomas",
    "progress-interests": "Intereses",
  },
  zh: {
    "progress-title": "您的简历进度",
    "progress-desc": "跟踪您已完成简历的程度。填写每个部分以完成完整简历。",
    "progress-personals": "个人信息",
    "progress-experience": "工作经历",
    "progress-education": "教育经历",
    "progress-certifications": "证书",
    "progress-skills": "技能",
    "progress-languages": "语言",
    "progress-interests": "兴趣",
  },
  de: {
    "progress-title": "Ihr CV-Fortschritt",
    "progress-desc": "Verfolgen Sie, wie viel Ihres Lebenslaufs Sie bereits ausgefüllt haben. Füllen Sie jeden Abschnitt aus, um einen vollständigen Lebenslauf zu erhalten.",
    "progress-personals": "Persönliche Angaben",
    "progress-experience": "Erfahrungen",
    "progress-education": "Ausbildung",
    "progress-certifications": "Zertifikate",
    "progress-skills": "Fähigkeiten",
    "progress-languages": "Sprachen",
    "progress-interests": "Interessen",
  },
  pt: {
    "progress-title": "Progresso do seu CV",
    "progress-desc": "Acompanhe quanto do seu CV você já completou. Preencha cada seção para obter um CV totalmente completo.",
    "progress-personals": "Informações Pessoais",
    "progress-experience": "Experiências",
    "progress-education": "Educação",
    "progress-certifications": "Certificações",
    "progress-skills": "Habilidades",
    "progress-languages": "Idiomas",
    "progress-interests": "Interesses",
  },
  ja: {
    "progress-title": "履歴書の進捗",
    "progress-desc": "履歴書のどれだけ完成したかを追跡します。各セクションを埋めて、完全な履歴書を作成しましょう。",
    "progress-personals": "個人情報",
    "progress-experience": "職務経験",
    "progress-education": "学歴",
    "progress-certifications": "資格",
    "progress-skills": "スキル",
    "progress-languages": "言語",
    "progress-interests": "興味",
  },
  ru: {
    "progress-title": "Прогресс вашего CV",
    "progress-desc": "Отслеживайте, сколько вашего CV уже заполнено. Заполните каждый раздел, чтобы получить полностью готовое резюме.",
    "progress-personals": "Личная информация",
    "progress-experience": "Опыт работы",
    "progress-education": "Образование",
    "progress-certifications": "Сертификаты",
    "progress-skills": "Навыки",
    "progress-languages": "Языки",
    "progress-interests": "Интересы",
  }
};

const App_translationsExclusive = {
  en: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> Finish your CV now — unlock <strong>20 coins</strong> and start boosting your career."
  },
  fr: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> Terminez votre CV maintenant — débloquez <strong>20 coins</strong> et boostez votre carrière."
  },
  ar: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> أكمل سيرتك الذاتية الآن — واحصل على <strong>20 نقطة</strong> وابدأ في تطوير مسارك المهني."
  },
  es: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> Completa tu CV ahora — desbloquea <strong>20 puntos</strong> y empieza a impulsar tu carrera."
  },
  zh: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> 立即完成你的简历——解锁 <strong>20 积分</strong>，开始提升你的职业发展。"
  },
  de: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> Vervollständigen Sie jetzt Ihren Lebenslauf — sichern Sie sich <strong>20 Punkte</strong> und bringen Sie Ihre Karriere voran."
  },
  pt: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> Complete seu CV agora — desbloqueie <strong>20 pontos</strong> e impulsione sua carreira."
  },
  ja: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> 今すぐ履歴書を完成させて、<strong>20ポイント</strong> を獲得しキャリアを加速させましょう。"
  },
  ru: {
    "exclusive-firstSave": "<i class='ri-trophy-line'></i> Завершите резюме сейчас — получите <strong>20 баллов</strong> и начните развивать свою карьеру."
  },
};

const App_translationsAnalyzer = {
  en: {
    "joboffer-title": "ATS Job Match Analyzer",
    "joboffer-subtitle": "Paste a job description to see how well your CV matches. Our ATS analyzer highlights keywords, skills, and gaps to boost your chances with recruiters.",
    "joboffer-placeholder": "We're looking for a project manager with leadership and strategic planning skills...",
    "joboffer-keyneeds": "Job Key Needs:",
    "joboffer-progress": "Matching selected criteria",
    "joboffer-analyze": "Analyze my CV match",
    "joboffer-select": "Auto-fill from job offer",
    "coins_2": "2 coins",
    "coins_5": "5 coins",
    "joboffer-analyzing": "Analyzing",
    "joboffer-clear": "Clear job analyzer"
  },

  fr: {
    "joboffer-title": "Analyseur de correspondance ATS",
    "joboffer-subtitle": "Collez une description de poste pour voir dans quelle mesure votre CV correspond. Notre analyseur ATS met en évidence les mots-clés, les compétences et les lacunes pour augmenter vos chances auprès des recruteurs.",
    "joboffer-placeholder": "Nous recherchons un chef de projet avec des compétences en leadership et en planification stratégique...",
    "joboffer-keyneeds": "Besoins clés du poste :",
    "joboffer-progress": "Correspond aux critères sélectionnés",
    "joboffer-analyze": "Analyser la compatibilité de mon CV",
    "joboffer-select": "Remplir automatiquement depuis l'offre",
    "coins_2": "2 pièces",
    "coins_5": "5 pièces",
    "joboffer-analyzing": "Analyse en cours",
    "joboffer-clear": "Effacer l'analyseur"
  },

  ar: {
    "joboffer-title": "محلل مطابقة الوظائف ATS",
    "joboffer-subtitle": "الصق وصف الوظيفة لترى مدى تطابق سيرتك الذاتية. يبرز محلل ATS الكلمات المفتاحية والمهارات والفجوات لتعزيز فرصك مع مسؤولي التوظيف.",
    "joboffer-placeholder": "نبحث عن مدير مشروع يتمتع بمهارات قيادية وتخطيط استراتيجي...",
    "joboffer-keyneeds": "الاحتياجات الرئيسية للوظيفة:",
    "joboffer-progress": "يتوافق مع المعايير المحددة",
    "joboffer-analyze": "تحليل تطابق سيرتي الذاتية",
    "joboffer-select": "تعبئة تلقائية من عرض الوظيفة",
    "coins_2": "عملتان",
    "coins_5": "٥ عملات",
    "joboffer-analyzing": "جاري التحليل",
    "joboffer-clear": "مسح المحلل"
  },

  es: {
    "joboffer-title": "Analizador de coincidencia ATS",
    "joboffer-subtitle": "Pega una descripción de trabajo para ver qué tan bien coincide tu CV. Nuestro analizador ATS resalta palabras clave, habilidades y brechas para aumentar tus posibilidades con los reclutadores.",
    "joboffer-placeholder": "Buscamos un gerente de proyectos con habilidades de liderazgo y planificación estratégica...",
    "joboffer-keyneeds": "Necesidades clave del puesto:",
    "joboffer-progress": "Corresponde a los criterios seleccionados",
    "joboffer-analyze": "Analizar coincidencia de mi CV",
    "joboffer-select": "Rellenar automáticamente desde la oferta",
    "coins_2": "2 monedas",
    "coins_5": "5 monedas",
    "joboffer-analyzing": "Analizando",
    "joboffer-clear": "Borrar analizador"
  },

  zh: {
    "joboffer-title": "ATS 职位匹配分析器",
    "joboffer-subtitle": "粘贴职位描述，查看您的简历匹配程度。我们的 ATS 分析器会突出显示关键词、技能和差距，帮助您提高获得招聘人员青睐的机会。",
    "joboffer-placeholder": "我们正在寻找一位具有领导力和战略规划技能的项目经理...",
    "joboffer-keyneeds": "职位关键需求：",
    "joboffer-progress": "与所选标准匹配",
    "joboffer-analyze": "分析我的简历匹配度",
    "joboffer-select": "从职位描述自动填充",
    "coins_2": "2 币",
    "coins_5": "5 币",
    "joboffer-analyzing": "分析中",
    "joboffer-clear": "清除分析器"
  },

  de: {
    "joboffer-title": "ATS Job-Übereinstimmungsanalyzer",
    "joboffer-subtitle": "Fügen Sie eine Stellenbeschreibung ein, um zu sehen, wie gut Ihr Lebenslauf übereinstimmt. Unser ATS-Analyzer hebt Schlüsselwörter, Fähigkeiten und Lücken hervor, um Ihre Chancen bei Personalvermittlern zu verbessern.",
    "joboffer-placeholder": "Wir suchen einen Projektmanager mit Führungs- und strategischen Planungsfähigkeiten...",
    "joboffer-keyneeds": "Wichtige Anforderungen der Stelle:",
    "joboffer-progress": "Entspricht den ausgewählten Kriterien",
    "joboffer-analyze": "Lebenslauf-Übereinstimmung analysieren",
    "joboffer-select": "Automatisch aus Stellenangebot übernehmen",
    "coins_2": "2 Münzen",
    "coins_5": "5 Münzen",
    "joboffer-analyzing": "Analysiere",
    "joboffer-clear": "Analyzer löschen"
  },

  pt: {
    "joboffer-title": "Analisador de correspondência ATS",
    "joboffer-subtitle": "Cole uma descrição de vaga para ver o quão bem seu CV corresponde. Nosso analisador ATS destaca palavras-chave, habilidades e lacunas para aumentar suas chances com recrutadores.",
    "joboffer-placeholder": "Procuramos um gerente de projetos com habilidades de liderança e planejamento estratégico...",
    "joboffer-keyneeds": "Necessidades principais da vaga:",
    "joboffer-progress": "Corresponde aos critérios selecionados",
    "joboffer-analyze": "Analisar correspondência do meu CV",
    "joboffer-select": "Preencher automaticamente da vaga",
    "coins_2": "2 moedas",
    "coins_5": "5 moedas",
    "joboffer-analyzing": "Analisando",
    "joboffer-clear": "Limpar analisador"
  },

  ja: {
    "joboffer-title": "ATS求人マッチアナライザー",
    "joboffer-subtitle": "求人情報を貼り付けて、あなたの履歴書との一致度を確認しましょう。ATSアナライザーがキーワード、スキル、不足点を強調表示し、採用担当者にアピールするチャンスを高めます。",
    "joboffer-placeholder": "リーダーシップと戦略的計画スキルを持つプロジェクトマネージャーを探しています...",
    "joboffer-keyneeds": "求人の重要要件：",
    "joboffer-progress": "選択された基準に一致",
    "joboffer-analyze": "履歴書の一致度を分析",
    "joboffer-select": "求人情報から自動入力",
    "coins_2": "2コイン",
    "coins_5": "5コイン",
    "joboffer-analyzing": "分析中",
    "joboffer-clear": "アナライザーをクリア"
  },

  ru: {
    "joboffer-title": "ATS-анализатор соответствия вакансий",
    "joboffer-subtitle": "Вставьте описание вакансии, чтобы увидеть, насколько хорошо ваше резюме соответствует требованиям. Наш ATS-анализатор выделяет ключевые слова, навыки и пробелы, чтобы повысить ваши шансы у рекрутеров.",
    "joboffer-placeholder": "Мы ищем проектного менеджера с лидерскими навыками и стратегическим планированием...",
    "joboffer-keyneeds": "Ключевые требования вакансии:",
    "joboffer-progress": "Соответствует выбранным критериям",
    "joboffer-analyze": "Анализ соответствия резюме",
    "joboffer-select": "Автозаполнение из вакансии",
    "coins_2": "2 монеты",
    "coins_5": "5 монет",
    "joboffer-analyzing": "Анализ",
    "joboffer-clear": "Очистить анализатор"
  }
};

const App_translationsPreview = {
  en: {
    "theme-title": "Choose Your CV Style",
    "theme-select-label": "Select CV Style:",
    "preview-refresh": "Refresh Preview",
    "preview-zoomIn": "Zoom In",
    "preview-zoomOut": "Zoom Out",
    "preview-download-pdf": "Download PDF",
    "preview-download-excel": "Download Excel",
    "preview-placeholder": "We recommend to refresh your CV preview to validate it before saving."
  },

  fr: {
    "theme-title": "Choisissez le style de votre CV",
    "theme-select-label": "Sélectionnez un style de CV :",
    "preview-refresh": "Rafraîchir l’aperçu",
    "preview-zoomIn": "Agrandir",
    "preview-zoomOut": "Réduire",
    "preview-download-pdf": "Télécharger le PDF",
    "preview-download-excel": "Télécharger Excel",
    "preview-placeholder": "Nous vous recommandons d’actualiser l’aperçu de votre CV pour le valider avant de l’enregistrer."
  },

  ar: {
    "theme-title": "اختر نمط سيرتك الذاتية",
    "theme-select-label": "اختر نمط السيرة الذاتية:",
    "preview-refresh": "تحديث المعاينة",
    "preview-zoomIn": "تكبير",
    "preview-zoomOut": "تصغير",
    "preview-download-pdf": "تحميل PDF",
    "preview-download-excel": "تحميل Excel",
    "preview-placeholder": "نوصي بتحديث معاينة سيرتك الذاتية للتحقق منها قبل الحفظ."
  },
  
  es: {
    "theme-title": "Elige el Estilo de tu CV",
    "theme-select-label": "Selecciona el Estilo del CV:",
    "preview-refresh": "Actualizar Vista Previa",
    "preview-zoomIn": "Acercar",
    "preview-zoomOut": "Alejar",
    "preview-download-pdf": "Descargar PDF",
    "preview-download-excel": "Descargar Excel",
    "preview-placeholder": "Te recomendamos actualizar la vista previa de tu CV para validarlo antes de guardarlo."
  },
  
  zh: {
    "theme-title": "选择简历风格",
    "theme-select-label": "选择简历风格:",
    "preview-refresh": "刷新预览",
    "preview-zoomIn": "放大",
    "preview-zoomOut": "缩小",
    "preview-download-pdf": "下载 PDF",
    "preview-download-excel": "下载 Excel",
    "preview-placeholder": "我们建议您在保存之前刷新简历预览以进行验证。"
  },
  
  de: {
    "theme-title": "Wählen Sie Ihren Lebenslauf-Stil",
    "theme-select-label": "Lebenslauf-Stil auswählen:",
    "preview-refresh": "Vorschau aktualisieren",
    "preview-zoomIn": "Vergrößern",
    "preview-zoomOut": "Verkleinern",
    "preview-download-pdf": "PDF herunterladen",
    "preview-download-excel": "Excel herunterladen",
    "preview-placeholder": "Wir empfehlen, die Lebenslaufvorschau zu aktualisieren, um sie vor dem Speichern zu validieren."
  },
  
  pt: {
    "theme-title": "Escolha o Estilo do Seu CV",
    "theme-select-label": "Selecionar Estilo do CV:",
    "preview-refresh": "Atualizar Visualização",
    "preview-zoomIn": "Ampliar",
    "preview-zoomOut": "Reduzir",
    "preview-download-pdf": "Baixar PDF",
    "preview-download-excel": "Baixar Excel",
    "preview-placeholder": "Recomendamos atualizar a visualização do seu CV para validá-lo antes de salvar."
  },
  
  ja: {
    "theme-title": "履歴書のスタイルを選択",
    "theme-select-label": "履歴書スタイルの選択:",
    "preview-refresh": "プレビューを更新",
    "preview-zoomIn": "ズームイン",
    "preview-zoomOut": "ズームアウト",
    "preview-download-pdf": "PDFをダウンロード",
    "preview-download-excel": "Excelをダウンロード",
    "preview-placeholder": "保存する前に履歴書のプレビューを更新して確認することをお勧めします。"
  },
  
  ru: {
    "theme-title": "Выберите стиль резюме",
    "theme-select-label": "Выбор стиля резюме:",
    "preview-refresh": "Обновить просмотр",
    "preview-zoomIn": "Увеличить",
    "preview-zoomOut": "Уменьшить",
    "preview-download-pdf": "Скачать PDF",
    "preview-download-excel": "Скачать Excel",
    "preview-placeholder": "Рекомендуем обновить предпросмотр резюме, чтобы проверить его перед сохранением."
  },
};

LanguageOptions.forEach(option => {
  option.addEventListener('click', () => {
    const selectedValue = option.getAttribute('data-value');
    selectedLang.innerHTML = option.innerHTML;
    languageSelect.setAttribute('data-selected', selectedValue);
    languageSelect.classList.remove('open');
    sessionStorage.setItem('mynextcv-language', selectedValue);
    applyTranslations(selectedValue);
    cvbRefreshspecialityTranslation();
  });
});