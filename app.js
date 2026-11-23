let domains;
let isCorrect;
let sets;
try {
  ({ domains, isCorrect } = await import("./shared.js"));
  ({ sets } = await import("./sets.js"));
} catch {
  document.getElementById("set-list").textContent = "The question sets did not load. Reload the page to try again.";
  throw new Error("question data failed to load");
}

const STORE_KEY = "ccdvf.progress.v2";
const $ = (id) => document.getElementById(id);
const letters = ["A", "B", "C", "D", "E"];
const blankAnswer = (q) => q.type === "matching" ? q.rows.map(() => null) : [];
const blankAnswers = (set) => set.questions.map(blankAnswer);
const domainName = (q) => q.domain < 0 ? "Free demo" : domains[q.domain];
const show = (id) => $(id).classList.remove("hidden");
const hide = (id) => $(id).classList.add("hidden");

const state = { set: null, index: 0, answers: [], finished: false, mode: "exam", checked: new Set() };
const hasSelection = (answer) => Array.isArray(answer) && answer.some((v) => v !== null && v !== undefined);

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
}
function writeStore(store) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch { }
}
function saveProgress() {
  if (!state.set) return;
  const store = readStore();
  store[state.set.id] = {
    index: state.index,
    answers: Object.fromEntries(state.set.questions.map((q, i) => [q.id, state.answers[i]])),
    finished: state.finished,
    mode: state.mode,
    checked: [...state.checked],
    updatedAt: Date.now(),
  };
  writeStore(store);
  const note = $("saved-note");
  if (note) note.textContent = `Saved · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}
function answeredCount(saved) {
  if (!saved || typeof saved.answers !== "object" || Array.isArray(saved.answers)) return 0;
  return Object.values(saved.answers).filter((a) => Array.isArray(a) && a.some((v) => v !== null)).length;
}

function renderSetList() {
  const store = readStore();
  $("brand-sets").textContent = `${sets.length} practice sets`;
  $("set-list").replaceChildren(...sets.map((set) => {
    const saved = store[set.id];
    const card = document.createElement("div");
    card.className = "set-card";
    const title = document.createElement("h2");
    title.textContent = set.title;
    const meta = document.createElement("div");
    meta.className = "meta";
    const count = document.createElement("span");
    count.className = "pill";
    count.textContent = `${set.questions.length} questions`;
    meta.append(count);
    if (set.source) {
      const sourced = document.createElement("span");
      const sep = document.createElement("span");
      sep.className = "meta-sep";
      sep.textContent = "·";
      sep.setAttribute("aria-hidden", "true");
      const source = document.createElement("a");
      source.className = "pill source";
      source.href = set.source.url;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = set.source.label;
      sourced.append(sep, " Sourced from ", source);
      meta.append(sourced);
    }
    const body = document.createElement("div");
    body.className = "set-body";
    body.append(title, meta);
    if (saved && !saved.finished) {
      const live = document.createElement("span");
      live.className = "pill live";
      live.textContent = `In progress · ${answeredCount(saved)} of ${set.questions.length} answered`;
      body.append(live);
    }
    const actions = document.createElement("div");
    actions.className = "set-actions";
    const inProgress = saved && !saved.finished;
    const savedMode = inProgress && saved.mode === "practice" ? "practice" : "exam";
    const action = (className, label, mode, resume) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = className;
      item.textContent = label;
      item.addEventListener("click", () => startSet(set, resume, mode));
      return item;
    };
    actions.append(action("start-button", inProgress ? "Resume" : "Start", savedMode, inProgress));
    actions.append(savedMode === "exam"
      ? action("secondary", "Practice with feedback", "practice", false)
      : action("secondary", "Start", "exam", false));
    if (inProgress) actions.append(action("link-button", "Start over", savedMode, false));
    card.append(body, actions);
    return card;
  }));
}

function startSet(set, resume, mode) {
  const target = mode === "practice" ? "practice" : "exam";
  const saved = resume ? readStore()[set.id] : null;
  const savedMode = saved && saved.mode === "practice" ? "practice" : "exam";
  const valid = saved && saved.answers && !Array.isArray(saved.answers) && savedMode === target;
  state.set = set;
  state.mode = target;
  state.answers = valid
    ? set.questions.map((q) => Array.isArray(saved.answers[q.id]) ? saved.answers[q.id] : blankAnswer(q))
    : blankAnswers(set);
  state.index = valid ? Math.min(saved.index, set.questions.length - 1) : 0;
  state.finished = false;
  state.checked = valid && Array.isArray(saved.checked) ? new Set(saved.checked) : new Set();
  hide("welcome");
  hide("results");
  show("exam");
  renderQuestion();
  saveProgress();
  window.scrollTo(0, 0);
}

function rationaleBlock(text) {
  const why = document.createElement("div");
  why.className = "rationale";
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const lead = document.createElement("p");
  const strong = document.createElement("strong");
  strong.textContent = "Why: ";
  lead.append(strong, document.createTextNode(lines[0] || ""));
  why.append(lead);
  lines.slice(1).forEach((line) => {
    const para = document.createElement("p");
    para.textContent = line;
    why.append(para);
  });
  return why;
}

function feedbackList(q, answer) {
  const list = document.createElement("div");
  list.className = "review-options";
  const tag = (label) => {
    const item = document.createElement("span");
    item.className = "review-tag";
    item.textContent = label;
    return item;
  };
  if (q.type === "matching") {
    q.rows.forEach((row, i) => {
      const chosen = answer[i];
      const item = document.createElement("div");
      item.className = `review-match ${chosen === row.answer ? "correct" : "wrong"}`;
      const text = document.createElement("span");
      text.textContent = row.text;
      const result = document.createElement("span");
      result.className = "review-match-result";
      const picked = document.createElement("span");
      picked.textContent = `Your answer: ${chosen === null || chosen === undefined ? "No answer" : q.categories[chosen]}`;
      const right = document.createElement("span");
      right.textContent = `Correct answer: ${q.categories[row.answer]}`;
      result.append(picked, right);
      item.append(text, result);
      list.append(item);
    });
  } else {
    q.options.forEach((text, i) => {
      const isAnswer = q.answer.includes(i);
      const wasSelected = answer.includes(i);
      const row = document.createElement("div");
      row.className = `review-option${isAnswer ? " correct-answer" : ""}${wasSelected ? " your-answer" : ""}`;
      const letter = document.createElement("span");
      letter.className = "review-letter";
      letter.textContent = letters[i];
      const copy = document.createElement("span");
      copy.className = "review-option-text";
      copy.textContent = text;
      row.append(letter, copy);
      if (isAnswer || wasSelected) {
        const tags = document.createElement("span");
        tags.className = "review-tags";
        if (isAnswer) tags.append(tag("Correct answer"));
        if (wasSelected) tags.append(tag("Your answer"));
        row.append(tags);
      }
      list.append(row);
    });
  }
  return list;
}

function updateCheck() {
  const answer = state.answers[state.index];
  $("check").disabled = !hasSelection(answer);
}

function resultNote(q, answer) {
  if (isCorrect(q, answer)) return "Correct.";
  if (q.type === "matching") return "Incorrect.";
  const right = [...q.answer].sort((a, b) => a - b).map((n) => letters[n]).join(", ");
  return `Incorrect. Correct answer: ${right}.`;
}

function renderQuestion() {
  const q = state.set.questions[state.index];
  const practice = state.mode === "practice";
  const revealed = practice && state.checked.has(state.index);
  $("domain-name").textContent = domainName(q);
  $("format-pill").textContent = q.type === "matching"
    ? q.format
    : q.type === "multi" ? "Multiple response · choose TWO" : "Multiple choice · select ONE";
  $("progress-label").textContent = `Question ${state.index + 1} of ${state.set.questions.length}`;
  $("progress-bar").style.width = `${(state.index + 1) / state.set.questions.length * 100}%`;
  const bar = $("progress-bar").parentElement;
  bar.setAttribute("aria-valuenow", state.index + 1);
  bar.setAttribute("aria-valuemax", state.set.questions.length);
  $("question-title").textContent = `Question ${q.id}`;
  $("question-prompt").textContent = q.prompt;
  $("exam-status").textContent = "";
  if (revealed) {
    $("options").replaceChildren(feedbackList(q, state.answers[state.index]));
    if (q.rationale) $("options").append(rationaleBlock(q.rationale));
  } else if (q.type === "matching") {
    const list = document.createElement("div");
    list.className = "match-list";
    q.rows.forEach((row, rowIndex) => {
      const item = document.createElement("div");
      item.className = "match-row";
      const text = document.createElement("p");
      text.textContent = row.text;
      const select = document.createElement("select");
      select.setAttribute("aria-label", `Question ${q.id}, item ${rowIndex + 1}`);
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select an answer";
      select.append(placeholder);
      q.categories.forEach((category, categoryIndex) => {
        const option = document.createElement("option");
        option.value = categoryIndex;
        option.textContent = category;
        select.append(option);
      });
      const selected = state.answers[state.index][rowIndex];
      select.value = selected === null || selected === undefined ? "" : String(selected);
      select.addEventListener("change", () => {
        state.answers[state.index][rowIndex] = select.value === "" ? null : Number(select.value);
        updateCheck();
        saveProgress();
      });
      item.append(text, select);
      list.append(item);
    });
    $("options").replaceChildren(list);
  } else {
    $("options").replaceChildren(...q.options.map((text, i) => {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = q.type === "multi" ? "checkbox" : "radio";
      input.name = `q-${q.id}`;
      input.value = i;
      input.checked = state.answers[state.index].includes(i);
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.textContent = `${letters[i]}.`;
      const copy = document.createElement("span");
      copy.className = "option-copy";
      copy.textContent = text;
      label.append(input, letter, copy);
      return label;
    }));
    $("options").querySelectorAll("input").forEach((input) => input.addEventListener("change", (event) => {
      const picked = [...$("options").querySelectorAll("input:checked")].map((item) => Number(item.value));
      if (q.type === "multi" && picked.length > 2) {
        event.currentTarget.checked = false;
        return;
      }
      state.answers[state.index] = q.type === "multi" ? picked : picked.slice(-1);
      const hint = document.querySelector(".pick-hint");
      if (hint) hint.textContent = `Selected ${state.answers[state.index].length} of 2.`;
      updateCheck();
      saveProgress();
    }));
    if (q.type === "multi") {
      const hint = document.createElement("p");
      hint.className = "answer-summary pick-hint";
      hint.setAttribute("aria-live", "polite");
      hint.textContent = `Selected ${state.answers[state.index].length} of 2.`;
      $("options").append(hint);
    }
  }
  $("previous").disabled = state.index === 0;
  const last = state.index === state.set.questions.length - 1;
  const gated = practice && !revealed;
  $("check").classList.toggle("hidden", !practice || revealed);
  $("next").classList.toggle("hidden", last || gated);
  $("finish").classList.toggle("hidden", !last || gated);
  if (practice && !revealed) updateCheck();
  $("saved-note").textContent = "Progress saves automatically.";
}

function finishSet() {
  const qs = state.set.questions;
  const correct = qs.reduce((sum, q, i) => sum + Number(isCorrect(q, state.answers[i])), 0);
  $("score").textContent = `${correct} / ${qs.length}`;
  $("score-caption").textContent = `${Math.round(correct / qs.length * 100)}% correct`;
  $("result-kind").textContent = `${state.set.title} complete`;
  const groupKeys = [...new Set(qs.map((q) => q.domain))].sort((a, b) => a - b);
  const groups = groupKeys.map((key) => qs.find((q) => q.domain === key)).map(domainName);
  $("score-breakdown-heading").textContent = groups.length === 1 ? "Score" : "Score by domain";
  $("domain-results").replaceChildren(...groups.map((name) => {
    const rows = qs.map((q, i) => ({ q, i })).filter(({ q }) => domainName(q) === name);
    const count = rows.reduce((sum, { q, i }) => sum + Number(isCorrect(q, state.answers[i])), 0);
    const tr = document.createElement("tr");
    const label = document.createElement("td");
    label.textContent = name;
    const meter = document.createElement("span");
    meter.className = "meter";
    meter.style.setProperty("--value", `${(count / rows.length * 100).toFixed(2)}%`);
    meter.setAttribute("aria-hidden", "true");
    label.append(meter);
    const result = document.createElement("td");
    result.textContent = `${count} / ${rows.length}`;
    tr.append(label, result);
    return tr;
  }));
  state.finished = true;
  saveProgress();
  renderReview("all");
  hide("exam");
  show("results");
  window.scrollTo(0, 0);
}

function renderReview(filter) {
  const qs = state.set.questions;
  const rows = qs.map((q, i) => ({ q, i })).filter(({ q, i }) => filter === "all" || !isCorrect(q, state.answers[i]));
  $("review-list").replaceChildren(...rows.map(({ q, i }) => {
    const right = isCorrect(q, state.answers[i]);
    const card = document.createElement("article");
    card.className = `review${right ? "" : " wrong"}`;
    const top = document.createElement("div");
    top.className = "review-top";
    const title = document.createElement("strong");
    title.textContent = `Question ${q.id} · ${domainName(q)}${q.skill ? ` · ${q.skill}` : ""}`;
    const status = document.createElement("span");
    status.className = "status";
    status.textContent = right ? "Correct" : "Incorrect";
    top.append(title, status);
    const prompt = document.createElement("p");
    prompt.className = "review-prompt";
    prompt.textContent = q.prompt;
    card.append(top, prompt, feedbackList(q, state.answers[i]));
    if (q.rationale) card.append(rationaleBlock(q.rationale));
    if (q.note) {
      const note = document.createElement("div");
      note.className = "source-note";
      note.textContent = q.note;
      card.append(note);
    }
    return card;
  }));
}

function backToSets() {
  state.set = null;
  state.answers = [];
  state.index = 0;
  state.finished = false;
  state.mode = "exam";
  state.checked = new Set();
  renderSetList();
  hide("exam");
  hide("results");
  show("welcome");
  window.scrollTo(0, 0);
}

$("check").addEventListener("click", () => {
  state.checked.add(state.index);
  renderQuestion();
  saveProgress();
  $("exam-status").textContent = resultNote(state.set.questions[state.index], state.answers[state.index]);
  const advance = $("next").classList.contains("hidden") ? $("finish") : $("next");
  advance.focus();
});

$("previous").addEventListener("click", () => {
  state.index--;
  renderQuestion();
  saveProgress();
  $("question-title").focus({ preventScroll: true });
});
$("next").addEventListener("click", () => {
  state.index++;
  renderQuestion();
  saveProgress();
  window.scrollTo(0, 0);
  $("question-title").focus({ preventScroll: true });
});
$("finish").addEventListener("click", finishSet);
$("exit").addEventListener("click", () => { saveProgress(); backToSets(); });
$("restart").addEventListener("click", backToSets);
$("clear-progress").addEventListener("click", () => {
  if (!confirm("Clear all saved progress? This cannot be undone.")) return;
  try { localStorage.removeItem(STORE_KEY); } catch { }
  renderSetList();
});
document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll("[data-filter]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
  renderReview(button.dataset.filter);
}));

renderSetList();
