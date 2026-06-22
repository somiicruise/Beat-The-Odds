const workflow = document.querySelector(".workflow");
const workflowInner = document.querySelector(".workflow__inner");
const workflowTimeline = document.querySelector(".workflow__timeline");
const workflowSteps = Array.from(document.querySelectorAll(".workflow-step"));

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

let workflowTicking = false;

const requestWorkflowUpdate = () => {
  if (workflowTicking) return;

  workflowTicking = true;
  window.requestAnimationFrame(() => {
    updateWorkflow();
    workflowTicking = false;
  });
};

updateWorkflow();
window.addEventListener("load", updateWorkflow);
window.addEventListener("scroll", requestWorkflowUpdate, { passive: true });
window.addEventListener("resize", requestWorkflowUpdate);
