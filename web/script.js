import "material/button/filled-button.js";
import "material/button/filled-tonal-button.js";
import "material/button/text-button.js";
import { Button } from "material/button/internal/button.js";
import "material/card/elevated-card.js";
import "material/chips/filter-chip.js";
import "material/divider/divider.js";
import { copy } from "./copy.js";

Button.prototype.handleSlotChange = function handleSlotChange() {
  const slot = this.renderRoot?.querySelector?.('slot[name="icon"]');
  const assignedIcons = slot?.assignedElements?.({ flatten: true }) ?? [];
  this.hasIcon = assignedIcons.length > 0;
};

const langButtons = Array.from(document.querySelectorAll("[data-lang]"));
const textNodes = Array.from(document.querySelectorAll("[data-i18n]"));
const ariaLabelNodes = Array.from(document.querySelectorAll("[data-i18n-aria-label]"));
const altNodes = Array.from(document.querySelectorAll("[data-i18n-alt]"));
const contentNodes = Array.from(document.querySelectorAll("[data-i18n-content]"));

const themeToggle = document.getElementById("themeToggle");
const themeStateNode = document.querySelector("[data-theme-state]");
const themeIconNode = document.querySelector("[data-theme-icon]");
const themeMeta = document.querySelector('meta[name="theme-color"]');

const themeColors = {
  light: "#f6ede4",
  dark: "#1b130f"
};

const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

let currentLanguage = resolveLanguage();
let currentTheme = resolveTheme();

applyLanguage(currentLanguage);
applyTheme(currentTheme);

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextLanguage = button.dataset.lang;
    if (!copy[nextLanguage] || nextLanguage === currentLanguage) {
      return;
    }

    currentLanguage = nextLanguage;
    localStorage.setItem("gdlbo-language", currentLanguage);
    applyLanguage(currentLanguage);
  });
});

themeToggle.addEventListener("click", () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("gdlbo-theme", currentTheme);
  applyTheme(currentTheme);
});

if (typeof colorSchemeQuery.addEventListener === "function") {
  colorSchemeQuery.addEventListener("change", () => {
    if (!localStorage.getItem("gdlbo-theme")) {
      currentTheme = resolveTheme();
      applyTheme(currentTheme);
    }
  });
}

function resolveLanguage() {
  const saved = localStorage.getItem("gdlbo-language");
  if (saved === "en" || saved === "ru") {
    return saved;
  }

  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

function resolveTheme() {
  const saved = localStorage.getItem("gdlbo-theme");
  if (saved === "light" || saved === "dark") {
    return saved;
  }

  return colorSchemeQuery.matches ? "dark" : "light";
}

function applyLanguage(language) {
  const dictionary = copy[language];
  document.documentElement.lang = language;

  textNodes.forEach((node) => {
    const key = node.dataset.i18n;
    const value = dictionary[key];
    if (value) {
      node.textContent = value;
    }
  });

  ariaLabelNodes.forEach((node) => {
    const key = node.dataset.i18nAriaLabel;
    const value = dictionary[key];
    if (value) {
      node.setAttribute("aria-label", value);
    }
  });

  altNodes.forEach((node) => {
    const key = node.dataset.i18nAlt;
    const value = dictionary[key];
    if (value) {
      node.setAttribute("alt", value);
    }
  });

  contentNodes.forEach((node) => {
    const key = node.dataset.i18nContent;
    const value = dictionary[key];
    if (value) {
      node.setAttribute("content", value);
    }
  });

  langButtons.forEach((button) => {
    const isActive = button.dataset.lang === language;
    button.selected = isActive;
    button.setAttribute("aria-pressed", String(isActive));
  });

  syncThemeCopy();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  if (themeMeta) {
    themeMeta.setAttribute("content", themeColors[theme]);
  }

  syncThemeCopy();
}

function syncThemeCopy() {
  const dictionary = copy[currentLanguage];
  if (themeStateNode) {
    themeStateNode.textContent = dictionary[`utility.themeState.${currentTheme}`];
  }

  if (themeIconNode) {
    themeIconNode.textContent = currentTheme === "dark" ? "dark_mode" : "light_mode";
  }

  themeToggle.setAttribute("aria-label", dictionary["utility.themeToggle"]);
}
