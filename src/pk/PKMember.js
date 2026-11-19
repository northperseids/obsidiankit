import { makeHeaderString, removeVar, replaceVar } from './utils';

export class PKMember {
    constructor(memberObj, groupArr) {

        // parent vals
        this.memberObj = memberObj;
        this.groupArr = groupArr;

        // individual values
        this.memberName = null;
        this.displayName = null;
        this.description = null;
        this.birthday = null;
        this.pronouns = null;
        this.grouplist = null;
        this.avatarurl = null;
        this.bannerurl = null;
        this.webhookavatarurl = null;
        this.pkid = null;
        this.membercolor = null;
        this.createdtimestamp = null;
        this.messagecount = null;
        this.proxytags = null;

        this.#setMemberInfo();

    }

    #setMemberInfo() {
        if (this.memberObj.name) {
            this.memberName = this.memberObj.name;
        }
        if (this.memberObj.display_name) {
            this.displayName = this.memberObj.display_name;
        }
        if (this.memberObj.description) {
            this.description = this.memberObj.description;
        }
        if (this.memberObj.birthday) {
            this.birthday = this.memberObj.birthday;
        }
        if (this.memberObj.pronouns) {
            this.pronouns = this.memberObj.pronouns;
        }
        if (this.memberObj.avatar_url) {
            this.avatarurl = this.memberObj.avatar_url;
        }
        if (this.memberObj.banner) {
            this.bannerurl = this.memberObj.banner;
        }
        if (this.memberObj.webhook_avatar_url) {
            this.webhookavatarurl = this.memberObj.webhook_avatar_url;
        }
        if (this.memberObj.id) {
            this.pkid = this.memberObj.id;
        }
        if (this.memberObj.color) {
            this.membercolor = this.memberObj.color;
        }
        if (this.memberObj.created) {
            this.createdtimestamp = this.memberObj.created;
        }
        if (this.memberObj.message_count) {
            this.messagecount = this.memberObj.message_count;
        }
        if (this.memberObj.proxy_tags) {
            const tagArray = this.memberObj.proxy_tags;
            this.proxytags = [];
            for (let i = 0; i < tagArray.length; i++) {
                this.proxytags.push(this.#formatProxyTags(tagArray[i]))
            }
        }
        let groups = [];
        for (var group of this.groupArr) {
            if (group.members) {
                if (group.members.includes(this.pkid)) {
                    groups.push(group.name);
                }
            }
        }
        if (groups.length > 0) {
            this.grouplist = groups;
        }
    }

