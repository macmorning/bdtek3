"use strict";(self["webpackChunkbdtek3"]=self["webpackChunkbdtek3"]||[]).push([[180,670,539,990],{8952:function(t,e,i){i.r(e),i.d(e,{default:function(){return m}});var s=i(4437),o=i(2469),a=i(6275),r=i(5294),n=function(){var t=this,e=t._self._c;return e("div",{style:t.background},[e(r.Z,{staticStyle:{background:"white",opacity:"0.9"}},[e(s.Z,{attrs:{cols:"10",offset:"1",md:"8","offset-md":"1"}},[e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("ISBN : ")]),t._v(t._s(t.editedItem.uid)+" ")]),e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Titre : ")]),t._v(t._s(t.editedItem.title)+" ")]),t.editedItem.series?e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Série : ")]),t._v(t._s(t.editedItem.series)+" ")]):t._e(),t.editedItem.volume?e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Volume : ")]),t._v(t._s(t.editedItem.volume)+" ")]):t._e(),t.editedItem.author?e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Auteur(s) : ")]),t._v(t._s(t.editedItem.author)+" ")]):t._e(),t.editedItem.published?e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Publié : ")]),t._v(t._s(t.editedItem.published)+" ")]):t._e(),t.editedItem.publisher?e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Editeur : ")]),t._v(t._s(t.editedItem.publisher)+" ")]):t._e(),t.editedItem.edition?e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Edition : ")]),t._v(t._s(t.editedItem.edition)+" ")]):t._e(),t.editedItem.dateAdded?e(r.Z,[e("span",{staticClass:"blue-grey--text text--lighten-2"},[t._v("Date d'ajout : ")]),t._v(t._s(t.editedItem.dateAdded)+" ")]):t._e()],1),e(s.Z,{staticClass:"d-none d-md-block",attrs:{cols:"2"}},[""!==t.editedItem.imageURL.toString()?e(o.Z,{staticClass:"grey lighten-2",attrs:{src:t.editedItem.imageURL.toString(),"aspect-ratio":"1"},on:{click:function(e){return e.stopPropagation(),t.openImage.apply(null,arguments)}},scopedSlots:t._u([{key:"placeholder",fn:function(){return[e(r.Z,{staticClass:"fill-height ma-0",attrs:{align:"center",justify:"center"}},[e(a.Z,{attrs:{indeterminate:"",color:"grey lighten-5"}})],1)]},proxy:!0}],null,!1,4034393411)}):t._e()],1)],1)],1)},l=[],d={props:{readonly:Boolean},data:function(){return{}},computed:{background(){return this.$store.state.currentBook.imageURL?'background-image:url("'+this.$store.state.currentBook.imageURL.toString()+'");background-position:center;background-size:cover;':""},editedItem(){return this.$store.state.currentBook}},methods:{openDetails(){window.open(this.$store.state.currentBook.detailsURL,"_blank")},openImage(){window.open(this.$store.state.currentBook.imageURL,"_blank")}}},c=d,u=i(1001),h=(0,u.Z)(c,n,l,!1,null,null,null),m=h.exports},3399:function(t,e,i){i.r(e),i.d(e,{default:function(){return N}});i(541),i(7658);var s=i(5057),o=i(8914),a=i(3276),r=i(6470),n=i(7195),l=n.ZP.extend({name:"transitionable",props:{mode:String,origin:String,transition:String}}),d=i(8386),c=i(4987),u=i(1050),h=(0,c.Z)(o.Z,(0,d.d)(["left","bottom"]),a.Z,r.Z,l).extend({name:"v-badge",props:{avatar:Boolean,bordered:Boolean,color:{type:String,default:"primary"},content:{required:!1},dot:Boolean,label:{type:String,default:"$vuetify.badge"},icon:String,inline:Boolean,offsetX:[Number,String],offsetY:[Number,String],overlap:Boolean,tile:Boolean,transition:{type:String,default:"scale-rotate-transition"},value:{default:!0}},computed:{classes(){return{"v-badge--avatar":this.avatar,"v-badge--bordered":this.bordered,"v-badge--bottom":this.bottom,"v-badge--dot":this.dot,"v-badge--icon":null!=this.icon,"v-badge--inline":this.inline,"v-badge--left":this.left,"v-badge--overlap":this.overlap,"v-badge--tile":this.tile,...this.themeClasses}},computedBottom(){return this.bottom?"auto":this.computedYOffset},computedLeft(){return this.isRtl?this.left?this.computedXOffset:"auto":this.left?"auto":this.computedXOffset},computedRight(){return this.isRtl?this.left?"auto":this.computedXOffset:this.left?this.computedXOffset:"auto"},computedTop(){return this.bottom?this.computedYOffset:"auto"},computedXOffset(){return this.calcPosition(this.offsetX)},computedYOffset(){return this.calcPosition(this.offsetY)},isRtl(){return this.$vuetify.rtl},offset(){return this.overlap?this.dot?8:12:this.dot?2:4},styles(){return this.inline?{}:{bottom:this.computedBottom,left:this.computedLeft,right:this.computedRight,top:this.computedTop}}},methods:{calcPosition(t){return`calc(100% - ${(0,u.kb)(t||this.offset)})`},genBadge(){const t=this.$vuetify.lang,e=this.$attrs["aria-label"]||t.t(this.label),i=this.setBackgroundColor(this.color,{staticClass:"v-badge__badge",style:this.styles,attrs:{"aria-atomic":this.$attrs["aria-atomic"]||"true","aria-label":e,"aria-live":this.$attrs["aria-live"]||"polite",title:this.$attrs.title,role:this.$attrs.role||"status"},directives:[{name:"show",value:this.isActive}]}),s=this.$createElement("span",i,[this.genBadgeContent()]);return this.transition?this.$createElement("transition",{props:{name:this.transition,origin:this.origin,mode:this.mode}},[s]):s},genBadgeContent(){if(this.dot)return;const t=(0,u.z9)(this,"badge");return t||(this.content?String(this.content):this.icon?this.$createElement(s.Z,this.icon):void 0)},genBadgeWrapper(){return this.$createElement("span",{staticClass:"v-badge__wrapper"},[this.genBadge()])}},render(t){const e=[this.genBadgeWrapper()],i=[(0,u.z9)(this)],{"aria-atomic":s,"aria-label":o,"aria-live":a,role:r,title:n,...l}=this.$attrs;return this.inline&&this.left?i.unshift(e):i.push(e),t("span",{staticClass:"v-badge",attrs:l,class:this.classes},i)}}),m=i(5957),p=i(7179),g=i(3385),f=i(5223),k=i(4437),v=i(6938),b=i(3974),x=i(7652),_=i(5452),y=i(5294),B=i(5251),Z=function(){var t=this,e=t._self._c;return e(b.Z,{attrs:{fluid:""}},[e(y.Z,[e(k.Z,{attrs:{cols:"12",xl:"10","offset-xl":"1"}},[e(g.Z,{style:t.opacity},[t.friendId?e(m.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""}},[e(p.Z,{staticClass:"white--text",attrs:{disabled:!t.$store.state.user,text:"",title:"fermer"},on:{click:t.backToHome}},[e(s.Z,[t._v("mdi-close")])],1),t._v(" Liste de "+t._s(t.friendName)+" ")],1):t._e(),t.cached?e(m.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""}},[e(p.Z,{staticClass:"white--text",attrs:{text:"",title:"version actuelle"},on:{click:t.backToHome}},[e(s.Z,[t._v("mdi-close")])],1),t._v(" Version locale du "+t._s(t.cachedBooksTime)+" ")],1):t._e(),e(f.EB,[e("div",{staticClass:"flex-grow-1"}),e(v.Z,{attrs:{items:t.series,"append-icon":"mdi-magnify",label:"Recherche","append-outer-icon":"mdi-window-close"},on:{"click:append-outer":t.clearSearch},model:{value:t.search,callback:function(e){t.search=e},expression:"search"}})],1),e(x.Z,{staticClass:"elevation-1",attrs:{loading:t.isLoading,"loading-text":"chargement de la collection","no-data-text":"aucun livre dans cette collection","no-results-text":"aucun livre ne correspond à cette recherche",headers:t.headers,items:t.books,"items-per-page":100,search:t.search,"item-key":"uid","fixed-header":"","multi-sort":"","mobile-breakpoint":1,"footer-props":{showFirstLastPage:!t.$vuetify.breakpoint.xs&&!t.$vuetify.breakpoint.sm,itemsPerPageOptions:[50,100,200,-1]},"sort-by":["series","volume"],"show-select":!t.cached&&!t.friendId&&!t.$vuetify.breakpoint.xs&&!t.$vuetify.breakpoint.sm,"single-expand":"",expanded:t.expanded},on:{"click:row":t.expandRow},scopedSlots:t._u([{key:"loading",fn:function(){return[e("p",[t._v("chargement de la collection")]),t.friendId||t.cached||!t.cachedBooksTime?t._e():e("p",[t._v(" chargement trop long ou hors connexion ?"),e("br"),e("a",{on:{click:function(e){return e.stopPropagation(),t.loadFromCache.apply(null,arguments)}}},[t._v("cliquez ici pour charger la dernière version enregistrée le "+t._s(t.cachedBooksTime))])])]},proxy:!0},{key:"item.actions",fn:function({item:i}){return[i.detailsURL?e("a",{staticClass:"mr-2",attrs:{href:i.detailsURL,target:"_blank",title:"ouvrir l'url"},on:{click:function(t){t.stopPropagation()}}},[e(s.Z,[t._v("mdi-link-variant")])],1):t._e(),t.cached||t.friendId?t._e():e(s.Z,{staticClass:"mr-2",attrs:{title:"supprimer"},on:{click:function(e){return e.stopPropagation(),t.deleteItem(i)}}},[t._v(" mdi-delete ")]),t.cached||t.friendId?t._e():e(s.Z,{attrs:{title:"modifier"},on:{click:function(e){return e.stopPropagation(),t.editItem(i)}}},[t._v(" mdi-pen ")])]}},{key:"expanded-item",fn:function({headers:i}){return[e("td",{staticClass:"expansion",attrs:{colspan:i.length}},[t.$vuetify.breakpoint.xs||t.$vuetify.breakpoint.sm?e(m.Z,{staticClass:"blue-grey lighten-1 white--text",attrs:{"single-line":""},scopedSlots:t._u([{key:"actions",fn:function(){return[t.currentBook.detailsURL?e("a",{staticClass:"mr-6",attrs:{href:t.currentBook.detailsURL,target:"_blank",title:"ouvrir l'url"},on:{click:function(t){t.stopPropagation()}}},[e(s.Z,{staticClass:"white--text"},[t._v("mdi-link-variant")])],1):t._e(),t.currentBook.imageURL?e("a",{staticClass:"mr-6 d-md-none",attrs:{href:t.currentBook.imageURL,target:"_blank",title:"afficher l'image"},on:{click:function(t){t.stopPropagation()}}},[e(s.Z,{staticClass:"white--text"},[t._v("mdi-file-image")])],1):t._e(),t.cached||t.friendId?t._e():e(s.Z,{staticClass:"white--text mr-6",attrs:{text:"",title:"supprimer"},on:{click:function(e){return e.stopPropagation(),t.deleteItem(t.currentBook)}}},[t._v("mdi-delete")]),t.cached||t.friendId?t._e():e(s.Z,{staticClass:"white--text",attrs:{text:"",title:"modifier"},on:{click:function(e){return e.stopPropagation(),t.editItem(t.currentBook)}}},[t._v("mdi-pen")])]},proxy:!0}],null,!0)}):t._e(),e("book-details")],1)]}}]),model:{value:t.selectedBooks,callback:function(e){t.selectedBooks=e},expression:"selectedBooks"}})],1)],1)],1),e(_.Z,{model:{value:t.dialogEdit,callback:function(e){t.dialogEdit=e},expression:"dialogEdit"}},[e(g.Z,[e(m.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""},scopedSlots:t._u([{key:"actions",fn:function(){return[t.cached||t.friendId?t._e():e(p.Z,{staticClass:"white--text",attrs:{loading:1==t.book.needLookup,text:"",title:"rechercher les détails"},on:{click:t.askLookup}},[e(s.Z,[t._v("mdi-magnify")])],1),t.cached||t.friendId?t._e():e(p.Z,{staticClass:"white--text",attrs:{disabled:1==t.book.needLookup,text:"",title:"enregistrer"},on:{click:t.save}},[e(s.Z,[t._v("mdi-floppy")])],1)]},proxy:!0}])},[e(p.Z,{staticClass:"white--text",attrs:{text:"",title:"fermer"},on:{click:t.close}},[e(s.Z,[t._v("mdi-close")])],1),t._v(" "+t._s(t.formTitle)+" ")],1),e(f.ZB,[e(b.Z,[e("book-editor",{attrs:{readonly:!!t.friendId}})],1)],1)],1)],1),e(_.Z,{attrs:{width:"400px"},model:{value:t.dialogNew,callback:function(e){t.dialogNew=e},expression:"dialogNew"}},[e(g.Z,[e(m.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""},scopedSlots:t._u([{key:"actions",fn:function(){return[e(p.Z,{staticClass:"white--text",attrs:{text:"",title:"scanner"},on:{click:t.scanSwitch}},[e(s.Z,[t._v("mdi-barcode-scan")])],1),e(p.Z,{staticClass:"white--text",attrs:{text:"",title:"créer"},on:{click:t.saveNew}},[e(s.Z,[t._v("mdi-floppy")])],1)]},proxy:!0}])},[e(p.Z,{staticClass:"white--text",attrs:{text:"",title:"fermer"},on:{click:t.close}},[e(s.Z,[t._v("mdi-close")])],1),t._v(" Nouveau livre ")],1),e(f.ZB,[e(b.Z,[e(B.Z,{attrs:{autofocus:"",label:"ISBN"},on:{keyup:function(e){return!e.type.indexOf("key")&&t._k(e.keyCode,"enter",13,e.key,"Enter")?null:t.saveNew.apply(null,arguments)}},model:{value:t.newBookUID,callback:function(e){t.newBookUID=e},expression:"newBookUID"}})],1),e(_.Z,{attrs:{width:"690px"},model:{value:t.dialogScan,callback:function(e){t.dialogScan=e},expression:"dialogScan"}},[e(g.Z,{staticStyle:{height:"500px"}},[t.dialogScan?e("scanner",{attrs:{"on-detected":t.scanDetected}}):t._e()],1)],1)],1)],1)],1),e(_.Z,{attrs:{width:"600px"},model:{value:t.dialogMulti,callback:function(e){t.dialogMulti=e},expression:"dialogMulti"}},[e(g.Z,[e(m.Z,{staticClass:"blue-grey lighten-1 white--text",staticStyle:{top:"0px"},attrs:{sticky:"","single-line":""},scopedSlots:t._u([{key:"actions",fn:function(){return[e(p.Z,{staticClass:"white--text",attrs:{disabled:!t.multiEdit.seriesBool&&!t.multiEdit.authorBool&&!t.multiEdit.publisherBool,text:"",title:"enregistrer"},on:{click:t.saveMulti}},[e(s.Z,[t._v("mdi-floppy")])],1)]},proxy:!0}])},[e(p.Z,{staticClass:"white--text",attrs:{text:"",title:"fermer"},on:{click:t.close}},[e(s.Z,[t._v("mdi-close")])],1),t._v(" Edition multiple ")],1),e(f.ZB,[e(b.Z,[e("multi-book-editor")],1)],1)],1)],1),t.friendId||t.cached||0!=t.selectedBooks.length?t._e():e(p.Z,{staticClass:"blue-grey lighten-1",attrs:{fab:"",dark:"",fixed:"",bottom:"",right:"",title:"ajouter un livre"},on:{click:t.newItem}},[e(s.Z,[t._v("mdi-book-plus")])],1),!t.friendId&&!t.cached&&t.selectedBooks.length>0?e(p.Z,{staticClass:"blue-grey lighten-1",attrs:{fab:"",dark:"",fixed:"",bottom:"",right:"",title:"édition multiple"},on:{click:t.openMultiEdit}},[e(h,{attrs:{color:"cyan",left:""},scopedSlots:t._u([{key:"badge",fn:function(){return[t._v(" "+t._s(t.selectedBooks.length)+" ")]},proxy:!0}],null,!1,1515944852)},[e(s.Z,[t._v("mdi-pen")])],1)],1):t._e()],1)},I=[],$=i(8952),w=i(4644),S=i(9976),C=i(7347),E={components:{BookDetails:$["default"],BookEditor:w["default"],MultiBookEditor:S["default"],Scanner:C["default"]},data(){return{search:"",scanArray:{},cached:!1,newBookUID:null,alert:!1,expanded:[],dialogEdit:!1,dialogNew:!1,dialogMulti:!1,dialogScan:!1,editedIndex:-1,headersSM:[{value:"uid",text:"ISBN",align:" d-none"},{value:"title",text:"Titre"},{value:"series",text:"Série"},{value:"volume",text:"#"},{value:"author",text:"Auteur(s)",align:" d-none"}],headersMD:[{value:"uid",text:"ISBN",minWidth:"20em"},{value:"title",text:"Titre",minWidth:"20em"},{value:"series",text:"Série"},{value:"volume",text:"#",width:"7em"},{value:"author",text:"Auteur(s)",minWidth:"10em"},{value:"actions",text:"Actions",width:"10em",align:"end",filter:!1,sortable:!1}],headersXL:[{value:"uid",text:"ISBN",minWidth:"20em"},{value:"title",text:"Titre",minWidth:"20em"},{value:"series",text:"Série"},{value:"volume",text:"#",width:"7em"},{value:"author",text:"Auteur(s)",minWidth:"20em"},{value:"publisher",text:"Editeur",minWidth:"10em"},{value:"published",text:"Publié",width:"10em"},{value:"dateAdded",text:"Ajouté",width:"10em"},{value:"actions",text:"Actions",width:"10em",align:"end",filter:!1,sortable:!1}]}},computed:{cachedBooks(){return JSON.parse(localStorage.getItem("collection.books"))},cachedBooksTime(){return localStorage.getItem("collection.booksLastSaved")},friendId(){return this.$route.params.uid},friendName(){return this.$route.query.name||"unknown"},error(){return this.$store.state.error},isLoading(){return this.$store.state.loading},books(){return this.cached?this.cachedBooks:void 0!==this.friendId&&this.friendId?this.$store.state.friendBooks:this.$store.state.books},currentBook(){return this.$store.state.currentBook},formTitle(){return""===this.currentBook.title?"New Book":this.currentBook.title},selectedBooks:{get:function(){return this.$store.state.selectedBooks},set:function(t){this.$store.commit("setSelectedBooks",t)}},book(){return this.$store.state.currentBook},bgRandom(){return this.$store.state.options.bgRandom},opacity(){return this.bgRandom?"opacity:.9;":""},series(){return this.$store.state.series},headers(){return this.$vuetify.breakpoint.xl?this.headersXL:this.$vuetify.breakpoint.lg||this.$vuetify.breakpoint.md?this.headersMD:this.headersSM},multiEdit(){return this.$store.state.multiEdit}},watch:{error(t){t&&(this.alert=!0)},alert(t){t||this.$store.commit("setError",null)},dialogEdit(t){t||this.close()},dialogNew(t){t||this.close()},dialogMulti(t){t||this.close()},$route(t,e){void 0!==t.params.uid&&t.params.uid!==e.params.uid&&this.init()}},created(){this.init()},methods:{init(){this.$store.state.user||this.friendId?void 0!==this.friendId&&this.friendId?this.$store.dispatch("fetchFriendBooks",this.friendId):this.cached||this.$store.dispatch("initBooks"):this.$router.push("/signin")},loadFromCache(){this.cached=!0},clearSearch(){this.search=""},setSearch(t){this.search=t},backToHome(){this.cached=!1,this.$router.push("/")},expandRow(t){t===this.expanded[0]?this.expanded=[]:(this.expanded=[t],this.$store.commit("setCurrentBook",t))},editItem(t){this.expanded=[],this.$store.commit("setCurrentBook",t),this.dialogEdit=!0},newItem(){this.expanded=[],this.$store.dispatch("currentBookClear"),this.dialogNew=!0},openMultiEdit(){this.expanded=[],this.$store.dispatch("currentBookClear"),this.dialogMulti=!0},deleteItem(t){this.expanded=[],confirm('Êtes-vous sûr de vouloir supprimer "'+t.title+'" ?')&&this.$store.dispatch("currentBookDelete",t)},close(){this.dialogEdit=!1,this.dialogNew=!1,this.dialogMulti=!1,this.dialogScan=!1,this.scanArray={},this.$store.dispatch("currentBookClear")},saveNew(){this.newBookUID=this.newBookUID.trim().replace(/\D/g,""),this.$store.dispatch("saveNewBook",this.newBookUID),setTimeout((()=>{this.setSearch(this.newBookUID),this.dialogNew=!1}),500)},saveMulti(){confirm("Êtes-vous certain de vouloir modifier les "+this.selectedBooks.length+" livres sélectionnés ?")&&setTimeout((()=>{this.$store.dispatch("saveMultiBook"),this.dialogMulti=!1}),100)},save(){setTimeout((()=>{this.$store.dispatch("currentBookSave"),this.dialogEdit=!1}),100)},itemSelected(t){this.$store.commit("bookSelected",t)},itemUnselectAll(){const t={value:!1};this.$store.commit("bookSelectedAll",t)},scanSwitch(){this.dialogScan=!this.dialogScan},scanDetected(t){this.scanArray[t.codeResult.code]=void 0!==this.scanArray[t.codeResult.code]?this.scanArray[t.codeResult.code]+1:1,this.scanArray[t.codeResult.code]>=5&&(this.dialogScan=!1,delete this.scanArray,this.scanArray={},this.newBookUID=t.codeResult.code)},askLookup(){confirm("Êtes-vous sûr de vouloir remplacer les informations actuelles par celles qui seront trouvées sur Internet ?")&&(this.book.needLookup=1,this.$store.dispatch("currentBookSave"))}}},R=E,L=i(1001),A=(0,L.Z)(R,Z,I,!1,null,null,null),N=A.exports},9976:function(t,e,i){i.r(e),i.d(e,{default:function(){return k}});i(7393);var s=i(1012),o=i(3316),a=i(1465),r=a.Z.extend({name:"v-checkbox",props:{indeterminate:Boolean,indeterminateIcon:{type:String,default:"$checkboxIndeterminate"},offIcon:{type:String,default:"$checkboxOff"},onIcon:{type:String,default:"$checkboxOn"}},data(){return{inputIndeterminate:this.indeterminate}},computed:{classes(){return{...o.Z.options.computed.classes.call(this),"v-input--selection-controls":!0,"v-input--checkbox":!0,"v-input--indeterminate":this.inputIndeterminate}},computedIcon(){return this.inputIndeterminate?this.indeterminateIcon:this.isActive?this.onIcon:this.offIcon},validationState(){if(!this.isDisabled||this.inputIndeterminate)return this.hasError&&this.shouldValidate?"error":this.hasSuccess?"success":null!==this.hasColor?this.computedColor:void 0}},watch:{indeterminate(t){this.$nextTick((()=>this.inputIndeterminate=t))},inputIndeterminate(t){this.$emit("update:indeterminate",t)},isActive(){this.indeterminate&&(this.inputIndeterminate=!1)}},methods:{genCheckbox(){const{title:t,...e}=this.attrs$;return this.$createElement("div",{staticClass:"v-input--selection-controls__input"},[this.$createElement(s.Z,this.setTextColor(this.validationState,{props:{dense:this.dense,dark:this.dark,light:this.light}}),this.computedIcon),this.genInput("checkbox",{...e,"aria-checked":this.inputIndeterminate?"mixed":this.isActive.toString()}),this.genRipple(this.setTextColor(this.rippleState))])},genDefaultSlot(){return[this.genCheckbox(),this.genLabel()]}}}),n=i(4437),l=i(6938),d=i(5294),c=i(5251),u=function(){var t=this,e=t._self._c;return e(d.Z,[e(n.Z,{attrs:{cols:"12"}},[e(d.Z,[e(n.Z,{attrs:{cols:"1"}},[e(r,{model:{value:t.multiEdit.seriesBool,callback:function(e){t.$set(t.multiEdit,"seriesBool",e)},expression:"multiEdit.seriesBool"}})],1),e(n.Z,{attrs:{cols:"11"}},[e(l.Z,{attrs:{disabled:!t.multiEdit.seriesBool,items:t.series,label:"Série"},model:{value:t.multiEdit.series,callback:function(e){t.$set(t.multiEdit,"series",e)},expression:"multiEdit.series"}})],1),e(n.Z,{attrs:{cols:"1"}},[e(r,{model:{value:t.multiEdit.authorBool,callback:function(e){t.$set(t.multiEdit,"authorBool",e)},expression:"multiEdit.authorBool"}})],1),e(n.Z,{attrs:{cols:"11"}},[e(c.Z,{attrs:{disabled:!t.multiEdit.authorBool,label:"Auteur(s)"},model:{value:t.multiEdit.author,callback:function(e){t.$set(t.multiEdit,"author",e)},expression:"multiEdit.author"}})],1),e(n.Z,{attrs:{cols:"1"}},[e(r,{model:{value:t.multiEdit.publisherBool,callback:function(e){t.$set(t.multiEdit,"publisherBool",e)},expression:"multiEdit.publisherBool"}})],1),e(n.Z,{attrs:{cols:"11"}},[e(l.Z,{attrs:{disabled:!t.multiEdit.publisherBool,items:t.publishers,label:"Editeur"},model:{value:t.multiEdit.publisher,callback:function(e){t.$set(t.multiEdit,"publisher",e)},expression:"multiEdit.publisher"}})],1)],1)],1)],1)},h=[],m={data:function(){return{}},computed:{multiEdit(){return this.$store.state.multiEdit},series(){return this.$store.state.series},publishers(){return this.$store.state.publishers}},methods:{}},p=m,g=i(1001),f=(0,g.Z)(p,u,h,!1,null,null,null),k=f.exports}}]);
//# sourceMappingURL=180.62fc3cc2.js.map