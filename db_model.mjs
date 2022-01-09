import mongoose from 'mongoose'

mongoose.connect(
    'mongodb://localhost:27017/inventory',
    { useNewUrlParser: true }
);

const database = mongoose.connection;
let currentTime = new Date().toJSON();

database.once('open', () => {
    console.log('MongoDB has been connected!!')
});

const inventoryItemModelSchema = mongoose.Schema({
    id: { type: Number, require: true },
    sku: { type: String, required: true },
    created_at: { type: String, required: true },
    updated_at: { type: String, required: false },
    requires_shipping: { type: Boolean, required: false },
    cost: { type: String, required: false },
    country_code_of_origin: { type: String, required: false },
    province_code_of_origin: { type: String, required: false },
    tracked: { type: Boolean, required: false }
})

const inventoryItem = mongoose.model("inventoryItem", inventoryItemModelSchema)

const createInventoryItem = async (id, sku, requires_shipping = null, cost = null, country_code_of_origin = null, province_code_of_origin = null, tracked = null) => {
    const file = new inventoryItem({
        id: id, sku: sku, created_at: currentTime, updated_at: null, requires_shipping: requires_shipping, cost: cost,
        country_code_of_origin: country_code_of_origin, province_code_of_origin: province_code_of_origin, tracked: tracked
    })
    return file.save()
}

const retrieveInventoryItem = async () => {
    const file = await inventoryItem.find()
    return file
}

const getInventoryItem = async (id) => {
    const file = await inventoryItem.findOne({ id: id })
    return file
}

const getInventoryItems = async (ids) => {
    let items = []
    const id_list = ids.split('_')
    for (let id of id_list) {
        const file = await inventoryItem.findOne({ id: id })
        items.push(file)
    };
    return items
}


const editInventoryItem = async (id, sku, requires_shipping, cost, country_code_of_origin, province_code_of_origin, tracked) => {
    const updateFile = await inventoryItem.updateOne({ id: id }, {
        sku: sku, updated_at: currentTime, requires_shipping: requires_shipping, cost: cost,
        country_code_of_origin: country_code_of_origin, province_code_of_origin: province_code_of_origin, tracked: tracked
    });
    const file = await inventoryItem.findOne({ id: id })
    return file
}

const deleteInventoryItem = async (id) => {
    const file = await inventoryItem.deleteOne({ id: id })
    return file
}

const deleteInventoryItems = async (ids) => {
    let deleteCount = 0;
    const id_list = ids.split('_')
    for (let id of id_list) {
        const file = await inventoryItem.deleteOne({ id: id })
        deleteCount++;
    }
    return deleteCount;
}


const inventoryLevelModelSchema = mongoose.Schema({
    inventory_item_id: { type: Number, required: true },
    location_id: { type: Number, required: true },
    available: { type: Number, required: false },
    updated_at: { type: String, required: false }
})

const inventoryLevel = mongoose.model("inventoryLevel", inventoryLevelModelSchema)

const connectInventoryLevel = async (inventory_item_id, location_id) => {
    const file = new inventoryLevel({ inventory_item_id: inventory_item_id, location_id: location_id, available: 0, updated_at: currentTime })
    return file.save()
}

const setInventoryLevel = async (inventory_item_id, location_id, available) => {
    const file = await inventoryLevel.findOneAndUpdate({ inventory_item_id: inventory_item_id, location_id: location_id }, { available: available, updated_at: currentTime })
    const updateFile = await inventoryLevel.findOne({ inventory_item_id: inventory_item_id, location_id: location_id })
    return updateFile
}

const adjustInventoryLevel = async (inventory_item_id, location_id, available_adjustment) => {
    const file = await inventoryLevel.findOne({ inventory_item_id: inventory_item_id, location_id: location_id })
    const currentAvailable = file['available']
    const updatedAvailable = currentAvailable + available_adjustment
    const uewFile = await inventoryLevel.findOneAndUpdate({ inventory_item_id: inventory_item_id, location_id: location_id }, { available: updatedAvailable, updated_at: currentTime })
    const updateFile = await inventoryLevel.findOne({ inventory_item_id: inventory_item_id, location_id: location_id })
    return updateFile
}

const retrieveInventoryLevels = async (inventory_item_ids, location_ids) => {
    const inventory_item_ids_list = inventory_item_ids.split('_')
    const location_ids_list = location_ids.split('_')
    let inventory_levels = []
    for (let inventory_item_id of inventory_item_ids_list) {
        for (let location_id of location_ids_list) {
            const file = await inventoryLevel.findOne({ inventory_item_id: inventory_item_id, location_id: location_id })
            inventory_levels.push(file)
        }
    }
    return inventory_levels
}

const retrieveInventoryLevel = async () => {
    const file = await inventoryLevel.find()
    return file
}

const deleteInventoryLevel = async (inventory_item_id, location_id) => {
    const file = await inventoryLevel.deleteOne({ inventory_item_id: inventory_item_id, location_id: location_id })
    return file
}

export {
    createInventoryItem, getInventoryItem, getInventoryItems, retrieveInventoryItem, editInventoryItem, deleteInventoryItem, deleteInventoryItems,
    connectInventoryLevel, setInventoryLevel, adjustInventoryLevel, retrieveInventoryLevels, retrieveInventoryLevel, deleteInventoryLevel
}