// ==========================================
// AI Service Compatibility Layer
// ==========================================
//
// The actual AI lesson pipeline lives in:
// services/lessonService.js
//
// This file keeps server.js compatible with
// the new architecture.
//

const {
  generateLesson
} = require("./lessonService");

module.exports = {
  generateLesson
};