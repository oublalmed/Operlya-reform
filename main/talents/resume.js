// ================================ CV Preview Notifications ==============================

const cvbNotificationsTranslations = {
  en: {
    fillRequired: "Please fill at least one personal info, experience, education, skill/language, and interest.",
    saved: "CV saved successfully!",
    error: "An error occurred, please try again."
  },
  fr: {
    fillRequired: "Veuillez remplir au moins une information personnelle, expérience, éducation, compétence/langue et centre d'intérêt.",
    saved: "CV enregistré avec succès !",
    error: "Une erreur est survenue, veuillez réessayer."
  },
  ar: {
    fillRequired: "يرجى ملء معلومات شخصية واحدة على الأقل، الخبرة، التعليم، المهارات/اللغات والاهتمامات.",
    saved: "تم حفظ السيرة الذاتية بنجاح!",
    error: "حدث خطأ، يرجى المحاولة مرة أخرى."
  },
  es: {
    fillRequired: "Por favor, completa al menos una información personal, experiencia, educación, habilidad/idioma e interés.",
    saved: "¡CV guardado con éxito!",
    error: "Ocurrió un error, por favor inténtalo de nuevo."
  },
  zh: {
    fillRequired: "请至少填写一项个人信息、工作经验、教育、技能/语言和兴趣。",
    saved: "简历已成功保存！",
    error: "发生错误，请重试。"
  },
  de: {
    fillRequired: "Bitte füllen Sie mindestens eine persönliche Information, Erfahrung, Ausbildung, Fähigkeit/Sprache und Interesse aus.",
    saved: "Lebenslauf erfolgreich gespeichert!",
    error: "Ein Fehler ist aufgetreten, bitte versuchen Sie es erneut."
  },
  pt: {
    fillRequired: "Por favor, preencha pelo menos uma informação pessoal, experiência, educação, habilidade/idioma e interesse.",
    saved: "Currículo salvo com sucesso!",
    error: "Ocorreu um erro, tente novamente."
  },
  ja: {
    fillRequired: "個人情報、職務経験、学歴、スキル/言語、興味のうち少なくとも1つを入力してください。",
    saved: "履歴書が正常に保存されました！",
    error: "エラーが発生しました。もう一度お試しください。"
  },
  ru: {
    fillRequired: "Пожалуйста, заполните как минимум одну личную информацию, опыт, образование, навык/язык и интерес.",
    saved: "Резюме успешно сохранено!",
    error: "Произошла ошибка, пожалуйста, попробуйте снова."
  }
};

function PreviewNotification(type, messageKey) {
  const languageSelect = document.querySelector('#languageSelectorSidebar');
  const selectedLang =
    languageSelect?.getAttribute('data-selected') ||
    sessionStorage.getItem('mynextcv-language') ||
    'en';

  const text =
    (cvbNotificationsTranslations[selectedLang] &&
      cvbNotificationsTranslations[selectedLang][messageKey]) ||
    messageKey;

  const notif = document.getElementById('cvb-notification');
  notif.textContent = text;
  notif.className = `cvb-InternalNotify ${type}`;
  notif.classList.remove('hidden');

  setTimeout(() => {
    notif.classList.add('hidden');
  }, 3000);
}

// ================================== CV Preview templates =================================

function getTemplateFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("template");
}

const cvbTranslations = {
  en: {
    profile: "PROFILE",
    summary: "SUMMARY",
    work: "WORK EXPERIENCE",
    education: "EDUCATION",
    certifications: "CERTIFICATIONS",
    coreSkills: "CORE SKILLS",
    languages: "LANGUAGES",
    interests: "INTERESTS",
    to: "to",
    in: "In",
    present: "Present",
    beginner: "Beginner",
    basic: "Basic",
    current: "Current",
    fluency: "Fluency",
    maternel: "Maternel",
    generatedBy: "(Generated with Sheet2ERP CV Builder)",
  },
  fr: {
    profile: "PROFIL",
    summary: "RÉSUMÉ",
    work: "EXPÉRIENCE PROFESSIONNELLE",
    education: "FORMATION",
    certifications: "CERTIFICATIONS",
    coreSkills: "COMPÉTENCES CLÉS",
    languages: "LANGUES",
    interests: "CENTRES D\u2019INTÉRÊT",
    to: "au",
    in: "à",
    present: "Présent",
    beginner: "Débutant",
    basic: "Basique",
    current: "Courant",
    fluency: "Maîtrise",
    maternel: "Maternelle",
    generatedBy: "(Généré avec Sheet2ERP CV Builder)",
  },
  de: {
    profile: "PROFIL",
    summary: "SUMMARISCH",
    work: "BERUFLICHE ERFAHRUNG",
    education: "AUSBILDUNG",
    certifications: "ZERTIFIKATE",
    coreSkills: "KERNKOMPETENZEN",
    languages: "SPRACHEN",
    interests: "INTERESSEN",
    to: "bis",
    in: "in",
    present: "Heute",
    beginner: "Anfänger",
    basic: "Basic",
    current: "Fließend",
    fluency: "Meisterschaft",
    maternel: "Kindergarten",
    generatedBy: "(Erstellt mit Sheet2ERP CV Builder)",
  },
  es: {
    profile: "PERFIL",
    summary: "RESUMEN",
    work: "EXPERIENCIA LABORAL",
    education: "EDUCACIÓN",
    certifications: "CERTIFICACIONES",
    coreSkills: "COMPETENCIAS CLAVE",
    languages: "IDIOMAS",
    interests: "INTERESES",
    to: "hasta",
    in: "en",
    present: "Actualidad",
    beginner: "Principiante",
    basic: "Básico",
    current: "Intermedio",
    fluency: "Fluido",
    maternel: "Nativo",
    generatedBy: "(Generado con Sheet2ERP CV Builder)",
  },
  it: {
    profile: "PROFILO",
    summary: "SINTESI",
    work: "ESPERIENZA LAVORATIVA",
    education: "ISTRUZIONE",
    certifications: "CERTIFICAZIONI",
    coreSkills: "COMPETENZE CHIAVE",
    languages: "LINGUE",
    interests: "INTERESSI",
    to: "a",
    in: "in",
    present: "Presente",
    beginner: "Principiante",
    basic: "Base",
    current: "Intermedio",
    fluency: "Fluente",
    maternel: "Madrelingua",
    generatedBy: "(Generato con Sheet2ERP CV Builder)",
  },
  pt: {
    profile: "PERFIL",
    summary: "RESUMO",
    work: "EXPERIÊNCIA PROFISSIONAL",
    education: "EDUCAÇÃO",
    certifications: "CERTIFICAÇÕES",
    coreSkills: "COMPETÊNCIAS ESSENCIAIS",
    languages: "IDIOMAS",
    interests: "INTERESSES",
    to: "até",
    in: "em",
    present: "Presente",
    beginner: "Iniciante",
    basic: "Básico",
    current: "Intermediário",
    fluency: "Fluente",
    maternel: "Nativo",
    generatedBy: "(Gerado com Sheet2ERP CV Builder)",
  },
  nl: {
    profile: "PROFIEL",
    summary: "OVERZICHT",
    work: "WERKERVARING",
    education: "OPLEIDING",
    certifications: "CERTIFICATEN",
    coreSkills: "KERNVAARDIGHEDEN",
    languages: "TALEN",
    interests: "INTERESSES",
    to: "tot",
    in: "in",
    present: "Heden",
    beginner: "Beginner",
    basic: "Basis",
    current: "Gemiddeld",
    fluency: "Vloeiend",
    maternel: "Moedertaal",
    generatedBy: "(Gegenereerd met Sheet2ERP CV Builder)",
  }
};

function formatCVDate(dateStr, lang = "en", yearOnly = false) {
  if (!dateStr) {
    return cvbTranslations[lang]?.present || "Present";
  }

  const parts = dateStr.split("-");
  const year = parts[0];

  if (yearOnly || parts.length < 2) {
    return year;
  }

  const monthIndex = parseInt(parts[1], 10) - 1;

  const monthNames = {
    en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    fr: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"],
    de: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"],
    es: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"],
    it: ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre"],
    pt: ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"],
    nl: ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"]
  };

  const month = monthNames[lang]?.[monthIndex] || monthNames.en[monthIndex];
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);

  return `${capitalizedMonth}, ${year}`;
}

let CVvalidation = false;
let PreviewSelectCVStyle = 'cvbPreviewPDF_Analyst';
let selectedCVStyle = 'cvbDownloadPDF_Analyst';

function selectCVStyle(downloadStyle, imgElement) {
  const mapping = {
    'cvbDownloadPDF_Diplomat': 'cvbPreviewPDF_Diplomat',
    'cvbDownloadPDF_Visionary': 'cvbPreviewPDF_Visionary',
    'cvbDownloadPDF_Innovator': 'cvbPreviewPDF_Innovator',
    'cvbDownloadPDF_Titan': 'cvbPreviewPDF_Titan',
    'cvbDownloadPDF_Luminary': 'cvbPreviewPDF_Luminary',
    'cvbDownloadPDF_Commander': 'cvbPreviewPDF_Commander',
    'cvbDownloadPDF_Analyst': 'cvbPreviewPDF_Analyst',
    'cvbDownloadPDF_Executive': 'cvbPreviewPDF_Executive',
    'cvbDownloadPDF_Strategist': 'cvbPreviewPDF_Strategist',
    'cvbDownloadPDF_Authority': 'cvbPreviewPDF_Authority',
    'cvbDownloadPDF_Minimalist': 'cvbPreviewPDF_Minimalist',
    'cvbDownloadPDF_Precisionist': 'cvbPreviewPDF_Precisionist',
    'cvbDownloadPDF_Coordinator': 'cvbPreviewPDF_Coordinator',
    'cvbDownloadPDF_Mentor': 'cvbPreviewPDF_Mentor',
    'cvbDownloadPDF_Architect': 'cvbPreviewPDF_Architect',
    'cvbDownloadPDF_Connector': 'cvbPreviewPDF_Connector',
    'cvbDownloadPDF_Specialist': 'cvbPreviewPDF_Specialist',
    'cvbDownloadPDF_Vanguard': 'cvbPreviewPDF_Vanguard',
    'cvbDownloadPDF_Virtuoso': 'cvbPreviewPDF_Virtuoso',
  };

  selectedCVStyle = downloadStyle;
  const previewStyle = mapping[downloadStyle];
  if (previewStyle) {
    setPreviewStyle(previewStyle);
  }

  const images = document.querySelectorAll('#cv-style-selection img');
  images.forEach(img => {
    img.style.border = '1px solid #dde4f0';
  });
  imgElement.style.border = '2px solid #2878dc';
}

function downloadSelectedCV() {
  return new Promise((resolve) => {
    if (typeof window[selectedCVStyle] !== 'function') {
      alert('No valid CV style selected.');
      return resolve(false);
    }
    CVvalidation = false;
    const originalValidation = CVvalidation;
    window[selectedCVStyle]();
    setTimeout(() => {
      resolve(CVvalidation);
    }, 500);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const template = getTemplateFromURL();
  if (!template) return;

  const mapping = {
    "Analyst": "cvbDownloadPDF_Analyst",
    "Strategist": "cvbDownloadPDF_Strategist",
    "Authority": "cvbDownloadPDF_Authority",
    "Executive": "cvbDownloadPDF_Executive"
  };

  const downloadStyle = mapping[template];
  if (!downloadStyle) return;

  const images = document.querySelectorAll('#cv-style-selection img');

  images.forEach(img => {
    if (img.getAttribute("onclick")?.includes(downloadStyle)) {
      selectCVStyle(downloadStyle, img);
    }
  });
});

let cvPreviewScale = 1;
let isDragging = false;
let startX, startY, currentX = 0, currentY = 0;

const previewImg = document.getElementById("cvb-preview-img");
if (previewImg) {
  previewImg.style.transformOrigin = "center center";
  previewImg.style.cursor = "grab";

  previewImg.addEventListener("mousedown", (e) => {
    if (cvPreviewScale <= 1) return;
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    previewImg.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    previewImg.style.cursor = "grab";
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging || cvPreviewScale <= 1) return;
    currentX = e.clientX - startX;
    currentY = e.clientY - startY;
    updatePreviewTransform();
  });

  previewImg.addEventListener("dragstart", (e) => e.preventDefault());
}

function zoomInPreview() {
  const previewImg = document.getElementById("cvb-preview-img");
  if (!previewImg) return;

  cvPreviewScale = Math.min(cvPreviewScale + 0.1, 3); // limit zoom
  updatePreviewTransform(true);
}

function zoomOutPreview() {
  const previewImg = document.getElementById("cvb-preview-img");
  if (!previewImg) return;

  cvPreviewScale = Math.max(1, cvPreviewScale - 0.1);
  if (cvPreviewScale === 1) {
    currentX = 0;
    currentY = 0;
  }
  updatePreviewTransform(true);
}

