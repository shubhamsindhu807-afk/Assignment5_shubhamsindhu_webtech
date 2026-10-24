// Task 3 — Character creator with live, accessible validation
const TAKEN_CHARACTER_NAMES = ["Astra", "Rook", "Nova", "Echo"];
const CLASS_MINIMUMS = {
  Warrior: { skill: "strength", minimum: 5 },
  Mage: { skill: "magic", minimum: 5 },
  Ranger: { skill: "agility", minimum: 5 }
};
const SKILL_NAMES = ["strength", "magic", "agility", "stamina"];
const form = document.querySelector("#character-form");
form.noValidate = true;

const nameInput = document.querySelector("#character-name");
const classInput = document.querySelector("#character-class");
const colorInput = document.querySelector("#character-color");
const skillInputs = Object.fromEntries(SKILL_NAMES.map((skill) => [skill, document.querySelector(`#skill-${skill}`)]));
const errorSummary = document.querySelector("#form-error-summary");
const pointsCounter = document.querySelector("#points-counter");
const skillsTotalError = document.querySelector("#skills-total-error");
const preview = document.querySelector("#character-preview");
const createdResult = document.querySelector("#created-result");
let touchedFields = new Set();
let lastCreatedNumber = 0;

const fields = [
  { input: nameInput, error: document.querySelector("#character-name-error"), key: "name" },
  { input: classInput, error: document.querySelector("#character-class-error"), key: "class" },
  { input: colorInput, error: document.querySelector("#character-color-error"), key: "color" },
  ...SKILL_NAMES.map((skill) => ({ input: skillInputs[skill], error: document.querySelector(`#skill-${skill}-error`), key: skill }))
];

function readSkills() {
  return Object.fromEntries(SKILL_NAMES.map((skill) => [skill, Number(skillInputs[skill].value)]));
}

function totalSkillPoints(skills) {
  let total = 0;
  for (const skill of SKILL_NAMES) total += skills[skill];
  return total;
}

function validateField(field) {
  const value = field.input.value.trim();
  let message = "";
  if (field.key === "name") {
    if (value.length < 2) message = "Enter at least 2 characters.";
    else if (TAKEN_CHARACTER_NAMES.some((taken) => taken.toLowerCase() === value.toLowerCase())) message = "That name is already taken. Choose another name.";
  } else if (field.key === "class" && value === "") {
    message = "Choose a character class.";
  } else if (field.key === "color" && value === "") {
    message = "Choose a card color.";
  } else if (SKILL_NAMES.includes(field.key)) {
    const number = Number(field.input.value);
    if (field.input.value === "" || !Number.isInteger(number) || number < 1 || number > 10) {
      message = "Enter a whole number from 1 to 10.";
    }
  }
  field.error.textContent = message;
  field.input.classList.toggle("invalid-field", Boolean(message));
  field.input.setAttribute("aria-invalid", message ? "true" : "false");
  return message;
}

function validateCrossFieldRules() {
  const skills = readSkills();
  const total = totalSkillPoints(skills);
  const totalMessage = total === 20 ? "" : `Skills must total exactly 20 points. Current total: ${total}.`;
  skillsTotalError.textContent = totalMessage;
  pointsCounter.textContent = `Points used: ${total} / 20`;
  pointsCounter.classList.toggle("is-invalid", Boolean(totalMessage));

  const selectedClass = classInput.value;
  const rule = CLASS_MINIMUMS[selectedClass];
  let classMessage = "";
  if (rule && Number.isInteger(skills[rule.skill]) && skills[rule.skill] < rule.minimum) {
    classMessage = `${selectedClass} requires ${rule.skill} ${rule.minimum} or higher.`;
    const classField = fields.find((field) => field.key === "class");
    classField.error.textContent = classMessage;
    classInput.classList.add("invalid-field");
    classInput.setAttribute("aria-invalid", "true");
  } else if (selectedClass !== "" && classInput.getAttribute("aria-invalid") === "true" &&
      classInput.value !== "" && classInput.value === selectedClass) {
    const classField = fields.find((field) => field.key === "class");
    if (classField.error.textContent.includes("requires")) {
      classField.error.textContent = "";
      classInput.classList.remove("invalid-field");
      classInput.setAttribute("aria-invalid", "false");
    }
  }
  return [totalMessage, classMessage].filter(Boolean);
}

