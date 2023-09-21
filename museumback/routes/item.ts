import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createItem } from "../controllers/itemController";

const router = Router();

// get items
// router.get('/page/:page', getMuseums);
// get single item
// router.get('/:id', getMuseum);
// update an item
// router.patch('/:id', authenticate(['ADMIN']), updateMuseum);
// create an item
router.post('/:museumId/:categoryId', authenticate(['ADMIN']), createItem);
// delete an item
// router.delete('/:id', authenticate(['ADMIN']), deleteMuseum);

export default router;