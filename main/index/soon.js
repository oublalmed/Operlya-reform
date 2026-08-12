window.addEventListener("DOMContentLoaded", () => {

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
  });

  function animateOrbs() {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    document.querySelectorAll(".orb").forEach((orb, i) => {
      const speed = (i + 1) * 85;

      orb.style.setProperty("--moveX", `${currentX * speed}px`);
      orb.style.setProperty("--moveY", `${currentY * speed}px`);
    });

    requestAnimationFrame(animateOrbs);
  }

  animateOrbs();
});