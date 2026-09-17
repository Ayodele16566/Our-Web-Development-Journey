const projectSlots = document.querySelectorAll('.project-slot[href="#"]');

projectSlots.forEach((slot) => {
  slot.addEventListener('click', (event) => {
    event.preventDefault();
  });
});
