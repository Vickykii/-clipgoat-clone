import { z } from "zod";

const youtubeUrlRegex = /^(https?:\/\/)?(www\.|m\.)?youtube\.com\/.+|^(https?:\/\/)?(www\.)?youtu\.be\/.+/i;

export const createProjectSchema = z.object({
  sourceType: z.enum(["youtube", "upload"]),
  title: z.string().min(1).max(180).optional(),
  youtubeUrl: z
    .string()
    .url()
    .regex(youtubeUrlRegex, "Must be a valid YouTube URL")
    .optional(),
  uploadKey: z.string().min(3).optional(),
  workspaceId: z.string().cuid2()
}).superRefine((payload, ctx) => {
  if (payload.sourceType === "youtube" && !payload.youtubeUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "youtubeUrl is required for YouTube source",
      path: ["youtubeUrl"]
    });
  }
  if (payload.sourceType === "upload" && !payload.uploadKey) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "uploadKey is required for upload source",
      path: ["uploadKey"]
    });
  }
});

export const ingestProjectSchema = z.object({
  projectId: z.string().cuid2()
});

export const enqueueTranscriptionSchema = z.object({
  projectId: z.string().cuid2()
});

export const suggestSegmentsSchema = z.object({
  projectId: z.string().cuid2(),
  maxSegments: z.number().int().min(1).max(20).default(12)
});

export const clipStyleSchema = z.object({
  theme: z.enum(["mrbeast", "minimal", "tech", "custom"]).default("custom"),
  primaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
  secondaryColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
  backgroundColor: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    .optional(),
  fontFamily: z.string().min(1).max(80),
  captionStyle: z.object({
    size: z.number().min(12).max(72),
    weight: z.enum(["regular", "medium", "semibold", "bold"]),
    strokeColor: z.string().regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i),
    strokeWidth: z.number().min(0).max(12)
  }),
  watermarkUrl: z.string().url().optional()
});

export const clipStyleUpdateSchema = clipStyleSchema
  .extend({
    captionStyle: clipStyleSchema.shape.captionStyle.partial().optional()
  })
  .partial();

export const createClipSchema = z.object({
  projectId: z.string().cuid2(),
  segmentId: z.string().cuid2(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]),
  style: clipStyleSchema
});

export const updateClipSchema = z.object({
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).optional(),
  style: clipStyleUpdateSchema.optional()
});

export const enqueueRenderSchema = z.object({
  clipId: z.string().cuid2(),
  force: z.boolean().default(false)
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20)
});

export const highlightSegmentSchema = z.object({
  id: z.string().cuid2(),
  projectId: z.string().cuid2(),
  startMs: z.number().min(0),
  endMs: z.number().min(0),
  title: z.string().min(3).max(200),
  hook: z.string().min(3).max(200),
  aiScore: z.number().min(0).max(1),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]).default("9:16"),
  reasons: z.array(z.string()).default([]),
  captionMode: z.enum(["karaoke", "standard"]).default("karaoke"),
  emojis: z.array(z.string()).optional()
});

export const highlightSuggestionResponseSchema = z.object({
  projectId: z.string().cuid2(),
  segments: z.array(highlightSegmentSchema).min(1)
});

export const transcriptionWordSchema = z.object({
  text: z.string(),
  startMs: z.number().min(0),
  endMs: z.number().min(0),
  speaker: z.string().optional()
});

export const transcriptionPayloadSchema = z.object({
  projectId: z.string().cuid2(),
  words: z.array(transcriptionWordSchema),
  text: z.string(),
  provider: z.enum(["assemblyai", "openai"]),
  language: z.string().default("en"),
  status: z.enum(["processing", "completed", "failed"])
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type IngestProjectInput = z.infer<typeof ingestProjectSchema>;
export type EnqueueTranscriptionInput = z.infer<typeof enqueueTranscriptionSchema>;
export type SuggestSegmentsInput = z.infer<typeof suggestSegmentsSchema>;
export type ClipStyleInput = z.infer<typeof clipStyleSchema>;
export type ClipStyleUpdateInput = z.infer<typeof clipStyleUpdateSchema>;
export type CreateClipInput = z.infer<typeof createClipSchema>;
export type UpdateClipInput = z.infer<typeof updateClipSchema>;
export type EnqueueRenderInput = z.infer<typeof enqueueRenderSchema>;
export type HighlightSegment = z.infer<typeof highlightSegmentSchema>;
export type HighlightSuggestionResponse = z.infer<typeof highlightSuggestionResponseSchema>;
export type TranscriptionPayload = z.infer<typeof transcriptionPayloadSchema>;
