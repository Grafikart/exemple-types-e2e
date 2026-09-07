import { describe, expect, test } from 'bun:test';
import { PostRepository, UserRepository } from '../src';

const users = new UserRepository();
const posts = new PostRepository();

describe('shared repositories', () => {
  test('provides the reference dataset with valid relationships and dates', () => {
    const allUsers = users.findAll();
    const allPosts = posts.findAll();
    expect(allUsers).toHaveLength(10);
    expect(allPosts).toHaveLength(25);
    expect(new Set(allUsers.map((user) => user.id)).size).toBe(10);
    expect(new Set(allPosts.map((post) => post.id)).size).toBe(25);
    expect(allUsers.map((user) => posts.findAllByUserId(user.id).length))
      .toEqual([0, 1, 3, 3, 3, 3, 3, 3, 3, 3]);

    for (const user of allUsers) {
      expect(users.find(user.id)).toEqual(user);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(Date.parse('2024-01-01T00:00:00.000Z'));
      expect(posts.findAllByUserId(user.id)).toEqual(allPosts.filter((post) => post.userId === user.id));
    }
    for (const post of allPosts) {
      const author = users.find(post.userId);
      if (!author) throw new Error(`Missing author for ${post.id}`);
      expect(posts.find(post.id)).toEqual(post);
      expect(post.createdAt).toBeInstanceOf(Date);
      expect(post.createdAt.getTime()).toBeGreaterThanOrEqual(author.createdAt.getTime());
      expect(post.createdAt.getTime()).toBeLessThanOrEqual(Date.parse('2024-12-31T23:59:59.999Z'));
    }
  });

  test('returns missing results without inventing records', () => {
    expect(users.find('unknown')).toBeUndefined();
    expect(posts.find('unknown')).toBeUndefined();
    expect(posts.findAllByUserId('unknown')).toEqual([]);
  });

  test('keeps data stable across calls and repository instances', () => {
    expect(new UserRepository().findAll()).toEqual(users.findAll());
    expect(new PostRepository().findAll()).toEqual(posts.findAll());
  });

  test('protects stored records and dates from caller mutations', () => {
    const user = users.findAll()[0];
    const post = posts.findAll()[0];
    if (!user || !post) throw new Error('Missing fixtures');
    const originalUser = users.find(user.id);
    const originalPost = posts.find(post.id);
    user.name = 'Changed';
    user.createdAt.setFullYear(2000);
    post.title = 'Changed';
    post.createdAt.setFullYear(2000);
    expect(users.find(user.id)).toEqual(originalUser);
    expect(posts.find(post.id)).toEqual(originalPost);
  });
});
