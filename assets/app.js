(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const todayISO = () => toISODate(new Date());
  const toast = $("#toast");
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function toISODate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function fromISODate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }

  function formatDate(value, options = { year: "numeric", month: "long", day: "numeric", weekday: "short" }) {
    const date = fromISODate(value);
    return date ? new Intl.DateTimeFormat("ko-KR", options).format(date) : value;
  }

  // Navigation
  const menuToggle = $("#menu-toggle");
  const navigation = $("#primary-navigation");
  menuToggle?.addEventListener("click", () => {
    const next = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(next));
    navigation.dataset.open = String(next);
  });
  $$("#primary-navigation a").forEach((link) => link.addEventListener("click", () => {
    $$("#primary-navigation details").forEach((item) => item.removeAttribute("open"));
    menuToggle?.setAttribute("aria-expanded", "false");
    if (navigation) navigation.dataset.open = "false";
  }));
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#primary-navigation")) $$("#primary-navigation details").forEach((item) => item.removeAttribute("open"));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    $$("#primary-navigation details").forEach((item) => item.removeAttribute("open"));
    speechSynthesis?.cancel();
  });

  // Accessibility preferences and speech
  const PREFS_KEY = "boneCarePrefs.v1";
  const fontButtons = $$('[data-font-size]');
  function setFontSize(size, save = true) {
    const next = ["normal", "large", "xlarge"].includes(size) ? size : "normal";
    document.body.dataset.fontSize = next;
    fontButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.fontSize === next)));
    if (save) try { localStorage.setItem(PREFS_KEY, JSON.stringify({ fontSize: next })); } catch (_error) { /* visual setting remains active */ }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
    setFontSize(saved?.fontSize || "normal", false);
  } catch (_error) { setFontSize("normal", false); }
  fontButtons.forEach((button) => button.addEventListener("click", () => setFontSize(button.dataset.fontSize)));

  const speakButton = $("#speak-button");
  const speakStop = $("#speak-stop");
  if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
    speakButton.hidden = false;
    speakStop.hidden = false;
    speakButton.addEventListener("click", () => {
      const text = $("#main-content")?.innerText?.replace(/\s+/g, " ").trim();
      if (!text) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ko-KR";
      utterance.rate = .92;
      const koreanVoice = speechSynthesis.getVoices().find((voice) => voice.lang?.toLowerCase().startsWith("ko"));
      if (koreanVoice) utterance.voice = koreanVoice;
      utterance.onstart = () => showToast("현재 페이지를 읽고 있어요.");
      utterance.onend = () => showToast("읽기를 마쳤어요.");
      speechSynthesis.speak(utterance);
    });
    speakStop.addEventListener("click", () => { speechSynthesis.cancel(); showToast("읽기를 멈췄어요."); });
  }

  // Risk check
  const riskForm = $("#risk-form");
  const bmiOutput = $("#bmi-output");
  const bmiError = $("#bmi-error");
  const riskError = $("#risk-error");
  const riskResult = $("#risk-result");
  const riskLabels = {
    "risk-age": "연령", "risk-fracture": "50세 이후 골절", bmi: "BMI 19 미만",
    "risk-height-loss": "키 감소", "risk-parent": "부모의 고관절 골절",
    "risk-condition": "관련 질환·상태", "risk-medication": "장기 복용 약물", "risk-lifestyle": "흡연·음주"
  };

  function calculateBMI(showError = false) {
    if (!riskForm) return { state: "unused" };
    const heightText = riskForm.elements.height.value.trim();
    const weightText = riskForm.elements.weight.value.trim();
    bmiError.hidden = true;
    if (!heightText && !weightText) {
      bmiOutput.textContent = "BMI —";
      return { state: "missing" };
    }
    const height = Number(heightText);
    const weight = Number(weightText);
    if (!heightText || !weightText || !Number.isFinite(height) || !Number.isFinite(weight) || height < 80 || height > 250 || weight < 20 || weight > 300) {
      bmiOutput.textContent = "BMI —";
      if (showError) {
        bmiError.textContent = "키는 80~250cm, 체중은 20~300kg 범위로 모두 입력해 주세요.";
        bmiError.hidden = false;
      }
      return { state: "invalid" };
    }
    const bmi = weight / ((height / 100) ** 2);
    bmiOutput.textContent = `BMI ${bmi.toFixed(1)}${bmi < 19 ? " · 저체중 범위" : ""}`;
    return { state: "valid", value: bmi };
  }
  [$("#height-cm"), $("#weight-kg")].forEach((input) => input?.addEventListener("input", () => calculateBMI(false)));

  ["condition", "medication"].forEach((category) => {
    const checkboxes = $$(`[name="risk-${category}"]`, riskForm || document);
    const status = $$(`[name="risk-${category}-status"]`, riskForm || document);
    checkboxes.forEach((box) => box.addEventListener("change", () => {
      if (box.checked) status.forEach((radio) => { radio.checked = false; });
    }));
    status.forEach((radio) => radio.addEventListener("change", () => {
      if (radio.checked) checkboxes.forEach((box) => { box.checked = false; });
    }));
  });

  riskForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    riskError.hidden = true;
    const missing = [];
    const positives = [];
    const unknowns = [];
    ["risk-age", "risk-fracture", "risk-height-loss", "risk-parent", "risk-lifestyle"].forEach((name) => {
      const answer = riskForm.elements[name].value;
      if (!answer) missing.push(riskLabels[name]);
      else if (answer === "yes") positives.push(riskLabels[name]);
      else if (answer === "unknown") unknowns.push(riskLabels[name]);
    });
    const bmi = calculateBMI(true);
    if (bmi.state !== "valid") missing.push("키·체중");
    else if (bmi.value < 19) positives.push(riskLabels.bmi);

    ["condition", "medication"].forEach((category) => {
      const selected = $$(`[name="risk-${category}"]:checked`, riskForm).map((input) => input.value);
      const status = riskForm.elements[`risk-${category}-status`].value;
      if (selected.length) positives.push(riskLabels[`risk-${category}`]);
      else if (!status) missing.push(riskLabels[`risk-${category}`]);
      else if (status === "unknown") unknowns.push(riskLabels[`risk-${category}`]);
    });
    if (missing.length) {
      riskError.textContent = `응답을 확인해 주세요: ${missing.join(", ")}`;
      riskError.hidden = false;
      riskError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    let heading = "현재 확인된 위험요인이 없습니다";
    let message = "정기 검진과 안전한 생활습관을 이어가세요. 새로운 위험요인이 생기면 의료진과 상담하세요.";
    let level = "low";
    if (positives.length === 1) {
      heading = "상담해 볼 위험요인이 1개 있습니다";
      message = "다음 진료에서 해당 항목을 의료진에게 알려 주세요.";
      level = "moderate";
    } else if (positives.length >= 2) {
      heading = `상담해 볼 위험요인이 ${positives.length}개 있습니다`;
      message = "골밀도 검사 필요 여부와 골절 위험을 의료진과 상담하는 것을 권합니다.";
      level = "high";
    }
    riskResult.className = `result-panel ${level}`;
    riskResult.innerHTML = `<h3>${heading}</h3><p>${message}</p>${positives.length ? `<p><strong>해당 항목:</strong> ${positives.map(escapeHtml).join(", ")}</p>` : ""}${unknowns.length ? `<p><strong>확인이 필요한 항목:</strong> ${unknowns.map(escapeHtml).join(", ")}</p>` : ""}<p><strong>이 결과는 진단이나 골절 확률이 아닙니다.</strong> 결과만으로 약물 사용을 시작·중단·변경하지 마세요.</p>`;
    riskResult.hidden = false;
    riskResult.focus({ preventScroll: true });
    riskResult.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  riskForm?.addEventListener("reset", () => setTimeout(() => {
    bmiOutput.textContent = "BMI —";
    bmiError.hidden = true; riskError.hidden = true; riskResult.hidden = true; riskResult.innerHTML = "";
  }, 0));

  // Knowledge check
  const quizForm = $("#knowledge-form");
  const quizError = $("#quiz-error");
  const quizResult = $("#quiz-result");
  quizForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    quizError.hidden = true;
    const questions = $$("fieldset", quizForm);
    const unanswered = questions.filter((_question, index) => !quizForm.elements[`quiz-${index + 1}`].value);
    if (unanswered.length) {
      quizError.textContent = `답하지 않은 문항이 ${unanswered.length}개 있습니다. 모든 문항에 답해 주세요.`;
      quizError.hidden = false;
      unanswered[0].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    let correct = 0;
    questions.forEach((question, index) => {
      const answer = quizForm.elements[`quiz-${index + 1}`].value;
      const isCorrect = answer === question.dataset.answer;
      if (isCorrect) correct += 1;
      const feedback = $(".quiz-feedback", question);
      feedback.innerHTML = `<strong>${isCorrect ? "정답입니다." : "다시 확인해 보세요."}</strong> ${escapeHtml(feedback.dataset.explanation)}${isCorrect ? "" : ` <a href="${question.dataset.learn}">관련 내용 보기</a>`}`;
      feedback.hidden = false;
    });
    quizResult.className = `result-panel ${correct === questions.length ? "low" : "moderate"}`;
    quizResult.innerHTML = `<h3>${correct} / ${questions.length}문항을 맞혔어요</h3><p>${correct === questions.length ? "안전수칙을 잘 이해하셨습니다. 실제 투여 전에는 나의 제품 설명서를 한 번 더 확인하세요." : "틀린 문항의 설명과 다시 학습할 페이지를 확인해 보세요."}</p>`;
    quizResult.hidden = false;
    quizResult.focus({ preventScroll: true });
    quizResult.scrollIntoView({ behavior: "smooth", block: "center" });
  });
  quizForm?.addEventListener("reset", () => setTimeout(() => {
    quizError.hidden = true; quizResult.hidden = true; quizResult.innerHTML = "";
    $$(".quiz-feedback", quizForm).forEach((feedback) => { feedback.hidden = true; feedback.innerHTML = ""; });
  }, 0));

  // Private local journal and schedule
  const JOURNAL_KEY = "boneCareJournal.v1";
  const emptyJournal = () => ({ version: 1, schedules: [], injections: [], reactions: [], visits: [] });
  let journal = emptyJournal();
  let storageAvailable = true;
  try {
    const probe = "__boneCareStorageTest";
    localStorage.setItem(probe, "1"); localStorage.removeItem(probe);
  } catch (_error) { storageAvailable = false; }

  if (storageAvailable) {
    try {
      const saved = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "null");
      if (saved && typeof saved === "object") {
        journal = {
          version: 1,
          schedules: Array.isArray(saved.schedules) ? saved.schedules : [],
          injections: Array.isArray(saved.injections) ? saved.injections : [],
          reactions: Array.isArray(saved.reactions) ? saved.reactions : [],
          visits: Array.isArray(saved.visits) ? saved.visits : []
        };
      }
    } catch (_error) { journal = emptyJournal(); }
  }
  if (!storageAvailable && $("#storage-warning")) $("#storage-warning").hidden = false;

  function persistJournal(message = "이 기기에 저장했습니다.") {
    if (storageAvailable) {
      try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal)); }
      catch (_error) { storageAvailable = false; if ($("#storage-warning")) $("#storage-warning").hidden = false; }
    }
    const status = $("#save-status");
    if (status) status.textContent = storageAvailable ? message : "브라우저 저장소를 사용할 수 없어 현재 접속 중에만 유지됩니다.";
    showToast(storageAvailable ? message : "일시 저장 모드입니다.");
    renderDataViews();
  }

  function scheduleOccurs(schedule, dateISO) {
    if (!schedule?.startDate || dateISO < schedule.startDate) return false;
    if (schedule.endDate && dateISO > schedule.endDate) return false;
    return schedule.repeat === "once" ? dateISO === schedule.startDate : schedule.repeat === "daily";
  }
  const injectionsOn = (dateISO) => journal.injections.filter((record) => record.date === dateISO);
  const schedulesOn = (dateISO) => journal.schedules.filter((record) => scheduleOccurs(record, dateISO));

  function dayStatus(dateISO) {
    if (injectionsOn(dateISO).length) return "complete";
    if (!schedulesOn(dateISO).length) return "";
    return dateISO < todayISO() ? "missed" : "planned";
  }

  function nextDose() {
    const cursor = fromISODate(todayISO());
    for (let index = 0; index <= 730; index += 1) {
      const dateISO = toISODate(cursor);
      if (schedulesOn(dateISO).length && !injectionsOn(dateISO).length) return { dateISO, schedules: schedulesOn(dateISO) };
      cursor.setDate(cursor.getDate() + 1);
    }
    return null;
  }

  const calendars = $$('[data-calendar]');
  calendars.forEach((calendar) => {
    const now = new Date();
    calendar._viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
    calendar._selectedDate = todayISO();
    $("[data-calendar-prev]", calendar)?.addEventListener("click", () => { calendar._viewDate.setMonth(calendar._viewDate.getMonth() - 1); renderCalendar(calendar); });
    $("[data-calendar-next]", calendar)?.addEventListener("click", () => { calendar._viewDate.setMonth(calendar._viewDate.getMonth() + 1); renderCalendar(calendar); });
    $("[data-calendar-today]", calendar)?.addEventListener("click", () => { const today = new Date(); calendar._viewDate = new Date(today.getFullYear(), today.getMonth(), 1); calendar._selectedDate = todayISO(); renderCalendar(calendar); });
  });

  function renderCalendar(calendar) {
    const view = calendar._viewDate || new Date();
    const year = view.getFullYear();
    const month = view.getMonth();
    const title = $("[data-calendar-title]", calendar);
    const grid = $("[data-calendar-grid]", calendar);
    if (!grid) return;
    if (title) title.textContent = `${year}년 ${month + 1}월`;
    const first = new Date(year, month, 1);
    const cursor = new Date(year, month, 1 - first.getDay());
    grid.innerHTML = "";
    for (let index = 0; index < 42; index += 1) {
      const iso = toISODate(cursor);
      const status = dayStatus(iso);
      const button = document.createElement("button");
      button.type = "button";
      button.className = ["calendar-day", cursor.getMonth() !== month ? "outside" : "", iso === todayISO() ? "today" : "", iso === calendar._selectedDate ? "selected" : "", status].filter(Boolean).join(" ");
      button.dataset.date = iso;
      button.setAttribute("role", "gridcell");
      button.setAttribute("aria-label", `${formatDate(iso)}${status === "planned" ? ", 주사 예정" : status === "complete" ? ", 주사 완료" : status === "missed" ? ", 미기록" : ""}`);
      if (iso === calendar._selectedDate) button.setAttribute("aria-selected", "true");
      button.textContent = String(cursor.getDate());
      button.addEventListener("click", () => {
        calendar._selectedDate = iso;
        if (cursor.getMonth() !== month) calendar._viewDate = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
        renderCalendar(calendar);
      });
      grid.append(button);
      cursor.setDate(cursor.getDate() + 1);
    }
    if (calendar.dataset.calendar === "journal") renderSelectedDay(calendar._selectedDate);
    const next = $("[data-next-dose]", calendar);
    if (next) {
      const upcoming = nextDose();
      next.innerHTML = upcoming ? `<strong>다음 예정</strong><p>${formatDate(upcoming.dateISO)}${upcoming.schedules[0].time ? ` ${escapeHtml(upcoming.schedules[0].time)}` : ""} · ${escapeHtml(upcoming.schedules[0].product)}</p>` : "<strong>다음 예정</strong><p>등록된 일정이 없어요.</p>";
    }
  }

  function renderSelectedDay(dateISO) {
    const detail = $("#calendar-day-detail");
    if (!detail) return;
    const plans = schedulesOn(dateISO);
    const done = injectionsOn(dateISO);
    const planText = plans.length ? plans.map((item) => `${item.time || "시간 미지정"} · ${escapeHtml(item.product)}`).join("<br>") : "예정 없음";
    const doneText = done.length ? done.map((item) => `${item.time || "시간 미기록"} · ${escapeHtml(item.product)} · ${escapeHtml(item.site)}`).join("<br>") : "투약 기록 없음";
    detail.innerHTML = `<h3>${formatDate(dateISO)}</h3><p><strong>예정:</strong> ${planText}</p><p><strong>완료:</strong> ${doneText}</p>`;
  }

  const scheduleForm = $("#schedule-form");
  const scheduleList = $("#schedule-list");
  if (scheduleForm) scheduleForm.elements.startDate.value = todayISO();
  scheduleForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!scheduleForm.reportValidity()) return;
    const values = Object.fromEntries(new FormData(scheduleForm));
    if (values.endDate && values.endDate < values.startDate) {
      scheduleForm.elements.endDate.setCustomValidity("종료일은 시작일 이후여야 합니다.");
      scheduleForm.elements.endDate.reportValidity();
      return;
    }
    scheduleForm.elements.endDate.setCustomValidity("");
    const id = values["record-id"] || newId();
    const record = { id, startDate: values.startDate, time: values.time || "", repeat: values.repeat, endDate: values.endDate || "", product: values.product, note: values.note?.trim() || "" };
    const existing = journal.schedules.findIndex((item) => item.id === id);
    if (existing >= 0) journal.schedules[existing] = record; else journal.schedules.push(record);
    journal.schedules.sort((a, b) => a.startDate.localeCompare(b.startDate));
    resetScheduleForm();
    persistJournal(existing >= 0 ? "일정을 수정했습니다." : "주사 일정을 저장했습니다.");
  });
  scheduleForm?.elements.endDate.addEventListener("input", () => scheduleForm.elements.endDate.setCustomValidity(""));
  $(".cancel-schedule-edit")?.addEventListener("click", resetScheduleForm);

  function resetScheduleForm() {
    if (!scheduleForm) return;
    scheduleForm.reset();
    scheduleForm.elements["record-id"].value = "";
    scheduleForm.elements.startDate.value = todayISO();
    $("button[type=submit]", scheduleForm).textContent = "일정 저장";
    $(".cancel-schedule-edit", scheduleForm).hidden = true;
  }

  scheduleList?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const record = journal.schedules.find((item) => item.id === button.dataset.id);
    if (!record) return;
    if (button.dataset.action === "edit") {
      Object.entries(record).forEach(([key, value]) => { if (scheduleForm.elements[key]) scheduleForm.elements[key].value = value; });
      scheduleForm.elements["record-id"].value = record.id;
      $("button[type=submit]", scheduleForm).textContent = "수정 저장";
      $(".cancel-schedule-edit", scheduleForm).hidden = false;
      scheduleForm.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (button.dataset.action === "delete" && confirm("이 주사 일정을 삭제할까요? 투약 기록은 유지됩니다.")) {
      journal.schedules = journal.schedules.filter((item) => item.id !== record.id);
      persistJournal("일정을 삭제했습니다.");
    }
  });

  function renderSchedules() {
    if (!scheduleList) return;
    if (!journal.schedules.length) {
      scheduleList.innerHTML = '<p class="empty-state">아직 등록한 일정이 없어요.</p>';
      return;
    }
    scheduleList.innerHTML = journal.schedules.map((item) => `<article class="schedule-item"><header><div><h4>${escapeHtml(item.product)}</h4><p>${formatDate(item.startDate)}${item.endDate ? ` ~ ${formatDate(item.endDate)}` : item.repeat === "daily" ? "부터" : ""}</p></div><div class="item-actions"><button type="button" data-action="edit" data-id="${item.id}" aria-label="일정 수정">수정</button><button type="button" data-action="delete" data-id="${item.id}" aria-label="일정 삭제">삭제</button></div></header><p>${item.repeat === "daily" ? "매일" : "한 번만"}${item.time ? ` · ${escapeHtml(item.time)}` : ""}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</p></article>`).join("");
  }

  // Journal forms
  const recordConfigs = {
    injections: { form: $("#injection-form"), list: $("#injection-list"), title: (r) => `${r.date} · ${r.product}`, details: (r) => [`시간 ${r.time || "미기록"}`, `부위 ${r.site}`, r.note] },
    reactions: { form: $("#reaction-form"), list: $("#reaction-list"), title: (r) => `${r.date} · ${r.symptom}`, details: (r) => [`정도 ${r.severity}`, r.action ? `조치 ${r.action}` : "", r.note] },
    visits: { form: $("#visit-form"), list: $("#visit-list"), title: (r) => `${r.date} · ${r.purpose}`, details: (r) => [r.question ? `확인할 질문 ${r.question}` : "", r.note] }
  };
  if (recordConfigs.injections.form) recordConfigs.injections.form.elements.date.value = todayISO();
  if (recordConfigs.reactions.form) recordConfigs.reactions.form.elements.date.value = todayISO();
  if (recordConfigs.visits.form) recordConfigs.visits.form.elements.date.value = todayISO();

  Object.entries(recordConfigs).forEach(([type, config]) => {
    const form = config.form;
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form));
      const id = values["record-id"] || newId();
      delete values["record-id"];
      const record = { id };
      Object.entries(values).forEach(([key, value]) => { record[key] = String(value).trim(); });
      const existing = journal[type].findIndex((item) => item.id === id);
      if (existing >= 0) journal[type][existing] = record; else journal[type].push(record);
      journal[type].sort((a, b) => `${b.date}${b.time || ""}`.localeCompare(`${a.date}${a.time || ""}`));
      resetRecordForm(type);
      persistJournal(existing >= 0 ? "기록을 수정했습니다." : "기록을 저장했습니다.");
    });
    $(".cancel-edit", form)?.addEventListener("click", () => resetRecordForm(type));
    config.list?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const record = journal[type].find((item) => item.id === button.dataset.id);
      if (!record) return;
      if (button.dataset.action === "edit") {
        Object.entries(record).forEach(([key, value]) => { if (form.elements[key]) form.elements[key].value = value; });
        form.elements["record-id"].value = record.id;
        $("button[type=submit]", form).textContent = "수정 저장";
        $(".cancel-edit", form).hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (button.dataset.action === "delete" && confirm("이 기록을 삭제할까요?")) {
        journal[type] = journal[type].filter((item) => item.id !== record.id);
        persistJournal("기록을 삭제했습니다.");
      }
    });
  });

  function resetRecordForm(type) {
    const form = recordConfigs[type].form;
    if (!form) return;
    form.reset();
    form.elements["record-id"].value = "";
    if (form.elements.date) form.elements.date.value = todayISO();
    $("button[type=submit]", form).textContent = "저장";
    $(".cancel-edit", form).hidden = true;
  }

  function renderRecords() {
    Object.entries(recordConfigs).forEach(([type, config]) => {
      const count = $(`[data-count="${type}"]`);
      if (count) count.textContent = journal[type].length;
      if (!config.list) return;
      if (!journal[type].length) {
        config.list.innerHTML = '<p class="empty-state">아직 저장한 기록이 없어요.</p>';
        return;
      }
      config.list.innerHTML = journal[type].map((record) => `<article class="entry-item"><header><div><h4>${escapeHtml(config.title(record))}</h4>${config.details(record).filter(Boolean).map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div><div class="item-actions"><button type="button" data-action="edit" data-id="${record.id}" aria-label="기록 수정">수정</button><button type="button" data-action="delete" data-id="${record.id}" aria-label="기록 삭제">삭제</button></div></header></article>`).join("");
    });
  }

  const tabButtons = $$('[data-journal-tab]');
  function selectTab(type, focus = false) {
    tabButtons.forEach((button) => {
      const active = button.dataset.journalTab === type;
      button.setAttribute("aria-selected", String(active)); button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus();
    });
    $$('[data-journal-panel]').forEach((panel) => { panel.hidden = panel.dataset.journalPanel !== type; });
  }
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => selectTab(button.dataset.journalTab));
    button.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const current = tabButtons.indexOf(button);
      const next = event.key === "Home" ? 0 : event.key === "End" ? tabButtons.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabButtons.length) % tabButtons.length;
      selectTab(tabButtons[next].dataset.journalTab, true);
    });
  });

  $("#prefill-injection")?.addEventListener("click", () => {
    const calendar = $('[data-calendar="journal"]');
    const selected = calendar?._selectedDate || todayISO();
    selectTab("injections");
    recordConfigs.injections.form.elements.date.value = selected;
    recordConfigs.injections.form.scrollIntoView({ behavior: "smooth", block: "center" });
    recordConfigs.injections.form.elements.product.focus();
  });

  function csvCell(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
  $("#export-journal")?.addEventListener("click", () => {
    const rows = [["구분", "날짜/시작일", "시간", "제품/증상/목적", "주사부위/정도", "반복/조치/질문", "종료일", "메모"]];
    journal.schedules.forEach((r) => rows.push(["주사 예정", r.startDate, r.time, r.product, "", r.repeat === "daily" ? "매일" : "한 번", r.endDate, r.note]));
    journal.injections.forEach((r) => rows.push(["투약", r.date, r.time, r.product, r.site, "", "", r.note]));
    journal.reactions.forEach((r) => rows.push(["이상반응", r.date, "", r.symptom, r.severity, r.action, "", r.note]));
    journal.visits.forEach((r) => rows.push(["병원 방문", r.date, "", r.purpose, "", r.question, "", r.note]));
    const blob = new Blob(["\ufeff" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `뼈튼튼-건강수첩-${todayISO()}.csv`; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $("#print-journal")?.addEventListener("click", () => window.print());

  const clearDialog = $("#clear-dialog");
  $("#clear-journal")?.addEventListener("click", () => {
    if (clearDialog?.showModal) clearDialog.showModal();
    else if (confirm("모든 주사 일정과 건강수첩 기록을 삭제할까요?")) clearAll();
  });
  clearDialog?.addEventListener("close", () => { if (clearDialog.returnValue === "confirm") clearAll(); });
  function clearAll() {
    journal = emptyJournal();
    if (storageAvailable) try { localStorage.removeItem(JOURNAL_KEY); } catch (_error) { /* already handled */ }
    resetScheduleForm(); Object.keys(recordConfigs).forEach(resetRecordForm);
    renderDataViews(); showToast("모든 일정을 포함한 건강수첩을 삭제했습니다.");
  }

  function renderDataViews() {
    renderSchedules(); renderRecords(); calendars.forEach(renderCalendar);
  }
  renderDataViews();
})();
