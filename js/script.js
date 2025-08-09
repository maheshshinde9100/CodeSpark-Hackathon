    // ------------------- Offline SAMPLE RESPONSE (from your message) -------------------
    const SAMPLE_RESPONSE = {
      "response_code": 0,
      "results": [
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Science: Computers",
          "question": "How fast is USB 3.1 Gen 2 theoretically?",
          "correct_answer": "10 Gb/s",
          "incorrect_answers": ["5 Gb/s", "8 Gb/s", "1 Gb/s"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Entertainment: Film",
          "question": "What character in the Winnie the Pooh films was added by Disney and does not appear in the original books?",
          "correct_answer": "Gopher",
          "incorrect_answers": ["Tigger", "Heffalumps", "Rabbit"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Sports",
          "question": "The song &quot;Three Lions&quot; by the Lightning Seeds was made for which major football event in 1996?",
          "correct_answer": "European Championships",
          "incorrect_answers": ["World Cup", "Champions League", "Confederations Cup"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Science &amp; Nature",
          "question": "The Axiom of Preventive Medicine states that people with ___ risk for a disease should be screened and we should treat ___ of those people.",
          "correct_answer": "low, all",
          "incorrect_answers": ["low, some", "high, all", "high, some"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Entertainment: Video Games",
          "question": "Where does &quot;The Legend of Zelda: Majora&#039;s Mask&quot; take place?",
          "correct_answer": "Termina",
          "incorrect_answers": ["Hyrule", "Gysahl", "Besaid"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Entertainment: Books",
          "question": "Which of these book series is by James Patterson?",
          "correct_answer": "Maximum Ride",
          "incorrect_answers": ["Harry Potter", "The Legend of Xanth", "The Bartemaeus Trilogy"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Geography",
          "question": "In which English county is the city of Portsmouth?",
          "correct_answer": "Hampshire",
          "incorrect_answers": ["Oxfordshire", "Buckinghamshire", "Surrey"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Sports",
          "question": "What cricketing term denotes a batsman being dismissed with a score of zero?",
          "correct_answer": "Duck",
          "incorrect_answers": ["Bye", "Beamer", "Carry"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Entertainment: Video Games",
          "question": "In &quot;Overwatch&quot;, Coalescence is the name for the ultimate of which hero?",
          "correct_answer": "Moira",
          "incorrect_answers": ["Zenyatta", "Torbjorn", "Symmetra"]
        },
        {
          "type": "multiple",
          "difficulty": "medium",
          "category": "Entertainment: Video Games",
          "question": "When was Club Penguin launched?",
          "correct_answer": "October 24, 2005",
          "incorrect_answers": ["October 21, 2005", "March 29, 2006", "November 22, 2004"]
        }
      ]
    };

    // ------------------- Utilities -------------------
    const $ = sel => document.querySelector(sel);
    const $$ = sel => document.querySelectorAll(sel);

    function showToast(msg){
      $('#toastBody').textContent = msg;
      const t = new bootstrap.Toast($('#toast'));
      t.show();
    }
    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

    // Decode helpers (for OpenTDB encode param or HTML entities)
    function htmlDecode(text){
      const el = document.createElement('textarea');
      el.innerHTML = text;
      return el.value;
    }
    function urlDecodeLegacy(text){ try { return decodeURIComponent(text); } catch { return text; } }
    function urlDecode3986(text){ try { return decodeURIComponent(text.replace(/%20/g,'+')); } catch { return text; } }
    function base64Decode(text){
      try { return atob(text); } catch { return text; }
    }
    function decodeByMode(s, mode){
      if(s == null) return '';
      switch(mode){
        case 'base64': return base64Decode(s);
        case 'urlLegacy': return urlDecodeLegacy(s);
        case 'url3986': return urlDecode3986(s);
        default: return htmlDecode(s);
      }
    }
    function shuffle(arr){
      const a = arr.slice();
      for(let i=a.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }
    function download(filename, text) {
      const el = document.createElement('a');
      el.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
      el.setAttribute('download', filename);
      el.style.display = 'none';
      document.body.appendChild(el);
      el.click();
      document.body.removeChild(el);
    }

    // ------------------- State -------------------
    const DEFAULT_TIME = 30; // seconds per question
    const state = {
      config: null,
      questions: [],
      idx: 0,
      timer: { startedAt: 0, remaining: DEFAULT_TIME, rafId: null, circumference: 2*Math.PI*52 },
      results: [],
      penaltyEnabled: false,
    };

    // ------------------- DOM refs -------------------
    const configCard = $('#config-card');
    const loadingCard = $('#loading');
    const quizCard = $('#quiz-card');
    const resultsCard = $('#results-card');

    const apiUrlPreview = $('#apiUrlPreview');
    const apiUrlLive = $('#apiUrlLive');

    const qCounter = $('#qCounter');
    const qCategory = $('#qCategory');
    const qDifficulty = $('#qDifficulty');
    const questionText = $('#questionText');
    const optionsEl = $('#options');

    const nextBtn = $('#nextBtn');
    const skipBtn = $('#skipBtn');
    const timerFg = $('#timerFg');
    const timeLabel = $('#timeLabel');
    const progressBar = $('#progressBar');

    const scoreLabel = $('#scoreLabel');
    const donut = $('#donut');
    const correctCountEl = $('#correctCount');
    const wrongCountEl = $('#wrongCount');
    const percentEl = $('#percent');
    const avgTimeEl = $('#avgTime');
    const breakdownBody = $('#breakdownBody');
    const penaltyHint = $('#penaltyHint');

    // ------------------- FX toggle -------------------
    const fxLayers = ['.fx-blobs','.fx-grid','.fx-scan','.fx-stars'].map(s=>$(s));
    $('#reduceFxBtn').addEventListener('click', ()=>{
      const hidden = fxLayers[0].style.display === 'none';
      fxLayers.forEach(el => el.style.display = hidden ? '' : 'none');
      showToast(hidden ? 'FX enabled' : 'FX disabled');
    });

    // ------------------- Config handling -------------------
    const configForm = $('#configForm');
    const amountInput = $('#amount');
    const categoryInput = $('#category');
    const difficultyInput = $('#difficulty');
    const typeInput = $('#type');
    const encodeInput = $('#encode');
    const penaltyInput = $('#penalty');

    // Restore last config
    const lastConfigStr = localStorage.getItem('neonquiz:lastConfig');
    if(lastConfigStr){
      try{
        const saved = JSON.parse(lastConfigStr);
        amountInput.value = saved.amount ?? 10;
        categoryInput.value = saved.category ?? '';
        difficultyInput.value = saved.difficulty ?? '';
        typeInput.value = saved.type ?? '';
        encodeInput.value = saved.encode ?? 'default';
        penaltyInput.checked = !!saved.penaltyEnabled;
      }catch{}
    }

    // Live URL preview on inputs
    [amountInput, categoryInput, difficultyInput, typeInput, encodeInput].forEach(el=>{
      el.addEventListener('input', ()=> {
        const cfg = getSanitizedConfig();
        apiUrlPreview.textContent = buildUrl(cfg);
      });
    });

    configForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      await startQuiz(getSanitizedConfig());
    });

    // Quick Start button (your exact endpoint)
    $('#quickSample').addEventListener('click', async ()=>{
      amountInput.value = '10';
      categoryInput.value = '9';
      difficultyInput.value = 'hard';
      typeInput.value = 'multiple';
      encodeInput.value = 'default';
      apiUrlPreview.textContent = buildUrl(getSanitizedConfig());
      await startQuiz(getSanitizedConfig());
    });

    // Offline Sample button (no network)
    $('#offlineSample').addEventListener('click', ()=>{
      runOfflineSample();
    });

    function getSanitizedConfig(){
      let amount = parseInt(amountInput.value, 10);
      if(Number.isNaN(amount)) amount = 10;
      amount = clamp(amount, 1, 50);

      // Normalize a common typo "multiples" => "multiple"
      let type = typeInput.value;
      if(type === 'multiples') type = 'multiple';

      return {
        amount,
        category: categoryInput.value ? parseInt(categoryInput.value,10) : null,
        difficulty: ['easy','medium','hard'].includes(difficultyInput.value) ? difficultyInput.value : null,
        type: ['multiple','boolean'].includes(type) ? type : null,
        encode: encodeInput.value || 'default',
      };
    }

    // ------------------- API -------------------
    function buildUrl({amount, category, difficulty, type, encode}){
      const base = new URL('https://opentdb.com/api.php');
      if(amount) base.searchParams.set('amount', String(amount));
      if(category) base.searchParams.set('category', String(category));
      if(difficulty) base.searchParams.set('difficulty', difficulty);
      if(type) base.searchParams.set('type', type);
      if(encode && encode !== 'default') base.searchParams.set('encode', encode);
      return base.toString();
    }

    function withTimeout(promise, ms = 10000){
      const ctrl = new AbortController();
      const t = setTimeout(()=>ctrl.abort(), ms);
      return Promise.race([
        promise(ctrl.signal),
        new Promise((_,rej)=>setTimeout(()=>rej(new Error('Timeout')), ms+10))
      ]).finally(()=>clearTimeout(t));
    }

    async function fetchQuestions(cfg){
      const url = buildUrl(cfg);
      apiUrlLive.textContent = url;
      const res = await withTimeout((signal)=>fetch(url, { signal }), 10000);
      if(!res.ok) throw new Error('Network error: ' + res.status);
      const json = await res.json();
      return json;
    }

    function mapResponseCode(code){
      switch(code){
        case 0: return { ok:true, msg:'OK' };
        case 1: return { ok:false, msg:'No questions found. Try different settings.' };
        case 2: return { ok:false, msg:'Invalid quiz configuration.' };
        case 3:
        case 4: return { ok:false, msg:'Session error. Reloading...' };
        default: return { ok:false, msg:'Unknown API response.' };
      }
    }

    function processResults(raw, encodeMode){
      const processed = raw.results.map((q)=>{
        const question = decodeByMode(q.question, encodeMode);
        const category = decodeByMode(q.category, encodeMode);
        const difficulty = decodeByMode(q.difficulty, encodeMode);
        const type = q.type;

        let options = [];
        const correctAnswer = decodeByMode(q.correct_answer, encodeMode);

        if(type === 'boolean'){
          options = ['True','False'];
        } else {
          options = q.incorrect_answers.map(a=>decodeByMode(a, encodeMode));
          options.push(correctAnswer);
          options = shuffle(options);
        }
        const correctIndex = options.findIndex(o => o === correctAnswer);

        return {
          question, category, difficulty, type,
          options, correctAnswer, correctIndex,
        };
      });
      return processed;
    }

    async function startQuiz(cfg){
      // Persist config + penalty
      state.penaltyEnabled = !!penaltyInput.checked;
      penaltyHint.textContent = state.penaltyEnabled ? '-0.5 penalty' : 'no penalty';
      state.config = cfg;

      localStorage.setItem('neonquiz:lastConfig', JSON.stringify({ ...cfg, penaltyEnabled: state.penaltyEnabled }));

      // UI
      resultsCard.classList.add('d-none');
      quizCard.classList.add('d-none');
      loadingCard.classList.remove('d-none');

      try{
        let data = await fetchQuestions(cfg);
        let status = mapResponseCode(data.response_code);
        if(!status.ok){
          if(data.response_code === 1){
            // Fallback: relax type
            const fallbackCfg = { ...cfg, type: null };
            data = await fetchQuestions(fallbackCfg);
            status = mapResponseCode(data.response_code);
            if(!status.ok) throw new Error(status.msg);
          } else {
            throw new Error(status.msg);
          }
        }

        const questions = processResults(data, cfg.encode);
        if(!questions.length) throw new Error('No questions after processing.');

        // Cache last success
        sessionStorage.setItem('neonquiz:lastQuestions', JSON.stringify({ cfg, data }));

        state.questions = questions;
        state.idx = 0;
        state.results = questions.map(()=>null);
        showQuiz();
        loadQuestion(0);
      } catch (err){
        showToast(err?.message || 'Failed to load quiz.');
        loadingCard.classList.add('d-none');
        configCard.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }

    function runOfflineSample(){
      // Force config aligned to your sample endpoint
      const cfg = { amount: 10, category: 9, difficulty: 'hard', type: 'multiple', encode: 'default' };
      apiUrlPreview.textContent = buildUrl(cfg);
      apiUrlLive.textContent = '(offline sample data)';

      resultsCard.classList.add('d-none');
      quizCard.classList.add('d-none');
      loadingCard.classList.remove('d-none');

      setTimeout(()=>{
        const questions = processResults(SAMPLE_RESPONSE, cfg.encode);
        state.config = cfg;
        state.penaltyEnabled = !!penaltyInput.checked;
        state.questions = questions;
        state.idx = 0;
        state.results = questions.map(()=>null);

        showQuiz();
        loadQuestion(0);
      }, 300);
    }

    function showQuiz(){
      loadingCard.classList.add('d-none');
      quizCard.classList.remove('d-none');
      configCard.classList.add('d-none');
      updateProgress();
    }

    function updateProgress(){
      const total = state.questions.length;
      const idx = state.idx + 1;
      const pct = Math.round((idx-1)/total*100);
      progressBar.style.width = pct + '%';
      qCounter.textContent = `Q ${idx}/${total}`;
    }

    function renderBadges(q){
      qCategory.textContent = q.category || 'Category';
      qDifficulty.textContent = (q.difficulty || '').toUpperCase();
      qDifficulty.classList.remove('text-success','text-warning','text-danger');
      if(q.difficulty === 'easy') qDifficulty.classList.add('text-success');
      if(q.difficulty === 'medium') qDifficulty.classList.add('text-warning');
      if(q.difficulty === 'hard') qDifficulty.classList.add('text-danger');
    }

    function renderOptions(q, selectedIndex){
      optionsEl.innerHTML = '';
      q.options.forEach((opt, i)=>{
        const btn = document.createElement('button');
        btn.className = 'btn option py-3 px-3 rounded-3';
        btn.innerHTML = `<span class="fw-semibold">${opt}</span>`;
        btn.dataset.index = i;
        btn.addEventListener('click', ()=> chooseOption(i));
        optionsEl.appendChild(btn);

        // Stagger animation
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(6px)';
        requestAnimationFrame(()=>{
          setTimeout(()=>{
            btn.style.transition = 'opacity .25s ease, transform .25s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateY(0)';
          }, 40*i);
        });
      });

      if(typeof selectedIndex === 'number'){
        markAnswer(selectedIndex);
      }
    }

    function loadQuestion(i){
      stopTimer();
      nextBtn.disabled = true;
      skipBtn.disabled = false;

      const q = state.questions[i];
      questionText.textContent = q.question;
      renderBadges(q);

      const prev = state.results[i];
      const selectedIndex = prev ? prev._selectedIndex : null;
      renderOptions(q, selectedIndex);

      startTimer(DEFAULT_TIME, ()=>{
        finalizeAnswer(null, DEFAULT_TIME);
      });

      updateProgress();
    }

    function chooseOption(i){
      $$('.option').forEach(el=>el.classList.add('disabled'));
      markAnswer(i);
      const elapsed = DEFAULT_TIME - state.timer.remaining;
      finalizeAnswer(i, elapsed);
    }

    function markAnswer(selectedIndex){
      const q = state.questions[state.idx];
      const correct = q.correctIndex;
      $$('.option').forEach((el, idx)=>{
        el.classList.add('disabled');
        if(idx === correct) el.classList.add('correct');
        if(typeof selectedIndex === 'number' && idx === selectedIndex && selectedIndex !== correct){
          el.classList.add('wrong');
        }
      });
      nextBtn.disabled = false;
      skipBtn.disabled = true;
    }

    function finalizeAnswer(selectedIndex, timeSpent){
      stopTimer();
      const q = state.questions[state.idx];
      const userAnswer = typeof selectedIndex === 'number' ? q.options[selectedIndex] : '';
      const isCorrect = userAnswer === q.correctAnswer;

      state.results[state.idx] = {
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        timeSpent: Math.round(clamp(timeSpent, 0, DEFAULT_TIME)),
        _selectedIndex: selectedIndex,
      };
    }

    nextBtn.addEventListener('click', ()=>{
      if(state.idx < state.questions.length-1){
        state.idx++;
        loadQuestion(state.idx);
      } else {
        finalizeQuiz();
      }
    });

    skipBtn.addEventListener('click', ()=>{
      const elapsed = DEFAULT_TIME - state.timer.remaining;
      finalizeAnswer(null, elapsed);
      if(state.idx < state.questions.length-1){
        state.idx++;
        loadQuestion(state.idx);
      } else {
        finalizeQuiz();
      }
    });

    function finalizeQuiz(){
      stopTimer();
      quizCard.classList.add('d-none');
      resultsCard.classList.remove('d-none');

      const answers = state.results.filter(Boolean);
      const total = answers.length;
      let correct = 0, wrong = 0, totalTime = 0, bonus = 0, base = 0, penalty = 0;

      answers.forEach(a=>{
        totalTime += a.timeSpent;
        if(a.isCorrect){
          correct += 1;
          base += 1;
          bonus += (DEFAULT_TIME - a.timeSpent)/10;
        }else{
          wrong += 1;
          if(state.penaltyEnabled) penalty -= 0.5;
        }
      });

      const rawScore = base + bonus + penalty;
      const score = Math.max(0, Math.round(rawScore * 100) / 100);
      const percent = total ? Math.round((correct / total) * 100) : 0;
      const avg = total ? Math.round((totalTime / total) * 10) / 10 : 0;

      scoreLabel.textContent = score.toString();
      correctCountEl.textContent = correct;
      wrongCountEl.textContent = wrong;
      percentEl.textContent = percent + '%';
      avgTimeEl.textContent = avg;

      donut.style.setProperty('--p', percent);

      breakdownBody.innerHTML = '';
      answers.forEach((a, idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${idx+1}</td>
          <td>${a.question}</td>
          <td class="${a.isCorrect ? 'text-success':'text-danger'}">${a.userAnswer || '<i class="text-secondary">—</i>'}</td>
          <td class="text-info">${a.correctAnswer}</td>
          <td>${a.timeSpent}</td>
          <td>${a.isCorrect ? '<span class="badge bg-success-subtle text-success-emphasis">Correct</span>' :
                               '<span class="badge bg-danger-subtle text-danger-emphasis">Wrong</span>'}</td>
        `;
        breakdownBody.appendChild(tr);
      });

      $('#downloadJson').onclick = ()=>{
        const pkg = {
          score,
          percentage: percent,
          timeStats: { total: totalTime, average: avg },
          breakdown: answers.map(({question,userAnswer,correctAnswer,isCorrect,timeSpent})=>({question,userAnswer,correctAnswer,isCorrect,timeSpent})),
          config: state.config,
          timestamp: new Date().toISOString(),
        };
        download('quiz-results.json', JSON.stringify(pkg, null, 2));
      };

      $('#playAgain').onclick = ()=>{
        resultsCard.classList.add('d-none');
        configCard.classList.remove('d-none');
        window.scrollTo({ top: 0, behavior:'smooth' });
      };
    }

    // ------------------- Timer -------------------
    function startTimer(seconds, onExpire){
      state.timer.startedAt = performance.now();
      state.timer.remaining = seconds;
      timeLabel.textContent = String(Math.ceil(state.timer.remaining));
      const C = state.timer.circumference;
      timerFg.setAttribute('stroke-dasharray', C.toFixed(2));
      timerFg.setAttribute('stroke-dashoffset', '0');

      function loop(ts){
        const elapsed = (ts - state.timer.startedAt)/1000;
        const remaining = clamp(seconds - elapsed, 0, seconds);
        state.timer.remaining = remaining;
        timeLabel.textContent = String(Math.ceil(remaining));

        const pct = remaining/seconds;
        const offset = C * (1 - pct);
        timerFg.setAttribute('stroke-dashoffset', offset.toFixed(2));

        if(remaining <= 0){
          cancelAnimationFrame(state.timer.rafId);
          state.timer.rafId = null;
          onExpire && onExpire();
          return;
        }
        state.timer.rafId = requestAnimationFrame(loop);
      }
      cancelAnimationFrame(state.timer.rafId);
      state.timer.rafId = requestAnimationFrame(loop);
    }
    function stopTimer(){
      if(state.timer.rafId){
        cancelAnimationFrame(state.timer.rafId);
        state.timer.rafId = null;
      }
    }

    // ------------------- Startup -------------------
    (function init(){
      const cfg = getSanitizedConfig();
      apiUrlPreview.textContent = buildUrl(cfg);
      const cached = sessionStorage.getItem('neonquiz:lastQuestions');
      if(cached){
        try{
          const { cfg: lastCfg } = JSON.parse(cached);
          showToast('Cached quiz available. Press "Start Quiz" or "Quick Start".');
          apiUrlPreview.textContent = buildUrl(lastCfg || cfg);
        }catch{}
      }
    })();
