import { PKMember } from './PKMember';
import { makeHeaderString, removeVar, replaceVar, groupByFirstChar, groupMembersByFirstChar, formatFilename } from './utils';

const defaultMemberMarkdown = "{avatarimage}\n# Member Information\n{membername}\n{displayname}\n{description}\n{birthday}\n{pronouns}\n{grouplist}\n# Avatar and Banner\n{avatarinfo}\n{bannerinfo}\n{webhookavatarinfo}\n# Meta Information\n| DATA          | VALUE              |\n| ------------- | ------------------ |\n| PluralKit ID  | {pkid}             |\n| Color         | {membercolor}      |\n| Created       | {createdtimestamp} |\n| Message Count | {messagecount}     |\n| Proxy Tag     | {proxytag}         |\n## All Proxy Tags\n{allproxytags}";
const defaultSystemMarkdown = "{avatarimage}\n# System Information\n{systemname}\n{description}\n{systemtag}\n{pronouns}\n# Avatar and Banner\n{avatarinfo}\n{bannerinfo}\n# Meta Information\n| DATA          | VALUE              |\n| ------------- | ------------------ |\n| PluralKit ID  | {pkid}             |\n| System Color  | {systemcolor}            |\n| Member Count  | {membercount}     |\n| Group Count   | {groupcount}       |\n| Created       | {createdtimestamp} |\n| Discord ID    | {discordid}        |\n## All Linked Accounts\n{alldiscordids}";

export class PKSystem {
    constructor(
        systemJSON,
        keepEmptyEntries,
        prioritizeAlphanumeric,
        nameCodeblock,
        descriptCodeblock,
        miscCodeblock,
        fwdSlashChara,
        bkSlashChara,
        opBracketChara,
        clsBracketChara,
        barChara,
        avatarWidth,
        bannerWidth
    ) {
        // parent vals
        this.systemJSON = systemJSON;
        this.rootDirectory = null;

        // main system values
        this.systemName = this.systemJSON.name ?? null;
        this.description = this.systemJSON.description ?? null;
        this.tag = this.systemJSON.tag ?? null;
        this.pronouns = this.systemJSON.pronouns ?? null;
        this.avatarurl = this.systemJSON.avatar_url ?? null;
        this.bannerurl = this.systemJSON.banner ?? null;
        this.webhookurl = this.systemJSON.webhook_url ?? null;
        this.pkid = this.systemJSON.id ?? null;
        this.systemcolor = this.systemJSON.color ?? null;
        this.createdtimestamp = this.systemJSON.created ?? null;
        this.membercount = this.systemJSON.members.length ?? null;
        this.groupcount = this.systemJSON.groups.length ?? null;
        this.groupJSON = this.systemJSON.groups ?? null;
        this.linkedaccounts = this.systemJSON.accounts ?? null;
        this.membersJSON = this.systemJSON.members ?? null;

        // do we want to create switch graphing?
        //this.switches = null;

        // markdown template strings
        this.systemTemplate = defaultSystemMarkdown;
        this.memberTemplate = defaultMemberMarkdown;
        this.systemMarkdownArray = this.systemTemplate.split(/[{}]/);
        this.memberMarkdownArray = this.memberTemplate.split(/[{}]/);
        this.isCustomSystemString = false;
        this.isCustomMemberString = false;

        // settings values
        this.keepEmptyEntries = keepEmptyEntries;
        this.prioritizeAlphanumeric = prioritizeAlphanumeric;
        this.nameCodeblock = nameCodeblock;
        this.descriptCodeblock = descriptCodeblock;
        this.miscCodeblock = miscCodeblock;
        this.fwdSlashChara = fwdSlashChara;
        this.bkSlashChara = bkSlashChara;
        this.opBracketChara = opBracketChara;
        this.clsBracketChara = clsBracketChara;
        this.barChara = barChara;
        this.avatarWidth = avatarWidth;
        this.bannerWidth = bannerWidth;
    }

