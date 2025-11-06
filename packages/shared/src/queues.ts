export const QUEUE_NAMES = {
  ingest: "ingestQueue",
  transcribe: "transcribeQueue",
  suggest: "suggestQueue",
  render: "renderQueue",
  publish: "publishQueue"
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const JOB_NAMES = {
  ingestProject: "ingestProject",
  transcribeProject: "transcribeProject",
  suggestSegments: "suggestSegments",
  renderClip: "renderClip",
  publishClip: "publishClip"
} as const;

export type JobName = (typeof JOB_NAMES)[keyof typeof JOB_NAMES];
