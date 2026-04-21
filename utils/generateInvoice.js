const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = (booking, user) => {
  return new Promise((resolve, reject) => {

    try {
      // ✅ Correct folder path
      const dirPath = path.resolve(__dirname, "../invoices");

      // ✅ Create folder if not exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
      }

      // ✅ Define filePath PROPERLY
      const filePath = path.join(dirPath, `invoice_${booking._id}.pdf`);

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      doc.fontSize(20).text("LPG Delivery Invoice", { align: "center" });

      doc.moveDown();
      doc.text(`Booking ID: ${booking._id}`);
      doc.text(`Customer: ${user.name}`);
      doc.text(`Address: ${booking.address}`);
      doc.text(`Delivery Date: ${new Date(booking.scheduledDate).toDateString()}`);

      doc.moveDown();
      doc.text(`Amount: ₹${booking.amount}`);
      doc.text("Status: Paid");

      doc.end();

      // ✅ Wait for file write to complete
      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }

  });
};

module.exports = generateInvoice;