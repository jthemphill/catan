var constants = require('./constants');

exports.Hand = function() {
    this.resources = {};
    this.devCards = {
        "year of plenty": 0,
        "monopoly": 0,
        "road building": 0,
        "university": 0,
        "library": 0,
        "chapel": 0,
        "palace": 0,
        "market": 0,
        "knight": 0,
    };

    for (var i = 0; i < constants.RESOURCE_TYPES.length; ++i) {
        this.resources[constants.RESOURCE_TYPES[i]] = 0;
    }
}

exports.Hand.prototype.getVictoryPoints = function() {
    return (this.devCards["university"] +
            this.devCards["library"] +
            this.devCards["chapel"] +
            this.devCards["palace"] +
            this.devCards["market"]);
}

exports.Hand.prototype.deltaResource = function(amount, resource) {
    assert(this.resources[resource] + amount >= 0);

    this.resources[resource] += amount;
}

exports.Hand.prototype.giveCard = function(card) {
    assert.notStrictEqual(this.devCards[card], undefined);
    this.devCards[card] += 1;
}

exports.Road = function(player) {
    this.player = player;
}

exports.Settlement = function(player) {
    this.isCity = false;
    this.player = player;
};
