import { beforeEach, afterAll, describe, it, expect } from "vitest";
import path from "node:path";
import fs from "fs-extra";
import { testFs, testFsCleanup } from "../src";

import { saveNote, readNote } from "./";

beforeEach((context) => testFsCleanup(context.id));
afterAll(() => testFsCleanup());

describe("saveNote function", () => {
  it("saves a note for the corresponding user", async (context) => {
    // creates an empty folder
    const dataFolder = await testFs({}, context.id);

    const noteId = await saveNote({
      userId: 1,
      content: "Some text",
      dataFolder,
    });

    const outputPath = path.join(dataFolder, "1", `note-${noteId}.txt`);

    expect(await fs.exists(outputPath)).toBe(true);
    expect(await fs.readFile(outputPath, "utf8")).toBe("Some text");
  });

  it("throws an error if the user is not found", async (context) => {
    const dataFolder = await testFs({}, context.id);

    await expect(() =>
      saveNote({
        userId: 69,
        content: "Some text",
        dataFolder,
      }),
    ).rejects.toThrowError("User 69 not found");
  });
});

describe("readNote function", () => {
  it("reads the contents for the corresponding note", async (context) => {
    // it populates the folder with some content, without needing call saveNote ourselves
    const dataFolder = await testFs(
      {
        1: {
          "note-123.txt": "Some content",
        },
      },
      context.id,
    );

    const contents = await readNote({
      userId: 1,
      noteId: 123,
      dataFolder,
    });

    expect(contents).toBe("Some content");
  });
});

describe("integration test", () => {
  it("first creates a note, then reads it right away", async (context) => {
    const dataFolder = await testFs({}, context.id);

    const noteId = await saveNote({
      userId: 1,
      content: "Some text",
      dataFolder,
    });

    const contents = await readNote({
      userId: 1,
      noteId,
      dataFolder,
    });

    expect(contents).toBe("Some text");
  });
});
