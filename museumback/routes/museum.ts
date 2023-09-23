import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createMuseum, deleteMuseum, getMuseum, getMuseums, searchMuseums, updateMuseum } from "../controllers/museumController";

const router = Router();

// get museums
router.get('/', getMuseums);
router.get('/search', authenticate(['ADMIN']), searchMuseums)
// get single museum
router.get('/:museumId', getMuseum);
// update a museum
router.put('/:museumId', authenticate(['ADMIN']), updateMuseum);
// create a museum
router.post('/', authenticate(['ADMIN']), createMuseum);
// delete a museum
router.delete('/:museumId', authenticate(['ADMIN']), deleteMuseum);

export default router;