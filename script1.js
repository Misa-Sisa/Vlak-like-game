import { levels } from "./levels.js";

// 1. Spielfeldveriablen definieren
let wagons = [];
let wall;
let maxWagons = 0;
const game = document.getElementById("game");
const intro = document.getElementById("intro");
const gridSize = 20; // Spielfeld 20x20
let headX = 2; // Anfangsposition des Zugkopfes (X)
let headY = 2; // Anfangsposition des Zugkopfes (Y)
let direction = "right";
let moveInterval;
let counter = 0;
let roundCounter = 0;

let currentLevel;

let collectible = null; // Wagon zum einsammeln

let highScore = localStorage.getItem("highScore");

const description = document.getElementById("description");
let showHighScore = document.createElement("p");
showHighScore.id = "highScore";
if (highScore === "" || highScore === null || isNaN(Number(highScore))) {
    highScore = 0;
} else {
    highScore = Number(highScore);
}
showHighScore.textContent = `your highscore is: ${highScore}`;
description.appendChild(showHighScore);

let startExtraLevelInterval;

// 2. Spielfeld zeichnen

function startGame(levelIndex = Math.floor(Math.random() * levels.length)) {
    currentLevel = levelIndex;
    console.log(currentLevel);

    wall = [...createWall(), ...levels[currentLevel].walls]; // .walls, weil diese in levels.js unter diesen Namen deklariert sind. || THE SPREAD (...) OPERATOR wird hier benutzt

    wagons = [];
    maxWagons = 0;
    collectible = null;
    direction = "right";
    counter = roundCounter * 10;
    roundCounter++;

    if (roundCounter === 5 || roundCounter === 6) {
        alert("Alles ist anders!");
        headX = 18;    
        headY = 2;
    } else {
        headX = 2; 
        headY = 2;
    }

    
    let moveSpeed = normalSpeed;

     // intro.remove(); - Intor aus dem DOM entfernen
    intro.style.display = "none";
    game.classList.add("grid-mode"); // die class mit dem Namen "grid-mode" wird erstellt

    clearInterval(moveInterval); // Das Interval wird gestoppt

    placeCollectible();
    createGrid();
    moveInterval = setInterval(moveTrain, moveSpeed); // Das Interval = Zug-Bewegund wird gestartet

    if (roundCounter === 3 || roundCounter === 6) {
        alert("Du hast das BONUS Level erreicht!");
        startExtraLevelInterval = setInterval(startExtraLevel, 100);
    } else if (roundCounter !== 3 && roundCounter !== 6) {
        clearInterval(startExtraLevelInterval);
        document.body.classList.remove("toggleColor");
    }

}

function loadLevel(index) {
    startGame(index);
}

function createWall() {    // Die Wandkoordinaten werden erzeugt
    const walls = [];

    for (let i = 0; i < gridSize; i++) {
        // Obere Wand (y = 0)
        walls.push ({x: i, y :0});

        // Untere Wand (y = gridSize - 1)
        walls.push ({x: i, y: gridSize - 1});

        // Linke Wand (x = 0)
        walls.push ({x: 0, y: i});

        // Rechte Wand (x = gridSize -1)
        walls.push ({x: gridSize - 1, y: i});
    }

    return walls;
}

function createGrid () {

    const cells = document.querySelectorAll(".cell"); // finde alle .cell - Elemente
    cells.forEach(cell => cell.remove()); // für jeden gefundenen .cell-Element, entferne sie aus dem DOM

    // hat der Kopf einen einsammelbaren Wagon berührt?
    if (collectible && headX === collectible.x && headY === collectible.y) {
        maxWagons++;
        placeCollectible();
        counter++;

        if (maxWagons >= 10) {
            clearInterval(moveInterval);
            alert(`level ${roundCounter} hast du geschafft! Weiter mit ENTER`);
            if (currentLevel >= levels.length) {
                alert("Du hast gewonnen");
                return startMenu();
            }
            loadLevel(Math.floor(Math.random() * levels.length));
            return;
        }
    }

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {

            // Neue Zelle erstellen
            const cell = document.createElement("div"); // erstellt ein neues <div> Element
            cell.classList.add("cell"); // alle erstellten <div> Elemente haben die class = "cell"

            // Wenn Position = Zugkopf -> grüne Farbe
            if (x === headX && y === headY){
                cell.classList.add("train-head"); // class = "cell train-head"
            }
        
            // Wände zeichnen
            for (let i = 0; i < wall.length; i++) {
                if ( x === wall[i].x && y === wall[i].y) {
                    cell.classList.add("wall");
                }
            }

            for (let i = 0; i < wagons.length; i++) {
                if (x === wagons[i].x && y === wagons[i].y) {
                    cell.classList.add("train-wagon");
                }
            }

            //Einsammelbare Waggons zeichnen
            if (collectible && x === collectible.x && y === collectible.y) {
                cell.classList.add("collectible");
            }


            // Zellen ins Spielfeld einfügen
            game.appendChild(cell); // Zelle wird ins HTML-DOM eingesertzt
        }
    }

    document.getElementById("counter").textContent = counter;

    if (counter > highScore) {
        highScore = counter;
        localStorage.setItem("highScore", highScore);
        showHighScore.textContent = `your highscore is: ${highScore}`;
    }
}