    #generateDefaultSystemString() {
        if (this.systemName) {
            var name = this.systemName;
            if (this.nameCodeblock) {
                name = `\`${this.systemName}\``;
            }
            const string = makeHeaderString(`System Name`, name);
            replaceVar(this.systemMarkdownArray, 'systemname', string);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'systemname', makeHeaderString(`System Name`, '*No system name found.*'));
            } else {
                removeVar(this.systemMarkdownArray, 'systemname');
            }
        }
        if (this.description) {
            var description = this.description;
            if (this.descriptCodeblock) {
                description = `\`\`\`\n${this.description}\n\`\`\``;
            }
            const string = makeHeaderString(`Description`, description);
            replaceVar(this.systemMarkdownArray, 'description', string)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'description', makeHeaderString(`Description`, '*No description found.*'));
            } else {
                removeVar(this.systemMarkdownArray, 'description');
            }
        }
        if (this.tag) {
            var tag = this.tag;
            if (this.miscCodeblock) {
                tag = `\`${this.tag}\``;
            }
            const string = makeHeaderString(`System Tag`, tag);
            replaceVar(this.systemMarkdownArray, 'systemtag', string)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'systemtag', makeHeaderString(`System Tag`, '*No system tag found.*'));
            } else {
                removeVar(this.systemMarkdownArray, 'systemtag');
            }
        }
        if (this.pronouns) {
            var pronouns = this.pronouns;
            if (this.miscCodeblock) {
                pronouns = `\`${this.pronouns}\``;
            }
            const string = makeHeaderString(`Pronouns`, pronouns);
            replaceVar(this.systemMarkdownArray, 'pronouns', string)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'pronouns', makeHeaderString(`Pronouns`, '*No pronouns found.*'));
            } else {
                removeVar(this.systemMarkdownArray, 'pronouns');
            }
        }
        if (this.avatarurl) {
            const imagestring = `![Avatar|100](${this.avatarurl})`;
            const string = makeHeaderString(`Avatar`, `${imagestring}\n${this.avatarurl}`);
            replaceVar(this.systemMarkdownArray, 'avatarinfo', string);

            replaceVar(this.systemMarkdownArray, 'avatarurl', this.avatarurl);
            replaceVar(this.systemMarkdownArray, 'avatarimage', `![Avatar|${avatarWidth}](${this.avatarurl})`);
        } else {
            if (this.keepEmptyEntries) {
                const string = makeHeaderString(`Avatar`, '*No avatar found.*');
                replaceVar(this.systemMarkdownArray, 'avatarinfo', string);

                replaceVar(this.systemMarkdownArray, 'avatarimage', '*No avatar found.*');
                replaceVar(this.systemMarkdownArray, 'avatarurl', '*No avatar found.*');
            } else {
                removeVar(this.systemMarkdownArray, 'avatarinfo');
                removeVar(this.systemMarkdownArray, 'avatarimage');
                removeVar(this.systemMarkdownArray, 'avatarurl');
            }
        }

        if (this.bannerurl) {
            const imagestring = `![Banner|${this.bannerWidth}](${this.bannerurl})`;
            const string = makeHeaderString('Banner', `${imagestring}\n${this.bannerurl}`);
            replaceVar(this.systemMarkdownArray, 'bannerinfo', string);
        } else {
            if (this.keepEmptyEntries) {
                const string = makeHeaderString('Banner', `*No banner found.*`)
                replaceVar(this.systemMarkdownArray, 'bannerinfo', string);
            } else {
                removeVar(this.systemMarkdownArray, 'bannerinfo');
            }
        }
        /* if (this.webhookurl) {
            const string = makeHeaderString('Webhook URL', this.webhookurl);
            replaceVar(this.systemMarkdownArray, 'webhookinfo', string);
        } else {
            if (this.keepEmptyEntries) {
                const string = makeHeaderString('Webhook URL', `*No webhook URL found.*`)
                replaceVar(this.systemMarkdownArray, 'webhookinfo', string);
            } else {
                removeVar(this.systemMarkdownArray, 'webhookinfo');
            }
        } */
        if (this.pkid) {
            replaceVar(this.systemMarkdownArray, 'pkid', this.pkid)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'pkid', `*No ID found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'pkid');
            }
        }
        if (this.systemcolor) {
            replaceVar(this.systemMarkdownArray, 'systemcolor', this.systemcolor)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'systemcolor', `*No system color found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'systemcolor');
            }
        }
        if (this.createdtimestamp) {
            replaceVar(this.systemMarkdownArray, 'createdtimestamp', this.createdtimestamp)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'createdtimestamp', `*No creation date found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'createdtimestamp');
            }
        }
        if (this.membercount) {
            replaceVar(this.systemMarkdownArray, 'membercount', this.membercount)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'membercount', `0`);
            } else {
                removeVar(this.systemMarkdownArray, 'membercount');
            }
        }
        if (this.groupcount) {
            replaceVar(this.systemMarkdownArray, 'groupcount', this.groupcount)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'groupcount', `0`);
            } else {
                removeVar(this.systemMarkdownArray, 'groupcount');
            }
        }
        if (this.linkedaccounts) {
            replaceVar(this.systemMarkdownArray, 'discordid', this.linkedaccounts[0]);
            const accountslist = this.linkedaccounts;
            accountslist.splice(0, 0, '');
            replaceVar(this.systemMarkdownArray, 'alldiscordids', accountslist.join('\n- '));
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'discordid', '*No Discord ID found.*');
                replaceVar(this.systemMarkdownArray, 'alldiscordids', `*No Discord accounts linked.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'discordid')
                removeVar(this.systemMarkdownArray, 'alldiscordids');
            }
        }
        return this.systemMarkdownArray.join('');
    }

    #generateCustomSystemString() {
        if (this.systemName) {
            var name = this.systemName;
            if (this.nameCodeblock) {
                name = `\`${this.systemName}\``;
            }
            replaceVar(this.systemMarkdownArray, 'systemname', name);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'systemname', '*No system name found.*');
            } else {
                removeVar(this.systemMarkdownArray, 'systemname');
            }
        }
        if (this.description) {
            var description = this.description;
            if (this.descriptCodeblock) {
                description = `\`\`\`\n${this.description}\n\`\`\``;
            }
            replaceVar(this.systemMarkdownArray, 'description', description);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'description', '*No description found.*');
            } else {
                removeVar(this.systemMarkdownArray, 'description');
            }
        }
        if (this.tag) {
            var tag = this.tag;
            if (this.miscCodeblock) {
                tag = `\`${this.tag}\``;
            }
            replaceVar(this.systemMarkdownArray, 'systemtag', tag);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'systemtag', '*No system tag found.*');
            } else {
                removeVar(this.systemMarkdownArray, 'systemtag');
            }
        }
        if (this.pronouns) {
            var pronouns = this.pronouns;
            if (this.miscCodeblock) {
                pronouns = `\`${this.pronouns}\``;
            }
            replaceVar(this.systemMarkdownArray, 'pronouns', pronouns);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'pronouns', '*No pronouns found.*');
            } else {
                removeVar(this.systemMarkdownArray, 'pronouns');
            }
        }
        if (this.avatarurl) {
            replaceVar(this.systemMarkdownArray, 'avatarimage', `![Avatar|${this.avatarWidth}](${this.avatarurl})`);
            replaceVar(this.systemMarkdownArray, 'avatarurl', this.avatarurl);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'avatarimage', '*No avatar found.*');
                replaceVar(this.systemMarkdownArray, 'avatarurl', '*No avatar found.*');
            } else {
                removeVar(this.systemMarkdownArray, 'avatarimage');
                removeVar(this.systemMarkdownArray, 'avatarurl');
            }
        }
        if (this.bannerurl) {
            replaceVar(this.systemMarkdownArray, 'bannerimage', `![Banner|${this.bannerWidth}](${this.avatarurl})`);
            replaceVar(this.systemMarkdownArray, 'bannerurl', this.bannerurl);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'bannerimage', `*No banner found.*`);
                replaceVar(this.systemMarkdownArray, 'bannerurl', `*No banner found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'bannerimage');
                removeVar(this.systemMarkdownArray, 'bannerurl');
            }
        }
        if (this.webhookurl) {
            replaceVar(this.systemMarkdownArray, 'webhookurl', this.webhookurl);
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'webhookurl', `*No webhook URL found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'webhookurl');
            }
        }
        if (this.pkid) {
            replaceVar(this.systemMarkdownArray, 'pkid', this.pkid)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'pkid', `*No ID found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'pkid');
            }
        }
        if (this.systemcolor) {
            replaceVar(this.systemMarkdownArray, 'systemcolor', this.systemcolor)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'systemcolor', `*No system color found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'systemcolor');
            }
        }
        if (this.createdtimestamp) {
            replaceVar(this.systemMarkdownArray, 'createdtimestamp', this.createdtimestamp)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'createdtimestamp', `*No creation date found.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'createdtimestamp');
            }
        }
        if (this.membercount) {
            replaceVar(this.systemMarkdownArray, 'membercount', this.membercount)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'membercount', `0`);
            } else {
                removeVar(this.systemMarkdownArray, 'membercount');
            }
        }
        if (this.groupcount) {
            replaceVar(this.systemMarkdownArray, 'groupcount', this.groupcount)
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'groupcount', `0`);
            } else {
                removeVar(this.systemMarkdownArray, 'groupcount');
            }
        }
        if (this.linkedaccounts) {
            replaceVar(this.systemMarkdownArray, 'discordid', this.linkedaccounts[0]);

            const accountslist = this.linkedaccounts;
            accountslist.splice(0, 0, '');
            replaceVar(this.systemMarkdownArray, 'alldiscordids', accountslist.join('\n- '));
        } else {
            if (this.keepEmptyEntries) {
                replaceVar(this.systemMarkdownArray, 'discordid', '*No Discord ID found.*');
                replaceVar(this.systemMarkdownArray, 'alldiscordids', `*No accounts linked.*`);
            } else {
                removeVar(this.systemMarkdownArray, 'discordid')
                removeVar(this.systemMarkdownArray, 'alldiscordids');
            }
        }
        return this.systemMarkdownArray.join('');
    }

    setRootDirectory(rootDirectory) {
        this.rootDirectory = rootDirectory;
    }

    setCustomSystemTemplate(string) {
        this.systemTemplate = string;
        this.systemMarkdownArray = string.split(/[{}]/);
        this.isCustomSystemString = true;
    };

    clearCustomSystemTemplate() {
        this.systemTemplate = defaultSystemMarkdown;
        this.systemMarkdownArray = defaultSystemMarkdown.split(/[{}]/);
        this.isCustomSystemString = false;
    }

    /**
     * 
     * @returns full System About markdown string
     */
    getSystemMDString(isCustomString) {
        if (isCustomString) {
            return this.#generateCustomSystemString();
        } else {
            return this.#generateDefaultSystemString();
        }
    }

    /**
     * 
     * @returns array of member names in alphabetical order
     */
    #getMemberNamesArray(alphanumeric = true) {
        const names = [];
        for (var member of this.membersJSON) {
            names.push(member.name);
        }
        if (alphanumeric) {
            names.sort((a, b) => {
                let aName = a.replace(/[^a-zA-Z]/g, '') ?? "�";
                let bName = b.replace(/[^a-zA-Z]/g, '') ?? "�";
                aName.localeCompare(bName);
            });
        } else {
            names.sort((a, b) => a.localeCompare(b));
        }
        return names;
    }

    /**
     * 
     * @param {boolean} alphanumeric whether to prioritize alphanumeric name characters. default true
     * @returns Alphabetized array of PKMember objs
     */
    #getMemberObjArray(alphanumeric = true) {
        const memberObjs = [];;
        for (var member of this.membersJSON) {
            const memberObj = new PKMember(member, this.groupJSON, this.memberMarkdownArray);
            memberObjs.push(memberObj);
        }
        if (alphanumeric) {
            memberObjs.sort((a, b) => {
                let aName = a.memberName.replace(/[^a-zA-Z]/g, '') ?? "�";
                let bName = b.memberName.replace(/[^a-zA-Z]/g, '') ?? "�";
                aName.localeCompare(bName);
            });
        } else {
            memberObjs.sort((a, b) => a.memberName.localeCompare(b.memberName));
        }
        return memberObjs;
    }

    /**
     * 
     * @param {boolean} alphanumeric whether to prioritize alphanumeric characters. default true
     * @returns grouped object of arrays PKMembers (see groupMembersByFirstChar())
     */
    getAlphabetizedMemberObjs(alphanumeric = true) {
        const objArray = this.#getMemberObjArray(alphanumeric);
        return groupMembersByFirstChar(objArray);
    }

    getMemberDirectoryMD(alphanumeric = true) {
        const names = this.#getMemberNamesArray(alphanumeric);
        const categories = groupByFirstChar(names, alphanumeric);
        const markdownString = `# ${this.systemName} Member Directory (${names.length})\n`;
        const mdArray = [markdownString];
        const letters = Object.keys(categories).sort();
        for (var letter of letters) {
            const header = `# ${letter}\n`;
            const memberList = [header];
            for (let member of categories[letter]) {
                memberList.push(`- [[${formatFilename(member, this.fwdSlashChara, this.bkSlashChara, this.opBracketChara, this.clsBracketChara, this.barChara)}]]\n`);
            }
            mdArray.push(memberList.join('\n'));
        }
        return mdArray.join('\n');
    }
}