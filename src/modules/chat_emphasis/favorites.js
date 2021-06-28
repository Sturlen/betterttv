import Storage from "../../storage.js"

const special_people = ["harukakaribu", "imsuperthanks4asking", "softalexandra3", "geek_girl_12", "merryweatherey", "suppayuna", "kernemy"]
const special_channels = ["minosura", "tommy_g_", "izzyyshika", "girl_dm_"]

const STORAGE_PREFIX = "CE_"

function isString(obj) {
    return typeof obj === 'string'
}

const print = (msg) => console.log(`[GROUP]: ${msg}`)

class FavoriteGroup  {
    constructor (groupName, storagePrefix=STORAGE_PREFIX) {
        this.groupName = groupName
        this.storagePrefix=storagePrefix
    }

    getMembers() {
        const stored_data = Storage.get(this.groupName, this.storagePrefix)
        const is_array = Array.isArray(stored_data)

        let memberlist = []

        if (is_array) {
            memberlist = [...stored_data]
        }

        return memberlist
    }

    includes(name) {
        const memberlist = this.getMembers()

        const is_string = isString(name)

        let result = false

        if (is_string) {
            result = memberlist.includes(name)
            result ? print(`"${name}" is a member`) : print(`"${name}" is NOT a member`)
        } else {
            print(`Provided name "${name}" is not a string`)
        }

        return result
    }

    remove(nameToRemove) {
        const is_string = isString(nameToRemove)

        const func = (name) => {
            const keep = name === nameToRemove
            return !keep
        }

        const success = false

        if (is_string) {
            const memberlist = this.getMembers()
            const new_list = memberlist.filter(func)
            Storage.set(this.groupName, new_list, this.storagePrefix)
        }

        return success
    }

    addMember(name) {
        let memberlist = this.getMembers()

        const is_string = isString(name)
        
        if (is_string) {
            memberlist.push(name)
            Storage.set(this.groupName, memberlist, this.storagePrefix)
            print(`Adding member ${name} to group ${this.groupName}`)
        } else {
            print(`${name} is not a string, and can't be added as a member of the group ${this.groupName}`)
        }
        
        
    }
}

export const FavoriteChannels = new FavoriteGroup("CHANNELS")
export const FavoriteUsers = new FavoriteGroup("USERS")

