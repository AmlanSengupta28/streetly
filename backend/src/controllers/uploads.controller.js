import { createSignedUpload } from '../services/storage.service.js';

export async function postPresign(req, res, next) {
  try {
    const { contentType } = req.body;
    if (!contentType) {
      return res.status(400).json({ error: 'contentType is required.' });
    }
    const result = await createSignedUpload({ contentType });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
