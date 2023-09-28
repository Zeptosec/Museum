import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createCategory, deleteCategory, getCategories, getCategory, searchCategories, updateCategory, updateImage } from "../controllers/categoryController";
import itemRouter from './item';

const router = Router({ mergeParams: true });

// search for categories by name
router.get('/search', authenticate(['ADMIN']), searchCategories);
// get museum categories
router.get('/', getCategories);
// get single museum category
router.get('/:categoryId', getCategory);
// update museum category
router.put('/:categoryId', authenticate(['ADMIN']), updateCategory);
// create museum category
router.post('/', authenticate(['ADMIN']), createCategory);
// change category image
router.post('/:categoryId/image', authenticate(['ADMIN']), updateImage);
// delete museum category
router.delete('/:categoryId', authenticate(['ADMIN']), deleteCategory);
// item routes
router.use('/:categoryId/items', itemRouter);
export default router;