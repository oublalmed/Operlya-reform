// ================================= Import Firebase SDKs ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, collection, serverTimestamp} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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
const provider = new GoogleAuthProvider();

function renderLoginModal() {
  const lang = getCurrentLang();
  const t = AuthForm_translations[lang] || AuthForm_translations['en'];
  const s = Signup_AuthForm_translations[lang] || Signup_AuthForm_translations['en'];

  document.getElementById("loginModalPage")?.remove();

  const html = `
  <div class="loginModalPage" id="loginModalPage">
    <div id="loginPage" class="login-page">
      <div class="login-container">

        <div class="login-content">

          <button class="login-close" title="Close login" id="closeLogin">
            <i class="ri-close-line"></i>
          </button>

          <div class="login-card" id="login-card">
            <div class="login-header">
              <h2 id="loginModalTitle">${t["login-title"]}</h2>
              <h2 id="loginModalTitleReset" style="display:none">
                ${t["login-titleReset"]}
              </h2>
            </div>

            <p class="login-subtitle" id="loginModalSubTitle">
              ${t["login-subtitle"]}
            </p>

            <p class="login-subtitle" id="loginModalSubTitleReset" style="display:none">
              ${t["login-subtitleReset"]}
            </p>

            <input id="loginEmailforget" type="email" placeholder="${t["login-email"]}">
            <input id="loginEmail" type="email" placeholder="${t["login-email"]}">
            <input id="loginPassword" type="password" placeholder="${t["login-password"]}">

            <div class="login-actions">
              <p class="show-password">
                <span id="showPassword">${t["show-password"]}</span>
                <span id="sendpassword" style="display:none">
                  ${t["send-password"]}
                </span>
              </p>
              <p class="reset-link">
                <span id="forgetPassword">
                  ${t["forgot-password"]}
                </span>
                <span id="backLogin" style="display:none">
                  ${t["login-back"]}
                </span>
              </p>
            </div>

            <button id="loginBtn" class="login-pageBtn">
              ${t["login-btn"]}
            </button>

            <p class="login-signup">
              ${t["no-account"]}
              <span id="switchToSignup" class="login-link">
                ${t["signup-link"]}
              </span>
            </p>

          </div>

          <div id="signup-card" class="signup-content form-hidden">

            <div class="signup-card">

              <div class="login-header">
                <h2>${s["signup-title"]}</h2>
                <p class="login-subtitle">
                  ${s["signup-subtitle"]}
                </p>
              </div>

              <div class="login-doubleInputs">
                <div class="login-group">
                  <input id="signupFirstName"
                    placeholder="${s["signup-first-name"]}">
                </div>

                <div class="login-group">
                  <input id="signupLastName"
                    placeholder="${s["signup-last-name"]}">
                </div>
              </div>

              <input id="signupEmail" type="email" placeholder="${s["signup-email"]}">
              <input id="signupBirthday" type="date">
              <input id="signupPassword" type="password" placeholder="${s["signup-password"]}">

              <div class="login-actions">
                <p class="show-password">
                  <span id="signupshowPassword">${t["show-password"]}</span>
                </p>
              </div>

              <button id="signupBtn" class="login-pageBtn">${s["signup-btn"]}</button>

              <p class="login-signup">
                ${s["have-account"]}
                <span id="switchToLogin" class="login-link">
                  ${s["login-link"]}
                </span>
              </p>
            </div>

          </div>

          <div class="social-login">

            <button id="googleLoginBtn" class="google-btn">
              <i class="ri-google-fill"></i>
              <span>${t["continue-google"]}</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);

  bindLoginModalEvents();

  document.getElementById('login-card').classList.add('form-active');
  document.getElementById('signup-card').classList.add('form-hidden');

  console.log("Login modal created:", document.getElementById("loginPage"));
}

function bindLoginModalEvents() {
  const modal = document.getElementById("loginModalPage");

  document.getElementById("closeLogin")
    ?.addEventListener("click", () => {
      modal.classList.remove("active");
    });

  modal?.addEventListener("click", e => {
    if (e.target === modal) {
      modal.classList.remove("active");
    }
  });
}

function initializeLoginEvents() {

  document.getElementById('loginBtn')?.addEventListener('click', loginBtn);
  document.getElementById('googleLoginBtn')?.addEventListener('click', googleLoginBtn);
  document.getElementById('showPassword')?.addEventListener('click', showPassword);
  document.getElementById('forgetPassword')?.addEventListener('click', forgetPassword);
  document.getElementById('backLogin')?.addEventListener('click', backLogin);
  document.getElementById('sendpassword')?.addEventListener('click', sendpassword);
  document.getElementById('signupBtn')?.addEventListener('click', signupSystem);
  document.getElementById('signupshowPassword')?.addEventListener('click', signupshowPassword);
  document.getElementById('switchToSignup')?.addEventListener('click', switchFormSignup);
  document.getElementById('switchToLogin')?.addEventListener('click', switchFormLogin);

  ['loginEmail','loginPassword'].forEach(id => {
    const input = document.getElementById(id);
    input?.addEventListener('input', () => {
      const selectedLang = getCurrentLang();
      const t = cvbAuthTranslations[selectedLang] || cvbAuthTranslations['en'];

      if (id === 'loginEmail') {
        validateLoginInput(input, t.validation.emailRequired);
      }

      if (id === 'loginPassword') {
        validateLoginInput(input, t.validation.passwordRequired);
      }
    });
  });

  ['signupFirstName','signupLastName','signupEmail','signupBirthday','signupPassword'].forEach(id => {
    const input = document.getElementById(id);
    input?.addEventListener('input', () => {
      const selectedLang = getCurrentLang();
      const T = Signup_AuthForm_translations[selectedLang] || Signup_AuthForm_translations['en'];

      if (id === 'signupFirstName') {
        validateSignupInput(input, T.validation.firstNameRequired);
      }

      if (id === 'signupLastName') {
        validateSignupInput(input, T.validation.lastNameRequired);
      }

      if (id === 'signupEmail') {
        validateSignupInput(input, T.validation.emailRequired);
      }

      if (id === 'signupPassword') {
        validateSignupInput(input, T.validation.passwordRequired);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderLoginModal();
  initializeLoginEvents();
  captureReferral();
});

// ========================================= LOGIN ======================================

function validateLoginInput(input, message) {
  const value = input.value.trim();

  let span = input.nextElementSibling;
  if (!span || !span.classList.contains('input-error')) {
    span = null;
  }

  if (!value) {
    if (!span) {
      span = document.createElement('span');
      span.className = 'input-error';
      span.style.color = 'red';
      span.style.fontSize = '12px';
      input.insertAdjacentElement('afterend', span);
    }
    span.textContent = message;
    return false;
  } else {
    if (span) span.remove();
    return true;
  }
}

async function loginBtn(event) {
  event.preventDefault();

  const selectedLang = getCurrentLang();
  const t = cvbAuthTranslations[selectedLang] || cvbAuthTranslations['en'];

  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  let hasError = false;

  const emailValid = validateLoginInput(emailInput, t.validation.emailRequired);
  const passwordValid = validateLoginInput(passwordInput, t.validation.passwordRequired);

  if (!emailValid || !passwordValid) return;

  if (hasError) return;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    document.getElementById("loginModalPage").classList.remove("active");
    
    if (docSnap.exists()) {
    } else {
      showNotification("warning", t.missingProfileTitle, t.missingProfileMsg, true);
    }
  } catch (error) {
    let message = error.message;
    if (
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/invalid-credential"
    ) {
      message = t.invalidCredentials;
    }
    showNotification("error", t.loginFailedTitle, message, true);
  }
};

async function googleLoginBtn(event) {
  const selectedLang = getCurrentLang();
  const t = cvbAuthTranslations[selectedLang] || cvbAuthTranslations['en'];
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let isNewUser = !userSnap.exists();

    if (isNewUser) {
      
      await setDoc(doc(db, "users", user.uid), {
        createdAt: serverTimestamp(),
        security: {
          profileVisibility: "public",
          fieldVisibility: { email: true, phone: true, location: true },
          dataUsage: { improvements: true, personalization: true, marketing: true }
        }
      });

      await setDoc(doc(db, "users", user.uid, "rewards", "SIGNUP_REWARD"), {
        type: "SIGNUP_REWARD",
        coins: 30,
        createdAt: serverTimestamp()
      });

      const referrerUid = localStorage.getItem("operlya_referrer_uid");
      const finalReferrerUid = referrerUid && referrerUid !== user.uid ? referrerUid : null;
      const fullName = user.displayName || "";
      const [first_name = "", last_name = ""] = fullName.split(" ");

      await setDoc(doc(db, "profiles", user.uid), {
        email: user.email || "",
        referrerUid: finalReferrerUid,
        first_name,
        last_name,
        createdAt: serverTimestamp()
      });

      localStorage.removeItem("operlya_referrer_uid");

      const notifRef = doc(collection(db, "users", user.uid, "notifications"));
      await setDoc(notifRef, {
        reference: "WELCOME40",
        title: "Welcome to Operlya",
        message: `Your account has been created successfully. You received 30 coins to get started.`,
        read: false,
        createdAt: serverTimestamp()
      });
    } 
    else {
      const data = userSnap.data();
    }

    document.getElementById("loginModalPage").classList.remove("active");
  } catch (error) {
    showNotification("error", t.loginFailedTitle, error.message);
  }
};

async function showPassword(event) {
  const selectedLang = getCurrentLang();
  const t = AuthForm_translations[selectedLang] || AuthForm_translations['en'];

  const passwordField = document.getElementById("loginPassword");
  const toggleText = document.getElementById("showPassword");

  if (passwordField.type === "password") {
    toggleText.textContent = t["hide-password"];
    passwordField.type = "text";
  } else {
    passwordField.type = "password";
    toggleText.textContent = t["show-password"];
  }
};

async function forgetPassword(event) {
  document.getElementById('loginModalSubTitle').style.display = "none";
  document.getElementById('loginModalTitle').style.display = "none";
  document.getElementById('loginEmail').style.display = "none";
  document.getElementById('loginPassword').style.display = "none";
  document.getElementById('showPassword').style.display = "none";
  document.getElementById('forgetPassword').style.display = "none";
  document.getElementById('loginBtn').style.display = "none";
  document.getElementById('loginModalTitleReset').style.display = "block";
  document.getElementById('loginModalSubTitleReset').style.display = "block";
  document.getElementById('loginEmailforget').style.display = "block";
  document.getElementById('sendpassword').style.display = "block";
  document.getElementById('backLogin').style.display = "block";
};

async function sendpassword(event) {
  const selectedLang = getCurrentLang();
  const t = cvbSendPasswordTranslations[selectedLang] || cvbSendPasswordTranslations['en'];
  const email = document.getElementById('loginEmailforget').value;

  if (!email) {
    showNotification("warning", t.missingEmailTitle, t.missingEmailMessage);
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    showNotification("success", t.emailSentTitle, t.emailSentMessage);
  } catch (error) {
    showNotification("error", t.resetFailedTitle, error.message);
  }
};

function captureReferral() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");

  if (ref) {
    localStorage.setItem("operlya_referrer_uid", ref);
    console.log("Referral captured (UID):", ref);
  }
}

captureReferral();

// ======================================== SIGNUP ======================================

function validateSignupInput(input, message) {
  const value = input.value.trim();

  let span = input.nextElementSibling;
  if (!span || !span.classList.contains('input-error')) {
    span = null;
  }

  if (!value) {
    if (!span) {
      span = document.createElement('span');
      span.className = 'input-error';
      span.style.color = 'red';
      span.style.fontSize = '12px';
      input.insertAdjacentElement('afterend', span);
    }
    span.textContent = message;
    return false;
  } else {
    if (span) span.remove();
    return true;
  }
}

async function signupSystem(event) {
  event.preventDefault();

  const lang = getCurrentLang();
  const t = cvbAuthTranslations[lang] || cvbAuthTranslations['en'];
  const s = Signup_AuthForm_translations[lang] || Signup_AuthForm_translations['en'];

  const firstNameInput = document.getElementById('signupFirstName');
  const lastNameInput = document.getElementById('signupLastName');
  const emailInput = document.getElementById('signupEmail');
  const birthdayInput = document.getElementById('signupBirthday');
  const passwordInput = document.getElementById('signupPassword');

  const validFirst = validateSignupInput(firstNameInput, s.validation.firstNameRequired);
  const validLast = validateSignupInput(lastNameInput, s.validation.lastNameRequired);
  const validEmail = validateSignupInput(emailInput, s.validation.emailRequired);
  const validBirthday = validateSignupInput(birthdayInput, s.validation.birthdayRequired);
  const validPassword = validateSignupInput(passwordInput, s.validation.passwordRequired);

  if (!validFirst || !validLast || !validEmail || !validBirthday || !validPassword) return;

  const values = {
    first_name: firstNameInput.value.trim(),
    last_name: lastNameInput.value.trim(),
    email: emailInput.value.trim(),
    birthday: birthdayInput.value.trim(),
    password: passwordInput.value.trim()
  };

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      createdAt: serverTimestamp(),
      security: {
        profileVisibility: "public",
        fieldVisibility: { email: true, phone: true, location: true },
        dataUsage: { improvements: true, personalization: true, marketing: true }
      }
    });

    await setDoc(doc(db, "users", user.uid, "rewards", "SIGNUP_REWARD"), {
      type: "SIGNUP_REWARD",
      coins: 30,
      createdAt: serverTimestamp()
    });

    const referrerUid = localStorage.getItem("operlya_referrer_uid");
    const finalReferrerUid = referrerUid && referrerUid !== user.uid ? referrerUid : null;

    await setDoc(doc(db, "profiles", user.uid), {
      email: values.email,
      referrerUid: finalReferrerUid,
      first_name: values.first_name,
      last_name: values.last_name,
      birthday: values.birthday,
      createdAt: serverTimestamp()
    });

    const notifRef = doc(collection(db, "users", user.uid, "notifications"));
    await setDoc(notifRef, {
      reference: "WELCOME40",
      title: "Welcome to Operlya",
      message: "Your account has been successfully created. You’ve received 30 coins to get started.",
      read: false,
      createdAt: serverTimestamp()
    });

    sessionStorage.removeItem('redirectAfterLogin');
    window.location.href = '/account.html';

  } catch (error) {
    let message = error.message;

    if (error.code === "auth/email-already-in-use") {
      message = t.signupEmailExists;
    }

    showNotification("error", t.signupFailedTitle, message, true);
  }
}

async function signupshowPassword(event) {
  const selectedLang = getCurrentLang();
  const t = Signup_AuthForm_translations[selectedLang] || Signup_AuthForm_translations['en'];

  const passwordField = document.getElementById("signupPassword");
  const toggleText = document.getElementById("signupshowPassword");

  if (passwordField.type === "password") {
    toggleText.textContent = t["hide-password"];
    passwordField.type = "text";
  } else {
    passwordField.type = "password";
    toggleText.textContent = t["show-password"];
  }
};

async function backLogin(event) {
  document.getElementById('loginModalSubTitle').style.display = "block";
  document.getElementById('loginModalTitle').style.display = "block";
  document.getElementById('loginEmail').style.display = "block";
  document.getElementById('loginPassword').style.display = "block";
  document.getElementById('showPassword').style.display = "block";
  document.getElementById('forgetPassword').style.display = "block";
  document.getElementById('loginBtn').style.display = "block";
  document.getElementById('loginModalTitleReset').style.display = "none";
  document.getElementById('loginModalSubTitleReset').style.display = "none";
  document.getElementById('loginEmailforget').style.display = "none";
  document.getElementById('sendpassword').style.display = "none";
  document.getElementById('backLogin').style.display = "none";
};

// ================================ SIGNIN/SIGNUP ==================================

function switchForm(from, to, container) {
  container.classList.add('animating');

  to.classList.remove('form-hidden');
  to.classList.add('form-enter');

  requestAnimationFrame(() => {
    from.classList.remove('form-active');
    from.classList.add('form-exit');

    to.classList.remove('form-enter');
    to.classList.add('form-active');
  });

  setTimeout(() => {
    from.classList.remove('form-exit');
    from.classList.add('form-hidden');
    container.classList.remove('animating');
  }, 500);
}

async function switchFormSignup(event) {
  const loginCard = document.getElementById('login-card');
  const signupCard = document.getElementById('signup-card');
  const container = document.querySelector('.login-content');

  switchForm(loginCard, signupCard, container);
};

async function switchFormLogin(event) {
  const loginCard = document.getElementById('login-card');
  const signupCard = document.getElementById('signup-card');
  const container = document.querySelector('.login-content');

  switchForm(signupCard, loginCard, container);
};

// ================================== Notifications ===================================

function showNotification(typeOrOptions, title, message, delay = false) {
  const lang = getCurrentLang();
  const t = cvbAuthTranslations[lang] || cvbAuthTranslations['en'];

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

// ================================= LANGUAGES SELECT =================================

function getCurrentLang() {
  const languageSelect = document.querySelector('#languageSelectorSidebar');
  return (
    languageSelect?.getAttribute('data-selected') ||
    sessionStorage.getItem('mynextcv-language') ||
    'en'
  );
}

document.addEventListener("languageChanged", (event) => {
  const modal = document.getElementById("loginModalPage");
  if (modal) {
    renderLoginModal();
    initializeLoginEvents();
    modal.classList.add("active");
  }
});

// =============================== TRANSLATIONS WORDS ================================

const AuthForm_translations = {
  en: {
    "login-title": "Welcome Back",
    "login-subtitle": "Sign in to continue your journey on Operlya.",
    "login-titleReset": "Reset password",
    "login-subtitleReset": "Enter your email to receive your password reset link.",
    "login-email": "Email",
    "login-password": "Password",
    "show-password": "Show password",
    "hide-password": "Hide password",
    "forgot-password": "Forgot password?",
    "send-password": "Send password",
    "login-back": "Back to login",
    "login-btn": "Login",
    "no-account": "Don't have an account?",
    "signup-link": "Sign Up",
    "continue-google": "Continue with Google",
    "overlay-title": "Unlock Opportunities. Create Value.",
    "overlay-text": "Operlya connects talent, ambition, and real-world needs into a dynamic ecosystem.\nEarn, collaborate, and grow through meaningful opportunities designed to accelerate your journey.",
    "footer-privacy": "Privacy Policy",
    "footer-terms": "Terms of Use",
    "footer-faq": "FAQ",
    "footer-copyright": "© 2026 Operlya. All rights reserved."
  },
  fr: {
    "login-title": "Bon retour",
    "login-subtitle": "Connectez-vous pour continuer votre voyage sur Operlya.",
    "login-titleReset": "Réinitialiser le mot de passe",
    "login-subtitleReset": "Entrez votre e-mail pour recevoir votre lien de réinitialisation.",
    "login-email": "Adresse e-mail",
    "login-password": "Mot de passe",
    "show-password": "Afficher le mot de passe",
    "hide-password": "Cacher le mot de passe",
    "forgot-password": "Mot de passe oublié ?",
    "send-password": "Envoyer le mot de passe",
    "login-back": "Retour à la connexion",
    "login-btn": "Se connecter",
    "no-account": "Vous n'avez pas de compte ?",
    "signup-link": "S'inscrire",
    "continue-google": "Continuer avec Google",
    "overlay-title": "Déverrouillez les opportunités. Créez de la valeur.",
    "overlay-text": "Operlya connecte les talents, l'ambition et les besoins réels dans un écosystème dynamique.\nGagnez, collaborez et développez-vous grâce à des opportunités conçues pour accélérer votre parcours.",
    "footer-privacy": "Politique de confidentialité",
    "footer-terms": "Conditions d'utilisation",
    "footer-faq": "FAQ",
    "footer-copyright": "© 2026 Operlya. Tous droits réservés."
  },
  ar: {
    "login-title": "مرحبًا بعودتك",
    "login-subtitle": "قم بتسجيل الدخول لمواصلة رحلتك في Operlya.",
    "login-titleReset": "إعادة تعيين كلمة المرور",
    "login-subtitleReset": "أدخل بريدك الإلكتروني لاستلام رابط إعادة تعيين كلمة المرور.",
    "login-email": "البريد الإلكتروني",
    "login-password": "كلمة المرور",
    "show-password": "عرض كلمة المرور",
    "hide-password": "إخفاء كلمة المرور",
    "forgot-password": "هل نسيت كلمة المرور؟",
    "send-password": "إرسال كلمة المرور",
    "login-back": "العودة لتسجيل الدخول",
    "login-btn": "تسجيل الدخول",
    "no-account": "ليس لديك حساب؟",
    "signup-link": "إنشاء حساب",
    "continue-google": "تابع باستخدام Google",
    "overlay-title": "افتح الفرص. اصنع قيمة.",
    "overlay-text": "يُربط Operlya بين المواهب والطموح والاحتياجات الواقعية في نظام بيئي ديناميكي.\nاكسب وتعاون ونمُّ من خلال فرص مصممة لتسريع مسارك.",
    "footer-privacy": "سياسة الخصوصية",
    "footer-terms": "شروط الاستخدام",
    "footer-faq": "الأسئلة الشائعة",
    "footer-copyright": "© 2026 Operlya. جميع الحقوق محفوظة."
  },
  es: {
    "login-title": "Bienvenido de nuevo",
    "login-subtitle": "Inicia sesión para continuar tu viaje en Operlya.",
    "login-titleReset": "Restablecer contraseña",
    "login-subtitleReset": "Ingresa tu correo para recibir el enlace de restablecimiento.",
    "login-email": "Correo electrónico",
    "login-password": "Contraseña",
    "show-password": "Mostrar contraseña",
    "hide-password": "Ocultar contraseña",
    "forgot-password": "¿Olvidaste tu contraseña?",
    "send-password": "Enviar contraseña",
    "login-back": "Volver al inicio de sesión",
    "login-btn": "Iniciar sesión",
    "no-account": "¿No tienes una cuenta?",
    "signup-link": "Registrarse",
    "continue-google": "Continuar con Google",
    "overlay-title": "Desbloquea oportunidades. Crea valor.",
    "overlay-text": "Operlya conecta talento, ambición y necesidades reales en un ecosistema dinámico.\nGana, colabora y crece a través de oportunidades diseñadas para acelerar tu trayectoria.",
    "footer-privacy": "Política de Privacidad",
    "footer-terms": "Términos de Uso",
    "footer-faq": "Preguntas Frecuentes",
    "footer-copyright": "© 2026 Operlya. Todos los derechos reservados."
  },
  zh: {
    "login-title": "欢迎回来",
    "login-subtitle": "登录以继续您在 Operlya 的旅程。",
    "login-titleReset": "重置密码",
    "login-subtitleReset": "请输入您的邮箱以接收密码重置链接。",
    "login-email": "电子邮箱",
    "login-password": "密码",
    "show-password": "显示密码",
    "hide-password": "隐藏密码",
    "forgot-password": "忘记密码？",
    "send-password": "发送密码",
    "login-back": "返回登录",
    "login-btn": "登录",
    "no-account": "还没有账户？",
    "signup-link": "注册",
    "continue-google": "使用 Google 继续",
    "overlay-title": "解锁机会。创造价值。",
    "overlay-text": "Operlya 将人才、抱负和真实需求连接成一个动态生态系统。\n通过旨在加速您旅程的有意义机会，赚取、协作和成长。",
    "footer-privacy": "隐私政策",
    "footer-terms": "使用条款",
    "footer-faq": "常见问题",
    "footer-copyright": "© 2026 Operlya。保留所有权利。"
  },
  de: {
    "login-title": "Willkommen zurück",
    "login-subtitle": "Melden Sie sich an, um Ihre Reise auf Operlya fortzusetzen.",
    "login-titleReset": "Passwort zurücksetzen",
    "login-subtitleReset": "Geben Sie Ihre E-Mail ein, um den Zurücksetzungslink zu erhalten.",
    "login-email": "E-Mail",
    "login-password": "Passwort",
    "show-password": "Passwort anzeigen",
    "hide-password": "Passwort verbergen",
    "forgot-password": "Passwort vergessen?",
    "send-password": "Passwort senden",
    "login-back": "Zurück zur Anmeldung",
    "login-btn": "Anmelden",
    "no-account": "Sie haben kein Konto?",
    "signup-link": "Registrieren",
    "continue-google": "Mit Google fortfahren",
    "overlay-title": "Chancen erschließen. Wert schaffen.",
    "overlay-text": "Operlya verbindet Talent, Ehrgeiz und reale Bedürfnisse in einem dynamischen Ökosystem.\nVerdienen, zusammenarbeiten und wachsen Sie durch sinnvolle Möglichkeiten, die Ihre Reise beschleunigen sollen.",
    "footer-privacy": "Datenschutzrichtlinie",
    "footer-terms": "Nutzungsbedingungen",
    "footer-faq": "FAQ",
    "footer-copyright": "© 2026 Operlya. Alle Rechte vorbehalten."
  },
  pt: {
    "login-title": "Bem-vindo de volta",
    "login-subtitle": "Faça login para continuar sua jornada no Operlya.",
    "login-titleReset": "Redefinir senha",
    "login-subtitleReset": "Insira seu e-mail para receber o link de redefinição.",
    "login-email": "E-mail",
    "login-password": "Senha",
    "show-password": "Mostrar senha",
    "hide-password": "Ocultar senha",
    "forgot-password": "Esqueceu a senha?",
    "send-password": "Enviar senha",
    "login-back": "Voltar ao login",
    "login-btn": "Entrar",
    "no-account": "Não tem uma conta?",
    "signup-link": "Cadastrar-se",
    "continue-google": "Continuar com o Google",
    "overlay-title": "Desbloqueie oportunidades. Crie valor.",
    "overlay-text": "Operlya conecta talento, ambição e necessidades reais em um ecossistema dinâmico.\nGanhe, colabore e cresça através de oportunidades significativas projetadas para acelerar sua jornada.",
    "footer-privacy": "Política de Privacidade",
    "footer-terms": "Termos de Uso",
    "footer-faq": "FAQ",
    "footer-copyright": "© 2026 Operlya. Todos os direitos reservados."
  },
  ja: {
    "login-title": "おかえりなさい",
    "login-subtitle": "Operlyaでの旅を続けるためにログインしてください。",
    "login-titleReset": "パスワードをリセット",
    "login-subtitleReset": "パスワード再設定リンクを受け取るためにメールを入力してください。",
    "login-email": "メールアドレス",
    "login-password": "パスワード",
    "show-password": "パスワードを表示",
    "hide-password": "パスワードを非表示",
    "forgot-password": "パスワードをお忘れですか？",
    "send-password": "パスワードを送信",
    "login-back": "ログインに戻る",
    "login-btn": "ログイン",
    "no-account": "アカウントをお持ちではありませんか？",
    "signup-link": "登録する",
    "continue-google": "Googleで続行",
    "overlay-title": "機会を解き放つ。価値を生み出す。",
    "overlay-text": "Operlyaは、才能、野心、現実のニーズをダイナミックなエコシステムに結びつけます。\nあなたの旅を加速するために設計された意味のある機会を通じて、獲得、協力、成長を実現します。",
    "footer-privacy": "プライバシーポリシー",
    "footer-terms": "利用規約",
    "footer-faq": "よくある質問",
    "footer-copyright": "© 2026 Operlya。無断転載を禁じます。"
  },
  ru: {
    "login-title": "С возвращением",
    "login-subtitle": "Войдите, чтобы продолжить ваше путешествие в Operlya.",
    "login-titleReset": "Сброс пароля",
    "login-subtitleReset": "Введите свою почту, чтобы получить ссылку для сброса пароля.",
    "login-email": "Электронная почта",
    "login-password": "Пароль",
    "show-password": "Показать пароль",
    "hide-password": "Скрыть пароль",
    "forgot-password": "Забыли пароль?",
    "send-password": "Отправить пароль",
    "login-back": "Назад к входу",
    "login-btn": "Войти",
    "no-account": "Нет аккаунта?",
    "signup-link": "Зарегистрироваться",
    "continue-google": "Продолжить с Google",
    "overlay-title": "Откройте возможности. Создавайте ценность.",
    "overlay-text": "Operlya соединяет таланты, амбиции и реальные потребности в динамичную экосистему.\nЗарабатывайте, сотрудничайте и развивайтесь через значимые возможности, созданные для ускорения вашего пути.",
    "footer-privacy": "Политика конфиденциальности",
    "footer-terms": "Условия использования",
    "footer-faq": "Часто задаваемые вопросы",
    "footer-copyright": "© 2026 Operlya. Все права защищены."
  }
};

const cvbAuthTranslations = {
  en: {
    signupFailedTitle: "Signup Failed",
    loginFailedTitle: "Login Failed",
    loginSuccessTitle: "Login Successful",
    logoutSuccessTitle: "Logout Successful",
    logoutSuccessMsg: "You have been logged out.",
    logoutFailedTitle: "Logout Failed",
    welcomeMsgTitle: "Welcome to Operlya!",
    welcomeMsgBody: "🎁 Congratulations! You've received +40 welcome coins to start creating your CVs!",
    welcomeUniTitle: "Welcome, Future Professional!",
    welcomeUniBody: "🎓 Student Program! You've received +200 coins as a student to jumpstart your career!",
    missingProfileTitle: "Missing Profile",
    missingProfileMsg: "Logged in but no profile found.",
    welcomeBack: "Welcome back",
    invalidCredentials: "No account found with this email or incorrect password.",
    validation: {
      emailRequired: "Email required",
      passwordRequired: "Password required"
    }
  },
  fr: {
    signupFailedTitle: "Échec de l'inscription",
    loginFailedTitle: "Échec de la connexion",
    loginSuccessTitle: "Connexion réussie",
    logoutSuccessTitle: "Déconnexion réussie",
    logoutSuccessMsg: "Vous avez été déconnecté.",
    logoutFailedTitle: "Échec de la déconnexion",
    welcomeMsgTitle: "Bienvenue sur Operlya !",
    welcomeMsgBody: "🎁 Félicitations ! Vous avez reçu +40 pièces de bienvenue pour commencer à créer vos CV !",
    welcomeUniTitle: "Bienvenue, futur professionnel !",
    welcomeUniBody: "🎓 Programme étudiant ! Vous avez reçu +200 pièces en tant qu'étudiant pour booster votre carrière !",
    missingProfileTitle: "Profil manquant",
    missingProfileMsg: "Connecté, mais aucun profil trouvé.",
    welcomeBack: "Bon retour",
    invalidCredentials: "Aucun compte trouvé avec cet e-mail ou mot de passe incorrect.",
    validation: {
      emailRequired: "E-mail requis",
      passwordRequired: "Mot de passe requis"
    }
  },
  es: {
    signupFailedTitle: "Error al registrarse",
    loginFailedTitle: "Error al iniciar sesión",
    loginSuccessTitle: "Sesión iniciada correctamente",
    logoutSuccessTitle: "Sesión cerrada correctamente",
    logoutSuccessMsg: "Has cerrado sesión.",
    logoutFailedTitle: "Error al cerrar sesión",
    welcomeMsgTitle: "¡Bienvenido a Operlya!",
    welcomeMsgBody: "🎁 ¡Felicidades! Has recibido +40 monedas de bienvenida para comenzar a crear tus CV.",
    welcomeUniTitle: "¡Bienvenido, futuro profesional!",
    welcomeUniBody: "🎓 ¡Programa de estudiantes! Has recibido +200 monedas como estudiante para impulsar tu carrera.",
    missingProfileTitle: "Perfil no encontrado",
    missingProfileMsg: "Sesión iniciada, pero no se encontró ningún perfil.",
    welcomeBack: "Bienvenido de nuevo",
    invalidCredentials: "No se encontró ninguna cuenta con este correo electrónico o la contraseña es incorrecta.",
    validation: {
      emailRequired: "Correo electrónico requerido",
      passwordRequired: "Contraseña requerida"
    }
  },
  de: {
    signupFailedTitle: "Registrierung fehlgeschlagen",
    loginFailedTitle: "Anmeldung fehlgeschlagen",
    loginSuccessTitle: "Anmeldung erfolgreich",
    logoutSuccessTitle: "Abmeldung erfolgreich",
    logoutSuccessMsg: "Sie wurden abgemeldet.",
    logoutFailedTitle: "Abmeldung fehlgeschlagen",
    welcomeMsgTitle: "Willkommen bei Operlya!",
    welcomeMsgBody: "🎁 Glückwunsch! Sie haben +40 Willkommensmünzen erhalten, um mit der Erstellung Ihrer Lebensläufe zu beginnen!",
    welcomeUniTitle: "Willkommen, zukünftiger Profi!",
    welcomeUniBody: "🎓 Studentenprogramm! Sie haben +200 Münzen als Student erhalten, um Ihre Karriere zu starten!",
    missingProfileTitle: "Profil fehlt",
    missingProfileMsg: "Eingeloggt, aber kein Profil gefunden.",
    welcomeBack: "Willkommen zurück",
    invalidCredentials: "Kein Konto mit dieser E-Mail gefunden oder Passwort falsch.",
    validation: {
      emailRequired: "E-Mail erforderlich",
      passwordRequired: "Passwort erforderlich"
    }
  },
  ar: {
    signupFailedTitle: "فشل التسجيل",
    loginFailedTitle: "فشل تسجيل الدخول",
    loginSuccessTitle: "تم تسجيل الدخول بنجاح",
    logoutSuccessTitle: "تم تسجيل الخروج بنجاح",
    logoutSuccessMsg: "تم تسجيل خروجك.",
    logoutFailedTitle: "فشل تسجيل الخروج",
    welcomeMsgTitle: "مرحبًا بك في Operlya!",
    welcomeMsgBody: "🎁 تهانينا! لقد حصلت على +40 عملة ترحيبية لبدء إنشاء سيرتك الذاتية!",
    welcomeUniTitle: "مرحبًا بك، أيها المحترف المستقبلي!",
    welcomeUniBody: "🎓 برنامج الطلاب! لقد حصلت على +200 عملة كطالب لبدء مسيرتك المهنية!",
    missingProfileTitle: "الملف الشخصي مفقود",
    missingProfileMsg: "تم تسجيل الدخول ولكن لم يتم العثور على ملف شخصي.",
    welcomeBack: "مرحبًا بعودتك",
    invalidCredentials: "لم يتم العثور على حساب بهذا البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    validation: {
      emailRequired: "البريد الإلكتروني مطلوب",
      passwordRequired: "كلمة المرور مطلوبة"
    }
  },
  pt: {
    signupFailedTitle: "Falha no cadastro",
    loginFailedTitle: "Falha no login",
    loginSuccessTitle: "Login realizado com sucesso",
    logoutSuccessTitle: "Logout realizado com sucesso",
    logoutSuccessMsg: "Você foi desconectado.",
    logoutFailedTitle: "Falha no logout",
    welcomeMsgTitle: "Bem-vindo ao Operlya!",
    welcomeMsgBody: "🎁 Parabéns! Você recebeu +40 moedas de boas-vindas para começar a criar seus currículos!",
    welcomeUniTitle: "Bem-vindo, futuro profissional!",
    welcomeUniBody: "🎓 Programa de estudantes! Você recebeu +200 moedas como estudante para impulsionar sua carreira!",
    missingProfileTitle: "Perfil ausente",
    missingProfileMsg: "Logado, mas nenhum perfil encontrado.",
    welcomeBack: "Bem-vindo de volta",
    invalidCredentials: "Nenhuma conta encontrada com este e-mail ou senha incorreta.",
    validation: {
      emailRequired: "E-mail obrigatório",
      passwordRequired: "Senha obrigatória"
    }
  },
  ja: {
    signupFailedTitle: "サインアップに失敗しました",
    loginFailedTitle: "ログインに失敗しました",
    loginSuccessTitle: "ログイン成功",
    logoutSuccessTitle: "ログアウト成功",
    logoutSuccessMsg: "ログアウトしました。",
    logoutFailedTitle: "ログアウトに失敗しました",
    welcomeMsgTitle: "Operlyaへようこそ！",
    welcomeMsgBody: "🎁 おめでとうございます！履歴書作成を始めるために+40のウェルカムコインを獲得しました！",
    welcomeUniTitle: "ようこそ、未来のプロフェッショナル！",
    welcomeUniBody: "🎓 学生プログラム！学生としてキャリアを始めるために+200コインを獲得しました！",
    missingProfileTitle: "プロフィールが見つかりません",
    missingProfileMsg: "ログインしましたが、プロフィールが見つかりませんでした。",
    welcomeBack: "おかえりなさい",
    invalidCredentials: "このメールアドレスのアカウントが見つからないか、パスワードが正しくありません。",
    validation: {
      emailRequired: "メールアドレスは必須です",
      passwordRequired: "パスワードは必須です"
    }
  },
  zh: {
    signupFailedTitle: "注册失败",
    loginFailedTitle: "登录失败",
    loginSuccessTitle: "登录成功",
    logoutSuccessTitle: "退出成功",
    logoutSuccessMsg: "您已退出登录。",
    logoutFailedTitle: "退出失败",
    welcomeMsgTitle: "欢迎来到 Operlya！",
    welcomeMsgBody: "🎁 恭喜！您已获得 +40 欢迎币，开始创建您的简历！",
    welcomeUniTitle: "欢迎，未来的专业人士！",
    welcomeUniBody: "🎓 学生计划！您已获得 +200 币作为学生来启动您的职业生涯！",
    missingProfileTitle: "个人资料缺失",
    missingProfileMsg: "已登录，但未找到个人资料。",
    welcomeBack: "欢迎回来",
    invalidCredentials: "未找到与此电子邮件关联的帐户或密码不正确。",
    validation: {
      emailRequired: "电子邮件地址为必填项",
      passwordRequired: "密码为必填项"
    }
  },
  ru: {
    signupFailedTitle: "Ошибка регистрации",
    loginFailedTitle: "Ошибка входа",
    loginSuccessTitle: "Вход выполнен успешно",
    logoutSuccessTitle: "Выход выполнен успешно",
    logoutSuccessMsg: "Вы вышли из системы.",
    logoutFailedTitle: "Ошибка выхода",
    welcomeMsgTitle: "Добро пожаловать в Operlya!",
    welcomeMsgBody: "🎁 Поздравляем! Вы получили +40 приветственных монет для начала создания своих резюме!",
    welcomeUniTitle: "Добро пожаловать, будущий профессионал!",
    welcomeUniBody: "🎓 Программа для студентов! Вы получили +200 монет в качестве студента, чтобы начать свою карьеру!",
    missingProfileTitle: "Профиль отсутствует",
    missingProfileMsg: "Вы вошли в систему, но профиль не найден.",
    welcomeBack: "С возвращением",
    invalidCredentials: "Учетная запись с таким адресом электронной почты не найдена или неверный пароль.",
    validation: {
      emailRequired: "Требуется адрес электронной почты",
      passwordRequired: "Требуется пароль"
    }
  }
};

const cvbSendPasswordTranslations = {
  en: {
    missingEmailTitle: "Missing Email",
    missingEmailMessage: "Please enter your email to reset password.",
    userNotFoundTitle: "User Not Found",
    userNotFoundMessage: "No account found with this email.",
    emailSentTitle: "Email Sent",
    emailSentMessage: "Password reset email has been sent.",
    resetFailedTitle: "Reset Failed"
  },
  fr: {
    missingEmailTitle: "Email manquant",
    missingEmailMessage: "Veuillez entrer votre email pour réinitialiser le mot de passe.",
    userNotFoundTitle: "Utilisateur non trouvé",
    userNotFoundMessage: "Aucun compte trouvé avec cet email.",
    emailSentTitle: "Email envoyé",
    emailSentMessage: "L'email de réinitialisation du mot de passe a été envoyé.",
    resetFailedTitle: "Échec de la réinitialisation"
  },
  es: {
    missingEmailTitle: "Correo faltante",
    missingEmailMessage: "Por favor, ingrese su correo para restablecer la contraseña.",
    userNotFoundTitle: "Usuario no encontrado",
    userNotFoundMessage: "No se encontró ninguna cuenta con este correo.",
    emailSentTitle: "Correo enviado",
    emailSentMessage: "El correo para restablecer la contraseña ha sido enviado.",
    resetFailedTitle: "Error al restablecer"
  },
  de: {
    missingEmailTitle: "Fehlende E-Mail",
    missingEmailMessage: "Bitte geben Sie Ihre E-Mail-Adresse ein, um das Passwort zurückzusetzen.",
    userNotFoundTitle: "Benutzer nicht gefunden",
    userNotFoundMessage: "Kein Konto mit dieser E-Mail gefunden.",
    emailSentTitle: "E-Mail gesendet",
    emailSentMessage: "Die Passwort-Zurücksetzungs-E-Mail wurde gesendet.",
    resetFailedTitle: "Zurücksetzen fehlgeschlagen"
  },
  ar: {
    missingEmailTitle: "البريد الإلكتروني مفقود",
    missingEmailMessage: "يرجى إدخال بريدك الإلكتروني لإعادة تعيين كلمة المرور.",
    userNotFoundTitle: "المستخدم غير موجود",
    userNotFoundMessage: "لا يوجد حساب مرتبط بهذا البريد الإلكتروني.",
    emailSentTitle: "تم إرسال البريد الإلكتروني",
    emailSentMessage: "تم إرسال بريد إعادة تعيين كلمة المرور.",
    resetFailedTitle: "فشل إعادة التعيين"
  },
  pt: {
    missingEmailTitle: "Email ausente",
    missingEmailMessage: "Por favor, insira seu e-mail para redefinir a senha.",
    userNotFoundTitle: "Usuário não encontrado",
    userNotFoundMessage: "Nenhuma conta encontrada com este e-mail.",
    emailSentTitle: "E-mail enviado",
    emailSentMessage: "O e-mail de redefinição de senha foi enviado.",
    resetFailedTitle: "Falha na redefinição"
  },
  ja: {
    missingEmailTitle: "メールが未入力です",
    missingEmailMessage: "パスワードをリセットするにはメールを入力してください。",
    userNotFoundTitle: "ユーザーが見つかりません",
    userNotFoundMessage: "このメールアドレスのアカウントは存在しません。",
    emailSentTitle: "メール送信済み",
    emailSentMessage: "パスワードリセットメールが送信されました。",
    resetFailedTitle: "リセット失敗"
  },
  zh: {
    missingEmailTitle: "邮箱缺失",
    missingEmailMessage: "请输入邮箱以重置密码。",
    userNotFoundTitle: "未找到用户",
    userNotFoundMessage: "未找到该邮箱的账户。",
    emailSentTitle: "邮件已发送",
    emailSentMessage: "密码重置邮件已发送。",
    resetFailedTitle: "重置失败"
  },
  ru: {
    missingEmailTitle: "Отсутствует Email",
    missingEmailMessage: "Пожалуйста, введите ваш email для сброса пароля.",
    userNotFoundTitle: "Пользователь не найден",
    userNotFoundMessage: "Аккаунт с этим email не найден.",
    emailSentTitle: "Письмо отправлено",
    emailSentMessage: "Письмо для сброса пароля было отправлено.",
    resetFailedTitle: "Сброс не удался"
  }
};

const Signup_AuthForm_translations = {
  en: {
    "show-password": "Show password",
    "hide-password": "Hide password",
    "signup-title": "Create Your Account",
    "signup-subtitle": "Join Operlya and access real opportunities to earn, collaborate, and grow.",
    "signup-first-name": "First name",
    "signup-last-name": "Last name",
    "signup-email": "Email address",
    "signup-birthday": "Birthday (optional)",
    "signup-password": "Password",
    "signup-btn": "Sign Up",
    "have-account": "Already have an account?",
    "login-link": "Login",
    "required-field": "This field is required",
    validation: {
      firstNameRequired: "First name required",
      lastNameRequired: "Last name required",
      emailRequired: "Email required",
      passwordRequired: "Password required"
    }
  },
  fr: {
    "show-password": "Afficher le mot de passe",
    "hide-password": "Cacher le mot de passe",
    "signup-title": "Créez votre compte",
    "signup-subtitle": "Rejoignez Operlya et accédez à de réelles opportunités pour gagner, collaborer et grandir.",
    "signup-first-name": "Prénom",
    "signup-last-name": "Nom",
    "signup-email": "Adresse e-mail",
    "signup-birthday": "Date de naissance (optionnelle)",
    "signup-password": "Mot de passe",
    "signup-btn": "S'inscrire",
    "have-account": "Vous avez déjà un compte ?",
    "login-link": "Se connecter",
    "required-field": "Ce champ est obligatoire",
    validation: {
      firstNameRequired: "Prénom requis",
      lastNameRequired: "Nom requis",
      emailRequired: "E-mail requis",
      passwordRequired: "Mot de passe requis"
    }
  },
  ar: {
    "show-password": "عرض كلمة المرور",
    "hide-password": "إخفاء كلمة المرور",
    "signup-title": "إنشاء حسابك",
    "signup-subtitle": "انضم إلى Operlya وتمتع بفرص حقيقية للكسب والتعاون والنمو.",
    "signup-first-name": "الاسم الأول",
    "signup-last-name": "اسم العائلة",
    "signup-email": "البريد الإلكتروني",
    "signup-birthday": "تاريخ الميلاد (اختياري)",
    "signup-password": "كلمة المرور",
    "signup-btn": "إنشاء حساب",
    "have-account": "هل لديك حساب بالفعل؟",
    "login-link": "تسجيل الدخول",
    "required-field": "هذا الحقل مطلوب",
    validation: {
      firstNameRequired: "الاسم الأول مطلوب",
      lastNameRequired: "اسم العائلة مطلوب",
      emailRequired: "البريد الإلكتروني مطلوب",
      passwordRequired: "كلمة المرور مطلوبة"
    }
  },
  es: {
    "show-password": "Mostrar contraseña",
    "hide-password": "Ocultar contraseña",
    "signup-title": "Crea tu cuenta",
    "signup-subtitle": "Únete a Operlya y accede a oportunidades reales para ganar, colaborar y crecer.",
    "signup-first-name": "Nombre",
    "signup-last-name": "Apellido",
    "signup-email": "Correo electrónico",
    "signup-birthday": "Fecha de nacimiento (opcional)",
    "signup-password": "Contraseña",
    "signup-btn": "Registrarse",
    "have-account": "¿Ya tienes una cuenta?",
    "login-link": "Iniciar sesión",
    "required-field": "Este campo es obligatorio",
    validation: {
      firstNameRequired: "Nombre requerido",
      lastNameRequired: "Apellido requerido",
      emailRequired: "Correo electrónico requerido",
      passwordRequired: "Contraseña requerida"
    }
  },
  zh: {
    "show-password": "显示密码",
    "hide-password": "隐藏密码",
    "signup-title": "创建您的账户",
    "signup-subtitle": "加入 Operlya，获取真实机会，赚取收益、协作共进、实现成长。",
    "signup-first-name": "名字",
    "signup-last-name": "姓氏",
    "signup-email": "电子邮箱",
    "signup-birthday": "生日（可选）",
    "signup-password": "密码",
    "signup-btn": "注册",
    "have-account": "已经有账户？",
    "login-link": "登录",
    "required-field": "此字段为必填项",
    validation: {
      firstNameRequired: "名字为必填项",
      lastNameRequired: "姓氏为必填项",
      emailRequired: "电子邮箱为必填项",
      passwordRequired: "密码为必填项"
    }
  },
  de: {
    "show-password": "Passwort anzeigen",
    "hide-password": "Passwort verbergen",
    "signup-title": "Erstellen Sie Ihr Konto",
    "signup-subtitle": "Treten Sie Operlya bei und nutzen Sie echte Möglichkeiten, um zu verdienen, zusammenzuarbeiten und zu wachsen.",
    "signup-first-name": "Vorname",
    "signup-last-name": "Nachname",
    "signup-email": "E-Mail-Adresse",
    "signup-birthday": "Geburtsdatum (optional)",
    "signup-password": "Passwort",
    "signup-btn": "Registrieren",
    "have-account": "Sie haben bereits ein Konto?",
    "login-link": "Anmelden",
    "required-field": "Dieses Feld ist erforderlich",
    validation: {
      firstNameRequired: "Vorname erforderlich",
      lastNameRequired: "Nachname erforderlich",
      emailRequired: "E-Mail erforderlich",
      passwordRequired: "Passwort erforderlich"
    }
  },
  pt: {
    "show-password": "Mostrar senha",
    "hide-password": "Ocultar senha",
    "signup-title": "Crie sua conta",
    "signup-subtitle": "Junte-se à Operlya e acesse oportunidades reais para ganhar, colaborar e crescer.",
    "signup-first-name": "Nome",
    "signup-last-name": "Sobrenome",
    "signup-email": "E-mail",
    "signup-birthday": "Data de nascimento (opcional)",
    "signup-password": "Senha",
    "signup-btn": "Cadastrar-se",
    "have-account": "Já tem uma conta?",
    "login-link": "Entrar",
    "required-field": "Este campo é obrigatório",
    validation: {
      firstNameRequired: "Nome obrigatório",
      lastNameRequired: "Sobrenome obrigatório",
      emailRequired: "E-mail obrigatório",
      passwordRequired: "Senha obrigatória"
    }
  },
  ja: {
    "show-password": "パスワードを表示",
    "hide-password": "パスワードを非表示",
    "signup-title": "アカウントを作成",
    "signup-subtitle": "Operlyaに参加して、収入、コラボレーション、成長のための本当の機会を得ましょう。",
    "signup-first-name": "名",
    "signup-last-name": "姓",
    "signup-email": "メールアドレス",
    "signup-birthday": "誕生日（任意）",
    "signup-password": "パスワード",
    "signup-btn": "登録する",
    "have-account": "すでにアカウントをお持ちですか？",
    "login-link": "ログイン",
    "required-field": "このフィールドは必須です",
    validation: {
      firstNameRequired: "名は必須です",
      lastNameRequired: "姓は必須です",
      emailRequired: "メールアドレスは必須です",
      passwordRequired: "パスワードは必須です"
    }
  },
  ru: {
    "show-password": "Показать пароль",
    "hide-password": "Скрыть пароль",
    "signup-title": "Создайте аккаунт",
    "signup-subtitle": "Присоединяйтесь к Operlya и получите реальные возможности для заработка, сотрудничества и роста.",
    "signup-first-name": "Имя",
    "signup-last-name": "Фамилия",
    "signup-email": "Электронная почта",
    "signup-birthday": "Дата рождения (необязательно)",
    "signup-password": "Пароль",
    "signup-btn": "Зарегистрироваться",
    "have-account": "Уже есть аккаунт?",
    "login-link": "Войти",
    "required-field": "Это поле обязательно для заполнения",
    validation: {
      firstNameRequired: "Имя обязательно",
      lastNameRequired: "Фамилия обязательна",
      emailRequired: "Электронная почта обязательна",
      passwordRequired: "Пароль обязателен"
    }
  }
};