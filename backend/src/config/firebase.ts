import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'agape-hub',
  })
}

export const db = admin.firestore()
export const auth = admin.auth()
export const storage = admin.storage()
export default admin
