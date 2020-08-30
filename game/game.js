class Game {
    constructor(boardSize, tileSize, centerX, centerY) {
        this.grid = this.generateGrid(boardSize, tileSize, centerX, centerY);

        this.bMoves = [];
        this.wMoves = [];
        this.legalMoves = [];
        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                this.legalMoves.push([i, j]);
            }
        }
        this.mostRecentTile = null;

        this.winningTiles = [];
    }

    processMove(i, j, player) {
        if (player == "black") {
            this.bMoves.push([i, j]);
        }
        else {
            this.wMoves.push([i, j]);
        }

        this.legalMoves = this.legalMoves.filter(loc => loc[0] != i || loc[1] != j);
        this.grid[i][j].color = player;

        this.mostRecentTile = this.grid[i][j];
    }

    findClosestTile(x, y) {
        let closest = Infinity;
        let closestTile;

        for (let i = 0; i < this.grid.length; i++) {
            for (let j = 0; j < this.grid[i].length; j++) {
                let distance = dist(x, y, this.grid[i][j].pos.x, this.grid[i][j].pos.y);
                if (distance < closest) {
                    closest = distance;
                    closestTile = this.grid[i][j];
                }
            }
        }

        if (closestTile.color != "empty") return null;
        if (closest > this.grid[0][0].radius) return null;

        return closestTile;
    }

    checkWinner(i, j) {
        let straightPieces = this.getHorizontalPieces(i, j);
        let diagonalUpPieces = this.getDiagonalUpPieces(i, j);
        let diagonalDownPieces = this.getDiagonalDownPieces(i, j);

        if (Math.max(straightPieces.length, diagonalUpPieces.length, diagonalDownPieces.length) >= 4) {
            if (straightPieces.length >= 4) {
                for (let tile of straightPieces) {
                    if (this.winningTiles.includes(tile) == false) this.winningTiles.push(tile);
                }
            }
            if (diagonalUpPieces.length >= 4) {
                for (let tile of diagonalUpPieces) {
                    if (this.winningTiles.includes(tile) == false) this.winningTiles.push(tile);
                }
            }
            if (diagonalDownPieces.length >= 4) {
                for (let tile of diagonalDownPieces) {
                    if (this.winningTiles.includes(tile) == false) this.winningTiles.push(tile);
                }
            }

            return true;
        }
        else if (Math.max(straightPieces.length, diagonalUpPieces.length, diagonalDownPieces.length) == 3) {
            if (straightPieces.length == 3) {
                for (let tile of straightPieces) {
                    if (this.winningTiles.includes(tile) == false) this.winningTiles.push(tile);
                }
            }
            if (diagonalUpPieces.length == 3) {
                for (let tile of diagonalUpPieces) {
                    if (this.winningTiles.includes(tile) == false) this.winningTiles.push(tile);
                }
            }
            if (diagonalDownPieces.length == 3) {
                for (let tile of diagonalDownPieces) {
                    if (this.winningTiles.includes(tile) == false) this.winningTiles.push(tile);
                }
            }

            return false;
        }
        return null;
    }

    getHorizontalPieces(i, j) {
        let totalTiles = [this.grid[i][j]];

        let current = this.grid[i][j];

        // TO THE RIGHT
        while (true) {
            if (this.grid[i][current.indexJ + 1] == undefined) break;

            current = this.grid[i][current.indexJ + 1];
            if (current.color != this.grid[i][j].color) break;

            totalTiles.push(current);
        }

        current = this.grid[i][j];
        // TO THE LEFT
        while (true) {
            if (this.grid[i][current.indexJ - 1] == undefined) break;

            current = this.grid[i][current.indexJ - 1];
            if (current.color != this.grid[i][j].color) break;

            totalTiles.push(current);
        }

        return totalTiles;
    }

    getDiagonalUpPieces(i, j) {
        let totalTiles = [this.grid[i][j]];

        let current = this.grid[i][j];

        // TO THE RIGHT
        while (true) {
            if (this.grid[current.indexI - 1] == undefined) break;

            let nextJ = current.indexJ;
            if (this.grid[current.indexI - 1].length > this.grid[current.indexI].length) {
                nextJ = current.indexJ + 1;
            }

            if (this.grid[current.indexI - 1][nextJ] == undefined) break;

            current = this.grid[current.indexI - 1][nextJ];
            if (current.color != this.grid[i][j].color) break;

            totalTiles.push(current);
        }

        current = this.grid[i][j];
        // TO THE LEFT 
        while (true) {
            if (this.grid[current.indexI + 1] == undefined) break;

            let nextJ = current.indexJ;
            if (this.grid[current.indexI + 1].length < this.grid[current.indexI].length) {
                nextJ = current.indexJ - 1;
            }

            if (this.grid[current.indexI + 1][nextJ] == undefined) break;
            
            current = this.grid[current.indexI + 1][nextJ];
            if (current.color != this.grid[i][j].color) break;
            
            totalTiles.push(current);
        }
        
        return totalTiles;
    }

    getDiagonalDownPieces(i, j) {
        let totalTiles = [this.grid[i][j]];

        let current = this.grid[i][j];

        // TO THE RIGHT
        while (true) {
            if (this.grid[current.indexI + 1] == undefined) break;

            let nextJ = current.indexJ;
            if (this.grid[current.indexI + 1].length > this.grid[current.indexI].length) {
                nextJ = current.indexJ + 1;
            }

            if (this.grid[current.indexI + 1][nextJ] == undefined) break;

            current = this.grid[current.indexI + 1][nextJ];
            if (current.color != this.grid[i][j].color) break;

            totalTiles.push(current);
        }

        current = this.grid[i][j];
        // TO THE LEFT
        while (true) {
            if (this.grid[current.indexI - 1] == undefined) break;

            let nextJ = current.indexJ;
            if (this.grid[current.indexI - 1].length < this.grid[current.indexI].length) {
                nextJ = current.indexJ - 1;
            }

            if (this.grid[current.indexI - 1][nextJ] == undefined) break;

            current = this.grid[current.indexI - 1][nextJ];
            if (current.color != this.grid[i][j].color) break;

            totalTiles.push(current);
        }

        return totalTiles;
    }

    generateGrid(boardSize, tileSize, centerX, centerY) {
        let grid = [];
        let amount = boardSize * 2 - 1;
        for (let i = 0; i < amount; i++) {
            grid[i] = [];
            
            let apothem = tileSize * Math.cos(PI/6);
            let limit = amount - Math.abs(i - boardSize + 1);
            let startX = centerX - (0.5 * limit - 0.5) * apothem * 2;
            let startY = centerY - (apothem/2 + tileSize) * (boardSize - i - 1);
            for (let j = 0; j < limit; j++) {
                let tile = new Tile(i, j, startX + apothem * 2 * j, startY, tileSize);
                grid[i].push(tile);
            }
        }
        return grid;
    }

    /*
    generateGrid(radius, centerX, centerY, tileSize) {
        let rows = [];
        let amount = radius * 2 - 1;
        for (let i = 0; i < amount; i++) {
            rows[i] = [];
            
            let apothem = tileSize * Math.cos(PI/6);
            let limit = amount - Math.abs(i - radius + 1);
            let startX = centerX - (0.5 * limit - 0.5) * apothem * 2;
            let startY = centerY - (apothem/2 + tileSize) * (radius - i);
            for (let j = 0; j < limit; j++) {
                let tile = new Tile(startX + apothem * 2 * j, startY, tileSize, i, j);
                rows[i].push(tile);
            }
        }
        return rows;
    }*/
}