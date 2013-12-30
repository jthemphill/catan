var rewire = require('rewire');

var utils = require('../utils');
var constants = require('../constants');
var board_module = rewire('../board');

var RESOURCE_TYPES = constants.RESOURCE_TYPES;
var Board = board_module.Board;

function mockHand(victory_points) {
    if (victory_points === undefined) {
        victory_points = 0;
    }

    board_module.__set__('Hand', function() {
        var hand = jasmine.createSpyObj(
            'Hand',
            ['deltaResource']
        );

        hand.getVictoryPoints = function() { return victory_points; }
        return hand;
    });
}

describe('board', function() {
    var player_colors = ["red", "blue"];
    var board;

    beforeEach(function() {
        mockHand(0);
        board = new Board(player_colors);
    });

    it('should be built with a sane default state', function() {
        for (var i = 0; i < RESOURCE_TYPES.length; ++i) {
            var type = RESOURCE_TYPES[i];
            expect(board.bank[type]).toBe(19);
        }

        expect(board.turn).toBe(0);
        expect(board.tokens.length).toBe(18);
        expect(board.tiles.length).toBe(19);
        expect(board.ports.length).toBe(9);
        expect(board.shores.length).toBe(6);
        expect(utils.sum(board.shores)).toBe(9);
        expect(board.deck.length).toBe(25);
        expect(board.robber).toBeGreaterThan(-1);

        expect(typeof(board.giveResources)).toBe("function");
    });

    it('should give resources to players', function() {
        board.giveResources([1, 2], "wheat");

        expect(board.hands[0].deltaResource).toHaveBeenCalledWith(1, "wheat");
        expect(board.hands[1].deltaResource).toHaveBeenCalledWith(2, "wheat");

        expect(board.bank["wheat"]).toEqual(19 - 3);
    });

    it('does not give any resources if it cannot give to everyone', function() {
        board.bank["wheat"] = 1;

        board.giveResources([1, 1], "wheat");

        expect(board.hands[0].deltaResource).not.toHaveBeenCalled();
        expect(board.hands[1].deltaResource).not.toHaveBeenCalled();

        expect(board.bank["wheat"]).toEqual(1);
    });

    it('gives no victory points at start', function() {
        var vps = board.getVictoryPoints();
        expect(vps[0]).toBe(0);
        expect(vps[1]).toBe(0);
    });

    it('counts dev cards when calculating vp', function() {
        mockHand(3);
        board = new Board(player_colors);

        var vps = board.getVictoryPoints();
        expect(vps[0]).toBe(3);
        expect(vps[1]).toBe(3);        
    });

    it('counts settlements and cities differently, vp-wise', function() {
        board.settlements[0] = {
            isCity: true,
            player: 0,
        };
        board.settlements[42] = {
            isCity: false,
            player: 1,
        };

        var vps = board.getVictoryPoints();
        expect(vps[0]).toBe(2);
        expect(vps[1]).toBe(1);
    });

    it('gives victory points for longest road', function() {
        board.longestRoad = 0;

        var vps = board.getVictoryPoints();
        expect(vps[0]).toBe(2);
        expect(vps[1]).toBe(0);
    });

    it('gives victory points for largest army', function() {
        board.largestArmy = 1;

        var vps = board.getVictoryPoints();
        expect(vps[0]).toBe(0);
        expect(vps[1]).toBe(2);
    });

    it('should stop placement of one settlement atop another', function() {
        board.placeSettlement(0, 0);
        expect(board.canPlaceSettlement(0)).toBe(false);
    });

    it('should calculate neighbors correctly', function() {
        var settlementNeighbors = board_module.__get__('settlementToSettlements');

        var neighbors = settlementNeighbors(8); // 1, 2
        expect(neighbors[0]).toBe(2);
        expect(neighbors[1]).toBe(7); // -1
        expect(neighbors[2]).toBe(14);

        var neighbors = settlementNeighbors(13); // 2, 1
        expect(neighbors[0]).toBe(7);
        expect(neighbors[1]).toBe(12); // -1
        expect(neighbors[2]).toBe(19);

        var neighbors = settlementNeighbors(14); // 2, 2
        expect(neighbors[0]).toBe(8);
        expect(neighbors[1]).toBe(15); // +1
        expect(neighbors[2]).toBe(20);

        var neighbors = settlementNeighbors(19); // 3, 1
        expect(neighbors[0]).toBe(13);
        expect(neighbors[1]).toBe(20); // +1
        expect(neighbors[2]).toBe(25);
    });

    it('should detect settlement adjacencies', function() {
        board.placeSettlement(0, 2);
        expect(board.canPlaceSettlement(3)).toBe(false);
    });

    it('should allow nonadjacencies', function() {
        board.placeSettlement(0, 2);
        expect(board.canPlaceSettlement(9)).toBe(true);
    });

    it('correctly finds adjacencies between roads and settlements', function() {
        var roadNeighbors = board_module.__get__('roadToSettlements');

        var neighbors = roadNeighbors(1);
        expect(neighbors[0]).toBe(2);
        expect(neighbors[1]).toBe(3);

        var neighbors = roadNeighbors(12);
        expect(neighbors[0]).toBe(7);
        expect(neighbors[1]).toBe(8);

        var neighbors = roadNeighbors(13);
        expect(neighbors[0]).toBe(9);
        expect(neighbors[1]).toBe(10);
    });

    it('does not allow roads built atop roads', function() {
        board.placeSettlement(0, 2);
        board.placeRoad(0, 1);
        expect(board.canPlaceRoad(1, 1)).toBe(false);
    });

    it('only allows roads built next to owned settlements', function() {
        board.placeSettlement(0, 2);
        expect(board.canPlaceRoad(1, 1)).toBe(false);
        expect(board.canPlaceRoad(0, 1)).toBe(true);
    });

    it('can give cards to players', function() {
        board.deck[0] = "knight";
        board.giveCard(0);

        expect(hands
    });
});
