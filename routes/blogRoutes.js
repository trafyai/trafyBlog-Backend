import express from 'express';
import { createBlog, getAllBlogs, updateBlog, deleteBlog, createBlogDetail, getBlogDetail, updateBlogDetail, deleteBlogDetail,addSubscriber} from '../controller/blogController.js';

const router = express.Router();

router.post('/newslettersubscribe', addSubscriber);
// Blog routes
router.post('/createBlog', createBlog);
router.get('/getAllBlogs', getAllBlogs);
// router.put('/updateBlog/:blogId', updateBlog);
router.patch('/updateBlog/:blogId', updateBlog); 
router.delete('/deleteBlog/:blogId', deleteBlog);

// Blog Detail routes
router.post('/createBlogDetail', createBlogDetail);
router.get('/getBlogDetail/:blogId', getBlogDetail);
router.put('/updateBlogDetail/:blogId', updateBlogDetail);
router.delete('/deleteBlogDetail/:blogId', deleteBlogDetail);
export default router;
