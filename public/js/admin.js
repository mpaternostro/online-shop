/**
 * @param {HTMLButtonElement} btn
 */
// eslint-disable-next-line no-unused-vars
async function deleteProduct(btn) {
  const productCard = btn.closest(".card");
  const productId = productCard.querySelector('[name="productId"]').value;
  const csrfToken = productCard.querySelector('[name="_csrf"]').value;

  try {
    await fetch(`/admin/product/${productId}`, {
      method: "DELETE",
      headers: {
        "CSRF-Token": csrfToken,
      },
    });
    productCard.parentNode.removeChild(productCard);
  } catch (error) {
    console.error(error);
  }
}
