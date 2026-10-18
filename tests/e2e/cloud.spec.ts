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
test("user connects Salsa and Bachata folders → streams → edits → refresh preserves both sources (mock provider)", async ({
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
  await context.route(
    "https://api.dropboxapi.com/2/files/get_metadata",
    (r) => {
      const bachata = r.request().postDataJSON().path === "/bachata";
      return r.fulfill({
        json: {
          ".tag": "folder",
          id: bachata ? "id:bachata-folder" : "id:salsa-folder",
          name: bachata ? "My Bachata" : "My Salsa",
          path_lower: bachata ? "/bachata" : "/salsa",
        },
      });
    },
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
                  {
                    ".tag": "folder",
                    id: "id:bachata-folder",
                    name: "My Bachata",
                    path_lower: "/bachata",
                  },
                ]
              : [
                  {
                    ".tag": "file",
                    id:
                      data.path === "/bachata"
                        ? "id:bachata-video"
                        : "id:video",
                    name:
                      data.path === "/bachata"
                        ? "Bachata basics.mp4"
                        : "Cloud turn.mp4",
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
  // Add the second folder to the same account without replacing Salsa.
  await page
    .getByRole("textbox", { name: "Dropbox folder path", exact: true })
    .fill("/bachata");
  await page
    .getByRole("textbox", { name: "Folder name in BailaCue", exact: true })
    .fill("Bachata class");
  await page.getByRole("button", { name: "Bachata", exact: true }).click();
  await page
    .getByRole("button", { name: "Remove label Musicality", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Choose labels", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search labels", exact: true })
    .fill("Sensual");
  await page
    .getByRole("button", { name: "Create “Sensual”", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Done choosing labels", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Connect folder & find videos", exact: true })
    .click();
  await expect(
    page.getByText("Bachata class", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Tuesday class", { exact: true }).first(),
  ).toBeVisible();
  await page.goto("/library");
  // Credentials are intentionally memory-only on web; SPA navigation retains this test connection.
  // Reloading the browser requires reconnecting. Return through in-app navigation below.
  await expect(
    page.getByRole("button", { name: "Play Cloud turn", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Bachata basics", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Bachata class", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Play Bachata basics", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Cloud turn", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "All storage", exact: true }).click();
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
    .first()
    .click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play My cloud turn", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play Bachata basics", exact: true }),
  ).toBeVisible();
  // Imports explicitly choose their folder, independent of style or labels.
  await page.getByRole("tab", { name: "Add video", exact: true }).click();
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Choose a video", exact: true })
    .click();
  await (await chooser).setFiles(fixture);
  await page
    .getByRole("textbox", { name: "Video title", exact: true })
    .fill("New Bachata upload");
  await page
    .getByRole("button", { name: "Online storage", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Tuesday class · Dropbox", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Bachata class · Dropbox", exact: true })
    .click();
  await page
    .getByRole("switch", {
      name: "Keep a phone copy after upload",
      exact: true,
    })
    .uncheck();
  await page
    .getByRole("button", { name: "Upload & add to library", exact: true })
    .click();
  await page.waitForURL(/\/transfer\//);
  await expect(
    page.getByText("Selected: Bachata class", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("switch", {
      name: "Keep a phone copy after upload",
      exact: true,
    }),
  ).not.toBeChecked();
  // The web preview cannot transfer native files; its failed upload must retain the import.
  await expect(
    page.getByText("Upload phone videos in the Android or iOS app.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("tab", { name: "Library", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Play New Bachata upload", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
