
function changeColor(text, param) {
        switch (param.toLowerCase()){
            case "cyan":
                return "```yaml\n" + text + "```";
            case "yellow":
                return "```fix\n" + text + "```";
            default:
                return "```\n" + text + "```";
        }
}   

module.exports = { changeColor };
