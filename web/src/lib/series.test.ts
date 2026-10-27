import { describe, expect, it } from "vitest";
import { constantValue, tileGrid } from "./series";

describe("constantValue", () => {
  it("returns the value a flat series holds", () => {
    expect(constantValue([0, 0, 0])).toBe(0);
    expect(constantValue([7])).toBe(7);
  });

  it("returns null for a moving or empty series", () => {
    expect(constantValue([0, 0, 0.1])).toBeNull();
    expect(constantValue([])).toBeNull();
  });
});

describe("tileGrid", () => {
  it("never leaves an empty cell", () => {
    expect(tileGrid(1)).toEqual({ grid: "grid-cols-1", lastTile: "" });
    expect(tileGrid(2)).toEqual({ grid: "grid-cols-2", lastTile: "" });
    expect(tileGrid(3)).toEqual({ grid: "grid-cols-2 lg:grid-cols-3", lastTile: "col-span-2 lg:col-span-1" });
    expect(tileGrid(4)).toEqual({ grid: "grid-cols-2 lg:grid-cols-4", lastTile: "" });
  });
});
