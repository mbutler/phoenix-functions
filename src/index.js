import { calculateActionTime } from './functions'

document.write(JSON.stringify(calculateActionTime(6, {"1": 3, "2": 3, "3": 2, "4": 2}, {"impulse" : 1, "phase" : 1}, 0)))