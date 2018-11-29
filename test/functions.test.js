import { expect } from 'chai'
import { calculateActionTime } from '../src/functions'

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
        expect(calculateActionTime(3, oneAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":1,"phase":3},"remainder":0})
    }) 
    it('tests if 0 action points are spent', () => {
        expect(calculateActionTime(0, sevenAP, {"impulse" : 1, "phase" : 1}, 2)).to.eql({"time":{"impulse":1,"phase":1},"remainder":2})
    })    
})