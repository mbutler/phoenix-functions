import _ from 'lodash'
import { equipment, movementModifiers_4D, situationAndStanceModifiers_4B, visibilityModifiers_4C, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, combatActionsPerImpulse_1E, baseSpeed_1A, maxSpeed_1B, skillAccuracy_1C, combatActions_1D } from './tables'
import { weapons } from './weapons'

/**
 * Adds a specified number of actions to a game time to determine the correct phase and impulse in the future
 *
 * @param {number} actionPoints - A number of action points 
 * @param {object} actionsPerImpulse - An object of distributed action points (e.g. {"1": 2, "2": 1, "3": 2, "4": 2})
 * @param {number} currentImpulseRemainder - The amount of actions remaining this impulse in case of previous remainders
 * @param {object} time - A game time object (e.g. {"impulse" : 1, "phase" : 1})
 * @return {object} - Returns an object with a correct time object as well as remaining actions {time: next, remaining: actions}
 */
export function calculateActionTime(actionPoints, actionsPerImpulse, time, currentImpulseRemainder) {
    let actions = actionPoints
    let ca = actionsPerImpulse
    let next = time
    let phase = time.phase
    let impulse = time.impulse
    let i = impulse    

    //while there are still total actions at each impulse
    while (actions >= ca[i]) {

        if (currentImpulseRemainder > 0) {
            ca[i] = currentImpulseRemainder
            currentImpulseRemainder = 0
        } else if (currentImpulseRemainder === 0) {
            ca[i] = actionsPerImpulse[i]
        }

        //subtract the impulse's actions from total actions
        actions = actions - ca[i]
        i++

        //there are only 4 impulses per phase, so loop around
        if (i > 4) {
            i = 1
        }

        //only increment the time if there are actions left
        if (actions > 0) {
            if (impulse === 4) {
                phase += 1
                impulse = 1
            } else {
                impulse += 1
            }

            next.phase = phase
            next.impulse = impulse            
        }
    }

    if (actionPoints < ca[i]) {
        actions = ca[i] - actions
    }

    if (actionPoints === 0) {
        actions = actionsPerImpulse[time.impulse]
    }
    
    return {time: next, remainder: actions}
}

/**
 * Looks up results on a two-dimensional data table
 *
 * @param {array} table - A json representation of the book's lookup table 
 * @param {string} inputName - The exact header name of the input value
 * @param {string} columnName - The header name of the column being cross-referenced with input
 * @param {string, number} inputValue - The known input value being cross-referenced
 * @return {any} - The resulting lookup
 */
export function tableLookup(table, inputName, columnName, inputValue) {
    let range = false
    let item
    //if the first object is an array, then we have a range of values
    if (Array.isArray(table[0][inputName]) === true) {
        range = true
    }    

    if (range === true) {
        _.forEach(table, (row) => {
            if (_.inRange(inputValue, row[inputName][0], row[inputName][1])) {
                item = row[columnName]
            }
        })
    } else {
        _.forEach(table, (row) => {
            if (row[inputName] === inputValue) {
                item = row[columnName]
            }
        })
    }

    if (item !== undefined) {
        return item
    } else {
        throw Error('Value not found or malformed argument(s).')
    }    
}

/**
 * Converts time to phases
 *
 * @param {string} time - A length of time in the Incapacitation Table format 
 * @return {number} - The total number of phases
 */
export function timeToPhases(time) {
    let phases
    if (_.endsWith(time, 'h') === true) {
        let amount = _.trimEnd(time, 'h')
        phases = (amount * 3600) / 2
    }

    if (_.endsWith(time, 'm') === true) {
        let amount = _.trimEnd(time, 'm')
        phases = (amount * 60) / 2
    }

    if (_.endsWith(time, 'd') === true) {
        let amount = _.trimEnd(time, 'd')
        phases = (amount * 86400) / 2
    }

    if (_.endsWith(time, 'p') === true) {
        let amount = _.trimEnd(time, 'p')
        phases = amount * 1
    }

    return phases
}

/**
 * Returns the correct Accuracy Level Modifier for any distance
 *
 * @param {number} distance - The distance to target in hexes (map) or inches (miniatures)
 * @return {number} - The ALM to add in to EAL calculation
 */
export function rangeALM(distance) {
    let alm
    alm = -193.0515 + (186.8799 + 193.0515) / (1 + Math.pow((distance / 154.6719), 0.07601861))

    return _.round(alm)
}

