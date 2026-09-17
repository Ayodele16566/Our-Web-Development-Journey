const flowBoard = document.querySelector('.flow-board');
if (flowBoard) {
  flowBoard.animate([
    { transform: 'translateY(8px)', opacity: 0.6 },
    { transform: 'translateY(0)', opacity: 1 }
  ], { duration: 700, easing: 'ease-out' });
}
