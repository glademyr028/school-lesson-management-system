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
// Generate Lesson
// ==========================================

async function generateLesson({
  country = "Philippines",
  curriculum = "MATATAG",
  gradeLevel = "Grade 5",
  subject = "Science",
  durationMinutes = 40,
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