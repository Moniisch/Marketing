let currentCard = 0;
const cards = document.querySelectorAll('.team-card');

function showCard(index) {
  cards.forEach((card, i) => {
    card.classList.remove('active');
    if (i === index) {
      card.classList.add('active');
    }
  });
}

function nextCard() {
  currentCard = (currentCard + 1) % cards.length;
  showCard(currentCard);
}

function prevCard() {
  currentCard = (currentCard - 1 + cards.length) % cards.length;
  showCard(currentCard);
}

// Optional: modal logic
function openModal(name, bio) {
  const modal = document.getElementById('teamModal');
  const modalContent = document.getElementById('modalContent');
  modalContent.innerHTML = `<h2>${name}</h2><p>${bio}</p><span class="close" onclick="closeModal()">×</span>`;
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('teamModal').style.display = 'none';
}