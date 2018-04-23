export default (key, config) => {
    if(config[key] == undefined) {
        return true;
    } else {
        return config[key];
    }
}