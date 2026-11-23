export const domains = [
  "Agents and Workflows",
  "Applications and Integration",
  "Claude Code",
  "Eval, Testing, and Debugging",
  "Model Selection and Optimization",
  "Prompt and Context Engineering",
  "Security and Safety",
  "Tools and MCPs",
];

export const one = (id, domain, prompt, options, answer, rationale = "") => ({
  id, domain, prompt, options, answer, rationale, type: "choice",
});

export const two = (id, domain, prompt, options, answer, rationale = "") => ({
  id, domain, prompt, options, answer, rationale, type: "multi",
});

export const classify = (id, domain, prompt, format, categories, rows, answers, rationale = "") => ({
  id, domain, prompt, format, categories, rationale, type: "matching",
  rows: rows.map((text, i) => ({ text, answer: answers[i] })),
});

export const defineSet = ({ id, title, source, questions }) => ({
  id, title, source, questions,
});

export function isCorrect(question, selected) {
  if (question.type === "matching") {
    return selected.length === question.rows.length &&
      selected.every((choice, i) => choice === question.rows[i].answer);
  }
  const choices = new Set(selected);
  return choices.size === question.answer.length &&
    [...choices].every((choice) => question.answer.includes(choice));
}
