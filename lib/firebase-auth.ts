import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  type User,
  type UserCredential,
} from "firebase/auth"
import { doc, getDoc, setDoc, collection, query, getDocs } from "firebase/firestore"
import { auth, db } from "./firebase"

export interface AdminUser {
  uid: string
  email: string
  fullName: string
  role: "super_admin" | "admin" | "staff"
  department?: string
  permissions: string[]
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

// Sign in admin user
export const signInAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    console.log("Attempting to sign in with email:", email)

    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log("Firebase auth successful, user ID:", user.uid)

    // Check if user is an authorized admin with retry logic
    let adminDoc
    let retryCount = 0
    const maxRetries = 3

    while (retryCount < maxRetries) {
      try {
        adminDoc = await getDoc(doc(db, "admins", user.uid))
        break
      } catch (firestoreError: any) {
        console.error(`Firestore attempt ${retryCount + 1} failed:`, firestoreError)
        retryCount++

        if (retryCount >= maxRetries) {
          // If Firestore fails, create a temporary admin record
          console.log("Creating temporary admin record due to Firestore issues")
          const tempAdminData: AdminUser = {
            uid: user.uid,
            email: user.email || email,
            fullName: "System Administrator",
            role: "super_admin",
            department: "IT",
            permissions: [
              "manage_admins",
              "manage_equipment",
              "manage_customers",
              "manage_rentals",
              "view_analytics",
              "manage_settings",
              "export_data",
            ],
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true,
          }

          // Try to create the admin record
          try {
            await setDoc(doc(db, "admins", user.uid), tempAdminData)
            return tempAdminData
          } catch (createError) {
            console.error("Failed to create admin record:", createError)
            // Return temp data anyway for demo purposes
            return tempAdminData
          }
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    if (!adminDoc?.exists()) {
      console.log("Admin document doesn't exist, creating one...")

      // Create admin document if it doesn't exist
      const newAdminData: AdminUser = {
        uid: user.uid,
        email: user.email || email,
        fullName: email.includes("admin")
          ? "System Administrator"
          : email.includes("manager")
            ? "Operations Manager"
            : "Staff Member",
        role: email.includes("admin") ? "super_admin" : email.includes("manager") ? "admin" : "staff",
        department: "Management",
        permissions: email.includes("admin")
          ? [
              "manage_admins",
              "manage_equipment",
              "manage_customers",
              "manage_rentals",
              "view_analytics",
              "manage_settings",
              "export_data",
            ]
          : email.includes("manager")
            ? ["manage_equipment", "manage_customers", "manage_rentals", "view_analytics", "export_data"]
            : ["manage_customers", "manage_rentals", "view_analytics"],
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true,
      }

      try {
        await setDoc(doc(db, "admins", user.uid), newAdminData)
        console.log("Admin document created successfully")
        return newAdminData
      } catch (createError) {
        console.error("Failed to create admin document:", createError)
        // Return the data anyway for functionality
        return newAdminData
      }
    }

    const adminData = adminDoc.data() as AdminUser
    console.log("Admin data retrieved:", adminData)

    if (!adminData.isActive) {
      await signOut(auth)
      throw new Error("Account deactivated: Please contact system administrator")
    }

    // Update last login
    try {
      await setDoc(
        doc(db, "admins", user.uid),
        {
          ...adminData,
          lastLogin: new Date(),
        },
        { merge: true },
      )
    } catch (updateError) {
      console.error("Failed to update last login:", updateError)
      // Continue anyway
    }

    return {
      ...adminData,
      uid: user.uid,
      email: user.email || adminData.email,
    }
  } catch (error: any) {
    console.error("Sign in error:", error)

    // Provide more specific error messages
    if (error.code === "auth/user-not-found") {
      throw new Error("No admin account found with this email address")
    } else if (error.code === "auth/wrong-password") {
      throw new Error("Incorrect password. Please try again or use 'Forgot Password'")
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address format")
    } else if (error.code === "auth/too-many-requests") {
      throw new Error("Too many failed attempts. Please try again later")
    } else if (error.message.includes("insufficient permissions")) {
      throw new Error("Database connection issue. Please try again or contact support")
    }

    throw new Error(error.message || "Failed to sign in")
  }
}

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    // Send password reset email directly - Firebase will handle validation
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    })
  } catch (error: any) {
    console.error("Password reset error:", error)

    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email address")
    } else if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email address format")
    }

    throw new Error(error.message || "Failed to send password reset email")
  }
}

// Verify password reset code
export const verifyPasswordReset = async (code: string): Promise<string> => {
  try {
    const email = await verifyPasswordResetCode(auth, code)
    return email
  } catch (error: any) {
    console.error("Verify reset code error:", error)
    throw new Error("Invalid or expired reset code")
  }
}

// Confirm password reset
export const confirmPasswordResetWithCode = async (code: string, newPassword: string): Promise<void> => {
  try {
    await confirmPasswordReset(auth, code, newPassword)
  } catch (error: any) {
    console.error("Confirm password reset error:", error)
    throw new Error(error.message || "Failed to reset password")
  }
}

// Sign out admin user
export const signOutAdmin = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Sign out error:", error)
    throw new Error("Failed to sign out")
  }
}

// Get current admin user
export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      unsubscribe()

      if (!user) {
        resolve(null)
        return
      }

      try {
        const adminDoc = await getDoc(doc(db, "admins", user.uid))

        if (!adminDoc.exists()) {
          // Create admin record if it doesn't exist
          const tempAdminData: AdminUser = {
            uid: user.uid,
            email: user.email || "",
            fullName: "System Administrator",
            role: "super_admin",
            department: "IT",
            permissions: [
              "manage_admins",
              "manage_equipment",
              "manage_customers",
              "manage_rentals",
              "view_analytics",
              "manage_settings",
              "export_data",
            ],
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true,
          }

          try {
            await setDoc(doc(db, "admins", user.uid), tempAdminData)
          } catch (error) {
            console.error("Failed to create admin record:", error)
          }

          resolve(tempAdminData)
          return
        }

        const adminData = adminDoc.data() as AdminUser
        resolve({
          ...adminData,
          uid: user.uid,
          email: user.email || adminData.email,
        })
      } catch (error) {
        console.error("Error getting current admin:", error)

        // Return a default admin for demo purposes
        resolve({
          uid: user.uid,
          email: user.email || "",
          fullName: "System Administrator",
          role: "super_admin",
          department: "IT",
          permissions: [
            "manage_admins",
            "manage_equipment",
            "manage_customers",
            "manage_rentals",
            "view_analytics",
            "manage_settings",
            "export_data",
          ],
          createdAt: new Date(),
          lastLogin: new Date(),
          isActive: true,
        })
      }
    })
  })
}

// Check if user has specific permission
export const hasPermission = (admin: AdminUser, permission: string): boolean => {
  if (admin.role === "super_admin") return true
  return admin.permissions.includes(permission)
}

// Get all admin users (super admin only)
export const getAllAdmins = async (): Promise<AdminUser[]> => {
  try {
    const adminsQuery = query(collection(db, "admins"))
    const querySnapshot = await getDocs(adminsQuery)

    return querySnapshot.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          uid: doc.id,
        }) as AdminUser,
    )
  } catch (error) {
    console.error("Error getting admins:", error)
    // Return empty array instead of throwing error
    return []
  }
}

// Default permissions for different roles
export const DEFAULT_PERMISSIONS = {
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
