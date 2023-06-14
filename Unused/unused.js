//This dosc saves some unused functions/styling. They are no longer in use in the current version but kept for records.

//Original function that process daily activity when each tile stands for one creature
//Abandoned as each tile now represents a pack/flock
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

//find a mate nearby
//It's used when when each tile stands for one creature now abandoned as each tile now represents a pack/flock
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


//Create a new creature as specified
function createNewCreature(species){
  console.log("Add new "+species);
  //generate a random location
  var x = getRandomInt(0, tileWidth);
  var y = getRandomInt(0, tileHeight);
  //check if its an empty tile
  if(tiles[y][x]!=0){
      //The random location is occupied, find an empty tile in the map
      var newLoc = getEmptySpace();
      x = newLoc[0];
      y = newLoc[1];
  }

  if(x<0 || y<0){
      //no empty tiles available
      return;
  }
  //creature creatures
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