function updatePreviewTransform(smooth = false) {
  const previewImg = document.getElementById("cvb-preview-img");
  if (!previewImg) return;

  previewImg.style.transition = smooth ? "transform 0.2s ease" : "none";
  previewImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${cvPreviewScale})`;
}

async function showPreview(doc) {
  const previewImg = document.getElementById("cvb-preview-img");
  const placeholder = document.getElementById("cvb-preview-placeholder");

  try {
    cvPreviewScale = 1;
    currentX = 0;
    currentY = 0;
    updatePreviewTransform(false);

    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.worker.min.js';

    const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    const imageData = canvas.toDataURL("image/png");
    previewImg.src = imageData;

    placeholder.classList.add("hidden");
    previewImg.classList.remove("hidden");

    URL.revokeObjectURL(pdfUrl);
  } catch (err) {
    console.error("Image preview failed:", err);
    previewImg.alt = "Failed to load preview";
    placeholder.classList.remove("hidden");
    previewImg.classList.add("hidden");
  }
}

function setPreviewStyle(styleFunctionName) {
  PreviewSelectCVStyle = styleFunctionName;

  const images = document.querySelectorAll('#cv-style-selection img');
  images.forEach(img => {
    img.style.border = '1px solid #dde4f0';
  });

  const functionToIndex = {
    'cvbPreviewPDF_Diplomat': 0,
    'cvbPreviewPDF_Visionary': 1,
    'cvbPreviewPDF_Innovator': 2,
    'cvbPreviewPDF_Titan': 3,
    'cvbPreviewPDF_Luminary': 4,
    'cvbPreviewPDF_Commander': 5,
    'cvbPreviewPDF_Analyst': 6,
    'cvbPreviewPDF_Executive': 7,
    'cvbPreviewPDF_Strategist': 8,
    'cvbPreviewPDF_Authority': 9,
    'cvbPreviewPDF_Minimalist': 10,
    'cvbPreviewPDF_Precisionist': 11,
    'cvbPreviewPDF_Coordinator': 12,
    'cvbPreviewPDF_Mentor': 13,
    'cvbPreviewPDF_Architect': 14,
    'cvbPreviewPDF_Connector': 15,
    'cvbPreviewPDF_Specialist': 16,
    'cvbPreviewPDF_Vanguard': 17,
    'cvbPreviewPDF_Virtuoso': 18,
  };

  const index = functionToIndex[styleFunctionName];
  if (images[index]) {
    images[index].style.border = '2px solid #2878dc';
  }
}

function previewSelectedCV() {
  if (typeof window[PreviewSelectCVStyle] === 'function') {
    window[PreviewSelectCVStyle]();
  } else {
    alert('No valid CV style selected.');
  }
}

function cvbValidateRequiredData() {
  // Personal info: at least one of fullName, phone, email, address, speciality, summary
  const fullName = document.getElementById("cvb-fullName")?.value.trim();
  const phone = document.getElementById("cvb-phone")?.value.trim();
  const email = document.getElementById("cvb-email")?.value.trim();
  const address = document.getElementById("cvb-address")?.value.trim();
  const speciality = document.getElementById("cvb-speciality")?.value.trim();
  const summary = document.getElementById("cvb-summary-text")?.value.trim();

  const personalInfoFilled = fullName || phone || email || address || speciality || summary;
  if (!personalInfoFilled) return false;

  // Experience
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  let hasExperience = false;
  expSections.forEach(pane => {
    const inputs = pane.querySelectorAll('input');
    const textarea = pane.querySelector('textarea');
    const values = Array.from(inputs).map(i => i.value.trim());
    const description = textarea?.value.trim();
    if (values.some(v => v) || description) hasExperience = true;
  });
  if (!hasExperience) return false;

  // Education
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  let hasEducation = false;
  eduSections.forEach(pane => {
    const inputs = pane.querySelectorAll('input');
    const values = Array.from(inputs).map(i => i.value.trim());
    if (values.some(v => v)) hasEducation = true;
  });
  if (!hasEducation) return false;

  // Skills / Languages
  const techSkills = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup input[type='text']");
  const softSkills = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup input[type='text']");
  const skillsFilled = Array.from(techSkills).some(i => i.value.trim()) || Array.from(softSkills).some(i => i.value.trim());
  if (!skillsFilled) return false;

  // Interests
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
  const hasInterest = Array.from(interestInputs).some((input, i) => input.value.trim() && interestCheckboxes[i]?.checked);
  if (!hasInterest) return false;

  return true;
}

function cvbPreviewPDF_Diplomat() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData, checkOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(r, g, b);
      doc.text(title, margin, currentY);
      currentY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineHeight;
    }
    
    if (imgData) {
      const imgWidth = 25;
      const imgHeight = 25;
      const borderRadius = 2;
      const imgX = pageWidth - margin - imgWidth;
      const imgY = currentY - 4;

      const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
      const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
      const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.8));

      doc.setLineWidth(2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2, borderRadius, borderRadius, 'FD');

      doc.setLineWidth(0.4);
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    }

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 155);
    doc.text(nameLines, margin, currentY);
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(speciality, margin, currentY);
    currentY += lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(summary, 155);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * lineHeight;

    const contactLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    doc.setFontSize(10);
    doc.setTextColor(100);
    const contactLines = doc.splitTextToSize(contactLine, 155);
    doc.text(contactLines, margin, currentY);
    currentY += contactLines.length * lineHeight;

    currentY += 2;

    // Work Experience
    addSectionTitle(T.work);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");
      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] // Job type
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin + 2, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin + 2, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin + 2, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
          currentY += lineHeight;
          doc.setFont("helvetica", "normal");
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2], values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin + 2, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }
    
    // === Technical Skills
    addSectionTitle(T.coreSkills);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // === Languages
    addSectionTitle(T.languages);
    doc.setFontSize(12);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    currentY += 2;

    // Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    const interests = [];

    interestTextInputs.forEach((input, i) => {
      const checkbox = interestCheckboxes[i];
      const val = input?.value.trim();
      if (checkbox?.checked && val) interests.push(val);
    });

    if (interests.length > 0) {
      addSectionTitle(T.interests);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const interestLine = doc.splitTextToSize(interests.join(" - "), pageWidth - 2 * margin);
      doc.text(interestLine, margin, currentY);
      currentY += interestLine.length * lineHeight;
    }
    
    if (checkOnly) return currentY;
  	showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}
  
function cvbPreviewPDF_Visionary() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    //doc.setFillColor(230, 240, 255);
    //doc.rect(0, 0, rightColX - 5, pageHeight, 'F');

    const headerBoxHeight = 36;
    const imageWidth = 25;
    const imageHeight = 25;
    const imageX = pageWidth - margin - imageWidth;
    const imageY = currentY + (headerBoxHeight - imageHeight) / 2;

    if (imgData) {
      doc.addImage(imgData, 'JPEG', imageX, imageY - 3, imageWidth, imageHeight);
    }

    const textX = leftColX;
    let textY = currentY + 8;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - imageWidth - 4 * margin);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryMaxLines = 3;
    let summaryLines = doc.splitTextToSize(summary, imageX - textX - 5);
    if (summaryLines.length > summaryMaxLines) {
      summaryLines = summaryLines.slice(0, summaryMaxLines);
    }
    doc.text(summaryLines, textX, textY);
    textY += summaryMaxLines * lineHeight;

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    const personalLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    const contactLines = doc.splitTextToSize(personalLine, imageX - textX - 5);
    const contactY = currentY + headerBoxHeight - (contactLines.length * lineHeight) + 3;
    doc.text(contactLines, textX, contactY);

    currentY += headerBoxHeight;

    doc.setFillColor(r, g, b);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 1.5, 'F');
    currentY += lineHeight + 3;

    // === LEFT COLUMN
    let leftY = currentY;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(T.coreSkills, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    leftY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.certifications, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(leftColX, leftY, rightColX - 10, leftY);
      leftY += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2], values[5]
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
          hasCertContent = true;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.languages, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    leftY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(T.interests, leftColX, leftY);
          leftY += 2;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.4);
          doc.line(leftColX, leftY, rightColX - 10, leftY);
          leftY += lineHeight;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.work, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");
        if (values[5]) {
          educationMeta += ` | Honors: ${values[5]}`;
        }
        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null)); // fallback if image fails to load
    } else {
      generatePDF(null);
    }
  }
}

function cvbPreviewPDF_Innovator() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 125;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawRightBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 5, 0, pageWidth - rightColX + 5, pageHeight, 'F');
  }

  function drawHeader(imgData, startY) {
    let textX = leftColX;
    let textY = startY + lineHeight;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), leftColWidth - 35);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(11);
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const contactLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    const contactLines = doc.splitTextToSize(contactLine, leftColWidth - 35);
    doc.text(contactLines, textX, textY);
    textY += contactLines.length * lineHeight - 5;

    return textY + lineHeight;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];

    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;

      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",   // Location
        values[5]                                  // Job type
      ].filter(Boolean).join(" | ");

      arr.push({ title, meta, desc });
    });

    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];

    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;

      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = values[5] ? `Honors: ${values[5]}` : "";

      arr.push({ title, meta, desc });
    });

    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];

    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;

      const desc = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta: "",
        desc
      });
    });

    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawRightBackground();
    
    leftY = drawHeader(imgData, leftY);

    // LEFT COLUMN CONTENT
    leftY = addSection(T.profile, [summary], leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    if (imgData) {
      const imgWidth = 27;
      const imgHeight = 27;
      const imgX = rightColX + (rightColWidth - imgWidth) / 2;
      const imgY = rightY;
      const borderRadius = 4;
      const borderThickness = 2;
      doc.setFillColor(255, 255, 255); // white
      doc.roundedRect(
        imgX - borderThickness,
        imgY - borderThickness,
        imgWidth + 2 * borderThickness,
        imgHeight + 2 * borderThickness,
        borderRadius,
        borderRadius,
        'F'
      );
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
      rightY += imgHeight + borderThickness * 2 + 10;
    }
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}
  
function cvbPreviewPDF_Titan() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const rightColX = 135;
  const middleX = 130;

  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const projectSections = document.querySelectorAll('#cvb-project-content .cvb-tab-pane');
  const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    const imageWidth = 25;
    const imageHeight = 25;
    const imageX = pageWidth - margin - imageWidth;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - imageWidth - 4 * margin);
    doc.text(nameLines, leftColX, currentY + 8);
    let nameY = currentY + 8 + nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, leftColX, nameY);
    nameY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    let summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin - imageWidth - 10);
    if (summaryLines.length > 3) {
      summaryLines = summaryLines.slice(0, 2);
      summaryLines.push("...");
    }
    doc.text(summaryLines, leftColX, nameY);
    nameY += summaryLines.length * lineHeight;

    const imageY = currentY;
    if (imgData) {
      const borderRadius = 2;
      const borderPadding = 1;

      const borderX = imageX - borderPadding - 3;
      const borderY = imageY - borderPadding;
      const borderWidth = imageWidth + borderPadding * 2;
      const borderHeight = imageHeight + borderPadding * 2;

      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.roundedRect(borderX, borderY, borderWidth, borderHeight, borderRadius, borderRadius, 'S');
      doc.addImage(imgData, 'JPEG', imageX - 3, imageY, imageWidth, imageHeight);
    }

    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const iconSize = 4.5;
    const iconGap = 1.5;
    const itemGap = 6;

    let contactX = leftColX;
    let contactY = nameY;

    const drawContact = (icon, text) => {
      if (!text) return;
      const textWidth = doc.getTextWidth(text);
      if (icon) {
        doc.addImage(icon, 'PNG', contactX, contactY - 3.5, iconSize, iconSize);
      }
      doc.text(text, contactX + iconSize + 1.5, contactY);
      contactX += iconSize + 1.5 + textWidth + itemGap;
    };

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");
    drawContact(icons.phone, phone);
    drawContact(icons.email, email);
    drawContact(icons.linkedin, linkedin);
    drawContact(icons.address, address);

    nameY += lineHeight;
    currentY = nameY + 2;

    // === LEFT COLUMN: Experience, Education
    let leftY = currentY;

    const renderSection = (title, elements, drawFn) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text(title, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(leftColX, leftY, middleX - 5, leftY);
      leftY += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      elements.forEach(drawFn);
      leftY += 2;
    };

    let firstCircleY = null;
    let lastCircleY = null;

    renderSection(T.work, expSections, (pane, index, allPanes) => {
      if (!pane.querySelector('input[type="checkbox"]')?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        const circleRadius = 1.6;
        const circleX = leftColX + 3;
        const textX = leftColX + 8;
        const maxTextWidth = middleX - textX - margin;

        const circleY = leftY - 1.5;

        const lightR = Math.floor((r + 255) / 2);
        const lightG = Math.floor((g + 255) / 2);
        const lightB = Math.floor((b + 255) / 2);

        doc.setDrawColor(lightR, lightG, lightB);
        doc.setFillColor(lightR, lightG, lightB);
        doc.circle(circleX, circleY, circleRadius, 'F');

        if (firstCircleY === null) {
          firstCircleY = circleY;
        }
        lastCircleY = circleY;

        const titleLines = doc.splitTextToSize(`${values[0]} - ${values[1]}`, maxTextWidth);
        titleLines.forEach(line => {
          doc.setFont("helvetica", "bold");
          doc.text(line, textX, leftY);
          leftY += lineHeight;
        });

        doc.setFont("helvetica", "normal");
        const periodLine = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const periodLines = doc.splitTextToSize(periodLine, maxTextWidth);
        periodLines.forEach(line => {
          doc.text(line, textX + 2, leftY);
          leftY += lineHeight;
        });

        const descLines = doc.splitTextToSize(description, maxTextWidth);
        descLines.forEach(line => {
          doc.text(line, textX + 2, leftY);
          leftY += lineHeight;
        });
      }
    });

    if (firstCircleY !== null && lastCircleY !== null && firstCircleY !== lastCircleY) {
      const lightR = Math.floor((r + 255) / 2);
      const lightG = Math.floor((g + 255) / 2);
      const lightB = Math.floor((b + 255) / 2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setLineWidth(1);
      const circleX = leftColX + 3;
      doc.line(circleX, firstCircleY, circleX, lastCircleY);
    }
    
    leftY += 2;

    let firstEduCircleY = null;
    let lastEduCircleY = null;

    renderSection(T.education, eduSections, (pane, index, allPanes) => {
      if (!pane.querySelector('input[type="checkbox"]')?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      if (values.some(v => v)) {
        const circleRadius = 1.6;
        const circleX = leftColX + 3;
        const textX = leftColX + 8;
        const maxTextWidth = middleX - textX - margin;
        const circleY = leftY - 1.5;

        const lightR = Math.floor((r + 255) / 2);
        const lightG = Math.floor((g + 255) / 2);
        const lightB = Math.floor((b + 255) / 2);

        doc.setDrawColor(lightR, lightG, lightB);
        doc.setFillColor(lightR, lightG, lightB);
        doc.circle(circleX, circleY, circleRadius, 'F');

        if (firstEduCircleY === null) {
          firstEduCircleY = circleY;
        }
        lastEduCircleY = circleY;

        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(`${values[0]} - ${values[1]}`, maxTextWidth);
        titleLines.forEach(line => {
          doc.text(line, textX, leftY);
          leftY += lineHeight;
        });

        doc.setFont("helvetica", "normal");
        const infoLine = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const infoLines = doc.splitTextToSize(infoLine, maxTextWidth);
        infoLines.forEach(wline => {
          doc.text(wline, textX + 2, leftY);
          leftY += lineHeight;
        });

        leftY += 1;
      }
    });

    if (firstEduCircleY !== null && lastEduCircleY !== null && firstEduCircleY !== lastEduCircleY) {
      const lightR = Math.floor((r + 255) / 2);
      const lightG = Math.floor((g + 255) / 2);
      const lightB = Math.floor((b + 255) / 2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setLineWidth(1);
      const circleX = leftColX + 3;
      doc.line(circleX, firstEduCircleY, circleX, lastEduCircleY);
    }

    // === RIGHT COLUMN: Skills, Certs, Languages, Interests, Awards
    let rightY = currentY;
    doc.setLineWidth(0.4);

    const drawStars = (score, x, y) => {
      const radius = 1.5, spacing = 4;
      for (let i = 1; i <= 5; i++) {
        const fill = i <= score;
        doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
        doc.circle(x + (i - 1) * spacing, y - 1.5, radius, fill ? 'F' : 'S');
      }
    };

    const renderSkillSection = (title, items) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text(title, rightColX, rightY);
      rightY += 2;
      doc.setDrawColor(r, g, b);
      doc.line(rightColX, rightY, pageWidth - margin, rightY);
      rightY += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const name = item.querySelector('input[type="text"]')?.value.trim();
        const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
        if (name && score) {
          const circleTotalWidth = 5 * 4;
          const circleX = pageWidth - margin - circleTotalWidth;
          const maxNameWidth = circleX - rightColX - 4;
          const nameLines = doc.splitTextToSize(name, maxNameWidth);

          nameLines.forEach((line, index) => {
            doc.text(line, rightColX, rightY + index * lineHeight);
          });

          drawStars(score, circleX, rightY);
          rightY += nameLines.length * lineHeight;
        }
      });

      rightY += 2;
    };

    renderSkillSection(T.coreSkills, techSkillsItems);

    if (certSections.length > 0) {
      let hasCertContent = false;
      certSections.forEach(pane => {
        if (pane.querySelector('input[type="checkbox"]')?.checked) {
          const inputs = pane.querySelectorAll('input');
          const values = Array.from(inputs).map(i => i.value.trim());
          if (values.some(v => v)) {
            hasCertContent = true;
          }
        }
      });

      if (hasCertContent) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text(T.certifications, rightColX, rightY);
        rightY += 2;
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.4);
        doc.line(rightColX, rightY, pageWidth - margin, rightY);
        rightY += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        certSections.forEach(pane => {
          if (!pane.querySelector('input[type="checkbox"]')?.checked) return;
          const inputs = pane.querySelectorAll('input');
          const values = Array.from(inputs).map(i => i.value.trim());
          if (values.some(v => v)) {
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(`${values[0]} - ${values[1]}`, pageWidth - rightColX - margin);
            titleLines.forEach(line => {
              doc.text(line, rightColX, rightY);
              rightY += lineHeight;
            });

            doc.setFont("helvetica", "normal");
            const detailText = [
              `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
              values[2],
              values[5]
            ].filter(Boolean).join(" | ");
            const detailLines = doc.splitTextToSize(detailText, pageWidth - rightColX - margin - 2);
            detailLines.forEach(line => {
              doc.text(line, rightColX + 2, rightY);
              rightY += lineHeight;
            });

            rightY += 1;
          }
        });
      }
    }
    
    rightY += 2;
    renderSkillSection(T.languages, softSkillsItems);

    // === Interests
    const interests = [];
    interestTextInputs.forEach((input, i) => {
      if (interestCheckboxes[i]?.checked && input?.value.trim()) {
        interests.push(input.value.trim());
      }
    });
    if (interests.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.interests, rightColX, rightY);
      rightY += 2;
      doc.line(rightColX, rightY, pageWidth - margin, rightY);
      rightY += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      interests.forEach(text => {
        const lines = doc.splitTextToSize(text, pageWidth - rightColX - margin);
        lines.forEach(line => {
          doc.text(line, rightColX, rightY);
          rightY += lineHeight;
        });
      });
    }

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null)); // fallback if image fails to load
    } else {
      generatePDF(null);
    }
  }
}
  
