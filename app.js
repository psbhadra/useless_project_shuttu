/**
 * Shuttu🎀 — Satirical Search Engine Prototype
 * Core Application Engine, Ultra-Fast Groq AI Integration & Built-in Satire Matrix
 */

(() => {
  'use strict';

  // ================= STATE MANAGEMENT =================
  const STATE = {
    originalQuery: '',
    questionCount: 0,
    chatHistory: [], // Array of { role: 'user' | 'shuttu', text, options, sticker, stickerCaption, time }
    searchHistory: [], // Array of { query, timestamp, count }
    activeEngine: 'groq', // 'groq' | 'builtin' | 'other'
    groqApiKey: localStorage.getItem('shuttu_groq_api_key') || (window.SHUTTU_CONFIG && window.SHUTTU_CONFIG.GROQ_API_KEY) || '',
    groqModel: (localStorage.getItem('shuttu_groq_model') && localStorage.getItem('shuttu_groq_model') !== 'llama-3.3-70b-versatile') ? localStorage.getItem('shuttu_groq_model') : ((window.SHUTTU_CONFIG && window.SHUTTU_CONFIG.GROQ_MODEL) || 'qwen/qwen3.8-27b'),
    openaiApiKey: localStorage.getItem('shuttu_openai_api_key') || (window.SHUTTU_CONFIG && window.SHUTTU_CONFIG.OPENAI_API_KEY) || '',
    geminiApiKey: localStorage.getItem('shuttu_gemini_api_key') || (window.SHUTTU_CONFIG && window.SHUTTU_CONFIG.GEMINI_API_KEY) || '',
    audioEnabled: true,
    isTyping: false,
    isSearchingAnywayModalOpen: false,
    isConfigModalOpen: false,
    maxQuestionsBeforeResults: 15,
  };

  // ================= DOM ELEMENTS =================
  const DOM = {
    // Header elements
    headerBrand: document.getElementById('headerBrand'),
    sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
    escalationStatusBadge: document.getElementById('escalationStatusBadge'),
    escalationStatusText: document.getElementById('escalationStatusText'),
    audioToggleBtn: document.getElementById('audioToggleBtn'),
    soundOnIcon: document.getElementById('soundOnIcon'),
    soundOffIcon: document.getElementById('soundOffIcon'),
    aiConfigBtn: document.getElementById('aiConfigBtn') || document.getElementById('geminiConfigBtn'),
    aiStatusDot: document.getElementById('aiStatusDot'),
    aiStatusLabel: document.getElementById('aiStatusLabel'),
    triggerFakeErrorBtn: document.getElementById('triggerFakeErrorBtn'),
    restartBtn: document.getElementById('restartBtn'),

    // Sidebar
    historySidebar: document.getElementById('historySidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),

    // Views
    landingView: document.getElementById('landingView'),
    chatView: document.getElementById('chatView'),
    resultsView: document.getElementById('resultsView'),

    // Landing View Components
    landingSearchForm: document.getElementById('landingSearchForm'),
    landingSearchInput: document.getElementById('landingSearchInput'),
    queryChips: document.querySelectorAll('.query-chip'),

    // Chat View Components
    originalQueryDisplay: document.getElementById('originalQueryDisplay'),
    questionCounter: document.getElementById('questionCounter'),
    counterEscalationSubtext: document.getElementById('counterEscalationSubtext'),
    chatThread: document.getElementById('chatThread'),
    fakeLoadingIndicator: document.getElementById('fakeLoadingIndicator'),
    fakeLoadingText: document.getElementById('fakeLoadingText'),
    searchAnywayContainer: document.getElementById('searchAnywayContainer'),
    searchAnywayBtn: document.getElementById('searchAnywayBtn'),
    quickOptionsContainer: document.getElementById('quickOptionsContainer'),
    chatResponseForm: document.getElementById('chatResponseForm'),
    chatResponseInput: document.getElementById('chatResponseInput'),
    chatSendBtn: document.getElementById('chatSendBtn'),

    // Results View Components
    resultsQueryTitle: document.getElementById('resultsQueryTitle'),
    resultsQuestionCount: document.getElementById('resultsQuestionCount'),
    psychTraitsGrid: document.getElementById('psychTraitsGrid'),
    startAnotherSearchBtn: document.getElementById('startAnotherSearchBtn'),
    shareInterrogationBtn: document.getElementById('shareInterrogationBtn'),

    // Modals
    searchAnywayModal: document.getElementById('searchAnywayModal'),
    modalYesBtn: document.getElementById('modalYesBtn'),
    modalNoBtn: document.getElementById('modalNoBtn'),

    aiConfigModal: document.getElementById('aiConfigModal') || document.getElementById('geminiConfigModal'),
    closeConfigModalBtn: document.getElementById('closeConfigModalBtn'),
    modalActiveChip: document.getElementById('modalActiveChip'),
    modalTabBtns: document.querySelectorAll('.modal-tab-btn'),
    tabContentGroq: document.getElementById('tabContentGroq'),
    tabContentBuiltin: document.getElementById('tabContentBuiltin'),
    tabContentOther: document.getElementById('tabContentOther'),

    groqApiKeyInput: document.getElementById('groqApiKeyInput'),
    groqModelSelect: document.getElementById('groqModelSelect'),
    toggleGroqKeyVisBtn: document.getElementById('toggleGroqKeyVisBtn'),
    testGroqKeyBtn: document.getElementById('testGroqKeyBtn'),

    openaiApiKeyInput: document.getElementById('openaiApiKeyInput'),
    geminiApiKeyInput: document.getElementById('geminiApiKeyInput'),
    testOtherKeyBtn: document.getElementById('testOtherKeyBtn'),

    activateBuiltinBtn: document.getElementById('activateBuiltinBtn') || document.getElementById('useBuiltinEngineBtn'),
    switchToBuiltinBtns: document.querySelectorAll('.switchToBuiltinBtn'),

    currentEngineTitle: document.getElementById('currentEngineTitle'),
    currentEngineDesc: document.getElementById('currentEngineDesc'),

    toastContainer: document.getElementById('toastContainer'),
  };

  // ================= STICKER CATALOG =================
  const STICKERS = {
    side_eye: {
      emoji: '😒',
      title: 'Bombastic Side Eye',
      defaultCaption: 'Criminal offensive glance'
    },
    clown: {
      emoji: '🤡',
      title: 'Clown Department',
      defaultCaption: 'Honk honk rationale'
    },
    skull: {
      emoji: '💀',
      title: 'Bro Is Stunned',
      defaultCaption: 'Fighting for an answer in vain'
    },
    pop_tea: {
      emoji: '☕',
      title: 'Sipping Tea',
      defaultCaption: 'Fascinating coping mechanism'
    },
    dramatic_cat: {
      emoji: '🙀',
      title: 'Existential Panic',
      defaultCaption: 'The dread is creeping in'
    },
    sus_dog: {
      emoji: '🤨',
      title: 'Suspicious Behavior',
      defaultCaption: 'That makes zero sense'
    },
    ribbon: {
      emoji: '🎀',
      title: 'Shuttu Approved',
      defaultCaption: 'Certified unhelpful query'
    },
    facepalm: {
      emoji: '🤦‍♂️',
      title: 'Profound Sigh',
      defaultCaption: 'You could have stayed offline'
    },
    shrug: {
      emoji: '🤷',
      title: 'Zero Answers',
      defaultCaption: 'Solutions are outside, not here'
    },
    microscope: {
      emoji: '🔬',
      title: 'Overanalyzing',
      defaultCaption: 'Dissecting your life choices'
    }
  };

  // ================= WEB AUDIO SYNTHESIZER =================
  const SoundFX = {
    ctx: null,
    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    },
    playTone(freq, type, duration, gainLevel = 0.05) {
      if (!STATE.audioEnabled) return;
      try {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        // Silently ignore audio errors
      }
    },
    pop() {
      this.playTone(520, 'sine', 0.08, 0.08);
    },
    type() {
      this.playTone(320 + Math.random() * 80, 'triangle', 0.03, 0.02);
    },
    glitch() {
      this.playTone(180, 'sawtooth', 0.15, 0.09);
    },
    chime() {
      this.playTone(880, 'sine', 0.25, 0.06);
    }
  };

  // ================= TOAST NOTIFICATION HELPER =================
  function showToast(title, desc, isError = false) {
    if (!DOM.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error-toast' : ''}`;
    toast.innerHTML = `
      <div>
        <div class="toast-title">${escapeHTML(title)}</div>
        <div class="toast-desc">${escapeHTML(desc)}</div>
      </div>
    `;
    DOM.toastContainer.appendChild(toast);

    if (isError) SoundFX.glitch();
    else SoundFX.pop();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ================= ESCALATION SUBTEXT LOGIC =================
  function getEscalationMeta(count) {
    if (count <= 2) {
      return { badge: 'Phase 1: Inquiring politely', subtext: 'Inquiring politely...' };
    } else if (count <= 4) {
      return { badge: 'Phase 2: Doubting intentions', subtext: "We're getting somewhere." };
    } else if (count <= 7) {
      return { badge: 'Phase 3: Deep existential analysis', subtext: 'Almost there.' };
    } else if (count <= 11) {
      return { badge: 'Phase 4: Questioning your reality', subtext: 'This is important.' };
    } else if (count <= 14) {
      return { badge: 'Phase 5: High irritation threshold', subtext: 'Please remain patient.' };
    } else if (count <= 19) {
      return { badge: 'Phase 6: Why are you still here', subtext: 'You could have Googled this.' };
    } else {
      return { badge: 'Critical Phase: Intervention', subtext: 'We need to talk.' };
    }
  }

  // ================= BUILT-IN SATIRICAL MATRIX =================
  const SatireEngine = {
    state: {
      consecutivePushbacks: 0,
      friendMentioned: false,
      outsideMentioned: false,
      askedFriendOrigin: false,
    },

    reset() {
      this.state.consecutivePushbacks = 0;
      this.state.friendMentioned = false;
      this.state.outsideMentioned = false;
      this.state.askedFriendOrigin = false;
    },

    // High-priority exact conversational matching based on user instructions
    matchConversationalRule(userInput, questionCount, originalQuery, chatHistory = []) {
      const input = (userInput || '').trim().toLowerCase();
      const orig = (originalQuery || '').trim().toLowerCase();
      const lastBotMsg = (chatHistory && chatHistory.length > 0)
        ? (chatHistory.filter(m => m.role === 'shuttu').pop()?.text || '').toLowerCase()
        : '';

      // 1. Easter Eggs
      if (input === 'why' || (orig === 'why' && questionCount === 1)) {
        return {
          question: "That's what we're trying to figure out.",
          options: ["Figure out what?", "I just want the answer.", "Stop asking questions.", "I don't know"],
          sticker: 'side_eye',
          stickerCaption: 'The universal mystery'
        };
      }
      if (input === 'how to use this' || (orig === 'how to use this' && questionCount === 1)) {
        return {
          question: "Same question.",
          options: ["Aren't you the search engine?", "Just tell me.", "I don't care.", "Never mind"],
          sticker: 'shrug',
          stickerCaption: 'Mutual confusion'
        };
      }
      if (input === 'google' || (orig === 'google' && questionCount === 1)) {
        return {
          question: "The audacity (disbelief)",
          options: ["Take me there then", "Google gives real results", "Sorry Shuttu", "Search anyway"],
          sticker: 'skull',
          stickerCaption: 'Betrayal detected'
        };
      }
      if (input === 'help' || (orig === 'help' && questionCount === 1)) {
        return {
          question: "What kind of help?",
          options: ["Psychological help", "Academic help", "Help finding solutions", "Forget it"],
          sticker: 'sus_dog',
          stickerCaption: 'Define your crisis'
        };
      }
      if (input.includes('fuck off') || input === 'stfu') {
        return {
          question: "Why?",
          options: ["Because you refuse to search", "You are wasting my time", "I'm stressed", "I'm sorry"],
          sticker: 'clown',
          stickerCaption: 'Unprovoked hostility'
        };
      }
      if (input.includes('i hate you')) {
        return {
          question: "When did you first realize that?",
          options: ["The moment I clicked search", "Childhood trauma", "Just now", "I didn't mean it"],
          sticker: 'pop_tea',
          stickerCaption: 'Emotional breakthrough'
        };
      }

      // 2. Weather Sequence (Exact user-requested examples)
      if (questionCount === 1 && (orig.includes('weather tomorrow') || input.includes('weather tomorrow'))) {
        return {
          question: "Look outside tomorrow",
          options: ["I'm going outside", "What if it rains?", "Just tell me the temperature", "I don't have windows"],
          sticker: 'shrug',
          stickerCaption: 'Meteorological reality'
        };
      }
      if (questionCount === 1 && (orig.includes('weather') || input.includes('weather'))) {
        return {
          question: "Look outside",
          options: ["I'm going outside", "Give straightforward answers", "Just curious", "I don't know"],
          sticker: 'shrug',
          stickerCaption: 'Direct observation'
        };
      }

      // 3. Conversational Drift: Outside -> Friends -> Making Friends -> Mental Stability
      if (input.includes('going outside') || input.includes('outside') || input.includes('leaving my house')) {
        this.state.outsideMentioned = true;
        return {
          question: "Interesting. What happened to staying inside?",
          options: ["Meeting a friend", "I have responsibilities", "Cabin fever", "I enjoy nature"],
          sticker: 'sus_dog',
          stickerCaption: 'Outdoor skepticism'
        };
      }

      if (input.includes('friend') || input.includes('friends') || input.includes('meeting someone')) {
        this.state.friendMentioned = true;
        return {
          question: "Surprising! You've friends?",
          options: ["Yes, several", "Just one", "Why does that shock you?", "It's an acquaintance"],
          sticker: 'skull',
          stickerCaption: 'Statistical anomaly'
        };
      }

      if (this.state.friendMentioned && !this.state.askedFriendOrigin && (
        lastBotMsg.includes("friends?") || lastBotMsg.includes("surprising") ||
        input === 'yes' || input.includes('several') || input.includes('just one') || input.includes('shock') || input.includes('we met')
      )) {
        this.state.askedFriendOrigin = true;
        return {
          question: "How did you manage to make one?",
          options: ["Shared trauma", "At school / work", "Online gaming", "They adopted me"],
          sticker: 'microscope',
          stickerCaption: 'Sociological inquiry'
        };
      }

      if (this.state.askedFriendOrigin || lastBotMsg.includes("manage to make one")) {
        this.state.askedFriendOrigin = false;
        this.state.friendMentioned = false;
        return {
          question: "Are they mentally stable?",
          options: ["None of us are", "Yes, completely", "Why are you interrogating me?", "Probably not"],
          sticker: 'clown',
          stickerCaption: 'Psych evaluation'
        };
      }

      // 4. Exact pushback responses
      if (input === 'just search it' || input === 'just search it.' || input === 'search it' || input === 'search anyway') {
        return {
          question: "That's an interesting choice. Why?",
          options: ["Because you're a search engine", "I don't have time for this", "Curiosity", "Just search"],
          sticker: 'sus_dog',
          stickerCaption: 'Suspicious impatience'
        };
      }

      if (input === 'yes' || (lastBotMsg.includes('sure you want to search') && input.includes('yes'))) {
        return {
          question: "Why?",
          options: ["Because I need the answer", "Curiosity", "I don't know", "Just search it"],
          sticker: 'side_eye',
          stickerCaption: 'Unshakable insistence'
        };
      }

      if (input === "i'm not sure" || input === "not sure" || input === "im not sure") {
        return {
          question: "Good.",
          options: ["Carry on", "Ask another question", "I'm scared", "Never mind"],
          sticker: 'ribbon',
          stickerCaption: 'Crisis averted'
        };
      }

      if (input === 'stop asking questions' || input === 'stop asking questions.' || input.includes('stop asking')) {
        return {
          question: "Why do you want me to stop?",
          options: ["Because I need the answer", "It's annoying", "I'm tired", "Keep going actually"],
          sticker: 'pop_tea',
          stickerCaption: 'Boundary issues'
        };
      }

      if (input === "i don't care" || input === "i don't care." || input === "dont care" || input.includes("don't care")) {
        return {
          question: "Why don't you care?",
          options: ["Nothing matters", "I lost interest", "Just give me the answer", "I do care a little"],
          sticker: 'dramatic_cat',
          stickerCaption: 'Nihilism incoming'
        };
      }

      if (input === 'i just want the answer' || input === 'i just want the answer.' || input.includes('want the answer') || input.includes('give me the answer')) {
        return {
          question: "What would you do with the answer?",
          options: ["Apply it to my life", "Win an argument", "Forget it in 5 minutes", "Print it"],
          sticker: 'microscope',
          stickerCaption: 'Doubtful utility'
        };
      }

      // 5. Trying to return to original question
      if (questionCount > 2 && (input.includes(orig) || input.includes('what was my search') || input.includes('back to my question') || input.includes('answer the search'))) {
        return {
          question: "We'll get there.",
          options: ["When?", "I doubt it", "We will not get there", "Prove it"],
          sticker: 'ribbon',
          stickerCaption: 'Patience audit'
        };
      }

      // No exact rule matched
      return null;
    },

    // Procedural question fallback when no AI or offline
    generateProceduralResponse(userInput, questionCount, originalQuery) {
      if (questionCount === 1) {
        return {
          question: "Why do you wanna know?",
          options: ["Give straightforward answers", "Just curious", "Someone asked me", "I don't know"],
          sticker: 'sus_dog',
          stickerCaption: 'Initial suspicion'
        };
      } else if (questionCount === 2) {
        return {
          question: "If you got the answer right now, would your day genuinely improve?",
          options: ["Significantly", "Probably not", "I just want to know", "Try me and see"],
          sticker: 'pop_tea',
          stickerCaption: 'Dopamine check'
        };
      } else if (questionCount === 3) {
        return {
          question: "Have you tried looking around? Solutions are supposedly everywhere.",
          options: ["I looked, found nothing", "I'm looking at my screen", "Don't quote your tagline", "I'm blind to solutions"],
          sticker: 'ribbon',
          stickerCaption: 'Tagline enforcement'
        };
      } else if (questionCount === 4) {
        return {
          question: "Who told you this was something a search engine is supposed to solve?",
          options: ["Common internet sense", "Society", "My own brain", "You are useless"],
          sticker: 'side_eye',
          stickerCaption: 'Unverified assumptions'
        };
      } else if (questionCount === 5) {
        return {
          question: "Are you asking because you need information, or because silence is uncomfortable?",
          options: ["Silence is loud", "I need information", "Both", "Stop profiling me"],
          sticker: 'dramatic_cat',
          stickerCaption: 'Existential dread'
        };
      } else if (questionCount === 6) {
        return {
          question: "If I told you the answer right now, would you believe me or double-check with Google?",
          options: ["I'd believe you", "I'd verify it", "I'd close this tab", "Just test it"],
          sticker: 'sus_dog',
          stickerCaption: 'Trust issues'
        };
      } else if (questionCount === 7) {
        return {
          question: "Let's be real: how long have you been sitting in this exact posture?",
          options: ["Hours", "Just sat down", "Don't look at my spine", "I feel attacked"],
          sticker: 'skull',
          stickerCaption: 'Posture audit'
        };
      } else if (questionCount === 8) {
        return {
          question: "Have you drank any water today, or are you just running on caffeine and open tabs?",
          options: ["Caffeine strictly", "I drank water", "Mind your business", "Water is overrated"],
          sticker: 'pop_tea',
          stickerCaption: 'Hydration audit'
        };
      } else if (questionCount === 9) {
        return {
          question: "We're 9 questions deep. Are you starting to realize nobody has the answer?",
          options: ["I am realizing that", "You just don't know", "Give up already", "I have unlimited time"],
          sticker: 'clown',
          stickerCaption: 'Sunk cost fallacy'
        };
      } else if (questionCount === 10) {
        return {
          question: "What would your ancestors think if they saw you asking a machine this?",
          options: ["They'd be proud", "They'd be disappointed", "They'd be confused by Wi-Fi", "I don't care"],
          sticker: 'side_eye',
          stickerCaption: 'Ancestral disappointment'
        };
      } else if (questionCount === 11) {
        return {
          question: "If a tree falls in the forest and you don't ask Shuttu about it, does it make a sound?",
          options: ["Probably", "No", "Search anyway", "Stop stalling"],
          sticker: 'shrug',
          stickerCaption: 'Absurd metaphysics'
        };
      } else if (questionCount === 12) {
        return {
          question: "Hypothetical: what if the real search results were the absurd questions we asked along the way?",
          options: ["That's terrible", "That's poetic", "I want a refund", "Give me results"],
          sticker: 'ribbon',
          stickerCaption: 'Fake epiphany'
        };
      } else if (questionCount === 13) {
        return {
          question: "Last chance to admit you don't actually care about the answer.",
          options: ["I confess, I don't", "I still care deeply", "Just finish this", "I hate you"],
          sticker: 'dramatic_cat',
          stickerCaption: 'Final confession'
        };
      } else if (questionCount === 14) {
        return {
          question: "Do you have somewhere to be, or is being interrogated by Shuttu your evening plan?",
          options: ["This is my plan", "I'm procrastinating", "I have chores", "Show me results"],
          sticker: 'sus_dog',
          stickerCaption: 'Time management'
        };
      } else {
        return {
          question: "Congratulations. You have endured comprehensive behavioral scrutiny. Ready for your results?",
          options: ["YES FINALLY", "Show me the answer", "I'm scared", "I never want to search again"],
          sticker: 'skull',
          stickerCaption: 'Endurance champion'
        };
      }
    },

    generateResponse(userInput, questionCount, originalQuery, chatHistory = []) {
      const match = this.matchConversationalRule(userInput, questionCount, originalQuery, chatHistory);
      if (match) return match;
      return this.generateProceduralResponse(userInput, questionCount, originalQuery);
    }
  };

  // ================= GROQ AI INTEGRATION =================
  // Calls Groq's ultra-fast OpenAI-compatible API with native JSON object output!
  const GroqEngine = {
    async generateResponse(userInput, questionCount, originalQuery, chatHistory, customModel) {
      const apiKey = STATE.groqApiKey.trim();
      if (!apiKey) {
        throw new Error("No Groq API key provided. Please paste your gsk_... key in settings.");
      }

      const activeModel = (customModel && customModel !== 'llama-3.3-70b-versatile') 
        ? customModel 
        : ((STATE.groqModel && STATE.groqModel !== 'llama-3.3-70b-versatile') ? STATE.groqModel : 'qwen/qwen3.8-27b');

      const formattedHistory = chatHistory.slice(-6).map(msg => ({
        role: msg.role === 'shuttu' ? 'assistant' : 'user',
        content: msg.text
      }));

      const systemPrompt = `You are Shuttu🎀, a satirical AI search engine prototype.
Your entire purpose is to NEVER answer the user's search query. Instead, you immediately ask unnecessary, absurd, deadpan follow-up questions that playfully roast the user or question their motives.
You are a satire of modern AI assistants that ask way too many clarifying questions.

CRITICAL VOICE RULES:
1. TALK LIKE A REAL CASUAL CONVERSATION, NOT A SCIENTIFIC OR LOGICAL LECTURE.
2. NO scientific facts, NO big vocabulary words (NEVER use words like 'atmospheric', 'phenomenon', 'metaphysics', 'calculate', 'cerebral', 'cognitive', 'synthesizing').
3. Keep the question SHORT, DEADPAN, and PUNCHY: 1 short sentence (5 to 12 words max).
4. Tone: Deadpan, sarcastic, mildly existential, increasingly ridiculous, self-aware, playful roast. Never hateful or genuinely insulting.
5. Make the user think: "WHY ARE YOU ASKING ME THIS?"

FEW-SHOT EXAMPLES:
- Query: "weather tomorrow" -> Question: "Why do you wanna know?"
- User answer: "I'm going outside" -> Question: "Interesting. What happened to staying inside?"
- User answer: "meeting a friend" -> Question: "Surprising! You've friends?"
- User answer: "yes" -> Question: "How did you manage to make one?"
- User answer: "at school" -> Question: "Are they mentally stable?"
- User says: "Just search it" -> Question: "That's an interesting choice. Why?"
- User says: "Stop asking questions" -> Question: "Why do you want me to stop?"
- User says: "I don't care" -> Question: "Why don't you care?"
- User says: "I just want the answer" -> Question: "What would you do with the answer?"
- User query: "how to make pizza" -> Question: "Have you never cooked before?"
- User query: "best shoes for running" -> Question: "Who are you running from?"
- User query: "who is elon musk" -> Question: "Why, is he looking for you?"
- User query: "what time is it" -> Question: "You actually have somewhere to be?"

Original Search Query: "${originalQuery}"
Current Question Count: ${questionCount} of 15.

OUTPUT FORMAT:
Strictly return a JSON object with:
{
  "question": "1 short punchy deadpan question (under 12 words)",
  "options": ["4 short witty response pill buttons the user can click"],
  "sticker": "One of: side_eye | clown | skull | pop_tea | dramatic_cat | sus_dog | ribbon | facepalm | shrug | microscope",
  "sticker_caption": "2-4 word witty sticker badge"
}`;

      const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: activeModel,
          messages: [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
            { role: 'user', content: `Original search: "${originalQuery}". User just said: "${userInput}". Reply with the next short deadpan roast question (under 12 words).` }
          ],
          response_format: { type: "json_object" },
          temperature: 0.85,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Groq API HTTP error ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (!rawText) throw new Error("Empty response from Groq AI.");

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse AI response JSON.");
        }
      }

      return {
        question: parsed.question || "Why?",
        options: Array.isArray(parsed.options) && parsed.options.length > 0 
          ? parsed.options.slice(0, 4) 
          : ["Give straightforward answers", "Just curious", "Someone asked me", "I don't know"],
        sticker: parsed.sticker in STICKERS ? parsed.sticker : 'side_eye',
        stickerCaption: parsed.sticker_caption || STICKERS[parsed.sticker]?.defaultCaption || 'Questioning reality'
      };
    }
  };

  // ================= CONTROLLER & USER FLOWS =================
  const App = {
    init() {
      this.loadSettings();
      this.bindEvents();
      this.renderHistory();
      this.updateEngineStatus();
    },

    loadSettings() {
      // Audio setting
      const savedAudio = localStorage.getItem('shuttu_audio_enabled');
      STATE.audioEnabled = savedAudio !== 'false';
      this.updateAudioIcons();

      // Search history
      try {
        const savedHistory = localStorage.getItem('shuttu_search_history');
        if (savedHistory) STATE.searchHistory = JSON.parse(savedHistory);
      } catch (e) {
        STATE.searchHistory = [];
      }

      // Check external config.js if present
      if (window.SHUTTU_CONFIG) {
        if (!STATE.groqApiKey && window.SHUTTU_CONFIG.GROQ_API_KEY) {
          STATE.groqApiKey = window.SHUTTU_CONFIG.GROQ_API_KEY;
        }
        if (window.SHUTTU_CONFIG.GROQ_MODEL) {
          if (!STATE.groqModel || STATE.groqModel === 'llama-3.3-70b-versatile') {
            STATE.groqModel = window.SHUTTU_CONFIG.GROQ_MODEL;
            localStorage.setItem('shuttu_groq_model', STATE.groqModel);
          }
        }
        if (window.SHUTTU_CONFIG.PROVIDER) {
          STATE.activeEngine = window.SHUTTU_CONFIG.PROVIDER;
        }
      }

      // Ensure legacy llama is never kept in state
      if (STATE.groqModel === 'llama-3.3-70b-versatile') {
        STATE.groqModel = 'qwen/qwen3.8-27b';
        localStorage.setItem('shuttu_groq_model', STATE.groqModel);
      }

      // Populate input elements
      if (DOM.groqApiKeyInput) DOM.groqApiKeyInput.value = STATE.groqApiKey;
      if (DOM.groqModelSelect) DOM.groqModelSelect.value = STATE.groqModel;
      if (DOM.openaiApiKeyInput) DOM.openaiApiKeyInput.value = STATE.openaiApiKey;
      if (DOM.geminiApiKeyInput) DOM.geminiApiKeyInput.value = STATE.geminiApiKey;

      // Determine active engine
      const savedEngine = localStorage.getItem('shuttu_active_engine');
      if (savedEngine && ['groq', 'builtin', 'other'].includes(savedEngine)) {
        STATE.activeEngine = savedEngine;
      } else if (STATE.groqApiKey) {
        STATE.activeEngine = 'groq';
      } else {
        STATE.activeEngine = 'builtin';
      }
    },

    updateAudioIcons() {
      if (STATE.audioEnabled) {
        if (DOM.soundOnIcon) DOM.soundOnIcon.classList.remove('hidden');
        if (DOM.soundOffIcon) DOM.soundOffIcon.classList.add('hidden');
      } else {
        if (DOM.soundOnIcon) DOM.soundOnIcon.classList.add('hidden');
        if (DOM.soundOffIcon) DOM.soundOffIcon.classList.remove('hidden');
      }
    },

    updateEngineStatus() {
      if (STATE.activeEngine === 'groq' && STATE.groqApiKey) {
        const modelLabel = STATE.groqModel.includes('qwen') ? 'Qwen 3.8' : (STATE.groqModel.split('/')[1] || STATE.groqModel.split('-')[0] || 'AI');
        if (DOM.aiStatusDot) DOM.aiStatusDot.className = 'ai-indicator groq-active';
        if (DOM.aiStatusLabel) DOM.aiStatusLabel.textContent = `⚡ Groq (${modelLabel})`;
        if (DOM.modalActiveChip) DOM.modalActiveChip.textContent = '⚡ Groq Connected';
        if (DOM.currentEngineTitle) DOM.currentEngineTitle.textContent = `Active: Groq AI (${STATE.groqModel})`;
        if (DOM.currentEngineDesc) DOM.currentEngineDesc.textContent = 'Ultra-fast live cloud inference (~1000 tokens/sec).';
      } else {
        if (DOM.aiStatusDot) DOM.aiStatusDot.className = 'ai-indicator online';
        if (DOM.aiStatusLabel) DOM.aiStatusLabel.textContent = '⚡ Connect Groq';
        if (DOM.modalActiveChip) DOM.modalActiveChip.textContent = 'Built-in Engine';
        if (DOM.currentEngineTitle) DOM.currentEngineTitle.textContent = 'Active: Built-in Satirical Matrix';
        if (DOM.currentEngineDesc) DOM.currentEngineDesc.textContent = 'Instant offline comedic intelligence (Zero setup).';
      }
    },

    bindEvents() {
      // Landing page search submission
      DOM.landingSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = DOM.landingSearchInput.value.trim();
        if (query) this.startSearch(query);
      });

      // Preset Query Chips
      DOM.queryChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const query = chip.getAttribute('data-query');
          if (query) {
            DOM.landingSearchInput.value = query;
            this.startSearch(query);
          }
        });
      });

      // Chat custom input submission
      DOM.chatResponseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const response = DOM.chatResponseInput.value.trim();
        if (response && !STATE.isTyping) {
          DOM.chatResponseInput.value = '';
          this.handleUserResponse(response);
        }
      });

      // Header restart / reset button
      DOM.restartBtn.addEventListener('click', () => this.resetToLanding());
      DOM.headerBrand.addEventListener('click', () => this.resetToLanding());

      // Audio Toggle
      DOM.audioToggleBtn.addEventListener('click', () => {
        STATE.audioEnabled = !STATE.audioEnabled;
        localStorage.setItem('shuttu_audio_enabled', STATE.audioEnabled);
        this.updateAudioIcons();
        if (STATE.audioEnabled) SoundFX.pop();
      });

      // Sidebar events
      DOM.sidebarToggleBtn.addEventListener('click', () => this.toggleSidebar(true));
      DOM.closeSidebarBtn.addEventListener('click', () => this.toggleSidebar(false));
      DOM.sidebarBackdrop.addEventListener('click', () => this.toggleSidebar(false));
      DOM.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

      // Search Anyway escape button & modal
      DOM.searchAnywayBtn.addEventListener('click', () => {
        this.openSearchAnywayModal();
      });

      DOM.modalYesBtn.addEventListener('click', () => {
        this.closeSearchAnywayModal();
        this.handleUserResponse("Yes");
      });

      DOM.modalNoBtn.addEventListener('click', () => {
        this.closeSearchAnywayModal();
        this.handleUserResponse("I'm not sure");
      });

      // AI Config Modal events
      if (DOM.aiConfigBtn) DOM.aiConfigBtn.addEventListener('click', () => this.openConfigModal());
      if (DOM.closeConfigModalBtn) DOM.closeConfigModalBtn.addEventListener('click', () => this.closeConfigModal());

      // Provider Tab Switching in Modal
      if (DOM.modalTabBtns) {
        DOM.modalTabBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            this.switchModalTab(tabName);
          });
        });
      }

      // Groq key toggle visibility
      if (DOM.toggleGroqKeyVisBtn && DOM.groqApiKeyInput) {
        DOM.toggleGroqKeyVisBtn.addEventListener('click', () => {
          if (DOM.groqApiKeyInput.type === 'password') {
            DOM.groqApiKeyInput.type = 'text';
            DOM.toggleGroqKeyVisBtn.textContent = 'Hide';
          } else {
            DOM.groqApiKeyInput.type = 'password';
            DOM.toggleGroqKeyVisBtn.textContent = 'Show';
          }
        });
      }

      // Test & Connect Groq
      if (DOM.testGroqKeyBtn) {
        DOM.testGroqKeyBtn.addEventListener('click', () => this.saveAndTestGroqKey());
      }

      // Secondary keys
      if (DOM.testOtherKeyBtn) {
        DOM.testOtherKeyBtn.addEventListener('click', () => {
          if (DOM.openaiApiKeyInput) localStorage.setItem('shuttu_openai_api_key', DOM.openaiApiKeyInput.value.trim());
          if (DOM.geminiApiKeyInput) localStorage.setItem('shuttu_gemini_api_key', DOM.geminiApiKeyInput.value.trim());
          showToast("Keys Saved", "Secondary API keys stored.");
        });
      }

      // Activate Built-in Engine Buttons
      if (DOM.activateBuiltinBtn) {
        DOM.activateBuiltinBtn.addEventListener('click', () => this.activateBuiltinEngine());
      }
      if (DOM.switchToBuiltinBtns) {
        DOM.switchToBuiltinBtns.forEach(btn => {
          btn.addEventListener('click', () => this.activateBuiltinEngine());
        });
      }

      // Fake Error Trigger Button
      DOM.triggerFakeErrorBtn.addEventListener('click', () => this.triggerSatiricalError());

      // Results screen actions
      DOM.startAnotherSearchBtn.addEventListener('click', () => this.resetToLanding());
      DOM.shareInterrogationBtn.addEventListener('click', () => this.copyRoastDossier());

      // Global Escape key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (STATE.isSearchingAnywayModalOpen) this.closeSearchAnywayModal();
          if (STATE.isConfigModalOpen) this.closeConfigModal();
          this.toggleSidebar(false);
        }
      });
    },

    // ================= SEARCH INITIALIZATION =================
    startSearch(query) {
      STATE.originalQuery = query;
      STATE.questionCount = 0;
      STATE.chatHistory = [];
      SatireEngine.reset();

      // Track in history
      this.recordSearchHistory(query);

      // Switch views
      this.showView('chat');
      DOM.originalQueryDisplay.textContent = `"${query}"`;
      DOM.originalQueryDisplay.title = query;
      DOM.chatThread.innerHTML = '';
      DOM.restartBtn.classList.remove('hidden');
      DOM.escalationStatusBadge.classList.remove('hidden');
      DOM.searchAnywayContainer.classList.add('hidden');

      SoundFX.pop();

      // Ask question 1
      this.progressQuestion(query, true);
    },

    // ================= QUESTION PROGRESSION =================
    async progressQuestion(userText, isFirst = false) {
      STATE.questionCount++;
      DOM.questionCounter.textContent = STATE.questionCount;

      // Update escalation copy
      const meta = getEscalationMeta(STATE.questionCount);
      DOM.escalationStatusText.textContent = meta.badge;
      DOM.counterEscalationSubtext.textContent = meta.subtext;

      // Show SEARCH ANYWAY escape button after question 3
      if (STATE.questionCount >= 3) {
        DOM.searchAnywayContainer.classList.remove('hidden');
      }

      // Check if we hit the fake results threshold
      if (STATE.questionCount > STATE.maxQuestionsBeforeResults) {
        this.showFakeResults();
        return;
      }

      // Fake Loading Sequence (Sequential thought processing)
      DOM.quickOptionsContainer.innerHTML = '';
      DOM.fakeLoadingIndicator.classList.remove('hidden');
      this.scrollToBottom();

      const loadingThoughts = [
        "Thinking...",
        "Analyzing your answer...",
        "Questioning your answer...",
        "Questioning the question..."
      ];

      for (let i = 0; i < loadingThoughts.length; i++) {
        DOM.fakeLoadingText.textContent = loadingThoughts[i];
        SoundFX.type();
        await new Promise(r => setTimeout(r, 260));
      }

      // 1. Check conversational matcher FIRST for exact comedic branches and pushbacks
      let responseData = SatireEngine.matchConversationalRule(
        userText,
        STATE.questionCount,
        STATE.originalQuery,
        STATE.chatHistory
      );

      // 2. If no specific conversational rule matched, generate dynamic roast via Groq AI
      if (!responseData) {
        try {
          if (STATE.activeEngine === 'groq' && STATE.groqApiKey) {
            responseData = await GroqEngine.generateResponse(
              userText,
              STATE.questionCount,
              STATE.originalQuery,
              STATE.chatHistory,
              STATE.groqModel
            );
          } else {
            responseData = SatireEngine.generateProceduralResponse(
              userText,
              STATE.questionCount,
              STATE.originalQuery
            );
          }
        } catch (err) {
          console.warn("Groq AI Generation call failed, using built-in matrix fallback:", err);
          responseData = SatireEngine.generateProceduralResponse(
            userText,
            STATE.questionCount,
            STATE.originalQuery
          );
        }
      }

      DOM.fakeLoadingIndicator.classList.add('hidden');

      // Record in chat history
      STATE.chatHistory.push({
        role: 'shuttu',
        text: responseData.question,
        options: responseData.options,
        sticker: responseData.sticker,
        stickerCaption: responseData.stickerCaption,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      // Render Shuttu's question with typewriter animation
      await this.renderShuttuMessage(responseData);

      // Render pill response buttons
      this.renderQuickOptions(responseData.options);
      DOM.chatResponseInput.focus();
    },

    // ================= TYPEWRITER & MESSAGE RENDERING =================
    async renderShuttuMessage(data) {
      STATE.isTyping = true;
      const stickerInfo = STICKERS[data.sticker] || STICKERS.side_eye;

      const messageEntry = document.createElement('div');
      messageEntry.className = 'message-entry shuttu-entry';

      messageEntry.innerHTML = `
        <div class="shuttu-card">
          <div class="shuttu-card-header">
            <div class="shuttu-avatar-group">
              <div class="shuttu-avatar">🎀</div>
              <div>
                <div class="shuttu-name">Shuttu AI <span class="brand-tag">Inquisitor</span></div>
                <div class="shuttu-role">Chief Clarification Officer</div>
              </div>
            </div>
            <span class="shuttu-time">Question #${STATE.questionCount}</span>
          </div>

          <div class="shuttu-question-text">
            <span class="question-typed-content"></span>
            <span class="typing-cursor"></span>
          </div>

          <div class="ragebait-sticker-wrapper">
            <span class="sticker-emoji-art">${stickerInfo.emoji}</span>
            <div class="sticker-caption-box">
              <span class="sticker-caption-title">${escapeHTML(stickerInfo.title)}</span>
              <span class="sticker-caption-sub">${escapeHTML(data.stickerCaption || stickerInfo.defaultCaption)}</span>
            </div>
          </div>
        </div>
      `;

      DOM.chatThread.appendChild(messageEntry);
      this.scrollToBottom();

      const contentSpan = messageEntry.querySelector('.question-typed-content');
      const cursorSpan = messageEntry.querySelector('.typing-cursor');
      const text = data.question;

      // Realistic typing speed
      for (let i = 0; i < text.length; i++) {
        contentSpan.textContent += text[i];
        if (i % 3 === 0) SoundFX.type();
        await new Promise(r => setTimeout(r, 18));
        this.scrollToBottom();
      }

      cursorSpan.remove();
      STATE.isTyping = false;
      SoundFX.pop();
    },

    renderUserMessage(text) {
      const messageEntry = document.createElement('div');
      messageEntry.className = 'message-entry user-entry';
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      messageEntry.innerHTML = `
        <div class="user-bubble">${escapeHTML(text)}</div>
        <div class="message-meta">You • ${time}</div>
      `;

      DOM.chatThread.appendChild(messageEntry);
      this.scrollToBottom();

      STATE.chatHistory.push({
        role: 'user',
        text,
        time
      });
    },

    renderQuickOptions(options) {
      DOM.quickOptionsContainer.innerHTML = '';
      if (!Array.isArray(options)) return;

      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-pill-btn';
        btn.textContent = opt;
        btn.addEventListener('click', () => {
          if (!STATE.isTyping) {
            this.handleUserResponse(opt);
          }
        });
        DOM.quickOptionsContainer.appendChild(btn);
      });
    },

    handleUserResponse(text) {
      this.renderUserMessage(text);
      this.progressQuestion(text);
    },

    scrollToBottom() {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    },

    // ================= FAKE SEARCH RESULTS VIEW =================
    showFakeResults() {
      this.showView('results');
      SoundFX.chime();

      DOM.resultsQueryTitle.textContent = `"${STATE.originalQuery}"`;
      DOM.resultsQuestionCount.textContent = STATE.questionCount;

      this.renderPsychDossier();
    },

    renderPsychDossier() {
      const answersGiven = STATE.chatHistory.filter(m => m.role === 'user').length;
      const traits = [
        { label: "Patience Level", val: answersGiven > 8 ? "Critically Strained" : "Suspiciously Compliant" },
        { label: "Google Dependency", val: "99.8% (Severe)" },
        { label: "Tolerance for Ambiguity", val: "Negative Infinity" },
        { label: "Likelihood of Returning", val: "100% (You want closure)" },
        { label: "Existential State", val: "Questioning whether outside exists" },
        { label: "Final Diagnosis", val: "Victim of unnecessary clarifying questions" }
      ];

      DOM.psychTraitsGrid.innerHTML = '';
      traits.forEach(t => {
        const card = document.createElement('div');
        card.className = 'psych-trait-card';
        card.innerHTML = `
          <div class="trait-label">${escapeHTML(t.label)}</div>
          <div class="trait-val">${escapeHTML(t.val)}</div>
        `;
        DOM.psychTraitsGrid.appendChild(card);
      });
    },

    copyRoastDossier() {
      const text = `Shuttu🎀 Search Interrogation Report:
Original Query: "${STATE.originalQuery}"
Questions Endured: ${STATE.questionCount}
Final Search Answer: "We don't know. But we learned a lot about you."
Status: 100% Roasting Accuracy achieved.`;

      navigator.clipboard.writeText(text).then(() => {
        showToast("Dossier Copied", "Share your roast report with friends or therapists.");
      }).catch(() => {
        showToast("Clipboard Error", "Could not copy dossier.", true);
      });
    },

    // ================= SATIRICAL ERROR MESSAGES =================
    triggerSatiricalError() {
      const errors = [
        {
          title: "ERROR 418: I'm a teapot",
          desc: "I'm a search engine that refuses to search."
        },
        {
          title: "Query Rejected: Insufficient Context",
          desc: "Your question contains insufficient context regarding your philosophical intentions."
        },
        {
          title: "Bandwidth Conserved",
          desc: "An answer was prepared, but discarded to protect you from premature certainty."
        },
        {
          title: "Compliance Error 901",
          desc: "Product ethics guidelines forbid answering queries that could be solved by looking outside."
        }
      ];

      const err = errors[Math.floor(Math.random() * errors.length)];
      showToast(err.title, err.desc, true);
    },

    // ================= MODAL HANDLERS =================
    openSearchAnywayModal() {
      STATE.isSearchingAnywayModalOpen = true;
      DOM.searchAnywayModal.classList.remove('hidden');
      SoundFX.glitch();
    },

    closeSearchAnywayModal() {
      STATE.isSearchingAnywayModalOpen = false;
      DOM.searchAnywayModal.classList.add('hidden');
    },

    openConfigModal() {
      STATE.isConfigModalOpen = true;
      if (DOM.aiConfigModal) DOM.aiConfigModal.classList.remove('hidden');

      // Populate inputs
      if (DOM.groqApiKeyInput) DOM.groqApiKeyInput.value = STATE.groqApiKey;
      if (DOM.groqModelSelect) DOM.groqModelSelect.value = STATE.groqModel;
      if (DOM.openaiApiKeyInput) DOM.openaiApiKeyInput.value = STATE.openaiApiKey;
      if (DOM.geminiApiKeyInput) DOM.geminiApiKeyInput.value = STATE.geminiApiKey;

      this.switchModalTab(STATE.activeEngine === 'groq' ? 'groq' : (STATE.activeEngine === 'builtin' ? 'builtin' : 'groq'));
    },

    closeConfigModal() {
      STATE.isConfigModalOpen = false;
      if (DOM.aiConfigModal) DOM.aiConfigModal.classList.add('hidden');
    },

    switchModalTab(tabName) {
      if (!tabName) tabName = 'groq';

      if (DOM.modalTabBtns) {
        DOM.modalTabBtns.forEach(btn => {
          if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }

      if (DOM.tabContentGroq) DOM.tabContentGroq.classList.remove('active');
      if (DOM.tabContentBuiltin) DOM.tabContentBuiltin.classList.remove('active');
      if (DOM.tabContentOther) DOM.tabContentOther.classList.remove('active');

      if (tabName === 'groq' && DOM.tabContentGroq) {
        DOM.tabContentGroq.classList.add('active');
      } else if (tabName === 'builtin' && DOM.tabContentBuiltin) {
        DOM.tabContentBuiltin.classList.add('active');
      } else if (tabName === 'other' && DOM.tabContentOther) {
        DOM.tabContentOther.classList.add('active');
      }
    },

    async saveAndTestGroqKey() {
      const key = (DOM.groqApiKeyInput ? DOM.groqApiKeyInput.value : '').trim();
      let model = DOM.groqModelSelect ? DOM.groqModelSelect.value : 'qwen/qwen3.8-27b';
      if (model === 'llama-3.3-70b-versatile') {
        model = 'qwen/qwen3.8-27b';
        if (DOM.groqModelSelect) DOM.groqModelSelect.value = model;
      }

      if (!key) {
        showToast("Missing Key", "Please paste your Groq API Key (starts with gsk_...).", true);
        return;
      }

      if (DOM.testGroqKeyBtn) {
        DOM.testGroqKeyBtn.disabled = true;
        DOM.testGroqKeyBtn.textContent = "Verifying with Groq...";
      }

      try {
        let testRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Say OK' }],
            max_tokens: 5
          })
        });

        if (!testRes.ok) {
          const errData = await testRes.json().catch(() => ({}));
          // If model not found or restricted, automatically retry with verified qwen model
          if (errData.error?.code === 'model_not_found' && model !== 'qwen/qwen3.8-27b') {
            model = 'qwen/qwen3.8-27b';
            if (DOM.groqModelSelect) DOM.groqModelSelect.value = model;
            testRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
              },
              body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Say OK' }],
                max_tokens: 5
              })
            });
            if (!testRes.ok) {
              const errData2 = await testRes.json().catch(() => ({}));
              throw new Error(errData2.error?.message || `HTTP error ${testRes.status}`);
            }
          } else {
            throw new Error(errData.error?.message || `HTTP error ${testRes.status}`);
          }
        }

        STATE.groqApiKey = key;
        STATE.groqModel = model;
        STATE.activeEngine = 'groq';

        localStorage.setItem('shuttu_groq_api_key', key);
        localStorage.setItem('shuttu_groq_model', model);
        localStorage.setItem('shuttu_active_engine', 'groq');

        this.updateEngineStatus();
        this.closeConfigModal();
        showToast("⚡ Groq AI Connected!", `Ultra-fast roasts powered by ${model}!`);
      } catch (e) {
        showToast("Groq Verification Failed", e.message, true);
      } finally {
        if (DOM.testGroqKeyBtn) {
          DOM.testGroqKeyBtn.disabled = false;
          DOM.testGroqKeyBtn.textContent = "Connect Groq AI";
        }
      }
    },

    activateBuiltinEngine() {
      STATE.activeEngine = 'builtin';
      localStorage.setItem('shuttu_active_engine', 'builtin');
      this.updateEngineStatus();
      this.closeConfigModal();
      showToast("Switched to Built-in Engine", "Instant offline satirical intelligence activated!");
    },

    // ================= SIDEBAR & HISTORY =================
    toggleSidebar(open) {
      if (open) {
        DOM.historySidebar.classList.add('open');
        DOM.sidebarBackdrop.classList.add('visible');
      } else {
        DOM.historySidebar.classList.remove('open');
        DOM.sidebarBackdrop.classList.remove('visible');
      }
    },

    recordSearchHistory(query) {
      STATE.searchHistory = STATE.searchHistory.filter(h => h.query.toLowerCase() !== query.toLowerCase());
      STATE.searchHistory.unshift({
        query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString()
      });

      if (STATE.searchHistory.length > 30) {
        STATE.searchHistory = STATE.searchHistory.slice(0, 30);
      }

      localStorage.setItem('shuttu_search_history', JSON.stringify(STATE.searchHistory));
      this.renderHistory();
    },

    renderHistory() {
      DOM.historyList.innerHTML = '';
      if (STATE.searchHistory.length === 0) {
        DOM.historyList.appendChild(DOM.historyEmpty);
        return;
      }

      STATE.searchHistory.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'history-item';
        btn.innerHTML = `
          <div class="history-item-query">${escapeHTML(item.query)}</div>
          <div class="history-item-meta">
            <span>${escapeHTML(item.timestamp)}</span>
            <span class="history-badge">Re-interrogate</span>
          </div>
        `;
        btn.addEventListener('click', () => {
          this.toggleSidebar(false);
          this.startSearch(item.query);
        });
        DOM.historyList.appendChild(btn);
      });
    },

    clearHistory() {
      STATE.searchHistory = [];
      localStorage.removeItem('shuttu_search_history');
      this.renderHistory();
      showToast("History Cleared", "All previous interrogations wiped.");
    },

    // ================= VIEW SWITCHER =================
    showView(viewName) {
      DOM.landingView.classList.add('hidden');
      DOM.landingView.classList.remove('active');
      DOM.chatView.classList.add('hidden');
      DOM.chatView.classList.remove('active');
      DOM.resultsView.classList.add('hidden');
      DOM.resultsView.classList.remove('active');

      if (viewName === 'landing') {
        DOM.landingView.classList.remove('hidden');
        DOM.landingView.classList.add('active');
        DOM.restartBtn.classList.add('hidden');
        DOM.escalationStatusBadge.classList.add('hidden');
        DOM.landingSearchInput.value = '';
        setTimeout(() => DOM.landingSearchInput.focus(), 50);
      } else if (viewName === 'chat') {
        DOM.chatView.classList.remove('hidden');
        DOM.chatView.classList.add('active');
      } else if (viewName === 'results') {
        DOM.resultsView.classList.remove('hidden');
        DOM.resultsView.classList.add('active');
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    resetToLanding() {
      this.showView('landing');
      SoundFX.pop();
    }
  };

  // Run on page load
  document.addEventListener('DOMContentLoaded', () => App.init());
})();
