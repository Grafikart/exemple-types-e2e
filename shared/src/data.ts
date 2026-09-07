import { en, Faker } from '@faker-js/faker';
import type { Post, User } from './models';

const faker = new Faker({ locale: [en] });
faker.seed(42);

const from = '2024-01-01T00:00:00.000Z';
const to = '2024-12-31T23:59:59.999Z';

// This module is initialized once per server process, shared by both repositories.
export const users: User[] = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.date.between({ from, to }),
}));

export const posts: Post[] = users.flatMap((user, index) =>
  Array.from({ length: index === 0 ? 0 : index === 1 ? 1 : 3 }, () => ({
    id: faker.string.uuid(),
    userId: user.id,
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(3),
    createdAt: faker.date.between({ from: user.createdAt, to }),
  })),
);
