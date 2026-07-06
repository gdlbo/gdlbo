import "material/button/text-button.js";
import { Button } from "material/button/internal/button.js";
import { copy } from "./copy.js";

Button.prototype.handleSlotChange = function handleSlotChange() {
  const slot = this.renderRoot?.querySelector?.('slot[name="icon"]');
  const assignedIcons = slot?.assignedElements?.({ flatten: true }) ?? [];
  this.hasIcon = assignedIcons.length > 0;
};

const textNodes = Array.from(document.querySelectorAll("[data-i18n]"));
const ariaLabelNodes = Array.from(document.querySelectorAll("[data-i18n-aria-label]"));
const altNodes = Array.from(document.querySelectorAll("[data-i18n-alt]"));
const contentNodes = Array.from(document.querySelectorAll("[data-i18n-content]"));

const languageToggle = document.getElementById("languageToggle");
const languageStateNode = document.querySelector("[data-language-state]");
const themeToggle = document.getElementById("themeToggle");
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

if (languageToggle) {
  languageToggle.addEventListener("click", () => {
    currentLanguage = currentLanguage === "ru" ? "en" : "ru";
    localStorage.setItem("gdlbo-language", currentLanguage);
    applyLanguage(currentLanguage);
  });
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("gdlbo-theme", currentTheme);
    applyTheme(currentTheme);
  });
}

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
  document.documentElement.dataset.language = language;

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

  if (languageToggle) {
    languageToggle.dataset.language = language;
    languageToggle.setAttribute("aria-pressed", String(language === "ru"));
  }

  if (languageStateNode) {
    languageStateNode.textContent = language.toUpperCase();
  }

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
  if (themeIconNode) {
    themeIconNode.textContent = currentTheme === "dark" ? "dark_mode" : "light_mode";
  }

  if (themeToggle) {
    themeToggle.setAttribute("aria-label", dictionary["utility.themeToggle"]);
  }

  if (languageToggle) {
    languageToggle.setAttribute("aria-label", dictionary["utility.languageSwitcher"]);
  }
}
