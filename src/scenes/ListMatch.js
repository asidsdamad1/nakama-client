import CONFIG from "../config"
import Nakama from "../nakama"

export default class ListMatch extends Phaser.Scene {
    constructor() {
        super("list-match");
        this.rooms = [];
    }

    create() {
        const headerStyle = {
            fontFamily: "Arial",
            fontSize: "20px",
            fontStyle: "bold",
        };

        this.headerText = this.add
            .text(CONFIG.WIDTH / 2, 125, "Room", {
                fontFamily: "Arial",
                fontSize: "36px",
            })
            .setOrigin(0.5);

        console.log("notifications: ", Nakama.client.listNotifications(Nakama.session, 10))

        const createBtn = this.add
            .rectangle(CONFIG.WIDTH / 2, 800, 225, 70, 0xffca27)
            .setInteractive({ useHandCursor: true });
        const createBtnText = this.add
            .text(CONFIG.WIDTH / 2, 800, "Create", {
                fontFamily: "Arial",
                fontSize: "36px",
            })
            .setOrigin(0.5);

        createBtn.on("pointerdown", () => {
            Nakama.createMatch();
            this.scene.start("in-game");
        });
        createBtn.on("pointerover", () => {
            createBtn.setScale(1.1);
            createBtnText.setScale(1.1);
        });

        createBtn.on("pointerout", () => {
            createBtn.setScale(1);
            createBtnText.setScale(1);
        });

        Nakama.listMatches().then(res => {
            this.rooms = res.matches;

            const tableGroup = this.add.group(); // Group to hold the table rows

            const headerNameText = this.add
                .text(CONFIG.WIDTH / 2 - 150, 185, "Match Name", headerStyle)
                .setOrigin(0.5);
            const headerSizeText = this.add
                .text(CONFIG.WIDTH / 2, 185, "Size", headerStyle)
                .setOrigin(0.5);
            const headerStatusText = this.add
                .text(CONFIG.WIDTH / 2 + 150, 185, "Action", headerStyle)
                .setOrigin(0.5);


            tableGroup.addMultiple([headerNameText, headerSizeText, headerStatusText]);

            for (let i = 0; i < this.rooms.length; i++) {
                console.log(this.rooms[i])
                let label = JSON.parse(this.rooms[i].label)
                let rowNameText = 0;
                let rowSizeText = 0;
                if (this.rooms[i].size !== undefined) {
                    rowNameText = this.add
                        .text(CONFIG.WIDTH / 2 - 150, 225 + i * 40,  label.matchName !== null ? label.matchName : "Room " + (i+1), {
                            fontFamily: "Arial",
                            fontSize: "20px",
                        })
                        .setOrigin(0.5);

                    rowSizeText = this.add
                        .text(CONFIG.WIDTH / 2, 225 + i * 40, this.rooms[i].size + "/2", {
                            fontFamily: "Arial",
                            fontSize: "20px",
                        })
                        .setOrigin(0.5);

                    // Create a button-like appearance for the status attribute
                    const statusButton = this.add.rectangle(
                        CONFIG.WIDTH / 2 + 150,
                        225 + i * 40,
                        80,
                        30,
                        0xffca27
                    );
                    statusButton.setInteractive(); // Enable interactivity

                    const statusText = this.add
                        .text(statusButton.x, statusButton.y, "Join", {
                            fontFamily: "Arial",
                            fontSize: "14px",
                            color: "#ffffff",
                        })
                        .setOrigin(0.5);

                    // Add click event listener to the status button
                    statusButton.on("pointerdown", () => {
                        Nakama.joinMatch(this.rooms[i].match_id).then(r => {
                            this.scene.start("in-game");
                        }).then(res => {

                        }).catch(err => {
                            alert("Can not join")
                        })

                    });
                    statusButton.on("pointerover", () => {
                        statusButton.setScale(1.1);
                        statusText.setScale(1.1);
                    });

                    statusButton.on("pointerout", () => {
                        statusButton.setScale(1);
                        statusText.setScale(1);
                    });

                    // Add each row to the group
                    tableGroup.addMultiple([rowNameText, rowSizeText, statusButton, statusText]);
                }

            }
        }).catch((error) => {
            console.error("Error occurred:", error);
        })
    }
}