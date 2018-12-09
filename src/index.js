import { calculateActionTime, tableLookup } from './functions'
import { oddsOfHitting_4G, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, shotScatter_5C, hitLocationDamage_6A, medicalAidRecovery_8A } from './tables'
import { weapons } from '../src/weapons'

let result = tableLookup(shotScatter_5C, 'Difference in SA', 'Scatter (hexes)', 22)
console.log(weapons['FN Mk 1']['Aim Time']['4'])