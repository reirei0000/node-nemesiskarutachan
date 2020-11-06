const IngressKaruta = require("./ingresskaruta");
const Score = require("./score");

class GameMaster {
  constructor() {
    this._games = {};
  }

  start(id, kind, level, max_mondai, ready) {
    var g = new IngressKaruta();
    var s = new Score();

    this._games[id] = [g, s, max_mondai];
    g.init(ready);
  }

  get(id) {
    return this._games[id];
  }
}

module.exports = new GameMaster();
