import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface Credential {
  email: string;
  password: string;
}

const apiUrl = process.env.API_URL ?? 'http://localhost:4444';
const prisma = new PrismaClient();
const defaultCredentials: Credential[] = [
  { email: 'admin@example.com', password: 'admin123' },
  { email: 'manager@example.com', password: 'manager123' },
  { email: 'buyer@example.com', password: 'user123' },
];

function credentials(): Credential[] {
  const value = process.env.TEST_ACCOUNTS_JSON;
  return value ? (JSON.parse(value) as Credential[]) : defaultCredentials;
}

async function graphql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  cookie?: string
): Promise<{ response: Response; body: GraphQLResponse<T>; durationMs: number }> {
  const startedAt = performance.now();
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: process.env.FRONTEND_URL ?? 'http://localhost:7777',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await response.json()) as GraphQLResponse<T>;
  return { response, body, durationMs: Math.round(performance.now() - startedAt) };
}

function assertGraphQL<T>(
  result: Awaited<ReturnType<typeof graphql<T>>>,
  label: string
): asserts result is typeof result & { body: { data: T } } {
  if (!result.response.ok || result.body.errors?.length || !result.body.data) {
    throw new Error(
      `${label} failed (${result.response.status}): ${JSON.stringify(result.body.errors ?? result.body)}`
    );
  }
}

async function login(credential: Credential): Promise<string> {
  const result = await graphql<{ signin: { id: string } }>(
    `mutation Signin($email: String!, $password: String!) {
      signin(email: $email, password: $password) { id }
    }`,
    credential
  );
  assertGraphQL(result, `signin ${credential.email}`);
  const setCookie = result.response.headers.get('set-cookie');
  if (!setCookie) throw new Error(`signin ${credential.email} did not set an auth cookie`);
  return setCookie.split(';', 1)[0];
}

async function testAccount(credential: Credential, isAdmin: boolean): Promise<void> {
  const cookie = await login(credential);
  const me = await graphql<{ me: { email: string; cart: unknown[] } }>(
    `query Me { me { email permissions cart { id quantity item { id title price } } } }`,
    {},
    cookie
  );
  assertGraphQL(me, `me ${credential.email}`);
  if (me.body.data.me.email !== credential.email) {
    throw new Error(`me returned ${me.body.data.me.email} for ${credential.email}`);
  }

  const reads = [
    graphql<{ items: unknown[] }>(
      `query Items { items(first: 20, orderBy: createdAt_DESC) { id title price user { id } } }`,
      {},
      cookie
    ),
    graphql<{ itemsConnection: { aggregate: { count: number } } }>(
      `query Count { itemsConnection { aggregate { count } } }`,
      {},
      cookie
    ),
    graphql<{ orders: unknown[] }>(
      `query Orders { orders(orderBy: createdAt_DESC) { id total createdAt items { id title } } }`,
      {},
      cookie
    ),
  ];

  for (const [index, pending] of reads.entries()) {
    const result = await pending;
    assertGraphQL(result, `read ${index + 1} ${credential.email}`);
    console.log(`PASS ${credential.email} read-${index + 1} ${result.durationMs}ms`);
  }

  const users = await graphql<{ users: unknown[] }>(`query Users { users { id email permissions } }`, {}, cookie);
  if (isAdmin) {
    assertGraphQL(users, `users ${credential.email}`);
  } else if (!users.body.errors?.length) {
    throw new Error(`users query unexpectedly allowed for ${credential.email}`);
  }

  const signout = await graphql<{ signout: { message: string } }>(
    `mutation Signout { signout { message } }`,
    {},
    cookie
  );
  assertGraphQL(signout, `signout ${credential.email}`);
  const clearedCookie = signout.response.headers.get('set-cookie');
  if (!clearedCookie?.includes('token=;')) {
    throw new Error(`signout ${credential.email} did not clear the auth cookie`);
  }
}

async function testItemLifecycle(admin: Credential, buyer: Credential): Promise<void> {
  const title = `Integration product ${Date.now()}`;
  const adminCookie = await login(admin);
  let createdId: string | undefined;
  try {
    const created = await graphql<{ createItem: { id: string; title: string; price: number } }>(
      `mutation CreateItem($title: String!, $description: String!, $price: Int!) {
        createItem(title: $title, description: $description, price: $price) {
          id title price
        }
      }`,
      { title, description: 'Temporary integration product', price: 1234 },
      adminCookie
    );
    assertGraphQL(created, 'admin create item');
    createdId = created.body.data.createItem.id;

    const updated = await graphql<{ updateItem: { id: string; title: string; price: number } }>(
      `mutation UpdateItem($id: ID!, $title: String, $price: Int) {
        updateItem(id: $id, title: $title, price: $price) { id title price }
      }`,
      { id: createdId, title: `${title} updated`, price: 2345 },
      adminCookie
    );
    assertGraphQL(updated, 'admin update item');
    if (updated.body.data.updateItem.price !== 2345) {
      throw new Error('admin update item returned an unexpected price');
    }

    const buyerCookie = await login(buyer);
    const forbidden = await graphql<{ createItem: { id: string } }>(
      `mutation CreateForbiddenItem {
        createItem(title: "Forbidden", description: "Must not be created", price: 1) { id }
      }`,
      {},
      buyerCookie
    );
    if (!forbidden.body.errors?.length) {
      throw new Error('buyer unexpectedly created an item without ITEMCREATE permission');
    }

    const deleted = await graphql<{ deleteItem: { id: string } }>(
      `mutation DeleteItem($id: ID!) { deleteItem(id: $id) { id } }`,
      { id: createdId },
      adminCookie
    );
    assertGraphQL(deleted, 'admin delete item');
    createdId = undefined;
    console.log('PASS admin item create-update-delete lifecycle');
  } finally {
    if (createdId) {
      await prisma.item.deleteMany({ where: { id: createdId } });
    }
  }
}

