import { heuristicSegments } from "@clipforge/shared";

describe("heuristicSegments", () => {
  it("returns segments sorted by heuristic score", () => {
    const words = Array.from({ length: 100 }, (_, index) => ({
      text: index % 10 === 0 ? "insane" : `word${index}`,
      startMs: index * 1000,
      endMs: index * 1000 + 500
    }));

    const segments = heuristicSegments(words, 100 * 1000, { count: 5 });
    expect(segments).toHaveLength(5);
    expect(segments[0].aiScore).toBeGreaterThanOrEqual(segments[segments.length - 1].aiScore);
  });
});
