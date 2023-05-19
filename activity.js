
function addNewPacks1(species, num, x=null, y=null){
    const info = speciesInfo[species];
    const packNums = Math.ceil(num /info['packNum']);
    for(var i=0; i<packNums; i++){
        var pack = {};
        if(x == null || y == null){
            var x = getRandomInt(0, tileWidth);
            var y = getRandomInt(0, tileHeight);
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
        pack.x = x;
        pack.y = y;
        pack.species = species;
        pack.members = [];
        pack.population = info.packNum;
        if(i == packNums-1){
            pack.population = num % info.packNum;
        }
        for(var j=0; j<pack.population; j++){
            pack.members.push(newCreatures[species]);
        }
    }
}

function packActivity1(pack, i){
    const info = speciesInfo[pack.species];
    const food = pack.population * info.
}

function dailyActivity1(){
    for(var i=0; i<creatures; i++){
        packActivity1(creatures[i], i);
    }
}



function addNewPacks2(species, num, x=null, y=null){
    const info = speciesInfo[species];
    const packNums = Math.ceil(num /info['packNum']);
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
        map.putTileAt(info.id, x, y);
    }
}

function packActivity2(pack, i){
    const info = speciesInfo[pack.species];
    const food = Math.ceil(pack.population * info.repFood);
    pack.age ++;
    pack.health -= 3;
    //find food
    if(pack.age % info.toPrey == 0){
        //need to get food
        if(info['prey']==false && resources > 0){
            //preys
            resources = Math.max(0, resources-food);
            pack.health = Math.min(100, pack.health+3);
        }
        else{
            //predators
            var target = tryToPrey2(pack.x, pack.y, info.food, info.distance, food);
            if(target[0] != food){
                //found something to eat
                pack.health = Math.min(100, s.health+25*(target[0]/food)-target[1]);
                //tiles[target[3][1]][target[3][1]] = 0;
                moveTo(pack.x, pack.y, target[3][0], target[3][1], info.id);
                //updateText.setText(s.species+" at "+s.x+", "+s.y+" eat "+info.food+" at "+target[0]+", "+target[1]);
                console.log(pack.species+" at "+pack.x+", "+pack.y+" eat "+info.food+" at "+target[0]+", "+target[1]);
                pack.x = target[0];
                pack.y = target[1];
            }
            else {
                //no food within range
                pack.health = Math.min(100, s.health-target[1]);
                var nearest = findNearestFood(pack.x, pack.y, info.food);
                if(nearest[0] != -1 && nearest[1] != -1){
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
                }
            }
        }
    }
    //reproduce
    if(pack.alive){
        if(pack.health >= info.repLevel && pack.age % info['repRate'] == 0 && pack.age / info['repRate'] > 0){
            pack.health -= 10;
            const newborns = info.repNum * pack.population;
            if(pack.population+newborns<info.packMax){
                pack.population += newborns;
            }
            else{
                pack.population = info.packMax;
                addNewPacks2(pack.species, pack.population+newborns-info.packMax);
            }

        }
    }
    pack.deathRate += healthToDeathRate(pack.health);
    //death
    const death = 0;
    for(var j=0; j<pack.population; j++){
         death = getRandomInt(0, 100);
         if(death <= pack.deathRate){
            pack.population --;
         }
    }
    if(pack.population == 0 || pack.health < info['deathLevel']){
        pack.alive = false;
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
                if(food > s.population*speciesInfo[s.species]['energy']){
                    s.population -= Math.floor(food/speciesInfo[s.species]['energy']);
                    return [0, countMovement, newLoc];
                }
                else{
                    food -= s.population*speciesInfo[s.species]['energy'];
                    s.population = 0;
                    s.alive = false;
                    tiles[j][i] = 0;
                    map.removeTileAt(i, j);
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
                console.log("find: "+food);
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
    for(var i=0; i<creatures; i++){
        if(creatures[i].population > 0){
            packActivity2(creatures[i], i);
        }
        else{
            creatures[i].alive = false;
        }
    }
    if(day%7 == 0){
        resources = Math.min(envResources[gameSetting['Environment']], resources+Math.ceil(resources*0.5));
    }
}
function healthToDeathRate(val){
    if(val >= 90){
        return -2;
    }
    else if(val >= 80){
        return -1;
    }
    else if(val >= 70){
        return 0;
    }
    else if(val >= 60){
        return 2;
    }
    else if(val >= 50){
        return 3;
    }
    else if(val >= 40){
        return 5;
    }
    else{
        return 7;
    }
}
