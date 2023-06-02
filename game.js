
let currentSpecies = JSON.parse(localStorage.getItem("Species"));
let currentPopulation = JSON.parse(localStorage.getItem("Populations"));
var day = 0;
var creatures = [];
var population = [];
var tileWidth = 17;
var tileHeight = 14;
var tiles;
var resTiles;
var layer;
var gameDay;
var lastRep = 0;
var ends = false;
var map;
var emptyStart = false;
var countPop = {};
var doSkip = false;
const envResources = {
    Plain: 15000,
    Island: 2000,
}
for (const e of currentPopulation){
    population.push(parseInt(e));
}
var gameSetting = new Object();
var resources;
for(var i=0; i<currentSpecies.length; i++){
    gameSetting[currentSpecies[i]] = parseInt(currentPopulation[i]);
}
gameSetting['Environment'] = parseInt(localStorage.getItem('Environment'));
// for (var i=0; i <currentSpecies.length; i++){
//     const name = document.createTextNode(currentSpecies[i]);
//     var input = document.createElement("input");
//     input.setAttribute('id', currentSpecies[i]);
//     input.setAttribute('name', 'population');
//     input.setAttribute('type', 'number');
//     input.setAttribute('min', '1');
//     input.setAttribute('max', '100');
//     input.setAttribute('value', parseInt(currentPopulation[i]));
//     choices.appendChild(name);
//     choices.appendChild(input);
// }
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
const speciesInfo = {
    Wolf: {
        species: 'Wolf',
        prey: true,
        carnivore: true,
        herbivore: false,
        id: 1,
        preyRate: 1000,
        repNum: 1,
        health: 80,
        repLevel: 60,
        deathLevel: 20,
        repFood: 0.10, //amount of food per day (lbs) according to body weight
        minFood: 0.025,
        maxFood: 0.22,
        //sprite: ,
        food: ['Sheep', 'Bird'],
        repRate: 365,
        distance: 5,
        toPrey: 7,
        lifespan: 600,
        packNum: 10,
        packMax: 18,
        repNum: 0.55,
    },
    Sheep: {
        species: 'Sheep',
        repNum: 1,
        prey: false,
        carnivore: false,
        herbivore: true,
        id: 2,
        repLevel: 50,
        deathLevel: 20,
        energy: 1,
        repFood: 0.1,
        minFood: 0.02,
        maxFood: 0.04,
        food: 'Resources',
        repRate: 365,
        distance: 3,
        toPrey: 1,
        lifespan: 600,
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
        repNum: 2,
        repLevel: 60,
        deathLevel: 20,
        health: 80,
        repFood: 0.1, //amount of food per day (lbs) according to body weight
        minFood: 0.025,
        maxFood: 0.22,
        //sprite: ,
        food: ['Bird'],
        repRate: 360,
        distance: 4,
        lifespan: 600,
        toPrey: 2,
        packNum: 8,
        packMax: 15,
        repNum: 0.65,
    },
    Bird: {
        species: 'Bird',
        id: 4,
        repNum: 5,
        prey: false,
        carnivore: false,
        herbivore: true,
        repLevel: 50,
        deathLevel: 20,
        food: 'Resources',
        repFood: 0.02,
        energy: 0.1,
        minFood: 0.001,
        maxFood: 0.005,
        minRep: 4,
        maxRep: 7,
        repRate: 360,
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
        preyRate: 1000,
        repNum: 1,
        health: 80,
        repLevel: 60,
        deathLevel: 20,
        repFood: 0.15, //amount of food per day (lbs) according to body weight
        minFood: 0.025,
        maxFood: 0.22,
        //sprite: ,
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


const packs = [];
var Insects = {
    minFood: 0.001,
    maxFood: 0.005,
    food: ['Resources'],
};
var animals = [];
function Move(){

}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
var updateText;


function getDistance(x, y, x2, y2){
    return Math.abs(x-x2)+Math.abs(y-y2);
}
function dayActivity(){
    //move
    //eat
    for(var i=0; i<creatures.length; i++){
        var s = creatures[i];
        const info = speciesInfo[s.species];
        s.toRep ++;
        s.age ++;
        if(s.health<30 || s.age > info['lifespan']){
            //updateText.setText(s.species+" at "+s.x+", "+s.y+" died");
            map.removeTileAt(s.x, s.y);
            //creatures.splice(i, 1);
            tiles[s.y][s.x] = 0;
            console.log("dies");
            s.alive = false;
            continue;
        }
        //daily consumption
        s.health -= 3;
        //find food
        s.toPrey  = Math.max(s.toPrey-1, 0);
        if(s.toPrey == 0 && s.alive){
            if(info['prey']==false && resources > 0){
                resources = Math.max(0, resources-info['eatAmount']);

                s.toPrey = info['toPrey'];
                s.health = Math.min(100, s.health+3);
            }
            else if(info['prey'] && s.alive){
                var target = withinRange(s.x, s.y, info.food, info.distance);
                if(target[0] != -1 && target[1] != -1){
                    s.health = Math.min(100, s.health+22);
                    removeCreatureAt(target[0], target[1]);
                    //moveTo(s.x, s.y, target[0], target[1], info.id);
                    //updateText.setText(s.species+" at "+s.x+", "+s.y+" eat "+info.food+" at "+target[0]+", "+target[1]);
                    console.log(s.species+" at "+s.x+", "+s.y+" eat "+info.food+" at "+target[0]+", "+target[1]);
                    // s.x = target[0];
                    // s.y = target[1];
                    s.toPrey = info['toPrey'];
                }
                else{
                    var nearest = findNearestFood(s.x, s.y, info.food);
                    if(nearest[0] != -1 && nearest[1] != -1){
                        //updateText.setText(s.species+" at "+s.x+", "+s.y+" move to "+nearest[0]+", "+nearest[1]+ " for food.");
                        console.log(s.species+" at "+s.x+", "+s.y+" move to "+nearest[0]+", "+nearest[1]+ " for food.");
                        var newX;
                        var newY;
                        if(nearest[0] < s.x){
                            newX = Math.max(0, s.x - info.distance);
                        }
                        else{
                            newX = Math.min(s.x+info.distance, tileWidth-1);
                        }
                        if(nearest[1] < s.y){
                            newY = Math.max(0, s.y - info.distance);
                        }
                        else{
                            newY = Math.min(s.y+info.distance, tileHeight-1);
                        }
                        moveTo(s.x, s.y, newX, newY, info.id);
                        s.x = newX;
                        s.y = newY;
                        s.health --;
                    }
                    else{
                        console.log(s.species+" at "+s.x+", "+s.y+" cannot find food");
                    }
            }}
        }
        if(s.alive){
            if(s.health >= info.repLevel && s.toRep >= info['repRate']){
                const mate = findMate(s.x, s.y, info['distance'], info['id'], s.species);
                if(mate != null){
                    console.log(s.species+" reproduced");
                    console.log(mate);
                    s.toRep = 0;
                    s.health -= 10;
                    mate.toRep = 0;
                    mate.health -= 10;
                    for(var i=0; i<info['repNum']; i++){
                        createNewCreature(s.species);
                    }
                }

            }
        }
    }
    if(day%7 == 0){
        resources = Math.min(envResources[gameSetting['Environment']], resources+Math.ceil(resources*0.5));
    }

}
function findMate(x, y, dis, id, species){
    const minX = Math.max(0, x-dis);
    const maxX = Math.min(tileWidth-1, x+dis);
    const minY = Math.max(0, y-dis);
    const maxY = Math.min(tileHeight-1, y+dis);
    const info = speciesInfo[species];
    for(var i=minX; i<=maxX; i++){
        for(var j=minY; j<=maxY; j++){
            if(tiles[j][i]==id && i!=x && j!= y){
                const s = getCreature(i, j);
                if(s != null && s.alive && s.health >= info.repLevel && s.toRep >= info['repRate']){
                    return s;
                }
            }
        }
    }
    return null;
}
function getCreature(x, y){
    for(s of creatures){
        if(s.x == x && s.y == y){
            return s;
        }
    }
    return null;
}
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
function withinRange(x, y, prey, dis){
    const minX = Math.max(0, x-dis);
    const maxX = Math.min(tileWidth-1, x+dis);
    const minY = Math.max(0, y-dis);
    const maxY = Math.min(tileHeight-1, y+dis);
    for(var i=minX; i<=maxX; i++){
        for(var j=minY; j<=maxY; j++){
            const s = getCreature(i, j);
            if(isPrey(prey, tiles[j][i]) && s.alive){
                return [i, j];
            }
        }
    }
    return [-1, -1];
}
function isPrey(preys, target){
    for(var i=0; i<preys.length; i++){
        if(target==speciesInfo[preys[i]]['id']){
            return true;
        }
    }
    return false;
}
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
    return [-1, -1];
}
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
function createNewCreature(species){
    console.log("Add new "+species);
    var x = getRandomInt(0, tileWidth);
    var y = getRandomInt(0, tileHeight);
    if(tiles[y][x]!=0){
        var newLoc = getEmptySpace();
        x = newLoc[0];
        y = newLoc[1];
    }
    if(x<0 || y<0){
        return;
    }
    switch(species){
        case 'Wolf':
            creatures.push(newCreatures['Wolf']);
            tiles[y][x] = 1;
            if(doSkip==false){
                map.putTileAt(1, x, y);
            }
            break;
        case 'Sheep':
            creatures.push(newCreatures['Sheep']);
            tiles[y][x] = 2;
            if(doSkip==false){
                map.putTileAt(2, x, y);
            }
            break;
        case 'Bird':
            creatures.push(newCreatures['Bird']);
            tiles[y][x] = 4;
            if(doSkip==false){
                map.putTileAt(4, x, y);
            }
            break;
        case 'Cat':
            creatures.push(newCreatures['Cat']);
            tiles[y][x] = 3;
            if(doSkip==false){
                map.putTileAt(3, x, y);
            }
            break;
        case 'Fox':
            creatures.push(newCreatures['Fox']);
            tiles[y][x] = 5;
            if(doSkip==false){
                map.putTileAt(5, x, y);
            }
            break;
    }
}
function inBound(x, y){
    return y>=0 && y<tileHeight && x>=0 && x<tileWidth;
}
//


function addNewPacks2(species, num, x=null, y=null){
    const info = speciesInfo[species];
    const packNums = Math.ceil(num /info['packNum']);
    console.log('user add: '+packNums);
    for(var i=0; i<packNums; i++){
        var pack = {};
        if(x == null || y == null){
            x = getRandomInt(0, tileWidth);
            y = getRandomInt(0, tileHeight);
            if(tiles[y][x]!=0){
                var newLoc = getEmptySpace();
                x = newLoc[0];
                y = newLoc[1];
            }
            if(x<0 || y<0){
                console.log("Unable to add more "+ species);
                return;
            }
        }
        pack = {
            x: x,
            y: y,
            species: species,
            age: 0,
            population: info.packNum,
            deathRate: 1,
            health: 80,
            alive: true,

        }
        creatures.push(pack);
        tiles[y][x] = info.id;
        if(doSkip==false){
            map.putTileAt(info.id, x, y);
        }
        console.log('add '+species+' at '+x+' '+y);
    }
}

function packActivity2(pack, i){
    const info = speciesInfo[pack.species];
    var food = Math.ceil(pack.population * info.repFood);
    console.log("Max food: "+food);
    pack.age ++;
    //find food
    if(pack.age % info.toPrey == 0){
        //need to get food
        if(info['herbivore']==true){
            //preys
            pack.health = Math.max(0, pack.health-3);
            if(resources > 0){
                resources = Math.max(0, resources-food);
                pack.health = Math.min(100, pack.health+5);
                food = Math.floor(food * 0.4);
            }
            else{
                pack.health = Math.max(0, pack.health-3);
            }
            
        }
        if(info['carnivore']){
            //predators
            console.log("food after resources: "+food);
            pack.health = Math.max(0, pack.health-1);
            var target = tryToPrey2(pack.x, pack.y, info.food, info.distance, food);
            console.log("Food after prey: "+target[0]);
            if(target[0] != food){
                //found something to eat
                console.log("Found something to eat");
                console.log(pack.species+" ate "+ target[1]+" preys");
                pack.health = Math.min(100, s.health+25*((food-target[0])/food));
                const newloc = findEmptySpaceAround(target[2][0], target[2][1]);
                if(newloc[0] != -1 && newloc[1] != -1){
                    moveTo(pack.x, pack.y, newloc[0], newloc[1], info.id);
                    pack.x = newloc[0];
                    pack.y = newloc[1];
                }
                //updateText.setText(s.species+" at "+s.x+", "+s.y+" eat "+info.food+" at "+target[0]+", "+target[1]);
                console.log(pack.species+" at "+pack.x+", "+pack.y+" eat "+info.food+" at "+target[0]+", "+target[1]);
            }
            else if (food != 0){
                //no food within range
                console.log("No food within range");
                pack.health = Math.min(100, pack.health-target[1]);
                var nearest = findNearestFood(pack.x, pack.y, info.food);
                if(nearest[0] != -1 && nearest[1] != -1){
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
        if(pack.health >= info.repLevel && pack.age % info['repRate'] == 0 && pack.age / info['repRate'] > 0){
            pack.health -= 10;
            const newborns = Math.ceil(info.repNum * pack.population);
            if(pack.population+newborns<info.packMax){
                pack.population += newborns;
            }
            else{
                pack.population = info.packMax;
                addNewPacks2(pack.species, pack.population+newborns-info.packMax);
            }

        }
    }
    pack.deathRate = Math.max(1, Math.min(100, pack.deathRate - healthToDeathRate(pack.health)));
    //death
    if(pack.age % 7 == 0){
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
                newLoc = [i, j];
                countMovement ++;
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
        resources = Math.min(gameSetting['Environment'], resources+Math.ceil(resources*0.5));
    }
}
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
//place resources id 0
function init(){
    resources = gameSetting['Environment'];
    for(var i=0; i< currentSpecies.length; i++){
        const s = currentSpecies[i];
        countPop[currentSpecies[i]] = [population[i]*speciesInfo[s]['packNum']];
        // console.log(s+population[i]);
        for(var j=0; j<population[i]; j++){
            addNewPacks2(s, speciesInfo[s]['packNum']);
        }
    }
    countPop['Resources'] = [resources];
    countPop['Day'] = [day];
    if(creatures.length==0){
        emptyStart = true;
    }
    localStorage.setItem('countPopulation', JSON.stringify(countPop));
    localStorage.setItem('showGraph', JSON.stringify(false));
}

var config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    // physics: {
    //     default: 'arcade',
    // },
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
var title;
var pause;
var start;
var populations = JSON.parse(localStorage.getItem("Populations"));
var species = JSON.parse(localStorage.getItem("Species"));
var endText;
var speedUp;
// var map;
var availableResources;

var timer = 0;
var marker;
function preload ()
{
    this.load.setBaseURL('http://labs.phaser.io');

    // this.load.image('wolf', 'assets/wolf1.png');
    // this.load.image('sheep', 'assets/sheep.jpg');
    // this.load.image('cat', 'assets/cat.jpeg');
    // this.load.image('bird', 'assets/bird.png');
    // this.load.image('grass', 'assets/grass1.png');
    // this.load.image('ground', 'assets/ground.png');
    //this.load.image('tile', "https://ecosimulator.netlify.app/creatures_images.jpg");
    this.load.image('tile', 'http://localhost:8888/creatures_images.jpg');
    
}

var currentCreature = null;
var statusText;
var objectToPlace;
var helpText;
var optionText;
var isPause=false;
function create ()
{
    // this.add.image(400, 300, 'sky');
    statusText = this.add.text(550, 100, 'Species: -- Health: --', { fontSize: '20px', align: "right", wordWrap: { width: 350, useAdvancedWrap: true},fill: '#000'});
    tiles = Array(tileHeight).fill().map(() => Array(tileWidth).fill(0));
    var options = "Press key to add species ";
    for(s of currentSpecies){
        const info = speciesInfo[s];
        options += s+": "+info.id+ " ";        
    }
    optionText = this.add.text(20, 450, options, { fontSize: '24px',
    align: "left",
    fill: '#000000',
    wordWrap: { width: 600, useAdvancedWrap: true},
    });
    helpText = this.add.text(20, 500, 'Current species to add: --', { fontSize: '24px',
    fill: '#000000',
    wordWrap: { width: 600, useAdvancedWrap: true},
    align: "left",});
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
    //title = this.add.text(200, 16, 'Species Interactions', { fontSize: '32px', fill: '#000'});
    pause = this.add.text(600, 550, 'Pause', { fontSize: '32px', fill: '#000'}).setInteractive({useHandCursor: true}).on('pointerdown', pauseGame);
    speedUp = this.add.text(350, 550, 'Skip', { fontSize: '32px', fill: '#000'}).setInteractive({useHandCursor: true}).on('pointerdown', quickEndGame);
    // const text = this.add.text(450, 550, 'Days to skip', { color: 'black', fontSize: '20px '});

    // const element = this.add.dom(450, 550).createFromCache('nameform');

    start = this.add.text(750, 550, 'End', { fontSize: '32px', fill: '#000'}).setInteractive({useHandCursor: true}).on('pointerdown', endGame);
    availableResources = this.add.text(650, 50, "Available resources: "+resources, { fontSize: '24px', align: "right", wordWrap: { width: 250, useAdvancedWrap: true}, fill: '#000'});
    gameDay = this.add.text(750, 20, "Days: "+day, { fontSize: '24px', align: "right", fill: '#000'});
    
    console.log("init: ");
    console.log(creatures);
    console.log(map.getTileLayerNames());
    console.log(tiles);
    console.log("game: ");
    endText = this.add.text(50, 200, "", { fontSize: '32px', fill: '#000', wordWrap: { width: 600, useAdvancedWrap: true}});
        

    //updateText = this.add.text(50, 100, 'Game begin', { fontSize: '20px', fill: '#000'}).setInteractive({useHandCursor: true}).on('pointerdown', endGame);
    

    
}
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
        // console.log(creatures.length);
        // if(creatures.length==1 || day > 400){
        //     console.log(creatures);
        // }
        timer = time;
    }
    availableResources.setText("Available resources: "+resources);
    gameDay.setText("Days: "+day);
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
function userAddCreatures2(species, pointerTileX, pointerTileY){
    if(currentSpecies.includes(species)){
        addNewPacks2(species, speciesInfo[species]['packNum'],pointerTileX, pointerTileY);
    }
}
function fillMapAfterSkip(){
    for(s of creatures){
        if(map.hasTileAt(s.x, s.y)== false){
            const info = speciesInfo[s.species];
            map.putTileAt(info.id, s.x, s.y);
        }
    }
}
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
    gameDay.setText("Days: "+day);
    localStorage.setItem('countPopulation', JSON.stringify(countPop));
    if(creatures.length > 0){
        endText.setText("Congratulation! Your ecosystem lasted over 5000 days!");
    }
}
function endGame(){
    window.location.href = 'index.html';
}
function pauseGame(){
    if(isPause){
        isPause = false;
    }
    else{
        isPause = true;
    }
}

