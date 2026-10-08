import "server-only";

import { sql } from "@/lib/db";

export type Person = { id: string; username: string };

type RequestResult = { ok: boolean; message: string };

/**
 * Send a friend request by username. If they already asked you, this accepts it.
 */
export async function sendFriendRequest(meId: string, rawUsername: string): Promise<RequestResult> {
  const username = rawUsername.trim().replace(/^@/, "").toLowerCase();
  const targets = (await sql()`select id, username from users where username = ${username}`) as Person[];
  const target = targets[0];
  if (!target) return { ok: false, message: `No one goes by @${username}.` };
  if (target.id === meId) return { ok: false, message: "That's you." };

  const existing = (await sql()`
    select requester_id, status from friendships
    where (requester_id = ${meId} and addressee_id = ${target.id})
       or (requester_id = ${target.id} and addressee_id = ${meId})
  `) as { requester_id: string; status: "pending" | "accepted" }[];
  const row = existing[0];

  if (row?.status === "accepted") return { ok: false, message: `You're already friends with @${target.username}.` };
  if (row && row.requester_id === meId) return { ok: false, message: `Request to @${target.username} is still pending.` };
  if (row) {
    await sql()`
      update friendships set status = 'accepted'
      where requester_id = ${target.id} and addressee_id = ${meId}
    `;
    return { ok: true, message: `@${target.username} had already asked, so you're now friends.` };
  }

  await sql()`
    insert into friendships (requester_id, addressee_id) values (${meId}, ${target.id})
    on conflict do nothing
  `;
  return { ok: true, message: `Request sent to @${target.username}.` };
}

/** Accept or decline a request someone sent you. */
export async function respondToRequest(meId: string, requesterId: string, accept: boolean) {
  if (accept) {
    await sql()`
      update friendships set status = 'accepted'
      where requester_id = ${requesterId} and addressee_id = ${meId} and status = 'pending'
    `;
  } else {
    await sql()`
      delete from friendships
      where requester_id = ${requesterId} and addressee_id = ${meId} and status = 'pending'
    `;
  }
}

/** Accepted friends, incoming requests and outgoing requests, in one round trip. */
export async function listConnections(meId: string) {
  const rows = (await sql()`
    select u.id, u.username, f.status,
      case when f.requester_id = ${meId} then 'outgoing' else 'incoming' end as direction
    from friendships f
    join users u on u.id = case when f.requester_id = ${meId} then f.addressee_id else f.requester_id end
    where f.requester_id = ${meId} or f.addressee_id = ${meId}
    order by u.username
  `) as (Person & { status: "pending" | "accepted"; direction: "incoming" | "outgoing" })[];

  const strip = ({ id, username }: Person) => ({ id, username });
  return {
    friends: rows.filter((r) => r.status === "accepted").map(strip),
    incoming: rows.filter((r) => r.status === "pending" && r.direction === "incoming").map(strip),
    outgoing: rows.filter((r) => r.status === "pending" && r.direction === "outgoing").map(strip),
  };
}

/** The user behind `username` if they're an accepted friend of `meId`, otherwise null. */
export async function findFriend(meId: string, username: string) {
  const rows = (await sql()`
    select u.id, u.username
    from users u
    join friendships f
      on f.status = 'accepted'
     and ((f.requester_id = ${meId} and f.addressee_id = u.id)
       or (f.addressee_id = ${meId} and f.requester_id = u.id))
    where u.username = ${username.toLowerCase()}
  `) as Person[];
  return rows[0] ?? null;
}
