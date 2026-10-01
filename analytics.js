const isLocalPreview = ["localhost", "127.0.0.1", ""].includes(window.location.hostname);

if (!isLocalPreview) {
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  const analyticsScript = document.createElement("script");
  analyticsScript.defer = true;
  analyticsScript.src = "/_vercel/insights/script.js";
  document.head.append(analyticsScript);
}
