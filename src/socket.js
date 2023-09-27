// import { Client, Session, DefaultApi, ApiKeyAuth } from '@heroiclabs/nakama-js';
//
// // Khởi tạo Nakama client
// const nakamaClient = new Client();
// nakamaClient.host = "127.0.0.1";
// nakamaClient.port = 7350;
// nakamaClient.ssl = false;
//
// // Tạo một session trước khi sử dụng API
// const session = nakamaClient.authenticateCustom("your_user_id");
//
// // Hàm để lấy danh sách người dùng đang trực tuyến
// async function getOnlinePlayers(): Promise<any[]> {
//     try {
//         const api = new DefaultApi(nakamaClient);
//         const socket = api.apiClient.basePath.replace(/^http/, "ws") + "/ws?token=" + session.token;
//
//         // Kết nối với Nakama realtime socket
//         const nakamaSocket = new WebSocket(socket);
//
//         return new Promise((resolve, reject) => {
//             nakamaSocket.onopen = () => {
//                 // Gửi yêu cầu lấy danh sách người dùng đang trực tuyến
//                 nakamaSocket.send(JSON.stringify({
//                     "topic": "presence",
//                     "status": "active"
//                 }));
//             };
//
//             nakamaSocket.onmessage = (event) => {
//                 const response = JSON.parse(event.data);
//
//                 // Kiểm tra xem dữ liệu có phải là danh sách người dùng đang trực tuyến không
//                 if (response.topic === "presence") {
//                     const onlinePlayers = response.data;
//
//                     // Đóng kết nối socket sau khi nhận được dữ liệu
//                     nakamaSocket.close();
//
//                     resolve(onlinePlayers);
//                 }
//             };
//
//             nakamaSocket.onerror = (error) => {
//                 reject(error);
//             };
//         });
//     } catch (error) {
//         console.error("Lỗi khi lấy danh sách người dùng đang trực tuyến:", error);
//         return [];
//     }
// }
//
// // Ví dụ sử dụng
// getOnlinePlayers().then((onlinePlayers) => {
//     console.log("Danh sách người chơi đang trực tuyến:", onlinePlayers);
// });