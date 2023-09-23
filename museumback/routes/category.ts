import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createCategory, deleteCategory, getCategories, getCategory, searchCategories, updateCategory } from "../controllers/categoryController";

const router = Router();

// search for categories by name
router.get('/search', authenticate(['ADMIN']), searchCategories);
// get museum categories
router.get('/:museumId', getCategories);
// get single museum category
router.get('/:museumId/:categoryId', getCategory);
// update museum category
router.put('/:categoryId', authenticate(['ADMIN']), updateCategory);
// create museum category
router.post('/:museumId', authenticate(['ADMIN']), createCategory);
// delete museum category
router.delete('/:categoryId', authenticate(['ADMIN']), deleteCategory);

export default router;