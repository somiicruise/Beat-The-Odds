const workflow = document.querySelector(".workflow");
const workflowInner = document.querySelector(".workflow__inner");
const workflowTimeline = document.querySelector(".workflow__timeline");
const workflowSteps = Array.from(document.querySelectorAll(".workflow-step"));
const siteHeader = document.querySelector(".site-header");
const headerSections = [document.querySelector(".intro"), document.querySelector(".audience")];
const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getNumber = (value) => Number.parseFloat(value) || 0;

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
    const dotProgress = Math.max(stepProgress - 0.035, 0);
    const textProgress = Math.min(stepProgress + 0.045, 1);

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
  const isVisible = headerSections.some((section) => {
    if (!section) return false;

    const rect = section.getBoundingClientRect();
    return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
  });

  siteHeader.classList.toggle("is-visible", isVisible);
};

let lavaX = 82;
let lavaY = 16;
let targetLavaX = lavaX;
let targetLavaY = lavaY;

const updateLavaTarget = (event) => {
  if (reduceMotion) return;

  targetLavaX = clamp((event.clientX / window.innerWidth) * 100, 0, 100);
  targetLavaY = clamp((event.clientY / window.innerHeight) * 100, 0, 100);
};

const resetLavaTarget = () => {
  targetLavaX = 82;
  targetLavaY = 16;
};

const animateLava = () => {
  if (!reduceMotion) {
    lavaX += (targetLavaX - lavaX) * 0.055;
    lavaY += (targetLavaY - lavaY) * 0.055;

    const heat = 0.52 + (lavaY / 100) * 0.22;
    const leftHeat = 0.28 + (1 - lavaX / 100) * 0.12;

    root.style.setProperty("--lava-x", `${lavaX.toFixed(2)}%`);
    root.style.setProperty("--lava-y", `${lavaY.toFixed(2)}%`);
    root.style.setProperty("--lava-heat", heat.toFixed(3));
    root.style.setProperty("--lava-left-heat", leftHeat.toFixed(3));
  }

  window.requestAnimationFrame(animateLava);
};

let workflowTicking = false;

const updatePage = () => {
  updateWorkflow();
  updateHeader();
};

const requestPageUpdate = () => {
  if (workflowTicking) return;

  workflowTicking = true;
  window.requestAnimationFrame(() => {
    updatePage();
    workflowTicking = false;
  });
};

updatePage();
window.requestAnimationFrame(animateLava);
window.addEventListener("pointermove", updateLavaTarget, { passive: true });
window.addEventListener("pointerleave", resetLavaTarget);
window.addEventListener("load", updatePage);
window.addEventListener("scroll", requestPageUpdate, { passive: true });
window.addEventListener("resize", requestPageUpdate);
