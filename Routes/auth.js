const admin = require("firebase-admin");
// import { fetch } from 'node-fetch';
const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
// ... Initialize Firebase Admin

const { createUser, setCustomUserClaims } = admin.auth();
const { doc, collection } = admin.firestore();
// admin.auth().ref 
// admin.firestore().collection('users').add
// Middleware to verify user's role
router.post('/user-role', 

  async (req, res) => {
  try {
    const {authorization}  = req.headers;
    console.log("api call")
    // const idtoken =
    // "eyJhbGciOiJSUzI1NiIsImtpZCI6IjNiYjg3ZGNhM2JjYjY5ZDcyYjZjYmExYjU5YjMzY2M1MjI5N2NhOGQiLCJ0eXAiOiJKV1QifQ.eyJyb2xlIjoiYWRtaW4iLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2hvbGVzYWxlLWY0ZjQwIiwiYXVkIjoid2hvbGVzYWxlLWY0ZjQwIiwiYXV0aF90aW1lIjoxNzA5Mjk5ODY0LCJ1c2VyX2lkIjoiZDhNNzFaYXFwTllOYUx3Q3NFTENmOWRtYWV2MSIsInN1YiI6ImQ4TTcxWmFxcE5ZTmFMd0NzRUxDZjlkbWFldjEiLCJpYXQiOjE3MDkyOTk4NjQsImV4cCI6MTcwOTMwMzQ2NCwiZW1haWwiOiJ1c21hbkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsidXNtYW5AZ21haWwuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.fP657fjkqxVqP-zcQD6f4bKhWj-WAFNnPqILJ63_Yx31OeBuRzNqjG_55u_be1cswNHcRTrW2Dlra1fMaXKRFs_JSPTHAxU54__IUTkEHPpW3W0kk1r5-wM5TuHMYnoVWvJrxUz-1zogpWuGWavHZTAMxRdV3WhRv2mfPeN19hZWlIUB_yYqCWRBdbMckEUrjN1nYiCBO4UE300dDMWWna4zYtdKMSXG07CyDtP46xBce3rCVZfUauwpxYXHVRRfnQH7bgwdQOOqHhXaX789sLIOe03HwT7xBzCAbkoy1AXymngnDaF4S_HGr1qxI-xcGVCN1qFLuD6az3og3BZ83A";
    // admin.auth().
    const decodedToken = await admin.auth().verifyIdToken(authorization);
    const uid = decodedToken.uid;
    console.log(uid);

    // Fetch user's custom claims to determine role
    const userRecord = await admin.auth().getUser(uid);
    const role = userRecord.customClaims.role;
   
    console.log(role);

    // Set user's role in request object
    req.role = role;
    res.status(200).json({  role });
  } catch (error) {
    console.error("Error verifying user role:", error.message);
    res.status(401).json({ error: "Unauthorized" });
  }
}
);
const verifyUserRole = async (req, res, next) => {
  try {
    const idtoken = req.headers.authorization;
   
    const decodedToken = await admin.auth().verifyIdToken(idtoken);
    const uid = decodedToken.uid;
    

    // Fetch user's custom claims to determine role
    const userRecord = await admin.auth().getUser(uid);
    const role = userRecord.customClaims.role;
   

    // Set user's role in request object
    req.role = role;

    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying user role:", error.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};
// Function to set custom claims for a user
async function setCustomClaims(uid, role) {
 
  const userRecord = await admin.auth().getUser(uid);
  const customClaims = { role };
  try {
    await admin.auth().setCustomUserClaims(uid, customClaims);
    console.log(
      `Custom claims set for user ${uid}: ${JSON.stringify(customClaims)}`
    );
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
}
 
//route for creating admin 
router.post("/create-admin", verifyUserRole, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    console.log(email);
    console.log(name);
    // Create user in Firebase Authentication

    const userCredential = await admin.auth().createUser({
      email,
      password,
      displayName:name,
    });

    // Set custom claim for admin role
    await setCustomClaims(userCredential.uid, "admin");
    //adding data in firestore
    const adminDocRef = admin
      .firestore()
      .collection("users")
      .doc(userCredential.uid);
    
    await adminDocRef.set({
      email,
      name,
      role:"admin",
    });

    res.status(200).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Error creating admin:", error.message);
    res.status(500).json({ error: error.message })
  }
});


// DELETE route to delete user by UID
router.delete('/users',verifyUserRole, async (req, res) => {
  try {
    // const uid = req.params.uid;
    const uid = req.body.uid;
    const {role} = req

    console.log(role);
    if(role === 'admin') {
    // Delete user from Firebase Authentication
    
   await admin.auth().deleteUser(uid);

    // Delete user document from Firestore
    const adminDocRef = admin
    .firestore()
    .collection("users")
    .doc(uid);
 await adminDocRef.delete();


    res.status(200).json({ message: 'User deleted successfully' });
    }
    else{
      res.status(401).json({ message: 'You are not authorized' });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

//route for creating seller 
router.post("/create-seller", verifyUserRole, async (req, res) => {
  try {
    const { email, password, name,shopName  } = req.body;
    const {role} = req

    console.log(role);
    if(role === 'admin') {
        // Create user in Firebase Authentication
    const userCredential = await admin.auth().createUser({
      email,
      password,
      displayName:name,
    });
      await setCustomClaims(userCredential.uid, "seller");
      const DocRef = admin
      .firestore()
      .collection("users")
      .doc(userCredential.uid);
 
    await DocRef.set({
      email,
      name,
    });
    const sellerDocRef = admin.firestore().collection("sellers").doc(userCredential.uid);
    await DocRef.set({
      shopName,
      
    });
    const idToken = await admin.auth().createCustomToken(userCredential.uid);
    res.status(200).json({ message: "Admin created successfully", idToken });
    }
    else{
      res.status(401).json({ message: "Unauthorized" });
    }
  

    // Set custom claim for admin role

    
  } catch (error) {
    console.error("Error creating Seller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to fetch data based on user's role
router.get("/fetch-seller", async (req, res) => {
  try {
    //  const { role } = req;
    const userRecord = await admin
      .auth()
      .getUser("dVQMKCJ5KpY4QqwgXgTGNTQdh903");
    const role = userRecord.customClaims.role;
    console.log(role);
    //  if (role === 'admin') {
    //    // Fetch all sellers' data
    //    const sellersSnapshot = await firestore.collection('users').where('role', '==', 'seller').get();
    //    const sellersData = sellersSnapshot.docs.map(doc => doc.data());
    //    res.status(200).json({ data: sellersData });
    //  } else if (role === 'seller') {
    //    // Fetch data for the current seller
    //    const uid = req.user.uid;
    //    const sellerDoc = await firestore.collection('users').doc(uid).get();
    //    const sellerData = sellerDoc.data();
    //    res.status(200).json({ data: sellerData });
    //  }
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
