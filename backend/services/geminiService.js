const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const lessonSchema = {
  type: "object",

  properties: {
    lesson: {
      type: "object",

      properties: {
        title: {
          type: "string"
        },

        duration_minutes: {
          type: "number"
        },

        learning_objectives: {
          type: "array",
          items: {
            type: "string"
          }
        },

        key_concepts: {
          type: "array",
          items: {
            type: "string"
          }
        },

        materials: {
          type: "array",
          items: {
            type: "string"
          }
        },

        prerequisite_knowledge: {
          type: "array",
          items: {
            type: "string"
          }
        },

        misconceptions: {
          type: "array",
          items: {
            type: "string"
          }
        },

        lesson_flow: {
          type: "array",

          items: {
            type: "object",

            properties: {
              phase: {
                type: "string"
              },

              minutes: {
                type: "number"
              },

              teacher_actions: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              student_actions: {
                type: "array",
                items: {
                  type: "string"
                }
              }
            },

            required: [
              "phase",
              "minutes",
              "teacher_actions",
              "student_actions"
            ]
          }
        },

        assessment: {
          type: "array",

          items: {
            type: "object",

            properties: {
              question: {
                type: "string"
              },

              answer: {
                type: "string"
              }
            },

            required: [
              "question",
              "answer"
            ]
          }
        },

        homework: {
          type: "string"
        },

        summary: {
          type: "string"
        }
      },

      required: [
        "title",
        "duration_minutes",
        "learning_objectives",
        "key_concepts",
        "materials",
        "prerequisite_knowledge",
        "misconceptions",
        "lesson_flow",
        "assessment",
        "homework",
        "summary"
      ]
    },

    presentation: {
      type: "object",

      properties: {
        slides: {
          type: "array",

          items: {
            type: "object",

            properties: {
              slide_number: {
                type: "number"
              },

              title: {
                type: "string"
              },

              content: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              teacher_notes: {
                type: "string"
              },

              visual_suggestion: {
                type: "string"
              },

              image_search_terms: {
                type: "array",
                items: {
                  type: "string"
                }
              },

              interaction: {
                type: "string"
              }
            },

            required: [
              "slide_number",
              "title",
              "content",
              "teacher_notes",
              "visual_suggestion",
              "image_search_terms",
              "interaction"
            ]
          }
        }
      },

      required: [
        "slides"
      ]
    }
  },

  required: [
    "lesson",
    "presentation"
  ]
};


/**
 * Generate a structured lesson using Gemini.
 *
 * Gemini is the CONTENT GENERATION engine.
 * OpenAI is handled separately by openaiService.js.
 */
async function generateWithGemini(geminiPrompt) {

  // ---------------------------------------------
  // 1. Check API key
  // ---------------------------------------------

  if (
    !process.env.GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY.trim() === ""
  ) {
    throw new Error(
      "GEMINI_API_KEY is missing from the .env file."
    );
  }


  // ---------------------------------------------
  // 2. Get model from .env
  // ---------------------------------------------

  const model =
    process.env.GEMINI_MODEL ||
    "gemini-3.6-flash";


  // ---------------------------------------------
  // 3. Retry configuration
  // ---------------------------------------------

  const maxAttempts = 3;


  // ---------------------------------------------
  // 4. Generate with Gemini
  // ---------------------------------------------

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {

    try {

      console.log(
        `🤖 Gemini attempt ${attempt}/${maxAttempts}...`
      );

      const interaction =
        await ai.interactions.create({

          model,

          input: geminiPrompt,

          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: lessonSchema
          }
        });


      // ---------------------------------------------
      // 5. Validate Gemini output
      // ---------------------------------------------

      if (!interaction.output_text) {

        throw new Error(
          "Gemini returned an empty response."
        );
      }


      console.log(
        "✅ Gemini generated structured lesson."
      );


      // ---------------------------------------------
      // 6. Parse JSON
      // ---------------------------------------------

      try {

        const result =
          JSON.parse(
            interaction.output_text
          );

        return result;

      } catch (parseError) {

        console.error(
          "❌ Gemini returned invalid JSON."
        );

        console.error(
          interaction.output_text
        );

        throw new Error(
          "Gemini returned invalid JSON."
        );
      }


    } catch (error) {

      const status =
        error?.status ||
        error?.statusCode ||
        error?.response?.status;


      console.error("");

      console.error(
        `❌ Gemini attempt ${attempt} failed.`
      );

      console.error(
        `Status: ${status || "unknown"}`
      );

      console.error(
        `Message: ${
          error?.message ||
          "Unknown Gemini error"
        }`
      );


      // =============================================
      // RATE LIMIT / QUOTA
      // =============================================

      if (status === 429) {

        console.error("");

        console.error(
          "🚫 Gemini API rate limit or quota reached."
        );

        console.error(
          "🛑 Stopping retries to avoid wasting requests."
        );

        console.error(
          "💡 Check your Gemini API quota/billing."
        );

        throw error;
      }


      // =============================================
      // TEMPORARY SERVER ERROR
      // =============================================

      if (
        status === 503 &&
        attempt < maxAttempts
      ) {

        const retryAfterHeader =
          error?.headers?.get
            ? error.headers.get("retry-after")
            : null;


        const retryAfterSeconds =
          Number(retryAfterHeader) || 30;


        const waitTime =
          retryAfterSeconds * 1000;


        console.log("");

        console.log(
          "⏳ Gemini is temporarily unavailable."
        );

        console.log(
          `Waiting ${retryAfterSeconds} seconds before retry...`
        );


        await new Promise(
          resolve =>
            setTimeout(
              resolve,
              waitTime
            )
        );


        continue;
      }


      // =============================================
      // OTHER ERRORS
      // =============================================

      throw error;
    }
  }


  // This should normally never be reached.
  throw new Error(
    "Gemini generation failed after all attempts."
  );
}


module.exports = {
  generateWithGemini
};