export function makeHeaderString(title, content) {
    return `### ${title}\n${content}`;
}

export function replaceVar(arr, varname, string) {
    const indexes = [];
    arr.findIndex((value, index) => {
        if (value === varname) {
            indexes.push(index);
        }
    });
    for (var index of indexes) {
        if (index === -1) {
            break;
        } else {
            arr[index] = string;
        }
    }
}

export function removeVar(arr, varname) {
    const index = arr.indexOf(varname);
    if (index === -1) {
        return;
    }
    arr.splice(index, 1);
}

/**
 * Takes an array of strings and organizes them with the first character as object key, and subarray of strings that start with that character as object.
 * @param {Array<string>} arr array of strings
 * @param {boolean} alphanumeric whether to prioritize alphanumeric characters (default true)
 * @returns Obj of arrays grouped by letter key
 */
export function groupByFirstChar(arr, alphanumeric = true) {
    var dict = {};
    for (var str of arr) {
        const uppercase = str.toUpperCase();
        var letter;
        if (alphanumeric) {
            const onlyLetters = uppercase.replace(/[^a-zA-Z0-9]/g, '');
            letter = onlyLetters[0] ?? "�";
        } else {
            letter = uppercase[0] ?? "�";
        }
        if (!dict[letter]) {
            dict[letter] = [];
        }
        dict[letter].push(str);
    }
    return dict;
}

/**
 * Takes an array of PKMembers and organizes them with the first character of the name as object key, and subarray of member objs whose names start with that character as object.
 * @param {Array<PKMember>} memberObjs array of PKMember objects
 * @param {boolean} alphanumeric whether to prioritize alphanumeric characters (default true)
 * @returns Obj of arrays grouped by letter key
 */
export function groupMembersByFirstChar(memberObjs, alphanumeric = true) {
    var dict = {};
    for (var memberObj of memberObjs) {
        const uppercaseName = memberObj.memberName.toUpperCase();
        var letter;
        if (alphanumeric) {
            const onlyLetters = uppercaseName.replace(/[^a-zA-Z]/g, '') ?? "�";
            letter = onlyLetters[0];
        } else {
            letter = uppercaseName[0];
        }
        if (!dict[letter]) {
            dict[letter] = [];
        }
        dict[letter].push(memberObj);
    }
    return dict;
}

/**
 * Adds escape characters before brackets
 * @param {string} str 
 * @returns escaped string
 */
export function replaceBrackets(str) {
    const openbracket = str.replaceAll('[', ' [');
    return openbracket.replaceAll(']', '] ');
}

/**
 * Replaces slashes and brackets to better format links and file/folder names
 * @param {string} str String to format
 * @param {string} fwdslash Replaces forward slashes /
 * @param {string} bkslash Replaces backslashes \
 * @param {string} opbracket Replaces open brackets [
 * @param {string} clbracket Replaces close brackets ]
 * @param {string} barChara Replaces bar character |
 * @returns 
 */
export function formatFilename(str, fwdslash, bkslash, opbracket, clbracket, barChara) {
    return str.replaceAll('/', fwdslash).replaceAll('\\', bkslash).replaceAll('[', opbracket).replaceAll(']', clbracket).replaceAll('|', barChara);
}