import { json } from '@remix-run/node';
import { CollectionsModel } from '../models/collection';// Adjust the path as needed

export const action = async ({ request }) => {
  const { id } = await request.json(); // Extract the ID from the request body

  try {
    const bundle = await CollectionsModel.findByIdAndDelete(id);
    if (!bundle) {
      return json({ error: 'Bundle not found' }, { status: 404 });
    }
    return json({ message: 'Bundle deleted successfully' });
  } catch (error) {
    console.error('Error deleting bundle:', error);
    return json({ error: 'Failed to delete bundle' }, { status: 500 });
  }
};