// 2.1 Zufalls-Waggon erzeugen

function placeCollectible () {
    collectible = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
    };

    if (collectible.x === headX && collectible.y === headY) { // verhindere, dass der neue Wagon auf dem Kopf erscheint
        placeCollectible(); // noch mal versuchen
    }

    for (let i = 0; i < wall.length; i++) {
        if (collectible.x === wall[i].x && collectible.y === wall[i].y) { 
            placeCollectible();
        }
    }

    for (let i = 0; i < wagons.length; i++) {
        if (collectible.x === wagons[i].x && collectible.y === wagons[i].y) { 
            placeCollectible(); // noch mal versuchen
        }
    }
}

function moveTrain() {
    wagons.unshift({ x: headX, y: headY});  // unshift Methode fügt die Position des Zugkopfes 
                                            // (headX, headY) ganz vorne in das Array
        if (wagons.length > maxWagons) {
            wagons.pop();
        }
    
    // switch (direction) {
    //     case "up": headY--; break;
    //     case "down": headY++; break;
    //     case "left": headX--; break;
    //     case "right": headX++; break;
    // }

    if (roundCounter === 5 || roundCounter === 6) {
        switch (direction) {
            case "up": headY++; break;
            case "down": headY--; break;
            case "left": headX++; break;
            case "right": headX--; break;
        }
    } else {
        switch (direction) {
            case "up": headY--; break;
            case "down": headY++; break;
            case "left": headX--; break;
            case "right": headX++; break;
    }
    }

    for (let i = 0; i < wagons.length; i++) {

        if (headX === wagons[i].x && headY === wagons[i].y) {
            alert (`Du hast ${counter} Wagons eingesammelt. Versuche es noch mal!`);
            return startMenu();
        };
    }

    for (let i = 0; i < wall.length; i++) {

        if (headX === wall[i].x && headY === wall[i].y) {
            alert (`Du hast ${counter} Wagons eingesammelt. Versuche es noch mal!`);
            return startMenu();
        };

    }

    createGrid();
}

function startMenu() {

    clearInterval(moveInterval); // Stoppe die automatische Bewegung 
    clearInterval(startExtraLevelInterval);
    document.body.classList.remove("toggleColor");
    headX = 2; 
    headY = 2;
    wagons = [];
    maxWagons = 0;
    collectible = null;
    direction = "right";
    counter = 0;
    roundCounter = 0;

    game.classList.remove("grid-mode");
    
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.remove());

    intro.style.display = "block";
};

    // 3. Tastatur-Steuerung

    /*
    So ist das Grid aufgebaut:
    
    x ->
    y ↓
        + . . . . . . . . . . . . . . +
        | 0,0 | 1,0 | 2,0 |....| 19,0 |
        | 0,1 | 1,1 | 2,1 |....| 19,1 |
        .   .   .   .   .   .   .   .   .   .
        .   .   .   .   .   .   .   .   .   .
        .   .   .   .   .   .   .   .   .   .
        | 0,19 | 1,19 | 2, 19 | ... | 19,19 |
 

    */

let normalSpeed = 200;
let fastSpeed = 50;
let slowSpeed = 400;
let moveSpeed = normalSpeed;

document.addEventListener("keydown", function(event) {

    if(event.code === "Space" && !event.repeat) { // event.repeat verhindert mehrfaches Auslösen beim Halten
        if (roundCounter !== 5 && roundCounter !== 6) {
            moveSpeed = fastSpeed;
            clearInterval(moveInterval);
            moveInterval = setInterval (moveTrain, moveSpeed);
        } else {
            moveSpeed = slowSpeed;
            clearInterval(moveInterval);
            moveInterval = setInterval (moveTrain, moveSpeed);
        }
    }

    function isCollisionWithWagons (x, y) { // Ist auf der Position (x, y) ein Wagon?
        return wagons.some(w => w.x === x && w.y === y); // return wagons.some( function(w) {return w.x === x && w.y === y;})
    } // Outpus is true/flase

    switch (event.code) {    // switch ist eine Art if/else für mehrere Fälle
        case "ArrowUp":
        case "KeyW":
            direction = "up";
            break;
        case "ArrowDown":
        case "KeyS":
            direction = "down";
            break;
        
        case "ArrowLeft":
        case "KeyA":
            direction = "left";
            break;
        case "ArrowRight":
        case "KeyD":
            direction = "right";
            break;
    }
});

document.addEventListener("keyup", function(event) {

    if(event.code === "Space") {
        moveSpeed = normalSpeed;
        clearInterval(moveInterval);
        moveInterval = setInterval (moveTrain, moveSpeed);
    }
});

document.getElementById("start").addEventListener("click", () => {

    startGame(Math.floor(Math.random() * levels.length));

});

document.getElementById("reset").addEventListener("click", () => {
    localStorage.removeItem("highScore");
    window.location.reload();
});

document.addEventListener("keydown", (evt) => {
    if (evt.code === "Enter" && intro.style.display !== "none") {
        document.getElementById("start").click();
    }
});


document.getElementById("menu").addEventListener("click", () => startMenu());

document.getElementById("counter").textContent = counter;

function startExtraLevel() {
    document.body.classList.toggle("toggleColor");
}

// createGrid(); // die Funktion createGrid wird aufgerufen
