import Pusher from "pusher";

let pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher | null {
  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    return null;
  }
  if (!pusherServer) {
    pusherServer = new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_KEY,
      secret: process.env.PUSHER_SECRET,
      cluster: process.env.PUSHER_CLUSTER || "us2",
      useTLS: true,
    });
  }
  return pusherServer;
}

export async function triggerPusherEvent(
  channel: string,
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const pusher = getPusherServer();
  if (pusher) {
    await pusher.trigger(channel, event, data);
  }
}

export function userChannel(userId: string) {
  return `private-user-${userId}`;
}

export function projectChannel(projectId: string) {
  return `private-project-${projectId}`;
}

export function teamChannel() {
  return "private-team";
}
