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

const currentDate = new Date();
                   
// Get the year, month, and day components from the date object
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
const day = String(currentDate.getDate()).padStart(2, '0');

// Format the date as "YYYY-MM-DD"
const formattedDate = `${year}-${month}-${day}`;


 //route for membership create 
router.post("/create-membership", async (req, res) => {
 try {
   const { email, password  } = req.body;
    
// Name occupation avg salary monthly city number 
// memebership request true > enter email and password screen 
// check memebrship request ? enter email , request ok ? (check user already created or not in users collection by email ? move to login screen: create account using email and password) : (admin still not accepted and will check request status in membership_request collection ) if membership_request statis true return to login screen   
const membershipSnap = await admin.firestore().collection('membership_request').where('email', '==', email).get();
const membershipReqData = membershipSnap.docs[0].data();
const { name, occupation, avg_salary, city, number } = membershipReqData;
console.log(membershipReqData);

const userCredential = await admin.auth().createUser({
  email,
  password,
  displayName:name,
});
//adding data in firestore
const UserDocRef = admin
.firestore()
.collection("users")
.doc(userCredential.uid);

await UserDocRef.set({
email,
name,
role:"membership",
});
const MemberDocRef = admin
.firestore()
.collection("app_users")
.doc(userCredential.uid);

await MemberDocRef.set({
  name,
  occupation,
  avg_salary,
  city,
  number,
  email,
 
});


    
   res.status(200).json({ message: "MemberShip Request sent successfully" });
    
 } catch (error) {
   console.error("Erro r creating Seller:", error.message);
   res.status(500).json({ error: "Internal Server Error" });
 }
});
//route for membership request 
router.post("/request-membership", async (req, res) => {
 try {
   const { email, name, occupation, avg_salary, city, number } = req.body;
   // Check if the document already exists
   const membershipQuery = await admin.firestore().collection("membership_request").where("email", "==", email).get();

   if (!membershipQuery.empty) {
     // If document already exists, return a response indicating the request has already been sent
     return res.status(400).json({ error: "Membership request for this email already exists" });
   }

   // Create the document if it doesn't exist
   const membershipRef = admin.firestore().collection("membership_request").doc(); // Create a new document reference
   await membershipRef.set({
     email,
     name,
     occupation,
     avg_salary,
     city,
     number,
     date: admin.firestore.Timestamp.fromDate(new Date(formattedDate)),
     status: 'pending'
   });

   res.status(200).json({ message: "Membership request sent successfully" });

 } catch (error) {
   console.error("Error creating membership request:", error.message);
   res.status(500).json({ error: "Internal Server Error" });
 }
});
//route for update membership request 
router.put("/request-membership", async (req, res) => {
 try {
   const { memberId, isAccept } = req.body;
  console.log(memberId);
   // Update Membership_request documents from Firestore
   const updateDocPromises = memberId.map(async (uid) => {
     const MemberReqDocRef = admin
       .firestore()
       .collection("membership_request")
       .doc(uid);

     await MemberReqDocRef.update({
       status: isAccept
     });
   });

   // Wait for all update promises to resolve
   await Promise.all(updateDocPromises);

   res.status(200).send("Membership requests updated successfully.");
 } catch (error) {
   console.error("Error updating membership requests:", error);
   res.status(500).send("Internal Server Error");
 }
});



module.exports = router;