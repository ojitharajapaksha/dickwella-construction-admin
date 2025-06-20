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
    const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Check if user is an authorized admin
    const adminDoc = await getDoc(doc(db, "admins", user.uid))

    if (!adminDoc.exists()) {
      await signOut(auth)
      throw new Error("Unauthorized: You do not have admin access")
    }

    const adminData = adminDoc.data() as AdminUser

    if (!adminData.isActive) {
      await signOut(auth)
      throw new Error("Account deactivated: Please contact system administrator")
    }

    // Update last login
    await setDoc(
      doc(db, "admins", user.uid),
      {
        ...adminData,
        lastLogin: new Date(),
      },
      { merge: true },
    )

    return {
      ...adminData,
      uid: user.uid,
      email: user.email || adminData.email,
    }
  } catch (error: any) {
    console.error("Sign in error:", error)
    throw new Error(error.message || "Failed to sign in")
  }
}

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    // First check if the email belongs to an admin
    const adminsQuery = query(collection(db, "admins"))
    const querySnapshot = await getDocs(adminsQuery)

    const adminExists = querySnapshot.docs.some((doc) => {
      const adminData = doc.data() as AdminUser
      return adminData.email === email && adminData.isActive
    })

    if (!adminExists) {
      throw new Error("Email not found or account is deactivated. Please contact system administrator.")
    }

    // Send password reset email
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/login`,
      handleCodeInApp: false,
    })
  } catch (error: any) {
    console.error("Password reset error:", error)
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
          resolve(null)
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
        resolve(null)
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
    throw new Error("Failed to fetch admin users")
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
