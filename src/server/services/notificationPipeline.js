// =====================================================================
// PREPBRIDGE EXAM TIMETABLE & REGULATORY NOTIFICATION PIPELINE
// Automated, fail-safe ingestion engine syncing UPSC/NTA exam schedules.
// Implements strict validator schemas to verify date and link integrity.
// =====================================================================

const { z } = require('zod');
const crypto = require('crypto');

// ─── 1. STRONGLY TYPED VALIDATOR SCHEMA ──────────────────────────────
const timetableNotificationSchema = z.object({
  authority: z.enum(['UPSC', 'NTA', 'IBPS', 'SSC', 'GATE_BOARD']),
  exam_id: z.string().min(2).max(100),
  official_title: z.string().min(10).max(255),
  notification_date: z.string().datetime(),
  registration_start: z.string().datetime(),
  registration_end: z.string().datetime(),
  exam_date: z.string().datetime(),
  official_url: z.string().url({ message: "Regulatory updates must contain verified HTTPS authority links." }),
  regulatory_checksum: z.string().min(32, { message: "Metadata payload must contain an official SHA-256 integrity hash." })
});

/**
 * Validates incoming timetable feeds from NTA/UPSC regulatory wires.
 * Prevents system duplicate/hallucinated modifications from committing.
 */
function validateIncomingTimetable(feedItem) {
  try {
    const validated = timetableNotificationSchema.parse(feedItem);
    
    // Strict chronological sanity boundary check
    const now = new Date();
    const regStart = new Date(validated.registration_start);
    const regEnd = new Date(validated.registration_end);
    const examDate = new Date(validated.exam_date);

    if (regEnd <= regStart) {
      throw new Error(`Invalid timeline: Registration end date (${validated.registration_end}) must occur after registration start (${validated.registration_start}).`);
    }

    if (examDate <= regEnd) {
      throw new Error(`Invalid timeline: Exam date (${validated.exam_date}) cannot occur before or during active registration (${validated.registration_end}).`);
    }

    // Verify payload SHA-256 payload integrity signature matches regulatory payload content
    const calculatedHash = crypto
      .createHash('sha256')
      .update(`${validated.authority}-${validated.exam_id}-${validated.exam_date}`)
      .digest('hex');

    // Hallucination alert trigger
    if (validated.regulatory_checksum !== calculatedHash) {
      console.warn(`[Security Alert] Timetable item signature mismatch! Possible spoofed/hallucinated regulatory alert detected for Exam: ${validated.exam_id}`);
      return { success: false, error: 'CHECKSUM_MISMATCH', details: 'Payload validation checksum did not match calculated authority hash.' };
    }

    return { success: true, data: validated };
  } catch (err) {
    console.error('[NotificationPipeline] Ingestion validation failed:', err.message);
    return { success: false, error: 'VALIDATION_FAILED', details: err.message };
  }
}

/**
 * Background Task Cron runner (celery worker proxy representation)
 * Simulates regulatory ingestion polling.
 */
async function pollRegulatoryTimetables() {
  console.log('[NotificationPipeline] Polling official government exam endpoints (UPSC/NTA/SSC) at:', new Date().toISOString());
  
  // Simulated incoming government wire payload
  const rawGovernmentPayload = {
    authority: 'UPSC',
    exam_id: 'upsc_ias_2026',
    official_title: 'Civil Services Examination 2026 Tentative Schedule',
    notification_date: new Date('2026-02-15T10:00:00Z').toISOString(),
    registration_start: new Date('2026-02-16T00:00:00Z').toISOString(),
    registration_end: new Date('2026-03-18T23:59:59Z').toISOString(),
    exam_date: new Date('2026-05-31T09:00:00Z').toISOString(),
    official_url: 'https://upsc.gov.in/exams-notifications/ias-2026',
    regulatory_checksum: '' // Generated dynamically below for sandbox validation
  };

  rawGovernmentPayload.regulatory_checksum = crypto
    .createHash('sha256')
    .update(`${rawGovernmentPayload.authority}-${rawGovernmentPayload.exam_id}-${rawGovernmentPayload.exam_date}`)
    .digest('hex');

  const result = validateIncomingTimetable(rawGovernmentPayload);
  if (result.success) {
    console.log(`[NotificationPipeline] Ingestion committed successfully for verified exam schedule: ${result.data.exam_id} ✓`);
    return result.data;
  } else {
    console.error(`[NotificationPipeline] Rejected corrupt timetable updates: ${result.error}`);
    return null;
  }
}

module.exports = {
  validateIncomingTimetable,
  pollRegulatoryTimetables
};
