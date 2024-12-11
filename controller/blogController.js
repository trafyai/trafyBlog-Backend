import { collection, addDoc, getDocs, query, orderBy, Timestamp, updateDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';
import db from '../firebase/firebaseConfig.js';
import fetch from 'node-fetch'
import dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
const client = new SecretManagerServiceClient();

dotenv.config();

async function getSecret(secretName) {
    const [version] = await client.accessSecretVersion({
        name: `projects/255821839155/secrets/mailChimp_Api/versions/latest`, // Replace YOUR_PROJECT_ID
    });
    return version.payload.data.toString('utf8');
}

// Fetch secrets during initialization
let mailchimpApiKey, mailchimpAudienceId, mailchimpServerPrefix;

(async () => {
    try {
        mailchimpApiKey = await getSecret('MAILCHIMP_API_KEY');
        mailchimpAudienceId = await getSecret('MAILCHIMP_AUDIENCE_ID');
        mailchimpServerPrefix = await getSecret('MAILCHIMP_SERVER_PREFIX');
        console.log('Secrets loaded successfully');
    } catch (error) {
        console.error('Error loading secrets:', error);
    }
})();

export const addSubscriber = async (req, res) => {
  const { email } = req.body;

  if (!email) {
      return res.status(400).json({ error: "Email is required." });
  }

  try {
      const response = await fetch(`https://${mailchimpServerPrefix}.api.mailchimp.com/3.0/lists/${mailchimpAudienceId}/members`, {
          method: 'POST',
          headers: {
              'Authorization': `Basic ${Buffer.from(`user:${mailchimpApiKey}`).toString('base64')}`, // Correct format
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              email_address: email,
              status: 'subscribed', // Use 'pending' if you want to send a confirmation email
          }),
      });

      if (response.ok) {
          res.status(200).json({ message: "Successfully subscribed!" });
      } else {
          const errorData = await response.json();
          console.error("Mailchimp Error:", errorData);
          res.status(500).json({ error: "Failed to subscribe. Please try again." });
      }
  } catch (error) {
      console.error("Error subscribing to Mailchimp:", error);
      res.status(500).json({ error: "Failed to subscribe. Please try again." });
  }
};



// Create a new blog
export const createBlog = async (req, res) => {
  try {
    const newBlog = { ...req.body, timestamp: Timestamp.now() }; // Add timestamp
    const docRef = await addDoc(collection(db, 'blogs'), newBlog);
    res.status(200).send({ id: docRef.id, ...newBlog });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get all blogs
export const getAllBlogs = async (req, res) => {
  try {
    const q = query(collection(db, 'blogs'), orderBy('timestamp', 'desc')); // Order by timestamp
    const blogsSnapshot = await getDocs(q);
    const blogs = blogsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(blogs);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update a blog
export const updateBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blogRef = doc(db, 'blogs', blogId);
    const updatedBlog = { ...req.body, updatedTimestamp: Timestamp.now() }; // Add updated timestamp
    await updateDoc(blogRef, updatedBlog);
    res.status(200).send({ id: blogId, ...updatedBlog });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete a blog
export const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blogRef = doc(db, 'blogs', blogId);
    await deleteDoc(blogRef);
    res.status(200).send(`Blog with ID ${blogId} deleted successfully`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Create a new blog detail
export const createBlogDetail = async (req, res) => {
  try {
    const blogDetail = {
      ...req.body,
      timestamp: Timestamp.now(), // Add timestamp to the data
    };

    // Add the blog detail to the 'blogDetails' collection in Firestore
    const docRef = await addDoc(collection(db, 'blogDetails'), blogDetail);
    res.status(200).send({ id: docRef.id, ...blogDetail });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Get blog details by blog ID
export const getBlogDetail = async (req, res) => {
  try {
    const { blogId } = req.params;
    const docRef = doc(db, 'blogs', blogId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      res.status(200).send({ id: docSnap.id, ...docSnap.data() });
    } else {
      res.status(404).send('No such document!');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Update blog details
export const updateBlogDetail = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blogDetailRef = doc(db, 'blogDetails', blogId);
    const updatedBlogDetail = { ...req.body, updatedTimestamp: Timestamp.now() }; // Add updated timestamp
    await updateDoc(blogDetailRef, updatedBlogDetail);
    res.status(200).send({ id: blogId, ...updatedBlogDetail });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Delete blog details
export const deleteBlogDetail = async (req, res) => {
  try {
    const { blogId } = req.params;
    const blogDetailRef = doc(db, 'blogDetails', blogId);
    await deleteDoc(blogDetailRef);
    res.status(200).send(`Blog detail with ID ${blogId} deleted successfully`);
  } catch (error) {
    res.status(500).send(error.message);
  }
};


