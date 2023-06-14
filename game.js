//Get data
let currentSpecies = JSON.parse(localStorage.getItem("Species"));
let currentPopulation = JSON.parse(localStorage.getItem("Populations"));
//Count the amount of days past in the game
var day = 0;
//An array that stores creatures
var creatures = [];
var population = [];
//A 2D array used for storing information about tilemap.
var tiles;
//Define the size of the tilemap & 2D array
var tileWidth = 17;
var tileHeight = 14;
//Display text to show how many days have past in game
var gameDayText;
//False be default, become true when all creatures die
var ends = false;
//Tilemap object
var map;
//True if user enters 0 for all species at setup, false otherwise. 
//It's used to prevent game immediately ends after start, allowing users to begin the game with no creatures
var emptyStart = false;
//Stores the population. Used to produce population graph
var countPop = {};
var doSkip = false;
//Store the amount of available resources
var resources;
//Not in use
var updateText;
//Default amount of available resources for plain (option 1) and island (option 2)
const envResources = {
    Plain: 15000,
    Island: 2000,
}
//Create an object to store game settings
var gameSetting = new Object();
//Process and stores the population data
for(var i=0; i<currentSpecies.length; i++){
    gameSetting[currentSpecies[i]] = parseInt(currentPopulation[i]);
    population[i] = parseInt(currentPopulation[i]);
}
gameSetting['Environment'] = parseInt(localStorage.getItem('Environment'));
//configuration for a new creature
const newCreatures = {
    Wolf: {
        species: 'Wolf',
        health: 80,
        alive: true,
        toPrey: 7,
        toRep: 0,
        age: 0,
    },
    Sheep: {
        species: 'Sheep',
        health: 80,
        alive: true,
        toPrey: 1,
        toRep: 0,
        age: 0,
    },
    Cat: {
        species: 'Cat',
        health: 80,
        alive: true,
        toRep: 0,
        toPrey: 1,
        age: 0,
    },
    Bird: {
        species: 'Bird',
        health: 80,
        alive: true,
        toRep: 0,
        toPrey: 1,
        age: 0,
    },
    Fox: {
        species: 'Fox',
        health: 80,
        alive: true,
        toPrey: 1,
        toRep: 0,
        age: 0,
    },
};
//Information about each species.
//Note: it's the general information, different from creature information above
//Only the first one is fully annotated as same attribute stands for same meaning 
const speciesInfo = {
    Wolf: {
        species: 'Wolf', //species name
        prey: true, //true for predator, false for preys
        carnivore: true,
        herbivore: false,
        id: 1, //unique id for each species
        repLevel: 60, //min health level required to reproduce
        deathLevel: 20, //min health level required to survive
        repFood: 0.10, //amount of food required per each meal, used to calculate the total amount of food required by a pack/flock based on its current population
        food: ['Sheep', 'Bird'], //the type of food eaten by this species
        repRate: 365, //how often do this species reproduce (days)
        distance: 5, //the distance this species is able to move per day
        toPrey: 7, //how often do this species eat
        packNum: 10, //min size of a pack/flock
        packMax: 18, //max size of a pack/flock
        repNum: 0.55, //the amount of offsprings, used to calculate the total number of offsprings required a pack/flock based on its current population
    },
    Sheep: {
        species: 'Sheep',
        prey: false,
        carnivore: false,
        herbivore: true,
        id: 2,
        repLevel: 50,
        deathLevel: 20,
        energy: 1, //the energy it provides to its predator
        repFood: 0.1,
        food: 'Resources',
        repRate: 365,
        distance: 3,
        toPrey: 1,
        eatAmount: 2,
        packNum: 150,
        packMax: 250,
        repNum: 0.7,
    },
    Cat: {
        species: 'Cat',
        id: 3,
        prey: true,
        carnivore: true,
        herbivore: false,
        repLevel: 60,
        deathLevel: 20,
        health: 80,
        repFood: 0.1, //amount of food per day (lbs) according to body weight
        food: ['Bird'],
        repRate: 360,
        distance: 4,
        toPrey: 2,
        packNum: 8,
        packMax: 15,
        repNum: 0.65,
    },
    Bird: {
        species: 'Bird',
        id: 4,
        prey: false,
        carnivore: false,
        herbivore: true,
        repLevel: 50,
        deathLevel: 20,
        food: 'Resources',
        repFood: 0.02,
        energy: 0.1,
        repRate: 365,
        distance: 2,
        toPrey: 1,
        lifespan: 600,
        eatAmount: 0.1,
        packNum: 25,
        packMax: 60,
        repNum: 0.5,
    },
    Fox: {
        species: 'Fox',
        prey: true,
        carnivore: true,
        herbivore: true,
        id: 5,
        health: 80,
        repLevel: 60,
        deathLevel: 20,
        repFood: 0.15, //amount of food per day (lbs) according to body weight
        food: ['Bird'],
        repRate: 365,
        distance: 3,
        toPrey: 2,
        lifespan: 600,
        packNum: 2,
        packMax: 10,
        repNum: 0.55,
    },
};

