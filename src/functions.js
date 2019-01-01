import _ from 'lodash'
import { equipment, movementModifiers_4D, situationAndStanceModifiers_4B, visibilityModifiers_4C, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, combatActionsPerImpulse_1E, baseSpeed_1A, maxSpeed_1B, skillAccuracy_1C, combatActions_1D, oddsOfHitting_4G, automaticFireAndShrapnel_5A } from './tables'
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
    //using equations for continuous values such as size and range
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
    range = snapToValue(range, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])
    let targetALM = tableLookup(movementModifiers_4D, 'Speed HPI', range, targetSpeed)
    let shooterALM = tableLookup(movementModifiers_4D, 'Speed HPI', range, shooterSpeed)
    if (shooterSpeed === 0) { shooterALM = 0 }
    if (targetSpeed === 0) { targetALM = 0 }
    let alm = targetALM + shooterALM
    alm = _.clamp(alm, -10, 0)
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
 * @param {number} targetSize - Optional target size if there are no viable options from the list
 * @return {number} - The ALM to add in to EAL calculation
 */
export function targetSizeALM(list, shotType, targetSize) {
    let alm = 0
    if (shotType === 'Single Shot') {shotType = 'Target Size'}
    if (shotType === 'Burst') {shotType = 'Auto Elev'}

    if (targetSize !== undefined) {
        //using equations for continuous values such as size and range
        //alm += tableLookup(targetSizeModifiers_4F, 'Size', 'ALM', targetSize)
        targetSize = 603.5065 + (-1251.667 - 603.5065) / (1 + Math.pow((targetSize / 1.200853e-18), 0.01778392))
        alm += _.round(targetSize)
    } else {
        _.forEach(list, (item) => {
            alm += tableLookup(standardTargetSizeModifiers_4E, 'Position', shotType, item)
        })
    }

    return alm   
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
 * Returns the Intelligence Skill Factor
 *
 * @param {number} int - The set intelligence level of the character
 * @param {number} skillLevel - The set skill level level of the character
 * @return {number} - The Intelligence Skill Factor rounded to an odd number
 */
export function intelligenceSkillFactor(int, skillLevel) {
    let sal = skillAccuracyLevel(skillLevel)
    let isf = int + sal
    isf = 2 * Math.floor(isf / 2) - 1
    isf = _.clamp(isf, 7, 39)
    return isf
}

/**
 * Returns the knockout value
 *
 * @param {number} will - The set will attribute
 * @param {number} skillLevel - The set skill level
 * @return {number} - The total combined encumbrance
 */
export function knockoutValue(will, skillLevel) {
    if (skillLevel === 0) { skillLevel = 1}
    let kv = _.round(0.5 * will) * skillLevel
    return kv
}

/**
 * Returns the number of hexes or inches a character can move each phase
 *
 * @param {number} strength - The set strength attribute
 * @param {number} agility - The set agility level
 * @param {number} encumbrance - The calculated encumbrance
 * @return {number} - The total hexes or inches per phase
 */
export function movementSpeed(strength, agility, encumbrance) {
    let baseSpeed = tableLookup(baseSpeed_1A, 'STR', encumbrance, strength)
    let maxSpeed = tableLookup(maxSpeed_1B, 'AGI', baseSpeed, agility)
    let spd = _.round(maxSpeed / 2)
    return spd
}

/**
 * Returns the total encumbrance for equipment and weapons
 *
 * @param {array} gear - A list of all equipment
 * @param {array} guns - A list of all weapons
 * @return {number} - The total combined encumbrance
 */
export function encumbranceCalculator(gear, guns) {
    let encumbrance = 0
    _.forEach(gear, (item) => {
        encumbrance += tableLookup(equipment, "Equipment", "Weight", item)       
    })
    _.forEach(guns, (item) => {
        encumbrance += weapons[item]['W']    
    })
    encumbrance = Math.ceil(encumbrance/5) * 5
    encumbrance = _.clamp(encumbrance, 10, 200)
    return encumbrance
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
    let isf = intelligenceSkillFactor(intelligence, skillLevel)
    let combatActions = tableLookup(combatActions_1D, 'MS', isf, maxSpeed)
    i1 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 1', combatActions)
    i2 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 2', combatActions)
    i3 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 3', combatActions)
    i4 = tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 4', combatActions)
    capi = {"1": i1, "2": i2, "3": i3, "4": i4}
    return capi    
}


/**
 * Returns the closest number in a list of numbers without going over
 *
 * @param {number} value - The number to change
 * @param {array} numberList - A list of numbers with arbitrary space between
 * @return {number} - The closest number from NumberList without going over
 */
export function snapToValue(value, numberList) {
    value = _.clamp(value, _.head(numberList), _.last(numberList))
    let newValue
    _.forEach(_.tail(numberList), num => {
        let prevIndex = _.indexOf(numberList, num) - 1
        prevIndex = _.clamp(prevIndex, 0, numberList.length)
        let prevNum = numberList[prevIndex]
        if (prevIndex !== 0) {prevNum++}
        num++
        if (_.inRange(value, prevNum, num)) {
            newValue = num - 1
        }
        if (value === 0) {
            newValue = 0
        }
    })
    return newValue
}

/**
 * Returns the EAL given all modifiers
 *
 * @param {object} mods - The collection of mods
 * @return {number} - The effective accuracy level
 */
export function effectiveAccuracyLevel(mods) {
    let targetDiameter
    if (mods.targetDiameter > 0) {targetDiameter = mods.targetDiameter}
    let aimTimeMod = shotAccuracyALM(mods.weaponAimMod, mods.sal)    
    let movingMod = movingALM(mods.targetSpeed, mods.shooterSpeed, mods.range)
    let rangeMod = rangeALM(mods.range)
    let situationMod = situationALM(mods.situational)
    let visibilityMod = visibilityALM(mods.visibility)
    let targetSizeMod = targetSizeALM(mods.targetSize, mods.shotType, targetDiameter)
    let alm = aimTimeMod + movingMod + rangeMod + situationMod + visibilityMod + targetSizeMod
    alm = _.clamp(alm, -10, 28)

    return alm
}

/**
 * Returns the chance of hitting
 *
 * @param {number} eal - The effective accuracy level
 * @param {string} shotType - Either Single Shot or Burst Elevation
 * @return {number} - The effective accuracy level
 */
export function oddsOfHitting(eal, shotType) {
    eal = _.clamp(eal, -10, 28)
    if (shotType === 'Burst') {shotType = 'Burst Elevation'}
    let chance = tableLookup(oddsOfHitting_4G, 'EAL', shotType, eal)
    return chance
}

export function autoFireHitChance(arc, rate, targets) {
    let result = {}
    let shot = tableLookup(automaticFireAndShrapnel_5A, 'Arc of Fire', _.toString(rate), arc)
    result['Hit Chance'] = shot
    for (let i = 1; i <= targets; i++) {
        let rand = _.random(0,99)
        let hit = false        
        if (rand <= shot) {
            hit = true
        }
        result[`target ${i}`] = hit
    }
    return result
}