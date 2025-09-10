# test-fs

A tiny filesystem helper test library that creates actual files.

- it does not mock / interfere with existing modules;
- it just creates plain text files for tree structure test purposes.

## Docs

### `testFs(tree: Tree = {}, context: string = ")`

Creates the passed tree in the tmp folder. If a `context` value is passed, it creates it inside the `{context}` subfolder.

**Note:** object values are folders, strings are files. Object keys are names.

```js
import { testFs } from "test-fs";

const rootDir = await testFs({
  folder: {
    empty: {}, // empty folder
    nested: {
      "file.txt": "",
    },
    "file.txt": "",
  },
});
```

It creates:

```txt
{rootDir}
  folder
    empty
    nested
      file.txt
    file.txt

```

### `testFsCleanup(context: string = ")`

Cleans the passed directory. If `context` is passed, it cleans the `{context}` subfolder.

Be sure to know what you are passing!

```js
import { testFs, testFsCleanup } from "test-fs";

const rootDir = await testFs({
  folder: {
    empty: {}, // empty folder
    nested: {
      "file.txt": "some content",
    },
    "file.txt": "some content",
  },
  'your-context-id'
});

// some operations

await testFsCleanup('your-context-id');
```

You want to use them in your test suites like:

```js
beforeEach(async () => {
  await testFsCleanup();
});

afterAll(async () => {
  await testFsCleanup();
});
```

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
    const uploadedPath = path.join(avatarFolder, "my-picture.jpg");
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
    const uploadedPath = path.join(avatarFolder, "not-found.jpg");
    expect(await pathExists(uploadedPath)).toBe(false);
  });
});
```

The tests can safely run in parallel

## License

ISC License

Copyright 2025 Diego Caponera

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
