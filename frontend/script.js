// ==========================================
// School Management System
// Frontend AI Integration
// ==========================================

// ==========================================
// DOM Elements
// ==========================================

const topicInput =
  document.getElementById("topic");

const charCount =
  document.getElementById("charCount");

const generateBtn =
  document.getElementById("generateBtn");

const resultSection =
  document.getElementById("resultSection");

const resultContent =
  document.getElementById("resultContent");

const resetBtn =
  document.getElementById("resetBtn");

// ==========================================
// Application State
// ==========================================

let currentLesson = null;

let currentPresentation = null;

let currentRequest = null;

// ==========================================
// Character Counter
// ==========================================

function updateCharacterCount() {
  if (!topicInput || !charCount) {
    return;
  }

  charCount.textContent =
    topicInput.value.length;
}

if (topicInput) {
  topicInput.addEventListener(
    "input",
    updateCharacterCount
  );

  updateCharacterCount();
}

// ==========================================
// Generate Lesson
// ==========================================

if (generateBtn) {
  generateBtn.addEventListener(
    "click",
    generateLesson
  );
}

async function generateLesson() {

  const curriculumElement =
    document.getElementById("curriculum");

  const gradeSubjectElement =
    document.getElementById("gradeSubject");

  const curriculum =
    curriculumElement?.value ||
    "Philippines · MATATAG";

  const gradeSubject =
    gradeSubjectElement?.value ||
    "Grade 5 · Science";

  const topic =
    topicInput?.value.trim() || "";

  const selectedOutputs = [
    ...document.querySelectorAll(
      '.check-option input[type="checkbox"]:checked'
    )
  ].map(
    input => input.value
  );

  // ========================================
  // Validation
  // ========================================

  if (!topic) {

    alert(
      "Please enter a lesson topic or instructions."
    );

    topicInput?.focus();

    return;
  }

  if (
    selectedOutputs.length === 0
  ) {

    alert(
      "Please select at least one resource to generate."
    );

    return;
  }

  // ========================================
  // Save Current Request
  // ========================================

  currentRequest = {
    curriculum,
    gradeSubject,
    topic,
    outputs: selectedOutputs
  };

  // ========================================
  // Loading State
  // ========================================

  setGenerateButtonLoading(true);

  try {

    console.log(
      "Sending lesson generation request..."
    );

    const response =
      await fetch(
        "/api/generate-lesson",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            curriculum,
            gradeSubject,
            topic,
            outputs:
              selectedOutputs
          })
        }
      );

    const data =
      await response.json();

    console.log(
      "Backend response:",
      data
    );

    // ======================================
    // Handle API Error
    // ======================================

    if (!response.ok || !data.success) {

      throw new Error(
        data.message ||
        "Unable to generate lesson."
      );
    }

    // ======================================
    // Save AI Result
    // ======================================

    currentLesson =
      data.lesson || null;

    currentPresentation =
      data.presentation || null;

    // ======================================
    // Display Result
    // ======================================

    displayLessonResult(data);

  } catch (error) {

    console.error(
      "Lesson generation error:",
      error
    );

    alert(
      error.message ||
      "Unable to generate the lesson. Make sure the backend is running."
    );

  } finally {

    setGenerateButtonLoading(false);
  }
}

// ==========================================
// Generate Button Loading State
// ==========================================

function setGenerateButtonLoading(
  loading
) {

  if (!generateBtn) {
    return;
  }

  generateBtn.disabled =
    loading;

  const textSpan =
    generateBtn.querySelector(
      "span:first-child"
    );

  if (textSpan) {

    textSpan.textContent =
      loading
        ? "Generating..."
        : "Generate resources";
  }
}

// ==========================================
// Display AI Result
// ==========================================

