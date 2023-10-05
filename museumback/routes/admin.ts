import { Router } from "express";
import { addUser, getCategoryUsers, getUsers, removeUser, setRole } from "../controllers/adminController";
import authenticate from "../middleware/authenticated";

const router = Router();
router.use(authenticate(['ADMIN']));
// register
router.get('/users', getUsers);
// change role
router.patch('/user/role/:userId', setRole);
// add new user to category
router.post('/museums/:museumId/categories/:categoryId/adduser', addUser);
// remove user from category
router.delete('/museums/:museumId/categories/:categoryId/removeuser/:id', removeUser);
// get users that are assigned to this category
router.get('/museums/:museumId/categories/:categoryId/users', getCategoryUsers);
export default router;