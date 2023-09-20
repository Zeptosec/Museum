import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../controllers/categoryController";

const router = Router();

// get museums
router.get('/page/:museumId/:page', getCategories);
// get single museum
router.get('/:museumId/:categoryId', getCategory);
// update a museum
router.patch('/:museumId/:categoryId', authenticate(['ADMIN']), updateCategory);
// create a museum
router.post('/:museumId', authenticate(['ADMIN']), createCategory);
// delete a museum
router.delete('/:id', authenticate(['ADMIN']), deleteCategory);

export default router;