//Generate a random int between min and max
// The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

//Get the distance between two coordinates
function getDistance(x, y, x2, y2){
    return Math.abs(x-x2)+Math.abs(y-y2);
}

//Find a creature at location [x, y]
function getCreature(x, y){
    for(s of creatures){
        if(s.x == x && s.y == y){
            return s;
        }
    }
    //No existing creature at location [x, y]
    return null;
}

//Remove a creature at location [x, y]
function removeCreatureAt(x, y){
    tiles[y][x] = 0;
    if(map.hasTileAt(x, y)){
        map.removeTileAt(x, y);
    }
    else{
        console.log('no tile at'+x+' '+y);
    }
    for(var i=0; i<creatures.length; i++){
        if(creatures[i].x == x && creatures[i].y==y){
            console.log(creatures[i].species+" died");
            creatures[i].alive = false;
        }
    }
}

//Find preys within a specified distance around location [x, y]
function withinRange(x, y, prey, dis){
    const minX = Math.max(0, x-dis);
    const maxX = Math.min(tileWidth-1, x+dis);
    const minY = Math.max(0, y-dis);
    const maxY = Math.min(tileHeight-1, y+dis);
    for(var i=minX; i<=maxX; i++){
        for(var j=minY; j<=maxY; j++){
            const s = getCreature(i, j);
            //Found an alive prey within the distance
            if(isPrey(prey, tiles[j][i]) && s.alive){
                return [i, j];
            }
        }
    }
    //No preys found
    return [-1, -1];
}

//Check if the target is a prey
function isPrey(preys, target){
    for(var i=0; i<preys.length; i++){
        if(target==speciesInfo[preys[i]]['id']){
            return true;
        }
    }
    return false;
}

//Move a tile from location [x1, y1] to location [x2, y2]
function moveTo(x1, y1, x2, y2, val){
    tiles[y2][x2] = val;
    var t1 = map.getTileAt(x1, y1);
    if(t1 != null){
        map.putTileAt(t1, x2, y2);
        map.removeTileAt(x1, y1);
        //map.putTileAt(6, x2, y2);
        console.log("move to "+x2+" "+y2);
    }
    else{
        console.log("invalid tile at "+x1+" "+y1);
    }
}

//Find an empty tile adjacent to location [x, y] (8 possibilities)
function findEmptySpaceAround(x, y){
    const minX = Math.max(0, x-1);
    const maxX = Math.min(tileWidth-1, x+1);
    const minY = Math.max(0, y-1);
    const maxY = Math.min(tileHeight-1, y+1);
    for(var i=minX; i<=maxX; i++){
        for(var j=minY; j<=maxY; j++){
            if(tiles[j][i] == 0){
                return [i, j];
            }
        }
    }
    //No empty tile found
    return [-1, -1];
}

//Get one empty tile in the entire map
function getEmptySpace(){
    for(var i=0; i< tileHeight; i++){
        for(var j=0; j< tileWidth; j++){
            if(tiles[i][j] == 0){
                return [j, i];
            }
        }
    }
    return [-1, -1];
}

//Check if tile [x, y] is in bound
function inBound(x, y){
    return y>=0 && y<tileHeight && x>=0 && x<tileWidth;
}

