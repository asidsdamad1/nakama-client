import {Client} from "@heroiclabs/nakama-js";
import {v4 as uuidv4} from "uuid";

class Nakama {
    constructor() {
        this.client
        this.session
        this.socket // ep4
        this.matchID // ep4
    }

    async authenticate() {
        this.client = new Client("defaultkey", "localhost", "7350");
        this.client.ssl = false;

        let deviceId = localStorage.getItem("deviceId");
        if (!deviceId) {
            deviceId = uuidv4();
            localStorage.setItem("deviceId", deviceId);
        }

        this.session = await this.client.authenticateDevice(deviceId, true);
        localStorage.setItem("user_id", this.session.user_id);

        // ep4
        const trace = false;
        this.socket = this.client.createSocket(this.useSSL, trace);
        await this.socket.connect(this.session);
    }

    async logout(session, session_token, refresh_token) {
        console.log("Session: ", session)
        console.log("Session token logout: ", session_token)
        console.log("Session token refresh logout: ", refresh_token)
        await this.client.sessionLogout(session, session_token, refresh_token);
    }

    async getAccountOnline(session) {
        const account = await this.client.getAccount(session);
        const user = account.user;
        console.info("User id '%o' and username '%o'.", user.id, user.username);
        console.info("Account :", account);
    }

    async findMatch() { // ep4
        const rpcFindId = "find_match_js";
        const matches = await this.client.rpc(this.session, rpcFindId, {});

        // let label = JSON.parse(matches.payload.matches[0].label)
        // this.matchID = matches.payload.matches[0].matchId
        // console.log(matches.payload.matches[0].matchId)
        // console.log(matches)

        // await this.socket.joinMatch(this.matchID);
        // console.log("Matched joined!")
        // const rpcGetId = "get_match_js";
        // const matches = await this.client.rpc(this.session, rpcGetId, {matchId});

        if (matches.payload.matches.length === 0) {
            return false
        }
        console.log(matches.payload)
        this.matchID = matches.payload.matches[0].matchId
        console.log(this.matchID)
        await this.socket.joinMatch(this.matchID);
        console.log("Matched joined!")
        let label = JSON.parse(matches.payload.matches[0].label)
        await this.notify(this.matchID, label.userId, false, this.session.user_id, this.session.username)

        return true
    }

    async joinMatch(matchId) { // ep4
        const rpcid = "get_match_js";
        const matches = await this.client.rpc(this.session, rpcid, {matchId});

        console.log(matches)
        this.matchID = JSON.parse(matches.payload.matchIds[0]).matchId
        console.log(JSON.parse(matches.payload.matchIds[0]))
        await this.socket.joinMatch(this.matchID);
    }

    async createMatch() { // ep4
        const rpcid = "create_match_js";
        const matches = await this.client.rpc(this.session, rpcid, {});
        this.matchID = matches.payload.matchIds[0];
        console.log(this.matchID)
        console.log(matches)
        let metadata = {
            matchId: this.matchID,
            ownerId: this.session.user_id,
            create: 'true',
            accept: 'true'
        }
        console.log("metadata: ", metadata)
        await this.socket.joinMatch(this.matchID, null, metadata);


        console.log("Match created: ", this.matchID)
    }

    async makeMove(index) { // ep4
        var data = {"position": index};
        console.log("data: ", data)
        console.log("match id: ", this.matchID)
        await this.socket.sendMatchState(this.matchID, 4, JSON.stringify(data));
        console.log("Match data sent")
    }

    async listMatches() {
        this.client.list
        try {
            const matches = await this.client.listMatches(this.session);
            console.log("List of matches:", matches);
            return matches;
        } catch (error) {
            console.error("Failed to list matches:", error);
            throw error;
        }
    }

    async notify(matchId, ownerId, accept, playerId, playerName) {
        const rpcid = "notify_js";
        await this.client.rpc(this.session, rpcid, {matchId, ownerId, accept, playerId, playerName});
        //
        // if (matches.payload.matchIds.length !== 0) {
        //     this.matchID = JSON.parse(matches.payload.matchIds[0]).matchId
        //     console.log(this.matchID)
        //     await this.socket.joinMatch(this.matchID);
        //     console.log("Matched joined!")
        // }
        // alert("not found match")
    }

    async getOnlinePlayers() {
        try {
            const socket = this.client.apiClient.basePath.replace(/^http/, "ws") + "/ws?token=" + this.session.token;

            console.log("socket: =====> ", socket)
            // Kết nối với Nakama realtime socket
            const nakamaSocket = new WebSocket(socket);

            return new Promise((resolve, reject) => {
                nakamaSocket.onopen = () => {

                    // Gửi yêu cầu lấy danh sách người dùng đang trực tuyến
                    nakamaSocket.send(JSON.stringify({
                        "topic": "presence",
                        "status": "active"
                    }));
                };

                nakamaSocket.onmessage = (event) => {
                    const response = JSON.parse(event.data);
                    console.log("response ======> ",response)

                    // Kiểm tra xem dữ liệu có phải là danh sách người dùng đang trực tuyến không
                    if (response.topic === "presence") {
                        const onlinePlayers = response.data;

                        // Đóng kết nối socket sau khi nhận được dữ liệu
                        nakamaSocket.close();

                        resolve(onlinePlayers);
                    }
                };

                nakamaSocket.onerror = (error) => {
                    reject(error);
                };
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách người dùng đang trực tuyến:", error);
            return [];
        }
    }


// Ví dụ sử dụng

}

export default new Nakama()
