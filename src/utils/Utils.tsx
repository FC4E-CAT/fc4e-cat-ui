const trimProfileID = (id: string) : string => {
    let res: string;
    if (id.includes("@")) {
        res = id.substring(0,6) + "..." + id.substring(id.indexOf("@"), id.length);
    }
    else {
        res = id.substring(0,6) + "...";
    }
    return res;
}

export { trimProfileID };