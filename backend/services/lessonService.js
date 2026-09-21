// ==========================================
// Lesson Service
// ==========================================

const {
  createGeminiPrompt
} = require("./openaiService");

const {
  generateWithGemini
} = require("./geminiService");

// ==========================================
// Timing Normalization
// ==========================================

function normalizeLessonTiming(lesson, targetMinutes) {
  const flow = Array.isArray(lesson.lesson_flow) ? lesson.lesson_flow : [];
  const target = Number(targetMinutes) || 40;
  if (!flow.length) return lesson;
  const validMinutes = flow.map(phase => Math.max(0, Number(phase.minutes) || 0));
  const currentTotal = validMinutes.reduce((sum, minutes) => sum + minutes, 0);
  if (currentTotal <= 0) {
    const base = Math.floor(target / flow.length);
    let remainder = target - (base * flow.length);
    lesson.lesson_flow = flow.map(phase => ({ ...phase, minutes: base + (remainder-- > 0 ? 1 : 0) }));
    return lesson;
  }
  let assigned = 0;
  lesson.lesson_flow = flow.map((phase, index) => {
    if (index === flow.length - 1) return { ...phase, minutes: Math.max(0, target - assigned) };
    const scaled = Math.max(0, Math.round((validMinutes[index] / currentTotal) * target));
    assigned += scaled;
    return { ...phase, minutes: scaled };
  });
  const finalTotal = lesson.lesson_flow.reduce((sum, phase) => sum + (Number(phase.minutes) || 0), 0);
  if (finalTotal !== target) lesson.lesson_flow[lesson.lesson_flow.length - 1].minutes += target - finalTotal;
  return lesson;
}

// ==========================================
// Generate Lesson
// ==========================================

async function generateLesson({
  country = "Philippines",
  curriculum = "MATATAG",
  gradeLevel = "Grade 5",
  subject = "Science",
  durationMinutes = 40,
  textSize = { preset: "large", body: 22, title: 32, prompt: 19, meta: 17 },
  gradeSubject,
  topic,
  outputs = [
    "Lesson Plan",
    "Learning Module",
    "Slide Deck"
  ]
}) {

  console.log("");
  console.log(
    "================================="
  );
  console.log(
    " SCHOOL MANAGEMENT AI PIPELINE"
  );
  console.log(
    "================================="
  );

  // ========================================
  // STEP 1
  // ========================================

  console.log("");
  console.log(
    "🧠 STEP 1: Creating master prompt..."
  );

  const geminiPrompt =
    await createGeminiPrompt({
      country,
      curriculum,
      gradeLevel,
      subject,
      durationMinutes,
      textSize,
      gradeSubject: gradeSubject || (gradeLevel + " · " + subject),
      topic,
      outputs
    });

  console.log(
    "✅ Master prompt ready."
  );

  // ========================================
  // STEP 2
  // ========================================

  console.log("");
  console.log(
    "🤖 STEP 2: Sending prompt to Gemini..."
  );

  const result =
    await generateWithGemini(
      geminiPrompt
    );

  console.log(
    "✅ Gemini generation complete."
  );

  // ========================================
  // Validate AI response
  // ========================================

  if (!result || typeof result !== "object") {
    throw new Error(
      "Gemini returned an invalid lesson response."
    );
  }

  if (!result.lesson || typeof result.lesson !== "object") {
    throw new Error(
      "Gemini response is missing the lesson content."
    );
  }

  if (!result.presentation || typeof result.presentation !== "object") {
    throw new Error(
      "Gemini response is missing the presentation content."
    );
  }

  if (!Array.isArray(result.presentation.slides)) {
    throw new Error(
      "Gemini response contains an invalid presentation structure."
    );
  }

  result.lesson = normalizeLessonTiming(result.lesson, durationMinutes);
  result.lesson.duration_minutes = Number(durationMinutes);

  // ========================================
  // STEP 3
  // ========================================

  console.log("");
  console.log(
    "📦 STEP 3: Preparing lesson result..."
  );

  return {
    country,
    curriculum,
    gradeLevel,
    subject,
    durationMinutes,
    textSize,
    gradeSubject: gradeSubject || (gradeLevel + " · " + subject),
    topic,
    outputs,

    lesson:
      result.lesson,

    presentation:
      result.presentation
  };
}

// ==========================================
// Export
// ==========================================

module.exports = {
  generateLesson
};