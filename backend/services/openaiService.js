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
  country,
  curriculum,
  gradeLevel,
  subject,
  durationMinutes,
  textSize,
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
- context-aware for the selected country and curriculum
- practical for the teacher's actual classroom setting
- internally consistent across every generated resource

Do not invent curriculum standards that were not provided.

Treat the selected country/curriculum as an important educational context.
Use terminology, examples, activities, and expectations appropriate to
that context. Do not claim official standards or curriculum codes unless
they are supplied by the teacher or otherwise explicitly available.

The purpose of the system is to reduce teacher preparation time.
Generate resources that are as classroom-ready as reasonably possible,
while keeping the teacher as the final reviewer before teaching.

Respect the teacher's exact request.

The Gemini prompt must instruct Gemini to return
structured JSON matching the application's schema.
`;

      const userRequest = `
TEACHER REQUEST

Country:
${country}

Curriculum / Educational Framework:
${curriculum}

Grade Level:
${gradeLevel}

Subject:
${subject}

Lesson Duration:
${durationMinutes} minutes

Topic / Instructions:
${topic}

Requested Outputs:
${outputs.join(", ")}

Create the optimized master production prompt
that will be sent to Gemini.

Teacher readability is an explicit presentation constraint. The selected text size should be reflected in slide density: larger text means fewer, shorter bullets and less dense content.
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
        country,
        curriculum,
        gradeLevel,
        subject,
        durationMinutes,
        textSize,
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
    country,
    curriculum,
    gradeLevel,
    subject,
    durationMinutes,
    textSize,
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
  country,
  curriculum,
  gradeLevel,
  subject,
  durationMinutes,
  textSize,
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

Country:
${country}

Curriculum / Educational Framework:
${curriculum}

Grade Level:
${gradeLevel}

Subject:
${subject}

Lesson Duration:
${durationMinutes} minutes

Topic / Instructions:
${topic}

Requested Outputs:
${outputs.join(", ")}

IMPORTANT INSTRUCTIONS
======================

1. Follow the specified country, curriculum, grade level, and subject context.

2. Treat the requested lesson duration as a hard planning constraint. The complete lesson flow must fit within the requested number of minutes.

3. Do not claim official curriculum alignment, standards, codes, or policies unless they are provided by the teacher.

2. Keep all explanations appropriate for the students'
   developmental level.

3. Use examples, terminology, classroom activities, and assessment
   approaches that fit the selected educational context.

4. Do not invent official curriculum standards, codes, policies,
   or references that were not provided.

5. Treat the teacher as the final reviewer: produce classroom-ready
   materials that can be checked, customized if needed, and taught
   with minimal preparation time.

6. Respect the requested lesson duration.

7. Create measurable learning objectives.

8. Organize the lesson logically from introduction
   through assessment and closure.

9. Include important concepts students need to understand.

10. Include appropriate materials/resources.

11. Identify prerequisite knowledge when relevant.

12. Identify common misconceptions when relevant.

13. Include teacher actions and student actions.

14. Include assessment questions with correct answers.

15. Include a concise homework or follow-up activity
    when appropriate.

16. Create a clear lesson summary.

17. Keep the lesson plan, learning module, assessment, and presentation
    consistent with one another.

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
- image search terms that can guide the PowerPoint renderer toward
  relevant educational clipart, illustrations, diagrams, icons, maps,
  charts, or age-appropriate images
- student interaction when appropriate

Slides should NOT contain excessive text.
For Large or Extra Large readability, keep slide content especially concise: prefer 3–4 short bullets for Large and 2–3 short bullets for Extra Large. Avoid dense paragraphs so the selected text size remains readable.

Every slide should use a relevant visual concept whenever it supports
understanding. Prefer educational visuals over decoration. Visuals may
include simple diagrams, labeled processes, illustrations, icons, maps,
charts, or age-appropriate imagery.

The presentation should support the lesson rather than simply copy
the lesson plan.

The lesson, learning module, assessment, and presentation must describe
the same concepts, terminology, and learning sequence.

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