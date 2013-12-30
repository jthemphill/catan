"use strict";

var assert = require('assert');

var constants = require('./constants');
var utils = require('./utils');
var Hand = require('./player').Hand;
var Settlement = require('./player').Settlement;
var Road = require('./player').Road;

var RESOURCE_TYPES = constants.RESOURCE_TYPES;
var CARDS_PER_RESOURCE = constants.CARDS_PER_RESOURCE;

function Board(player_colors) {

    this.turn = 0;

    this.tokens = utils.shuffle(constants.TOKENS);
    this.tiles = utils.shuffle(constants.TILES);
    this.ports = utils.shuffle(constants.PORTS);
    this.shores = utils.shuffle(constants.SHORES);

    this.colors = player_colors;
    this.hands = [];
    this.settlements = Array(11 * 6);
    this.roads = Array(6 * 3 * 5 + 1);
    this.robber = this.tiles.indexOf('desert');

    this.deck = utils.shuffle(constants.DECK);
    this.bank = {};

    this.longestRoad = -1;
    this.largestArmy = -1;

    for (var i = 0; i < RESOURCE_TYPES.length; ++i) {
        this.bank[RESOURCE_TYPES[i]] = CARDS_PER_RESOURCE;
    }

    for (var i = 0; i < player_colors.length; ++i) {
        this.hands.push(new Hand());
    }
}

Board.prototype.getVictoryPoints = function() {
    var victory_points = [];
    for (var i = 0; i < this.hands.length; ++i) {
        victory_points.push(this.hands[i].getVictoryPoints());
    }

    for (var i = 0; i < this.settlements.length; ++i) {
        var s = this.settlements[i];

        if (s) {
            victory_points[s.player] += s.isCity ? 2 : 1;
        }
    }

    if (this.longestRoad !== -1) {
        victory_points[this.longestRoad] += 2;
    }

    if (this.largestArmy !== -1) {
        victory_points[this.largestArmy] += 2;
    }

    return victory_points;
};

Board.prototype.giveResources = function(amount_per_player, resource) {
    assert.strictEqual(amount_per_player.length, this.hands.length);
    assert.notStrictEqual(RESOURCE_TYPES.indexOf(resource), -1);

    var total_resources = utils.sum(amount_per_player);

    if (total_resources > this.bank[resource]) {
        return;
    }
    this.bank[resource] -= total_resources;

    for (var i = 0; i < this.hands.length; ++i) {
        this.hands[i].deltaResource(
            amount_per_player[i],
            resource
        );
    }
};

Board.prototype.debitResources = function(amount_per_player, resource) {
    assert.strictEqual(amount_per_player.length, this.hands.length);
    assert.notStrictEqual(RESOURCE_TYPES.indexOf(resource), -1);

    for (var i = 0; i < this.hands.length; ++i) {
        this.hands[i].deltaResource(
            -amount_per_player[i],
            resource
        );
    }
}

Board.prototype.placeSettlement = function(player, loc) {
    assert(this.canPlaceSettlement(loc));
    this.settlements[loc] = new Settlement(player);
}

Board.prototype.canPlaceSettlement = function(loc) {
    if (this.settlements[loc] !== undefined) {
        return false;
    }

    var neighbors = settlementToSettlements(loc);

    for (var i = 0; i < neighbors.length; ++i) {
        if (this.settlements[neighbors[i]] !== undefined) {
            return false;
        }
    }

    return true;
}

Board.prototype.placeRoad = function(player, loc) {
    assert(this.canPlaceRoad(player, loc));
    this.roads[loc] = new Road(player);
}

Board.prototype.canPlaceRoad = function(player, loc) {
    if (this.roads[loc] !== undefined) {
        return false;
    }

    var settlements = roadToSettlements(loc);
    for (var i = 0; i < settlements.length; ++i) {
        var s = this.settlements[settlements[i]];
        if (s && s.player === player) {
            return true;
        }
    }
    return false;
}

Board.prototype.giveCard = function(player) {
    if (this.deck.length === 0) {
        return;
    }

    this.hands[player].giveCard(this.deck.pop());
}

function tileToSettlements(loc) {

}

function settlementToSettlements(loc) {
    var row = Math.floor(loc / 6);

    return [
        loc - 6,
        loc + (row % 2  === loc % 2 ? 1 : -1),
        loc + 6,
    ];
}

function roadToSettlements(loc) {
    var row = Math.floor(loc / 6);

    switch (row % 6) {
    case 0:
        return [loc + 1, loc + 2];
    case 2:
        return loc % 2 ? [loc - 4, loc - 3] : [loc - 5, loc - 4];
    }

    return [loc - 6, loc];
}

exports.Board = Board;