function cvbPreviewPDF_Luminary() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }
  
  function lightenColor(r, g, b, percent) {
    return [
      Math.min(255, Math.floor(r + (255 - r) * percent)),
      Math.min(255, Math.floor(g + (255 - g) * percent)),
      Math.min(255, Math.floor(b + (255 - b) * percent))
    ];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    const maxImageWidth = 25;
    const textX = leftColX;
    let textY = currentY;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - maxImageWidth - 4 * margin);
    let headerTextHeight = nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const specialityHeight = lineHeight;
    headerTextHeight += specialityHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    const summaryMaxLines = 3;
    let summaryLines = doc.splitTextToSize(summary, pageWidth - maxImageWidth - 4 * margin);

    let summaryTruncated = false;
    if (summaryLines.length > summaryMaxLines) {
      summaryLines = summaryLines.slice(0, summaryMaxLines);
      summaryTruncated = true;
    }

    if (summaryTruncated) {
      const lastLine = summaryLines[summaryLines.length - 1];
      const ellipsis = '...';
      const maxLineWidth = pageWidth - maxImageWidth - 4 * margin;
      let shortened = lastLine;
      while (doc.getTextWidth(shortened + ellipsis) > maxLineWidth && shortened.length > 0) {
        shortened = shortened.slice(0, -1);
      }
      summaryLines[summaryLines.length - 1] = shortened + ellipsis;
    }

    const summaryHeight = summaryLines.length * lineHeight;
    headerTextHeight += summaryHeight;

    const headerBoxHeight = headerTextHeight;
    const imageHeight = headerBoxHeight;

    if (imgData) {
      const fixedSize = 25;
      const imageX = pageWidth - margin - fixedSize;
      const imageY = currentY;
      doc.addImage(imgData, 'JPEG', imageX, imageY, fixedSize, fixedSize);
    }

    // === Rendu du header texte
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    textY += lineHeight;
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(summaryLines, textX, textY);
    textY += summaryLines.length * lineHeight;

    currentY += headerBoxHeight + 2;

    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactLineYStart = currentY;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.line(0, contactLineYStart, pageWidth, contactLineYStart);

    currentY += 2;

    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const itemGap = 6;

    let contactX = leftColX;
    let contactY = currentY + 3;

    const drawContact = (icon, text) => {
      if (!text) return;
      const textWidth = doc.getTextWidth(text);
      if (icon) {
        doc.addImage(icon, 'PNG', contactX, contactY - iconSize + 1.5, iconSize, iconSize);
      }
      doc.text(text, contactX + iconSize + iconGap, contactY);
      contactX += iconSize + iconGap + textWidth + itemGap;
    };

    drawContact(icons.phone, phone);
    drawContact(icons.email, email);
    drawContact(icons.linkedin, linkedin);
    drawContact(icons.address, address);

    currentY += lineHeight;

    const [lr, lg, lb] = lightenColor(r, g, b, 0.85);
    const leftColWidth = rightColX - leftColX - 7 + margin;
    const leftColumnStartY = currentY;
    const leftColumnHeight = pageHeight - currentY;

    doc.setFillColor(lr, lg, lb);
    doc.rect(0, leftColumnStartY, leftColWidth + 2, leftColumnHeight, 'F');
    
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.line(0, currentY, pageWidth, currentY);

    currentY += lineHeight;

    // === LEFT COLUMN
    let leftY = currentY + 2;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(T.coreSkills, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.certifications, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([1, 0.2], 0);
      doc.line(leftColX, leftY, rightColX - 10, leftY);
      doc.setLineDashPattern([], 0);
      leftY += lineHeight;
      doc.setFontSize(12);

      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.setFont("helvetica", "bold");
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;
		  
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2], // Issuer
            values[5]  // Certificate ID
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.setFont("helvetica", "normal");
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
          hasCertContent = true;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.languages, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(T.interests, leftColX, leftY);
          leftY += 2;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.3);
          doc.setLineDashPattern([1, 0.2], 0);
          doc.line(leftColX, leftY, rightColX - 10, leftY);
          doc.setLineDashPattern([], 0);
          leftY += lineHeight;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY + 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.work, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null)); // fallback if image fails to load
    } else {
      generatePDF(null);
    }
  }
}
  
function cvbPreviewPDF_Commander() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 125;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawRightBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 2.8, topPadding, pageWidth - rightColX, pageHeight - topPadding - 3, 'F');
  }

  function drawHeader(imgData, startY) {
    const imageWidth = 25;
    const imageHeight = 25;
    const imagePadding = 5;

    let textX = leftColX;
    let imageX = leftColX;
    let imgY = startY;
    let textY = startY + lineHeight;

    if (imgData) {
      imgY = startY - 4;
      const borderRadius = 4;
      const borderThickness = 2;

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        imageX - borderThickness,
        imgY - borderThickness,
        imageWidth + 2 * borderThickness,
        imageHeight + 2 * borderThickness,
        borderRadius,
        borderRadius,
        'F'
      );

      doc.addImage(imgData, 'JPEG', imageX, imgY, imageWidth, imageHeight);
      textX = imageX + imageWidth + imagePadding;
      
      const nameLines = doc.splitTextToSize(fullName.toUpperCase(), leftColWidth - imageWidth - imagePadding - 5);
      const nameBlockHeight = nameLines.length * lineHeight + lineHeight;
      const totalTextHeight = nameBlockHeight;
      const imageMiddle = imgY + imageHeight / 2;
      textY = imageMiddle - totalTextHeight / 2 + lineHeight * 0.85;
    }

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), leftColWidth - (imgData ? imageWidth + imagePadding : 0) - 5);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    const paddingBelowImage = 6;
    const bottomY = imgData
      ? Math.max(imgY + imageHeight + paddingBelowImage, textY + 5)
      : textY + 5;

    return bottomY;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawRightBackground();
    
    leftY = drawHeader(imgData, leftY);

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });
    
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.line(rightColX - 5, rightY, rightColX + rightColWidth, rightY);
    rightY += 9;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbPreviewPDF_Analyst() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');

  function generatePDF(checkOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(r, g, b);
      doc.text(title, margin, currentY);
      currentY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineHeight;
    }
    
    // === Header with name & speciality (no photo, no summary)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 180); 
    doc.text(nameLines, pageWidth / 2, currentY, { align: "center" });
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    const specialityLines = doc.splitTextToSize(speciality, 180);
    doc.text(specialityLines, pageWidth / 2, currentY, { align: "center" });
    currentY += specialityLines.length * lineHeight;

    const contactLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const contactLines = doc.splitTextToSize(contactLine, 180);
    doc.text(contactLines, pageWidth / 2, currentY, { align: "center" });
    currentY += contactLines.length * lineHeight;

    currentY += 5;

    if (summary) {
      addSectionTitle(T.summary);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, currentY);
      currentY += summaryLines.length * lineHeight + 2;
    }

    // Work Experience
    addSectionTitle(T.work);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");

      const experienceTitleLines = doc.splitTextToSize(
        `${values[0]} - ${values[1]}`,
        pageWidth - 2 * margin
      );

      doc.text(experienceTitleLines, margin, currentY);
      currentY += experienceTitleLines.length * lineHeight;

      doc.setFont("helvetica", "normal");

      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");

      const educationTitleLines = doc.splitTextToSize(
        `${values[0]} - ${values[1]}`,
        pageWidth - 2 * margin
      );

      doc.text(educationTitleLines, margin, currentY);
      currentY += educationTitleLines.length * lineHeight;

      doc.setFont("helvetica", "normal");

      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");

          const certificationTitleLines = doc.splitTextToSize(
            `${values[0]} - ${values[1]}`,
            pageWidth - 2 * margin
          );

          doc.text(certificationTitleLines, margin, currentY);
          currentY += certificationTitleLines.length * lineHeight;

          doc.setFont("helvetica", "normal");

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }

    // Technical Skills
    addSectionTitle(T.coreSkills);
    doc.setFontSize(12);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // Languages
    addSectionTitle(T.languages);
    doc.setFontSize(12);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];
    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    if (checkOnly) return currentY;
    showPreview(doc);
  }

  generatePDF(false);
}

function cvbPreviewPDF_Executive() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    //doc.setFillColor(230, 240, 255);
    //doc.rect(0, 0, rightColX - 5, pageHeight, 'F');

    const headerBoxHeight = 24;
    const imageWidth = 25;
    const imageHeight = 25;
    const imageX = pageWidth - margin - imageWidth;
    const imageY = currentY + (headerBoxHeight - imageHeight) / 2;

    if (imgData) {
      doc.addImage(imgData, 'JPEG', imageX, imageY, imageWidth, imageHeight);
    }

    const textX = leftColX;
    let textY = currentY + 8;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - imageWidth - 4 * margin);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    const personalLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    const contactLines = doc.splitTextToSize(personalLine, imageX - textX - 5);
    const contactY = currentY + headerBoxHeight - (contactLines.length * lineHeight) + 3;
    doc.text(contactLines, textX, contactY);

    currentY += headerBoxHeight;
    currentY += lineHeight + 3;

    // === LEFT COLUMN
    let leftY = currentY;

    function drawLeftTitle(title, x, y) {
      const boxHeight = 7;
      const boxWidth = (rightColX - 10) - x; // full left column width
      doc.setFillColor(r, g, b);
      doc.rect(x, y - 5, boxWidth, boxHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, x + 3, y);
      doc.setTextColor(0); // reset for body
      return y + boxHeight + 2;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    leftY = drawLeftTitle(T.coreSkills, leftColX, leftY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      leftY = drawLeftTitle(T.certifications, leftColX, leftY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;

          doc.setFont("helvetica", "normal");
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    leftY = drawLeftTitle(T.languages, leftColX, leftY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          leftY = drawLeftTitle(T.interests, leftColX, leftY);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY;

    function drawRightTitle(title, x, y) {
      const boxHeight = 7;
      const boxWidth = (pageWidth - margin) - x;
      doc.setFillColor(r, g, b);
      doc.rect(x, y - 5, boxWidth, boxHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, x + 3, y);
      doc.setTextColor(0);
      return y + boxHeight + 2;
    }

    // === SUMMARY in Right Column
    if (summary) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const summaryLines = doc.splitTextToSize(summary, 120);
      summaryLines.forEach(line => {
        doc.text(line, rightColX + 2, rightY);
        rightY += lineHeight;
      });
      rightY += 3; // spacing before next section
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    rightY = drawRightTitle(T.work, rightColX, rightY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY = drawRightTitle(T.education, rightColX, rightY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbPreviewPDF_Strategist() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin;
  const rightColWidth = 75;
  const leftColX = rightColX + rightColWidth + 5;
  const leftColWidth = pageWidth - leftColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawLeftBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;
    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 4.5, topPadding, rightColWidth + 4, pageHeight - topPadding - 3, 'F');
  }

  function addSection(title, items, x, y, width) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, x, y);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        y += lineHeight;
      }
    });
    return y + 2;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";
      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  // ---------------- GENERATE PDF (without image) ----------------
  drawLeftBackground();

  // RIGHT COLUMN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(33, 33, 33);
  let textY = rightY + 3;
  const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
  nameLines.forEach(line => {
    doc.text(line, rightColX, textY);
    textY += lineHeight;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(r, g, b);
  const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
  specialityLines.forEach(line => {
    doc.text(line, rightColX, textY);
    textY += lineHeight;
  });
  textY += 3;
  rightY = textY;

  // LEFT COLUMN
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(33, 33, 33);
  const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
  summaryLines.forEach(line => {
    doc.text(line, leftColX, leftY);
    leftY += lineHeight;
  });
  leftY += 2;

  leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
  leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

  const icons = {
    phone: "CV_icons/cv_phone.png",
    email: "CV_icons/cv_email.png",
    linkedin: "CV_icons/cv_linkedin.png",
    address: "CV_icons/cv_address.png"
  };

  const contactItems = [
    { icon: icons.phone, text: phone },
    { icon: icons.email, text: email },
    { icon: icons.linkedin, text: linkedin },
    { icon: icons.address, text: address },
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(33, 33, 33);
  const iconSize = 4.5;
  const iconGap = 1.5;

  contactItems.forEach(({ icon, text }) => {
    if (!text) return;
    doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
    doc.text(text, rightColX + iconSize + iconGap, rightY);
    rightY += lineHeight;
  });

  rightY += 3;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(3);
  doc.line(rightColX - 5, rightY, rightColX + rightColWidth, rightY);
  rightY += 9;

  rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
  const certifications = gatherCertifications(certSections);
  if (certifications.length > 0) {
    rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
  }
  rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
  const interests = gatherInterests();
  if (interests.length > 0) {
    rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
  }

  showPreview(doc);
}

function cvbPreviewPDF_Authority() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 125;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawRightBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 4, topPadding, pageWidth - rightColX + 4.5, pageHeight - topPadding, 'F');
  }

  function drawTopHeader(imgData) {
    const headerHeight = 30;
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    const imgSize = 20;
    const borderSize = 1;
    const imgX = pageWidth - margin - imgSize;
    const imgY = 5;

    if (imgData) {
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(borderSize);
      doc.rect(imgX - borderSize / 2, imgY - borderSize / 2, imgSize + borderSize, imgSize + borderSize, 'S');
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgSize, imgSize);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const textX = margin;
    doc.text(fullName.toUpperCase(), textX, 15);

    if (speciality) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(speciality, textX, 22);
    }

    return headerHeight + 5;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`; // Degree - Major
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawRightBackground();

    const startY = drawTopHeader(imgData); // header with optional photo
    leftY = startY + 5;
    rightY = startY + 5;

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });
    
    rightY += 5;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbPreviewPDF_Minimalist() {
  if (!cvbValidateRequiredData()) {
    PreviewNotificationion("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin; 
  const rightColWidth = 72; 
  const leftColX = rightColX + rightColWidth + 5; 
  const leftColWidth = pageWidth - leftColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });
        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }
      y += 2;
    });
    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      // const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value); // Not needed

      if (name) {
        doc.text(name, x, y);
        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`; // Degree - Major
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {

    // ------------------------------
    // RIGHT COLUMN: Name + Speciality (above contacts)
    // ------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);

    let textY = rightY + 3;
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
    nameLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(r, g, b);
    const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
    specialityLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    // Add some spacing before contact icons
    textY += 1;
    rightY = textY;

    // ------------------------------
    // LEFT COLUMN: Summary (start directly)
    // ------------------------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;

    // Continue with Work and Education
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5; // mm
    const iconGap = 1.5;  // mm

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.line(rightColX - 5, rightY, rightColX + rightColWidth, rightY);
    rightY += 9;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    const languageList = gatherLanguages(softSkillsItems);
    if (languageList.length > 0) {
      rightY = addSection(T.languages, languageList, rightColX, rightY, rightColWidth - 5);
    }
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  generatePDF(false);
}

