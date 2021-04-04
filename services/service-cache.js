
const find = (symbol) =>
{
    var symb =  brain.get( symbol );
    return symb;
}

const save = (symbol, obj, ttl) =>
{
    if(!ttl)
        ttl = 0

    found =  find( symbol );
    if(!found){
        brain.set( symbol, obj, ttl );
    }
}
module.exports = {find, save}