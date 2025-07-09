// Arquivo externo para o código do Math Quest

class MathQuest {
  constructor() {
    this.difficulty = 'medium';
    this.score = 0;
    this.currentQuestion = 0;
    this.totalQuestions = 10;
    this.timer = null;
    this.timeLeft = 30;
    this.correctAnswer = null;
    this.gameStarted = false;
    this.level = 1;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.powerUps = { time: 3, hint: 3, skip: 3 };
    this.audioContext = null;
    this.askedQuestionIndices = { easy: [], medium: [], hard: [] };

    this.achievements = {
      firstWin: {
        name: "🎯 Primeira Vitória",
        description: "Responda sua primeira pergunta corretamente",
        unlocked: false
      },
      speedster: {
        name: "⚡ Velocista",
        description: "Responda em menos de 5 segundos",
        unlocked: false
      },
      perfectRound: {
        name: "💯 Rodada Perfeita",
        description: "Acerte todas as 10 perguntas",
        unlocked: false
      },
      streakMaster: {
        name: "🔥 Mestre das Sequências",
        description: "Consiga uma sequência de 5 acertos",
        unlocked: false
      },
      levelUp: {
        name: "📈 Evoluindo",
        description: "Alcance o nível 5",
        unlocked: false
      },
      powerUser: {
        name: "🔋 Usuário Experiente",
        description: "Use todos os power-ups em uma partida",
        unlocked: false
      }
    };

    this.questionTemplates = {
      easy: [
        { template: "Quanto é {a} + {b}?", answer: ({ a, b }) => a + b },
        { template: "Quanto é {a} - {b}?", answer: ({ a, b }) => a - b },
        { template: "Se um pacote tem {a} balas e {b} são retiradas, quantas restam?", answer: ({ a, b }) => a - b },
        { template: "João tem {a} maçãs e ganha mais {b}. Quantas maçãs ele tem agora?", answer: ({ a, b }) => a + b },
        { template: "Quanto é {a} × {b}?", answer: ({ a, b }) => a * b, param: () => ({ a: Math.floor(Math.random() * 5) + 1, b: Math.floor(Math.random() * 5) + 1 }) },
        { template: "Em uma sala há {a} fileiras com {b} cadeiras cada. Quantas cadeiras há no total?", answer: ({ a, b }) => a * b, param: () => ({ a: Math.floor(Math.random() * 5) + 2, b: Math.floor(Math.random() * 5) + 2 }) }
      ],
      medium: [
        { template: "Quanto é {a} × {b}?", answer: ({ a, b }) => a * b },
        {
          template: "Quanto é {a} ÷ {b}?", answer: ({ a, b }) => a / b, param: () => {
            const b = Math.floor(Math.random() * 5) + 2;
            const a = b * (Math.floor(Math.random() * 10) + 1);
            return { a, b };
          }
        },
        { template: "Qual é {a}% de {b}?", answer: ({ a, b }) => (a * b) / 100, param: () => ({ a: Math.floor(Math.random() * 9 + 1) * 10, b: Math.floor(Math.random() * 90) + 10 }) },
        {
          template: "Qual é a raiz quadrada de {a_squared}?", answer: ({ a }) => a, param: () => {
            const a = Math.floor(Math.random() * 10) + 1;
            return { a_squared: a * a, a };
          }
        },
        {
          template: "Se {a} laranjas custam R$ {b}, quanto custam {c} laranjas?", answer: ({ a, b, c }) => (b * c) / a, param: () => {
            const a = Math.floor(Math.random() * 5) + 2;
            const b = Math.floor(Math.random() * 20) + 5;
            const c = Math.floor(Math.random() * 10) + 1;
            return { a, b, c };
          }
        },
        { template: "Qual é o dobro de {a}?", answer: ({ a }) => a * 2 }
      ],
      hard: [
        {
          template: "Qual é o fatorial de {a}?", answer: ({ a }) => {
            let result = 1;
            for (let i = 2; i <= a; i++) result *= i;
            return result;
          }, param: () => ({ a: Math.floor(Math.random() * 4) + 3 })
        },
        { template: "Quanto é {a}³?", answer: ({ a }) => a * a * a },
        { template: "Qual é a média aritmética de {a}, {b} e {c}?", answer: ({ a, b, c }) => (a + b + c) / 3, param: () => ({ a: Math.floor(Math.random() * 20) + 1, b: Math.floor(Math.random() * 20) + 1, c: Math.floor(Math.random() * 20) + 1 }) },
        {
          template: "Se 2^a = {result}, qual é o valor de a?",
          answer: ({ result }) => Math.log2(result),
          param: () => {
            const a = Math.floor(Math.random() * 6) + 1;
            const result = Math.pow(2, a);
            return { result };
          }
        },
        {
          template: "Qual é o próximo número na sequência: {a}, {b}, {c}, ?", answer: ({ a, b, c }) => c + (c - b), param: () => {
            const diff = Math.floor(Math.random() * 5) + 2;
            const a = Math.floor(Math.random() * 10) + 1;
            return { a, b: a + diff, c: a + 2 * diff };
          }
        },
        { template: "Qual é a área de um quadrado com lado {a}?", answer: ({ a }) => a * a }
      ]
    };
  }

