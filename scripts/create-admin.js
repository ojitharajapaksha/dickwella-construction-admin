// Run this script to create admin users in Firebase
// Usage: node scripts/create-admin.js

const admin = require("firebase-admin")

// Initialize Firebase Admin SDK
const serviceAccount = require("./path-to-your-service-account-key.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "your-project-id",
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

    console.log("Successfully created user:", userRecord.uid)

    // Add admin data to Firestore
    const adminData = {
      uid: userRecord.uid,
      email: email,
      fullName: fullName,
      role: role, // 'super_admin', 'admin', or 'staff'
      department: "Management",
      permissions: getPermissionsForRole(role),
      createdAt: new Date(),
      isActive: true,
    }

    await firestore.collection("admins").doc(userRecord.uid).set(adminData)

    console.log("Successfully created admin profile for:", email)
    console.log("Role:", role)
    console.log("Permissions:", adminData.permissions)
  } catch (error) {
    console.error("Error creating admin:", error)
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

// Create your admin users
async function createAdmins() {
  // Super Admin
  await createAdmin("admin@dickwellaconstruction.com", "SecurePassword123!", "System Administrator", "super_admin")

  // Regular Admin
  await createAdmin("manager@dickwellaconstruction.com", "ManagerPass123!", "Operations Manager", "admin")

  // Staff Member
  await createAdmin("staff@dickwellaconstruction.com", "StaffPass123!", "Rental Staff", "staff")

  console.log("All admin accounts created successfully!")
  process.exit(0)
}

createAdmins()
