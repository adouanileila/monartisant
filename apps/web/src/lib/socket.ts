import { io } from "socket.io-client";
import { env } from "@monartisant/env/web";

export const socket = io(env.NEXT_PUBLIC_SERVER_URL, {
  autoConnect: false,
});