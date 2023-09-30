import {logger} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";

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
      "request must be no more than 3 characters long"
    );
  }

  const email = context.auth.token.email;

  // Check if a document with the user's email already exists
  const querySnapshot = await admin.firestore()
    .collection("locations")
    .where("email", "==", email)
    .get();

  if (!querySnapshot.empty) {
    // Update the existing document with the new time and email
    const docRef = querySnapshot.docs[0].ref;
    await docRef.update({
      location: data.text,
    });

    return {result: `Age document updated for email: ${email}`};
  } else {
    // Create a new document
    const locationData = {
      age: data.text,
      email: email,
      userId: context.auth.uid, // Add the user ID
    };

    const locationDocRef = await admin.firestore()
      .collection("locations")
      .add(locationData);
    return {
      result:
      `New age document added for email: ${email}, ID: ${locationDocRef.id}`,
    };
  }
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

  const email = context.auth.token.email;

  // Check if a document with the user's email already exists
  const querySnapshot = await admin.firestore()
    .collection("ages")
    .where("email", "==", email)
    .get();

  if (!querySnapshot.empty) {
    // Update the existing document with the new time and email
    const docRef = querySnapshot.docs[0].ref;
    await docRef.update({
      age: data.text,
    });

    return {result: `Age document updated for email: ${email}`};
  } else {
    // Create a new document
    const ageData = {
      age: data.text,
      email: email,
      userId: context.auth.uid, // Add the user ID
    };

    const ageDocRef = await admin.firestore().collection("ages").add(ageData);

    return {
      result: `New age document added for email: ${email}, ID: ${ageDocRef.id}`,
    };
  }
});
