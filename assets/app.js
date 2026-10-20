(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const toast = $("#toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 3200);
  }

  // Mobile and dropdown navigation
  const menuToggle = $("#menu-toggle");
  const navigation = $("#primary-navigation");

  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    navigation.dataset.open = String(!open);
  });

  $$("#primary-navigation a").forEach((link) => {
    link.addEventListener("click", () => {
      $$("#primary-navigation details").forEach((item) => item.removeAttribute("open"));
      if (window.matchMedia("(max-width: 980px)").matches) {
        menuToggle?.setAttribute("aria-expanded", "false");
        if (navigation) navigation.dataset.open = "false";
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#primary-navigation")) {
      $$("#primary-navigation details").forEach((item) => item.removeAttribute("open"));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      $$("#primary-navigation details").forEach((item) => item.removeAttribute("open"));
      window.speechSynthesis?.cancel();
    }
  });

  // Font preferences
  const PREFS_KEY = "boneCarePrefs.v1";
  const fontButtons = $$('[data-font-size]');

  function setFontSize(size, save = true) {
    const allowed = ["normal", "large", "xlarge"];
    const next = allowed.includes(size) ? size : "normal";
    document.body.dataset.fontSize = next;
    fontButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.fontSize === next));
    });
    if (save) {
      try {
        localStorage.setItem(PREFS_KEY, JSON.stringify({ fontSize: next }));
      } catch (_error) {
        // The visual preference still applies for the current visit.
      }
    }
  }

  try {
    const savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    if (savedPrefs?.fontSize) setFontSize(savedPrefs.fontSize, false);
  } catch (_error) {
    setFontSize("normal", false);
  }

  fontButtons.forEach((button) => {
    button.addEventListener("click", () => setFontSize(button.dataset.fontSize));
  });

  // Speech synthesis reads the section currently nearest to the viewport.
  const speakButton = $("#speak-button");
  const speakStop = $("#speak-stop");
  const speakSections = $$('[data-speak-title]');
  let currentSpeakSection = speakSections[0];

  if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
    speakButton.hidden = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) currentSpeakSection = visible.target;
      },
      { rootMargin: "-20% 0px -55%", threshold: [0.05, 0.2, 0.5] }
    );
    speakSections.forEach((section) => observer.observe(section));

    speakButton.addEventListener("click", () => {
      window.speechSynthesis.cancel();
      const title = currentSpeakSection?.dataset.speakTitle || "현재 내용";
      const readableNodes = $$('h1, h2, h3, p, li, legend, summary', currentSpeakSection)
        .filter((node) => !node.closest(".entry-list") && !node.closest("footer"));
      const text = readableNodes.map((node) => node.textContent.trim()).filter(Boolean).join(". ").slice(0, 9000);
      if (!text) return;
      const utterance = new SpeechSynthesisUtterance(`${title}. ${text}`);
      utterance.lang = "ko-KR";
      utterance.rate = 0.92;
      const koreanVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("ko"));
      if (koreanVoice) utterance.voice = koreanVoice;
      utterance.addEventListener("start", () => {
        speakButton.hidden = true;
        speakStop.hidden = false;
      });
      const finish = () => {
        speakButton.hidden = false;
        speakStop.hidden = true;
      };
      utterance.addEventListener("end", finish);
      utterance.addEventListener("error", finish);
      window.speechSynthesis.speak(utterance);
    });

    speakStop.addEventListener("click", () => {
      window.speechSynthesis.cancel();
      speakButton.hidden = false;
      speakStop.hidden = true;
    });
  }

  // Osteoporosis risk check
  const riskForm = $("#risk-form");
  const riskResult = $("#risk-result");
  const heightInput = $("#height-cm");
  const weightInput = $("#weight-kg");
  const bmiOutput = $("#bmi-output");
  const bmiError = $("#bmi-error");

  function calculateBmi(showError = false) {
    const heightRaw = heightInput.value.trim();
    const weightRaw = weightInput.value.trim();
    bmiError.hidden = true;
    heightInput.removeAttribute("aria-invalid");
    weightInput.removeAttribute("aria-invalid");

    if (!heightRaw && !weightRaw) {
      bmiOutput.textContent = "BMI —";
      return { status: "missing" };
    }
    if (!heightRaw || !weightRaw) {
      bmiOutput.textContent = "둘 다 입력";
      if (showError) {
        bmiError.textContent = "키와 체중을 모두 입력하거나 두 칸을 모두 비워 주세요.";
        bmiError.hidden = false;
      }
      return { status: "invalid" };
    }

    const height = Number(heightRaw);
    const weight = Number(weightRaw);
    if (!Number.isFinite(height) || !Number.isFinite(weight) || height < 80 || height > 250 || weight < 20 || weight > 300) {
      bmiOutput.textContent = "입력 확인";
      if (showError) {
        bmiError.textContent = "키는 80–250cm, 체중은 20–300kg 범위에서 입력해 주세요.";
        bmiError.hidden = false;
        heightInput.setAttribute("aria-invalid", "true");
        weightInput.setAttribute("aria-invalid", "true");
      }
      return { status: "invalid" };
    }

    const bmi = weight / ((height / 100) ** 2);
    bmiOutput.textContent = `BMI ${bmi.toFixed(1)}`;
    return { status: bmi < 19 ? "yes" : "no", bmi };
  }

  [heightInput, weightInput].forEach((input) => input?.addEventListener("input", () => calculateBmi(false)));

  $$('.multi-question').forEach((fieldset) => {
    const checks = $$('input[type="checkbox"]', fieldset);
    const statusRadios = $$('input[type="radio"]', fieldset);
    checks.forEach((check) => {
      check.addEventListener("change", () => {
        if (check.checked) statusRadios.forEach((radio) => { radio.checked = false; });
      });
    });
    statusRadios.forEach((radio) => {
      radio.addEventListener("change", () => {
        if (radio.checked) checks.forEach((check) => { check.checked = false; });
      });
    });
  });

  riskForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const bmi = calculateBmi(true);
    if (bmi.status === "invalid") {
      heightInput.focus();
      return;
    }

    let positiveCount = 0;
    let unansweredCount = 0;
    const positives = [];

    $$('[data-risk-question]', riskForm).forEach((fieldset) => {
      const label = fieldset.dataset.label;
      const type = fieldset.dataset.type;
      let answer = "missing";
      let detail = label;

      if (type === "bmi") {
        answer = bmi.status;
        if (answer === "yes") detail = `${label} · 계산값 ${bmi.bmi.toFixed(1)}`;
      } else if (type === "checkboxes") {
        const checked = $$('input[type="checkbox"]:checked', fieldset);
        const status = $('input[type="radio"]:checked', fieldset)?.value;
        if (checked.length) {
          answer = "yes";
          detail = `${label} · ${checked.map((input) => input.value).join(", ")}`;
        } else if (status === "none") {
          answer = "no";
        } else {
          answer = "missing";
        }
      } else {
        answer = $('input[type="radio"]:checked', fieldset)?.value || "missing";
        if (answer === "unknown") answer = "missing";
      }

      if (answer === "yes") {
        positiveCount += 1;
        positives.push(detail);
      } else if (answer === "missing") {
        unansweredCount += 1;
      }
    });

    let className = "low";
    let heading = "현재 체크에서 확인된 위험요인이 없습니다";
    let guidance = "위험요인이 없다는 진단은 아닙니다. 뼈 건강에 좋은 생활습관을 유지하고 정기검진 때 뼈 건강을 함께 확인하세요.";

    if (positiveCount >= 2) {
      className = "high";
      heading = `${positiveCount}개의 위험요인이 확인되었습니다`;
      guidance = "골다공증이나 골절을 의미하는 결과는 아니지만, 의료진과 뼈 건강 및 골밀도 검사 필요성을 상담할 것을 권합니다.";
    } else if (positiveCount === 1) {
      className = "moderate";
      heading = "1개의 위험요인이 확인되었습니다";
      guidance = "다음 진료나 건강검진에서 이 위험요인을 의료진에게 알리고 뼈 건강 상담을 받아 보세요.";
    } else if (unansweredCount > 0) {
      className = "partial";
      heading = "확인된 위험요인은 없지만 답하지 않은 항목이 있습니다";
      guidance = "현재 결과만으로 위험이 없다고 판단할 수 없습니다. 모르는 항목은 다음 진료에서 의료진과 확인하세요.";
    }

    const positiveList = positives.length
      ? `<h4>나에게 해당한 항목</h4><ul>${positives.map((item) => `<li>${item}</li>`).join("")}</ul>`
      : "";
    const missingText = unansweredCount
      ? `<p><strong>미응답·모르겠음:</strong> ${unansweredCount}개 항목</p>`
      : "";

    riskResult.className = `result-panel ${className}`;
    riskResult.innerHTML = `
      <h3>${heading}</h3>
      <p>${guidance}</p>
      ${positiveList}
      ${missingText}
      <p><a href="https://www.osteoporosis.foundation/sites/iofbonehealth/files/2020-10/OsteoporosisRiskCheck_Leaflet_korean.pdf" target="_blank" rel="noopener noreferrer">IOF 한국어 위험도 체크 원문 보기 ↗</a></p>
    `;
    riskResult.hidden = false;
    riskResult.focus({ preventScroll: true });
    riskResult.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  riskForm?.addEventListener("reset", () => {
    window.setTimeout(() => {
      bmiOutput.textContent = "BMI —";
      bmiError.hidden = true;
      riskResult.hidden = true;
      riskResult.innerHTML = "";
    }, 0);
  });

  // Knowledge quiz
  const knowledgeForm = $("#knowledge-form");
  const quizError = $("#quiz-error");
  const quizResult = $("#quiz-result");
  const quizExplanations = [
    "맞습니다. 제품별 조작법이 다르므로 대면 교육과 공식 설명서를 우선해야 합니다.",
    "주사침은 매번 새것을 사용하고 재사용하거나 다른 사람과 공유하지 않습니다.",
    "냉동 보관하지 않습니다. 일반적으로 2–8℃에 냉장하며 제품 설명서를 확인합니다.",
    "맞습니다. 피부 자극을 줄이기 위해 의료진에게 배운 범위에서 주사부위를 바꿉니다.",
    "놓친 용량을 보충하려고 두 배로 투여하면 안 됩니다. 제품 안내나 의료진에게 확인합니다.",
    "맞습니다. 찔림을 막는 단단한 용기에 넣고 지역의 폐기 안내를 따릅니다.",
    "맞습니다. 지속되거나 심해지는 증상은 기록해 의료진에게 알립니다.",
    "맞습니다. 호흡곤란이나 얼굴·입술 부종은 응급상황일 수 있으므로 즉시 119에 연락합니다."
  ];

  knowledgeForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const questions = $$('fieldset', knowledgeForm);
    const unanswered = questions.filter((fieldset) => !$('input:checked', fieldset));
    quizError.hidden = true;
    questions.forEach((fieldset) => fieldset.removeAttribute("aria-invalid"));

    if (unanswered.length) {
      quizError.textContent = `답하지 않은 문항이 ${unanswered.length}개 있습니다. 모든 문항에 답해 주세요.`;
      quizError.hidden = false;
      unanswered[0].setAttribute("aria-invalid", "true");
      unanswered[0].scrollIntoView({ behavior: "smooth", block: "center" });
      $('input', unanswered[0])?.focus({ preventScroll: true });
      return;
    }

    let correct = 0;
    questions.forEach((fieldset, index) => {
      const selected = $('input:checked', fieldset).value;
      const isCorrect = selected === fieldset.dataset.answer;
      const feedback = $('.quiz-feedback', fieldset);
      const learnHref = fieldset.dataset.learn;
      correct += isCorrect ? 1 : 0;
      fieldset.classList.toggle("is-correct", isCorrect);
      fieldset.classList.toggle("is-wrong", !isCorrect);
      feedback.innerHTML = `<strong>${isCorrect ? "정답입니다." : "다시 확인해 보세요."}</strong> ${quizExplanations[index]}${!isCorrect ? ` <a href="${learnHref}">관련 내용 보기</a>` : ""}`;
      feedback.hidden = false;
    });

    const allCorrect = correct === questions.length;
    quizResult.className = `result-panel ${allCorrect ? "low" : "moderate"}`;
    quizResult.innerHTML = `<h3>${correct} / ${questions.length}문항을 맞혔어요</h3><p>${allCorrect ? "안전수칙을 잘 이해하셨습니다. 실제 투여 전에는 나의 제품 설명서를 한 번 더 확인하세요." : "틀린 문항의 설명과 관련 학습 내용을 확인해 보세요. 의료진에게 다시 설명을 요청해도 괜찮습니다."}</p>`;
    quizResult.hidden = false;
    quizResult.focus({ preventScroll: true });
    quizResult.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  knowledgeForm?.addEventListener("reset", () => {
    window.setTimeout(() => {
      quizError.hidden = true;
      quizResult.hidden = true;
      quizResult.innerHTML = "";
      $$('fieldset', knowledgeForm).forEach((fieldset) => {
        fieldset.classList.remove("is-correct", "is-wrong");
        fieldset.removeAttribute("aria-invalid");
        const feedback = $('.quiz-feedback', fieldset);
        feedback.hidden = true;
        feedback.textContent = "";
      });
    }, 0);
  });

  // Health journal: local browser storage only
  const JOURNAL_KEY = "boneCareJournal.v1";
  const emptyJournal = () => ({ version: 1, injections: [], reactions: [], visits: [] });
  let storageAvailable = true;
  let journal = emptyJournal();

  function checkStorage() {
    try {
      const testKey = "__boneCareStorageTest";
      localStorage.setItem(testKey, "1");
      localStorage.removeItem(testKey);
      return true;
    } catch (_error) {
      return false;
    }
  }

  function isJournalShape(value) {
    return value && value.version === 1 && ["injections", "reactions", "visits"].every((key) => Array.isArray(value[key]));
  }

  storageAvailable = checkStorage();
  if (storageAvailable) {
    try {
      const saved = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "null");
      if (isJournalShape(saved)) journal = saved;
    } catch (_error) {
      showToast("저장된 기록을 읽지 못해 새 건강수첩으로 시작합니다.");
    }
  } else {
    $("#storage-warning").hidden = false;
  }

  let saveStatusTimer;
  function announceSave(message) {
    const status = $("#save-status");
    status.textContent = message;
    window.clearTimeout(saveStatusTimer);
    saveStatusTimer = window.setTimeout(() => { status.textContent = ""; }, 3500);
  }

  function persistJournal(message = "이 기기에 저장했습니다.") {
    if (!storageAvailable) {
      announceSave("현재 접속 중에만 기록이 유지됩니다.");
      return;
    }
    try {
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
      announceSave(message);
    } catch (_error) {
      storageAvailable = false;
      $("#storage-warning").hidden = false;
      announceSave("저장 공간을 사용할 수 없어 현재 접속 중에만 유지됩니다.");
    }
  }

  function localDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function newId() {
    return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  const journalConfig = {
    injections: {
      form: $("#injection-form"),
      list: $("#injection-list"),
      title: (entry) => `${entry.product} · ${entry.site}`,
      meta: (entry) => [entry.date, entry.time || "시간 미기록"],
      note: (entry) => entry.note,
      fields: ["date", "time", "product", "site", "note"]
    },
    reactions: {
      form: $("#reaction-form"),
      list: $("#reaction-list"),
      title: (entry) => entry.symptom,
      meta: (entry) => [entry.date, entry.severity, entry.action ? `조치: ${entry.action}` : ""],
      note: (entry) => entry.note,
      fields: ["date", "symptom", "severity", "action", "note"]
    },
    visits: {
      form: $("#visit-form"),
      list: $("#visit-list"),
      title: (entry) => entry.purpose,
      meta: (entry) => [entry.date],
      note: (entry) => [entry.question ? `확인할 질문: ${entry.question}` : "", entry.note].filter(Boolean).join("\n"),
      fields: ["date", "purpose", "question", "note"]
    }
  };

  Object.values(journalConfig).forEach(({ form }) => {
    if (form?.elements.date) form.elements.date.value = localDateString();
  });

  function sortEntries(entries) {
    return [...entries].sort((a, b) => {
      const aKey = `${a.date || ""}T${a.time || "23:59"}-${a.createdAt || ""}`;
      const bKey = `${b.date || ""}T${b.time || "23:59"}-${b.createdAt || ""}`;
      return bKey.localeCompare(aKey);
    });
  }

  function createEntryCard(type, entry) {
    const config = journalConfig[type];
    const article = document.createElement("article");
    article.className = "entry-card";
    article.dataset.id = entry.id;

    const content = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = config.title(entry);
    const meta = document.createElement("p");
    meta.className = "entry-meta";
    config.meta(entry).filter(Boolean).forEach((text) => {
      const span = document.createElement("span");
      span.textContent = text;
      meta.append(span);
    });
    content.append(title, meta);
    const noteText = config.note(entry);
    if (noteText) {
      const note = document.createElement("p");
      note.className = "entry-note";
      note.textContent = noteText;
      content.append(note);
    }

    const actions = document.createElement("div");
    actions.className = "entry-card-actions";
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "수정";
    editButton.setAttribute("aria-label", `${config.title(entry)} 기록 수정`);
    editButton.addEventListener("click", () => startEdit(type, entry.id));
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "삭제";
    deleteButton.setAttribute("aria-label", `${config.title(entry)} 기록 삭제`);
    deleteButton.addEventListener("click", () => deleteEntry(type, entry.id));
    actions.append(editButton, deleteButton);
    article.append(content, actions);
    return article;
  }

  function renderJournal() {
    Object.entries(journalConfig).forEach(([type, config]) => {
      config.list.replaceChildren();
      const entries = sortEntries(journal[type]);
      if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = "아직 기록이 없습니다. 왼쪽 입력란에서 첫 기록을 남겨 보세요.";
        config.list.append(empty);
      } else {
        entries.forEach((entry) => config.list.append(createEntryCard(type, entry)));
      }
      const count = $(`[data-count="${type}"]`);
      if (count) count.textContent = String(entries.length);
    });
  }

  function resetEntryForm(type) {
    const { form } = journalConfig[type];
    form.reset();
    form.elements["record-id"].value = "";
    form.elements.date.value = localDateString();
    const submit = $('button[type="submit"]', form);
    submit.textContent = "저장";
    $('.cancel-edit', form).hidden = true;
    $('h3', form).textContent = `${type === "injections" ? "투약" : type === "reactions" ? "이상반응" : "병원 방문"} 기록 추가`;
  }

  function startEdit(type, id) {
    const config = journalConfig[type];
    const entry = journal[type].find((item) => item.id === id);
    if (!entry) return;
    config.fields.forEach((field) => {
      if (config.form.elements[field]) config.form.elements[field].value = entry[field] || "";
    });
    config.form.elements["record-id"].value = id;
    $('button[type="submit"]', config.form).textContent = "수정 저장";
    $('.cancel-edit', config.form).hidden = false;
    $('h3', config.form).textContent = "기록 수정";
    config.form.scrollIntoView({ behavior: "smooth", block: "center" });
    config.form.elements.date.focus({ preventScroll: true });
  }

  function deleteEntry(type, id) {
    const config = journalConfig[type];
    const entry = journal[type].find((item) => item.id === id);
    if (!entry) return;
    if (!window.confirm(`“${config.title(entry)}” 기록을 삭제할까요?`)) return;
    journal[type] = journal[type].filter((item) => item.id !== id);
    persistJournal("기록을 삭제했습니다.");
    renderJournal();
  }

  Object.entries(journalConfig).forEach(([type, config]) => {
    config.form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!config.form.reportValidity()) return;
      const data = new FormData(config.form);
      const id = String(data.get("record-id") || "");
      const existing = id ? journal[type].find((item) => item.id === id) : null;
      const entry = {
        id: id || newId(),
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      config.fields.forEach((field) => {
        entry[field] = String(data.get(field) || "").trim();
      });
      if (existing) {
        journal[type] = journal[type].map((item) => item.id === id ? entry : item);
      } else {
        journal[type].push(entry);
      }
      persistJournal(existing ? "수정한 기록을 저장했습니다." : "새 기록을 저장했습니다.");
      resetEntryForm(type);
      renderJournal();
    });

    $('.cancel-edit', config.form).addEventListener("click", () => resetEntryForm(type));
  });

  // Accessible journal tabs
  const tabButtons = $$('[data-journal-tab]');
  const tabPanels = $$('[data-journal-panel]');
  function selectJournalTab(type, focus = false) {
    tabButtons.forEach((button) => {
      const selected = button.dataset.journalTab === type;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      if (selected && focus) button.focus();
    });
    tabPanels.forEach((panel) => { panel.hidden = panel.dataset.journalPanel !== type; });
  }

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectJournalTab(button.dataset.journalTab));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowLeft") next = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === "ArrowRight") next = (index + 1) % tabButtons.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabButtons.length - 1;
      selectJournalTab(tabButtons[next].dataset.journalTab, true);
    });
  });

  function protectCsvCell(value) {
    let text = String(value ?? "").replace(/\r?\n/g, " ");
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  $("#export-journal")?.addEventListener("click", () => {
    const rows = [];
    journal.injections.forEach((entry) => rows.push({ type: "투약", ...entry }));
    journal.reactions.forEach((entry) => rows.push({ type: "이상반응", ...entry }));
    journal.visits.forEach((entry) => rows.push({ type: "병원 방문", ...entry }));
    if (!rows.length) {
      showToast("내보낼 건강수첩 기록이 없습니다.");
      return;
    }
    rows.sort((a, b) => `${b.date || ""}${b.time || ""}`.localeCompare(`${a.date || ""}${a.time || ""}`));
    const headers = ["기록종류", "날짜", "시간", "제품", "주사부위", "증상", "정도", "취한조치", "방문목적", "확인할질문", "메모"];
    const body = rows.map((entry) => [
      entry.type, entry.date, entry.time, entry.product, entry.site, entry.symptom,
      entry.severity, entry.action, entry.purpose, entry.question, entry.note
    ].map(protectCsvCell).join(","));
    const csv = `\uFEFF${headers.map(protectCsvCell).join(",")}\r\n${body.join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `뼈튼튼-건강수첩-${localDateString()}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("건강수첩을 CSV 파일로 내보냈습니다.");
  });

  $("#print-journal")?.addEventListener("click", () => {
    const previouslyHidden = tabPanels.filter((panel) => panel.hidden);
    previouslyHidden.forEach((panel) => { panel.hidden = false; });
    const restore = () => {
      previouslyHidden.forEach((panel) => { panel.hidden = true; });
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
    window.setTimeout(restore, 1000);
  });

  const clearDialog = $("#clear-dialog");
  $("#clear-journal")?.addEventListener("click", () => {
    if (typeof clearDialog.showModal === "function") {
      clearDialog.showModal();
    } else if (window.confirm("건강수첩 기록을 모두 삭제할까요? 삭제 후 복구할 수 없습니다.")) {
      clearAllJournal();
    }
  });

  clearDialog?.addEventListener("close", () => {
    if (clearDialog.returnValue === "confirm") clearAllJournal();
  });

  function clearAllJournal() {
    journal = emptyJournal();
    if (storageAvailable) {
      try { localStorage.removeItem(JOURNAL_KEY); } catch (_error) { /* no-op */ }
    }
    Object.keys(journalConfig).forEach(resetEntryForm);
    renderJournal();
    announceSave("건강수첩 기록을 모두 삭제했습니다.");
  }

  renderJournal();
})();

