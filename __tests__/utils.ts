import { isNumerical, isPositiveInteger } from "@/utils";
import { describe, expect, test } from "@jest/globals";

describe("isNumerical", () => {
  test("as int", () => {
    expect(isNumerical(2)).toBeTruthy();
  });

  test("as float", () => {
    expect(isNumerical(1.2)).toBeTruthy();
  });

  test("as string int", () => {
    expect(isNumerical("2")).toBeTruthy();
  });

  test("as string float", () => {
    expect(isNumerical("1.2")).toBeTruthy();
  });

  test("empty string", () => {
    expect(isNumerical("")).toBeFalsy();
  });

  test("comma instead of period", () => {
    expect(isNumerical("1,4")).toBeFalsy();
  });

  test("random text", () => {
    expect(isNumerical("c0e4f2")).toBeFalsy();
  });
});

describe("isPositiveInteger", () => {
  test("as int", () => {
    expect(isPositiveInteger(1)).toBeTruthy();
  });

  test("as string", () => {
    expect(isPositiveInteger("1")).toBeTruthy();
  });

  test("negative as int", () => {
    expect(isPositiveInteger(-1)).toBeFalsy();
  });

  test("negative as string", () => {
    expect(isPositiveInteger("-1")).toBeFalsy();
  });

  test("float as number", () => {
    expect(isPositiveInteger(123.45)).toBeFalsy();
  });

  test("float as string", () => {
    expect(isPositiveInteger("123.45")).toBeFalsy();
  });

  test("random text", () => {
    expect(isPositiveInteger("c0e4f2")).toBeFalsy();
  });
});
