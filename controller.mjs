import express from "express";
import * as inventory from './db_model.mjs'

const PORT = process.env.PORT || 3000
const app = express();

app.use(express.json())
app.get('/', (req, res) => {
    res.send("Welcome to the inventory API!!!")
})

//Inventory Item
app.post('/inventory_item', (req, res) => {
    inventory.createInventoryItem(req.body.id, req.body.sku, req.body.requires_shipping, req.body.cost, req.body.country_code_of_origin, req.body.province_code_of_origin, req.body.tracked)
        .then(result => {
            console.log(result)
            res.status(201).json(result)
        })
        .catch(error => {
            console.log(error)
            res.status(404).json({ Error: error })
        })
})

app.get('/inventory_item/retrieve', (req, res) => {
    inventory.retrieveInventoryItem()
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: "Request Failed!" })
        })
})

app.get('/inventory_item/:id', (req, res) => {
    inventory.getInventoryItem(req.params.id)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: error })
        })
})

app.get('/inventory_item', (req, res) => {
    inventory.getInventoryItems(req.query.ids)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: error })
        })
})

app.put('/inventory_item/:id', (req, res) => {
    inventory.editInventoryItem(req.params.id, req.body.sku, req.body.requires_shipping, req.body.cost, req.body.country_code_of_origin, req.body.province_code_of_origin, req.body.tracked)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: error })
        })
})

app.delete('/inventory_item/:id', (req, res) => {
    inventory.deleteInventoryItem(req.params.id)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: "Request Failed!" })
        })
})

app.delete('/inventory_item', (req, res) => {
    inventory.deleteInventoryItems(req.query.ids)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: "Request Failed!" })
        })
})

//Inventory Level
app.post('/inventory_levels/connect', (req, res) => {
    inventory.connectInventoryLevel(req.body.inventory_item_id, req.body.location_id)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: error })
        })
})

app.post('/inventory_levels/set', (req, res) => {
    inventory.setInventoryLevel(req.body.inventory_item_id, req.body.location_id, req.body.available)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: error })
        })
})

app.post('/inventory_levels/adjust', (req, res) => {
    inventory.adjustInventoryLevel(req.body.inventory_item_id, req.body.location_id, req.body.available_adjustment)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: error })
        })
})

app.get('/inventory_levels', (req, res) => {
    inventory.retrieveInventoryLevels(req.query.inventory_item_ids, req.query.location_ids)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: "Request Failed!" })
        })
})

app.get('/inventory_levels/retrieve', (req, res) => {
    inventory.retrieveInventoryLevel()
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: "Request Failed!" })
        })
})

app.delete('/inventory_levels', (req, res) => {
    inventory.deleteInventoryLevel(req.query.inventory_item_id, req.query.location_id)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: "Request Failed!" })
        })
})

//Location
app.post('/location', (req, res) => {
    inventory.creatLocation(req.body.location_id, req.body.location_name, req.body.address1,
        req.body.city, req.body.zip, req.body.province, req.body.country, req.body.address2,
        req.body.phone, req.body.province_code, req.body.country_code, req.body.country_name)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: error })
        })
})

app.get('/location/retrieve', (req, res) => {
    inventory.retrieveLocation()
        .then(result => {
            res.status(201).json(result)
        })
        .catch(error => {
            res.status(404).json({ Error: "Request Failed!" })
        })
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});