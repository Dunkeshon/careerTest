import { defineNuxtPlugin } from '#app'
import PrimeVue from 'primevue/config'
import SelectButton from 'primevue/selectbutton'
 
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue)
  nuxtApp.vueApp.component('SelectButton', SelectButton)
}) 