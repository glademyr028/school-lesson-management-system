const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ==========================================
// Load Environment Variables FIRST
// ==========================================

dotenv.config();

// ==========================================
// Services
// ==========================================

const {
  generateLesson
} = require("./services/aiService");

const {
  createLessonPowerPoint
} = require("./services/pptService");

// ==========================================
// App Configuration
// ==========================================

const app = express();

const PORT =
  process.env.PORT || 3000;

// ==========================================
// Middleware
// ==========================================

app.use(cors());

app.use(
  express.json({
    limit: "10mb"
  })
);

// ==========================================
// Frontend
// ==========================================

app.use(
  express.static(
    path.join(
      __dirname,
      "../frontend"
    )
  )
);

// ==========================================
// Helper: Validate Lesson Request
// ==========================================

function validateLessonRequest(req) {

  const {
    country,
    curriculum,
    gradeLevel,
    subject,
    durationMinutes,
    gradeSubject,
    topic,
    outputs,
    textSize
  } = req.body || {};

  if (
    !topic ||
    typeof topic !== "string" ||
    topic.trim() === ""
  ) {

    return {
      valid: false,
      message:
        "Topic / instructions are required."
    };

  }

  return {
    valid: true,

    data: {
      country: country || "Philippines",

      curriculum: curriculum || "MATATAG",

      gradeLevel: gradeLevel || "Grade 5",

      subject: subject || "Science",

      durationMinutes: Number(durationMinutes) || 40,

      gradeSubject:
        gradeSubject ||
        ((gradeLevel || "Grade 5") + " · " + (subject || "Science")),

      topic:
        topic.trim(),

      outputs:
        Array.isArray(outputs) &&
        outputs.length > 0

          ? outputs

          : [
              "Lesson Plan",
              "Learning Module",
              "Slide Deck"
            ],

      textSize: normalizeTextSize(textSize)
    }
  };
}

function normalizeTextSize(value) {
  const presets = {
    standard: { preset: "standard", body: 18, title: 28, prompt: 16, meta: 15 },
    large: { preset: "large", body: 22, title: 32, prompt: 19, meta: 17 },
    "extra-large": { preset: "extra-large", body: 26, title: 36, prompt: 22, meta: 19 }
  };
  if (!value || typeof value !== "object") return presets.large;
  if (value.preset === "custom") {
    const body = Math.min(40, Math.max(12, Number(value.body) || 22));
    return { preset: "custom", body, title: Math.max(32, body + 10), prompt: Math.max(19, body - 3), meta: Math.max(15, body - 5) };
  }
  return presets[value.preset] || presets.large;
}

// ==========================================
// Health Check
// ==========================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      success: true,

      message:
        "School Management System backend is running!",

      ai: {
        openai:
          Boolean(
            process.env.OPENAI_API_KEY
          ),

        gemini:
          Boolean(
            process.env.GEMINI_API_KEY
          ),

        geminiModel:
          process.env.GEMINI_MODEL ||
          "gemini-3.6-flash"
      }

    });

  }
);

// ==========================================
// Generate Lesson
// ==========================================

app.post(
  "/api/generate-lesson",
  async (req, res) => {

    try {

      console.log("");
      console.log(
        "================================="
      );
      console.log(
        " GENERATE LESSON REQUEST"
      );
      console.log(
        "================================="
      );


      // --------------------------------------
      // Validate request
      // --------------------------------------

      const validation =
        validateLessonRequest(req);


      if (!validation.valid) {

        return res.status(400).json({

          success: false,

          message:
            validation.message

        });

      }


      const {
        country,
        curriculum,
        gradeLevel,
        subject,
        durationMinutes,
        textSize,
        gradeSubject,
        topic,
        outputs
      } = validation.data;


      console.log(
        "Country:",
        country
      );

      console.log(
        "Curriculum:",
        curriculum
      );

      console.log(
        "Grade Level:",
        gradeLevel
      );

      console.log(
        "Subject:",
        subject
      );

      console.log(
        "Duration:",
        durationMinutes,
        "minutes"
      );

      console.log(
        "Grade & Subject:",
        gradeSubject
      );

      console.log(
        "Topic:",
        topic
      );

      console.log(
        "Outputs:",
        outputs
      );


      // --------------------------------------
      // Generate AI lesson
      // --------------------------------------

      const result =
        await generateLesson({

          country,
          curriculum,
          gradeLevel,
          subject,
          durationMinutes,
          gradeSubject,
          topic,
          textSize,

          outputs

        });


      // --------------------------------------
      // Response
      // --------------------------------------

      return res.json({

        success: true,

        country:
          result.country || country,

        curriculum:
          result.curriculum || curriculum,

        gradeLevel:
          result.gradeLevel || gradeLevel,

        subject:
          result.subject || subject,

        durationMinutes:
          result.durationMinutes || durationMinutes,

        gradeSubject:
          result.gradeSubject ||
          gradeSubject,

        topic:
          result.topic ||
          topic,

        outputs:
          result.outputs ||
          outputs,

        textSize:
          result.textSize ||
          textSize,

        lesson:
          result.lesson,

        presentation:
          result.presentation

      });

    } catch (error) {

      console.error("");

      console.error(
        "================================="
      );

      console.error(
        " ❌ LESSON GENERATION ERROR"
      );

      console.error(
        "================================="
      );

      console.error(
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error?.message ||
          "Unable to generate lesson.",

        error:
          process.env.NODE_ENV ===
          "production"

            ? undefined

            : {
                name:
                  error?.name,

                status:
                  error?.status ||
                  error?.statusCode,

                message:
                  error?.message
              }

      });

    }

  }
);

