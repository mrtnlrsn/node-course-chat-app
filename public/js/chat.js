const socket = io()

// Elements
const $messageForm = document.querySelector('#send')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// MLA: autoscroll does not work
const autoscroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight - newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight
    console.log(containerHeight, newMessageHeight, scrollOffset)
    if (containerHeight - newMessageHeight <= scrollOffset + 1) {
        $messages.scrollTop = $messages.scrollHeight
    }
} 

socket.on('message', (message) => {
    console.log(message)

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        createdAt: moment(message.createdAt).format('HH:mm'),
        message: message.text
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (lmsg) => {
    console.log('loc', lmsg)
    
    const html = Mustache.render(locationMessageTemplate, {
        username: lmsg.username,
        createdAt: moment(lmsg.createdAt).format('HH:mm'),
        url: lmsg.url
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    console.log(room, users)
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageFormButton.addEventListener('click', (e) => {
    e.preventDefault() // do not reload page
    $messageFormButton.setAttribute('disabled', 'disabled')
    const msg = $messageFormInput.value
    $messageFormInput.value = ''
    $messageFormInput.focus()
    // console.log('clicked', msg)
    socket.emit('sendMessage', msg, (error) => {
        $messageFormButton.removeAttribute('disabled')
        if (error) {
            return console.log('message rejected!', error)
        }
        console.log('Message delivered')
    })
})

$sendLocationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser')
    }
    $sendLocationButton.setAttribute('disabled', 'disabled')
    e.preventDefault() // do not reload page
    
    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position)
        socket.emit('sendLocation', { 
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join', {
    username, 
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href='/'
    }  
})