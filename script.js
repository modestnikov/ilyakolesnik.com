import { projects } from "./data/projects.js?v=20260929-white-cube-1";
import "./analytics.js?v=20261001-1";

const video = document.querySelector(".hero-video");
const projectGrid = document.querySelector(".project-grid");
const emptyState = document.querySelector(".empty-state");
const projectsSection = document.querySelector(".projects-section");
const tagsMarquee = document.querySelector(".tags-marquee");
const tagsMarqueeTrack = document.querySelector(".tags-marquee-track");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const navFilters = [...document.querySelectorAll(".nav-filter")];
const socialDrawer = document.querySelector(".social-drawer");
const socialToggle = document.querySelector(".social-toggle");
const siteHeader = document.querySelector(".site-header");

const shuffleProjects = (items) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
};

const publicProjects = projects.filter((project) => !project.hidden);
const shuffledProjects = shuffleProjects(publicProjects);

const filterAliases = {
  ai: ["ai", "ai-generated video", "ai generation", "kling", "seedance", "nano banana"],
  internet: ["internet", "web3", "nft", "crypto", "meme"],
};

const hoverVideoExtensions = {
  "ai-fragments": ["mp4"],
  "artist-is-absent": ["webm", "mp4"],
  bghvyn: ["webm", "mp4"],
  decerts: ["webm", "mp4"],
  "disziplin-caprice-a-sharp-min": ["mp4"],
  gettransfer: ["mp4"],
  "icon-is-loading": ["webm"],
  mamm: ["webm", "mp4"],
  mercuryo: ["webm", "mp4"],
  "motion-fragments": ["webm", "mp4"],
  "muzei-moskovskogo-kremlya": ["mp4"],
  "park-live-festival": ["mp4"],
  petix: ["webm", "mp4"],
  "pink-berets": ["mp4"],
  psb: ["mp4"],
  "reklama-media-arta": ["webm"],
  souper: ["mp4"],
  warmico: ["mp4"],
  wobbles: ["webm", "mp4"],
  yandex: ["mp4"],
};

const getProjectFilterTerms = (project) => [
  project.section,
  project.year,
  ...(project.sections || []),
  ...(project.tags || []),
  ...(project.medium || []),
].filter(Boolean).map((term) => term.toLowerCase());

const belongsToSection = (project, section) => {
  const terms = getProjectFilterTerms(project);

  if (filterAliases[section]) {
    return filterAliases[section].some((alias) => terms.includes(alias));
  }

  return terms.includes(section);
};

const belongsToTerm = (project, term) => getProjectFilterTerms(project).includes(term.toLowerCase());

const getCoverUrl = (project, asset = project.cover) => {
  const version = asset === project.cover && project.coverVersion
    ? `?v=${encodeURIComponent(project.coverVersion)}`
    : "";

  return `./${asset}${version}`;
};

const projectTags = [...new Set(
  publicProjects.flatMap((project) => [...project.tags, project.year]).filter(Boolean)
)];

const createTagSet = (isDuplicate = false) => {
  const set = document.createElement("div");
  set.className = "tags-marquee-set";

  if (isDuplicate) {
    set.setAttribute("aria-hidden", "true");
  }

  projectTags.forEach((tag) => {
    const item = document.createElement("a");
    const encodedTag = encodeURIComponent(tag);

    item.href = `${window.location.pathname}?tag=${encodedTag}#projects`;
    item.dataset.tag = tag;
    item.textContent = tag;

    if (isDuplicate) {
      item.tabIndex = -1;
    }

    set.append(item);
  });

  return set;
};

if (tagsMarqueeTrack) {
  tagsMarqueeTrack.replaceChildren(
    createTagSet(),
    createTagSet(true),
    createTagSet(true)
  );
}

if (tagsMarquee && tagsMarqueeTrack) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let isMarqueePaused = false;
  let previousFrameTime;

  const setMarqueeScroll = (nextPosition) => {
    const loopWidth = tagsMarqueeTrack.firstElementChild?.getBoundingClientRect().width ?? 0;

    if (loopWidth > 0) {
      tagsMarquee.scrollLeft = ((nextPosition % loopWidth) + loopWidth) % loopWidth;
    }
  };

  const animateMarquee = (frameTime) => {
    if (previousFrameTime === undefined) {
      previousFrameTime = frameTime;
    }

    if (!isMarqueePaused && !reducedMotion.matches) {
      const elapsed = Math.min(frameTime - previousFrameTime, 64);
      setMarqueeScroll(tagsMarquee.scrollLeft + elapsed * 0.06);
    }

    previousFrameTime = frameTime;
    window.requestAnimationFrame(animateMarquee);
  };

  tagsMarquee.addEventListener("mouseenter", () => {
    isMarqueePaused = true;
    tagsMarquee.classList.add("is-paused");
  });

  tagsMarquee.addEventListener("mouseleave", () => {
    isMarqueePaused = false;
    tagsMarquee.classList.remove("is-paused");
  });

  tagsMarquee.addEventListener("wheel", (event) => {
    event.preventDefault();
    setMarqueeScroll(tagsMarquee.scrollLeft + event.deltaX + event.deltaY);
  }, { passive: false });

  window.requestAnimationFrame(animateMarquee);
}

