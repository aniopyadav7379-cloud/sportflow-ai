import { render, screen } from "@testing-library/react";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders default copy", () => {
    render(<EmptyState />);
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(<EmptyState title="No clubs" description="Add one to get started" />);
    expect(screen.getByText("No clubs")).toBeInTheDocument();
    expect(screen.getByText("Add one to get started")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("renders a retry button and calls the handler on click", () => {
    const onRetry = jest.fn();
    render(<ErrorState message="Network error" onRetry={onRetry} />);
    expect(screen.getByText("Network error")).toBeInTheDocument();
    screen.getByText("Retry").click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
