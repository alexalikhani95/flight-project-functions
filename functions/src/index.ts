import {onRequest} from "firebase-functions/v2/https";

// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore} from "firebase-admin/firestore";
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
  admin.firestore().collection("users").doc(user.uid).set({
    email: user.email,
  });
});

exports.userDeleted = functions.auth.user().onDelete((user) => {
  const doc = admin.firestore().collection("users").doc(user.uid);
  return doc.delete();
});

exports.addAge = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can add requests"
    );
  }

  const uid = context.auth.uid;

  try {
    const usersRef =
  getFirestore().collection("users").doc(uid);

    await usersRef.update({
      age: data.text,
    });

    return {result: `Text added to visited airports array for UID: ${uid}`};
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      "Error updating age",
      error
    );
  }
});

exports.addLocation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can add requests"
    );
  }

  const uid = context.auth.uid;

  try {
    const usersRef =
  getFirestore().collection("users").doc(uid);

    await usersRef.update({
      location: data.text,
    });

    return {result: `Text added to visited airports array for UID: ${uid}`};
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      "Error updating location",
      error
    );
  }
});

exports.addVisitedAirport = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Only authenticated users can add requests"
    );
  }

  const uid = context.auth.uid;

  try {
    const usersRef =
  getFirestore().collection("users").doc(uid);

    await usersRef.update({
      visitedAirports: FieldValue.arrayUnion(data.text),
    });

    return {result: `Text added to visited airports array for UID: ${uid}`};
  } catch (error) {
    throw new functions.https.HttpsError(
      "internal",
      "Error updating visited airports array",
      error
    );
  }
});