const backgroundVideos = [
  "./assets/backgrounds/bg1.mp4",
  "./assets/backgrounds/bg2.mp4",
  "./assets/backgrounds/bg3.mp4",
];

const shuffledBackgroundVideos = shuffleProjects(backgroundVideos);
const backgroundLoopsBeforeChange = 3;

if (video && shuffledBackgroundVideos.length) {
  let backgroundIndex = 0;
  let currentBackgroundLoop = 1;

  const showVideo = () => video.classList.add("is-ready");

  const playBackground = (index) => {
    video.src = shuffledBackgroundVideos[index];
    video.load();
    video.play().catch(() => {});
  };

  const playNextBackground = () => {
    backgroundIndex = (backgroundIndex + 1) % shuffledBackgroundVideos.length;
    currentBackgroundLoop = 1;
    playBackground(backgroundIndex);
  };

  video.addEventListener("canplay", showVideo, { once: true });

  video.addEventListener("ended", () => {
    if (currentBackgroundLoop < backgroundLoopsBeforeChange) {
      currentBackgroundLoop += 1;
      video.currentTime = 0;
      video.play().catch(() => {});
      return;
    }

    playNextBackground();
  });

  video.addEventListener("error", () => {
    if (shuffledBackgroundVideos.length <= 1) return;

    playNextBackground();
  });

  playBackground(backgroundIndex);
}

const createProjectCard = (project) => {
  const article = document.createElement("article");
  const coverLink = document.createElement("a");
  const placeholder = document.createElement("span");
  const image = document.createElement("img");
  const meta = document.createElement("div");
  const title = document.createElement("h2");

  article.className = "project-card";
  article.dataset.section = project.sections?.join(" ") ?? project.section;
  article.dataset.primarySection = project.section;

  coverLink.className = "project-cover";
  coverLink.href = `./projects/${project.slug}/`;
  coverLink.setAttribute("aria-label", project.title);

  placeholder.className = "cover-placeholder";
  placeholder.textContent = project.title;

  meta.className = "project-meta";
  title.className = "project-title";
  title.textContent = project.title;

  coverLink.append(placeholder);

  if (project.cover) {
    image.src = getCoverUrl(project);
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("load", () => placeholder.remove(), { once: true });
    image.addEventListener("error", () => image.remove(), { once: true });
    coverLink.append(image);
  }

  if (project.coverVideo?.length) {
    const coverVideo = document.createElement("video");

    coverVideo.className = "project-cover-video";
    coverVideo.autoplay = true;
    coverVideo.muted = true;
    coverVideo.loop = true;
    coverVideo.playsInline = true;
    coverVideo.preload = "metadata";

    if (project.cover) {
      coverVideo.poster = getCoverUrl(project);
    }

    project.coverVideo.forEach((sourcePath) => {
      const source = document.createElement("source");
      const extension = sourcePath.split(".").pop();

      source.src = `./${sourcePath}`;
      source.type = `video/${extension === "webm" ? "webm" : "mp4"}`;
      coverVideo.append(source);
    });

    coverVideo.addEventListener("loadeddata", () => placeholder.remove(), { once: true });
    coverVideo.addEventListener("error", () => coverVideo.remove(), { once: true });
    coverLink.append(coverVideo);
  }

  if (project.cover && !project.coverVideo?.length) {
    const hoverVideo = document.createElement("video");
    const coverDirectory = project.cover.slice(0, project.cover.lastIndexOf("/") + 1);
    const imageExtensions = /\.(avif|gif|jpe?g|png|webp)$/i;
    const staticCoverImages = [...new Set([
      project.cover,
      ...(project.media || []).filter((asset) => (
        typeof asset === "string" && imageExtensions.test(asset)
      )),
    ])];
    const hoverSources = (hoverVideoExtensions[project.slug] || []).map(
      (extension) => `${coverDirectory}cover_hover.${extension}`
    );
    let hoverVideoFailed = hoverSources.length === 0;
    let slideshowElement;
    let hoverSlideshowInterval;
    let activeSlideIndex = 0;
    let slideshowImages = [];

    const showSlide = (index) => {
      slideshowImages.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
    };

    const startSlideshow = () => {
      if (slideshowImages.length <= 1 || hoverSlideshowInterval) return;

      slideshowElement?.classList.add("is-active");
      activeSlideIndex = 0;
      showSlide(activeSlideIndex);

      hoverSlideshowInterval = window.setInterval(() => {
        activeSlideIndex = (activeSlideIndex + 1) % slideshowImages.length;
        showSlide(activeSlideIndex);
      }, 500);
    };

    const stopSlideshow = () => {
      if (hoverSlideshowInterval) {
        window.clearInterval(hoverSlideshowInterval);
        hoverSlideshowInterval = undefined;
      }

      slideshowElement?.classList.remove("is-active");
      activeSlideIndex = 0;
      showSlide(activeSlideIndex);
    };

    const startFallbackHover = () => {
      startSlideshow();
    };

    if (staticCoverImages.length > 1) {
      const slideshow = document.createElement("div");

      slideshow.className = "project-cover-slideshow";
      slideshowElement = slideshow;

      staticCoverImages.forEach((imagePath, index) => {
        const slide = document.createElement("img");

        slide.className = "project-cover-slideshow-image";
        slide.src = getCoverUrl(project, imagePath);
        slide.alt = "";
        slide.loading = "lazy";

        if (index === 0) {
          slide.classList.add("is-active");
        }

        slide.addEventListener("error", () => {
          slide.remove();
          slideshowImages = slideshowImages.filter((item) => item !== slide);
          activeSlideIndex = Math.min(activeSlideIndex, Math.max(slideshowImages.length - 1, 0));
          showSlide(activeSlideIndex);
        }, { once: true });

        slideshowImages.push(slide);
        slideshow.append(slide);
      });

      coverLink.append(slideshow);
    }

    hoverVideo.className = "project-cover-hover-video";
    hoverVideo.muted = true;
    hoverVideo.loop = true;
    hoverVideo.playsInline = true;
    hoverVideo.preload = "metadata";
    hoverVideo.poster = getCoverUrl(project);

    hoverSources.forEach((sourcePath) => {
      const source = document.createElement("source");
      const extension = sourcePath.split(".").pop();

      source.src = `./${sourcePath}`;
      source.type = `video/${extension === "webm" ? "webm" : "mp4"}`;
      hoverVideo.append(source);
    });

    const startHover = () => {
      if (!hoverVideoFailed && hoverVideo.isConnected) {
        hoverVideo.currentTime = 0;
        hoverVideo.play().catch(() => {
          hoverVideoFailed = true;
          hoverVideo.remove();
          startFallbackHover();
        });

        return;
      }

      startFallbackHover();
    };

    const stopHover = () => {
      if (hoverVideo.isConnected) {
        hoverVideo.pause();
        hoverVideo.currentTime = 0;
      }

      stopSlideshow();
    };

    coverLink.addEventListener("pointerenter", startHover);
    coverLink.addEventListener("focus", startHover);
    coverLink.addEventListener("pointerleave", stopHover);
    coverLink.addEventListener("blur", stopHover);
    hoverVideo.addEventListener("error", () => {
      hoverVideoFailed = true;
      hoverVideo.remove();

      if (coverLink.matches(":hover") || document.activeElement === coverLink) {
        startFallbackHover();
      }
    }, { once: true });
    if (hoverSources.length) {
      coverLink.append(hoverVideo);
    }
  }
  meta.append(title);
  article.append(coverLink, meta);
  return article;
};

