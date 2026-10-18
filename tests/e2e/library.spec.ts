import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
const fixture = "/tmp/bailacue-test-video.mp4";
test.beforeAll(() => {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      "testsrc2=size=320x240:rate=24",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440",
      "-t",
      "6",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      fixture,
    ],
    { stdio: "ignore" },
  );
  mkdirSync("artifacts/screenshots", { recursive: true });
});
test("import → label → loop → note → daily pick → persisted local video", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("Find your rhythm.")).toBeVisible();
  await page.screenshot({
    path: "artifacts/screenshots/today.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Add your first video" }).click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Choose a video" }).click();
  await (await chooser).setFiles(fixture);
  await page
    .getByRole("textbox", { name: "Video title", exact: true })
    .fill("Bachata turn practice");
  await page
    .getByRole("textbox", { name: "Labels, separated by commas", exact: true })
    .fill("Footwork, Beginner");
  await page.getByRole("button", { name: "Add to my library" }).click();
  await expect(
    page
      .getByText("Bachata turn practice", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Start (m:ss or seconds)" })
    .fill("1");
  await page.getByRole("textbox", { name: "End (m:ss or seconds)" }).fill("4");
  await page.getByRole("textbox", { name: "Section name" }).fill("The turn");
  await page.getByRole("button", { name: "Save practice section" }).click();
  await page.getByRole("button", { name: "Loop section", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Loop on", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect
    .poll(() =>
      page
        .locator("video")
        .first()
        .evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeGreaterThan(3.3);
  await expect
    .poll(() =>
      page
        .locator("video")
        .first()
        .evaluate((v: HTMLVideoElement) => v.currentTime),
    )
    .toBeLessThan(2);
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Practice note" })
    .fill("Keep the steps small");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(
    page.getByText("Keep the steps small", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Bookmark name" })
    .fill("Turn starts");
  await page.getByRole("button", { name: /^Bookmark \d/ }).click();
  await page
    .getByRole("button", { name: "Library", exact: true })
    .scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "artifacts/screenshots/player.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Export new trimmed video", exact: true })
    .click();
  await expect(
    page.getByText(
      "Trimmed-file export is available in the Android and iOS app.",
      { exact: false },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Library", exact: true }).click();
  await page.getByRole("tab", { name: "Today" }).click();
  await expect(
    page.getByRole("button", { name: "Play Bachata turn practice" }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/screenshots/today-with-video.png",
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Play Bachata turn practice" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Play Bachata turn practice" })
    .click();
  await expect(page.getByText("The turn", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Keep the steps small", { exact: true }),
  ).toBeVisible();
  expect(
    await page
      .locator("video")
      .first()
      .evaluate((v: HTMLVideoElement) => v.readyState),
  ).toBeGreaterThan(0);
  expect(errors).toEqual([]);
  await page
    .getByRole("button", { name: "Remove this local video", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep video", exact: true }).click();
  await expect(page.getByText("The turn", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Remove this local video", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Remove local copy", exact: true })
    .click();
  await expect(page.getByText("A home for your dance videos")).toBeVisible();
  expect(existsSync(fixture)).toBe(true);
});
test("dark theme and collection creation", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark", exact: true }).click();
  await page.screenshot({
    path: "artifacts/screenshots/settings-dark.png",
    fullPage: true,
  });
  await page.getByRole("tab", { name: "Library" }).click();
  await page
    .getByRole("textbox", { name: "Search your moves" })
    .fill("missing");
  await expect(page.getByText("A home for your dance videos")).toBeVisible();
  await page
    .getByRole("textbox", { name: "New collection" })
    .fill("Sunday basics");
  await page.getByRole("button", { name: "Create collection" }).click();
  await expect(page.getByText("Sunday basics")).toBeVisible();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await expect(page.getByText("A fresh collection")).toBeVisible();
});
