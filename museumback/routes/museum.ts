import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createMuseum, deleteMuseum, getMuseums, updateMuseum } from "../controllers/museumController";

const router = Router();

// get museums
router.get('/', authenticate(['ADMIN', 'CURATOR', 'GUEST']), getMuseums);
// update a museum
router.patch('/', authenticate(['ADMIN']), updateMuseum);
// create a museum
router.post('/', authenticate(['ADMIN']), createMuseum);
// delete a museum
router.delete('/', authenticate(['ADMIN']), deleteMuseum);

export default router;