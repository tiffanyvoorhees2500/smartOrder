const pastOrderService = require("../services/pastOrderService");

exports.getPastOrdersByUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const data = await pastOrderService.getPastOrdersByUser(userId);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "Failed to get past orders" });
    }
};

exports.getBulkPastOrdersSortedByProduct = async (req, res) => {
    try {
        const data = await pastOrderService.getBulkPastOrdersSortedByProduct();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get past bulk orders" })
    }
}

exports.getBulkPastOrdersSortedByUser = async (req, res) => {
    try {
        const data = await pastOrderService.getBulkPastOrdersSortedByUser();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to get past bulk orders" })
    }
}