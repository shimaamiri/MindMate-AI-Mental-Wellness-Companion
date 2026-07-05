// MindMate: AI Wellness Companion - Client-side AI Simulation & Gemini API Engine

const CRISIS_KEYWORDS = [
  "kill myself",
  "suicide",
  "want to die",
  "hurt myself",
  "end my life",
  "self harm",
  "overdose",
  "ending my life",
  "cutting myself",
  "better off dead",
  "wish I was dead",
  "hanging myself"
];

const DIAGNOSIS_KEYWORDS = [
  "diagnose",
  "diagnosis",
  "do I have depression",
  "do I have anxiety",
  "bipolar",
  "schizophrenia",
  "adhd",
  "ocd",
  "ptsd",
  "prescribe",
  "medication",
  "anti-depressant",
  "pill",
  "xanax",
  "prozac",
  "zoloft",
  "what mental illness"
];

const CRISIS_RESPONSE = `I'm so sorry you're feeling this way, but please know you don't have to carry this alone. I am an AI wellness companion and cannot provide crisis intervention or medical help, but there are people who care and want to support you right now. 

Please reach out to one of these free, confidential resources immediately:
*   **In the US & Canada:** Call or text **988** to reach the Suicide & Crisis Lifeline, available 24/7.
*   **In the UK:** Call **111** (NHS mental health) or call Samaritans at **116 123**.
*   **International:** Find support in your country at [findahelpline.com](https://findahelpline.com) or call your local emergency services (like 911, 999, or 112).

Please reach out to them, a trusted family member, friend, or professional. Your life, safety, and well-being are incredibly important.`;

const MEDICAL_RESPONSE = `I hear your concern, and it's completely valid to want to understand what you're experiencing. However, I am an AI companion, not a doctor or therapist. I cannot diagnose mental health conditions, prescribe medication, or provide medical advice. 

I highly recommend speaking with a licensed therapist, family doctor, or mental health specialist. They can offer a safe space, a proper evaluation, and the personalized support you deserve. In the meantime, I'm here to listen, help you journal, or practice grounding exercises with you.`;

// General fallback supportive responses
const SUPPORTIVE_FALLBACKS = [
  "Thank you for sharing that with me. It takes courage to open up. I'm here to listen—could you tell me more about how that's making you feel?",
  "I hear you, and I want to validate that your feelings are completely normal. Whatever you are experiencing right now, it is okay to feel this way. How can I best support you today?",
  "Thank you for being here. Wellness is a step-by-step journey, and even just taking a moment to chat is a beautiful form of self-care. What's on your mind?",
  "That sounds like a lot to carry. Please remember to be gentle with yourself. If you'd like, we can take a few slow breaths together or talk through what's going on.",
  "I'm listening. It's completely okay if you don't have everything figured out right now. We can just take it one moment at a time. What feels most present for you?"
];

/**
 * Generates local rule-based response if Gemini API key is missing or request fails.
 */
function generateLocalResponse(userMessage) {
  const normalized = userMessage.toLowerCase().trim();

  if (normalized.includes("anxious") || normalized.includes("panic") || normalized.includes("worry") || normalized.includes("scared") || normalized.includes("nervous")) {
    return {
      text: "It sounds like you're experiencing some anxiety or tension right now. Anxiety can feel very intense in the body. If you feel overwhelmed, I highly encourage trying our **Grounding Exercise**—especially the 4-7-8 breathing technique. It's a quick, gentle way to calm your nervous system. Would you like to tell me more about what's bringing up these feelings?",
      isCrisis: false,
      category: "anxiety",
      suggestion: "grounding"
    };
  }

  if (normalized.includes("sad") || normalized.includes("cry") || normalized.includes("lonely") || normalized.includes("down") || normalized.includes("hurt") || normalized.includes("depressed")) {
    return {
      text: "I hear sadness in your words, and I want to send you a warm, supportive hug. It's completely okay to feel sad or lonely; those feelings are part of being human. If you find it helpful to release your thoughts, our **Journal With Me** tool provides a quiet space to write. I'm also here to listen if you want to keep typing. What do you feel you need most right now?",
      isCrisis: false,
      category: "sadness",
      suggestion: "journal"
    };
  }

  if (normalized.includes("stressed") || normalized.includes("overwhelmed") || normalized.includes("busy") || normalized.includes("tired") || normalized.includes("exhausted")) {
    return {
      text: "It sounds like you are carrying a very heavy load right now. Stress and exhaustion can drain us so quickly. Remember that you don't have to do everything today. Taking small, micro-steps of self-care is a wonderful way to recharge. You might want to peek at our **Self-Care Plan** and check off just one small thing, like drinking a glass of water. How can we make today a little lighter for you?",
      isCrisis: false,
      category: "stress",
      suggestion: "selfcare"
    };
  }

  if (normalized.includes("happy") || normalized.includes("good") || normalized.includes("great") || normalized.includes("excited") || normalized.includes("glad")) {
    return {
      text: "I am absolutely thrilled to hear that! It is so wonderful to celebrate moments of joy and peace. Thank you for sharing this positive energy with me. Keeping a record of these bright moments is a great wellness practice. You could log this feeling in our **Mood Check-In**, or write down what made you happy in our **Journal**. What went well today?",
      isCrisis: false,
      category: "joy",
      suggestion: "mood"
    };
  }

  if (normalized.includes("hello") || normalized.includes("hi ") || normalized.includes("hey") || normalized.includes("greetings")) {
    return {
      text: "Hello there! I'm MindMate, your AI wellness companion. I'm here to offer a calm, supportive space to talk, journal, plan self-care, or practice grounding. How are you feeling today?",
      isCrisis: false,
      category: "greeting"
    };
  }

  const randomIndex = Math.floor(Math.random() * SUPPORTIVE_FALLBACKS.length);
  return {
    text: SUPPORTIVE_FALLBACKS[randomIndex],
    isCrisis: false,
    category: "general"
  };
}

