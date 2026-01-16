import{d as y,N as R,v as q,p as O,_ as w,O as N,P as j,e as D,Q as H,o as _,c as E,j as $,R as U,S as z,U as S,b as k,V as J,r as X,W as K,B as Q,q as W,i as A,a as r,F,m as b,X as V,x as G,w as P,h as Y,Y as Z,Z as ee,$ as B,n as te,g as oe,a0 as h,J as f,u as re,a1 as se,a2 as I}from"./gameserver-1c2982e3.js";const ne=Symbol("scroll-inview-parent");function ie(o){const s=q(new Map);function e(a){const m=s.value.get(a);if(!m){const c=le(a,o);return s.value.set(a,c),c}return m}const n={containers:s,getContainer:e};return O(ne,n),n}function le(o,s){const e=new WeakMap,n=new Set;let a=[];const m=i=>{for(const t of i){const{intersectionRatio:L,isIntersecting:x,target:M}=t,T=e.get(M);if(!T)continue;const C=o.emitsOn==="full-overlap"?L===1:x;c(()=>{T.latestThreshold=L,C!==T.isInview&&(T.isInview=C,C?T.emitChange(!0):T.emitChange(!1))})}o.trackFocused&&c(()=>p())},d=new IntersectionObserver(m,{root:s,rootMargin:o.margin,threshold:[1,.75,.5,.25,0]});function c(i){a.push(i),a.length===1&&window.requestAnimationFrame(v)}const v=()=>{for(const i of a)i();a=[]};function p(){let i=null;for(const t of n)i=t.latestThreshold>=.5&&(!i||t.latestThreshold>i.latestThreshold)?t:i,t.isFocused&&(t.isFocused=!1);i&&(i.isFocused=!0)}return{observeItem(i){e.set(i.element,i),n.add(i),d.observe(i.element)},unobserveItem(i){const{element:t}=i;t&&(e.delete(t),d.unobserve(t)),n.delete(i),p()}}}const ae=y({__name:"AppScrollInviewParent",props:{scrollElement:{type:Object,default:null}},setup(o){return ie(o.scrollElement),(e,n)=>R(e.$slots,"default")}}),ce=w(ae,[["__file","AppScrollInviewParent.vue"]]),_e=y({name:"AppStyle",props:{content:{type:String,required:!0}},render(){return N("style",{innerHTML:this.$props.content})}}),pe=w(_e,[["__file","AppStyle.vue"]]);let ue=0;function l(o,s,e=!1){s="#"+s;const n=U(s),a=e?"dark-":"";return`
		--${a}theme-${o}: ${s};
		--${a}theme-${o}-trans: ${z(1,s)};
		--${a}theme-${o}-rgb: ${n.red}, ${n.green}, ${n.blue};
	`}function u(o,s,e=!1){const n=e?"dark-":"";return`
		--${n}theme-${o}: var(--theme-${s});
		--${n}theme-${o}-trans: var(--theme-${s}-trans);
		--${n}theme-${o}-rgb: var(--theme-${s}-rgb);
	`}function g(o){return`
		--theme-${o}: var(--dark-theme-${o});
		--theme-${o}-trans: var(--dark-theme-${o}-trans);
		--theme-${o}-rgb: var(--dark-theme-${o}-rgb);
	`}const de=Symbol("ThemeData");function ge(o){const s=S(o.theme),e=S(o.isDark);return{theme:s,isDarkTheme:e,isLightTheme:S(()=>!e.value)}}const me=y({__name:"AppTheme",props:{isRoot:{type:Boolean},theme:{type:Object,default:null},forceDark:{type:Boolean},forceLight:{type:Boolean}},setup(o){const s=o,{theme:e,isDark:n}=j(),m="theme-"+ ++ue,d=s.isRoot?":root":"#"+m,c=D(()=>s.theme??e.value??H),v=D(()=>n.value&&!s.forceLight||s.forceDark);O(de,ge({theme:c,isDark:v}));const p=D(()=>{let i="";const t=c.value;return i+=`
		${d} {
			${l("white","fff")}
			${l("black","000")}

			${l("darkest",t.darkest_)}
			${l("darker",t.darker_)}
			${l("dark",t.dark_)}
			${l("gray",t.gray_)}
			${l("gray-subtle",t.graySubtle_)}
			${l("light",t.light_)}
			${l("lighter",t.lighter_)}
			${l("lightest",t.lightest_)}

			${l("highlight",t.highlight_)}
			${l("highlight-fg",t.highlightFg_)}
			${l("backlight",t.backlight_)}
			${l("backlight-fg",t.backlightFg_)}
			${l("notice",t.notice_)}
			${l("notice-fg",t.noticeFg_)}
			${l("bi-bg",t.biBg_)}
			${l("bi-fg",t.biFg_)}
			${u("bg","white")}
			${u("bg-offset","lightest")}
			${l("bg-backdrop",t.bgBackdrop_)}
			${u("bg-subtle","lighter")}
			${u("fg","dark")}
			${u("fg-muted","light")}
			${u("link","backlight")}
			${u("link-hover","black")}
			${u("primary","link")}
			${u("primary-fg","backlight-fg")}

			${l("highlight",t.darkHighlight_,!0)}
			${l("backlight",t.darkBacklight_,!0)}
			${l("notice",t.darkNotice_,!0)}
			${l("bi-bg",t.darkBiBg_,!0)}
			${l("bi-fg",t.darkBiFg_,!0)}
			${u("bg","dark",!0)}
			${u("bg-offset","darker",!0)}
			${l("bg-backdrop",t.darkBgBackdrop_,!0)}
			${u("bg-subtle","gray-subtle",!0)}
			${u("fg","lightest",!0)}
			${u("fg-muted","light",!0)}
			${l("link",t.darkHighlight_,!0)}
			${u("link-hover","white",!0)}
			${u("primary","link",!0)}
			${l("primary-fg",t.darkPrimaryFg_,!0)}
		}
	`,v.value&&(i+=`
			${d} {
				${g("highlight")}
				${g("backlight")}
				${g("notice")}
				${g("bi-bg")}
				${g("bi-fg")}
				${g("bg")}
				${g("bg-offset")}
				${g("bg-backdrop")}
				${g("bg-subtle")}
				${g("fg")}
				${g("fg-muted")}
				${g("link")}
				${g("link-hover")}
				${g("primary")}
				${g("primary-fg")}
			}
		`),i.replace(/\s+/g,"")});return(i,t)=>(_(),E("div",{id:m},[$(pe,{content:p.value},null,8,["content"]),R(i.$slots,"default")]))}}),he=w(me,[["__file","AppTheme.vue"]]),fe=y({__name:"AppGrowlDynamic",props:{growl:{type:Object,required:!0}},emits:{close:()=>!0},setup(o,{emit:s}){const e=s;return(n,a)=>(_(),k(X(o.growl.component),J(o.growl.props,{onClose:a[0]||(a[0]=m=>e("close"))}),null,16))}}),$e=w(fe,[["__file","AppGrowlDynamic.vue"]]);const ke={class:"growl-inner fill-gray"},ve={key:0,class:"growl-icon"},be=["src"],ye={class:"growl-content"},we={key:0,class:"growl-title"},Ae=y({__name:"AppGrowl",props:{index:{type:Number,required:!0},growl:{type:Object,required:!0}},setup(o){const s=o,{growl:e}=K(s);let n;const a=D(()=>["growl-type-"+e.value.type,{"growl-clickable":!!e.value.onClick,"growl-has-icon":!!e.value.icon,"growl-sticky":e.value.sticky}]);Q(()=>{e.value.sticky||c()});function m(p){e.value.onClick&&(e.value.onClick(p),d(p))}function d(p){p&&p.stopPropagation(),e.value.close()}function c(){e.value.sticky||n||(n=setTimeout(()=>{d()},4e3))}function v(){e.value.sticky||!n||(clearTimeout(n),n=void 0)}return(p,i)=>{const t=W("AppJolticon");return _(),E("div",{class:G(["growl",a.value]),onMouseover:v,onMouseout:c,onClick:m},[A("a",{class:"growl-close",onClick:d},[$(t,{icon:"remove"})]),A("div",ke,[r(e).component?(_(),k($e,{key:1,growl:r(e),onClose:d},null,8,["growl"])):(_(),E(F,{key:0},[r(e).icon?(_(),E("div",ve,[A("img",{class:"img-responsive",src:r(e).icon,alt:""},null,8,be)])):b("",!0),A("div",ye,[r(e).title?(_(),E("h4",we,V(r(e).title),1)):b("",!0),A("p",null,V(r(e).message),1)])],64))])],34)}}});const Ee=w(Ae,[["__scopeId","data-v-6de5ca52"],["__file","AppGrowl.vue"]]),Te={class:"growl-container"},Ie=y({__name:"AppGrowls",setup(o){return(s,e)=>(_(),E("div",Te,[$(Z,null,{default:P(()=>[(_(!0),E(F,null,Y(r(ee).growls,(n,a)=>(_(),k(Ee,{key:a,growl:n,index:a,class:G({"anim-fade-enter-left anim-fade-leave-left":!r(B).isXs,"anim-fade-enter-down anim-back-leave-down":r(B).isXs})},null,8,["growl","index","class"]))),128))]),_:1})]))}});const De=w(Ie,[["__scopeId","data-v-b46cc53e"],["__file","AppGrowls.vue"]]),Pe={inheritAttrs:!1},Ce=y({...Pe,__name:"AppCommonShell",setup(o){const s=h(()=>f(()=>import("./e268dc11.js"),["assets/e268dc11.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css"])),e=h(()=>f(()=>import("./78ad9509.js"),["assets/78ad9509.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css","assets/c6cc95df.css"])),n=h(()=>f(()=>import("./a4de9733.js"),["assets/a4de9733.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css","assets/5d6da4ac.css"])),a=h(()=>f(()=>import("./df60d451.js"),["assets/df60d451.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css","assets/14addee9.css"])),m=h(()=>f(()=>import("./0d782bac.js"),["assets/0d782bac.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css","assets/d2911a26.css"])),d=h(()=>f(()=>import("./19d019bd.js"),["assets/19d019bd.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css","assets/f1d3fa17.css"]));return(c,v)=>(_(),k(he,{"is-root":""},{default:P(()=>[$(r(n)),$(r(m)),$(r(e)),A("div",te(oe(c.$attrs)),[$(ce,null,{default:P(()=>[R(c.$slots,"default"),$(r(s)),$(De),$(r(d)),$(r(a))]),_:3})],16)]),_:3}))}}),Se=w(Ce,[["__file","AppCommonShell.vue"]]),Re={class:"-build-embed fill-darker"},Le=y({__name:"AppMain",setup(o){const s=h(()=>f(()=>import("./d4e0a8a5.js"),["assets/d4e0a8a5.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css"])),e=h(()=>f(()=>import("./aff7efbe.js"),["assets/aff7efbe.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css"])),n=h(()=>f(()=>import("./79702a6f.js"),["assets/79702a6f.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css"])),a=h(()=>f(()=>import("./37647471.js"),["assets/37647471.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css"])),m=h(()=>f(()=>import("./d3be67c7.js"),["assets/d3be67c7.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css"])),d=h(()=>f(()=>import("./c97eeb61.js"),["assets/c97eeb61.js","assets/gameserver-1c2982e3.js","assets/b7a4c237.css"])),{build:c,bootstrap:v}=re();if(se.isSecure){const p=window.document.createElement("meta");p.httpEquiv="Content-Security-Policy",p.content="upgrade-insecure-requests",window.document.head.appendChild(p)}return v(),(p,i)=>r(c)?(_(),k(Se,{key:0},{default:P(()=>[A("div",Re,[r(c).type===r(I).Flash?(_(),k(r(e),{key:0})):b("",!0),r(c).type===r(I).Html?(_(),k(r(s),{key:1})):b("",!0),r(c).type===r(I).Unity?(_(),k(r(n),{key:2})):b("",!0),r(c).type===r(I).Silverlight?(_(),k(r(d),{key:3})):b("",!0),r(c).type===r(I).Applet?(_(),k(r(a),{key:4})):b("",!0),r(c).type===r(I).Rom?(_(),k(r(m),{key:5})):b("",!0)])]),_:1})):b("",!0)}});const Be=w(Le,[["__scopeId","data-v-29c12294"],["__file","AppMain.vue"]]);export{Be as default};
