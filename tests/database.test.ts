import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const db = new PGlite();
const alice = "10000000-0000-0000-0000-000000000001",
  bob = "10000000-0000-0000-0000-000000000002";
const connection = "20000000-0000-0000-0000-000000000001",
  video = "30000000-0000-0000-0000-000000000001";
beforeAll(async () => {
  await db.exec(
    `create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; grant usage on schema public,auth to authenticated; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; insert into auth.users values('${alice}'),('${bob}');`,
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/20261018032846_bailacue_isolated_metadata.sql",
      "utf8",
    ),
  );
  await db.exec(
    `insert into public.bailacue_connections(id,user_id,provider,account_ref,display_name) values('${connection}','${alice}','google-drive','account','Alice'); insert into public.bailacue_videos(id,user_id,connection_id,provider_file_id,original_name,mime_type,duration_seconds) values('${video}','${alice}','${connection}','file','Dance','video/mp4',30); set role authenticated; set request.jwt.claim.sub='${alice}';`,
  );
}, 30000);
beforeEach(async () => {
  await db.exec(
    `reset role; set role authenticated; set request.jwt.claim.sub='${alice}';`,
  );
});
afterAll(async () => {
  await db.close();
});
describe("additive PostgreSQL schema with actual RLS", () => {
  it("lets an owner create and read notes", async () => {
    await db.exec(
      `insert into public.bailacue_notes(user_id,video_id,text,at_seconds) values('${alice}','${video}','Small steps',10);`,
    );
    expect(
      (await db.query("select * from public.bailacue_notes")).rows,
    ).toHaveLength(1);
  });
  it("denies cross-user reads, writes, owner reassignment and foreign-key attachments", async () => {
    await db.exec(`set request.jwt.claim.sub='${bob}';`);
    expect(
      (await db.query("select * from public.bailacue_notes")).rows,
    ).toEqual([]);
    await expect(
      db.exec(
        `insert into public.bailacue_notes(user_id,video_id,text) values('${alice}','${video}','Intrusion');`,
      ),
    ).rejects.toThrow(/unavailable|row-level security/);
    await expect(
      db.exec(
        `insert into public.bailacue_notes(user_id,video_id,text) values('${bob}','${video}','Cross-owner FK');`,
      ),
    ).rejects.toThrow();
    await db.exec(`set request.jwt.claim.sub='${alice}';`);
    await expect(
      db.exec(
        `update public.bailacue_connections set user_id='${bob}' where id='${connection}';`,
      ),
    ).rejects.toThrow(/row-level security/);
  });
  it("denies invalid segment bounds on the server", async () => {
    await expect(
      db.exec(
        `insert into public.bailacue_segments(user_id,video_id,name,start_seconds,end_seconds) values('${alice}','${video}','Too long',0,31);`,
      ),
    ).rejects.toThrow(/exceeds/);
    await expect(
      db.exec(
        `insert into public.bailacue_segments(user_id,video_id,name,start_seconds,end_seconds) values('${alice}','${video}','Backwards',20,10);`,
      ),
    ).rejects.toThrow();
  });
  it("enforces stable provider IDs, and enables RLS on every BailaCue table", async () => {
    await expect(
      db.exec(
        `insert into public.bailacue_videos(user_id,connection_id,provider_file_id,original_name,mime_type) values('${alice}','${connection}','file','Duplicate','video/mp4');`,
      ),
    ).rejects.toThrow(/unique/);
    const result = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class where relname like 'bailacue_%' and relkind='r'",
    );
    expect(result.rows).toHaveLength(23);
    expect(result.rows.every((r) => r.relrowsecurity)).toBe(true);
  });
  it("rejects unauthenticated reads", async () => {
    await db.exec("reset role; set role anon;");
    await expect(
      db.exec("select * from public.bailacue_videos;"),
    ).rejects.toThrow(/permission denied/);
    await db.exec(
      `reset role; set role authenticated; set request.jwt.claim.sub='${alice}';`,
    );
  });
});
