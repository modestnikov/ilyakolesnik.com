import { projects } from "./data/projects.js?v=20261003-outlines-path-1";
import "./analytics.js?v=20261001-1";

const page = document.querySelector(".project-page");
const slug = page?.dataset.projectSlug;
const project = projects.find((item) => item.slug === slug);
const socialDrawer = document.querySelector(".social-drawer");
const socialToggle = document.querySelector(".social-toggle");
const siteHeader = document.querySelector(".site-header");

const createTextBlock = (language, label, paragraphs) => {
  const section = document.createElement("section");
  const heading = document.createElement("h2");

  section.className = "project-language";
  section.lang = language;
  heading.textContent = label;
  section.append(heading);

  paragraphs.forEach((paragraph) => {
    const text = document.createElement("p");
    text.textContent = paragraph;
    section.append(text);
  });

  return section;
};

const createYouTubePanel = (videoData, title) => {
  const button = document.createElement(videoData.mode === "external" ? "a" : "button");
  const playIcon = document.createElement("span");
  const thumbnail = videoData.thumbnail || `https://img.youtube.com/vi/${videoData.id}/maxresdefault.jpg`;

  button.className = "project-youtube-button";
  if (videoData.mode === "external") {
    button.classList.add("is-external");
    button.href = videoData.url || `https://www.youtube.com/watch?v=${videoData.id}`;
    button.target = "_blank";
    button.rel = "noopener noreferrer";
  } else {
    button.type = "button";
  }
  button.style.setProperty("--youtube-thumbnail", `url(${thumbnail})`);
  button.setAttribute("aria-label", videoData.label || `Play ${title}`);
  button.append(playIcon);

  if (!videoData.thumbnail) {
    const fallbackThumbnail = new Image();

    fallbackThumbnail.onload = () => {
      button.style.setProperty("--youtube-thumbnail", `url(${fallbackThumbnail.src})`);
    };
    fallbackThumbnail.src = `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`;
  }

  if (videoData.mode !== "external") {
    button.addEventListener("click", () => {
      const frame = document.createElement("iframe");

      frame.src = `https://www.youtube.com/embed/${videoData.id}?autoplay=1&rel=0`;
      frame.title = title;
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;

      button.replaceWith(frame);
    });
  }

  return button;
};

const createInstagramPanel = (postData, title) => {
  const frame = document.createElement("iframe");

  frame.src = `https://www.instagram.com/p/${postData.id}/embed/`;
  frame.title = postData.label || title;
  frame.loading = "lazy";
  frame.allow = "fullscreen";
  frame.allowFullscreen = true;

  return frame;
};

const getMediaAspect = (asset) => {
  if (typeof asset === "object" && asset.aspect === "vertical") {
    return "vertical";
  }

  return "wide";
};

const getMediaCaption = (asset) => (
  typeof asset === "object" && asset.caption ? asset.caption : ""
);

const createFilterLink = (value) => {
  const anchor = document.createElement("a");

  anchor.className = "project-filter-link";
  anchor.href = `../../?tag=${encodeURIComponent(value)}#projects`;
  anchor.textContent = value;
  return anchor;
};

const createMediaElement = (asset, title, mediaVersion) => {
  if (typeof asset === "object" && asset.type === "youtube") {
    return createYouTubePanel(asset, title);
  }

  if (typeof asset === "object" && asset.type === "instagram") {
    return createInstagramPanel(asset, title);
  }

  const version = mediaVersion ? `?v=${encodeURIComponent(mediaVersion)}` : "";

  if (/\.(mp4|webm)$/i.test(asset)) {
    const video = document.createElement("video");

    video.src = `../../${asset}${version}`;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = true;
    return video;
  }

  const image = document.createElement("img");
  image.src = `../../${asset}${version}`;
  image.alt = title;
  return image;
};