//Add a new pack with given species and population number and optional locations
function addNewPacks2(species, num, x=null, y=null){
    const info = speciesInfo[species];
    //Calculate how many packs/flocks should be generated
    const packNums = Math.ceil(num /info['packNum']);
    console.log('user add: '+packNums);
    for(var i=0; i<packNums; i++){
        var pack = {};
        if(x == null || y == null){
            //generate a random location if its not given
            x = getRandomInt(0, tileWidth);
            y = getRandomInt(0, tileHeight);
            if(tiles[y][x]!=0){
                //the random location is occupied, find an empty tile in the map
                var newLoc = getEmptySpace();
                x = newLoc[0];
                y = newLoc[1];
            }
            if(x<0 || y<0){
                //No empty tiles available
                console.log("Unable to add more "+ species);
                return;
            }
        }
        pack = {
            //x, y location of this pack
            x: x,
            y: y,
            //name of the species
            species: species,
            //initial age
            age: 0,
            //population size
            population: info.packNum,
            //initial death rate
            deathRate: 1,
            //initial health value
            health: 80,
            alive: true,

        }
        //add the pack/flock to creatures array
        creatures.push(pack);
        //mark the tile occupied in the 2D array
        tiles[y][x] = info.id;
        if(doSkip==false){
            //add it to the tilemap
            map.putTileAt(info.id, x, y);
        }
        console.log('add '+species+' at '+x+' '+y);
    }
}

//Process pack/flock activity by days
function packActivity2(pack, i){
    //get information for this species
    const info = speciesInfo[pack.species];
    //get the amount of food(energy) required by this pack/flock
    var food = Math.ceil(pack.population * info.repFood);
    console.log("Max food: "+food);
    //increase the age of the pack/flock
    pack.age ++;
    //find food
    if(pack.age % info.toPrey == 0){
        //need to get food
        if(info['herbivore']==true){
            //this pack/flock is herbivore 

            //reduce daily energy consumption
            pack.health = Math.max(0, pack.health-3);
            if(resources > 0){
                //if there's resources
                resources = Math.max(0, resources-food);

                //increase health if the pack eats something
                pack.health = Math.min(100, pack.health+5);
                //For omnivores, plants & fruits only takes part of its energy requirement
                food = Math.floor(food * 0.4);
            }
            else{
                //reduce more health if the pack/flock cannot find food
                pack.health = Math.max(0, pack.health-3);
            }
            
        }
        if(info['carnivore']){
            //this pack/flock is carnivore

            //reduce daily energy consumption
            pack.health = Math.max(0, pack.health-1);

            //Try to find food
            var target = tryToPrey2(pack.x, pack.y, info.food, info.distance, food);
            console.log("Food after prey: "+target[0]);


            if(target[0] != food){
                //found something to eat
                console.log(pack.species+" ate "+ target[1]+" preys");

                //increase the health by the amount of food the pack eats
                pack.health = Math.min(100, s.health+25*((food-target[0])/food));

                //move the pack to a location near available preys
                const newloc = findEmptySpaceAround(target[2][0], target[2][1]);
                if(newloc[0] != -1 && newloc[1] != -1){
                    moveTo(pack.x, pack.y, newloc[0], newloc[1], info.id);
                    pack.x = newloc[0];
                    pack.y = newloc[1];
                }
                console.log(pack.species+" at "+pack.x+", "+pack.y+" eat "+info.food+" at "+target[0]+", "+target[1]);
            }
            else if (food != 0){
                //no food within range
                console.log("No food within range");

                //reduce health for unable to find food
                pack.health = Math.min(100, pack.health-target[1]);

                //find nearest preys
                var nearest = findNearestFood(pack.x, pack.y, info.food);
                if(nearest[0] != -1 && nearest[1] != -1){
                    //if such a prey is found, move the pack towards the prey's location
                    var newX;
                    var newY;
                    if(nearest[0] < pack.x){
                        newX = Math.max(0, pack.x - info.distance);
                    }
                    else{
                        newX = Math.min(pack.x+info.distance, tileWidth-1);
                    }
                    if(nearest[1] < pack.y){
                        newY = Math.max(0, pack.y - info.distance);
                    }
                    else{
                        newY = Math.min(pack.y+info.distance, tileHeight-1);
                    }
                
                    moveTo(pack.x, pack.y, newX, newY, info.id);
                    pack.x = newX;
                    pack.y = newY;

                }
            }
        }
    }
    //reproduce
    if(pack.population > 0){
        //the pack doesn't die out
        if(pack.health >= info.repLevel && pack.age % info['repRate'] == 0 && pack.age / info['repRate'] > 0){
            //the pack is old enough for another reproduction and is healthy enough to reproduce

            //reduce health costed by reproduction
            pack.health -= 10;

            //calculate the amount of offsprings
            const newborns = Math.ceil(info.repNum * pack.population);

            if(pack.population+newborns<info.packMax){
                //the population size does not exceed the max population size
                pack.population += newborns;
            }
            else{
                //the population size exceeds the max population size and a new pack/flock is generated
                addNewPacks2(pack.species, pack.population+newborns-info.packMax);
                pack.population = info.packMax;
            }

        }
    }

    //calculate death rate of the pack/flock based on its current health level
    pack.deathRate = Math.max(1, Math.min(100, pack.deathRate - healthToDeathRate(pack.health)));
    //death
    if(pack.age % 7 == 0){
        //do a "death check" every 7 days
        var death = 0;
        const total = pack.population;
        for(var j=0; j<total; j++){
            death = getRandomInt(0, 200);
            if(death <= pack.deathRate){
                pack.population --;
            }
            if(pack.population==0){
                break;
            }
        }
    }
    if(pack.population == 0 || pack.health < info['deathLevel']){
        console.log(pack.species+" at "+pack.x+pack.y+" died "+pack.population+" "+pack.health);
        removeCreatureAt(pack.x, pack.y);
    }
}