    #formatProxyTags(tagsObj) {
        let prefix = '';
        let suffix = '';
        if (tagsObj.prefix) {
            prefix = tagsObj.prefix;
        }
        if (tagsObj.suffix) {
            suffix = tagsObj.suffix;
        }
        return `${prefix}text${suffix}`;
    }

    generateDefaultMemberString(memberTemplateArray, renderMarkdownNames, renderMarkdownDescriptions, renderMarkdownMisc, keepEmptyEntries, avatarWidth = '100', bannerWidth = `500`) {
        if (this.memberName) {
            var str = this.memberName;
            if (renderMarkdownNames) {
                str = `\`${this.memberName}\``;
            }
            const string = makeHeaderString(`Member Name`, str);
            replaceVar(memberTemplateArray, 'membername', string);
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'membername', makeHeaderString(`Member Name`, '*No member name found.*'));
            } else {
                removeVar(memberTemplateArray, 'membername');
            }
        }
        if (this.displayName) {
            var str = this.displayName;
            if (renderMarkdownNames) {
                str = `\`${this.displayName}\``;
            }
            const string = makeHeaderString(`Display Name`, str);
            replaceVar(memberTemplateArray, 'displayname', string)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'displayname', makeHeaderString(`Display Name`, '*No display name found.*'));
            } else {
                removeVar(memberTemplateArray, 'displayname');
            }
        }
        if (this.description) {
            var str = this.description;
            if (renderMarkdownDescriptions) {
                str = `\`\`\`\n${this.description}\n\`\`\``;
            }
            const string = makeHeaderString(`Description`, str);
            replaceVar(memberTemplateArray, 'description', string)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'description', makeHeaderString(`Description`, '*No description found.*'));
            } else {
                removeVar(memberTemplateArray, 'description');
            }
        }
        if (this.birthday) {
            const string = makeHeaderString(`Birthday`, this.birthday);
            replaceVar(memberTemplateArray, 'birthday', string)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'birthday', makeHeaderString(`Birthday`, '*No birthday found.*'));
            } else {
                removeVar(memberTemplateArray, 'birthday');
            }
        }
        if (this.pronouns) {
            var str = this.pronouns;
            if (renderMarkdownNames) {
                str = `\`${this.pronouns}\``;
            }
            const string = makeHeaderString(`Pronouns`, str);
            replaceVar(memberTemplateArray, 'pronouns', string)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'pronouns', makeHeaderString(`Pronouns`, '*No pronouns found.*'));
            } else {
                removeVar(memberTemplateArray, 'pronouns');
            }
        }
        if (this.grouplist) {
            var groupArray = this.grouplist;
            if (renderMarkdownMisc) {
                groupArray = [];
                this.grouplist.forEach((group) => {
                    groupArray.push(`\`${group}\``);
                })
            }
            groupArray.splice(0, 0, '');
            let groups = groupArray.join('\n- ');
            replaceVar(memberTemplateArray, 'grouplist', makeHeaderString(`Groups`, groups))
        } else {
            if (keepEmptyEntries) {
                var str = this.memberName;
                if (renderMarkdownNames) {
                    str = `\`${this.memberName}\``;
                }
                replaceVar(memberTemplateArray, 'grouplist', makeHeaderString(`Groups`, `*${str} is not part of any groups.*`));
            } else {
                removeVar(memberTemplateArray, 'grouplist');
            }
        }
        if (this.avatarurl) {
            const imagestring = `![Avatar|100](${this.avatarurl})`;
            const string = makeHeaderString(`Avatar`, `${imagestring}\n${this.avatarurl}`);
            replaceVar(memberTemplateArray, 'avatarinfo', string);

            replaceVar(memberTemplateArray, 'avatarurl', this.avatarurl);
            replaceVar(memberTemplateArray, 'avatarimage', `![Avatar|${avatarWidth}](${this.avatarurl})`);
        } else {
            if (keepEmptyEntries) {
                const string = makeHeaderString(`Avatar`, '*No avatar found.*');
                replaceVar(memberTemplateArray, 'avatarinfo', string);

                replaceVar(memberTemplateArray, 'avatarimage', '*No avatar found.*');
                replaceVar(memberTemplateArray, 'avatarurl', '*No avatar found.*');
            } else {
                removeVar(memberTemplateArray, 'avatarinfo');
                removeVar(memberTemplateArray, 'avatarimage');
                removeVar(memberTemplateArray, 'avatarurl');
            }
        }
        if (this.bannerurl) {
            const imagestring = `![Banner|${bannerWidth}](${this.avatarurl})`;
            const string = makeHeaderString('Banner', `${imagestring}\n${this.bannerurl}`);
            replaceVar(memberTemplateArray, 'bannerinfo', string);
        } else {
            if (keepEmptyEntries) {
                const string = makeHeaderString('Banner', `*No banner found.*`)
                replaceVar(memberTemplateArray, 'bannerinfo', string);
            } else {
                removeVar(memberTemplateArray, 'bannerinfo');
            }
        }
        if (this.webhookavatarurl) {
            // webhook avatar is proxy avatar
            const imagestring = `![ProxyAvatar|${avatarWidth}](${this.avatarurl})`;
            const string = makeHeaderString('Proxy Avatar', `${imagestring}\n${this.webhookavatarurl}`)
            replaceVar(memberTemplateArray, 'webhookavatarinfo', string);
        } else {
            if (keepEmptyEntries) {
                const string = makeHeaderString('Proxy Avatar', `*No proxy avatar found.*`)
                replaceVar(memberTemplateArray, 'webhookavatarinfo', string);
            } else {
                removeVar(memberTemplateArray, 'webhookavatarinfo');
            }
        }
        if (this.pkid) {
            replaceVar(memberTemplateArray, 'pkid', this.pkid)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'pkid', `*No PK ID found.*`);
            } else {
                removeVar(memberTemplateArray, 'pkid');
            }
        }
        if (this.membercolor) {
            replaceVar(memberTemplateArray, 'membercolor', this.membercolor)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'membercolor', `*No member color found.*`);
            } else {
                removeVar(memberTemplateArray, 'membercolor');
            }
        }
        if (this.createdtimestamp) {
            replaceVar(memberTemplateArray, 'createdtimestamp', this.createdtimestamp)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'createdtimestamp', `*No creation date found.*`);
            } else {
                removeVar(memberTemplateArray, 'createdtimestamp');
            }
        }
        if (this.messagecount) {
            replaceVar(memberTemplateArray, 'messagecount', this.messagecount)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'messagecount', `0`);
            } else {
                removeVar(memberTemplateArray, 'messagecount');
            }
        }
        if (this.proxytags) {
            var proxyArray = this.proxytags;
            if (renderMarkdownMisc) {
                proxyArray = [];
                this.proxytags.forEach((tag) => {
                    proxyArray.push(`\`${tag}\``);
                })
            }
            // single
            replaceVar(memberTemplateArray, 'proxytag', proxyArray[0]);
            // list
            proxyArray.splice(0, 0, '');
            replaceVar(memberTemplateArray, 'allproxytags', proxyArray.join('\n- '));
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'proxytag', `*No proxy tag found.*`);
                replaceVar(memberTemplateArray, 'allproxytags', `*No proxy tags found.*`);
            } else {
                removeVar(memberTemplateArray, 'proxytag');
                removeVar(memberTemplateArray, 'allproxytags');
            }
        }
        return memberTemplateArray.join('');
    }

    #generateCustomMemberString(memberTemplateArray, renderMarkdownNames, renderMarkdownDescriptions, renderMarkdownMisc, keepEmptyEntries, sysName, sysTag, avatarWidth = '100', bannerWidth = `500`) {
        if (this.memberName) {
            var str = this.memberName;
            if (renderMarkdownNames) {
                str = `\`${this.memberName}\``;
            }
            replaceVar(memberTemplateArray, 'membername', str);
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'membername', '*No member name found.*');
            } else {
                removeVar(memberTemplateArray, 'membername');
            }
        }
        if (this.displayName) {
            var str = this.displayName;
            if (renderMarkdownNames) {
                str = `\`${this.displayName}\``;
            }
            replaceVar(memberTemplateArray, 'displayname', str)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'displayname', '*No display name found.*');
            } else {
                removeVar(memberTemplateArray, 'displayname');
            }
        }
        if (this.description) {
            var str = this.description;
            if (renderMarkdownDescriptions) {
                str = `\`\`\`\n${this.description}\n\`\`\``;
            }
            replaceVar(memberTemplateArray, 'description', str)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'description', '*No description found.*');
            } else {
                removeVar(memberTemplateArray, 'description');
            }
        }
        if (this.birthday) {
            replaceVar(memberTemplateArray, 'birthday', this.birthday)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'birthday', '*No birthday found.*');
            } else {
                removeVar(memberTemplateArray, 'birthday');
            }
        }
        if (this.pronouns) {
            var str = this.pronouns;
            if (renderMarkdownMisc) {
                str = `\`${this.pronouns}\``;
            }
            replaceVar(memberTemplateArray, 'pronouns', str)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'pronouns', '*No pronouns found.*');
            } else {
                removeVar(memberTemplateArray, 'pronouns');
            }
        }
        if (this.grouplist) {
            var groupArray = this.grouplist;
            if (renderMarkdownMisc) {
                groupArray = [];
                this.grouplist.forEach((group) => {
                    groupArray.push(`\`${group}\``);
                })
            }
            groupArray.splice(0, 0, '');
            let groups = groupArray.join('\n');
            replaceVar(memberTemplateArray, 'grouplist', groups);
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'grouplist', `*No groups found.*`);
            } else {
                removeVar(memberTemplateArray, 'grouplist');
            }
        }
        if (this.avatarurl) {
            replaceVar(memberTemplateArray, 'avatarurl', this.avatarurl);
            replaceVar(memberTemplateArray, 'avatarimage', `![Avatar|${avatarWidth}](${this.avatarurl})`);
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'avatarimage', '*No avatar found.*');
                replaceVar(memberTemplateArray, 'avatarurl', '*No avatar found.*');
            } else {
                removeVar(memberTemplateArray, 'avatarimage');
                removeVar(memberTemplateArray, 'avatarurl');
            }
        }
        if (this.bannerurl) {
            replaceVar(memberTemplateArray, 'bannerimage', `![Banner|${bannerWidth}](${this.bannerurl})`);
            replaceVar(memberTemplateArray, 'bannerurl', this.bannerurl);
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'bannerimage', `*No banner found.*`);
                replaceVar(memberTemplateArray, 'bannerurl', `*No banner found.*`);
            } else {
                removeVar(memberTemplateArray, 'bannerimage');
                removeVar(memberTemplateArray, 'bannerurl');
            }
        }
        if (this.webhookavatarurl) {
            replaceVar(memberTemplateArray, 'proxyimage', `![ProxyAvatar|${avatarWidth}](${this.webhookavatarurl})`);
            replaceVar(memberTemplateArray, 'proxyimageurl', this.webhookavatarurl)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'proxyimage', `*No proxy image found.*`);
                replaceVar(memberTemplateArray, 'proxyimageurl', `*No proxy image URL found.*`);
            } else {
                removeVar(memberTemplateArray, 'proxyimage');
                removeVar(memberTemplateArray, 'proxyimageurl');
            }
        }
        if (this.pkid) {
            replaceVar(memberTemplateArray, 'pkid', this.pkid)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'pkid', `*No PK ID found.*`);
            } else {
                removeVar(memberTemplateArray, 'pkid');
            }
        }
        if (this.membercolor) {
            replaceVar(memberTemplateArray, 'membercolor', this.membercolor)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'membercolor', `*No member color found.*`);
            } else {
                removeVar(memberTemplateArray, 'membercolor');
            }
        }
        if (this.createdtimestamp) {
            replaceVar(memberTemplateArray, 'createdtimestamp', this.createdtimestamp)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'createdtimestamp', `*No creation date found.*`);
            } else {
                removeVar(memberTemplateArray, 'createdtimestamp');
            }
        }
        if (this.messagecount) {
            replaceVar(memberTemplateArray, 'messagecount', this.messagecount)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'messagecount', `0`);
            } else {
                removeVar(memberTemplateArray, 'messagecount');
            }
        }
        if (this.proxytags) {
            var proxyArray = this.proxytags;
            if (renderMarkdownMisc) {
                proxyArray = [];
                this.proxytags.forEach((tag) => {
                    proxyArray.push(`\`${tag}\``);
                })
            }
            // single
            replaceVar(memberTemplateArray, 'proxytag', proxyArray[0]);
            // list
            proxyArray.splice(0, 0, '');
            replaceVar(memberTemplateArray, 'allproxytags', proxyArray.join('\n- '));
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'proxytag', `*No proxy tag found.*`);
                replaceVar(memberTemplateArray, 'allproxytags', `*No proxy tags found.*`);
            } else {
                removeVar(memberTemplateArray, 'proxytag');
                removeVar(memberTemplateArray, 'allproxytags');
            }
        }
        if (sysTag) {
            var tag = sysTag;
            if (renderMarkdownMisc) {
                tag = `\`${sysTag}\``;
            }
            const string = makeHeaderString(`System Tag`, tag);
            replaceVar(memberTemplateArray, 'systemtag', string)
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'systemtag', makeHeaderString(`System Tag`, '*No system tag found.*'));
            } else {
                removeVar(memberTemplateArray, 'systemtag');
            }
        }
        if (sysName) {
            var name = this.systemName;
            if (renderMarkdownNames) {
                name = `\`${sysName}\``;
            }
            const string = makeHeaderString(`System Name`, name);
            replaceVar(memberTemplateArray, 'systemname', string);
        } else {
            if (keepEmptyEntries) {
                replaceVar(memberTemplateArray, 'systemname', makeHeaderString(`System Name`, '*No system name found.*'));
            } else {
                removeVar(memberTemplateArray, 'systemname');
            }
        }
        return memberTemplateArray.join('');
    }

    getMemberMDString(
        isCustomString,
        memberTemplateArray,
        renderMarkdownNames,
        renderMarkdownDescriptions,
        renderMarkdownMisc,
        keepEmptyEntries,
        avatarWidth,
        bannerWidth,
        sysName = null,
        sysTag = null
    ) {
        if (isCustomString) {
            return this.#generateCustomMemberString(
                memberTemplateArray,
                renderMarkdownNames,
                renderMarkdownDescriptions,
                renderMarkdownMisc,
                keepEmptyEntries,
                sysName,
                sysTag,
                avatarWidth,
                bannerWidth
            );
        } else {
            return this.generateDefaultMemberString(
                memberTemplateArray,
                renderMarkdownNames,
                renderMarkdownDescriptions,
                renderMarkdownMisc,
                keepEmptyEntries,
                avatarWidth,
                bannerWidth
            );
        }
    }
}