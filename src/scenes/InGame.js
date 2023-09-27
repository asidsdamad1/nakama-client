import CONFIG from "../config"
import Nakama from "../nakama"

export default class InGame extends Phaser.Scene {
    constructor() {
        super("in-game");
        this.INDEX_TO_POS;
        this.headerText;
        this.gameStarted = false;
        this.turn = false;
        this.phaser = this
        this.playerPos;
    }

    //ep4
    updateBoard(board) {
        board.forEach((element, index) => {
            let newImage = this.INDEX_TO_POS[index]

            if (element === 2) {
                this.phaser.add.image(newImage.x, newImage.y, "O");
            } else if (element === 1) {
                this.phaser.add.image(newImage.x, newImage.y, "X");
            }
        })
    }

    clearBoard() {
        this.phaser.children.each(function(child) {
            if (child instanceof Phaser.GameObjects.Image) {
                child.destroy();
            }
        });
    }

    updatePlayerTurn() {
        this.playerTurn = !this.playerTurn

        if (this.playerTurn) {
            this.headerText.setText("Your turn!")
        } else {
            this.headerText.setText("Opponents turn!")
        }
    }

    setPlayerTurn(data) {
        let userId = localStorage.getItem("user_id");
        if (data.marks[userId] === 1) {
            this.playerTurn = true;
            this.playerPos = 1;
            this.headerText.setText("Your turn!")
        } else {
            this.playerPos = 2;
            this.headerText.setText("Opponents turn!")
        }
    }

    endGame(data) {
        this.updateBoard(data.board)
        console.log("data end game =====> ", data)
        console.log("player pos: ",this.playerPos)
        if (data.winner === this.playerPos) {
            this.headerText.setText("Winner!")
        } else {
            this.headerText.setText("You loose :(")
        }
    }

    //ep4
    nakamaListener() {

        // Nakama.socket.addMatchmaker("*", 2, 2);
        // Nakama.socket.onmatchmakermatched = (matched) => {
        //     console.info("Received MatchmakerMatched message: ", matched);
        //     console.info("Matched opponents: ", matched.users);
        // };

        // Nakama.client.deleteNotifications(Nakama.session, "f921c74d-8cab-4054-827c-f76cd030071f")
        // Nakama.socket.onmatchmakermatched = (matched) => {
        //     console.info("Received MatchmakerMatched message: ", matched);
        //     const matchId = null;
        //     Nakama.socket.joinMatch(matchId, matched.token);
        // };


        console.log(Nakama.socket)
        Nakama.socket.onnotification = (notification) => {
            console.log("Received: ", notification);
            console.log("Notification content: ", notification.content);
            console.log("socket user: ", Nakama.session.user_id)
            if (notification.content.playerId !== notification.content.ownerId) {
                if (confirm(notification.subject)) {
                    // Nakama.notify(notification.content.matchId, notification.content.playerId, true,notification.content.playerId, Nakama.session.username)
                    Nakama.socket.joinMatch(notification.content.matchId)
                } else {

                }
            }


            if (notification.content.accept) {
                Nakama.joinMatch(notification.content.matchId, null, {accept: 'true'})
            }
        };

        var connectedOpponents = [];
        Nakama.socket.onmatchpresence = (presences) => {
            console.log("Presences: ====> ", presences)
            // Remove all users who left.
            connectedOpponents = connectedOpponents.filter(function(co) {
                var stillConnectedOpponent = true;

                presences.leaves.forEach((leftOpponent) => {
                    if (leftOpponent.user_id === co.user_id) {
                        stillConnectedOpponent = false;
                    }
                });

                return stillConnectedOpponent;
            });

            // Add all users who joined.
            connectedOpponents = connectedOpponents.concat(presences.joins);
        };

        Nakama.socket.onmatchdata = (result) => {

            console.log("result: ", result)
            const json_string = new TextDecoder().decode(result.data)
            const json = json_string ? JSON.parse(json_string) : ""

            switch (result.op_code) {
                case 1:
                    this.clearBoard()
                    this.gameStarted = true
                    this.setPlayerTurn(json)
                    break;
                case 2:
                    this.updateBoard(json.board)
                    this.updatePlayerTurn()
                    break;
                case 3:
                    this.endGame(json)

                    break;
            }
        };
    }

    preload() {
        this.load.image("X", "assets/X.png");
        this.load.image("O", "assets/O.png");
    }

    create() {

        this.headerText = this.add
            .text(CONFIG.WIDTH / 2, 125, "Waiting for game to start", {
                fontFamily: "Arial",
                fontSize: "36px",
            })
            .setOrigin(0.5);

        const gridWidth = 300;
        const gridCellWidth = gridWidth / 3;

        const grid = this.add.grid(
            CONFIG.WIDTH / 2,
            CONFIG.HEIGHT / 2,
            gridWidth,
            gridWidth,
            gridCellWidth,
            gridCellWidth,
            0xffffff,
            0,
            0xffca27
        );

        const gridCenterX = grid.getCenter().x;
        const gridCenterY = grid.getCenter().y;

        const topY = gridCenterY - gridCellWidth;
        const bottomY = gridCenterY + gridCellWidth;

        const gridLeft = gridCenterX - gridCellWidth
        const gridRight = gridCenterX + gridCellWidth

        this.INDEX_TO_POS = {
            0: {'x': gridLeft, 'y': topY},
            1: {'x': gridCenterX, 'y': topY},
            2: {'x': gridRight, 'y': topY},

            3: {'x': gridLeft, 'y': gridCenterY},
            4: {'x': gridCenterX, 'y': gridCenterY},
            5: {'x': gridRight, 'y': gridCenterY},

            6: {'x': gridLeft, 'y': bottomY},
            7: {'x': gridCenterX, 'y': bottomY},
            8: {'x': gridRight, 'y': bottomY}
        }

        this.nakamaListener()

        this.add
            .rectangle(
                gridCenterX - gridCellWidth,
                topY,
                gridCellWidth,
                gridCellWidth
            )
            .setInteractive({useHandCursor: true})
            .on("pointerdown", async () => {
                await Nakama.makeMove(0)
            });

        this.add
            .rectangle(gridCenterX, topY, gridCellWidth, gridCellWidth)
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(1)
            });

        this.add
            .rectangle(
                gridCenterX + gridCellWidth,
                topY,
                gridCellWidth,
                gridCellWidth
            )
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(2)
            });

        this.add
            .rectangle(
                gridCenterX - gridCellWidth,
                gridCenterY,
                gridCellWidth,
                gridCellWidth
            )
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(3)
            });

        this.add
            .rectangle(gridCenterX, gridCenterY, gridCellWidth, gridCellWidth)
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(4)
            });

        this.add
            .rectangle(
                gridCenterX + gridCellWidth,
                gridCenterY,
                gridCellWidth,
                gridCellWidth
            )
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(5)
            });

        this.add
            .rectangle(
                gridCenterX - gridCellWidth,
                bottomY,
                gridCellWidth,
                gridCellWidth
            )
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(6)
            });

        this.add
            .rectangle(gridCenterX, bottomY, gridCellWidth, gridCellWidth)
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(7)
            });

        this.add
            .rectangle(
                gridCenterX + gridCellWidth,
                bottomY,
                gridCellWidth,
                gridCellWidth
            )
            .setInteractive({useHandCursor: true})
            .on("pointerdown", () => {
                Nakama.makeMove(8)
            });
    }
}