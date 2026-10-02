const languageButtons = [...document.querySelectorAll("[data-cv-language]")];
const languagePanels = [...document.querySelectorAll("[data-cv-panel]")];
const socialDrawer = document.querySelector(".social-drawer");
const socialToggle = document.querySelector(".social-toggle");
const siteHeader = document.querySelector(".site-header");

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.dataset.cvLanguage;

    languageButtons.forEach((item) => {
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });

    languagePanels.forEach((panel) => {
      panel.hidden = panel.dataset.cvPanel !== language;
    });
  });
});

if (socialDrawer && socialToggle) {
  const setSocialOpen = (isOpen) => {
    socialDrawer.classList.toggle("is-open", isOpen);
    siteHeader?.classList.toggle("menu-open", isOpen);
    socialToggle.setAttribute("aria-expanded", String(isOpen));
    socialToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  };

  socialToggle.setAttribute("aria-label", "Open menu");

  socialToggle.addEventListener("click", () => {
    setSocialOpen(!socialDrawer.classList.contains("is-open"));
  });

  document.addEventListener("click", (event) => {
    if (!socialDrawer.contains(event.target)) {
      setSocialOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setSocialOpen(false);
      socialToggle.focus();
    }
  });
}
