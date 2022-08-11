const socket=io()

//Elements
const messageForm=document.querySelector("#message-form")
const messageFormInput=document.querySelector("#message-input")
const messageFormButton=document.querySelector('#message-button')
const locationButton=document.querySelector('#send-location')
const messages=document.querySelector("#messages")

//Templates
const messagesTemplate=document.querySelector("#message-template").innerHTML
const locationTemplate=document.querySelector("#location-template").innerHTML
const sideBarTemplate=document.querySelector("#sidebar-template").innerHTML

//Options
const { username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.on('message',(message)=>{
    const html=Mustache.render(messagesTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('H:mm')
    })
    messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage',(url)=>{
    const html=Mustache.render(locationTemplate,{
        url:url.text,
        createdAt:moment(url.createdAt).format('H:mm'),
        username:url.username
    })
    messages.insertAdjacentHTML('beforeend',html)
})

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    //disable
    messageFormButton.setAttribute('disabled','disabled')

    socket.emit('sendMessage',messageFormInput.value,(error)=>{
        //enable
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value=""
        messageFormInput.focus()
        if(error){
            return alert(error)
        }
    })
})

locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    locationButton.setAttribute("disabled","disabled")
    navigator.geolocation.getCurrentPosition((position)=>{
        const {coords}=position
        const {latitude,longitude}=coords
        console.log(position)
        socket.emit('sendLocation',{latitude,longitude},()=>{
            locationButton.removeAttribute("disabled")
            console.log('Location shared!')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sideBarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})