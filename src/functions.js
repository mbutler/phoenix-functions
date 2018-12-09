import _ from 'lodash'

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

