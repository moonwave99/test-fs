import path, { sep } from "node:path";
import { ensureDir, outputFile, remove } from "fs-extra";

const TMP_DIR = "__test-fs__";

export type Tree = Record<string, object | string>;

function isEmpty(tree: Tree) {
  return Object.keys(tree).length === 0;
}

function sanitize(path: string) {
  return path.replaceAll(`..${sep}`, "");
}

async function createTree(tree: Tree, rootDir: string): Promise<unknown> {
  await ensureDir(rootDir);
  return Promise.all(
    Object.entries(tree).map(async ([key, value]): Promise<unknown> => {
      const targetPath = path.join(rootDir, sanitize(key));
      if (typeof value === "string") {
        return outputFile(targetPath, value, "utf8");
      }
      return createTree(value as Tree, targetPath);
    })
  );
}

export async function testFs(tree: Tree = {}, context: string = "") {
  const directory = path.join(import.meta.dirname, TMP_DIR, sanitize(context));
  if (isEmpty(tree)) {
    return directory;
  }
  await ensureDir(directory);
  await createTree(tree, directory);
  return directory;
}

export async function testFsCleanup(context = "") {
  return remove(sanitize(path.join(import.meta.dirname, TMP_DIR, context)));
}
