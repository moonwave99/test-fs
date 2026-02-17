import path from 'node:path';
import fs from 'fs-extra';
import { nanoid } from 'nanoid';

const users = {
  1: { name: 'Huey' },
  2: { name: 'Dewey' },
  3: { name: 'Louie' },
};

export async function saveNote({ userId, content, dataFolder }) {
  const noteId = nanoid();

  const user = users[userId];
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  await fs.outputFile(
    path.join(dataFolder, `${userId}`, `note-${noteId}.txt`),
    content
  );

  return noteId;
}

export async function readNote({ userId, noteId, dataFolder }) {
  return await fs.readFile(
    path.join(dataFolder, `${userId}`, `note-${noteId}.txt`),
    'utf8'
  );
}
