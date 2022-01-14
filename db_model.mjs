import mongoose from 'mongoose'

mongoose.connect(
    process.env.MONGOURI || 'mongodb://localhost:27017/inventory',
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
    const isItemExist = await searchInventory(id)
    if (!isItemExist) {
        const file = new inventoryItem({
            id: id, sku: sku, created_at: currentTime, updated_at: null, requires_shipping: requires_shipping, cost: cost,
            country_code_of_origin: country_code_of_origin, province_code_of_origin: province_code_of_origin, tracked: tracked
        })
        return file.save()
    }
    return Promise.reject('Item already existed!')

}

const retrieveInventoryItem = async () => {
    const file = await inventoryItem.find()
    return file
}

const getInventoryItem = async (id) => {
    const file = await inventoryItem.findOne({ id: id })
    if (file === null) {
        return Promise.reject("No such item exist!!")
    }
    return file
}

const getInventoryItems = async (ids) => {
    let items = []
    const id_list = ids.split('_')
    for (let id of id_list) {
        const file = await inventoryItem.findOne({ id: id })
        if (file === null) {
            items.push(`Item ${id} is not exist!!`)
        }
        else {
            items.push(file)
        }

    };
    return items
}


const editInventoryItem = async (id, sku, requires_shipping, cost, country_code_of_origin, province_code_of_origin, tracked) => {
    const isItemExist = await searchInventory(id)
    if (!isItemExist) {
        return Promise.reject('Item does not existed!')
    }
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
        if (file.deletedCount === 1) {
            deleteCount++;
        }
    }
    return { 'deleteCount': deleteCount };
}

const searchInventory = async (id) => {
    const result = await inventoryItem.findOne({ id: id })
    const isItemExist = result !== null
    return isItemExist
}

const inventoryLevelModelSchema = mongoose.Schema({
    inventory_item_id: { type: Number, required: true },
    location_id: { type: Number, required: true },
    available: { type: Number, required: false },
    updated_at: { type: String, required: false }
})

const inventoryLevel = mongoose.model("inventoryLevel", inventoryLevelModelSchema)

const connectInventoryLevel = async (inventory_item_id, location_id) => {
    const isLocationExist = await searchLocation(location_id)
    const isItemExist = await searchInventory(inventory_item_id)
    const isInventoryLevelExist = await searchInventoryLevel(inventory_item_id, location_id)
    if (isLocationExist && isItemExist && !isInventoryLevelExist) {
        const file = new inventoryLevel({ inventory_item_id: inventory_item_id, location_id: location_id, available: 0, updated_at: currentTime })
        return file.save()
    }
    else if (!isLocationExist && !isItemExist) {
        return Promise.reject('Location and inventory item does not exist!!')
    }
    else if (!isLocationExist) {
        return Promise.reject('Location does not exist!!')
    }
    else if (!isItemExist) {
        return Promise.reject('Inventory item does not exist!!')
    }
    else {
        return Promise.reject('Inventory level already exist!!')
    }


}

const setInventoryLevel = async (inventory_item_id, location_id, available) => {
    const file = await inventoryLevel.findOneAndUpdate({ inventory_item_id: inventory_item_id, location_id: location_id }, { available: available, updated_at: currentTime })
    if (file == null) {
        return Promise.reject('No updated, item id or location id incorrect!!')
    }
    const updateFile = await inventoryLevel.findOne({ inventory_item_id: inventory_item_id, location_id: location_id })
    return updateFile
}

const adjustInventoryLevel = async (inventory_item_id, location_id, available_adjustment) => {
    const file = await inventoryLevel.findOne({ inventory_item_id: inventory_item_id, location_id: location_id })
    if (file == null) {
        return Promise.reject('No adjustment, item id or location id incorrect!!')
    }
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
            if (file === null) {
                inventory_levels.push(`Inventory Item Id: ${inventory_item_id} or Location Id: ${location_id} does not exist!`)
            }
            else {
                inventory_levels.push(file)
            }

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

const searchInventoryLevel = async (inventory_item_id, location_id) => {
    const file = await inventoryLevel.findOne({ inventory_item_id: inventory_item_id, location_id: location_id })
    const isInventoryLevelExist = file !== null
    return isInventoryLevelExist
}

const locationModelSchema = mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    address1: { type: String, required: true },
    address2: { type: String, required: false },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: false },
    created_at: { type: String, required: false },
    updated_at: { type: String, required: false },
    country_code: { type: String, required: false },
    country_name: { type: String, required: false },
    province_code: { type: String, required: false },
    active: { type: Boolean, required: true }
})

const location = mongoose.model("location", locationModelSchema)

const creatLocation = async (id, name, address1, city, zip, province, country, address2 = null, phone = null, province_code = null, country_code = null, country_name = null) => {
    const isLocationExist = await searchLocation(id)
    if (!isLocationExist) {
        const file = new location({
            id: id, name: name, address1: address1, city: city, zip: zip, province: province, country: country,
            created_at: currentTime, active: true, address2: address2, phone: phone, updated_at: null,
            province_code: province_code, country_code: country_code, country_name: country_name
        })
        return file.save()
    }
    return Promise.reject('Location already existed!')
}

const retrieveLocation = async () => {
    const file = await location.find()
    return file
}

const searchLocation = async (id) => {
    const result = await location.findOne({ id: id })
    const isLocationExist = result !== null
    return isLocationExist
}

export {
    createInventoryItem, getInventoryItem, getInventoryItems, retrieveInventoryItem, editInventoryItem, deleteInventoryItem, deleteInventoryItems,
    connectInventoryLevel, setInventoryLevel, adjustInventoryLevel, retrieveInventoryLevels, retrieveInventoryLevel, deleteInventoryLevel,
    creatLocation, retrieveLocation
}