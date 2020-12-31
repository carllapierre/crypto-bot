exports.getFormattedPrice = (price) => {
    if(price >= 1)
        return Number.parseFloat(price).toFixed(2)
    return Number.parseFloat(price).toPrecision(2)
}
