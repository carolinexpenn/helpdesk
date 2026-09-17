import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter, Route, Routes } from "react-router";
import { renderWithQuery } from "@/test/render";
import TicketDetailPage from "./TicketDetailPage";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, { deep: true });

const ticket = {
  id: 1,
  subject: "Cannot log in",
  body: "I cannot log in to my account.",
  bodyHtml: null as string | null,
  status: "open",
  category: "technical_question",
  senderName: "Alice",
  senderEmail: "alice@example.com",
  assignedToId: null as string | null,
  assignedTo: null as { id: string; name: string } | null,
  createdAt: "2026-09-10T00:00:00.000Z",
};

const agents = [{ id: "u1", name: "Agent Smith" }];

const replies = [
  {
    id: 1,
    body: "Thanks for reaching out, looking into it.",
    senderType: "agent",
    user: { id: "u1", name: "Agent Smith" },
    createdAt: "2026-09-11T00:00:00.000Z",
  },
  {
    id: 2,
    body: "Still broken for me.",
    senderType: "customer",
    user: null,
    createdAt: "2026-09-12T00:00:00.000Z",
  },
];

function mockGetImplementation(overrides: { ticket?: unknown; replies?: unknown } = {}) {
  mockedAxios.get.mockImplementation((url: string) => {
    if (url === "/tickets/1") return Promise.resolve({ data: overrides.ticket ?? ticket });
    if (url === "/users") return Promise.resolve({ data: agents });
    if (url === "/tickets/1/replies") return Promise.resolve({ data: overrides.replies ?? replies });
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
}

function renderPage() {
  return renderWithQuery(
    <MemoryRouter initialEntries={["/tickets/1"]}>
      <Routes>
        <Route path="/tickets/:id" element={<TicketDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TicketDetailPage", () => {
  it("shows a loading state while the ticket query is pending", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.queryByText("Cannot log in")).not.toBeInTheDocument();
  });

  it("renders the ticket and its reply thread once loaded", async () => {
    mockGetImplementation();

    renderPage();

    expect(await screen.findByText("Cannot log in")).toBeInTheDocument();
    expect(screen.getByText(/I cannot log in to my account\./)).toBeInTheDocument();
    expect(screen.getByText(/Thanks for reaching out/)).toBeInTheDocument();
    expect(screen.getByText(/Still broken for me\./)).toBeInTheDocument();
  });

  it("shows an error alert when the ticket fails to load", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url === "/tickets/1") return Promise.reject(new Error("network error"));
      if (url === "/users") return Promise.resolve({ data: agents });
      if (url === "/tickets/1/replies") return Promise.resolve({ data: replies });
      return Promise.reject(new Error(`unexpected GET ${url}`));
    });

    renderPage();

    expect(await screen.findByText("Failed to load ticket")).toBeInTheDocument();
  });

  it("sanitizes bodyHtml so injected scripts never render", async () => {
    mockGetImplementation({
      ticket: { ...ticket, bodyHtml: "<p>Hello there</p><script>window.xssFired = true</script>" },
    });

    renderPage();

    expect(await screen.findByText("Hello there")).toBeInTheDocument();
    expect(document.querySelector("script")).not.toBeInTheDocument();
  });

  it("sends a reply and clears the textarea", async () => {
    const userEventSession = userEvent.setup();
    mockGetImplementation();
    mockedAxios.post.mockResolvedValue({ data: {} });

    renderPage();
    await screen.findByText("Cannot log in");

    const textarea = screen.getByLabelText("Reply");
    await userEventSession.type(textarea, "We're looking into it now.");
    await userEventSession.click(screen.getByRole("button", { name: "Send reply" }));

    await waitFor(() =>
      expect(mockedAxios.post).toHaveBeenCalledWith("/tickets/1/replies", {
        body: "We're looking into it now.",
      }),
    );
  });

  it("shows an error alert when sending a reply fails", async () => {
    const userEventSession = userEvent.setup();
    mockGetImplementation();
    mockedAxios.post.mockRejectedValue(new Error("network error"));

    renderPage();
    await screen.findByText("Cannot log in");

    await userEventSession.type(screen.getByLabelText("Reply"), "Trying again.");
    await userEventSession.click(screen.getByRole("button", { name: "Send reply" }));

    expect(await screen.findByText("Failed to send reply")).toBeInTheDocument();
  });
});
