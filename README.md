# Introduction
ObsidianKit is an importer plugin for [Obsidian](https://obsidian.md/) that takes a JSON file of exported data from PluralKit and auto-generates a household/system profile, member profiles, and alphabetized directory of members. (Groups are planned, but not implemented yet!)

# Quick Start

## Installation

Download the newest ObsidianKit release. Unzip the folder and place in your Obsidian vault's Plugins directory (usually under `.obsidian/plugins`).

Alternatively, you can use the BRAT (Beta Reviewer's Auto-update Tool) plugin and input [ObsidianKit's Github](https://github.com/northperseids/obsidiankit) URL `https://github.com/northperseids/obsidiankit` (note: ObsidianKit isn't affiliated with that plugin).

Open Settings and enable the plugin under Community Plugins.

## Importing
The only REQUIRED field is the System File Path, which should be the full absolute path to your exported JSON file (for example: `C:\Users\[name]\Downloads\system.json` or `/home/[name]/Downloads/system.json`).

## Other Settings

All other settings are optional, but you may want to customize it further.

You may get unexpected formatting in some fields, depending on the characters used in your PluralKit names, descriptions, and so on. See **Code Blocks** below for more information.

You can also specify different profile templates if you want. See **Templates** below for more information.

> NOTE: ObsidianKit replaces __ALL__ slashes, square brackets, and bar/pipe characters in folder and note/file names with a visually-similar Unicode equivalent. This is because a file name involving those characters is typically invalid on many computers, or it interferes with Obsidian's formatting. See **Character Replacements in Filenames**.

# Settings/Customization

## Images
(Note that if you want to have an avatar image displayed multiple times at different sizes, you can use the `{avatarurl}` variable and format it yourself in a custom template!)

| Setting      | Default | Definition                                      |
| ------------ | ------- | ----------------------------------------------- |
| Avatar Width | `200`   | Width in pixels for pre-formatted Avatar Images |
| Banner Width | `500`   | Width in pixels for pre-formatted Banner Images |

## Files and Sorting
| Setting                  | Default | Definition                                              |
| ------------------------ | ------- | ------------------------------------------------------- |
| Overwrite Existing Files | `OFF`   | Replace existing files with the same name during import |

## Templates
| Setting                 | Default                                           | Definition                                                                                   |
| ----------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| System Profile Template | Default System Profile | Markdown template used for System Profile page                                               |
| Member Profile Template | Default Member Profile | Markdown template used for Member Profile pages                                              |
| Keep empty values       | `ON`                                              | Fills in text for empty values. i.e. *No birthday found.* if a member has no listed birthday |
> If using the Default markdown templates, toggling **Keep empty values** `OFF` will also remove the associated header text for empty sections. **ObsidianKit will ONLY do this for the DEFAULT TEMPLATES, though.**

### Custom Templates
The easiest way to make a custom template is to create a new Obsidian note, format it however you like using the curly-bracketed variables from the table below, and then right-click on the note in Obsidian and choose **Select as System Template** or **Select as Member Template**.

You can also enter an absolute path to a markdown .md file containing your template in the settings dialogue if you want.

If you want to go back to using the default templates, just leave the template text box blank.

## Code Blocks
Many people use characters decoratively in PluralKit fields that may render strangely in Markdown formatting. ObsidianKit provides toggles to place different fields in `code blocks` to prevent decorative characters from being rendered as Markdown formatting.

| Setting                                  | Default | Definition                                                                       |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| Prevent markdown in names                | `OFF`   | Places backticks around names and display names                                  |
| Prevent markdown in descriptions         | `ON`    | Places three backticks around descriptions (so it renders as a whole code block) |
| Prevent markdown in miscellaneous fields | `OFF`   | Places backticks around system tag, pronouns, and proxy tags                     |

## Character Replacements in Filenames
Obsidian and computer filenames can't use square brackets `[]`, slashes `/ \`, or bar/pipe characters `|` easily because those can mess up formatting in Obsidian and filenames on computers. ObsidianKit replaces these characters with ones that look similar, but aren't technically the same.

(You can specify your own replacement characters in the settings if you want.)

| Character      | Original | Replacement |
| -------------- | -------- | ----------- |
| Forward Slash  | `/`      | `⧸`         |
| Backward Slash | `\`      | `⧹`         |
| Open Bracket   | `[`      | `❲`         |
| Close Bracket  | `]`      | `❳`         |
| Bar/Pipe       | `\|`     | `❘`         |

# Pre-Defined Variables
To use a pre-defined variable, just copy/type the ENTIRE curly-bracket variable as-is and paste it wherever you want the corresponding output to appear in your custom profiles.

## System Variables

| Variable           | Output                                                                  |
| ------------------ | ----------------------------------------------------------------------- |
| {alldiscordids}    | All linked Discord account IDs, bulletpoint list format                 |
| {avatarimage}      | Pre-formatted avatar image                                              |
| {avatarurl}        | Raw avatar image URL                                                    |
| {bannerimage}      | Pre-formatted banner image                                              |
| {bannerurl}        | Raw banner image URL                                                    |
| {createdtimestamp} | System creation timestamp                                               |
| {description}      | System description                                                      |
| {discordid}        | Discord account ID (if more than one account, will be the first listed) |
| {groupcount}       | Number of groups                                                        |
| {membercount}      | Number of members                                                       |
| {pkid}             | 5- or 6-letter PluralKit system ID                                      |
| {pronouns}         | System pronouns                                                         |
| {systemcolor}      | System color hexcode                                                    |
| {systemname}       | System name                                                             |
| {systemtag}        | System tag                                                              |
| {webhookurl}       | Webhook URL                                                             |

## Member Variables

| Variable           | Output                                                          |
| ------------------ | --------------------------------------------------------------- |
| {allproxytags}     | All proxy tags, bulletpoint list format                         |
| {avatarimage}      | Pre-formatted avatar image                                      |
| {avatarurl}        | Raw avatar image URL                                            |
| {bannerimage}      | Pre-formatted banner image                                      |
| {bannerurl}        | Raw banner image URL                                            |
| {birthday}         | Member birthday                                                 |
| {createdtimestamp} | Member creation timestamp                                       |
| {description}      | Member description                                              |
| {displayname}      | Member display name                                             |
| {grouplist}        | Groups member is in, bulletpoint list format                    |
| {membercolor}      | Member color hexcode                                            |
| {membername}       | Member name                                                     |
| {messagecount}     | Total messages sent by this member                              |
| {pkid}             | 5- or 6-letter PluralKit member ID                              |
| {pronouns}         | Member pronouns                                                 |
| {proxyimage}       | Pre-formatted proxy image                                       |
| {proxyimageurl}    | Raw proxy image URL                                             |
| {proxytag}         | Proxy tag (if more than one tag, will be the first listed)      |
| {systemname}       | System name                                                     |
| {systemtag}        | System tag                                                      |
