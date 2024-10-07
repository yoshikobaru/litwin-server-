document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progressBar');
    const balanceElement = document.getElementById('balance');
    const canElement = document.getElementById('can');
    const energyElement = document.getElementById('energy');
    const bubblesContainer = document.querySelector('.bubbles');

    let progress = 0;
    let balance = 0;
    let energy = 100;
    const clicksToFill = 10;

    function updateProgressBar() {
        progressBar.style.width = `${progress}%`;
    }

    function updateBalance() {
        balanceElement.textContent = balance.toLocaleString();
    }

    function updateEnergy() {
        energyElement.textContent = `${energy}/100`;
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
    Telegram.WebApp.ready();

    // Event occurs whenever theme settings are changed in the user's Telegram app (including switching to night mode).
    Telegram.WebApp.onEvent('themeChanged', function() {
        document.documentElement.className = Telegram.WebApp.colorScheme;
    });
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

    canElement.addEventListener('click', handleCanClick);

    setInterval(regenerateEnergy, 5000);

    updateProgressBar();
    updateBalance();
    updateEnergy();
});