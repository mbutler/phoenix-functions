import { calculateActionTime, tableLookup } from './functions'
import { oddsOfHitting_4G, standardTargetSizeModifiers_4E, targetSizeModifiers_4F } from './tables'

let result = tableLookup(oddsOfHitting_4G, "EAL", "Single Shot", 28)
document.write(result)