
const find = (symbol) =>
{
    var symb =  brain.get( symbol );
    return symb;
}

const save = (symbol, obj) =>
{
    found =  find( symbol );
    if(!found){
        brain.set( symbol, obj );
    }
}
module.exports = {find, save}