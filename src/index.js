import { calculateActionTime, tableLookup } from './functions'

const sampleTable = [
    {
      "Position": "Look Over/Around",
      "Target Size": -4,
      "Auto Elev": -3,
      "Auto Width": -3
    },
    {
      "Position": "Fire Over/Around",
      "Target Size": 0,
      "Auto Elev": 2,
      "Auto Width": 2
    },
    {
      "Position": "Standing Exposed",
      "Target Size": 7,
      "Auto Elev": 14,
      "Auto Width": 1
    }
  ]

tableLookup(sampleTable, 'Position', 'Target Size', 'Standing Exposed')