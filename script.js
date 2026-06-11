const video = document.querySelector(".hero-video");

if (video) {
  video.addEventListener("canplay", () => {
    video.classList.add("is-ready");
  }, { once: true });
}

document.querySelectorAll(".name-title, .section-link").forEach((group) => {
  const letters = [...group.querySelectorAll(".char:not(.space)")];

  const clearLetterState = () => {
    group.classList.remove("is-fading");
    letters.forEach((letter) => {
      letter.classList.remove("is-active", "is-neighbor");
    });
  };

  letters.forEach((letter, index) => {
    letter.addEventListener("mouseenter", () => {
      group.classList.add("is-fading");
      letters.forEach((item) => {
        item.classList.remove("is-active", "is-neighbor");
      });

      letter.classList.add("is-active");
      letters[index - 1]?.classList.add("is-neighbor");
      letters[index + 1]?.classList.add("is-neighbor");
    });
  });

  group.addEventListener("mouseleave", clearLetterState);
});
