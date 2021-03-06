import _ from 'lodash'
import { blastModifiers_5B, shotScatter_5C, equipment, movementModifiers_4D, situationAndStanceModifiers_4B, visibilityModifiers_4C, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, combatActionsPerImpulse_1E, baseSpeed_1A, maxSpeed_1B, skillAccuracy_1C, combatActions_1D, oddsOfHitting_4G, automaticFireAndShrapnel_5A, hitLocationDamage_6A, effectiveArmorProtectionFactor_6D, coverProtectionFactors_7C, medicalAidRecovery_8A, incapacitationTime_8B } from './tables'
import { weapons } from './weapons'
import * as tables from './tables'

/**
 * Adds a specified number of actions to a game time to determine the correct phase and impulse in the future
 *
 * @param {number} actionPoints - A number of action points 
 * @param {object} actionsPerImpulse - An object of distributed action points (e.g. {"1": 2, "2": 1, "3": 2, "4": 2})
 * @param {object} time - A game time object (e.g. {"impulse" : 1, "phase" : 1})
 * @param {number} currentImpulseRemainder - The amount of actions remaining this impulse in case of previous remainders
 * @return {object} - Returns an object with a correct time object as well as remaining actions {time: next, remaining: actions}
 */
export function calculateActionTime(actionPoints, actionsPerImpulse, time, currentImpulseRemainder) {
    let actions = actionPoints
    let ca = actionsPerImpulse
    let next = _.cloneDeep(time)
    let phase = _.toNumber(time.phase)
    let impulse = _.toNumber(time.impulse)
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
 * Returns a time object one impulse in the future
 *
 * @param {object} time - A phase and impulse object 
 * @return {object} - A time object incremented one impulse
 */
export function nextImpulse(time) {
    let phase = time.phase
    let impulse = time.impulse
    let next = {}
    if (impulse === 4) {
        phase += 1
        impulse = 1
    } else {
        impulse += 1
    }
    next.impulse = _.toNumber(impulse)
    next.phase = _.toNumber(phase)
    return next
}

/**
 * Returns a time object one impulse in the past
 *
 * @param {object} time - A phase and impulse object 
 * @return {object} - A time object decremented one impulse
 */
export function previousImpulse(time) {
    let phase = time.phase
    let impulse = time.impulse
    let next = {}
    if (impulse === 1) {
        phase -= 1
        impulse = 4
    } else {
        impulse -= 1
    }
    if (phase < 1) {phase = 1; impulse = 1}
    next.impulse = _.toNumber(impulse)
    next.phase = _.toNumber(phase)
    return next
}

/**
 * Returns a time some amount of phases in the future
 *
 * @param {number} phases - A number of phases
 * @param {object} time - A game time object 
 * @return {object} - The future time object
 */
export function phasesToTime(phases, time) {
    let futurePhase = _.toNumber(time.phase) + _.toNumber(phases)
    let impulse = _.toNumber(time.impulse)
    let next = {"phase": futurePhase, "impulse": impulse}
    return next
}

/**
 * Converts time to phases
 *
 * @param {string} time - A length of time in the Incapacitation Table format 
 * @return {number} - The total number of phases
 */
export function incapacitationTimeToPhases(time) {
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

    return _.toNumber(phases)
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
    range = snapToValue(range, [10,20,40,70,100,200,300,400,600,800,1000,1200,1500])
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
    _.forEach(list, item => {
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
    _.forEach(list, item => {
        alm += tableLookup(visibilityModifiers_4C, 'Visibility', 'ALM', item)
    })

    return alm
}

/**
 * Returns the Target Size Modifier based on target's size, either position or actual size
 *
 * @param {array} list - A list of string labels of the standard target sizes
 * @param {string} shotType - Either 'Single Shot' or 'Burst'
 * @param {number} targetSize - Optional target size if there are no viable options from the list
 * @return {number} - The ALM to add in to EAL calculation
 */
export function targetSizeALM(list, shotType, targetSize) {
    let alm = 0
    if (shotType === 'Single Shot') {shotType = 'Target Size'}
    if (shotType === 'Burst') {shotType = 'Auto Elev'}
    if (shotType === 'Shotgun') {shotType = 'Target Size'}
    if (shotType === 'Explosive') {shotType = 'Target Size'}

    if (targetSize !== undefined) {
        targetSize = _.clamp(targetSize, 0.1, 39)
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
 * @return {number} - The knockout value
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
    encumbrance = snapToValue(encumbrance, [10,15,20,25,30,35,40,45,50,55,60,70,80,90,100,125,150,200])
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
    encumbrance = Math.ceil(encumbrance / 5) * 5
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
    encumbrance = snapToValue(encumbrance, [10,15,20,25,30,35,40,45,50,55,60,70,80,90,100,125,150,200])
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
 * Returns the closest number in a list of numbers
 *
 * @param {number} target - The number to change
 * @param {array} array - A list of numbers with arbitrary space between
 * @return {number} - The closest number from NumberList
 */
export function snapToValue(target, array) {
    let tuples = _.map(array, val => {
        return [val, Math.abs(val - target)]
    })

    return _.reduce(tuples, (memo, val) => {
        return (memo[1] < val[1]) ? memo : val
    }, [-1, 9999999])[0]
}

/**
 * Returns the EAL given all modifiers
 *
 * @param {object} mods - The collection of mods
 * @return {number} - The effective accuracy level
 */
export function effectiveAccuracyLevel(mods) {
    let sab = 0 - mods.sab
    let shotgunMod, targetDiameter
    if (mods.targetDiameter > 0) {targetDiameter = mods.targetDiameter}
    let aimTimeMod = shotAccuracyALM(mods.weaponAimMod, mods.sal)    
    let movingMod = movingALM(mods.targetSpeed, mods.shooterSpeed, mods.range)
    let rangeMod = rangeALM(mods.range)
    let situationMod = situationALM(mods.situational)
    let visibilityMod = visibilityALM(mods.visibility)
    let targetSizeMod = targetSizeALM(mods.targetSize, mods.shotType, targetDiameter)
    if (mods.salm > targetSizeMod) {
        shotgunMod = mods.salm
    } else {
        shotgunMod = targetSizeMod
    }
    let alm = aimTimeMod + movingMod + rangeMod + situationMod + visibilityMod + sab + shotgunMod
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
    if (shotType === 'Shotgun' || shotType === 'Explosive') {shotType = 'Single Shot'}
    let chance = tableLookup(oddsOfHitting_4G, 'EAL', shotType, eal)
    return chance
}

/**
 * Returns the minimum EAL required to succeed given a rolled to-hit
 *
 * @param {number} roll - The to-hit roll generated externally
 * @param {string} shotType - Either Single Shot or Burst Elevation
 * @return {number} - The minimum effective accuracy level
 */
export function ealToHit(roll, shotType) {
    let eal
    for (let i = -11; i <= 28; i++) {
        let chance = oddsOfHitting(i, shotType)
        if (roll <= chance) {
            eal = i
            break
        }
    }
    return eal
}

/**
 * Returns the number of hexes away on a missed shot
 *
 * @param {number} actualEAL - The generated EAL
 * @param {number} requiredEAL - The minimum EAL required to hit
 * @return {number} - The number of hexes away the shot hits
 */
export function shotScatter(actualEAL, requiredEAL) {
    let diff = requiredEAL - actualEAL
    diff = _.clamp(diff, 1, 28)
    let scatter = tableLookup(shotScatter_5C, 'Difference in SA', 'Scatter (hexes)', diff)
    return scatter
}

/**
 * Returns the placement of a missed shot
 *
 * @param {number} roll - A random roll of 0-9 generated externally
 * @param {number} scatter - The number of hexes away the missed shot hit
 * @return {string} - The description of the shot placement
 */
export function missedShotPlacement(roll, scatter) {
    let place
    let direction = ['N','NE','SE','S','SW','NW']
    let dirRoll = _.random(0,5)
    if (_.inRange(roll, 0, 5) === true) { place = 'short'}
    if (_.inRange(roll, 5, 10) === true) { place = 'long'}
    if (scatter === 1) { place = direction[dirRoll]}
    return place
}

/**
 * Returns the targets hit in burst fire
 *
 * @param {number} arc - The arc of fire chosen by user
 * @param {number} rof - The rate of fire listed on the weapon
 * @param {number} targets - The number of targets as chosen by user
 * @return {object} - The targets object with booleans for hit success plus bullets
 */
export function burstFire(arc, rof, targets) {
    let result = {}
    let bullets = rof
    let chance = tableLookup(automaticFireAndShrapnel_5A, 'Arc of Fire', _.toString(rof), arc)
    let multipleHit = multipleHitCheck(arc, rof, chance)
    for (let i = 1; i <= targets; i++) {
        let roll = _.random(0,99)
        if (bullets > 0) {            
            if (multipleHit === true) {
                if (bullets < chance) {
                    result[`target ${i}`] = {"hit": true, "bullets": bullets, "chance": chance}
                    bullets = 0
                } else {
                    result[`target ${i}`] = {"hit": true, "bullets": chance, "chance": chance}
                    bullets = bullets - chance
                }                                                    
            } else if (multipleHit === false) {
                if (roll <= chance) {
                    result[`target ${i}`] = {"hit": true, "bullets": 1, "chance": chance}
                } else {
                    result[`target ${i}`] = {"hit": false, "bullets": 0, "chance": chance}
                }                
                bullets = bullets - 1
            }
        } else if (bullets <= 0) {
            result[`target ${i}`] = {"hit": false, "bullets": 0, "chance": chance}
        }
    }
    return result
}

/**
 * Returns the hit success for single shot
 *
 * @param {number} chance - The percent chance of hitting
 * @return {boolean} - Whether it hit or not
 */
export function singleShotFire(chance) {
    let result = {}
    let roll = _.random(0,99)
    result[`target 1`] = {"hit": false, "bullets": 0, "chance": chance}
    if (roll <= chance) {
        result[`target 1`] = {"hit": true, "bullets": 1, "chance": chance}
    }
    return result
}

/**
 * Returns the targets hit in shotgun fire
 * @param {string} ammoType - Either APS or Shot
 * @param {number} bphc - The Burst Pellet Hit Chance of the weapon ammo at range
 * @return {object} - The targets object with booleans for hit success plus bullets (pellets)
 */
export function shotgunFire(ammoType, bphc) {
    if (bphc === undefined) {bphc = "-1"}
    let result = {}
    let roll = _.random(0,99)
    let bphcRoll

    if (bphc.includes('*')) {
        let bullets = _.toNumber(_.trim(bphc, '*'))
        result[`target 1`] = {"hit": true, "bullets": bullets, "chance": bphc}
    } else {
        bphcRoll = _.toNumber(bphc)
    }

    if (roll <= bphcRoll) {
        result[`target 1`] = {"hit": true, "bullets": 1, "chance": bphc}
    }

    if (roll > bphcRoll) {
        result[`target 1`] = {"hit": false, "bullets": 0, "chance": bphc}
    }

    if (ammoType !== 'Shot') {
        result[`target 1`] = {"hit": true, "bullets": 1, "chance": 99}
    }

    return result
}

/**
 * Returns the targets hit in explosive fire
 * @param {object} weapon - The weapon object with bshc as a string with optional asterisk
 * @param {string} ammoType - The type of ammo used
 * @return {object} - The targets object with booleans for hit success plus bullets (shrapnel)
 */
export function explosiveFire(weapon, ammoType) {
    let result = {}
    let range = [0,1,2,3,5,10]

    _.forEach(range, val => {
        let radius = _.toString(val)
        let roll = _.random(0,99)
        let bshcRoll
        let bshc = weapon[radius][ammoType]['BSHC']

        if (bshc.includes("*")) {
            let bullets = _.toNumber(_.trim(bshc, '*'))
            result[radius] = {"hit": true, "bullets": bullets, "chance": bshc}
        } else {
            bshcRoll = _.toNumber(bshc)
        }

        if (roll <= bshcRoll) {
            result[radius] = {"hit": true, "bullets": 1, "chance": bshc}
        }
        
        if (roll > bshcRoll) {
            result[radius] = {"hit": false, "bullets": 0, "chance": bshc}
        }
    })

    return result
}

/**
 * Returns the blast modifier for vaious conditions
 * @param {string} mod - The condition description
 * @return {number} - The mod to multipy damage by
 */
export function blastModifier(mod) {
    let bm = tableLookup(blastModifiers_5B, 'Target', 'BM', mod)
    return bm
}

/**
 * Returns the asterisks numbers in auto chance
 * @param {number} arc - The chosen arc of fire
 * @param {number} rof - The weapon's rate of fire
 * @param {number} chance - The percent chance of hitting
 * @return {boolean} - Whether it is a multiple hit
 */
export function multipleHitCheck(arc, rof, chance) {
    let star = false
    if (arc < 0.5) {star = true}
    if (arc <= 3 && chance < 10) {star = true}
    if (arc <= 17 && rof === 144) {star = true}
    if (arc <= 8 && rof === 72) {star = true}
    if (arc <= 6 && rof === 54) {star = true}
    if (arc === 4 && chance === 1) {star = true}
    if (arc === 0.4 && chance === 89) {star = false}
    return star
}

/**
 * Returns the DC for a weapon firing specific ammo at range
 * @param {object} weapon - The database weapon
 * @param {number} rangeVal - The range in hexes
 * @param {string} ammo - One of three ammo types
 * @return {number} - The correct damage class
 */
export function damageClass(weapon, rangeVal, ammo) {
    let range
    range = snapToValue(rangeVal, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])
    if (weapon.Type === 'Shotgun') {range = snapToValue(rangeVal, [1,2,4,6,8,10,15,20,30,40,80])}
    if (weapon.Type === 'Explosive') {range = snapToValue(rangeVal, [40,100,200,400])}
    range = _.clamp(range, 0, 400)
    let dc = weapon[_.toString(range)][ammo]['DC']
    return dc
}

/**
 * Returns the PEN for a weapon firing specific ammo at range
 * @param {object} weapon - The database weapon
 * @param {number} rangeVal - The range in hexes
 * @param {string} ammo - One of three ammo types
 * @return {number} - The correct penetration value
 */
export function penetration(weapon, rangeVal, ammo) {
    let range
    range = snapToValue(rangeVal, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])
    if (weapon.Type === 'Shotgun') {range = snapToValue(rangeVal, [1,2,4,6,8,10,15,20,30,40,80])}
    if (weapon.Type === 'Explosive') {range = snapToValue(rangeVal, [40,100,200,400])}
    range = _.clamp(range, 0, 400)
    let pen = weapon[_.toString(range)][ammo]['PEN']
    return pen
}

/**
 * Returns the Effective Penetration Factor value
 * @param {number} roll - A random number generated externally
 * @param {string} armor - The name of the armor or material
 * @return {number} - The correct EPF
 */
export function effectivePenetrationFactor(roll, armor) {
    let pf = tableLookup(coverProtectionFactors_7C, 'Armor', 'PF', armor)
    pf = snapToValue(pf, [0,2,4,6,10,16,20,30,40,50,60,70,80,90,100,120,140,180,200])
    let epf = tableLookup(effectiveArmorProtectionFactor_6D, 'PF', _.toString(roll), pf)
    return epf
}

/**
 * Returns the correct message for which type of reduction, if any
 * @param {number} pen - The penetration value of the weapon
 * @param {number} epf - The effective penetration factor
 * @return {string} - The correct reduction message
 */
export function damageReduction(pen, epf) {
    let result = ''
    let epen = pen - epf

    //no penetration
    if (epen <= 0) {
        result = 'no penetration'
    }

    //low velocity penetration
    if (epen > 0 && epen < epf) {
        result = 'low velocity penetration'
    }

    //default
    if (epen > epf) {
        result = 'high velocity penetration'
    }
    return result
}

/**
 * Returns the correct damage value
 * @param {number} roll - A random number generated externally
 * @param {boolean} cover - If there is cover or not
 * @param {number} dc - The damage class of the weapon ammo
 * @param {number} pen - The penetration of the wapon ammo
 * @param {number} epf - The effective penetration factor
 * @return {number} - The correct damage value
 */
export function hitDamage(roll, cover, dc, pen, epf) {
    let epen = pen - epf
    let firingAt = 'Open'
    if (cover === true) {firingAt = 'Fire'}
    if (cover === false) {firingAt = 'Open'}

    if (damageReduction(pen, epf) === 'low velocity penetration') {
        dc = 1
    }

    if (dc === 1) {epen = snapToValue(epen, [0.5, 1, 1.5, 2, 3, 5, 10])}
    if (dc === 2 || dc === 3) {epen = snapToValue(epen, [1, 1.5, 2, 2.5, 3, 5, 10])}
    if (dc === 4) {epen = snapToValue(epen, [1, 2, 2.5, 3, 5, 10])}
    if (dc >= 5 && dc <= 7) {epen = snapToValue(epen, [1, 2, 3, 5, 10])}
    if (dc >= 8) {epen = snapToValue(epen, [1, 3, 5, 10])}

    let damage = tableLookup(hitLocationDamage_6A[`DC ${dc}`], firingAt, epen, roll)

    if (damageReduction(pen, epf) === 'no penetration') {
        damage = 0
    }
    return damage
}

/**
 * Returns the correct hit location
 * @param {number} roll - A random number generated externally
 * @param {boolean} cover - If there is cover or not
 * @return {string} - The correct location
 */
export function hitLocation(roll, cover) {
    let firingAt = 'Open'
    if (cover === true) {firingAt = 'Fire'}
    if (cover === false) {firingAt = 'Open'}
    let location = tableLookup(hitLocationDamage_6A['DC 1'], firingAt, 'Hit Location', roll)
    return location
}

/**
 * Returns the knocked down or delayed status
 * @param {number} roll - A random 0-99 number generated externally
 * @param {boolean} cover - If there is cover or not
 * @param {weapon} weapon - The gun firing at the target
 * @return {string} - The knocked down message
 */
export function knockdown(roll, cover, weapon) {
    let area = 'Body'
    let kd = weapon['KD']
    let location = hitLocation(roll, cover)
    let msg = ''
    let head = ["Head", "head", "Eye", "Mouth", "Neck"]
    //let body = ["Lung", "Liver", "Stomach", "Spine", "Pelvis", "Heart", "Torso", "Intestines"]
    let arm = ["arm", "Arm", "Hand", "Elbow", "Shoulder"]
    let leg = ["Leg", "Shin", "Ankle", "Thigh"]
    _.forEach(head, h => {
        if (location.includes(h)) {area = 'Head'}
    })
    _.forEach(arm, a => {
        if (location.includes(a)) {area = 'Arm'}
    })
    _.forEach(leg, l => {
        if (location.includes(l)) {area = 'Leg'}
    })
    if (area == 'Head' && kd >= 10) {msg = "Knocked down. "}
    if (area == 'Body' && kd >= 19) {msg = "Knocked down. "}
    if (area == 'Arm' && kd >= 16) {msg = "Knocked down. "}
    if (area == 'Leg' && kd >= 6) {msg = "Knocked down. "}

    return msg
}

/**
 * Returns the recovery chance and time
 * @param {number} damage - The total damage
 * @param {string} aid - The type of aid chosen
 * @return {string} - The recovery message
 */
export function medicalAid(damage, aid) {
    let result = ''
    let rr
    let damageTotal = _.toNumber(_.clamp(damage, 0, 10000000))
    let aidType = aid + ' - CTP'
    let aidRoll = aid + ' - RR'
    let time = tableLookup(medicalAidRecovery_8A, 'Damage Total', aidType, damageTotal)
    if (aid === 'Trauma Center') {
        rr = tableLookup(medicalAidRecovery_8A, 'Damage Total', 'Trauma Center - 14', damageTotal)
    } else {
        rr = tableLookup(medicalAidRecovery_8A, 'Damage Total', aidRoll, damageTotal)
    }    
    let healing = tableLookup(medicalAidRecovery_8A, 'Damage Total', 'Healing Time', damageTotal)
    result = `${rr}% survival chance in ${time}. Healed in ${healing}.`
    if (damage === 0) {
        result = 'No recovery needed.'
    }
    return result
}

/**
 * Returns the incapacitation effect
 * @param {number} pd - Physical damage
 * @param {number} kv - Knockout value
 * @param {number} roll - random number between 0-99 generated externally
 * @return {object} - The incapacitation effect and time
 */
export function incapacitationEffect(pd, kv, roll) {
    let effect = ''
    let timeRollMod = 0
    if (pd > (kv / 10)) {
        if (_.inRange(roll, 0, 1)) {effect = "Knocked Out"}
        if (_.inRange(roll, 1, 3)) {effect = "Stunned"}
        if (_.inRange(roll, 3, 6)) {effect = "Dazed"}
        if (_.inRange(roll, 6, 10)) {effect = "Disoriented"}
    }
    if (pd > kv) {
        if (_.inRange(roll, 0, 3)) {effect = "Knocked Out"}
        if (_.inRange(roll, 3, 9)) {effect = "Stunned"}
        if (_.inRange(roll, 9, 17)) {effect = "Dazed"}
        if (_.inRange(roll, 17, 25)) {effect = "Disoriented"}
    }
    if (pd > (kv * 2)) {
        if (_.inRange(roll, 0, 14)) {effect = "Knocked Out"}
        if (_.inRange(roll, 14, 32)) {effect = "Stunned"}
        if (_.inRange(roll, 32, 53)) {effect = "Dazed"}
        if (_.inRange(roll, 53, 75)) {effect = "Disoriented"}
    }
    if (pd > (kv * 3)) {
        if (_.inRange(roll, 0, 26)) {effect = "Knocked Out"}
        if (_.inRange(roll, 27, 54)) {effect = "Stunned"}
        if (_.inRange(roll, 54, 83)) {effect = "Dazed"}
        if (_.inRange(roll, 83, 98)) {effect = "Disoriented"}
    }
    if (pd > 200) {
        if (_.inRange(roll, 0, 61)) {effect = "Knocked Out"}
        if (_.inRange(roll, 61, 95)) {effect = "Stunned"}
        if (_.inRange(roll, 95, 97)) {effect = "Dazed"}
        if (_.inRange(roll, 97, 98)) {effect = "Disoriented"}
    }

    if (effect === "Dazed") {timeRollMod = -1}
    if (effect === "Disoriented") {timeRollMod = -2}
    return {"effect": effect, "timeRollMod": timeRollMod}
}

/**
 * Returns the incapacitation chance
 * @param {number} pd - Physical damage
 * @param {number} kv - Knockout value
 * @return {number} - The incapacitation percent chance
 */
export function incapacitationChance(pd, kv) {
    let chance = 0
    if (pd > (kv / 10)) {chance = 10}
    if (pd > kv) {chance = 25}
    if (pd > (kv * 2)) {chance = 75}
    if (pd > (kv * 3)) {chance = 98}
    return chance
}

/**
 * Returns the incapacitation time
 * @param {number} roll - Random number between 0-9 generated externally
 * @param {number} pd - Physical damage
 * @return {string} - The incapacitation time
 */
export function incapacitationTime(roll, pd) {
    let time = tableLookup(incapacitationTime_8B, 'PD Total', _.toString(roll), pd)
    return time
}

/**
 * Returns the damage total
 * @param {number} pd - Physical damage
 * @param {number} health - The character health attribute
 * @return {number} - The damage total
 */
export function damageTotal(pd, health) {
    let dt = (pd * 10) / health
    return _.round(dt)
}

/**
 * Returns the ammo types for a gun
 * @param {string} weaponName - Name of the weapon
 * @return {array} - The array of ammo types
 */
export function getAmmoTypes(weaponName) {
    let weapon = weapons[weaponName]
    let ammo = _.keys(weapon['10'])
    if (weapon.Type === 'Shotgun' || weapon.Type === 'Explosive') {
        ammo = _.take(ammo, 2)
    } else {
        ammo = _.take(ammo, 3)
    }
    return ammo
}

/**
 * Returns a weapon by its name
 * @param {string} weaponName - The wapon's name
 * @return {object} - The weapon object
 */
export function getWeaponByName(weaponName) {
    let weapon = weapons[weaponName]
    return weapon

}

/**
 * 
 * @return {object} - The entire weapons object 
 */

 export function getAllWeapons() {
     return weapons
 }

 /**
 * 
 * @return {object} - All tables 
 */

export function getAllTables() {
    return tables
}

/**
 * Returns the hit location spacing for a shotgun hit
 * @param {number} salm - The shotgun alm
 * @return {number} - The spacing to add or subtract from hit location
 */
export function shotgunMultipleHit(salm) {
    let hls = 7.568175 + 1.125479 * salm + 0.1049714 * Math.pow(salm, 2) + 0.00483802 * Math.pow(salm, 3)
    return _.round(hls)
}