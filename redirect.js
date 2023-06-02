function goBack(){
    window.location.href = 'index.html';     
}

function toGuide(){
    window.location.href = 'guide.html';
}

function toSetup(){
    window.location.href = 'setup.html';
}

function optionHandler(id){
    switch(id){
        case 1:{
            localStorage.setItem("Environment", "15000");
            localStorage.setItem('userChoice', 'false');
            localStorage.setItem("Species", JSON.stringify(["Wolf", "Sheep"]));
            window.location.href = 'population.html';
            break;
        }
        case 2:{
            localStorage.setItem("Environment", "3000");
            localStorage.setItem('userChoice', 'false');
            localStorage.setItem("Species", JSON.stringify(["Cat", "Bird"]));
            window.location.href = 'population.html';
            break;
        }
        case 3:{
            localStorage.setItem('userChoice', 'true');
            window.location.href = 'userChoice.html';
            break;
        }
        default: 
        alert("Default case");
        break;
    }
}