/**
 * Returns the correct Movement Modifier for targets and shooters
 *
 * @param {number} targetSpeed - The speed the target is moving in hexes per inch
 * @param {number} shooterSpeed - The speed the shooter is moving in hexes per inch
 * @param {number} range - The distance between shooter and target in hexes
 * @return {number} - The ALM to add in to EAL calculation
 */
export function movingALM(targetSpeed, shooterSpeed, range) {
    let targetALM = tableLookup(movementModifiers_4D, 'Speed HPI', range, targetSpeed)
    let shooterALM = tableLookup(movementModifiers_4D, 'Speed HPI', range, shooterSpeed)
    if (shooterSpeed === 0) { shooterALM = 0 }
    if (targetSpeed === 0) { targetALM = 0 }
    let alm = targetALM + shooterALM
    if (alm < -10) { alm = -10 }
    return alm
}

/**
 * Returns the correct Shot Accuracy Modifier for shooters
 *
 * @param {number} weaponAimMod - The aim mod imported from the shooter's weapon
 * @param {number} skillAccuracyLevel - The SAL imported from the shooter's character sheet
 * @return {number} - The ALM to add in to EAL calculation
 */
export function shotAccuracyALM(weaponAimMod, skillAccuracyLevel) {
    return weaponAimMod + skillAccuracyLevel
}

/**
 * Returns the Stance/Situation Modifier for shooters
 *
 * @param {array} list - A list of string labels of the stances/situations
 * @return {number} - The ALM to add in to EAL calculation
 */
export function situationALM(list) {
    let alm = 0
    _.forEach(list, (item) => {
        alm += tableLookup(situationAndStanceModifiers_4B, 'Situation', 'ALM', item)
    })

    return alm
}

/**
 * Returns the Visibility Modifier for shooters
 *
 * @param {array} list - A list of string labels of the visibilities
 * @return {number} - The ALM to add in to EAL calculation
 */
export function visibilityALM(list) {
    let alm = 0
    _.forEach(list, (item) => {
        alm += tableLookup(visibilityModifiers_4C, 'Visibility', 'ALM', item)
    })

    return alm
}

/**
 * Returns the Target Size Modifier based on target's size, either position or actual size
 *
 * @param {array} list - A list of string labels of the standard target sizes
 * @param {string} shotType - Either 'Target Size' for single shot or 'Auto Elev' for burst
 * @param {number} targetSize - Optional target size if there are no viable options form the list
 * @return {number} - The ALM to add in to EAL calculation
 */
export function targetSizeALM(list, shotType, targetSize) {
    let alm = 0

    if (targetSize !== undefined) {
        alm += tableLookup(targetSizeModifiers_4F, 'Size', 'ALM', targetSize)
    } else {
        _.forEach(list, (item) => {
            alm += tableLookup(standardTargetSizeModifiers_4E, 'Position', shotType, item)
        })
    }

    return alm   
}

/**
 * Returns the weight for a given piece of equipment
 *
 * @param {string} item - An item of equipment
 * @return {number} - The weight of the item
 */
export function equipmentWeight(item) {
    let weight = tableLookup(equipment, "Equipment", "Weight", item)
    return weight
}

/**
 * Returns the Skill Accuracy Level
 *
 * @param {number} skillLevel - The set skill level of the character
 * @return {number} - The Skill Accuracy Level
 */
export function skillAccuracyLevel(skillLevel) {
    let sal = tableLookup(skillAccuracy_1C, 'Skill Level', 'SAL', skillLevel)
    return sal
}

/**
 * Returns the number of combat actions per impulse
 *
 * @param {number} strength - The set strength attribute
 * @param {number} agility - The set agility attribute
 * @param {number} intelligence - The set intelligence attribute
 * @param {number} skillLevel - The set skill level
 * @param {number} encumbrance - The encumbrance level
 * @return {object} - The combat actions per impulse object
 */
export function combatActionsPerImpulse(strength, agility, intelligence, skillLevel, encumbrance) {
    let capi = {}, i1, i2, i3, i4
    let baseSpeed = tableLookup(baseSpeed_1A, 'STR', encumbrance, strength)
    let maxSpeed = tableLookup(maxSpeed_1B, 'AGI', baseSpeed, agility)
    let sal = skillAccuracyLevel(skillLevel)
    let isf = intelligence + sal
    let combatActions = tableLookup(combatActions_1D, 'MS', isf, maxSpeed)
    i1 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 1', combatActions)
    i2 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 2', combatActions)
    i3 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 3', combatActions)
    i4 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 4', combatActions)
    capi = {"1": i1, "2": i2, "3": i3, "4": i4}
    return capi    
}