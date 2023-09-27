import CONFIG from "../config"
import Nakama from "../nakama"

export default class MainMenu extends Phaser.Scene {
    constructor() {
        super("main-menu");
    }

    async create() {
        await Nakama.authenticate()

        const query = "*";
        const minCount = 5;
        const maxCount = 25;
        const countMultiple = 5;
        const ticket = Nakama.socket.addMatchmaker(query, minCount, maxCount, countMultiple);
        console.log(ticket);

        console.log(Nakama.session)
        Nakama.socket.onnotification = (notification) => {
            console.log("Received: ", notification);
            console.log("Notification content: ", notification.content);
            console.log("socket user: ", Nakama.session.user_id)
            if (confirm(notification.subject)) {
                // Nakama.notify(notification.content.matchId, notification.content.playerId, true,notification.content.playerId, Nakama.session.username)
                Nakama.joinMatch(notification.content.matchId, null, {playerId: localStorage.getItem('user_id')})
                this.scene.start("in-game")
            } else {

            }
        };

        // Nakama.socket.onmatchmakermatched = (matched) => {
        //     console.info("Received MatchmakerMatched message: ", matched);
        //     const matchId = null;
        //     Nakama.socket.joinMatch(matchId, matched.token);
        // };
        // Nakama.sockqet.onmatchmakermatched = (matched) => {
        //     console.info("Received MatchmakerMatched message: ", matched);
        //     console.info("Matched opponents: ", matched.users);
        // };

        // console.log("online player: ", Nakama.getOnlinePlayers())

        // Nakama.socket.onstatuspresence = (statuspresence) => {
        //     statuspresence.leaves.forEach((leave) => {
        //         console.log("User %o no longer has status %o", leave.user_id, leave.status);
        //     });
        //     statuspresence.joins.forEach((join) => {
        //         console.log("User %o now has status %o", join.user_id, join.status);
        //     });
        // };

        this.add
            .text(CONFIG.WIDTH / 2, 75, "Welcome to", {
                fontFamily: "Arial",
                fontSize: "24px",
            })
            .setOrigin(0.5);

        this.add
            .text(CONFIG.WIDTH / 2, 123, "XOXO", {
                fontFamily: "Arial",
                fontSize: "72px",
            })
            .setOrigin(0.5);

        this.add.grid(
            CONFIG.WIDTH / 2,
            CONFIG.HEIGHT / 2,
            300,
            300,
            100,
            100,
            0xffffff,
            0,
            0xffca27
        );

        // button
        const playBtn = this.add
            .rectangle(CONFIG.WIDTH / 2, 725, 225, 70, 0xffca27)
            .setInteractive({useHandCursor: true});

        const createBtn = this.add
            .rectangle(CONFIG.WIDTH / 2, 800, 225, 70, 0xffca27)
            .setInteractive({useHandCursor: true});

        const listBtn = this.add
            .rectangle(CONFIG.WIDTH / 2, 200, 225, 70, 0xffca27)
            .setInteractive({useHandCursor: true});

        const logoutBtn = this.add
            .rectangle(CONFIG.WIDTH / 2, 900, 225, 70, 0xffca27)
            .setInteractive({useHandCursor: true});

        // button text
        const playBtnText = this.add
            .text(CONFIG.WIDTH / 2, 725, "Begin", {
                fontFamily: "Arial",
                fontSize: "36px",
            })
            .setOrigin(0.5);

        const createBtnText = this.add
            .text(CONFIG.WIDTH / 2, 800, "Create", {
                fontFamily: "Arial",
                fontSize: "36px",
            })
            .setOrigin(0.5);

        const listBtnText = this.add
            .text(CONFIG.WIDTH / 2, 200, "List match", {
                fontFamily: "Arial",
                fontSize: "36px",
            })
            .setOrigin(0.5);


        const logoutBtnText = this.add
            .text(CONFIG.WIDTH / 2, 900, "Log out", {
                fontFamily: "Arial",
                fontSize: "36px",
            })
            .setOrigin(0.5);


        // action
        logoutBtn.on("pointerdown", () => {
            Nakama.logout(Nakama.session, Nakama.session.token, Nakama.session.refresh_token)
            Nakama.getAccountOnline(Nakama.session)
        });

        logoutBtn.on("pointerover", () => {
            logoutBtn.setScale(1.1);
            logoutBtnText.setScale(1.1);
        });

        logoutBtn.on("pointerout", () => {
            logoutBtn.setScale(1);
            logoutBtnText.setScale(1);
        });

        playBtn.on("pointerdown", () => {
            Nakama.findMatch().then(res => {
                if (res) {
                    this.scene.start("in-game");
                } else {
                    alert("Not found match")
                }
            })
        });

        playBtn.on("pointerover", () => {
            playBtn.setScale(1.1);
            playBtnText.setScale(1.1);
        });

        playBtn.on("pointerout", () => {
            playBtn.setScale(1);
            playBtnText.setScale(1);
        });

        listBtn.on("pointerdown", () => {
            Nakama.listMatches()
            this.scene.start("list-match");
        });

        listBtn.on("pointerover", () => {
            listBtn.setScale(1.1);
            listBtnText.setScale(1.1);
        });

        listBtn.on("pointerout", () => {
            listBtn.setScale(1);
            listBtnText.setScale(1);
        });


        createBtn.on("pointerdown", () => {
            // Create a new input field
            /*          const input = document.createElement('input');
                      input.type = 'text';
                      input.placeholder = 'Enter match name';
                      input.style.position = 'absolute';
                      input.style.top = '50%';
                      input.style.left = '20%';
                      input.style.transform = 'translate(-50%, -20%)';


                      document.body.appendChild(input);

                      // When the user submits the form, create the match and start the game scene
                      input.addEventListener('keydown', (event) => {
                          if (event.code === 'Enter' && input.value.trim() !== '') {
                              Nakama.createMatch(input.value.trim());
                              this.scene.start("in-game");
                              input.remove();
                          }
                      });*/

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

    }
}