//Find preys within range and consume them 
function tryToPrey2(x, y, prey, dis, food){
    const minX = Math.max(0, x-dis);
    const maxX = Math.min(tileWidth-1, x+dis);
    const minY = Math.max(0, y-dis);
    const maxY = Math.min(tileHeight-1, y+dis);
    var newLoc = [-1, -1];
    var countMovement = 0;
    for(var i=minX; i<=maxX; i++){
        for(var j=minY; j<=maxY; j++){
            var s = getCreature(i, j);
            if(isPrey(prey, tiles[j][i]) && s.alive){
                //found a prey
                newLoc = [i, j];
                countMovement ++;

                //check if the prey is sufficient to feed the pack/flock
                if(food < s.population*speciesInfo[s.species]['energy']){
                    s.population -= Math.ceil(food/speciesInfo[s.species]['energy']);
                    //removeCreatureAt(i, j);
                    return [0, countMovement, newLoc];
                }
                else{
                    food -= Math.ceil(s.population*speciesInfo[s.species]['energy']);
                    s.population = 0;
                    console.log(s.species+" died(preyed");
                    removeCreatureAt(i, j);
                }
            }
        }
    }
    return [food,  countMovement, newLoc];
}

//Find a prey dearest to location [x, y]
function findNearestFood(x, y, food){
    var nearest = [-1, -1];
    for(var i=0; i<tileWidth; i++){
        for(var j=0; j<tileHeight; j++){
            // console.log("find: "+food);
            const s = getCreature(i, j);
            if(isPrey(food, tiles[j][i]) && s.alive){
                if(nearest[0] == -1 && nearest[1]==-1){
                    nearest[0]=i;
                    nearest[1]=j;
                }
                else if(getDistance(x, y, nearest[0], nearest[1])>getDistance(x, y, i, j)){
                    nearest[0]=i;
                    nearest[1]=j;
                }
            }
        }
    }
    return nearest;
}

//Precess daily activity for all creatures
function dailyActivity2(){
    for(var i=0; i<creatures.length; i++){
        if(creatures[i].alive){
            packActivity2(creatures[i], i);
        }
        else{
            //creatures[i].alive = false;
            console.log(creatures[i].species+" died");
        }
    }
    if(day%7 == 0){
        //reproduce resources every 7 days
        resources = Math.min(gameSetting['Environment'], resources+Math.ceil(resources*0.5));
    }
}

//increase death rate by health level(val)
function healthToDeathRate(val){
    if(val >= 90){
        return 5;
    }
    else if(val >= 80){
        return 3;
    }
    else if(val >= 70){
        return 1;
    }
    else if(val >= 60){
        return -0.5;
    }
    else if(val >= 50){
        return -1;
    }
    else if(val >= 40){
        return -1.5;
    }
    else{
        return -2;
    }
}

//Calculate total population for each species and stores it to produce population graph
function updatePopulation(){
    var temp = {};
    for(c of currentSpecies){
        temp[c] = 0;
    }
    for(s of creatures){
        temp[s.species] += s.population;
    }
    for(c of currentSpecies){
        countPop[c].push(temp[c]);
    }
    countPop['Resources'].push(resources);
    countPop['Day'].push(day);
}