function cvbPreviewPDF_Precisionist() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData, checkOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title, iconPath) {
      const iconSize = 8;
      const iconMargin = 1;

      if (iconPath) {
        doc.setFillColor(r, g, b);
        doc.rect(margin, currentY - iconSize + 2, iconSize, iconSize, 'F');
        doc.addImage(iconPath, 'PNG', margin + iconMargin, currentY - iconSize + 3, iconSize - iconMargin*2, iconSize - iconMargin*2);
      }

      const textX = iconPath ? margin + iconSize + 3 : margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(r, g, b);
      doc.text(title, textX, currentY);

      currentY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineHeight;
    }
    
    if (imgData) {
      const imgWidth = 25;
      const imgHeight = 25;
      const borderRadius = 2;
      const imgX = pageWidth - margin - imgWidth;
      const imgY = currentY - 4;

      const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
      const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
      const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.8));

      doc.setLineWidth(2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2, borderRadius, borderRadius, 'FD');

      doc.setLineWidth(0.4);
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    }

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 155);
    doc.text(nameLines, margin, currentY);
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(speciality, margin, currentY);
    currentY += lineHeight;

    currentY += 1;

    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white.png",
      address: "CV_icons/cv_address_white.png"
    };

    const CVicons = {
      experience: "CV_icons/cv_work_white.png",
      education: "CV_icons/cv_university_white.png",
      certification: "CV_icons/cv_certification_white.png",
      coreskills: "CV_icons/cv_skills_white.png",
      languages: "CV_icons/cv_languages_white.png",
      interest: "CV_icons/cv_entertainment_white.png",
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address }
    ];

    const iconSize = 5;
    const gapX = 60;
    const gapY = 8;

    contactItems.forEach((item, index) => {
      if (!item.text) return;

      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + col * gapX + 1.5; 
      const y = currentY + row * gapY;

      const squareSizeHorizontal = iconSize + 2;
      const squareSizeVertical = iconSize + 2;
      const squareY = y - iconSize / 2;

      doc.setFillColor(r, g, b); 
      doc.rect(x - 1, squareY, squareSizeHorizontal, squareSizeVertical, 'F');

      if (item.icon) {
        const iconY = squareY + (squareSizeVertical - iconSize) / 2;
        doc.addImage(item.iconWhite || item.icon, 'PNG', x, iconY, iconSize, iconSize);
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(33, 33, 33);
      const textY = squareY + squareSizeVertical / 2 + 1;
      doc.text(item.text, x + squareSizeHorizontal + 1, textY);
    });
    const rows = Math.ceil(contactItems.filter(item => item.text).length / 2);
    currentY += rows * gapY + 3;

    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * lineHeight + 3;

    // Work Experience
    addSectionTitle(T.work, CVicons.experience);
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(12);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin + 2, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin + 2, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education, CVicons.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin + 2, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications, CVicons.certification);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
          currentY += lineHeight;
          doc.setFont("helvetica", "normal");

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin + 2, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }
    
    // === Technical Skills
    currentY += 3;
    addSectionTitle(T.coreSkills, CVicons.coreskills);
    doc.setFontSize(12);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // === Languages
    currentY += 3;
    addSectionTitle(T.languages, CVicons.languages);
    doc.setFontSize(12);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    currentY += 2;

    // Interests
    currentY += 3;
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    const interests = [];

    interestTextInputs.forEach((input, i) => {
      const checkbox = interestCheckboxes[i];
      const val = input?.value.trim();
      if (checkbox?.checked && val) interests.push(val);
    });

    if (interests.length > 0) {
      addSectionTitle(T.interests, CVicons.interest);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const interestLine = doc.splitTextToSize(interests.join(" - "), pageWidth - 2 * margin);
      doc.text(interestLine, margin, currentY);
      currentY += interestLine.length * lineHeight;
    }
    
    if (checkOnly) return currentY;
  	showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbPreviewPDF_Coordinator() {
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 120;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

function drawTopHeader(imgData) {
  const headerHeight = 30;

  doc.setFillColor(r, g, b);
  doc.rect(margin, margin, pageWidth - 2 * margin, headerHeight, 'F');

  const imgSize = 20;
  const borderSize = 1;
  const imgX = pageWidth - margin - imgSize - 5;
  const imgY = margin + 5;

  if (imgData) {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(borderSize);
    doc.rect(imgX - borderSize / 2, imgY - borderSize / 2, imgSize + borderSize, imgSize + borderSize, 'S');
    doc.addImage(imgData, 'JPEG', imgX, imgY, imgSize, imgSize);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  const textX = margin + 6;
  doc.text(fullName.toUpperCase(), textX, margin + 15);

  if (speciality) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(speciality, textX, margin + 22);
  }

  return margin + headerHeight + 5;
}

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`; // Degree - Major
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    const startY = drawTopHeader(imgData);
    leftY = startY + 5;
    rightY = startY + 5;

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });
    
    rightY += 5;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbPreviewPDF_Mentor() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin; 
  const rightColWidth = 75; 
  const leftColX = rightColX + rightColWidth + 5; 
  const leftColWidth = pageWidth - leftColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawLeftBackground() {
      doc.setFillColor(themeColorHex);
      doc.rect(
        rightColX - 10,
        0,
        rightColWidth + 10,
        pageHeight,
        'F'
      );
  }

  function addLeftSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width - 5);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width - 5);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width - 5);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function addRightSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(33, 33, 33);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isLeft = x > 100 ? false : true; // left column
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(isLeft ? 255 : r, isLeft ? 255 : g, isLeft ? 255 : b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          doc.setFillColor(isLeft ? 255 : (i <= score ? r : 200),
                          isLeft ? 255 : (i <= score ? g : 200),
                          isLeft ? 255 : (i <= score ? b : 200));
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, i <= score ? 'F' : 'S');
        }
        y += lineHeight;
      }
    });
    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`; // Degree - Major
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawLeftBackground();

    // ------------------------------
    // RIGHT COLUMN: Name + Speciality (above contacts)
    // ------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);

    let textY = rightY + 3;
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
    nameLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
    specialityLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    textY += 3;
    rightY = textY;

    // ------------------------------
    // LEFT COLUMN: Summary (start directly)
    // ------------------------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;

    leftY = addRightSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addRightSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white.png",
      address: "CV_icons/cv_address_white.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);

    const iconSize = 4.5; // mm
    const iconGap = 1.5;  // mm

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });

    rightY += 4;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addLeftSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addLeftSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  generatePDF(false);
}

function cvbPreviewPDF_Architect() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin; 
  const rightColWidth = 75; 
  const leftColX = rightColX + rightColWidth + 5; 
  const leftColWidth = pageWidth - leftColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawLeftBackground() {
      doc.setFillColor(themeColorHex);
      doc.rect(rightColX - 10, 0, rightColWidth + 10, pageHeight, 'F');
  }

  function drawRightBackground() { 
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(leftColX - 5, 0, leftColWidth + 10, pageHeight, 'F');
  }

  function addLeftSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width - 5);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width - 5);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width - 5);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function addRightSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(33, 33, 33);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isLeft = x > 100 ? false : true; // left column
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(isLeft ? 255 : r, isLeft ? 255 : g, isLeft ? 255 : b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          doc.setFillColor(isLeft ? 255 : (i <= score ? r : 200),
                          isLeft ? 255 : (i <= score ? g : 200),
                          isLeft ? 255 : (i <= score ? b : 200));
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, i <= score ? 'F' : 'S');
        }
        y += lineHeight;
      }
    });
    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawLeftBackground();
    drawRightBackground();

    // ------------------------------
    // RIGHT COLUMN: Name + Speciality (above contacts)
    // ------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);

    let textY = rightY + 3;
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
    nameLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
    specialityLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    // Add some spacing before contact icons
    textY += 3;
    rightY = textY;

    // ------------------------------
    // LEFT COLUMN: Summary (start directly)
    // ------------------------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;

    // Continue with Work and Education
    leftY = addRightSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addRightSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white.png",
      address: "CV_icons/cv_address_white.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);

    const iconSize = 4.5; // mm
    const iconGap = 1.5;  // mm

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });

    rightY += 4;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addLeftSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addLeftSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  generatePDF(false);
}

