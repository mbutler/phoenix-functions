import { expect } from 'chai'
import _ from 'lodash'
import { nextImpulse, previousImpulse, calculateActionTime, tableLookup, incapacitationTimeToPhases, rangeALM, movingALM, shotAccuracyALM, situationALM, visibilityALM, targetSizeALM, equipmentWeight, combatActionsPerImpulse, skillAccuracyLevel, intelligenceSkillFactor, encumbranceCalculator, knockoutValue, movementSpeed, snapToValue, effectiveAccuracyLevel, oddsOfHitting, burstFire, singleShotFire, multipleHitCheck, damageClass, hitDamage, hitLocation, penetration, effectivePenetrationFactor, damageReduction, medicalAid, incapacitationChance, incapacitationTime, damageTotal, getAmmoTypes, getWeaponByName, shotgunFire, shotgunMultipleHit, phasesToTime } from '../src/functions'
import { maxSpeed_1B, movementModifiers_4D, oddsOfHitting_4G, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, shotScatter_5C, hitLocationDamage_6A, medicalAidRecovery_8A, incapacitationTime_8B, equipment, baseSpeed_1A, skillAccuracy_1C, combatActions_1D, combatActionsPerImpulse_1E, automaticFireAndShrapnel_5A, coverProtectionFactors_7C, effectiveArmorProtectionFactor_6D } from '../src/tables'
import { weapons } from '../src/weapons'

const fourAP = {"1": 1, "2": 1, "3": 1, "4": 1}
const sevenAP = {"1": 2, "2": 1, "3": 2, "4": 2}
const twelveAP = {"1": 5, "2": 4, "3": 3, "4": 0}
const oneAP = {"1": 1, "2": 0, "3": 0, "4": 0}

