const workflow = document.querySelector(".workflow");
const workflowInner = document.querySelector(".workflow__inner");
const workflowTimeline = document.querySelector(".workflow__timeline");
const workflowSteps = Array.from(document.querySelectorAll(".workflow-step"));
const siteHeader = document.querySelector(".site-header");
const showcaseInner = document.querySelector(".showcase__inner");
const showcaseTrack = document.querySelector(".showcase__track");
const introSection = document.querySelector(".intro");
const revealSections = Array.from(document.querySelectorAll(".reveal"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.documentElement.classList.add("has-reveal");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getNumber = (value) => Number.parseFloat(value) || 0;

let showcasePosition = 0;
let showcaseLoopWidth = 0;
let isShowcaseDragging = false;
let showcaseLastX = 0;

const setShowcasePosition = () => {
  if (!showcaseTrack) return;

  showcaseTrack.style.setProperty("--showcase-shift", `${showcasePosition}px`);
};

const measureShowcaseLoop = () => {
  if (!showcaseTrack) return;

  const firstItem = showcaseTrack.firstElementChild;
  const firstClone = showcaseTrack.querySelector("[data-showcase-clone='true']");

  showcaseLoopWidth = firstItem && firstClone ? firstClone.offsetLeft - firstItem.offsetLeft : 0;
};

const normalizeShowcasePosition = () => {
  if (!showcaseLoopWidth) return;

  const wrapped = ((showcasePosition % showcaseLoopWidth) + showcaseLoopWidth) % showcaseLoopWidth;
  showcasePosition = wrapped === 0 ? 0 : wrapped - showcaseLoopWidth;
};

const moveShowcase = (deltaX) => {
  showcasePosition += deltaX;
  normalizeShowcasePosition();
  setShowcasePosition();
};

const setupShowcaseSlider = () => {
  if (!showcaseInner || !showcaseTrack || showcaseTrack.dataset.loopReady) return;

  const originalItems = Array.from(showcaseTrack.children);

  originalItems.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.dataset.showcaseClone = "true";
    showcaseTrack.append(clone);
  });

  showcaseTrack.dataset.loopReady = "true";
  measureShowcaseLoop();
  normalizeShowcasePosition();
  setShowcasePosition();

  showcaseInner.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;

    isShowcaseDragging = true;
    showcaseLastX = event.clientX;
    showcaseInner.classList.add("is-dragging");
    showcaseInner.setPointerCapture(event.pointerId);
  });

  showcaseInner.addEventListener("pointermove", (event) => {
    if (!isShowcaseDragging) return;

    const deltaX = event.clientX - showcaseLastX;
    showcaseLastX = event.clientX;

    moveShowcase(deltaX);
  });

  const endDrag = (event) => {
    if (!isShowcaseDragging) return;

    isShowcaseDragging = false;
    showcaseInner.classList.remove("is-dragging");

    if (showcaseInner.hasPointerCapture(event.pointerId)) {
      showcaseInner.releasePointerCapture(event.pointerId);
    }
  };

  showcaseInner.addEventListener("pointerup", endDrag);
  showcaseInner.addEventListener("pointercancel", endDrag);
  showcaseInner.addEventListener("lostpointercapture", () => {
    isShowcaseDragging = false;
    showcaseInner.classList.remove("is-dragging");
  });
};

const getWorkflowDistance = () => {
  if (!workflowInner || !workflowTimeline) return 0;

  const styles = window.getComputedStyle(workflowInner);
  const horizontalPadding = getNumber(styles.paddingLeft) + getNumber(styles.paddingRight);
  const visibleWidth = workflowInner.clientWidth - horizontalPadding;

  return Math.max(workflowTimeline.scrollWidth - visibleWidth, 0);
};

const updateWorkflowSteps = (progress) => {
  workflowSteps.forEach((step, index) => {
    const stepProgress = index / Math.max(workflowSteps.length - 1, 1);
    const dotProgress = Math.max(stepProgress - 0.16, 0);
    const textProgress = Math.max(stepProgress - 0.12, 0);

    step.classList.toggle("is-dot-active", index === 0 || progress >= dotProgress);
    step.classList.toggle("is-text-visible", index === 0 || progress >= textProgress);
  });
};

const updateWorkflow = () => {
  if (!workflow || !workflowInner || !workflowTimeline) return;

  const distance = getWorkflowDistance();
  const start = workflow.offsetTop;
  const end = start + distance;
  const scrollY = window.scrollY;
  const progress = distance > 0 ? clamp((scrollY - start) / distance, 0, 1) : 0;

  workflow.style.setProperty("--workflow-distance", `${distance}px`);
  workflow.classList.toggle("is-fixed", distance > 0 && scrollY >= start && scrollY < end);
  workflow.classList.toggle("is-ended", distance > 0 && scrollY >= end);
  workflowTimeline.style.setProperty("--workflow-shift", `${distance * -progress}px`);
  updateWorkflowSteps(progress);
};

const updateHeader = () => {
  if (!siteHeader) return;

  const viewportCenter = window.innerHeight / 2;
  const introRect = introSection?.getBoundingClientRect();
  const isIntroVisible = introRect ? introRect.top <= viewportCenter && introRect.bottom >= viewportCenter : false;

  siteHeader.classList.toggle("is-visible", isIntroVisible);
};

const showRevealSection = (section) => {
  section.classList.add("is-visible");
};

const setupReveal = () => {
  if (!revealSections.length) return;

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealSections.forEach(showRevealSection);
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        showRevealSection(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -16% 0px",
      threshold: 0.12,
    },
  );

  revealSections.forEach((section) => revealObserver.observe(section));
};

let workflowTicking = false;

const updatePage = () => {
  updateWorkflow();
  updateHeader();
  measureShowcaseLoop();
  normalizeShowcasePosition();
  setShowcasePosition();
};

const requestPageUpdate = () => {
  if (workflowTicking) return;

  workflowTicking = true;
  window.requestAnimationFrame(() => {
    updatePage();
    workflowTicking = false;
  });
};

setupReveal();
setupShowcaseSlider();
updatePage();
window.addEventListener("load", updatePage);
window.addEventListener("scroll", requestPageUpdate, { passive: true });
window.addEventListener("resize", requestPageUpdate);
