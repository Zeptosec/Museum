import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createMuseum, deleteMuseum, getMuseum, getMuseums, updateMuseum } from "../controllers/museumController";

const router = Router();

// get museums
router.get('/page/:page', getMuseums);
// get single museum
router.get('/:id', getMuseum);
// update a museum
router.patch('/:id', authenticate(['ADMIN']), updateMuseum);
// create a museum
router.post('/', authenticate(['ADMIN']), createMuseum);
// delete a museum
router.delete('/:id', authenticate(['ADMIN']), deleteMuseum);

export default router;