import { App, PluginSettingTab, normalizePath, Notice, Plugin, Setting } from 'obsidian';
import * as path from 'path';
// @ts-ignore for fuck's sake
import { PKSystem } from './pk/PKSystem';
import * as fs from 'fs';
// @ts-ignore for fuck's sake
import { formatFilename } from './pk/utils';

interface PKImporterSettings {
	keepEmptyEntries: boolean;
	customMemberProfileFilepath: string | null;
	customSystemProfileFilepath: string | null;
	prioritizeAlphanumeric: boolean;
	overwriteExisting: boolean;
	nameCodeblock: boolean;
	descriptCodeblock: boolean;
	miscCodeblock: boolean;
	fwdSlashChara: string;
	bkSlashChara: string;
	opBracketChara: string;
	clsBracketChara: string;
	barChara: string;
	avatarWidth: string; 
	bannerWidth: string;
}

const DEFAULT_SETTINGS: PKImporterSettings = {
	keepEmptyEntries: true,
	customMemberProfileFilepath: null,
	customSystemProfileFilepath: null,
	prioritizeAlphanumeric: true,
	overwriteExisting: false,
	nameCodeblock: false,
	descriptCodeblock: true,
	miscCodeblock: false,
	fwdSlashChara: '⧸',
	bkSlashChara: '⧹',
	opBracketChara: '❲',
	clsBracketChara: '❳',
	barChara: '❘',
	avatarWidth: '200',
	bannerWidth: '500'
}

export default class PKImporter extends Plugin {
	// @ts-ignore I AM SO TIRED OF TS
	settings: PKImporterSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new PKSettingsTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("file-menu", (menu, file) => {
				menu.addItem((item) => {
					item
						.setTitle("Select as System Template")
						.setIcon("infinity")
						.onClick(async () => {
							this.settings.customSystemProfileFilepath = file.path;
							await this.saveSettings().then(() => {
								new Notice(`System template set to ${file.path}!`);
							});
						});
				});
				menu.addItem((item) => {
					item
						.setTitle("Select as Member Template")
						.setIcon("infinity")
						.onClick(async () => {
							this.settings.customMemberProfileFilepath = file.path;
							await this.saveSettings().then(() => {
								new Notice(`Member template set to ${file.path}!`);
							});
						});
				});
			})
		);
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

export class PKSettingsTab extends PluginSettingTab {
	pk: PKSystem | null;
	systemFilePath: string | null;
	plugin: PKImporter;

	constructor(app: App, plugin: PKImporter) {
		super(app, plugin);
		this.systemFilePath = null;
		this.pk = null;
		this.plugin = plugin;
		this.app = app;
	}

