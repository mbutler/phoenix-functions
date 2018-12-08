import { calculateActionTime, tableLookup } from './functions'
import { oddsOfHitting_4G, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, shotScatter_5C } from './tables'

let result = tableLookup(shotScatter_5C, 'Difference in SA', 'Scatter (hexes)', 22)
document.write(result)