import { createServer } from "node:http";

import { createContext } from "@monartisant/api/context";
import { appRouter } from "@monartisant/api/routers/index";
import { messageService } from "@monartisant/api/services/message.service";
import { paiementService } from "@monartisant/api/services/paiement.service";
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
import Stripe from "stripe";

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

// ─── Stripe Webhook ────────────────────────────────────────────
// IMPORTANT: registered BEFORE express.json() so Stripe can verify the raw body.
// The Stripe client is instantiated lazily inside the handler so that a missing
// STRIPE_SECRET_KEY at startup does NOT crash the server.
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    if (!sig) {
      res.status(400).send("Missing Stripe signature header");
      return;
    }

    const stripeKey = env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(500).send("Stripe not configured");
      return;
    }

    const stripeInstance = new Stripe(stripeKey, { apiVersion: "2026-09-30.endive" });
    let event: Stripe.Event;

    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body as Buffer,
        sig,
        STRIPE_WEBHOOK_SECRET,
      );
    } catch (err: any) {
      console.error("Stripe webhook signature error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        const paiement = await paiementService.getByStripeSession(session.id);
        if (paiement) {
          await paiementService.updateStatut(paiement.id, "paye");
          console.log(`Paiement ${paiement.id} marqué comme payé.`);
        }
      } catch (err) {
        console.error("Erreur traitement webhook paiement:", err);
      }
    }

    res.status(200).json({ received: true });
  },
);


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