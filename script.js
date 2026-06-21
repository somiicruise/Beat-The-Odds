const workflow = document.querySelector(".workflow");
const workflowTimeline = document.querySelector(".workflow__timeline");
const workflowViewport = document.querySelector(".workflow__inner");
const workflowSteps = Array.from(document.querySelectorAll(".workflow-step"));

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
let workflowProgress = 0;

const getWorkflowTop = () => {
  if (!workflow) return 0;
  return workflow.getBoundingClientRect().top + window.scrollY;
};

const getWorkflowShift = () => {
  if (!workflowTimeline || !workflowViewport) return 0;
  return Math.max(workflowTimeline.scrollWidth - workflowViewport.clientWidth, 0);
};

const applyWorkflowProgress = () => {
  const maxShift = getWorkflowShift();

  if (workflowTimeline) {
    workflowTimeline.style.setProperty("--workflow-shift", `${maxShift * -workflowProgress}px`);
  }

  workflowSteps.forEach((step, index) => {
    const stepProgress = index / Math.max(workflowSteps.length - 1, 1);
    const dotProgress = Math.max(stepProgress - 0.035, 0);
    const textProgress = Math.min(stepProgress + 0.045, 1);

    step.classList.toggle("is-dot-active", index === 0 || workflowProgress >= dotProgress);
    step.classList.toggle("is-text-visible", index === 0 || workflowProgress >= textProgress);
  });
};

const normalizeWheelDelta = (event) => {
  const modeMultiplier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
  return (Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX) * modeMultiplier;
};

const handleWorkflowWheel = (event) => {
  if (!workflow || !workflowTimeline || !workflowViewport) return;

  const maxShift = getWorkflowShift();
  if (maxShift <= 0) return;

  const delta = normalizeWheelDelta(event);
  if (delta === 0) return;

  const workflowTop = getWorkflowTop();
  const workflowBottom = workflowTop + workflow.offsetHeight;
  const scrollY = window.scrollY;
  const isInsideWorkflow = scrollY >= workflowTop - 2 && scrollY <= workflowBottom - window.innerHeight + 2;
  const shouldMoveForward = delta > 0 && isInsideWorkflow && workflowProgress < 1;
  const shouldMoveBackward = delta < 0 && isInsideWorkflow && workflowProgress > 0;

  if (!shouldMoveForward && !shouldMoveBackward) return;

  event.preventDefault();
  window.scrollTo(0, workflowTop);

  workflowProgress = clamp(workflowProgress + delta / maxShift, 0, 1);
  applyWorkflowProgress();
};

applyWorkflowProgress();
window.addEventListener("wheel", handleWorkflowWheel, { passive: false });
window.addEventListener("resize", applyWorkflowProgress);
