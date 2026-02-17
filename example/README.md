# test-fs example

This example shows how to use the [test-fs](https://github.com/moonwave99/test-fs) library.

Run `npm test` in the terminal to see the output.

## Explanation

In `index.js` we have a pair of write/read functions:

```js

export async function saveNote({ userId, content, dataFolder }) {
  // saves a note for the given userId
}

export async function readNote({ userId, noteId, dataFolder }) {
  // reads a note with the given noteId for the given userId
}
```

We can independently test their behaviour like:

```js
describe('saveNote function', () => {
  it('saves a note for the corresponding user', async (context) => {
    const dataFolder = await testFs({}, context.id);

    const noteId = await saveNote({
      userId: 1,
      content: 'Some text',
      dataFolder,
    });

    const outputPath = path.join(dataFolder, '1', `note-${noteId}.txt`);

    expect(await fs.exists(outputPath)).toBe(true);
    expect(await fs.readFile(outputPath, 'utf8')).toBe('Some text');
  });
});
```

And:

```js
describe('readNote function', () => {
  it('reads the contents for the corresponding note', async (context) => {
    const dataFolder = await testFs(
      {
        1: {
          'note-123.txt': 'Some content',
        },
      },
      context.id
    );

    const contents = await readNote({
      userId: 1,
      noteId: 123,
      dataFolder,
    });

    expect(contents).toBe('Some content');
  });
});
```

For a grand finale, an integration tests that uses both `saveNote` and `readNote`:

```js
describe('integration test', () => {
  it('first creates a note, then reads it right away', async (context) => {
    const dataFolder = await testFs({}, context.id);

    const noteId = await saveNote({
      userId: 1,
      content: 'Some text',
      dataFolder,
    });

    const contents = await readNote({
      userId: 1,
      noteId,
      dataFolder,
    });

    expect(contents).toBe('Some text');
  });
});
```