function cvbPreviewPDF_Connector() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 120;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawTopHeader() {
    const headerHeight = 30;

    doc.setFillColor(r, g, b);
    doc.rect(margin, margin, pageWidth - 2 * margin, headerHeight, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const textX = margin + 6;
    doc.text(fullName.toUpperCase(), textX, margin + 15);

    if (speciality) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(speciality, textX, margin + 22);
    }

    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white.png",
      address: "CV_icons/cv_address_white.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const lineSpacing = 6;

    let contactX = pageWidth - margin - 2;
    let contactY = margin + 8;

    contactItems.forEach(({ icon, text }) => {
      if (text && text.trim()) {
        const textWidth = doc.getTextWidth(text);
        const textX = contactX - iconSize - iconGap - textWidth;
        doc.text(text, textX, contactY, { align: "left" });
        doc.addImage(
          icon,
          "PNG",
          textX + textWidth + iconGap,
          contactY - iconSize + 1,
          iconSize,
          iconSize
        );

        contactY += lineSpacing;
      }
    });
    return margin + headerHeight + 5;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`; // Degree - Major
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    const startY = drawTopHeader();
    leftY = startY + 5;
    rightY = startY + 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = e => generatePDF(e.target.result);
    reader.readAsDataURL(photoFile);
  } else {
    generatePDF(null);
  }
}

function cvbPreviewPDF_Specialist() {
  if (!cvbValidateRequiredData()) {
    PreviewNotificationion("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 120;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawTopHeader() {
    const headerHeight = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    const textX = margin;
    doc.text(fullName.toUpperCase(), textX, margin + 12);

    if (speciality) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(r, g, b);
      doc.text(speciality, textX, margin + 19);
      doc.setTextColor(33, 33, 33);
    }

    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const lineSpacing = 6;

    let contactX = pageWidth - margin - 2;
    let contactY = margin + 3;

    contactItems.forEach(({ icon, text }) => {
      if (text && text.trim()) {
        const textWidth = doc.getTextWidth(text);
        const textX = contactX - iconSize - iconGap - textWidth;
        doc.text(text, textX, contactY, { align: "left" });
        doc.addImage(icon, "PNG", textX + textWidth + iconGap, contactY - iconSize + 1, iconSize, iconSize);
        contactY += lineSpacing;
      }
    });
    return margin + headerHeight + 5;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsNoScores(title, items, x, y, width) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) {
        doc.text(name, x, y);
        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function drawLanguagesWithScores(title, items, x, y, width) {
    const languages = gatherLanguages(items);
    if (languages.length === 0) return y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    languages.forEach(lang => {
      const lines = doc.splitTextToSize(lang, width);
      lines.forEach(line => {
        doc.text(line, x, y);
        y += lineHeight;
      });
      y += 2;
    });

    return y;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    const startY = drawTopHeader();
    leftY = startY + 5;
    rightY = startY + 5;

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    rightY = drawSkillsNoScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawLanguagesWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    showPreview(doc);
  }

  generatePDF(false);
}

function cvbPreviewPDF_Vanguard() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');

  function generatePDF(checkOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title) {
      const sectionHeight = 8;
      doc.setFillColor(r, g, b); 
      doc.rect(margin, currentY - 1, pageWidth - 2 * margin, sectionHeight - 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 2, currentY + 4);

      currentY += sectionHeight + 3;
    }
    
    // === Header with name & speciality (no photo, no summary)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 180); 
    doc.text(nameLines, pageWidth / 2, currentY, { align: "center" });
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    const specialityLines = doc.splitTextToSize(speciality, 180);
    doc.text(specialityLines, pageWidth / 2, currentY, { align: "center" });
    currentY += specialityLines.length * lineHeight;

    const contactLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const contactLines = doc.splitTextToSize(contactLine, 180);
    doc.text(contactLines, pageWidth / 2, currentY, { align: "center" });
    currentY += contactLines.length * lineHeight;

    currentY += 2;

    if (summary) {
      addSectionTitle(T.summary);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, currentY);
      
      currentY += summaryLines.length * lineHeight;
    }

    // Work Experience
    addSectionTitle(T.work);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin + 2, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin + 2, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin + 2, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
          currentY += lineHeight;
          doc.setFont("helvetica", "normal");

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin + 2, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }

    // Technical Skills
    addSectionTitle(T.coreSkills);
    doc.setFontSize(12);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // Languages
    addSectionTitle(T.languages);
    doc.setFontSize(12);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    if (checkOnly) return currentY;
    showPreview(doc);
  }

  generatePDF(false);
}

function cvbPreviewPDF_Virtuoso() {
  if (!cvbValidateRequiredData()) {
    PreviewNotification("warning", "fillRequired");
    return;
  }

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    const maxImageWidth = 25;
    const textX = leftColX;
    let textY = currentY;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - maxImageWidth - 4 * margin);
    let headerTextHeight = nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const specialityHeight = lineHeight;
    headerTextHeight += specialityHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const summaryMaxLines = 3;
    let summaryLines = doc.splitTextToSize(summary, pageWidth - maxImageWidth - 4 * margin);

    let summaryTruncated = false;
    if (summaryLines.length > summaryMaxLines) {
      summaryLines = summaryLines.slice(0, summaryMaxLines);
      summaryTruncated = true;
    }

    if (summaryTruncated) {
      const lastLine = summaryLines[summaryLines.length - 1];
      const ellipsis = '...';
      const maxLineWidth = pageWidth - maxImageWidth - 4 * margin;
      let shortened = lastLine;
      while (doc.getTextWidth(shortened + ellipsis) > maxLineWidth && shortened.length > 0) {
        shortened = shortened.slice(0, -1);
      }
      summaryLines[summaryLines.length - 1] = shortened + ellipsis;
    }

    const summaryHeight = summaryLines.length * lineHeight;
    headerTextHeight += summaryHeight;

    const headerBoxHeight = headerTextHeight;

    if (imgData) {
      const fixedSize = 25;
      const imageX = pageWidth - margin - fixedSize;
      const imageY = currentY;
      doc.addImage(imgData, 'JPEG', imageX, imageY, fixedSize, fixedSize);
    }

    // === Rendu du header texte
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    textY += lineHeight;
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(summaryLines, textX, textY);
    textY += summaryLines.length * lineHeight;

    currentY += headerBoxHeight + 2;

    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactLineYStart = currentY;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(margin, contactLineYStart, pageWidth - margin, contactLineYStart);

    currentY += 2;

    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const itemGap = 6;

    let contactX = leftColX;
    let contactY = currentY + 3;

    const drawContact = (icon, text) => {
      if (!text) return;
      const textWidth = doc.getTextWidth(text);
      if (icon) {
        doc.addImage(icon, 'PNG', contactX, contactY - iconSize + 1.5, iconSize, iconSize);
      }
      doc.text(text, contactX + iconSize + iconGap, contactY);
      contactX += iconSize + iconGap + textWidth + itemGap;
    };

    drawContact(icons.phone, phone);
    drawContact(icons.email, email);
    drawContact(icons.linkedin, linkedin);
    drawContact(icons.address, address);

    currentY += lineHeight;
    
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += lineHeight;

    // === LEFT COLUMN
    let leftY = currentY + 2;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(T.coreSkills, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.certifications, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([1, 0.2], 0);
      doc.line(leftColX, leftY, rightColX - 10, leftY);
      doc.setLineDashPattern([], 0);
      leftY += lineHeight;
      doc.setFontSize(12);

      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.setFont("helvetica", "bold");
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;
		  
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.setFont("helvetica", "normal");
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
          hasCertContent = true;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.languages, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(T.interests, leftColX, leftY);
          leftY += 2;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.3);
          doc.setLineDashPattern([1, 0.2], 0);
          doc.line(leftColX, leftY, rightColX - 10, leftY);
          doc.setLineDashPattern([], 0);
          leftY += lineHeight;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY + 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.work, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    showPreview(doc);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

// ================================= CV Download templates =================================

function cvbDownloadPDF_Diplomat() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(r, g, b);
      doc.text(title, margin, currentY);
      currentY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineHeight;
    }
    
    if (imgData) {
      const imgWidth = 25;
      const imgHeight = 25;
      const borderRadius = 2;
      const imgX = pageWidth - margin - imgWidth;
      const imgY = currentY - 4;

      const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
      const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
      const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.8));

      doc.setLineWidth(2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2, borderRadius, borderRadius, 'FD');

      doc.setLineWidth(0.4);
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    }

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 155);
    doc.text(nameLines, margin, currentY);
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(speciality, margin, currentY);
    currentY += lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(summary, 155);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * lineHeight;

    const contactLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    doc.setFontSize(10);
    doc.setTextColor(100);
    const contactLines = doc.splitTextToSize(contactLine, 155);
    doc.text(contactLines, margin, currentY);
    currentY += contactLines.length * lineHeight;

    currentY += 2;

    // Work Experience
    addSectionTitle(T.work);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");
      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] // Job type
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin + 2, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin + 2, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");
      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin + 2, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
          currentY += lineHeight;
          doc.setFont("helvetica", "normal");
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2], values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin + 2, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }
    
    // === Technical Skills
    addSectionTitle(T.coreSkills);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // === Languages
    addSectionTitle(T.languages);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    currentY += 2;

    // Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    const interests = [];

    interestTextInputs.forEach((input, i) => {
      const checkbox = interestCheckboxes[i];
      const val = input?.value.trim();
      if (checkbox?.checked && val) interests.push(val);
    });

    if (interests.length > 0) {
      addSectionTitle(T.interests);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const interestLine = doc.splitTextToSize(interests.join(" - "), pageWidth - 2 * margin);
      doc.text(interestLine, margin, currentY);
      currentY += interestLine.length * lineHeight;
    }
    
    if (currentY > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbDownloadPDF_Visionary() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    //doc.setFillColor(230, 240, 255);
    //doc.rect(0, 0, rightColX - 5, pageHeight, 'F');

    const headerBoxHeight = 36;
    const imageWidth = 25;
    const imageHeight = 25;
    const imageX = pageWidth - margin - imageWidth;
    const imageY = currentY + (headerBoxHeight - imageHeight) / 2;

    if (imgData) {
      doc.addImage(imgData, 'JPEG', imageX, imageY - 3, imageWidth, imageHeight);
    }

    const textX = leftColX;
    let textY = currentY + 8;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - imageWidth - 4 * margin);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryMaxLines = 3;
    let summaryLines = doc.splitTextToSize(summary, imageX - textX - 5);
    if (summaryLines.length > summaryMaxLines) {
      summaryLines = summaryLines.slice(0, summaryMaxLines);
    }
    doc.text(summaryLines, textX, textY);
    textY += summaryMaxLines * lineHeight;

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    const personalLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    const contactLines = doc.splitTextToSize(personalLine, imageX - textX - 5);
    const contactY = currentY + headerBoxHeight - (contactLines.length * lineHeight) + 3;
    doc.text(contactLines, textX, contactY);

    currentY += headerBoxHeight;

    doc.setFillColor(r, g, b);
    doc.rect(margin, currentY, pageWidth - 2 * margin, 1.5, 'F');
    currentY += lineHeight + 3;

    // === LEFT COLUMN
    let leftY = currentY;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(T.coreSkills, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    leftY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.certifications, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(leftColX, leftY, rightColX - 10, leftY);
      leftY += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2], values[5]
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
          hasCertContent = true;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.languages, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    leftY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(T.interests, leftColX, leftY);
          leftY += 2;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.4);
          doc.line(leftColX, leftY, rightColX - 10, leftY);
          leftY += lineHeight;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.work, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");
        if (values[5]) {
          educationMeta += ` | Honors: ${values[5]}`;
        }
        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbDownloadPDF_Innovator() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 125;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawRightBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 5, 0, pageWidth - rightColX + 5, pageHeight, 'F');
  }

  function drawHeader(imgData, startY) {
    let textX = leftColX;
    let textY = startY + lineHeight;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), leftColWidth - 35);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(11);
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    const contactLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    const contactLines = doc.splitTextToSize(contactLine, leftColWidth - 35);
    doc.text(contactLines, textX, textY);
    textY += contactLines.length * lineHeight - 5;

    return textY + lineHeight;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];

    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;

      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",   // Location
        values[5]                                  // Job type
      ].filter(Boolean).join(" | ");

      arr.push({ title, meta, desc });
    });

    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];

    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;

      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = values[5] ? `Honors: ${values[5]}` : "";

      arr.push({ title, meta, desc });
    });

    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];

    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;

      const desc = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],   // Certificate ID
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta: "",
        desc
      });
    });

    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawRightBackground();
    
    leftY = drawHeader(imgData, leftY);

    // LEFT COLUMN CONTENT
    leftY = addSection(T.profile, [summary], leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    if (imgData) {
      const imgWidth = 27;
      const imgHeight = 27;
      const imgX = rightColX + (rightColWidth - imgWidth) / 2;
      const imgY = rightY;
      const borderRadius = 4;
      const borderThickness = 2;
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        imgX - borderThickness,
        imgY - borderThickness,
        imgWidth + 2 * borderThickness,
        imgHeight + 2 * borderThickness,
        borderRadius,
        borderRadius,
        'F'
      );
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
      rightY += imgHeight + borderThickness * 2 + 10;
    }
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 300) {
      CVvalidation = false;
      return;
    }

    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}
  
function cvbDownloadPDF_Titan() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const rightColX = 135;
  const middleX = 130;

  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const projectSections = document.querySelectorAll('#cvb-project-content .cvb-tab-pane');
  const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    const imageWidth = 25;
    const imageHeight = 25;
    const imageX = pageWidth - margin - imageWidth;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - imageWidth - 4 * margin);
    doc.text(nameLines, leftColX, currentY + 8);
    let nameY = currentY + 8 + nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, leftColX, nameY);
    nameY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    let summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin - imageWidth - 10);
    if (summaryLines.length > 3) {
      summaryLines = summaryLines.slice(0, 2);
      summaryLines.push("...");
    }
    doc.text(summaryLines, leftColX, nameY);
    nameY += summaryLines.length * lineHeight;

    const imageY = currentY;
    if (imgData) {
      const borderRadius = 2;
      const borderPadding = 1;

      const borderX = imageX - borderPadding - 3;
      const borderY = imageY - borderPadding;
      const borderWidth = imageWidth + borderPadding * 2;
      const borderHeight = imageHeight + borderPadding * 2;

      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.roundedRect(borderX, borderY, borderWidth, borderHeight, borderRadius, borderRadius, 'S');

      doc.addImage(imgData, 'JPEG', imageX - 3, imageY, imageWidth, imageHeight);
    }

    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const iconSize = 4.5;
    const iconGap = 1.5;
    const itemGap = 6;

    let contactX = leftColX;
    let contactY = nameY;

    const drawContact = (icon, text) => {
      if (!text) return;
      const textWidth = doc.getTextWidth(text);
      if (icon) {
        doc.addImage(icon, 'PNG', contactX, contactY - 3.5, iconSize, iconSize);
      }
      doc.text(text, contactX + iconSize + 1.5, contactY);
      contactX += iconSize + 1.5 + textWidth + itemGap;
    };

    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.setFont("helvetica", "normal");

    drawContact(icons.phone, phone);
    drawContact(icons.email, email);
    drawContact(icons.linkedin, linkedin);
    drawContact(icons.address, address);

    nameY += lineHeight;

    currentY = nameY + 2;

    // === LEFT COLUMN: Experience, Education
    let leftY = currentY;

    const renderSection = (title, elements, drawFn) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text(title, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(leftColX, leftY, middleX - 5, leftY);
      leftY += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      elements.forEach(drawFn);
      leftY += 2;
    };

    let firstCircleY = null;
    let lastCircleY = null;

    renderSection(T.work, expSections, (pane, index, allPanes) => {
      if (!pane.querySelector('input[type="checkbox"]')?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        const circleRadius = 1.6;
        const circleX = leftColX + 3;
        const textX = leftColX + 8;
        const maxTextWidth = middleX - textX - margin;

        const circleY = leftY - 1.5;

        const lightR = Math.floor((r + 255) / 2);
        const lightG = Math.floor((g + 255) / 2);
        const lightB = Math.floor((b + 255) / 2);

        doc.setDrawColor(lightR, lightG, lightB);
        doc.setFillColor(lightR, lightG, lightB);
        doc.circle(circleX, circleY, circleRadius, 'F');

        if (firstCircleY === null) {
          firstCircleY = circleY;
        }
        lastCircleY = circleY;

        const titleLines = doc.splitTextToSize(`${values[0]} - ${values[1]}`, maxTextWidth);
        titleLines.forEach(line => {
          doc.setFont("helvetica", "bold");
          doc.text(line, textX, leftY);
          leftY += lineHeight;
        });

        doc.setFont("helvetica", "normal");
        const periodLine = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");
        const periodLines = doc.splitTextToSize(periodLine, maxTextWidth);
        periodLines.forEach(line => {
          doc.text(line, textX + 2, leftY);
          leftY += lineHeight;
        });

        const descLines = doc.splitTextToSize(description, maxTextWidth);
        descLines.forEach(line => {
          doc.text(line, textX + 2, leftY);
          leftY += lineHeight;
        });
      }
    });

    if (firstCircleY !== null && lastCircleY !== null && firstCircleY !== lastCircleY) {
      const lightR = Math.floor((r + 255) / 2);
      const lightG = Math.floor((g + 255) / 2);
      const lightB = Math.floor((b + 255) / 2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setLineWidth(1);
      const circleX = leftColX + 3;
      doc.line(circleX, firstCircleY, circleX, lastCircleY);
    }
    
    leftY += 2;

    let firstEduCircleY = null;
    let lastEduCircleY = null;

    renderSection(T.education, eduSections, (pane, index, allPanes) => {
      if (!pane.querySelector('input[type="checkbox"]')?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      if (values.some(v => v)) {
        const circleRadius = 1.6;
        const circleX = leftColX + 3;
        const textX = leftColX + 8;
        const maxTextWidth = middleX - textX - margin;
        const circleY = leftY - 1.5;

        const lightR = Math.floor((r + 255) / 2);
        const lightG = Math.floor((g + 255) / 2);
        const lightB = Math.floor((b + 255) / 2);

        doc.setDrawColor(lightR, lightG, lightB);
        doc.setFillColor(lightR, lightG, lightB);
        doc.circle(circleX, circleY, circleRadius, 'F');

        if (firstEduCircleY === null) {
          firstEduCircleY = circleY;
        }
        lastEduCircleY = circleY;

        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(`${values[0]} - ${values[1]}`, maxTextWidth);
        titleLines.forEach(line => {
          doc.text(line, textX, leftY);
          leftY += lineHeight;
        });

        doc.setFont("helvetica", "normal");
        const infoLine = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const infoLines = doc.splitTextToSize(infoLine, maxTextWidth);
        infoLines.forEach(wline => {
          doc.text(wline, textX + 2, leftY);
          leftY += lineHeight;
        });

        leftY += 1; // extra spacing
      }
    });

    if (firstEduCircleY !== null && lastEduCircleY !== null && firstEduCircleY !== lastEduCircleY) {
      const lightR = Math.floor((r + 255) / 2);
      const lightG = Math.floor((g + 255) / 2);
      const lightB = Math.floor((b + 255) / 2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setLineWidth(1);
      const circleX = leftColX + 3;
      doc.line(circleX, firstEduCircleY, circleX, lastEduCircleY);
    }

    // === RIGHT COLUMN: Skills, Certs, Languages, Interests, Awards
    let rightY = currentY;
    doc.setLineWidth(0.4);

    const drawStars = (score, x, y) => {
      const radius = 1.5, spacing = 4;
      for (let i = 1; i <= 5; i++) {
        const fill = i <= score;
        doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
        doc.circle(x + (i - 1) * spacing, y - 1.5, radius, fill ? 'F' : 'S');
      }
    };

    const renderSkillSection = (title, items) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(0);
      doc.text(title, rightColX, rightY);
      rightY += 2;
      doc.setDrawColor(r, g, b);
      doc.line(rightColX, rightY, pageWidth - margin, rightY);
      rightY += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const name = item.querySelector('input[type="text"]')?.value.trim();
        const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
        if (name && score) {
          const circleTotalWidth = 5 * 4;
          const circleX = pageWidth - margin - circleTotalWidth;

          const maxNameWidth = circleX - rightColX - 4;
          const nameLines = doc.splitTextToSize(name, maxNameWidth);

          nameLines.forEach((line, index) => {
            doc.text(line, rightColX, rightY + index * lineHeight);
          });

          drawStars(score, circleX, rightY);
          rightY += nameLines.length * lineHeight;
        }
      });

      rightY += 2;
    };

    renderSkillSection(T.coreSkills, techSkillsItems);

    if (certSections.length > 0) {
      let hasCertContent = false;
      certSections.forEach(pane => {
        if (pane.querySelector('input[type="checkbox"]')?.checked) {
          const inputs = pane.querySelectorAll('input');
          const values = Array.from(inputs).map(i => i.value.trim());
          if (values.some(v => v)) {
            hasCertContent = true;
          }
        }
      });

      if (hasCertContent) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(0);
        doc.text(T.certifications, rightColX, rightY);
        rightY += 2;
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.4);
        doc.line(rightColX, rightY, pageWidth - margin, rightY);
        rightY += lineHeight;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);

        certSections.forEach(pane => {
          if (!pane.querySelector('input[type="checkbox"]')?.checked) return;
          const inputs = pane.querySelectorAll('input');
          const values = Array.from(inputs).map(i => i.value.trim());
          if (values.some(v => v)) {
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(`${values[0]} - ${values[1]}`, pageWidth - rightColX - margin);
            titleLines.forEach(line => {
              doc.text(line, rightColX, rightY);
              rightY += lineHeight;
            });

            doc.setFont("helvetica", "normal");
            const detailText = [
              `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
              values[2],
              values[5]
            ].filter(Boolean).join(" | ");
            const detailLines = doc.splitTextToSize(detailText, pageWidth - rightColX - margin - 2);
            detailLines.forEach(line => {
              doc.text(line, rightColX + 2, rightY);
              rightY += lineHeight;
            });

            rightY += 1;
          }
        });
      }
    }
    
    rightY += 2;
    renderSkillSection(T.languages, softSkillsItems);

    // === Interests
    const interests = [];
    interestTextInputs.forEach((input, i) => {
      if (interestCheckboxes[i]?.checked && input?.value.trim()) {
        interests.push(input.value.trim());
      }
    });
    if (interests.length) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.interests, rightColX, rightY);
      rightY += 2;
      doc.line(rightColX, rightY, pageWidth - margin, rightY);
      rightY += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      interests.forEach(text => {
        const lines = doc.splitTextToSize(text, pageWidth - rightColX - margin);
        lines.forEach(line => {
          doc.text(line, rightColX, rightY);
          rightY += lineHeight;
        });
      });
    }

    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }

    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}
  
