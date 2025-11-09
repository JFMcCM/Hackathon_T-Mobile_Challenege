// Firestore service for managing customer feedback and responses
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  addDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'customer-feedback';

/**
 * Get a single feedback document by ID
 * @param {string} documentId - The ID of the document to fetch
 * @returns {Promise<Object|null>} The document data or null if not found
 */
export async function getResponseData(documentId) {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.warn(`No document found with ID: ${documentId}`);
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

/**
 * Add new customer feedback to Firestore
 * @param {Object} data - The feedback data to store
 * @param {string} data.type - Type of feedback (social|survey|email)
 * @param {string} data.content - The feedback content
 * @param {Object} [data.metadata] - Optional metadata about the feedback
 * @returns {Promise<string>} The ID of the created document
 */
export async function addFeedback(data) {
  try {
    const feedbackData = {
      ...data,
      createdAt: serverTimestamp(),
      status: 'pending_analysis'
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), feedbackData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding feedback:", error);
    throw error;
  }
}

/**
 * Update feedback document with analysis results
 * @param {string} documentId - The ID of the feedback document
 * @param {Object} analysisResults - The Gemini analysis results to store
 * @returns {Promise<void>}
 */
export async function updateFeedbackAnalysis(documentId, analysisResults) {
  try {
    const docRef = doc(db, COLLECTION_NAME, documentId);
    await updateDoc(docRef, {
      analysis: analysisResults,
      analyzedAt: serverTimestamp(),
      status: 'analyzed'
    });
  } catch (error) {
    console.error("Error updating analysis:", error);
    throw error;
  }
}

/**
 * Get recent feedback entries, optionally filtered by type
 * @param {Object} options - Query options
 * @param {string} [options.type] - Filter by feedback type
 * @param {string} [options.status] - Filter by analysis status
 * @param {number} [options.limit=10] - Maximum number of entries to return
 * @returns {Promise<Array>} Array of feedback documents
 */
export async function getRecentFeedback({ type, status, limit: resultLimit = 10 } = {}) {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    // Build query conditions
    const conditions = [];
    if (type) conditions.push(where('type', '==', type));
    if (status) conditions.push(where('status', '==', status));
    
    // Add ordering and limit
    conditions.push(orderBy('createdAt', 'desc'));
    conditions.push(limit(resultLimit));
    
    // Execute query
    const querySnapshot = await getDocs(query(q, ...conditions));
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching recent feedback:", error);
    throw error;
  }
}
