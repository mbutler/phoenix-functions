import { expect } from 'chai'
import { calculateActionTime } from '../src/functions'

let fourAP = {"1": 1, "2": 1, "3": 1, "4": 1}
let sevenAP = {"1": 2, "2": 1, "3": 2, "4": 2}
let time = {"impulse" : 1, "phase" : 1}

describe('Calculate Action Time', () => {
    it('tests next phase with no remaining actions', () => {
        expect(calculateActionTime(5, fourAP, {"impulse" : 1, "phase" : 1})).to.eql({"time":{"impulse":1,"phase":2},"remaining":0})
    })
    it('tests next phase with remaining actions', () => {
        expect(calculateActionTime(11, sevenAP, {"impulse" : 1, "phase" : 1})).to.eql({"time":{"impulse":3,"phase":2},"remaining":1})
    })
    it('tests same phase with remaining actions', () => {
        expect(calculateActionTime(4, sevenAP, {"impulse" : 1, "phase" : 1})).to.eql({"time":{"impulse":3,"phase":1},"remaining":1})
    })
    it('tests same phase with no remaining actions', () => {
        expect(calculateActionTime(1, fourAP, {"impulse" : 1, "phase" : 1})).to.eql({"time":{"impulse":1,"phase":1},"remaining":0})
    })
    it('tests future phase with no remaining actions', () => {
        expect(calculateActionTime(16, sevenAP, {"impulse" : 1, "phase" : 1})).to.eql({"time":{"impulse":1,"phase":3},"remaining":0})
    })
    it('tests future phase with remaining actions', () => {
        expect(calculateActionTime(18, sevenAP, {"impulse" : 1, "phase" : 1})).to.eql({"time":{"impulse":3,"phase":3},"remaining":1})
    })
    it('tests if 0 action points are spent', () => {
        expect(calculateActionTime(0, sevenAP, {"impulse" : 1, "phase" : 1})).to.eql({"time":{"impulse":1,"phase":1},"remaining":2})
    })    
})