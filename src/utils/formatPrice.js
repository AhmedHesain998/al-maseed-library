
function formatPrice(price) {
    return `${Number(price).toLocaleString("en-US")} SDG`;
}

export default formatPrice;
