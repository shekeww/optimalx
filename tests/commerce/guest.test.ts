import { describe, it, expect } from 'vitest';
import { orGuest, isGuest, LOGIN_PATH } from '../../app/components/commerce/guest';

/**
 * The account loaders threw for a signed-out visitor, so the gate each route
 * wrote inside its component never ran and the person got the engine's error
 * page printing the raw key `common.errors.500`. These assert the two halves
 * that matter: an auth failure becomes a renderable value, and anything else
 * still throws, because swallowing a real fault would hide it.
 */
describe('orGuest', () => {
  it('passes the loader result straight through when there is a session', async () => {
    const data = { orders: [{ id: 1 }] };
    await expect(orGuest(async () => data)).resolves.toBe(data);
  });

  it('answers with the guest sentinel for a ky HTTPError carrying 401', async () => {
    const error = Object.assign(new Error('Request failed'), { response: { status: 401 } });
    const result = await orGuest(async () => {
      throw error;
    });
    expect(isGuest(result)).toBe(true);
  });

  it('treats 403 the same way', async () => {
    const result = await orGuest(async () => {
      throw Object.assign(new Error('Forbidden'), { response: { status: 403 } });
    });
    expect(isGuest(result)).toBe(true);
  });

  it('recognises a bare status field and a message-only rejection', async () => {
    const byStatus = await orGuest(async () => {
      throw { status: 401 };
    });
    const byMessage = await orGuest(async () => {
      throw new Error('Unauthorized');
    });
    expect(isGuest(byStatus)).toBe(true);
    expect(isGuest(byMessage)).toBe(true);
  });

  it('rethrows a server fault, which must stay a 500', async () => {
    const boom = Object.assign(new Error('Internal Server Error'), { response: { status: 500 } });
    await expect(
      orGuest(async () => {
        throw boom;
      })
    ).rejects.toBe(boom);
  });

  it('rethrows an error with no status at all', async () => {
    const boom = new TypeError('cannot read properties of undefined');
    await expect(
      orGuest(async () => {
        throw boom;
      })
    ).rejects.toBe(boom);
  });
});

describe('isGuest', () => {
  it('is false for the shapes a real loader returns', () => {
    expect(isGuest(null)).toBe(false);
    expect(isGuest(undefined)).toBe(false);
    expect(isGuest({})).toBe(false);
    expect(isGuest({ orders: [] })).toBe(false);
    expect(isGuest({ oxGuest: false })).toBe(false);
  });
});

describe('the sign-in destination', () => {
  it('is Salla\'s own page, which the theme does not reimplement', () => {
    expect(LOGIN_PATH).toBe('/login');
  });
});
