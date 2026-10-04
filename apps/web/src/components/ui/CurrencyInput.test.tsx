import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CurrencyInput } from "./CurrencyInput";

describe("CurrencyInput", () => {
  it("shows the currency symbol", () => {
    render(<CurrencyInput value={0} onChange={() => {}} currencySymbol="$" />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("emits a parsed number on change", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "42.5" } });

    expect(onChange).toHaveBeenLastCalledWith(42.5);
  });

  it("emits 0 for invalid input", () => {
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "abc" } });

    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("disables the input when disabled", () => {
    render(<CurrencyInput value={5} onChange={() => {}} disabled />);
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });
});