  startGame() {
    console.log('startGame chamado');
    document.getElementById('intro').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    const startBtn = document.getElementById('start-btn');
    if (!startBtn) console.error('Elemento start-btn não encontrado');
    else startBtn.style.display = 'none';
    const nextBtn = document.getElementById('next-btn');
    if (!nextBtn) console.error('Elemento next-btn não encontrado');
    else nextBtn.style.display = 'none';
    this.score = 0;
    this.currentQuestion = 0;
    this.level = 1;
    this.currentStreak = 0;
    this.powerUps = { time: 3, hint: 3, skip: 3 };
    this.gameStarted = true;
    this.askedQuestionIndices[this.difficulty] = [];
    this.updateStats();
    this.updateCounters();
    this.updateHighScore();
    this.generateQuestion();
    this.startTimer();
  }

  generateQuestion() {
    this.currentQuestion++;
    if (this.currentQuestion > this.totalQuestions) {
      return this.endGame();
    }
    const questionNumberEl = document.getElementById('question-number');
    if (questionNumberEl) questionNumberEl.textContent = this.currentQuestion;
    const progressBarEl = document.getElementById('progress-bar');
    if (progressBarEl) progressBarEl.style.width = `${(this.currentQuestion / this.totalQuestions) * 100}%`;
    const templates = this.questionTemplates[this.difficulty];
    let availableTemplatesIndices = templates
      .map((_, index) => index)
      .filter(index => !this.askedQuestionIndices[this.difficulty].includes(index));
    if (availableTemplatesIndices.length === 0) {
      this.askedQuestionIndices[this.difficulty] = [];
      availableTemplatesIndices = templates.map((_, index) => index);
    }
    const randomIndex = availableTemplatesIndices[Math.floor(Math.random() * availableTemplatesIndices.length)];
    const template = templates[randomIndex];
    this.askedQuestionIndices[this.difficulty].push(randomIndex);
    let params = {
      a: Math.floor(Math.random() * 10) + 1,
      b: Math.floor(Math.random() * 10) + 1
    };
    if (template.param) {
      params = { ...params, ...template.param() };
    }
    let questionText = template.template;
    Object.keys(params).forEach(key => {
      questionText = questionText.replace(new RegExp(`\\{${key}\\}`, 'g'), params[key]);
    });
    // Determina se a resposta correta deve ser inteira
    const forceInt = [
      'fatorial', 'potência', 'área', 'sequência', 'dobro', 'raiz quadrada', 'balas', 'maçãs', 'cadeiras', '2^a', 'próximo número'
    ].some(key => template.template.toLowerCase().includes(key));
    this.correctAnswer = this.roundIfNeeded(template.answer(params));
    if (forceInt) this.correctAnswer = Math.round(this.correctAnswer);
    document.getElementById('question').textContent = questionText;
    const optionsEl = document.getElementById('options');
    optionsEl.innerHTML = '';
    let options = [this.correctAnswer];
    while (options.length < 4) {
      let wrongAnswer = this.correctAnswer + (forceInt
        ? Math.floor(Math.random() * 6 + 1) * (Math.random() > 0.5 ? 1 : -1)
        : Math.random() * 10 - 5);
      wrongAnswer = this.roundIfNeeded(wrongAnswer);
      if (forceInt) wrongAnswer = Math.round(wrongAnswer);
      if (!options.includes(wrongAnswer) && wrongAnswer > 0) {
        options.push(wrongAnswer);
      }
    }
    this.shuffleArray(options).forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = option;
      btn.onclick = () => this.checkAnswer(option);
      optionsEl.appendChild(btn);
    });
    this.timeLeft = 30;
    document.getElementById('time').textContent = this.timeLeft;
    document.getElementById('feedback').style.display = 'none';
  }

  roundIfNeeded(value) {
    if (typeof value === 'number' && !Number.isInteger(value)) {
      return Math.round(value * 100) / 100;
    }
    return value;
  }

  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    // Atualiza visual dos botões
    document.getElementById('btn-easy').classList.remove('active');
    document.getElementById('btn-medium').classList.remove('active');
    document.getElementById('btn-hard').classList.remove('active');
    document.getElementById('btn-' + difficulty).classList.add('active');
    // Troca imagem do personagem conforme dificuldade
    const images = {
      easy: 'https://placehold.co/150?text=🧒',
      medium: 'https://placehold.co/150?text=🧑‍🏫',
      hard: 'https://placehold.co/150?text=🧠'
    };
    document.getElementById('character-img').src = images[difficulty];
  }

  startTimer() {
    clearInterval(this.timer);
    this.timeLeft = 30;
    document.getElementById('time').textContent = this.timeLeft;
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('time').textContent = this.timeLeft;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        // Mostra como resposta errada e avança
        this.checkAnswer(null);
      }
    }, 1000);
  }

  usePowerUp(type) {
    if (!this.powerUps[type] || this.powerUps[type] <= 0) return;
    this.powerUps[type]--;
    if (type === 'time') {
      this.timeLeft += 10;
      document.getElementById('time').textContent = this.timeLeft;
    }
    if (type === 'hint') {
      // Elimina uma opção errada
      const optionsEl = document.getElementById('options');
      const btns = Array.from(optionsEl.querySelectorAll('button'));
      const wrongBtns = btns.filter(btn => btn.textContent != this.correctAnswer);
      if (wrongBtns.length > 0) {
        const toRemove = wrongBtns[Math.floor(Math.random() * wrongBtns.length)];
        toRemove.disabled = true;
        toRemove.style.visibility = 'hidden';
      }
    }
    // Atualiza contadores visuais dos power-ups
    document.getElementById('time-count').textContent = this.powerUps['time'];
    document.getElementById('hint-count').textContent = this.powerUps['hint'];
    document.getElementById('skip-count').textContent = this.powerUps['skip'];
    if (type === 'skip') {
      this.generateQuestion();
    }
  }

  // Métodos auxiliares vazios para evitar erros
  updateStats() {}
  updateCounters() {}
  updateHighScore() {}
  shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  checkAnswer(option) {
    const feedbackEl = document.getElementById('feedback');
    if (option === this.correctAnswer) {
      this.score++;
      feedbackEl.textContent = '✅ Correto!';
      feedbackEl.className = 'feedback correct';
    } else {
      feedbackEl.textContent = `❌ Errado! Resposta correta: ${this.correctAnswer}`;
      feedbackEl.className = 'feedback incorrect';
    }
    feedbackEl.style.display = 'block';
    // Avança para a próxima pergunta após 1 segundo
    setTimeout(() => this.generateQuestion(), 1000);
  }
  endGame() {
    clearInterval(this.timer);
    document.getElementById('game').style.display = 'none';
    document.getElementById('result').style.display = 'block';
    // Calcula acertos e erros
    const acertos = this.score;
    const erros = this.totalQuestions - this.score;
    document.getElementById('result-summary').textContent = `Você acertou ${acertos} e errou ${erros} de ${this.totalQuestions} perguntas!`;
  }
}

const game = new MathQuest();
window.onload = () => {
  console.log('window.onload chamado');
};

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);
