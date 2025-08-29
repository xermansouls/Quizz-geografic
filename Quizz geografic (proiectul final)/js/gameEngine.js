const correctSound = new Audio('assets/audio/correct.mp3');
const incorrectSound = new Audio('assets/audio/incorrect.mp3');
const character = document.getElementById('quiz-character')
const backgroundMusic = new Audio('assets/audio/Mozart.mp3');
const GameEngine = {
    questions: [],
    score: 0,
    currentQuestionIndex: 0,
    currentQuizType: null,
    config: null,
    quizConfigs: {
        'capitals': { title: 'Ghicește Capitala', totalQuestions: 10, generator: 'generateCapitalQuestion' },
        'flags': { title: 'Ghicește Steagul', totalQuestions: 10, generator: 'generateFlagQuestion' },
        'monuments': { title: 'Unde se află monumentul?', totalQuestions: 10, generator: 'generateMonumentQuestion' }
    },
    init(quizType) {
        this.currentQuizType = quizType;
        this.config = this.quizConfigs[quizType];
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.questions = this.generateQuestions();
        this.displayQuestion();
        document.getElementById('quiz-title').textContent = this.config.title;
        document.getElementById('current-score').textContent = this.score;
        character.src = 'assets/character/owl-neutral.png';
        character.classList.remove('hidden');
        backgroundMusic.loop = true;
        backgroundMusic.play();
    },
    generateQuestions() {
        const questionsArray = [];
        const usedIndices = new Set();
        while (questionsArray.length < this.config.totalQuestions) {
            const question = this.questionGenerators[this.config.generator](usedIndices);
            if (question) {
                questionsArray.push(question);
            }
        }
        return questionsArray;
    },
    displayQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.endQuiz();
            return;
        }
        const progressPercentage = (this.currentQuestionIndex / this.config.totalQuestions) * 100;
        document.getElementById('progress-bar').style.width = `${progressPercentage}%`;
        const question = this.questions[this.currentQuestionIndex];
        
        document.getElementById('question-container').innerHTML = question.prompt;
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.textContent = option;
            button.classList.add('btn-option');
            button.addEventListener('click', () => this.checkAnswer(option, button));
            optionsContainer.appendChild(button);
        });
        document.getElementById('progress-indicator').textContent = `Întrebarea ${this.currentQuestionIndex + 1} din ${this.config.totalQuestions}`;
    },
    checkAnswer(selectedOption, button) {
    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = selectedOption === question.correctAnswer;

    if (isCorrect) {
        this.score++;
        document.getElementById('current-score').textContent = this.score;
        button.classList.add('correct');
        correctSound.play();
        character.src = 'assets/character/owl-correct.png';
    } else {
        button.classList.add('incorrect');
        incorrectSound.play();
        character.src = 'assets/character/owl-incorrect.png';
        const allOptions = document.querySelectorAll('.btn-option');
        allOptions.forEach(opt => {
            if (opt.textContent === question.correctAnswer) {
                opt.classList.add('correct');
            }
        });
    }
    character.classList.add('pop');
    document.querySelectorAll('.btn-option').forEach(btn => btn.disabled = true);
    setTimeout(() => {
        character.src = 'assets/character/owl-neutral.png';
        character.classList.remove('pop');

        this.currentQuestionIndex++;
        this.displayQuestion();
    }, 1500);
},
    endQuiz() {
        const highScores = getHighScores();
        const currentHighScore = highScores[this.currentQuizType]; // CORECTAT
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-highscore').textContent = Math.max(this.score, currentHighScore);
        if (this.score > currentHighScore) {
            document.getElementById('new-highscore-message').classList.remove('hidden');
            updateHighScore(this.currentQuizType, this.score);
        } else {
            document.getElementById('new-highscore-message').classList.add('hidden');
        }
        showScreen('screen-results');
        character.classList.add('hidden');
        backgroundMusic.pause();
    },
    questionGenerators: {
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },
        generateCapitalQuestion(usedIndices) {
            let correctIndex;
            do {
                correctIndex = Math.floor(Math.random() * countriesData.length);
            } while (usedIndices.has(correctIndex));
            usedIndices.add(correctIndex);
            const correctCountry = countriesData[correctIndex];
            const correctAnswer = correctCountry.capital;
            const options = [correctAnswer];
            const otherCapitals = new Set();
            while (options.length < 4) {
                const randomIndex = Math.floor(Math.random() * countriesData.length);
                const randomCountry = countriesData[randomIndex];
                if (randomCountry.capital !== correctAnswer && !otherCapitals.has(randomCountry.capital)) {
                    options.push(randomCountry.capital);
                    otherCapitals.add(randomCountry.capital);
                }
            }
            return {
                prompt: `Care este capitala țării <strong>${correctCountry.name}</strong>?`,
                options: this.shuffleArray(options),
                correctAnswer: correctAnswer
            };
        },
        generateFlagQuestion(usedIndices) {
            let correctIndex;
            do {
                correctIndex = Math.floor(Math.random() * countriesData.length);
            } while (usedIndices.has(correctIndex));
            usedIndices.add(correctIndex);
            const correctCountry = countriesData[correctIndex];
            const correctAnswer = correctCountry.name;
            const options = [correctAnswer];
            const otherCountries = new Set();
            while (options.length < 4) {
                const randomIndex = Math.floor(Math.random() * countriesData.length);
                if (randomIndex !== correctIndex && !otherCountries.has(countriesData[randomIndex].name)) {
                    options.push(countriesData[randomIndex].name);
                    otherCountries.add(countriesData[randomIndex].name);
                }
            }
            return {
                prompt: `<img src="https://flagcdn.com/w320/${correctCountry.cca2.toLowerCase()}.png" alt="Steag">`,
                options: this.shuffleArray(options),
                correctAnswer: correctAnswer
            };
        },
        generateMonumentQuestion(usedIndices) {
            let correctIndex;
            do {
                correctIndex = Math.floor(Math.random() * landmarksData.length);
            } while (usedIndices.has(correctIndex));
            usedIndices.add(correctIndex);
            const correctLandmark = landmarksData[correctIndex];
            const correctAnswer = correctLandmark.country;
            const options = [correctAnswer];
            const otherCountries = new Set();
            
            
            const correctCountryData = countriesData.find(c => c.name === correctAnswer);
            if (correctCountryData) {
                const regionalCountries = countriesData.filter(c => c.region === correctCountryData.region && c.name !== correctAnswer);
                while (options.length < 4 && otherCountries.size < regionalCountries.length) {
                    const randomCountry = regionalCountries[Math.floor(Math.random() * regionalCountries.length)];
                    if (!options.includes(randomCountry.name)) {
                        options.push(randomCountry.name);
                        otherCountries.add(randomCountry.name);
                    }
                }
            }
            while (options.length < 4) {
                const randomCountry = countriesData[Math.floor(Math.random() * countriesData.length)];
                if (!options.includes(randomCountry.name)) {
                    options.push(randomCountry.name);
                }
            }
            return {
                prompt: `<img src="${correctLandmark.imageUrl}" alt="${correctLandmark.name}">`,
                options: this.shuffleArray(options),
                correctAnswer: correctAnswer
            };
        }
    }
};