function updatePreview() {
  const name = nameInput.value.trim();
  const selectedClass = classInput.value;
  const skills = readSkills();
  document.querySelector("#preview-name").textContent = name || "Your character";
  document.querySelector("#preview-class").textContent = selectedClass || "Choose a class";
  document.querySelector("#preview-initial").textContent = name ? name.charAt(0).toUpperCase() : "?";
  for (const skill of SKILL_NAMES) {
    document.querySelector(`#preview-${skill}`).textContent = skillInputs[skill].value || "—";
  }
  document.querySelector("#preview-total").textContent = `${totalSkillPoints(skills)} skill points`;
  preview.className = `character-card character-${colorInput.value}`;
}

function refreshTouchedErrors() {
  for (const field of fields) {
    if (touchedFields.has(field.key)) validateField(field);
  }
  validateCrossFieldRules();
  updatePreview();
}

function validateAll() {
  let errors = [];
  for (const field of fields) {
    const message = validateField(field);
    if (message) errors.push({ input: field.input, message });
  }
  const crossErrors = validateCrossFieldRules();
  if (crossErrors.length) errors.push({ input: crossErrors[0].includes("requires") ? classInput : skillInputs.strength, message: crossErrors[0] });
  // Include the skill total as a single form-level error, without duplicating it for every skill.
  return errors;
}

for (const field of fields) {
  field.input.addEventListener("blur", () => {
    touchedFields.add(field.key);
    validateField(field);
    validateCrossFieldRules();
  });
  field.input.addEventListener("input", () => {
    touchedFields.add(field.key);
    createdResult.textContent = "";
    errorSummary.hidden = true;
    refreshTouchedErrors();
  });
  field.input.addEventListener("change", () => {
    touchedFields.add(field.key);
    validateField(field);
    validateCrossFieldRules();
    updatePreview();
  });
}

form.addEventListener("input", () => {
  createdResult.textContent = "";
  updatePreview();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const errors = validateAll();
  if (errors.length > 0) {
    errorSummary.textContent = `${errors.length} issue${errors.length === 1 ? "" : "s"} found. Fix the messages below and submit again.`;
    errorSummary.hidden = false;
    errors[0].input.focus();
    return;
  }

  errorSummary.hidden = true;
  lastCreatedNumber += 1;
  const confirmation = document.createElement("section");
  confirmation.className = "character-card character-" + colorInput.value;
  const heading = document.createElement("h3");
  heading.textContent = nameInput.value.trim();
  const classText = document.createElement("p");
  classText.textContent = `Class: ${classInput.value}`;
  const skillText = document.createElement("p");
  const skills = readSkills();
  skillText.textContent = SKILL_NAMES.map((skill) => `${skill}: ${skills[skill]}`).join(" · ");
  const numberText = document.createElement("p");
  numberText.textContent = `Character confirmation #${String(lastCreatedNumber).padStart(4, "0")}`;
  confirmation.append(heading, classText, skillText, numberText);
  createdResult.replaceChildren(confirmation);
  createdResult.className = "created-result is-success";
  form.reset();
  touchedFields = new Set();
  for (const field of fields) {
    field.error.textContent = "";
    field.input.classList.remove("invalid-field");
    field.input.setAttribute("aria-invalid", "false");
  }
  skillsTotalError.textContent = "";
  pointsCounter.textContent = "Points used: 20 / 20";
  pointsCounter.classList.remove("is-invalid");
  updatePreview();
});

updatePreview();
