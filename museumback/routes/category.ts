import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { addUser, createCategory, deleteCategory, getCategories, getCategory, getUsers, removeUser, searchCategories, updateCategory, updateImage } from "../controllers/categoryController";
import itemRouter from './item';

const router = Router({ mergeParams: true });

// search for categories by name
router.get('/search', authenticate(['ADMIN', 'CURATOR']), searchCategories);
// get museum categories
router.get('/', getCategories);
// get single museum category
router.get('/:categoryId', getCategory);
// get users that are assigned to this category
router.get('/:categoryId/users', authenticate(['ADMIN']), getUsers);
// update museum category
router.put('/:categoryId', authenticate(['ADMIN']), updateCategory);
// create museum category
router.post('/', authenticate(['ADMIN']), createCategory);
// change category image
router.post('/:categoryId/image', authenticate(['ADMIN']), updateImage);
// add new user to category
router.post('/:categoryId/adduser', authenticate(['ADMIN']), addUser);
// remove user from category
router.delete('/:categoryId/removeuser/:id', authenticate(['ADMIN']), removeUser);
// delete museum category
router.delete('/:categoryId', authenticate(['ADMIN']), deleteCategory);
// item routes
router.use('/:categoryId/items', itemRouter);
export default router;