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

function getOpportunityId() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("slug");

  if (fromQuery) {
    return fromQuery.split("--").pop();
  }

  const path = window.location.pathname;
  const slug = path.split("/").pop();

  if (!slug || slug === "opportunities.html") return null;

  return slug.split("--").pop();
}

const opportunityId = getOpportunityId();
console.log(opportunityId);

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

onAuthStateChanged(auth, (user) => {
  if (user) {
    updateUserSection(user);
    initExternalOpportunityPage();
  } else {
    updateUserSection(null);
    initExternalOpportunityPage();
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

// ============================= External Opportunties ===============================

async function initExternalOpportunityPage() {
  const lang = getCurrentLang();
  const t = opportunityPageTranslations[lang] || opportunityPageTranslations['en'];

  const container = document.getElementById("displayOpportunity");

  if (!container) {
    console.error("displayOpportunity not found");
    return;
  }

  const opportunityId = getOpportunityId();

  if (!opportunityId) {
    container.innerHTML = `<div class="error">${t.missingId}</div>`;
    return;
  }

  try {
    container.innerHTML = `<div class="loading">${t.loading}</div>`;

    const docRef = doc(db, "externalOpportunities", opportunityId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      container.innerHTML = `<div class="error">${t.opportunityNotFound}</div>`;
      return;
    }

    const originalData = snap.data();

    const data =
      await translateOpportunityData(
        originalData
      );

    document.title =
      `Hiring ${data.title || "Opportunity"} | Operlya`;

    updateMeta(
      data.title,
      data.description
    );

    container.innerHTML =
      renderExternalOpportunity(data);

    loadSimilarOpportunities(
      opportunityId,
      originalData
    );

    setupReadMore();
    setupOpportunitySave(opportunityId);
    setupShare(opportunityId);
    setupOpenOpportunity();

  } catch (err) {
    console.error("LOAD ERROR:", err);
    container.innerHTML = `<div class="error">${t.failedLoad}</div>`;
  }
}

function updateMeta(
  title,
  description
){

const image = "https://www.operlya.com/icons/operlya_preview.png";
const fullTitle = `Hiring ${title} | Operlya`;
const desc = (description || "").slice(0,160);

setMeta("property", "og:title", fullTitle);
setMeta("property", "og:description", desc);
setMeta("property", "og:image", image);
setMeta("name", "twitter:title", fullTitle);
setMeta("name", "twitter:description", desc);
setMeta("name", "twitter:image", image);
}

function setMeta(attr, name, content){
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if(!tag){
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }

  tag.content = content;
}

async function setupOpportunitySave(opportunityId) {
  const button = document.getElementById("externalSave");
  if (!button) return;

  const user = auth.currentUser;

  if (!user) {
    button.onclick = () => {
      notify?.(
        "Login required",
        "Sign in to save opportunities"
      );
    };
    return;
  }

  const saveRef = doc(
    db,
    "externalOpportunities",
    opportunityId,
    "saves",
    user.uid
  );

  try {
    const existing = await getDoc(saveRef);

    if (existing.exists()) {
      button.classList.add("saved");
      button.innerHTML = `<i class="ri-bookmark-fill"></i>`;
    }

  } catch (err) {
    console.error("Save state error:", err);
  }

  button.onclick = async () => {

    try {

      const existing = await getDoc(saveRef);

      if (existing.exists()) {

        await deleteDoc(saveRef);

        button.classList.remove("saved");
        button.innerHTML =
          `<i class="ri-bookmark-line"></i>`;

      } else {

        await setDoc(saveRef,{
          userId:user.uid,
          createdAt:serverTimestamp()
        });

        button.classList.add("saved");
        button.innerHTML =
          `<i class="ri-bookmark-fill"></i>`;
      }

    } catch(err) {
      console.error("Save error:",err);
    }

  };

}

function setupShare(opportunityId) {

  const slug = window.location.pathname.split("/").pop();
  const url = `${window.location.origin}/opportunities/${slug}`;
  const buttons = document.querySelectorAll(".shareBtn");

  buttons.forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const type = btn.dataset.share;

      try {

        if (type === "copy") {
          await navigator.clipboard.writeText(url);
          notify?.("Copied", "Link copied to clipboard");
        }

        if (type === "email") {
          window.open(
            `mailto:?subject=${encodeURIComponent("Job Opportunity")}&body=${encodeURIComponent(url)}`,
            "_blank"
          );
        }

        if (type === "whatsapp") {
          window.open(
            `https://wa.me/?text=${encodeURIComponent(url)}`,
            "_blank"
          );
        }

        if (type === "facebook") {
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            "_blank",
            "width=600,height=500"
          );
        }

        if (type === "twitter") {
          window.open(
            `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
            "_blank"
          );
        }

        if (type === "linkedin") {
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            "_blank"
          );
        }

      } catch (err) {
        console.error("Share error:", err);
      }
    };
  });
}

function renderExternalOpportunity(data) {
  const lang = getCurrentLang();
  const t = opportunityPageTranslations[lang] || opportunityPageTranslations['en'];

  const provider = data.source?.provider || "External";
  const sourceUrl = data.source?.sourceUrl || "#";

  return `

  <div class="externalOpportunity">

    <div class="externalHero">

      <div class="externalHero-top">

        <div class="externalBadge">
          <i class="ri-global-line"></i> ${t.externalOpportunity}
        </div>

        <div class="externalShare">
            <button class="externalSave" id="externalSave">
              <i class="ri-bookmark-line"></i>
            </button>

            <button class="shareBtn" data-share="copy">
              <i class="ri-link"></i>
            </button>

            <button class="shareBtn" data-share="email">
              <i class="ri-mail-line"></i>
            </button>

            <button class="shareBtn" data-share="whatsapp">
              <i class="ri-whatsapp-line"></i>
            </button>

            <button class="shareBtn" data-share="facebook">
              <i class="ri-facebook-line"></i>
            </button>

            <button class="shareBtn" data-share="twitter">
              <i class="ri-twitter-x-line"></i>
            </button>

            <button class="shareBtn" data-share="linkedin">
              <i class="ri-linkedin-line"></i>
            </button>
        </div>

      </div>

      <h1>${escapeHtml(data.title)}</h1>

      <div class="externalHero-meta">

        ${
          data.industry
          ? `
          <span>
            <i class="ri-briefcase-line"></i>
            ${escapeHtml(data.industry)}
          </span>
          `
          : ""
        }

        ${
          data.employmentType
          ? `
          <span>
            <i class="ri-user-line"></i>
            ${escapeHtml(data.employmentType)}
          </span>
          `
          : ""
        }

        <span>
          <i class="ri-map-pin-line"></i>
          ${escapeHtml(data.location?.reference || t.remote)}
        </span>

      </div>

    </div>

    <div class="externalSection">

        <h3>
            <i class="ri-file-text-line"></i> ${t.description}
        </h3>

        <div class="externalDescriptionWrapper">

        <div class="externalDescription collapsed" id="externalDescription">
          ${escapeHtml(data.description).replace(/\n/g,"<br>")}
        </div>

        ${
          data.description?.length > 350
          ? `
          <button class="externalReadMore" id="externalReadMore">${t.readMore}</button>
          `
          : ""
        }

        </div>

    </div>

    <div class="externalInfoGrid">

      <div class="externalInfo">

        <span>${t.source}</span>

        <strong>
          ${escapeHtml(provider)}
        </strong>

      </div>

      <div class="externalInfo">
        <span>${t.type}</span>
        <strong>
          ${
            escapeHtml(
              data.employmentType || t.notSpecified)
          }
        </strong>
      </div>

      <div class="externalInfo">
        <span>${t.industry}</span>
        <strong>
          ${
            escapeHtml(
              data.industry || t.general)
          }
        </strong>
      </div>

    </div>

    <div class="externalActionBar">
      <button class="externalApply" id="externalApply" data-url="${sourceUrl}">
        <i class="ri-external-link-line"></i> ${t.openOpportunity}
      </button>
    </div>

  </div>

  `;
}

function escapeHtml(str = "") {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupReadMore() {
  const lang = getCurrentLang();
  const t = opportunityPageTranslations[lang] || opportunityPageTranslations['en'];

  const description = document.getElementById("externalDescription");
  const button = document.getElementById("externalReadMore");

  if (!description ||!button) return;
  button.onclick = () => {
    const collapsed = description.classList.contains("collapsed");
    if (collapsed) {
      description.classList.remove("collapsed");
      button.textContent = t.showLess;
    } else {
      description.classList.add("collapsed");
      button.textContent = t.readMore;
    }
  };
}

function setupOpenOpportunity() {
  const button = document.getElementById("externalApply");
  if (!button) return;
  button.onclick = () => {
    const user = auth.currentUser;
    if (!user) {
      openLoginModal();
      return;
    }
    const url = button.dataset.url;
    if (url) {
      window.open(url, "_blank");
    }
  };
}

async function loadSimilarOpportunities(currentId, data) {
  const lang = getCurrentLang();
  const t = opportunityPageTranslations[lang] || opportunityPageTranslations['en'];
  
  const container = document.getElementById("moreOpportunities");
  if (!container) return;
  container.innerHTML = `<div class="loading">${t.loadingSimilar}</div>`;

  try {

    const snap =
      await getDocs(
        query(
          collection(db, "externalOpportunities"),
          orderBy("createdAt", "desc"),
          limit(12)
        )
      );

    const items =
      snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(o => o.id !== currentId)
        .filter(o =>
          !data.industry ||
          o.industry === data.industry
        );

    container.innerHTML = "";

    for (const op of items.slice(0, 6)) {

      const translated =
        await translateOpportunityData(op);

      container.appendChild(
        createSimilarCard(translated)
      );

    }

  } catch (err) {
    console.error("Similar load error:", err );
    container.innerHTML = `<div class="error">${t.failedSimilar}</div>`;
  }
}

function createSimilarCard(op) {
  const lang = getCurrentLang();
  const t = opportunityPageTranslations[lang] || opportunityPageTranslations['en'];

  const card = document.createElement("div");
  card.className = "external-card similar-card";

  card.innerHTML = `

    <div class="external-title">
      ${op.title || t.untitled}
    </div>

    <div class="external-description">
      ${(op.description || "")
        .slice(0,120)}...
    </div>

    <div class="external-meta">

      ${
        op.industry
        ? `<span><i class="ri-briefcase-line"></i>${op.industry}</span>`
        : ""
      }

      ${
        op.location?.reference
        ? `<span><i class="ri-map-pin-line"></i>${op.location.reference}</span>`
        : ""
      }

    </div>

    <div class="external-actions">
      <button class="external-openBtn">${t.open}</button>
    </div>

  `;

  card.onclick = () => {

    const slug =
      slugify(op.title);

    window.location.href =
    `/opportunities/${slug}--${op.id}`;

  };

  return card;
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

  modal.style.display = "flex";

  if (type === "congrats") {
    triggerPopColors(content);
  }

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

// ======================= GOOGLE TRANSLATE =======================

const translationCache = new Map();
async function translateImportedText(text, targetLang) {

  if (!text?.trim()) return text;

  if (targetLang === "en") return text;

  const cacheKey = `${targetLang}_${text}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {

    const url =
      `https://translate.googleapis.com/translate_a/single` +
      `?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Translation failed");

    const data = await res.json();

    const translated =
      data?.[0]
        ?.map(part => part?.[0] || "")
        .join("")
        .trim() || text;

    translationCache.set(cacheKey, translated);

    return translated;

  } catch (err) {

    console.error("Translate error:", err);

    return text;

  }

}

async function translateOpportunityData(data) {
  const lang = getCurrentLang();

  if (lang === "en") return data;

  return {

    ...data,

    title: await translateImportedText(data.title, lang),
    description: await translateImportedText(data.description, lang),
    industry: await translateImportedText(data.industry, lang),
    employmentType: await translateImportedText(data.employmentType, lang),

    location: data.location
      ? {
          ...data.location,
          reference:
            await translateImportedText(
              data.location.reference,
              lang
            )
        }
      : null

  };

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
      initExternalOpportunityPage();
    } else {
      updateUserSection(null);
      initExternalOpportunityPage();
    }
  });
  translateTopBar();
  translateHelpModal(lang);
  translateFooter();
  translateOpportunityPage(lang);

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

function translateOpportunityPage(lang){
  const t = opportunityPageTranslations[lang] || opportunityPageTranslations.en;

  const title = document.getElementById("sameWaveTitle");
  if(title){title.innerHTML = `<i class="ri-rss-line"></i> ${t.sameWave}`;}

  const subtitle = document.getElementById("sameWaveSubtitle");
  if(subtitle){subtitle.textContent = t.sameWaveSubtitle;}

  document
    .querySelectorAll(".createOpportunityBtn")
    .forEach(btn=>{
      btn.innerHTML=`
        <i class="ri-add-line"></i>
        ${t.create}
      `;
    });

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

const opportunityPageTranslations = {
  en: {
    sameWave: "Opportunities in same wave",
    sameWaveSubtitle: "Based on industry and relevance",
    create: "Create",

    loading: "Loading...",
    loadingSimilar: "Loading similar...",
    missingId: "Missing ID",

    opportunityNotFound: "Opportunity not found",
    failedLoad: "Failed to load opportunity",
    failedSimilar: "Failed to load similar",

    externalOpportunity: "External Opportunity",
    description: "Description",
    readMore: "Read more",
    showLess: "Show less",

    source: "Source",
    type: "Type",
    industry: "Industry",

    general: "General",
    notSpecified: "Not specified",

    remote: "Remote",

    openOpportunity: "Open Opportunity",
    open: "Open",

    untitled: "Untitled"
  },

  fr: {
    sameWave: "Opportunités dans la même vague",
    sameWaveSubtitle: "Basé sur le secteur et la pertinence",
    create: "Créer",

    loading: "Chargement...",
    loadingSimilar: "Chargement des similaires...",
    missingId: "ID manquant",

    opportunityNotFound: "Opportunité introuvable",
    failedLoad: "Échec du chargement",
    failedSimilar: "Échec du chargement des similaires",

    externalOpportunity: "Opportunité externe",
    description: "Description",
    readMore: "Lire plus",
    showLess: "Afficher moins",

    source: "Source",
    type: "Type",
    industry: "Secteur",

    general: "Général",
    notSpecified: "Non précisé",

    remote: "Télétravail",

    openOpportunity: "Ouvrir l'opportunité",
    open: "Ouvrir",

    untitled: "Sans titre"
  },

  ar: {
    sameWave: "فرص في نفس الموجة",
    sameWaveSubtitle: "بناءً على المجال ومدى الصلة",
    create: "إنشاء",

    loading: "جاري التحميل...",
    loadingSimilar: "تحميل فرص مشابهة...",
    missingId: "المعرف مفقود",

    opportunityNotFound: "لم يتم العثور على الفرصة",
    failedLoad: "فشل تحميل الفرصة",
    failedSimilar: "فشل تحميل الفرص المشابهة",

    externalOpportunity: "فرصة خارجية",
    description: "الوصف",
    readMore: "اقرأ المزيد",
    showLess: "عرض أقل",

    source: "المصدر",
    type: "النوع",
    industry: "المجال",

    general: "عام",
    notSpecified: "غير محدد",

    remote: "عن بعد",

    openOpportunity: "فتح الفرصة",
    open: "فتح",

    untitled: "بدون عنوان"
  },
  es: {
    sameWave: "Oportunidades en la misma ola",
    sameWaveSubtitle: "Basado en la industria y relevancia",
    create: "Crear",
    loading: "Cargando...",
    loadingSimilar: "Cargando similares...",
    missingId: "ID faltante",
    opportunityNotFound: "Oportunidad no encontrada",
    failedLoad: "Error al cargar la oportunidad",
    failedSimilar: "Error al cargar oportunidades similares",
    externalOpportunity: "Oportunidad externa",
    description: "Descripción",
    readMore: "Leer más",
    showLess: "Mostrar menos",
    source: "Fuente",
    type: "Tipo",
    industry: "Industria",
    general: "General",
    notSpecified: "No especificado",
    remote: "Remoto",
    openOpportunity: "Abrir oportunidad",
    open: "Abrir",
    untitled: "Sin título"
  },
  zh: {
    sameWave: "同一波次中的机会",
    sameWaveSubtitle: "基于行业和相关性",
    create: "创建",
    loading: "加载中...",
    loadingSimilar: "加载相似机会中...",
    missingId: "缺少ID",
    opportunityNotFound: "未找到机会",
    failedLoad: "加载机会失败",
    failedSimilar: "加载相似机会失败",
    externalOpportunity: "外部机会",
    description: "描述",
    readMore: "阅读更多",
    showLess: "收起",
    source: "来源",
    type: "类型",
    industry: "行业",
    general: "通用",
    notSpecified: "未指定",
    remote: "远程",
    openOpportunity: "打开机会",
    open: "打开",
    untitled: "无标题"
  },
  de: {
    sameWave: "Möglichkeiten in derselben Welle",
    sameWaveSubtitle: "Basierend auf Branche und Relevanz",
    create: "Erstellen",
    loading: "Laden...",
    loadingSimilar: "Ähnliche werden geladen...",
    missingId: "Fehlende ID",
    opportunityNotFound: "Möglichkeit nicht gefunden",
    failedLoad: "Fehler beim Laden der Möglichkeit",
    failedSimilar: "Fehler beim Laden ähnlicher Möglichkeiten",
    externalOpportunity: "Externe Möglichkeit",
    description: "Beschreibung",
    readMore: "Mehr lesen",
    showLess: "Weniger anzeigen",
    source: "Quelle",
    type: "Typ",
    industry: "Branche",
    general: "Allgemein",
    notSpecified: "Nicht angegeben",
    remote: "Remote",
    openOpportunity: "Möglichkeit öffnen",
    open: "Öffnen",
    untitled: "Unbenannt"
  },
  pt: {
    sameWave: "Oportunidades na mesma onda",
    sameWaveSubtitle: "Com base no setor e relevância",
    create: "Criar",
    loading: "Carregando...",
    loadingSimilar: "Carregando similares...",
    missingId: "ID ausente",
    opportunityNotFound: "Oportunidade não encontrada",
    failedLoad: "Falha ao carregar oportunidade",
    failedSimilar: "Falha ao carregar oportunidades similares",
    externalOpportunity: "Oportunidade externa",
    description: "Descrição",
    readMore: "Ler mais",
    showLess: "Mostrar menos",
    source: "Fonte",
    type: "Tipo",
    industry: "Setor",
    general: "Geral",
    notSpecified: "Não especificado",
    remote: "Remoto",
    openOpportunity: "Abrir oportunidade",
    open: "Abrir",
    untitled: "Sem título"
  },
  ja: {
    sameWave: "同じ波の機会",
    sameWaveSubtitle: "業界と関連性に基づく",
    create: "作成",
    loading: "読み込み中...",
    loadingSimilar: "類似機会を読み込み中...",
    missingId: "IDがありません",
    opportunityNotFound: "機会が見つかりません",
    failedLoad: "機会の読み込みに失敗しました",
    failedSimilar: "類似機会の読み込みに失敗しました",
    externalOpportunity: "外部機会",
    description: "説明",
    readMore: "もっと読む",
    showLess: "折りたたむ",
    source: "ソース",
    type: "タイプ",
    industry: "業界",
    general: "一般",
    notSpecified: "指定なし",
    remote: "リモート",
    openOpportunity: "機会を開く",
    open: "開く",
    untitled: "無題"
  },
  ru: {
    sameWave: "Возможности в той же волне",
    sameWaveSubtitle: "На основе отрасли и релевантности",
    create: "Создать",
    loading: "Загрузка...",
    loadingSimilar: "Загрузка похожих...",
    missingId: "Отсутствует ID",
    opportunityNotFound: "Возможность не найдена",
    failedLoad: "Не удалось загрузить возможность",
    failedSimilar: "Не удалось загрузить похожие возможности",
    externalOpportunity: "Внешняя возможность",
    description: "Описание",
    readMore: "Читать далее",
    showLess: "Скрыть",
    source: "Источник",
    type: "Тип",
    industry: "Отрасль",
    general: "Общее",
    notSpecified: "Не указано",
    remote: "Удаленно",
    openOpportunity: "Открыть возможность",
    open: "Открыть",
    untitled: "Без названия"
  }
};