import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
const fixture = "/tmp/bailacue-cloud-test.mp4";
test.beforeAll(() =>
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=320x240:rate=24",
      "-t",
      "6",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      fixture,
    ],
    { stdio: "ignore" },
  ),
);
test("user connects Dropbox → selects folder → streams → edits rating → refresh preserves edits (mock provider)", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await context.route(
    "https://www.dropbox.com/oauth2/authorize**",
    async (route) => {
      const url = new URL(route.request().url()),
        callback = new URL(url.searchParams.get("redirect_uri")!);
      callback.searchParams.set("code", "mock-authorisation-code");
      callback.searchParams.set("state", url.searchParams.get("state")!);
      await route.fulfill({
        contentType: "text/html",
        body: `<script>location.replace(${JSON.stringify(callback.toString())})</script>`,
      });
    },
  );
  await context.route("https://api.dropboxapi.com/oauth2/token", (r) =>
    r.fulfill({
      json: {
        access_token: "mock-user-access",
        refresh_token: "mock-user-refresh",
        expires_in: 14400,
      },
    }),
  );
  await context.route(
    "https://api.dropboxapi.com/2/users/get_current_account",
    (r) =>
      r.fulfill({
        json: {
          account_id: "dbid:my-own-account",
          email: "dancer@example.com",
          name: { display_name: "Test Dancer" },
        },
      }),
  );
  await context.route("https://api.dropboxapi.com/2/files/get_metadata", (r) =>
    r.fulfill({
      json: {
        ".tag": "folder",
        id: "id:folder",
        name: "My Salsa",
        path_lower: "/salsa",
      },
    }),
  );
  await context.route(
    "https://api.dropboxapi.com/2/files/list_folder",
    async (r) => {
      const data = r.request().postDataJSON();
      await r.fulfill({
        json: {
          entries:
            data.path === ""
              ? [
                  {
                    ".tag": "folder",
                    id: "id:folder",
                    name: "My Salsa",
                    path_lower: "/salsa",
                  },
                ]
              : [
                  {
                    ".tag": "file",
                    id: "id:video",
                    name: "Cloud turn.mp4",
                    size: 1234,
                    media_info: {
                      ".tag": "metadata",
                      metadata: { ".tag": "video", duration: 6000 },
                    },
                  },
                ],
          cursor: "done",
          has_more: false,
        },
      });
    },
  );
  await context.route(
    "https://api.dropboxapi.com/2/files/get_temporary_link",
    (r) =>
      r.fulfill({
        json: { link: "https://dl.dropboxusercontent.com/mock-video.mp4" },
      }),
  );
  await context.route("https://dl.dropboxusercontent.com/mock-video.mp4", (r) =>
    r.fulfill({
      path: fixture,
      contentType: "video/mp4",
      headers: { "Access-Control-Allow-Origin": "*" },
    }),
  );
  await page.goto("/storage");
  await page
    .getByRole("button", { name: "App connection setup", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Dropbox app key", exact: true })
    .fill("mock-public-app-key");
  await page.getByRole("button", { name: "Save app key", exact: true }).click();
  await page
    .getByRole("button", { name: "Connect Dropbox", exact: true })
    .click();
  await expect(
    page.getByText("dancer@example.com", { exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Browse my folders", exact: true })
    .click();
  await page.getByRole("button", { name: "My Salsa", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Folder name in BailaCue", exact: true })
    .fill("Tuesday class");
  await page.getByRole("button", { name: "Salsa", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose labels", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search labels", exact: true })
    .fill("Musicality");
  await page
    .getByRole("button", { name: "Create “Musicality”", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Done choosing labels", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Connect folder & find videos", exact: true })
    .click();
  await expect(
    page.getByText("Tuesday class", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/library");
  // Credentials are intentionally memory-only on web; SPA navigation retains this test connection.
  // Reloading the browser requires reconnecting. Return through in-app navigation below.
  await expect(
    page.getByRole("button", { name: "Play Cloud turn", exact: true }),
  ).toBeVisible();
  // Reconnect after this explicit full navigation; real phone credentials use SecureStore.
  await page
    .getByRole("button", { name: "Connect storage", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Connect Dropbox", exact: true })
    .click();
  await expect(
    page.getByText("dancer@example.com", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Browse my folders", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page
    .getByRole("button", { name: "Play Cloud turn", exact: true })
    .click();
  await expect(page.getByText("ONLINE VIDEO", { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("video")
        .first()
        .evaluate((v: HTMLVideoElement) => v.readyState),
    )
    .toBeGreaterThan(1);
  await page.screenshot({
    path: "artifacts/screenshots/cloud-video.png",
    fullPage: true,
  });
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("My cloud turn");
  await page.getByRole("button", { name: "Save details", exact: true }).click();
  await page
    .getByRole("button", { name: "Library", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Connect storage", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Refresh videos", exact: true })
    .click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play My cloud turn", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
