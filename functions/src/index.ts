// The Firebase Admin SDK to access Firestore.
import {initializeApp} from "firebase-admin/app";
import {FieldValue, getFirestore} from "firebase-admin/firestore";
import {setGlobalOptions} from "firebase-functions/v2/options";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

initializeApp();

setGlobalOptions({maxInstances: 10});


exports.newUserSignup = functions.auth.user().onCreate((user) => {
  if (user.email) {
    admin.firestore().collection("users").doc(user.uid).set({
      email: user.email,
      uid: user.uid,
      displayName: user.displayName,
    });
  }
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  const uid = context.auth.uid;

  // Delete from Firebase Authentication
  const user = await admin.auth().getUser(uid);
  await admin.auth().deleteUser(user.uid);

  // Delete from firestore users collection
  const doc = admin.firestore().collection("users").doc(user.uid);
  doc.delete();
  return {result: `Successfully deleted user: ${user.uid}`};
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


