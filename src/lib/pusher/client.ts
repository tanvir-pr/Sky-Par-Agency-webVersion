"use client";

import PusherClient from "pusher-js";

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient | null {
  if (typeof window === "undefined") return null;
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return null;

  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "us2",
    });
  }
  return pusherClient;
}

export function subscribeToChannel(
  channelName: string,
  event: string,
  callback: (data: unknown) => void
) {
  const client = getPusherClient();
  if (!client) return () => {};
  const channel = client.subscribe(channelName);
  channel.bind(event, callback);
  return () => {
    channel.unbind(event, callback);
    client.unsubscribe(channelName);
  };
}
