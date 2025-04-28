import { expect } from 'chai'
import _ from 'lodash'
import { nextImpulse, previousImpulse, calculateActionTime, tableLookup, incapacitationTimeToPhases, rangeALM, movingALM, shotAccuracyALM, situationALM, visibilityALM, targetSizeALM, combatActionsPerImpulse, skillAccuracyLevel, intelligenceSkillFactor, encumbranceCalculator, knockoutValue, movementSpeed, snapToValue, effectiveAccuracyLevel, oddsOfHitting, burstFire, singleShotFire, multipleHitCheck, damageClass, hitDamage, hitLocation, penetration, effectivePenetrationFactor, damageReduction, medicalAid, incapacitationChance, incapacitationTime, damageTotal, getAmmoTypes, getWeaponByName, getAllWeapons, shotgunFire, shotgunMultipleHit, phasesToTime, ealToHit, shotScatter, missedShotPlacement, explosiveFire, blastModifier, getAllTables, incapacitationEffect, knockdown } from '../src/functions'
import { blastModifiers_5B, maxSpeed_1B, movementModifiers_4D, oddsOfHitting_4G, standardTargetSizeModifiers_4E, targetSizeModifiers_4F, shotScatter_5C, hitLocationDamage_6A, medicalAidRecovery_8A, incapacitationTime_8B, equipment, baseSpeed_1A, skillAccuracy_1C, combatActions_1D, combatActionsPerImpulse_1E, automaticFireAndShrapnel_5A, coverProtectionFactors_7C, effectiveArmorProtectionFactor_6D } from '../src/tables'
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
    it('tests Blast Modifiers - 5B table', () => {
        expect(tableLookup(blastModifiers_5B, 'Target', 'BM', 'In Open Trench')).to.equal(3)
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
    it('test all tables export', () => {
        expect(getAllTables()).to.be.an('object')
    })
})

