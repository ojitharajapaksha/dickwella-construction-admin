// Firebase admin creation script
const admin = require("firebase-admin")

// Download service account key from Firebase Console
// Project Settings > Service accounts > Generate new private key
const serviceAccount = require("./firebase-service-account.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "dickwella-construction-admin",
})

const auth = admin.auth()
const firestore = admin.firestore()

async function createAdmin(email, password, fullName, role = "admin") {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: fullName,
    })

    console.log("✅ Created Firebase user:", userRecord.uid)

    // Add admin data to Firestore
    const adminData = {
      uid: userRecord.uid,
      email: email,
      fullName: fullName,
      role: role,
      department: "Management",
      permissions: getPermissionsForRole(role),
      createdAt: new Date(),
      isActive: true,
    }

    await firestore.collection("admins").doc(userRecord.uid).set(adminData)
    console.log("✅ Created admin profile for:", email)
  } catch (error) {
    console.error("❌ Error creating admin:", error)
  }
}

function getPermissionsForRole(role) {
  const permissions = {
    super_admin: [
      "manage_admins",
      "manage_equipment",
      "manage_customers",
      "manage_rentals",
      "view_analytics",
      "manage_settings",
      "export_data",
    ],
    admin: ["manage_equipment", "manage_customers", "manage_rentals", "view_analytics", "export_data"],
    staff: ["manage_customers", "manage_rentals", "view_analytics"],
  }
  return permissions[role] || permissions.staff
}

async function createAllAdmins() {
  // Create your admin accounts
  await createAdmin("admin@dickwellaconstruction.com", "SecureAdmin123!", "System Administrator", "super_admin")

  await createAdmin("manager@dickwellaconstruction.com", "Manager123!", "Operations Manager", "admin")

  console.log("🎉 All admin accounts created!")
  process.exit(0)
}

createAllAdmins()
