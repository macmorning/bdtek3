(function(){var e={8934:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return b}});var r=s(5883),o=s(4562),i=s(4145),n=s(4886),a=s(9256),l=s(4324),u=s(9884),c=s(7808),d=function(){var e=this,t=e._self._c;return t(i.Z,[t(r.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""},scopedSlots:e._u([{key:"actions",fn:function(){return[t(o.Z,{staticClass:"white--text",attrs:{text:"",title:"enregistrer"},on:{click:e.saveOptions}},[t(l.Z,[e._v("mdi-floppy")])],1)]},proxy:!0}])},[t(o.Z,{staticClass:"white--text",attrs:{text:"",title:"fermer"},on:{click:e.closeOptions}},[t(l.Z,[e._v("mdi-close")])],1),e._v(" Vos préférences ")],1),t(n.ZB,[t(a.Z,[t(c.Z,{attrs:{label:"Surnom",hint:"C'est sous ce nom que vous apparaissez dans la liste des utilisateurs.","persistent-hint":""},model:{value:e.displayName,callback:function(t){e.displayName=t},expression:"displayName"}}),t(u.Z,{attrs:{label:"Profil visible de tous",hint:"Détermine si votre profil est public ou non. Même dans le cas contraire, tout le monde peut voir à votre bibliothèque à condition d'avoir l'url correcte.","persistent-hint":""},model:{value:e.visibleToAll,callback:function(t){e.visibleToAll=t},expression:"visibleToAll"}}),t(u.Z,{attrs:{label:"Images de fond aléatoires",hint:"Paramètre enregistré localement.","persistent-hint":""},model:{value:e.bgRandom,callback:function(t){e.bgRandom=t},expression:"bgRandom"}})],1)],1)],1)},h=[],p={data(){return{user:{},displayName:"",visibleToAll:!1,bgRandom:!1,alert:!1}},emits:["close-dialog"],computed:{error(){return this.$store.state.error},isLoading(){return this.$store.state.loading},storedUser(){return this.$store.state.user},storedOptions(){return this.$store.state.options}},created(){this.user=this.storedUser,this.displayName=this.storedUser.displayName,this.visibleToAll=this.storedUser.visibleToAll,this.bgRandom=this.storedOptions.bgRandom},methods:{closeOptions(){this.$emit("close-dialog")},saveOptions(){this.user.displayName=this.displayName,this.user.visibleToAll=this.visibleToAll,this.$store.dispatch("userUpdate",this.user),this.$store.commit("setOptionBgRandom",this.bgRandom),this.closeOptions()}}},m=p,f=s(1001),g=(0,f.Z)(m,d,h,!1,null,null,null),b=g.exports},9193:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return g}});var r=s(5883),o=s(4562),i=s(4145),n=s(4886),a=s(9256),l=s(4324),u=s(7808),c=function(){var e=this,t=e._self._c;return t(i.Z,[t(r.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""}},[t(o.Z,{staticClass:"white--text",attrs:{text:"",title:"fermer"},on:{click:e.closeShare}},[t(l.Z,[e._v("mdi-close")])],1),e._v(" Lien à partager ")],1),t(n.ZB,[t(a.Z,[t(u.Z,{ref:"shareUrlField",attrs:{readonly:"",value:e.shareUrl,"append-outer-icon":"mdi-clipboard-arrow-down"},on:{"click:append-outer":e.shareUrlCopy}})],1)],1)],1)},d=[],h={data(){return{}},emits:["close-dialog"],computed:{error(){return this.$store.state.error},isLoading(){return this.$store.state.loading},shareUrl(){if(!this.$store.state.user)return!1;const e=this.friendId?this.friendId:this.$store.state.user.uid,t=this.friendId&&this.friendName?this.friendName:this.$store.state.user.displayName;return window.location.origin+"/user/"+e+"?name="+t},friendId(){return this.$route.params.uid},friendName(){return this.$route.query.name||"unknown"}},methods:{shareUrlCopy(){this.$refs.shareUrlField.$refs.input.focus(),this.$refs.shareUrlField.$refs.input.select(),document.execCommand("copy"),this.$store.commit("setSuccess","Lien copié dans le presse-papier")},closeShare(){this.$emit("close-dialog")}}},p=h,m=s(1001),f=(0,m.Z)(p,c,d,!1,null,null,null),g=f.exports},2336:function(e,t,s){"use strict";s.r(t),s.d(t,{default:function(){return g}});var r=s(5883),o=s(4562),i=s(4145),n=s(4886),a=s(3863),l=s(4324),u=s(7808),c=function(){var e=this,t=e._self._c;return t(i.Z,[t(r.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""}},[t(o.Z,{staticClass:"white--text",attrs:{text:"",title:"fermer"},on:{click:e.closeList}},[t(l.Z,[e._v("mdi-close")])],1),e._v(" Utilisateurs de bdtek ")],1),t(n.EB,[t("div",{staticClass:"flex-grow-1"}),t(u.Z,{attrs:{"append-icon":"mdi-magnify",label:"Recherche","single-line":"","hide-details":"","append-outer-icon":"mdi-window-close"},on:{"click:append-outer":e.clearSearch},model:{value:e.search,callback:function(t){e.search=t},expression:"search"}})],1),t(a.Z,{staticClass:"elevation-1 users-list",attrs:{loading:e.isLoading,"loading-text":"chargement des utilisateurs",headers:e.headersUsers,items:e.users,search:e.search,"items-per-page":20,"footer-props":{showFirstLastPage:!1,itemsPerPageOptions:[20,50,100]},"item-key":"userId","fixed-header":"","sort-by":["displayName"]},on:{"click:row":e.hop}})],1)},d=[],h={data(){return{search:"",alert:!1,headersUsers:[{value:"displayName",text:"Surnom",minWidth:"20em"}]}},emits:["close-dialog"],computed:{error(){return this.$store.state.error},isLoading(){return this.$store.state.loading},users(){return this.$store.state.users}},created(){this.$store.dispatch("fetchUsers")},methods:{clearSearch(){this.search=""},hop(e){void 0!==this.$route.params.uid&&this.$route.params.uid===e.userId||this.$router.push("/user/"+e.userId+"?name="+e.displayName),this.closeList()},closeList(){this.$emit("close-dialog")}}},p=h,m=s(1001),f=(0,m.Z)(p,c,d,!1,null,null,null),g=f.exports},7421:function(e,t,s){"use strict";var r=s(4275),o=s(4028),i=s(1178);const n={apiKey:"AIzaSyD9LsZST0Q9mbABcODchTjzgQjC05Hdm4Q",authDomain:"blazing-fire-8152.firebaseapp.com",databaseURL:"https://blazing-fire-8152.firebaseio.com",projectId:"blazing-fire-8152",storageBucket:"blazing-fire-8152.appspot.com",messagingSenderId:"551835990000",appId:"1:551835990000:web:f2195643e6fcbe90cf0f35"};function a(e){try{return(0,r.Mq)()}catch{return(0,r.ZF)(e)}}const l=a(n),u=(0,o.v0)(l),c=(0,i.N8)(l);t["Z"]={app:l,auth:u,database:c}},4189:function(e,t,s){"use strict";var r=s(6369),o=s(1705);r.ZP.use(o.Z);const i={};var n=new o.Z(i),a=s(5431);(0,a.z)("/service-worker.js",{ready(){console.log("App is being served from cache by a service worker.\nFor more details, visit https://goo.gl/AFskqB")},registered(){console.log("Service worker has been registered.")},cached(){console.log("Content has been cached for offline use.")},updatefound(){console.log("New content is downloading.")},updated(){console.log("New content is available; please refresh.")},offline(){console.log("No internet connection found. App is running in offline mode.")},error(e){console.error("Error during service worker registration:",e)}});var l=s(108),u=s(3822),c=s(7421),d=s(4028),h=s(1178);const p=c.Z.auth,m=c.Z.database;r.ZP.use(u.ZP);var f,g,b=new u.ZP.Store({data(){return{}},state:{users:[],user:null,error:null,success:null,loading:!1,friendBooks:[],books:[],series:[],publishers:[],currentBook:{},selectedBooks:[],multiEdit:{series:null,seriesBool:!1,author:null,authorBool:!1,publisher:null,publisherBool:!1},options:{bgRandom:!0}},mutations:{setUser(e,t){e.user=t},setError(e,t){e.error=t},setSuccess(e,t){e.success=t},setLoading(e,t){e.loading=t},setSeries(e,t){t.length>1&&t.sort(),e.series=t},setPublishers(e,t){t.length>1&&t.sort(),e.publishers=t},setSelectedBooks(e,t){e.selectedBooks=t},setCurrentBook(e,t){e.currentBook=Object.assign({},t)},removeBook(e,t){const s=e.books.map((function(e){return e.uid})).indexOf(t.key),r=t.val();s>-1&&e.books[s].uid===r.uid&&e.books.splice(s,1)},setBooks(e,t){e.books=t,e.books.forEach((t=>{-1===e.series.indexOf(t.series)&&(e.series.push(t.series),e.series.sort()),-1===e.publishers.indexOf(t.publisher)&&(e.publishers.push(t.publisher),e.publishers.sort())}))},addBook(e,t){const s=e.books.map((function(e){return e.uid})).indexOf(t.key);-1===s&&(e.books.push(t),-1===e.series.indexOf(t.series)&&(e.series.push(t.series),e.series.sort()),-1===e.publishers.indexOf(t.publisher)&&(e.publishers.push(t.publisher),e.publishers.sort()))},updateBook(e,t){const s=e.books.map((function(e){return e.uid})).indexOf(t.key),r=t.val();s>-1&&e.books[s].uid===r.uid&&(e.books[s]=Object.assign(e.books[s],r)),e.currentBook.uid===r.uid&&(e.currentBook=Object.assign(e.currentBook,r))},resetBooks(e){e.currentBook={},e.books=[],e.publishers=[],e.series=[]},setUsers(e,t){e.users=[];for(const s in t)void 0!==t[s].visibleToAll&&!0!==t[s].visibleToAll||e.users.push({userId:s,displayName:t[s].displayName})},setFriendBooks(e,t){e.friendBooks=t},setOptionBgRandom(e,t){void 0===t?e.options.bgRandom="true"===localStorage.getItem("style.bgRandom")||null===localStorage.getItem("style.bgRandom"):(localStorage.setItem("style.bgRandom",t),e.options.bgRandom=t)}},actions:{userResetPwd({commit:e},t){e("setLoading",!0),(0,d.LS)(p,t.email).then((()=>{e("setLoading",!1),e("setSuccess","Email envoyé")})).catch((t=>{e("setError",t.message),e("setLoading",!1)}))},userSignUp({commit:e},t){e("setLoading",!0),(0,d.Xb)(p,t.email,t.password).then((t=>{const s=t.user.email.substring(0,t.user.email.indexOf("@"));(0,d.ck)(p,{displayName:s});const r=(0,h.iH)(m,`bd/${t.user.uid}`);(0,h.jM)(r,(r=>{(0,h.t8)((0,h.iH)(m,`bd/${t.user.uid}`),!0),e("setUser",{email:t.user.email,uid:t.user.uid,displayName:s}),e("setSuccess","Votre compte a été créé. Bienvenue !"),l.Z.push("/")})).catch((t=>{e("setError",t.message)}))})).catch((t=>{e("setError",t.message)})).finally((()=>{e("setLoading",!1)}))},userSignIn({dispatch:e,commit:t},s){t("setLoading",!0),(0,d.e5)(p,s.email,s.password).then((s=>{e("doSignIn",s.user),t("setError",null),setTimeout((()=>{l.Z.push("/")}),100)})).catch((e=>{t("setError",e.message)})).finally((()=>{t("setLoading",!1)}))},userSignInGoogle({dispatch:e,commit:t}){t("setLoading",!0);const s=new d.hJ;(0,d.rh)(p,s).then((s=>{e("doSignIn",s.user),t("setError",null),setTimeout((()=>{l.Z.push("/")}),100)})).catch((e=>{t("setError",e.message)})).finally((()=>{t("setLoading",!1)}))},doSignIn({commit:e},t){const s={uid:t.uid,email:t.email,displayName:t.displayName,photoURL:t.photoURL};e("setOptionBgRandom"),e("setUser",s);const r=(0,h.iH)(m,`users/${t.uid}`);(0,h.jM)(r,(t=>{Object.assign(s,t.val()),void 0===s.visibleToAll&&(s.visibleToAll=!0),e("setUser",s)}))},userSignOut({commit:e}){(0,h.S1)((0,h.iH)(m,`bd/${this.state.user.uid}`)),(0,d.w7)(p),e("resetBooks"),e("setUser",null),e("setSelectedBooks",[]),l.Z.push("/signin")},userUpdate({commit:e},t){e("setUser",t),(0,d.ck)(p.currentUser,{displayName:t.displayName}).then((()=>{e("setSuccess","Vos préférences sont enregistrées"),(0,h.t8)((0,h.iH)(m,`users/${t.uid}`),{displayName:t.displayName,visibleToAll:t.visibleToAll})})).catch((t=>{e("setError","Vos préférences n'ont pas été enregistrées : "+t.message)}))},fetchUsers({commit:e},t){e("setLoading",!0),(0,h.U2)((0,h.IO)((0,h.iH)(m,"users"),(0,h.g2)("displayName"))).then((t=>{e("setLoading",!1),e("setUsers",t.val())}))},fetchFriendBooks({commit:e},t){e("setLoading",!0),m.ref(`bd/${t}`).orderByChild("computedOrderField").limitToFirst(1e3).once("value").then((t=>{const s=t.val(),r=[];if(null!==s)for(const[e,o]of Object.entries(s))void 0===o.uid&&(o.uid=e),r.push(o);e("setFriendBooks",r)})).catch((t=>{e("setError","Liste non chargée : "+t.message)})).finally((()=>{e("setLoading",!1)}))},initBooks({dispatch:e,commit:t}){if(!this.state.user)return t("setError","Une erreur s'est produite, veuillez rafraîchir la page"),!1;if(this.state.books.length>0)return!1;let s=!1;t("setLoading",!0);const r=this.state.user.uid,o=(0,h.IO)((0,h.iH)(m,`bd/${r}`),(0,h.g2)("computedOrderField"));(0,h.jM)(o,(r=>{const o=r.val(),i=[];for(const[e,t]of Object.entries(o))void 0===t.uid&&(t.uid=e),i.push(t);t("setBooks",i),e("cacheBooks"),s=!0,t("setLoading",!1)}))},currentBookDelete({commit:e},t){void 0!==t&&void 0!==t.uid&&""!==t.uid&&(e("setLoading",!0),m.ref(`bd/${this.state.user.uid}/${t.uid}`).remove().then((()=>{e("setSuccess","Livre retiré")})).catch((t=>{e("setError","Livre non retiré : "+t.message)})).finally((()=>{e("setLoading",!1)})))},currentBookClear({commit:e}){e("setCurrentBook",{})},currentBookSave({commit:e}){const t=this.state.currentBook;if(void 0===t||void 0===t.uid||!t.uid)return!1;e("setLoading",!0),t.computedOrderField=(t.series?t.series+(t.volume?"_"+t.volume.toString().padStart(4,"0"):""):"")+"_"+t.title,m.ref(`bd/${this.state.user.uid}/${t.uid}`).update(t).then((()=>{e("setSuccess","Livre enregistré")})).catch((t=>{e("setError","Livre non enregistré: "+t.message)})).finally((()=>{e("setLoading",!1)}))},saveMultiBook({commit:e}){this.state.selectedBooks.forEach((t=>{t.uid&&(t.series=this.state.multiEdit.seriesBool?this.state.multiEdit.series:t.series,t.publisher=this.state.multiEdit.publisherBool?this.state.multiEdit.publisher:t.publisher,t.author=this.state.multiEdit.authorBool?this.state.multiEdit.author:t.author,e("setCurrentBook",t),this.dispatch("currentBookSave"))}))},saveNewBook({commit:e},t){if(void 0===t||!t)return!1;const s=this.state.books.map((function(e){return e.uid})).indexOf(t);if(s>-1)return e("setError","Un livre portant cette référence est déjà dans votre bibliothèque"),!1;e("setLoading",!0);const r={};r.uid=t,r.series=null,r.needLookup=1,r.dateAdded=(new Date).getUTCFullYear()+"-"+((new Date).getUTCMonth()+1).toString().padStart(2,"0")+"-"+(new Date).getUTCDate().toString().padStart(2,"0");try{m.ref(`bd/${this.state.user.uid}/${t}`).set(r).then((()=>{e("setSuccess","Livre ajouté"),e("setCurrentBook",r)})).catch((t=>{e("setError","Livre non ajouté : "+t.message)})).finally((()=>{e("setLoading",!1)}))}catch(o){e("setError","Livre non ajouté : "+o),e("setLoading",!1)}},async cacheBooks(){localStorage.setItem("collection.books",JSON.stringify(this.state.books));const e=new Date;localStorage.setItem("collection.booksLastSaved",e.getFullYear()+"-"+(e.getMonth()+1).toString().padStart(2,"0")+"-"+e.getDate().toString().padStart(2,"0")+" "+e.getHours().toString().padStart(2,"0")+":"+e.getMinutes().toString().padStart(2,"0"))}},getters:{isAuthenticated(e){return null!==e.user&&void 0!==e.user}}}),v=s(1001),k={},y=(0,v.Z)(k,f,g,!1,null,null,null),S=(y.exports,s(998)),Z=s(5716),w=s(4562),x=s(9930),B=s(4324),O=s(5808),L=s(4525),$=s(3059),E=s(4528),N=s(9258),U=s(3687),_=s(7953),C=function(){var e=this,t=e._self._c;return t(S.Z,[t(Z.Z,{staticClass:"blue-grey lighten-1",attrs:{app:""}},[t(_.qW,[t("router-link",{staticClass:"white--text",staticStyle:{cursor:"pointer"},attrs:{to:"/"}},[e._v(" "+e._s(e.appTitle)+" ")])],1),t(U.Z),t(_.lj,[e._l(e.menuItems,(function(s){return t(w.Z,{key:s.title,staticClass:"white--text",attrs:{text:"",title:s.title,to:s.path}},[t(B.Z,{attrs:{dark:""}},[e._v(e._s(s.icon))])],1)})),e.isAuthenticated?t(w.Z,{staticClass:"white--text",attrs:{text:"",title:"utilisateurs"},on:{click:e.users}},[t(B.Z,{attrs:{dark:""}},[e._v("mdi-account-multiple")])],1):e._e(),e.isAuthenticated?t(E.Z,{attrs:{bottom:""},scopedSlots:e._u([{key:"activator",fn:function({on:s}){return[t(w.Z,e._g({staticClass:"white--text",attrs:{dark:"",icon:""}},s),[t(B.Z,[e._v("mdi-dots-vertical")])],1)]}}],null,!1,3001465028)},[t(O.Z,[t(L.Z,[t(w.Z,{attrs:{title:"options",text:""},on:{click:e.options}},[t(B.Z,{staticClass:"mr-3"},[e._v("mdi-wrench")]),e._v(" options ")],1)],1),t(L.Z,[t(w.Z,{attrs:{title:"partage",text:""},on:{click:e.share}},[t(B.Z,{staticClass:"mr-3"},[e._v("mdi-share")]),e._v(" partage ")],1)],1),t(L.Z,[t(w.Z,{attrs:{title:"déconnexion",text:""},on:{click:e.userSignOut}},[t(B.Z,{staticClass:"mr-3"},[e._v("mdi-exit-to-app")]),e._v(" déconnexion ")],1)],1)],1)],1):e._e()],2)],1),t($.Z,[t("router-view",{style:e.backgroundStyle,attrs:{id:"root"}})],1),t(N.Z,{attrs:{bottom:"",left:"","multi-line":"",color:"error",timeout:6e3},model:{value:e.snackError,callback:function(t){e.snackError=t},expression:"snackError"}},[e._v(" "+e._s(e.error)+" ")]),t(N.Z,{attrs:{bottom:"",left:"",color:"success",timeout:3e3},model:{value:e.snackSuccess,callback:function(t){e.snackSuccess=t},expression:"snackSuccess"}},[e._v(" "+e._s(e.success)+" ")]),t(x.Z,{attrs:{"max-width":"500"},model:{value:e.optionsDialog,callback:function(t){e.optionsDialog=t},expression:"optionsDialog"}},[t("options",{on:{"close-dialog":e.closeOptions}})],1),t(x.Z,{attrs:{"max-width":"500"},model:{value:e.shareDialog,callback:function(t){e.shareDialog=t},expression:"shareDialog"}},[t("share",{on:{"close-dialog":e.closeShare}})],1),t(x.Z,{attrs:{"max-width":"700"},model:{value:e.usersDialog,callback:function(t){e.usersDialog=t},expression:"usersDialog"}},[t("users",{on:{"close-dialog":e.closeUsers}})],1)],1)},A=[],T=s(8934),D=s(9193),j=s(2336),I={components:{Options:T["default"],Share:D["default"],Users:j["default"]},data(){return{appTitle:"BDTek",maxImgNum:10,snackSuccess:!1,snackError:!1,shareDialog:!1,optionsDialog:!1,usersDialog:!1}},computed:{error(){return this.$store.state.error},success(){return this.$store.state.success},isAuthenticated(){return this.$store.getters.isAuthenticated},menuItems(){return this.isAuthenticated?[{title:"Bibliothèque",path:"/",icon:"mdi-book-multiple"}]:[{title:"Connexion",path:"/signin",icon:"mdi-lock-open"}]},backgroundStyle(){return this.$store.state.options.bgRandom?{"background-position":"center","background-size":"cover","background-attachment":"fixed","background-image":"url("+this.imgUrl+")","min-height":"100%"}:{"background-color":"#fafafa","min-height":"100%"}},imgUrl(){let e="";if(e="/img/"+this.getRandomNumber(this.maxImgNum).toString().padStart(2,"0")+".webp",this.$store.state.books.length>0){let e=0,t="";do{if(e++,t=this.$store.state.books[this.getRandomNumber(this.$store.state.books.length)].imageURL,""!==t)return t}while(e<5)}return e}},watch:{error(e){this.snackError=!1,e&&(this.snackError=!0)},success(e){this.snackSuccess=!1,e&&(this.snackSuccess=!0)},snackError(e){e||this.$store.commit("setError",null)},snackSuccess(e){e||this.$store.commit("setSuccess",null)}},created(){},methods:{closeOptions(){this.optionsDialog=!1},closeUsers(){this.usersDialog=!1},closeShare(){this.shareDialog=!1},share(){this.shareDialog=!0},users(){this.usersDialog=!0},options(){this.optionsDialog=!0},userSignOut(){this.$store.dispatch("userSignOut")},getRandomNumber(e){return Math.floor(Math.random()*Math.floor(e))+1}}},R=I,P=(0,v.Z)(R,C,A,!1,null,null,null),F=P.exports;r.ZP.config.productionTip=!1;const M=c.Z.auth,H=(0,d.Aj)(M,(e=>{new r.ZP({vuetify:n,router:l.Z,store:b,created(){e&&b.dispatch("doSignIn",e)},render:e=>e(F)}).$mount("#app"),H()}))},108:function(e,t,s){"use strict";var r=s(6369),o=s(2631),i=s(7421);const n=[{path:"/",component:"Home"},{path:"/user/:uid",component:"Home"},{path:"/signin",component:"Signin"},{path:"/signup",component:"Signup"},{path:"/reset",component:"PasswordForget"},{path:"/scanner",component:"Scanner"},{path:"*",component:"Notfound"}],a=n.map((e=>({...e,component:()=>s(3457)(`./${e.component}.vue`)})));r.ZP.use(o.Z);const l=new o.Z({mode:"history",routes:a}),u=i.Z.auth;l.beforeEach(((e,t,s)=>{const r=e.matched.some((e=>e.meta.requiresAuth)),o=u.currentUser;r&&!o?s("/signin"):s()})),t["Z"]=l},3457:function(e,t,s){var r={"./BookDetails.vue":[6755,755],"./BookEditor.vue":[177,543,177,141],"./Home.vue":[1410,543,988,177,717],"./MultiBookEditor.vue":[5262,543,710],"./Notfound.vue":[822,822],"./Options.vue":[8934],"./PasswordForget.vue":[3202,202],"./Scanner.vue":[6988,988,669],"./Share.vue":[9193],"./Signin.vue":[6301,909],"./Signup.vue":[4496,496],"./Users.vue":[2336]};function o(e){if(!s.o(r,e))return Promise.resolve().then((function(){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}));var t=r[e],o=t[0];return Promise.all(t.slice(1).map(s.e)).then((function(){return s(o)}))}o.keys=function(){return Object.keys(r)},o.id=3457,e.exports=o}},t={};function s(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r].call(i.exports,i,i.exports,s),i.exports}s.m=e,function(){var e=[];s.O=function(t,r,o,i){if(!r){var n=1/0;for(c=0;c<e.length;c++){r=e[c][0],o=e[c][1],i=e[c][2];for(var a=!0,l=0;l<r.length;l++)(!1&i||n>=i)&&Object.keys(s.O).every((function(e){return s.O[e](r[l])}))?r.splice(l--,1):(a=!1,i<n&&(n=i));if(a){e.splice(c--,1);var u=o();void 0!==u&&(t=u)}}return t}i=i||0;for(var c=e.length;c>0&&e[c-1][2]>i;c--)e[c]=e[c-1];e[c]=[r,o,i]}}(),function(){s.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return s.d(t,{a:t}),t}}(),function(){s.d=function(e,t){for(var r in t)s.o(t,r)&&!s.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){s.f={},s.e=function(e){return Promise.all(Object.keys(s.f).reduce((function(t,r){return s.f[r](e,t),t}),[]))}}(),function(){s.u=function(e){return"js/"+e+"."+{141:"bf4d139c",177:"40281dd6",202:"57fd2a8d",496:"08614e67",543:"cdfe1100",669:"21815104",710:"5291567f",717:"e58f3d8e",755:"75be67d7",822:"3da15c09",909:"ff4c0c06",988:"5ca19f5f"}[e]+".js"}}(),function(){s.miniCssF=function(e){return"css/"+e+"."+{141:"df1dabd0",496:"16e0fd92",669:"3d0edebe",710:"0d78ca8d",717:"d4b65d6b",909:"16e0fd92"}[e]+".css"}}(),function(){s.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){s.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="bdtek3:";s.l=function(r,o,i,n){if(e[r])e[r].push(o);else{var a,l;if(void 0!==i)for(var u=document.getElementsByTagName("script"),c=0;c<u.length;c++){var d=u[c];if(d.getAttribute("src")==r||d.getAttribute("data-webpack")==t+i){a=d;break}}a||(l=!0,a=document.createElement("script"),a.charset="utf-8",a.timeout=120,s.nc&&a.setAttribute("nonce",s.nc),a.setAttribute("data-webpack",t+i),a.src=r),e[r]=[o];var h=function(t,s){a.onerror=a.onload=null,clearTimeout(p);var o=e[r];if(delete e[r],a.parentNode&&a.parentNode.removeChild(a),o&&o.forEach((function(e){return e(s)})),t)return t(s)},p=setTimeout(h.bind(null,void 0,{type:"timeout",target:a}),12e4);a.onerror=h.bind(null,a.onerror),a.onload=h.bind(null,a.onload),l&&document.head.appendChild(a)}}}(),function(){s.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){s.p="/"}(),function(){var e=function(e,t,s,r){var o=document.createElement("link");o.rel="stylesheet",o.type="text/css";var i=function(i){if(o.onerror=o.onload=null,"load"===i.type)s();else{var n=i&&("load"===i.type?"missing":i.type),a=i&&i.target&&i.target.href||t,l=new Error("Loading CSS chunk "+e+" failed.\n("+a+")");l.code="CSS_CHUNK_LOAD_FAILED",l.type=n,l.request=a,o.parentNode.removeChild(o),r(l)}};return o.onerror=o.onload=i,o.href=t,document.head.appendChild(o),o},t=function(e,t){for(var s=document.getElementsByTagName("link"),r=0;r<s.length;r++){var o=s[r],i=o.getAttribute("data-href")||o.getAttribute("href");if("stylesheet"===o.rel&&(i===e||i===t))return o}var n=document.getElementsByTagName("style");for(r=0;r<n.length;r++){o=n[r],i=o.getAttribute("data-href");if(i===e||i===t)return o}},r=function(r){return new Promise((function(o,i){var n=s.miniCssF(r),a=s.p+n;if(t(n,a))return o();e(r,a,o,i)}))},o={143:0};s.f.miniCss=function(e,t){var s={141:1,496:1,669:1,710:1,717:1,909:1};o[e]?t.push(o[e]):0!==o[e]&&s[e]&&t.push(o[e]=r(e).then((function(){o[e]=0}),(function(t){throw delete o[e],t})))}}(),function(){var e={143:0};s.f.j=function(t,r){var o=s.o(e,t)?e[t]:void 0;if(0!==o)if(o)r.push(o[2]);else if(/^(141|669)$/.test(t))e[t]=0;else{var i=new Promise((function(s,r){o=e[t]=[s,r]}));r.push(o[2]=i);var n=s.p+s.u(t),a=new Error,l=function(r){if(s.o(e,t)&&(o=e[t],0!==o&&(e[t]=void 0),o)){var i=r&&("load"===r.type?"missing":r.type),n=r&&r.target&&r.target.src;a.message="Loading chunk "+t+" failed.\n("+i+": "+n+")",a.name="ChunkLoadError",a.type=i,a.request=n,o[1](a)}};s.l(n,l,"chunk-"+t,t)}},s.O.j=function(t){return 0===e[t]};var t=function(t,r){var o,i,n=r[0],a=r[1],l=r[2],u=0;if(n.some((function(t){return 0!==e[t]}))){for(o in a)s.o(a,o)&&(s.m[o]=a[o]);if(l)var c=l(s)}for(t&&t(r);u<n.length;u++)i=n[u],s.o(e,i)&&e[i]&&e[i][0](),e[i]=0;return s.O(c)},r=self["webpackChunkbdtek3"]=self["webpackChunkbdtek3"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=s.O(void 0,[998],(function(){return s(4189)}));r=s.O(r)})();
//# sourceMappingURL=app.467634d8.js.map