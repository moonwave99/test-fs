import { describe, it, expect, beforeEach, afterAll } from "vitest";
import path from "node:path";
import { stat } from "node:fs/promises";
import { testFs, testFsCleanup } from ".";

beforeEach(async () => {
  await testFsCleanup();
});

afterAll(async () => {
  await testFsCleanup();
});

async function exists(file: string, type: "directory" | "file" = "directory") {
  try {
    const stats = await stat(file);
    if (type === "directory") {
      return stats.isDirectory();
    }
    return stats.isFile();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

const tree = {
  [path.join("some", "inline", "file.txt")]: "some content",
  emptyFolder: {},
  folder: {
    nested: {
      "file.txt": "some content",
    },
    "file.txt": "some content",
  },
};

const treeMap = [
  ["folder", "directory"],
  ["emptyFolder", "directory"],
  [path.join("folder", "file.txt"), "file"],
  [path.join("folder", "nested"), "directory"],
  [path.join("folder", "nested", "file.txt"), "file"],
  [path.join("some", "inline", "file.txt"), "file"],
];

describe("testFs", () => {
  it("does nothing if the tree is empty", async () => {
    {
      const rootDir = await testFs({});
      expect(await exists(rootDir)).toBe(false);
    }
    const rootDir = await testFs();
    expect(await exists(rootDir)).toBe(false);
  });

  it("generates the passed tree in the temp folder", async () => {
    const rootDir = await testFs(tree);
    await Promise.all(
      treeMap.map(async ([item, type]) =>
        expect(
          await exists(path.join(rootDir, item), type as "file" | "directory")
        ).toBe(true)
      )
    );
  });

  it("generates the passed tree in a context subfolder", async (context) => {
    const rootDir = await testFs(tree, context.task.id);
    await Promise.all(
      treeMap.map(async ([item, type]) =>
        expect(
          await exists(path.join(rootDir, item), type as "file" | "directory")
        ).toBe(true)
      )
    );
  });

  it("sanitizes the input", async () => {
    const rootDir = await testFs(
      {
        [path.join("..", "up")]: {
          [path.join("..", "file.txt")]: "some content",
        },
      },
      path.join("..", "malicious")
    );
    expect(rootDir.endsWith(path.join("src", "__test-fs__", "malicious"))).toBe(
      true
    );
    expect(
      await exists(path.resolve(import.meta.dirname, "..", "malicious"))
    ).toBe(false);
    expect(await exists(path.join(rootDir, "up"), "directory")).toBe(true);
    expect(await exists(path.join(rootDir, "up", "file.txt"), "file")).toBe(
      true
    );
  });
});

describe("testFsCleanup", () => {
  it("cleans the tmp folder", async () => {
    const rootDir = await testFs(tree);
    await testFsCleanup();
    expect(await exists(rootDir)).toBe(false);
  });

  it("cleans just the context tmp folder if passed", async () => {
    const firstRoot = await testFs(tree, "1");
    const secondRoot = await testFs(tree, "2");
    await testFsCleanup("1");
    expect(await exists(firstRoot)).toBe(false);
    expect(await exists(secondRoot)).toBe(true);
  });
});
