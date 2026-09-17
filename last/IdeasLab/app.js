const points = document.querySelectorAll('.lab-row');
points.forEach((row, index) => {
  row.animate([
    { transform: 'translateY(12px)', opacity: 0.8 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration: 600 + index * 100, delay: index * 80 });
});
