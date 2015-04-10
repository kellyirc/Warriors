var ScenarioMap = function(options) {

    var self = this;

    var chance = null;

    var terrain = {
        floor: 0,
        wall: 1,
        keep: 2,
        treasure: 3
    };

    var keeps = 0;

    var getChance = function(seed) {
        return new Chance(seed);
    };

    var getFloat = function() {
        return chance.floating({min: 0, max: 1});
    };

    var ripOptions = function(options) {
        options = options || {};

        self.worldWidth = options.worldWidth || 96;
        self.worldHeight = options.worldHeight || 96;

        self.wallChance = options.wallChance || 0.4;
        self.deathLimit = options.deathLimit || 4;
        self.birthLimit = options.birthLimit || 4;
        self.numberOfSteps = options.numberOfSteps || 10;
        self.keepChance = options.keepChance || 0.02;
        self.keepRadius = options.keepRadius || 4;
        self.keepLimit = options.keepLimit || 99;
        self.treasureWallRequirement = options.treasureWallRequirement || 5;

        self.seed = options.seed || Date.now();

        self.distanceReq = options.distanceReq || {};
        self.distanceReq.treasure = self.distanceReq.treasure || 5;
        self.distanceReq.keep = self.distanceReq.keep || 30;

        chance = getChance(self.seed);
    };

    var getRangeSquare = function (startx, starty, range) {
        var tiles = [];

        for(var x = startx-range; x <= startx+range; x++) {
            for(var y = starty-range; y <= starty+range; y++) {
                if(x < 0 || x >= self.worldWidth) continue;
                if(y < 0 || y >= self.worldHeight) continue;

                tiles.push(self.world[x][y]);
            }
        }

        return tiles;
    };

    var inRange = function (startx, starty, range, tile) {
        return _.contains(getRangeSquare(startx, starty, range), tile);
    };

    var initializeMap = function() {
        for(var x = 0; x < self.worldWidth; x++) {
            self.world[x] = [];
            for(var y = 0; y < self.worldHeight; y++) {
                self.world[x][y] = getFloat() < self.wallChance ? terrain.wall : terrain.floor;
            }
        }
    };

    var countAliveNeighbors = function(x, y) {
        var count = 0;

        for(var i = -1; i < 2; i++) {
            for(var j = -1; j < 2; j++) {
                var neighborX = i+x;
                var neighborY = j+y;

                if(i === 0 && j === 0) continue;

                if(neighborX < 0 ||
                    neighborY < 0 ||
                    neighborX >= self.worldWidth ||
                    neighborY >= self.worldHeight ||
                    self.world[neighborX][neighborY] === terrain.wall) {
                    count++;
                }
            }
        }

        return count;
    };

    var automataStep = function() {

        var tempMap = [[]];

        for(var x = 0; x < self.worldWidth; x++) {

            tempMap[x] = [];

            for(var y = 0; y < self.worldHeight; y++) {
                var neighbors = countAliveNeighbors(x, y);

                if(self.world[x][y] === terrain.wall) {
                    tempMap[x][y] = neighbors < self.deathLimit ? terrain.floor : terrain.wall;

                } else if(self.world[x][y] === terrain.floor) {
                    tempMap[x][y] = neighbors > self.birthLimit ? terrain.wall : terrain.floor;
                }

            }
        }

        self.world = tempMap;
    };

    var fillInEmptyCaverns = function() {
        var copy = _.cloneDeep(self.world);
        var caverns = {};

        var countsForCavern = function(tile) {
            return tile === terrain.floor;
        };

        var iterateCaverns = function(ct, x, y) {
            copy[x][y] = -ct;

            if(!caverns[-ct])
                caverns[-ct] = 1;
            else
                caverns[-ct]++;

            if(x > 0) {
                var left = copy[x-1][y];
                if(countsForCavern(left)) iterateCaverns(ct, x-1, y);
            }

            if(x < self.worldWidth-1) {
                var right = copy[x+1][y];
                if(countsForCavern(right)) iterateCaverns(ct, x+1, y);
            }

            if(y > 0) {
                var bottom = copy[x][y-1];
                if(countsForCavern(bottom)) iterateCaverns(ct, x, y-1);
            }

            if(y < self.worldHeight - 1) {
                var top = copy[x][y+1];
                if(countsForCavern(top)) iterateCaverns(ct, x, y+1);
            }

        };

        var calculateCaverns = function(map) {

            var cavernIndex = 1;

            for(var x = 0; x < self.worldWidth; x++) {
                for(var y = 0; y < self.worldHeight; y++) {
                    if(!countsForCavern(copy[x][y])) continue;
                    iterateCaverns(cavernIndex++, x, y);
                }
            }
        };

        calculateCaverns(copy);

        var biggestFloorKey = parseInt(_(caverns).keys().sortBy(function(key) { return caverns[key]; }).reverse().value()[0]);

        for(var x = 0; x < self.worldWidth; x++) {
            for(var y = 0; y < self.worldHeight; y++) {
                var value = copy[x][y];
                if(value >= 0 || value === biggestFloorKey) continue;
                self.world[x][y] = 1;
            }
        }
    };

    var fillInBorders = function() {
        for(var x = 0; x < self.worldWidth; x++) {
            for(var y = 0; y < self.worldHeight; y++) {
                if(x === 0 || x === self.worldWidth-1 || y === 0 || y === self.worldHeight-1)
                    self.world[x][y] = terrain.wall;
            }
        }
    };

    var placeKeeps = function() {

        var placedKeeps = 0;

        for (var x = self.keepRadius+1; x < self.worldWidth-self.keepRadius-1; x++) {
            for (var y = self.keepRadius+1; y < self.worldHeight-self.keepRadius-1; y++) {

                if (self.world[x][y] === terrain.floor && getFloat() < self.keepChance && !inRange(x, y, self.distanceReq.keep, terrain.keep) && placedKeeps++ < self.keepLimit) {

                    for(var keepstartx = x-self.keepRadius; keepstartx < x+self.keepRadius; keepstartx++) {
                        for(var keepstarty = y-self.keepRadius; keepstarty < y+self.keepRadius; keepstarty++) {

                            self.world[keepstartx][keepstarty] = terrain.keep;

                        }
                    }

                }

            }
        }

        keeps = placedKeeps;
    };

    var placeTreasure = function() {
        for (var x = 0; x < self.worldWidth; x++) {
            for (var y = 0; y < self.worldHeight; y++) {
                if(self.world[x][y] !== terrain.floor) continue;

                var neighbors = countAliveNeighbors(x, y);

                if(neighbors >= self.treasureWallRequirement && !inRange(x, y, self.distanceReq.treasure, terrain.treasure)){
                    self.world[x][y] = terrain.treasure;
                }
            }
        }
    };

    self.automataStep = automataStep;
    self.generate = function(options) {
        self.world = [[]];

        ripOptions(options);


        initializeMap();

        for(var i = 0; i < self.numberOfSteps; i++) {
            automataStep();
        }

        fillInBorders();
        fillInEmptyCaverns();
        placeKeeps();
        placeTreasure();

        if(keeps < 2) {
            self.generate(options);
        }
    };

    self.generate(options);
};

module.exports = ScenarioMap;