async function main(): Promise<void> {
  const configured = credentials();
  const users = await prisma.user.findMany({
    select: { email: true, permissions: true },
    orderBy: { email: 'asc' },
  });
  const normalizedEmails = users.map(user => user.email.toLowerCase());
  if (new Set(normalizedEmails).size !== normalizedEmails.length) {
    throw new Error('Database contains case-insensitive duplicate user emails');
  }

  const [items, cartItems, orders, orderItemCount] = await Promise.all([
    prisma.item.findMany({ select: { id: true, title: true, description: true, price: true } }),
    prisma.cartItem.findMany({
      select: { id: true, userId: true, itemId: true, quantity: true },
    }),
    prisma.order.findMany({
      include: { items: { select: { price: true, quantity: true } } },
    }),
    prisma.orderItem.count(),
  ]);
  const invalidItems = items.filter(
    item => item.price < 0 || !item.title.trim() || !item.description.trim()
  );
  if (invalidItems.length) {
    throw new Error(`Database contains invalid items: ${invalidItems.map(item => item.id).join(', ')}`);
  }

  const cartKeys = new Set<string>();
  for (const cartItem of cartItems) {
    if (cartItem.quantity <= 0 || !cartItem.itemId) {
      throw new Error(`Database contains invalid cart item ${cartItem.id}`);
    }
    const key = `${cartItem.userId}:${cartItem.itemId}`;
    if (cartKeys.has(key)) throw new Error(`Database contains duplicate cart item relation ${key}`);
    cartKeys.add(key);
  }

  for (const order of orders) {
    const calculatedTotal = order.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    if (order.total !== calculatedTotal) {
      throw new Error(
        `Order ${order.id} total mismatch: stored=${order.total}, calculated=${calculatedTotal}`
      );
    }
  }
  console.log(
    `PASS database integrity users=${users.length} items=${items.length} ` +
      `cartItems=${cartItems.length} orders=${orders.length} orderItems=${orderItemCount}`
  );

  const byEmail = new Map(configured.map(item => [item.email.toLowerCase(), item]));
  const uncovered = users.filter(user => !byEmail.has(user.email.toLowerCase()));
  if (uncovered.length) {
    throw new Error(
      `No test password configured for existing accounts: ${uncovered.map(user => user.email).join(', ')}. ` +
        'Set TEST_ACCOUNTS_JSON to cover every local account.'
    );
  }

  const health = await fetch(`${apiUrl}/healthz`, { signal: AbortSignal.timeout(10_000) });
  if (!health.ok) throw new Error(`healthz failed with ${health.status}`);

  const preflight = await fetch(apiUrl, {
    method: 'OPTIONS',
    headers: {
      origin: process.env.FRONTEND_URL ?? 'http://localhost:7777',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (!preflight.ok || preflight.headers.get('access-control-allow-credentials') !== 'true') {
    throw new Error(`CORS preflight failed with ${preflight.status}`);
  }

  const disallowedOrigin = await fetch(apiUrl, {
    method: 'OPTIONS',
    headers: {
      origin: 'http://not-allowed.example',
      'access-control-request-method': 'POST',
    },
    signal: AbortSignal.timeout(10_000),
  });
  if (disallowedOrigin.headers.has('access-control-allow-origin')) {
    throw new Error('CORS unexpectedly allowed an unknown origin');
  }

  const anonymousMe = await graphql<{ me: null }>(`query AnonymousMe { me { id } }`);
  assertGraphQL(anonymousMe, 'anonymous me');
  if (anonymousMe.body.data.me !== null) {
    throw new Error('anonymous me unexpectedly returned a user');
  }

  for (const user of users) {
    await testAccount(byEmail.get(user.email.toLowerCase())!, user.permissions.includes('ADMIN'));
  }
  const admin = users.find(user => user.permissions.includes('ADMIN'));
  const buyer = users.find(user => !user.permissions.includes('ITEMCREATE'));
  if (admin && buyer) {
    await testItemLifecycle(
      byEmail.get(admin.email.toLowerCase())!,
      byEmail.get(buyer.email.toLowerCase())!
    );
  }

  if (!process.env.MAIL_HOST) {
    const resetAccount = configured[0];
    try {
      const reset = await graphql<{ requestReset: { message: string } }>(
        `mutation RequestReset($email: String!) {
          requestReset(email: $email) { message }
        }`,
        { email: resetAccount.email.toUpperCase() }
      );
      assertGraphQL(reset, 'local password reset mail');
    } finally {
      await prisma.user.update({
        where: { email: resetAccount.email },
        data: { resetToken: null, resetTokenExpiry: null },
      });
    }
  }

  console.log(`PASS all ${users.length} local accounts`);
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
