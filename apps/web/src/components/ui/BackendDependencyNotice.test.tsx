import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BackendDependencyNotice } from "./BackendDependencyNotice";

describe("BackendDependencyNotice", () => {
  it("renders the module name and endpoint contract", () => {
    render(
      <BackendDependencyNotice
        module="Maintenance"
        endpoints={["GET    /maintenance", "POST   /maintenance"]}
      />
    );

    expect(screen.getByText(/Maintenance — backend endpoint not implemented/)).toBeInTheDocument();
    // Multi-space separators are normalized by Testing Library
    expect(screen.getByText(/GET\s+\/maintenance/)).toBeInTheDocument();
    expect(screen.getByText(/POST\s+\/maintenance/)).toBeInTheDocument();
  });

  it("renders the default description when none provided", () => {
    render(
      <BackendDependencyNotice module="Inventory" endpoints={["GET /inventory/items"]} />
    );
    expect(screen.getByText(/design placeholder/i)).toBeInTheDocument();
  });

  it("renders a custom description when provided", () => {
    render(
      <BackendDependencyNotice
        module="Inventory"
        endpoints={["GET /inventory/items"]}
        description="Custom explanation of the missing API."
      />
    );
    expect(screen.getByText(/Custom explanation of the missing API/)).toBeInTheDocument();
  });
});