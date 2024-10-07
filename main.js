let progressBar, balanceElement, canElement, energyElement, bubblesContainer;
let progress, balance, energy;
const clicksToFill = 10;

function initializeMainPage() {
    progressBar = document.getElementById('progressBar');
    balanceElement = document.getElementById('balance');
    canElement = document.getElementById('can');
    energyElement = document.getElementById('energy');
    bubblesContainer = document.querySelector('.bubbles');

    // Загрузка данных из localStorage
    progress = parseFloat(localStorage.getItem('progress')) || 0;
    balance = parseInt(localStorage.getItem('balance')) || 0;
    energy = parseInt(localStorage.getItem('energy')) || 100;

    updateProgressBar();
    updateBalance();
    updateEnergy();

    canElement.addEventListener('click', handleCanClick);
}

function updateProgressBar() {
    progressBar.style.width = `${progress}%`;
    localStorage.setItem('progress', progress.toString());
}

function updateBalance() {
    balanceElement.textContent = balance.toLocaleString();
    localStorage.setItem('balance', balance.toString());
}

function updateEnergy() {
    energyElement.textContent = `${energy}/100`;
    localStorage.setItem('energy', energy.toString());
}

function createBubble() {
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    const size = Math.random() * 10 + 5;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    const startAngle = Math.random() * Math.PI * 2;
    const startRadius = 75; // Половина ширины банки
    const endRadius = 100 + Math.random() * 50;
    
    const startX = Math.cos(startAngle) * startRadius;
    const startY = Math.sin(startAngle) * startRadius;
    
    bubble.style.left = `calc(50% + ${startX}px)`;
    bubble.style.top = `calc(50% + ${startY}px)`;
    
    const endX = Math.cos(startAngle) * endRadius;
    const endY = Math.sin(startAngle) * endRadius;
    
    const tx = endX - startX;
    const ty = endY - startY;
    
    bubble.style.setProperty('--tx', `${tx}px`);
    bubble.style.setProperty('--ty', `${ty}px`);
    
    bubblesContainer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1000);
}

function handleCanClick() {
    if (energy > 0) {
        canElement.classList.add('shake');
        setTimeout(() => canElement.classList.remove('shake'), 200);

        for (let i = 0; i < 15; i++) { // Увеличено количество пузырьков
            setTimeout(() => createBubble(), Math.random() * 200);
        }

        progress += 100 / clicksToFill;
        if (progress >= 100) {
            progress = 0;
            balance += 1;
            updateBalance();
        }
        energy -= 1;
        updateProgressBar();
        updateEnergy();
    }
}

function regenerateEnergy() {
    if (energy < 100) {
        energy = Math.min(energy + 1, 100);
        updateEnergy();
    }
}

function loadPage(page) {
    const contentElement = document.getElementById('content');
    fetch(`${page}.html`)
        .then(response => response.text())
        .then(html => {
            contentElement.innerHTML = html;
            if (page === 'collection') {
                loadScript('collection.js');
            } else if (page === 'friends') {
                loadScript('friends.js');
            } else if (page === 'tasks') {
                loadScript('task.js');
            } else if (page === 'main') {
                initializeMainPage();
            }
        })
        .catch(error => console.error('Ошибка загрузки страницы:', error));
}

function loadScript(scriptName) {
    const script = document.createElement('script');
    script.src = scriptName;
    document.body.appendChild(script);
}

// Обработчик для кнопок футера
const footerButtons = document.querySelectorAll('.footer-btn');
footerButtons.forEach(button => {
    button.addEventListener('click', () => {
        const page = button.getAttribute('data-page');
        loadPage(page);
    });
});

// Инициализация главной страницы при загрузке
document.addEventListener('DOMContentLoaded', () => {
    loadPage('main');
});

// Запуск регенерации энергии
setInterval(regenerateEnergy, 5000);