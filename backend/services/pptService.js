const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function visualSvg(suggestion, title) {
  const text = `${suggestion || ""} ${title || ""}`.toLowerCase();

  // A small set of reusable educational illustrations.
  // These are generated locally as SVG, so the PowerPoint does not
  // depend on remote image URLs or an image-search service.
  if (/water|rain|evaporation|condensation|precipitation|water cycle/.test(text)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
      <rect width="900" height="520" rx="32" fill="#EEF4FF"/>
      <circle cx="125" cy="115" r="62" fill="#FFD166"/>
      <g fill="#FFFFFF" stroke="#B8C4D8" stroke-width="5">
        <ellipse cx="385" cy="145" rx="105" ry="55"/><ellipse cx="470" cy="145" rx="90" ry="48"/><ellipse cx="550" cy="150" rx="85" ry="45"/>
      </g>
      <path d="M0 370 Q150 320 300 370 T600 370 T900 370 V520 H0Z" fill="#65B7E8"/>
      <path d="M210 325 C170 245 200 190 270 165" fill="none" stroke="#5B35D5" stroke-width="12" stroke-linecap="round"/>
      <path d="M265 165 l-24 8 l13 22" fill="#5B35D5"/>
      <path d="M615 185 C700 230 700 290 650 335" fill="none" stroke="#5B35D5" stroke-width="12" stroke-linecap="round"/>
      <path d="M650 335 l-8-26 l-22 14" fill="#5B35D5"/>
      <g stroke="#3D91C6" stroke-width="8" stroke-linecap="round">
        <path d="M420 220 l-18 42"/><path d="M470 220 l-18 42"/><path d="M520 220 l-18 42"/>
      </g>
      <text x="450" y="475" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="#25324A">Water Cycle</text>
    </svg>`;
  }

  if (/plant|photosynthesis|leaf|flower|ecosystem/.test(text)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
      <rect width="900" height="520" rx="32" fill="#F0F8EE"/>
      <circle cx="720" cy="105" r="58" fill="#FFD166"/>
      <path d="M450 430 V235" stroke="#4D8B3A" stroke-width="20" stroke-linecap="round"/>
      <path d="M450 330 C355 270 290 300 250 365 C330 385 390 375 450 330Z" fill="#78B96B"/>
      <path d="M450 290 C540 220 610 250 650 315 C570 335 510 330 450 290Z" fill="#62A955"/>
      <path d="M450 235 C385 170 400 115 455 85 C510 145 505 190 450 235Z" fill="#4D8B3A"/>
      <path d="M270 430 H650" stroke="#A97845" stroke-width="24" stroke-linecap="round"/>
      <text x="450" y="485" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="#31572C">Plant &amp; Photosynthesis</text>
    </svg>`;
  }

  if (/math|fraction|geometry|triangle|circle|angle|equation|number/.test(text)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
      <rect width="900" height="520" rx="32" fill="#F7F2FF"/>
      <circle cx="170" cy="145" r="75" fill="#DCCBFF"/>
      <path d="M170 70 A75 75 0 0 1 170 220 Z" fill="#8D6BE8"/>
      <path d="M360 220 L500 75 L640 220 Z" fill="#BFA8F5" stroke="#6B4AC6" stroke-width="8"/>
      <rect x="700" y="80" width="105" height="140" rx="12" fill="#FFFFFF" stroke="#6B4AC6" stroke-width="8"/>
      <text x="752" y="140" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="#4C3690">a</text>
      <line x1="715" y1="160" x2="790" y2="160" stroke="#4C3690" stroke-width="5"/>
      <text x="752" y="200" text-anchor="middle" font-family="Arial" font-size="32" font-weight="700" fill="#4C3690">b</text>
      <text x="450" y="475" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="#44336D">Math Visual</text>
    </svg>`;
  }

  if (/book|reading|language|english|story|literature|vocabulary/.test(text)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
      <rect width="900" height="520" rx="32" fill="#FFF6E8"/>
      <path d="M160 125 Q300 80 450 145 V390 Q300 330 160 385Z" fill="#FFFFFF" stroke="#D28A35" stroke-width="10"/>
      <path d="M450 145 Q600 80 740 125 V385 Q600 330 450 390Z" fill="#FFFFFF" stroke="#D28A35" stroke-width="10"/>
      <g stroke="#D9B27A" stroke-width="7"><path d="M210 170 H390"/><path d="M210 205 H390"/><path d="M510 170 H690"/><path d="M510 205 H690"/></g>
      <text x="450" y="475" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="#7A4D1E">Reading &amp; Language</text>
    </svg>`;
  }

  if (/earth|map|geography|continent|country|world/.test(text)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
      <rect width="900" height="520" rx="32" fill="#EAF7F7"/>
      <circle cx="450" cy="255" r="165" fill="#66B7D9" stroke="#317C99" stroke-width="10"/>
      <path d="M330 150 C380 120 410 170 390 205 C360 245 300 220 295 275 C350 305 370 350 430 365 C470 330 500 305 535 315 C585 330 610 275 580 235 C545 185 520 150 480 130Z" fill="#72B36A"/>
      <path d="M450 90 V420 M285 255 H615" stroke="#FFFFFF" stroke-width="5" opacity="0.7"/>
      <text x="450" y="475" text-anchor="middle" font-family="Arial" font-size="30" font-weight="700" fill="#255A70">Earth &amp; Geography</text>
    </svg>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
    <rect width="900" height="520" rx="32" fill="#F4F1FF"/>
    <circle cx="450" cy="215" r="95" fill="#D9CCFF"/>
    <path d="M410 205 Q450 165 490 205 L475 255 H425Z" fill="#FFFFFF" stroke="#6A50C8" stroke-width="8"/>
    <path d="M425 275 H475" stroke="#6A50C8" stroke-width="10" stroke-linecap="round"/>
    <text x="450" y="400" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#4B3A82">Learning Visual</text>
    <text x="450" y="445" text-anchor="middle" font-family="Arial" font-size="20" fill="#665B82">${escapeXml((suggestion || "Concept illustration").slice(0, 60))}</text>
  </svg>`;
}

function addVisual(slide, suggestion, title) {
  const svg = visualSvg(suggestion, title);
  slide.addImage({
    data: "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64"),
    x: 7.15,
    y: 1.35,
    w: 5.15,
    h: 3.05
  });
}

function addBullets(slide, content) {
  const items = Array.isArray(content) ? content.filter(item => item !== null && item !== undefined && String(item).trim() !== "") : [];
  if (!items.length) return;

  slide.addText(
    items.map(item => `• ${item}`).join("\n"),
    {
      x: 0.75,
      y: 1.45,
      w: 5.95,
      h: 4.55,
      fontSize: 19,
      color: "33343A",
      breakLine: false,
      margin: 0.05,
      valign: "mid",
      fit: "shrink"
    }
  );
}

async function createLessonPowerPoint(lesson) {
  const pptx = new pptxgen();

  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "School Management System";
  pptx.subject = lesson.gradeSubject || "Lesson";
  pptx.title = lesson.title || "Lesson";
  pptx.company = "School Management System";
  pptx.lang = "en-US";

  const slides = lesson.presentation?.slides || [];

  // Title slide
  let slide = pptx.addSlide();
  slide.background = { color: "5B35D5" };
  slide.addText("School Management System", {
    x: 0.7, y: 0.7, w: 11, h: 0.5,
    fontSize: 20, bold: true, color: "FFFFFF"
  });
  slide.addText(String(lesson.title || "Lesson"), {
    x: 0.7, y: 1.8, w: 6.1, h: 1.7,
    fontSize: 34, bold: true, color: "FFFFFF", margin: 0, fit: "shrink"
  });
  slide.addText(String(lesson.gradeSubject || ""), {
    x: 0.7, y: 3.7, w: 5.9, h: 0.45,
    fontSize: 20, color: "EDE9FE"
  });
  slide.addText(String(lesson.curriculum || ""), {
    x: 0.7, y: 4.25, w: 5.9, h: 0.4,
    fontSize: 15, color: "DDD6FE"
  });
  addVisual(slide, slides[0]?.visual_suggestion || lesson.title, lesson.title);

  // AI-generated presentation slides
  slides.forEach((item, index) => {
    slide = pptx.addSlide();

    slide.addText(String(item.title || `Lesson Slide ${index + 1}`), {
      x: 0.7, y: 0.55, w: 11.7, h: 0.65,
      fontSize: 28, bold: true, color: "17181C", fit: "shrink"
    });

    addBullets(slide, item.content);

    addVisual(
      slide,
      item.visual_suggestion || item.image_search_terms?.join(", "),
      item.title
    );

    if (item.interaction) {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.75, y: 5.35, w: 11.5, h: 0.85,
        rectRadius: 0.08,
        fill: { color: "F3F0FF" },
        line: { color: "D9CCFF", width: 1 }
      });
      slide.addText(`Classroom prompt: ${String(item.interaction)}`, {
        x: 0.95, y: 5.58, w: 11.1, h: 0.35,
        fontSize: 14, bold: true, color: "4B3A82", fit: "shrink"
      });
    }

    if (item.teacher_notes) {
      slide.addNotes(String(item.teacher_notes));
    }
  });

  // Fallback deck if the presentation structure is unavailable.
  if (!slides.length) {
    slide = pptx.addSlide();
    slide.addText("Learning Objectives", {
      x: 0.7, y: 0.6, w: 11, h: 0.6,
      fontSize: 28, bold: true, color: "17181C"
    });
    addBullets(slide, lesson.learning_objectives || []);
    addVisual(slide, lesson.title, "Learning Objectives");
  }

  const outputDir = path.join(__dirname, "../generated");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fileName = `lesson-${Date.now()}.pptx`;
  const filePath = path.join(outputDir, fileName);

  await pptx.writeFile({ fileName: filePath });

  return { filePath, fileName };
}

module.exports = { createLessonPowerPoint };
