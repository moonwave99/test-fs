# test-fs

[![Build Status](https://github.com/moonwave99/test-fs/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/moonwave99/test-fs/actions?workflow=Test)

A tiny filesystem helper test library that creates actual files.

- it does not mock / interfere with existing modules;
- it just creates plain text files for tree structure test purposes.

---

## Install

```txt
npm install @moonwave99/test-fs -D
```

---

## Example

[See on Stackblitz](https://stackblitz.com/edit/stackblitz-starters-e81mhry3?file=README.md)

---

## Docs

### `testFs(tree: Tree = {}, context: string = ")`

Creates the passed tree in the tmp folder. If a `context` value is passed, it creates it inside the `{context}` subfolder.

**Note:** object values are folders, strings are files. Object keys are names.

```js
import { testFs } from "test-fs";

const rootDir = await testFs({
  emptyFolder: {},
  folder: {
    nested: {
      "file.txt": "some content",
    },
    "empty-file.txt": "",
  },
});
```

It creates:

```txt
{rootDir}
  emptyFolder
  folder
    nested
      file.txt
    empty-file.txt
```

You can also pass complete paths as values:

```js
import { testFs } from "test-fs";

const rootDir = await testFs({
  "path/to/file-1.txt": "",
  "path/to/file-2.txt": "",
});
```

It creates:

```txt
{rootDir}
  path
    to
      file-1.txt
      file-2.txt
```

### `testFsCleanup(context: string = ")`

Cleans the passed directory. If `context` is passed, it cleans the `{context}` subfolder.

Be sure to know what you are passing!

```js
import { testFs, testFsCleanup } from "test-fs";

const rootDir = await testFs(
  {
    emptyFolder: {},
    folder: {
      nested: {
        "file.txt": "some content",
      },
      "empty-file.txt": "",
    },
  },
  "your-context-id"
);

// some operations

await testFsCleanup("your-context-id");
```

Add the following to your main test configuration (e.g. `vitest.setup.ts` or similar):

```js
// get a fresh tmp context every time
beforeEach(async (context) => {
  await testFsCleanup(context.task.id);
});

// clean the whole tmp folder after done
afterAll(async () => {
  await testFsCleanup();
});
```

---

## Rationale

I faced some issues with the in-memory/mock libraries, so I decided to sacrifice a little performance in order to work with **actual files and folders**.

Since test runners like Jest expose an unique `context.task.id` value, it's easy to create independent temporary folders where to check for the expected output, for instance:

```js
// use whichever test method you like
import { pathExists } from "fs-extra";

describe("uploadAvatar", () => {
  it("uploads the passed avatar", async (context) => {
    const avatarFolder = await testFs(
      {
        avatars: {},
      },
      context.task.id
    );

    await uploadAvatar("my-picture.jpg");
    const uploadedPath = path.join(avatarFolder, "avatars", "my-picture.jpg");
    expect(await pathExists(uploadedPath)).toBe(true);
  });

  it("does nothing if no avatar is found", async (context) => {
    const avatarFolder = await testFs(
      {
        avatars: {},
      },
      context.task.id
    );

    await uploadAvatar("not-found.jpg");
    const uploadedPath = path.join(avatarFolder, "avatars", "not-found.jpg");
    expect(await pathExists(uploadedPath)).toBe(false);
  });
});
```

The tests can thus safely run in parallel.

---

## License

ISC License

Copyright 2025 Diego Caponera

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