	display(): void {

		let { containerEl } = this;

		containerEl.empty();

		//new Setting(containerEl).setName('ObsidianKit | PluralKit Importer').setHeading();

		const titleElement = containerEl.createEl('div', { cls: 'howto' });
		titleElement.createEl('div', { text: 'ObsidianKit | PluralKit Importer', cls: 'howto__title' });
		const aboutText = `Imports JSON files of exported system data from PluralKit and auto-generates system profile, member profiles, and alphabetized directory of members.`;
		titleElement.createEl('div', { text: aboutText, cls: 'howto__text' });
		titleElement.createEl('a', { href: "https://github.com/northperseids/obsidiankit.git", text: "Documentation" });

		new Setting(containerEl).setName('Import').setHeading();

		new Setting(containerEl)
			.setName("System JSON File")
			.setDesc(`Paste the FULL PATH to the JSON file that you downloaded after running pk;export from PluralKit.`)
			.addText((text) => {
				text.onChange((value) => {
					this.systemFilePath = value;
				})
			})
			.addButton((btn) => {
				btn.setButtonText('Import')
					.setCta()
					.onClick(async () => {
						await this.initSystem();
						await this.createSystemAbout();
						this.createMemberDirectoryPage();
						this.createMemberProfiles();
					})
			})

		new Setting(containerEl).setName('Images').setHeading();

		new Setting(containerEl)
			.setName("Avatar Width")
			.setDesc(`Width for Avatar Images in pixels.`)
			.addText((text) => {
				text.setValue(this.plugin.settings.avatarWidth);
				text.onChange((value) => {
					let regex = /[^0-9]/g;
					if (regex.test(value)) {
						new Notice('Widths can only contain numbers.');
						text.setValue(value.replace(/[^0-9]/g, ''));
					}
					this.plugin.settings.avatarWidth = value;
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName("Banner Width")
			.setDesc(`Width for Banners in pixels.`)
			.addText((text) => {
				text.setValue(this.plugin.settings.bannerWidth);
				text.onChange((value) => {
					let regex = /[^0-9]/g;
					if (regex.test(value)) {
						new Notice('Widths can only contain numbers.');
						text.setValue(value.replace(/[^0-9]/g, ''));
					}
					this.plugin.settings.bannerWidth = value;
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl).setName('Files and Sorting').setHeading();

		new Setting(containerEl)
			.setName(`Overwrite existing files`)
			.setDesc(`Importer will replace any files/folders found with the same name.`)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.overwriteExisting);
				toggle.onChange((value) => {
					this.plugin.settings.overwriteExisting = value;
					this.plugin.saveSettings();
				})
			})

		// not using alphanumeric option right now, but keeping for future if desired
		/* new Setting(containerEl)
			.setName(`Prioritize alphanumeric sorting`)
			.setDesc(`Ignore non-alphanumeric characters in sorting.`)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.prioritizeAlphanumeric);
				toggle.onChange((value) => {
					this.plugin.settings.prioritizeAlphanumeric = value;
					this.plugin.saveSettings();
				})
			}) */

		new Setting(containerEl)
			.setName('Templates')
			.setHeading()
			.setDesc(`Enter paths manually. (You can also create an Obsidian note as your template, right-click on it, and click 'Select as System/Member Template' and it will be set for you!)`);

		new Setting(containerEl)
			.setName("System Profile template")
			.setDesc(`(Leave blank for default template)`)
			.addText((text) => {
				if (this.plugin.settings.customSystemProfileFilepath) {
					text.setValue(this.plugin.settings.customSystemProfileFilepath);
				}
				text.onChange((value) => {
					if (value === '') {
						this.plugin.settings.customSystemProfileFilepath = null;
					} else {
						this.plugin.settings.customSystemProfileFilepath = value;
					}
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName("Member Profile template")
			.setDesc(`(Leave blank for default template)`)
			.addText((text) => {
				if (this.plugin.settings.customMemberProfileFilepath) {
					text.setValue(this.plugin.settings.customMemberProfileFilepath);
				}
				text.onChange((value) => {
					if (value === '') {
						this.plugin.settings.customMemberProfileFilepath = null;
					} else {
						this.plugin.settings.customMemberProfileFilepath = value;
					}
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName(`Keep empty values`)
			.setDesc(`i.e. *No birthday found.* if a member doesn't have a listed birthday. (If using the Default markdown template, if toggled OFF, this will also remove the heading.)`)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.keepEmptyEntries);
				toggle.onChange((value) => {
					this.plugin.settings.keepEmptyEntries = value;
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName('Code blocks')
			.setHeading()
			.setDesc(`Useful if any fields have characters like brackets, asterisks, underscores, etc. since Obsidian will try to render those as markdown.`);

		new Setting(containerEl)
			.setName(`Names`)
			.setDesc(`Places names and display names in inline code blocks.`)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.nameCodeblock);
				toggle.onChange((value) => {
					this.plugin.settings.nameCodeblock = value;
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName(`Descriptions`)
			.setDesc(`Places descriptions in full code blocks.`)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.descriptCodeblock);
				toggle.onChange((value) => {
					this.plugin.settings.descriptCodeblock = value;
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName(`Miscellaneous fields`)
			.setDesc(`Places system tag, pronouns, and proxy tags in inline code blocks.`)
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.miscCodeblock);
				toggle.onChange((value) => {
					this.plugin.settings.miscCodeblock = value;
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName('Character Replacements In Filenames')
			.setHeading()
			.setDesc('Specify custom character replacement to prevent format and link issues in file names, which occur with slashes, brackets, and bar/pipe characters.')

		new Setting(containerEl)
			.setName('Slashes')
			.setDesc('Defaults are visually similar Unicode alternatives ⧸ ⧹.')
			.addText((text) => {
				text.setPlaceholder('Forward Slash');
				if (this.plugin.settings.fwdSlashChara !== '⧸') {
					text.setValue(this.plugin.settings.fwdSlashChara);
				}
				text.onChange((value) => {
					let regex = /[/\\\[\]\|]/g;
					if (regex.test(value)) {
						new Notice('Replacement cannot contain forbidden characters.');
						text.setValue(value.replace(/[/\\\[\]\|]/g, ''));
					}
					if (value === '') {
						this.plugin.settings.fwdSlashChara = '⧸';
					} else {
						this.plugin.settings.fwdSlashChara = value;
					}
					this.plugin.saveSettings();
				})
			})
			.addText((text) => {
				text.setPlaceholder('Backslash')
				if (this.plugin.settings.bkSlashChara !== '⧹') {
					text.setValue(this.plugin.settings.bkSlashChara);
				}
				text.onChange((value) => {
					let regex = /[/\\\[\]\|]/g;
					if (regex.test(value)) {
						new Notice('Replacement cannot contain forbidden characters.');
						text.setValue(value.replace(/[/\\\[\]\|]/g, ''));
					}
					if (value === '') {
						this.plugin.settings.bkSlashChara = '⧹';
					} else {
						this.plugin.settings.bkSlashChara = value;
					}
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName('Brackets')
			.setDesc('Defaults are visually similar unicode alternatives ❲ ❳.')
			.addText((text) => {
				text.setPlaceholder('Open Bracket')
				if (this.plugin.settings.opBracketChara !== '❲') {
					text.setValue(this.plugin.settings.opBracketChara);
				}
				text.onChange((value) => {
					let regex = /[/\\\[\]\|]/g;
					if (regex.test(value)) {
						new Notice('Replacement cannot contain forbidden characters.');
						text.setValue(value.replace(/[/\\\[\]\|]/g, ''));
					}
					if (value === '') {
						this.plugin.settings.opBracketChara = '❲';
					} else {
						this.plugin.settings.opBracketChara = value;
					}
					this.plugin.saveSettings();
				})
			})
			.addText((text) => {
				text.setPlaceholder('Close Bracket')
				if (this.plugin.settings.clsBracketChara !== '❳') {
					text.setValue(this.plugin.settings.clsBracketChara);
				}
				text.onChange((value) => {
					let regex = /[/\\\[\]\|]/g;
					if (regex.test(value)) {
						new Notice('Replacement cannot contain forbidden characters.');
						text.setValue(value.replace(/[/\\\[\]\|]/g, ''));
					}
					if (value === '') {
						this.plugin.settings.clsBracketChara = '❳';
					} else {
						this.plugin.settings.clsBracketChara = value;
					};
					this.plugin.saveSettings();
				})
			})

		new Setting(containerEl)
			.setName('Bar')
			.setDesc('Default is visually similar unicode alternative ❘.')
			.addText((text) => {
				text.setPlaceholder('Bar')
				if (this.plugin.settings.barChara !== '.') {
					text.setValue(this.plugin.settings.barChara);
				}
				text.onChange((value) => {
					let regex = /[/\\\[\]\|]/g;
					if (regex.test(value)) {
						new Notice('Replacement cannot contain forbidden characters.');
						text.setValue(value.replace(/[/\\\[\]\|]/g, ''));
					}
					if (value === '') {
						this.plugin.settings.barChara = '❘';
					} else {
						this.plugin.settings.barChara = value;
					}
					this.plugin.saveSettings();
				})
			})
	}

	async initSystem() {
		try {
			if (typeof (this.systemFilePath) === 'string') {
				const data = fs.readFileSync(this.systemFilePath);
				// @ts-ignore I'm getting so tired of typescript actually. this works fine stop yelling at me
				const content = JSON.parse(data);
				const s = this.plugin.settings;
				this.pk = new PKSystem(
					content,
					s.keepEmptyEntries,
					s.prioritizeAlphanumeric,
					s.nameCodeblock,
					s.descriptCodeblock,
					s.miscCodeblock,
					s.fwdSlashChara,
					s.bkSlashChara,
					s.opBracketChara,
					s.clsBracketChara,
					s.barChara,
					s.avatarWidth,
					s.bannerWidth
				);
				this.pk.setRootDirectory(this.app.vault.getRoot().path);
			}
		} catch (e) {
			console.error(e);
		}
	}

	async createNote(filePath: string, fileName: string, contents: string) {
		const { vault } = this.app;
		const fullFilePath = path.join(filePath, `${fileName}.md`);
		const normalizedPath = normalizePath(fullFilePath);
		const fileExists = await vault.adapter.exists(normalizedPath);
		try {
			if (this.plugin.settings.overwriteExisting) {
				if (fileExists) {
					const fileObj = vault.getAbstractFileByPath(normalizedPath);
					if (!fileObj) {
						throw new Error(`Error deleting ${normalizedPath}`);
					}
					await vault.delete(fileObj);
				}
				await vault.create(normalizedPath, contents);
			} else {
				if (fileExists) {
					throw new Error(`${normalizedPath} already exists`);
				} else {
					await vault.create(normalizedPath, contents);
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	async createFolder(folderPath: string) {
		const { vault } = this.app;
		const normalizedPath = normalizePath(folderPath);
		const fileExists = await vault.adapter.exists(normalizedPath);
		try {
			if (this.plugin.settings.overwriteExisting) {
				if (fileExists) {
					const fileObj = vault.getAbstractFileByPath(normalizedPath);
					if (!fileObj) {
						throw new Error(`Error deleting ${normalizedPath}`);
					}
					await vault.delete(fileObj, true);
				}
				await vault.createFolder(normalizedPath);
			} else {
				if (fileExists) {
					throw new Error(`${folderPath} already exists`);
				} else {
					await vault.createFolder(folderPath);
				}
			}
		} catch (e) {
			console.error(e);
		}
	}

	async createSystemAbout() {
		let isCustomString = false;
		if (this.plugin.settings.customSystemProfileFilepath) {

			// Read contents from file path
			const { vault } = this.app;
			const customTemplateFile = vault.getFileByPath(this.plugin.settings.customSystemProfileFilepath);
			if (customTemplateFile) {
				// set content as template
				const content = await vault.cachedRead(customTemplateFile);
				this.pk?.setCustomSystemTemplate(content);
				isCustomString = true;
			}
		} else {
			this.pk?.clearCustomSystemTemplate();
		}
		const md = this.pk?.getSystemMDString(isCustomString);
		this.createNote(this.pk?.rootDirectory, `${this.pk?.systemName}`, md ?? "*No system information found.*");
	}

	createMemberDirectoryPage() {
		const md = this.pk?.getMemberDirectoryMD(this.plugin.settings.prioritizeAlphanumeric);
		this.createNote(this.pk?.rootDirectory, `Member Directory`, md ?? "*No members found.*");
	}

	async createMemberProfiles() {
		const s: PKImporterSettings = this.plugin.settings;

		const memberDirectory: { [index: string]: any } | undefined = this.pk?.getAlphabetizedMemberObjs(s.prioritizeAlphanumeric);
		if (!memberDirectory) {
			throw new Error("Member directory not found.");
		}
		const charas = Object.keys(memberDirectory).sort();

		// set changeable vars
		let isCustomString = false;
		let memberTemplateArray = this.pk?.memberMarkdownArray;

		// if user specifies filepath
		if (s.customMemberProfileFilepath) {
			// Read contents from file path
			const { vault } = this.app;
			const customTemplateFile = vault.getFileByPath(s.customMemberProfileFilepath);
			if (customTemplateFile) {
				// set content as template
				const content = await vault.cachedRead(customTemplateFile);
				memberTemplateArray = content.split(/[{}]/);
				isCustomString = true;
			}
		}

		for (var chara of charas) {
			const folderName = formatFilename(chara, s.fwdSlashChara, s.bkSlashChara, s.opBracketChara, s.clsBracketChara);
			const charaDir = path.join(this.pk?.rootDirectory, folderName);
			const normalizedCharaPath = normalizePath(charaDir);
			await this.createFolder(normalizedCharaPath);
			const memberArray = memberDirectory[chara];
			for (let i = 0; i < memberArray.length; i++) {
				let member = memberArray[i];
				// will this preserve the main array
				let indivArray = [...memberTemplateArray];
				const md = member.getMemberMDString(
					isCustomString,
					indivArray,
					this.plugin.settings.nameCodeblock,
					this.plugin.settings.descriptCodeblock,
					this.plugin.settings.miscCodeblock,
					this.plugin.settings.keepEmptyEntries,
					this.plugin.settings.avatarWidth,
					this.plugin.settings.bannerWidth,
					this.pk?.systemName,
					this.pk?.tag
				);
				// note: have to strip out slashes for note file names
				const fileName = formatFilename(member.memberName, s.fwdSlashChara, s.bkSlashChara, s.opBracketChara, s.clsBracketChara);
				await this.createNote(normalizedCharaPath, fileName, md);
			}
		}
	}
}