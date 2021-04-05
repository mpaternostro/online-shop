const PDFDocument = require("pdfkit");

function generateInvoice(order) {
  const doc = new PDFDocument();
  doc
    .fontSize(22)
    .text(`Invoice # ${order._id}`, {
      underline: true,
      lineGap: 22,
    })
    .fontSize(14);
  let totalPrice = 0;
  order.products.forEach((prod) => {
    const productTotalPrice = prod.product.price * prod.qty;
    totalPrice += productTotalPrice;
    doc.text(
      `${prod.product.title} - $ ${prod.product.price} x ${
        prod.qty
      } = $ ${productTotalPrice.toFixed(2)}`
    );
  });
  doc.text(" ", {
    lineGap: 10,
  });
  doc.fontSize(20).text(`Total price: $ ${totalPrice.toFixed(2)}`);
  return doc;
}

module.exports = generateInvoice;
