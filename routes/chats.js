const express = require("express");
const http = require("http").createServer(express());
const io = require("socket.io")(http); 
const router = express.Router();
const auth = require("../middleware/auth");
const utils = require('../utils/utils')

const { Chat, validateChat } = require("../models/chatModel");


io.on("connection", (socket) => {

    socket.on("join", async (gameId) => {});

    socket.on("message", (message) => {});

});

router.get("/chatId",auth, async(req, res)=>{
    try{

    
    let send_by = req.user._id;
    let send_to = req.query.send_to;

    let result = await Chat.findOne({$or:[{"user1":send_by, "user2":send_to}, {"user2":send_by, "user1":send_to}]})

    if (!result){
        const chat = new Chat({ "user1":send_by, "user2":send_to, messages: [] });
        result = await chat.save()
    }
    return utils.sendResponse(req, res, true, 'chatId',result._id, '');
}catch(err){
    console.log(err)
    return utils.sendResponse(req, res, false, 'chatId',{}, err);

}
} )

router.get("/chats", async (request, response) => {

    try {

        let result = await Chat.findOne({ "_id": request.query.room });

        response.send(result);

    } catch (e) {

        response.status(500).send({ message: e.message });

    }

});

io.on("connection", (socket) => {

    socket.on("join", async (gameId) => {

        try {

            let result = await Chat.findOne({ "_id": gameId });

            if(!result) {

                await Chat.insertOne({ "_id": gameId, messages: [] });

            }

            socket.join(gameId);

            socket.emit("joined", gameId);

            socket.activeRoom = gameId;

        } catch (e) {

            console.error(e);

        }

    });

    socket.on("message", (message) => {

        Chat.updateOne({ "_id": message.activeRoom }, {

            "$push": {

                "messages": {
                    "sent_by":message.sent_by,
                    "sent_to":message.sent_to,
                    "message":message.message
                }

            }

        });

        io.to(socket.activeRoom).emit("message", message);

    });

});

module.exports = router;
