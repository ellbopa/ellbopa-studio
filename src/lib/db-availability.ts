import net from "node:net";

export async function canUseDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (!url.includes("localhost:5432") && !url.includes("127.0.0.1:5432")) return true;
  return canReachLocalPostgres();
}

function canReachLocalPostgres() {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port: 5432 });
    const done = (value: boolean) => {
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(250);
    socket.once("connect", () => done(true));
    socket.once("timeout", () => done(false));
    socket.once("error", () => done(false));
  });
}