function displayLessonResult(
  data
) {

  if (
    !resultSection ||
    !resultContent
  ) {
    return;
  }

  const lesson =
    data.lesson;

  const presentation =
    data.presentation;

  const outputs =
    data.outputs || [];

  if (!lesson) {

    resultContent.innerHTML = `
      <article class="result-card">
        <h4>Generation completed</h4>

        <p>
          The AI returned a response, but no lesson content was found.
        </p>
      </article>
    `;

    resultSection.classList.remove(
      "hidden"
    );

    return;
  }

  // ========================================
  // Main Lesson Header
  // ========================================

  let html = `

    <article class="result-card lesson-header">

      <div class="result-badge">
        AI GENERATED LESSON
      </div>

      <h2>
        ${escapeHtml(
          lesson.title ||
          data.topic
        )}
      </h2>

      <p>
        <strong>
          ${escapeHtml(
            data.gradeSubject
          )}
        </strong>
        ·
        ${escapeHtml(
          data.curriculum
        )}
      </p>

      <p>
        <strong>Duration:</strong>
        ${escapeHtml(
          lesson.duration_minutes ||
          "N/A"
        )}
        minutes
      </p>

    </article>

  `;

  // ========================================
  // Learning Objectives
  // ========================================

  if (
    lesson.learning_objectives &&
    lesson.learning_objectives.length
  ) {

    html += `
      <article class="result-card">

        <h3>🎯 Learning Objectives</h3>

        <ul>
          ${lesson.learning_objectives
            .map(
              item =>
                `<li>${escapeHtml(item)}</li>`
            )
            .join("")}
        </ul>

      </article>
    `;
  }

  // ========================================
  // Key Concepts
  // ========================================

  if (
    lesson.key_concepts &&
    lesson.key_concepts.length
  ) {

    html += `
      <article class="result-card">

        <h3>💡 Key Concepts</h3>

        <ul>
          ${lesson.key_concepts
            .map(
              item =>
                `<li>${escapeHtml(item)}</li>`
            )
            .join("")}
        </ul>

      </article>
    `;
  }

  // ========================================
  // Materials
  // ========================================

  if (
    lesson.materials &&
    lesson.materials.length
  ) {

    html += `
      <article class="result-card">

        <h3>📚 Materials</h3>

        <ul>
          ${lesson.materials
            .map(
              item =>
                `<li>${escapeHtml(item)}</li>`
            )
            .join("")}
        </ul>

      </article>
    `;
  }

  // ========================================
  // Prerequisite Knowledge
  // ========================================

  if (
    lesson.prerequisite_knowledge &&
    lesson.prerequisite_knowledge.length
  ) {

    html += `
      <article class="result-card">

        <h3>🧠 Prerequisite Knowledge</h3>

        <ul>
          ${lesson.prerequisite_knowledge
            .map(
              item =>
                `<li>${escapeHtml(item)}</li>`
            )
            .join("")}
        </ul>

      </article>
    `;
  }

  // ========================================
  // Misconceptions
  // ========================================

  if (
    lesson.misconceptions &&
    lesson.misconceptions.length
  ) {

    html += `
      <article class="result-card">

        <h3>⚠️ Common Misconceptions</h3>

        <ul>
          ${lesson.misconceptions
            .map(
              item =>
                `<li>${escapeHtml(item)}</li>`
            )
            .join("")}
        </ul>

      </article>
    `;
  }

  // ========================================
  // Lesson Flow
  // ========================================

  if (
    lesson.lesson_flow &&
    lesson.lesson_flow.length
  ) {

    html += `
      <article class="result-card">

        <h3>📝 Lesson Flow</h3>

        <div class="lesson-flow">
    `;

    lesson.lesson_flow.forEach(
      (phase, index) => {

        html += `
          <div class="lesson-phase">

            <h4>
              ${index + 1}.
              ${escapeHtml(
                phase.phase
              )}
            </h4>

            <p>
              <strong>
                ${escapeHtml(
                  phase.minutes
                )} minutes
              </strong>
            </p>
        `;

        if (
          phase.teacher_actions &&
          phase.teacher_actions.length
        ) {

          html += `
            <div>
              <strong>
                Teacher Actions
              </strong>

              <ul>
                ${phase.teacher_actions
                  .map(
                    item =>
                      `<li>${escapeHtml(item)}</li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        }

        if (
          phase.student_actions &&
          phase.student_actions.length
        ) {

          html += `
            <div>
              <strong>
                Student Actions
              </strong>

              <ul>
                ${phase.student_actions
                  .map(
                    item =>
                      `<li>${escapeHtml(item)}</li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        }

        html += `
          </div>
        `;
      }
    );

    html += `
        </div>

      </article>
    `;
  }

  // ========================================
  // Assessment
  // ========================================

  if (
    lesson.assessment &&
    lesson.assessment.length
  ) {

    html += `
      <article class="result-card">

        <h3>🧪 Formative Assessment</h3>

        <div class="assessment-list">
    `;

    lesson.assessment.forEach(
      (item, index) => {

        html += `
          <div class="assessment-item">

            <p>
              <strong>
                ${index + 1}.
              </strong>

              ${escapeHtml(
                item.question
              )}
            </p>

            <details>

              <summary>
                Show answer
              </summary>

              <p>
                ${escapeHtml(
                  item.answer
                )}
              </p>

            </details>

          </div>
        `;
      }
    );

    html += `
        </div>

      </article>
    `;
  }

  // ========================================
  // Homework
  // ========================================

  if (lesson.homework) {

    html += `
      <article class="result-card">

        <h3>🏠 Homework</h3>

        <p>
          ${escapeHtml(
            lesson.homework
          )}
        </p>

      </article>
    `;
  }

  // ========================================
  // Summary
  // ========================================

  if (lesson.summary) {

    html += `
      <article class="result-card">

        <h3>📌 Lesson Summary</h3>

        <p>
          ${escapeHtml(
            lesson.summary
          )}
        </p>

      </article>
    `;
  }

  // ========================================
  // Slide Deck
  // ========================================

  if (
    outputs.includes("Slide Deck") &&
    presentation &&
    presentation.slides &&
    presentation.slides.length
  ) {

    html += `
      <article class="result-card">

        <div class="slide-header">

          <div>

            <div class="result-badge">
              AI PRESENTATION
            </div>

            <h3>
              📊 Slide Deck
            </h3>

            <p>
              ${presentation.slides.length}
              slides generated for this lesson.
            </p>

          </div>

          <button
            class="download-ppt-btn"
            id="downloadPptBtn"
          >
            📊 Generate PowerPoint
          </button>

        </div>

        <div class="slide-list">
    `;

    presentation.slides.forEach(
      slide => {

        html += `
          <div class="slide-preview">

            <div class="slide-number">
              Slide
              ${escapeHtml(
                slide.slide_number
              )}
            </div>

            <h4>
              ${escapeHtml(
                slide.title
              )}
            </h4>

            ${
              slide.content &&
              slide.content.length
                ? `
                  <ul>
                    ${slide.content
                      .map(
                        item =>
                          `<li>${escapeHtml(item)}</li>`
                      )
                      .join("")}
                  </ul>
                `
                : ""
            }

            ${
              slide.visual_suggestion
                ? `
                  <p>
                    <strong>
                      Visual:
                    </strong>
                    ${escapeHtml(
                      slide.visual_suggestion
                    )}
                  </p>
                `
                : ""
            }

            ${
              slide.interaction
                ? `
                  <p>
                    <strong>
                      Interaction:
                    </strong>
                    ${escapeHtml(
                      slide.interaction
                    )}
                  </p>
                `
                : ""
            }

          </div>
        `;
      }
    );

    html += `
        </div>

      </article>
    `;
  }

  // ========================================
  // No Presentation
  // ========================================

  else if (
    outputs.includes("Slide Deck")
  ) {

    html += `
      <article class="result-card">

        <h3>📊 Slide Deck</h3>

        <p>
          The lesson was generated successfully,
          but no presentation slides were returned.
        </p>

        <button
          class="download-ppt-btn"
          id="downloadPptBtn"
        >
          📊 Generate PowerPoint
        </button>

      </article>
    `;
  }

  // ========================================
  // Render
  // ========================================

  resultContent.innerHTML =
    html;

  resultSection.classList.remove(
    "hidden"
  );

  // ========================================
  // PowerPoint Button
  // ========================================

  const downloadButton =
    document.getElementById(
      "downloadPptBtn"
    );

  if (downloadButton) {

    downloadButton.addEventListener(
      "click",
      generatePowerPoint
    );
  }

  // ========================================
  // Scroll to Result
  // ========================================

  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

// ==========================================
// Generate PowerPoint
// ==========================================

async function generatePowerPoint() {

  const button =
    document.getElementById(
      "downloadPptBtn"
    );

  if (!button) {
    return;
  }

  if (!currentRequest) {

    alert(
      "No lesson request is available."
    );

    return;
  }

  button.disabled = true;

  button.textContent =
    "Creating PowerPoint...";

  try {

    const response =
      await fetch(
        "/api/generate-ppt",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            currentRequest
          )
        }
      );

    if (!response.ok) {

      let errorMessage =
        "PowerPoint generation failed.";

      try {

        const errorData =
          await response.json();

        errorMessage =
          errorData.message ||
          errorMessage;

      } catch {
        // Response was not JSON
      }

      throw new Error(
        errorMessage
      );
    }

    const blob =
      await response.blob();

    const url =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement("a");

    link.href = url;

    const title =
      currentLesson?.title ||
      currentRequest.topic ||
      "school-management-lesson";

    link.download =
      `${title
        .replace(
          /[^a-z0-9]/gi,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        )
        .toLowerCase()}.pptx`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    window.URL.revokeObjectURL(
      url
    );

    button.textContent =
      "✓ PowerPoint downloaded";

  } catch (error) {

    console.error(
      "PowerPoint error:",
      error
    );

    alert(
      error.message ||
      "Unable to create the PowerPoint."
    );

    button.disabled = false;

    button.textContent =
      "📊 Generate PowerPoint";
  }
}

// ==========================================
// Reset
// ==========================================

if (resetBtn) {

  resetBtn.addEventListener(
    "click",
    () => {

      if (resultSection) {
        resultSection.classList.add(
          "hidden"
        );
      }

      if (resultContent) {
        resultContent.innerHTML = "";
      }

      currentLesson = null;

      currentPresentation = null;

      currentRequest = null;

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  );
}

// ==========================================
// Escape HTML
// ==========================================

function escapeHtml(value) {

  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}