const setupFreeGallery = (gallery) => {
  const items = [...gallery.querySelectorAll(".project-media-item")];
  let topLayer = items.length + 1;

  const seededValue = (index, salt) => {
    const value = Math.sin((index + 1) * 9283.17 + salt * 167.31) * 43758.5453;
    return value - Math.floor(value);
  };

  items.forEach((item, index) => {
    const isCompact = window.matchMedia("(max-width: 720px)").matches;
    const width = isCompact
      ? 24 + seededValue(index, 4) * 30
      : 10 + seededValue(index, 4) * 25;
    const left = seededValue(index, 1) * (100 - width);
    const top = Math.pow(seededValue(index, 2), 1.65) * 82;

    item.style.left = `${left}%`;
    item.style.top = `${top}%`;
    item.style.width = `${width}%`;
    item.style.zIndex = String(index + 1);
    item.querySelector("img")?.setAttribute("draggable", "false");

    item.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const galleryRect = gallery.getBoundingClientRect();
      const itemRect = item.getBoundingClientRect();
      const offsetX = event.clientX - itemRect.left;
      const offsetY = event.clientY - itemRect.top;

      topLayer += 1;
      item.style.zIndex = String(topLayer);
      item.classList.add("is-dragging");
      item.setPointerCapture(event.pointerId);

      const moveItem = (moveEvent) => {
        const maxLeft = Math.max(0, galleryRect.width - item.offsetWidth);
        const maxTop = Math.max(0, galleryRect.height - item.offsetHeight);
        const nextLeft = Math.min(maxLeft, Math.max(0, moveEvent.clientX - galleryRect.left - offsetX));
        const nextTop = Math.min(maxTop, Math.max(0, moveEvent.clientY - galleryRect.top - offsetY));

        item.style.left = `${nextLeft}px`;
        item.style.top = `${nextTop}px`;
      };

      const stopDragging = () => {
        item.classList.remove("is-dragging");
        item.removeEventListener("pointermove", moveItem);
        item.removeEventListener("pointerup", stopDragging);
        item.removeEventListener("pointercancel", stopDragging);
      };

      item.addEventListener("pointermove", moveItem);
      item.addEventListener("pointerup", stopDragging);
      item.addEventListener("pointercancel", stopDragging);
    });
  });
};

if (!page || !project) {
  const missing = document.createElement("p");
  missing.className = "project-missing";
  missing.textContent = "Project not found.";
  page?.append(missing);
} else {
  document.title = `${project.title} — Ilya Kolesnikov`;

  const intro = document.createElement("section");
  const title = document.createElement("h1");
  const details = document.createElement("dl");

  intro.className = "project-intro";
  if (project.titleLines?.length) {
    project.titleLines.forEach((line, index) => {
      if (index > 0) {
        title.append(document.createElement("br"));
      }

      title.append(line);
    });
  } else {
    title.textContent = project.title;
  }
  details.className = "project-details";

  const detailRows = [
    ["year", [project.year]],
    ["tags", project.tags],
    ["media", project.medium],
  ];

  detailRows.forEach(([label, values]) => {
    const visibleValues = values.filter(Boolean);

    if (!visibleValues.length) return;

    const term = document.createElement("dt");
    const description = document.createElement("dd");
    term.textContent = label;

    visibleValues.forEach((value, index) => {
      if (index > 0) {
        description.append(", ");
      }

      description.append(createFilterLink(value));
    });

    details.append(term, description);
  });

  if (project.links?.length) {
    const term = document.createElement("dt");
    const description = document.createElement("dd");

    term.textContent = "links";

    project.links.forEach((link, index) => {
      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.textContent = link.label || link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      if (index > 0) {
        description.append(", ");
      }

      description.append(anchor);
    });

    details.append(term, description);
  }

  intro.append(title, details);
  page.append(intro);

  const projectMedia = [
    ...(project.media?.length ? project.media : [project.cover].filter(Boolean)),
    ...(project.videos || []),
  ];

  if (projectMedia.length) {
    const figure = document.createElement("figure");
    figure.className = "project-hero";
    if (project.mediaLayout) {
      figure.dataset.layout = project.mediaLayout;
    }

    projectMedia.forEach((asset) => {
      const item = document.createElement("div");
      const assetVersion = asset === project.cover ? project.coverVersion : project.mediaVersion;
      const media = createMediaElement(asset, project.title, assetVersion);
      const captionText = getMediaCaption(asset);
      const entry = captionText ? document.createElement("div") : item;

      item.className = "project-media-item";
      item.dataset.aspect = getMediaAspect(asset);
      media.addEventListener("error", () => item.remove(), { once: true });
      item.append(media);

      if (captionText) {
        const caption = document.createElement("figcaption");

        entry.className = "project-media-entry";
        caption.className = "project-media-caption";
        caption.textContent = captionText;
        entry.append(item, caption);
      }

      figure.append(entry);
    });

    page.append(figure);

    if (project.mediaLayout === "free-gallery") {
      setupFreeGallery(figure);
    }
  }

  if (project.description.ru.length || project.description.en.length) {
    const copy = document.createElement("div");
    copy.className = "project-copy";

    if (project.description.ru.length) {
      copy.append(createTextBlock("ru", "RU", project.description.ru));
    }

    if (project.description.en.length) {
      copy.append(createTextBlock("en", "EN", project.description.en));
    }

    page.append(copy);
  }
}


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
    }
  });
}
