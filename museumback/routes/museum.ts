import { Router } from "express";
import authenticate from "../middleware/authenticated";
import { createMuseum, deleteMuseum, getMuseum, getMuseums, searchMuseums, updateImage, updateMuseum } from "../controllers/museumController";
import categoryRouter from './category';
const router = Router();

// get museums
router.get('/', getMuseums);
// search for museums by name
router.get('/search', authenticate(['ADMIN', 'CURATOR']), searchMuseums)
// get single museum
router.get('/:museumId', getMuseum);
// update a museum
router.put('/:museumId', authenticate(['ADMIN']), updateMuseum);
// create a museum
router.post('/', authenticate(['ADMIN']), createMuseum);
// update museum image
router.post('/:museumId/image', authenticate(['ADMIN']), updateImage);
// delete a museum
router.delete('/:museumId', authenticate(['ADMIN']), deleteMuseum);
// category routes
router.use('/:museumId/categories', categoryRouter);
export default router;