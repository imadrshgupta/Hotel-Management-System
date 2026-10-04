import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("maps known room statuses to friendly labels", () => {
    render(<StatusBadge status="VACANT_CLEAN" type="room" />);
    expect(screen.getByText("Vacant Clean")).toBeInTheDocument();
  });

  it("maps known reservation statuses", () => {
    render(<StatusBadge status="NO_SHOW" type="reservation" />);
    expect(screen.getByText("No Show")).toBeInTheDocument();
  });

  it("falls back to a humanized raw value for unknown statuses", () => {
    render(<StatusBadge status="SOME_UNKNOWN_STATE" type="generic" />);
    expect(screen.getByText("SOME UNKNOWN STATE")).toBeInTheDocument();
  });

  it("maps priority labels", () => {
    render(<StatusBadge status="URGENT" type="priority" />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });

  it("renders the small size variant", () => {
    const { container } = render(<StatusBadge status="OPEN" type="generic" size="sm" />);
    expect(container.querySelector("span")).toBeInTheDocument();
  });
});