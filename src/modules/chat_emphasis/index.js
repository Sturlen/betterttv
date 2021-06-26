import $ from 'jquery';
import settings from '../../settings.js';
import watcher from '../../watcher.js';
import twitch from '../../utils/twitch.js';
import { viewerCardQuery } from './viewercard.js';

const default_user = {
    color: "#1E90FF",
    displayName: "TheAntMeme",
    id: "81379124",
    isIntl: false,
    login: "theantmeme",
    type: null,
    userDisplayName: "TheAntMeme",
    userID: "81379124",
    userLogin: "theantimeme",
    userType: "",
}

function messageTextFromAST(ast) {
    return ast
        .map((node) => {
            switch (node.type) {
                case 0: // Text
                    return node.content.trim();
                case 3: // CurrentUserHighlight
                    return node.content;
                case 4: // Mention
                    return node.content.recipient;
                case 5: // Link
                    return node.content.url;
                case 6: // Emote
                    return node.content.alt;
                default:
                    return '';
            }
        })
        .join(' ');
}

class ChatEmphasisModule {
    constructor() {
        settings.add({
            id: 'chatEmphasis',
            name: 'Emphasise Names',
            defaultValue: false,
            description: 'Make people youre interested in stand out',
        });

        settings.add({
            id: 'chatIcons',
            name: 'Chat Icons',
            defaultValue: false,
            description: 'Display Icons for ppl in chat',
        });

        settings.on('changed.chatEmphasis', this.toggleChatEmphasis);
        settings.on('changed.chatIcons', this.toggleChatIcons);
        watcher.on('load', this.onLoad);
        // watcher.on('load.chat', () => this.loadChat());
        // watcher.on('load.vod', () => this.loadChat());
        watcher.on('chat.message', ($message, messageObj) => this.onLiveMessage($message, messageObj));
        watcher.on('vod.message', ($message) => this.onVODMessage($message));
    }

    toggleChatEmphasis() { }

    toggleChatIcons() { }

    onLoad() {
        clearAvatarCache()
    }

    async onLiveMessage($message, { user, timestamp, messageParts }) {
        const from = user.userLogin;
        const message_text = messageTextFromAST(messageParts);
        

        //const date = new Date(timestamp);

        
        const use_avatar = isImportant($message)

        if (use_avatar) {

            if (!inAvatarCache(from)) {
                const currentChannel = twitch.getCurrentChannel();
                const icon_url = await viewerCardQuery(currentChannel, from)
                addStyleSheet(`.custom-badge[data-user="${from}"] { background-image: url(${icon_url}); }`)
                addToAvatarCache(from)
            }
            this.addAvatar($message, from)
        }

        const roles = queryRoles($message)
        this.onMessage({ from, roles, message_text })
    }

    async onVODMessage($message) {
        const $from = $message.find(".video-chat__message-author");
        const from = ($from.attr('href') || '').split('?')[0].split('/').pop();
        const $message_text = $message.find(".video-chat__message .message");
        const emotes = Array.from($message_text.find(".chat-line__message--emote")).map((emote) =>
            emote.getAttribute('alt')
        );
        const message_text = `${$message_text.text().replace(/^:/, '')} ${emotes.join(' ')}`;

        const should_highlight = isImportant($message)

        if (should_highlight) {
            this.addHighlight($message)
        }

        const roles = queryRoles($message)
        this.onMessage({ from, roles, message_text })
    }

    onMessage({ from, roles, message_text }) {
        console.log(from, roles, message_text)

    }

    addAvatar($message, userLogin, icon_url = `https://static-cdn.jtvnw.net/jtv_user_pictures/bddfee49-ab08-40c4-b2af-2839503162bc-profile_image-70x70.png`) {

        const $icon = $('<span></span>')
            .addClass("ffz-badge custom-badge")
            .attr("data-badge", "avatar")
            .attr("data-provider", "custom")
            .attr("data-user", userLogin)
        //.attr('style', `background-image: url(${icon_url});`)

        $message.addClass('custom-avatar')
        const badges = $message.find(".chat-line__message--badges")
        badges.prepend($icon)
        //console.log("badges", badges)
        return $message
    }

    addHighlight($message) {

        $message.addClass('highlight-message')
        $message.addClass('ffz-notice-line')

        return $message
    }


    markBlacklisted($message) {
        $message.attr('style', 'display: none !important;');
    }
}

export default new ChatEmphasisModule();

function queryRoles($message) {
    const hasRole = (role) => msgHasRole($message, role);
    const roles = {
        moderator: hasRole("moderator"),
        subscriber: hasRole("subscriber"),
        vip: hasRole("vip"),
        streamer: hasRole("broadcaster"),
        partner: hasRole("partner"),
        staff: hasRole("staff"),
    };
    return roles;
}

function isImportant($message) {
    
    const currentChannel = twitch.getCurrentChannel()
    
    const roles = queryRoles($message)
    const has_important_role = roles.vip || roles.partner || roles.staff || roles.streamer || roles.moderator

    const is_special_user = false

    const is_special_channel = false

    const decision = has_important_role || has_important_role || is_special_channel

    return decision
}



function msgHasRole($message, role = "") {
    let badge = false
    try {
        badge = !!$message.find(`.ffz-badge[data-badge="${role}"]`).length
    } catch (error) {
        console.error("Error finding badges", error)
    }

    return badge
}


function addStyleSheet(style = "") {
    var sheet = document.createElement('style')
    sheet.innerHTML = style;
    document.body.appendChild(sheet);
    return sheet
}

function clearAvatarCache() {
    delete window.__custom_avatar_cache
}

function addToAvatarCache(userLogin) {
    if (!window.__custom_avatar_cache) {
        window.__custom_avatar_cache = []
    }
    window.__custom_avatar_cache.push(userLogin)
}

function inAvatarCache(userLogin) {
    return !!window.__custom_avatar_cache?.includes(userLogin)

}