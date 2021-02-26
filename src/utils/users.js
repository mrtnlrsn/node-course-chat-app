const users = []

const addUser = ({ id, username, room }) => {
    // clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate
    if (!username || !room) {
        return {
            error: 'username and room are required'
        }
    }

    // check for existing
    const existingUser = users.find((user) => {
        return user.room === room && user.username ===username
    })
    if (existingUser) {
        return {
            error: 'Username already taken'
        }
    }
    
    const user = { id, username, room }
    users.push(user)
    console.log('add user', user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0]
    }   
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    // clean data
    room = room.trim().toLowerCase()
    return users.filter((user) => {
        return user.room === room
    })
}

// addUser({
//     id: 22,
//     username: 'Morten',
//     room: 'Aalborg '
// })
// addUser({
//     id: 42,
//     username: 'Mike',
//     room: 'Aalborg'
// })
// addUser({
//     id: 32,
//     username: 'Joe',
//     room: 'Gug'
// })
// console.log(users)
// res = addUser({
//     id: 33,
//     username: '',
//     room: 'Aalborg '
// })
// console.log(res)

// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)
// console.log('32', getUser(32))
// console.log('Aalborg', getUsersInRoom('Aalborg'))
// console.log('Gug', getUsersInRoom('Gug'))
// console.log('North Pole', getUsersInRoom('North Pole'))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
