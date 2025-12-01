const axios = require('axios');
const GROUPME_BOT_ID = process.env.GROUPME_BOT_ID;

exports.sendGroupMeMessage = async (message) => {
    try {
        const response = await axios.post("https://api.groupme.com/v3/bots/post", {
            bot_id: GROUPME_BOT_ID,
            text: message
        });
        return response.data;
    } catch (error) {
        console.error("Error sending GroupMe message:", error);
        throw error;
    }
};