function cvbDownloadPDF_Luminary() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }
  
  function lightenColor(r, g, b, percent) {
    return [
      Math.min(255, Math.floor(r + (255 - r) * percent)),
      Math.min(255, Math.floor(g + (255 - g) * percent)),
      Math.min(255, Math.floor(b + (255 - b) * percent))
    ];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    const maxImageWidth = 25;
    const textX = leftColX;
    let textY = currentY;

    // === Calcul dynamique du header ===
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - maxImageWidth - 4 * margin);
    let headerTextHeight = nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const specialityHeight = lineHeight;
    headerTextHeight += specialityHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const summaryMaxLines = 3;
    let summaryLines = doc.splitTextToSize(summary, pageWidth - maxImageWidth - 4 * margin);

    let summaryTruncated = false;
    if (summaryLines.length > summaryMaxLines) {
      summaryLines = summaryLines.slice(0, summaryMaxLines);
      summaryTruncated = true;
    }

    if (summaryTruncated) {
      const lastLine = summaryLines[summaryLines.length - 1];
      const ellipsis = '...';
      const maxLineWidth = pageWidth - maxImageWidth - 4 * margin;
      let shortened = lastLine;
      while (doc.getTextWidth(shortened + ellipsis) > maxLineWidth && shortened.length > 0) {
        shortened = shortened.slice(0, -1);
      }
      summaryLines[summaryLines.length - 1] = shortened + ellipsis;
    }

    const summaryHeight = summaryLines.length * lineHeight;
    headerTextHeight += summaryHeight;

    const headerBoxHeight = headerTextHeight;
    const imageHeight = headerBoxHeight;

    if (imgData) {
      const fixedSize = 25;
      const imageX = pageWidth - margin - fixedSize;
      const imageY = currentY;
      doc.addImage(imgData, 'JPEG', imageX, imageY, fixedSize, fixedSize);
    }

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    textY += lineHeight;
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(summaryLines, textX, textY);
    textY += summaryLines.length * lineHeight;

    currentY += headerBoxHeight + 2;
    
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactLineYStart = currentY;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.line(0, contactLineYStart, pageWidth, contactLineYStart);

    currentY += 2;

    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const itemGap = 6;

    let contactX = leftColX;
    let contactY = currentY + 3;

    const drawContact = (icon, text) => {
      if (!text) return;
      const textWidth = doc.getTextWidth(text);
      if (icon) {
        doc.addImage(icon, 'PNG', contactX, contactY - iconSize + 1.5, iconSize, iconSize);
      }
      doc.text(text, contactX + iconSize + iconGap, contactY);
      contactX += iconSize + iconGap + textWidth + itemGap;
    };

    drawContact(icons.phone, phone);
    drawContact(icons.email, email);
    drawContact(icons.linkedin, linkedin);
    drawContact(icons.address, address);

    currentY += lineHeight;

    const [lr, lg, lb] = lightenColor(r, g, b, 0.85);
    const leftColWidth = rightColX - leftColX - 7 + margin;
    const leftColumnStartY = currentY;
    const leftColumnHeight = pageHeight - currentY;

    doc.setFillColor(lr, lg, lb);
    doc.rect(0, leftColumnStartY, leftColWidth + 2, leftColumnHeight, 'F');
    
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.line(0, currentY, pageWidth, currentY);

    currentY += lineHeight;

    // === LEFT COLUMN
    let leftY = currentY + 2;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(T.coreSkills, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.certifications, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([1, 0.2], 0);
      doc.line(leftColX, leftY, rightColX - 10, leftY);
      doc.setLineDashPattern([], 0);
      leftY += lineHeight;
      doc.setFontSize(12);

      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.setFont("helvetica", "bold");
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;
		  
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.setFont("helvetica", "normal");
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
          hasCertContent = true;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.languages, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(T.interests, leftColX, leftY);
          leftY += 2;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.3);
          doc.setLineDashPattern([1, 0.2], 0);
          doc.line(leftColX, leftY, rightColX - 10, leftY);
          doc.setLineDashPattern([], 0);
          leftY += lineHeight;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY + 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.work, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}
  
function cvbDownloadPDF_Commander() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 125;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawRightBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 2.8, topPadding, pageWidth - rightColX, pageHeight - topPadding - 3, 'F');
  }

  function drawHeader(imgData, startY) {
    const imageWidth = 25;
    const imageHeight = 25;
    const imagePadding = 5;

    let textX = leftColX;
    let imageX = leftColX;
    let imgY = startY;
    let textY = startY + lineHeight;

    if (imgData) {
      imgY = startY - 4;
      const borderRadius = 4;
      const borderThickness = 2;

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(
        imageX - borderThickness,
        imgY - borderThickness,
        imageWidth + 2 * borderThickness,
        imageHeight + 2 * borderThickness,
        borderRadius,
        borderRadius,
        'F'
      );

      doc.addImage(imgData, 'JPEG', imageX, imgY, imageWidth, imageHeight);
      textX = imageX + imageWidth + imagePadding;
      
      const nameLines = doc.splitTextToSize(fullName.toUpperCase(), leftColWidth - imageWidth - imagePadding - 5);
      const nameBlockHeight = nameLines.length * lineHeight + lineHeight;
      const totalTextHeight = nameBlockHeight;
      const imageMiddle = imgY + imageHeight / 2;
      textY = imageMiddle - totalTextHeight / 2 + lineHeight * 0.85;
    }

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), leftColWidth - (imgData ? imageWidth + imagePadding : 0) - 5);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    const paddingBelowImage = 6;
    const bottomY = imgData
      ? Math.max(imgY + imageHeight + paddingBelowImage, textY + 5)
      : textY + 5;

    return bottomY;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawRightBackground();
    
    leftY = drawHeader(imgData, leftY);

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });
    
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.line(rightColX - 5, rightY, rightColX + rightColWidth, rightY);
    rightY += 9;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 300) {
      CVvalidation = false;
      return;
    }

    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbDownloadPDF_Analyst() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');

  function generatePDF(checkOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(r, g, b);
      doc.text(title, margin, currentY);
      currentY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineHeight;
    }
    
    // === Header with name & speciality (no photo, no summary)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 180); 
    doc.text(nameLines, pageWidth / 2, currentY, { align: "center" });
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    const specialityLines = doc.splitTextToSize(speciality, 180);
    doc.text(specialityLines, pageWidth / 2, currentY, { align: "center" });
    currentY += specialityLines.length * lineHeight;

    const contactLine = [
      phone,
      email,
      linkedin,
      address
    ].filter(value => value && value.trim()).join(" | ");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const contactLines = doc.splitTextToSize(contactLine, 180);
    doc.text(contactLines, pageWidth / 2, currentY, { align: "center" });
    currentY += contactLines.length * lineHeight;

    currentY += 5;

    if (summary) {
      addSectionTitle(T.summary);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, currentY);
      currentY += summaryLines.length * lineHeight + 2;
    }

    // Work Experience
    addSectionTitle(T.work);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");

      const experienceTitleLines = doc.splitTextToSize(
        `${values[0]} - ${values[1]}`,
        pageWidth - 2 * margin
      );

      doc.text(experienceTitleLines, margin, currentY);
      currentY += experienceTitleLines.length * lineHeight;

      doc.setFont("helvetica", "normal");

      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");

      const educationTitleLines = doc.splitTextToSize(
        `${values[0]} - ${values[1]}`,
        pageWidth - 2 * margin
      );

      doc.text(educationTitleLines, margin, currentY);
      currentY += educationTitleLines.length * lineHeight;

      doc.setFont("helvetica", "normal");

      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");

          const certificationTitleLines = doc.splitTextToSize(
            `${values[0]} - ${values[1]}`,
            pageWidth - 2 * margin
          );

          doc.text(certificationTitleLines, margin, currentY);
          currentY += certificationTitleLines.length * lineHeight;
          doc.setFont("helvetica", "normal");

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }

    // Technical Skills
    addSectionTitle(T.coreSkills);
    doc.setFontSize(12);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // Languages
    addSectionTitle(T.languages);
    doc.setFontSize(12);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    if (checkOnly) return currentY;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  const finalHeight = generatePDF(true);
  if (finalHeight > 287) {
    CVvalidation = false;
    return;
  }
  CVvalidation = true;
  generatePDF(false);
}