//init function for Phaser game object
function init(){
    resources = gameSetting['Environment'];
    for(var i=0; i< currentSpecies.length; i++){
        //Add creatures based on users' setting
        const s = currentSpecies[i];
        countPop[currentSpecies[i]] = [population[i]*speciesInfo[s]['packNum']];
        for(var j=0; j<population[i]; j++){
            addNewPacks2(s, speciesInfo[s]['packNum']);
        }
    }

    //record initial data for population graph
    countPop['Resources'] = [resources];
    countPop['Day'] = [day];

    //Check if user enters 0 for all species
    if(creatures.length==0){
        emptyStart = true;
    }

    localStorage.setItem('countPopulation', JSON.stringify(countPop));
    localStorage.setItem('showGraph', JSON.stringify(false));
}

//configuration for Phaser game object
var config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#E2FCFD',
    dom: {
        createContainer: true
    },
    //pixelArt: true,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
//Pause button
var pause;
//End button
var end;
//Text displayed when game ends
var endText;
//Text that show the amount of available resources
var availableResources;

var timer = 0;
var marker;
function preload ()
{
    this.load.setBaseURL('http://labs.phaser.io');

    // load image
    this.load.image('tile', "https://ecosimulator.netlify.app/creatures_images.jpg");
    //this.load.image('tile', 'http://localhost:8888/creatures_images.jpg');
    
}

var currentCreature = null;
//Text displays info for selected pack/flock
var statusText;
//Set which species to add
var objectToPlace;
//Text indicates the species to add
var helpText;
//Shows what species could be added
var optionText;
//Whether the game is paused
var isPause=false;
//Skip button
var skip;

//Create function for Phaser game
function create ()
{

    statusText = this.add.text(550, 100, 'Species: -- Health: --', { fontSize: '20px', align: "right", wordWrap: { width: 350, useAdvancedWrap: true},fill: '#000'});
    tiles = Array(tileHeight).fill().map(() => Array(tileWidth).fill(0));
    var options = "Press key to add species ";
    for(s of currentSpecies){
        const info = speciesInfo[s];
        options += s+": "+info.id+ " ";        
    }
    optionText = this.add.text(20, 450, options, 
        { 
            fontSize: '24px',
            align: "left",
            fill: '#000000',
            wordWrap: { width: 600, useAdvancedWrap: true},
        }
    );

    helpText = this.add.text(20, 500, 'Current species to add: --', 
        { 
            fontSize: '24px',
            fill: '#000000',
            wordWrap: { width: 600, useAdvancedWrap: true},
            align: "left",}
    );

    this.input.keyboard.on('keydown-ONE', (event) =>
    {
        objectToPlace = 'Wolf';
        if(currentSpecies.includes('Wolf')){
            helpText.setText("Current species to add: Wolf");
        }
        else{
            helpText.setText("Current species to add: Sorry Wolf is not among your selected species");
        }
    });

    this.input.keyboard.on('keydown-TWO', (event) =>
    {
        objectToPlace = 'Sheep';
        if(currentSpecies.includes('Sheep')){
            helpText.setText("Current species to add: Sheep");
        }
        else{
            helpText.setText("Current species to add: Sorry Sheep is not among your selected species");
        }
    });

    this.input.keyboard.on('keydown-THREE', (event) =>
    {
        objectToPlace = 'Cat';
        if(currentSpecies.includes('Cat')){
            helpText.setText("Current species to add: Cat");
        }
        else{
            helpText.setText("Current species to add: Sorry Cat is not among your selected species");
        }
    });
    this.input.keyboard.on('keydown-FOUR', (event) =>
    {
        objectToPlace = 'Bird';
        if(currentSpecies.includes('Bird')){
            helpText.setText("Current species to add: Bird");
        }
        else{
            helpText.setText("Current species to add: Sorry Bird is not among your selected species");
        }
    });

    //generate tilemap
    map = this.make.tilemap({
        data: tiles,
        tileWidth: 32,
        tileHeight: 32,
    
    });
    marker = this.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.strokeRect(0, 0, 32, 32);

    const tileset = map.addTilesetImage('tile');
    map.createBlankLayer('creatures', tileset);
    init();
    pause = this.add.text(600, 550, 'Pause', { fontSize: '32px', fill: '#000'}).setInteractive({useHandCursor: true}).on('pointerdown', pauseGame);
    skip = this.add.text(350, 550, 'Skip', { fontSize: '32px', fill: '#000'}).setInteractive({useHandCursor: true}).on('pointerdown', quickEndGame);
    
    end = this.add.text(750, 550, 'End', { fontSize: '32px', fill: '#000'}).setInteractive({useHandCursor: true}).on('pointerdown', endGame);
    availableResources = this.add.text(650, 50, "Available resources: "+resources, { fontSize: '24px', align: "right", wordWrap: { width: 250, useAdvancedWrap: true}, fill: '#000'});
    gameDayText = this.add.text(750, 20, "Days: "+day, { fontSize: '24px', align: "right", fill: '#000'});
    
    console.log("init: ");
    console.log(creatures);
    console.log(map.getTileLayerNames());
    console.log(tiles);
    console.log("game: ");
    endText = this.add.text(50, 200, "", { fontSize: '32px', fill: '#000', wordWrap: { width: 600, useAdvancedWrap: true}});
    
}

