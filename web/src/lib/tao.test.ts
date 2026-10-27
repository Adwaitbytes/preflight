import { describe, expect, it } from "vitest";
import { formatTaoAmount, formatTaoFee, normalizeTaoText } from "./tao";

describe("formatTaoAmount", () => {
  it("trims trailing zeros", () => {
    expect(formatTaoAmount(0)).toBe("0");
    expect(formatTaoAmount(0.0005)).toBe("0.0005");
    expect(formatTaoAmount(1.5)).toBe("1.5");
    expect(formatTaoAmount(345.0321)).toBe("345.0321");
    expect(formatTaoAmount(1234.5)).toBe("1,234.5");
  });

  it("keeps a significant digit for tiny values down to one rao", () => {
    expect(formatTaoAmount(0.00107089)).toBe("0.00107");
    expect(formatTaoAmount(0.000000001)).toBe("0.000000001");
    expect(formatTaoAmount(0.0000000001)).toBe("<0.000000001");
    expect(formatTaoAmount(-0.0000000001)).toBe(">-0.000000001");
  });

  it("never prints NaN", () => {
    expect(formatTaoAmount(Number.NaN)).toBe("n/a");
  });
});

describe("formatTaoFee", () => {
  it("adds the unit and handles a missing fee", () => {
    expect(formatTaoFee(0)).toBe("0 TAO");
    expect(formatTaoFee(0.00107089)).toBe("0.00107 TAO");
    expect(formatTaoFee(null)).toBe("n/a");
  });
});

describe("normalizeTaoText", () => {
  it("formats the fee in an event summary like the fee header", () => {
    expect(normalizeTaoText("Fee paid 0.000000000 TAO")).toBe(`Fee paid ${formatTaoFee(0)}`);
  });

  it("formats amounts marked by TAO, tau, fee or burn", () => {
    expect(normalizeTaoText("0.000000 TAO free for a 0.001071 fee")).toBe("0 TAO free for a 0.00107 fee");
    expect(normalizeTaoText("0.0000 TAO free, needs 0.0005 burn + 0.001071 fee")).toBe("0 TAO free, needs 0.0005 burn + 0.00107 fee");
    expect(normalizeTaoText("burn τ0.000500000 (destroyed)")).toBe("burn τ0.0005 (destroyed)");
    expect(normalizeTaoText("Locks 1,345.03210 TAO")).toBe("Locks 1,345.0321 TAO");
  });

  it("leaves other numbers alone", () => {
    expect(normalizeTaoText("0 of 1 used this block")).toBe("0 of 1 used this block");
    expect(normalizeTaoText("trust 0.123456 at block 9,377,656")).toBe("trust 0.123456 at block 9,377,656");
    expect(normalizeTaoText("1 TAO")).toBe("1 TAO");
  });
});
