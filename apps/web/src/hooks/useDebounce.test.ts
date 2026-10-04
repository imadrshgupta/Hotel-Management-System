import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

afterEach(() => {
  vi.useRealTimers();
});

describe("useDebounce", () => {
  it("returns the initial value immediately", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useDebounce("a", 300));
    expect(result.current).toBe("a");
  });

  it("does not update before the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("a");
  });

  it("updates after the delay elapses", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("b");
  });

  it("coalesces rapid changes into a single update", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );

    rerender({ value: "b" });
    rerender({ value: "c" });
    rerender({ value: "d" });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("d");
  });
});