function cvbDownloadPDF_Executive() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    //doc.setFillColor(230, 240, 255);
    //doc.rect(0, 0, rightColX - 5, pageHeight, 'F');

    const headerBoxHeight = 24;
    const imageWidth = 25;
    const imageHeight = 25;
    const imageX = pageWidth - margin - imageWidth;
    const imageY = currentY + (headerBoxHeight - imageHeight) / 2;

    if (imgData) {
      doc.addImage(imgData, 'JPEG', imageX, imageY, imageWidth, imageHeight);
    }

    const textX = leftColX;
    let textY = currentY + 8;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - imageWidth - 4 * margin);
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    const personalLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    const contactLines = doc.splitTextToSize(personalLine, imageX - textX - 5);
    const contactY = currentY + headerBoxHeight - (contactLines.length * lineHeight) + 3;
    doc.text(contactLines, textX, contactY);

    currentY += headerBoxHeight;
    currentY += lineHeight + 3;

    // === LEFT COLUMN
    let leftY = currentY;

    function drawLeftTitle(title, x, y) {
      const boxHeight = 7;
      const boxWidth = (rightColX - 10) - x;
      doc.setFillColor(r, g, b);
      doc.rect(x, y - 5, boxWidth, boxHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(title, x + 3, y);
      doc.setTextColor(0);
      return y + boxHeight + 2;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    leftY = drawLeftTitle(T.coreSkills, leftColX, leftY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      leftY = drawLeftTitle(T.certifications, leftColX, leftY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;

          doc.setFont("helvetica", "normal");
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    leftY = drawLeftTitle(T.languages, leftColX, leftY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          leftY = drawLeftTitle(T.interests, leftColX, leftY);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY;

    function drawRightTitle(title, x, y) {
      const boxHeight = 7;
      const boxWidth = (pageWidth - margin) - x;
      doc.setFillColor(r, g, b);
      doc.rect(x, y - 5, boxWidth, boxHeight, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, x + 3, y);
      doc.setTextColor(0);
      return y + boxHeight + 2;
    }

    // === SUMMARY in Right Column
    if (summary) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const summaryLines = doc.splitTextToSize(summary, 120);
      summaryLines.forEach(line => {
        doc.text(line, rightColX + 2, rightY);
        rightY += lineHeight;
      });
      rightY += 3; // spacing before next section
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    rightY = drawRightTitle(T.work, rightColX, rightY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY = drawRightTitle(T.education, rightColX, rightY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbDownloadPDF_Strategist() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }
  
  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin; 
  const rightColWidth = 75; 
  const leftColX = rightColX + rightColWidth + 5; 
  const leftColWidth = pageWidth - leftColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawLeftBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 4.5, topPadding, rightColWidth + 4, pageHeight - topPadding - 3, 'F');
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`; // Degree - Major
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawLeftBackground();

    // ------------------------------
    // RIGHT COLUMN: Name + Speciality (above contacts)
    // ------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);

    let textY = rightY + 3;
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
    nameLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(r, g, b);
    const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
    specialityLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    // Add some spacing before contact icons
    textY += 3;
    rightY = textY;

    // ------------------------------
    // LEFT COLUMN: Summary (start directly)
    // ------------------------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;

    // Continue with Work and Education
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5; // mm
    const iconGap = 1.5;  // mm

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });
    
    rightY += 3;

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.line(rightColX - 5, rightY, rightColX + rightColWidth, rightY);
    rightY += 9;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  generatePDF(false);
}

function cvbDownloadPDF_Authority() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 125;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 10;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawRightBackground() {
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(rightColX - 4, topPadding, pageWidth - rightColX + 4.5, pageHeight - topPadding, 'F');
  }

  function drawTopHeader(imgData) {
    const headerHeight = 30;
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    const imgSize = 20;
    const borderSize = 1;
    const imgX = pageWidth - margin - imgSize;
    const imgY = 5;

    if (imgData) {
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(borderSize);
      doc.rect(imgX - borderSize / 2, imgY - borderSize / 2, imgSize + borderSize, imgSize + borderSize, 'S');
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgSize, imgSize);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const textX = margin;
    doc.text(fullName.toUpperCase(), textX, 15);

    if (speciality) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(speciality, textX, 22);
    }

    return headerHeight + 5;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawRightBackground();

    const startY = drawTopHeader(imgData);
    leftY = startY + 5;
    rightY = startY + 5;

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });
    
    rightY += 5;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 300) {
      CVvalidation = false;
      return;
    }

    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbDownloadPDF_Minimalist() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin; 
  const rightColWidth = 72; 
  const leftColX = rightColX + rightColWidth + 5; 
  const leftColWidth = pageWidth - leftColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });
        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }
      y += 2;
    });
    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      // const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value); // Not needed

      if (name) {
        doc.text(name, x, y);
        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    // ------------------------------
    // RIGHT COLUMN: Name + Speciality (above contacts)
    // ------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);

    let textY = rightY + 3;
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
    nameLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(r, g, b);
    const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
    specialityLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    // Add some spacing before contact icons
    textY += 1;
    rightY = textY;

    // ------------------------------
    // LEFT COLUMN: Summary (start directly)
    // ------------------------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;

    // Continue with Work and Education
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5; // mm
    const iconGap = 1.5;  // mm

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });

    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.line(rightColX - 5, rightY, rightColX + rightColWidth, rightY);
    rightY += 9;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    const languageList = gatherLanguages(softSkillsItems);
    if (languageList.length > 0) {
      rightY = addSection(T.languages, languageList, rightColX, rightY, rightColWidth - 5);
    }
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  generatePDF(false);
}

function cvbDownloadPDF_Precisionist() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData, checkOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title, iconPath) {
      const iconSize = 8;
      const iconMargin = 1;

      if (iconPath) {
        doc.setFillColor(r, g, b);
        doc.rect(margin, currentY - iconSize + 2, iconSize, iconSize, 'F');
        doc.addImage(iconPath, 'PNG', margin + iconMargin, currentY - iconSize + 3, iconSize - iconMargin*2, iconSize - iconMargin*2);
      }

      const textX = iconPath ? margin + iconSize + 3 : margin;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(r, g, b);
      doc.text(title, textX, currentY);

      currentY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += lineHeight;
    }
    
    if (imgData) {
      const imgWidth = 25;
      const imgHeight = 25;
      const borderRadius = 2;
      const imgX = pageWidth - margin - imgWidth;
      const imgY = currentY - 4;

      const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
      const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
      const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.8));

      doc.setLineWidth(2);
      doc.setDrawColor(lightR, lightG, lightB);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(imgX - 1, imgY - 1, imgWidth + 2, imgHeight + 2, borderRadius, borderRadius, 'FD');

      doc.setLineWidth(0.4);
      doc.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    }

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 155);
    doc.text(nameLines, margin, currentY);
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    doc.text(speciality, margin, currentY);
    currentY += lineHeight;

    currentY += 1;

    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white2.png",
      address: "CV_icons/cv_address_white.png"
    };

    const CVicons = {
      experience: "CV_icons/cv_work_white.png",
      education: "CV_icons/cv_university_white.png",
      certification: "CV_icons/cv_certification_white.png",
      coreskills: "CV_icons/cv_skills_white.png",
      languages: "CV_icons/cv_languages_white.png",
      interest: "CV_icons/cv_entertainment_white.png",
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address }
    ];

    const iconSize = 5;
    const gapX = 60;
    const gapY = 8;

    contactItems.forEach((item, index) => {
      if (!item.text) return;

      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = margin + col * gapX + 1.5; 
      const y = currentY + row * gapY;

      const squareSizeHorizontal = iconSize + 2;
      const squareSizeVertical = iconSize + 2;
      const squareY = y - iconSize / 2;

      doc.setFillColor(r, g, b); 
      doc.rect(x - 1, squareY, squareSizeHorizontal, squareSizeVertical, 'F');

      if (item.icon) {
        const iconY = squareY + (squareSizeVertical - iconSize) / 2;
        doc.addImage(item.iconWhite || item.icon, 'PNG', x, iconY, iconSize, iconSize);
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(33, 33, 33);
      const textY = squareY + squareSizeVertical / 2 + 1;
      doc.text(item.text, x + squareSizeHorizontal + 1, textY);
    });
    const rows = Math.ceil(contactItems.filter(item => item.text).length / 2);
    currentY += rows * gapY + 3;

    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
    doc.text(summaryLines, margin, currentY);
    currentY += summaryLines.length * lineHeight + 3;

    // Work Experience
    addSectionTitle(T.work, CVicons.experience);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin + 2, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin + 2, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education, CVicons.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin + 2, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications, CVicons.certification);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
          currentY += lineHeight;
          doc.setFont("helvetica", "normal");

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin + 2, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }
    
    // === Technical Skills
    currentY += 3;
    addSectionTitle(T.coreSkills, CVicons.coreskills);
    doc.setFontSize(12);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // === Languages
    currentY += 3;
    addSectionTitle(T.languages, CVicons.languages);
    doc.setFontSize(12);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    currentY += 2;

    // Interests
    currentY += 3;
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    const interests = [];

    interestTextInputs.forEach((input, i) => {
      const checkbox = interestCheckboxes[i];
      const val = input?.value.trim();
      if (checkbox?.checked && val) interests.push(val);
    });

    if (interests.length > 0) {
      addSectionTitle(T.interests, CVicons.interest);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const interestLine = doc.splitTextToSize(interests.join(" - "), pageWidth - 2 * margin);
      doc.text(interestLine, margin, currentY);
      currentY += interestLine.length * lineHeight;
    }
    
    if (checkOnly) return currentY;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  const handleFinalPDF = (imgData) => {
    const finalHeight = generatePDF(imgData, true);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    generatePDF(imgData, false);
  };

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      handleFinalPDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => handleFinalPDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => handleFinalPDF(null));
    } else {
      handleFinalPDF(null);
    }
  }
}

function cvbDownloadPDF_Coordinator() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 120;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

function drawTopHeader(imgData) {
  const headerHeight = 30;

  doc.setFillColor(r, g, b);
  doc.rect(margin, margin, pageWidth - 2 * margin, headerHeight, 'F');

  const imgSize = 20;
  const borderSize = 1;
  const imgX = pageWidth - margin - imgSize - 5;
  const imgY = margin + 5;

  if (imgData) {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(borderSize);
    doc.rect(imgX - borderSize / 2, imgY - borderSize / 2, imgSize + borderSize, imgSize + borderSize, 'S');
    doc.addImage(imgData, 'JPEG', imgX, imgY, imgSize, imgSize);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  const textX = margin + 6;
  doc.text(fullName.toUpperCase(), textX, margin + 15);

  if (speciality) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(speciality, textX, margin + 22);
  }

  return margin + headerHeight + 5;
}

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    const startY = drawTopHeader(imgData);
    leftY = startY + 5;
    rightY = startY + 5;

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });
    
    rightY += 5;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 300) {
      CVvalidation = false;
      return;
    }

    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}

function cvbDownloadPDF_Mentor() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin; 
  const rightColWidth = 75; 
  const leftColX = rightColX + rightColWidth + 5; 
  const leftColWidth = pageWidth - leftColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawLeftBackground() {
      doc.setFillColor(themeColorHex);
      doc.rect(
        rightColX - 10,
        0,
        rightColWidth + 10,
        pageHeight,
        'F'
      );
  }

  function addLeftSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width - 5);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width - 5);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width - 5);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function addRightSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(33, 33, 33);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isLeft = x > 100 ? false : true;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(isLeft ? 255 : r, isLeft ? 255 : g, isLeft ? 255 : b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          doc.setFillColor(isLeft ? 255 : (i <= score ? r : 200),
                          isLeft ? 255 : (i <= score ? g : 200),
                          isLeft ? 255 : (i <= score ? b : 200));
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, i <= score ? 'F' : 'S');
        }
        y += lineHeight;
      }
    });
    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawLeftBackground();

    // ------------------------------
    // RIGHT COLUMN: Name + Speciality (above contacts)
    // ------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);

    let textY = rightY + 3;
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
    nameLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
    specialityLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    // Add some spacing before contact icons
    textY += 3;
    rightY = textY;

    // ------------------------------
    // LEFT COLUMN: Summary (start directly)
    // ------------------------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;

    // Continue with Work and Education
    leftY = addRightSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addRightSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white.png",
      address: "CV_icons/cv_address_white.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);

    const iconSize = 4.5; // mm
    const iconGap = 1.5;  // mm

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });

    rightY += 4;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addLeftSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addLeftSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  generatePDF(false);
}

function cvbDownloadPDF_Architect() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const rightColX = margin; 
  const rightColWidth = 75; 
  const leftColX = rightColX + rightColWidth + 5; 
  const leftColWidth = pageWidth - leftColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawLeftBackground() {
      doc.setFillColor(themeColorHex);
      doc.rect(rightColX - 10, 0, rightColWidth + 10, pageHeight, 'F');
  }

  function drawRightBackground() { 
    const coldR = Math.min(255, Math.floor(r + (255 - r) * 0.8));
    const coldG = Math.min(255, Math.floor(g + (255 - g) * 0.8));
    const coldB = Math.min(255, Math.floor(b + (255 - b) * 0.8));
    const topPadding = 3;

    doc.setFillColor(coldR, coldG, coldB);
    doc.rect(leftColX - 5, 0, leftColWidth + 10, pageHeight, 'F');
  }

  function addLeftSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width - 5);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width - 5);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width - 5);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function addRightSection(title, items, x, y, width, options = {}) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(33, 33, 33);
      doc.text(title.toUpperCase(), x, y);
      y += 3;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.4);
      doc.line(x, y, x + width, y);
      y += lineHeight;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);

      items.forEach(item => {
          if (typeof item === 'string') {
              const lines = doc.splitTextToSize(item, width);
              lines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
          } else {
              const titleLines = doc.splitTextToSize(item.title, width);
              doc.setFont("helvetica", "bold");
              titleLines.forEach(line => {
                  doc.text(line, x, y);
                  y += lineHeight;
              });
              if (item.meta) {
                  const metaLines = doc.splitTextToSize(item.meta, width);
                  doc.setFont("helvetica", "normal");
                  metaLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
              if (item.desc) {
                  const descLines = doc.splitTextToSize(item.desc, width);
                  doc.setFont("helvetica", "normal");
                  descLines.forEach(line => {
                      doc.text(line, x, y);
                      y += lineHeight;
                  });
              }
          }
          y += 2;
      });

      return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isLeft = x > 100 ? false : true;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(isLeft ? 255 : r, isLeft ? 255 : g, isLeft ? 255 : b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(isLeft ? 255 : 33, isLeft ? 255 : 33, isLeft ? 255 : 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          doc.setFillColor(isLeft ? 255 : (i <= score ? r : 200),
                          isLeft ? 255 : (i <= score ? g : 200),
                          isLeft ? 255 : (i <= score ? b : 200));
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, i <= score ? 'F' : 'S');
        }
        y += lineHeight;
      }
    });
    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    drawLeftBackground();
    drawRightBackground();

    // ------------------------------
    // RIGHT COLUMN: Name + Speciality (above contacts)
    // ------------------------------
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);

    let textY = rightY + 3;
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), rightColWidth - 5);
    nameLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const specialityLines = doc.splitTextToSize(speciality, rightColWidth - 5);
    specialityLines.forEach(line => {
      doc.text(line, rightColX, textY);
      textY += lineHeight;
    });

    // Add some spacing before contact icons
    textY += 3;
    rightY = textY;

    // ------------------------------
    // LEFT COLUMN: Summary (start directly)
    // ------------------------------
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;

    leftY = addRightSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addRightSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    // RIGHT COLUMN CONTENT
    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white.png",
      address: "CV_icons/cv_address_white.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);

    const iconSize = 4.5; // mm
    const iconGap = 1.5;  // mm

    contactItems.forEach(({ icon, text }) => {
      if (!text) return;
      if (icon) {
        doc.addImage(icon, 'PNG', rightColX, rightY - iconSize + 1, iconSize, iconSize);
      }
      doc.text(text, rightColX + iconSize + iconGap, rightY);
      rightY += lineHeight;
    });

    rightY += 4;
    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addLeftSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addLeftSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  generatePDF(false);
}

function cvbDownloadPDF_Connector() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 120;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawTopHeader() {
    const headerHeight = 30;

    doc.setFillColor(r, g, b);
    doc.rect(margin, margin, pageWidth - 2 * margin, headerHeight, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    const textX = margin + 6;
    doc.text(fullName.toUpperCase(), textX, margin + 15);

    if (speciality) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(speciality, textX, margin + 22);
    }

    const icons = {
      phone: "CV_icons/cv_phone_white.png",
      email: "CV_icons/cv_email_white.png",
      linkedin: "CV_icons/cv_linkedin_white.png",
      address: "CV_icons/cv_address_white.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const lineSpacing = 6;

    let contactX = pageWidth - margin - 2;
    let contactY = margin + 8;

    contactItems.forEach(({ icon, text }) => {
      if (text && text.trim()) {
        const textWidth = doc.getTextWidth(text);
        const textX = contactX - iconSize - iconGap - textWidth;
        doc.text(text, textX, contactY, { align: "left" });
        doc.addImage(
          icon,
          "PNG",
          textX + textWidth + iconGap,
          contactY - iconSize + 1,
          iconSize,
          iconSize
        );

        contactY += lineSpacing;
      }
    });
    return margin + headerHeight + 5;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsWithScores(title, items, x, y, width) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score) {
        doc.text(name, x, y);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = x + width - (5 * spacing);

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, y - 1.5, circleRadius, fill ? 'F' : 'S');
        }

        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    const startY = drawTopHeader();
    leftY = startY + 5;
    rightY = startY + 5;

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    rightY = drawSkillsWithScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawSkillsWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 300) {
      CVvalidation = false;
      return;
    }

    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = e => generatePDF(e.target.result);
    reader.readAsDataURL(photoFile);
  } else {
    generatePDF(null);
  }
}

function cvbDownloadPDF_Specialist() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";

  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;

  const leftColX = margin;
  const leftColWidth = 120;
  const rightColX = leftColX + leftColWidth + 5;
  const rightColWidth = pageWidth - rightColX - margin + 5;

  let leftY = margin;
  let rightY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const interestInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
  const interestChecks = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");

  function drawTopHeader() {
    const headerHeight = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    const textX = margin;
    doc.text(fullName.toUpperCase(), textX, margin + 12);

    if (speciality) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(r, g, b);
      doc.text(speciality, textX, margin + 19);
      doc.setTextColor(33, 33, 33);
    }

    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactItems = [
      { icon: icons.phone, text: phone },
      { icon: icons.email, text: email },
      { icon: icons.linkedin, text: linkedin },
      { icon: icons.address, text: address },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(33, 33, 33);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const lineSpacing = 6;

    let contactX = pageWidth - margin - 2;
    let contactY = margin + 3;

    contactItems.forEach(({ icon, text }) => {
      if (text && text.trim()) {
        const textWidth = doc.getTextWidth(text);
        const textX = contactX - iconSize - iconGap - textWidth;
        doc.text(text, textX, contactY, { align: "left" });
        doc.addImage(icon, "PNG", textX + textWidth + iconGap, contactY - iconSize + 1, iconSize, iconSize);
        contactY += lineSpacing;
      }
    });
    return margin + headerHeight + 5;
  }

  function addSection(title, items, x, y, width, options = {}) {
    const isRight = x > 100;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      if (typeof item === 'string') {
        const lines = doc.splitTextToSize(item, width - 7);
        lines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, x, y);
          y += lineHeight;
        });
      } else {
        const titleLines = doc.splitTextToSize(item.title, width - 7);
        doc.setFont("helvetica", "bold");
        titleLines.forEach(line => {
          doc.text(line, x, y);
          y += lineHeight;
        });

        if (item.meta && item.meta.trim()) {
          const metaLines = doc.splitTextToSize(item.meta, width - 7);
          doc.setFont("helvetica", "normal");
          metaLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }

        if (item.desc) {
          const descLines = doc.splitTextToSize(item.desc, width - 7);
          doc.setFont("helvetica", "normal");
          descLines.forEach(line => {
            doc.text(line, x, y);
            y += lineHeight;
          });
        }
      }

      y += 2;
    });

    return y;
  }

  function drawSkillsNoScores(title, items, x, y, width) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) {
        doc.text(name, x, y);
        y += lineHeight;
      }
    });

    return y + 2;
  }

  function gatherLanguages(items) {
    const levels = [T.beginner, T.basic, T.current, T.fluency, T.maternel];
    const arr = [];
    items.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (checkbox?.checked && name && score >= 1 && score <= 5) {
        arr.push(`${name}: ${levels[score - 1]}`);
      }
    });
    return arr;
  }

  function drawLanguagesWithScores(title, items, x, y, width) {
    const languages = gatherLanguages(items);
    if (languages.length === 0) return y;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(title.toUpperCase(), x, y);
    y += 3;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width, y);
    y += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(33, 33, 33);

    languages.forEach(lang => {
      const lines = doc.splitTextToSize(lang, width);
      lines.forEach(line => {
        doc.text(line, x, y);
        y += lineHeight;
      });
      y += 2;
    });

    return y;
  }

  function gatherExperiences(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const desc = textarea?.value.trim() || "";

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherEducation(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const desc = "";
      arr.push({ title, meta, desc });
    });
    return arr;
  }

  function gatherCertifications(sections) {
    const arr = [];
    sections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (!checkbox?.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      const title = `${values[0]} - ${values[1]}`;
      const meta = [
        `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
        values[2],
        values[5]
      ].filter(Boolean).join(" | ");

      arr.push({
        title,
        meta,
        desc: ""
      });
    });
    return arr;
  }

  function gatherInterests() {
    const list = [];
    interestInputs.forEach((input, i) => {
      if (interestChecks[i]?.checked) {
        const val = input.value.trim();
        if (val) list.push(val);
      }
    });
    return list;
  }

  function generatePDF(imgData) {
    const startY = drawTopHeader();
    leftY = startY + 5;
    rightY = startY + 5;

    // LEFT COLUMN CONTENT
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    const summaryLines = doc.splitTextToSize(summary, leftColWidth - 5);
    summaryLines.forEach(line => {
      doc.text(line, leftColX, leftY);
      leftY += lineHeight;
    });
    leftY += 2;
    leftY = addSection(T.work, gatherExperiences(expSections), leftColX, leftY, leftColWidth - 5);
    leftY = addSection(T.education, gatherEducation(eduSections), leftColX, leftY, leftColWidth - 5);

    rightY = drawSkillsNoScores(T.coreSkills, techSkillsItems, rightColX, rightY, rightColWidth - 5);
    const certifications = gatherCertifications(certSections);
    if (certifications.length > 0) {
      rightY = addSection(T.certifications, certifications, rightColX, rightY, rightColWidth - 5);
    }
    rightY = drawLanguagesWithScores(T.languages, softSkillsItems, rightColX, rightY, rightColWidth - 5);
    const interests = gatherInterests();
    if (interests.length > 0) {
      rightY = addSection(T.interests, interests, rightColX, rightY, rightColWidth - 5);
    }

    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 300) {
      CVvalidation = false;
      return;
    }

    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  generatePDF(false);
}

