import {logger} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import {onDocumentCreated} from "firebase-functions/v2/firestore";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions/v2/options";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

initializeApp();

setGlobalOptions({maxInstances: 10});

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;

  // Check if 'original' is defined and not empty.
  if (original) {
    // Push the new message into Firestore using the Firebase Admin SDK.
    const writeResult = await getFirestore()
      .collection("messages")
      .add({original: original});

    // Send back a message that we've successfully written the message
    res.json({result: `Message with ID: ${writeResult.id} added.`});
  } else {
    // Handle the case where 'original' is not provided in the query.
    res
      .status(400)
      .json({error: "The \"text\" parameter is missing or empty."});
  }
});


exports.newUserSignup = functions.auth.user().onCreate((user) => {
  const email = user.email; // The email of the user.
  const displayName = user.displayName; // The display name of the user

  logger.log(email, displayName);
  return admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
  });
});

exports.userDeleted = functions.auth.user().onDelete((user) => {
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});

// http callable function (adding a request)
exports.addLocation = functions.https.onCall(async (data, context) => {
  // check request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  // check request has a text body
  if (data.text.length > 30) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "request must be no more than 30 characters long"
    );
  }

  await admin.firestore().collection("locations").add({
    text: data.text,
  });
});

exports.addAge = functions.https.onCall(async (data, context) => {
  // check request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "only authenticated users can add requests"
    );
  }
  // check request has a text body
  if (data.text.length > 3) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "request must be no more than 3 characters long"
    );
  }

  await admin.firestore().collection("ages").add({
    text: data.text,
  });
});