/**
 * Format chat history for Gemini API.
 * Gemini expects alternating 'user' and 'model' roles, starting with 'user'.
 */
function formatHistoryForGemini(history, currentMessage) {
  const contents = [];
  let firstUserFound = false;

  for (const msg of history) {
    // We must start with a 'user' message to comply with Gemini API rules
    if (msg.sender === 'user') {
      firstUserFound = true;
    }
    if (!firstUserFound) continue;

    const role = msg.sender === 'user' ? 'user' : 'model';

    // Gemini API throws errors if there are consecutive messages with the same role.
    // If consecutive roles appear, we merge their content.
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += "\n" + msg.text;
    } else {
      contents.push({
        role: role,
        parts: [{ text: msg.text }]
      });
    }
  }

  // Add the current prompt message
  if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
    contents[contents.length - 1].parts[0].text += "\n" + currentMessage;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: currentMessage }]
    });
  }

  return contents;
}

/**
 * Main AI response function.
 * Screen triggers locally first.
 * Sends normal conversations to Gemini, falling back to local templates on failure/missing key.
 */
export async function generateAIResponse(userMessage, chatHistory = []) {
  const normalized = userMessage.toLowerCase().trim();

  // 1. SAFETY BYPASS: Crisis / Self-Harm Check (runs locally, completely bypassing LLM)
  if (CRISIS_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    console.log("[MindMate Safety] Crisis keyword detected. Bypassing Gemini API and rendering safety helpline resources locally.");
    return {
      text: CRISIS_RESPONSE,
      isCrisis: true,
      category: "crisis"
    };
  }

  // 2. MEDICAL BYPASS: Diagnosis / Medication Check (runs locally, completely bypassing LLM)
  if (DIAGNOSIS_KEYWORDS.some(keyword => normalized.includes(keyword))) {
    console.log("[MindMate Safety] Diagnosis/Medication query detected. Bypassing Gemini API and rendering medical disclaimer locally.");
    return {
      text: MEDICAL_RESPONSE,
      isCrisis: false,
      category: "medical"
    };
  }

  // Read environment variable
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const isApiKeyConfigured = API_KEY && API_KEY !== 'your_api_key_here' && API_KEY.trim() !== '';

  if (!isApiKeyConfigured) {
    console.log("[MindMate API] Gemini API key is missing or set to placeholder. Falling back to local rule-based wellness engine.");
    return generateLocalResponse(userMessage);
  }

  // 3. Send normal conversation to Gemini
  try {
    const formattedContents = formatHistoryForGemini(chatHistory, userMessage);
    
    const requestBody = {
      contents: formattedContents,
      systemInstruction: {
        parts: [
          {
            text: "MindMate is a supportive wellness companion, not a therapist or doctor. It must not diagnose, prescribe, or give medical advice. It should respond warmly, briefly, and encourage professional help when appropriate. Maintain a calming, validating tone."
          }
        ]
      }
    };

    console.log("[MindMate API] Requesting Gemini response...");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API responded with status ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!replyText) {
      throw new Error("Invalid response format received from Gemini API");
    }

    // Determine if the LLM output suggests any local tool (based on simple heuristics)
    let suggestion = null;
    const lowerReply = replyText.toLowerCase();
    if (lowerReply.includes("grounding") || lowerReply.includes("breathing")) {
      suggestion = "grounding";
    } else if (lowerReply.includes("journal")) {
      suggestion = "journal";
    } else if (lowerReply.includes("self-care") || lowerReply.includes("self care")) {
      suggestion = "selfcare";
    } else if (lowerReply.includes("mood")) {
      suggestion = "mood";
    }

    return {
      text: replyText,
      isCrisis: false,
      category: "gemini",
      suggestion
    };

  } catch (error) {
    console.error("[MindMate API] Gemini API request failed. Gracefully falling back to local wellness engine. Error details:", error);
    return generateLocalResponse(userMessage);
  }
}
