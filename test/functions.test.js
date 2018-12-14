import { expect } from 'chai'
import _ from 'lodash'
import { calculateActionTime, tableLookup, timeToPhases, rangeALM, movingALM, shotAccuracyALM, situationALM, visibilityALM, targetSizeALM, equipmentWeight, combatActionsPerImpulse, skillAccuracyLevel, intelligenceSkillFactor, encumbranceCalculator, knockoutValue, movementSpeed } from '../src/functions'
import { maxSpeed_1B, oddsOfHitting_4G, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, shotScatter_5C, hitLocationDamage_6A, medicalAidRecovery_8A, incapacitationTime_8B, equipment, baseSpeed_1A, skillAccuracy_1C, combatActions_1D, combatActionsPerImpulse_1E } from '../src/tables'
import { weapons } from '../src/weapons'

let fourAP = {"1": 1, "2": 1, "3": 1, "4": 1}
let sevenAP = {"1": 2, "2": 1, "3": 2, "4": 2}
let twelveAP = {"1": 5, "2": 4, "3": 3, "4": 0}
let oneAP = {"1": 1, "2": 0, "3": 0, "4": 0}
let time = {"impulse" : 1, "phase" : 1}

describe('Calculate Action Time', () => {
    it('tests next phase with no remainder actions', () => {
        expect(calculateActionTime(5, fourAP, {"impulse" : 1, "phase" : 1}, 1)).to.eql({"time":{"impulse":1,"phase":2},"remainder":0})
    })
    it('tests next phase with remainder actions', () => {
        expect(calculateActionTime(11, sevenAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":3,"phase":2},"remainder":1})
    })
    it('tests same phase with remainder actions', () => {
        expect(calculateActionTime(4, sevenAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":3,"phase":1},"remainder":1})
    })
    it('tests same phase with no remainder actions', () => {
        expect(calculateActionTime(1, fourAP, {"impulse" : 1, "phase" : 1}, 1)).to.eql({"time":{"impulse":1,"phase":1},"remainder":0})
    })
    it('tests future phase with no remainder actions', () => {
        expect(calculateActionTime(16, sevenAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":1,"phase":3},"remainder":0})
    })
    it('tests future phase with remainder actions', () => {
        expect(calculateActionTime(18, sevenAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":3,"phase":3},"remainder":1})
    })
    it('tests first impulse with fewer ap used than actions available', () => {
        expect(calculateActionTime(4, twelveAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":1,"phase":1},"remainder":1})
    })
    it('tests if only 1 action per phase', () => {
        expect(calculateActionTime(3, oneAP, {"impulse" : 1, "phase" : 1}, 0)).to.eql({"time":{"impulse":1,"phase":3},"remainder":0})
    }) 
    it('tests if 0 action points are spent', () => {
        expect(calculateActionTime(0, sevenAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":1,"phase":1},"remainder":2})
    })    
})

describe('Table Lookup', () => {
    it('tests Equipment table', () => {
        expect(tableLookup(equipment, 'Equipment', 'Weight', 'Bayonet')).to.equal(1)
    })
    it('tests Base Speed - 1A table', () => {
        expect(tableLookup(baseSpeed_1A, 'STR', '10', 20)).to.equal(4.5)
    })
    it('tests Maximum Speed - 1B table', () => {
        expect(tableLookup(maxSpeed_1B, 'AGI', '3', 21)).to.equal(9)
    })
    it('tests Skill Accuracy - 1C table', () => {
        expect(tableLookup(skillAccuracy_1C, 'Skill Level', 'SAL', 9)).to.equal(15)
    })
    it('tests Combat Actions - 1D table', () => {
        expect(tableLookup(combatActions_1D, 'MS', '7', 7)).to.equal(3)
    })
    it('tests Combat Actions Per Impulse - 1E table', () => {
        expect(tableLookup(combatActionsPerImpulse_1E, 'Combat Actions', 'Impulse 4', 11)).to.equal(3)
    })
    it('tests Standard Target Size Modifiers - 4E table', () => {
        expect(tableLookup(standardTargetSizeModifiers_4E, 'Position', 'Target Size', 'Look Over/Around')).to.equal(-4)
    })
    it('tests Odds of Hitting - 4G table', () => {
        expect(tableLookup(oddsOfHitting_4G, 'EAL', 'Single Shot', 13)).to.equal(22)
    })
    it('tests Target Size Modifiers - 4F table', () => {
        expect(tableLookup(targetSizeModifiers_4F, 'Size', 'ALM', 0.5)).to.equal(-3)
    })
    it('tests values out of range', () => {
        expect(() => tableLookup(oddsOfHitting_4G, "EAL", "Single Shot", 29)).to.throw(Error)
    })
    it('tests number between range values', () => {
        expect(tableLookup(shotScatter_5C, 'Difference in SA', 'Scatter (hexes)', 8)).to.equal(2)
    })
    it('tests fire on DC 1 of Hit Location and Damage - 6A table', () => {
        expect(tableLookup(hitLocationDamage_6A['DC 1'], 'Fire', "2", 6)).to.equal(2000)
    })
    it('tests open on DC 10 of Hit Location and Damage - 6A table', () => {
        expect(tableLookup(hitLocationDamage_6A['DC 10'], 'Open', "3", 3)).to.equal(2000000)
    })
    it('tests non-value on DC 6 of Hit Location and Damage - 6A table', () => {
        expect(() => tableLookup(hitLocationDamage_6A['DC 6'], 'Fire', "2.5", 3)).to.throw(Error)
    })
    it('tests Medical Aid and Recovery - 8A table', () => {
        expect(tableLookup(medicalAidRecovery_8A, 'Damage Total', 'First Aid - CTP', 66)).to.equal('25d')
    })
    it('tests out-of-range on Medical Aid and Recovery - 8A table', () => {
        expect(() => tableLookup(medicalAidRecovery_8A, 'Damage Total', 'First Aid - CTP', 20000000)).to.throw(Error)
    })
    it('tests Incapacitation Time - 8B table', () => {
        expect(tableLookup(incapacitationTime_8B, 'PD Total', '3', 333)).to.equal('63m')
    })
})

describe('Weapons Test', () => {
    it('FN Mk 1', () => {
        expect(weapons['FN Mk 1']['20']['AP']['PEN']).to.equal(2.7)
        expect(weapons['FN Mk 1']['Aim Time']['4']).to.equal(-9)
    })
    it('Type 51', () => {
        expect(weapons['Type 51']['20']['AP']['PEN']).to.equal(3.6)
        expect(weapons['Type 51']['Aim Time']['4']).to.equal(-9)
    })
    it('Uzi', () => {
        expect(weapons['Uzi']['20']['AP']['PEN']).to.equal(3.3)
        expect(weapons['Uzi']['Aim Time']['4']).to.equal(-8)
    })
    it('AKM 47', () => {
        expect(weapons['AKM 47']['20']['AP']['PEN']).to.equal(15)
        expect(weapons['AKM 47']['Aim Time']['4']).to.equal(-7)
    })
})

describe('Time to Phases', () => {
    it('tests hours', () => {
        expect(timeToPhases('1h')).to.equal(1800)
    })
    it('tests minutes', () => {
        expect(timeToPhases('7m')).to.equal(210)
    })
    it('tests days', () => {
        expect(timeToPhases('3d')).to.equal(129600)
    })
    it('tests phases', () => {
        expect(timeToPhases('15p')).to.equal(15)
    })
})

describe('Accuracy Level Modifiers', () => {
    it('tests the range ALM function', () => {
        expect(rangeALM(10)).to.equal(17)
        expect(rangeALM(1250)).to.equal(-18)
    })
    it('tests the moving ALM', () => {
        expect(movingALM(0.25, 0, '20')).to.equal(-5)
        expect(movingALM(0, 0, '20')).to.equal(0)
        expect(movingALM(10, 0, '100')).to.equal(-8)
        expect(movingALM(0, 2, '40')).to.equal(-6)
        expect(movingALM(2, 2, '40')).to.equal(-10)
    })
    it('tests shot accuracy ALM', () => {
        expect(shotAccuracyALM(-17, 5)).to.equal(-12)
    })
    it('tests firing stance/situation ALM', () => {
        expect(situationALM(['Kneeling & Braced', 'Firing Rifle with One Hand'])).to.equal(-2)
    })
    it('tests visibility ALM', () => {
        expect(visibilityALM(['Night - 1/2 Moon', 'Smoke, Haze, Fog'])).to.equal(-12)
    })
    it('tests target size ALM', () => {
        expect(targetSizeALM(['Look Over/Around'], 'Target Size')).to.equal(-4)
        expect(targetSizeALM(['Low Crouch'], 'Auto Elev')).to.equal(11)
        expect(targetSizeALM([], 'Target Size', 1)).to.equal(2)
    })
})

describe('Calculations', () => {
    it('tests knockoutValue function', () => {
        expect(knockoutValue(10, 3)).to.equal(15)
        expect(knockoutValue(15, 0)).to.equal(8)
    })
    it('tests movementSpeed function', () => {
        expect(movementSpeed(10, 10, 10)).to.equal(3)
        expect(movementSpeed(11, 11, 15)).to.equal(3)
    })
    it('tests encumbranceCalculator function', () => {
        expect(encumbranceCalculator(['Field Radio', 'Holster'], ['Uzi', 'FN Mk 1'])).to.equal(25)
        expect(encumbranceCalculator([], [])).to.equal(10)
    })
    it('tests skillAccuracyLevel function', () => {
        expect(skillAccuracyLevel(3)).to.equal(9)
    })
    it('tests intelligenceSKillFactor function', () => {
        expect(intelligenceSkillFactor(11, 3)).to.equal(19)
        expect(intelligenceSkillFactor(18, 20)).to.equal(39)
        expect(intelligenceSkillFactor(3, 0)).to.equal(7)
    })
    it('tests combatActionsPerImpulse function', () => {
        expect(combatActionsPerImpulse(10, 10, 10, 3, 10)).to.eql({"1": 2, "2": 1, "3": 2, "4": 1})
        expect(() => combatActionsPerImpulse(3, 3, 3, 3, 0)).to.throw(Error)
    })
})