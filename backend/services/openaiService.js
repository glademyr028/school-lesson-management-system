const OpenAI = require("openai");

const hasOpenAIKey =
  process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY.trim() !== "";

let client = null;

if (hasOpenAIKey) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

/**
 * Creates the optimized Gemini master prompt.
 *
 * OpenAI is OPTIONAL.
 *
 * If OpenAI is unavailable because of missing API key,
 * insufficient quota, or another API problem, the system
 * automatically falls back to our local prompt architect.
 */
async function createGeminiPrompt({
  curriculum,
  gradeSubject,
  topic,
  outputs
}) {
  // --------------------------------------------------
  // 1. Try OpenAI if configured
  // --------------------------------------------------

  if (client) {
    try {
      console.log("🧠 Using OpenAI as Master Prompt Architect...");

      const systemInstructions = `
You are the Master Prompt Architect for an AI-powered
School Management System.

Your job is NOT to directly teach the lesson.

Your job is to create an extremely clear, precise,
instructional production prompt for Gemini.

Gemini will be responsible for generating the actual
lesson content and presentation structure.

The final Gemini output must be:
- classroom-ready
- age-appropriate
- aligned with the specified curriculum
- logically structured
- practical for teachers
- suitable for the requested grade and subject
- aligned with the requested lesson duration
- assessment-aware
- suitable for generating lesson plans, learning modules,
  and presentation slides

Do not invent curriculum standards that were not provided.

Respect the teacher's exact request.

The Gemini prompt must instruct Gemini to return
structured JSON matching the application's schema.
`;

      const userRequest = `
TEACHER REQUEST

Curriculum:
${curriculum}

Grade & Subject:
${gradeSubject}

Topic / Instructions:
${topic}

Requested Outputs:
${outputs.join(", ")}

Create the optimized master production prompt
that will be sent to Gemini.
`;

      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
        instructions: systemInstructions,
        input: userRequest
      });

      console.log("✅ OpenAI master prompt created.");

      return response.output_text;

    } catch (error) {

      // --------------------------------------------------
      // 2. Graceful fallback
      // --------------------------------------------------

      console.warn("⚠️ OpenAI unavailable.");

      if (
        error?.status === 429 ||
        error?.code === "insufficient_quota" ||
        error?.type === "insufficient_quota"
      ) {
        console.warn(
          "⚠️ OpenAI API quota/credits unavailable."
        );
      } else {
        console.warn(
          "⚠️ OpenAI error:",
          error?.message || error
        );
      }

      console.log(
        "🔄 Switching to local Master Prompt Architect..."
      );

      return buildMasterPrompt({
        curriculum,
        gradeSubject,
        topic,
        outputs
      });
    }
  }

  // --------------------------------------------------
  // 3. No OpenAI key
  // --------------------------------------------------

  console.log(
    "ℹ️ OpenAI API not configured."
  );

  console.log(
    "🔄 Using local Master Prompt Architect..."
  );

  return buildMasterPrompt({
    curriculum,
    gradeSubject,
    topic,
    outputs
  });
}


/**
 * Local fallback prompt architect.
 *
 * This means the application can continue working
 * even when OpenAI is unavailable.
 */
function buildMasterPrompt({
  curriculum,
  gradeSubject,
  topic,
  outputs
}) {
  return `
You are the instructional content generation engine
for a professional School Management System.

Generate a classroom-ready educational package
based on the teacher's request below.

TEACHER REQUEST
================

Curriculum:
${curriculum}

Grade & Subject:
${gradeSubject}

Topic / Instructions:
${topic}

Requested Outputs:
${outputs.join(", ")}

IMPORTANT INSTRUCTIONS
======================

1. Follow the specified curriculum and grade level.

2. Keep all explanations appropriate for the students'
   developmental level.

3. Respect the requested lesson duration.

4. Create measurable learning objectives.

5. Organize the lesson logically from introduction
   through assessment and closure.

6. Include important concepts students need to understand.

7. Include appropriate materials/resources.

8. Identify prerequisite knowledge when relevant.

9. Identify common misconceptions when relevant.

10. Include teacher actions and student actions.

11. Include assessment questions with correct answers.

12. Include a concise homework or follow-up activity
    when appropriate.

13. Create a clear lesson summary.

PRESENTATION REQUIREMENTS
=========================

If Slide Deck is requested, create a complete presentation
structure.

Every slide should contain:

- slide number
- slide title
- concise slide content
- teacher notes
- visual suggestion
- student interaction when appropriate

Slides should NOT contain excessive text.

The presentation should support the lesson rather than
simply copy the lesson plan.

QUALITY REQUIREMENTS
====================

The final content must be:

- accurate
- coherent
- age-appropriate
- classroom-ready
- practical
- concise where appropriate
- instructionally aligned

Do not invent specific curriculum standards,
references, policies, or facts when they are not provided.

RETURN FORMAT
=============

Return ONLY valid JSON.

The JSON must follow the application's required schema
for:

lesson
and
presentation

Do not include markdown fences.
Do not include explanations outside the JSON.
`;
}


module.exports = {
  createGeminiPrompt
};