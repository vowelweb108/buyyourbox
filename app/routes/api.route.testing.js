import { ProductsModel } from "../models/product";

export async function loader({request}) {
    
    try {
        const bundles = await ProductsModel.find({});
        return { status: 200, data: bundles };
    } catch (error) {
        console.log("ERROR", error);
    }
}