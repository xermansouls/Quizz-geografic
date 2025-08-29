const screens = document.querySelectorAll('.screen');
// NOUA funcție showScreen cu animații
function showScreen(screenId) {
    const currentScreen = document.querySelector('.screen.active');
    if (currentScreen) {
        currentScreen.classList.remove('active');
    }

    const nextScreen = document.getElementById(screenId);
    if (nextScreen) {
        nextScreen.style.display = 'flex';
        setTimeout(() => {
            nextScreen.classList.add('active');
        }, 10);
    }

    setTimeout(() => {
        screens.forEach(s => {
            if (s.id !== screenId) {
                s.style.display = 'none';
            }
        });
    }, 400); 
}


// --- Managementul Scorurilor Maxime (localStorage) ---
const HIGH_SCORES_KEY = 'geoMasterHighScores';

function getHighScores() {
    try {
        const scores = localStorage.getItem(HIGH_SCORES_KEY);
        return scores ? JSON.parse(scores) : { capitals: 0, flags: 0, monuments: 0 };
    } catch (e) {
        console.error("Eroare la citirea scorurilor:", e);
        return { capitals: 0, flags: 0, monuments: 0 };
    }
}

function updateHighScore(quizType, newScore) {
    try {
        const highScores = getHighScores();
        if (newScore > highScores[quizType]) {
            highScores[quizType] = newScore;
            localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
        }
    } catch (e) {
        console.error("Eroare la salvarea scorului:", e);
    }
}

function displayHighScores() {
    const highScores = getHighScores();
    document.getElementById('hs-capitals').textContent = highScores.capitals;
    document.getElementById('hs-flags').textContent = highScores.flags;
    document.getElementById('hs-monuments').textContent = highScores.monuments;
}


// --- Inițializarea Aplicației și Evenimente ---
document.addEventListener('DOMContentLoaded', () => {
    displayHighScores();

    document.querySelectorAll('.btn-mode[data-quiz-type]').forEach(button => {
        button.addEventListener('click', () => {
            const quizType = button.dataset.quizType;
            GameEngine.init(quizType);
            showScreen('screen-quiz');
        });
    });

    document.getElementById('btn-back-to-menu').addEventListener('click', () => {
        displayHighScores();
        showScreen('screen-menu');
    });

    showScreen('screen-menu');
});