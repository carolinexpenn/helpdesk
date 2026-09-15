import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { Role } from "core/constants/role.ts";
import { renderWithQuery } from "@/test/render";
import UsersPage from "./UsersPage";

vi.mock("axios");

const mockedAxios = vi.mocked(axios, { deep: true });

const users = [
  {
    id: "1",
    name: "Freddie",
    email: "freddie@penn.com",
    role: Role.agent,
    createdAt: "2026-09-10T00:00:00.000Z",
  },
  {
    id: "2",
    name: "Admin",
    email: "admin@penn.com",
    role: Role.admin,
    createdAt: "2026-08-28T00:00:00.000Z",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("UsersPage", () => {
  it("shows loading skeletons while the users query is pending", () => {
    mockedAxios.get.mockReturnValue(new Promise(() => {}));

    renderWithQuery(<UsersPage />);

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.queryByText("Freddie")).not.toBeInTheDocument();
  });

  it("renders the fetched users once loaded", async () => {
    mockedAxios.get.mockResolvedValue({ data: users });

    renderWithQuery(<UsersPage />);

    expect(await screen.findByText("Freddie")).toBeInTheDocument();
    expect(screen.getByText("freddie@penn.com")).toBeInTheDocument();
    expect(screen.getByText("admin@penn.com")).toBeInTheDocument();
    expect(screen.getByText("28/08/2026")).toBeInTheDocument();
  });

  it("shows an error alert when the users query fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("network error"));

    renderWithQuery(<UsersPage />);

    expect(await screen.findByText("Failed to load users")).toBeInTheDocument();
  });

  it("sorts by name ascending by default, and toggles direction on click", async () => {
    const userEventSession = userEvent.setup();
    mockedAxios.get.mockResolvedValue({ data: users });

    renderWithQuery(<UsersPage />);

    await screen.findByText("Freddie");

    const rowsAsc = screen.getAllByRole("row").slice(1);
    expect(within(rowsAsc[0]).getByText("Admin")).toBeInTheDocument();
    expect(within(rowsAsc[1]).getByText("Freddie")).toBeInTheDocument();

    await userEventSession.click(screen.getByText("Name"));

    const rowsDesc = screen.getAllByRole("row").slice(1);
    expect(within(rowsDesc[0]).getByText("Freddie")).toBeInTheDocument();
    expect(within(rowsDesc[1]).getByText("Admin")).toBeInTheDocument();
  });

  it("opens the create dialog when 'Add user' is clicked", async () => {
    const userEventSession = userEvent.setup();
    mockedAxios.get.mockResolvedValue({ data: users });

    renderWithQuery(<UsersPage />);
    await screen.findByText("Freddie");

    await userEventSession.click(screen.getByRole("button", { name: "Add user" }));

    expect(await screen.findByRole("heading", { name: "Add user" })).toBeInTheDocument();
  });

  it("opens the edit dialog when 'Edit' is clicked for a user", async () => {
    const userEventSession = userEvent.setup();
    mockedAxios.get.mockResolvedValue({ data: users });

    renderWithQuery(<UsersPage />);
    await screen.findByText("Freddie");

    const freddieRow = screen.getByText("Freddie").closest("tr")!;
    await userEventSession.click(within(freddieRow).getByRole("button", { name: "Edit" }));

    expect(await screen.findByRole("heading", { name: "Edit user" })).toBeInTheDocument();
  });

  it("deletes a user after confirmation", async () => {
    const userEventSession = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedAxios.get.mockResolvedValue({ data: users });
    mockedAxios.delete.mockResolvedValue({});

    renderWithQuery(<UsersPage />);
    await screen.findByText("Freddie");

    const freddieRow = screen.getByText("Freddie").closest("tr")!;
    await userEventSession.click(within(freddieRow).getByRole("button", { name: "Delete" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "Delete Freddie? They will lose access to the app.",
    );
    await waitFor(() => expect(mockedAxios.delete).toHaveBeenCalledWith("/users/1"));
  });

  it("does not delete a user when the confirmation is cancelled", async () => {
    const userEventSession = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);
    mockedAxios.get.mockResolvedValue({ data: users });

    renderWithQuery(<UsersPage />);
    await screen.findByText("Freddie");

    const freddieRow = screen.getByText("Freddie").closest("tr")!;
    await userEventSession.click(within(freddieRow).getByRole("button", { name: "Delete" }));

    expect(mockedAxios.delete).not.toHaveBeenCalled();
  });

  it("shows an error alert when deleting a user fails", async () => {
    const userEventSession = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockedAxios.get.mockResolvedValue({ data: users });
    mockedAxios.delete.mockRejectedValue(new Error("network error"));

    renderWithQuery(<UsersPage />);
    await screen.findByText("Freddie");

    const freddieRow = screen.getByText("Freddie").closest("tr")!;
    await userEventSession.click(within(freddieRow).getByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Failed to delete user")).toBeInTheDocument();
  });
});