function cvbDownloadPDF_Vanguard() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;
  
  const selectedLang = document.getElementById("cvb-language")?.value || "en";
  const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');

  function generatePDF(checkOnly = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const pageWidth = 210;
    const margin = 10;
    const lineHeight = 6;
    let currentY = margin + 5;
    
    function addSectionTitle(title) {
      const sectionHeight = 8;
      doc.setFillColor(r, g, b); 
      doc.rect(margin, currentY - 1, pageWidth - 2 * margin, sectionHeight - 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 2, currentY + 4);

      currentY += sectionHeight + 3;
    }
    
    // === Header with name & speciality (no photo, no summary)
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), 180); 
    doc.text(nameLines, pageWidth / 2, currentY, { align: "center" });
    currentY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(r, g, b);
    const specialityLines = doc.splitTextToSize(speciality, 180);
    doc.text(specialityLines, pageWidth / 2, currentY, { align: "center" });
    currentY += specialityLines.length * lineHeight;

    const contactLine = `${phone} | ${email} | ${linkedin} | ${address}`;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const contactLines = doc.splitTextToSize(contactLine, 180);
    doc.text(contactLines, pageWidth / 2, currentY, { align: "center" });
    currentY += contactLines.length * lineHeight;

    currentY += 2;

    if (summary) {
      addSectionTitle(T.summary);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      doc.setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, currentY);
      
      currentY += summaryLines.length * lineHeight;
    }

    // Work Experience
    addSectionTitle(T.work);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const workMeta = [
        `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5]
      ].filter(Boolean).join(" | ");

      const workMetaLines = doc.splitTextToSize(workMeta, pageWidth - 2 * margin - 2);
      doc.text(workMetaLines, margin + 2, currentY);
      currentY += workMetaLines.length * lineHeight;

      if (description) {
        const lines = doc.splitTextToSize(description, pageWidth - 2 * margin);
        doc.text(lines, margin + 2, currentY);
        currentY += lines.length * lineHeight;
      }
      currentY += 2;
    });

    // Education
    addSectionTitle(T.education);
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());

      doc.setFont("helvetica", "bold");
      doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
      currentY += lineHeight;

      doc.setFont("helvetica", "normal");

      const educationMeta = [
        `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
        values[4] ? `${T.in} ${values[4]}` : "",
        values[5] ? `Honors: ${values[5]}` : ""
      ].filter(Boolean).join(" | ");

      const educationMetaLines = doc.splitTextToSize(
        educationMeta,
        pageWidth - 2 * margin - 2
      );

      doc.text(educationMetaLines, margin + 2, currentY);
      currentY += educationMetaLines.length * lineHeight + 2;
    });

    // Certifications
    const hasCertifications = Array.from(certSections).some(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return false;
      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      return values.some(v => v);
    });

    if (hasCertifications) {
      addSectionTitle(T.certifications);
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;
        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          doc.setFont("helvetica", "bold");
          doc.text(`${values[0]} - ${values[1]}`, margin, currentY);
          currentY += lineHeight;
          doc.setFont("helvetica", "normal");

          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const certMetaLines = doc.splitTextToSize(
            certMeta,
            pageWidth - 2 * margin - 2
          );

          doc.text(certMetaLines, margin + 2, currentY);
          currentY += certMetaLines.length * lineHeight + 2;
        }
      });
    }

    // Technical Skills
    addSectionTitle(T.coreSkills);
    doc.setFontSize(12);
    const techSkills = [];
    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;
      const name = item.querySelector('input[type="text"]')?.value.trim();
      if (name) techSkills.push(name);
    });
    if (techSkills.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const techLine = doc.splitTextToSize(techSkills.join(", "), pageWidth - 2 * margin);
      doc.text(techLine, margin, currentY);
      currentY += techLine.length * lineHeight;
    }
    
    currentY += 2;

    // Languages
    addSectionTitle(T.languages);
    doc.setFontSize(12);
    const languageDescriptions = ["Beginner", "Basic", "Current", "Fluency", "Maternel"];
    const languageList = [];

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);

      if (name && score >= 1 && score <= 5) {
        const level = languageDescriptions[score - 1];
        languageList.push(`${name}: ${level}`);
      }
    });

    if (languageList.length > 0) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(33, 33, 33);
      const languageLine = doc.splitTextToSize(languageList.join(", "), pageWidth - 2 * margin);
      doc.text(languageLine, margin, currentY);
      currentY += languageLine.length * lineHeight;
    }
    
    if (checkOnly) return currentY;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  const finalHeight = generatePDF(true);
  if (finalHeight > 287) {
    CVvalidation = false;
    return;
  }
  CVvalidation = true;
  generatePDF(false);
}

function cvbDownloadPDF_Virtuoso() {
  if (!cvbValidateRequiredData()) {
    CVvalidation = false;
    return;
  }

  CVvalidation = false;

  const selectedLang = document.getElementById("cvb-language")?.value || "en";
	const T = cvbTranslations[selectedLang];
  
  function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return parsed ? [
      parseInt(parsed[1], 16),
      parseInt(parsed[2], 16),
      parseInt(parsed[3], 16)
    ] : [40, 120, 220];
  }

  const themeColorHex = document.getElementById("cvb-theme-color")?.value || "#2878dc";
  const [r, g, b] = hexToRgb(themeColorHex);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 10;
  const lineHeight = 6;
  const leftColX = margin;
  const rightColX = 80;
  let currentY = margin;

  const fullName = document.getElementById("cvb-fullName")?.value || "Unnamed";
  const phone = document.getElementById("cvb-phone")?.value || "";
  const email = document.getElementById("cvb-email")?.value || "";
  const linkedin = document.getElementById("cvb-linkedin")?.value || "";
  const address = document.getElementById("cvb-address")?.value || "";
  const speciality = document.getElementById("cvb-speciality")?.value || "";
  const summary = document.getElementById("cvb-summary-text")?.value || "";

  const techSkillsItems = document.querySelectorAll("#cvb-tech-skills-list .navCard-requiresGroup");
  const softSkillsItems = document.querySelectorAll("#cvb-soft-skills-list .navCard-requiresGroup");
  const certSections = document.querySelectorAll('#cvb-cert-content .cvb-tab-pane');
  const expSections = document.querySelectorAll('#cvb-exp-content .cvb-tab-pane');
  const eduSections = document.querySelectorAll('#cvb-edu-content .cvb-tab-pane');
  const photoFile = document.getElementById("cvb-photo")?.files[0];

  function generatePDF(imgData) {
    const maxImageWidth = 25;
    const textX = leftColX;
    let textY = currentY;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    const nameLines = doc.splitTextToSize(fullName.toUpperCase(), pageWidth - maxImageWidth - 4 * margin);
    let headerTextHeight = nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const specialityHeight = lineHeight;
    headerTextHeight += specialityHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const summaryMaxLines = 3;
    let summaryLines = doc.splitTextToSize(summary, pageWidth - maxImageWidth - 4 * margin);

    let summaryTruncated = false;
    if (summaryLines.length > summaryMaxLines) {
      summaryLines = summaryLines.slice(0, summaryMaxLines);
      summaryTruncated = true;
    }

    if (summaryTruncated) {
      const lastLine = summaryLines[summaryLines.length - 1];
      const ellipsis = '...';
      const maxLineWidth = pageWidth - maxImageWidth - 4 * margin;
      let shortened = lastLine;
      while (doc.getTextWidth(shortened + ellipsis) > maxLineWidth && shortened.length > 0) {
        shortened = shortened.slice(0, -1);
      }
      summaryLines[summaryLines.length - 1] = shortened + ellipsis;
    }

    const summaryHeight = summaryLines.length * lineHeight;
    headerTextHeight += summaryHeight;

    const headerBoxHeight = headerTextHeight;
    const imageHeight = headerBoxHeight;

    // === Profile Image fixed size 25x25 mm ===
    if (imgData) {
      const fixedSize = 25; // mm
      const imageX = pageWidth - margin - fixedSize;
      const imageY = currentY;

      doc.addImage(imgData, 'JPEG', imageX, imageY, fixedSize, fixedSize);
    }

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    textY += lineHeight;
    doc.text(nameLines, textX, textY);
    textY += nameLines.length * lineHeight;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(speciality, textX, textY);
    textY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);
    doc.text(summaryLines, textX, textY);
    textY += summaryLines.length * lineHeight;

    currentY += headerBoxHeight + 2;

    const icons = {
      phone: "CV_icons/cv_phone.png",
      email: "CV_icons/cv_email.png",
      linkedin: "CV_icons/cv_linkedin.png",
      address: "CV_icons/cv_address.png"
    };

    const contactLineYStart = currentY;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(margin, contactLineYStart, pageWidth - margin, contactLineYStart);

    currentY += 2;

    doc.setTextColor(80, 80, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const iconSize = 4.5;
    const iconGap = 1.5;
    const itemGap = 6;

    let contactX = leftColX;
    let contactY = currentY + 3;

    const drawContact = (icon, text) => {
      if (!text) return;
      const textWidth = doc.getTextWidth(text);
      if (icon) {
        doc.addImage(icon, 'PNG', contactX, contactY - iconSize + 1.5, iconSize, iconSize);
      }
      doc.text(text, contactX + iconSize + iconGap, contactY);
      contactX += iconSize + iconGap + textWidth + itemGap;
    };

    drawContact(icons.phone, phone);
    drawContact(icons.email, email);
    drawContact(icons.linkedin, linkedin);
    drawContact(icons.address, address);

    currentY += lineHeight;
    
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += lineHeight;

    // === LEFT COLUMN
    let leftY = currentY + 2;

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(T.coreSkills, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    techSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        const maxTextWidth = 40;
        const wrappedLines = doc.splitTextToSize(name, maxTextWidth);
        doc.text(wrappedLines, leftColX, leftY);

        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + maxTextWidth + 2;
        const circleY = leftY - 1.5;

        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, circleY, circleRadius, fill ? 'F' : 'S');
        }

        leftY += wrappedLines.length * lineHeight;
      }
    });

    // === Certifications
    let hasCertifications = false;
    certSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        hasCertifications = true;
      }
    });

    if (hasCertifications) {
      leftY += 3;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(T.certifications, leftColX, leftY);
      leftY += 2;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([1, 0.2], 0);
      doc.line(leftColX, leftY, rightColX - 10, leftY);
      doc.setLineDashPattern([], 0);
      leftY += lineHeight;
      doc.setFontSize(12);

      let hasCertContent = false;
      certSections.forEach(pane => {
        const checkbox = pane.querySelector('input[type="checkbox"]');
        if (checkbox && !checkbox.checked) return;

        const inputs = pane.querySelectorAll('input');
        const values = Array.from(inputs).map(i => i.value.trim());
        if (values.some(v => v)) {
          const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 60);
          doc.setFont("helvetica", "bold");
          doc.text(titleLine, leftColX, leftY);
          leftY += titleLine.length * lineHeight;
		  
          const certMeta = [
            `${formatCVDate(values[3], selectedLang)} - ${formatCVDate(values[4], selectedLang)}`,
            values[2],
            values[5]
          ].filter(Boolean).join(" | ");

          const metaLine = doc.splitTextToSize(certMeta, 60);
          doc.setFont("helvetica", "normal");
          doc.text(metaLine, leftColX + 2, leftY);
          leftY += metaLine.length * lineHeight;
          hasCertContent = true;
        }
      });
    }
    
    leftY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.languages, leftColX, leftY);
    leftY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(leftColX, leftY, rightColX - 10, leftY);
    doc.setLineDashPattern([], 0);
    leftY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    softSkillsItems.forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const name = item.querySelector('input[type="text"]')?.value.trim();
      const score = parseInt(item.querySelector('input[type="radio"]:checked')?.value);
      if (name && score) {
        doc.text(name, leftColX, leftY);
        const circleRadius = 1.5;
        const spacing = 4;
        const startX = leftColX + 41;
        for (let i = 1; i <= 5; i++) {
          const fill = i <= score;
          doc.setFillColor(fill ? r : 200, fill ? g : 200, fill ? b : 200);
          doc.circle(startX + (i - 1) * spacing, leftY - 1.5, circleRadius, fill ? 'F' : 'S');
        }
        leftY += lineHeight;
      }
    });

    // === Interests
    const interestTextInputs = document.querySelectorAll("#cvb-interests-list input[type='text']");
    const interestCheckboxes = document.querySelectorAll("#cvb-interests-list input[type='checkbox']");
    let hasInterest = false;

    interestTextInputs.forEach((input, index) => {
      const checkbox = interestCheckboxes[index];
      const interest = input?.value.trim();

      if (checkbox && checkbox.checked && interest) {
        if (!hasInterest) {
          leftY += 3;
          doc.setFont("helvetica", "bold");
          doc.setFontSize(13);
          doc.text(T.interests, leftColX, leftY);
          leftY += 2;
          doc.setDrawColor(r, g, b);
          doc.setLineWidth(0.3);
          doc.setLineDashPattern([1, 0.2], 0);
          doc.line(leftColX, leftY, rightColX - 10, leftY);
          doc.setLineDashPattern([], 0);
          leftY += lineHeight;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12);
          hasInterest = true;
        }

        const lines = doc.splitTextToSize(interest, 60);
        lines.forEach(line => {
          doc.text(line, leftColX, leftY);
          leftY += lineHeight;
        });
      }
    });

    // === RIGHT COLUMN
    let rightY = currentY + 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.work, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    expSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const textarea = pane.querySelector('textarea');
      const values = Array.from(inputs).map(i => i.value.trim());
      const description = textarea?.value.trim() || "";

      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const workMeta = [
          `${formatCVDate(values[2], selectedLang)} - ${formatCVDate(values[3], selectedLang)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5]
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(workMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight;

        if (description) {
          const descLines = doc.splitTextToSize(description, 120);
          descLines.forEach(line => {
            doc.text(`${line}`, rightColX + 2, rightY);
            rightY += lineHeight;
          });
        }
        rightY += 2;
      }
    });

    rightY += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(T.education, rightColX, rightY);
    rightY += 2;
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1, 0.2], 0);
    doc.line(rightColX, rightY, pageWidth - margin, rightY);
    doc.setLineDashPattern([], 0);
    rightY += lineHeight;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    eduSections.forEach(pane => {
      const checkbox = pane.querySelector('input[type="checkbox"]');
      if (checkbox && !checkbox.checked) return;

      const inputs = pane.querySelectorAll('input');
      const values = Array.from(inputs).map(i => i.value.trim());
      if (values.some(v => v)) {
        doc.setFont("helvetica", "bold");
        const titleLine = doc.splitTextToSize(`${values[0]} - ${values[1]}`, 120);
        doc.text(titleLine, rightColX, rightY);
        rightY += titleLine.length * lineHeight;

        doc.setFont("helvetica", "normal");
        const educationMeta = [
          `${formatCVDate(values[2], selectedLang, true)} - ${formatCVDate(values[3], selectedLang, true)}`,
          values[4] ? `${T.in} ${values[4]}` : "",
          values[5] ? `Honors: ${values[5]}` : ""
        ].filter(Boolean).join(" | ");

        const metaLine = doc.splitTextToSize(educationMeta, 120);
        doc.text(metaLine, rightColX + 2, rightY);
        rightY += metaLine.length * lineHeight + 2;
      }
    });

    // === HEIGHT CHECK BEFORE SAVE
    const finalHeight = Math.max(leftY, rightY);
    if (finalHeight > 287) {
      CVvalidation = false;
      return;
    }
    CVvalidation = true;
    doc.save(`${fullName.replace(/\s+/g, "_")}_CV.pdf`);
  }

  if (photoFile) {
    const reader = new FileReader();
    reader.onload = function (e) {
      generatePDF(e.target.result);
    };
    reader.readAsDataURL(photoFile);
  } else {
    const photoUrl = document.getElementById("cvb-photolink")?.value.trim();
    if (photoUrl) {
      fetch(photoUrl)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = e => generatePDF(e.target.result);
          reader.readAsDataURL(blob);
        })
        .catch(() => generatePDF(null));
    } else {
      generatePDF(null);
    }
  }
}