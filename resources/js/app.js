require('./bootstrap');

window.Vue = require('vue');

import Toaster from 'v-toaster';

Vue.use(Toaster, { timeout: 500 })

Vue.component('chat-component', require('./components/ChatComponet').default);
Vue.component('message-component', require('./components/MessageComponent.vue').default);

const app = new Vue({
    el: '#app',
});
