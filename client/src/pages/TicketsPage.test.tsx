import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router";
import { renderWithQuery } from "@/test/render";
import TicketsPage from "./TicketsPage";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, { deep: true });

const tickets = [
  {
    id: 1,
    subject: "Cannot log in",
    status: "open",
    category: "technical_question",
    senderName: "Alice",
    senderEmail: "alice@example.com",
    assignedTo: null,
    createdAt: "2026-09-10T00:00:00.000Z",
  },
  {
    id: 2,
    subject: "Refund please",
    status: "resolved",
    category: "refund_request",
    senderName: "Bob",
    senderEmail: "bob@example.com",
    assignedTo: { id: "u1", name: "Agent Smith" },
    createdAt: "2026-09-12T00:00:00.000Z",
  },
];

function renderPage() {
  return renderWithQuery(
    <MemoryRouter initialEntries={["/tickets"]}>
      <Routes>
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id" element={<div>Ticket detail page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TicketsPage", () => {
  it("shows loading skeletons while the tickets query is pending", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText("Tickets")).toBeInTheDocument();
    expect(screen.queryByText("Cannot log in")).not.toBeInTheDocument();
  });

  it("renders the fetched tickets once loaded", async () => {
    mockedAxios.get.mockResolvedValue({ data: { tickets, total: 2, page: 1, pageSize: 10 } });

    renderPage();

    expect(await screen.findByText("Cannot log in")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Agent Smith")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("shows an error alert when the tickets query fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("network error"));

    renderPage();

    expect(await screen.findByText("Failed to load tickets")).toBeInTheDocument();
  });

  it("requests the next sort order when a column header is clicked", async () => {
    const userEventSession = userEvent.setup();
    mockedAxios.get.mockResolvedValue({ data: { tickets, total: 2, page: 1, pageSize: 10 } });

    renderPage();
    await screen.findByText("Cannot log in");

    await userEventSession.click(screen.getByText("Subject"));

    await waitFor(() => {
      const lastCall = mockedAxios.get.mock.calls.at(-1);
      expect(lastCall?.[1]?.params).toMatchObject({ sortBy: "subject", sortOrder: "asc" });
    });
  });

  it("debounces search input and requests with the search term", async () => {
    const userEventSession = userEvent.setup();
    mockedAxios.get.mockResolvedValue({ data: { tickets, total: 2, page: 1, pageSize: 10 } });

    renderPage();
    await screen.findByText("Cannot log in");

    await userEventSession.type(
      screen.getByPlaceholderText("Search subject or sender..."),
      "refund",
    );

    await waitFor(
      () => {
        const lastCall = mockedAxios.get.mock.calls.at(-1);
        expect(lastCall?.[1]?.params).toMatchObject({ search: "refund" });
      },
      { timeout: 2000 },
    );
  });

  it("disables Previous on the first page and requests the next page on click", async () => {
    const userEventSession = userEvent.setup();
    mockedAxios.get.mockResolvedValue({ data: { tickets, total: 25, page: 1, pageSize: 10 } });

    renderPage();
    await screen.findByText("Cannot log in");

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();

    await userEventSession.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      const lastCall = mockedAxios.get.mock.calls.at(-1);
      expect(lastCall?.[1]?.params).toMatchObject({ page: 2 });
    });
  });

  it("navigates to the ticket detail page when a row is clicked", async () => {
    const userEventSession = userEvent.setup();
    mockedAxios.get.mockResolvedValue({ data: { tickets, total: 2, page: 1, pageSize: 10 } });

    renderPage();
    await screen.findByText("Cannot log in");

    const row = screen.getByText("Cannot log in").closest("tr")!;
    await userEventSession.click(within(row).getByText("Cannot log in"));

    expect(await screen.findByText("Ticket detail page")).toBeInTheDocument();
  });
});