const mods = {"sal":9,"shotType":"Single Shot","targetSpeed":0,"shooterSpeed":2,"range":9,"aimTime":1,"firingStance":"True","position":"Standing &amp; Braced","situational":[],"visibility":["Good Visibility"],"targetSize":["Fire Over/Around"],"weaponAimMod":-23, "sab": 0, "salm": 0}
const mods2 = {"sal":9,"shotType":"Single Shot","targetSpeed":0,"shooterSpeed":2,"range":9,"aimTime":1,"firingStance":"True","position":"Standing &amp; Braced","situational":[],"visibility":["Dusk"],"targetSize":["Look Over/Around"],"weaponAimMod":-23, "sab": 0, "salm": -4}
const mods3 = {"sal":9,"shotType":"Burst","targetSpeed":0,"shooterSpeed":2,"range":9,"aimTime":1,"firingStance":"True","position":"Standing &amp; Braced","situational":[],"visibility":["Dusk"],"targetSize":["Look Over/Around"],"weaponAimMod":-23, "sab": 0, "salm": -4}
const mods4 = {"sal":9,"shotType":"Burst","targetSpeed":0,"shooterSpeed":2,"range":9,"aimTime":1,"firingStance":"True","position":"Standing &amp; Braced","situational":[],"visibility":["Good Visibility"],"targetSize":["Look Over/Around"],"weaponAimMod":-23,"targetDiameter": 1, "sab": 4, "salm": 0}

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
    it('tests next phase with no remainder actions', () => {
        expect(calculateActionTime(13, fourAP, {"impulse" : 1, "phase" : 1}, 1)).to.eql({"time":{"impulse":1,"phase":4},"remainder":0})
    })
    it('tests nextImpulse function', () => {
        expect(nextImpulse({"phase": 1, "impulse": 1})).to.eql({"phase": 1, "impulse": 2})
        expect(nextImpulse({"phase": 17, "impulse": 4})).to.eql({"phase": 18, "impulse": 1})
    })
    it('tests previousImpulse function', () => {
        expect(previousImpulse({"phase": 2, "impulse": 1})).to.eql({"phase": 1, "impulse": 4})
        expect(previousImpulse({"phase": 17, "impulse": 4})).to.eql({"phase": 17, "impulse": 3})
        expect(previousImpulse({"phase": 1, "impulse": 1})).to.eql({"phase": 1, "impulse": 1})
    })
    it('tests phasesToTime function', () => {
        expect(phasesToTime(1, {"phase": 1, "impulse": 1})).to.eql({"phase": 2, "impulse": 1})
        expect(phasesToTime(4, {"phase": 2, "impulse": 3})).to.eql({"phase": 6, "impulse": 3})
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
    it('tests Movement Modifiers - 4D table', () => {
        expect(tableLookup(movementModifiers_4D, 'Speed HPI', '20', 10)).to.equal(-10)
    })
    it('tests Standard Target Size Modifiers - 4E table', () => {
        expect(tableLookup(standardTargetSizeModifiers_4E, 'Position', 'Target Size', 'Look Over/Around')).to.equal(-4)
    })
    it('tests Odds of Hitting - 4G table', () => {
        expect(tableLookup(oddsOfHitting_4G, 'EAL', 'Single Shot', 13)).to.equal(22)
        expect(() => tableLookup(oddsOfHitting_4G, "EAL", "Single Shot", 29)).to.throw(Error)
    })
    it('tests Target Size Modifiers - 4F table', () => {
        expect(tableLookup(targetSizeModifiers_4F, 'Size', 'ALM', 0.5)).to.equal(-3)
    })

    it('tests Shot Scatter - 5C table', () => {
        expect(tableLookup(shotScatter_5C, 'Difference in SA', 'Scatter (hexes)', 8)).to.equal(2)
    })
    it('tests Hit Location and Damage - 6A table', () => {
        expect(tableLookup(hitLocationDamage_6A['DC 1'], 'Fire', "2", 6)).to.equal(2000)
        expect(tableLookup(hitLocationDamage_6A['DC 10'], 'Open', "3", 3)).to.equal(2000000)
        expect(() => tableLookup(hitLocationDamage_6A['DC 6'], 'Fire', "2.5", 3)).to.throw(Error)
    })
    it('tests Effective Armor Penetration Factor - 6D table', () => {
        expect(tableLookup(effectiveArmorProtectionFactor_6D, 'PF', '2', 2)).to.equal(3)
    })
    it('tests cover protection factors - 7C table', () => {
        expect(tableLookup(coverProtectionFactors_7C, 'Armor', 'PF', 'Heavy Flexible')).to.equal(9)
    })
    it('tests Medical Aid and Recovery - 8A table', () => {
        expect(tableLookup(medicalAidRecovery_8A, 'Damage Total', 'First Aid - CTP', 66)).to.equal('25d')
        expect(() => tableLookup(medicalAidRecovery_8A, 'Damage Total', 'First Aid - CTP', 20000000)).to.throw(Error)
    })
    it('tests Incapacitation Time - 8B table', () => {
        expect(tableLookup(incapacitationTime_8B, 'PD Total', '3', 333)).to.equal('63m')
    })
    it('tests automatic fire and shrapnel - 5A table', () => {
        expect(tableLookup(automaticFireAndShrapnel_5A, 'Arc of Fire', '36', 0.8)).to.equal(6)
        expect(tableLookup(automaticFireAndShrapnel_5A, 'Arc of Fire', '36', 0)).to.equal(28)
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
    it('Franchi SPAS 12', () => {
        expect(weapons['Franchi SPAS 12']['1']['Shot']['PEN']).to.equal(5.3)
        expect(weapons['Franchi SPAS 12']['Aim Time']['5']).to.equal(-6)
    })
    it('tests getting weapon ammo types', () => {
        expect(getAmmoTypes('AKM 47')).to.include.members(['FMJ', 'AP', 'JHP'])
        expect(getAmmoTypes('Franchi SPAS 12')).to.include.members(['APS', 'Shot'])
    })
    it('tests getWeaponByName function', () => {
        expect(getWeaponByName('AKM 47')).to.be.an('object')
    })
    it('tests burstFire function', () => {
        expect(burstFire(20, 8, 7)).to.include.keys('target 7')
        expect(burstFire(6, 18, 10)).to.be.an('object')
        expect(burstFire(0.4, 144, 10)).to.be.an('object')
        expect(burstFire(0.4, 10, 1)).to.eql({ 'target 1': { hit: true, bullets: 3, chance: 3 } })
    })
    it('tests singleShotFire function', () => {
        expect(singleShotFire(20)).to.include.keys('target 1')
        expect(singleShotFire(99)).to.be.an('object')
    })
    it('tests shotgunFire function', () => {
        expect(shotgunFire(11, 'Shot', 2)).to.include.keys('target 1')
        expect(shotgunFire(99, 'APS', 20)).to.be.an('object')
    })
    it('tests shotgunMultipleHit function', () => {
        expect(shotgunMultipleHit(4)).to.equal(14)
    })
})

describe('Incapacitation Time to Phases', () => {
    it('tests hours', () => {
        expect(incapacitationTimeToPhases('1h')).to.equal(1800)
    })
    it('tests minutes', () => {
        expect(incapacitationTimeToPhases('7m')).to.equal(210)
    })
    it('tests days', () => {
        expect(incapacitationTimeToPhases('3d')).to.equal(129600)
    })
    it('tests phases', () => {
        expect(incapacitationTimeToPhases('15p')).to.equal(15)
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
        expect(movingALM(2, 2, '44')).to.equal(-10)
        expect(movingALM(0, 0, '2')).to.equal(0)
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
        expect(targetSizeALM(['Look Over/Around'], 'Single Shot')).to.equal(-4)
        expect(targetSizeALM(['Low Crouch'], 'Burst')).to.equal(11)
        expect(targetSizeALM([], 'Single Shot', 2.8)).to.equal(9)
        expect(targetSizeALM([], 'Single Shot', 1)).to.equal(2)
        expect(targetSizeALM([], 'Single Shot', 0)).to.equal(-15)
    })
})

describe('Calculations', () => {
    it('tests snapToValue function', () => {
        expect(snapToValue(511, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])).to.equal(600)
        expect(snapToValue(0, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])).to.equal(0)
        expect(snapToValue(10, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])).to.equal(10)
        expect(snapToValue(11, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])).to.equal(10)
        expect(snapToValue(1600, [0,10,20,40,70,100,200,300,400,600,800,1000,1200,1500])).to.equal(1500)
    })
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
    it('tests effectiveAccuracyLevel function', () => {
        expect(effectiveAccuracyLevel(mods)).to.equal(-7)
        expect(effectiveAccuracyLevel(mods2)).to.equal(-10)
        expect(effectiveAccuracyLevel(mods3)).to.equal(-10)
        expect(effectiveAccuracyLevel(mods4)).to.equal(-9)
    })
    it('tests oddsOfHitting function', () => {
        expect(oddsOfHitting(-7, 'Single Shot')).to.equal(0)
        expect(oddsOfHitting(16, 'Burst')).to.equal(62)
        expect(oddsOfHitting(30, 'Single Shot')).to.equal(99)
        expect(oddsOfHitting(-45, 'Single Shot')).to.equal(0)
    })
    it('tests the multipleHitCheck function', () => {
        expect(multipleHitCheck(5, 54, 1)).to.equal(true)
        expect(multipleHitCheck(0.4, 3, 89)).to.equal(false)
        expect(multipleHitCheck(2, 7, 33)).to.equal(false)
        expect(multipleHitCheck(9, 4, 12)).to.be.an('boolean')
    })
    it('tests damageClass function', () => {
        expect(damageClass(weapons['Uzi'], 20, 'FMJ')).to.equal(3)
        expect(damageClass(weapons['FN Mk 1'], 70, 'AP')).to.equal(2)
    })
    it('tests penetration function', () => {
        expect(penetration(weapons['Uzi'], 20, 'FMJ')).to.equal(2.3)
        expect(penetration(weapons['Uzi'], 30, 'FMJ')).to.equal(2)
    })
    it('tests hitDamage function', () => {
        expect(hitDamage(3, false, 3, 11, 23)).to.equal(0)
        expect(hitDamage(19, true, 3, 7, 4)).to.equal(3000)
        expect(hitDamage(73, true, 3, 17, 4)).to.equal(81)
    })
    it('tests hitLocation function', () => {
        expect(hitLocation(95, true)).to.equal('Weapon Critical')
        expect(hitLocation(95, false)).to.equal('Ankle - Foot')
    })
    it('tests effectivePenetrationFactor function', () => {
        expect(effectivePenetrationFactor(3, 'Medium Rigid')).to.equal(23)
        expect(effectivePenetrationFactor(3, 'Heavy Flexible')).to.equal(14)
    })
    it('tests damageReduction function', () => {
        expect(damageReduction(11, 23)).to.equal('no penetration')
        expect(damageReduction(7, 4)).to.equal('low velocity penetration')
        expect(damageReduction(17, 4)).to.equal('high velocity penetration')
    })
    it('tests medicalAid function', () => {
        expect(medicalAid(200, 'First Aid')).to.equal('21% survival chance in 23d. Healed in 61d.')
        expect(medicalAid(0, 'First Aid')).to.equal('No recovery needed.')
        expect(medicalAid(1, 'Trauma Center')).to.equal('99% survival chance in 25d. Healed in 17d.')
    })
    it('tests incapacitationChance function', () => {
        expect(incapacitationChance(0, 48)).to.equal(0)
        expect(incapacitationChance(49, 48)).to.equal(25)
        expect(incapacitationChance(145, 48)).to.equal(98)
    })
    it('tests incapacitationTime function', () => {
        expect(incapacitationTime(3, 333)).to.equal('63m')
    })
    it('tests damageTotal function', () => {
        expect(damageTotal(18, 12)).to.equal(15)
    })
})