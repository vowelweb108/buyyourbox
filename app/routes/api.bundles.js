// import { json } from '@remix-run/node';
// import { ProductsModel } from '../models/product.js';

// export const loader = async ({request, params}) => {
// //  const _params = new URL(request.url)
//  console.log("PARAMS", request.url) 
// //  const query = productId ? {_id: productId}: {}
//   // console.log("QUERY", query)
//   try {
//     const bundles = await ProductsModel.find({});
//     return json(bundles);
//   } catch (error) {
//     console.error('Error fetching bundles:', error);
//     return json({ error: 'Failed to fetch bundles.' }, { status: 500 });
//   }
// };
