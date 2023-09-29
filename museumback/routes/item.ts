import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createItem, deleteItem, getItem, getItems, updateImage, updateItem } from "../controllers/itemController";

const router = Router({ mergeParams: true });

// get items
router.get('/', getItems);
// get single item
router.get('/:itemId', getItem);
// update an item
router.put('/:itemId', authenticate(['ADMIN', 'CURATOR']), updateItem);
// create an item
router.post('/', authenticate(['ADMIN', 'CURATOR']), createItem);
// change item image
router.post('/:itemId/image', authenticate(['ADMIN', 'CURATOR']), updateImage);
// delete an item
router.delete('/:itemId', authenticate(['ADMIN', 'CURATOR']), deleteItem);

export default router;