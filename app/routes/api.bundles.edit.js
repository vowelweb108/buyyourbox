import { json } from '@remix-run/node';
import { ProductsModel } from '../models/product'; // Adjust the path as needed

export const action = async ({ request }) => {
  const { id, title, bunches, products ,handle} = await request.json(); // Extract the necessary fields from the request body

  try {
    const updatedBundle = await ProductsModel.findByIdAndUpdate(
      id,
      { title, bunches, products ,handle},
      { new: true } // Return the updated document
    );
    if (!updatedBundle) {
      return json({ error: 'Bundle not found' }, { status: 404 });
    }
    return json({ message: 'Bundle updated successfully', bundle: updatedBundle });
  } catch (error) {
    console.error('Error updating bundle:', error);
    return json({ error: 'Failed to update bundle' }, { status: 500 });
  }
};
