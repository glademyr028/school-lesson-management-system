require("dotenv").config();

const {
  generateLesson
} = require("./services/lessonService");


async function test() {

  try {

    console.log("=================================");
    console.log(" SCHOOL MANAGEMENT AI TEST");
    console.log("=================================");


    const result = await generateLesson({

      curriculum:
        "Philippines · MATATAG",

      gradeSubject:
        "Grade 5 · Science",

      topic:
        "The water cycle, 40-minute period, include a short formative quiz",

      outputs: [
        "Lesson Plan",
        "Learning Module",
        "Slide Deck"
      ]

    });


    console.log("\n=================================");
    console.log(" LESSON RESULT");
    console.log("=================================\n");

    console.log(
      JSON.stringify(
        result,
        null,
        2
      )
    );


    console.log("\n=================================");
    console.log(" AI TEST SUCCESSFUL");
    console.log("=================================");


  } catch (error) {

    console.error("\n=================================");
    console.error(" ❌ AI TEST FAILED");
    console.error("=================================");

    console.error(error);

  }

}


test();