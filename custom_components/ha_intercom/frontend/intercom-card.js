/* intercom-card 0.1.0 */
var ye=Object.defineProperty;var $e=(r,t,e)=>t in r?ye(r,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[t]=e;var C=(r,t,e)=>$e(r,typeof t!="symbol"?t+"":t,e);var at=globalThis,rt=at.ShadowRoot&&(at.ShadyCSS===void 0||at.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,At=Symbol(),Ut=new WeakMap,K=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==At)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o,e=this.t;if(rt&&t===void 0){let i=e!==void 0&&e.length===1;i&&(t=Ut.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&Ut.set(e,t))}return t}toString(){return this.cssText}},Bt=r=>new K(typeof r=="string"?r:r+"",void 0,At),A=(r,...t)=>{let e=r.length===1?r[0]:t.reduce((i,s,n)=>i+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+r[n+1],r[0]);return new K(e,r,At)},jt=(r,t)=>{if(rt)r.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(let e of t){let i=document.createElement("style"),s=at.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,r.appendChild(i)}},St=rt?r=>r:r=>r instanceof CSSStyleSheet?(t=>{let e="";for(let i of t.cssRules)e+=i.cssText;return Bt(e)})(r):r;var{is:we,defineProperty:ke,getOwnPropertyDescriptor:Ce,getOwnPropertyNames:Ae,getOwnPropertySymbols:Se,getPrototypeOf:Ee}=Object,M=globalThis,Ft=M.trustedTypes,Le=Ft?Ft.emptyScript:"",Me=M.reactiveElementPolyfillSupport,Z=(r,t)=>r,Et={toAttribute(r,t){switch(t){case Boolean:r=r?Le:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,t){let e=r;switch(t){case Boolean:e=r!==null;break;case Number:e=r===null?null:Number(r);break;case Object:case Array:try{e=JSON.parse(r)}catch{e=null}}return e}},Kt=(r,t)=>!we(r,t),Gt={attribute:!0,type:String,converter:Et,reflect:!1,useDefault:!1,hasChanged:Kt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),M.litPropertyMetadata??(M.litPropertyMetadata=new WeakMap);var S=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=Gt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){let i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&ke(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){let{get:s,set:n}=Ce(this.prototype,t)??{get(){return this[e]},set(a){this[e]=a}};return{get:s,set(a){let c=s?.call(this);n?.call(this,a),this.requestUpdate(t,c,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??Gt}static _$Ei(){if(this.hasOwnProperty(Z("elementProperties")))return;let t=Ee(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(Z("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Z("properties"))){let e=this.properties,i=[...Ae(e),...Se(e)];for(let s of i)this.createProperty(s,e[s])}let t=this[Symbol.metadata];if(t!==null){let e=litPropertyMetadata.get(t);if(e!==void 0)for(let[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(let[e,i]of this.elementProperties){let s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){let e=[];if(Array.isArray(t)){let i=new Set(t.flat(1/0).reverse());for(let s of i)e.unshift(St(s))}else t!==void 0&&e.push(St(t));return e}static _$Eu(t,e){let i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){let t=new Map,e=this.constructor.elementProperties;for(let i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){let t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return jt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){let i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){let n=(i.converter?.toAttribute!==void 0?i.converter:Et).toAttribute(e,i.type);this._$Em=t,n==null?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(t,e){let i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){let n=i.getPropertyOptions(s),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:Et;this._$Em=s;let c=a.fromAttribute(e,n.type);this[s]=c??this._$Ej?.get(s)??c,this._$Em=null}}requestUpdate(t,e,i,s=!1,n){if(t!==void 0){let a=this.constructor;if(s===!1&&(n=this[t]),i??(i=a.getPropertyOptions(t)),!((i.hasChanged??Kt)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:n},a){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,a??e??this[t]),n!==!0||a!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}let t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(let[s,n]of this._$Ep)this[s]=n;this._$Ep=void 0}let i=this.constructor.elementProperties;if(i.size>0)for(let[s,n]of i){let{wrapped:a}=n,c=this[s];a!==!0||this._$AL.has(s)||c===void 0||this.C(s,void 0,n,c)}}let t=!1,e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(i=>i.hostUpdate?.()),this.update(e)):this._$EM()}catch(i){throw t=!1,this._$EM(),i}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[Z("elementProperties")]=new Map,S[Z("finalized")]=new Map,Me?.({ReactiveElement:S}),(M.reactiveElementVersions??(M.reactiveElementVersions=[])).push("2.1.2");var q=globalThis,Zt=r=>r,ot=q.trustedTypes,Wt=ot?ot.createPolicy("lit-html",{createHTML:r=>r}):void 0,Mt="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,Nt="?"+E,Ne=`<${Nt}>`,z=document,Y=()=>z.createComment(""),J=r=>r===null||typeof r!="object"&&typeof r!="function",Tt=Array.isArray,te=r=>Tt(r)||typeof r?.[Symbol.iterator]=="function",Lt=`[ 	
\f\r]`,W=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,qt=/-->/g,Yt=/>/g,D=RegExp(`>|${Lt}(?:([^\\s"'>=/]+)(${Lt}*=${Lt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Jt=/'/g,Qt=/"/g,ee=/^(?:script|style|textarea|title)$/i,Vt=r=>(t,...e)=>({_$litType$:r,strings:t,values:e}),l=Vt(1),Ze=Vt(2),We=Vt(3),L=Symbol.for("lit-noChange"),h=Symbol.for("lit-nothing"),Xt=new WeakMap,H=z.createTreeWalker(z,129);function ie(r,t){if(!Tt(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Wt!==void 0?Wt.createHTML(t):t}var se=(r,t)=>{let e=r.length-1,i=[],s,n=t===2?"<svg>":t===3?"<math>":"",a=W;for(let c=0;c<e;c++){let o=r[c],p,u,d=-1,g=0;for(;g<o.length&&(a.lastIndex=g,u=a.exec(o),u!==null);)g=a.lastIndex,a===W?u[1]==="!--"?a=qt:u[1]!==void 0?a=Yt:u[2]!==void 0?(ee.test(u[2])&&(s=RegExp("</"+u[2],"g")),a=D):u[3]!==void 0&&(a=D):a===D?u[0]===">"?(a=s??W,d=-1):u[1]===void 0?d=-2:(d=a.lastIndex-u[2].length,p=u[1],a=u[3]===void 0?D:u[3]==='"'?Qt:Jt):a===Qt||a===Jt?a=D:a===qt||a===Yt?a=W:(a=D,s=void 0);let _=a===D&&r[c+1].startsWith("/>")?" ":"";n+=a===W?o+Ne:d>=0?(i.push(p),o.slice(0,d)+Mt+o.slice(d)+E+_):o+E+(d===-2?c:_)}return[ie(r,n+(r[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]},Q=class r{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let n=0,a=0,c=t.length-1,o=this.parts,[p,u]=se(t,e);if(this.el=r.createElement(p,i),H.currentNode=this.el.content,e===2||e===3){let d=this.el.content.firstChild;d.replaceWith(...d.childNodes)}for(;(s=H.nextNode())!==null&&o.length<c;){if(s.nodeType===1){if(s.hasAttributes())for(let d of s.getAttributeNames())if(d.endsWith(Mt)){let g=u[a++],_=s.getAttribute(d).split(E),m=/([.?@])?(.*)/.exec(g);o.push({type:1,index:n,name:m[2],strings:_,ctor:m[1]==="."?ct:m[1]==="?"?dt:m[1]==="@"?ht:O}),s.removeAttribute(d)}else d.startsWith(E)&&(o.push({type:6,index:n}),s.removeAttribute(d));if(ee.test(s.tagName)){let d=s.textContent.split(E),g=d.length-1;if(g>0){s.textContent=ot?ot.emptyScript:"";for(let _=0;_<g;_++)s.append(d[_],Y()),H.nextNode(),o.push({type:2,index:++n});s.append(d[g],Y())}}}else if(s.nodeType===8)if(s.data===Nt)o.push({type:2,index:n});else{let d=-1;for(;(d=s.data.indexOf(E,d+1))!==-1;)o.push({type:7,index:n}),d+=E.length-1}n++}}static createElement(t,e){let i=z.createElement("template");return i.innerHTML=t,i}};function R(r,t,e=r,i){if(t===L)return t;let s=i!==void 0?e._$Co?.[i]:e._$Cl,n=J(t)?void 0:t._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),n===void 0?s=void 0:(s=new n(r),s._$AT(r,e,i)),i!==void 0?(e._$Co??(e._$Co=[]))[i]=s:e._$Cl=s),s!==void 0&&(t=R(r,s._$AS(r,t.values),s,i)),t}var lt=class{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){let{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??z).importNode(e,!0);H.currentNode=s;let n=H.nextNode(),a=0,c=0,o=i[0];for(;o!==void 0;){if(a===o.index){let p;o.type===2?p=new B(n,n.nextSibling,this,t):o.type===1?p=new o.ctor(n,o.name,o.strings,this,t):o.type===6&&(p=new pt(n,this,t)),this._$AV.push(p),o=i[++c]}a!==o?.index&&(n=H.nextNode(),a++)}return H.currentNode=z,s}p(t){let e=0;for(let i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}},B=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=h,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode,e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=R(this,t,e),J(t)?t===h||t==null||t===""?(this._$AH!==h&&this._$AR(),this._$AH=h):t!==this._$AH&&t!==L&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):te(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==h&&J(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){let{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=Q.createElement(ie(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{let n=new lt(s,this),a=n.u(this.options);n.p(e),this.T(a),this._$AH=n}}_$AC(t){let e=Xt.get(t.strings);return e===void 0&&Xt.set(t.strings,e=new Q(t)),e}k(t){Tt(this._$AH)||(this._$AH=[],this._$AR());let e=this._$AH,i,s=0;for(let n of t)s===e.length?e.push(i=new r(this.O(Y()),this.O(Y()),this,this.options)):i=e[s],i._$AI(n),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){let i=Zt(t).nextSibling;Zt(t).remove(),t=i}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}},O=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,n){this.type=1,this._$AH=h,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=n,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=h}_$AI(t,e=this,i,s){let n=this.strings,a=!1;if(n===void 0)t=R(this,t,e,0),a=!J(t)||t!==this._$AH&&t!==L,a&&(this._$AH=t);else{let c=t,o,p;for(t=n[0],o=0;o<n.length-1;o++)p=R(this,c[i+o],e,o),p===L&&(p=this._$AH[o]),a||(a=!J(p)||p!==this._$AH[o]),p===h?t=h:t!==h&&(t+=(p??"")+n[o+1]),this._$AH[o]=p}a&&!s&&this.j(t)}j(t){t===h?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}},ct=class extends O{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===h?void 0:t}},dt=class extends O{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==h)}},ht=class extends O{constructor(t,e,i,s,n){super(t,e,i,s,n),this.type=5}_$AI(t,e=this){if((t=R(this,t,e,0)??h)===L)return;let i=this._$AH,s=t===h&&i!==h||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==h&&(i===h||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}},pt=class{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){R(this,t)}},ne={M:Mt,P:E,A:Nt,C:1,L:se,R:lt,D:te,V:R,I:B,H:O,N:dt,U:ht,B:ct,F:pt},Te=q.litHtmlPolyfillSupport;Te?.(Q,B),(q.litHtmlVersions??(q.litHtmlVersions=[])).push("3.3.3");var ae=(r,t,e)=>{let i=e?.renderBefore??t,s=i._$litPart$;if(s===void 0){let n=e?.renderBefore??null;i._$litPart$=s=new B(t.insertBefore(Y(),n),n,void 0,e??{})}return s._$AI(r),s};var X=globalThis,$=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;let t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){let e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ae(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return L}};$._$litElement$=!0,$.finalized=!0,X.litElementHydrateSupport?.({LitElement:$});var Ve=X.litElementPolyfillSupport;Ve?.({LitElement:$});(X.litElementVersions??(X.litElementVersions=[])).push("4.2.2");var re={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},oe=r=>(...t)=>({_$litDirective$:r,values:t}),ut=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};var{I:De}=ne,le=r=>r;var ce=()=>document.createComment(""),j=(r,t,e)=>{let i=r._$AA.parentNode,s=t===void 0?r._$AB:t._$AA;if(e===void 0){let n=i.insertBefore(ce(),s),a=i.insertBefore(ce(),s);e=new De(n,a,r,r.options)}else{let n=e._$AB.nextSibling,a=e._$AM,c=a!==r;if(c){let o;e._$AQ?.(r),e._$AM=r,e._$AP!==void 0&&(o=r._$AU)!==a._$AU&&e._$AP(o)}if(n!==s||c){let o=e._$AA;for(;o!==n;){let p=le(o).nextSibling;le(i).insertBefore(o,s),o=p}}}return e},N=(r,t,e=r)=>(r._$AI(t,e),r),He={},de=(r,t=He)=>r._$AH=t,he=r=>r._$AH,gt=r=>{r._$AR(),r._$AA.remove()};var pe=(r,t,e)=>{let i=new Map;for(let s=t;s<=e;s++)i.set(r[s],s);return i},Dt=oe(class extends ut{constructor(r){if(super(r),r.type!==re.CHILD)throw Error("repeat() can only be used in text expressions")}dt(r,t,e){let i;e===void 0?e=t:t!==void 0&&(i=t);let s=[],n=[],a=0;for(let c of r)s[a]=i?i(c,a):a,n[a]=e(c,a),a++;return{values:n,keys:s}}render(r,t,e){return this.dt(r,t,e).values}update(r,[t,e,i]){let s=he(r),{values:n,keys:a}=this.dt(t,e,i);if(!Array.isArray(s))return this.ut=a,n;let c=this.ut??(this.ut=[]),o=[],p,u,d=0,g=s.length-1,_=0,m=n.length-1;for(;d<=g&&_<=m;)if(s[d]===null)d++;else if(s[g]===null)g--;else if(c[d]===a[_])o[_]=N(s[d],n[_]),d++,_++;else if(c[g]===a[m])o[m]=N(s[g],n[m]),g--,m--;else if(c[d]===a[m])o[m]=N(s[d],n[m]),j(r,o[m+1],s[d]),d++,m--;else if(c[g]===a[_])o[_]=N(s[g],n[_]),j(r,s[d],s[g]),g--,_++;else if(p===void 0&&(p=pe(a,_,m),u=pe(c,d,g)),p.has(c[d]))if(p.has(c[g])){let y=u.get(a[_]),b=y!==void 0?s[y]:null;if(b===null){let w=j(r,s[d]);N(w,n[_]),o[_]=w}else o[_]=N(b,n[_]),j(r,s[d],b),s[y]=null;_++}else gt(s[g]),g--;else gt(s[d]),d++;for(;_<=m;){let y=j(r,o[m+1]);N(y,n[_]),o[_++]=y}for(;d<=g;){let y=s[d++];y!==null&&gt(y)}return this.ut=a,de(r,o),L}});var F=A`
  :host {
    --ic-card: var(--ha-card-background, var(--card-background-color, #ffffff));
    --ic-card-2: var(--intercom-surface, var(--secondary-background-color, #eef1f5));
    --ic-line: var(--divider-color, #dfe4ea);
    --ic-text: var(--primary-text-color, #1f2429);
    --ic-text-2: var(--secondary-text-color, #6b7480);
    --ic-accent: var(--intercom-accent, var(--primary-color, #0b8bd6));
    --ic-accent-soft: var(--intercom-accent-soft, rgba(var(--rgb-primary-color, 11, 139, 214), 0.14));
    --ic-ok: var(--intercom-ok, var(--success-color, #2e9e5b));
    --ic-ok-soft: rgba(var(--rgb-success-color, 46, 158, 91), 0.14);
    --ic-danger: var(--error-color, #d4443b);
    --ic-danger-soft: rgba(var(--rgb-error-color, 212, 68, 59), 0.14);
    --ic-live-ground: #14171b;
    /* Eigene Rundung, Schatten und Rand: Panel-Ansichten setzen die ha-card-Variablen auf 0/none, das soll hier nicht durchschlagen */
    --ic-shadow: var(--intercom-shadow, 0 1px 2px rgba(20, 30, 40, 0.06), 0 6px 18px rgba(20, 30, 40, 0.06));
    --ic-radius: var(--intercom-radius, 14px);
    --ic-border: 1px solid var(--intercom-border-color, var(--divider-color, rgba(128, 128, 128, 0.18)));
    --ic-font: var(--ha-font-family-body, var(--primary-font-family, Roboto, "Segoe UI", system-ui, -apple-system, sans-serif));
    color: var(--ic-text);
    font-family: var(--ic-font);
    font-size: 14px;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  button:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button:focus-visible,
  [tabindex]:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--ic-accent);
    outline-offset: 2px;
  }
  svg {
    width: 22px;
    height: 22px;
    fill: currentColor;
    flex: none;
  }
  [hidden] {
    display: none !important;
  }
`,G=A`
  .card {
    background: var(--ic-card);
    border-radius: var(--ic-radius);
    box-shadow: var(--ic-shadow);
    border: var(--ic-border);
    min-height: 0;
  }
  .card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 16px 2px;
    min-height: 46px;
  }
  .card-head h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 500;
  }
  .card-head .r {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 32px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--ic-ok);
    display: inline-block;
    flex: none;
  }
  .dot.off {
    background: var(--ic-text-2);
  }
  .dot.bad {
    background: var(--ic-danger);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.03em;
    border-radius: 999px;
    padding: 3px 10px;
    background: var(--ic-accent-soft);
    color: var(--ic-accent);
    white-space: nowrap;
  }
  .badge .dot {
    background: currentColor;
  }
  .badge.ok {
    background: var(--ic-ok-soft);
    color: var(--ic-ok);
  }
  .badge.muted {
    background: var(--ic-card-2);
    color: var(--ic-text-2);
  }
  .badge.danger {
    background: var(--ic-danger-soft);
    color: var(--ic-danger);
  }
  .btn {
    border: 0;
    border-radius: 12px;
    padding: 13px 14px;
    font-size: 15px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    background: var(--ic-card-2);
    color: var(--ic-text);
    white-space: nowrap;
  }
  .btn.ok {
    background: var(--ic-ok);
    color: #fff;
  }
  .btn.danger {
    background: var(--ic-danger);
    color: #fff;
  }
  .btn.accent {
    background: var(--ic-accent);
    color: #fff;
  }
  .btn.ghost {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
  }
  .pill {
    border: 0;
    border-radius: 999px;
    padding: 8px 14px;
    background: var(--ic-card-2);
    color: var(--ic-text);
    font-weight: 500;
    white-space: nowrap;
  }
  .pill.accent {
    background: var(--ic-accent-soft);
    color: var(--ic-accent);
  }
  .pill.danger {
    background: var(--ic-danger-soft);
    color: var(--ic-danger);
  }
  .pill.small {
    padding: 6px 11px;
    font-size: 13px;
  }
  .icb {
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 10px;
    background: transparent;
    color: var(--ic-text-2);
    display: grid;
    place-items: center;
    flex: none;
  }
  .icb:hover {
    background: var(--ic-card-2);
  }
  .icb.on {
    background: var(--ic-accent-soft);
    color: var(--ic-accent);
  }
  .icb.danger {
    color: var(--ic-danger);
  }
  .ctl {
    display: flex;
    gap: 2px;
    align-items: center;
  }
  .confirm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--ic-text-2);
    white-space: nowrap;
  }
  .sw {
    width: 46px;
    height: 26px;
    border-radius: 999px;
    border: 0;
    background: var(--ic-line);
    position: relative;
    flex: none;
    padding: 0;
  }
  .sw::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    transition: left 0.15s;
  }
  .sw[aria-checked="true"] {
    background: var(--ic-accent);
  }
  .sw[aria-checked="true"]::after {
    left: 23px;
  }
  .slider {
    position: relative;
    height: 36px;
    border-radius: 11px;
    background: var(--ic-card-2);
    overflow: hidden;
    min-width: 0;
  }
  .slider .fill {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: var(--pct, 50%);
    background: var(--ic-accent-soft);
    border-right: 3px solid var(--ic-accent);
    pointer-events: none;
  }
  .slider .val {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    padding-left: 12px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    pointer-events: none;
  }
  .slider .val small {
    color: var(--ic-text-2);
    font-weight: 400;
    margin-left: 6px;
  }
  .slider input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    opacity: 0;
    cursor: pointer;
    touch-action: none;
  }
  .sel {
    font: inherit;
    color: var(--ic-text);
    background: var(--ic-card-2);
    border: 1px solid var(--ic-line);
    border-radius: 10px;
    padding: 8px 10px;
    max-width: 100%;
  }
  .txt {
    font: inherit;
    color: var(--ic-text);
    background: var(--ic-card);
    border: 1px solid var(--ic-line);
    border-radius: 8px;
    padding: 6px 8px;
    width: 100%;
    min-width: 0;
  }
  .empty {
    padding: 22px 16px;
    color: var(--ic-text-2);
    text-align: center;
    font-size: 13px;
  }
  .note {
    padding: 10px 16px;
    color: var(--ic-danger);
    font-size: 13px;
  }
`;var _e="0.1.0",Ht={de:{title:"Doorbell",intercom:"Sprechanlage",tab_call:"Anruf",tab_contacts:"Kontakte",tab_dial:"W\xE4hlen",contacts_none:"Keine Nebenstellen gefunden",ringing:"Es klingelt",in_call:"Im Gespr\xE4ch",calling:"Ruft an",connecting:"Verbinde \u2026",call_failed:"Anruf fehlgeschlagen: {e}",ready:"Bereit",sip_missing:"Sprechanlage hier nicht verf\xFCgbar",sip_hint:"sip-core ist auf diesem Ger\xE4t nicht angemeldet",visitor:"Besucher an der Haust\xFCr",call_from:"Anruf von {name}",calling_to:"Rufe {name} an \u2026",talking_with:"Gespr\xE4ch mit {name}",ringing_since:"Klingelt seit {s} s",announcement_in:"Ansage in {s} s",busy_in:"Besetztton in {s} s",ringing_elsewhere:"Es klingelt, hier nicht annehmbar",answer:"Annehmen",hangup:"Auflegen",reject:"Ablehnen",call:"Anrufen",call_door:"T\xFCrstation anrufen",mute:"Mikrofon aus",unmute:"Mikrofon an",door:"Haust\xFCr",door_locked:"Verriegelt",door_unlocked:"Entriegelt",door_open:"Offen",door_busy:"Wird ge\xF6ffnet \u2026",door_unavailable:"Nicht erreichbar",open:"\xD6ffnen",open_door:"T\xFCr \xF6ffnen",lock:"Abschlie\xDFen",unlock:"Aufschlie\xDFen",really_open:"Wirklich \xF6ffnen?",yes:"Ja",no:"Nein",door_station:"T\xFCrstation",door_ready:"T\xFCrstation erreichbar",door_not_ready:"T\xFCrstation nicht registriert",call_from_here:"Von hier aus anrufen",volume:"Lautst\xE4rke",tablet:"Tablet",muted:"Stumm",reachable:"erreichbar",unreachable:"nicht registriert",unknown:"unbekannt",last_ring:"Letztes Klingeln",never:"noch nie",settings:"Einstellungen",close:"Schlie\xDFen",mailbox:"Mailbox",messages:"Nachrichten",no_announcements:"Noch keine Ansage aufgenommen",new_n:"{n} neu",all_seen:"Alle gesehen",no_messages:"Noch keine Nachrichten",recording_now:"Aufnahme l\xE4uft \u2026",recording_hint:"Der Clip erscheint nach dem Klingeln in der Liste",msg_answered:"Angenommen \xB7 Gespr\xE4ch {s} s",msg_note:"Nachricht hinterlassen \xB7 {s} s",msg_visitor:"Besucher, keine Nachricht \xB7 {s} s",clip_info:"Clip {d} \xB7 Bild und Ton von der T\xFCrstation",no_clip:"Kein Clip vorhanden",delete:"L\xF6schen",really_delete:"Wirklich l\xF6schen?",play:"Abspielen",listen:"Anh\xF6ren",stop_listen:"Anhalten",announcements:"Ansagen",active:"Aktiv",none:"Keine",n_available:"{n} vorhanden",no_announcement:"Keine Ansage",no_announcement_hint:"Nach der Klingeldauer nur Besetztton",recorded_on:"Aufgenommen {d} \xB7 {s} s",record_new:"Neue Ansage aufnehmen",record_unsupported:"Aufnahme in diesem Browser nicht m\xF6glich",device_mic:"Mikrofon dieses Ger\xE4ts",recording:"Aufnahme l\xE4uft",speak_now:"sprich jetzt Richtung Ger\xE4t",stop:"Stopp",name:"Name",save:"Speichern",discard:"Verwerfen",uploading:"Wird gespeichert \u2026",upload_failed:"Speichern fehlgeschlagen: {e}",mic_failed:"Mikrofon nicht verf\xFCgbar: {e}",rename:"Umbenennen",new_recording:"Neue Aufnahme \xB7 {s} s \xB7 Name pr\xFCfen und speichern",enlarge:"Vergr\xF6\xDFern",shrink:"Verkleinern",live:"LIVE",today:"Heute",yesterday:"Gestern",seconds:"s",days:"Tage",percent:"%",alarm:"Alarmanlage",on:"an",off:"aus",info_title:"Details",chip_door:"Au\xDFenstation",chip_tablet:"Innenstation",info_new:"Neue Nachrichten",info_ringback:"Freizeichen",al_disarmed:"Unscharf",al_armed_away:"Abwesend",al_armed_home:"Zuhause",al_armed_night:"Nacht",al_armed_vacation:"Urlaub",al_armed_custom_bypass:"Benutzerdefiniert",al_arming:"Wird scharf \u2026",al_pending:"Verz\xF6gerung l\xE4uft \u2026",al_triggered:"Alarm ausgel\xF6st",al_unavailable:"Nicht erreichbar",al_unknown:"Unbekannt",al_since:"seit {t}",al_code_for:"Code f\xFCr {m}",al_code_wrong:"Code falsch, bitte erneut eingeben",al_open_sensors:"Offene Sensoren: {s}",al_not_allowed:"Nicht erlaubt",al_failed:"Fehlgeschlagen: {r}",al_cancel:"Abbrechen",al_sub_armed_away:"alles scharf",al_sub_armed_home:"nur Au\xDFenhaut",al_sub_disarmed:"aus",settings_title:"Intercom Einstellungen",g_ring:"Klingeln",g_answering:"Anrufbeantworter",g_status:"Status",s_klingeldauer:"Klingeldauer",s_klingeldauer_d:"So lange klingelt das Tablet, danach Besetztton oder Ansage",s_freizeichen:"Freizeichen an der T\xFCr",s_freizeichen_d:"Standard oder eine Datei aus dem Freizeichen-Ordner",s_klingelton:"Klingelton Innenstation",s_klingelton_d:"Ton am Wandtablet beim Klingeln, Dateien im Ordner klingeltoene",s_mailbox:"Mailbox",s_mailbox_d:"Jedes Klingeln mit Clip und Vorschaubild speichern",s_sprachansage:"Sprachansage",s_sprachansage_d:"Nach der Klingeldauer Ansage, Piepton und Sprechzeit statt Besetztton",s_ansage:"Aktive Ansage",s_ansage_d:"Wird nach der Klingeldauer abgespielt",s_sprechzeit:"Sprechzeit nach der Ansage",s_sprechzeit_d:"Endet fr\xFCher, wenn der Besucher schweigt",s_aufbewahrung:"Aufbewahrung",s_aufbewahrung_d:"\xC4ltere Nachrichten werden nachts gel\xF6scht",st_door:"T\xFCrstation {ext}",st_tablet:"Wandtablet {ext}",st_registered:"Registriert",st_not_registered:"Nicht registriert",st_asterisk:"Asterisk",st_connected:"Verbunden",st_disconnected:"Getrennt",st_recording:"Aufnahme",st_running:"L\xE4uft",st_idle:"Bereit",not_configured:"Intercom-Integration nicht gefunden",not_configured_hint:"Bitte zuerst die Integration einrichten oder entry_id pr\xFCfen",loading:"Lade \u2026"},en:{title:"Doorbell",intercom:"Intercom",tab_call:"Call",tab_contacts:"Contacts",tab_dial:"Dial",contacts_none:"No extensions found",ringing:"Ringing",in_call:"In call",calling:"Calling",connecting:"Connecting \u2026",call_failed:"Call failed: {e}",ready:"Ready",sip_missing:"Intercom not available here",sip_hint:"sip-core is not registered on this device",visitor:"Visitor at the front door",call_from:"Call from {name}",calling_to:"Calling {name} \u2026",talking_with:"Talking to {name}",ringing_since:"Ringing for {s} s",announcement_in:"Announcement in {s} s",busy_in:"Busy tone in {s} s",ringing_elsewhere:"Ringing, cannot answer here",answer:"Answer",hangup:"Hang up",reject:"Reject",call:"Call",call_door:"Call door station",mute:"Mute mic",unmute:"Unmute mic",door:"Front door",door_locked:"Locked",door_unlocked:"Unlocked",door_open:"Open",door_busy:"Opening \u2026",door_unavailable:"Unavailable",open:"Open",open_door:"Open door",lock:"Lock",unlock:"Unlock",really_open:"Really open?",yes:"Yes",no:"No",door_station:"Door station",door_ready:"Door station reachable",door_not_ready:"Door station not registered",call_from_here:"Call from here",volume:"Volume",tablet:"Tablet",muted:"Muted",reachable:"reachable",unreachable:"not registered",unknown:"unknown",last_ring:"Last ring",never:"never",settings:"Settings",close:"Close",mailbox:"Mailbox",messages:"Messages",no_announcements:"No announcement recorded yet",new_n:"{n} new",all_seen:"Mark all seen",no_messages:"No messages yet",recording_now:"Recording \u2026",recording_hint:"The clip shows up in the list after the ring",msg_answered:"Answered \xB7 call {s} s",msg_note:"Message left \xB7 {s} s",msg_visitor:"Visitor, no message \xB7 {s} s",clip_info:"Clip {d} \xB7 video and audio from the door station",no_clip:"No clip available",delete:"Delete",really_delete:"Really delete?",play:"Play",listen:"Listen",stop_listen:"Stop",announcements:"Announcements",active:"Active",none:"None",n_available:"{n} available",no_announcement:"No announcement",no_announcement_hint:"Busy tone only after the ring time",recorded_on:"Recorded {d} \xB7 {s} s",record_new:"Record new announcement",record_unsupported:"Recording not possible in this browser",device_mic:"Microphone of this device",recording:"Recording",speak_now:"speak towards the device now",stop:"Stop",name:"Name",save:"Save",discard:"Discard",uploading:"Saving \u2026",upload_failed:"Saving failed: {e}",mic_failed:"Microphone unavailable: {e}",rename:"Rename",new_recording:"New recording \xB7 {s} s \xB7 check the name and save",enlarge:"Enlarge",shrink:"Shrink",live:"LIVE",today:"Today",yesterday:"Yesterday",seconds:"s",days:"days",percent:"%",alarm:"Alarm",on:"on",off:"off",info_title:"Details",chip_door:"Outdoor station",chip_tablet:"Indoor station",info_new:"New messages",info_ringback:"Ringback tone",al_disarmed:"Disarmed",al_armed_away:"Away",al_armed_home:"Home",al_armed_night:"Night",al_armed_vacation:"Vacation",al_armed_custom_bypass:"Custom",al_arming:"Arming \u2026",al_pending:"Pending \u2026",al_triggered:"Alarm triggered",al_unavailable:"Unavailable",al_unknown:"Unknown",al_since:"since {t}",al_code_for:"Code for {m}",al_code_wrong:"Wrong code, please try again",al_open_sensors:"Open sensors: {s}",al_not_allowed:"Not allowed",al_failed:"Failed: {r}",al_cancel:"Cancel",al_sub_armed_away:"everything armed",al_sub_armed_home:"perimeter only",al_sub_disarmed:"off",settings_title:"Intercom settings",g_ring:"Ringing",g_answering:"Answering machine",g_status:"Status",s_klingeldauer:"Ring time",s_klingeldauer_d:"How long the tablet rings, then busy tone or announcement",s_freizeichen:"Ringback tone at the door",s_freizeichen_d:"Default or a file from the ringback folder",s_klingelton:"Indoor ringtone",s_klingelton_d:"Sound on the wall tablet when the bell rings, files in the klingeltoene folder",s_mailbox:"Mailbox",s_mailbox_d:"Store every ring with clip and thumbnail",s_sprachansage:"Voice announcement",s_sprachansage_d:"After the ring time play the announcement, beep and speaking time instead of busy tone",s_ansage:"Active announcement",s_ansage_d:"Played after the ring time",s_sprechzeit:"Speaking time after the announcement",s_sprechzeit_d:"Ends earlier when the visitor stays silent",s_aufbewahrung:"Retention",s_aufbewahrung_d:"Older messages are deleted at night",st_door:"Door station {ext}",st_tablet:"Wall tablet {ext}",st_registered:"Registered",st_not_registered:"Not registered",st_asterisk:"Asterisk",st_connected:"Connected",st_disconnected:"Disconnected",st_recording:"Recording",st_running:"Running",st_idle:"Idle",not_configured:"Intercom integration not found",not_configured_hint:"Set up the integration first or check entry_id",loading:"Loading \u2026"}};function k(r,t){let e=t&&t.language||r&&r.locale&&r.locale.language||r&&r.language||"en";return String(e).toLowerCase().startsWith("de")?"de":"en"}function _t(r){let t=Ht[r]||Ht.en;return(e,i)=>{let s=t[e]??Ht.en[e]??e;if(i)for(let[n,a]of Object.entries(i))s=s.replace(`{${n}}`,String(a));return s}}var I={phone:"M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z",hangup:"M12,9C10.4,9 8.85,9.25 7.4,9.72V12.82C7.4,13.22 7.17,13.56 6.84,13.72C5.86,14.21 4.97,14.84 4.17,15.57C4,15.75 3.75,15.86 3.5,15.86C3.2,15.86 2.95,15.74 2.77,15.56L0.29,13.08C0.11,12.9 0,12.65 0,12.38C0,12.1 0.11,11.85 0.29,11.67C3.34,8.77 7.46,7 12,7C16.54,7 20.66,8.77 23.71,11.67C23.89,11.85 24,12.1 24,12.38C24,12.65 23.89,12.9 23.71,13.08L21.23,15.56C21.05,15.74 20.8,15.86 20.5,15.86C20.25,15.86 20,15.75 19.82,15.57C19.03,14.84 18.14,14.21 17.16,13.72C16.83,13.56 16.6,13.22 16.6,12.82V9.72C15.15,9.25 13.6,9 12,9Z",mic:"M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z",micOff:"M19,11C19,12.19 18.66,13.3 18.1,14.28L16.87,13.05C17.14,12.43 17.3,11.74 17.3,11H19M15,11.16L9,5.18V5A3,3 0 0,1 12,2A3,3 0 0,1 15,5V11L15,11.16M4.27,3L21,19.73L19.73,21L15.54,16.81C14.77,17.27 13.91,17.58 13,17.72V21H11V17.72C7.72,17.23 5,14.41 5,11H6.7C6.7,14 9.24,16.1 12,16.1C12.81,16.1 13.6,15.91 14.31,15.58L12.65,13.92L12,14A3,3 0 0,1 9,11V10.28L3,4.27L4.27,3Z",volume:"M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",volumeOff:"M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z",lock:"M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z",lockOpen:"M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V10A2,2 0 0,1 6,8H15V6A3,3 0 0,0 12,3A3,3 0 0,0 9,6H7A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17Z",doorbell:"M12,2A7,7 0 0,0 5,9V15A2,2 0 0,0 7,17H9V19A3,3 0 0,0 12,22A3,3 0 0,0 15,19V17H17A2,2 0 0,0 19,15V9A7,7 0 0,0 12,2M12,4A5,5 0 0,1 17,9V15H7V9A5,5 0 0,1 12,4M11,17H13V19A1,1 0 0,1 12,20A1,1 0 0,1 11,19V17M12,6A3,3 0 0,0 9,9V13H15V9A3,3 0 0,0 12,6Z",play:"M8,5.14V19.14L19,12.14L8,5.14Z",pause:"M14,19H18V5H14M6,19H10V5H6V19Z",stop:"M18,18H6V6H18V18Z",trash:"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",cog:"M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z",expand:"M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z",close:"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",chevron:"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",tablet:"M19,18H5V6H19M21,4H3C1.89,4 1,4.89 1,6V18A2,2 0 0,0 3,20H21A2,2 0 0,0 23,18V6C23,4.89 22.1,4 21,4Z",backspace:"M22,3H7C6.31,3 5.77,3.35 5.41,3.88L0,12L5.41,20.11C5.77,20.64 6.31,21 7,21H22A2,2 0 0,0 24,19V5A2,2 0 0,0 22,3M19,15.59L17.59,17L14,13.41L10.41,17L9,15.59L12.59,12L9,8.41L10.41,7L14,10.59L17.59,7L19,8.41L15.41,12L19,15.59Z",check:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",account:"M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",image:"M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z",pencil:"M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",eye:"M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z",doorOpen:"M12,3C13.1,3 14,3.9 14,5V19C14,20.1 13.1,21 12,21H4V3H12M12,5H6V19H12V5M8,11H10V13H8V11M20,3H16V5H18V19H16V21H20V3Z",shieldLock:"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5V11C15.4,11 16,11.6 16,12.3V15.8C16,16.4 15.4,17 14.7,17H9.2C8.6,17 8,16.4 8,15.7V12.2C8,11.6 8.6,11 9.2,11V9.5C9.2,8.1 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z",shieldHome:"M11,13H13V16H16V11H18L12,6L6,11H8V16H11V13M12,1L21,5V11C21,16.55 17.16,21.74 12,23C6.84,21.74 3,16.55 3,11V5L12,1Z",shieldOff:"M1,4.27L2.28,3L20.5,21.22L19.23,22.5L17,20.25C15.57,21.57 13.87,22.54 12,23C6.84,21.74 3,16.55 3,11V6.27L1,4.27M12,1L21,5V11C21,13.28 20.35,15.5 19.23,17.41L5.65,3.82L12,1Z",shieldAlert:"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5M11,7H13V13H11M11,15H13V17H11",shieldSync:"M18 12A6.41 6.41 0 0 1 20.87 12.67A11.63 11.63 0 0 0 21 11V5L12 1L3 5V11C3 16.55 6.84 21.74 12 23C12.35 22.91 12.7 22.8 13 22.68A6.42 6.42 0 0 1 11.5 18.5A6.5 6.5 0 0 1 18 12M18 14.5V13L15.75 15.25L18 17.5V16A2.5 2.5 0 0 1 20.24 19.62L21.33 20.71A4 4 0 0 0 18 14.5M18 21A2.5 2.5 0 0 1 15.76 17.38L14.67 16.29A4 4 0 0 0 18 22.5V24L20.25 21.75L18 19.5Z",shieldMoon:"M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M15.97 14.41C14.13 16.58 10.76 16.5 9 14.34C6.82 11.62 8.36 7.62 11.7 7C12.04 6.95 12.33 7.28 12.21 7.61C11.75 8.84 11.82 10.25 12.53 11.47C13.24 12.69 14.42 13.46 15.71 13.67C16.05 13.72 16.2 14.14 15.97 14.41Z",shieldAirplane:"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5.68C12.5,5.68 12.95,6.11 12.95,6.63V10.11L18,13.26V14.53L12.95,12.95V16.42L14.21,17.37V18.32L12,17.68L9.79,18.32V17.37L11.05,16.42V12.95L6,14.53V13.26L11.05,10.11V6.63C11.05,6.11 11.5,5.68 12,5.68Z",shieldAccount:"M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M17.13,17C15.92,18.85 14.11,20.24 12,20.92C9.89,20.24 8.08,18.85 6.87,17C6.53,16.5 6.24,16 6,15.47C6,13.82 8.71,12.47 12,12.47C15.29,12.47 18,13.79 18,15.47C17.76,16 17.47,16.5 17.13,17Z",shieldCheck:"M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z",shieldStar:"M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M15.08 16L12 14.15L8.93 16L9.74 12.5L7.03 10.16L10.61 9.85L12 6.55L13.39 9.84L16.97 10.15L14.26 12.5L15.08 16Z",home:"M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z",bell:"M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M14,21A2,2 0 0,1 12,23A2,2 0 0,1 10,21",record:"M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z"};function tt(r){let t=Math.max(0,Math.round(Number(r)||0));return`${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}`}function ue(r,t){return r.getFullYear()===t.getFullYear()&&r.getMonth()===t.getMonth()&&r.getDate()===t.getDate()}function P(r,t,e){if(!r)return"";let i=new Date(r);if(Number.isNaN(i.getTime()))return String(r);let s=t==="de"?"de-DE":"en-GB",n=i.toLocaleTimeString(s,{hour:"2-digit",minute:"2-digit"}),a=new Date;if(ue(i,a))return`${e("today")} ${n}`;let c=new Date(a);return c.setDate(a.getDate()-1),ue(i,c)?`${e("yesterday")} ${n}`:`${i.toLocaleDateString(s,{weekday:"short",day:"2-digit",month:"2-digit"})} ${n}`}function Rt(r,t){if(!r)return"";let e=new Date(r);return Number.isNaN(e.getTime())?String(r):e.toLocaleDateString(t==="de"?"de-DE":"en-GB",{day:"2-digit",month:"2-digit"})}function ft(r,t){if(!r)return"";let e=new Date(r);return Number.isNaN(e.getTime())?String(r):e.toLocaleTimeString(t==="de"?"de-DE":"en-GB",{hour:"2-digit",minute:"2-digit"})}var zt=new Map;async function mt(r,t,e=3600){let i=zt.get(t),s=Date.now();if(i&&i.exp>s+3e4)return i.url;let n=await r.callWS({type:"auth/sign_path",path:t,expires:e}),a=r.hassUrl(n.path);return zt.set(t,{url:a,exp:s+e*1e3}),a}function Ot(r){let t=zt.get(r);return t&&t.exp>Date.now()+3e4?t.url:null}var ge=new Map;async function bt(r,t,e=!1){let i=t||"",s=ge.get(i);if(!e&&s&&s.exp>Date.now())return s.value;let n=await r.callWS({type:"ha_intercom/info",...t?{entry_id:t}:{}}),a=n&&n.entries&&n.entries[0]||null;return ge.set(i,{value:a,exp:Date.now()+300*1e3}),a}function x(r,t){return t&&r&&r.states?r.states[t]:void 0}function vt(r,t){let e=x(r,t);return!!e&&e.state==="on"}function fe(r,t,e=0){let i=x(r,t),s=i?Number(i.state):NaN;return Number.isFinite(s)?s:e}function me(r,t){let e=x(r,t);return e&&e.attributes&&e.attributes.friendly_name||t||""}async function ze(){return window.loadCardHelpers?window.loadCardHelpers():null}async function xt(r){let t=await ze();if(t&&t.createCardElement)return t.createCardElement(r);let e=String(r.type||""),i=e.startsWith("custom:")?e.slice(7):`hui-${e}-card`,s=document.createElement(i);return s.setConfig&&s.setConfig(r),s}var f={IDLE:"idle",INCOMING:"incoming",OUTGOING:"outgoing",CONNECTING:"connecting",CONNECTED:"connected"},be=["sipcore-update","sipcore-call-started","sipcore-call-ended"],yt=class{constructor(t,e){this._onChange=t,this._onError=e||(()=>{}),this._handler=()=>this.refresh(),this._timer=null,this._last="",this.available=!1,this.registered=!1,this.state=f.IDLE,this.remoteExtension=null,this.remoteName=null,this.ownExtension=null,this.muted=!1,this.since=null,this._prevState=f.IDLE,this._callStarted=0,this._hooked=null,this._failCause=null}get core(){return window.sipCore||window.sipcore||null}connect(){for(let t of be)window.addEventListener(t,this._handler);this._timer=window.setInterval(this._handler,2e3),this.refresh()}disconnect(){for(let t of be)window.removeEventListener(t,this._handler);this._timer&&window.clearInterval(this._timer),this._timer=null}refresh(){let t=this.core;if(!t)this.available=!1,this.registered=!1,this.state=f.IDLE,this.remoteExtension=null,this.remoteName=null,this.muted=!1,this.since=null;else{this.available=!0,this.state=t.callState||f.IDLE;let i=!1;try{i=!!(t.ua&&typeof t.ua.isRegistered=="function"&&t.ua.isRegistered())}catch{i=!1}this.registered=i;let s=null,n=null;try{s=t.remoteExtension||null,n=t.remoteName||null}catch{}this.remoteExtension=s?String(s):null,this.remoteName=n?String(n):null,this.ownExtension=t.user&&t.user.extension?String(t.user.extension):null;let a=!1;try{a=!!(t.RTCSession&&t.RTCSession.isMuted&&t.RTCSession.isMuted().audio)}catch{a=!1}this.muted=a,this.state===f.CONNECTED?this.since||(this.since=Date.now()):this.since=null}this.state!==f.IDLE&&this._hookSession(),this.state!==f.IDLE&&this._prevState===f.IDLE&&(this._callStarted=Date.now(),this._failCause=null),this.state===f.IDLE&&this._prevState&&this._prevState!==f.IDLE&&(!this._failCause&&this._prevState!==f.CONNECTED&&this._callStarted&&Date.now()-this._callStarted<3e3&&this._onError(new Error(this._prevState===f.INCOMING?"eingehender Anruf sofort beendet":"sofort beendet")),this._callStarted=0),this._prevState=this.state;let e=[this.available,this.registered,this.state,this.remoteExtension,this.remoteName,this.muted,this.ownExtension].join("|");e!==this._last&&(this._last=e,this._onChange())}answer(){let t=this.core;t&&typeof t.answerCall=="function"&&t.answerCall()}hangup(){let t=this.core;t&&typeof t.endCall=="function"&&t.endCall()}call(t){let e=this.core;if(!e||typeof e.startCall!="function"||!t){this._onError(new Error(e?"startCall fehlt":"sipCore fehlt"));return}try{Promise.resolve(e.startCall(String(t))).then(()=>this._hookSession()).catch(i=>this._onError(i))}catch(i){this._onError(i)}window.setTimeout(()=>this.refresh(),300)}_hookSession(){let t=this.core,e=t&&t.RTCSession;if(!(!e||e===this._hooked||typeof e.on!="function")){this._hooked=e;try{e.on("failed",i=>{let s=i&&i.cause||"failed",n=i&&i.message&&i.message.status_code?` (${i.message.status_code})`:"";this._failCause=`${s}${n}`,this._onError(new Error(this._failCause)),this.refresh()})}catch{}}}toggleMute(){let t=this.core&&this.core.RTCSession;if(t){try{t.isMuted().audio?t.unmute({audio:!0}):t.mute({audio:!0})}catch{}this.refresh()}}sendDtmf(t){let e=this.core&&this.core.RTCSession;if(e&&typeof e.sendDTMF=="function")try{e.sendDTMF(String(t))}catch{}}};var Re=["audio/webm;codecs=opus","audio/webm","audio/mp4","audio/ogg;codecs=opus","audio/ogg"];function ve(){return!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder)}function Oe(r){let t=String(r||"").toLowerCase();return t.includes("webm")?"webm":t.includes("mp4")||t.includes("m4a")||t.includes("aac")?"m4a":t.includes("ogg")?"ogg":t.includes("wav")?"wav":"webm"}var $t=class{constructor({onLevel:t,onTick:e,maxSeconds:i=120}={}){this.onLevel=t,this.onTick=e,this.maxSeconds=i,this.stream=null,this.recorder=null,this.chunks=[],this.ctx=null,this.analyser=null,this.buf=null,this.timer=null,this.started=0,this._stopPromise=null}async start(){this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}});let t=Re.find(i=>window.MediaRecorder.isTypeSupported&&window.MediaRecorder.isTypeSupported(i))||"",e=t?{mimeType:t,audioBitsPerSecond:64e3}:void 0;this.recorder=new MediaRecorder(this.stream,e),this.chunks=[],this.recorder.ondataavailable=i=>{i.data&&i.data.size&&this.chunks.push(i.data)};try{let i=window.AudioContext||window.webkitAudioContext;this.ctx=new i;let s=this.ctx.createMediaStreamSource(this.stream);this.analyser=this.ctx.createAnalyser(),this.analyser.fftSize=256,this.analyser.smoothingTimeConstant=.6,s.connect(this.analyser),this.buf=new Uint8Array(this.analyser.frequencyBinCount)}catch{this.analyser=null}this.started=Date.now(),this.timer=window.setInterval(()=>this._tick(),120),this.recorder.start(250)}_tick(){let t=(Date.now()-this.started)/1e3;if(this.analyser&&this.onLevel){this.analyser.getByteFrequencyData(this.buf);let e=12,i=Math.max(1,Math.floor(this.buf.length*.6/e)),s=[];for(let n=0;n<e;n++){let a=0;for(let c=0;c<i;c++)a+=this.buf[n*i+c]||0;s.push(Math.min(1,a/i/160))}this.onLevel(s)}this.onTick&&this.onTick(t),t>=this.maxSeconds&&this.stop()}stop(){return this._stopPromise?this._stopPromise:(this._stopPromise=new Promise(t=>{let e=this.recorder,i=()=>{let s=e&&e.mimeType||"audio/webm",n=new Blob(this.chunks,{type:s}),a=(Date.now()-this.started)/1e3;this._cleanup(),t({blob:n,ext:Oe(s),seconds:a,mime:s})};if(!e||e.state==="inactive"){i();return}e.onstop=i;try{e.stop()}catch{i()}}),this._stopPromise)}cancel(){try{this.recorder&&this.recorder.state!=="inactive"&&this.recorder.stop()}catch{}this._cleanup()}_cleanup(){if(this.timer&&window.clearInterval(this.timer),this.timer=null,this.stream&&this.stream.getTracks().forEach(t=>t.stop()),this.stream=null,this.ctx)try{this.ctx.close()}catch{}this.ctx=null,this.analyser=null}};var T=r=>l`<svg viewBox="0 0 24 24"><path d=${I[r]}></path></svg>`,et=class extends ${constructor(){super(),this.view={},this._camera=null,this._confirm=!1,this._onKey=t=>{t.key==="Escape"&&this._emit("close")}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onKey),this._buildCamera()}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onKey)}async _buildCamera(){if(this.cameraConfig)try{let t=await xt(this.cameraConfig);t.hass=this.hass,this._camera=t}catch{this._camera=null}}updated(t){t.has("hass")&&this._camera&&(this._camera.hass=this.hass),t.has("ratio")&&this.ratio&&this.style.setProperty("--fs-ratio",String(this.ratio))}_emit(t){this.dispatchEvent(new CustomEvent(`intercom-${t}`,{bubbles:!1}))}_door(){if(this.view.doorConfirm&&!this._confirm){this._confirm=!0,window.setTimeout(()=>{this._confirm=!1},5e3);return}this._confirm=!1,this._emit("door")}render(){let t=this.t||(s=>s),e=this.view||{},i=e.sip||f.IDLE;return l`
      <div class="stage">${this._camera||l`<div class="ph">${T("image")}</div>`}</div>
      <div class="ov"><span class="dot"></span>${t("live")}${this.label?` \xB7 ${this.label}`:""}</div>
      <button type="button" class="close" @click=${()=>this._emit("close")}>${T("close")}${t("shrink")}</button>
      ${e.title?l`<div class="title">
            <div class="big">${e.title}</div>
            ${e.meta?l`<div class="meta">${e.meta}</div>`:h}
          </div>`:h}
      <div class="bar">
        <div class="tools">
          ${i===f.CONNECTED?l`<button type="button" class=${e.muted?"on":""} aria-label=${e.muted?t("unmute"):t("mute")} @click=${()=>this._emit("mute")}>
                ${T(e.muted?"micOff":"mic")}
              </button>`:h}
        </div>
        <div class="mid">
          ${i===f.INCOMING?l`<button type="button" class="btn ok" @click=${()=>this._emit("answer")}>${T("phone")}${t("answer")}</button>
                <button type="button" class="btn danger" @click=${()=>this._emit("hangup")}>${T("hangup")}${t("reject")}</button>`:h}
          ${i===f.OUTGOING||i===f.CONNECTING||i===f.CONNECTED?l`<button type="button" class="btn danger" @click=${()=>this._emit("hangup")}>${T("hangup")}${t("hangup")}</button>`:h}
          ${i===f.IDLE&&e.sipAvailable?l`<button type="button" class="btn ok" @click=${()=>this._emit("call")}>${T("phone")}${t("call_door")}</button>`:h}
          ${e.doorAvailable?l`<button type="button" class="btn ${this._confirm?"danger":"ghost"}" ?disabled=${e.doorBusy} @click=${this._door}>
                ${T("lockOpen")}${this._confirm?t("really_open"):e.doorBusy?t("door_busy"):t("open_door")}
              </button>`:h}
        </div>
        <div></div>
      </div>
    `}};C(et,"properties",{hass:{attribute:!1},cameraConfig:{attribute:!1},t:{attribute:!1},label:{attribute:!1},view:{attribute:!1},ratio:{attribute:!1},_camera:{state:!0},_confirm:{state:!0}}),C(et,"styles",[F,G,A`
      :host {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: #000;
        display: block;
        color: #f3f5f7;
      }
      .stage {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        --ha-card-border-radius: 0;
        --ha-card-box-shadow: none;
        --ha-card-border-width: 0;
      }
      .stage > * {
        width: min(100%, calc(100vh * var(--fs-ratio, 1.7778)));
        width: min(100%, calc(100dvh * var(--fs-ratio, 1.7778)));
        max-height: 100%;
      }
      .ov {
        position: absolute;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 11px;
        border-radius: 999px;
        background: rgba(10, 12, 14, 0.6);
        color: #f3f5f7;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.06em;
        backdrop-filter: blur(6px);
        top: 16px;
        left: 16px;
        max-width: calc(100% - 200px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ov .dot {
        background: #ff5a4f;
        box-shadow: 0 0 0 3px rgba(255, 90, 79, 0.25);
      }
      .close {
        position: absolute;
        top: 16px;
        right: 16px;
        height: 36px;
        padding: 0 12px;
        border: 0;
        border-radius: 9px;
        background: rgba(10, 12, 14, 0.6);
        color: #f3f5f7;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        backdrop-filter: blur(6px);
      }
      .bar {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 16px 20px max(22px, env(safe-area-inset-bottom));
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 14px;
        align-items: center;
        background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.75));
      }
      .tools {
        display: flex;
        gap: 6px;
      }
      .tools button {
        width: 44px;
        height: 44px;
        border: 0;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.14);
        color: #f3f5f7;
        display: grid;
        place-items: center;
      }
      .tools button.on {
        background: var(--ic-danger);
      }
      .mid {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .mid .btn {
        min-width: 150px;
        padding: 15px 18px;
        font-size: 16px;
      }
      .title {
        position: absolute;
        left: 20px;
        right: 20px;
        bottom: 96px;
        text-align: center;
        text-shadow: 0 1px 6px rgba(0, 0, 0, 0.7);
        pointer-events: none;
      }
      .title .big {
        font-size: 20px;
        font-weight: 500;
      }
      .title .meta {
        font-size: 13px;
        opacity: 0.85;
        font-variant-numeric: tabular-nums;
      }
      .ph {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #9aa3ae;
      }
      @media (max-width: 700px) {
        .bar {
          grid-template-columns: 1fr;
          justify-items: center;
        }
        .mid .btn {
          min-width: 120px;
          padding: 12px 14px;
          font-size: 15px;
        }
      }
    `]);customElements.define("intercom-fullscreen",et);var Ie=r=>l`<svg viewBox="0 0 24 24"><path d=${I[r]}></path></svg>`;function It(r){return String(r||"").split(".")[0]}var it=class extends ${constructor(){super(),this.popup=!1,this._config={},this._info=void 0,this._error=null,this._drag={},this._pendingInfo=!1}setConfig(t){this._config={...t||{}},this._info=void 0,this.hass?this._loadInfo():this._pendingInfo=!0}getCardSize(){return 10}async _loadInfo(){if(this.hass)try{this._info=await bt(this.hass,this._config.entry_id),this._error=null}catch(t){this._info=null,this._error=t&&t.message?t.message:String(t)}}updated(t){t.has("hass")&&this.hass&&(this._pendingInfo||this._info===void 0)&&(this._pendingInfo=!1,this._loadInfo())}get t(){return _t(k(this.hass,this._config))}_groups(t){let e=this._info&&this._info.entities||{},i=[];this._config.show_defaults!==!1&&this._info&&(i.push({name:t("g_ring"),rows:[{entity:e.klingeldauer,name:t("s_klingeldauer"),description:t("s_klingeldauer_d")},{entity:e.freizeichen,name:t("s_freizeichen"),description:t("s_freizeichen_d")},{entity:e.klingelton,name:t("s_klingelton"),description:t("s_klingelton_d")}]}),i.push({name:t("g_answering"),rows:[{entity:e.mailbox,name:t("s_mailbox"),description:t("s_mailbox_d")},{entity:e.sprachansage,name:t("s_sprachansage"),description:t("s_sprachansage_d")},{entity:e.ansage,name:t("s_ansage"),description:t("s_ansage_d")},{entity:e.sprechzeit,name:t("s_sprechzeit"),description:t("s_sprechzeit_d")},{entity:e.aufbewahrung,name:t("s_aufbewahrung"),description:t("s_aufbewahrung_d")}]}));for(let s of this._config.groups||[]){let n=(s.rows||s.entities||[]).map(a=>typeof a=="string"?{entity:a}:a);i.push({name:s.name||"",rows:n})}return i.map(s=>({...s,rows:s.rows.filter(n=>n&&n.entity&&x(this.hass,n.entity))})).filter(s=>s.rows.length)}_call(t,e,i){return this.hass.callService(t,e,i)}_toggle(t){this._call("homeassistant","toggle",{entity_id:t})}_setNumber(t,e){let i=It(t);this._call(i==="input_number"?"input_number":"number","set_value",{entity_id:t,value:e})}_setOption(t,e){let i=It(t);this._call(i==="input_select"?"input_select":"select","select_option",{entity_id:t,option:e})}_renderRow(t,e){let i=x(this.hass,t.entity),s=It(t.entity),n=t.name||me(this.hass,t.entity),a=t.description||"",c=l`<div><div class="t">${n}</div>${a?l`<div class="s">${a}</div>`:h}</div>`;if(s==="switch"||s==="input_boolean"){let u=i.state==="on";return l`<div class="srow">
        ${c}
        <button type="button" class="sw" role="switch" aria-checked=${u?"true":"false"} aria-label=${n} @click=${()=>this._toggle(t.entity)}></button>
      </div>`}if(s==="number"||s==="input_number"){let u=i.attributes||{},d=Number(u.min??0),g=Number(u.max??100),_=Number(u.step??1),m=t.unit||u.unit_of_measurement||"",y=this._drag[t.entity]!==void 0?this._drag[t.entity]:Number(i.state),b=Number.isFinite(y)?y:d,w=g>d?(b-d)/(g-d)*100:0;return l`<div class="srow wide">
        ${c}
        <div class="slider" style="--pct:${w}%">
          <div class="fill"></div>
          <div class="val">${Number.isInteger(_)?Math.round(b):b}<small>${m}</small></div>
          <input
            type="range"
            aria-label=${n}
            min=${d}
            max=${g}
            step=${_}
            .value=${String(b)}
            @input=${V=>{this._drag={...this._drag,[t.entity]:Number(V.target.value)}}}
            @change=${V=>{let kt=Number(V.target.value),U={...this._drag};delete U[t.entity],this._drag=U,this._setNumber(t.entity,kt)}}
          />
        </div>
      </div>`}if(s==="select"||s==="input_select"){let u=i.attributes&&i.attributes.options||[];return l`<div class="srow">
        ${c}
        <select class="sel" aria-label=${n} @change=${d=>this._setOption(t.entity,d.target.value)}>
          ${u.map(d=>l`<option value=${d} ?selected=${d===i.state}>${d}</option>`)}
        </select>
      </div>`}let o=i.attributes&&i.attributes.unit_of_measurement||"",p=i.state;return i.attributes&&i.attributes.device_class==="timestamp"&&(p=P(i.state,k(this.hass,this._config),e)),s==="binary_sensor"&&(p=i.state==="on"?e("st_running"):e("st_idle")),l`<div class="srow">${c}<span class="badge muted">${p}${o?` ${o}`:""}</span></div>`}_statusRows(t){let e=this._info;if(!e)return[];let i=e.entities||{},s=[],n=(p,u)=>{let d=`binary_sensor.${p}_registered`,g=x(this.hass,d);if(!p||!g)return;let _=g.state==="on";s.push({name:t(u,{ext:p}),value:t(_?"st_registered":"st_not_registered"),cls:_?"ok":"danger"})};n(e.ext_door,"st_door"),n(e.ext_tablet,"st_tablet");let a=x(this.hass,e.ami_connected_entity);a&&s.push({name:t("st_asterisk"),value:a.state==="on"?t("st_connected"):t("st_disconnected"),cls:a.state==="on"?"ok":"danger"});let c=x(this.hass,i.aufnahme);c&&s.push({name:t("st_recording"),value:c.state==="on"?t("st_running"):t("st_idle"),cls:c.state==="on"?"":"muted"});let o=x(this.hass,i.letztes_klingeln);if(o){let p=o.state&&o.state!=="unknown"&&o.state!=="unavailable";s.push({name:t("last_ring"),value:p?P(o.state,k(this.hass,this._config),t):t("never"),cls:"muted"})}return s}render(){let t=this.t,e=this._config.title||t("settings_title"),i;if(this._info===void 0)i=l`<div class="empty">${t("loading")}</div>`;else if(this._info===null)i=l`<div class="empty">${t("not_configured")}<br /><small>${this._error||t("not_configured_hint")}</small></div>`;else{let s=this._groups(t),n=this._config.show_status===!1?[]:this._statusRows(t);i=l`
        ${s.map(a=>l`<div class="group">
            ${a.name?l`<h3>${a.name}</h3>`:h}
            ${a.rows.map(c=>this._renderRow(c,t))}
          </div>`)}
        ${n.length?l`<div class="group">
              <h3>${t("g_status")}</h3>
              ${n.map(a=>l`<div class="srow">
                  <div><div class="t">${a.name}</div></div>
                  <span class="badge ${a.cls}">${a.cls==="ok"||a.cls==="danger"?l`<span class="dot"></span>`:h}${a.value}</span>
                </div>`)}
            </div>`:h}
        ${this._config.footer?l`<div class="foot">${this._config.footer}</div>`:l`<div style="height:8px"></div>`}
      `}return l`<div class="wrap">
      <div class="head">
        <h2>${e}</h2>
        ${this.popup?l`<button type="button" class="close" aria-label=${t("close")} @click=${()=>this.dispatchEvent(new CustomEvent("intercom-close"))}>${Ie("close")}</button>`:h}
      </div>
      ${i}
    </div>`}};C(it,"properties",{hass:{attribute:!1},popup:{type:Boolean},_config:{state:!0},_info:{state:!0},_error:{state:!0},_drag:{state:!0}}),C(it,"styles",[F,G,A`
      :host {
        display: block;
      }
      .wrap {
        background: var(--ic-card);
        border-radius: var(--ic-radius);
        box-shadow: var(--ic-shadow);
        border: var(--ic-border);
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 18px 8px;
        position: sticky;
        top: 0;
        background: var(--ic-card);
        z-index: 1;
        border-radius: var(--ic-radius) var(--ic-radius) 0 0;
      }
      .head h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
      }
      .close {
        width: 36px;
        height: 36px;
        border: 0;
        border-radius: 10px;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        display: grid;
        place-items: center;
      }
      .group {
        padding: 4px 18px 10px;
      }
      .group h3 {
        margin: 12px 0 4px;
        font-size: 12px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ic-text-2);
        font-weight: 500;
      }
      .srow {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 10px 0;
        border-top: 1px solid var(--ic-line);
      }
      .srow:first-of-type {
        border-top: 0;
      }
      .srow .t {
        font-weight: 500;
      }
      .srow .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .srow.wide {
        grid-template-columns: 1fr;
      }
      .srow .slider {
        height: 34px;
        margin-top: 6px;
      }
      .foot {
        padding: 6px 18px 16px;
        color: var(--ic-text-2);
        font-size: 12px;
      }
    `]);customElements.define("intercom-settings-card",it);var st=class extends ${constructor(){super(),this._onKey=t=>{t.key==="Escape"&&this.close()}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onKey)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onKey)}close(){this.remove()}firstUpdated(){let t=document.createElement("intercom-settings-card");t.setConfig(this.config||{}),t.hass=this.hass,t.popup=!0,t.addEventListener("intercom-close",()=>this.close()),this._card=t,this.renderRoot.querySelector(".box").appendChild(t)}updated(t){t.has("hass")&&this._card&&(this._card.hass=this.hass)}render(){return l`<div class="box" @click=${t=>t.stopPropagation()}></div>`}};C(st,"properties",{hass:{attribute:!1},config:{attribute:!1}}),C(st,"styles",A`
    :host {
      position: fixed;
      inset: 0;
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(8, 10, 12, 0.55);
    }
    .box {
      width: min(560px, 100%);
      max-height: calc(100vh - 40px);
      max-height: calc(100dvh - 40px);
      overflow: auto;
      border-radius: var(--intercom-radius, 14px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    }
  `);customElements.define("intercom-popup",st);function xe(r,t){let e=document.querySelector("intercom-popup");e&&e.remove();let i=document.createElement("intercom-popup");return i.hass=r,i.config=t,i.addEventListener("click",s=>{s.target===i&&i.close()}),document.body.appendChild(i),i}var v=r=>l`<svg viewBox="0 0 24 24"><path d=${I[r]}></path></svg>`,Pe="Ringing",Ue=[["1",""],["2","ABC"],["3","DEF"],["4","GHI"],["5","JKL"],["6","MNO"],["7","PQRS"],["8","TUV"],["9","WXYZ"],["*",""],["0","+"],["#",""]];function wt(r){return String(r||"").split(".")[0]}var nt=class extends ${static getStubConfig(){return{name:"Doorbell",fullscreen_on_ring:!0,contacts:[]}}constructor(){super(),this._config=null,this._info=void 0,this._infoError=null,this._infoLoading=!1,this._infoAt=0,this._tab="anruf",this._dial="",this._open=null,this._clipUrl=null,this._mtab="nachrichten",this._confirm=null,this._rec={phase:"idle"},this._playing=null,this._renaming=null,this._volDrag=null,this._doorBusy=!1,this._now=Date.now(),this._sipTick=0,this._sipError=null,this._pad=null,this._pendingMode=null,this._alarmError=null,this._alarmFailReason=null,this._alarmSub=null,this._sip=new yt(()=>this._onSip(),t=>{let e=t&&t.message||String(t),i={"User Denied Media Access":"Mikrofon verweigert oder Seite nicht \xFCber https ge\xF6ffnet","WebRTC Error":"WebRTC-Fehler, Mikrofon oder unsichere Verbindung (http)","Not Found":"Nebenstelle unbekannt","Connection Error":"keine Verbindung zu Asterisk","Request Timeout":"keine Antwort von Asterisk",Unavailable:"Gegenstelle nicht erreichbar",Busy:"besetzt",Rejected:"abgewiesen"},s=Object.keys(i).find(n=>e.startsWith(n));this._sipError=s?`${i[s]} \xB7 ${e}`:e,window.clearTimeout(this._sipErrorTimer),this._sipErrorTimer=window.setTimeout(()=>{this._sipError=null},8e3)}),this._cameraEl=null,this._cameraKey=null,this._fs=null,this._fsAuto=!1,this._popup=null,this._recorder=null,this._audio=null,this._pendingSign=new Set,this._wasRinging=!1,this._ringSeen=0,this._lastSipState=f.IDLE,this._needTick=!1,this._timer=null}setConfig(t){let e=t||{},i={live:!0,call:!0,mailbox:!0,announcements:!0,status:!0,info:!0,header:!1,...e.show||{}},s=typeof e.settings=="string"?{mode:e.settings}:{...e.settings||{}};s.mode||(s.mode=s.path?"navigate":"popup");let n=e.door?typeof e.door=="string"?{entity:e.door}:{...e.door}:null,a=e.volume?typeof e.volume=="string"?{entity:e.volume}:{...e.volume}:null;this._config={name:e.name,entry_id:e.entry_id,camera:e.camera||null,fullscreen_camera:e.fullscreen_camera||null,fullscreen_on_ring:!!e.fullscreen_on_ring,fullscreen_auto_close:e.fullscreen_auto_close!==!1,door:n,volume:a,contacts:Array.isArray(e.contacts)?e.contacts:[],status:Array.isArray(e.status)?e.status:null,settings:s,show:i,layout:e.layout==="auto"?"auto":"fill",height_offset:e.height_offset,language:e.language,live_aspect:e.live_aspect||null,default_tab:e.default_tab||"anruf",padding:e.padding!==void 0&&e.padding!==null?String(e.padding):null,alarm:e.alarm?typeof e.alarm=="string"?{entity:e.alarm}:{...e.alarm}:null,actions:Array.isArray(e.actions)?e.actions:null,info:Array.isArray(e.info)?e.info:null,side_width:Number(e.side_width)>0?Number(e.side_width):220,live_height:Number(e.live_height)>0?Math.min(80,Math.max(20,Number(e.live_height))):48},this._tab=this._config.default_tab,this._cameraKey=null,this._cameraEl=null,this.hass&&this._ensureCamera()}getCardSize(){return 12}getGridOptions(){return{columns:"full",rows:"auto"}}get t(){return _t(k(this.hass,this._config||{}))}connectedCallback(){super.connectedCallback(),this._sip.connect(),this._timer=window.setInterval(()=>this._tick(),1e3),this._onResize=()=>this._measureTop(),window.addEventListener("resize",this._onResize),window.setTimeout(()=>this._measureTop(),300),window.setTimeout(()=>this._measureTop(),2e3)}_measureTop(){if(!this.isConnected)return;let t=Math.max(0,Math.round(this.getBoundingClientRect().top+(window.scrollY||0)));t!==this._top&&(this._top=t,this.style.setProperty("--intercom-top",`${t}px`))}disconnectedCallback(){super.disconnectedCallback(),this._sip.disconnect(),this._timer&&window.clearInterval(this._timer),this._timer=null,this._onResize&&window.removeEventListener("resize",this._onResize),this._alarmSub&&(this._alarmSub.then(t=>(t||[]).forEach(e=>typeof e=="function"&&e())).catch(()=>null),this._alarmSub=null),this._closeFullscreen(),this._popup&&this._popup.remove(),this._popup=null,this._stopAudio(),this._recorder&&this._recorder.cancel(),this._recorder=null}_tick(){this._needTick&&(this._now=Date.now()),this._info===null&&this.hass&&!this._infoLoading&&Date.now()-this._infoAt>6e4&&this._loadInfo(!0)}async _loadInfo(t=!1){if(!(!this.hass||this._infoLoading)){this._infoLoading=!0,this._infoAt=Date.now();try{this._info=await bt(this.hass,this._config&&this._config.entry_id,t),this._infoError=(this._info,null)}catch(e){this._info=null,this._infoError=e&&e.message?e.message:String(e)}finally{this._infoLoading=!1}this._info&&(this._ensureCamera(),this._syncRing(),this._ensureThumbs(),this._syncFullscreen(),this._ensureAlarmEvents())}}firstUpdated(){this._measureTop()}updated(t){if(t.has("_renaming")&&this._renaming||t.has("_rec")&&this._rec.phase==="preview"&&t.get("_rec")&&t.get("_rec").phase!=="preview"){let e=this.renderRoot.querySelector("input.txt");e&&(e.focus(),e.select())}!t.has("hass")||!this.hass||(this._ensureAlarmEvents(),this._info===void 0&&!this._infoLoading&&this._loadInfo(),this._cameraEl&&(this._cameraEl.hass=this.hass),this._popup&&(this._popup.isConnected?this._popup.hass=this.hass:this._popup=null),this._info&&(this._ensureCamera(),this._syncRing(),this._ensureThumbs()),this._syncFullscreen())}_ent(t){return this._info&&this._info.entities?this._info.entities[t]:void 0}_st(t){return x(this.hass,this._ent(t))}_svc(t,e){let i=this._info&&this._info.entry_id?{entry_id:this._info.entry_id}:{};return this.hass.callService("ha_intercom",t,{...i,...e||{}})}_title(t){let e=this._config||{};return e.name?e.name:(t||this.t)("title")}_isDoor(t){return!!t&&!!this._info&&String(t)===String(this._info.ext_door)}_doorState(){if(!this._info)return null;let t=x(this.hass,this._info.door_state_entity);return t?t.state:null}_ringing(){return this._doorState()===Pe?!0:this._sip.state===f.INCOMING&&this._isDoor(this._sip.remoteExtension)}_ringStart(){let t=this._st("klingel");if(t&&t.attributes&&t.attributes.event_type==="ring"){let e=Date.parse(t.state);if(Number.isFinite(e)&&Date.now()-e<600*1e3)return e}return this._ringSeen||Date.now()}_syncRing(){let t=this._ringing();t&&!this._wasRinging&&(this._ringSeen=Date.now(),this._config&&this._config.fullscreen_on_ring&&!this._fs&&this._openFullscreen(!0)),!t&&this._wasRinging&&this._scheduleAutoClose(),this._wasRinging=t,this._needTick=t||this._sip.state!==f.IDLE||this._rec.phase==="recording"}_onSip(){let t=this._lastSipState;this._lastSipState=this._sip.state,this._sipTick=Date.now(),this._sip.state===f.INCOMING&&t!==f.INCOMING&&(this._tab="anruf",this._isDoor(this._sip.remoteExtension)&&this._config&&this._config.fullscreen_on_ring&&!this._fs&&this._openFullscreen(!0)),this._sip.state===f.IDLE&&t!==f.IDLE&&this._scheduleAutoClose(),this._syncRing(),this._syncFullscreen()}_scheduleAutoClose(){!this._fs||!this._fsAuto||!this._config.fullscreen_auto_close||(window.clearTimeout(this._closeTimer),this._closeTimer=window.setTimeout(()=>{this._fs&&this._fsAuto&&!this._ringing()&&this._sip.state===f.IDLE&&this._closeFullscreen()},1500))}_liveRatio(){let t=this._config&&this._config.live_aspect;if(!t)return 16/9;let e=String(t).match(/([\d.]+)\s*[/:]\s*([\d.]+)/);if(!e)return 16/9;let i=Number(e[1]),s=Number(e[2]);return i>0&&s>0?i/s:16/9}_cameraConfig(){if(this._config&&this._config.camera)return this._config.camera;let t=this._info&&this._info.camera_entity;return t?{type:"picture-entity",entity:t,camera_view:"live",show_name:!1,show_state:!1,fit_mode:"cover"}:null}async _ensureCamera(){if(!this._config||!this._config.show.live)return;let t=this._cameraConfig(),e=t?JSON.stringify(t):null;if(!(!t||e===this._cameraKey)){this._cameraKey=e;try{let i=await xt(t);i.hass=this.hass,this._cameraEl=i}catch{this._cameraEl=null}this.requestUpdate()}}_openFullscreen(t=!1){if(this._fs)return;let e=document.createElement("intercom-fullscreen");e.hass=this.hass,e.t=this.t,e.label=this._title(),e.cameraConfig=this._config.fullscreen_camera||this._cameraConfig(),e.ratio=this._liveRatio(),e.addEventListener("intercom-close",()=>this._closeFullscreen()),e.addEventListener("intercom-answer",()=>this._sip.answer()),e.addEventListener("intercom-hangup",()=>this._sip.hangup()),e.addEventListener("intercom-call",()=>this._callDoor()),e.addEventListener("intercom-door",()=>this._doorAction()),e.addEventListener("intercom-mute",()=>this._sip.toggleMute()),this._fs=e,this._fsAuto=t,document.body.appendChild(e),this._syncFullscreen()}_closeFullscreen(){this._fs&&this._fs.remove(),this._fs=null,this._fsAuto=!1}_syncFullscreen(){if(!this._fs)return;let t=this.t,e=this._callInfo(t),i=this._doorInfo(t);this._fs.hass=this.hass,this._fs.t=t,this._fs.view={sip:this._sip.state,sipAvailable:this._sip.available,title:e.title,meta:e.meta,muted:this._sip.muted,doorAvailable:!!i,doorConfirm:!!(this._doorCfg()||{}).confirm,doorBusy:!!(i&&i.busy)}}_startCall(t){t&&(this._sip.call(t),this._tab="anruf")}_callDoor(){this._info&&this._info.ext_door&&this._startCall(this._info.ext_door)}_contactName(t,e){let i=this._allContacts(e).find(s=>String(s.extension)===String(t));return i&&i.name?i.name:this._isDoor(t)?e("door_station"):t?String(t):"?"}_callInfo(t){let e=this._sip,i=this._ringing(),s={text:t("ready"),cls:"muted"},n="",a="";return e.state===f.INCOMING?(s={text:t("ringing"),cls:""},n=this._isDoor(e.remoteExtension)?t("visitor"):t("call_from",{name:this._contactName(e.remoteExtension,t)}),a=this._isDoor(e.remoteExtension)?this._ringMeta(t):""):e.state===f.OUTGOING||e.state===f.CONNECTING?(s={text:e.state===f.CONNECTING?t("connecting"):t("calling"),cls:""},n=t("calling_to",{name:this._contactName(e.remoteExtension,t)}),a=e.state===f.CONNECTING?t("connecting"):""):e.state===f.CONNECTED?(s={text:t("in_call"),cls:"ok"},n=t("talking_with",{name:this._contactName(e.remoteExtension,t)}),a=tt((Date.now()-(e.since||Date.now()))/1e3)):i?(s={text:t("ringing"),cls:""},n=t("visitor"),a=[this._ringMeta(t),e.available?"":t("ringing_elsewhere")].filter(Boolean).join(" \xB7 ")):e.available||(s={text:t("sip_missing"),cls:"muted"}),this._sipError&&(n=n||t("ready"),a=t("call_failed",{e:this._sipError})),{badge:s,title:n,meta:a,ringing:i||e.state===f.INCOMING}}_ringMeta(t){let e=Math.max(0,Math.round((Date.now()-this._ringStart())/1e3)),i=fe(this.hass,this._ent("klingeldauer"),0),s=[t("ringing_since",{s:e})];if(i>0){let n=Math.max(0,Math.round(i-e));s.push(vt(this.hass,this._ent("sprachansage"))?t("announcement_in",{s:n}):t("busy_in",{s:n}))}return s.join(" \xB7 ")}_doorInfo(t){let e=this._doorCfg();if(!e||!e.entity)return null;let i=x(this.hass,e.entity);if(!i)return null;let s={locked:t("door_locked"),unlocked:t("door_unlocked"),open:t("door_open"),opening:t("door_busy"),unlocking:t("door_busy"),locking:t("door_busy"),jammed:t("door_unavailable"),unavailable:t("door_unavailable"),unknown:t("unknown"),on:t("door_open"),off:t("door_locked")},n=this._doorBusy||["opening","unlocking","locking"].includes(i.state);return{id:e.entity,st:i,text:s[i.state]||i.state,locked:i.state==="locked",busy:n,name:e.name||t("door")}}async _doorAction(){let t=this._doorCfg();if(!t||!t.entity)return;let e=x(this.hass,t.entity),i=wt(t.entity),s=t.action;s||(i==="lock"?s=Number(e&&e.attributes&&e.attributes.supported_features||0)&1?"open":"unlock":i==="cover"?s="open_cover":i==="button"||i==="input_button"?s="press":s="turn_on"),this._doorBusy=!0,window.clearTimeout(this._doorTimer),this._doorTimer=window.setTimeout(()=>{this._doorBusy=!1,this._syncFullscreen()},4e3),this._syncFullscreen();try{await this.hass.callService(i,s,{entity_id:t.entity})}catch{this._doorBusy=!1}}_doorClick(){if((this._doorCfg()||{}).confirm&&this._confirm!=="door"){this._setConfirm("door");return}this._confirm=null,this._doorAction()}_setConfirm(t){this._confirm=t,window.clearTimeout(this._confirmTimer),this._confirmTimer=window.setTimeout(()=>{this._confirm===t&&(this._confirm=null)},6e3)}_setNumber(t,e){let i=wt(t);return this.hass.callService(i==="input_number"?"input_number":"number","set_value",{entity_id:t,value:e})}_entries(){let t=this._st("nachrichten");return t&&t.attributes&&t.attributes.eintraege||[]}_ensureThumbs(){if(this._config.show.mailbox)for(let t of this._entries().slice(0,80)){let e=t.bild_url;!e||Ot(e)||this._pendingSign.has(e)||(this._pendingSign.add(e),mt(this.hass,e,6*3600).then(()=>{this._pendingSign.delete(e),this.requestUpdate()}).catch(()=>this._pendingSign.delete(e)))}}async _openMessage(t){if(this._open===t.kennung){this._open=null,this._clipUrl=null;return}if(this._open=t.kennung,this._clipUrl=null,t.gesehen||this._svc("nachricht_gesehen",{kennung:t.kennung}),t.clip&&t.clip_url)try{let e=await mt(this.hass,t.clip_url,3600);this._open===t.kennung&&(this._clipUrl=e)}catch{this._clipUrl=null}}_deleteMessage(t){let e=`msg:${t.kennung}`;if(this._confirm!==e){this._setConfirm(e);return}this._confirm=null,this._open===t.kennung&&(this._open=null,this._clipUrl=null),this._svc("nachricht_loeschen",{kennung:t.kennung})}_kind(t,e){let i=Math.round(Number(t.dauer)||0);return t.angenommen?{text:e("msg_answered",{s:i}),note:!1}:t.nachricht?{text:e("msg_note",{s:i}),note:!0}:{text:e("msg_visitor",{s:i}),note:!1}}_ansagen(){let t=this._st("ansagen");return t&&t.attributes&&t.attributes.liste||[]}_ansageAktiv(){let t=this._st("ansagen");return t&&t.attributes?t.attributes.aktiv:null}_activate(t){this._svc("ansage_aktivieren",{name:t})}async _playAnsage(t){if(this._playing===t.datei){this._stopAudio();return}this._stopAudio();try{let e=await mt(this.hass,t.url,600),i=new Audio(e);this._audio=i,this._playing=t.datei,i.onended=()=>{this._audio===i&&(this._audio=null,this._playing=null)},i.onerror=i.onended,await i.play()}catch{this._audio=null,this._playing=null}}_stopAudio(){if(this._audio)try{this._audio.pause()}catch{}this._audio=null,this._playing=null}_deleteAnsage(t){let e=`ann:${t.datei}`;if(this._confirm!==e){this._setConfirm(e);return}this._confirm=null,this._playing===t.datei&&this._stopAudio(),this._svc("ansage_loeschen",{name:t.name})}_renameSave(){let t=this._renaming;if(!t)return;let e=(t.value||"").trim();this._renaming=null,e&&e!==t.name&&this._svc("ansage_umbenennen",{name:t.name,neuer_name:e})}async _recStart(t){if(this._stopAudio(),!ve()){this._rec={phase:"idle",error:t("record_unsupported")};return}let e=new $t({onLevel:i=>{this._rec.phase==="recording"&&(this._rec={...this._rec,levels:i})},onTick:i=>{this._rec.phase==="recording"&&(this._rec={...this._rec,seconds:i})},maxSeconds:120});this._recorder=e,this._rec={phase:"recording",seconds:0,levels:[],error:null},this._needTick=!0;try{await e.start()}catch(i){this._recorder=null,this._rec={phase:"idle",error:t("mic_failed",{e:i&&i.message||String(i)})}}}async _recStop(t){let e=this._recorder;if(!e)return;let i=await e.stop();if(this._recorder=null,!i.blob||i.blob.size<500||i.seconds<.5){this._rec={phase:"idle",error:null};return}let s=k(this.hass,this._config),n=new Date().toISOString(),c=`${s==="de"?"Ansage":"Announcement"} ${Rt(n,s)} ${ft(n,s)}`;this._rec={phase:"preview",blob:i.blob,ext:i.ext,seconds:i.seconds,url:URL.createObjectURL(i.blob),name:c,error:null}}_recDiscard(){this._recorder&&(this._recorder.cancel(),this._recorder=null),this._rec.url&&URL.revokeObjectURL(this._rec.url),this._rec={phase:"idle"}}async _recSave(t){let e=this._rec;if(e.phase!=="preview")return;let i=(e.name||"").trim()||`${t("announcements")} ${ft(new Date().toISOString(),k(this.hass,this._config))}`;this._rec={...e,phase:"uploading",error:null};try{let s=new FormData;s.append("name",i),s.append("file",e.blob,`ansage.${e.ext}`);let n=this._info&&this._info.upload_url||"/api/ha_intercom/ansage/upload",a=await this.hass.fetchWithAuth(n,{method:"POST",body:s});if(!a.ok){let c=`HTTP ${a.status}`;try{let o=await a.json();o&&o.message&&(c=o.message)}catch{}throw new Error(c)}e.url&&URL.revokeObjectURL(e.url),this._rec={phase:"idle"},this._mtab="ansagen"}catch(s){this._rec={...e,phase:"preview",error:t("upload_failed",{e:s&&s.message||String(s)})}}}_openSettings(){let t=this._config.settings;if(t.mode==="none")return;if(t.mode==="navigate"&&t.path){window.history.pushState(null,"",t.path),window.dispatchEvent(new CustomEvent("location-changed",{detail:{replace:!1}}));return}let e={type:"custom:intercom-settings-card",entry_id:this._config.entry_id,language:this._config.language,...t.card||{}};this._popup=xe(this.hass,e)}render(){if(!this._config)return h;let t=this.t,e=this._config;if(this._info===null)return l`<div class="card"><div class="empty">${t("not_configured")}<br /><small>${this._infoError||t("not_configured_hint")}</small></div></div>`;if(this._info===void 0)return l`<div class="card"><div class="empty">${t("loading")}</div></div>`;let i=e.show,s=[`--intercom-live-ratio:${this._liveRatio()}`,`--intercom-side-width:${e.side_width}px`,`--intercom-live-pct:${e.live_height/100}`];e.height_offset!==void 0&&s.push(`--intercom-offset:${Number(e.height_offset)}px`),e.padding&&s.push(`--intercom-padding:${e.padding}`);let n=["main",i.mailbox?"":"nomail"].filter(Boolean).join(" "),a=!!i.header;return s.push(`--head-h:${a?46:0}px`),l`<div class="app ${e.layout} ${a?"":"nohead"}" style=${s.join(";")}>
      ${a?this._renderHead(t):h}
      <div class=${n}>
        <div class="left ${i.call?"":"nocall"}">
          <div class="top">${i.live?this._renderLive(t):l`<div></div>`}${this._renderSide(t)}</div>
          ${i.call?this._renderCall(t):h}
        </div>
        ${i.mailbox?this._renderMailbox(t):h}
      </div>
    </div>`}_statusChips(t){let e=this._info,i=this._config.status;if(!i){i=[];let s=(n,a)=>{let c=`binary_sensor.${n}_registered`;n&&x(this.hass,c)&&i.push({entity:c,name:t(a,{ext:n})})};s(e.ext_door,"chip_door"),s(e.ext_tablet,"chip_tablet")}return i.map(s=>typeof s=="string"?{entity:s}:s).map(s=>{let n=x(this.hass,s.entity);if(!n)return null;let a=s.on_state||"on",c=n.state===a,o=n.state==="unavailable"||n.state==="unknown";return{name:s.name||n.attributes&&n.attributes.friendly_name||s.entity,cls:o?"bad":c?"":"off"}}).filter(Boolean)}_lastRingText(t){let e=this._st("letztes_klingeln");if(!e)return"";let i=e.state&&e.state!=="unknown"&&e.state!=="unavailable";return`${t("last_ring")} ${i?P(e.state,k(this.hass,this._config),t):t("never")}`}_renderHead(t){let e=this._config.settings,i=this._lastRingText(t);return l`<div class="head">
      <h1>${this._title(t)}</h1>
      <div class="chips">
        ${this._statusChips(t).map(s=>l`<span class="chip"><span class="dot ${s.cls}"></span>${s.name}</span>`)}
        ${i?l`<span class="chip"><span class="dot off"></span>${i}</span>`:h}
        ${e.mode!=="none"?l`<button type="button" class="gear" aria-label=${t("settings")} @click=${this._openSettings}>${v("cog")}</button>`:h}
      </div>
    </div>`}_renderLive(t){let e=vt(this.hass,this._ent("aufnahme")),i=this._callInfo(t).ringing;return l`<section class="live ${i?"ringing":""}" aria-label=${t("live")}>
      <div class="cam">${this._cameraEl||l`<div class="ph">${v("image")}</div>`}</div>
      <div class="ov"><span class="dot"></span>${t("live")}</div>
      ${e?l`<div class="ov rec"><span class="dot"></span>${t("recording_now")}</div>`:h}
      <button type="button" class="zoombtn" @click=${()=>this._openFullscreen(!1)}>${v("expand")}${t("enlarge")}</button>
    </section>`}_renderSide(t){if(this._alarmCfg())return this._renderAlarm(t);let e=this._info||{},i=[],s=(c,o)=>{let p=x(this.hass,`binary_sensor.${c}_registered`);c&&p&&i.push({name:t(o,{ext:c}),value:p.state==="on"?t("st_registered"):t("st_not_registered"),cls:p.state==="on"?"ok":"danger"})};s(e.ext_door,"st_door"),s(e.ext_tablet,"st_tablet");let n=x(this.hass,e.ami_connected_entity);n&&i.push({name:t("st_asterisk"),value:n.state==="on"?t("st_connected"):t("st_disconnected"),cls:n.state==="on"?"ok":"danger"});let a=this._lastRingText(t);return l`<section class="card side status" aria-label=${t("g_status")}>
      <div class="sh">${t("g_status")}</div>
      <div class="srows">
        ${i.map(c=>l`<div class="srow"><span class="dot ${c.cls==="ok"?"":"bad"}"></span><div><div class="t">${c.name}</div><div class="s">${c.value}</div></div></div>`)}
        ${a?l`<div class="srow"><span class="dot off"></span><div><div class="t">${a}</div></div></div>`:h}
      </div>
    </section>`}_alarmModes(){let t=this._alarmCfg()||{};return Array.isArray(t.modes)&&t.modes.length?t.modes:["armed_away","armed_home","disarmed"]}_renderAlarm(t){let e=this._alarmCfg(),i=x(this.hass,e.entity),s=i?i.state:"unavailable",n=k(this.hass,this._config),a=b=>t(`al_${b}`)!==`al_${b}`?t(`al_${b}`):b,c=a(s),o="";s==="disarmed"?o="ok":s.startsWith("armed")?o="armed":s==="arming"||s==="pending"?o="busy":s==="triggered"&&(o="trig");let p=i&&i.last_changed?t("al_since",{t:ft(i.last_changed,n)}):"",u=this._pad,d=this._alarmModes(),g=b=>b==="disarmed"?"shieldOff":b==="armed_home"?"shieldHome":b==="armed_night"?"shieldMoon":b==="armed_vacation"?"shieldAirplane":b==="armed_custom_bypass"?"shieldStar":"shieldLock",_=s==="triggered"?"shieldAlert":s==="arming"||s==="pending"?"shieldSync":s.startsWith("armed")?g(s):"shieldOff",m=b=>t(`al_sub_${b}`)!==`al_sub_${b}`?t(`al_sub_${b}`):"",y;if(u){let b="\u2022".repeat(u.code.length);y=l`<div class="pad">
        <div class="ptitle">${t("al_code_for",{m:a(u.mode)})}</div>
        <div class="code">${b||l`<span class="ph">····</span>`}</div>
        ${u.error?l`<div class="err">${u.error}</div>`:h}
        <div class="keys2">
          ${["1","2","3","4","5","6","7","8","9"].map(w=>l`<button type="button" ?disabled=${u.busy} @click=${()=>this._padKey(w)}>${w}</button>`)}
          <button type="button" ?disabled=${u.busy} @click=${()=>this._padKey("back")}>${v("backspace")}</button>
          <button type="button" ?disabled=${u.busy} @click=${()=>this._padKey("0")}>0</button>
          <button type="button" class="ok" ?disabled=${u.busy||!u.code} @click=${()=>this._padSubmit()}>${v("check")}</button>
        </div>
        <button type="button" class="cancel" @click=${()=>this._pad=null}>${t("al_cancel")}</button>
      </div>`}else y=l`<div class="modes">
        ${d.map(b=>{let w=s===b||s==="arming"&&this._pendingMode===b;return l`<button type="button" class="mode ${w?"on":""} ${b==="disarmed"?"":"armed"}" ?disabled=${!i||s==="unavailable"} @click=${()=>this._alarmMode(b)}>
            <span class="mi">${v(g(b))}</span><span>${a(b)}${m(b)?l`<small>${m(b)}</small>`:h}</span>
          </button>`})}
      </div>`;return l`<section class="card side alarm ${o}" aria-label=${e.name||t("alarm")}>
      <div class="h"><span class="ic">${v(_)}</span><span>${e.name||t("alarm")}<span class="s">${this._alarmError||`${c}${p?` \xB7 ${p}`:""}`}</span></span></div>
      ${y}
    </section>`}_alarmMode(t){let e=this._alarmCfg();if(e.code){this._alarmCall(t,String(e.code));return}this._pad={mode:t,code:"",error:null,busy:!1}}_padKey(t){if(!this._pad)return;let e=t==="back"?this._pad.code.slice(0,-1):(this._pad.code+t).slice(0,12);this._pad={...this._pad,code:e,error:null}}async _padSubmit(){if(!this._pad||!this._pad.code)return;let{mode:t,code:e}=this._pad;if(this._pad={...this._pad,busy:!0,error:null},this._alarmFailReason=null,await this._alarmCall(t,e)){this._pad=null;return}this._pad&&(this._pad={...this._pad,busy:!1,code:"",error:this._alarmFailReason||this.t("al_code_wrong")})}async _alarmCall(t,e){let i=this._alarmCfg(),n={disarmed:"alarm_disarm",armed_away:"alarm_arm_away",armed_home:"alarm_arm_home",armed_night:"alarm_arm_night",armed_vacation:"alarm_arm_vacation",armed_custom_bypass:"alarm_arm_custom_bypass"}[t];if(!n)return!1;this._pendingMode=t,this._alarmError=null;try{await this.hass.callService("alarm_control_panel",n,{entity_id:i.entity,...e?{code:e}:{}})}catch(o){let p=o&&o.message||"";return this._alarmFailReason=/code/i.test(p)?this.t("al_code_wrong"):p||null,!1}let a=t==="disarmed"?["disarmed"]:[t,"arming","pending"],c=Date.now();for(;Date.now()-c<3e3;){if(await new Promise(p=>window.setTimeout(p,200)),this._alarmFailReason)return!1;let o=x(this.hass,i.entity);if(o&&a.includes(o.state))return!0}return!1}_onAlarmEvent(t){let e=t&&t.data||{},i=this._alarmCfg();if(!i||e.entity_id&&e.entity_id!==i.entity)return;let s=this.t,n=e.reason||"",a;n==="invalid_code"?a=s("al_code_wrong"):n==="open_sensors"?a=s("al_open_sensors",{s:(e.sensors||[]).map(c=>c&&c.name||c).join(", ")}):n==="not_allowed"?a=s("al_not_allowed"):a=s("al_failed",{r:n||t.event_type}),this._alarmFailReason=a,this._pad?this._pad={...this._pad,busy:!1,code:"",error:a}:(this._alarmError=a,window.clearTimeout(this._alarmErrorTimer),this._alarmErrorTimer=window.setTimeout(()=>{this._alarmError=null},8e3))}_ensureAlarmEvents(){if(this._alarmSub||!this.hass||!this.hass.connection||!this._alarmCfg())return;let t=this.hass.connection;this._alarmSub=Promise.all(["alarmo_failed_to_arm","alarmo_failed_to_disarm"].map(e=>t.subscribeEvents(i=>this._onAlarmEvent(i),e).catch(()=>null)))}_renderCall(t){let e=this._callInfo(t),i=this._allContacts(t),s=i.length>0,n=this._config.show.info===!1?h:this._renderInfos(t),a=this._tab==="kontakte"&&s?"kontakte":this._tab==="waehlen"&&this._sip.available?"waehlen":"anruf",c=a==="kontakte"?this._renderContacts(t):a==="waehlen"?this._renderDial(t):this._renderCallPane(t,e),o=e.ringing||this._sip.state!==f.IDLE&&this._sip.available,p=this._config.settings,u=!this._config.show.header&&this._config.show.status;return l`<section class="card call" aria-label=${t("intercom")}>
      <div class="card-head">
        <div class="hl">
          <h2>${t("intercom")}</h2>
          ${u?this._statusChips(t).map(d=>l`<span class="chip mini"><span class="dot ${d.cls}"></span>${d.name}</span>`):h}
        </div>
        <div class="r">
          ${o?l`<span class="badge ${e.badge.cls}">${e.ringing?l`<span class="dot"></span>`:h}${e.badge.text}</span>`:h}
          ${!this._config.show.header&&p.mode!=="none"?l`<button type="button" class="gear wide" @click=${this._openSettings}>${v("cog")}<span>${t("settings")}</span></button>`:h}
        </div>
      </div>
      <div class="split ${n===h?"nosplit":""}">
        <div class="cpane">
          <div class="tabs" role="tablist">
            <button type="button" role="tab" aria-selected=${a==="anruf"?"true":"false"} @click=${()=>this._tab="anruf"}>${t("tab_call")}</button>
            ${s?l`<button type="button" role="tab" aria-selected=${a==="kontakte"?"true":"false"} @click=${()=>this._tab="kontakte"}>
                  ${t("tab_contacts")}${i.length?l`<span class="cnt">${i.length}</span>`:h}
                </button>`:h}
            ${this._sip.available?l`<button type="button" role="tab" aria-selected=${a==="waehlen"?"true":"false"} @click=${()=>this._tab="waehlen"}>${t("tab_dial")}</button>`:h}
          </div>
          ${c}
        </div>
        ${n===h?h:l`<div class="vsep"></div>${n}`}
      </div>
    </section>`}_renderCallPane(t,e){let i=this._sip,s=i.state,n=this._info||{},a=h;s===f.INCOMING?a=l`<div class="actions">
        <button type="button" class="btn ok" @click=${()=>i.answer()}>${v("phone")}${t("answer")}</button>
        <button type="button" class="btn danger" @click=${()=>i.hangup()}>${v("hangup")}${t("reject")}</button>
      </div>`:s===f.OUTGOING||s===f.CONNECTING?a=l`<div class="actions one"><button type="button" class="btn danger" @click=${()=>i.hangup()}>${v("hangup")}${t("hangup")}</button></div>`:s===f.CONNECTED?a=l`<div class="actions">
        <button type="button" class="btn danger" @click=${()=>i.hangup()}>${v("hangup")}${t("hangup")}</button>
        <button type="button" class="btn ${i.muted?"accent":""}" @click=${()=>i.toggleMute()}>${v(i.muted?"micOff":"mic")}${i.muted?t("unmute"):t("mute")}</button>
      </div>`:i.available&&n.ext_door&&!e.ringing&&(a=l`<div class="actions one"><button type="button" class="btn ok" @click=${this._callDoor}>${v("phone")}${t("call_door")}</button></div>`);let c=h;if(e.title){let o=e.ringing?"ring live":s===f.CONNECTED?"ring ok":"ring";c=l`<div class="callstate">
        <div class=${o}>${v("phone")}</div>
        <div><div class="big">${e.title}</div><div class="meta">${e.meta||""}</div></div>
      </div>`}else i.available||(c=l`<div class="statusline"><span class="dot off"></span>${t("sip_missing")} · ${t("sip_hint")}</div>`);return l`<div class="pane single">
      <div class="anruf">
        <div class="callzone">${c}${a}</div>
        ${this._renderActs(t)}
      </div>
    </div>`}_actionList(){let t=this._config;if(Array.isArray(t.actions))return t.actions.map(i=>typeof i=="string"?{type:i}:i);let e=[];return this._doorCfg()&&e.push({type:"door"}),e.push({type:"mailbox"},{type:"announcement"}),e}_renderActs(t){let e=this._actionList(),i=e.some(n=>n.type==="door")?this._renderDoorTile(t):h,s=e.filter(n=>n.type!=="door").map(n=>this._renderAct(n,t)).filter(n=>n!==h);return i===h&&!s.length?h:l`<div class="acts ${i===h?"nodoor":""} ${s.length?"":"notoggles"}">
      ${i}
      ${s.length?l`<div class="stack">${s}</div>`:h}
    </div>`}_renderDoorTile(t){let e=this._doorInfo(t);if(!e)return h;let i=this._confirm==="door",s=wt(e.id)==="lock",n=s?l`<button type="button" class="lk" ?disabled=${e.busy} @click=${this._doorLockToggle}>${v(e.locked?"lockOpen":"lock")}${e.locked?t("unlock"):t("lock")}</button>`:h;return l`<div class="door">
      <div class="dh"><span class="ic ${e.locked?"":"ok"}">${v(e.locked?"lock":"lockOpen")}</span><div><div class="t">${e.name}</div><div class="s">${e.text}</div></div></div>
      <div class="btns ${s?"":"one"}">
        ${i?l`<button type="button" class="open danger" @click=${this._doorClick}>${v("check")}${t("yes")}</button><button type="button" class="lk" @click=${()=>this._confirm=null}>${v("close")}${t("no")}</button>`:l`<button type="button" class="open" ?disabled=${e.busy} @click=${this._doorClick}>${v("doorOpen")}${e.busy?t("door_busy"):t("open")}</button>${n}`}
      </div>
    </div>`}async _doorLockToggle(){let t=this._doorCfg();if(!t||!t.entity||wt(t.entity)!=="lock")return;let e=x(this.hass,t.entity),i=e&&e.state==="locked";this._doorBusy=!0,window.clearTimeout(this._doorTimer),this._doorTimer=window.setTimeout(()=>{this._doorBusy=!1},4e3);try{await this.hass.callService("lock",i?"unlock":"lock",{entity_id:t.entity})}catch{this._doorBusy=!1}}_renderAct(t,e){let i=t.type||(t.entity?"entity":"");if(i==="volume"){let d=this._config.volume,g=d&&d.entity?x(this.hass,d.entity):null;if(!g)return h;let _=g.attributes||{},m=Number(_.min??0),y=Number(_.max??100),b=Number(_.step??1),w=this._volDrag!==null?this._volDrag:Number(g.state),V=Number.isFinite(w)?w:m,kt=y>m?(V-m)/(y-m)*100:0,U=d.mute_entity?x(this.hass,d.mute_entity):null,Pt=U?U.state==="on":!1;return l`<div class="act">
        <div class="slider" style="--pct:${kt}%">
          <div class="fill"></div>
          <div class="val">${Math.round(V)}<small>${d.unit||_.unit_of_measurement||"%"}</small></div>
          <input type="range" aria-label=${e("volume")} min=${m} max=${y} step=${b} .value=${String(V)}
            @input=${Ct=>this._volDrag=Number(Ct.target.value)}
            @change=${Ct=>{this._volDrag=null,this._setNumber(d.entity,Number(Ct.target.value))}} />
        </div>
        ${U?l`<button type="button" class="icb ${Pt?"on":""}" aria-label=${e("muted")} @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:d.mute_entity})}>${v(Pt?"volumeOff":"volume")}</button>`:h}
      </div>`}let s=t.entity,n=t.name,a=null;if(i==="mailbox")s=this._ent("mailbox"),n=n||e("mailbox");else if(i==="announcement"){s=this._ent("sprachansage"),n=n||e("s_sprachansage");let d=this._ansageAktiv();d&&d!=="Keine"&&d!=="None"&&(a=d)}let c=x(this.hass,s);if(!c)return h;let o=c.state==="on",p=n||c.attributes&&c.attributes.friendly_name||s,u=e(o?"on":"off");return l`<button type="button" class="act toggle ${o?"on":""}" @click=${()=>this.hass.callService("homeassistant","toggle",{entity_id:s})}>
      <div><div class="t">${p}</div><div class="s">${u}${a?` \xB7 ${a}`:""}</div></div>
      <span class="sw" role="switch" aria-checked=${o?"true":"false"}></span>
    </button>`}_renderInfos(t){let e=this._st("nachrichten"),i=Number(e&&e.attributes&&e.attributes.neue||0),s=k(this.hass,this._config),n=this._st("letztes_klingeln"),a=n&&n.state&&n.state!=="unknown"&&n.state!=="unavailable",c=this._ansageAktiv(),o=vt(this.hass,this._ent("sprachansage")),p=this._st("freizeichen"),u=this._st("klingeldauer"),d=[];e&&d.push({k:t("info_new"),v:String(i),cls:i>0?"new":"",click:()=>this._mtab="nachrichten"}),n&&d.push({k:t("last_ring"),v:a?P(n.state,s,t):t("never")}),this._ent("sprachansage")&&d.push({k:t("s_sprachansage"),v:o?c&&c!=="Keine"&&c!=="None"?c:t("on"):t("off"),cls:o?"on":""}),p&&d.push({k:t("info_ringback"),v:p.state}),u&&Number.isFinite(Number(u.state))&&d.push({k:t("s_klingeldauer"),v:`${Math.round(Number(u.state))} s`});for(let g of this._config.info||[]){let _=typeof g=="string"?{entity:g}:g,m=x(this.hass,_.entity);if(!m)continue;let y=m.attributes&&m.attributes.unit_of_measurement||"";d.push({k:_.name||m.attributes&&m.attributes.friendly_name||_.entity,v:`${m.state}${y?` ${y}`:""}`})}return d.length?l`<div class="infos">
      <div class="lbl">${t("info_title")}</div>
      <div class="kvs">
        ${d.map(g=>l`<div class="kv ${g.click?"clickable":""}" @click=${g.click||null}><span class="k">${g.k}</span><span class="v ${g.cls||""}">${g.v}</span></div>`)}
      </div>
    </div>`:h}_doorCfg(){let t=this._config||{};if(t.door&&t.door.entity)return t.door;let e=this._info&&this._info.lock_entity;return e?{entity:e,confirm:!0}:null}_alarmCfg(){let t=this._config||{};if(t.alarm&&t.alarm.entity)return t.alarm;let e=this._info&&this._info.alarm_entity;return e?{entity:e}:null}_allContacts(t){let e=this._info||{},i=new Map((this._config&&this._config.contacts||[]).map(o=>[String(o.extension||""),o])),s=new Set,n=[],a=(o,p)=>{if(!o||s.has(o))return;s.add(o);let u=i.get(o)||{};if(u.hide)return;let d=this._isDoor(o),g=!!e.ext_tablet&&String(e.ext_tablet)===o;n.push({extension:o,name:u.name||p.name||(d?t("door_station"):g?t("tablet"):o),icon:u.icon||(d?"doorbell":g?"tablet":null),state_entity:u.state_entity||p.state_entity||`sensor.${o}_state`,registered_entity:u.registered_entity||p.registered_entity||`binary_sensor.${o}_registered`})};for(let o of Array.isArray(e.extensions)?e.extensions:[])a(String(o&&o.extension||""),o||{});if(this.hass&&this.hass.states){this._extScanFor!==this.hass.states&&(this._extScanFor=this.hass.states,this._extScan=Object.keys(this.hass.states).filter(o=>/^sensor\.\d+_state$/.test(o)).map(o=>o.slice(7,-6)));for(let o of this._extScan)a(o,{})}for(let[o,p]of i)a(o,p);let c=this._sip.ownExtension?String(this._sip.ownExtension):null;return n.filter(o=>o.extension!==c)}_renderContacts(t){let e=this._allContacts(t),i=this._info||{};return e.length?l`<div class="pane single">
      <div class="rows">
        ${e.map(s=>{let n=s.extension,a=x(this.hass,s.registered_entity),c=x(this.hass,s.state_entity),o=t("unknown"),p="off";a&&(o=a.state==="on"?t("reachable"):t("unreachable"),p=a.state==="on"?"":"off"),c&&c.state===(i.in_use_state||"In use")&&(o=t("in_call"));let u=String(s.name||n).trim().charAt(0).toUpperCase(),d=s.icon&&I[s.icon]?v(s.icon):u,g=!this._sip.available||this._sip.state!==f.IDLE;return l`<div class="contact">
            <div class="avatar">${d}</div>
            <div><div class="t">${s.name}</div><div class="s"><span class="dot ${p}"></span>${n} · ${o}</div></div>
            <button type="button" class="callbtn" aria-label=${s.name} ?disabled=${g} @click=${()=>this._startCall(n)}>${v("phone")}</button>
          </div>`})}
      </div>
    </div>`:l`<div class="pane single"><div class="empty">${t("contacts_none")}</div></div>`}_renderDial(t){let e=this._sip,i=e.state===f.CONNECTED,s=this._dial?(this._allContacts(t).find(a=>String(a.extension)===this._dial)||{}).name||(this._isDoor(this._dial)?t("door_station"):""):"",n=a=>{i&&e.sendDtmf(a),this._dial=(this._dial+a).slice(0,24)};return l`<div class="pane single">
      <div class="dial"><div class="dialin">
        <div class="go">
          <div class="num"><span>${this._dial.split("").join(" ")||" "}</span><small>${s}</small></div>
          <button type="button" class="back" aria-label=${t("delete")} @click=${()=>this._dial=this._dial.slice(0,-1)} @dblclick=${()=>this._dial=""}>${v("backspace")}</button>
          ${e.state===f.IDLE?l`<button type="button" class="callgo ok" aria-label=${t("call")} ?disabled=${!this._dial} @click=${()=>this._startCall(this._dial)}>${v("phone")}</button>`:l`<button type="button" class="callgo danger" aria-label=${t("hangup")} @click=${()=>e.hangup()}>${v("hangup")}</button>`}
        </div>
        <div class="keys">${Ue.map(([a,c])=>l`<button type="button" @click=${()=>n(a)}>${a}${c?l`<small>${c}</small>`:h}</button>`)}</div>
      </div></div>
    </div>`}_renderMailbox(t){let e=this._st("nachrichten"),i=this._entries(),s=Number(e&&e.attributes&&e.attributes.neue||0),n=!!(e&&e.attributes&&e.attributes.aufnahme_laeuft),a=k(this.hass,this._config),c=this._config.show.announcements,o=c&&this._mtab==="ansagen"?"ansagen":"nachrichten",p=this._ansagen(),u=this._ansageAktiv(),d=!u||u==="Keine"||u==="None";return l`<section class="card mailbox" aria-label=${t("mailbox")}>
      <div class="card-head">
        <h2>${t("mailbox")}</h2>
        <div class="r">
          ${o==="nachrichten"&&s>0?l`<span class="badge">${t("new_n",{n:s})}</span>`:h}
          ${o==="nachrichten"&&s>0?l`<button type="button" class="pill small" @click=${()=>this._svc("alle_gesehen")}>${t("all_seen")}</button>`:h}
          ${o==="ansagen"?l`<span class="badge ${d?"muted":"ok"}">${t("active")}: ${d?t("none"):u}</span>`:h}
        </div>
      </div>
      ${c?l`<div class="tabs" role="tablist">
            <button type="button" role="tab" aria-selected=${o==="nachrichten"?"true":"false"} @click=${()=>this._mtab="nachrichten"}>
              ${t("messages")}${s>0?l`<span class="cnt">${s}</span>`:h}
            </button>
            <button type="button" role="tab" aria-selected=${o==="ansagen"?"true":"false"} @click=${()=>this._mtab="ansagen"}>
              ${t("announcements")}${p.length?l`<span class="cnt">${p.length}</span>`:h}
            </button>
          </div>`:h}
      ${o==="ansagen"?this._renderAnsagenPane(t,a,p,d):l`<div class="list">
            ${n?l`<div class="recbanner"><span class="recdot"></span><div><div class="t">${t("recording_now")}</div><div class="s">${t("recording_hint")}</div></div></div>`:h}
            ${i.length?Dt(i,g=>g.kennung,g=>this._renderEntry(g,t,a)):l`<div class="empty">${t("no_messages")}</div>`}
          </div>`}
    </section>`}_renderAnsagenPane(t,e,i,s){let n=this._rec,a;return n.phase==="recording"?a=l`<div class="recording">
        <div class="recdot"></div>
        <div class="recmeta"><div class="t">${t("recording")}</div><div class="s">${tt(n.seconds||0)} · ${t("speak_now")}</div></div>
        <div class="bars" aria-hidden="true">${(n.levels&&n.levels.length?n.levels:new Array(12).fill(.1)).map(c=>l`<i style="height:${Math.max(10,Math.round(c*100))}%"></i>`)}</div>
        <button type="button" class="btn danger" @click=${()=>this._recStop(t)}>${v("stop")}${t("stop")}</button>
      </div>`:n.phase==="preview"||n.phase==="uploading"?a=l`<div class="preview">
        <div class="hint">${t("new_recording",{s:Math.round(n.seconds||0)})}</div>
        <audio controls preload="metadata" .src=${n.url}></audio>
        <div class="go">
          <input class="txt" type="text" aria-label=${t("name")} .value=${n.name||""} ?disabled=${n.phase==="uploading"} @input=${c=>this._rec={...this._rec,name:c.target.value}} />
          <button type="button" class="btn accent" ?disabled=${n.phase==="uploading"} @click=${()=>this._recSave(t)}>${v("check")}${n.phase==="uploading"?t("uploading"):t("save")}</button>
          <button type="button" class="btn" ?disabled=${n.phase==="uploading"} @click=${this._recDiscard}>${t("discard")}</button>
        </div>
        ${n.error?l`<div class="note" style="padding:0">${n.error}</div>`:h}
      </div>`:a=l`<div class="rec">
        <button type="button" class="btn" @click=${()=>this._recStart(t)}>${v("mic")}${t("record_new")}</button>
        <span class="hint">${t("device_mic")}</span>
        ${n.error?l`<div class="note" style="padding:0;grid-column:1/-1">${n.error}</div>`:h}
      </div>`,l`<div class="mpane">
      <div class="rows">
        ${Dt(i,c=>c.datei,c=>this._renderAnsage(c,t,e))}
        <div class="ann">
          <button type="button" class="radio ${s?"on":""}" role="radio" aria-checked=${s?"true":"false"} aria-label=${t("no_announcement")} @click=${()=>this._activate("Keine")}></button>
          <div><div class="t"><span>${t("no_announcement")}</span></div><div class="s">${t("no_announcement_hint")}</div></div>
          <div></div>
        </div>
        ${i.length?h:l`<div class="empty">${t("no_announcements")}</div>`}
      </div>
      <div class="recfoot">${a}</div>
    </div>`}_renderEntry(t,e,i){let s=this._open===t.kennung,n=this._kind(t,e),a=t.bild_url?Ot(t.bild_url):null,c=this._confirm===`msg:${t.kennung}`;return l`<div class="msg ${s?"open":""}" tabindex="0" @click=${()=>this._openMessage(t)} @keydown=${o=>o.key==="Enter"&&this._openMessage(t)}>
        <div class="thumb">${a?l`<img src=${a} alt="" loading="lazy" />`:v("image")}<span class="len">${tt(t.dauer)}</span></div>
        <div>
          <div class="when">${t.gesehen?h:l`<span class="new"></span>`}${P(t.zeit,i,e)}</div>
          <div class="kind ${n.note?"note":""}">${n.text}</div>
        </div>
        <div class="ctl" @click=${o=>o.stopPropagation()}>
          ${c?l`<span class="confirm">${e("really_delete")}
                <button type="button" class="pill small danger" @click=${()=>this._deleteMessage(t)}>${e("yes")}</button>
                <button type="button" class="pill small" @click=${()=>this._confirm=null}>${e("no")}</button></span>`:l`<button type="button" class="icb ${s?"on":""}" aria-label=${e("play")} @click=${()=>this._openMessage(t)}>${v("play")}</button>
                <button type="button" class="icb" aria-label=${e("delete")} @click=${()=>this._deleteMessage(t)}>${v("trash")}</button>`}
        </div>
      </div>
      ${s?l`<div class="player">
            <div class="video">
              ${t.clip?this._clipUrl?l`<video controls playsinline preload="metadata" autoplay .src=${this._clipUrl} poster=${a||""}></video>`:l`<span>${e("loading")}</span>`:l`<span>${e("no_clip")}</span>`}
            </div>
            <div class="foot">
              <span>${e("clip_info",{d:tt(t.dauer)})}</span>
              <button type="button" class="del" @click=${()=>this._deleteMessage(t)}>${v("trash")}${e(c?"really_delete":"delete")}</button>
            </div>
          </div>`:h}`}_renderAnsage(t,e,i){let s=this._renaming&&this._renaming.datei===t.datei,n=this._confirm===`ann:${t.datei}`,a=this._playing===t.datei;return l`<div class="ann">
      <button type="button" class="radio ${t.aktiv?"on":""}" role="radio" aria-checked=${t.aktiv?"true":"false"} aria-label=${t.name} @click=${()=>this._activate(t.name)}></button>
      <div>
        ${s?l`<input
              class="txt"
              type="text"
              aria-label=${e("name")}
              .value=${this._renaming.value}
              @input=${c=>this._renaming={...this._renaming,value:c.target.value}}
              @keydown=${c=>{c.key==="Enter"&&this._renameSave(),c.key==="Escape"&&(this._renaming=null)}}
              @blur=${()=>this._renameSave()}
            />`:l`<div class="t"><span>${t.name}</span>
              <button type="button" class="edit" aria-label=${e("rename")} @click=${()=>this._renaming={datei:t.datei,name:t.name,value:t.name}}>${v("pencil")}</button></div>`}
        <div class="s">${e("recorded_on",{d:Rt(t.erstellt,i),s:Math.round(t.dauer||0)})}</div>
      </div>
      <div class="ctl">
        ${n?l`<span class="confirm">${e("really_delete")}
              <button type="button" class="pill small danger" @click=${()=>this._deleteAnsage(t)}>${e("yes")}</button>
              <button type="button" class="pill small" @click=${()=>this._confirm=null}>${e("no")}</button></span>`:l`<button type="button" class="icb ${a?"on":""}" aria-label=${e(a?"stop_listen":"listen")} @click=${()=>this._playAnsage(t)}>${v(a?"stop":"play")}</button>
              <button type="button" class="icb" aria-label=${e("delete")} @click=${()=>this._deleteAnsage(t)}>${v("trash")}</button>`}
      </div>
    </div>`}};C(nt,"properties",{hass:{attribute:!1},_config:{state:!0},_info:{state:!0},_infoError:{state:!0},_tab:{state:!0},_dial:{state:!0},_open:{state:!0},_clipUrl:{state:!0},_mtab:{state:!0},_confirm:{state:!0},_rec:{state:!0},_playing:{state:!0},_renaming:{state:!0},_volDrag:{state:!0},_doorBusy:{state:!0},_now:{state:!0},_sipTick:{state:!0},_sipError:{state:!0},_pad:{state:!0},_alarmError:{state:!0}}),C(nt,"styles",[F,G,A`
      :host {
        display: block;
      }
      .app {
        --gap: 14px;
        --ratio: var(--intercom-live-ratio, 1.7778);
        --side-w: var(--intercom-side-width, 220px);
        --live-h: var(--intercom-live-height, 300px);
        --live-w: min(calc(var(--live-h) * var(--ratio)), 52cqw);
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 10px;
        min-height: 0;
        padding: var(--intercom-padding, 0);
        container-type: inline-size;
      }
      .app.nohead {
        grid-template-rows: minmax(0, 1fr);
        gap: 0;
      }
      .app.fill {
        height: calc(100vh - var(--intercom-top, var(--header-height, 56px)) - var(--intercom-offset, 0px));
        height: calc(100dvh - var(--intercom-top, var(--header-height, 56px)) - var(--intercom-offset, 0px));
        container-type: size;
        --live-h: calc((100cqh - var(--head-h, 46px)) * var(--intercom-live-pct, 0.5));
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 36px;
      }
      .head h1 {
        font-size: 22px;
        font-weight: 400;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
      }
      .chip.mini {
        padding: 3px 9px;
        font-size: 11.5px;
        box-shadow: none;
        background: var(--ic-card-2);
        border: 0;
      }
      .gear.wide {
        width: auto;
        height: 32px;
        padding: 0 12px 0 10px;
        gap: 7px;
        border: 0;
        border-radius: 999px;
        background: var(--ic-card-2);
        color: var(--ic-text);
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }
      .gear.wide svg {
        width: 19px;
        height: 19px;
        color: var(--ic-text-2);
      }
      .card-head .hl {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex-wrap: wrap;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 5px 11px;
        border-radius: 999px;
        background: var(--ic-card);
        box-shadow: var(--ic-shadow);
        border: var(--ic-border);
        font-size: 12px;
        white-space: nowrap;
      }
      .gear {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        border-radius: 999px;
        border: 1px solid var(--ic-line);
        background: var(--ic-card);
        color: var(--ic-text-2);
      }
      .main {
        min-height: 0;
        display: grid;
        grid-template-columns: calc(var(--live-w) + var(--gap) + var(--side-w)) minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
        gap: var(--gap);
      }
      .main.nomail {
        grid-template-columns: calc(var(--live-w) + var(--gap) + var(--side-w));
      }
      .left {
        min-height: 0;
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: var(--gap);
      }
      .left.nocall {
        grid-template-rows: auto;
      }
      .top {
        min-height: 0;
        display: grid;
        grid-template-columns: var(--live-w) minmax(0, 1fr);
        gap: var(--gap);
      }

      /* Livebild */
      .live {
        position: relative;
        width: var(--live-w);
        aspect-ratio: var(--ratio);
        border-radius: var(--ic-radius);
        overflow: hidden;
        background: var(--ic-live-ground);
        box-shadow: var(--ic-shadow);
        border: var(--ic-border);
      }
      .live .cam {
        position: absolute;
        inset: 0;
        --ha-card-border-radius: 0;
        --ha-card-box-shadow: none;
        --ha-card-border-width: 0;
      }
      .live .cam > * {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      .live .ph {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #6b7480;
      }
      .live.ringing::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: var(--ic-radius);
        box-shadow: inset 0 0 0 3px var(--ic-accent);
        animation: frame-pulse 1.4s ease-in-out infinite;
        pointer-events: none;
      }
      @keyframes frame-pulse {
        0%,
        100% {
          opacity: 0.35;
        }
        50% {
          opacity: 1;
        }
      }
      .ov {
        position: absolute;
        top: 10px;
        left: 10px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 10px;
        border-radius: 999px;
        background: rgba(10, 12, 14, 0.55);
        color: #f3f5f7;
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.06em;
        backdrop-filter: blur(6px);
        pointer-events: none;
      }
      .ov .dot {
        background: #ff5a4f;
        box-shadow: 0 0 0 3px rgba(255, 90, 79, 0.25);
      }
      .ov.rec {
        top: auto;
        bottom: 10px;
        left: 10px;
      }
      .zoombtn {
        position: absolute;
        right: 10px;
        bottom: 10px;
        height: 34px;
        padding: 0 12px 0 10px;
        border: 0;
        border-radius: 9px;
        background: rgba(10, 12, 14, 0.55);
        color: #f3f5f7;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-weight: 500;
        font-size: 13px;
        backdrop-filter: blur(6px);
      }
      .zoombtn svg {
        width: 18px;
        height: 18px;
      }

      /* Karte neben dem Bild: Alarmanlage oder Status */
      .side {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        gap: 10px;
        padding: 12px 14px 14px;
        min-height: 0;
        overflow: hidden;
      }
      .side .h {
        display: flex;
        align-items: center;
        gap: 10px;
        font-weight: 500;
        line-height: 1.2;
      }
      .side .h .ic {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        flex: none;
      }
      .side .h .s {
        display: block;
        font-weight: 400;
        font-size: 12px;
        color: var(--ic-text-2);
      }
      .alarm.ok .h .ic {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .alarm.armed .h .ic,
      .alarm.trig .h .ic {
        background: var(--ic-danger-soft);
        color: var(--ic-danger);
      }
      .alarm.busy .h .ic {
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .modes {
        display: grid;
        grid-auto-rows: minmax(0, 1fr);
        gap: 10px;
        min-height: 0;
      }
      .mode {
        border: 0;
        border-radius: 12px;
        background: var(--ic-card-2);
        display: grid;
        grid-template-columns: 38px minmax(0, 1fr);
        gap: 10px;
        align-items: center;
        padding: 0 10px;
        text-align: left;
        font-weight: 500;
        color: var(--ic-text);
        min-height: 44px;
        min-width: 0;
      }
      .mode .mi {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        background: var(--ic-card);
        color: var(--ic-text-2);
      }
      .mode .mi svg {
        width: 22px;
        height: 22px;
      }
      .mode small {
        display: block;
        font-weight: 400;
        font-size: 11px;
        color: var(--ic-text-2);
      }
      .mode.on {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .mode.on .mi {
        background: var(--ic-ok);
        color: #fff;
      }
      .mode.armed.on {
        background: var(--ic-danger-soft);
        color: var(--ic-danger);
      }
      .mode.armed.on .mi {
        background: var(--ic-danger);
        color: #fff;
      }
      .pad .err {
        color: var(--ic-danger);
        font-size: 12px;
        text-align: center;
        font-weight: 500;
      }
      .pad {
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr) auto;
        gap: 6px;
        min-height: 0;
      }
      .pad .ptitle {
        font-size: 12px;
        color: var(--ic-text-2);
        text-align: center;
      }
      .pad .code {
        text-align: center;
        font-size: 22px;
        letter-spacing: 0.3em;
        height: 30px;
        line-height: 30px;
        font-variant-numeric: tabular-nums;
      }
      .pad .code .ph {
        color: var(--ic-line);
      }
      .keys2 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: minmax(0, 1fr);
        gap: 6px;
        min-height: 0;
      }
      .keys2 button {
        border: 0;
        border-radius: 10px;
        background: var(--ic-card-2);
        color: var(--ic-text);
        font-size: 17px;
        font-weight: 500;
        min-height: 34px;
        display: grid;
        place-items: center;
      }
      .keys2 button.ok {
        background: var(--ic-ok);
        color: #fff;
      }
      .pad .cancel {
        border: 0;
        background: transparent;
        color: var(--ic-text-2);
        padding: 4px;
        font-size: 13px;
      }
      .status .sh {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--ic-text-2);
        font-weight: 500;
      }
      .srows {
        display: grid;
        align-content: start;
        gap: 10px;
        overflow: auto;
      }
      .srow {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 10px;
        align-items: center;
      }
      .srow .t {
        font-weight: 500;
        font-size: 13px;
      }
      .srow .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }

      /* Sprechanlage */
      .call {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        overflow: hidden;
      }
      .split {
        display: grid;
        grid-template-columns: var(--live-w) var(--gap) minmax(0, 1fr);
        min-height: 0;
      }
      .split.nosplit {
        grid-template-columns: minmax(0, 1fr);
      }
      .cpane {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
      }
      .vsep {
        position: relative;
      }
      .vsep::before {
        content: "";
        position: absolute;
        top: 8px;
        bottom: 12px;
        left: 50%;
        width: 1px;
        background: var(--ic-line);
      }
      .tabs {
        display: flex;
        gap: 4px;
        padding: 0 12px;
        border-bottom: 1px solid var(--ic-line);
      }
      .tabs button {
        border: 0;
        background: transparent;
        padding: 10px 12px;
        color: var(--ic-text-2);
        font-weight: 500;
        position: relative;
      }
      .tabs button[aria-selected="true"] {
        color: var(--ic-accent);
      }
      .tabs button[aria-selected="true"]::after {
        content: "";
        position: absolute;
        left: 8px;
        right: 8px;
        bottom: -1px;
        height: 2px;
        border-radius: 2px;
        background: var(--ic-accent);
      }
      .tabs .cnt {
        margin-left: 6px;
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .pane {
        min-height: 0;
        display: grid;
        grid-template-rows: minmax(0, 1fr);
        overflow: hidden;
      }
      .anruf {
        align-self: start;
        display: grid;
        grid-template-rows: auto auto;
      }
      .callzone {
        height: var(--intercom-callzone, 124px);
        display: grid;
        align-content: center;
      }
      .acts {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 12px;
        padding: 10px 16px 12px;
        border-top: 1px solid var(--ic-line);
      }
      .acts.nodoor,
      .acts.notoggles {
        grid-template-columns: minmax(0, 1fr);
      }
      .door {
        display: grid;
        grid-template-rows: auto auto;
        gap: 6px;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--ic-card-2);
        min-width: 0;
      }
      .door .dh {
        display: grid;
        grid-template-columns: 30px minmax(0, 1fr);
        gap: 8px;
        align-items: center;
      }
      .door .dh .ic {
        width: 30px;
        height: 30px;
        border-radius: 9px;
        display: grid;
        place-items: center;
        background: var(--ic-card);
        color: var(--ic-text-2);
      }
      .door .dh .ic.ok {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .door .dh .ic svg {
        width: 18px;
        height: 18px;
      }
      .door .t {
        font-weight: 500;
        font-size: 13px;
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .door .s {
        color: var(--ic-text-2);
        font-size: 11.5px;
      }
      .door .btns {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }
      .door .btns.one {
        grid-template-columns: 1fr;
      }
      .door .btns button {
        border: 0;
        border-radius: 10px;
        height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-weight: 500;
        font-size: 12.5px;
        background: var(--ic-card);
        color: var(--ic-text);
        white-space: nowrap;
        overflow: hidden;
        min-width: 0;
        padding: 0 8px;
      }
      .door .btns button svg {
        width: 18px;
        height: 18px;
      }
      .door .btns button.open {
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .door .btns button.open.danger {
        background: var(--ic-danger);
        color: #fff;
      }
      .stack {
        display: grid;
        grid-template-rows: 1fr 1fr;
        gap: 8px;
        min-width: 0;
      }
      .stack .act {
        min-height: 44px;
        padding: 4px 12px;
      }
      .act {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 10px;
        align-items: center;
        padding: 8px 10px;
        border-radius: 12px;
        background: var(--ic-card-2);
        min-height: 56px;
        border: 0;
        text-align: left;
        color: var(--ic-text);
        min-width: 0;
      }
      .act.toggle.on {
        background: var(--ic-accent-soft);
      }
      .act .t {
        font-weight: 500;
        font-size: 13px;
        line-height: 1.15;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .act .s {
        color: var(--ic-text-2);
        font-size: 11.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .act .two {
        display: inline-flex;
        gap: 4px;
      }
      .act .slider {
        height: 32px;
      }
      .act .sw {
        width: 40px;
        height: 22px;
      }
      .act .sw::after {
        width: 16px;
        height: 16px;
      }
      .act .sw[aria-checked="true"]::after {
        left: 21px;
      }
      .infos {
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        min-height: 0;
        padding: 0 14px 12px 4px;
      }
      .infos .lbl {
        font-size: 14px;
        color: var(--ic-text-2);
        font-weight: 500;
        padding: 10px 12px;
        border-bottom: 1px solid var(--ic-line);
        margin-bottom: 4px;
      }
      .infos .kvs {
        display: grid;
        align-content: start;
        gap: 2px;
        min-height: 0;
        overflow: auto;
      }
      .kv {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        align-items: center;
        padding: 7px 0;
        border-top: 1px solid var(--ic-line);
      }
      .kv:first-of-type {
        border-top: 0;
      }
      .kv.clickable {
        cursor: pointer;
      }
      .kv .k {
        color: var(--ic-text-2);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .kv .v {
        font-weight: 500;
        font-size: 13px;
        text-align: right;
        white-space: nowrap;
      }
      .kv .v.new {
        color: var(--ic-accent);
      }
      .kv .v.on {
        color: var(--ic-ok);
      }
      .statusline {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px 2px;
        color: var(--ic-text-2);
        font-size: 12.5px;
      }
      .statusline .dot {
        width: 7px;
        height: 7px;
      }
      .callstate {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
        padding: 12px 16px 2px;
      }
      .ring {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        position: relative;
        flex: none;
      }
      .ring.live {
        background: var(--ic-accent-soft);
        color: var(--ic-accent);
      }
      .ring.ok {
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
      }
      .ring.live::after,
      .ring.live::before {
        content: "";
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 2px solid var(--ic-accent);
        opacity: 0.5;
        animation: pulse 1.6s ease-out infinite;
        pointer-events: none;
      }
      .ring.live::before {
        animation-delay: 0.8s;
      }
      .ring.live svg {
        animation: ring-shake 1.6s ease-in-out infinite;
      }
      @keyframes ring-shake {
        0%,
        40%,
        100% {
          transform: rotate(0deg);
        }
        10% {
          transform: rotate(-14deg);
        }
        20% {
          transform: rotate(14deg);
        }
        30% {
          transform: rotate(-8deg);
        }
      }
      @keyframes pulse {
        0% {
          transform: scale(0.85);
          opacity: 0.6;
        }
        100% {
          transform: scale(1.25);
          opacity: 0;
        }
      }
      .callstate .big {
        font-size: 18px;
        font-weight: 500;
        line-height: 1.2;
      }
      .callstate .meta {
        color: var(--ic-text-2);
        font-variant-numeric: tabular-nums;
        font-size: 13px;
      }
      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 10px 16px 6px;
      }
      .actions.one {
        grid-template-columns: 1fr;
      }
      .actions .btn {
        padding: 14px 16px;
        font-size: 15px;
      }
      .actions .btn svg {
        width: 20px;
        height: 20px;
      }
      .rows {
        display: grid;
        align-content: start;
        overflow: auto;
        min-height: 0;
      }
      .contact {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 9px 16px;
        border-top: 1px solid var(--ic-line);
      }
      .contact:first-child {
        border-top: 0;
      }
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        font-weight: 500;
      }
      .contact .t {
        font-weight: 500;
      }
      .contact .s {
        color: var(--ic-text-2);
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .contact .s .dot {
        width: 7px;
        height: 7px;
      }
      .callbtn {
        width: 40px;
        height: 40px;
        border: 0;
        border-radius: 12px;
        background: var(--ic-ok-soft);
        color: var(--ic-ok);
        display: grid;
        place-items: center;
      }
      .callbtn svg {
        width: 20px;
        height: 20px;
      }
      .callbtn:disabled {
        opacity: 0.45;
      }

      /* Waehlfeld: passt sich der verfuegbaren Hoehe an, Breite folgt proportional */
      .dial {
        container-type: size;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }
      .dialin {
        --kh: clamp(34px, calc((100cqh - 84px) / 4), 66px);
        --kw: clamp(60px, calc(var(--kh) * 1.85), calc((100cqw - 44px) / 3));
        height: 100%;
        display: grid;
        grid-template-rows: auto auto;
        gap: 8px;
        padding: 8px 16px 10px;
        justify-content: center;
        align-content: center;
      }
      .dial .num {
        min-width: 0;
        height: clamp(36px, calc(var(--kh) * 0.9), 48px);
        border-radius: 12px;
        background: var(--ic-card-2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 14px;
        font-size: clamp(18px, calc(var(--kh) * 0.45), 24px);
        font-variant-numeric: tabular-nums;
        letter-spacing: 0.06em;
        overflow: hidden;
      }
      .dial .num small {
        font-size: 12px;
        letter-spacing: 0;
        color: var(--ic-text-2);
        white-space: nowrap;
      }
      .keys {
        display: grid;
        grid-template-columns: repeat(3, var(--kw));
        grid-auto-rows: var(--kh);
        gap: 6px;
      }
      .keys button {
        border: 0;
        border-radius: 12px;
        background: var(--ic-card-2);
        font-size: clamp(15px, calc(var(--kh) * 0.42), 22px);
        font-weight: 500;
        line-height: 1.1;
        color: var(--ic-text);
      }
      .keys button small {
        display: block;
        font-size: clamp(8px, calc(var(--kh) * 0.2), 10px);
        letter-spacing: 0.12em;
        color: var(--ic-text-2);
        font-weight: 400;
        line-height: 1;
      }
      .dial .go {
        width: calc(3 * var(--kw) + 12px);
        display: grid;
        grid-template-columns: minmax(0, 1fr) clamp(36px, calc(var(--kh) * 0.9), 48px) clamp(42px, var(--kh), 54px);
        gap: 6px;
      }
      .dial .go .back {
        border: 0;
        border-radius: 12px;
        background: var(--ic-card-2);
        color: var(--ic-text-2);
        display: grid;
        place-items: center;
      }
      .dial .callgo {
        border: 0;
        border-radius: 12px;
        display: grid;
        place-items: center;
        color: #fff;
      }
      .dial .callgo.ok {
        background: var(--ic-ok);
      }
      .dial .callgo.danger {
        background: var(--ic-danger);
      }

      /* Mailbox */
      .mailbox {
        display: grid;
        grid-template-rows: auto auto minmax(0, 1fr);
        overflow: hidden;
      }
      .mpane {
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        min-height: 0;
        overflow: hidden;
      }
      .mpane .rows {
        border-top: 1px solid var(--ic-line);
      }
      .auto .mpane .rows {
        max-height: 320px;
      }
      .recfoot {
        border-top: 1px solid var(--ic-line);
        padding: 8px 16px 12px;
      }
      .recfoot .rec,
      .recfoot .recording,
      .recfoot .preview {
        margin-top: 0;
      }
      .list {
        overflow: auto;
        border-top: 1px solid var(--ic-line);
        min-height: 0;
      }
      .auto .list {
        max-height: 380px;
      }
      .auto .dial .keys button {
        height: 46px;
      }
      .msg {
        display: grid;
        grid-template-columns: 80px 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--ic-line);
        cursor: pointer;
      }
      .msg.open {
        background: var(--ic-card-2);
        border-bottom: 0;
      }
      .thumb {
        position: relative;
        width: 80px;
        height: 45px;
        border-radius: 7px;
        overflow: hidden;
        background: var(--ic-card-2);
        display: grid;
        place-items: center;
        color: var(--ic-text-2);
      }
      .thumb img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .thumb .len {
        position: absolute;
        right: 4px;
        bottom: 3px;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-variant-numeric: tabular-nums;
      }
      .msg .when {
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .msg .when .new {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ic-accent);
        flex: none;
      }
      .msg .kind {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .msg .kind.note {
        color: var(--ic-text);
      }
      .player {
        display: grid;
        gap: 8px;
        padding: 2px 16px 12px;
        background: var(--ic-card-2);
        border-bottom: 1px solid var(--ic-line);
      }
      .video {
        position: relative;
        border-radius: 10px;
        overflow: hidden;
        background: #000;
        aspect-ratio: 16 / 9;
        max-height: 300px;
        display: grid;
        place-items: center;
        color: #9aa3ae;
      }
      .video video {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
      .player .foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        color: var(--ic-text-2);
        font-size: 12px;
        flex-wrap: wrap;
      }
      .player .foot .del {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 0;
        background: transparent;
        color: var(--ic-danger);
        font-weight: 500;
        padding: 5px 8px;
        border-radius: 8px;
      }
      .recbanner {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: center;
        padding: 10px 16px;
        border-bottom: 1px solid var(--ic-line);
        background: var(--ic-danger-soft);
      }
      .recbanner .t {
        font-weight: 500;
      }
      .recbanner .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }

      /* Ansagen */
      .ann {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 8px 16px;
        border-bottom: 1px solid var(--ic-line);
      }
      .radio {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid var(--ic-line);
        display: grid;
        place-items: center;
        background: transparent;
        padding: 0;
        flex: none;
      }
      .radio.on {
        border-color: var(--ic-accent);
      }
      .radio.on::after {
        content: "";
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--ic-accent);
      }
      .ann .t {
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
      }
      .ann .t span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .ann .t .edit {
        border: 0;
        background: transparent;
        color: var(--ic-text-2);
        padding: 2px;
        display: grid;
        place-items: center;
      }
      .ann .t .edit svg {
        width: 15px;
        height: 15px;
      }
      .ann .s {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .rec {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        align-items: center;
        margin-top: 6px;
      }
      .rec .btn {
        padding: 10px 12px;
        font-size: 14px;
      }
      .rec .hint {
        color: var(--ic-text-2);
        font-size: 12px;
      }
      .recording {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        gap: 12px;
        align-items: center;
        margin-top: 6px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--ic-danger-soft);
      }
      .recdot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--ic-danger);
        animation: blink 1s steps(2, start) infinite;
      }
      @media (prefers-reduced-motion: reduce) {
        .recdot {
          animation: none;
        }
      }
      @keyframes blink {
        to {
          visibility: hidden;
        }
      }
      .recmeta .t {
        font-weight: 500;
      }
      .recmeta .s {
        color: var(--ic-text-2);
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }
      .bars {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 26px;
      }
      .bars i {
        width: 4px;
        height: 20%;
        border-radius: 2px;
        background: var(--ic-danger);
        display: block;
        transition: height 0.12s;
      }
      .recording .btn {
        padding: 9px 14px;
        font-size: 14px;
      }
      .preview {
        display: grid;
        gap: 8px;
        margin-top: 6px;
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--ic-accent-soft);
      }
      .preview audio {
        width: 100%;
        height: 36px;
      }
      .preview .go {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;
        align-items: center;
      }
      .preview .btn {
        padding: 9px 14px;
        font-size: 14px;
      }

      /* Eine Spalte: Handy und schmale Fenster */
      @media (max-width: 899px) {
        .app.fill {
          height: auto;
          container-type: inline-size;
          --live-h: auto;
        }
        .main,
        .main.nomail {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(0, 1fr);
        }
        .left,
        .left.nocall {
          grid-template-rows: auto auto;
        }
        .top {
          grid-template-columns: minmax(0, 1fr);
        }
        .live {
          width: auto;
          aspect-ratio: var(--ratio);
        }
        .side {
          min-height: 0;
        }
        .modes {
          grid-auto-rows: 44px;
        }
        .split {
          grid-template-columns: minmax(0, 1fr);
        }
        .vsep {
          display: none;
        }
        .infos {
          padding: 6px 16px 12px;
          border-top: 1px solid var(--ic-line);
        }
        .head .chip {
          display: none;
        }
        .rows,
        .list,
        .mpane .rows {
          max-height: 380px;
        }
        .dial {
          height: 320px;
        }
      }
    `]);customElements.define("intercom-card",nt);window.customCards=window.customCards||[];window.customCards.push({type:"intercom-card",name:"Intercom",description:"T\xFCrsprechanlage: Livebild, Anruf, T\xFCr, Mailbox, Ansagen",preview:!1});window.customCards.push({type:"intercom-settings-card",name:"Intercom Einstellungen",description:"Einstellungen der Intercom-Integration",preview:!1});console.info(`%c INTERCOM-CARD %c ${_e} `,"color: #fff; background: #0b8bd6; font-weight: 700;","color: #0b8bd6; background: #e3f3fc;");export{nt as IntercomCard};