//update function for Phaser game
function update(time, delta){
    const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);
   
    const pointerTileX = map.worldToTileX(worldPoint.x);
    const pointerTileY = map.worldToTileY(worldPoint.y);

    
    marker.x = map.tileToWorldX(pointerTileX);
    marker.y = map.tileToWorldY(pointerTileY);
    if(creatures.length==0 && emptyStart == false){
        ends=true;
        endText.setText(`All Creatures are dead:( Your ecosystem lasted ${day} days.`);
        localStorage.setItem('countPopulation', JSON.stringify(countPop));
        localStorage.setItem('showGraph', JSON.stringify(true));
    }
    if(time-timer > 100 && ends == false && isPause==false){
        day ++;
        //dayActivity();
        dailyActivity2();
        updatePopulation();
        localStorage.setItem('countPopulation', JSON.stringify(countPop));
        creatures = creatures.filter(function( obj ) {
            return obj.alive;
        });
        
        timer = time;
    }
    availableResources.setText("Available resources: "+resources);
    gameDayText.setText("Days: "+day);
    if(pointerTileY< tileHeight && pointerTileY >= 0 && pointerTileX >= 0 && pointerTileX<tileWidth){
        // console.log("pointer: "+pointerTileX+" "+pointerTileY);
        const iscreature = getCreature(pointerTileX, pointerTileY);
        if(iscreature != null){
            currentCreature = iscreature;
        }
    }
    if (this.input.manager.activePointer.isDown && ends == false && inBound(pointerTileX, pointerTileY))
        {
            if(map.hasTileAt(pointerTileX, pointerTileY)==false){
                console.log("Add"+objectToPlace+" at"+pointerTileX+pointerTileY);
                userAddCreatures2(objectToPlace, pointerTileX, pointerTileY);
            }
            else{
                removeCreatureAt(pointerTileX, pointerTileY);
            }
        }
    if(currentCreature != null){
        statusText.setText('Species: '+currentCreature.species+' Health: '+currentCreature.health+' Age(days): '+currentCreature.age+' Population: '+currentCreature.population+' death rate: '+currentCreature.deathRate+' current location: '+currentCreature.x+', '+currentCreature.y);
    }
}

//Adds creature by mouse click
function userAddCreatures2(species, pointerTileX, pointerTileY){
    if(currentSpecies.includes(species)){
        addNewPacks2(species, speciesInfo[species]['packNum'],pointerTileX, pointerTileY);
    }
}

//fill map after skip, this is used to improve the performance by updating tilemap when skip ends
function fillMapAfterSkip(){
    for(s of creatures){
        if(map.hasTileAt(s.x, s.y)== false){
            const info = speciesInfo[s.species];
            map.putTileAt(info.id, s.x, s.y);
        }
    }
}

//Skip
function quickEndGame(){
    isPause = true;
    doSkip = true;
    while(creatures.length>0 && day<5000){
        day ++;
        //dayActivity();
        dailyActivity2();
        creatures = creatures.filter(function( obj ) {
            return obj.alive;
        });
    }
    fillMapAfterSkip();
    updatePopulation();
    availableResources.setText("Available resources: "+resources);
    gameDayText.setText("Days: "+day);
    localStorage.setItem('countPopulation', JSON.stringify(countPop));
    if(creatures.length > 0){
        endText.setText("Congratulation! Your ecosystem lasted over 5000 days!");
    }
}

//End the game and return to main page
function endGame(){
    window.location.href = 'index.html';
}

//pause the game
function pauseGame(){
    if(isPause){
        isPause = false;
    }
    else{
        isPause = true;
    }
}

