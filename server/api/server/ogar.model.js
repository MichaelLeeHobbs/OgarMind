var ogarModel = {
  name: {type: String, typeof: "string", default: "An Ogar Server"},
  status: {type: String, typeof: "string", default: "stopped"},
  info: {type: String, typeof: "string", default: "It's an Ogar Server"},
  active: {type: Boolean, typeof: "boolean", default: true, privilegeLevel: "admin"},
  ownerId: {type: String, typeof: "string", default: "", privilegeLevel: "admin"},
  serverMaxConnections: {type: Number, typeof: "number", default: 64, min: 1, max: 256, privilegeLevel: "admin"},
  uri: {type: String, typeof: "string", default: "localhost", privilegeLevel: "admin"},
  serverPort: {type: Number, typeof: "number", default: 3000, min: 1, max: 65534, privilegeLevel: "admin"},
  serverGamemode: {type: Number, typeof: "number", default: 0, min: 0, max: 20},
  serverBots: {type: Number, typeof: "number", default: 0, min: 0, max: 65534},
  serverViewBaseX: {type: Number, typeof: "number", default: 1024, min: 0},
  serverViewBaseY: {type: Number, typeof: "number", default: 592, min: 0},
  serverStatsPort: {type: Number, typeof: "number", default: 88, min: 1, max: 65534, privilegeLevel: "admin"},
  serverStatsUpdate: {type: Number, typeof: "number", default: 60, min: 1},
  serverLogLevel: {type: Number, typeof: "number", default: 1, min: 0, max: 2},
  serverScrambleCoords: {type: Number, typeof: "number", default: 1, min: 0, max: 1},

  borderLeft: {type: Number, typeof: "number", default: 0, min: -100000, max: 100000},
  borderRight: {type: Number, typeof: "number", default: 6000, min: -100000, max: 100000},
  borderTop: {type: Number, typeof: "number", default: 0, min: -100000, max: 100000},
  borderBottom: {type: Number, typeof: "number", default: 6000, min: -100000, max: 100000},

  spawnInterval: {type: Number, typeof: "number", default: 20, min: 1, max: 600},
  foodSpawnAmount: {type: Number, typeof: "number", default: 10, min: 1, max: 100000},
  foodStartAmount: {type: Number, typeof: "number", default: 100, min: 1, max: 100000},
  foodMaxAmount: {type: Number, typeof: "number", default: 500, min: 1, max: 100000},
  foodMass: {type: Number, typeof: "number", default: 10, min: 1, max: 1000},
  foodMassGrow: {type: Number, typeof: "number", default: 10, min: 1, max: 1000},
  foodMassGrowPossiblity: {type: Number, typeof: "number", default: 50, min: 0, max: 1000},
  foodMassLimit: {type: Number, typeof: "number", default: 5, min: 1, max: 1000},
  foodMassTimeout: {type: Number, typeof: "number", default: 120, min: 1, max: 600},
  virusMinAmount: {type: Number, typeof: "number", default: 10, min: 0, max: 1000},
  virusMaxAmount: {type: Number, typeof: "number", default: 50, min: 0, max: 1000},
  virusStartMass: {type: Number, typeof: "number", default: 100, min: 1, max: 1000},
  virusFeedAmount: {type: Number, typeof: "number", default: 7, min: 1, max: 1000},

  ejectMass: {type: Number, typeof: "number", default: 12, min: 1, max: 1000},
  ejectMassCooldown: {type: Number, typeof: "number", default: 200, min: 1, max: 1000},
  ejectMassLoss: {type: Number, typeof: "number", default: 16, min: 1, max: 1000},
  ejectSpeed: {type: Number, typeof: "number", default: 160, min: 1, max: 1000},
  ejectSpawnPlayer: {type: Number, typeof: "number", default: 50, min: 1, max: 1000},

  playerStartMass: {type: Number, typeof: "number", default: 10, min: 1, max: 10000},
  playerMaxMass: {type: Number, typeof: "number", default: 22500, min: 1, max: 1000000},
  playerMinMassEject: {type: Number, typeof: "number", default: 32, min: 1, max: 1000},
  playerMinMassSplit: {type: Number, typeof: "number", default: 36, min: 1, max: 1000},
  playerMaxCells: {type: Number, typeof: "number", default: 16, min: 1, max: 1000},
  playerRecombineTime: {type: Number, typeof: "number", default: 30, min: 1, max: 600},
  playerMassDecayRate: {type: Number, typeof: "number", default: .002, min: 0, max: 5},
  playerMinMassDecay: {type: Number, typeof: "number", default: 9, min: 0, max: 1000},
  playerMaxNickLength: {type: Number, typeof: "number", default: 15, min: 1, max: 32},
  playerSpeed: {type: Number, typeof: "number", default: 30, min: 1, max: 1000},
  playerDisconnectTime: {type: Number, typeof: "number", default: 60, min: 1, max: 300},

  tourneyMaxPlayers: {type: Number, typeof: "number", default: 12, min: 1, max: 256},
  tourneyPrepTime: {type: Number, typeof: "number", default: 10, min: 1, max: 300},
  tourneyEndTime: {type: Number, typeof: "number", default: 30, min: 1, max: 120},
  tourneyTimeLimit: {type: Number, typeof: "number", default: 10, min: 1, max: 60},
  tourneyAutoFill: {type: Number, typeof: "number", default: 0, min: 0, max: 290},
  tourneyAutoFillPlayers: {type: Number, typeof: "number", default: 1, min: 1, max: 256}
};
export default ogarModel;