const renderProjects = ({ filter = "all", tag = "" } = {}) => {
  const normalizedTag = tag.trim().toLowerCase();
  const visibleProjects = normalizedTag
    ? shuffledProjects.filter((project) => belongsToTerm(project, normalizedTag))
    : filter === "all"
      ? shuffledProjects
      : shuffledProjects.filter((project) => belongsToSection(project, filter));

  projectGrid.replaceChildren(...visibleProjects.map(createProjectCard));
  projectGrid.hidden = visibleProjects.length === 0;
  emptyState.hidden = visibleProjects.length !== 0;

  filterButtons.forEach((button) => {
    const isActive = !normalizedTag && button.dataset.filter === filter;
    button.classList.toggle("is-active", isActive);
    if (button.matches("a")) {
      button.setAttribute("aria-current", isActive ? "true" : "false");
    }
  });
};

const validFilters = ["art", "motion", "ai", "internet"];
const query = new URLSearchParams(window.location.search);
const requestedFilter = query.get("filter");
const requestedTag = query.get("tag") || "";
const routeFilter = window.location.pathname.match(/^\/(art|motion|ai|internet)\/?$/i)?.[1]?.toLowerCase();
const initialFilter = !requestedTag && validFilters.includes(requestedFilter)
  ? requestedFilter
  : routeFilter || "all";

renderProjects({ filter: initialFilter, tag: requestedTag });

if (initialFilter !== "all" || requestedTag) {
  projectsSection?.scrollIntoView({ block: "start" });
}

tagsMarqueeTrack?.addEventListener("click", (event) => {
  const tagLink = event.target.closest("[data-tag]");

  if (!tagLink) return;

  event.preventDefault();
  renderProjects({ tag: tagLink.dataset.tag });
  window.history.replaceState(null, "", tagLink.href);
  projectsSection.scrollIntoView({ behavior: "smooth", block: "start" });
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
    }
  });
}
