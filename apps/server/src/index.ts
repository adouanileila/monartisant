import { createServer } from "node:http";

import { createContext } from "@monartisant/api/context";
import { appRouter } from "@monartisant/api/routers/index";
import { messageService } from "@monartisant/api/services/message.service";
import { auth } from "@monartisant/auth";
import { env } from "@monartisant/env/server";
import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use(async (req, res, next) => {
  const rpcResult = await rpcHandler.handle(req, res, {
    prefix: "/rpc",
    context: await createContext({ req }),
  });
  if (rpcResult.matched) return;

  const apiResult = await apiHandler.handle(req, res, {
    prefix: "/api-reference",
    context: await createContext({ req }),
  });
  if (apiResult.matched) return;

  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// ─── Socket.io ───────────────────────────────
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté:", socket.id);

  // Rejoindre la room d'une Demande spécifique
  socket.on("join-demande", (demandeId: string) => {
    socket.join(`demande-${demandeId}`);
  });

  // Réception d'un nouveau message
  socket.on(
    "send-message",
    async (data: {
      demandeId: string;
      expediteurId: string;
      destinataireId: string;
      contenu: string;
      type: "texte" | "image";
    }) => {
      const savedMessage = await messageService.create(data);

      // Diffuse le message à tous ceux dans la room de cette Demande
      io.to(`demande-${data.demandeId}`).emit("new-message", savedMessage);
    },
  );

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté:", socket.id);
  });
});

httpServer.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});