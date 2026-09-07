import { posts, users } from './data';
import type { User } from './models';

export type CreateUserInput = Pick<User, 'name' | 'email'>;
export type UpdateUserInput = Partial<CreateUserInput>;

export class UserRepository {
  findAll(): User[] {
    return structuredClone(users);
  }

  find(id: string): User | undefined {
    return structuredClone(users.find((user) => user.id === id));
  }

  create(input: CreateUserInput): User {
    const user: User = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      createdAt: new Date(),
    };
    users.push(user);
    return structuredClone(user);
  }

  update(id: string, input: UpdateUserInput): User | undefined {
    const user = users.find((user) => user.id === id);
    if (!user) return undefined;
    if (input.name !== undefined) user.name = input.name;
    if (input.email !== undefined) user.email = input.email;
    return structuredClone(user);
  }

  delete(id: string): User | undefined {
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return undefined;
    const [user] = users.splice(index, 1);
    // Keep the dataset consistent: no post may reference a deleted user.
    for (let index = posts.length - 1; index >= 0; index--) {
      if (posts[index]?.userId === id) posts.splice(index, 1);
    }
    return structuredClone(user);
  }
}
