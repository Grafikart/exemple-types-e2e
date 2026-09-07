import { posts } from './data';
import type { Post } from './models';

export class PostRepository {
  findAll(): Post[] {
    return structuredClone(posts);
  }

  find(id: string): Post | undefined {
    return structuredClone(posts.find((post) => post.id === id));
  }

  findAllByUserId(userId: string): Post[] {
    return structuredClone(posts.filter((post) => post.userId === userId));
  }
}
