const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();

/**
 * Format notification into a user-facing title & body.
 */
function formatNotification(data) {
  const name = data.senderName || "Someone";
  const groupName = (data.data && data.data.groupName) || "";
  const gameDate = (data.data && data.data.gameDate) || "";

  switch (data.type) {
    case "game_created":
      return {
        title: `⚽ New Game — ${groupName}`,
        body: `${name} scheduled a game${gameDate ? ` for ${gameDate}` : ""}`,
      };
    case "game_cancelled":
      return {
        title: `❌ Game Cancelled — ${groupName}`,
        body: `${name} cancelled the game${gameDate ? ` on ${gameDate}` : ""}`,
      };
    case "player_in":
      return {
        title: `✅ ${name} is IN`,
        body: `${groupName}${gameDate ? ` — ${gameDate}` : ""}`,
      };
    case "player_out":
      return {
        title: `🚫 ${name} is OUT`,
        body: `${groupName}${gameDate ? ` — ${gameDate}` : ""}`,
      };
    case "game_confirmed":
      return {
        title: `🎉 Game Confirmed! — ${groupName}`,
        body: `Minimum players reached${gameDate ? ` for ${gameDate}` : ""}`,
      };
    case "game_needs_players":
      return {
        title: `⚠️ Need More Players — ${groupName}`,
        body: `Game dropped below minimum${gameDate ? ` for ${gameDate}` : ""}`,
      };
    default:
      return {
        title: "SquadUp",
        body: "You have a new notification",
      };
  }
}

/**
 * Cloud Function: triggers when a new notification document is created.
 * Looks up FCM tokens for each recipient and sends a push notification.
 */
exports.sendPushNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const notifData = event.data.data();
    if (!notifData || !notifData.recipientIds || notifData.recipientIds.length === 0) {
      return;
    }

    const { title, body } = formatNotification(notifData);

    // Collect FCM tokens for all recipients
    const tokenDocs = await Promise.all(
      notifData.recipientIds.map((uid) =>
        db.collection("fcmTokens").doc(uid).get()
      )
    );

    const tokens = [];
    tokenDocs.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data();
        if (data.tokens && Array.isArray(data.tokens)) {
          tokens.push(...data.tokens);
        }
      }
    });

    if (tokens.length === 0) {
      return;
    }

    // Send to all tokens
    const messaging = getMessaging();
    const message = {
      notification: { title, body },
      data: {
        type: notifData.type || "",
        gameId: notifData.gameId || "",
        groupId: notifData.groupId || "",
      },
      webpush: {
        fcmOptions: {
          link: notifData.gameId
            ? `/pregame/${notifData.gameId}`
            : "/",
        },
      },
    };

    const results = await Promise.allSettled(
      tokens.map((token) =>
        messaging.send({ ...message, token })
      )
    );

    // Clean up invalid tokens
    const invalidTokens = [];
    results.forEach((result, i) => {
      if (
        result.status === "rejected" &&
        result.reason?.code === "messaging/registration-token-not-registered"
      ) {
        invalidTokens.push(tokens[i]);
      }
    });

    if (invalidTokens.length > 0) {
      // Remove invalid tokens from their respective user docs
      for (const doc of tokenDocs) {
        if (!doc.exists) continue;
        const data = doc.data();
        const cleaned = (data.tokens || []).filter(
          (t) => !invalidTokens.includes(t)
        );
        if (cleaned.length !== (data.tokens || []).length) {
          await doc.ref.update({ tokens: cleaned });
        }
      }
    }
  }
);

/**
 * Scheduled Function: runs every 24 hours and deletes anonymous Firebase Auth
 * accounts that were created more than 24 hours ago.
 *
 * Anonymous accounts are created whenever someone opens a game invite link.
 * They are only needed for a short read session, so we clean them up daily.
 */
exports.cleanupAnonymousUsers = onSchedule("every 24 hours", async () => {
  const auth = getAuth();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

  const uidsToDelete = [];
  let pageToken;

  do {
    const result = await auth.listUsers(1000, pageToken);
    result.users.forEach((user) => {
      const isAnonymous = !user.email && !user.phoneNumber && user.providerData.length === 0;
      const createdAt = new Date(user.metadata.creationTime).getTime();
      if (isAnonymous && createdAt < cutoff) {
        uidsToDelete.push(user.uid);
      }
    });
    pageToken = result.pageToken;
  } while (pageToken);

  if (uidsToDelete.length === 0) return;

  // deleteUsers supports up to 1000 per call
  const chunkSize = 1000;
  for (let i = 0; i < uidsToDelete.length; i += chunkSize) {
    await auth.deleteUsers(uidsToDelete.slice(i, i + chunkSize));
  }

  console.log(`Deleted ${uidsToDelete.length} anonymous user(s).`);
});
