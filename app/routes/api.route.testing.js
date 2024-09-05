import { CollectionsModel } from '../models/collection';

export async function loader({request}) {
    
    try {
        const bundles = await CollectionsModel.find({});
        return { status: 200, data: bundles };
    } catch (error) {
        console.log("ERROR", error);
    }
}