// ==========================================
// Generate PowerPoint
// ==========================================

app.post(
  "/api/generate-ppt",
  async (req, res) => {

    try {

      console.log("");
      console.log(
        "================================="
      );

      console.log(
        " GENERATE POWERPOINT REQUEST"
      );

      console.log(
        "================================="
      );


      // --------------------------------------
      // Validate request
      // --------------------------------------

      const validation =
        validateLessonRequest(req);


      if (!validation.valid) {

        return res.status(400).json({

          success: false,

          message:
            validation.message

        });

      }


      const {
        curriculum,
        gradeSubject,
        topic,
        outputs
      } = validation.data;


      // --------------------------------------
      // Generate lesson
      // --------------------------------------

      console.log(
        "🧠 Generating lesson for PowerPoint..."
      );


      const result =
        await generateLesson({

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


      // --------------------------------------
      // Create PowerPoint
      // --------------------------------------

      console.log(
        "📊 Creating PowerPoint..."
      );


      const ppt =
        await createLessonPowerPoint(
          result
        );


      console.log(
        "✅ PowerPoint created:"
      );

      console.log(
        ppt.fileName
      );


      // --------------------------------------
      // Safe filename
      // --------------------------------------

      const safeTopic =
        topic
          .replace(
            /[^a-z0-9]/gi,
            "-"
          )
          .replace(
            /-+/g,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          )
          .toLowerCase();


      const downloadName =
        `${safeTopic || "lesson"}.pptx`;


      // --------------------------------------
      // Download
      // --------------------------------------

      return res.download(
        ppt.filePath,
        downloadName,
        (downloadError) => {

          if (downloadError) {

            console.error(
              "❌ PowerPoint download error:",
              downloadError
            );

          }

        }
      );

    } catch (error) {

      console.error("");

      console.error(
        "================================="
      );

      console.error(
        " ❌ POWERPOINT GENERATION ERROR"
      );

      console.error(
        "================================="
      );

      console.error(
        error
      );


      return res.status(500).json({

        success: false,

        message:
          error?.message ||
          "Unable to generate PowerPoint.",

        error:
          process.env.NODE_ENV ===
          "production"

            ? undefined

            : {
                name:
                  error?.name,

                status:
                  error?.status ||
                  error?.statusCode,

                message:
                  error?.message
              }

      });

    }

  }
);

// ==========================================
// Catch Unknown API Routes
// ==========================================

app.use(
  "/api",
  (req, res) => {

    res.status(404).json({

      success: false,

      message:
        "API endpoint not found."

    });

  }
);

// ==========================================
// Start Server
// ==========================================

app.listen(
  PORT,
  () => {

    console.log("");

    console.log(
      "================================="
    );

    console.log(
      " SCHOOL MANAGEMENT SYSTEM"
    );

    console.log(
      "================================="
    );

    console.log(
      `Server running at http://localhost:${PORT}`
    );

    console.log(
      `Gemini model: ${
        process.env.GEMINI_MODEL ||
        "gemini-3.6-flash"
      }`
    );

    console.log(
      `OpenAI configured: ${
        Boolean(
          process.env.OPENAI_API_KEY
        )
      }`
    );

    console.log(
      `Gemini configured: ${
        Boolean(
          process.env.GEMINI_API_KEY
        )
      }`
    );

    console.log(
      "================================="
    );

  }
);