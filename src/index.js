import { calculateActionTime, tableLookup, rangeALM, timeToPhases } from './functions'
import { oddsOfHitting_4G, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, shotScatter_5C, hitLocationDamage_6A, medicalAidRecovery_8A, incapacitationTime_8B } from './tables'
import { weapons } from '../src/weapons'

let result = tableLookup(shotScatter_5C, 'Difference in SA', 'Scatter (hexes)', 22)
//console.log(weapons['FN Mk 1']['Aim Time']['4'])
console.log(rangeALM(1000000))
//console.log(tableLookup(hitLocationDamage_6A['DC 1'], 'Fire', 'Hit Location', 23))

//console.log(timeToPhases(tableLookup(incapacitationTime_8B, 'PD Total', '3', 222)))