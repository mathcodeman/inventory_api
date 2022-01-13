import * as inventory from './db_model.mjs'

const result = await inventory.creatLocation(655441491, "50 Rideau Street", "50 Rideau Street", "Ottawa", "K1N 9J7", "Ontario", "CA")
//const result = await inventory.searchLocation(655441490)
console.log(result)