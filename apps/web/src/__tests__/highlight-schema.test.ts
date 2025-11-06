import { highlightSuggestionResponseSchema } from "@clipforge/shared";

describe("highlightSuggestionResponseSchema", () => {
  it("validates correctly structured payload", () => {
    const payload = {
      projectId: "ckl0g7q7x000001s6wqk4n0x9",
      segments: [
        {
          id: "seg-1",
          projectId: "ckl0g7q7x000001s6wqk4n0x9",
          startMs: 0,
          endMs: 30000,
          title: "Great intro",
          hook: "You won't believe this story",
          aiScore: 0.82,
          aspectRatio: "9:16",
          reasons: ["High energy"],
          captionMode: "karaoke"
        }
      ]
    };

    expect(() => highlightSuggestionResponseSchema.parse(payload)).not.toThrow();
  });

  it("rejects invalid payload", () => {
    const payload = {
      projectId: "ckl0g7q7x000001s6wqk4n0x9",
      segments: [
        {
          id: "seg-1",
          projectId: "ckl0g7q7x000001s6wqk4n0x9",
          startMs: -10,
          endMs: 30000,
          title: "",
          hook: "bad",
          aiScore: 2
        }
      ]
    };

    expect(() => highlightSuggestionResponseSchema.parse(payload)).toThrow();
  });
});
