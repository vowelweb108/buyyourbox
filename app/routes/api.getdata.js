import { ProductsModel } from "../models/product";

export const loader = async () => {
  try {
    const bundles = await ProductsModel.find({});
    
    // if (!bundles || bundles.length === 0) {
    //   return { status: 404, message: 'No bundles found' };
    // }

    console.log("bundles", bundles);

    return { status: 200, data: bundles };
  } catch (error) {
    console.error('Server error:', error);
    // return { status: 500, message: 'Server error', error };
  }
};
