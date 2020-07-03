<template>
    <div class="row">
        <div class=" col-md-4 offset-md-4 offset-sm-1 col-sm-10">
            <h2 class="list-group-item active">Chat Room
                <span
                    class="badge badge-pill badge-light">
                    {{ numberOfUsers }}
                </span>
            </h2>
            <div class="badge badge-pill">{{ typing }}</div>
            <ul class="list-group">
                <message-component
                    v-for="(value,index) in chat.message"
                    :key=value.index
                    :color=chat.color[index]
                    :user=chat.user[index]
                    :time=chat.time[index]>
                    {{ value }}
                </message-component>
            </ul>
            <input type="text" class="form-control" placeholder="Type your messsage here.." v-model="message" @keyup.enter="send">
            <br>
            <a href="" class="btn btn-danger btn-sm" @click.prevent="deleteSession">
                Delete Chats
            </a>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import Toaster from 'v-toaster'
    import 'v-toaster/dist/v-toaster.css'

    Vue.use(Toaster);

    export default {
        data() {
            return{
                message:'',
                chat:{
                    message:[],
                    user: [],
                    color:[],
                    time:[]
                },
                typing:'',
                numberOfUsers:0
            }
        },
        name: "ChatComponet",
        watch:{
            message(){
                Echo.private('chat')
                    .whisper('typing', {
                        name: this.message
                    });
            }
        },
        methods:{
            send(){
                if(this.message.length != 0){
                    this.chat.message.push(this.message);
                    this.chat.user.push("You");
                    this.chat.color.push("success");
                    this.chat.time.push(this.getTime());
                    // console.log(this.chat, "Send all Chat");
                    axios.post('/send', {
                        message:this.message,
                        chat:this.chat,
                    })
                    .then(response=> {
                        // console.log(response, 'Send');
                        this.message='';
                    })
                    .catch(error => {
                        console.log(error);
                    });
                }
            },
            getTime(){
                let time = new Date();
                return time.getHours()+':'+time.getMinutes();
            },
            getOldMessages(){
                axios.post('/getOldMessage')
                .then( response =>{
                    if (response.data !== ' '){
                            this.chat = response.data;
                            console.log(response)

                    }
                })
                .catch(error =>{
                   console.log(error);
                });
            },
            deleteSession(){
                axios.post('deleteSession')
                .then(response => {
                        this.$toaster.success('Chat history is deleted');
                        location.reload();
                });
            }
       },
       mounted(){
           this.getOldMessages();
           Echo.private('chat')
               .listen('ChatEvent', (e) => {
                   this.chat.message.push(e.message);
                   this.chat.user.push(e.user);
                   this.chat.color.push('info');
                   this.chat.time.push(this.getTime());
                   axios.post('/saveToSession',{
                       chat:this.chat
                   })
                       .then( response =>{
                           // console.log(response, "SaveToSession");
                       })
                       .catch(error =>{
                           // console.log(error);
                       });
               })
               .listenForWhisper('typing', (e) => {
                   if(e.name != ''){
                       this.typing = 'typing ...';
                   }else{
                        this.typing = '';
                   }
               });
           Echo.join('chat')
               .here((users) => {
                   this.numberOfUsers = users.length;
                    // console.log(users);
               })
               .joining((user) => {
                   this.numberOfUsers += 1;
                   this.$toaster.success(user.name +' is joined the chat room');
                   // console.log(user.name);
               })
               .leaving((user) => {
                   this.numberOfUsers -= 1;
                   this.$toaster.warning(user.name+ ' is leaved the chat room');
                   // console.log(user.name);
               });
       }
    }
</script>

<style scoped>
    .list-group::-webkit-scrollbar {
        -webkit-appearance: none;
    }
    .list-group::-webkit-scrollbar:vertical {
        width:10px;
    }

    .list-group::-webkit-scrollbar-button:increment,.list-group::-webkit-scrollbar-button {
        display: none;
    }

    .list-group::-webkit-scrollbar:horizontal {
        height: 10px;
    }

    .list-group::-webkit-scrollbar-thumb {
        background-color: #797979;
        border-radius: 20px;
        border: 2px solid #f1f2f3;
    }

    .list-group::-webkit-scrollbar-track {
        border-radius: 10px;
    }
    .list-group{
        overflow-y : scroll;
        height:200px;
    }
</style>