describe('Weapons Test', () => {
    it('FN Mk 1', () => {
        expect(weapons['FN Mk 1']['20']['AP']['PEN']).to.equal(2.7)
        expect(weapons['FN Mk 1']['Aim Time']['4']).to.equal(-9)
        expect(weapons['FN Mk 1']['Name']).to.equal('FN Mk 1')
    })
    it('Type 51', () => {
        expect(weapons['Type 51']['20']['AP']['PEN']).to.equal(3.6)
        expect(weapons['Type 51']['Aim Time']['4']).to.equal(-9)
        expect(weapons['Type 51']['Name']).to.equal('Type 51')
    })
    it('Uzi', () => {
        expect(weapons['Uzi']['20']['AP']['PEN']).to.equal(3.3)
        expect(weapons['Uzi']['Aim Time']['4']).to.equal(-8)
        expect(weapons['Uzi']['Name']).to.equal('Uzi')
    })
    it('AKM 47', () => {
        expect(weapons['AKM 47']['20']['AP']['PEN']).to.equal(15)
        expect(weapons['AKM 47']['Aim Time']['4']).to.equal(-7)
        expect(weapons['AKM 47']['Name']).to.equal('AKM 47')
    })
    it('Franchi SPAS 12', () => {
        expect(weapons['Franchi SPAS 12']['1']['Shot']['PEN']).to.equal(5.3)
        expect(weapons['Franchi SPAS 12']['Aim Time']['5']).to.equal(-6)
        expect(weapons['Franchi SPAS 12']['Name']).to.equal('Franchi SPAS 12')
    })
    it('HK 53', () => {
        expect(weapons['HK 53']['20']['AP']['PEN']).to.equal(14)
        expect(weapons['HK 53']['Aim Time']['4']).to.equal(-7)
        expect(weapons['HK 53']['Name']).to.equal('HK 53')
    })
    it('M60', () => {
        expect(weapons['M60']['20']['AP']['PEN']).to.equal(27)
        expect(weapons['M60']['Aim Time']['4']).to.equal(-10)
        expect(weapons['M60']['Name']).to.equal('M60')
    })
    it('MAB PA15', () => {
        expect(weapons['MAB PA15']['20']['AP']['PEN']).to.equal(2.7)
        expect(weapons['MAB PA15']['Aim Time']['4']).to.equal(-9)
        expect(weapons['MAB PA15']['Name']).to.equal('MAB PA15')
    })
    it('Walther PPK', () => {
        expect(weapons['Walther PPK']['20']['AP']['PEN']).to.equal(1.2)
        expect(weapons['Walther PPK']['Aim Time']['4']).to.equal(-9)
        expect(weapons['Walther PPK']['Name']).to.equal('Walther PPK')
    })
    it('Walther P1', () => {
        expect(weapons['Walther P1']['20']['AP']['PEN']).to.equal(2.5)
        expect(weapons['Walther P1']['Aim Time']['4']).to.equal(-9)
        expect(weapons['Walther P1']['Name']).to.equal('Walther P1')
    })
    it('HK P7M13', () => {
        expect(weapons['HK P7M13']['20']['AP']['PEN']).to.equal(2.5)
        expect(weapons['HK P7M13']['Aim Time']['4']).to.equal(-9)
        expect(weapons['HK P7M13']['Name']).to.equal('HK P7M13')
    })
    it('PA3-DM', () => {
        expect(weapons['PA3-DM']['20']['AP']['PEN']).to.equal(3.3)
        expect(weapons['PA3-DM']['Aim Time']['4']).to.equal(-8)
        expect(weapons['PA3-DM']['Name']).to.equal('PA3-DM')
    })
    it('F1', () => {
        expect(weapons['F1']['20']['AP']['PEN']).to.equal(2.7)
        expect(weapons['F1']['Aim Time']['4']).to.equal(-8)
        expect(weapons['F1']['Name']).to.equal('F1')
    })
    it('Steyr MPi 81', () => {
        expect(weapons['Steyr MPi 81']['20']['AP']['PEN']).to.equal(3.0)
        expect(weapons['Steyr MPi 81']['Aim Time']['4']).to.equal(-7)
        expect(weapons['Steyr MPi 81']['Name']).to.equal('Steyr MPi 81')
    })
    it('M61 Skorpion', () => {
        expect(weapons['M61 Skorpion']['20']['AP']['PEN']).to.equal(1.5)
        expect(weapons['M61 Skorpion']['Aim Time']['4']).to.equal(-7)
        expect(weapons['M61 Skorpion']['Name']).to.equal('M61 Skorpion')
    })
    it('MAT 49', () => {
        expect(weapons['MAT 49']['20']['AP']['PEN']).to.equal(3.1)
        expect(weapons['MAT 49']['Aim Time']['4']).to.equal(-8)
        expect(weapons['MAT 49']['Name']).to.equal('MAT 49')
    })
    it('HK MP5', () => {
        expect(weapons['HK MP5']['20']['AP']['PEN']).to.equal(3.3)
        expect(weapons['HK MP5']['Aim Time']['4']).to.equal(-6)
        expect(weapons['HK MP5']['Name']).to.equal('HK MP5')
    })
    it('L1A1-F1', () => {
        expect(weapons['L1A1-F1']['20']['AP']['PEN']).to.equal(25)
        expect(weapons['L1A1-F1']['Aim Time']['4']).to.equal(-8)
        expect(weapons['L1A1-F1']['Name']).to.equal('L1A1-F1')
    })
    it('Steyr AUG', () => {
        expect(weapons['Steyr AUG']['20']['AP']['PEN']).to.equal(20)
        expect(weapons['Steyr AUG']['Aim Time']['4']).to.equal(-6)
        expect(weapons['Steyr AUG']['Name']).to.equal('Steyr AUG')
    })
    it('FN FAL', () => {
        expect(weapons['FN FAL']['20']['AP']['PEN']).to.equal(26)
        expect(weapons['FN FAL']['Aim Time']['4']).to.equal(-8)
        expect(weapons['FN FAL']['Name']).to.equal('FN FAL')
    })
    it('FN FNC', () => {
        expect(weapons['FN FNC']['20']['AP']['PEN']).to.equal(21)
        expect(weapons['FN FNC']['Aim Time']['4']).to.equal(-7)
        expect(weapons['FN FNC']['Name']).to.equal('FN FNC')
    })
    it('M1949-56', () => {
        expect(weapons['M1949-56']['20']['AP']['PEN']).to.equal(25)
        expect(weapons['M1949-56']['Aim Time']['4']).to.equal(-7)
        expect(weapons['M1949-56']['Name']).to.equal('M1949-56')
    })
    it('FA MAS', () => {
        expect(weapons['FA MAS']['20']['AP']['PEN']).to.equal(21)
        expect(weapons['FA MAS']['Aim Time']['4']).to.equal(-7)
        expect(weapons['FA MAS']['Name']).to.equal('FA MAS')
    })
    it('Steyr LSW', () => {
        expect(weapons['Steyr LSW']['20']['AP']['PEN']).to.equal(22)
        expect(weapons['Steyr LSW']['Aim Time']['4']).to.equal(-6)
        expect(weapons['Steyr LSW']['Name']).to.equal('Steyr LSW')
    })
    it('FN MAG', () => {
        expect(weapons['FN MAG']['20']['AP']['PEN']).to.equal(26)
        expect(weapons['FN MAG']['Aim Time']['4']).to.equal(-9)
        expect(weapons['FN MAG']['Name']).to.equal('FN MAG')
    })
    it('Type 67', () => {
        expect(weapons['Type 67']['20']['AP']['PEN']).to.equal(32)
        expect(weapons['Type 67']['Aim Time']['4']).to.equal(-9)
        expect(weapons['Type 67']['Name']).to.equal('Type 67')
    })
    it('AA 762', () => {
        expect(weapons['AA 762']['20']['AP']['PEN']).to.equal(26)
        expect(weapons['AA 762']['Aim Time']['4']).to.equal(-9)
        expect(weapons['AA 762']['Name']).to.equal('AA 762')
    })
    it('HK 13E', () => {
        expect(weapons['HK 13E']['20']['AP']['PEN']).to.equal(23)
        expect(weapons['HK 13E']['Aim Time']['4']).to.equal(-8)
        expect(weapons['HK 13E']['Name']).to.equal('HK 13E')
    })
    it('HK 11E', () => {
        expect(weapons['HK 11E']['20']['AP']['PEN']).to.equal(24)
        expect(weapons['HK 11E']['Aim Time']['4']).to.equal(-9)
        expect(weapons['HK 11E']['Name']).to.equal('HK 11E')
    })
    it('Dragunov SVD', () => {
        expect(weapons['Dragunov SVD']['20']['AP']['PEN']).to.equal(31)
        expect(weapons['Dragunov SVD']['Aim Time']['4']).to.equal(-5)
        expect(weapons['Dragunov SVD']['Name']).to.equal('Dragunov SVD')
    })
    it('M1911A1', () => {
        expect(weapons['M1911A1']['20']['AP']['PEN']).to.equal(2.1)
        expect(weapons['M1911A1']['Aim Time']['4']).to.equal(-9)
        expect(weapons['M1911A1']['Name']).to.equal('M1911A1')
    })
    it('AKR', () => {
        expect(weapons['AKR']['20']['AP']['PEN']).to.equal(15)
        expect(weapons['AKR']['Aim Time']['4']).to.equal(-7)
        expect(weapons['AKR']['Name']).to.equal('AKR')
    })
    it('Walther 2000', () => {
        expect(weapons['Walther 2000']['20']['AP']['PEN']).to.equal(38)
        expect(weapons['Walther 2000']['Aim Time']['4']).to.equal(-6)
        expect(weapons['Walther 2000']['Name']).to.equal('Walther 2000')
    })
    it('Beretta SC 70', () => {
        expect(weapons['Beretta SC 70']['20']['AP']['PEN']).to.equal(20)
        expect(weapons['Beretta SC 70']['Aim Time']['4']).to.equal(-7)
        expect(weapons['Beretta SC 70']['Name']).to.equal('Beretta SC 70')
    })
    it('Bren L4', () => {
        expect(weapons['Bren L4']['20']['AP']['PEN']).to.equal(25)
        expect(weapons['Bren L4']['Aim Time']['4']).to.equal(-9)
        expect(weapons['Bren L4']['Name']).to.equal('Bren L4')
    })
    it('Spectre', () => {
        expect(weapons['Spectre']['20']['AP']['PEN']).to.equal(3.3)
        expect(weapons['Spectre']['Aim Time']['4']).to.equal(-5)
        expect(weapons['Spectre']['Name']).to.equal('Spectre')
    })
    it('LAW 80', () => {
        expect(weapons['LAW 80']['1']['HEAT']['PEN']).to.equal(8.2)
        expect(weapons['LAW 80']['Aim Time']['4']).to.equal(-9)
        expect(weapons['LAW 80']['Name']).to.equal('LAW 80')
    })
    it('M1 Garand', () => {
        expect(weapons['M1 Garand']['20']['AP']['PEN']).to.equal(30)
        expect(weapons['M1 Garand']['Aim Time']['4']).to.equal(-8)
        expect(weapons['M1 Garand']['Name']).to.equal('M1 Garand')
    })
    it('M9A1 Bazooka', () => {
        expect(weapons['M9A1 Bazooka']['1']['HC']['PEN']).to.equal(1.5)
        expect(weapons['M9A1 Bazooka']['Aim Time']['4']).to.equal(-8)
        expect(weapons['M9A1 Bazooka']['Name']).to.equal('M9A1 Bazooka')
    })
    it('M1919 A6', () => {
        expect(weapons['M1919 A6']['10']['FMJ']['PEN']).to.equal(22)
        expect(weapons['M1919 A6']['Aim Time']['4']).to.equal(-12)
        expect(weapons['M1919 A6']['Name']).to.equal('M1919 A6')
    })
    it('Remington M700 308 Winchester', () => {
        expect(weapons['Remington M700']['10']['FMJ']['PEN']).to.equal(20)
        expect(weapons['Remington M700']['Aim Time']['4']).to.equal(-5)
        expect(weapons['Remington M700']['Name']).to.equal('Remington M700')
    })
    it('AR-15', () => {
        expect(weapons['AR-15']['10']['FMJ']['PEN']).to.equal(17)
        expect(weapons['AR-15']['Aim Time']['4']).to.equal(-7)
        expect(weapons['AR-15']['Name']).to.equal('AR-15')
    })
    it('M26A2', () => {
        expect(weapons['M26A2']['1']['HE']['PEN']).to.equal(2.4)
        expect(weapons['M26A2']['Aim Time']['4']).to.equal(-12)
        expect(weapons['M26A2']['1']['HE']['BSHC']).to.equal("*4")
        expect(weapons['M26A2']['Name']).to.equal('M26A2')
    })
    it('M29A1', () => {
        expect(weapons['M29A1']['1']['HE']['PEN']).to.equal(8.9)
        expect(weapons['M29A1']['Aim Time']['4']).to.equal(-7)
        expect(weapons['M29A1']['1']['HE']['BSHC']).to.equal("*2")
        expect(weapons['M29A1']['Name']).to.equal('M29A1')
    })
    it('Remington M870', () => {
        expect(weapons['Remington M870']['1']['Shot']['PEN']).to.equal(5.4)
        expect(weapons['Remington M870']['Aim Time']['5']).to.equal(-6)
        expect(weapons['Remington M870']['Name']).to.equal('Remington M870')
    })
    it('M249', () => {
        expect(weapons['M249']['10']['FMJ']['PEN']).to.equal(15)
        expect(weapons['M249']['Aim Time']['5']).to.equal(-7)
        expect(weapons['M249']['Name']).to.equal('M249')
    })
    it('Colt Revolving Rifle', () => {
        expect(weapons['Colt Revolving Rifle']['10']['FMJ']['PEN']).to.equal(2.6)
        expect(weapons['Colt Revolving Rifle']['Aim Time']['4']).to.equal(-7)
        expect(weapons['Colt Revolving Rifle']['Name']).to.equal('Colt Revolving Rifle')
    })
    it('Colt Model 1851 Navy', () => {
        expect(weapons['Colt Model 1851 Navy']['20']['FMJ']['PEN']).to.equal(1)
        expect(weapons['Colt Model 1851 Navy']['Aim Time']['4']).to.equal(-9)
        expect(weapons['Colt Model 1851 Navy']['Name']).to.equal('Colt Model 1851 Navy')
    })
    it('M2HB', () => {
        expect(weapons['M2HB']['10']['FMJ']['PEN']).to.equal(40)
        expect(weapons['M2HB']['Aim Time']['4']).to.equal(-17)
        expect(weapons['M2HB']['Name']).to.equal('M2HB')
    })
    it('Thompson M1928A1', () => {
        expect(weapons['Thompson M1928A1']['10']['FMJ']['PEN']).to.equal(1.7)
        expect(weapons['Thompson M1928A1']['Aim Time']['4']).to.equal(-8)
        expect(weapons['Thompson M1928A1']['Name']).to.equal('Thompson M1928A1')
    })
    it('Bren Mk1', () => {
        expect(weapons['Bren Mk1']['10']['FMJ']['PEN']).to.equal(18)
        expect(weapons['Bren Mk1']['Aim Time']['4']).to.equal(-9)
        expect(weapons['Bren Mk1']['Name']).to.equal('Bren Mk1')
    })    
    it('tests getting weapon ammo types', () => {
        expect(getAmmoTypes('AKM 47')).to.include.members(['FMJ', 'AP', 'JHP'])
        expect(getAmmoTypes('Franchi SPAS 12')).to.include.members(['APS', 'Shot'])
    })
    it('tests getWeaponByName function', () => {
        expect(getWeaponByName('AKM 47')).to.be.an('object')
    })
    it('tests getting all weapons', () => {
        expect(getAllWeapons()).to.be.an('object')
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
        expect(shotgunFire('Shot', "*7")).to.include.keys('target 1')
        expect(shotgunFire('APS', undefined)['target 1']['bullets']).to.equal(1)
    })
    it('tests explosiveFire function', () => {
        expect(explosiveFire(weapons['M79'], 'HEAT')).to.be.an('object')
        expect(explosiveFire(weapons['M79'], 'HEAT')['0']['bullets']).to.equal(2)
        expect(explosiveFire(weapons['M26A2'], 'HE')).to.be.an('object')
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
        expect(movingALM(0, 0, '1400')).to.equal(0)
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
        expect(movementSpeed(12, 12, 220)).to.equal(1)
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
        expect(combatActionsPerImpulse(10, 10, 10, 3, 65)).to.eql({"1": 1, "2": 0, "3": 1, "4": 0})
        expect(combatActionsPerImpulse(3, 3, 3, 3, 0)).to.eql({"1": 1, "2": 0, "3": 1, "4": 0})
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
    it('tests incapacitationEffect function', () => {
        expect(incapacitationEffect(10, 9, 6)).to.eql({"effect": "Stunned", "timeRollMod": 0})
        expect(incapacitationEffect(201, 9, 95)).to.eql({"effect": "Dazed", "timeRollMod": -1})
        expect(incapacitationEffect(1, 10, 11)).to.eql({"effect": "", "timeRollMod": 0})
    })
    it('tests damageTotal function', () => {
        expect(damageTotal(18, 12)).to.equal(15)
    })
    it('tests ealToHit function', () => {
        expect(ealToHit(82, 'Single Shot')).to.equal(23)
        expect(ealToHit(67, 'Burst')).to.equal(17)
        expect(ealToHit(99, 'Single Shot')).to.equal(28)
    })
    it('tests shotScatter function', () => {
        expect(shotScatter(14, 23)).to.equal(2)
        expect(shotScatter(1, 23)).to.equal(10)
    })
    it('tests missedShotPlacement function', () => {
        expect(missedShotPlacement(3, 2)).to.equal('short')
        expect(missedShotPlacement(9, 4)).to.equal('long')
        expect(missedShotPlacement(3, 1)).to.be.oneOf(['N','NE','SE','S','SW','NW'])
    })
    it('tests blastModifier function', () => {
        expect(blastModifier('In Power Armor')).to.equal(0.01)
    })
    it('tests knocked down', () => {
        expect(knockdown(54, false, weapons['Uzi'])).to.equal('')
        expect(knockdown(54, false, weapons['Franchi SPAS 12'])).to.equal('Knocked down. ')
        expect(knockdown(23, true, weapons['M1949-56'])).to.equal('')
        expect(knockdown(63, false, weapons['M1949-56'])).to.equal('Knocked down. ')
    })
})