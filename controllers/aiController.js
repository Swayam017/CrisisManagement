const axios = require("axios");

exports.checkFraud = async (req, res) => {
    try {
        const { bookings, cancellations, address } = req.body;

        const prompt = `
        Analyze this LPG user data:
        Bookings this week: ${bookings}
        Cancellations: ${cancellations}
        Address: ${address}

        Is this suspicious for black marketing? Give reason.
        `;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );

        const result = response.data.candidates[0].content.parts[0].text;

        let status = "";

    if (result.toLowerCase().includes("suspicious")) {
        status = "FRAUD ALERT";
    } else {
        status = "NORMAL";
    }

    res.json({
        analysis: result,
        status: status
    });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI error" });
    }
};