import twitchAPI from '../../utils/twitch-api.js';

const API_ENDPOINT = 'https://api.twitch.tv/v5/';
const GQL_ENDPOINT = 'https://gql.twitch.tv/gql';
const CLIENT_ID = '6x8avioex0zt85ht6py4sq55z6avsea';

function makeRequestBody({ channelID, channelLogin, userLogin, }) {
    return [
        {
            "operationName": "ViewerCard",
            "variables": {
                "channelID": channelID, //Streamer 
                "channelLogin": channelLogin, //Streamer 
                "hasChannelID": channelID ? true : false, //Streamer 
                "giftRecipientLogin": userLogin,
                "isViewerBadgeCollectionEnabled": false,
                "withStandardGifting": true
            },
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": "1ad9680b56b15e64eb05cf6a99b49793a788315d32cab241968b582cc5520ed4"
                }
            }
        }
    ]
}

function extractAvatarURL(res) {
    const avatar_url = res[0].data.targetUser.profileImageURL

    if (!avatar_url) {throw new Error("Invalid url", avatar_url)}

    console.log("recieved request data:", res, avatar_url)
    
    return ""+avatar_url

    
}

export async function viewerCardQuery(channel, username) {
    const body = makeRequestBody({channelID: channel.id, channelLogin: channel.name, userLogin: username})
    const res = await twitchAPI.post(null, {
        url: GQL_ENDPOINT,
        body,
        auth: true,
    });

    console.log("Response", res)
    
    return extractAvatarURL(res)

}