const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

async function createLessonPowerPoint(lesson) {
  const pptx = new pptxgen();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "School Management System";
  pptx.subject = lesson.gradeSubject || "Lesson";
  pptx.title = lesson.title;
  pptx.company = "School Management System";
  pptx.lang = "en-US";

  // ==========================================
  // Slide 1 — Title
  // ==========================================

  let slide = pptx.addSlide();

  slide.background = {
    color: "5B35D5"
  };

  slide.addText("School Management System", {
    x: 0.7,
    y: 0.7,
    w: 11,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: "FFFFFF"
  });

  slide.addText(lesson.title, {
    x: 0.7,
    y: 2.0,
    w: 11,
    h: 1.2,
    fontSize: 36,
    bold: true,
    color: "FFFFFF",
    margin: 0
  });

  slide.addText(lesson.gradeSubject || "", {
    x: 0.7,
    y: 3.5,
    w: 10,
    h: 0.5,
    fontSize: 20,
    color: "EDE9FE"
  });

  slide.addText(lesson.curriculum || "", {
    x: 0.7,
    y: 4.0,
    w: 10,
    h: 0.4,
    fontSize: 15,
    color: "DDD6FE"
  });

  // ==========================================
  // Slide 2 — Learning Objectives
  // ==========================================

  slide = pptx.addSlide();

  slide.addText("Learning Objectives", {
    x: 0.7,
    y: 0.6,
    w: 11,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "17181C"
  });

  const objectives = lesson.objectives || [
    "Explain the main concept of the lesson.",
    "Identify important terms and processes.",
    "Apply the concept through a short activity."
  ];

  slide.addText(
    objectives.map(item => `• ${item}`).join("\n\n"),
    {
      x: 0.9,
      y: 1.6,
      w: 10,
      h: 3,
      fontSize: 21,
      color: "33343A",
      valign: "mid"
    }
  );

  // ==========================================
  // Slide 3 — Introduction
  // ==========================================

  slide = pptx.addSlide();

  slide.addText("Introduction", {
    x: 0.7,
    y: 0.6,
    w: 11,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "17181C"
  });

  slide.addText(
    lesson.introduction ||
    `Today's lesson focuses on "${lesson.title}".`,
    {
      x: 0.9,
      y: 1.6,
      w: 10,
      h: 2.8,
      fontSize: 22,
      color: "44464D",
      valign: "mid",
      margin: 0.1
    }
  );

  // ==========================================
  // Slide 4 — Main Concept
  // ==========================================

  slide = pptx.addSlide();

  slide.addText("Lesson Proper", {
    x: 0.7,
    y: 0.6,
    w: 11,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "17181C"
  });

  slide.addText(
    lesson.lessonProper ||
    `Key concept:\n\n${lesson.title}`,
    {
      x: 0.9,
      y: 1.5,
      w: 10,
      h: 3.6,
      fontSize: 22,
      color: "33343A",
      margin: 0.1
    }
  );

  // ==========================================
  // Slide 5 — Activity
  // ==========================================

  slide = pptx.addSlide();

  slide.addText("Learning Activity", {
    x: 0.7,
    y: 0.6,
    w: 11,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "17181C"
  });

  slide.addText(
    lesson.activity ||
    "1. Work with a partner or small group.\n\n" +
    "2. Discuss the main ideas from the lesson.\n\n" +
    "3. Create a short explanation or diagram.\n\n" +
    "4. Share your work with the class.",
    {
      x: 0.9,
      y: 1.5,
      w: 10,
      h: 3.8,
      fontSize: 21,
      color: "33343A"
    }
  );

  // ==========================================
  // Slide 6 — Assessment
  // ==========================================

  slide = pptx.addSlide();

  slide.addText("Quick Check", {
    x: 0.7,
    y: 0.6,
    w: 11,
    h: 0.6,
    fontSize: 28,
    bold: true,
    color: "17181C"
  });

  slide.addText(
    lesson.assessment ||
    "1. What is the main idea of today's lesson?\n\n" +
    "2. Name one important concept you learned.\n\n" +
    "3. How would you explain the topic to a classmate?",
    {
      x: 0.9,
      y: 1.5,
      w: 10,
      h: 3.5,
      fontSize: 21,
      color: "33343A"
    }
  );

  // ==========================================
  // Slide 7 — Summary
  // ==========================================

  slide = pptx.addSlide();

  slide.background = {
    color: "F3F0FF"
  };

  slide.addText("Lesson Summary", {
    x: 0.7,
    y: 0.7,
    w: 11,
    h: 0.7,
    fontSize: 30,
    bold: true,
    color: "4724B7"
  });

  slide.addText(
    lesson.summary ||
    `Today we learned about:\n\n${lesson.title}`,
    {
      x: 0.9,
      y: 1.7,
      w: 10,
      h: 3,
      fontSize: 23,
      color: "33343A",
      margin: 0.1
    }
  );

  // ==========================================
  // Save PowerPoint
  // ==========================================

  const outputDir = path.join(__dirname, "../generated");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `lesson-${Date.now()}.pptx`;
  const filePath = path.join(outputDir, fileName);

  await pptx.writeFile({
    fileName: filePath
  });

  return {
    filePath,
    fileName
  };
}

module.exports = {
  createLessonPowerPoint
};