import { expect, test } from 'bun:test';
import { PostRepository } from '@demo/repositories';
import { appRouter } from './appRouter';

const caller = appRouter.createCaller({});

test('CRUD persists in memory and preserves generated fields', async () => {
  const before = await caller.userList();
  const created = await caller.userCreate({ name: ' Alice ', email: 'alice@example.com' });
  expect(created.name).toBe('Alice');
  expect(created.createdAt).toBeInstanceOf(Date);
  expect(await caller.userFind({ id: created.id })).toEqual(created);
  expect(await caller.userList()).toHaveLength(before.length + 1);
  const updated = await caller.userUpdate({ id: created.id, data: { name: 'Bob' } });
  expect(updated).toEqual({ ...created, name: 'Bob' });
  const updatedEmail = await caller.userUpdate({ id: created.id, data: { email: 'bob@example.com' } });
  expect(updatedEmail).toEqual({ ...updated, email: 'bob@example.com' });
  expect(await caller.userFind({ id: created.id })).toEqual(updatedEmail);
  expect(await caller.userDelete({ id: created.id })).toEqual(updatedEmail);
  await expect(caller.userFind({ id: created.id })).rejects.toMatchObject({ code: 'NOT_FOUND' });
  expect(await caller.userList()).toEqual(before);
});

test('missing users return NOT_FOUND', async () => {
  await expect(caller.userFind({ id: 'missing' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
  await expect(caller.userUpdate({ id: 'missing', data: { name: 'Bob' } }))
    .rejects.toMatchObject({ code: 'NOT_FOUND' });
  await expect(caller.userDelete({ id: 'missing' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
});

test('validation rejects invalid inputs without changing data', async () => {
  const before = await caller.userList();
  await expect(caller.userCreate({ name: ' ', email: 'alice@example.com' }))
    .rejects.toMatchObject({ code: 'BAD_REQUEST' });
  await expect(caller.userCreate({ name: 'Alice', email: 'invalid' }))
    .rejects.toMatchObject({ code: 'BAD_REQUEST' });
  await expect(caller.userFind({ id: ' ' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  await expect(caller.userUpdate({ id: 'missing', data: {} }))
    .rejects.toMatchObject({ code: 'BAD_REQUEST' });
  expect(await caller.userList()).toEqual(before);
});

test('deletion cascades to posts and preserves other records', async () => {
  const posts = new PostRepository();
  const before = posts.findAll();
  const post = before[0];
  if (!post) throw new Error('Missing fixture');
  const usersBefore = await caller.userList();
  await caller.userDelete({ id: post.userId });
  expect(posts.findAllByUserId(post.userId)).toEqual([]);
  expect(posts.findAll()).toEqual(before.filter((item) => item.userId !== post.userId));
  expect(await caller.userList()).toEqual(usersBefore.filter((user) => user.id !== post.userId));
});
