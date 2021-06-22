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
        // watcher.on('load', this.togglePrimePromotions);
        // watcher.on('load.chat', () => this.loadChat());
        // watcher.on('load.vod', () => this.loadChat());
        watcher.on('chat.message', ($message, messageObj) => this.onMessage($message, messageObj));
        watcher.on('vod.message', ($message) => this.onVODMessage($message));
    }

    toggleChatEmphasis() { }

    toggleChatIcons() { }

    //   togglePrimePromotions() {
    //     $('body').toggleClass('bttv-chat-emphasis', settings.get('chatEmphasis'));
    //   }

    async onMessage($message, { user, timestamp, messageParts }) {
        const from = user.userLogin;
        const message = messageTextFromAST(messageParts);
        
        const date = new Date(timestamp);

        const is_mod = user.userType === "mod"

        const currentChannel = twitch.getCurrentChannel();
        const icon_url = await viewerCardQuery(currentChannel, from)

        this.addAvatar($message, user, icon_url)
        if (is_mod) {

        }

        //console.log(user, message, $message)

    }

    onVODMessage($message) {
        const $from = $message.find(VOD_CHAT_FROM_SELECTOR);
        const from = ($from.attr('href') || '').split('?')[0].split('/').pop();
        const $messageContent = $message.find(VOD_CHAT_MESSAGE_SELECTOR);
        const emotes = Array.from($messageContent.find(VOD_CHAT_MESSAGE_EMOTE_SELECTOR)).map((emote) =>
            emote.getAttribute('alt')
        );
        const messageContent = `${$messageContent.text().replace(/^:/, '')} ${emotes.join(' ')}`;

        if (fromContainsKeyword(blacklistUsers, from) || messageContainsKeyword(blacklistKeywords, from, messageContent)) {
            this.markBlacklisted($message);
            return;
        }

        if (fromContainsKeyword(highlightUsers, from) || messageContainsKeyword(highlightKeywords, from, messageContent)) {
            this.addAvatar($message);

        }
    }

    addAvatar($message, { userID, userLogin }, icon_url = `https://static-cdn.jtvnw.net/jtv_user_pictures/bddfee49-ab08-40c4-b2af-2839503162bc-profile_image-70x70.png`) {

        const $icon = $('<span></span>')
            .addClass("ffz-badge custom-badge")
            .attr('style', `background-image: url(${icon_url});`)
            .attr("data-badge", "avatar")
            .attr("data-provider", "custom")
            .attr("data-user", userLogin)
            .attr("data-user-id", userID)

        $message.addClass('custom-avatar')
        const badges = $message.find(".chat-line__message--badges")
        badges.prepend($icon)
        //console.log("badges", badges)
        return $message
    }

    addHighlight($message) {

        $message.addClass('bttv-highlighted')

        return $message
    }


    markBlacklisted($message) {
        $message.attr('style', 'display: none !important;');
    }
}

export default new ChatEmphasisModule();