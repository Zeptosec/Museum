import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createItem, deleteItem, getItem, getItems, updateItem } from "../controllers/itemController";

const router = Router();

// get items
router.get('/:categoryId', getItems);
// get single item
router.get('/:categoryId/:itemId', getItem);
// update an item
router.put('/:itemId', authenticate(['ADMIN', 'CURATOR']), updateItem);
// create an item
router.post('/:categoryId', authenticate(['ADMIN']), createItem);
// delete an item
router.delete('/:itemId', authenticate(['ADMIN']), deleteItem);

export default router;